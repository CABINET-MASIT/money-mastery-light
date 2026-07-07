import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import {
  Transaction, TxType, REVENUE_CATEGORIES, EXPENSE_CATEGORIES, Workspace, WorkspaceKind,
} from "./types";
import { SEED_TRANSACTIONS, DEFAULT_WORKSPACE_ID } from "./seed";
import { formatMoney as fmtMoney } from "./format";

const TX_KEY = "finpilot.transactions.v2";
const CAT_KEY = "finpilot.categories.v2";
const WS_KEY = "finpilot.workspaces.v1";
const SETTINGS_KEY = "finpilot.settings.v1";

interface CustomCategories {
  // keyed by workspaceId
  [workspaceId: string]: { revenue: string[]; expense: string[] };
}

interface Settings {
  onboarded: boolean;
  currentWorkspaceId: string;
}

interface FinanceCtx {
  // Workspaces
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  switchWorkspace: (id: string) => void;
  createWorkspace: (data: { name: string; kind: WorkspaceKind; currency: string; color?: string }) => Workspace;
  updateWorkspace: (id: string, data: Partial<Omit<Workspace, "id" | "createdAt">>) => void;
  removeWorkspace: (id: string) => void;

  // Settings / onboarding
  settings: Settings;
  completeOnboarding: (data: { workspaceName: string; currency: string }) => void;

  // Transactions (scoped to current workspace)
  transactions: Transaction[]; // filtered to current workspace
  allTransactions: Transaction[]; // raw
  add: (t: Omit<Transaction, "id" | "workspaceId">) => void;
  update: (id: string, t: Omit<Transaction, "id" | "workspaceId">) => void;
  remove: (id: string) => void;

  // Categories (scoped to current workspace)
  customCategories: { revenue: string[]; expense: string[] };
  allCategories: (type: TxType) => string[];
  addCategory: (type: TxType, name: string) => boolean;
  removeCategory: (type: TxType, name: string) => void;

  // Money
  currency: string;
  formatMoney: (n: number) => string;

  // Transfers between workspaces (creates 2 linked transactions)
  transfer: (data: {
    fromWorkspaceId: string;
    toWorkspaceId: string;
    amount: number;
    date: string;
    description?: string;
  }) => void;

  // Danger zone
  resetAll: () => void;

  // Backup
  exportData: () => ExportPayload;
  importData: (data: unknown, mode: "merge" | "replace") => { workspaces: number; transactions: number };
}

export interface ExportPayload {
  app: "finpilot";
  version: 1;
  exportedAt: string;
  workspaces: Workspace[];
  transactions: Transaction[];
  customCategories: CustomCategories;
  settings: Settings;
}

const Ctx = createContext<FinanceCtx | null>(null);

const uid = (p = "tx") => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const COLORS = ["violet", "blue", "emerald", "amber", "rose", "cyan", "indigo", "fuchsia", "teal", "orange"];

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function defaultWorkspace(): Workspace {
  return {
    id: DEFAULT_WORKSPACE_ID,
    name: "Personnel",
    kind: "personal",
    currency: "GNF",
    color: "violet",
    createdAt: new Date().toISOString(),
  };
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() =>
    loadJSON<Workspace[]>(WS_KEY, [defaultWorkspace()])
  );

  const [settings, setSettings] = useState<Settings>(() =>
    loadJSON<Settings>(SETTINGS_KEY, { onboarded: false, currentWorkspaceId: DEFAULT_WORKSPACE_ID })
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadJSON<Transaction[]>(TX_KEY, SEED_TRANSACTIONS)
  );

  const [customCategories, setCustomCategories] = useState<CustomCategories>(() =>
    loadJSON<CustomCategories>(CAT_KEY, {})
  );

  useEffect(() => { try { localStorage.setItem(WS_KEY, JSON.stringify(workspaces)); } catch {} }, [workspaces]);
  useEffect(() => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {} }, [settings]);
  useEffect(() => { try { localStorage.setItem(TX_KEY, JSON.stringify(transactions)); } catch {} }, [transactions]);
  useEffect(() => { try { localStorage.setItem(CAT_KEY, JSON.stringify(customCategories)); } catch {} }, [customCategories]);

  // Ensure currentWorkspaceId is valid
  useEffect(() => {
    if (!workspaces.some((w) => w.id === settings.currentWorkspaceId) && workspaces.length > 0) {
      setSettings((s) => ({ ...s, currentWorkspaceId: workspaces[0].id }));
    }
  }, [workspaces, settings.currentWorkspaceId]);

  const currentWorkspace = useMemo(
    () => workspaces.find((w) => w.id === settings.currentWorkspaceId) ?? workspaces[0] ?? defaultWorkspace(),
    [workspaces, settings.currentWorkspaceId]
  );

  const scopedTx = useMemo(
    () => transactions.filter((t) => t.workspaceId === currentWorkspace.id),
    [transactions, currentWorkspace.id]
  );

  const wsCustom = customCategories[currentWorkspace.id] ?? { revenue: [], expense: [] };

  const formatMoney = useCallback((n: number) => fmtMoney(n, currentWorkspace.currency), [currentWorkspace.currency]);

  const value: FinanceCtx = {
    workspaces,
    currentWorkspace,
    switchWorkspace: (id) => setSettings((s) => ({ ...s, currentWorkspaceId: id })),
    createWorkspace: ({ name, kind, currency, color }) => {
      const ws: Workspace = {
        id: uid("ws"),
        name: name.trim() || "Nouvel espace",
        kind,
        currency,
        color: color ?? COLORS[workspaces.length % COLORS.length],
        createdAt: new Date().toISOString(),
      };
      setWorkspaces((cur) => [...cur, ws]);
      setSettings((s) => ({ ...s, currentWorkspaceId: ws.id }));
      return ws;
    },
    updateWorkspace: (id, data) =>
      setWorkspaces((cur) => cur.map((w) => (w.id === id ? { ...w, ...data } : w))),
    removeWorkspace: (id) => {
      setWorkspaces((cur) => cur.filter((w) => w.id !== id));
      setTransactions((cur) => cur.filter((t) => t.workspaceId !== id));
      setCustomCategories((cur) => {
        const next = { ...cur }; delete next[id]; return next;
      });
    },

    settings,
    completeOnboarding: ({ workspaceName, currency }) => {
      setWorkspaces((cur) => {
        const idx = cur.findIndex((w) => w.id === DEFAULT_WORKSPACE_ID);
        if (idx === -1) return cur;
        const next = [...cur];
        next[idx] = { ...next[idx], name: workspaceName.trim() || "Personnel", currency };
        return next;
      });
      setSettings({ onboarded: true, currentWorkspaceId: DEFAULT_WORKSPACE_ID });
    },

    transactions: scopedTx,
    allTransactions: transactions,
    add: (t) => setTransactions((cur) => [{ ...t, id: uid(), workspaceId: currentWorkspace.id }, ...cur]),
    update: (id, t) =>
      setTransactions((cur) => cur.map((x) => (x.id === id ? { ...t, id, workspaceId: x.workspaceId } : x))),
    remove: (id) => setTransactions((cur) => cur.filter((x) => x.id !== id)),

    customCategories: wsCustom,
    allCategories: (type) => {
      const base = type === "revenue" ? [...REVENUE_CATEGORIES] : [...EXPENSE_CATEGORIES];
      return [...base, ...wsCustom[type]];
    },
    addCategory: (type, name) => {
      const trimmed = name.trim();
      if (!trimmed) return false;
      const base = type === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;
      const exists =
        base.some((c) => c.toLowerCase() === trimmed.toLowerCase()) ||
        wsCustom[type].some((c) => c.toLowerCase() === trimmed.toLowerCase());
      if (exists) return false;
      setCustomCategories((cur) => {
        const ws = cur[currentWorkspace.id] ?? { revenue: [], expense: [] };
        return { ...cur, [currentWorkspace.id]: { ...ws, [type]: [...ws[type], trimmed] } };
      });
      return true;
    },
    removeCategory: (type, name) => {
      setCustomCategories((cur) => {
        const ws = cur[currentWorkspace.id] ?? { revenue: [], expense: [] };
        return { ...cur, [currentWorkspace.id]: { ...ws, [type]: ws[type].filter((c) => c !== name) } };
      });
    },

    currency: currentWorkspace.currency,
    formatMoney,

    transfer: ({ fromWorkspaceId, toWorkspaceId, amount, date, description }) => {
      if (fromWorkspaceId === toWorkspaceId) throw new Error("Espaces identiques");
      if (!(amount > 0)) throw new Error("Montant invalide");
      const fromWs = workspaces.find((w) => w.id === fromWorkspaceId);
      const toWs = workspaces.find((w) => w.id === toWorkspaceId);
      if (!fromWs || !toWs) throw new Error("Espace introuvable");
      const id1 = uid("tx"), id2 = uid("tx");
      const label = description?.trim() || `Transfert ${fromWs.name} → ${toWs.name}`;
      setTransactions((cur) => [
        { id: id1, workspaceId: fromWorkspaceId, type: "expense", date, amount, category: "Transfert émis", description: label, reference: id2 },
        { id: id2, workspaceId: toWorkspaceId, type: "revenue", date, amount, category: "Transfert reçu", description: label, reference: id1 },
        ...cur,
      ]);
    },

    resetAll: () => {
      const fresh = defaultWorkspace();
      setWorkspaces([fresh]);
      setTransactions([]);
      setCustomCategories({});
      setSettings({ onboarded: false, currentWorkspaceId: fresh.id });
    },


    exportData: () => ({
      app: "finpilot",
      version: 1,
      exportedAt: new Date().toISOString(),
      workspaces,
      transactions,
      customCategories,
      settings,
    }),
    importData: (raw, mode) => {
      if (!raw || typeof raw !== "object") throw new Error("Fichier invalide");
      const d = raw as Partial<ExportPayload>;
      if (d.app !== "finpilot") throw new Error("Ce fichier ne provient pas de FinancePilote");
      if (!Array.isArray(d.workspaces) || !Array.isArray(d.transactions)) throw new Error("Structure invalide");

      const inWs = d.workspaces as Workspace[];
      const inTx = d.transactions as Transaction[];
      const inCats = (d.customCategories ?? {}) as CustomCategories;

      if (mode === "replace") {
        setWorkspaces(inWs.length ? inWs : [defaultWorkspace()]);
        setTransactions(inTx);
        setCustomCategories(inCats);
        const nextCurrent =
          d.settings?.currentWorkspaceId && inWs.some((w) => w.id === d.settings!.currentWorkspaceId)
            ? d.settings!.currentWorkspaceId
            : inWs[0]?.id ?? DEFAULT_WORKSPACE_ID;
        setSettings({ onboarded: true, currentWorkspaceId: nextCurrent });
        return { workspaces: inWs.length, transactions: inTx.length };
      }

      // merge
      let wsAdded = 0;
      setWorkspaces((cur) => {
        const ids = new Set(cur.map((w) => w.id));
        const merged = [...cur];
        for (const w of inWs) {
          if (!ids.has(w.id)) { merged.push(w); wsAdded++; }
        }
        return merged;
      });
      let txAdded = 0;
      setTransactions((cur) => {
        const ids = new Set(cur.map((t) => t.id));
        const merged = [...cur];
        for (const t of inTx) {
          if (!ids.has(t.id)) { merged.push(t); txAdded++; }
        }
        return merged;
      });
      setCustomCategories((cur) => {
        const next = { ...cur };
        for (const [wsId, cats] of Object.entries(inCats)) {
          const existing = next[wsId] ?? { revenue: [], expense: [] };
          const uniq = (a: string[], b: string[]) =>
            [...a, ...b.filter((x) => !a.some((y) => y.toLowerCase() === x.toLowerCase()))];
          next[wsId] = {
            revenue: uniq(existing.revenue, cats.revenue ?? []),
            expense: uniq(existing.expense, cats.expense ?? []),
          };
        }
        return next;
      });
      return { workspaces: wsAdded, transactions: txAdded };
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFinance = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};
