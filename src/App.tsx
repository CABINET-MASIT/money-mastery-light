import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Revenues from "./pages/Revenues";
import Expenses from "./pages/Expenses";
import Synthesis from "./pages/Synthesis";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound.tsx";
import Payment from "./pages/Payment";
import { FinanceProvider } from "./lib/finance/store";
import { PremiumGuard } from "./components/subscription/PremiumGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FinanceProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/paiement" element={<Payment />} />
              <Route path="/parametres" element={<Settings />} />
              <Route element={<PremiumGuard />}>
                <Route path="/tableau-de-bord" element={<Dashboard />} />
                <Route path="/revenus" element={<Revenues />} />
                <Route path="/depenses" element={<Expenses />} />
                <Route path="/synthese/revenus" element={<Synthesis type="revenue" />} />
                <Route path="/synthese/depenses" element={<Synthesis type="expense" />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
