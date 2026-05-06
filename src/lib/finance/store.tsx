import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Transaction, TxType, REVENUE_CATEGORIES, EXPENSE_CATEGORIES } from "./types";
import { SEED_TRANSACTIONS } from "./seed";

const STORAGE_KEY = "finpilot.transactions.v1";
const CATEGORIES_KEY = "finpilot.categories.v1";

interface CustomCategories {
  revenue: string[];
  expense: string[];
}

interface FinanceCtx {
  transactions: Transaction[];
  add: (t: Omit<Transaction, "id">) => void;
  update: (id: string, t: Omit<Transaction, "id">) => void;
  remove: (id: string) => void;
  resetSeed: () => void;
  customCategories: CustomCategories;
  allCategories: (type: TxType) => string[];
  addCategory: (type: TxType, name: string) => boolean;
  removeCategory: (type: TxType, name: string) => void;
}

const Ctx = createContext<FinanceCtx | null>(null);

const uid = () => `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window === "undefined") return SEED_TRANSACTIONS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return SEED_TRANSACTIONS;
  });

  const [customCategories, setCustomCategories] = useState<CustomCategories>(() => {
    if (typeof window === "undefined") return { revenue: [], expense: [] };
    try {
      const raw = localStorage.getItem(CATEGORIES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { revenue: [], expense: [] };
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch {}
  }, [transactions]);

  useEffect(() => {
    try { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories)); } catch {}
  }, [customCategories]);

  const value = useMemo<FinanceCtx>(() => ({
    transactions,
    add: (t) => setTransactions((cur) => [{ ...t, id: uid() }, ...cur]),
    update: (id, t) => setTransactions((cur) => cur.map((x) => (x.id === id ? { ...t, id } : x))),
    remove: (id) => setTransactions((cur) => cur.filter((x) => x.id !== id)),
    resetSeed: () => setTransactions(SEED_TRANSACTIONS),
    customCategories,
    allCategories: (type) => {
      const base = type === "revenue" ? [...REVENUE_CATEGORIES] : [...EXPENSE_CATEGORIES];
      return [...base, ...customCategories[type]];
    },
    addCategory: (type, name) => {
      const trimmed = name.trim();
      if (!trimmed) return false;
      const base = type === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;
      const exists =
        base.some((c) => c.toLowerCase() === trimmed.toLowerCase()) ||
        customCategories[type].some((c) => c.toLowerCase() === trimmed.toLowerCase());
      if (exists) return false;
      setCustomCategories((cur) => ({ ...cur, [type]: [...cur[type], trimmed] }));
      return true;
    },
    removeCategory: (type, name) => {
      setCustomCategories((cur) => ({ ...cur, [type]: cur[type].filter((c) => c !== name) }));
    },
  }), [transactions, customCategories]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFinance = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};
