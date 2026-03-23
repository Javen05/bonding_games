import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Flame, Pause, Play, Plus, Settings, SkipForward, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCustomQuestion, getCustomQuestions, getMergedQuestions, removeCustomQuestion } from "@/lib/gameUtils";

const PASS_THE_HEAT_PENALTIES_KEY = "pass_the_heat_penalties";

const defaultHeatPrompts = [
  "Name 3 things that make you irrationally angry.",
  "Tell the group your most embarrassing message fail.",
  "Imitate someone in this room until they guess it is them.",
  "Say your weirdest food combo with a straight face.",
  "Who here would survive a zombie outbreak longest, and why?",
  "Tell a one-line lie that sounds completely true.",
  "Confess the pettiest reason you got annoyed this week.",
  "Do your best ad voice for a random object nearby.",
  "Name 4 red flags you ignore anyway.",
  "Act out your bookout mood in 5 seconds.",
  "Say one nice thing and one savage thing about yourself.",
  "Pitch a terrible startup idea in one sentence.",
  "Name 3 people you would call in an emergency.",
  "Rate your own vibe today out of 10 and explain.",
  "Give your best fake motivational quote.",
  "Describe your current love life as a movie title.",
  "What is your most useless talent?",
  "Reveal your latest impulse buy and defend it.",
  "Who is most likely to start drama by accident?",
  "Create a new slang word and use it in a sentence.",
  "Show your reaction when someone says 'we need to talk'.",
  "Name 3 songs that expose your personality.",
  "What harmless crime would you probably commit?",
  "Give a dramatic apology to someone in this room.",
  "Say one thing your younger self would roast you for.",
  "What is your worst habit in group chats?",
  "Talk like a sports commentator for 10 seconds.",
  "Describe your week using only 3 words.",
  "Who is the biggest overthinker here?",
  "What is your go-to excuse when you are late?",
];

const nonDrinkerPenalties = [
  "Do 10 squats.",
  "Hold a wall sit for 20 seconds.",
  "Compliment everyone in one line.",
  "Talk in slow motion until your next turn.",
  "Do your best villain laugh for 5 seconds.",
];

const drinkPenalties = [
  "Take 1 sip.",
  "Take 1 sip.",
  "No penalty, just pass the heat.",
  "Take 2 sips.",
  "Give 1 sip to someone else.",
  "Take a long sip.",
  "Finish your current sip in one go.",
  "Give out 1 sip to anyone.",
  "Drink with your non-dominant hand until your next turn.",
    "Give out 2 sips to anyone.",
    "Take a sip with your eyes closed.",
    "Take a sip with your non-dominant hand.",
    "Everyone else takes a sip.",
    "Take 3 sips.",
    "Take 4 sips.",
    "Take 5 sips.",
];

const PassTheHeat = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentPenalty, setCurrentPenalty] = useState("");
  const [showPenalty, setShowPenalty] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [showAddPenalty, setShowAddPenalty] = useState(false);
  const [newCustomPrompt, setNewCustomPrompt] = useState("");
  const [newCustomPenalty, setNewCustomPenalty] = useState("");
  const [allPrompts, setAllPrompts] = useState<string[]>([]);
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);
  const [customPenalties, setCustomPenalties] = useState<string[]>([]);
  const [penaltyMode, setPenaltyMode] = useState<"mixed" | "normal" | "drinking">("normal");
  const [contentMode, setContentMode] = useState<"mixed" | "default-only" | "custom-only">("mixed");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(8);
  const [timeLeft, setTimeLeft] = useState(8);
  const [timerPaused, setTimerPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const custom = getCustomQuestions("pass_the_heat");
    setCustomPrompts(custom);
    setAllPrompts(
      contentMode === "custom-only"
        ? custom
        : contentMode === "default-only"
          ? [...defaultHeatPrompts]
          : getMergedQuestions(defaultHeatPrompts, "pass_the_heat")
    );
    setCustomPenalties(getCustomQuestions(PASS_THE_HEAT_PENALTIES_KEY));
  }, [contentMode]);

  useEffect(() => {
    if (!gameStarted || !timerEnabled || timerPaused || showPenalty) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerPenalty();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, timerEnabled, timerPaused, showPenalty]);

  const randomFrom = (items: string[]) => items[Math.floor(Math.random() * items.length)];

  const addPlayer = useCallback(() => {
    const name = newPlayer.trim();
    if (name && !players.includes(name)) {
      setPlayers((prev) => [...prev, name]);
      setNewPlayer("");
    }
  }, [newPlayer, players]);

  const removePlayer = useCallback((name: string) => {
    setPlayers((prev) => prev.filter((p) => p !== name));
  }, []);

  const addCustomPrompt = useCallback(() => {
    const value = newCustomPrompt.trim();
    if (!value) return;
    addCustomQuestion("pass_the_heat", value);
    const custom = getCustomQuestions("pass_the_heat");
    setCustomPrompts(custom);
    setAllPrompts(
      contentMode === "custom-only"
        ? custom
        : contentMode === "default-only"
          ? [...defaultHeatPrompts]
          : getMergedQuestions(defaultHeatPrompts, "pass_the_heat")
    );
    setNewCustomPrompt("");
  }, [newCustomPrompt, contentMode]);

  const removeCustomPromptHandler = useCallback((prompt: string) => {
    removeCustomQuestion("pass_the_heat", prompt);
    const custom = getCustomQuestions("pass_the_heat");
    setCustomPrompts(custom);
    setAllPrompts(
      contentMode === "custom-only"
        ? custom
        : contentMode === "default-only"
          ? [...defaultHeatPrompts]
          : getMergedQuestions(defaultHeatPrompts, "pass_the_heat")
    );
  }, [contentMode]);

  const addCustomPenalty = useCallback(() => {
    const value = newCustomPenalty.trim();
    if (!value) return;
    addCustomQuestion(PASS_THE_HEAT_PENALTIES_KEY, value);
    setCustomPenalties(getCustomQuestions(PASS_THE_HEAT_PENALTIES_KEY));
    setNewCustomPenalty("");
  }, [newCustomPenalty]);

  const removeCustomPenaltyHandler = useCallback((penalty: string) => {
    removeCustomQuestion(PASS_THE_HEAT_PENALTIES_KEY, penalty);
    setCustomPenalties(getCustomQuestions(PASS_THE_HEAT_PENALTIES_KEY));
  }, []);

  const nextPrompt = useCallback((playerIndex: number) => {
    if (allPrompts.length === 0) return;
    setCurrentPlayerIndex(playerIndex);
    setCurrentPrompt(randomFrom(allPrompts));
    setShowPenalty(false);
    setCurrentPenalty("");
    setTimeLeft(timerSeconds);
    setTimerPaused(false);
    setAnimKey((k) => k + 1);
  }, [allPrompts, timerSeconds]);

  const triggerPenalty = useCallback(() => {
    const basePool =
      penaltyMode === "mixed"
        ? [...nonDrinkerPenalties, ...drinkPenalties]
        : penaltyMode === "drinking"
          ? drinkPenalties
          : nonDrinkerPenalties;
    const pool =
      contentMode === "custom-only"
        ? customPenalties
        : contentMode === "default-only"
          ? basePool
          : [...basePool, ...customPenalties];
    if (pool.length === 0) return;
    setCurrentPenalty(randomFrom(pool));
    setShowPenalty(true);
  }, [penaltyMode, customPenalties, contentMode]);

  const startGame = useCallback(() => {
    if (players.length < 2 || allPrompts.length === 0) return;
    setGameStarted(true);
    nextPrompt(0);
  }, [players.length, allPrompts.length, nextPrompt]);

  const goNextTurn = useCallback(() => {
    if (players.length === 0) return;
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    nextPrompt(nextIndex);
  }, [players.length, currentPlayerIndex, nextPrompt]);

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Pass The Heat Settings</h1>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full overflow-y-auto">
          <div className="space-y-6 pt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <label className="text-xs font-medium text-muted-foreground">Penalty Type</label>
              <select
                value={penaltyMode}
                onChange={(e) => setPenaltyMode(e.target.value as "mixed" | "normal" | "drinking")}
                className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="mixed">Drinking + Normal</option>
                <option value="normal">Normal Only</option>
                <option value="drinking">Drinking Only</option>
              </select>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timerEnabled}
                  onChange={(e) => setTimerEnabled(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Turn timer</div>
                  <p className="text-xs text-muted-foreground">When time runs out, penalty triggers.</p>
                </div>
              </label>

              {timerEnabled && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Seconds per turn</label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(parseInt(e.target.value, 10) || 8)}
                    className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground">Content Source</label>
                <select
                  value={contentMode}
                  onChange={(e) => setContentMode(e.target.value as "mixed" | "default-only" | "custom-only")}
                  className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="mixed">Use ALL Data</option>
                  <option value="default-only">BUILT-IN Data</option>
                  <option value="custom-only">CUSTOM Data</option>
                </select>
              </div>

              <button onClick={() => setShowAddCustom((prev) => !prev)} className="w-full flex items-center justify-between font-semibold text-sm">
                <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Custom Prompts</span>
              </button>

              {showAddCustom && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={newCustomPrompt}
                      onChange={(e) => setNewCustomPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomPrompt()}
                      placeholder="Enter custom heat prompt..."
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Button onClick={addCustomPrompt} size="sm" className="bg-primary/15 text-primary hover:bg-primary/25">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {customPrompts.length > 0 && (
                    <div className="space-y-2">
                      {customPrompts.map((prompt) => (
                        <div key={prompt} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                          <span className="flex-1">{prompt}</span>
                          <button onClick={() => removeCustomPromptHandler(prompt)} className="text-muted-foreground hover:text-destructive ml-2">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <button onClick={() => setShowAddPenalty((prev) => !prev)} className="w-full flex items-center justify-between font-semibold text-sm">
                <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Custom Penalties</span>
              </button>

              {showAddPenalty && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={newCustomPenalty}
                      onChange={(e) => setNewCustomPenalty(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomPenalty()}
                      placeholder="Enter custom penalty..."
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Button onClick={addCustomPenalty} size="sm" className="bg-primary/15 text-primary hover:bg-primary/25">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {customPenalties.length > 0 && (
                    <div className="space-y-2">
                      {customPenalties.map((penalty) => (
                        <div key={penalty} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                          <span className="flex-1">{penalty}</span>
                          <button onClick={() => removeCustomPenaltyHandler(penalty)} className="text-muted-foreground hover:text-destructive ml-2">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Pass The Heat</h1>
          <button onClick={() => setShowSettings(true)} className="ml-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full">
          <div className="text-center mb-8 mt-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Add Players</h2>
            <p className="text-muted-foreground text-sm">Fast turns, instant penalties. 2 players minimum.</p>
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

          <div className="space-y-2 mb-8">
            {players.map((player) => (
              <div key={player} className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
                <span className="font-medium text-sm">{player}</span>
                <button onClick={() => removePlayer(player)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {players.length >= 2 && allPrompts.length > 0 && (
            <Button size="xl" onClick={startGame} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
              <Play className="w-5 h-5" /> Start Endless Round
            </Button>
          )}
          {players.length >= 2 && allPrompts.length === 0 && (
            <p className="text-center text-muted-foreground text-xs font-mono">No prompts available. Add custom prompts in Settings.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => setGameStarted(false)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Pass The Heat</h1>
        {timerEnabled && (
          <div className="ml-auto text-sm font-mono font-bold text-primary">{showPenalty ? "0s" : `${timeLeft}s`}</div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div key={animKey} className="text-center max-w-md" style={{ animation: "slide-up-fade 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary font-bold mb-6">
            <Flame className="w-4 h-4" />
            {players[currentPlayerIndex]}
          </div>

          {!showPenalty ? (
            <>
              <p className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-6">{currentPrompt}</p>
              <p className="text-sm text-muted-foreground mb-8">Answer before the timer ends, then pass the phone.</p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-3">Penalty</p>
              <p className="text-lg text-primary font-semibold mb-8">{currentPenalty}</p>
            </>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            {timerEnabled && !showPenalty && (
              <Button
                onClick={() => setTimerPaused((prev) => !prev)}
                variant="outline"
                className="rounded-xl"
              >
                {timerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {timerPaused ? "Resume" : "Pause"}
              </Button>
            )}

            {!showPenalty && (
              <Button onClick={triggerPenalty} variant="outline" className="rounded-xl">
                <Clock className="w-4 h-4" /> Time Up
              </Button>
            )}

            <Button onClick={goNextTurn} className="rounded-xl bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
              <SkipForward className="w-4 h-4" /> Next Turn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassTheHeat;
