import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Play, Settings2, UserPlus, X, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImposterHint = "nothing" | "theme" | "similar";

interface GameSettings {
  imposterCount: number;
  imposterHint: ImposterHint;
}

const wordPacks: { word: string; theme: string; similar: string }[] = [
  { word: "Durian", theme: "Food", similar: "Jackfruit" },
  { word: "Tekong", theme: "Places in Singapore", similar: "Sentosa" },
  { word: "Guard Duty", theme: "NS Activities", similar: "Prowling" },
  { word: "SAR 21", theme: "Equipment", similar: "M16" },
  { word: "Route March", theme: "NS Activities", similar: "Road Run" },
  { word: "Beret", theme: "Uniform", similar: "Jockey Cap" },
  { word: "Cookhouse", theme: "Camp Locations", similar: "Canteen" },
  { word: "IPPT", theme: "Fitness Tests", similar: "SOC" },
  { word: "Admin Time", theme: "NS Life", similar: "Stand By Bed" },
  { word: "Field Camp", theme: "Training", similar: "Outfield" },
  { word: "Milo", theme: "Drinks", similar: "Kopi" },
  { word: "Changi Airport", theme: "Singapore Landmarks", similar: "Jewel" },
  { word: "MRT", theme: "Transport", similar: "Bus" },
  { word: "Char Kway Teow", theme: "Hawker Food", similar: "Hor Fun" },
  { word: "Encik", theme: "NS Ranks", similar: "Sergeant" },
  { word: "Push-up", theme: "Exercises", similar: "Sit-up" },
  { word: "Camo Cream", theme: "Field Equipment", similar: "Face Paint" },
  { word: "Topo Map", theme: "Navigation", similar: "Compass" },
  { word: "Lightning Alert", theme: "Camp Events", similar: "Fire Drill" },
  { word: "Welfare Pack", theme: "NS Life", similar: "Ration Pack" },
  { word: "Basketball", theme: "Sports", similar: "Volleyball" },
  { word: "Orchard Road", theme: "Singapore Places", similar: "Bugis Street" },
  { word: "Laksa", theme: "Local Food", similar: "Mee Siam" },
  { word: "Book Out", theme: "NS Life", similar: "Book In" },
  { word: "Parachute", theme: "Military Equipment", similar: "Rappelling Rope" },
  { word: "Signal Flare", theme: "Field Equipment", similar: "Smoke Grenade" },
  { word: "Netflix", theme: "Entertainment", similar: "YouTube" },
  { word: "Bubble Tea", theme: "Drinks", similar: "Koi" },
];

const WordImposter = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"setup" | "settings" | "reveal" | "discussion">("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [settings, setSettings] = useState<GameSettings>({ imposterCount: 1, imposterHint: "nothing" });
  
  // Game state
  const [assignments, setAssignments] = useState<{ name: string; isImposter: boolean; text: string }[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [currentWord, setCurrentWord] = useState<typeof wordPacks[0] | null>(null);

  const addPlayer = useCallback(() => {
    const name = newPlayer.trim();
    if (name && !players.includes(name)) {
      setPlayers((p) => [...p, name]);
      setNewPlayer("");
    }
  }, [newPlayer, players]);

  const removePlayer = useCallback((name: string) => {
    setPlayers((p) => p.filter((n) => n !== name));
  }, []);

  const maxImposters = Math.max(1, Math.floor(players.length / 2) - 1);
  const validImposterCount = Math.min(settings.imposterCount, maxImposters);

  const startGame = useCallback(() => {
    const wordData = wordPacks[Math.floor(Math.random() * wordPacks.length)];
    setCurrentWord(wordData);

    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const imposters = new Set(shuffledPlayers.slice(0, validImposterCount));

    const getImposterText = () => {
      switch (settings.imposterHint) {
        case "nothing": return "You are the IMPOSTER!\nYou got nothing. Good luck. 😈";
        case "theme": return `You are the IMPOSTER!\nTheme: ${wordData.theme}`;
        case "similar": return `You are the IMPOSTER!\nYour word: ${wordData.similar}`;
      }
    };

    const assigned = players.map((name) => ({
      name,
      isImposter: imposters.has(name),
      text: imposters.has(name) ? getImposterText() : `Your word:\n${wordData.word}`,
    }));

    setAssignments(assigned);
    setRevealIndex(0);
    setCardRevealed(false);
    setPhase("reveal");
    setAnimKey((k) => k + 1);
  }, [players, validImposterCount, settings.imposterHint]);

  const nextPlayer = useCallback(() => {
    if (revealIndex < assignments.length - 1) {
      setRevealIndex((i) => i + 1);
      setCardRevealed(false);
      setAnimKey((k) => k + 1);
    } else {
      setPhase("discussion");
      setAnimKey((k) => k + 1);
    }
  }, [revealIndex, assignments.length]);

  const resetGame = useCallback(() => {
    setPhase("setup");
    setAssignments([]);
    setRevealIndex(0);
    setCardRevealed(false);
  }, []);

  // Setup phase
  if (phase === "setup" || phase === "settings") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Word Imposter</h1>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          {phase === "setup" ? (
            <>
              <div className="text-center mb-8 mt-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
                  <EyeOff className="w-8 h-8" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Add Players</h2>
                <p className="text-muted-foreground text-sm">Everyone gets the same word — except the imposter.</p>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                  placeholder="Enter name..."
                  className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <Button onClick={addPlayer} size="icon" className="bg-primary/15 text-primary hover:bg-primary/25 rounded-xl h-[46px] w-[46px]">
                  <UserPlus className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-2 mb-6">
                {players.map((p) => (
                  <div key={p} className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border" style={{ animation: "slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
                    <span className="font-medium text-sm">{p}</span>
                    <button onClick={() => removePlayer(p)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {players.length >= 3 && (
                <div className="space-y-3">
                  <Button size="lg" variant="outline" onClick={() => setPhase("settings")} className="w-full">
                    <Settings2 className="w-4 h-4" /> Customize Settings
                  </Button>
                  <Button size="xl" onClick={startGame} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                    <Play className="w-5 h-5" /> Start Game ({players.length} players)
                  </Button>
                </div>
              )}
              {players.length < 3 && players.length > 0 && (
                <p className="text-center text-muted-foreground text-xs font-mono">Need at least 3 players</p>
              )}
            </>
          ) : (
            /* Settings phase */
            <>
              <div className="text-center mb-8 mt-6">
                <h2 className="font-display text-2xl font-bold mb-2">Game Settings</h2>
                <p className="text-muted-foreground text-sm">Customize the difficulty</p>
              </div>

              {/* Imposter count */}
              <div className="bg-card rounded-2xl border border-border p-5 mb-4">
                <label className="text-xs font-mono text-muted-foreground mb-3 block">NUMBER OF IMPOSTERS</label>
                <div className="flex gap-2">
                  {Array.from({ length: maxImposters }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setSettings((s) => ({ ...s, imposterCount: n }))}
                      className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${
                        settings.imposterCount === n
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Imposter hint */}
              <div className="bg-card rounded-2xl border border-border p-5 mb-8">
                <label className="text-xs font-mono text-muted-foreground mb-3 block">WHAT DOES THE IMPOSTER GET?</label>
                <div className="space-y-2">
                  {([
                    { value: "nothing" as ImposterHint, label: "Nothing", desc: "Hardest — imposter has zero clues" },
                    { value: "theme" as ImposterHint, label: "Theme / Category", desc: "Medium — imposter knows the category" },
                    { value: "similar" as ImposterHint, label: "Similar Word", desc: "Easiest — imposter gets a related word" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSettings((s) => ({ ...s, imposterHint: opt.value }))}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-[0.97] ${
                        settings.imposterHint === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="font-semibold text-sm block">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Button size="lg" variant="outline" onClick={() => setPhase("setup")} className="w-full">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button size="xl" onClick={startGame} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                  <Play className="w-5 h-5" /> Start Game
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Reveal phase — pass phone around
  if (phase === "reveal") {
    const current = assignments[revealIndex];
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={resetGame} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Word Imposter</h1>
          <span className="ml-auto text-xs text-muted-foreground font-mono">{revealIndex + 1}/{assignments.length}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12" key={animKey}>
          <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-bold mb-6 bg-primary/15 text-primary">
              {current.name}
            </div>

            {!cardRevealed ? (
              <>
                <p className="text-muted-foreground text-sm mb-8">
                  Pass the phone to <span className="text-foreground font-semibold">{current.name}</span>.<br />
                  Only they should see the screen.
                </p>
                <Button size="xl" onClick={() => setCardRevealed(true)} className="bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                  <Eye className="w-5 h-5" /> Reveal My Card
                </Button>
              </>
            ) : (
              <>
                <div className={`rounded-2xl border-2 p-8 mb-8 ${
                  current.isImposter
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-primary/30 bg-primary/5"
                }`}>
                  {current.text.split("\n").map((line, i) => (
                    <p key={i} className={`${i === 0 ? "font-display text-2xl font-bold mb-2" : "text-lg font-semibold"} ${
                      current.isImposter ? "text-destructive" : "text-primary"
                    }`}>
                      {line}
                    </p>
                  ))}
                </div>
                <Button size="xl" onClick={nextPlayer} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <ChevronRight className="w-5 h-5" />
                  {revealIndex < assignments.length - 1 ? "Next Player" : "Start Discussion"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Discussion phase
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={resetGame} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Word Imposter</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12" key={animKey}>
        <div className="text-center max-w-sm" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-6">
            <EyeOff className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Time to Discuss!</h2>
          <p className="text-muted-foreground text-sm mb-3 max-w-xs mx-auto">
            Everyone describes the word without saying it directly. Find the imposter!
          </p>
          <p className="text-xs text-muted-foreground font-mono mb-8">
            {validImposterCount} imposter{validImposterCount > 1 ? "s" : ""} among {players.length} players
          </p>

          <div className="space-y-3">
            <Button size="xl" onClick={startGame} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
              <RotateCcw className="w-5 h-5" /> New Round
            </Button>
            <Button size="lg" variant="outline" onClick={resetGame} className="w-full">
              <ArrowLeft className="w-4 h-4" /> Back to Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordImposter;
