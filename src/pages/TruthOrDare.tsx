import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Shield, Shuffle, Plus, Trash2, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMergedQuestions, addCustomQuestion, getCustomQuestions, removeCustomQuestion } from "@/lib/gameUtils";

const defaultTruths = [
  "What's the most embarrassing thing that happened to you during BMT?",
  "Who in this bunk do you think would survive the longest in a zombie apocalypse?",
  "What's the worst cookhouse meal you've ever had?",
  "Have you ever pretended to be sick to skip training?",
  "What's the most creative excuse you've given to your sergeant?",
  "Who do you secretly think is the fittest person in the section?",
  "What's something you miss most about civilian life?",
  "Have you ever cried during NS? When?",
  "What's the weirdest dream you've had in camp?",
  "If you could swap vocations with anyone, who would it be and why?",
  "What's the most illegal thing you've done in camp?",
  "Who would you trust to have your back in a combat situation?",
  "What's your guilty pleasure when you book out?",
  "Have you ever stolen food from the cookhouse?",
  "What's the first thing you do when you book out?",
  "Who in this bunk snores the loudest?",
  "What's the most you've ever slept during a lecture?",
  "Have you ever lied on your IPPT?",
  "What's a secret talent nobody here knows about?",
  "Who do you think will sign on?",
  "What's the worst luck you've had at camp?",
  "Who do you trust the most in the bunk?",
  "What makes you laugh the most in camp?",
  "What's something you regret not doing during NS?",
  "Who would you want as your section mate?",
  "What's the dumbest thing you've been punished for?",
  "Who here do you think complains the most?",
  "What's your biggest fear during outfield?",
  "Have you ever skipped cleaning duty? How?",
  "What's the funniest thing a commander has said?",
  "Who do you think is the weakest physically?",
  "What's something illegal you've seen someone do in camp?",
  "Have you ever faked a fall or injury?",
  "What's your worst haircut experience in NS?",
  "Who do you think will ORD the fastest mentally?",
  "What's the most disgusting thing you've seen in the toilet?",
  "Have you ever fallen asleep during guard duty?",
  "Who would you not trust with your life?",
  "What's your most toxic trait in bunk?",
  "What's the worst thing you've eaten just because you were hungry?",
  "Have you ever been caught breaking a rule?",
  "What's the closest you've gotten to getting charged?",
  "Who here do you think is secretly very rich?",
  "What's something you lie about often?",
  "Have you ever snitched on someone?",
  "What's your most useless skill?",
  "Who do you think is the most annoying?",
  "What's your worst IPPT station?",
  "Have you ever avoided someone in bunk on purpose?",
  "What's the most embarrassing thing you've said out loud?",
  "Who do you think tries too hard?",
  "What's your biggest insecurity?",
  "What's something you've done that no one here knows?",
  "Have you ever talked back to a superior?",
  "What's the longest you've gone without showering in camp?",
  "Who do you think would get lost first in jungle?",
  "What's your worst memory of PT?",
  "Have you ever cheated in any test or evaluation?",
  "What's your biggest regret in NS so far?",
  "Who do you secretly dislike?",
  "What's your worst habit in bunk?",
  "Have you ever broken equipment accidentally?",
  "What's the laziest thing you've done recently?",
  "Who do you think is most likely to keng?",
  "What's your biggest turn-off in a person?",
  "Have you ever pretended not to hear your name?",
  "What's something you wish you could say to your commander?",
  "What's your worst timing moment ever?",
  "Who do you think is the biggest clown here?",
  "What's something you're proud of but never say?",
  "Have you ever hidden something to avoid trouble?",
  "What's your biggest pet peeve in camp?",
  "Who would you never bunk with again?",
  "What's the worst advice you've followed?",
  "Have you ever laughed at the wrong time?",
  "What's the most childish thing you still do?",
  "Who do you think is secretly very smart?",
  "What's your most awkward interaction in camp?",
  "Have you ever stolen someone's item (even small)?",
  "What's your biggest weakness physically?",
  "Who do you think talks the most?",
  "What's your worst sleeping habit?",
  "Have you ever regretted something immediately?",
  "What's something you're scared people will find out?",
  "Who do you think is most fake?",
  "What's the weirdest thing you've eaten?",
  "Have you ever lost something important?",
  "What's your worst social mistake?",
  "Who do you think is the most trustworthy?",
  "What's something you judge people for?",
  "Have you ever blamed someone else unfairly?",
  "What's your biggest distraction in camp?",
  "Who do you think would fail survival training?",
  "What's your worst injury ever?",
  "Have you ever cried over something small?",
  "What's something you wish you were better at?",
  "Who do you think is most likely to become famous?",
  "What's your worst excuse that failed?",
  "Have you ever lied to get out of something important?",
  "What's the most awkward silence you've experienced?",
  "Who do you think is the most dramatic?",
  "What's your biggest guilty lie?",
  "Have you ever been jealous of someone here?",
  "What's your worst food experience ever?",
  "Who do you think is the most forgetful?",
  "What's something you pretend to like?",
  "Have you ever been embarrassed for someone else?",
  "What's your worst communication fail?",
  "Who do you think is the most unpredictable?",
  "What's your worst purchase ever?",
  "Have you ever ghosted someone?",
  "What's something you wish you never said?",
  "Who do you think is the biggest overthinker?",
  "What's your worst day in NS?",
  "Have you ever laughed at someone getting punished?",
  "What's something you'd change about yourself?",
  "Who do you think is most likely to quit?",
  "What's your worst moment of panic?",
  "Have you ever misunderstood an order badly?",
  "What's something you're secretly proud of?",
  "Who do you think is the most chill?",
  "What's your biggest fear in life?",
  "Have you ever avoided responsibility?",
  "What's something you've never told anyone?",
  "What's something you never want your family to find out?",
];

const defaultDares = [
  "Do 20 push-ups right now",
  "Do 50 push-ups right now",
  "Do 5 push-ups right now",
  "Do 30 sit-ups right now",
  "Let someone send a message from your phone",
  "Speak in your sergeant's voice for the next 2 rounds",
  "Do your best impression of your OC",
  "Sing the SAF pledge dramatically",
  "Let the group choose your next WhatsApp profile picture",
  "Call someone and tell them you love them",
  "Do a plank for 30 seconds while everyone watches",
  "Eat something weird from someone else's snack stash",
  "Do your best recruit impression",
  "Wear your PT kit inside out for the next hour",
  "Let someone draw on your arm with a marker",
  "Talk in a whisper for the next 3 rounds",
  "Do 10 burpees right now",
  "Serenade the person to your left",
  "Let the group give you a new nickname for tonight",
  "Pretend to be a drill sergeant for 1 minute",
  "Do an army crawl across the bunk",
  "Keep a straight face while everyone tries to make you laugh for 30 seconds",
  "Share the last photo in your camera roll",
  "Dance without using your arms for 30 seconds",
  "Tell someone in this room your biggest secret",
  "Do an impression of each person here",
  "Speak only in questions for the next 2 rounds",
  "Trade one piece of clothing with someone",
  "Do 30 jumping jacks",
  "Act like a chicken for 30 seconds",
  "Let someone scroll your gallery for 10 seconds",
  "Talk like a robot for the next 2 rounds",
  "Do 15 sit-ups",
  "Imitate your bunkmate until someone guesses who",
  "Sing your favorite song loudly",
  "Hold a wall sit for 30 seconds",
  "Let someone text a random emoji to your last chat",
  "Do your best animal impression",
  "Spin around 10 times then walk straight",
  "Speak only one word answers for 2 rounds",
  "Pretend to cry dramatically",
  "Do a runway walk across the bunk",
  "Talk in an accent for 3 rounds",
  "Balance on one leg for 30 seconds",
  "Let someone choose a word you must use every sentence",
  "Do 10 push-ups with counting out loud",
  "Act like a baby for 1 minute",
  "Make a rap about NS",
  "Do an invisible rope skipping routine",
  "Let someone pick your next IG caption",
  "Pretend you're a news reporter",
  "Do your best villain laugh",
  "Stare at someone without blinking for 20 seconds",
  "Act like you're in slow motion",
  "Speak like you're giving a speech",
  "Do a dramatic movie scene",
  "Pretend the floor is lava for 20 seconds",
  "Walk like a model everywhere for 1 minute",
  "Do 20 high knees",
  "Make 3 different funny faces",
  "Act like your favorite celebrity",
  "Say the alphabet backwards",
  "Do a dance with no music",
  "Pretend to be drunk",
  "Talk like a child for 2 rounds",
  "Do 10 squats",
  "Sing everything you say for 2 rounds",
  "Imitate a commander giving orders",
  "Act scared of everything",
  "Do a plank and talk at the same time",
  "Pretend to be invisible",
  "Speak only in slang",
  "Do a slow clap dramatically",
  "Act like you're freezing cold",
  "Pretend you're in a horror movie",
  "Make up a short story on the spot",
  "Talk like a pirate",
  "Do a karate routine",
  "Imitate a cartoon character",
  "Balance something on your head",
  "Act like a dog for 30 seconds",
  "Say a tongue twister 3 times fast",
  "Do 5 burpees",
  "Pretend you're on a game show",
  "Make a fake commercial",
  "Act like you're super sleepy",
  "Talk like you're whispering secrets",
  "Do a dramatic fall",
  "Pretend to be a statue",
  "Act like you're super angry",
  "Make animal sounds randomly",
  "Do a silly walk",
  "Act like you're underwater",
  "Speak only in questions",
  "Pretend you're late for something",
  "Do a fake phone call conversation",
  "Act like you're famous",
  "Make a joke and laugh at it",
  "Pretend to be a teacher",
  "Do a superhero pose",
  "Act like you're invisible but proud",
  "Talk like you're narrating a documentary",
  "Do 10 lunges",
  "Pretend to eat something invisible",
  "Make up a song about someone here",
  "Act like you're in a commercial",
  "Do a magic trick (fake is fine)",
  "Pretend you're an old person",
  "Speak super fast for 30 seconds",
  "Act like you're in slow internet lag",
  "Do a funny handshake with someone",
  "Pretend you're a tour guide",
  "Make a dramatic apology",
  "Act like you're shocked",
  "Do a freestyle dance",
  "Pretend you're lost",
  "Make a weird noise every 5 seconds for 1 min",
  "Act like you're super confident",
  "Do a fake workout routine",
  "Pretend to sneeze dramatically",
  "Act like you're a spy",
  "Talk like you're in a romantic movie",
  "Do a jumping pose freeze",
  "Pretend you're invisible but talking",
  "Act like you're super tired",
  "Make a funny face and hold it",
  "Pretend you're in a cooking show",
  "Do 15 mountain climbers",
  "Drop a brainrot quote without getting judged",
];

const TruthOrDare = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"truth" | "dare" | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"source" | "truth" | "dare">("source");
  const [newCustomTruth, setNewCustomTruth] = useState("");
  const [newCustomDare, setNewCustomDare] = useState("");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerExpired, setTimerExpired] = useState(false);
  const [customTruths, setCustomTruths] = useState<string[]>([]);
  const [customDares, setCustomDares] = useState<string[]>([]);
  const [allTruths, setAllTruths] = useState<string[]>([]);
  const [allDares, setAllDares] = useState<string[]>([]);
  const [contentMode, setContentMode] = useState<"mixed" | "default-only" | "custom-only">("mixed");

  const refreshPools = useCallback(() => {
    const customTruth = getCustomQuestions("truth");
    const customDare = getCustomQuestions("dare");
    setCustomTruths(customTruth);
    setCustomDares(customDare);
    setAllTruths(
      contentMode === "custom-only"
        ? customTruth
        : contentMode === "default-only"
          ? [...defaultTruths]
          : getMergedQuestions(defaultTruths, "truth")
    );
    setAllDares(
      contentMode === "custom-only"
        ? customDare
        : contentMode === "default-only"
          ? [...defaultDares]
          : getMergedQuestions(defaultDares, "dare")
    );
  }, [contentMode]);

  useEffect(() => {
    refreshPools();
  }, [refreshPools]);

  useEffect(() => {
    if (!timerEnabled || mode === null || timerExpired) return;
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setTimerExpired(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled, mode, timerExpired]);

  const addCustomTruthHandler = useCallback(() => {
    const question = newCustomTruth.trim();
    if (question) {
      addCustomQuestion("truth", question);
      refreshPools();
      setNewCustomTruth("");
    }
  }, [newCustomTruth, refreshPools]);

  const addCustomDareHandler = useCallback(() => {
    const question = newCustomDare.trim();
    if (question) {
      addCustomQuestion("dare", question);
      refreshPools();
      setNewCustomDare("");
    }
  }, [newCustomDare, refreshPools]);

  const removeCustomTruthHandler = useCallback((question: string) => {
    removeCustomQuestion("truth", question);
    refreshPools();
  }, [refreshPools]);

  const removeCustomDareHandler = useCallback((question: string) => {
    removeCustomQuestion("dare", question);
    refreshPools();
  }, [refreshPools]);

  const pickRandom = useCallback((type: "truth" | "dare") => {
    const list = type === "truth" ? allTruths : allDares;
    if (list.length === 0) return;
    const prompt = list[Math.floor(Math.random() * list.length)];
    setCurrentPrompt(prompt);
    setMode(type);
    setTimeLeft(timerSeconds);
    setTimerExpired(false);
    setAnimKey((k) => k + 1);
  }, [allTruths, allDares, timerSeconds]);

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Settings</h1>
        </div>

        <div className="flex-1 px-6 pb-12 max-w-sm mx-auto w-full overflow-y-auto">
          <div className="space-y-6 pt-6">
            <div className="grid grid-cols-3 gap-2 bg-card rounded-xl border border-border p-2">
              <button
                onClick={() => setSettingsTab("source")}
                className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${settingsTab === "source" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Source
              </button>
              <button
                onClick={() => setSettingsTab("truth")}
                className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${settingsTab === "truth" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Truth
              </button>
              <button
                onClick={() => setSettingsTab("dare")}
                className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${settingsTab === "dare" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Dare
              </button>
            </div>

            {settingsTab === "source" && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-4 border border-border">
                  <label className="text-xs font-medium text-muted-foreground">Content Source</label>
                  <select
                    value={contentMode}
                    onChange={(e) => setContentMode(e.target.value as "mixed" | "default-only" | "custom-only")}
                    className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-truth/40"
                  >
                    <option value="mixed">Use ALL Data</option>
                    <option value="default-only">BUILT-IN Data</option>
                    <option value="custom-only">CUSTOM Data</option>
                  </select>
                </div>

                <div className="bg-card rounded-xl p-4 border border-border">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timerEnabled}
                      onChange={(e) => setTimerEnabled(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Enable Timer
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Shows time to answer</p>
                    </div>
                  </label>
                  {timerEnabled && (
                    <div className="mt-4">
                      <label className="text-xs font-medium text-muted-foreground">Duration (seconds)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={timerSeconds}
                        onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 30)}
                        className="w-full mt-2 bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-game-truth/40"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {settingsTab === "truth" && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <p className="font-semibold text-sm mb-3">Add Custom Truths</p>
                <div className="flex gap-2 mb-3">
                  <input
                    value={newCustomTruth}
                    onChange={(e) => setNewCustomTruth(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomTruthHandler()}
                    placeholder="Enter truth..."
                    className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-truth/40"
                  />
                  <Button onClick={addCustomTruthHandler} size="sm" className="bg-game-truth/15 text-game-truth hover:bg-game-truth/25">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {customTruths.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Your Custom Truths ({customTruths.length})</p>
                    {customTruths.map((q) => (
                      <div key={q} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                        <span className="flex-1">{q}</span>
                        <button
                          onClick={() => removeCustomTruthHandler(q)}
                          className="text-muted-foreground hover:text-destructive ml-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No custom truths yet.</p>
                )}
              </div>
            )}

            {settingsTab === "dare" && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <p className="font-semibold text-sm mb-3">Add Custom Dares</p>
                <div className="flex gap-2 mb-3">
                  <input
                    value={newCustomDare}
                    onChange={(e) => setNewCustomDare(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomDareHandler()}
                    placeholder="Enter dare..."
                    className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-game-dare/40"
                  />
                  <Button onClick={addCustomDareHandler} size="sm" className="bg-game-dare/15 text-game-dare hover:bg-game-dare/25">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {customDares.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Your Custom Dares ({customDares.length})</p>
                    {customDares.map((q) => (
                      <div key={q} className="flex items-start justify-between bg-secondary rounded-lg p-2 text-xs">
                        <span className="flex-1">{q}</span>
                        <button
                          onClick={() => removeCustomDareHandler(q)}
                          className="text-muted-foreground hover:text-destructive ml-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No custom dares yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Truth or Dare</h1>
        <button onClick={() => setShowSettings(true)} className="ml-auto w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {mode === null ? (
          <div className="text-center" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className="w-20 h-20 rounded-2xl bg-game-truth/15 text-game-truth flex items-center justify-center mx-auto mb-6">
              <Flame className="w-10 h-10" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Choose your fate</h2>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Tap Truth or Dare to get a random prompt. No backing out.</p>
            <div className="flex gap-4 justify-center">
              <Button size="xl" onClick={() => pickRandom("truth")} className="bg-game-truth/15 text-game-truth hover:bg-game-truth/25 border border-game-truth/20">
                <Shield className="w-5 h-5" /> Truth
              </Button>
              <Button size="xl" onClick={() => pickRandom("dare")} className="bg-game-dare/15 text-game-dare hover:bg-game-dare/25 border border-game-dare/20">
                <Flame className="w-5 h-5" /> Dare
              </Button>
            </div>
          </div>
        ) : (
          <div key={animKey} className="text-center max-w-sm" style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8 ${
              mode === "truth" ? "bg-game-truth/15 text-game-truth" : "bg-game-dare/15 text-game-dare"
            }`}>
              {mode === "truth" ? <Shield className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
              {mode === "truth" ? "TRUTH" : "DARE"}
            </div>
            {timerEnabled && !timerExpired && (
              <div className="font-mono text-sm text-muted-foreground mb-4">
                {timeLeft}s remaining
              </div>
            )}
            {timerEnabled && timerExpired && (
              <div className="font-mono text-sm text-destructive mb-4 font-bold">
                Timer is up!
              </div>
            )}
            <p className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-10">
              {currentPrompt}
            </p>
            {!timerEnabled || timerExpired ? (
              <div className="flex gap-4 justify-center">
                <Button size="xl" onClick={() => pickRandom("truth")} className="bg-game-truth/15 text-game-truth hover:bg-game-truth/25 border border-game-truth/20">
                  <Shield className="w-5 h-5" /> Truth
                </Button>
                <Button size="xl" onClick={() => pickRandom("dare")} className="bg-game-dare/15 text-game-dare hover:bg-game-dare/25 border border-game-dare/20">
                  <Flame className="w-5 h-5" /> Dare
                </Button>
              </div>
            ) : (
              <Button size="xl" onClick={() => pickRandom(mode)} className={`${
                mode === "truth" ? "bg-game-truth/15 text-game-truth hover:bg-game-truth/25 border border-game-truth/20" : "bg-game-dare/15 text-game-dare hover:bg-game-dare/25 border border-game-dare/20"
              }`}>
                <Shuffle className="w-5 h-5" /> Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruthOrDare;
