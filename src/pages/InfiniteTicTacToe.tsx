import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Player = "X" | "O";

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const EMPTY_BOARD: Array<Player | null> = Array(9).fill(null);

const getWinningLine = (board: Array<Player | null>): number[] | null => {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return null;
};

const InfiniteTicTacToe = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Array<Player | null>>(EMPTY_BOARD);
  const [turn, setTurn] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [moveQueue, setMoveQueue] = useState<Record<Player, number[]>>({ X: [], O: [] });
  const [removalTile, setRemovalTile] = useState<4 | 5>(4);
  const [showNextToRemove, setShowNextToRemove] = useState(true);

  const activeLimit = removalTile - 1;

  const resetGame = () => {
    setBoard(EMPTY_BOARD);
    setTurn("X");
    setWinner(null);
    setWinningLine([]);
    setMoveQueue({ X: [], O: [] });
  };

  const handleCellClick = (cellIndex: number) => {
    if (winner || board[cellIndex] !== null) return;

    const nextBoard = [...board];
    const nextQueue = {
      X: [...moveQueue.X],
      O: [...moveQueue.O],
    };

    if (nextQueue[turn].length >= activeLimit) {
      const oldestMove = nextQueue[turn].shift();
      if (oldestMove !== undefined) {
        nextBoard[oldestMove] = null;
      }
    }

    nextBoard[cellIndex] = turn;
    nextQueue[turn].push(cellIndex);

    const line = getWinningLine(nextBoard);
    setBoard(nextBoard);
    setMoveQueue(nextQueue);

    if (line) {
      setWinner(turn);
      setWinningLine(line);
      return;
    }

    setTurn(turn === "X" ? "O" : "X");
  };

  const xOldest = moveQueue.X[0];
  const oOldest = moveQueue.O[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Infinite Tic Tac Toe</h1>
        <Button variant="outline" size="sm" className="ml-auto" onClick={resetGame}>
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      <div className="flex-1 px-6 pb-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-md text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono mb-3">
            <InfinityIcon className="w-3.5 h-3.5" />
            2 PLAYERS ONLY
          </div>
          <h2 className="font-display text-3xl font-bold mb-2">No Draws. Keep Playing.</h2>
          <p className="text-sm text-muted-foreground">
            Players alternate placing marks. Set whether removal starts on the 4th or 5th placement.
          </p>
        </div>

        <div className="w-full max-w-md rounded-xl border border-border bg-card p-3 mb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Remove on:</span>
            <Button
              size="sm"
              variant={removalTile === 4 ? "default" : "outline"}
              onClick={() => {
                setRemovalTile(4);
                resetGame();
              }}
            >
              4th tile
            </Button>
            <Button
              size="sm"
              variant={removalTile === 5 ? "default" : "outline"}
              onClick={() => {
                setRemovalTile(5);
                resetGame();
              }}
            >
              5th tile
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono text-muted-foreground">Show next tile to remove</span>
            <Button
              size="sm"
              variant={showNextToRemove ? "default" : "outline"}
              onClick={() => setShowNextToRemove((prev) => !prev)}
            >
              {showNextToRemove ? "Shown" : "Hidden"}
            </Button>
          </div>
        </div>

        <div className="mb-5 text-center">
          {winner ? (
            <div className="flex flex-col items-center gap-3">
              <p className="font-display text-2xl font-bold text-primary">Player {winner} wins</p>
              <Button size="sm" onClick={resetGame}>
                Start New Game
              </Button>
            </div>
          ) : (
            <p className="font-display text-2xl font-bold">Player {turn}&apos;s turn</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {showNextToRemove
              ? "Rings show the next tile each player will lose on their next overflow move."
              : "Next-to-remove markers are hidden."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full max-w-xs sm:max-w-sm">
          {board.map((cell, index) => {
            const isWinningCell = winningLine.includes(index);
            const isOldestX = xOldest === index;
            const isOldestO = oOldest === index;

            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={winner !== null || cell !== null}
                className={`relative aspect-square rounded-xl border text-3xl sm:text-4xl font-display font-bold transition-all ${
                  isWinningCell
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card hover:bg-secondary disabled:hover:bg-card"
                } ${cell === "X" ? "text-game-truth" : ""} ${cell === "O" ? "text-game-never" : ""}`}
                aria-label={cell ? `Cell ${index + 1} contains ${cell}` : `Place on cell ${index + 1}`}
              >
                {cell}
                {showNextToRemove && isOldestX && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-game-truth" />
                )}
                {showNextToRemove && isOldestO && (
                  <span className="absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full border border-game-never" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InfiniteTicTacToe;
