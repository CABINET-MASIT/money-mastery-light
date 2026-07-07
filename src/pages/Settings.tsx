import { useRef, useState } from "react";
import { useFinance } from "@/lib/finance/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CURRENCIES, REVENUE_CATEGORIES, EXPENSE_CATEGORIES, TxType } from "@/lib/finance/types";
import { Plus, X, Lock, Coins, Tags, Download, Upload, Database, Image as ImageIcon, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import defaultLogo from "@/assets/cmasit-logo.jpg";
import { BackButton } from "@/components/layout/BackButton";

export default function Settings() {
  const { customCategories, addCategory, removeCategory, currentWorkspace, updateWorkspace, exportData, importData, resetAll } = useFinance();
  const [tab, setTab] = useState<TxType>("revenue");
  const [name, setName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ data: unknown; fileName: string } | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [confirmReset, setConfirmReset] = useState(false);

  const currentLogo = currentWorkspace.logo || defaultLogo;

  const handleLogoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Fichier image requis"); return; }
    if (file.size > 800_000) { toast.error("Image trop lourde (max 800 Ko)"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      updateWorkspace(currentWorkspace.id, { logo: String(reader.result) });
      toast.success("Logo mis à jour");
    };
    reader.onerror = () => toast.error("Lecture impossible");
    reader.readAsDataURL(file);
  };

  const resetLogo = () => {
    updateWorkspace(currentWorkspace.id, { logo: undefined });
    toast.success("Logo par défaut restauré");
  };


  const handleExport = () => {
    try {
      const payload = exportData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `financepilote-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Sauvegarde exportée");
    } catch {
      toast.error("Échec de l'export");
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        setPending({ data, fileName: file.name });
      } catch {
        toast.error("Fichier JSON invalide");
      }
    };
    reader.onerror = () => toast.error("Impossible de lire le fichier");
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!pending) return;
    try {
      const res = importData(pending.data, importMode);
      toast.success(
        importMode === "replace"
          ? "Données restaurées"
          : `Import terminé : +${res.transactions} transactions, +${res.workspaces} espaces`
      );
      setPending(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import impossible");
    }
  };

  const handleAdd = () => {
    const t = name.trim();
    if (!t) return toast.error("Saisissez un nom");
    if (!addCategory(tab, t)) return toast.error("Catégorie déjà existante");
    toast.success("Catégorie ajoutée");
    setName("");
  };

  const renderCats = (type: TxType) => {
    const base = type === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;
    const custom = customCategories[type];
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nouvelle catégorie..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            maxLength={40}
          />
          <Button onClick={handleAdd} className="gradient-primary text-primary-foreground hover:opacity-90 shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Par défaut</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {base.map((c) => (
              <Badge key={c} variant="secondary" className="gap-1.5 py-1.5 font-normal">
                <Lock className="h-3 w-3 opacity-50" /> {c}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Personnalisées ({custom.length})</Label>
          {custom.length === 0 ? (
            <p className="text-sm text-muted-foreground italic mt-2">Aucune pour le moment.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {custom.map((c) => (
                <Badge key={c} className="gap-1.5 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-normal">
                  {c}
                  <button
                    type="button"
                    onClick={() => { removeCategory(type, c); toast.success("Supprimée"); }}
                    className="rounded-full hover:bg-primary/20 p-0.5"
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
    <div className="space-y-5 max-w-[800px] mx-auto">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Paramètres</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mt-1">Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">Catégories et devise pour <strong>{currentWorkspace.name}</strong></p>
      </header>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2 text-lg">
            <Coins className="h-5 w-5 text-primary" /> Devise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Devise active</Label>
          <Select
            value={currentWorkspace.currency}
            onValueChange={(v) => { updateWorkspace(currentWorkspace.id, { currency: v }); toast.success("Devise mise à jour"); }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="font-mono mr-2">{c.code}</span> — {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">S'applique à cet espace uniquement.</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2 text-lg">
            <Tags className="h-5 w-5 text-primary" /> Catégories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => { setTab(v as TxType); setName(""); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="revenue">Revenus</TabsTrigger>
              <TabsTrigger value="expense">Dépenses</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue" className="mt-4">{renderCats("revenue")}</TabsContent>
            <TabsContent value="expense" className="mt-4">{renderCats("expense")}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" /> Sauvegarde & Restauration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Exportez toutes vos données (espaces, transactions, catégories, devises) dans un fichier JSON conservable hors ligne, puis restaurez-le à tout moment sur n'importe quel appareil.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleExport} className="gradient-primary text-primary-foreground hover:opacity-90">
              <Download className="h-4 w-4 mr-1.5" /> Exporter
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1.5" /> Importer
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFilePick}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importer la sauvegarde ?</AlertDialogTitle>
            <AlertDialogDescription>
              Fichier : <strong>{pending?.fileName}</strong>. Choisissez comment appliquer les données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setImportMode("merge")}
              className={`w-full text-left rounded-xl border p-3 transition ${importMode === "merge" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <p className="text-sm font-semibold">Fusionner</p>
              <p className="text-xs text-muted-foreground">Ajoute uniquement les éléments manquants. Vos données actuelles sont conservées.</p>
            </button>
            <button
              type="button"
              onClick={() => setImportMode("replace")}
              className={`w-full text-left rounded-xl border p-3 transition ${importMode === "replace" ? "border-destructive bg-destructive/5" : "border-border"}`}
            >
              <p className="text-sm font-semibold text-destructive">Remplacer</p>
              <p className="text-xs text-muted-foreground">Efface toutes les données locales et les remplace par celles du fichier.</p>
            </button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmImport}
              className={importMode === "replace" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "gradient-primary text-primary-foreground"}
            >
              {importMode === "replace" ? "Tout remplacer" : "Fusionner"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
