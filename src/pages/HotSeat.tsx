import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, UserPlus, Shuffle, X, Play, Clock, Plus, Trash2, Settings, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMergedQuestions, addCustomQuestion, getCustomQuestions, removeCustomQuestion } from "@/lib/gameUtils";

const defaultHotSeatQuestions = [
  "What's the most embarrassing thing you've done in front of your section?",
  "If you could change one thing about NS, what would it be?",
  "Who in this bunk would you want by your side in a real combat situation?",
  "What's your honest opinion about our encik?",
  "What do you think about most during guard duty?",
  "If you had to describe each person here in one word, what would it be?",
  "What's the biggest lie you've told in camp?",
  "Rank everyone here by how likely they are to sign on",
  "What's your hot take that would get you tekan-ed?",
  "Who here do you think has a secret they haven't shared?",
  "What's something about NS you'd never tell your parents?",
  "If you could only bring 3 things to field camp, what would they be?",
  "What's the most sian thing about NS life?",
  "Confess something you've been holding back",
  "If this section was a movie, what genre and who'd play the lead?",
  "What's something you've gained from NS (serious answers only)?",
  "Who here gives the best advice?",
  "What would you do if you were CSM for one day?",
  "Describe your perfect book-out day",
  "What's the funniest thing that's happened in this bunk?",
  "What would you do with a day off from camp?",
  "Who do you think will rank up first in this unit?",
  "What's something funny you've witnessed in camp?",
  "If you could have any superpower, what would it be and why?",
  "What's the worst advice you've been given in NS?",
  "Who's the most surprising person in our section?",
  "What's one thing you miss most about civilian life?",
  "If you had to pick a new encik, who would it be?",
  "What's your guilty pleasure food?",
  "Who would you want as your roommate on a field camp?",
];

const HotSeat = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomQuestion, setNewCustomQuestion] = useState("");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerPaused, setTimerPaused] = useState(false);
  const [allQuestions, setAllQuestions] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);

  useEffect(() => {
    const merged = getMergedQuestions(defaultHotSeatQuestions, "hotseat");
    setAllQuestions(merged);
    setCustomQuestions(getCustomQuestions("hotseat"));
  }, []);

  useEffect(() => {
    if (!timerEnabled || !gameStarted || isSpinning || timerPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          spin();
          return timerSeconds;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, gameStarted, isSpinning, timerSeconds, timerPaused]);

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

  const addCustomQuestionHandler = useCallback(() => {
    const question = newCustomQuestion.trim();
    if (question) {
      addCustomQuestion("hotseat", question);
      const merged = getMergedQuestions(defaultHotSeatQuestions, "hotseat");
      setAllQuestions(merged);
      setCustomQuestions(getCustomQuestions("hotseat"));
      setNewCustomQuestion("");
    }
  }, [newCustomQuestion]);

  const removeCustomQuestionHandler = useCallback((question: string) => {
    removeCustomQuestion("hotseat", question);
    const merged = getMergedQuestions(defaultHotSeatQuestions, "hotseat");
    setAllQuestions(merged);
    setCustomQuestions(getCustomQuestions("hotseat"));
  }, []);

  const spin = useCallback(() => {
    if (players.length < 2 || allQuestions.length === 0) return;
    setIsSpinning(true);
    
    let count = 0;
    const interval = setInterval(() => {
      setCurrentPlayer(players[Math.floor(Math.random() * players.length)]);
      count++;
      if (count > 12) {
        clearInterval(interval);
        const finalPlayer = players[Math.floor(Math.random() * players.length)];
        const finalQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
        setCurrentPlayer(finalPlayer);
        setCurrentQuestion(finalQuestion);
        setIsSpinning(false);
        setTimeLeft(timerSeconds);
        setTimerPaused(false);
        setAnimKey((k) => k + 1);
      }
    }, 80);
  }, [players, allQuestions, timerSeconds]);

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
                    min="5"
                    max="120"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 30)}
                    className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
                  />
                </div>
              )}
            </div>

            {/* Custom Questions */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <button
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="w-full flex items-center justify-between font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Custom Questions
                </span>
              </button>
              
              {showAddCustom && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={newCustomQuestion}
                      onChange={(e) => setNewCustomQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomQuestionHandler()}
                      placeholder="Enter your question..."
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
                    />
                    <Button onClick={addCustomQuestionHandler} size="sm" className="bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {customQuestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Your Custom Questions ({customQuestions.length})</p>
                      {customQuestions.map((q) => (
                        <div key={q} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                          <span className="flex-1">{q}</span>
                          <button
                            onClick={() => removeCustomQuestionHandler(q)}
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

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Hot Seat</h1>
          <button onClick={() => setShowSettings(true)} className="ml-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="text-center mb-8 mt-8">
            <div className="w-16 h-16 rounded-2xl bg-game-hotseat/15 text-game-hotseat flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Add Players</h2>
            <p className="text-muted-foreground text-sm">Add at least 2 players to start</p>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              placeholder="Enter name..."
              className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
            />
            <Button onClick={addPlayer} size="icon" className="bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25 rounded-xl h-[46px] w-[46px]">
              <UserPlus className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-2 mb-8">
            {players.map((p) => (
              <div key={p} className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border" style={{ animation: "slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
                <span className="font-medium text-sm">{p}</span>
                <button onClick={() => removePlayer(p)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {players.length >= 2 && (
            <Button size="xl" onClick={() => { setGameStarted(true); spin(); }} className="w-full bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25 border border-game-hotseat/20">
              <Play className="w-5 h-5" /> Start Game
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => { setGameStarted(false); }} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Hot Seat</h1>
        {timerEnabled && (
          <div className="ml-auto text-sm font-mono font-bold text-game-hotseat">
            {!isSpinning && timeLeft}s
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div key={animKey} className="text-center max-w-sm" style={{ animation: isSpinning ? undefined : "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-lg font-bold mb-6 bg-game-hotseat/15 text-game-hotseat ${isSpinning ? "animate-shake" : ""}`}>
            <Zap className="w-5 h-5" />
            {currentPlayer}
          </div>
          
          {!isSpinning && currentQuestion && (
            <>
              <p className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-10">
                {currentQuestion}
              </p>
              
              {timerEnabled && (
                <div className="flex gap-2 items-center justify-center mb-8">
                  <div className="font-display text-3xl font-bold text-game-hotseat">
                    {timeLeft}s
                  </div>
                  <button
                    onClick={() => setTimerPaused(!timerPaused)}
                    className="p-2 rounded-lg bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25 transition-colors"
                    title={timerPaused ? "Resume timer" : "Pause timer"}
                  >
                    {timerPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </button>
                </div>
              )}
              
              <Button size="xl" onClick={spin} className="bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25 border border-game-hotseat/20">
                <Shuffle className="w-5 h-5" /> Next Round
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotSeat;
