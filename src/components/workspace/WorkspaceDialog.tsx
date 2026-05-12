import { useState } from "react";
import { useFinance } from "@/lib/finance/store";
import { Workspace, WorkspaceKind, CURRENCIES } from "@/lib/finance/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, User, FolderKanban, Trash2, Pencil, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const KINDS: { value: WorkspaceKind; label: string; icon: typeof Briefcase }[] = [
  { value: "personal", label: "Personnel", icon: User },
  { value: "business", label: "Entreprise", icon: Briefcase },
  { value: "project", label: "Projet", icon: FolderKanban },
];

export function WorkspaceDialog({ open, onOpenChange }: Props) {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, updateWorkspace, removeWorkspace } = useFinance();
  const [editing, setEditing] = useState<Workspace | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<WorkspaceKind>("business");
  const [currency, setCurrency] = useState("GNF");
  const [confirmDelId, setConfirmDelId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null); setName(""); setKind("business"); setCurrency(currentWorkspace.currency); setShowForm(true);
  };
  const openEdit = (w: Workspace) => {
    setEditing(w); setName(w.name); setKind(w.kind); setCurrency(w.currency); setShowForm(true);
  };
  const submit = () => {
    if (!name.trim()) { toast.error("Saisissez un nom"); return; }
    if (editing) {
      updateWorkspace(editing.id, { name: name.trim(), kind, currency });
      toast.success("Espace modifié");
    } else {
      createWorkspace({ name: name.trim(), kind, currency });
      toast.success("Espace créé");
    }
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    removeWorkspace(id);
    toast.success("Espace supprimé");
    setConfirmDelId(null);
  };

  const KindIcon = (k: WorkspaceKind) => KINDS.find((x) => x.value === k)?.icon ?? Briefcase;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Mes espaces</DialogTitle>
            <DialogDescription>
              Gérez vos espaces personnels, entreprises et projets séparément.
            </DialogDescription>
          </DialogHeader>

          {!showForm ? (
            <div className="space-y-2 max-h-[55vh] overflow-y-auto -mx-1 px-1">
              {workspaces.map((w) => {
                const Icon = KindIcon(w.kind);
                const active = w.id === currentWorkspace.id;
                return (
                  <div
                    key={w.id}
                    className={cn(
                      "rounded-xl border p-3 flex items-center gap-3 transition-colors",
                      active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => { switchWorkspace(w.id); toast.success(`Espace : ${w.name}`); }}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                        active ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{w.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {KINDS.find((k) => k.value === w.kind)?.label} · {w.currency}
                        </p>
                      </div>
                      {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(w)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {workspaces.length > 1 && (
                      <Button
                        size="icon" variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setConfirmDelId(w.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}

              <Button onClick={openNew} variant="outline" className="w-full mt-2 border-dashed h-12">
                <Plus className="h-4 w-4 mr-2" /> Nouvel espace
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nom *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="SARL Diallo, Boutique centre..." autoFocus maxLength={40} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {KINDS.map((k) => {
                    const Icon = k.icon;
                    return (
                      <button
                        key={k.value}
                        type="button"
                        onClick={() => setKind(k.value)}
                        className={cn(
                          "rounded-xl border p-3 flex flex-col items-center gap-1.5 text-xs font-medium transition-colors",
                          kind === k.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary/40"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {k.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Devise</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="font-mono mr-2">{c.code}</span> — {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            {showForm ? (
              <>
                <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button onClick={submit} className="gradient-primary text-primary-foreground hover:opacity-90">
                  {editing ? "Enregistrer" : "Créer"}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelId} onOpenChange={(o) => !o && setConfirmDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet espace ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes les transactions et catégories de cet espace seront supprimées définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelId && handleRemove(confirmDelId)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
