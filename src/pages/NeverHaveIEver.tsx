import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, SkipForward, Plus, Trash2, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMergedQuestions, addCustomQuestion, getCustomQuestions, removeCustomQuestion } from "@/lib/gameUtils";

const defaultStatements = [
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
  "Never have I ever slacked during PT",
  "Never have I ever given a fake phone number to someone",
  "Never have I ever skipped a meal at the cookhouse",
  "Never have I ever done 10 push-ups in a row",
  "Never have I ever complained about the bunk conditions",
  "Never have I ever been caught talking during lights out",
  "Never have I ever used the 'I thought it was a rest day' excuse",
  "Never have I ever pretended to know how to do a task during training",
  "Never have I ever been caught sneaking out of camp",
  "Never have I ever used the 'I thought we were doing admin' excuse",
  "Never have I ever had a secret stash of snacks in my locker",
  "Never have I ever been caught slacking off during work",
  "Never have I ever pretended to know how to do a task during training",
  "Never have I ever thought of kissing a guy",
  "Never have I ever thought of kissing a girl",
];

const NeverHaveIEver = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCustomStatement, setNewCustomStatement] = useState("");
  const [customStatements, setCustomStatements] = useState<string[]>([]);
  const [allStatements, setAllStatements] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [contentMode, setContentMode] = useState<"mixed" | "default-only" | "custom-only">("mixed");

  const refreshStatements = useCallback(() => {
    const custom = getCustomQuestions("never");
    const merged =
      contentMode === "custom-only"
        ? custom
        : contentMode === "default-only"
          ? [...defaultStatements]
          : getMergedQuestions(defaultStatements, "never");
    setCustomStatements(custom);
    setAllStatements(merged);
    setShuffled([...merged].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  }, [contentMode]);

  useEffect(() => {
    refreshStatements();
  }, [refreshStatements]);

  useEffect(() => {
    if (!timerEnabled) return;
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          next();
          return timerSeconds;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, timerSeconds]);

  const addCustomHandler = useCallback(() => {
    const statement = newCustomStatement.trim();
    if (statement) {
      addCustomQuestion("never", statement);
      refreshStatements();
      setNewCustomStatement("");
    }
  }, [newCustomStatement, refreshStatements]);

  const removeCustomHandler = useCallback((statement: string) => {
    removeCustomQuestion("never", statement);
    refreshStatements();
  }, [refreshStatements]);

  const next = useCallback(() => {
    if (shuffled.length === 0) return;
    setCurrentIndex((i) => (i + 1) % shuffled.length);
    setTimeLeft(timerSeconds);
    setAnimKey((k) => k + 1);
  }, [shuffled.length, timerSeconds]);

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
                  <p className="text-xs text-muted-foreground mt-1">Auto-advance after timer runs out</p>
                </div>
              </label>
              {timerEnabled && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-muted-foreground">Duration (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 60)}
                    className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-never/40"
                  />
                </div>
              )}
            </div>

            {/* Custom Statements */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground">Content Source</label>
                <select
                  value={contentMode}
                  onChange={(e) => setContentMode(e.target.value as "mixed" | "default-only" | "custom-only")}
                  className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-never/40"
                >
                  <option value="mixed">Use ALL Data</option>
                  <option value="default-only">BUILT-IN Data</option>
                  <option value="custom-only">CUSTOM Data</option>
                </select>
              </div>

              <button
                onClick={() => setShowAdd(!showAdd)}
                className="w-full flex items-center justify-between font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Custom Statements
                </span>
              </button>
              
              {showAdd && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={newCustomStatement}
                      onChange={(e) => setNewCustomStatement(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomHandler()}
                      placeholder="Never have I ever..."
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-never/40"
                    />
                    <Button onClick={addCustomHandler} size="sm" className="bg-game-never/15 text-game-never hover:bg-game-never/25">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {customStatements.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Your Statements ({customStatements.length})</p>
                      {customStatements.map((s) => (
                        <div key={s} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                          <span className="flex-1">{s}</span>
                          <button
                            onClick={() => removeCustomHandler(s)}
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

  const statement = shuffled[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Never Have I Ever</h1>
        <button onClick={() => setShowSettings(true)} className="ml-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div key={animKey} className="text-center max-w-sm" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="w-16 h-16 rounded-2xl bg-game-never/15 text-game-never flex items-center justify-center mx-auto mb-8">
            <MessageCircle className="w-8 h-8" />
          </div>

          <p className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-10">
            {statement || "No statements available. Add custom statements in Settings."}
          </p>

          {timerEnabled && (
            <div className="font-mono text-sm text-muted-foreground mb-6">
              {timeLeft}s remaining
            </div>
          )}

          <div className="flex gap-2 items-center justify-center mb-8">
            <Button size="sm" variant="outline" disabled>
              #{currentIndex + 1}
            </Button>
            <span className="text-xs text-muted-foreground font-mono">
              / {shuffled.length}
            </span>
          </div>

          <Button size="xl" onClick={next} className="bg-game-never/15 text-game-never hover:bg-game-never/25 border border-game-never/20">
            <SkipForward className="w-5 h-5" /> Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NeverHaveIEver;
