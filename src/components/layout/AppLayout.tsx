import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="h-5 w-px bg-border" />
            <h2 className="font-display font-semibold text-sm md:text-base">Espace entreprise</h2>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Devise :</span>
              <span className="rounded-md bg-secondary px-2 py-1 font-semibold">GNF</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
