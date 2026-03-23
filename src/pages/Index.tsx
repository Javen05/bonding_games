import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, MessageCircle, HelpCircle, Zap, Users, ChevronRight, EyeOff, Search, Star, Infinity as InfinityIcon, Moon, Vote, Bomb, Shield } from "lucide-react";

const FAVORITE_GAMES_STORAGE_KEY = "favorite_games";

interface GameItem {
  title: string;
  description: string;
  players: string;
  icon: React.ReactNode;
  colorClass: string;
  glowClass: string;
  path: string;
  category: "social" | "callout" | "deduction" | "competitive" | "chaos";
  tags: string[];
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
  tags: string[];
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
  tags,
  delay,
}: GameCardProps) => {
  const navigate = useNavigate();
  const [pressed, setPressed] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(path)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(path);
        }
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className={`group relative w-full text-left rounded-2xl bg-card border border-border p-6 transition-all duration-300 hover:border-transparent hover:shadow-2xl ${glowClass} ${pressed ? "scale-[0.97]" : "hover:scale-[1.02]"}`}
      style={{ animationDelay: `${delay}ms`, animation: "slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards", opacity: 0 }}
      aria-label={`Open ${title}`}
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
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] uppercase tracking-wide font-mono px-2 py-1 rounded-full bg-secondary text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <Users className="w-3.5 h-3.5" />
        <span>{players}</span>
      </div>
      {showFavoritePulse && (
        <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-amber-500/15 text-amber-500 font-mono">
          Favorite
        </div>
      )}
    </div>
  );
};

const games: GameItem[] = [
  {
    title: "Truth or Dare",
    description: "Spill secrets or take on wild dares.",
    players: "2–20 players",
    icon: <Shield className="w-6 h-6" />,
    colorClass: "bg-blue-500/15 text-blue-300",
    glowClass: "hover:shadow-blue-300/15",
    path: "/truth-or-dare",
    category: "social",
    tags: ["social", "casual"],
  },
  {
    title: "Never Have I Ever",
    description: "Find out who's lived the wildest life. Put your fingers down one by one.",
    players: "3–20 players",
    icon: <MessageCircle className="w-6 h-6" />,
    colorClass: "bg-blue-500/15 text-blue-300",
    glowClass: "hover:shadow-blue-300/15",
    path: "/never-have-i-ever",
    category: "social",
    tags: ["social", "stories"],
  },
  {
    title: "Would You Rather",
    description: "Two impossible choices. Debate with your section mates till lights out.",
    players: "2–20 players",
    icon: <HelpCircle className="w-6 h-6" />,
    colorClass: "bg-blue-500/15 text-blue-300",
    glowClass: "hover:shadow-blue-300/15",
    path: "/would-you-rather",
    category: "social",
    tags: ["social", "debate"],
  },
  {
    title: "Hot Seat",
    description: "One person gets grilled. Random questions, nowhere to hide.",
    players: "3–20 players",
    icon: <Zap className="w-6 h-6" />,
    colorClass: "bg-teal-400/15 text-teal-300",
    glowClass: "hover:shadow-teal-300/15",
    path: "/hot-seat",
    category: "callout",
    tags: ["selected player", "questions"],
  },
  {
    title: "Word Imposter",
    description: "One word, one liar. Describe without revealing — find the fake.",
    players: "3–20 players",
    icon: <EyeOff className="w-6 h-6" />,
    colorClass: "bg-rose-500/15 text-rose-400",
    glowClass: "hover:shadow-rose-400/15",
    path: "/word-imposter",
    category: "deduction",
    tags: ["deduction", "bluff"],
  },
  {
    title: "Infinite Tic Tac Toe",
    description: "2 players only. After your 4th move, your oldest mark disappears. Keep playing till someone wins.",
    players: "2 players",
    icon: <InfinityIcon className="w-6 h-6" />,
    colorClass: "bg-amber-400/15 text-amber-300",
    glowClass: "hover:shadow-amber-300/15",
    path: "/infinite-tic-tac-toe",
    category: "competitive",
    tags: ["competitive", "2 players"],
  },
  {
    title: "Werewolf",
    description: "Social deduction with optional Doctor and Seer, plus scalable werewolf count.",
    players: "5+ players",
    icon: <Moon className="w-6 h-6" />,
    colorClass: "bg-red-500/15 text-red-400",
    glowClass: "hover:shadow-red-400/15",
    path: "/werewolf",
    category: "deduction",
    tags: ["deduction", "advanced"],
  },
  {
    title: "Pass The Heat",
    description: "Rapid pass-and-play prompts with timer pressure and instant penalties.",
    players: "2+ players",
    icon: <Flame className="w-6 h-6" />,
    colorClass: "bg-orange-500/15 text-orange-400",
    glowClass: "hover:shadow-orange-400/15",
    path: "/pass-the-heat",
    category: "chaos",
    tags: ["chaos", "timer"],
  },
  {
    title: "Callout Clash",
    description: "Callout the player that resonates best with the statement.",
    players: "3+ players",
    icon: <Vote className="w-6 h-6" />,
    colorClass: "bg-teal-400/15 text-teal-300",
    glowClass: "hover:shadow-teal-300/15",
    path: "/vote-or-sip",
    category: "callout",
    tags: ["selected player", "voting"],
  },
  {
    title: "Chain Reaction",
    description: "Yapping session with rules to escalate chaos every few turns.",
    players: "3+ players",
    icon: <Bomb className="w-6 h-6" />,
    colorClass: "bg-orange-500/15 text-orange-400",
    glowClass: "hover:shadow-orange-400/15",
    path: "/chain-reaction",
    category: "chaos",
    tags: ["chaos", "rules"],
  },
];

const gameFilters = [
  { value: "all", label: "All" },
  { value: "social", label: "Social" },
  { value: "callout", label: "Callout" },
  { value: "deduction", label: "Deduction" },
  { value: "competitive", label: "Competitive" },
  { value: "chaos", label: "Chaos" },
] as const;

type GameFilterValue = (typeof gameFilters)[number]["value"];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteGamePaths, setFavoriteGamePaths] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<GameFilterValue>("all");

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
    const matchesSearch =
      !normalizedSearch ||
      game.title.toLowerCase().includes(normalizedSearch) ||
      game.description.toLowerCase().includes(normalizedSearch) ||
      game.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

    const matchesFilter = activeFilter === "all" || game.category === activeFilter;
    return matchesSearch && matchesFilter;
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

          <div className="mt-3 flex flex-wrap gap-2">
            {gameFilters.map((filter) => {
              const selected = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${selected ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="mt-2 text-[11px] text-muted-foreground font-mono">
            Icon strategy: blue = Social, teal = Callout, red = deduction/advanced, amber = competitive, orange = chaos.
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
