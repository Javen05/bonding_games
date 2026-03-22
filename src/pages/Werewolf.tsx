import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Plus, RotateCcw, Sun, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type Role = "Werewolf" | "Doctor" | "Seer" | "Tanner" | "Villager";
type GameMode = "narrator" | "gameplay";
type Phase =
  | "setup"
  | "reveal"
  | "night"
  | "day"
  | "nightPass"
  | "nightRecapPass"
  | "discussionPause"
  | "dayVotePass"
  | "dayVoteReveal"
  | "ended";

interface PlayerState {
  name: string;
  role: Role;
  alive: boolean;
}

interface SeerResult {
  name: string;
  isWerewolf: boolean;
}

const ROLE_BADGE_CLASS: Record<Role, string> = {
  Werewolf: "border-red-500/40 bg-red-500/15 text-red-500",
  Doctor: "border-emerald-500/40 bg-emerald-500/15 text-emerald-500",
  Seer: "border-violet-500/40 bg-violet-500/15 text-violet-500",
  Tanner: "border-amber-500/40 bg-amber-500/15 text-amber-500",
  Villager: "border-primary/30 bg-primary/10 text-primary",
};

const ROLE_PURPOSE: Record<Role, string> = {
  Werewolf: "Coordinate quietly and hunt one non-werewolf each night.",
  Doctor: "Place protection on one player at risk of being hunted.",
  Seer: "Inspect one player each night to learn if they are a werewolf.",
  Tanner: "Convince everyone to vote you out during the day.",
  Villager: "Discuss and vote carefully to eliminate all werewolves.",
};

const MIN_PLAYERS = 5;

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getWinner = (players: PlayerState[]): string | null => {
  const aliveWerewolves = players.filter((player) => player.alive && player.role === "Werewolf").length;
  const aliveNonWerewolves = players.filter((player) => player.alive && player.role !== "Werewolf").length;

  if (aliveWerewolves === 0) return "Villagers win";
  if (aliveWerewolves >= aliveNonWerewolves) return "Werewolves win";
  return null;
};

const aliveEntriesFromPlayers = (players: PlayerState[]) =>
  players.map((player, index) => ({ player, index })).filter((entry) => entry.player.alive);

const buildDefaultDoctorTargets = (sourcePlayers: PlayerState[]): Record<number, number> => {
  const alive = aliveEntriesFromPlayers(sourcePlayers);
  const firstAlive = alive[0]?.index;
  if (firstAlive === undefined) return {};

  const targets: Record<number, number> = {};
  alive
    .filter((entry) => entry.player.role === "Doctor")
    .forEach((entry) => {
      targets[entry.index] = firstAlive;
    });
  return targets;
};

const buildDefaultSeerTargets = (sourcePlayers: PlayerState[]): Record<number, number> => {
  const alive = aliveEntriesFromPlayers(sourcePlayers);
  const targets: Record<number, number> = {};

  alive
    .filter((entry) => entry.player.role === "Seer")
    .forEach((seer) => {
      const defaultTarget = alive.find((entry) => entry.index !== seer.index)?.index;
      if (defaultTarget !== undefined) {
        targets[seer.index] = defaultTarget;
      }
    });

  return targets;
};

const Werewolf = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("setup");
  const [gameMode, setGameMode] = useState<GameMode>("narrator");
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", "", ""]);
  const [narratorName, setNarratorName] = useState<string>("");

  const [werewolfCount, setWerewolfCount] = useState(1);
  const [doctorCount, setDoctorCount] = useState(1);
  const [seerCount, setSeerCount] = useState(1);
  const [tannerCount, setTannerCount] = useState(0);

  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [showRoleCard, setShowRoleCard] = useState(false);

  // Narrator mode controls
  const [nightKillTarget, setNightKillTarget] = useState<number | null>(null);
  const [doctorSaveTargets, setDoctorSaveTargets] = useState<Record<number, number>>({});
  const [seerInspectTargets, setSeerInspectTargets] = useState<Record<number, number>>({});

  // Shared result text
  const [lastNightText, setLastNightText] = useState("Night has not started yet.");
  const [lastSeerResults, setLastSeerResults] = useState<Record<number, SeerResult>>({});
  const [dayVoteTarget, setDayVoteTarget] = useState<number | null>(null);
  const [winnerText, setWinnerText] = useState("");

  // Gameplay mode controls (pass-the-phone)
  const [nightActors, setNightActors] = useState<number[]>([]);
  const [nightActorCursor, setNightActorCursor] = useState(0);
  const [showActionCard, setShowActionCard] = useState(false);
  const [currentActionTarget, setCurrentActionTarget] = useState<number | null>(null);
  const [werewolfVotes, setWerewolfVotes] = useState<Record<number, number>>({});

  const [nightRecapOrder, setNightRecapOrder] = useState<number[]>([]);
  const [nightRecapCursor, setNightRecapCursor] = useState(0);

  const [discussionSecondsLeft, setDiscussionSecondsLeft] = useState(60);
  const [discussionLeadIndex, setDiscussionLeadIndex] = useState<number | null>(null);

  const [dayVoteOrder, setDayVoteOrder] = useState<number[]>([]);
  const [dayVoteCursor, setDayVoteCursor] = useState(0);
  const [dayVotesByVoter, setDayVotesByVoter] = useState<Record<number, number>>({});
  const [dayVoteResultText, setDayVoteResultText] = useState("");
  const [voteRevealLeadIndex, setVoteRevealLeadIndex] = useState<number | null>(null);
  const [postVoteWinner, setPostVoteWinner] = useState<string | null>(null);
  const [showWerewolfReveal, setShowWerewolfReveal] = useState(false);

  const trimmedNames = useMemo(
    () => playerNames.map((name) => name.trim()).filter((name) => name.length > 0),
    [playerNames],
  );

  const uniqueNames = new Set(trimmedNames);
  const hasDuplicateNames = uniqueNames.size !== trimmedNames.length;
  const activeSetupNames = gameMode === "narrator"
    ? trimmedNames.filter((name) => name !== narratorName)
    : trimmedNames;
  const playerCount = activeSetupNames.length;
  const narratorMissing = gameMode === "narrator" && narratorName.length === 0;

  useEffect(() => {
    if (gameMode !== "narrator") return;
    if (trimmedNames.length === 0) {
      setNarratorName("");
      return;
    }
    if (!trimmedNames.includes(narratorName)) {
      setNarratorName(trimmedNames[0]);
    }
  }, [gameMode, narratorName, trimmedNames]);

  const canUseDoctor = playerCount >= 5;
  const canUseSeer = playerCount >= 5;

  // Requested scaling: allow 1 at 5 players, allow another (2 total) at 6 players.
  const specialCountCapByPlayers = playerCount >= 6 ? 2 : playerCount >= 5 ? 1 : 0;
  const maxDoctorsByRatio = canUseDoctor ? specialCountCapByPlayers : 0;
  const maxSeersByRatio = canUseSeer ? specialCountCapByPlayers : 0;

  const maxDoctors = Math.max(0, Math.min(maxDoctorsByRatio, playerCount - werewolfCount - seerCount - tannerCount - 1));
  const maxSeers = Math.max(0, Math.min(maxSeersByRatio, playerCount - werewolfCount - doctorCount - tannerCount - 1));
  const maxTanners = Math.max(0, Math.min(1, playerCount - werewolfCount - doctorCount - seerCount - 1));

  const specialRoleCount = doctorCount + seerCount + tannerCount;
  const maxWerewolvesByRatio = Math.max(1, Math.floor(playerCount / 4));
  const maxWerewolves = Math.max(1, Math.min(maxWerewolvesByRatio, playerCount - specialRoleCount - 1));

  useEffect(() => {
    if (!canUseDoctor) {
      setDoctorCount(0);
      return;
    }
    setDoctorCount((prev) => Math.min(Math.max(0, prev), maxDoctors));
  }, [canUseDoctor, maxDoctors]);

  useEffect(() => {
    if (!canUseSeer) {
      setSeerCount(0);
      return;
    }
    setSeerCount((prev) => Math.min(Math.max(0, prev), maxSeers));
  }, [canUseSeer, maxSeers]);

  useEffect(() => {
    setWerewolfCount((prev) => Math.min(Math.max(1, prev), maxWerewolves));
  }, [maxWerewolves]);

  useEffect(() => {
    setTannerCount((prev) => Math.min(Math.max(0, prev), maxTanners));
  }, [maxTanners]);

  useEffect(() => {
    if (phase !== "discussionPause") return;
    if (discussionSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setDiscussionSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, discussionSecondsLeft]);

  const resetToSetup = () => {
    setPhase("setup");
    setPlayers([]);
    setRevealIndex(0);
    setShowRoleCard(false);

    setNightKillTarget(null);
    setDoctorSaveTargets({});
    setSeerInspectTargets({});

    setLastNightText("Night has not started yet.");
    setLastSeerResults({});
    setDayVoteTarget(null);
    setWinnerText("");

    setNightActors([]);
    setNightActorCursor(0);
    setShowActionCard(false);
    setCurrentActionTarget(null);
    setWerewolfVotes({});

    setNightRecapOrder([]);
    setNightRecapCursor(0);

    setDiscussionSecondsLeft(60);
    setDiscussionLeadIndex(null);

    setDayVoteOrder([]);
    setDayVoteCursor(0);
    setDayVotesByVoter({});
    setDayVoteResultText("");
    setVoteRevealLeadIndex(null);
    setPostVoteWinner(null);
    setShowWerewolfReveal(false);
  };

  const initializeNarratorNight = (sourcePlayers: PlayerState[]) => {
    const alive = aliveEntriesFromPlayers(sourcePlayers);
    const aliveNonWerewolves = alive.filter((entry) => entry.player.role !== "Werewolf");

    setNightKillTarget(aliveNonWerewolves[0]?.index ?? null);
    setDoctorSaveTargets(buildDefaultDoctorTargets(sourcePlayers));
    setSeerInspectTargets(buildDefaultSeerTargets(sourcePlayers));
    setPhase("night");
  };

  const initializeGameplayNightPass = (sourcePlayers: PlayerState[]) => {
    const alive = aliveEntriesFromPlayers(sourcePlayers);

    setNightActors(alive.map((entry) => entry.index));
    setNightActorCursor(0);
    setShowActionCard(false);
    setCurrentActionTarget(null);

    setWerewolfVotes({});
    setNightKillTarget(null);
    setDoctorSaveTargets(buildDefaultDoctorTargets(sourcePlayers));
    setSeerInspectTargets(buildDefaultSeerTargets(sourcePlayers));
    setPhase("nightPass");
  };

  const initializeGameplayDayVotePass = (sourcePlayers: PlayerState[]) => {
    const alive = aliveEntriesFromPlayers(sourcePlayers);
    setDayVoteOrder(alive.map((entry) => entry.index));
    setDayVoteCursor(0);
    setDayVotesByVoter({});
    setCurrentActionTarget(null);
    setPhase("dayVotePass");
  };

  const startGame = () => {
    if (playerCount < MIN_PLAYERS || hasDuplicateNames || narratorMissing) return;

    const roleDeck: Role[] = [
      ...Array(werewolfCount).fill("Werewolf"),
      ...Array(doctorCount).fill("Doctor"),
      ...Array(seerCount).fill("Seer"),
      ...Array(tannerCount).fill("Tanner"),
      ...Array(playerCount - werewolfCount - doctorCount - seerCount - tannerCount).fill("Villager"),
    ];

    const shuffledRoles = shuffle(roleDeck);
    const initialPlayers: PlayerState[] = activeSetupNames.map((name, index) => ({
      name,
      role: shuffledRoles[index],
      alive: true,
    }));

    setPlayers(initialPlayers);
    setRevealIndex(0);
    setShowRoleCard(false);
    setLastNightText("Night has not started yet.");
    setLastSeerResults({});
    setWinnerText("");
    setDayVoteResultText("");
    setPostVoteWinner(null);
    setShowWerewolfReveal(false);
    setPhase("reveal");
  };

  const alivePlayers = aliveEntriesFromPlayers(players);
  const aliveWerewolves = alivePlayers.filter((entry) => entry.player.role === "Werewolf");
  const aliveNonWerewolves = alivePlayers.filter((entry) => entry.player.role !== "Werewolf");
  const aliveDoctors = alivePlayers.filter((entry) => entry.player.role === "Doctor");
  const aliveSeers = alivePlayers.filter((entry) => entry.player.role === "Seer");

  const goToNextReveal = () => {
    setShowRoleCard(false);
    if (revealIndex >= players.length - 1) {
      if (gameMode === "narrator") {
        initializeNarratorNight(players);
      } else {
        initializeGameplayNightPass(players);
      }
      return;
    }
    setRevealIndex((prev) => prev + 1);
  };

  const resolveNarratorNight = () => {
    if (nightKillTarget === null) return;

    const nextPlayers = [...players];
    const aliveDoctorSet = new Set(aliveDoctors.map((entry) => entry.index));
    const saved =
      aliveDoctorSet.size > 0 &&
      Object.entries(doctorSaveTargets).some(
        ([doctorIndex, target]) => aliveDoctorSet.has(Number(doctorIndex)) && target === nightKillTarget,
      );

    if (!saved) {
      nextPlayers[nightKillTarget] = {
        ...nextPlayers[nightKillTarget],
        alive: false,
      };
      setLastNightText(`${nextPlayers[nightKillTarget].name} was eliminated during the night.`);
    } else {
      setLastNightText("Someone was attacked but was revived by a Doctor.");
    }

    const nextSeerResults: Record<number, SeerResult> = {};
    aliveSeers.forEach((seer) => {
      const targetIndex = seerInspectTargets[seer.index];
      if (targetIndex === undefined) return;
      const target = nextPlayers[targetIndex];
      if (!target) return;
      nextSeerResults[seer.index] = {
        name: target.name,
        isWerewolf: target.role === "Werewolf",
      };
    });
    setLastSeerResults(nextSeerResults);

    setPlayers(nextPlayers);

    const winner = getWinner(nextPlayers);
    if (winner) {
      setWinnerText(winner);
      setPhase("ended");
      return;
    }

    setDayVoteTarget(nextPlayers.findIndex((player) => player.alive));
    setPhase("day");
  };

  const resolveNarratorDayVote = () => {
    if (dayVoteTarget === null) return;

    const nextPlayers = [...players];
    const eliminatedPlayer = nextPlayers[dayVoteTarget];

    if (eliminatedPlayer.role === "Tanner") {
      setPlayers(nextPlayers.map((player, index) => (
        index === dayVoteTarget ? { ...player, alive: false } : player
      )));
      setWinnerText(`${eliminatedPlayer.name} (Tanner) wins`);
      setPhase("ended");
      return;
    }

    nextPlayers[dayVoteTarget] = {
      ...nextPlayers[dayVoteTarget],
      alive: false,
    };
    setPlayers(nextPlayers);

    const winner = getWinner(nextPlayers);
    if (winner) {
      setWinnerText(winner);
      setPhase("ended");
      return;
    }

    initializeNarratorNight(nextPlayers);
  };

  const gameplayNightActorIndex = nightActors[nightActorCursor] ?? null;
  const gameplayNightActor = gameplayNightActorIndex !== null ? players[gameplayNightActorIndex] : null;

  const gameplayDayVoterIndex = dayVoteOrder[dayVoteCursor] ?? null;
  const gameplayDayVoter = gameplayDayVoterIndex !== null ? players[gameplayDayVoterIndex] : null;

  useEffect(() => {
    if (phase !== "nightPass" || gameplayNightActorIndex === null || !gameplayNightActor) {
      return;
    }

    const alive = aliveEntriesFromPlayers(players);
    if (gameplayNightActor.role === "Werewolf") {
      const options = alive.filter((entry) => entry.player.role !== "Werewolf");
      setCurrentActionTarget(options[0]?.index ?? null);
      return;
    }
    if (gameplayNightActor.role === "Doctor") {
      setCurrentActionTarget(alive[0]?.index ?? null);
      return;
    }
    if (gameplayNightActor.role === "Seer") {
      const options = alive.filter((entry) => entry.index !== gameplayNightActorIndex);
      setCurrentActionTarget(options[0]?.index ?? null);
      return;
    }

    setCurrentActionTarget(null);
  }, [phase, gameplayNightActorIndex, gameplayNightActor, players]);

  useEffect(() => {
    if (phase !== "dayVotePass" || gameplayDayVoterIndex === null) {
      return;
    }

    const options = aliveEntriesFromPlayers(players).filter((entry) => entry.index !== gameplayDayVoterIndex);
    setCurrentActionTarget(options[0]?.index ?? null);
  }, [phase, gameplayDayVoterIndex, players]);

  const resolveGameplayNight = (votes: Record<number, number>) => {
    const nextPlayers = [...players];
    const alive = aliveEntriesFromPlayers(nextPlayers);
    const aliveWerewolfEntries = alive.filter((entry) => entry.player.role === "Werewolf");
    const aliveDoctorEntries = alive.filter((entry) => entry.player.role === "Doctor");
    const aliveSeerEntries = alive.filter((entry) => entry.player.role === "Seer");

    const aliveNonWerewolfIndexSet = new Set(
      alive.filter((entry) => entry.player.role !== "Werewolf").map((entry) => entry.index),
    );
    const aliveWerewolfIndexSet = new Set(aliveWerewolfEntries.map((entry) => entry.index));

    const targetCounts: Record<number, number> = {};
    Object.entries(votes).forEach(([voter, target]) => {
      const voterIndex = Number(voter);
      if (!aliveWerewolfIndexSet.has(voterIndex)) return;
      if (!aliveNonWerewolfIndexSet.has(target)) return;
      targetCounts[target] = (targetCounts[target] ?? 0) + 1;
    });

    let selectedKillTarget: number | null = null;
    let maxVotes = 0;
    Object.entries(targetCounts).forEach(([target, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        selectedKillTarget = Number(target);
      }
    });

    const aliveDoctorSet = new Set(aliveDoctorEntries.map((entry) => entry.index));
    const saved =
      selectedKillTarget !== null &&
      Object.entries(doctorSaveTargets).some(
        ([doctorIndex, target]) => aliveDoctorSet.has(Number(doctorIndex)) && target === selectedKillTarget,
      );

    if (selectedKillTarget === null || aliveWerewolfEntries.length === 0) {
      setLastNightText("No one was attacked during the night.");
    } else if (saved) {
      setLastNightText("Someone was attacked but was revived by a Doctor.");
    } else {
      nextPlayers[selectedKillTarget] = {
        ...nextPlayers[selectedKillTarget],
        alive: false,
      };
      setLastNightText(`${nextPlayers[selectedKillTarget].name} was eliminated during the night.`);
    }

    const nextSeerResults: Record<number, SeerResult> = {};
    aliveSeerEntries.forEach((seer) => {
      const targetIndex = seerInspectTargets[seer.index];
      if (targetIndex === undefined) return;
      const target = nextPlayers[targetIndex];
      if (!target) return;
      nextSeerResults[seer.index] = {
        name: target.name,
        isWerewolf: target.role === "Werewolf",
      };
    });
    setLastSeerResults(nextSeerResults);

    setPlayers(nextPlayers);

    const winner = getWinner(nextPlayers);
    if (winner) {
      setWinnerText(winner);
      setPhase("ended");
      return;
    }

    const recapOrder = aliveEntriesFromPlayers(nextPlayers).map((entry) => entry.index);
    setNightRecapOrder(recapOrder);
    setNightRecapCursor(0);
    setPhase("nightRecapPass");
  };

  const handleSubmitNightAction = () => {
    if (!gameplayNightActor || gameplayNightActorIndex === null) return;

    if (showActionCard && gameplayNightActor.role === "Werewolf" && currentActionTarget !== null) {
      const target = players[currentActionTarget];
      if (target && target.alive && target.role !== "Werewolf") {
        setWerewolfVotes((prev) => ({ ...prev, [gameplayNightActorIndex]: currentActionTarget }));
      }
    }

    if (showActionCard && gameplayNightActor.role === "Doctor" && currentActionTarget !== null) {
      setDoctorSaveTargets((prev) => ({ ...prev, [gameplayNightActorIndex]: currentActionTarget }));
    }

    if (showActionCard && gameplayNightActor.role === "Seer" && currentActionTarget !== null) {
      setSeerInspectTargets((prev) => ({ ...prev, [gameplayNightActorIndex]: currentActionTarget }));
    }

    const isLastActor = nightActorCursor >= nightActors.length - 1;
    setShowActionCard(false);

    if (isLastActor) {
      const nextVotes =
        showActionCard && gameplayNightActor.role === "Werewolf" && currentActionTarget !== null
          ? { ...werewolfVotes, [gameplayNightActorIndex]: currentActionTarget }
          : werewolfVotes;
      resolveGameplayNight(nextVotes);
      return;
    }

    setNightActorCursor((prev) => prev + 1);
  };

  const currentRecapPlayerIndex = nightRecapOrder[nightRecapCursor] ?? null;
  const currentRecapPlayer = currentRecapPlayerIndex !== null ? players[currentRecapPlayerIndex] : null;

  const goToNextRecap = () => {
    if (nightRecapCursor >= nightRecapOrder.length - 1) {
      setDiscussionLeadIndex(nightRecapOrder[0] ?? null);
      setDiscussionSecondsLeft(60);
      setPhase("discussionPause");
      return;
    }
    setNightRecapCursor((prev) => prev + 1);
  };

  const resolveGameplayDayVotes = (votesByVoter: Record<number, number>) => {
    const counts: Record<number, number> = {};
    Object.values(votesByVoter).forEach((target) => {
      counts[target] = (counts[target] ?? 0) + 1;
    });

    const entries = Object.entries(counts);
    const leadIndex = dayVoteOrder[0] ?? null;
    setVoteRevealLeadIndex(leadIndex);

    if (entries.length === 0) {
      setDayVoteResultText("No valid votes were cast. Nobody was eliminated.");
      setPostVoteWinner(null);
      setPhase("dayVoteReveal");
      return;
    }

    const maxVotes = Math.max(...entries.map((entry) => entry[1]));
    const topTargets = entries.filter((entry) => entry[1] === maxVotes).map((entry) => Number(entry[0]));

    const nextPlayers = [...players];

    if (topTargets.length > 1) {
      setDayVoteResultText("Vote was tied. Nobody was eliminated.");
      setPostVoteWinner(null);
      setPhase("dayVoteReveal");
      return;
    }

    const eliminatedIndex = topTargets[0];
    const eliminatedName = nextPlayers[eliminatedIndex].name;
    const eliminatedRole = nextPlayers[eliminatedIndex].role;
    nextPlayers[eliminatedIndex] = {
      ...nextPlayers[eliminatedIndex],
      alive: false,
    };

    setPlayers(nextPlayers);
    setDayVoteResultText(`${eliminatedName} was voted out by the village.`);

    const winner = eliminatedRole === "Tanner" ? `${eliminatedName} (Tanner) wins` : getWinner(nextPlayers);
    setPostVoteWinner(winner);
    setPhase("dayVoteReveal");
  };

  const startGameplayVoting = () => {
    initializeGameplayDayVotePass(players);
  };

  const skipDiscussionAndVote = () => {
    setDiscussionSecondsLeft(0);
    initializeGameplayDayVotePass(players);
  };

  const continueAfterVoteReveal = () => {
    if (postVoteWinner) {
      setWinnerText(postVoteWinner);
      setPhase("ended");
      return;
    }
    initializeGameplayNightPass(players);
  };

  const submitGameplayVote = () => {
    if (gameplayDayVoterIndex === null || currentActionTarget === null) return;

    const updatedVotes = {
      ...dayVotesByVoter,
      [gameplayDayVoterIndex]: currentActionTarget,
    };
    setDayVotesByVoter(updatedVotes);

    const isLastVoter = dayVoteCursor >= dayVoteOrder.length - 1;
    if (isLastVoter) {
      resolveGameplayDayVotes(updatedVotes);
      return;
    }

    setDayVoteCursor((prev) => prev + 1);
  };

  const roleActionTargets = (() => {
    if (!gameplayNightActor || gameplayNightActorIndex === null) return [] as Array<{ index: number; name: string }>;

    const alive = aliveEntriesFromPlayers(players);
    if (gameplayNightActor.role === "Werewolf") {
      return alive
        .filter((entry) => entry.player.role !== "Werewolf")
        .map((entry) => ({ index: entry.index, name: entry.player.name }));
    }
    if (gameplayNightActor.role === "Doctor") {
      return alive.map((entry) => ({ index: entry.index, name: entry.player.name }));
    }
    if (gameplayNightActor.role === "Seer") {
      return alive
        .filter((entry) => entry.index !== gameplayNightActorIndex)
        .map((entry) => ({ index: entry.index, name: entry.player.name }));
    }

    return [];
  })();

  const gameplayVoteTargets = (() => {
    if (gameplayDayVoterIndex === null) return [] as Array<{ index: number; name: string }>;
    return aliveEntriesFromPlayers(players)
      .filter((entry) => entry.index !== gameplayDayVoterIndex)
      .map((entry) => ({ index: entry.index, name: entry.player.name }));
  })();

  const allWerewolves = players.filter((player) => player.role === "Werewolf");
  const survivingWerewolves = allWerewolves.filter((player) => player.alive);
  const eliminatedWerewolves = allWerewolves.filter((player) => !player.alive);
  const villagersWon = winnerText === "Villagers win";
  const werewolvesWon = winnerText === "Werewolves win";

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
        <h1 className="font-display text-xl font-bold">Werewolf</h1>
        <Button variant="outline" size="sm" className="ml-auto" onClick={resetToSetup}>
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      <div className="flex-1 px-6 pb-10 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono mb-3">
              <Moon className="w-3.5 h-3.5" />
              SOCIAL DEDUCTION
            </div>
            <h2 className="font-display text-3xl font-bold mb-2">Night Falls, Lies Rise</h2>
            <p className="text-sm text-muted-foreground">
              Choose Narrator Mode (host-guided) or Gameplay Mode (pass-the-phone actions).
            </p>
          </div>

          {phase === "setup" && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div>
                <p className="font-semibold mb-2">Mode</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setGameMode("narrator")}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      gameMode === "narrator" ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <p className="font-semibold">Narrator Mode</p>
                    <p className="text-xs text-muted-foreground">One person moderates actions and announcements.</p>
                  </button>
                  <button
                    onClick={() => setGameMode("gameplay")}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      gameMode === "gameplay" ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <p className="font-semibold">Gameplay Mode</p>
                    <p className="text-xs text-muted-foreground">No host. Pass phone for actions and night recap.</p>
                  </button>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Players</p>
                <div className="space-y-2">
                  {playerNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={name}
                        onChange={(event) => {
                          const next = [...playerNames];
                          next[index] = event.target.value;
                          setPlayerNames(next);
                        }}
                        placeholder={`Player ${index + 1} name`}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => setPlayerNames((prev) => prev.filter((_, i) => i !== index))}
                        className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center"
                        disabled={playerNames.length <= MIN_PLAYERS}
                        aria-label={`Remove player ${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setPlayerNames((prev) => [...prev, ""])}
                >
                  <Plus className="w-4 h-4" /> Add Player
                </Button>
              </div>

              {gameMode === "narrator" && (
                <div className="rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold mb-1">Narrator</p>
                  <p className="text-xs text-muted-foreground mb-2">Selected narrator moderates and does not receive a role.</p>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={narratorName}
                    onChange={(event) => setNarratorName(event.target.value)}
                  >
                    {trimmedNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold mb-1 text-red-500">Werewolves</p>
                <p className="text-xs text-muted-foreground mb-2">Scaled by player count, while keeping role balance.</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setWerewolfCount((prev) => Math.max(1, prev - 1))}>-</Button>
                  <div className="min-w-20 text-center text-sm font-mono">{werewolfCount}</div>
                  <Button size="sm" variant="outline" onClick={() => setWerewolfCount((prev) => Math.min(maxWerewolves, prev + 1))}>+</Button>
                  <span className="text-xs text-muted-foreground">max {maxWerewolves}</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold mb-1 text-emerald-500">Doctors</p>
                  <p className="text-xs text-muted-foreground mb-2">1 at 5 players, up to 2 at 6+ players.</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canUseDoctor}
                      onClick={() => setDoctorCount((prev) => Math.max(0, prev - 1))}
                    >
                      -
                    </Button>
                    <div className="min-w-20 text-center text-sm font-mono">{doctorCount}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canUseDoctor}
                      onClick={() => setDoctorCount((prev) => Math.min(maxDoctors, prev + 1))}
                    >
                      +
                    </Button>
                    <span className="text-xs text-muted-foreground">max {maxDoctors}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold mb-1 text-violet-500">Seers</p>
                  <p className="text-xs text-muted-foreground mb-2">1 at 5 players, up to 2 at 6+ players.</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canUseSeer}
                      onClick={() => setSeerCount((prev) => Math.max(0, prev - 1))}
                    >
                      -
                    </Button>
                    <div className="min-w-20 text-center text-sm font-mono">{seerCount}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canUseSeer}
                      onClick={() => setSeerCount((prev) => Math.min(maxSeers, prev + 1))}
                    >
                      +
                    </Button>
                    <span className="text-xs text-muted-foreground">max {maxSeers}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold mb-1 text-amber-500">Tanner</p>
                <p className="text-xs text-muted-foreground mb-2">Neutral role. Wins if voted out during the day.</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTannerCount((prev) => Math.max(0, prev - 1))}
                  >
                    -
                  </Button>
                  <div className="min-w-20 text-center text-sm font-mono">{tannerCount}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTannerCount((prev) => Math.min(maxTanners, prev + 1))}
                  >
                    +
                  </Button>
                  <span className="text-xs text-muted-foreground">max {maxTanners}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold mb-2">Role Quick Guide</p>
                <div className="text-xs text-muted-foreground space-y-1.5">
                  <p><span className="font-semibold text-red-500">Werewolf:</span> Hunt one non-werewolf each night. Win when werewolves match or outnumber others.</p>
                  <p><span className="font-semibold text-emerald-500">Doctor:</span> Choose one player to revive from the night attack.</p>
                  <p><span className="font-semibold text-violet-500">Seer:</span> Check one player each night to learn if they are a werewolf.</p>
                  <p><span className="font-semibold text-amber-500">Tanner:</span> Has no night action. Wins only if voted out during the day.</p>
                  <p><span className="font-semibold">Villager:</span> No night action. Win by eliminating all werewolves.</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>
                  Players in game: {playerCount}
                  {gameMode === "narrator" && narratorName ? <span> (Narrator: {narratorName})</span> : ""}
                </p>
                <p>
                  Roles: {werewolfCount} <span className="font-semibold text-red-500">Werewolf{werewolfCount === 1 ? "" : "s"}</span>
                  {doctorCount > 0 ? <span>, {doctorCount} <span className="font-semibold text-emerald-500">Doctor{doctorCount === 1 ? "" : "s"}</span></span> : ""}
                  {seerCount > 0 ? <span>, {seerCount} <span className="font-semibold text-violet-500">Seer{seerCount === 1 ? "" : "s"}</span></span> : ""}
                  {tannerCount > 0 ? <span>, {tannerCount} <span className="font-semibold text-amber-500">Tanner{tannerCount === 1 ? "" : "s"}</span></span> : ""}
                  , {Math.max(0, playerCount - werewolfCount - doctorCount - seerCount - tannerCount)} Villager
                  {Math.max(0, playerCount - werewolfCount - doctorCount - seerCount - tannerCount) === 1 ? "" : "s"}
                </p>
              </div>

              {playerCount < MIN_PLAYERS && (
                <p className="text-sm text-destructive">Need at least {MIN_PLAYERS} players in-game to start.</p>
              )}
              {hasDuplicateNames && (
                <p className="text-sm text-destructive">Player names must be unique.</p>
              )}
              {narratorMissing && (
                <p className="text-sm text-destructive">Select a narrator for Narrator Mode.</p>
              )}

              <Button
                size="xl"
                className="w-full"
                disabled={playerCount < MIN_PLAYERS || hasDuplicateNames || narratorMissing}
                onClick={startGame}
              >
                Start Werewolf
              </Button>
            </div>
          )}

          {phase === "reveal" && players[revealIndex] && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Private Role Reveal</p>
              <h3 className="font-display text-3xl font-bold mb-4">{players[revealIndex].name}</h3>

              {showRoleCard ? (
                <div className="mb-5">
                  <p className="text-xs text-muted-foreground mb-2">Your role is</p>
                  <p
                    className={`inline-flex px-5 py-2.5 rounded-xl border font-display text-4xl font-bold ${ROLE_BADGE_CLASS[players[revealIndex].role]}`}
                  >
                    {players[revealIndex].role}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {ROLE_PURPOSE[players[revealIndex].role]}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground mb-5">Pass the phone to this player before revealing.</p>
              )}

              <div className="flex justify-center gap-3">
                {!showRoleCard ? (
                  <Button onClick={() => setShowRoleCard(true)}>
                    <Eye className="w-4 h-4" /> Show Role
                  </Button>
                ) : (
                  <Button onClick={goToNextReveal}>
                    <EyeOff className="w-4 h-4" /> Hide and Pass
                  </Button>
                )}
              </div>
            </div>
          )}

          {phase === "night" && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Moon className="w-4 h-4" /> Night Phase (Narrator)
              </div>
              <p className="text-sm text-muted-foreground">Everyone closes eyes. Moderator resolves actions privately.</p>

              <div className="grid gap-3">
                <div>
                  <p className="text-sm font-semibold mb-1 text-red-500">Werewolves choose a target</p>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={nightKillTarget ?? ""}
                    onChange={(event) => setNightKillTarget(Number(event.target.value))}
                  >
                    {aliveNonWerewolves.map((entry) => (
                      <option key={entry.index} value={entry.index}>{entry.player.name}</option>
                    ))}
                  </select>
                </div>

                {aliveDoctors.map((doctor) => (
                  <div key={doctor.index}>
                    <p className="text-sm font-semibold mb-1 text-emerald-500">Doctor ({doctor.player.name}) saves</p>
                    <select
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={doctorSaveTargets[doctor.index] ?? ""}
                      onChange={(event) => setDoctorSaveTargets((prev) => ({ ...prev, [doctor.index]: Number(event.target.value) }))}
                    >
                      {alivePlayers.map((entry) => (
                        <option key={entry.index} value={entry.index}>{entry.player.name}</option>
                      ))}
                    </select>
                  </div>
                ))}

                {aliveSeers.map((seer) => (
                  <div key={seer.index}>
                    <p className="text-sm font-semibold mb-1 text-violet-500">Seer ({seer.player.name}) checks</p>
                    <select
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={seerInspectTargets[seer.index] ?? ""}
                      onChange={(event) => setSeerInspectTargets((prev) => ({ ...prev, [seer.index]: Number(event.target.value) }))}
                    >
                      {alivePlayers
                        .filter((entry) => entry.index !== seer.index)
                        .map((entry) => (
                          <option key={entry.index} value={entry.index}>{entry.player.name}</option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>

              <Button className="w-full" onClick={resolveNarratorNight}>Resolve Night</Button>
            </div>
          )}

          {phase === "day" && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Sun className="w-4 h-4" /> Day Phase (Narrator)
              </div>

              <p className="text-sm">{lastNightText}</p>

              {Object.entries(lastSeerResults).map(([seerIndex, result]) => (
                <p key={seerIndex} className="text-xs text-muted-foreground">
                  <span className="font-semibold text-violet-500">Seer ({players[Number(seerIndex)]?.name})</span> checked {result.name}: {" "}
                  <span className={result.isWerewolf ? "font-semibold text-red-500" : "font-semibold text-emerald-500"}>
                    {result.isWerewolf ? "WEREWOLF" : "NOT A WEREWOLF"}
                  </span>
                </p>
              ))}

              <div className="text-xs text-muted-foreground">
                Alive: {alivePlayers.length} | <span className="font-semibold text-red-500">Werewolves alive: {aliveWerewolves.length}</span> | Villagers alive: {aliveNonWerewolves.length}
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Village vote target</p>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={dayVoteTarget ?? ""}
                  onChange={(event) => setDayVoteTarget(Number(event.target.value))}
                >
                  {alivePlayers.map((entry) => (
                    <option key={entry.index} value={entry.index}>{entry.player.name}</option>
                  ))}
                </select>
              </div>

              <Button className="w-full" onClick={resolveNarratorDayVote}>Eliminate and Start Night</Button>
            </div>
          )}

          {phase === "nightPass" && gameplayNightActor && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
              <p className="text-xs text-muted-foreground">
                Gameplay Mode: Night Actions ({nightActorCursor + 1}/{nightActors.length})
              </p>
              <h3 className="font-display text-3xl font-bold">{gameplayNightActor.name}</h3>

              {!showActionCard ? (
                <>
                  <p className="text-sm text-muted-foreground">Pass the phone to this player, then reveal their action.</p>
                  <Button onClick={() => setShowActionCard(true)}>
                    <Eye className="w-4 h-4" /> Reveal Action
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Your role is</p>
                    <p className={`inline-flex px-5 py-2.5 rounded-xl border font-display text-3xl font-bold ${ROLE_BADGE_CLASS[gameplayNightActor.role]}`}>
                      {gameplayNightActor.role}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {ROLE_PURPOSE[gameplayNightActor.role]}
                    </p>
                  </div>

                  {gameplayNightActor.role === "Villager" && (
                    <p className="text-sm text-muted-foreground">No action tonight. Keep your identity secret.</p>
                  )}

                  {gameplayNightActor.role === "Werewolf" && (
                    <div className="text-left">
                      <p className="text-sm font-semibold mb-1 text-red-500">Choose a player to hunt</p>
                      <select
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        value={currentActionTarget ?? ""}
                        onChange={(event) => setCurrentActionTarget(Number(event.target.value))}
                      >
                        {roleActionTargets.map((target) => (
                          <option key={target.index} value={target.index}>{target.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {gameplayNightActor.role === "Doctor" && (
                    <div className="text-left">
                      <p className="text-sm font-semibold mb-1 text-emerald-500">Choose one player to save</p>
                      <select
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        value={currentActionTarget ?? ""}
                        onChange={(event) => setCurrentActionTarget(Number(event.target.value))}
                      >
                        {roleActionTargets.map((target) => (
                          <option key={target.index} value={target.index}>{target.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {gameplayNightActor.role === "Seer" && (
                    <div className="text-left">
                      <p className="text-sm font-semibold mb-1 text-violet-500">Choose one player to inspect</p>
                      <select
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        value={currentActionTarget ?? ""}
                        onChange={(event) => setCurrentActionTarget(Number(event.target.value))}
                      >
                        {roleActionTargets.map((target) => (
                          <option key={target.index} value={target.index}>{target.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button onClick={handleSubmitNightAction} className="w-full">
                    <EyeOff className="w-4 h-4" /> Hide and Pass
                  </Button>
                </>
              )}
            </div>
          )}

          {phase === "nightRecapPass" && currentRecapPlayer && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
              <p className="text-xs text-muted-foreground">
                Gameplay Mode: Night Recap ({nightRecapCursor + 1}/{nightRecapOrder.length})
              </p>
              <h3 className="font-display text-3xl font-bold">{currentRecapPlayer.name}</h3>
              <p className="text-sm text-muted-foreground">Pass the phone to this player to read the night report.</p>

              <div className="rounded-xl border border-border p-4 text-left bg-background">
                <p className="text-sm">{lastNightText}</p>
                {currentRecapPlayerIndex !== null && lastSeerResults[currentRecapPlayerIndex] && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    <span className="font-semibold text-violet-500">Seer result</span>: {lastSeerResults[currentRecapPlayerIndex].name} is {" "}
                    <span className={lastSeerResults[currentRecapPlayerIndex].isWerewolf ? "font-semibold text-red-500" : "font-semibold text-emerald-500"}>
                      {lastSeerResults[currentRecapPlayerIndex].isWerewolf ? "WEREWOLF" : "NOT A WEREWOLF"}
                    </span>
                  </p>
                )}
              </div>

              <Button onClick={goToNextRecap} className="w-full">
                <EyeOff className="w-4 h-4" /> {nightRecapCursor >= nightRecapOrder.length - 1 ? "Start Discussion" : "Reveal Next Player"}
              </Button>
            </div>
          )}

          {phase === "discussionPause" && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
              <p className="text-xs text-muted-foreground">Gameplay Mode: Discussion Break</p>
              <h3 className="font-display text-4xl font-bold">{discussionSecondsLeft}s</h3>
              <p className="text-sm text-muted-foreground">Discuss for 1 minute. No one touches the phone until timer ends.</p>

              {discussionSecondsLeft === 0 && (
                <div className="rounded-xl border border-border bg-background p-4 text-left">
                  <p className="text-sm">
                    Pass the phone to <span className="font-semibold">{discussionLeadIndex !== null ? players[discussionLeadIndex]?.name : "the first player"}</span>.
                    They should tell the group to continue with voting.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={startGameplayVoting} className="w-full" disabled={discussionSecondsLeft > 0}>
                  Start Voting Pass
                </Button>
                <Button onClick={skipDiscussionAndVote} variant="outline" className="w-full">
                  Skip Wait and Vote
                </Button>
              </div>
            </div>
          )}

          {phase === "dayVotePass" && gameplayDayVoter && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
              <p className="text-xs text-muted-foreground">
                Gameplay Mode: Day Voting ({dayVoteCursor + 1}/{dayVoteOrder.length})
              </p>
              <h3 className="font-display text-3xl font-bold">{gameplayDayVoter.name}</h3>
              <p className="text-sm text-muted-foreground">Pass the phone to this player to cast their vote.</p>

              <div className="text-left">
                <p className="text-sm font-semibold mb-1">Choose a player to eliminate</p>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={currentActionTarget ?? ""}
                  onChange={(event) => setCurrentActionTarget(Number(event.target.value))}
                >
                  {gameplayVoteTargets.map((target) => (
                    <option key={target.index} value={target.index}>{target.name}</option>
                  ))}
                </select>
              </div>

              {dayVoteResultText && <p className="text-xs text-muted-foreground">Last vote: {dayVoteResultText}</p>}

              <Button onClick={submitGameplayVote} className="w-full">
                <EyeOff className="w-4 h-4" /> {dayVoteCursor >= dayVoteOrder.length - 1 ? "Submit Final Vote" : "Vote and Pass"}
              </Button>
            </div>
          )}

          {phase === "dayVoteReveal" && voteRevealLeadIndex !== null && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
              <p className="text-xs text-muted-foreground">Gameplay Mode: Vote Result Announcement</p>
              <h3 className="font-display text-3xl font-bold">{players[voteRevealLeadIndex]?.name}</h3>
              <p className="text-sm text-muted-foreground">Pass the phone to this player to announce the result to everyone.</p>

              <div className="rounded-xl border border-border bg-background p-4 text-left">
                <p className="text-sm">{dayVoteResultText}</p>
              </div>

              <Button onClick={continueAfterVoteReveal} className="w-full">
                <EyeOff className="w-4 h-4" /> Continue
              </Button>
            </div>
          )}

          {phase === "ended" && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">Game Over</p>
              <h3 className="font-display text-4xl font-bold text-primary">{winnerText}</h3>
              <div className="text-xs text-muted-foreground">
                Final alive: {players.filter((player) => player.alive).map((player) => player.name).join(", ") || "None"}
              </div>
              {dayVoteResultText && <p className="text-xs text-muted-foreground">Last day result: {dayVoteResultText}</p>}

              <Button
                variant={showWerewolfReveal ? "default" : "outline"}
                onClick={() => setShowWerewolfReveal((prev) => !prev)}
              >
                {showWerewolfReveal ? "Hide Werewolves" : "Reveal Werewolves"}
              </Button>

              {showWerewolfReveal && (
                <div className="rounded-xl border border-border bg-background p-4 text-left space-y-3">
                  {werewolvesWon && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Winning Werewolves</p>
                        <p className="text-sm font-semibold text-red-500">
                          {survivingWerewolves.map((player) => player.name).join(", ") || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Eliminated Werewolves</p>
                        <p className="text-sm text-red-500/80">
                          {eliminatedWerewolves.map((player) => player.name).join(", ") || "None"}
                        </p>
                      </div>
                    </>
                  )}

                  {villagersWon && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Werewolves</p>
                      <p className="text-sm text-red-500">
                        {allWerewolves.map((player) => `${player.name}${player.alive ? " (alive)" : " (eliminated)"}`).join(", ") || "None"}
                      </p>
                    </div>
                  )}

                  {!villagersWon && !werewolvesWon && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Werewolves</p>
                      <p className="text-sm text-red-500">
                        {allWerewolves.map((player) => `${player.name}${player.alive ? " (alive)" : " (eliminated)"}`).join(", ") || "None"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={resetToSetup}>Start New Game</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Werewolf;
