import { CURRENCIES } from "./types";

export function formatMoney(n: number, currency: string = "GNF"): string {
  const def = CURRENCIES.find((c) => c.code === currency);
  const locale = def?.locale ?? "fr-FR";
  const symbol = def?.symbol ?? currency;
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(n));
  return `${formatted} ${symbol}`;
}

export const formatShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return String(n);
};

// kept for backward compatibility
export const formatGNF = (n: number) => formatMoney(n, "GNF");
