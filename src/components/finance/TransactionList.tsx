import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Search, FileDown } from "lucide-react";
import { Transaction, TxType } from "@/lib/finance/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/lib/finance/store";
import { TransactionDialog } from "./TransactionDialog";
import { cn } from "@/lib/utils";

import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props { type: TxType }
type PeriodMode = "today" | "month" | "custom" | "all";

export function TransactionList({ type }: Props) {
  const { transactions, remove, formatMoney, allCategories, currentWorkspace } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [period, setPeriod] = useState<PeriodMode>("today");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const isExpense = type === "expense";
  const categories = allCategories(type);

  const range = useMemo(() => {
    const now = new Date();
    if (period === "today") return { from: startOfDay(now), to: endOfDay(now), label: "Aujourd'hui" };
    if (period === "month") return { from: startOfMonth(now), to: endOfMonth(now), label: format(now, "MMMM yyyy", { locale: fr }) };
    if (period === "custom" && from && to) return { from: startOfDay(from), to: endOfDay(to), label: `${format(from, "dd/MM/yy")} → ${format(to, "dd/MM/yy")}` };
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

  const exportPdf = () => {
    if (list.length === 0) { toast.error("Aucune donnée à exporter"); return; }
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const title = isExpense ? "État des dépenses" : "État des revenus";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 40, 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(`Espace : ${currentWorkspace.name}`, 40, 64);
    doc.text(`Période : ${range.label}`, 40, 78);
    if (categoryFilter !== "all") doc.text(`Catégorie : ${categoryFilter}`, 40, 92);
    doc.text(`Édité le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}`, 40, categoryFilter !== "all" ? 106 : 92);

    autoTable(doc, {
      startY: categoryFilter !== "all" ? 122 : 108,
      head: [["Date", "Désignation", "Catégorie", "Montant"]],
      body: list.map((t) => [
        format(parseISO(t.date), "dd/MM/yyyy"),
        t.description || "-",
        t.category,
        `${isExpense ? "-" : "+"}${formatMoney(t.amount)}`,
      ]),
      foot: [["", "", "TOTAL", `${isExpense ? "-" : "+"}${formatMoney(total)}`]],
      styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: isExpense ? [220, 38, 38] : [16, 185, 129], textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: [245, 245, 250], textColor: 20, fontStyle: "bold" },
      columnStyles: { 3: { halign: "right" }, 0: { cellWidth: 70 } },
      alternateRowStyles: { fillColor: [250, 250, 253] },
    });

    const stamp = format(new Date(), "yyyy-MM-dd_HHmm");
    doc.save(`${isExpense ? "depenses" : "revenus"}-${currentWorkspace.name}-${stamp}.pdf`);
    toast.success("PDF généré");
  };

  return (
    <div className="space-y-3 max-w-[900px] mx-auto pb-6">
      {/* Sticky header + filters */}
      <div className="sticky top-0 z-20 -mx-4 px-4 pt-2 pb-3 bg-background/95 backdrop-blur border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold tracking-tight truncate">
              {isExpense ? "Dépenses" : "Revenus"}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {range.label} • {list.length} entrée{list.length > 1 ? "s" : ""} • <span className={cn("font-semibold", isExpense ? "text-destructive" : "text-success")}>{isExpense ? "-" : "+"}{formatMoney(total)}</span>
            </p>
          </div>
          <Button
            onClick={() => { setEditing(null); setOpen(true); }}
            size="icon"
            className="gradient-primary text-primary-foreground hover:opacity-90 shadow-glow rounded-full h-11 w-11 shrink-0"
            aria-label="Ajouter"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Period chips */}
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-0.5 scrollbar-none">
          {([
            { k: "today", l: "Aujourd'hui" },
            { k: "month", l: "Ce mois" },
            { k: "custom", l: "Période" },
            { k: "all", l: "Tout" },
          ] as { k: PeriodMode; l: string }[]).map((p) => (
            <button
              key={p.k}
              onClick={() => setPeriod(p.k)}
              className={cn(
                "shrink-0 rounded-full px-3 h-8 text-xs font-medium border transition",
                period === p.k
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {p.l}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 rounded-full justify-start text-xs font-normal">
                  {from ? format(from, "dd MMM yyyy", { locale: fr }) : "Du..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={from} onSelect={setFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 rounded-full justify-start text-xs font-normal">
                  {to ? format(to, "dd MMM yyyy", { locale: fr }) : "Au..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={to} onSelect={setTo} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Search + category + PDF */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9 rounded-full text-sm" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px] h-9 rounded-full text-xs">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={exportPdf}
            className="h-9 w-9 rounded-full shrink-0"
            aria-label="Exporter PDF"
            title="Exporter en PDF"
          >
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="w-[90px]">Date</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="w-[70px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-12 text-sm">Aucune transaction sur cette période</TableCell></TableRow>
              )}
              {list.map((t) => (
                <TableRow key={t.id} className="hover:bg-secondary/30">
                  <TableCell className="text-xs font-medium whitespace-nowrap">
                    {format(parseISO(t.date), "dd MMM", { locale: fr })}
                  </TableCell>
                  <TableCell className="max-w-0">
                    <p className="truncate text-sm font-medium">{t.description || "—"}</p>
                    <Badge variant="secondary" className="font-normal text-[10px] mt-1 h-5">{t.category}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold whitespace-nowrap text-sm ${isExpense ? "text-destructive" : "text-success"}`}>
                    {isExpense ? "-" : "+"}{formatMoney(t.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(t); setOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmId(t.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
