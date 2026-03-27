import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Skull, Candy, RotateCcw, Play, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type GamePhase = "setup" | "poison-selection" | "playing" | "result";
type TurnOrderMode = "fixed" | "random" | "alternate";

interface CandyTile {
  id: number;
  isPoison: boolean;
  poisonOwners: string[];
  revealed: boolean;
  pickedBy: string | null;
}

interface EliminationEvent {
  player: string;
  tileId: number;
  poisonOwners: string[];
}

const PoisonCandy = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [boardSize, setBoardSize] = useState(24);
  const [poisonPerPlayer, setPoisonPerPlayer] = useState(2);
  const [poisonSelectionMode, setPoisonSelectionMode] = useState<"random" | "manual">("random");
  const [turnOrderMode, setTurnOrderMode] = useState<TurnOrderMode>("fixed");

  const [candies, setCandies] = useState<CandyTile[]>([]);
  const [alivePlayers, setAlivePlayers] = useState<string[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [nextStartingPlayerIndex, setNextStartingPlayerIndex] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<string>("");
  const [manualAssignments, setManualAssignments] = useState<Record<string, number[]>>({});
  const [manualSelectorIndex, setManualSelectorIndex] = useState(0);
  const [currentManualSelection, setCurrentManualSelection] = useState<number[]>([]);
  const [eliminationEvents, setEliminationEvents] = useState<EliminationEvent[]>([]);
  const [showKillReveal, setShowKillReveal] = useState(false);
  const [showBoardRevealPopup, setShowBoardRevealPopup] = useState(false);

  const totalPoison = players.length * poisonPerPlayer;
  const setupIsValid = players.length >= 2 && boardSize >= 2 && poisonPerPlayer >= 1 && totalPoison <= boardSize;

  const remainingCandies = useMemo(
    () => candies.filter((tile) => !tile.revealed).length,
    [candies]
  );

  const addPlayer = useCallback(() => {
    const name = newPlayer.trim();
    if (!name || players.includes(name)) return;
    setPlayers((prev) => [...prev, name]);
    setNewPlayer("");
  }, [newPlayer, players]);

  const removePlayer = useCallback((name: string) => {
    setPlayers((prev) => prev.filter((player) => player !== name));
  }, []);

  const startGame = useCallback(() => {
    if (!setupIsValid) return;

    const startIndex =
      turnOrderMode === "random"
        ? Math.floor(Math.random() * players.length)
        : turnOrderMode === "alternate"
          ? roundCount % players.length
          : 0;

    setNextStartingPlayerIndex(startIndex);
    setRoundCount((prev) => prev + 1);

    const initialBoard: CandyTile[] = Array.from({ length: boardSize }, (_, index) => ({
      id: index + 1,
      isPoison: false,
      poisonOwners: [],
      revealed: false,
      pickedBy: null,
    }));

    if (poisonSelectionMode === "manual") {
      setPhase("poison-selection");
      setCandies(initialBoard);
      setManualAssignments(players.reduce<Record<string, number[]>>((acc, player) => {
        acc[player] = [];
        return acc;
      }, {}));
      setManualSelectorIndex(0);
      setCurrentManualSelection([]);
      return;
    }

    // Random mode
    const availableIndices = Array.from({ length: boardSize }, (_, index) => index);

    for (let i = 0; i < totalPoison; i += 1) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const boardIndex = availableIndices[randomIndex];
      availableIndices.splice(randomIndex, 1);
      initialBoard[boardIndex].isPoison = true;
      // Random mode has no player ownership attribution.
      initialBoard[boardIndex].poisonOwners = [];
    }

    setCandies(initialBoard);
    setAlivePlayers([...players]);
    setActivePlayerIndex(startIndex);
    setEliminationEvents([]);
    setShowKillReveal(false);
    setShowBoardRevealPopup(false);
    setLastEvent("Game started. Pick carefully.");
    setPhase("playing");
  }, [setupIsValid, turnOrderMode, players.length, roundCount, boardSize, totalPoison, players, poisonPerPlayer, poisonSelectionMode]);

  const resetToSetup = useCallback(() => {
    setPhase("setup");
    setCandies([]);
    setAlivePlayers([]);
    setActivePlayerIndex(0);
    setNextStartingPlayerIndex(0);
    setRoundCount(0);
    setLastEvent("");
    setManualAssignments({});
    setManualSelectorIndex(0);
    setCurrentManualSelection([]);
    setEliminationEvents([]);
    setShowKillReveal(false);
    setShowBoardRevealPopup(false);
  }, []);

  const pickCandy = useCallback(
    (tileId: number) => {
      if (phase !== "playing") return;

      const currentPlayer = alivePlayers[activePlayerIndex];
      const selectedTile = candies.find((tile) => tile.id === tileId);
      if (!currentPlayer || !selectedTile || selectedTile.revealed) return;

      const updatedBoard = candies.map((tile) =>
        tile.id === tileId
          ? {
              ...tile,
              revealed: true,
              pickedBy: currentPlayer,
            }
          : tile
      );
      setCandies(updatedBoard);

      if (selectedTile.isPoison) {
        const survivors = alivePlayers.filter((name) => name !== currentPlayer);
        setAlivePlayers(survivors);
        setEliminationEvents((prev) => [
          ...prev,
          {
            player: currentPlayer,
            tileId,
            poisonOwners: selectedTile.poisonOwners,
          },
        ]);

        if (survivors.length <= 1 || updatedBoard.every((tile) => tile.revealed)) {
          setLastEvent(`${currentPlayer} picked poison and is out.`);
          setPhase("result");
          return;
        }

        const nextIndex = activePlayerIndex >= survivors.length ? 0 : activePlayerIndex;
        setActivePlayerIndex(nextIndex);
        setLastEvent(`${currentPlayer} picked poison and is eliminated.`);
        return;
      }

      if (updatedBoard.every((tile) => tile.revealed)) {
        setLastEvent(`${currentPlayer} picked a safe candy. No candies left.`);
        setPhase("result");
        return;
      }

      setActivePlayerIndex((index) => (index + 1) % alivePlayers.length);
      setLastEvent(`${currentPlayer} picked a safe candy.`);
    },
    [phase, alivePlayers, activePlayerIndex, candies]
  );

  const toggleManualTileSelection = useCallback(
    (tileId: number) => {
      setCurrentManualSelection((prev) => {
        if (prev.includes(tileId)) {
          return prev.filter((id) => id !== tileId);
        }
        if (prev.length >= poisonPerPlayer) return prev;
        return [...prev, tileId];
      });
    },
    [poisonPerPlayer]
  );

  const submitManualSelection = useCallback(() => {
    const currentSelector = players[manualSelectorIndex];
    if (!currentSelector) return;
    if (currentManualSelection.length !== poisonPerPlayer) return;

    const nextAssignments = {
      ...manualAssignments,
      [currentSelector]: [...currentManualSelection],
    };
    setManualAssignments(nextAssignments);

    if (manualSelectorIndex < players.length - 1) {
      setManualSelectorIndex((prev) => prev + 1);
      setCurrentManualSelection([]);
      return;
    }

    const ownerMap = new Map<number, string[]>();
    for (const player of players) {
      const picks = nextAssignments[player] ?? [];
      for (const pickedTileId of picks) {
        const owners = ownerMap.get(pickedTileId) ?? [];
        owners.push(player);
        ownerMap.set(pickedTileId, owners);
      }
    }

    const updatedBoard = candies.map((tile) => {
      const owners = ownerMap.get(tile.id) ?? [];
      return {
        ...tile,
        isPoison: owners.length > 0,
        poisonOwners: owners,
      };
    });

    setCandies(updatedBoard);
    setAlivePlayers([...players]);
    setActivePlayerIndex(nextStartingPlayerIndex);
    setCurrentManualSelection([]);
    setEliminationEvents([]);
    setShowKillReveal(false);
    setShowBoardRevealPopup(false);
    setLastEvent("Game started. Pick carefully.");
    setPhase("playing");
  }, [players, manualSelectorIndex, currentManualSelection, poisonPerPlayer, manualAssignments, candies, nextStartingPlayerIndex]);

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
          <h1 className="font-display text-xl font-bold">Poison Candy</h1>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="text-center mb-8 mt-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
              <Candy className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Build the Board</h2>
            <p className="text-muted-foreground text-sm">Min 2 players. No max. Hidden poison is distributed across candies.</p>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={newPlayer}
              onChange={(event) => setNewPlayer(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addPlayer()}
              placeholder="Enter name..."
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

          <div className="bg-card rounded-2xl border border-border p-5 mb-4">
            <label className="text-xs font-mono text-muted-foreground mb-2 block">CANDIES ON BOARD</label>
            <input
              type="number"
              min={2}
              step={1}
              value={boardSize}
              onChange={(event) => {
                const parsed = Math.trunc(Number(event.target.value));
                setBoardSize(Math.max(2, Number.isNaN(parsed) ? 2 : parsed));
              }}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 mb-6">
            <label className="text-xs font-mono text-muted-foreground mb-2 block">POISON CANDIES PER PLAYER</label>
            <input
              type="number"
              min={1}
              step={1}
              value={poisonPerPlayer}
              onChange={(event) => {
                const parsed = Math.trunc(Number(event.target.value));
                setPoisonPerPlayer(Math.max(1, Number.isNaN(parsed) ? 1 : parsed));
              }}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-xs text-muted-foreground mt-3 font-mono">
              Total poison: {totalPoison} / {boardSize}
            </p>
            {totalPoison > boardSize && (
              <p className="text-xs text-destructive mt-2">Total poison cannot be more than board size.</p>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 mb-6">
            <label className="text-xs font-mono text-muted-foreground mb-3 block">POISON PLACEMENT</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPoisonSelectionMode("random")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  poisonSelectionMode === "random"
                    ? "bg-primary/15 text-primary border border-primary/40"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Random
              </button>
              <button
                onClick={() => setPoisonSelectionMode("manual")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  poisonSelectionMode === "manual"
                    ? "bg-primary/15 text-primary border border-primary/40"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Player
              </button>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p><span className="font-semibold">Random:</span> The game decides poison tiles automatically.</p>
              <p><span className="font-semibold">Player:</span> Players choose poison tiles manually, one player at a time.</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 mb-6">
            <label className="text-xs font-mono text-muted-foreground mb-3 block">PLAYER TURN ORDER</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTurnOrderMode("fixed")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  turnOrderMode === "fixed"
                    ? "bg-primary/15 text-primary border border-primary/40"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Fixed
              </button>
              <button
                onClick={() => setTurnOrderMode("random")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  turnOrderMode === "random"
                    ? "bg-primary/15 text-primary border border-primary/40"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Random
              </button>
              <button
                onClick={() => setTurnOrderMode("alternate")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  turnOrderMode === "alternate"
                    ? "bg-primary/15 text-primary border border-primary/40"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Alternate
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-mono">
              {turnOrderMode === "fixed"
                ? `Starting player every game: ${players[0] ?? "Player 1"}`
                : turnOrderMode === "random"
                  ? "Starting player is random each game."
                  : "Starting player rotates each game."}
            </p>
          </div>

          <Button
            size="xl"
            onClick={startGame}
            disabled={!setupIsValid}
            className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20"
          >
            <Play className="w-5 h-5" /> Start Game
          </Button>
          {!setupIsValid && (
            <p className="text-center text-muted-foreground text-xs font-mono mt-3">
              Need at least 2 players and a valid poison-to-board ratio.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (phase === "poison-selection") {
    const currentSelector = players[manualSelectorIndex] ?? "";
    const currentSelectorPicks = currentManualSelection.length;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button
            onClick={resetToSetup}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Select Poison Tiles</h1>
        </div>

        <div className="flex-1 flex flex-col px-4 pb-12 w-full">
          <div className="text-center mb-6 mt-6">
            <p className="text-sm text-muted-foreground">{currentSelector} is selecting poison tiles</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Pick {currentSelectorPicks} / {poisonPerPlayer} for this player
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Previous players' picks are hidden. Pick your tiles, then submit.
            </p>
          </div>

          <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))" }}>
            {candies.map((tile) => (
              <button
                key={tile.id}
                onClick={() => toggleManualTileSelection(tile.id)}
                className={`aspect-square rounded-lg font-semibold text-xs transition-all ${
                  currentManualSelection.includes(tile.id)
                    ? "bg-destructive/20 text-destructive border border-destructive/40 ring-2 ring-destructive/40"
                    : "bg-card border border-border hover:bg-card/80"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  {currentManualSelection.includes(tile.id) ? <Skull className="w-4 h-4" /> : <span>{tile.id}</span>}
                </div>
              </button>
            ))}
          </div>

          <Button
            size="xl"
            onClick={submitManualSelection}
            disabled={currentManualSelection.length !== poisonPerPlayer}
            className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20"
          >
            <Play className="w-5 h-5" /> {manualSelectorIndex < players.length - 1 ? "Submit & Next Player" : "Submit & Start Game"}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "playing") {
    const currentPlayer = alivePlayers[activePlayerIndex] ?? "";

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button
            onClick={resetToSetup}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Poison Candy</h1>
        </div>

        <div className="flex-1 px-4 pb-10 w-full">
          <div className="bg-card rounded-2xl border border-border p-4 mb-4">
            <p className="text-xs font-mono text-muted-foreground">CURRENT TURN</p>
            <p className="font-display text-2xl font-bold">{currentPlayer}</p>
            <p className="text-xs text-muted-foreground mt-1">Alive: {alivePlayers.join(", ")}</p>
            <p className="text-xs text-muted-foreground mt-1">Candies left: {remainingCandies}</p>
            {lastEvent && <p className="text-sm mt-3">{lastEvent}</p>}
          </div>

          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))" }}>
            {candies.map((tile) => (
              <button
                key={tile.id}
                onClick={() => pickCandy(tile.id)}
                disabled={tile.revealed}
                className={`aspect-square rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                  tile.revealed
                    ? tile.isPoison
                      ? "bg-destructive/15 border-destructive/30 text-destructive"
                      : "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                    : "bg-secondary border-border hover:border-primary/30"
                }`}
              >
                {tile.revealed ? (
                  tile.isPoison ? <Skull className="w-4 h-4 mx-auto" /> : <Candy className="w-4 h-4 mx-auto" />
                ) : (
                  tile.id
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const winners = alivePlayers;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <h1 className="font-display text-xl font-bold">Game Result</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center max-w-sm w-full" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          <div className="w-16 h-16 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto mb-6">
            <Skull className="w-8 h-8" />
          </div>

          <h2 className="font-display text-2xl font-bold mb-2">
            {winners.length === 1 ? `${winners[0]} Wins!` : "No Single Winner"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {winners.length === 1
              ? "Everyone else got poisoned."
              : winners.length > 1
                ? `${winners.join(", ")} survived until the board ended.`
                : "Nobody survived this round."}
          </p>

          <div className="bg-card rounded-2xl border border-border p-4 text-left mb-6">
            <p className="text-xs font-mono text-muted-foreground mb-2">ROUND SUMMARY</p>
            <p className="text-sm">Poison candies are hidden. Use reveal options below.</p>
          </div>

          <div className="space-y-3">
            <Button size="lg" onClick={() => setShowKillReveal((prev) => !prev)} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
              <Skull className="w-4 h-4" /> {showKillReveal ? "Hide Kill Details" : "Reveal Which Candy Killed Players"}
            </Button>
            {showKillReveal && (
              <div className="bg-card rounded-2xl border border-border p-4 text-left">
                <p className="text-xs font-mono text-muted-foreground mb-2">KILL LOG</p>
                {eliminationEvents.length === 0 ? (
                  <p className="text-sm">No player was eliminated by poison this round.</p>
                ) : (
                  <div className="space-y-2">
                    {eliminationEvents.map((event, idx) => (
                      <p key={`${event.player}-${idx}`} className="text-sm">
                        {event.player} died at candy #{event.tileId}
                        {event.poisonOwners.length > 0 ? ` (poison by ${event.poisonOwners.join(", ")})` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button size="lg" onClick={() => setShowBoardRevealPopup(true)} className="w-full bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20">
              <Candy className="w-4 h-4" /> Reveal Board Candy Locations
            </Button>

            <Button size="lg" onClick={startGame} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80" disabled={!setupIsValid}>
              <RotateCcw className="w-4 h-4" /> New Round
            </Button>
            <Button size="lg" variant="outline" onClick={resetToSetup} className="w-full">
              <ArrowLeft className="w-4 h-4" /> Back to Setup
            </Button>
          </div>
        </div>
      </div>

      {showBoardRevealPopup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[90vh] bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-display text-lg font-bold">Board Reveal</h3>
              <button
                onClick={() => setShowBoardRevealPopup(false)}
                className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-64px)]">
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(62px, 1fr))" }}>
                {candies.map((tile) => (
                  <div
                    key={tile.id}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-[10px] font-semibold ${
                      tile.isPoison
                        ? "bg-destructive/15 border-destructive/30 text-destructive"
                        : "bg-emerald-500/15 border-emerald-500/30 text-emerald-600"
                    }`}
                  >
                    <span className="text-[11px]">#{tile.id}</span>
                    {tile.isPoison ? <Skull className="w-3 h-3 mt-1" /> : <Candy className="w-3 h-3 mt-1" />}
                  </div>
                ))}
              </div>

              {candies.some((tile) => tile.isPoison && tile.poisonOwners.length > 0) && (
                <div className="mt-4 bg-secondary/50 rounded-xl p-3 border border-border">
                  <p className="text-xs font-mono text-muted-foreground mb-2">Poison Ownership</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {candies
                      .filter((tile) => tile.isPoison && tile.poisonOwners.length > 0)
                      .map((tile) => (
                        <p key={`owner-${tile.id}`} className="text-xs">
                          Candy #{tile.id}: {tile.poisonOwners.join(", ")}
                        </p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoisonCandy;
