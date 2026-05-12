import { NavLink } from "react-router-dom";
import { LayoutDashboard, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Accueil", icon: LayoutDashboard },
  { to: "/revenus", label: "Revenus", icon: TrendingUp },
  { to: "/depenses", label: "Dépenses", icon: TrendingDown },
  { to: "/analyse", label: "Analyse", icon: BarChart3 },
];

export function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    isActive ? "gradient-primary shadow-glow" : ""
                  )}>
                    <Icon className={cn("h-[18px] w-[18px]", isActive && "text-primary-foreground")} />
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
