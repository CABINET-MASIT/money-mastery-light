import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "bepc_subscription_v1";
const TRIAL_KEY = "bepc_first_launch_v1";
const SUBSCRIPTION_MS = 365 * 24 * 60 * 60 * 1000; // 1 year
const TRIAL_MS = 5 * 60 * 1000; // 5 minutes
const EVENT_NAME = "subscription-changed";

export type SubscriptionStatus = "trial" | "active" | "expired" | "blocked";

export interface SubscriptionState {
  status: SubscriptionStatus;
  active: boolean; // true if trial or active (i.e. app usable)
  paid: boolean;   // true only if a paid subscription is active
  activatedAt: number | null;
  expiresAt: number | null;
  trialExpiresAt: number | null;
  msRemaining: number;
}

function ensureFirstLaunch(): number {
  try {
    const raw = localStorage.getItem(TRIAL_KEY);
    if (raw) return Number(raw);
    const now = Date.now();
    localStorage.setItem(TRIAL_KEY, String(now));
    return now;
  } catch {
    return Date.now();
  }
}

function read(): SubscriptionState {
  const now = Date.now();
  const firstLaunch = typeof window !== "undefined" ? ensureFirstLaunch() : now;
  const trialExpiresAt = firstLaunch + TRIAL_MS;

  let activatedAt: number | null = null;
  let expiresAt: number | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { activatedAt: number; expiresAt: number };
      activatedAt = parsed.activatedAt ?? null;
      expiresAt = parsed.expiresAt ?? null;
    }
  } catch {}

  if (expiresAt && expiresAt > now) {
    return {
      status: "active",
      active: true,
      paid: true,
      activatedAt,
      expiresAt,
      trialExpiresAt,
      msRemaining: expiresAt - now,
    };
  }

  if (expiresAt && expiresAt <= now) {
    return {
      status: "expired",
      active: false,
      paid: false,
      activatedAt,
      expiresAt,
      trialExpiresAt,
      msRemaining: 0,
    };
  }

  if (now < trialExpiresAt) {
    return {
      status: "trial",
      active: true,
      paid: false,
      activatedAt: null,
      expiresAt: null,
      trialExpiresAt,
      msRemaining: trialExpiresAt - now,
    };
  }

  return {
    status: "blocked",
    active: false,
    paid: false,
    activatedAt: null,
    expiresAt: null,
    trialExpiresAt,
    msRemaining: 0,
  };
}

export function activateSubscription() {
  const activatedAt = Date.now();
  const expiresAt = activatedAt + SUBSCRIPTION_MS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activatedAt, expiresAt }));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function clearSubscription() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>(() =>
    typeof window === "undefined"
      ? { status: "trial", active: true, paid: false, activatedAt: null, expiresAt: null, trialExpiresAt: null, msRemaining: 0 }
      : read()
  );

  const refresh = useCallback(() => setState(read()), []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === TRIAL_KEY) refresh();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    const interval = setInterval(refresh, 15_000);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [refresh]);

  return { ...state, activateSubscription, clearSubscription, refresh };
}
