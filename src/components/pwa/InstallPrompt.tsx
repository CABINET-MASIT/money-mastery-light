import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Share, Plus, WifiOff, CheckCircle2, Loader2 } from "lucide-react";
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
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = () => /android/i.test(navigator.userAgent);

type Phase = "idle" | "caching" | "prompting" | "installed" | "manual";

export function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    setPlatform(isIos() ? "ios" : isAndroid() ? "android" : "other");

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setPhase("installed");
      setProgress(100);
      setStatus("Application installée !");
      localStorage.setItem(STORAGE_KEY, "1");
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    const t = setTimeout(() => setOpen(true), 600);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = (persist = true) => {
    if (persist) localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  async function warmCache() {
    setStatus("Préparation du mode hors ligne…");
    try {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.ready;
      }
    } catch {}

    // Build a resource list from what the page already loaded + core paths.
    const seen = new Set<string>();
    try {
      performance.getEntriesByType("resource").forEach((r: any) => {
        if (typeof r.name === "string" && r.name.startsWith(location.origin)) {
          seen.add(r.name);
        }
      });
    } catch {}
    ["/", "/manifest.webmanifest", "/favicon.png", "/icon-192.png", "/icon-512.png"].forEach((p) =>
      seen.add(location.origin + p)
    );

    const urls = Array.from(seen);
    const total = urls.length || 1;
    let done = 0;
    setProgress(1);

    await Promise.all(
      urls.map(async (url) => {
        try {
          await fetch(url, { cache: "reload" });
        } catch {}
        done++;
        setProgress(Math.max(1, Math.round((done / total) * 100)));
      })
    );

    setStatus("Ressources enregistrées pour un usage hors ligne.");
  }

  async function startInstall() {
    if (started.current) return;
    started.current = true;
    setPhase("caching");
    setProgress(0);

    await warmCache();

    if (deferred) {
      setPhase("prompting");
      setStatus("Confirmez l'installation dans la fenêtre du navigateur…");
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") {
          setPhase("installed");
          setStatus("Application installée avec succès !");
          setProgress(100);
        } else {
          setPhase("manual");
          setStatus("Installation annulée. Vous pouvez réessayer plus tard.");
          started.current = false;
        }
      } catch {
        setPhase("manual");
        started.current = false;
      }
      setDeferred(null);
    } else {
      // No native prompt available → cache is warmed, show manual steps.
      setPhase("manual");
      setStatus("Ressources prêtes. Ajoutez l'app à votre écran d'accueil :");
    }
  }

  const showProgress = phase === "caching" || phase === "prompting" || phase === "installed";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && phase !== "caching" && phase !== "prompting" && dismiss(false)}>
      <DialogContent className="max-w-sm" onInteractOutside={(e) => {
        if (phase === "caching" || phase === "prompting") e.preventDefault();
      }}>
        <DialogHeader>
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden ring-2 ring-primary/20 mb-2">
            <img src={logo} alt="CMASIT" className="h-full w-full object-contain p-1" />
          </div>
          <DialogTitle className="font-display text-xl text-center">
            {phase === "installed" ? "Installation terminée" : "Installer FinancePilote"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {phase === "installed"
              ? "L'application est prête et utilisable hors ligne."
              : "Nous allons télécharger les fichiers nécessaires et installer l'app sur votre appareil."}
          </DialogDescription>
        </DialogHeader>

        {phase === "idle" && (
          <div className="space-y-2 py-2">
            <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
              <WifiOff className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Fonctionne <strong>sans Internet</strong> après installation.</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
              <Download className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Vos données restent enregistrées sur votre appareil.</span>
            </div>
          </div>
        )}

        {showProgress && (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              {phase === "installed" ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              <span className="text-muted-foreground flex-1 truncate">{status}</span>
              <span className="font-mono text-xs font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {phase === "manual" && (
          <div className="space-y-2 py-2">
            <p className="text-xs text-muted-foreground">{status}</p>
            {platform === "ios" && (
              <div className="rounded-lg border border-border p-3 text-xs space-y-1.5">
                <p className="font-semibold text-foreground">iPhone / iPad (Safari)</p>
                <p className="flex items-center gap-1.5">1. Touchez <Share className="h-3.5 w-3.5 inline" /> Partager.</p>
                <p className="flex items-center gap-1.5">2. Puis <Plus className="h-3.5 w-3.5 inline" /> « Sur l'écran d'accueil ».</p>
              </div>
            )}
            {platform !== "ios" && (
              <div className="rounded-lg border border-border p-3 text-xs space-y-1.5">
                <p className="font-semibold text-foreground">Android (Chrome)</p>
                <p>1. Ouvrez le menu <span className="font-medium">⋮</span> en haut à droite.</p>
                <p>2. Touchez <span className="font-medium">« Installer l'application »</span>.</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          {phase === "installed" ? (
            <Button className="w-full gradient-primary text-primary-foreground" onClick={() => dismiss(true)}>
              Terminer
            </Button>
          ) : phase === "caching" || phase === "prompting" ? (
            <Button disabled className="w-full">
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Installation en cours…
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => dismiss(true)}>Plus tard</Button>
              <Button className="gradient-primary text-primary-foreground" onClick={startInstall}>
                <Download className="h-4 w-4 mr-1.5" />
                {phase === "manual" ? "Réessayer" : "Installer maintenant"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
