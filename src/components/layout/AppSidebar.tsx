import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, TrendingUp, TrendingDown, PieChart, Settings, Wallet } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Tableau de bord", url: "/tableau-de-bord", icon: LayoutDashboard },
  { title: "Revenus", url: "/revenus", icon: TrendingUp },
  { title: "Dépenses", url: "/depenses", icon: TrendingDown },
  { title: "Synthèse revenus", url: "/synthese/revenus", icon: PieChart },
  { title: "Synthèse dépenses", url: "/synthese/depenses", icon: PieChart },
  { title: "Paramètres", url: "/parametres", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold text-sidebar-foreground">FinPilot</span>
              <span className="text-xs text-sidebar-foreground/60">Gestion financière</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-colors h-11 rounded-lg"
                  >
                    <NavLink to={item.url} end={item.url === "/"} className="flex items-center gap-3 px-3">
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent/60 p-3 text-xs text-sidebar-foreground/70">
            <p className="font-semibold text-sidebar-foreground">Astuce</p>
            <p className="mt-1">Utilisez les filtres avancés pour analyser une période précise.</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
