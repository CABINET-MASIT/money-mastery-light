import { useMemo, useState } from "react";
import { useFinance } from "@/lib/finance/store";
import { FilterBar, FilterState, filterTransactions } from "@/components/finance/FilterBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { TxType } from "@/lib/finance/types";
import { TrendingUp, TrendingDown } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";

const COLORS_REV = ["hsl(160 84% 39%)", "hsl(173 80% 40%)", "hsl(199 89% 48%)", "hsl(217 91% 60%)", "hsl(142 71% 45%)", "hsl(188 86% 53%)", "hsl(220 70% 50%)"];
const COLORS_EXP = ["hsl(0 84% 60%)", "hsl(20 90% 55%)", "hsl(38 92% 50%)", "hsl(340 82% 52%)", "hsl(280 65% 60%)", "hsl(15 80% 50%)", "hsl(45 90% 55%)", "hsl(355 75% 55%)", "hsl(25 85% 50%)", "hsl(310 70% 55%)"];

interface Props { type: TxType }

export default function Synthesis({ type }: Props) {
  const { transactions, formatMoney } = useFinance();
  const [filter, setFilter] = useState<FilterState>({ mode: "all" });
  const isExp = type === "expense";
  const colors = isExp ? COLORS_EXP : COLORS_REV;

  const data = useMemo(() => {
    const filtered = filterTransactions(transactions.filter((t) => t.type === type), filter);
    const map = new Map<string, number>();
    filtered.forEach((t) => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    const arr = Array.from(map, ([name, value]) => ({ name, value }));
    const total = arr.reduce((s, x) => s + x.value, 0) || 1;
    return {
      total: arr.reduce((s, x) => s + x.value, 0),
      rows: arr.map((x) => ({ ...x, pct: (x.value / total) * 100 })).sort((a, b) => b.value - a.value),
    };
  }, [transactions, type, filter]);

  return (
    <div className="space-y-5 max-w-[900px] mx-auto">
      <BackButton to="/" />
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Synthèse</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mt-1 flex items-center gap-2">
          {isExp ? <TrendingDown className="h-6 w-6 text-destructive" /> : <TrendingUp className="h-6 w-6 text-success" />}
          {isExp ? "Dépenses par catégorie" : "Revenus par catégorie"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Total et part de chaque catégorie.</p>
      </header>

      <FilterBar value={filter} onChange={setFilter} />

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-display flex items-center justify-between">
            <span>Total</span>
            <span className={isExp ? "text-destructive" : "text-success"}>{formatMoney(data.total)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.rows.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">Aucune donnée pour cette période</p>
          ) : (
            <>
              <div className="h-[220px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.rows} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {data.rows.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatMoney(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="mt-4 space-y-2">
                {data.rows.map((row, i) => (
                  <li key={row.name} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                      <span className="flex-1 font-medium text-sm truncate">{row.name}</span>
                      <span className="font-semibold tabular-nums text-sm">{formatMoney(row.value)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: colors[i % colors.length] }} />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">{row.pct.toFixed(1)}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
