import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bomb, Plus, RotateCcw, Settings, UserPlus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCustomQuestion, getCustomQuestions, getMergedQuestions, removeCustomQuestion } from "@/lib/gameUtils";

const defaultNonDrinkingChallenges = [
  "Tell a 5-second story that starts with 'I should not admit this, but...'.",
  "Pitch a fake movie starring two people in this room.",
  "Name three things you would ban forever.",
  "Speak like a dramatic narrator for the next 10 seconds.",
  "Reveal your most chaotic harmless habit.",
  "Give a fake TED Talk title about your life.",
  "Describe your day like a weather report.",
  "Name one person here you trust with your secrets and why.",
  "Act like you just won a major award.",
  "Drop your worst motivational line.",
  "Describe your friend group as a startup company.",
  "Explain a simple thing in the most complicated way possible.",
  "Improvise a slogan for this group.",
  "Confess a tiny crime from your childhood.",
  "Describe your current mood as a fictional character.",
];

const defaultDrinkingChallenges = [
  "Take a sip if you have ever texted and instantly regretted it.",
  "Give one sip: who is most likely to lose their phone tonight?",
  "Take 2 sips if you are the last person who arrived here.",
  "Give one sip: who would survive best on zero sleep?",
  "Take one sip and reveal your most chaotic harmless habit.",
  "Choose: take 2 sips or answer a brutally honest question from the group.",
  "Everyone who has an unread message from this week takes 1 sip.",
  "Take 1 sip and do your best dramatic movie line.",
  "Give one sip to the best storyteller in the room.",
  "Take 1 sip if you have ever pretended to be '5 minutes away'.",
];

const defaultRules = [
  "Anyone who says 'bro' gets a penalty.",
  "No pointing at people. If you point, penalty.",
  "Before speaking, clap once. Forget and get a penalty.",
  "You must answer with at least 3 words. Fail = penalty.",
  "No names allowed for one round. Use names and get a penalty.",
  "No English for one turn. Slip once and get a penalty.",
  "No laughing while others answer. Laugh = penalty.",
  "Everyone must keep one hand on their knee while talking.",
  "Every answer must start with 'Honestly'. Miss it = penalty.",
  "No repeating another player's phrase this round.",
];

const defaultDrinkPenalties = [
  "Take 1 sip.",
  "Take 2 sips.",
  "Give 1 sip to someone else.",
  "Take a long sip.",
  "Finish your drink.",
  "Take 3 sips.",
  "Everyone else takes a sip.",
  "Take a sip with your eyes closed.",
  "Take a sip with your non-dominant hand.",
];

const defaultNonDrinkerPenalties = [
  "Do 10 high knees.",
  "Do a 10-second dramatic monologue.",
  "Give one sincere compliment to the group.",
  "Hold a one-leg balance for 15 seconds.",
  "Do your best impression of someone in the room.",
  "Share an embarrassing story in 30 seconds or less.",
  "Do 20 jumping jacks.",
  "Attempt a tongue twister chosen by the group.",
  "Draw a quick self-portrait in 30 seconds and show it to the group.",
  "Share a guilty pleasure and why you love it.",
  "Do your best dance move for 15 seconds.",
  "Hold a plank position for 30 seconds.",
  "Name 5 things you love about the person to your left.",
  "Share a weird food combination you secretly enjoy.",
  "Do your best celebrity impression for 20 seconds.",
];

const CHAIN_REACTION_SOCIAL_QUESTIONS_KEY = "chainreaction_questions_social";
const CHAIN_REACTION_DRINKING_QUESTIONS_KEY = "chainreaction_questions_drinking";
const CHAIN_REACTION_RULES_KEY = "chainreaction_rules";
const CHAIN_REACTION_SOCIAL_PENALTIES_KEY = "chainreaction_penalties_social";
const CHAIN_REACTION_DRINKING_PENALTIES_KEY = "chainreaction_penalties_drinking";

const ChainReaction = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [activeRules, setActiveRules] = useState<string[]>([]);
  const [lastPenalty, setLastPenalty] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [challengeMode, setChallengeMode] = useState<"mixed" | "normal" | "drinking">("normal");
  const [contentMode, setContentMode] = useState<"mixed" | "default-only" | "custom-only">("mixed");

  const [socialQuestions, setSocialQuestions] = useState<string[]>([]);
  const [drinkingQuestions, setDrinkingQuestions] = useState<string[]>([]);
  const [allRules, setAllRules] = useState<string[]>([]);
  const [socialPenalties, setSocialPenalties] = useState<string[]>([]);
  const [drinkingPenalties, setDrinkingPenalties] = useState<string[]>([]);

  const [customSocialQuestions, setCustomSocialQuestions] = useState<string[]>([]);
  const [customDrinkingQuestions, setCustomDrinkingQuestions] = useState<string[]>([]);
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [customSocialPenalties, setCustomSocialPenalties] = useState<string[]>([]);
  const [customDrinkingPenalties, setCustomDrinkingPenalties] = useState<string[]>([]);

  const [newSocialQuestion, setNewSocialQuestion] = useState("");
  const [newDrinkingQuestion, setNewDrinkingQuestion] = useState("");
  const [newRule, setNewRule] = useState("");
  const [newSocialPenalty, setNewSocialPenalty] = useState("");
  const [newDrinkingPenalty, setNewDrinkingPenalty] = useState("");

  const randomFrom = (items: string[]) => (items.length ? items[Math.floor(Math.random() * items.length)] : "");

  const refreshPools = useCallback(() => {
    setSocialQuestions(getMergedQuestions(defaultNonDrinkingChallenges, CHAIN_REACTION_SOCIAL_QUESTIONS_KEY));
    setDrinkingQuestions(getMergedQuestions(defaultDrinkingChallenges, CHAIN_REACTION_DRINKING_QUESTIONS_KEY));
    setAllRules(getMergedQuestions(defaultRules, CHAIN_REACTION_RULES_KEY));
    setSocialPenalties(getMergedQuestions(defaultNonDrinkerPenalties, CHAIN_REACTION_SOCIAL_PENALTIES_KEY));
    setDrinkingPenalties(getMergedQuestions(defaultDrinkPenalties, CHAIN_REACTION_DRINKING_PENALTIES_KEY));

    setCustomSocialQuestions(getCustomQuestions(CHAIN_REACTION_SOCIAL_QUESTIONS_KEY));
    setCustomDrinkingQuestions(getCustomQuestions(CHAIN_REACTION_DRINKING_QUESTIONS_KEY));
    setCustomRules(getCustomQuestions(CHAIN_REACTION_RULES_KEY));
    setCustomSocialPenalties(getCustomQuestions(CHAIN_REACTION_SOCIAL_PENALTIES_KEY));
    setCustomDrinkingPenalties(getCustomQuestions(CHAIN_REACTION_DRINKING_PENALTIES_KEY));
  }, []);

  useEffect(() => {
    refreshPools();
  }, [refreshPools]);

  const defaultChallengePool =
    challengeMode === "mixed"
      ? [...defaultNonDrinkingChallenges, ...defaultDrinkingChallenges]
      : challengeMode === "drinking"
        ? defaultDrinkingChallenges
        : defaultNonDrinkingChallenges;

  const mergedChallengePool =
    challengeMode === "mixed"
      ? [...socialQuestions, ...drinkingQuestions]
      : challengeMode === "drinking"
        ? drinkingQuestions
        : socialQuestions;

  const customChallengePool =
    challengeMode === "mixed"
      ? [...customSocialQuestions, ...customDrinkingQuestions]
      : challengeMode === "drinking"
        ? customDrinkingQuestions
        : customSocialQuestions;

  const availableChallenges =
    contentMode === "custom-only"
      ? customChallengePool
      : contentMode === "default-only"
        ? defaultChallengePool
        : mergedChallengePool;

  const availableRules =
    contentMode === "custom-only"
      ? customRules
      : contentMode === "default-only"
        ? defaultRules
        : allRules;

  const defaultPenaltyPool =
    challengeMode === "mixed"
      ? [...defaultNonDrinkerPenalties, ...defaultDrinkPenalties]
      : challengeMode === "drinking"
        ? defaultDrinkPenalties
        : defaultNonDrinkerPenalties;

  const mergedPenaltyPool =
    challengeMode === "mixed"
      ? [...socialPenalties, ...drinkingPenalties]
      : challengeMode === "drinking"
        ? drinkingPenalties
        : socialPenalties;

  const customPenaltyPool =
    challengeMode === "mixed"
      ? [...customSocialPenalties, ...customDrinkingPenalties]
      : challengeMode === "drinking"
        ? customDrinkingPenalties
        : customSocialPenalties;

  const availablePenalties =
    contentMode === "custom-only"
      ? customPenaltyPool
      : contentMode === "default-only"
        ? defaultPenaltyPool
        : mergedPenaltyPool;

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

  const setupTurn = useCallback((nextIndex: number, nextTurn: number) => {
    setCurrentPlayerIndex(nextIndex);
    setTurnNumber(nextTurn);
    setCurrentChallenge(randomFrom(availableChallenges));

    if (nextTurn % 2 === 0) {
      setActiveRules((prev) => {
        const nextRule = randomFrom(availableRules);
        if (!nextRule) return prev;
        const merged = [nextRule, ...prev.filter((rule) => rule !== nextRule)];
        return merged.slice(0, 6);
      });
    }

    setLastPenalty("");
  }, [availableChallenges, availableRules]);

  const startGame = useCallback(() => {
    if (players.length < 3 || availableChallenges.length === 0) return;
    setGameStarted(true);
    setActiveRules([]);
    setupTurn(0, 1);
  }, [players.length, availableChallenges.length, setupTurn]);

  const nextTurn = useCallback(() => {
    if (players.length === 0) return;
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setupTurn(nextIndex, turnNumber + 1);
  }, [players.length, currentPlayerIndex, turnNumber, setupTurn]);

  const assignPenalty = useCallback(() => {
    const pool = availablePenalties;
    if (pool.length === 0) return;
    setLastPenalty(randomFrom(pool));
  }, [availablePenalties]);

  const addCustomSocialQuestion = useCallback(() => {
    const value = newSocialQuestion.trim();
    if (!value) return;
    addCustomQuestion(CHAIN_REACTION_SOCIAL_QUESTIONS_KEY, value);
    setNewSocialQuestion("");
    refreshPools();
  }, [newSocialQuestion, refreshPools]);

  const addCustomDrinkingQuestion = useCallback(() => {
    const value = newDrinkingQuestion.trim();
    if (!value) return;
    addCustomQuestion(CHAIN_REACTION_DRINKING_QUESTIONS_KEY, value);
    setNewDrinkingQuestion("");
    refreshPools();
  }, [newDrinkingQuestion, refreshPools]);

  const addCustomRule = useCallback(() => {
    const value = newRule.trim();
    if (!value) return;
    addCustomQuestion(CHAIN_REACTION_RULES_KEY, value);
    setNewRule("");
    refreshPools();
  }, [newRule, refreshPools]);

  const addCustomSocialPenalty = useCallback(() => {
    const value = newSocialPenalty.trim();
    if (!value) return;
    addCustomQuestion(CHAIN_REACTION_SOCIAL_PENALTIES_KEY, value);
    setNewSocialPenalty("");
    refreshPools();
  }, [newSocialPenalty, refreshPools]);

  const addCustomDrinkingPenalty = useCallback(() => {
    const value = newDrinkingPenalty.trim();
    if (!value) return;
    addCustomQuestion(CHAIN_REACTION_DRINKING_PENALTIES_KEY, value);
    setNewDrinkingPenalty("");
    refreshPools();
  }, [newDrinkingPenalty, refreshPools]);

  const removeCustomSocialQuestion = useCallback((value: string) => {
    removeCustomQuestion(CHAIN_REACTION_SOCIAL_QUESTIONS_KEY, value);
    refreshPools();
  }, [refreshPools]);

  const removeCustomDrinkingQuestion = useCallback((value: string) => {
    removeCustomQuestion(CHAIN_REACTION_DRINKING_QUESTIONS_KEY, value);
    refreshPools();
  }, [refreshPools]);

  const removeCustomRule = useCallback((value: string) => {
    removeCustomQuestion(CHAIN_REACTION_RULES_KEY, value);
    refreshPools();
  }, [refreshPools]);

  const removeCustomSocialPenalty = useCallback((value: string) => {
    removeCustomQuestion(CHAIN_REACTION_SOCIAL_PENALTIES_KEY, value);
    refreshPools();
  }, [refreshPools]);

  const removeCustomDrinkingPenalty = useCallback((value: string) => {
    removeCustomQuestion(CHAIN_REACTION_DRINKING_PENALTIES_KEY, value);
    refreshPools();
  }, [refreshPools]);

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Chain Reaction Settings</h1>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full overflow-y-auto">
          <div className="bg-card rounded-xl p-4 border border-border mt-6">
            <label className="text-xs font-medium text-muted-foreground">Challenge Type</label>
            <select
              value={challengeMode}
              onChange={(e) => setChallengeMode(e.target.value as "mixed" | "normal" | "drinking")}
              className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
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
                className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
              >
                <option value="mixed">Use ALL Data</option>
                <option value="default-only">BUILT-IN Data</option>
                <option value="custom-only">CUSTOM Data</option>
              </select>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border mt-4 space-y-3">
            <p className="font-semibold text-sm">Custom Non-Drinking Questions</p>
            <div className="flex gap-2">
              <input
                value={newSocialQuestion}
                onChange={(e) => setNewSocialQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSocialQuestion()}
                placeholder="Add social question..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
              />
              <Button onClick={addCustomSocialQuestion} size="sm" className="bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {customSocialQuestions.map((item) => (
              <div key={item} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                <span className="flex-1">{item}</span>
                <button onClick={() => removeCustomSocialQuestion(item)} className="text-muted-foreground hover:text-destructive ml-2">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-4 border border-border mt-4 space-y-3">
            <p className="font-semibold text-sm">Custom Drinking Questions</p>
            <div className="flex gap-2">
              <input
                value={newDrinkingQuestion}
                onChange={(e) => setNewDrinkingQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomDrinkingQuestion()}
                placeholder="Add drinking question..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
              />
              <Button onClick={addCustomDrinkingQuestion} size="sm" className="bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {customDrinkingQuestions.map((item) => (
              <div key={item} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                <span className="flex-1">{item}</span>
                <button onClick={() => removeCustomDrinkingQuestion(item)} className="text-muted-foreground hover:text-destructive ml-2">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-4 border border-border mt-4 space-y-3">
            <p className="font-semibold text-sm">Custom Rules</p>
            <div className="flex gap-2">
              <input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomRule()}
                placeholder="Add new rule..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
              />
              <Button onClick={addCustomRule} size="sm" className="bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {customRules.map((item) => (
              <div key={item} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                <span className="flex-1">{item}</span>
                <button onClick={() => removeCustomRule(item)} className="text-muted-foreground hover:text-destructive ml-2">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-4 border border-border mt-4 space-y-3">
            <p className="font-semibold text-sm">Custom Non-Drinking Penalties</p>
            <div className="flex gap-2">
              <input
                value={newSocialPenalty}
                onChange={(e) => setNewSocialPenalty(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSocialPenalty()}
                placeholder="Add social penalty..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
              />
              <Button onClick={addCustomSocialPenalty} size="sm" className="bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {customSocialPenalties.map((item) => (
              <div key={item} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                <span className="flex-1">{item}</span>
                <button onClick={() => removeCustomSocialPenalty(item)} className="text-muted-foreground hover:text-destructive ml-2">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-4 border border-border mt-4 space-y-3">
            <p className="font-semibold text-sm">Custom Drinking Penalties</p>
            <div className="flex gap-2">
              <input
                value={newDrinkingPenalty}
                onChange={(e) => setNewDrinkingPenalty(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomDrinkingPenalty()}
                placeholder="Add drinking penalty..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-hotseat/40"
              />
              <Button onClick={addCustomDrinkingPenalty} size="sm" className="bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {customDrinkingPenalties.map((item) => (
              <div key={item} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                <span className="flex-1">{item}</span>
                <button onClick={() => removeCustomDrinkingPenalty(item)} className="text-muted-foreground hover:text-destructive ml-2">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
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
          <h1 className="font-display text-xl font-bold">Chain Reaction</h1>
          <button onClick={() => setShowSettings(true)} className="ml-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full">
          <div className="text-center mb-8 mt-8">
            <div className="w-16 h-16 rounded-2xl bg-game-hotseat/15 text-game-hotseat flex items-center justify-center mx-auto mb-4">
              <Bomb className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Add Players</h2>
            <p className="text-muted-foreground text-sm">New rules stack every two turns. 3 players minimum.</p>
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
            {players.map((player) => (
              <div key={player} className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
                <span className="font-medium text-sm">{player}</span>
                <button onClick={() => removePlayer(player)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {players.length >= 3 && availableChallenges.length > 0 && (
            <Button size="xl" onClick={startGame} className="w-full bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25 border border-game-hotseat/20">
              <Plus className="w-5 h-5" /> Start Endless Chaos
            </Button>
          )}
          {players.length >= 3 && availableChallenges.length === 0 && (
            <p className="text-center text-muted-foreground text-xs font-mono">No questions available. Add custom questions in Settings.</p>
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
        <h1 className="font-display text-xl font-bold">Chain Reaction</h1>
      </div>

      <div className="flex-1 px-6 pb-12 max-w-2xl mx-auto w-full">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Turn {turnNumber}</p>
            <p className="text-sm text-muted-foreground mb-3">Current player</p>
            <p className="font-display text-2xl font-bold text-game-hotseat mb-4">{players[currentPlayerIndex]}</p>
            <p className="font-display text-2xl font-bold leading-tight mb-6">{currentChallenge}</p>

            <div className="flex flex-wrap gap-2">
              <Button onClick={assignPenalty} variant="outline" className="rounded-xl">
                <Bomb className="w-4 h-4" /> Broke a Rule
              </Button>
              <Button onClick={nextTurn} className="rounded-xl bg-game-hotseat/15 text-game-hotseat hover:bg-game-hotseat/25 border border-game-hotseat/20">
                <RotateCcw className="w-4 h-4" /> Next Turn
              </Button>
              <Button onClick={() => setActiveRules([])} variant="outline" className="rounded-xl">
                Clear Rules
              </Button>
            </div>

            {lastPenalty && (
              <div className="mt-4 bg-secondary rounded-xl px-3 py-3 text-sm">
                <span className="font-semibold">Penalty:</span> {lastPenalty}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Active Table Rules</p>
            {activeRules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active rules yet. A new rule appears every 2 turns.</p>
            ) : (
              <div className="space-y-2">
                {activeRules.map((rule) => (
                  <div key={rule} className="bg-secondary rounded-xl px-3 py-2 text-sm">
                    {rule}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainReaction;
