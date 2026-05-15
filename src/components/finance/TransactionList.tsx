import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Search, Filter } from "lucide-react";
import { Transaction, TxType } from "@/lib/finance/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/lib/finance/store";
import { TransactionDialog } from "./TransactionDialog";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Props { type: TxType }

export function TransactionList({ type }: Props) {
  const { transactions, remove, formatMoney, allCategories } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const isExpense = type === "expense";
  const categories = allCategories(type);

  const list = useMemo(() => {
    return transactions
      .filter((t) => t.type === type)
      .filter((t) => categoryFilter === "all" || t.category === categoryFilter)
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [t.description, t.category].some((v) => v?.toLowerCase().includes(q));
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, type, search, categoryFilter]);

  const total = list.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {isExpense ? "Dépenses" : "Revenus"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {list.length} entrée{list.length > 1 ? "s" : ""} • {formatMoney(total)}
          </p>
        </div>
        <Button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="gradient-primary text-primary-foreground hover:opacity-90 shadow-glow rounded-full h-11 px-4"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 rounded-full" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px] rounded-full">
            <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-12">Aucune transaction</TableCell></TableRow>
              )}
              {list.map((t) => (
                <TableRow key={t.id} className="hover:bg-secondary/30">
                  <TableCell className="text-xs font-medium whitespace-nowrap">
                    {format(new Date(t.date), "dd MMM", { locale: fr })}
                  </TableCell>
                  <TableCell className="max-w-0">
                    <p className="truncate text-sm font-medium">{t.description}</p>
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
