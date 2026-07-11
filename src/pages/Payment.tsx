import { useEffect, useMemo, useState } from "react";
import { Smartphone, ShieldCheck, Check, Sparkles, Loader2, BadgeCheck, LockKeyhole, WifiOff, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription, activateSubscription } from "@/hooks/useSubscription";
import { BackButton } from "@/components/layout/BackButton";

const PRICE_GNF = 30000;
const MERCHANT_PHONE_DISPLAY = "627 76 44 43";
const MERCHANT_PHONE_TEL = "+224627764443";

function formatGNF(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " GNF";
}

export default function Payment() {
  const { toast } = useToast();
  const { active, expiresAt } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Handle return from Lengo Pay (if user lands directly on /paiement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("paiement");
    if (status === "succes") {
      activateSubscription();
      toast({ title: "Paiement confirmé", description: "Votre abonnement est actif pour 1 heure." });
      const url = new URL(window.location.href);
      url.searchParams.delete("paiement");
      window.history.replaceState({}, "", url.toString());
    } else if (status === "echec") {
      toast({ title: "Paiement échoué", description: "La transaction n'a pas abouti.", variant: "destructive" });
    }
  }, [toast]);

  const priceLabel = useMemo(() => formatGNF(PRICE_GNF), []);

  const handlePay = async () => {
    if (!online) {
      toast({ title: "Hors ligne", description: "Connexion internet requise pour payer.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.functions.invoke("lengopay-initiate", {
        body: {
          amount: PRICE_GNF,
          currency: "GNF",
          country: "GN",
          return_url: `${origin}/?paiement=succes`,
          callback_url: `${origin}/?paiement=callback`,
          failure_url: `${origin}/?paiement=echec`,
        },
      });

      if (error) throw error;

      const paymentUrl: string | undefined =
        (data as any)?.payment_url || (data as any)?.url || (data as any)?.data?.payment_url;

      if (!paymentUrl) {
        console.error("Réponse Lengo Pay sans URL", data);
        throw new Error("URL de paiement introuvable");
      }

      toast({ title: "Redirection en cours", description: "Ouverture de la page de paiement…" });

      const popup = window.open(paymentUrl, "_blank", "noopener,noreferrer");
      if (!popup) {
        try {
          if (window.top) window.top.location.href = paymentUrl;
          else window.location.href = paymentUrl;
        } catch {
          window.location.href = paymentUrl;
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erreur",
        description: err?.message || "Impossible d'initier le paiement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <BackButton />

      {active && (
        <Card className="p-4 rounded-2xl border-success/40 bg-success/10 flex items-center gap-3">
          <BadgeCheck className="h-6 w-6 text-success" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">Abonnement actif</p>
            <p className="text-xs text-muted-foreground">
              Valable jusqu'au {expiresAt ? new Date(expiresAt).toLocaleDateString("fr-FR") : "—"}
            </p>
          </div>
        </Card>
      )}

      <Card className="p-6 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Offre annuelle</span>
        </div>
        <h1 className="font-display text-3xl font-bold">Accès Premium FinancePilote</h1>
        <p className="text-muted-foreground text-sm">
          Débloquez toutes les fonctionnalités pendant 1 an complet.
        </p>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-primary">{priceLabel}</span>
          <span className="text-sm text-muted-foreground">/ 1 heure</span>
        </div>

        <ul className="space-y-2 text-sm">
          {[
            "Nombre illimité d'espaces",
            "Transferts entre caisses",
            "Rapports PDF avec logo personnalisé",
            "Sauvegarde et mode hors ligne",
            "Support prioritaire",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {!online && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <WifiOff className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Aucune connexion internet</p>
              <p className="text-xs opacity-80 mt-0.5">
                Le paiement en ligne nécessite une connexion active. Rétablissez votre réseau (Wi-Fi ou données mobiles) puis réessayez. Le bouton reste désactivé tant que vous êtes hors ligne.
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={handlePay}
          disabled={loading || !online}
          className="w-full h-14 rounded-2xl text-base font-bold shadow-lg"
          style={{ backgroundColor: "#FF7900", color: "#000" }}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Initialisation…
            </>
          ) : (
            <>
              <Smartphone className="h-5 w-5 mr-2" />
              Payer {priceLabel} via Orange Money
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Paiement sécurisé</span>
          <span className="flex items-center gap-1"><LockKeyhole className="h-3.5 w-3.5" /> Lengo Pay</span>
        </div>
      </Card>

      <Card className="p-5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Activation par téléphone</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Vous préférez payer manuellement ? Envoyez {priceLabel} au numéro marchand puis appelez-nous pour l'activation.
        </p>
        <div className="rounded-xl bg-muted p-3 text-center">
          <p className="text-xs text-muted-foreground">Numéro marchand Orange Money</p>
          <p className="font-display text-2xl font-bold tracking-wider">{MERCHANT_PHONE_DISPLAY}</p>
        </div>
        <Button asChild variant="outline" className="w-full rounded-xl">
          <a href={`tel:${MERCHANT_PHONE_TEL}`}>
            <Phone className="h-4 w-4 mr-2" />
            Appeler maintenant
          </a>
        </Button>
      </Card>
    </div>
  );
}
