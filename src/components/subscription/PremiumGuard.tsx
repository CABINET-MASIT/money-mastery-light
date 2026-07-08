import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

export function PremiumGuard() {
  const { active, status } = useSubscription();
  const location = useLocation();

  useEffect(() => {
    if (!active) {
      toast.error(
        status === "expired"
          ? "Votre abonnement a expiré. Merci de le renouveler."
          : "Accès verrouillé. Activez votre abonnement pour continuer."
      );
    }
  }, [active, status]);

  if (!active) {
    return <Navigate to="/paiement" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
