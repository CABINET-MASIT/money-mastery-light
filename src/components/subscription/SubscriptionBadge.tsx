import { BadgeCheck, Clock, Lock, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

function formatRemaining(ms: number) {
  if (ms <= 0) return "0 min";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}`;
  return `${m} min`;
}

interface Props {
  variant?: "compact" | "full";
  className?: string;
}

export function SubscriptionBadge({ variant = "compact", className }: Props) {
  const { status, expiresAt, trialExpiresAt, msRemaining } = useSubscription();

  const config = {
    active: {
      label: "Premium actif",
      icon: BadgeCheck,
      classes: "bg-success/15 text-success border-success/30",
      detail: expiresAt
        ? `Expire ${new Date(expiresAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}`
        : "",
    },
    trial: {
      label: "Essai gratuit",
      icon: Clock,
      classes: "bg-primary/10 text-primary border-primary/30",
      detail: `Reste ${formatRemaining(msRemaining)}`,
    },
    expired: {
      label: "Abonnement expiré",
      icon: Sparkles,
      classes: "bg-destructive/10 text-destructive border-destructive/30 animate-pulse",
      detail: "Renouveler",
    },
    blocked: {
      label: "Accès verrouillé",
      icon: Lock,
      classes: "bg-destructive/15 text-destructive border-destructive/40 animate-pulse",
      detail: "Payer maintenant",
    },
  }[status];

  const Icon = config.icon;

  return (
    <NavLink
      to="/paiement"
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors hover:brightness-110",
        config.classes,
        variant === "full" && "w-full",
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <div className="flex flex-col leading-tight min-w-0">
        <span className="truncate">{config.label}</span>
        {config.detail && <span className="text-[10px] font-normal opacity-80 truncate">{config.detail}</span>}
      </div>
    </NavLink>
  );
}
