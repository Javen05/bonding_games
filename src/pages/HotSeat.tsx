import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, UserPlus, Shuffle, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const hotSeatQuestions = [
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

  const spin = useCallback(() => {
    if (players.length < 2) return;
    setIsSpinning(true);
    
    // Quick shuffle animation
    let count = 0;
    const interval = setInterval(() => {
      setCurrentPlayer(players[Math.floor(Math.random() * players.length)]);
      count++;
      if (count > 12) {
        clearInterval(interval);
        const finalPlayer = players[Math.floor(Math.random() * players.length)];
        const finalQuestion = hotSeatQuestions[Math.floor(Math.random() * hotSeatQuestions.length)];
        setCurrentPlayer(finalPlayer);
        setCurrentQuestion(finalQuestion);
        setIsSpinning(false);
        setAnimKey((k) => k + 1);
      }
    }, 80);
  }, [players]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Hot Seat</h1>
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
