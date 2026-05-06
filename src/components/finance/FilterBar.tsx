import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "./DatePicker";

export type FilterMode = "today" | "range" | "month" | "all";

export interface FilterState {
  mode: FilterMode;
  start?: Date;
  end?: Date;
  month?: number;
  year?: number;
}

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

interface Props {
  value: FilterState;
  onChange: (s: FilterState) => void;
}

export function FilterBar({ value, onChange }: Props) {
  const [local, setLocal] = useState<FilterState>(value);
  const update = (patch: Partial<FilterState>) => setLocal((s) => ({ ...s, ...patch }));

  const apply = () => onChange(local);
  const reset = () => { const r: FilterState = { mode: "all" }; setLocal(r); onChange(r); };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-card">
      <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-end">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type de filtre</Label>
          <Select value={local.mode} onValueChange={(v: FilterMode) => update({ mode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les dates</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="range">Période personnalisée</SelectItem>
              <SelectItem value="month">Par mois</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {local.mode === "range" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date de début</Label>
                <DatePicker value={local.start} onChange={(d) => update({ start: d })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date de fin</Label>
                <DatePicker value={local.end} onChange={(d) => update({ end: d })} />
              </div>
            </>
          )}
          {local.mode === "month" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Mois</Label>
                <Select value={String(local.month ?? new Date().getMonth())} onValueChange={(v) => update({ month: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Année</Label>
                <Select value={String(local.year ?? currentYear)} onValueChange={(v) => update({ year: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </>
          )}
          {(local.mode === "today" || local.mode === "all") && (
            <p className="text-sm text-muted-foreground self-center sm:col-span-2">
              {local.mode === "today" ? "Affichage des transactions du jour." : "Affichage de toutes les transactions."}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>Réinitialiser</Button>
          <Button onClick={apply} className="gradient-primary text-primary-foreground hover:opacity-90">Appliquer</Button>
        </div>
      </div>
    </div>
  );
}

export function filterTransactions<T extends { date: string }>(items: T[], f: FilterState): T[] {
  if (f.mode === "all") return items;
  if (f.mode === "today") {
    const today = new Date().toISOString().slice(0, 10);
    return items.filter((t) => t.date === today);
  }
  if (f.mode === "range") {
    if (!f.start || !f.end) return items;
    const s = f.start.toISOString().slice(0, 10);
    const e = f.end.toISOString().slice(0, 10);
    const [a, b] = s <= e ? [s, e] : [e, s];
    return items.filter((t) => t.date >= a && t.date <= b);
  }
  if (f.mode === "month") {
    const m = f.month ?? new Date().getMonth();
    const y = f.year ?? new Date().getFullYear();
    return items.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }
  return items;
}
