import { DifficultyType, QuizResponse } from '../types/quiz';
import { getRankForLevel } from './levelingSystem';

const LEDGER_STORAGE_KEY = 'quizme_xp_integrity_ledger_v4';

export interface DailyIntegrityLedger {
  dateKey: string;
  /** Map of quizSignature -> highest correct score achieved today */
  quizHighWaterMarks: Record<string, { bestScore: number; total: number; completions: number; bonusClaimed: boolean }>;
  /** Unique flashcard hashes rewarded today */
  rewardedFlashcards: string[];
  /** Unique Daily Trivia Blitz IDs rewarded today */
  rewardedTriviaIds: number[];
  /** Unique Spelling Bee words rewarded today */
  rewardedBeeWords: string[];
  /** Unique Word-Chain words rewarded today */
  rewardedChainWords: string[];
  /** Unique Math Boss equations rewarded today */
  rewardedMathEquations: string[];
  /** Total verified arena XP earned today (capped to prevent bot scripting) */
  arenaXpToday: number;
  /** Total verified effort units completed today (used to unlock Daily Check-In) */
  verifiedEffortUnitsToday: number;
  /** Total questions answered with verified dwell time today */
  verifiedQuestionsToday: number;
}

function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyLedger(dateKey: string): DailyIntegrityLedger {
  return {
    dateKey,
    quizHighWaterMarks: {},
    rewardedFlashcards: [],
    rewardedTriviaIds: [],
    rewardedBeeWords: [],
    rewardedChainWords: [],
    rewardedMathEquations: [],
    arenaXpToday: 0,
    verifiedEffortUnitsToday: 0,
    verifiedQuestionsToday: 0,
  };
}

export function loadIntegrityLedger(): DailyIntegrityLedger {
  const today = getTodayDateKey();
  if (typeof window === 'undefined') {
    return createEmptyLedger(today);
  }
  try {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (!raw) {
      return createEmptyLedger(today);
    }
    const parsed = JSON.parse(raw) as DailyIntegrityLedger;
    if (!parsed || parsed.dateKey !== today) {
      const fresh = createEmptyLedger(today);
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return {
      ...createEmptyLedger(today),
      ...parsed,
    };
  } catch {
    return createEmptyLedger(today);
  }
}

export function saveIntegrityLedger(ledger: DailyIntegrityLedger): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Generates a deterministic fingerprint for a quiz so repeating or restarting
 * the exact same quiz cannot be used to infinitely farm XP.
 */
export function computeQuizSignature(quiz: QuizResponse): string {
  const titlePart = (quiz.quiz_title || 'untitled').trim().toLowerCase();
  const qPart = (quiz.questions || [])
    .slice(0, 15)
    .map((q) => `${(q.question || '').trim().toLowerCase().slice(0, 32)}:${(q.correct_answer || '').trim().toLowerCase()}`)
    .join('|');
  let hash = 0;
  const combined = `${titlePart}__${quiz.questions?.length || 0}__${qPart}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return `qz_${Math.abs(hash)}_${quiz.questions?.length || 0}`;
}

export interface VerifiedQuizRewardResult {
  totalXpEarned: number;
  baseXp: number;
  accuracyBonusXp: number;
  streakBonusXp: number;
  difficultyBonusXp: number;
  dailyFirstQuizBonusXp: number;
  gemsEarned: number;
  passedMasteryThreshold: boolean;
  isVerifiedEffort: boolean;
  newlyCreditedCorrect: number;
  summaryTags: string[];
  integrityNotice?: string;
}

/**
 * Verifies quiz effort and calculates anti-farm XP & Gems.
 * Closes loopholes:
 * 1. 0 correct answers = 0 XP, 0 Gems, 0 completion credit.
 * 2. Button-mashing (< 1.5s per answered question with < 50% accuracy) = 0 XP.
 * 3. Repeating the same quiz on the same day only awards XP for newly improved correct answers (High-Water Mark).
 * 4. Micro-quizzes (< 5 questions) scale completion bonuses proportionally.
 */
export function verifyAndCalculateQuizRewards(params: {
  quiz: QuizResponse;
  score: number;
  total: number;
  answeredCount: number;
  timeSpentSeconds: number;
  difficulty?: DifficultyType;
  streak: number;
  level: number;
  speedBonusXp?: number;
  maxCombo?: number;
}): VerifiedQuizRewardResult {
  const {
    quiz,
    score,
    total,
    answeredCount,
    timeSpentSeconds,
    difficulty = 'Intermediate',
    streak = 1,
    level = 1,
    speedBonusXp = 0,
    maxCombo = 0,
  } = params;

  const summaryTags: string[] = [];

  // Gate 1: Zero correct answers or zero answered questions -> 0 XP
  if (score <= 0 || total <= 0 || answeredCount <= 0) {
    return {
      totalXpEarned: 0,
      baseXp: 0,
      accuracyBonusXp: 0,
      streakBonusXp: 0,
      difficultyBonusXp: 0,
      dailyFirstQuizBonusXp: 0,
      gemsEarned: 0,
      passedMasteryThreshold: false,
      isVerifiedEffort: false,
      newlyCreditedCorrect: 0,
      summaryTags: ['🛡️ Zero Correct Answers — Complete questions accurately to earn XP'],
      integrityNotice: 'No XP awarded: You must answer at least 1 question correctly to earn experience.',
    };
  }

  const accuracy = score / total;
  const percent = Math.round(accuracy * 100);
  const avgSecondsPerAnswer = timeSpentSeconds / Math.max(1, answeredCount);

  // Gate 2: Anti-Button-Mashing Dwell Check
  if (avgSecondsPerAnswer < 1.4 && percent < 50) {
    return {
      totalXpEarned: 0,
      baseXp: 0,
      accuracyBonusXp: 0,
      streakBonusXp: 0,
      difficultyBonusXp: 0,
      dailyFirstQuizBonusXp: 0,
      gemsEarned: 0,
      passedMasteryThreshold: false,
      isVerifiedEffort: false,
      newlyCreditedCorrect: 0,
      summaryTags: ['🛡️ Rapid Guessing Detected (<1.4s/question) — Read & solve carefully to earn XP'],
      integrityNotice: 'Anti-Farm Protection: Rapid random guessing (<1.4s per question with <50% accuracy) does not award XP.',
    };
  }

  const ledger = loadIntegrityLedger();
  const sig = computeQuizSignature(quiz);
  const prevRecord = ledger.quizHighWaterMarks[sig];

  // Gate 3: High-Water-Mark Repeat Quiz Deduplication
  const prevBestScore = prevRecord ? prevRecord.bestScore : 0;
  const newlyCreditedCorrect = Math.max(0, score - prevBestScore);
  const isRepeatWithNoImprovement = prevRecord !== undefined && newlyCreditedCorrect === 0;

  if (isRepeatWithNoImprovement) {
    return {
      totalXpEarned: 0,
      baseXp: 0,
      accuracyBonusXp: 0,
      streakBonusXp: 0,
      difficultyBonusXp: 0,
      dailyFirstQuizBonusXp: 0,
      gemsEarned: 0,
      passedMasteryThreshold: percent >= 60,
      isVerifiedEffort: false,
      newlyCreditedCorrect: 0,
      summaryTags: [
        `🛡️ Replay Mode: You already earned XP for ${prevBestScore}/${total} on this quiz today`,
        '💡 Improve your previous high score or generate a fresh quiz topic to earn more XP!',
      ],
      integrityNotice: `Replay Protection: You already claimed XP for ${prevBestScore}/${total} correct answers on this quiz today.`,
    };
  }

  const passedMasteryThreshold = percent >= 60;
  // Volume scaling factor so 1-2 question micro-quizzes can't farm full completion bonuses
  const volumeScale = Math.min(1, total / 5);

  const perCorrectBase = passedMasteryThreshold ? 14 : 7;
  // Speed bonus is only granted if average dwell time is realistic (>= 2.0s per question)
  const verifiedSpeedBonus =
    avgSecondsPerAnswer >= 2.0
      ? Math.min(newlyCreditedCorrect * 6, Math.round(speedBonusXp * 0.45))
      : 0;
  const baseXp = newlyCreditedCorrect * perCorrectBase + verifiedSpeedBonus;

  const canClaimCompletionBonus = !prevRecord?.bonusClaimed && passedMasteryThreshold;

  let accuracyBonusXp = 0;
  if (canClaimCompletionBonus) {
    if (percent === 100 && total >= 3) {
      accuracyBonusXp = Math.round(55 * volumeScale);
      summaryTags.push(`🌟 Flawless 100% Mastery (+${accuracyBonusXp} XP)`);
    } else if (percent >= 90) {
      accuracyBonusXp = Math.round(35 * volumeScale);
      summaryTags.push(`🎯 90%+ High Precision (+${accuracyBonusXp} XP)`);
    } else if (percent >= 80) {
      accuracyBonusXp = Math.round(20 * volumeScale);
      summaryTags.push(`✨ 80%+ Solid Mastery (+${accuracyBonusXp} XP)`);
    }
  } else if (!passedMasteryThreshold) {
    summaryTags.push('⚠️ Below 60% Accuracy (Reduced XP — Score 60%+ for Mastery Bonuses!)');
  }

  if (prevRecord && newlyCreditedCorrect > 0) {
    summaryTags.push(
      `📈 Score Improved (+${newlyCreditedCorrect} new correct answers credited vs. ${prevBestScore}/${total} earlier)`
    );
  }

  const diffMult =
    difficulty === 'Master' ? 0.35 : difficulty === 'Intermediate' ? 0.15 : 0;
  const difficultyBonusXp = passedMasteryThreshold
    ? Math.round((baseXp + accuracyBonusXp) * diffMult)
    : 0;
  if (difficultyBonusXp > 0) {
    summaryTags.push(`🔥 ${difficulty} Tier (+${difficultyBonusXp} XP)`);
  }

  const streakBonusPct = Math.min(0.5, Math.max(0, (streak - 1) * 0.05));
  const rankBonusPct = getRankForLevel(level).xpMultiplierBonus;
  const combinedRetentionMult = streakBonusPct + rankBonusPct;
  const streakBonusXp = canClaimCompletionBonus
    ? Math.round((baseXp + accuracyBonusXp) * combinedRetentionMult) +
      Math.min(20, Math.round(maxCombo * 2 * volumeScale))
    : 0;
  if (streakBonusXp > 0) {
    summaryTags.push(`⚡ Streak & Rank Boost (+${streakBonusXp} XP)`);
  }

  let dailyFirstQuizBonusXp = 0;
  if (typeof window !== 'undefined' && canClaimCompletionBonus && total >= 3) {
    const todayKey = getTodayDateKey();
    const lastFirstQuizDate = localStorage.getItem('quizme_daily_first_quiz_date_v3');
    if (lastFirstQuizDate !== todayKey) {
      dailyFirstQuizBonusXp = Math.round(75 * volumeScale);
      localStorage.setItem('quizme_daily_first_quiz_date_v3', todayKey);
      summaryTags.push(`☀️ First Mastery Quiz of the Day (+${dailyFirstQuizBonusXp} XP)`);
    }
  }

  const totalXpEarned = Math.max(
    0,
    baseXp + accuracyBonusXp + difficultyBonusXp + streakBonusXp + dailyFirstQuizBonusXp
  );

  const gemsEarned = Math.max(
    0,
    newlyCreditedCorrect * 2 + (canClaimCompletionBonus && percent === 100 ? Math.round(10 * volumeScale) : 0)
  );

  // Record in ledger
  ledger.quizHighWaterMarks[sig] = {
    bestScore: Math.max(prevBestScore, score),
    total,
    completions: (prevRecord?.completions || 0) + 1,
    bonusClaimed: Boolean(prevRecord?.bonusClaimed || canClaimCompletionBonus),
  };
  ledger.verifiedQuestionsToday += newlyCreditedCorrect;
  if (passedMasteryThreshold || newlyCreditedCorrect >= 3) {
    ledger.verifiedEffortUnitsToday += 1;
  }
  saveIntegrityLedger(ledger);

  return {
    totalXpEarned,
    baseXp,
    accuracyBonusXp,
    streakBonusXp,
    difficultyBonusXp,
    dailyFirstQuizBonusXp,
    gemsEarned,
    passedMasteryThreshold,
    isVerifiedEffort: true,
    newlyCreditedCorrect,
    summaryTags,
  };
}

/**
 * Verifies Flashcard active recall before awarding XP.
 * Requires the card to have been flipped AND studied for at least 2.2 seconds,
 * and prevents the same card from ever awarding XP twice on the same day.
 */
export function verifyFlashcardMasteryXp(params: {
  front: string;
  back: string;
  wasFlipped: boolean;
  dwellTimeMs: number;
}): { xp: number; gems: number; allowed: boolean; reason?: string } {
  const { front, back, wasFlipped, dwellTimeMs } = params;
  if (!wasFlipped) {
    return {
      xp: 0,
      gems: 0,
      allowed: false,
      reason: 'Flip the flashcard first to verify active recall before claiming Mastery XP.',
    };
  }
  if (dwellTimeMs < 2200) {
    return {
      xp: 0,
      gems: 0,
      allowed: false,
      reason: 'Spend at least 2.2 seconds reviewing the card to earn Verified Recall XP.',
    };
  }

  const ledger = loadIntegrityLedger();
  if (ledger.rewardedFlashcards.length >= 30) {
    return {
      xp: 0,
      gems: 0,
      allowed: false,
      reason: 'Daily Flashcard XP cap (30 cards/day) reached! Take a full quiz to earn more XP.',
    };
  }

  const cardSig = `${front.trim().toLowerCase().slice(0, 40)}::${back.trim().toLowerCase().slice(0, 40)}`;
  if (ledger.rewardedFlashcards.includes(cardSig)) {
    return {
      xp: 0,
      gems: 0,
      allowed: false,
      reason: 'Already earned Mastery XP for this flashcard today.',
    };
  }

  ledger.rewardedFlashcards.push(cardSig);
  ledger.verifiedQuestionsToday += 1;
  if (ledger.rewardedFlashcards.length % 5 === 0) {
    ledger.verifiedEffortUnitsToday += 1;
  }
  saveIntegrityLedger(ledger);

  return { xp: 5, gems: 1, allowed: true };
}

/**
 * Verifies Daily Trivia Blitz reward so switching tabs or refreshing the page
 * can never re-claim the same trivia question, capped at 3 per day.
 */
export function verifyDailyTriviaBlitzXp(triviaId: number): {
  xp: number;
  coins: number;
  allowed: boolean;
  remainingToday: number;
  reason?: string;
} {
  const ledger = loadIntegrityLedger();
  const MAX_DAILY_BLITZ = 3;

  if (ledger.rewardedTriviaIds.includes(triviaId)) {
    return {
      xp: 0,
      coins: 0,
      allowed: false,
      remainingToday: Math.max(0, MAX_DAILY_BLITZ - ledger.rewardedTriviaIds.length),
      reason: 'Already claimed XP for this Daily Trivia question today.',
    };
  }

  if (ledger.rewardedTriviaIds.length >= MAX_DAILY_BLITZ) {
    return {
      xp: 0,
      coins: 0,
      allowed: false,
      remainingToday: 0,
      reason: 'Daily Trivia Blitz limit (3/3 per day) reached! Launch a full quiz to earn more XP.',
    };
  }

  ledger.rewardedTriviaIds.push(triviaId);
  ledger.verifiedQuestionsToday += 1;
  if (ledger.rewardedTriviaIds.length === MAX_DAILY_BLITZ) {
    ledger.verifiedEffortUnitsToday += 1;
  }
  saveIntegrityLedger(ledger);

  return {
    xp: 15,
    coins: 3,
    allowed: true,
    remainingToday: Math.max(0, MAX_DAILY_BLITZ - ledger.rewardedTriviaIds.length),
  };
}

export function getRewardedTriviaIdsToday(): number[] {
  return loadIntegrityLedger().rewardedTriviaIds;
}

/**
 * Verifies Games Arena XP (Word-Chain, Math Boss Rush, Spelling Bee)
 * so duplicate words/equations, 0-score matches, or hint/pause abuse cannot farm XP.
 */
export function verifyArenaItemXp(params: {
  mode: 'word_chain' | 'math_boss' | 'spelling_bee';
  signature: string;
  rawXp: number;
  usedPauseOrHint?: boolean;
}): { xp: number; allowed: boolean; reason?: string } {
  const { mode, signature, rawXp, usedPauseOrHint = false } = params;
  if (rawXp <= 0) {
    return { xp: 0, allowed: false, reason: 'No XP earned for 0 score.' };
  }

  const ledger = loadIntegrityLedger();
  const MAX_DAILY_ARENA_XP = 600;
  if (ledger.arenaXpToday >= MAX_DAILY_ARENA_XP) {
    return {
      xp: 0,
      allowed: false,
      reason: 'Daily Arcade Arena XP cap (600 XP/day) reached! Play full quizzes to continue leveling up.',
    };
  }

  const normSig = signature.trim().toUpperCase();
  if (mode === 'spelling_bee') {
    if (ledger.rewardedBeeWords.includes(normSig)) {
      return {
        xp: 0,
        allowed: false,
        reason: `Already mastered "${normSig}" today (0 duplicate XP).`,
      };
    }
    ledger.rewardedBeeWords.push(normSig);
  } else if (mode === 'math_boss') {
    if (ledger.rewardedMathEquations.includes(normSig)) {
      return {
        xp: 0,
        allowed: false,
        reason: 'Already solved this exact equation today (0 duplicate XP).',
      };
    }
    ledger.rewardedMathEquations.push(normSig);
  } else if (mode === 'word_chain') {
    if (ledger.rewardedChainWords.includes(normSig)) {
      return {
        xp: 0,
        allowed: false,
        reason: 'Already claimed XP for this word chain today.',
      };
    }
    ledger.rewardedChainWords.push(normSig);
  }

  const effectiveXp = usedPauseOrHint ? Math.max(5, Math.round(rawXp * 0.55)) : rawXp;
  const clampedXp = Math.min(effectiveXp, MAX_DAILY_ARENA_XP - ledger.arenaXpToday);

  ledger.arenaXpToday += clampedXp;
  ledger.verifiedQuestionsToday += 1;
  if (ledger.verifiedQuestionsToday % 3 === 0) {
    ledger.verifiedEffortUnitsToday += 1;
  }
  saveIntegrityLedger(ledger);

  return { xp: clampedXp, allowed: true };
}

/**
 * Checks whether the user has completed genuine study effort today
 * to unlock the Daily Retention Check-In chest.
 */
export function getDailyEffortVerificationStatus(): {
  unlocked: boolean;
  verifiedQuestionsToday: number;
  requiredQuestions: number;
  verifiedEffortUnitsToday: number;
} {
  const ledger = loadIntegrityLedger();
  const requiredQuestions = 3;
  const unlocked =
    ledger.verifiedEffortUnitsToday >= 1 || ledger.verifiedQuestionsToday >= requiredQuestions;
  return {
    unlocked,
    verifiedQuestionsToday: ledger.verifiedQuestionsToday,
    requiredQuestions,
    verifiedEffortUnitsToday: ledger.verifiedEffortUnitsToday,
  };
}
