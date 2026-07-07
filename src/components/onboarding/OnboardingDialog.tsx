import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/lib/finance/store";
import { CURRENCIES } from "@/lib/finance/types";
import { Wallet, Sparkles } from "lucide-react";

export function OnboardingDialog() {
  const { settings, completeOnboarding, currentWorkspace } = useFinance();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Personnel");
  const [currency, setCurrency] = useState("GNF");

  useEffect(() => {
    if (!settings.onboarded) {
      setName(currentWorkspace.name || "Personnel");
      setCurrency(currentWorkspace.currency || "GNF");
      setOpen(true);
    }
  }, [settings.onboarded]);

  const finish = () => {
    completeOnboarding({ workspaceName: name, currency });
    setOpen(false);
    setStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-2">
            <Wallet className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogTitle className="font-display text-2xl text-center">
            {step === 0 ? "Bienvenue dans FinancePilote" : "Choisissez votre devise"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 0
              ? "Configurons votre espace principal en quelques secondes."
              : "Toutes les opérations seront affichées dans cette devise. Modifiable plus tard."}
          </DialogDescription>
        </DialogHeader>

        {step === 0 ? (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nom de votre espace personnel</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Personnel, Mon entreprise..."
                autoFocus
                maxLength={40}
              />
              <p className="text-xs text-muted-foreground">
                Vous pourrez créer d'autres espaces (entreprises, projets) à tout moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
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
            <div className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>L'application fonctionne entièrement <strong>hors ligne</strong>. Vos données restent sur votre appareil.</span>
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          {step === 1 ? (
            <Button variant="ghost" onClick={() => setStep(0)}>Retour</Button>
          ) : <span />}
          {step === 0 ? (
            <Button
              className="gradient-primary text-primary-foreground hover:opacity-90"
              onClick={() => setStep(1)}
              disabled={!name.trim()}
            >
              Continuer
            </Button>
          ) : (
            <Button className="gradient-primary text-primary-foreground hover:opacity-90" onClick={finish}>
              Commencer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
