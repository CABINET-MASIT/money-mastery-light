import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, ChevronLeft, Printer, Search } from "lucide-react";
import { Transaction, TxType } from "@/lib/finance/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFinance } from "@/lib/finance/store";
import { TransactionDialog } from "./TransactionDialog";
import { cn } from "@/lib/utils";

import { format, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props { type: TxType }
type PeriodMode = "all" | "today" | "custom";

export function TransactionList({ type }: Props) {
  const nav = useNavigate();
  const { transactions, remove, formatMoney, allCategories, currentWorkspace } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [period, setPeriod] = useState<PeriodMode>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const isExpense = type === "expense";
  const categories = allCategories(type);

  const range = useMemo(() => {
    const now = new Date();
    if (period === "today") return { from: startOfDay(now), to: endOfDay(now), label: "Aujourd'hui" };
    if (period === "custom" && from && to) {
      try {
        return {
          from: startOfDay(parseISO(from)),
          to: endOfDay(parseISO(to)),
          label: `${format(parseISO(from), "dd/MM/yy")} → ${format(parseISO(to), "dd/MM/yy")}`,
        };
      } catch { /* ignore */ }
    }
    return { from: null as Date | null, to: null as Date | null, label: "Toutes les périodes" };
  }, [period, from, to]);

  const list = useMemo(() => {
    return transactions
      .filter((t) => t.type === type)
      .filter((t) => {
        if (!range.from || !range.to) return true;
        try { return isWithinInterval(parseISO(t.date), { start: range.from, end: range.to }); }
        catch { return true; }
      })
      .filter((t) => categoryFilter === "all" || t.category === categoryFilter)
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [t.description, t.category].some((v) => v?.toLowerCase().includes(q));
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, type, search, categoryFilter, range]);

  const total = list.reduce((s, t) => s + t.amount, 0);
  const title = isExpense ? "Total dépense" : "Total revenu";

  const exportPdf = () => {
    if (list.length === 0) { toast.error("Aucune donnée à exporter"); return; }
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(isExpense ? "État des dépenses" : "État des revenus", 40, 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(`Espace : ${currentWorkspace.name}`, 40, 64);
    doc.text(`Période : ${range.label}`, 40, 78);
    if (categoryFilter !== "all") doc.text(`Catégorie : ${categoryFilter}`, 40, 92);
    doc.text(`Édité le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`, 40, categoryFilter !== "all" ? 106 : 92);

    autoTable(doc, {
      startY: categoryFilter !== "all" ? 122 : 108,
      head: [["Date", "Libellé", "Catégorie", "Montant"]],
      body: list.map((t) => [
        format(parseISO(t.date), "dd/MM/yyyy"),
        t.description || "-",
        t.category,
        `${isExpense ? "-" : "+"}${formatMoney(t.amount)}`,
      ]),
      foot: [["", "", "TOTAL", `${isExpense ? "-" : "+"}${formatMoney(total)}`]],
      styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [139, 31, 36], textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
      columnStyles: { 3: { halign: "right" }, 0: { cellWidth: 70 } },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const stamp = format(new Date(), "yyyy-MM-dd_HHmm");
    doc.save(`${isExpense ? "depenses" : "revenus"}-${currentWorkspace.name}-${stamp}.pdf`);
    toast.success("PDF généré");
  };

  return (
    <div className="-m-4 md:-m-8 -mb-24 md:-mb-8 min-h-screen bg-background">
      {/* Top header — CMASIT charter */}
      <header className="bg-black text-white px-3 pt-3 pb-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            onClick={() => nav("/")}
            className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-card active:scale-95"
            aria-label="Retour"
          >
            <ChevronLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-center tracking-wide">{title}</h1>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[86px] bg-transparent border-0 text-amber-300 underline underline-offset-4 text-sm font-medium focus:ring-0 [&>svg]:hidden">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Big amount pill */}
        <div className="mt-3 mx-auto max-w-[280px] rounded-full bg-primary text-primary-foreground shadow-glow px-6 py-2.5 flex items-center justify-between">
          <span className="font-display text-xl font-bold truncate">{formatMoney(total).replace(currentWorkspace.currency, "").trim()}</span>
          <span className="text-xs font-bold tracking-wider bg-white/15 px-2 py-0.5 rounded-md">{currentWorkspace.currency}</span>
        </div>

        {/* Period toggle */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {([
            { k: "all",   l: "Toutes" },
            { k: "today", l: "Aujourd'hui" },
            { k: "custom",l: "Période" },
          ] as { k: PeriodMode; l: string }[]).map((p) => (
            <button
              key={p.k}
              onClick={() => setPeriod(p.k)}
              className={cn(
                "px-3 h-8 rounded-full text-xs font-semibold border transition",
                period === p.k
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-white/80 border-white/25 hover:text-white"
              )}
            >
              {p.l}
            </button>
          ))}
        </div>

        {/* Du / Au date range */}
        {period === "custom" && (
          <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center max-w-sm mx-auto">
            <label className="text-sm text-white/80 font-semibold">Du</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="h-9 bg-white text-black border-0 rounded-md" />
            <label className="text-sm text-white/80 font-semibold">Au</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="h-9 bg-white text-black border-0 rounded-md" />
          </div>
        )}

        {/* Search */}
        <div className="mt-3 relative max-w-sm mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un libellé..."
            className="pl-9 h-9 bg-white/10 border-white/15 text-white placeholder:text-white/50 rounded-full"
          />
        </div>

        {/* Actions row: PDF + Add */}
        <div className="mt-3 flex items-center justify-between max-w-sm mx-auto">
          <button
            onClick={exportPdf}
            className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-card active:scale-95"
            aria-label="Exporter PDF"
            title="Exporter en PDF"
          >
            <Printer className="h-5 w-5 text-primary-foreground" />
          </button>
          <p className="text-[11px] text-white/60">
            {list.length} entrée{list.length > 1 ? "s" : ""} • {range.label}
          </p>
          <button
            onClick={() => { setEditing(null); setOpen(true); }}
            className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-glow active:scale-95"
            aria-label="Ajouter"
          >
            <Plus className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="bg-black min-h-[60vh] px-2 pb-24">
        {/* Header row */}
        <div className="grid grid-cols-[110px_1fr_110px_60px] bg-primary text-primary-foreground text-sm font-bold rounded-t-md overflow-hidden">
          <div className="px-3 py-2.5">Date</div>
          <div className="px-3 py-2.5">Libellé</div>
          <div className="px-3 py-2.5 text-right">Montant</div>
          <div className="px-2 py-2.5 text-right">•••</div>
        </div>

        {list.length === 0 && (
          <div className="text-center text-white/50 py-16 text-sm bg-neutral-950">
            Aucune transaction sur cette période
          </div>
        )}

        {list.map((t, i) => (
          <div
            key={t.id}
            className={cn(
              "grid grid-cols-[110px_1fr_110px_60px] items-center text-white text-sm border-b border-white/5",
              i % 2 === 0 ? "bg-neutral-900" : "bg-neutral-950"
            )}
          >
            <div className="px-3 py-3 whitespace-nowrap">{format(parseISO(t.date), "dd/MM/yyyy")}</div>
            <div className="px-3 py-3 min-w-0">
              <p className="truncate font-medium">{t.description || "—"}</p>
              <p className="text-[10px] text-white/50 truncate">{t.category}</p>
            </div>
            <div className="px-3 py-3 text-right font-semibold tabular-nums whitespace-nowrap">
              {new Intl.NumberFormat("fr-FR").format(Math.round(t.amount))}
            </div>
            <div className="px-1 py-2 flex justify-end gap-0.5">
              <Button size="icon" variant="ghost" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => { setEditing(t); setOpen(true); }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:text-white hover:bg-primary/60"
                onClick={() => setConfirmId(t.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <TransactionDialog open={open} onOpenChange={setOpen} type={type} editing={editing} />

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la transaction ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (confirmId) { remove(confirmId); toast.success("Supprimée"); } setConfirmId(null); }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
