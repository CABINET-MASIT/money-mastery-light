import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, Plus, WifiOff, Smartphone } from "lucide-react";
import logo from "@/assets/cmasit-logo.jpg";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "mymoney.install.dismissed";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-ignore iOS
    window.navigator.standalone === true
  );
}

function isIos() {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

function isAndroid() {
  return /android/i.test(window.navigator.userAgent);
}


export function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    if (isIos()) setPlatform("ios");
    else if (isAndroid()) setPlatform("android");

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setOpen(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // Show manual-instructions modal shortly after load if the native prompt
    // hasn't fired (iOS never fires it; Android may not on repeat visits).
    const t = setTimeout(() => setOpen(true), 1200);

    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onBIP);
    };
  }, []);

  const dismiss = (persist = true) => {
    if (persist) localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden ring-2 ring-primary/20 mb-2">
            <img src={logo} alt="CMASIT" className="h-full w-full object-contain p-1" />
          </div>
          <DialogTitle className="font-display text-xl text-center">
            Installer My Money
          </DialogTitle>
          <DialogDescription className="text-center">
            Ajoutez l'application à votre écran d'accueil pour l'utiliser <strong>hors ligne</strong> à tout moment. Vos données restent enregistrées sur votre appareil.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
            <WifiOff className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Fonctionne <strong>sans connexion Internet</strong>.</span>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
            <Smartphone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Lancement rapide depuis l'écran d'accueil, comme une vraie app.</span>
          </div>

          {!deferred && platform === "ios" && (
            <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground">Sur iPhone / iPad (Safari) :</p>
              <p className="flex items-center gap-1.5">
                1. Touchez <Share className="h-3.5 w-3.5 inline" /> <span className="font-medium">Partager</span>.
              </p>
              <p className="flex items-center gap-1.5">
                2. Puis <Plus className="h-3.5 w-3.5 inline" /> <span className="font-medium">Sur l'écran d'accueil</span>.
              </p>
            </div>
          )}

          {!deferred && platform === "android" && (
            <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground">Sur Android (Chrome) :</p>
              <p>1. Ouvrez le menu <span className="font-medium">⋮</span> en haut à droite.</p>
              <p>2. Touchez <span className="font-medium">« Installer l'application »</span> ou <span className="font-medium">« Ajouter à l'écran d'accueil »</span>.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => dismiss(true)}>Plus tard</Button>
          {deferred ? (
            <Button className="gradient-primary text-primary-foreground" onClick={install}>
              <Download className="h-4 w-4 mr-1.5" /> Installer
            </Button>
          ) : (
            <Button className="gradient-primary text-primary-foreground" onClick={() => dismiss(true)}>
              J'ai compris
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
