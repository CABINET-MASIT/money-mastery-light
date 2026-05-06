import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Transaction } from "./types";
import { SEED_TRANSACTIONS } from "./seed";

const STORAGE_KEY = "finpilot.transactions.v1";

interface FinanceCtx {
  transactions: Transaction[];
  add: (t: Omit<Transaction, "id">) => void;
  update: (id: string, t: Omit<Transaction, "id">) => void;
  remove: (id: string) => void;
  resetSeed: () => void;
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

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch {}
  }, [transactions]);

  const value = useMemo<FinanceCtx>(() => ({
    transactions,
    add: (t) => setTransactions((cur) => [{ ...t, id: uid() }, ...cur]),
    update: (id, t) => setTransactions((cur) => cur.map((x) => (x.id === id ? { ...t, id } : x))),
    remove: (id) => setTransactions((cur) => cur.filter((x) => x.id !== id)),
    resetSeed: () => setTransactions(SEED_TRANSACTIONS),
  }), [transactions]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFinance = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};
