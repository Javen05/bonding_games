import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, RotateCcw, Settings, Trash2, UserPlus, Users, Vote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCustomQuestion, getCustomQuestions, getMergedQuestions, removeCustomQuestion } from "@/lib/gameUtils";

const CALLOUT_CLASH_PROMPTS_KEY = "callout_clash_prompts";
const CALLOUT_CLASH_OUTCOMES_KEY = "callout_clash_outcomes";

const votePrompts = [
  "Who is most likely to survive one week with no phone?",
  "Who is most likely to accidentally start a fire while cooking?",
  "Who gives the best terrible advice?",
  "Who would dominate a reality show for all the wrong reasons?",
  "Who is most likely to text 'on my way' while still at home?",
  "Who is the biggest overthinker here?",
  "Who is most likely to laugh during a serious moment?",
  "Who could talk their way out of any trouble?",
  "Who is most likely to forget where they parked?",
  "Who would spend the most on impulse shopping?",
  "Who is most likely to get famous for something random?",
  "Who secretly has the strongest main character energy?",
  "Who is most likely to cancel plans last minute?",
  "Who would be best as group spokesperson?",
  "Who is most likely to become a meme?",
  "Who is most likely to keep a weird secret hobby?",
  "Who is most likely to flirt by accident?",
  "Who is most likely to disappear and then return with a story?",
  "Who would survive best in a zombie apocalypse?",
  "Who is most likely to keep snacks hidden from everyone?",
  "Who is most likely to cry during a sad movie?",
  "Who is most likely to get kicked out of a bar?",
];

const drinkOutcomes = [
  "Winner gives out 2 sips.",
  "Winner chooses one person to sip.",
  "Runner-up takes 1 sip.",
  "Everyone except winner takes 1 sip.",
  "Winner takes a victory sip.",
    "Winner assigns 2 sips to someone.",
    "Winner picks someone to take a sip with them.",
    "Runner-up gives out 1 sip.",
    "Everyone except winner takes 2 sips.",
    "Winner takes 2 sips.",
    "Winner assigns 3 sips to be distributed among players.",
    "Runner-up takes 2 sips.",
    "Everyone except winner takes 1 sip.",
    "Winner takes a celebratory sip.",
    "Winner gives out 1 sip.",
    "Winner picks someone to take a sip with them.",
    "Runner-up gives out 2 sips.",
    "Everyone except winner takes 2 sips.",
    "Winner takes 3 sips.",
];

const nonDrinkerOutcomes = [
  "Winner assigns 10 jumping jacks to someone.",
  "Runner-up does a dramatic confession in one sentence.",
  "Everyone except winner gives a compliment.",
  "Winner picks someone to do a 10-second impression.",
  "Group does a synchronized clap routine.",
    "Winner assigns 20 seconds of dancing to someone.",
    "Runner-up shares an embarrassing story in one sentence.",
    "Everyone except winner shares a fun fact about themselves.",
    "Winner picks someone to do a 20-second impression.",
    "Group does a quick group stretch.",
    "Winner assigns 15 seconds of singing to someone.",
    "Runner-up shares a guilty pleasure in one sentence.",
    "Everyone except winner shares a hidden talent.",
    "Winner picks someone to do a 15-second impression.",
        "Group does a quick group pose and takes a photo.",
        "Winner assigns 30 seconds of charades to someone.",
        "Runner-up shares a childhood memory in one sentence.",
        "Everyone except winner shares a favorite joke.",
        "Winner picks someone to do a 30-second impression.",
        "Group does a quick group dance and takes a video.",
        "Winner assigns 10 push-ups to someone.",
        "Runner-up shares a secret ambition in one sentence.",
        "Everyone except winner shares a favorite movie.",
        "Winner picks someone to do a 10-second impression.",
        "Group does a quick group cheer.",
        "Winner assigns 20 seconds of shadow puppets to someone.",
        "Runner-up shares a funny nickname they have.",
        "Everyone except winner shares a favorite song.",
        "Winner picks someone to do a 20-second impression.",
        "Group does a quick group chant.",
        "Winner assigns 15 seconds of mime to someone.",
        "Runner-up shares a weird food combination they enjoy.",
        "Everyone except winner shares a favorite TV show.",
        "Winner picks someone to do a 15-second impression.",
        "Group does a quick group pose and takes a photo.",
];

const CalloutClash = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [outcomeMode, setOutcomeMode] = useState<"mixed" | "normal" | "drinking">("normal");
  const [contentMode, setContentMode] = useState<"mixed" | "default-only" | "custom-only">("mixed");
  const [allPrompts, setAllPrompts] = useState<string[]>([]);
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);
  const [newCustomPrompt, setNewCustomPrompt] = useState("");
  const [customOutcomes, setCustomOutcomes] = useState<string[]>([]);
  const [newCustomOutcome, setNewCustomOutcome] = useState("");

  const randomFrom = (items: string[]) => items[Math.floor(Math.random() * items.length)];

  useEffect(() => {
    const custom = getCustomQuestions(CALLOUT_CLASH_PROMPTS_KEY);
    setCustomPrompts(custom);
    setAllPrompts(
      contentMode === "custom-only"
        ? custom
        : contentMode === "default-only"
          ? [...votePrompts]
          : getMergedQuestions(votePrompts, CALLOUT_CLASH_PROMPTS_KEY)
    );
    setCustomOutcomes(getCustomQuestions(CALLOUT_CLASH_OUTCOMES_KEY));
  }, [contentMode]);

  const addPlayer = useCallback(() => {
    const name = newPlayer.trim();
    if (name && !players.includes(name)) {
      setPlayers((prev) => [...prev, name]);
      setNewPlayer("");
    }
  }, [newPlayer, players]);

  const removePlayer = useCallback((name: string) => {
    setPlayers((prev) => prev.filter((p) => p !== name));
  }, []);

  const startRound = useCallback(() => {
    const nextPrompt = randomFrom(allPrompts);
    const emptyVotes = players.reduce<Record<string, number>>((acc, player) => {
      acc[player] = 0;
      return acc;
    }, {});

    setPrompt(nextPrompt);
    setVoteCounts(emptyVotes);
    setShowResult(false);
  }, [players, allPrompts]);

  const startGame = useCallback(() => {
    if (players.length < 3 || allPrompts.length === 0) return;
    setGameStarted(true);
    startRound();
  }, [players.length, allPrompts.length, startRound]);

  const addCustomPromptHandler = useCallback(() => {
    const value = newCustomPrompt.trim();
    if (!value) return;

    addCustomQuestion(CALLOUT_CLASH_PROMPTS_KEY, value);
    const custom = getCustomQuestions(CALLOUT_CLASH_PROMPTS_KEY);
    setCustomPrompts(custom);
    setAllPrompts(
      contentMode === "custom-only"
        ? custom
        : contentMode === "default-only"
          ? [...votePrompts]
          : getMergedQuestions(votePrompts, CALLOUT_CLASH_PROMPTS_KEY)
    );
    setNewCustomPrompt("");
  }, [newCustomPrompt, contentMode]);

  const removeCustomPromptHandler = useCallback((promptToRemove: string) => {
    removeCustomQuestion(CALLOUT_CLASH_PROMPTS_KEY, promptToRemove);
    const custom = getCustomQuestions(CALLOUT_CLASH_PROMPTS_KEY);
    setCustomPrompts(custom);
    setAllPrompts(
      contentMode === "custom-only"
        ? custom
        : contentMode === "default-only"
          ? [...votePrompts]
          : getMergedQuestions(votePrompts, CALLOUT_CLASH_PROMPTS_KEY)
    );
  }, [contentMode]);

  const addCustomOutcomeHandler = useCallback(() => {
    const value = newCustomOutcome.trim();
    if (!value) return;

    addCustomQuestion(CALLOUT_CLASH_OUTCOMES_KEY, value);
    setCustomOutcomes(getCustomQuestions(CALLOUT_CLASH_OUTCOMES_KEY));
    setNewCustomOutcome("");
  }, [newCustomOutcome]);

  const removeCustomOutcomeHandler = useCallback((outcomeToRemove: string) => {
    removeCustomQuestion(CALLOUT_CLASH_OUTCOMES_KEY, outcomeToRemove);
    setCustomOutcomes(getCustomQuestions(CALLOUT_CLASH_OUTCOMES_KEY));
  }, []);

  const castVote = useCallback((player: string) => {
    if (showResult) return;
    setVoteCounts((prev) => ({
      ...prev,
      [player]: (prev[player] ?? 0) + 1,
    }));
  }, [showResult]);

  const sortedResults = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
  const winner = sortedResults[0]?.[0] ?? "Social";
  const winnerVotes = sortedResults[0]?.[1] ?? 0;
  const baseOutcomePool =
    outcomeMode === "mixed"
      ? [...nonDrinkerOutcomes, ...drinkOutcomes]
      : outcomeMode === "drinking"
        ? drinkOutcomes
        : nonDrinkerOutcomes;
  const outcomePool =
    contentMode === "custom-only"
      ? customOutcomes
      : contentMode === "default-only"
        ? baseOutcomePool
        : [...baseOutcomePool, ...customOutcomes];
  const outcome = randomFrom(outcomePool);

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Callout Clash Settings</h1>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full overflow-y-auto">
          <div className="bg-card rounded-xl p-4 border border-border mt-6">
            <label className="text-xs font-medium text-muted-foreground">Outcome Type</label>
            <select
              value={outcomeMode}
              onChange={(e) => setOutcomeMode(e.target.value as "mixed" | "normal" | "drinking")}
              className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-wyr/40"
            >
              <option value="mixed">Drinking + Normal</option>
              <option value="normal">Normal Only</option>
              <option value="drinking">Drinking Only</option>
            </select>

            <div className="mt-4 pt-4 border-t border-border/60">
              <label className="text-xs font-medium text-muted-foreground">Content Source</label>
              <select
                value={contentMode}
                onChange={(e) => setContentMode(e.target.value as "mixed" | "default-only" | "custom-only")}
                className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-wyr/40"
              >
                <option value="mixed">Use ALL Data</option>
                <option value="default-only">BUILT-IN Data</option>
                <option value="custom-only">CUSTOM Data</option>
              </select>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border mt-4">
            <p className="font-semibold text-sm mb-3">Custom Prompts</p>

            <div className="flex gap-2 mb-3">
              <input
                value={newCustomPrompt}
                onChange={(e) => setNewCustomPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomPromptHandler()}
                placeholder="Add your own callout prompt..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-wyr/40"
              />
              <Button onClick={addCustomPromptHandler} size="sm" className="bg-game-wyr/15 text-game-wyr hover:bg-game-wyr/25">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {customPrompts.length > 0 ? (
              <div className="space-y-2">
                {customPrompts.map((customPrompt) => (
                  <div key={customPrompt} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                    <span className="flex-1">{customPrompt}</span>
                    <button onClick={() => removeCustomPromptHandler(customPrompt)} className="text-muted-foreground hover:text-destructive ml-2">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No custom prompts yet.</p>
            )}
          </div>

          <div className="bg-card rounded-xl p-4 border border-border mt-4">
            <p className="font-semibold text-sm mb-3">Custom Outcomes</p>

            <div className="flex gap-2 mb-3">
              <input
                value={newCustomOutcome}
                onChange={(e) => setNewCustomOutcome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomOutcomeHandler()}
                placeholder="Add outcome for both modes..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-wyr/40"
              />
              <Button onClick={addCustomOutcomeHandler} size="sm" className="bg-game-wyr/15 text-game-wyr hover:bg-game-wyr/25">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {customOutcomes.length > 0 ? (
              <div className="space-y-2">
                {customOutcomes.map((customOutcome) => (
                  <div key={customOutcome} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                    <span className="flex-1">{customOutcome}</span>
                    <button onClick={() => removeCustomOutcomeHandler(customOutcome)} className="text-muted-foreground hover:text-destructive ml-2">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No custom outcomes yet.</p>
            )}
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
          <h1 className="font-display text-xl font-bold">Callout Clash</h1>
          <button onClick={() => setShowSettings(true)} className="ml-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full">
          <div className="text-center mb-8 mt-8">
            <div className="w-16 h-16 rounded-2xl bg-game-wyr/15 text-game-wyr flex items-center justify-center mx-auto mb-4">
              <Vote className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Add Players</h2>
            <p className="text-muted-foreground text-sm">Group vote game. 3 players minimum.</p>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              placeholder="Enter name..."
              className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-wyr/40"
            />
            <Button onClick={addPlayer} size="icon" className="bg-game-wyr/15 text-game-wyr hover:bg-game-wyr/25 rounded-xl h-[46px] w-[46px]">
              <UserPlus className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-2 mb-8">
            {players.map((player) => (
              <div key={player} className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
                <span className="font-medium text-sm">{player}</span>
                <button onClick={() => removePlayer(player)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {players.length >= 3 && allPrompts.length > 0 && (
            <Button size="xl" onClick={startGame} className="w-full bg-game-wyr/15 text-game-wyr hover:bg-game-wyr/25 border border-game-wyr/20">
              <Users className="w-5 h-5" /> Start Endless Vote
            </Button>
          )}
          {players.length >= 3 && allPrompts.length === 0 && (
            <p className="text-center text-muted-foreground text-xs font-mono">No prompts available. Add custom prompts in Settings.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => setGameStarted(false)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Callout Clash</h1>
      </div>

      <div className="flex-1 px-6 pb-12 max-w-lg mx-auto w-full">
        <div className="bg-card border border-border rounded-2xl p-5 mb-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Current prompt</p>
          <p className="font-display text-2xl font-bold leading-tight">{prompt}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {players.map((player) => (
            <button
              key={player}
              onClick={() => castVote(player)}
              className="bg-secondary rounded-xl px-3 py-4 text-sm font-semibold hover:bg-secondary/80 transition-colors"
            >
              {player}
              <span className="block text-xs text-muted-foreground mt-1">{voteCounts[player] ?? 0} votes</span>
            </button>
          ))}
        </div>

        {!showResult ? (
          <div className="flex justify-center">
            <Button onClick={() => setShowResult(true)} className="rounded-xl bg-game-wyr/15 text-game-wyr hover:bg-game-wyr/25 border border-game-wyr/20">
              Reveal Result
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Most votes</p>
            <p className="font-display text-3xl font-bold text-game-wyr mb-1">{winner}</p>
            <p className="text-sm text-muted-foreground mb-4">{winnerVotes} votes</p>
            <p className="font-semibold mb-5">{outcome}</p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={startRound} className="rounded-xl bg-game-wyr/15 text-game-wyr hover:bg-game-wyr/25 border border-game-wyr/20">
                <RotateCcw className="w-4 h-4" /> Next Prompt
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalloutClash;
