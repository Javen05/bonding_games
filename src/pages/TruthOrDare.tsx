import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Shield, Shuffle, Plus, Trash2, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMergedQuestions, addCustomQuestion, getCustomQuestions, removeCustomQuestion } from "@/lib/gameUtils";

const defaultTruths = [
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
  "What's the worst luck you've had at camp?",
  "Who do you trust the most in the bunk?",
  "What makes you laugh the most in camp?",
  "What's something you regret not doing during NS?",
  "Who would you want as your section mate?",
];

const defaultDares = [
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
  "Dance without using your arms for 30 seconds",
  "Tell someone in this room your biggest secret",
  "Do an impression of each person here",
  "Speak only in questions for the next 2 rounds",
  "Trade one piece of clothing with someone",
];

const TruthOrDare = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"truth" | "dare" | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomTruth, setNewCustomTruth] = useState("");
  const [newCustomDare, setNewCustomDare] = useState("");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerExpired, setTimerExpired] = useState(false);
  const [customTruths, setCustomTruths] = useState<string[]>([]);
  const [customDares, setCustomDares] = useState<string[]>([]);
  const [allTruths, setAllTruths] = useState<string[]>([]);
  const [allDares, setAllDares] = useState<string[]>([]);

  useEffect(() => {
    const merged = getMergedQuestions(defaultTruths, "truth");
    const mergedDares = getMergedQuestions(defaultDares, "dare");
    setAllTruths(merged);
    setAllDares(mergedDares);
    setCustomTruths(getCustomQuestions("truth"));
    setCustomDares(getCustomQuestions("dare"));
  }, []);

  useEffect(() => {
    if (!timerEnabled || mode === null || timerExpired) return;
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setTimerExpired(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, mode, timerExpired]);

  const addCustomTruthHandler = useCallback(() => {
    const question = newCustomTruth.trim();
    if (question) {
      addCustomQuestion("truth", question);
      const merged = getMergedQuestions(defaultTruths, "truth");
      setAllTruths(merged);
      setCustomTruths(getCustomQuestions("truth"));
      setNewCustomTruth("");
    }
  }, [newCustomTruth]);

  const addCustomDareHandler = useCallback(() => {
    const question = newCustomDare.trim();
    if (question) {
      addCustomQuestion("dare", question);
      const merged = getMergedQuestions(defaultDares, "dare");
      setAllDares(merged);
      setCustomDares(getCustomQuestions("dare"));
      setNewCustomDare("");
    }
  }, [newCustomDare]);

  const removeCustomTruthHandler = useCallback((question: string) => {
    removeCustomQuestion("truth", question);
    const merged = getMergedQuestions(defaultTruths, "truth");
    setAllTruths(merged);
    setCustomTruths(getCustomQuestions("truth"));
  }, []);

  const removeCustomDareHandler = useCallback((question: string) => {
    removeCustomQuestion("dare", question);
    const merged = getMergedQuestions(defaultDares, "dare");
    setAllDares(merged);
    setCustomDares(getCustomQuestions("dare"));
  }, []);

  const pickRandom = useCallback((type: "truth" | "dare") => {
    const list = type === "truth" ? allTruths : allDares;
    if (list.length === 0) return;
    const prompt = list[Math.floor(Math.random() * list.length)];
    setCurrentPrompt(prompt);
    setMode(type);
    setTimeLeft(timerSeconds);
    setTimerExpired(false);
    setAnimKey((k) => k + 1);
  }, [allTruths, allDares, timerSeconds]);

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Settings</h1>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full overflow-y-auto">
          <div className="space-y-6 pt-6">
            {/* Timer Settings */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timerEnabled}
                  onChange={(e) => setTimerEnabled(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Enable Timer
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Shows time to answer</p>
                </div>
              </label>
              {timerEnabled && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-muted-foreground">Duration (seconds)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 30)}
                    className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-truth/40"
                  />
                </div>
              )}
            </div>

            {/* Custom Truths */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <button
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="w-full flex items-center justify-between font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Custom Truths
                </span>
              </button>
              
              {showAddCustom && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={newCustomTruth}
                      onChange={(e) => setNewCustomTruth(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomTruthHandler()}
                      placeholder="Enter truth..."
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-truth/40"
                    />
                    <Button onClick={addCustomTruthHandler} size="sm" className="bg-game-truth/15 text-game-truth hover:bg-game-truth/25">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {customTruths.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Your Custom Truths ({customTruths.length})</p>
                      {customTruths.map((q) => (
                        <div key={q} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                          <span className="flex-1">{q}</span>
                          <button
                            onClick={() => removeCustomTruthHandler(q)}
                            className="text-muted-foreground hover:text-destructive ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Dares */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <button
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="w-full flex items-center justify-between font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Custom Dares
                </span>
              </button>
              
              {showAddCustom && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={newCustomDare}
                      onChange={(e) => setNewCustomDare(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomDareHandler()}
                      placeholder="Enter dare..."
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-dare/40"
                    />
                    <Button onClick={addCustomDareHandler} size="sm" className="bg-game-dare/15 text-game-dare hover:bg-game-dare/25">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {customDares.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Your Custom Dares ({customDares.length})</p>
                      {customDares.map((q) => (
                        <div key={q} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                          <span className="flex-1">{q}</span>
                          <button
                            onClick={() => removeCustomDareHandler(q)}
                            className="text-muted-foreground hover:text-destructive ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Truth or Dare</h1>
        <button onClick={() => setShowSettings(true)} className="ml-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <Settings className="w-5 h-5" />
        </button>
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
            {timerEnabled && !timerExpired && (
              <div className="font-mono text-sm text-muted-foreground mb-4">
                {timeLeft}s remaining
              </div>
            )}
            {timerEnabled && timerExpired && (
              <div className="font-mono text-sm text-destructive mb-4 font-bold">
                Timer is up!
              </div>
            )}
            <p className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-10">
              {currentPrompt}
            </p>
            {!timerEnabled || timerExpired ? (
              <div className="flex gap-4 justify-center">
                <Button size="xl" onClick={() => pickRandom("truth")} className="bg-game-truth/15 text-game-truth hover:bg-game-truth/25 border border-game-truth/20">
                  <Shield className="w-5 h-5" /> Truth
                </Button>
                <Button size="xl" onClick={() => pickRandom("dare")} className="bg-game-dare/15 text-game-dare hover:bg-game-dare/25 border border-game-dare/20">
                  <Flame className="w-5 h-5" /> Dare
                </Button>
              </div>
            ) : (
              <Button size="xl" onClick={() => pickRandom(mode)} className={`${
                mode === "truth" ? "bg-game-truth/15 text-game-truth hover:bg-game-truth/25 border border-game-truth/20" : "bg-game-dare/15 text-game-dare hover:bg-game-dare/25 border border-game-dare/20"
              }`}>
                <Shuffle className="w-5 h-5" /> Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruthOrDare;
