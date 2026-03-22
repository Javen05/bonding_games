import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

const statements = [
  "Never have I ever faked an MC",
  "Never have I ever fallen asleep during guard duty",
  "Never have I ever eaten someone else's snacks without asking",
  "Never have I ever pretended not to hear the fall-in",
  "Never have I ever hidden in the toilet to avoid work",
  "Never have I ever cried on the phone to my parents during BMT",
  "Never have I ever dropped my rifle",
  "Never have I ever used someone else's admin time to lepak",
  "Never have I ever lied about my 2.4km timing",
  "Never have I ever texted during a lecture",
  "Never have I ever complained about the food then went for seconds",
  "Never have I ever pretended to know how to navigate with a compass",
  "Never have I ever smuggled food into the bunk",
  "Never have I ever accidentally called my sergeant 'Sir'",
  "Never have I ever been caught using my phone during training",
  "Never have I ever purposely walked slower during route march",
  "Never have I ever secretly enjoyed field camp",
  "Never have I ever missed your stop on the bus back to camp",
  "Never have I ever used the 'stomach pain' excuse",
  "Never have I ever thought about signing on",
  "Never have I ever had a crush on someone in camp",
  "Never have I ever stolen toilet paper from the admin office",
  "Never have I ever pretended to understand a briefing",
  "Never have I ever been the last one to fall in",
  "Never have I ever woken up already in uniform",
];

const NeverHaveIEver = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled] = useState(() => [...statements].sort(() => Math.random() - 0.5));
  const [animKey, setAnimKey] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % shuffled.length);
    setAnimKey((k) => k + 1);
  }, [shuffled.length]);

  const statement = shuffled[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Never Have I Ever</h1>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{currentIndex + 1}/{shuffled.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div key={animKey} className="text-center max-w-sm" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="w-16 h-16 rounded-2xl bg-game-never/15 text-game-never flex items-center justify-center mx-auto mb-8">
            <MessageCircle className="w-8 h-8" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-4">
            {statement}
          </p>
          <p className="text-muted-foreground text-sm mb-10">
            If you've done it — put a finger down 🖐️
          </p>
          <Button size="xl" onClick={next} className="bg-game-never/15 text-game-never hover:bg-game-never/25 border border-game-never/20">
            <SkipForward className="w-5 h-5" /> Next Statement
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NeverHaveIEver;
