import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction, TxType, PAYMENT_METHODS } from "@/lib/finance/types";
import { DatePicker } from "./DatePicker";
import { useFinance } from "@/lib/finance/store";
import { toast } from "sonner";
import { CategoryDialog } from "./CategoryDialog";
import { Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  type: TxType;
  editing?: Transaction | null;
}

export function TransactionDialog({ open, onOpenChange, type, editing }: Props) {
  const { add, update, allCategories } = useFinance();
  const isExpense = type === "expense";
  const categories = allCategories(type);
  const [catOpen, setCatOpen] = useState(false);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [supplier, setSupplier] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setDate(new Date(editing.date));
        setAmount(String(editing.amount));
        setCategory(editing.category);
        setDescription(editing.description);
        setPaymentMethod(editing.paymentMethod ?? "");
        setReference(editing.reference ?? "");
        setSupplier(editing.supplier ?? "");
      } else {
        setDate(new Date()); setAmount(""); setCategory(""); setDescription("");
        setPaymentMethod(""); setReference(""); setSupplier("");
      }
    }
  }, [open, editing]);

  const submit = () => {
    const amt = parseFloat(amount.replace(/\s/g, "").replace(",", "."));
    if (!date || !amt || amt <= 0 || !category || !description.trim()) {
      toast.error("Merci de remplir tous les champs requis");
      return;
    }
    const payload = {
      type, date: date.toISOString().slice(0, 10),
      amount: amt, category, description: description.trim(),
      paymentMethod: paymentMethod || undefined,
      reference: reference.trim() || undefined,
      supplier: supplier.trim() || undefined,
    };
    if (editing) { update(editing.id, payload); toast.success("Transaction modifiée"); }
    else { add(payload); toast.success(isExpense ? "Dépense ajoutée" : "Revenu ajouté"); }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editing ? "Modifier" : "Ajouter"} {isExpense ? "une dépense" : "un revenu"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <DatePicker value={date} onChange={setDate} />
            </div>
            <div className="space-y-1.5">
              <Label>Montant (GNF) *</Label>
              <Input type="number" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Catégorie *</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary hover:text-primary" onClick={() => setCatOpen(true)}>
                <Plus className="h-3 w-3 mr-1" /> Nouvelle catégorie
              </Button>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Description / motif *</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails de la transaction..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {isExpense ? (
              <div className="space-y-1.5">
                <Label>Fournisseur</Label>
                <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Optionnel" />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Référence</Label>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ex: FAC-2026-001" />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} className="gradient-primary text-primary-foreground hover:opacity-90">
            {editing ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <CategoryDialog
        open={catOpen}
        onOpenChange={setCatOpen}
        defaultType={type}
        onCreated={(t, name) => { if (t === type) setCategory(name); }}
      />
    </Dialog>
  );
}
