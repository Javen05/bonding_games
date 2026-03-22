import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import WordImposter from "./pages/WordImposter.tsx";
import TruthOrDare from "./pages/TruthOrDare.tsx";
import NeverHaveIEver from "./pages/NeverHaveIEver.tsx";
import WouldYouRather from "./pages/WouldYouRather.tsx";
import HotSeat from "./pages/HotSeat.tsx";
import Socials from "./pages/Socials.tsx";
import InfiniteTicTacToe from "./pages/InfiniteTicTacToe.tsx";
import Werewolf from "./pages/Werewolf.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/truth-or-dare" element={<TruthOrDare />} />
          <Route path="/never-have-i-ever" element={<NeverHaveIEver />} />
          <Route path="/would-you-rather" element={<WouldYouRather />} />
          <Route path="/hot-seat" element={<HotSeat />} />
          <Route path="/word-imposter" element={<WordImposter />} />
          <Route path="/infinite-tic-tac-toe" element={<InfiniteTicTacToe />} />
          <Route path="/werewolf" element={<Werewolf />} />
          <Route path="/socials" element={<Socials />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
