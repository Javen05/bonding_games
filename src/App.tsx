import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import TruthOrDare from "./pages/TruthOrDare.tsx";
import NeverHaveIEver from "./pages/NeverHaveIEver.tsx";
import WouldYouRather from "./pages/WouldYouRather.tsx";
import HotSeat from "./pages/HotSeat.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/truth-or-dare" element={<TruthOrDare />} />
          <Route path="/never-have-i-ever" element={<NeverHaveIEver />} />
          <Route path="/would-you-rather" element={<WouldYouRather />} />
          <Route path="/hot-seat" element={<HotSeat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
