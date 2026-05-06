import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatGNF } from "@/lib/finance/format";

interface Props {
  label: string;
  amount: number;
  icon: ReactNode;
  variant?: "revenue" | "expense" | "balance" | "neutral";
  hint?: string;
}

const variantClass: Record<NonNullable<Props["variant"]>, string> = {
  revenue: "gradient-revenue text-primary-foreground",
  expense: "gradient-expense text-primary-foreground",
  balance: "gradient-balance text-primary-foreground",
  neutral: "bg-card text-foreground border border-border",
};

export function StatCard({ label, amount, icon, variant = "neutral", hint }: Props) {
  const isColored = variant !== "neutral";
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5 shadow-card transition-transform hover:-translate-y-0.5", variantClass[variant])}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className={cn("text-xs font-medium uppercase tracking-wider", isColored ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {label}
          </p>
          <p className="font-display text-2xl md:text-[26px] font-bold tracking-tight truncate">
            {formatGNF(amount)}
          </p>
          {hint && (
            <p className={cn("text-xs", isColored ? "text-primary-foreground/75" : "text-muted-foreground")}>{hint}</p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", isColored ? "bg-white/20" : "bg-secondary")}>
          {icon}
        </div>
      </div>
      {isColored && <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />}
    </div>
  );
}
