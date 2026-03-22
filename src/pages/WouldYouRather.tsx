import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, SkipForward, Plus, Trash2, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCustomQuestion, getCustomQuestions, removeCustomQuestion } from "@/lib/gameUtils";

interface Question {
  a: string;
  b: string;
}

const defaultQuestions: Question[] = [
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
  { a: "Reply all to a camp email accidentally", b: "Call your sergeant by name in front of CO" },
  { a: "Get picked for a deployement overseas", b: "Get promoted to LCP after NS" },
  { a: "Live with 10 bunk mates forever", b: "Stay at Tekong for 2 years" },
  { a: "Eat salad for the rest of your life", b: "Eat the same meal every day" },
];

const WouldYouRather = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<"a" | "b" | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newOptionA, setNewOptionA] = useState("");
  const [newOptionB, setNewOptionB] = useState("");
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [shuffled, setShuffled] = useState<Question[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerExpired, setTimerExpired] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    const customList = getCustomQuestions("wyr").map((q: string) => {
      const parts = q.split("|");
      if (parts.length === 2) {
        return { a: parts[0].trim(), b: parts[1].trim() };
      }
      return null;
    }).filter(Boolean) as Question[];
    
    const merged = [...defaultQuestions, ...customList];
    setAllQuestions(merged);
    const s = [...merged].sort(() => Math.random() - 0.5);
    setShuffled(s);
    setCustomQuestions(customList);
  }, []);

  useEffect(() => {
    if (!timerEnabled || timerExpired) return;
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setTimerExpired(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, timerExpired]);

  const addCustomHandler = useCallback(() => {
    if (newOptionA.trim() && newOptionB.trim()) {
      const customStr = `${newOptionA.trim()} | ${newOptionB.trim()}`;
      addCustomQuestion("wyr", customStr);
      const customQuest = { a: newOptionA.trim(), b: newOptionB.trim() };
      const updated = [...customQuestions, customQuest];
      setCustomQuestions(updated);
      setAllQuestions([...defaultQuestions, ...updated]);
      setNewOptionA("");
      setNewOptionB("");
    }
  }, [newOptionA, newOptionB, customQuestions]);

  const removeCustomHandler = useCallback((question: Question) => {
    const customStr = `${question.a} | ${question.b}`;
    removeCustomQuestion("wyr", customStr);
    const updated = customQuestions.filter((q) => q.a !== question.a || q.b !== question.b);
    setCustomQuestions(updated);
    setAllQuestions([...defaultQuestions, ...updated]);
  }, [customQuestions]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % shuffled.length);
    setSelected(null);
    setVotes({});
    setTimeLeft(timerSeconds);
    setTimerExpired(false);
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
                    onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 30)}
                    className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-wyr/40"
                  />
                </div>
              )}
            </div>

            {/* Custom Questions */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="w-full flex items-center justify-between font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Custom Questions
                </span>
              </button>
              
              {showAdd && (
                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <input
                      value={newOptionA}
                      onChange={(e) => setNewOptionA(e.target.value)}
                      placeholder="Option A..."
                      className="w-full bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-wyr/40"
                    />
                    <input
                      value={newOptionB}
                      onChange={(e) => setNewOptionB(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomHandler()}
                      placeholder="Option B..."
                      className="w-full bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-wyr/40"
                    />
                  </div>
                  <Button onClick={addCustomHandler} size="sm" className="w-full bg-game-wyr/15 text-game-wyr hover:bg-game-wyr/25">
                    <Plus className="w-4 h-4" /> Add Question
                  </Button>
                  
                  {customQuestions.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-medium text-muted-foreground">Your Questions ({customQuestions.length})</p>
                      {customQuestions.map((q, i) => (
                        <div key={i} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                          <div className="flex-1">
                            <p>{q.a} OR {q.b}</p>
                          </div>
                          <button
                            onClick={() => removeCustomHandler(q)}
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

  const question = shuffled[currentIndex];
  const isLoading = !shuffled || shuffled.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Would You Rather</h1>
        <button onClick={() => setShowSettings(true)} className="ml-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {isLoading ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-game-wyr/15 text-game-wyr flex items-center justify-center mx-auto mb-4 animate-pulse">
              <HelpCircle className="w-7 h-7" />
            </div>
            <p className="text-muted-foreground text-sm">Loading questions...</p>
          </div>
        ) : (
        <div key={animKey} className="w-full max-w-sm" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-game-wyr/15 text-game-wyr flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7" />
            </div>
            <p className="text-muted-foreground text-sm font-mono">Would you rather...</p>
          </div>

          {timerEnabled && !timerExpired && (
            <div className="font-mono text-sm text-muted-foreground text-center mb-4">
              {timeLeft}s remaining
            </div>
          )}
          {timerEnabled && timerExpired && (
            <div className="font-mono text-sm text-destructive text-center mb-4 font-bold">
              Time's up!
            </div>
          )}

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

          {selected && (
            <div className="text-center mb-4 text-sm text-game-wyr font-mono">
              You chose: <span className="font-bold">{selected.toUpperCase()}</span>
            </div>
          )}

          <div className="text-center">
            <Button size="lg" onClick={next} className="bg-game-wyr/15 text-game-wyr hover:bg-game-wyr/25 border border-game-wyr/20">
              <SkipForward className="w-5 h-5" /> Next Question
            </Button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default WouldYouRather;
