import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Search, Tags } from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
import { Transaction, TxType } from "@/lib/finance/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinance } from "@/lib/finance/store";
import { TransactionDialog } from "./TransactionDialog";
import { formatGNF } from "@/lib/finance/format";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Props { type: TxType }

export function TransactionList({ type }: Props) {
  const { transactions, remove } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);

  const isExpense = type === "expense";
  const list = useMemo(() => {
    return transactions
      .filter((t) => t.type === type)
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [t.description, t.category, t.paymentMethod, t.reference, t.supplier]
          .some((v) => v?.toLowerCase().includes(q));
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, type, search]);

  const total = list.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            {isExpense ? "Dépenses" : "Revenus"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {list.length} transaction{list.length > 1 ? "s" : ""} • Total {formatGNF(total)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCatOpen(true)}>
            <Tags className="h-4 w-4 mr-2" />
            Catégories
          </Button>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            {isExpense ? "Nouvelle dépense" : "Nouveau revenu"}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Rechercher par description, catégorie, fournisseur..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="hidden md:table-cell">{isExpense ? "Fournisseur" : "Référence"}</TableHead>
                <TableHead className="hidden md:table-cell">Paiement</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="w-[90px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">Aucune transaction</TableCell></TableRow>
              )}
              {list.map((t) => (
                <TableRow key={t.id} className="hover:bg-secondary/30">
                  <TableCell className="font-medium text-sm">{format(new Date(t.date), "dd MMM yyyy", { locale: fr })}</TableCell>
                  <TableCell className="max-w-[280px] truncate">{t.description}</TableCell>
                  <TableCell><Badge variant="secondary" className="font-normal">{t.category}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{(isExpense ? t.supplier : t.reference) || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{t.paymentMethod || "—"}</TableCell>
                  <TableCell className={`text-right font-semibold ${isExpense ? "text-destructive" : "text-success"}`}>
                    {isExpense ? "-" : "+"}{formatGNF(t.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(t); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmId(t.id)}>
                        <Trash2 className="h-4 w-4" />
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
      <CategoryDialog open={catOpen} onOpenChange={setCatOpen} defaultType={type} />

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la transaction ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive et ne peut pas être annulée.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (confirmId) { remove(confirmId); toast.success("Transaction supprimée"); } setConfirmId(null); }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
