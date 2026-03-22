// Utility functions for game management

export interface GameQuestion {
  id: string;
  text: string;
  custom?: boolean;
}

export interface GameQuestionPair {
  a: string;
  b: string;
}

// localStorage keys
const CUSTOM_QUESTIONS_PREFIX = "custom_questions_";

// Store custom questions
export const saveCustomQuestions = (gameType: string, questions: string[]) => {
  const key = CUSTOM_QUESTIONS_PREFIX + gameType;
  localStorage.setItem(key, JSON.stringify(questions));
};

// Retrieve custom questions
export const getCustomQuestions = (gameType: string): string[] => {
  const key = CUSTOM_QUESTIONS_PREFIX + gameType;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

// Add a single custom question
export const addCustomQuestion = (gameType: string, question: string) => {
  const custom = getCustomQuestions(gameType);
  if (question.trim() && !custom.includes(question)) {
    custom.push(question);
    saveCustomQuestions(gameType, custom);
    return true;
  }
  return false;
};

// Remove custom question
export const removeCustomQuestion = (gameType: string, question: string) => {
  const custom = getCustomQuestions(gameType);
  const filtered = custom.filter((q) => q !== question);
  saveCustomQuestions(gameType, filtered);
};

// Get merged questions (default + custom)
export const getMergedQuestions = (defaultQuestions: string[], gameType: string): string[] => {
  const custom = getCustomQuestions(gameType);
  return [...defaultQuestions, ...custom];
};

// Get merged question pairs for games like Would You Rather
export const getMergedQuestionPairs = (defaultQuestions: GameQuestionPair[], gameType: string): GameQuestionPair[] => {
  const custom = getCustomQuestions(gameType);
  const customPairs = custom.map((q) => {
    const parts = q.split(" OR ");
    if (parts.length === 2) {
      return { a: parts[0].trim(), b: parts[1].trim() };
    }
    return { a: q, b: "Something else" };
  });
  return [...defaultQuestions, ...customPairs];
};

// Timer utilities
export interface TimerState {
  isActive: boolean;
  timeLeft: number;
  duration: number;
}

// Voting utilities
export interface VotingResult {
  option: string;
  votes: number;
  percentage: number;
}

export const calculateVotes = (votes: Record<string, number>): VotingResult[] => {
  const total = Object.values(votes).reduce((sum, v) => sum + v, 0);
  return Object.entries(votes).map(([option, count]) => ({
    option,
    votes: count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
};
