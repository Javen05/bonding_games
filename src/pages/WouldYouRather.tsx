import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

const questions = [
  { a: "Have unlimited IPPT gold forever", b: "Never need to do guard duty again" },
  { a: "Be stuck in field camp for a month", b: "Do SOC every day for 3 months" },
  { a: "Have the best bunk but worst section mates", b: "Worst bunk but best section mates" },
  { a: "Always be IC for area cleaning", b: "Always be the one doing prowling" },
  { a: "Eat cookhouse food for every meal for life", b: "Never eat chicken rice again" },
  { a: "Be posted to Tekong forever", b: "Be posted to the most ulu camp in Singapore" },
  { a: "Have your sergeant read your texts", b: "Have your CO see your TikTok" },
  { a: "Do BMT all over again", b: "Extend your NS by 6 months" },
  { a: "Run 2.4km every morning", b: "Do 100 push-ups every night" },
  { a: "Be the fittest but most blur soldier", b: "Be the smartest but always fall out" },
  { a: "Have book out every day but only for 2 hours", b: "Book out once a week but for the whole weekend" },
  { a: "Lose your 11B", b: "Lose your admin pass" },
  { a: "Have your encik as your father-in-law", b: "Have your OC as your landlord" },
  { a: "Always kena extra duty", b: "Always kena tekan during PT" },
  { a: "Be the only NSF in a regular unit", b: "Be in a unit with only NSFs but no air-con" },
  { a: "Carry the GPMG for every outfield", b: "Be the signaller with the heavy radio set" },
];

const WouldYouRather = () => {
  const navigate = useNavigate();
  const [shuffled] = useState(() => [...questions].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<"a" | "b" | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const question = shuffled[currentIndex];

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % shuffled.length);
    setSelected(null);
    setAnimKey((k) => k + 1);
  }, [shuffled.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Would You Rather</h1>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{currentIndex + 1}/{shuffled.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div key={animKey} className="w-full max-w-sm" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-game-wyr/15 text-game-wyr flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7" />
            </div>
            <p className="text-muted-foreground text-sm font-mono">Would you rather...</p>
          </div>

          <div className="grid gap-4 mb-8">
            <button
              onClick={() => setSelected("a")}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.97] ${
                selected === "a"
                  ? "border-game-wyr bg-game-wyr/10 shadow-lg shadow-game-wyr/10"
                  : selected === "b"
                  ? "border-border opacity-50"
                  : "border-border hover:border-game-wyr/40 hover:bg-card"
              }`}
            >
              <span className="text-xs font-mono text-game-wyr mb-2 block">OPTION A</span>
              <span className="font-display font-bold text-lg leading-snug">{question.a}</span>
            </button>

            <div className="text-center text-muted-foreground text-xs font-mono">— OR —</div>

            <button
              onClick={() => setSelected("b")}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.97] ${
                selected === "b"
                  ? "border-game-wyr bg-game-wyr/10 shadow-lg shadow-game-wyr/10"
                  : selected === "a"
                  ? "border-border opacity-50"
                  : "border-border hover:border-game-wyr/40 hover:bg-card"
              }`}
            >
              <span className="text-xs font-mono text-game-wyr mb-2 block">OPTION B</span>
              <span className="font-display font-bold text-lg leading-snug">{question.b}</span>
            </button>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={next} className="bg-game-wyr/15 text-game-wyr hover:bg-game-wyr/25 border border-game-wyr/20">
              <SkipForward className="w-5 h-5" /> Next Question
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WouldYouRather;
