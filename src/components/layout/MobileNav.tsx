import { NavLink } from "react-router-dom";
import { Home, TrendingUp, LayoutDashboard, TrendingDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/revenus", label: "Revenus", icon: TrendingUp },
  { to: "/tableau-de-bord", label: "Tableau", icon: LayoutDashboard },
  { to: "/depenses", label: "Dépenses", icon: TrendingDown },
  { to: "/parametres", label: "Réglages", icon: Settings },
];

export function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[13px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                    isActive ? "gradient-primary shadow-glow" : ""
                  )}>
                    <Icon className={cn("h-[20px] w-[20px]", isActive && "text-primary-foreground")} />

                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
