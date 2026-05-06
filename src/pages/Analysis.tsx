import { useMemo, useState } from "react";
import { useFinance } from "@/lib/finance/store";
import { FilterBar, FilterState, filterTransactions } from "@/components/finance/FilterBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGNF, formatShort } from "@/lib/finance/format";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const COLORS_REV = ["hsl(160 84% 39%)", "hsl(173 80% 40%)", "hsl(199 89% 48%)", "hsl(217 91% 60%)", "hsl(142 71% 45%)", "hsl(188 86% 53%)", "hsl(220 70% 50%)"];
const COLORS_EXP = ["hsl(0 84% 60%)", "hsl(20 90% 55%)", "hsl(38 92% 50%)", "hsl(340 82% 52%)", "hsl(280 65% 60%)", "hsl(15 80% 50%)", "hsl(45 90% 55%)", "hsl(355 75% 55%)", "hsl(25 85% 50%)", "hsl(310 70% 55%)", "hsl(10 75% 60%)"];

export default function Analysis() {
  const { transactions } = useFinance();
  const [filter, setFilter] = useState<FilterState>({ mode: "all" });

  const filtered = useMemo(() => filterTransactions(transactions, filter), [transactions, filter]);

  const breakdown = (type: "revenue" | "expense") => {
    const map = new Map<string, number>();
    filtered.filter((t) => t.type === type).forEach((t) => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    const arr = Array.from(map, ([name, value]) => ({ name, value }));
    const total = arr.reduce((s, x) => s + x.value, 0) || 1;
    return arr.map((x) => ({ ...x, pct: (x.value / total) * 100 })).sort((a, b) => b.value - a.value);
  };

  const revData = useMemo(() => breakdown("revenue"), [filtered]);
  const expData = useMemo(() => breakdown("expense"), [filtered]);
  const totalRev = revData.reduce((s, x) => s + x.value, 0);
  const totalExp = expData.reduce((s, x) => s + x.value, 0);

  // Monthly evolution (12 months)
  const yearly = useMemo(() => {
    const map = new Map<string, { month: string; Revenus: number; Dépenses: number; Solde: number }>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, { month: format(d, "MMM yy", { locale: fr }), Revenus: 0, Dépenses: 0, Solde: 0 });
    }
    transactions.forEach((t) => {
      const k = t.date.slice(0, 7);
      const e = map.get(k); if (!e) return;
      if (t.type === "revenue") e.Revenus += t.amount; else e.Dépenses += t.amount;
      e.Solde = e.Revenus - e.Dépenses;
    });
    return Array.from(map.values());
  }, [transactions]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Analyse financière</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Rapports & récapitulatifs</h1>
        <p className="text-muted-foreground mt-2">Décortiquez vos finances par catégorie et observez l'évolution.</p>
      </header>

      <FilterBar value={filter} onChange={setFilter} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryBreakdown title="Revenus par catégorie" data={revData} total={totalRev} colors={COLORS_REV} accent="text-success" />
        <CategoryBreakdown title="Dépenses par catégorie" data={expData} total={totalExp} colors={COLORS_EXP} accent="text-destructive" />
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display">Évolution mensuelle (12 derniers mois)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[340px] w-full">
            <ResponsiveContainer>
              <LineChart data={yearly} margin={{ left: -10, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatShort} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatGNF(v)} />
                <Legend />
                <Line type="monotone" dataKey="Revenus" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Dépenses" stroke="hsl(var(--destructive))" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Solde" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display">Comparaison catégories (barres)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <CategoryBars data={revData} color="hsl(var(--primary))" label="Revenus" />
            <CategoryBars data={expData} color="hsl(var(--destructive))" label="Dépenses" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryBreakdown({ title, data, total, colors, accent }: { title: string; data: { name: string; value: number; pct: number }[]; total: number; colors: string[]; accent: string }) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center justify-between">
          <span>{title}</span>
          <span className={`text-sm font-semibold ${accent}`}>{formatGNF(total)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Aucune donnée pour cette période</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[180px_1fr] items-center">
            <div className="h-[180px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatGNF(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-sm">
              {data.map((row, i) => (
                <li key={row.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                  <span className="flex-1 truncate">{row.name}</span>
                  <span className="font-medium tabular-nums">{formatGNF(row.value)}</span>
                  <span className="text-muted-foreground tabular-nums w-12 text-right">{row.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryBars({ data, color, label }: { data: { name: string; value: number }[]; color: string; label: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 text-muted-foreground">{label}</h3>
      <div className="h-[280px]">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={formatShort} />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={130} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatGNF(v)} />
            <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
