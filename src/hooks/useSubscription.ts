import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "bepc_subscription_v1";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const EVENT_NAME = "subscription-changed";

export interface SubscriptionState {
  active: boolean;
  activatedAt: number | null;
  expiresAt: number | null;
}

function read(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: false, activatedAt: null, expiresAt: null };
    const parsed = JSON.parse(raw) as { activatedAt: number; expiresAt: number };
    const now = Date.now();
    if (!parsed.expiresAt || parsed.expiresAt < now) {
      return { active: false, activatedAt: parsed.activatedAt ?? null, expiresAt: parsed.expiresAt ?? null };
    }
    return { active: true, activatedAt: parsed.activatedAt, expiresAt: parsed.expiresAt };
  } catch {
    return { active: false, activatedAt: null, expiresAt: null };
  }
}

export function activateSubscription() {
  const activatedAt = Date.now();
  const expiresAt = activatedAt + ONE_YEAR_MS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activatedAt, expiresAt }));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function clearSubscription() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>(() =>
    typeof window === "undefined" ? { active: false, activatedAt: null, expiresAt: null } : read()
  );

  const refresh = useCallback(() => setState(read()), []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    // Auto expiry check
    const interval = setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [refresh]);

  return { ...state, activateSubscription, clearSubscription, refresh };
}
