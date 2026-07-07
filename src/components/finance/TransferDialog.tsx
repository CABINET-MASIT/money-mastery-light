import { useMemo, useState } from "react";
import { useFinance } from "@/lib/finance/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function TransferDialog({ open, onOpenChange }: Props) {
  const { workspaces, currentWorkspace, transfer, formatMoney } = useFinance();
  const [fromId, setFromId] = useState(currentWorkspace.id);
  const [toId, setToId] = useState(workspaces.find((w) => w.id !== currentWorkspace.id)?.id ?? "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const canSubmit = useMemo(
    () => fromId && toId && fromId !== toId && Number(amount) > 0 && date,
    [fromId, toId, amount, date],
  );

  const submit = () => {
    try {
      transfer({
        fromWorkspaceId: fromId,
        toWorkspaceId: toId,
        amount: Number(amount),
        date,
        description,
      });
      toast.success(`Transfert de ${formatMoney(Number(amount))} enregistré`);
      setAmount("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transfert impossible");
    }
  };

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  if (workspaces.length < 2) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Transfert impossible</DialogTitle>
            <DialogDescription>
              Créez au moins 2 espaces (Personnel, Projet, Entreprise…) pour effectuer un transfert.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-1">
            <ArrowRightLeft className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="font-display text-xl text-center">Transfert entre espaces</DialogTitle>
          <DialogDescription className="text-center">
            Créé automatiquement une dépense côté source et un revenu côté destination.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs">De</Label>
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id} disabled={w.id === toId}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={swap} className="mb-0.5" aria-label="Inverser">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="space-y-1.5">
            <Label className="text-xs">Vers</Label>
            <Select value={toId} onValueChange={setToId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id} disabled={w.id === fromId}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Montant</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Libellé (optionnel)</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Motif du transfert…"
            maxLength={80}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            onClick={submit}
            disabled={!canSubmit}
            className="gradient-primary text-primary-foreground hover:opacity-90"
          >
            Transférer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
