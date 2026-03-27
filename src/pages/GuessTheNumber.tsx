import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, RotateCcw, UserPlus, X, Hash, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase = "setup" | "first-turn-selection" | "rps-tie" | "set-numbers" | "guessing" | "result";
type FirstTurnMode = "random" | "alternate" | "democratic";
type RPSChoice = "rock" | "paper" | "scissors" | null;

const GuessTheNumber = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");

  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(100);
  const [firstTurnMode, setFirstTurnMode] = useState<FirstTurnMode>("random");

  const [secretNumbers, setSecretNumbers] = useState<{ [key: number]: number | null }>({ 0: null, 1: null });
  const [numberBeingSet, setNumberBeingSet] = useState(0);
  const [secretInput, setSecretInput] = useState("");

  const [currentGuesserIndex, setCurrentGuesserIndex] = useState(0);
  const [guessInput, setGuessInput] = useState("");
  const [guessHistory, setGuessHistory] = useState<Array<{ playerIndex: number; playerName: string; guess: number; hint: string }>>([]);
  const [winner, setWinner] = useState<string | null>(null);

  const [rpsChoices, setRpsChoices] = useState<{ [key: number]: RPSChoice }>({ 0: null, 1: null });
  const [rpsPhasePlayerIndex, setRpsPhasePlayerIndex] = useState(0);
  const [pendingRpsChoice, setPendingRpsChoice] = useState<RPSChoice>(null);
  const [alternateRounds, setAlternateRounds] = useState(0);

  const player1Name = players[0] ?? "";
  const player2Name = players[1] ?? "";

  const parseIntegerInput = useCallback((value: string, fallback: number) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return fallback;
    return Math.trunc(parsed);
  }, []);

  const addPlayer = useCallback(() => {
    const name = newPlayer.trim();
    if (!name || players.includes(name) || players.length >= 2) return;
    setPlayers((prev) => [...prev, name]);
    setNewPlayer("");
  }, [newPlayer, players]);

  const removePlayer = useCallback((name: string) => {
    setPlayers((prev) => prev.filter((p) => p !== name));
  }, []);

  const resetEverything = useCallback(() => {
    setPhase("setup");
    setSecretNumbers({ 0: null, 1: null });
    setNumberBeingSet(0);
    setSecretInput("");
    setCurrentGuesserIndex(0);
    setGuessInput("");
    setGuessHistory([]);
    setWinner(null);
    setRpsChoices({ 0: null, 1: null });
    setRpsPhasePlayerIndex(0);
    setPendingRpsChoice(null);
  }, []);

  const initializeRound = useCallback((roundForAlternate: number) => {
    setSecretNumbers({ 0: null, 1: null });
    setNumberBeingSet(0);
    setSecretInput("");
    setGuessInput("");
    setGuessHistory([]);
    setWinner(null);
    setRpsChoices({ 0: null, 1: null });
    setRpsPhasePlayerIndex(0);
    setPendingRpsChoice(null);

    if (firstTurnMode === "democratic") {
      setPhase("first-turn-selection");
    } else {
      setPhase("set-numbers");
      if (firstTurnMode === "random") {
        setCurrentGuesserIndex(Math.random() > 0.5 ? 0 : 1);
      } else {
        // alternate
        setCurrentGuesserIndex(roundForAlternate % 2);
      }
    }
  }, [firstTurnMode]);

  const startGame = useCallback(() => {
    if (players.length !== 2 || minRange >= maxRange) return;
    initializeRound(alternateRounds);
  }, [players, minRange, maxRange, initializeRound, alternateRounds]);

  const submitRpsChoice = useCallback(
    (choice: RPSChoice) => {
      if (choice === null) return;
      setPendingRpsChoice(null);
      const nextChoices = { ...rpsChoices, [rpsPhasePlayerIndex]: choice };
      setRpsChoices(nextChoices);

      if (rpsPhasePlayerIndex === 0) {
        setRpsPhasePlayerIndex(1);
      } else {
        // Both players made choices, determine winner
        const choice1 = nextChoices[0];
        const choice2 = nextChoices[1];

        let firstGuesser = 0;
        if (choice1 === choice2) {
          // Tie, show tie page before replay.
          setPhase("rps-tie");
        } else if (
          (choice1 === "rock" && choice2 === "scissors") ||
          (choice1 === "paper" && choice2 === "rock") ||
          (choice1 === "scissors" && choice2 === "paper")
        ) {
          firstGuesser = 0;
          setCurrentGuesserIndex(firstGuesser);
          setPhase("set-numbers");
        } else {
          firstGuesser = 1;
          setCurrentGuesserIndex(firstGuesser);
          setPhase("set-numbers");
        }
      }
    },
    [rpsPhasePlayerIndex, rpsChoices]
  );

  const continueRpsAfterTie = useCallback(() => {
    setRpsChoices({ 0: null, 1: null });
    setRpsPhasePlayerIndex(0);
    setPendingRpsChoice(null);
    setPhase("first-turn-selection");
  }, []);

  const submitSecretNumber = useCallback(() => {
    const value = Number(secretInput);
    if (!Number.isInteger(value) || value < minRange || value > maxRange) return;

    const nextSecrets = { ...secretNumbers, [numberBeingSet]: value };
    setSecretNumbers(nextSecrets);
    setSecretInput("");

    if (numberBeingSet === 0) {
      setNumberBeingSet(1);
    } else {
      // Both numbers set, move to guessing phase
      setPhase("guessing");
    }
  }, [secretInput, minRange, maxRange, numberBeingSet, secretNumbers]);

  const submitGuess = useCallback(() => {
    if (secretNumbers[1 - currentGuesserIndex] === null) return;

    const guess = Number(guessInput);
    if (!Number.isInteger(guess) || guess < minRange || guess > maxRange) return;

    const actualNumber = secretNumbers[1 - currentGuesserIndex]!;
    let hint = "";
    if (guess === actualNumber) {
      hint = "Correct!";
    } else {
      hint = guess < actualNumber ? "Too low" : "Too high";
    }

    const nextHistory = [
      ...guessHistory,
      {
        playerIndex: currentGuesserIndex,
        playerName: players[currentGuesserIndex],
        guess,
        hint,
      },
    ];
    setGuessHistory(nextHistory);

    if (guess === actualNumber) {
      setWinner(players[currentGuesserIndex]);
      setPhase("result");
    } else {
      setGuessInput("");
      setCurrentGuesserIndex(1 - currentGuesserIndex);
    }
  }, [secretNumbers, guessInput, minRange, maxRange, currentGuesserIndex, guessHistory, players]);

  const playAgain = useCallback(() => {
    setAlternateRounds((prev) => {
      const next = prev + 1;
      initializeRound(next);
      return next;
    });
  }, [initializeRound]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {phase === "setup" && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-6 pb-4">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold">Guess The Number</h1>
          </div>

          <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className="text-center mb-8 mt-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">2-Player Guess Duel</h2>
              <p className="text-muted-foreground text-sm">Set a secret number, then take turns guessing. First to crack it wins.</p>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={newPlayer}
                onChange={(event) => setNewPlayer(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && addPlayer()}
                placeholder="Enter player name..."
                className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <Button onClick={addPlayer} size="icon" className="bg-primary/15 text-primary hover:bg-primary/25 rounded-xl h-[46px] w-[46px]" disabled={players.length >= 2}>
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

            <div className="bg-card rounded-2xl border border-border p-5 mb-4">
              <label className="text-xs font-mono text-muted-foreground mb-3 block">NUMBER RANGE</label>
              <div className="space-y-2 mb-3">
                <input
                  type="number"
                  step={1}
                  value={minRange}
                  onChange={(event) => setMinRange(parseIntegerInput(event.target.value, minRange))}
                  placeholder="Min"
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="number"
                  step={1}
                  value={maxRange}
                  onChange={(event) => setMaxRange(parseIntegerInput(event.target.value, maxRange))}
                  placeholder="Max"
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{minRange} - {maxRange}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 mb-6">
              <label className="text-xs font-mono text-muted-foreground mb-3 block">WHO GUESSES FIRST?</label>
              <div className="space-y-2">
                <button
                  onClick={() => setFirstTurnMode("random")}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    firstTurnMode === "random"
                      ? "bg-primary/15 text-primary border border-primary/40"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  Random
                </button>
                <button
                  onClick={() => setFirstTurnMode("alternate")}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    firstTurnMode === "alternate"
                      ? "bg-primary/15 text-primary border border-primary/40"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  Alternate (switch every game)
                </button>
                <button
                  onClick={() => setFirstTurnMode("democratic")}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    firstTurnMode === "democratic"
                      ? "bg-primary/15 text-primary border border-primary/40"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  Democratic (both guess first in a quick rock-paper-scissors)
                </button>
              </div>
            </div>

            <Button
              size="xl"
              onClick={startGame}
              disabled={players.length !== 2 || minRange >= maxRange}
              className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20"
            >
              <Play className="w-5 h-5" /> Start Game
            </Button>
            {players.length !== 2 && <p className="text-center text-muted-foreground text-xs font-mono mt-3">Add exactly 2 players to continue.</p>}
          </div>
        </div>
      )}

      {phase === "first-turn-selection" && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-6 pb-4">
            <button onClick={resetEverything} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold">Rock, Paper, Scissors</h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
            <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
              <p className="text-sm text-muted-foreground mb-1">First to guess:</p>
              <p className="font-display text-2xl font-bold mb-6">
                {rpsPhasePlayerIndex === 0 ? player1Name : player2Name}
              </p>

              <div className="space-y-2 mb-6">
                <button
                  onClick={() => setPendingRpsChoice("rock")}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors font-medium text-sm ${
                    pendingRpsChoice === "rock"
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-card hover:bg-card/80 border-border"
                  }`}
                >
                  ✊ Rock
                </button>
                <button
                  onClick={() => setPendingRpsChoice("paper")}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors font-medium text-sm ${
                    pendingRpsChoice === "paper"
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-card hover:bg-card/80 border-border"
                  }`}
                >
                  ✋ Paper
                </button>
                <button
                  onClick={() => setPendingRpsChoice("scissors")}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors font-medium text-sm ${
                    pendingRpsChoice === "scissors"
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-card hover:bg-card/80 border-border"
                  }`}
                >
                  ✌️ Scissors
                </button>
              </div>

              <Button
                size="xl"
                onClick={() => submitRpsChoice(pendingRpsChoice)}
                disabled={pendingRpsChoice === null}
                className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20 mb-4"
              >
                Confirm Choice
              </Button>

              <p className="text-xs text-muted-foreground font-mono">
                {rpsPhasePlayerIndex === 1 && rpsChoices[0] ? `${player1Name} has chosen. Now your turn.` : "Choose then confirm your move..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === "rps-tie" && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-6 pb-4">
            <button onClick={resetEverything} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold">Rock, Paper, Scissors</h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
            <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
              <h2 className="font-display text-2xl font-bold mb-2">It's a Tie!</h2>
              <p className="text-muted-foreground text-sm mb-6">Both players chose {rpsChoices[0]}.</p>

              <div className="bg-card rounded-2xl border border-border p-4 text-left mb-6 space-y-2">
                <p className="text-sm"><span className="font-semibold">{player1Name}:</span> {rpsChoices[0]}</p>
                <p className="text-sm"><span className="font-semibold">{player2Name}:</span> {rpsChoices[1]}</p>
              </div>

              <Button size="xl" onClick={continueRpsAfterTie} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                Play R/P/S Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {phase === "set-numbers" && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-6 pb-4">
            <button onClick={resetEverything} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold">Set Secret Numbers</h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
            <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
              <h2 className="font-display text-2xl font-bold mb-2">{players[numberBeingSet]}, Pick Your Secret</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter a number between {minRange} and {maxRange}</p>

              <input
                type="password"
                inputMode="numeric"
                min={minRange}
                max={maxRange}
                value={secretInput}
                onChange={(event) => setSecretInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submitSecretNumber()}
                placeholder="Secret number"
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
              />

              <Button size="xl" onClick={submitSecretNumber} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                Lock In
              </Button>

              <p className="text-xs text-muted-foreground mt-4">Progress: {numberBeingSet + 1} / 2</p>
            </div>
          </div>
        </div>
      )}

      {phase === "guessing" && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-6 pb-4">
            <button onClick={resetEverything} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold">{players[currentGuesserIndex]}'s Turn</h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
            <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
              <h2 className="font-display text-2xl font-bold mb-2">Guess the Number</h2>
              <p className="text-muted-foreground text-sm mb-6">Range: {minRange} - {maxRange}</p>

              {guessHistory.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-3 mb-6 max-h-32 overflow-y-auto">
                  <p className="text-xs font-mono text-muted-foreground text-left mb-2">History:</p>
                  {guessHistory.map((entry, idx) => (
                    <p key={idx} className="text-xs font-mono text-left">
                      <span className="font-semibold">{entry.playerName}:</span> {entry.guess} ({entry.hint})
                    </p>
                  ))}
                </div>
              )}

              <input
                type="number"
                inputMode="numeric"
                min={minRange}
                max={maxRange}
                value={guessInput}
                onChange={(event) => setGuessInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submitGuess()}
                placeholder="Enter your guess"
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
              />

              <Button size="xl" onClick={submitGuess} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
                Guess
              </Button>
            </div>
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-6 pb-4">
            <h1 className="font-display text-xl font-bold">Game Over</h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
            <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
              <h2 className="font-display text-2xl font-bold mb-2">🎉 {winner} Wins!</h2>
              <p className="text-muted-foreground text-sm mb-6">Guessed it in {guessHistory.filter((g) => g.playerName === winner).length} attempt(s)</p>

              <div className="bg-card rounded-2xl border border-border p-4 text-left mb-6 space-y-2 max-h-40 overflow-y-auto">
                {guessHistory.map((entry, idx) => (
                  <p key={idx} className="text-xs font-mono">
                    <span className="font-semibold">{entry.playerName}:</span> {entry.guess} <span className={entry.hint === "Correct!" ? "text-primary font-bold" : "text-muted-foreground"}>{entry.hint}</span>
                  </p>
                ))}
              </div>

              <div className="space-y-3">
                <Button size="lg" onClick={playAgain} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
                <Button size="lg" variant="outline" onClick={resetEverything} className="w-full">
                  <ArrowLeft className="w-4 h-4" /> Back to Config
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuessTheNumber;
