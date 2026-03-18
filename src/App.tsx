import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import MapPage from "./pages/MapPage";
import ListPage from "./pages/ListPage";
import SchoolDetails from "./pages/SchoolDetails";
import ColaborePage from "./pages/ColaborePage";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppInner = () => {
  useRealtimeUpdates({ showToasts: false });

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/lista" element={<ListPage />} />
          <Route path="/escola/:id" element={<SchoolDetails />} />
          <Route path="/colabore" element={<ColaborePage />} />
          <Route path="/admin-acesso" element={<AdminLogin />} />
          <Route path="/painel-administrativo" element={<AdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
};

export default App;
