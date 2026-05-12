import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout() {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          <header
            className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-3 md:px-6"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            {!isMobile && (
              <>
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <div className="h-5 w-px bg-border" />
              </>
            )}
            <WorkspaceSwitcher />
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Hors ligne</span>
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 animate-fade-in">
            <Outlet />
          </main>
          {isMobile && <MobileNav />}
        </div>
        <OnboardingDialog />
      </div>
    </SidebarProvider>
  );
}
