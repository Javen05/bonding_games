import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Shield, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

const truths = [
  "What's the most embarrassing thing that happened to you during BMT?",
  "Who in this bunk do you think would survive the longest in a zombie apocalypse?",
  "What's the worst cookhouse meal you've ever had?",
  "Have you ever pretended to be sick to skip training?",
  "What's the most creative excuse you've given to your sergeant?",
  "Who do you secretly think is the fittest person in the section?",
  "What's something you miss most about civilian life?",
  "Have you ever cried during NS? When?",
  "What's the weirdest dream you've had in camp?",
  "If you could swap vocations with anyone, who would it be and why?",
  "What's the most illegal thing you've done in camp?",
  "Who would you trust to have your back in a combat situation?",
  "What's your guilty pleasure when you book out?",
  "Have you ever stolen food from the cookhouse?",
  "What's the first thing you do when you book out?",
  "Who in this bunk snores the loudest?",
  "What's the most you've ever slept during a lecture?",
  "Have you ever lied on your IPPT?",
  "What's a secret talent nobody here knows about?",
  "Who do you think will sign on?",
];

const dares = [
  "Do 20 push-ups right now",
  "Let someone send a message from your phone",
  "Speak in your sergeant's voice for the next 2 rounds",
  "Do your best impression of your OC",
  "Sing the SAF pledge dramatically",
  "Let the group choose your next WhatsApp profile picture",
  "Call someone and tell them you love them",
  "Do a plank for 30 seconds while everyone watches",
  "Eat something weird from someone else's snack stash",
  "Do your best recruit impression",
  "Wear your PT kit inside out for the next hour",
  "Let someone draw on your arm with a marker",
  "Talk in a whisper for the next 3 rounds",
  "Do 10 burpees right now",
  "Serenade the person to your left",
  "Let the group give you a new nickname for tonight",
  "Pretend to be a drill sergeant for 1 minute",
  "Do an army crawl across the bunk",
  "Keep a straight face while everyone tries to make you laugh for 30 seconds",
  "Share the last photo in your camera roll",
];

const TruthOrDare = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"truth" | "dare" | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [animKey, setAnimKey] = useState(0);

  const pickRandom = useCallback((type: "truth" | "dare") => {
    const list = type === "truth" ? truths : dares;
    const prompt = list[Math.floor(Math.random() * list.length)];
    setCurrentPrompt(prompt);
    setMode(type);
    setAnimKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Truth or Dare</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {mode === null ? (
          <div className="text-center" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className="w-20 h-20 rounded-2xl bg-game-truth/15 text-game-truth flex items-center justify-center mx-auto mb-6">
              <Flame className="w-10 h-10" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Choose your fate</h2>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Tap Truth or Dare to get a random prompt. No backing out.</p>
            <div className="flex gap-4 justify-center">
              <Button size="xl" onClick={() => pickRandom("truth")} className="bg-game-truth/15 text-game-truth hover:bg-game-truth/25 border border-game-truth/20">
                <Shield className="w-5 h-5" /> Truth
              </Button>
              <Button size="xl" onClick={() => pickRandom("dare")} className="bg-game-dare/15 text-game-dare hover:bg-game-dare/25 border border-game-dare/20">
                <Flame className="w-5 h-5" /> Dare
              </Button>
            </div>
          </div>
        ) : (
          <div key={animKey} className="text-center max-w-sm" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8 ${
              mode === "truth" ? "bg-game-truth/15 text-game-truth" : "bg-game-dare/15 text-game-dare"
            }`}>
              {mode === "truth" ? <Shield className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
              {mode === "truth" ? "TRUTH" : "DARE"}
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-10">
              {currentPrompt}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="lg" variant="outline" onClick={() => pickRandom("truth")}>
                <Shield className="w-4 h-4" /> Truth
              </Button>
              <Button size="lg" variant="outline" onClick={() => pickRandom("dare")}>
                <Flame className="w-4 h-4" /> Dare
              </Button>
              <Button size="lg" onClick={() => pickRandom(mode)}>
                <Shuffle className="w-4 h-4" /> Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TruthOrDare;
