import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, Activity } from "lucide-react";
import { useFinance } from "@/lib/finance/store";
import { StatCard } from "@/components/finance/StatCard";
import { FilterBar, FilterState, filterTransactions } from "@/components/finance/FilterBar";
import { formatShort } from "@/lib/finance/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from "recharts";

export default function Dashboard() {
  const { transactions, formatMoney, currentWorkspace } = useFinance();
  const [filter, setFilter] = useState<FilterState>({ mode: "all" });

  const today = new Date().toISOString().slice(0, 10);
  const monthKey = today.slice(0, 7);

  const stats = useMemo(() => {
    const sum = (arr: typeof transactions, type: "revenue" | "expense") =>
      arr.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

    const todayList = transactions.filter((t) => t.date === today);
    const monthList = transactions.filter((t) => t.date.startsWith(monthKey));
    const periodList = filterTransactions(transactions, filter);

    return {
      todayRev: sum(todayList, "revenue"),
      todayExp: sum(todayList, "expense"),
      monthRev: sum(monthList, "revenue"),
      monthExp: sum(monthList, "expense"),
      periodRev: sum(periodList, "revenue"),
      periodExp: sum(periodList, "expense"),
    };
  }, [transactions, filter, today, monthKey]);

  // 6-month evolution
  const monthlySeries = useMemo(() => {
    const map = new Map<string, { month: string; Revenus: number; Dépenses: number; Solde: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, { month: format(d, "MMM", { locale: fr }), Revenus: 0, Dépenses: 0, Solde: 0 });
    }
    transactions.forEach((t) => {
      const k = t.date.slice(0, 7);
      const e = map.get(k); if (!e) return;
      if (t.type === "revenue") e.Revenus += t.amount;
      else e.Dépenses += t.amount;
      e.Solde = e.Revenus - e.Dépenses;
    });
    return Array.from(map.values());
  }, [transactions]);

  const recent = useMemo(() => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8), [transactions]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">{currentWorkspace.name}</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Vue d'ensemble financière</h1>
        <p className="text-muted-foreground mt-2">Suivez en temps réel vos performances · {currentWorkspace.currency}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Aujourd'hui</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Revenus du jour" amount={stats.todayRev} icon={<TrendingUp className="h-5 w-5" />} variant="revenue" hint={format(new Date(), "EEEE dd MMMM", { locale: fr })} />
          <StatCard label="Dépenses du jour" amount={stats.todayExp} icon={<TrendingDown className="h-5 w-5" />} variant="expense" />
          <StatCard label="Solde du jour" amount={stats.todayRev - stats.todayExp} icon={<Wallet className="h-5 w-5" />} variant="balance" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ce mois-ci</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Revenus du mois" amount={stats.monthRev} icon={<TrendingUp className="h-5 w-5 text-success" />} />
          <StatCard label="Dépenses du mois" amount={stats.monthExp} icon={<TrendingDown className="h-5 w-5 text-destructive" />} />
          <StatCard label="Solde du mois" amount={stats.monthRev - stats.monthExp} icon={<Activity className="h-5 w-5 text-accent" />} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Période personnalisée</h2>
        <FilterBar value={filter} onChange={setFilter} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Revenus période" amount={stats.periodRev} icon={<TrendingUp className="h-5 w-5 text-success" />} />
          <StatCard label="Dépenses période" amount={stats.periodExp} icon={<TrendingDown className="h-5 w-5 text-destructive" />} />
          <StatCard label="Solde période" amount={stats.periodRev - stats.periodExp} icon={<Wallet className="h-5 w-5 text-accent" />} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Évolution sur 6 mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer>
                <AreaChart data={monthlySeries} margin={{ left: -10, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatShort} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatMoney(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="Revenus" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gRev)" />
                  <Area type="monotone" dataKey="Dépenses" stroke="hsl(var(--destructive))" strokeWidth={2.5} fill="url(#gExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Comparaison mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer>
                <BarChart data={monthlySeries} margin={{ left: -10, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatShort} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatMoney(v)} />
                  <Legend />
                  <Bar dataKey="Revenus" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Dépenses" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${t.type === "revenue" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {t.type === "revenue" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{t.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="font-normal text-xs">{t.category}</Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(t.date), "dd MMM yyyy", { locale: fr })}</span>
                  </div>
                </div>
                <div className={`font-semibold whitespace-nowrap ${t.type === "revenue" ? "text-success" : "text-destructive"}`}>
                  {t.type === "revenue" ? "+" : "-"}{formatMoney(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
