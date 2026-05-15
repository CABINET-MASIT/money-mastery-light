import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, PieChart, BarChart3, LayoutDashboard, Settings as SettingsIcon } from "lucide-react";
import { useFinance } from "@/lib/finance/store";
import { useMemo } from "react";

interface Tile {
  to: string;
  label: string;
  hint: string;
  icon: React.ElementType;
  className: string;
}

const tiles: Tile[] = [
  { to: "/revenus", label: "Saisir un revenu", hint: "Encaissements & ventes", icon: TrendingUp, className: "gradient-revenue text-white" },
  { to: "/depenses", label: "Saisir une dépense", hint: "Achats & charges", icon: TrendingDown, className: "gradient-expense text-white" },
  { to: "/tableau-de-bord", label: "Tableau de bord", hint: "Totaux & solde", icon: LayoutDashboard, className: "gradient-balance text-white" },
  { to: "/synthese/revenus", label: "Synthèse revenus", hint: "Par catégorie & %", icon: PieChart, className: "bg-card text-foreground border border-border" },
  { to: "/synthese/depenses", label: "Synthèse dépenses", hint: "Par catégorie & %", icon: BarChart3, className: "bg-card text-foreground border border-border" },
  { to: "/parametres", label: "Paramètres", hint: "Catégories & devises", icon: SettingsIcon, className: "bg-card text-foreground border border-border" },
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
    <div className="space-y-6 max-w-[800px] mx-auto">
      <header className="text-center pt-2">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">{currentWorkspace.name}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight mt-1">Bonjour 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Que voulez-vous faire aujourd'hui ?</p>
      </header>

      <div className="rounded-3xl gradient-primary p-5 text-primary-foreground shadow-glow">
        <p className="text-xs uppercase tracking-wider opacity-80">Solde actuel</p>
        <p className="font-display text-3xl font-bold mt-1 truncate">{formatMoney(balance)}</p>
        <div className="flex items-center justify-between mt-4 text-xs">
          <div>
            <p className="opacity-75">Revenus</p>
            <p className="font-semibold mt-0.5">{formatMoney(rev)}</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <p className="opacity-75">Dépenses</p>
            <p className="font-semibold mt-0.5">{formatMoney(exp)}</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <p className="opacity-75">Devise</p>
            <p className="font-semibold mt-0.5">{currentWorkspace.currency}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <button
            key={t.to}
            onClick={() => nav(t.to)}
            className={`group relative overflow-hidden rounded-3xl p-5 text-left aspect-square sm:aspect-[4/3] shadow-card transition-all active:scale-95 hover:-translate-y-0.5 ${t.className}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <t.icon className="h-5 w-5" />
            </div>
            <div className="absolute bottom-4 left-5 right-5">
              <p className="font-display text-base font-bold leading-tight">{t.label}</p>
              <p className="text-xs opacity-75 mt-0.5">{t.hint}</p>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          </button>
        ))}
      </div>
    </div>
  );
}
