import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, MessageCircle, HelpCircle, Zap, Users, ChevronRight, EyeOff, Search, Star, Infinity as InfinityIcon, Moon } from "lucide-react";

const FAVORITE_GAMES_STORAGE_KEY = "favorite_games";

interface GameItem {
  title: string;
  description: string;
  players: string;
  icon: React.ReactNode;
  colorClass: string;
  glowClass: string;
  path: string;
}

interface GameCardProps {
  game: GameItem;
  isFavorite: boolean;
  onToggleFavorite: (path: string) => void;
  showFavoritePulse?: boolean;
  title: string;
  description: string;
  players: string;
  icon: React.ReactNode;
  colorClass: string;
  glowClass: string;
  path: string;
  delay: number;
}

const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  showFavoritePulse,
  title,
  description,
  players,
  icon,
  colorClass,
  glowClass,
  path,
  delay,
}: GameCardProps) => {
  const navigate = useNavigate();
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={() => navigate(path)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className={`group relative w-full text-left rounded-2xl bg-card border border-border p-6 transition-all duration-300 hover:border-transparent hover:shadow-2xl ${glowClass} ${pressed ? "scale-[0.97]" : "hover:scale-[1.02]"}`}
      style={{ animationDelay: `${delay}ms`, animation: "slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards", opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(path);
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isFavorite ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
            title={isFavorite ? "Remove favorite" : "Add to favorites"}
          >
            <Star className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-1" />
        </div>
      </div>
      <h3 className="font-display text-xl font-bold mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{description}</p>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <Users className="w-3.5 h-3.5" />
        <span>{players}</span>
      </div>
      {showFavoritePulse && (
        <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-amber-500/15 text-amber-500 font-mono">
          Favorite
        </div>
      )}
    </button>
  );
};

const games: GameItem[] = [
  {
    title: "Truth or Dare",
    description: "Classic bunk game. Spill secrets or take on wild dares — NSF edition.",
    players: "2–20 players",
    icon: <Flame className="w-6 h-6" />,
    colorClass: "bg-game-truth/15 text-game-truth",
    glowClass: "hover:shadow-game-truth/10",
    path: "/truth-or-dare",
  },
  {
    title: "Never Have I Ever",
    description: "Find out who's lived the wildest life. Put your fingers down one by one.",
    players: "3–20 players",
    icon: <MessageCircle className="w-6 h-6" />,
    colorClass: "bg-game-never/15 text-game-never",
    glowClass: "hover:shadow-game-never/10",
    path: "/never-have-i-ever",
  },
  {
    title: "Would You Rather",
    description: "Two impossible choices. Debate with your section mates till lights out.",
    players: "2–20 players",
    icon: <HelpCircle className="w-6 h-6" />,
    colorClass: "bg-game-wyr/15 text-game-wyr",
    glowClass: "hover:shadow-game-wyr/10",
    path: "/would-you-rather",
  },
  {
    title: "Hot Seat",
    description: "One person gets grilled. Random questions, nowhere to hide.",
    players: "3–20 players",
    icon: <Zap className="w-6 h-6" />,
    colorClass: "bg-game-hotseat/15 text-game-hotseat",
    glowClass: "hover:shadow-game-hotseat/10",
    path: "/hot-seat",
  },
  {
    title: "Word Imposter",
    description: "One word, one liar. Describe without revealing — find the fake.",
    players: "3–20 players",
    icon: <EyeOff className="w-6 h-6" />,
    colorClass: "bg-primary/15 text-primary",
    glowClass: "hover:shadow-primary/10",
    path: "/word-imposter",
  },
  {
    title: "Infinite Tic Tac Toe",
    description: "2 players only. After your 4th move, your oldest mark disappears. Keep playing till someone wins.",
    players: "2 players",
    icon: <InfinityIcon className="w-6 h-6" />,
    colorClass: "bg-game-dare/15 text-game-dare",
    glowClass: "hover:shadow-game-dare/10",
    path: "/infinite-tic-tac-toe",
  },
  {
    title: "Werewolf",
    description: "Moderator-led social deduction with optional Doctor and Seer, plus scalable werewolf count.",
    players: "5+ players",
    icon: <Moon className="w-6 h-6" />,
    colorClass: "bg-game-hotseat/15 text-game-hotseat",
    glowClass: "hover:shadow-game-hotseat/10",
    path: "/werewolf",
  },
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteGamePaths, setFavoriteGamePaths] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITE_GAMES_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setFavoriteGamePaths(parsed.filter((item) => typeof item === "string"));
      }
    } catch {
      setFavoriteGamePaths([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITE_GAMES_STORAGE_KEY, JSON.stringify(favoriteGamePaths));
  }, [favoriteGamePaths]);

  const toggleFavorite = (path: string) => {
    setFavoriteGamePaths((prev) => {
      if (prev.includes(path)) {
        return prev.filter((item) => item !== path);
      }
      return [...prev, path];
    });
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredGames = games.filter((game) => {
    if (!normalizedSearch) return true;
    return (
      game.title.toLowerCase().includes(normalizedSearch) ||
      game.description.toLowerCase().includes(normalizedSearch)
    );
  });

  const visibleGames = filteredGames.filter((game) => {
    if (!showFavoritesOnly) return true;
    return favoriteGamePaths.includes(game.path);
  });

  const favoriteCount = favoriteGamePaths.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center"
        style={{ animation: "slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 bg-card border border-border flex items-center justify-center shadow-sm">
          <img src={`${import.meta.env.BASE_URL}app-logo.svg`} alt="Social Games logo" className="w-12 h-12" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono mb-6 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          OFFLINE SOCIAL GAMES
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-3">
          Kill Time,<br />
          <span className="text-primary">Not Each Other</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Party games for passing time with friends. No WiFi needed,
          just human connection and some guts.
        </p>
      </header>

      {/* Search + Game Grid */}
      <main className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="max-w-xl mx-auto mb-7"
          style={{ animation: "slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards", animationDelay: "120ms", opacity: 0 }}>
          <label htmlFor="game-search" className="sr-only">Search games</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="game-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search games by name or vibe..."
              className="w-full rounded-xl border border-border bg-card pl-10 pr-3 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <button
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full border transition-colors ${showFavoritesOnly ? "border-amber-500/50 bg-amber-500/10 text-amber-500" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {showFavoritesOnly ? "Showing favorites" : "Show favorites only"}
            </button>
            <div className="font-mono text-muted-foreground">
              {favoriteCount} favorite{favoriteCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleGames.map((game, i) => (
            <GameCard
              key={game.title}
              game={game}
              {...game}
              isFavorite={favoriteGamePaths.includes(game.path)}
              onToggleFavorite={toggleFavorite}
              showFavoritePulse={favoriteGamePaths.includes(game.path)}
              delay={140 + i * 70}
            />
          ))}
        </div>

        {visibleGames.length === 0 && (
          <div className="mt-7 text-center text-sm text-muted-foreground">
            {showFavoritesOnly
              ? "No favorite games found. Tap the star on a game card to save one."
              : `No games found for "${searchTerm}".`}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 text-xs text-muted-foreground font-mono"
        style={{ animation: "slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards", animationDelay: "500ms", opacity: 0 }}>
        <div className="flex items-center justify-center gap-3">
          <span>Built for real-world hangouts.</span>
          <span className="text-border">|</span>
          <Link to="/socials" className="text-primary hover:underline underline-offset-4">
            Socials
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
