import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, MessageCircle, HelpCircle, Zap, Users, ChevronRight } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  players: string;
  icon: React.ReactNode;
  colorClass: string;
  glowClass: string;
  path: string;
  delay: number;
}

const GameCard = ({ title, description, players, icon, colorClass, glowClass, path, delay }: GameCardProps) => {
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
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-1" />
      </div>
      <h3 className="font-display text-xl font-bold mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{description}</p>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <Users className="w-3.5 h-3.5" />
        <span>{players}</span>
      </div>
    </button>
  );
};

const games = [
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
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center"
        style={{ animation: "slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono mb-6 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          BUNK GAMES
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-3">
          Kill Time,<br />
          <span className="text-primary">Not Each Other</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Party games built for bunk life. No WiFi needed,
          just your section and some guts.
        </p>
      </header>

      {/* Game Grid */}
      <main className="px-6 pb-16 max-w-lg mx-auto">
        <div className="grid gap-4">
          {games.map((game, i) => (
            <GameCard key={game.title} {...game} delay={100 + i * 80} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 text-xs text-muted-foreground font-mono"
        style={{ animation: "slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards", animationDelay: "500ms", opacity: 0 }}>
        Made for NSFs, by NSFs 🫡
      </footer>
    </div>
  );
};

export default Index;
