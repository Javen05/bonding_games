import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Timer, Play, Square, RotateCcw, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase = "setup" | "playing" | "results";

interface AttemptResult {
  player: string;
  stoppedAt: number;
  diff: number;
}

const MIN_TARGET_SECONDS = 2;
const MAX_TARGET_SECONDS = 12;

const randomTargetSeconds = () => {
  const value = Math.random() * (MAX_TARGET_SECONDS - MIN_TARGET_SECONDS) + MIN_TARGET_SECONDS;
  return Number(value.toFixed(2));
};

const StopTheTimer = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");

  const [targetTime, setTargetTime] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [attempts, setAttempts] = useState<AttemptResult[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const currentPlayer = useMemo(() => players[currentPlayerIndex] ?? "", [players, currentPlayerIndex]);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  const addPlayer = useCallback(() => {
    const name = newPlayer.trim();
    if (!name || players.includes(name)) return;
    setPlayers((prev) => [...prev, name]);
    setNewPlayer("");
  }, [newPlayer, players]);

  const removePlayer = useCallback((name: string) => {
    setPlayers((prev) => prev.filter((p) => p !== name));
  }, []);

  const resetToSetup = useCallback(() => {
    clearTimerInterval();
    startTimeRef.current = null;
    setIsRunning(false);
    setElapsed(0);
    setCurrentPlayerIndex(0);
    setAttempts([]);
    setTargetTime(0);
    setPhase("setup");
  }, [clearTimerInterval]);

  const startGame = useCallback(() => {
    if (players.length < 2) return;
    clearTimerInterval();
    startTimeRef.current = null;
    setIsRunning(false);
    setElapsed(0);
    setCurrentPlayerIndex(0);
    setAttempts([]);
    setTargetTime(randomTargetSeconds());
    setPhase("playing");
  }, [players, clearTimerInterval]);

  const moveToNextPlayerOrFinish = useCallback((nextAttempts: AttemptResult[]) => {
    if (currentPlayerIndex >= players.length - 1) {
      setAttempts(nextAttempts);
      setPhase("results");
      return;
    }

    setAttempts(nextAttempts);
    setCurrentPlayerIndex((prev) => prev + 1);
    setElapsed(0);
  }, [currentPlayerIndex, players.length]);

  const handleStartStop = useCallback(() => {
    if (phase !== "playing") return;

    if (!isRunning) {
      const startedAt = performance.now();
      startTimeRef.current = startedAt;
      setIsRunning(true);

      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current === null) return;
        const now = performance.now();
        const nextElapsed = (now - startTimeRef.current) / 1000;
        setElapsed(nextElapsed);
      }, 10);

      return;
    }

    if (startTimeRef.current === null) return;

    const stopAt = performance.now();
    const stoppedSeconds = (stopAt - startTimeRef.current) / 1000;
    const roundedStoppedSeconds = Number(stoppedSeconds.toFixed(2));
    const diff = Number(Math.abs(roundedStoppedSeconds - targetTime).toFixed(2));

    clearTimerInterval();
    startTimeRef.current = null;
    setIsRunning(false);

    const nextAttempts = [
      ...attempts,
      {
        player: currentPlayer,
        stoppedAt: roundedStoppedSeconds,
        diff,
      },
    ];

    moveToNextPlayerOrFinish(nextAttempts);
  }, [phase, isRunning, targetTime, attempts, currentPlayer, moveToNextPlayerOrFinish, clearTimerInterval]);

  const sortedResults = useMemo(() => {
    return [...attempts].sort((a, b) => a.diff - b.diff);
  }, [attempts]);

  const bestDiff = sortedResults[0]?.diff;
  const winners = sortedResults.filter((result) => result.diff === bestDiff).map((result) => result.player);

  const winnerAccuracy = useMemo(() => {
    if (bestDiff === undefined || targetTime === 0) return 0;
    const accuracy = Math.max(0, 100 - (bestDiff / targetTime) * 100);
    return Number(accuracy.toFixed(1));
  }, [bestDiff, targetTime]);

  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Stop The Timer</h1>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="text-center mb-8 mt-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
              <Timer className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">2 Players or More</h2>
            <p className="text-muted-foreground text-sm">A random target time is chosen. Each player tries to stop as close as possible.</p>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={newPlayer}
              onChange={(event) => setNewPlayer(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addPlayer()}
              placeholder="Enter player name..."
              className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button onClick={addPlayer} size="icon" className="bg-primary/15 text-primary hover:bg-primary/25 rounded-xl h-[46px] w-[46px]">
              <UserPlus className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-2 mb-6">
            {players.map((player) => (
              <div key={player} className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
                <span className="font-medium text-sm">{player}</span>
                <button onClick={() => removePlayer(player)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            size="xl"
            onClick={startGame}
            disabled={players.length < 2}
            className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20"
          >
            <Play className="w-5 h-5" /> Start Game
          </Button>
          {players.length < 2 && (
            <p className="text-center text-muted-foreground text-xs font-mono mt-3">
              Add at least 2 players to continue.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (phase === "playing") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button
            onClick={resetToSetup}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Stop The Timer</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <p className="text-xs font-mono text-muted-foreground mb-2">TARGET TIME</p>
            <h2 className="font-display text-4xl font-bold text-primary mb-6">{targetTime.toFixed(2)}s</h2>

            <p className="text-sm text-muted-foreground mb-2">Current player</p>
            <p className="font-display text-3xl font-bold mb-6">{currentPlayer}</p>

            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <p className="text-xs font-mono text-muted-foreground mb-3">LIVE TIMER</p>
              <p className="font-display text-5xl font-bold">{elapsed.toFixed(2)}s</p>
            </div>

            <Button
              size="xl"
              onClick={handleStartStop}
              className={`w-full border ${
                isRunning
                  ? "bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/20"
                  : "bg-primary/15 text-primary hover:bg-primary/25 border-primary/20"
              }`}
            >
              {isRunning ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? "Stop" : "Start"}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Try to stop exactly at the target time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <h1 className="font-display text-xl font-bold">Results</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <h2 className="font-display text-2xl font-bold mb-2">Closest Wins</h2>
          <p className="text-muted-foreground text-sm mb-6">Target was {targetTime.toFixed(2)}s</p>

          <div className="bg-card rounded-2xl border border-border p-4 text-left mb-6 space-y-2">
            {sortedResults.map((result) => (
              <p key={result.player} className="text-sm">
                <span className="font-semibold">{result.player}:</span> {result.stoppedAt.toFixed(2)}s | diff {result.diff.toFixed(2)}s
              </p>
            ))}
          </div>

          <p className="text-sm font-semibold mb-6">
            {winners.length > 1
              ? `Tie: ${winners.join(", ")} with ${bestDiff?.toFixed(2)}s diff`
              : `${winners[0]} wins with ${bestDiff?.toFixed(2)}s diff`}
          </p>

          <div className="bg-card rounded-xl border border-border px-4 py-3 mb-6">
            <p className="text-xs font-mono text-muted-foreground mb-1">ACCURACY</p>
            <p className="font-display text-2xl font-bold text-primary">{winnerAccuracy}%</p>
          </div>

          <div className="space-y-3">
            <Button size="lg" onClick={startGame} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
              <RotateCcw className="w-4 h-4" /> Play Again
            </Button>
            <Button size="lg" variant="outline" onClick={resetToSetup} className="w-full">
              <ArrowLeft className="w-4 h-4" /> Back to Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopTheTimer;
