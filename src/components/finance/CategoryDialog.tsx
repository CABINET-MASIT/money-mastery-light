import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TxType, REVENUE_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/finance/types";
import { useFinance } from "@/lib/finance/store";
import { toast } from "sonner";
import { Plus, X, Lock } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultType?: TxType;
  onCreated?: (type: TxType, name: string) => void;
}

export function CategoryDialog({ open, onOpenChange, defaultType = "revenue", onCreated }: Props) {
  const { customCategories, addCategory, removeCategory } = useFinance();
  const [tab, setTab] = useState<TxType>(defaultType);
  const [name, setName] = useState("");

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Saisissez un nom de catégorie");
      return;
    }
    if (trimmed.length > 40) {
      toast.error("40 caractères maximum");
      return;
    }
    const ok = addCategory(tab, trimmed);
    if (!ok) {
      toast.error("Cette catégorie existe déjà");
      return;
    }
    toast.success("Catégorie ajoutée");
    onCreated?.(tab, trimmed);
    setName("");
  };

  const renderList = (type: TxType) => {
    const base = type === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;
    const custom = customCategories[type];
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={`Nouvelle catégorie de ${type === "revenue" ? "revenu" : "dépense"}`}
            value={tab === type ? name : ""}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            maxLength={40}
          />
          <Button onClick={handleAdd} className="gradient-primary text-primary-foreground hover:opacity-90 shrink-0">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Catégories par défaut</Label>
          <div className="flex flex-wrap gap-2">
            {base.map((c) => (
              <Badge key={c} variant="secondary" className="gap-1.5 py-1.5">
                <Lock className="h-3 w-3 opacity-50" />
                {c}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Catégories personnalisées ({custom.length})
          </Label>
          {custom.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Aucune catégorie personnalisée pour l'instant.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {custom.map((c) => (
                <Badge key={c} className="gap-1.5 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                  {c}
                  <button
                    type="button"
                    onClick={() => { removeCategory(type, c); toast.success("Catégorie supprimée"); }}
                    className="rounded-full hover:bg-primary/20 p-0.5"
                    aria-label={`Supprimer ${c}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setName(""); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Gérer les catégories</DialogTitle>
          <DialogDescription>
            Ajoutez vos propres catégories de revenus et dépenses.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as TxType); setName(""); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="revenue">Revenus</TabsTrigger>
            <TabsTrigger value="expense">Dépenses</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="mt-4">{renderList("revenue")}</TabsContent>
          <TabsContent value="expense" className="mt-4">{renderList("expense")}</TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
