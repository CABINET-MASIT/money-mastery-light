import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, PieChart, BarChart3, Wallet, Settings as SettingsIcon, ArrowRightLeft } from "lucide-react";
import { useFinance } from "@/lib/finance/store";
import { useMemo, useState } from "react";
import defaultLogo from "@/assets/cmasit-logo.jpg";
import { TransferDialog } from "@/components/finance/TransferDialog";

interface Tile {
  key: string;
  action: "nav" | "transfer";
  to?: string;
  label: string;
  hint: string;
  icon: React.ElementType;
  tone: "primary" | "silver";
}

const tiles: Tile[] = [
  { key: "rev", action: "nav", to: "/revenus", label: "Revenus", hint: "Saisie et liste", icon: TrendingUp, tone: "silver" },
  { key: "exp", action: "nav", to: "/depenses", label: "Dépenses", hint: "Saisie et liste", icon: TrendingDown, tone: "silver" },
  { key: "bal", action: "nav", to: "/tableau-de-bord", label: "Solde", hint: "Revenus et dépenses", icon: Wallet, tone: "silver" },
  { key: "trf", action: "transfer", label: "Transfert", hint: "Entre espaces", icon: ArrowRightLeft, tone: "primary" },
  { key: "syn-r", action: "nav", to: "/synthese/revenus", label: "Synthèse", hint: "Revenus", icon: PieChart, tone: "primary" },
  { key: "syn-e", action: "nav", to: "/synthese/depenses", label: "Synthèse", hint: "Dépenses", icon: BarChart3, tone: "primary" },
  { key: "set", action: "nav", to: "/parametres", label: "Paramètres", hint: "Catégories", icon: SettingsIcon, tone: "primary" },
];

export default function Home() {
  const nav = useNavigate();
  const { transactions, formatMoney, currentWorkspace } = useFinance();

  const { rev, exp } = useMemo(() => {
    let rev = 0, exp = 0;
    for (const t of transactions) {
      if (t.type === "revenue") rev += t.amount; else exp += t.amount;
    }
    return { rev, exp };
  }, [transactions]);
  const balance = rev - exp;

  return (
    <div className="-m-4 md:-m-8 -mb-24 md:-mb-8">
      {/* Hero brand */}
      <section className="relative gradient-hero px-6 pt-8 pb-10 rounded-b-[2.5rem] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_10%,white,transparent_40%)]" />
        <div className="relative flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden ring-4 ring-white/30">
            <img src={logo} alt="Logo CMASIT" className="h-full w-full object-contain p-1" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mt-4 tracking-wide">FinancePilote</h1>
          <p className="mt-2 px-3 py-1 rounded-md bg-white text-primary text-xs font-semibold tracking-wide">
            Gérer les revenus et dépenses
          </p>
        </div>

        {/* Balance label — sticker */}
        <div className="relative mt-6 mx-auto max-w-sm rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 px-5 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">{currentWorkspace.name} • Solde</p>
              <p className="font-display text-2xl font-bold text-white mt-1 truncate">{formatMoney(balance)}</p>
            </div>
            <span className="rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold px-2.5 py-1">
              {currentWorkspace.currency}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-white/60">Revenus</p>
              <p className="text-white font-semibold mt-0.5 truncate">{formatMoney(rev)}</p>
            </div>
            <div className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-white/60">Dépenses</p>
              <p className="text-white font-semibold mt-0.5 truncate">{formatMoney(exp)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* App buttons grid */}
      <section className="px-5 pt-8 pb-10 bg-background">
        <div className="grid grid-cols-3 gap-x-4 gap-y-7 max-w-md mx-auto">
          {tiles.map((t) => (
            <button
              key={t.to + t.label + t.hint}
              onClick={() => nav(t.to)}
              className="group flex flex-col items-center text-center focus:outline-none"
            >
              <span
                className={`relative h-[68px] w-[68px] rounded-full flex items-center justify-center shadow-card transition-transform active:scale-90 group-hover:-translate-y-0.5 ${
                  t.tone === "primary"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-neutral-200 to-neutral-400 text-primary"
                }`}
              >
                <t.icon className="h-7 w-7" strokeWidth={2.2} />
                <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
              </span>
              <span className="mt-2 text-sm font-bold text-foreground leading-tight">{t.label}</span>
              <span className="text-[11px] text-muted-foreground leading-tight">{t.hint}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px] tracking-[0.25em] text-muted-foreground/70 mt-10 font-semibold">
          COPYRIGHT CMASIT · TEL 620 41 82 95
        </p>
      </section>
    </div>
  );
}
