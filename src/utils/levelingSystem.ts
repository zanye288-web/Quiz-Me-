import { DifficultyType, UserStats } from '../types/quiz';

export const LEVEL_SYSTEM_VERSION = 'v3_revamped';
export const LEVEL_RESET_STORAGE_KEY = 'quizme_level_reset_v3_executed';
export const DAILY_CHECKIN_STORAGE_KEY = 'quizme_daily_retention_checkin_v3';
export const CLAIMED_LEVEL_MILESTONES_KEY = 'quizme_claimed_level_milestones_v3';

export interface RankTierInfo {
  id: string;
  minLevel: number;
  maxLevel: number;
  title: string;
  tierName: 'Bronze' | 'Silver' | 'Gold' | 'Master' | 'Diamond';
  badgeEmoji: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  gradientClass: string;
  perkDescription: string;
  xpMultiplierBonus: number; // e.g. 0.05 = +5% bonus XP
}

export const PRESTIGE_RANKS: RankTierInfo[] = [
  {
    id: 'seedling',
    minLevel: 1,
    maxLevel: 1,
    title: 'Curious Seedling',
    tierName: 'Bronze',
    badgeEmoji: '🌱',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    gradientClass: 'from-emerald-500 to-teal-500',
    perkDescription: 'Starter Rank • +100 XP Daily First-Quiz Bonus unlocked',
    xpMultiplierBonus: 0,
  },
  {
    id: 'apprentice',
    minLevel: 2,
    maxLevel: 3,
    title: 'Keen Apprentice',
    tierName: 'Bronze',
    badgeEmoji: '⚡',
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-50 dark:bg-sky-950/50',
    borderClass: 'border-sky-200 dark:border-sky-800',
    gradientClass: 'from-sky-500 to-blue-600',
    perkDescription: '+5% Mastery XP Boost on all completed quizzes',
    xpMultiplierBonus: 0.05,
  },
  {
    id: 'explorer',
    minLevel: 4,
    maxLevel: 6,
    title: 'Quest Explorer',
    tierName: 'Silver',
    badgeEmoji: '🧭',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/50',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
    gradientClass: 'from-indigo-500 to-violet-600',
    perkDescription: '+10% Mastery XP Boost & Silver Prestige Badge',
    xpMultiplierBonus: 0.1,
  },
  {
    id: 'tactician',
    minLevel: 7,
    maxLevel: 9,
    title: 'Mind Tactician',
    tierName: 'Silver',
    badgeEmoji: '🎯',
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/50',
    borderClass: 'border-violet-200 dark:border-violet-800',
    gradientClass: 'from-violet-600 to-purple-600',
    perkDescription: '+15% Mastery XP Boost & Bonus Streak Shield',
    xpMultiplierBonus: 0.15,
  },
  {
    id: 'vanguard',
    minLevel: 10,
    maxLevel: 14,
    title: 'Golden Vanguard',
    tierName: 'Gold',
    badgeEmoji: '🛡️',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/50',
    borderClass: 'border-amber-200 dark:border-amber-800',
    gradientClass: 'from-amber-500 to-orange-500',
    perkDescription: '+20% Mastery XP Boost & Gold Leaderboard Frame',
    xpMultiplierBonus: 0.2,
  },
  {
    id: 'polymath',
    minLevel: 15,
    maxLevel: 19,
    title: 'Arcane Polymath',
    tierName: 'Master',
    badgeEmoji: '🔮',
    colorClass: 'text-fuchsia-600 dark:text-fuchsia-400',
    bgClass: 'bg-fuchsia-50 dark:bg-fuchsia-950/50',
    borderClass: 'border-fuchsia-200 dark:border-fuchsia-800',
    gradientClass: 'from-fuchsia-500 to-pink-600',
    perkDescription: '+25% Mastery XP Boost & +1 Bonus Mascot Coin on 90%+ quizzes',
    xpMultiplierBonus: 0.25,
  },
  {
    id: 'grandmaster',
    minLevel: 20,
    maxLevel: 29,
    title: 'Grandmaster Sage',
    tierName: 'Master',
    badgeEmoji: '👑',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/50',
    borderClass: 'border-rose-200 dark:border-rose-800',
    gradientClass: 'from-rose-500 to-amber-500',
    perkDescription: '+30% Mastery XP Boost & Grandmaster Crown Aura',
    xpMultiplierBonus: 0.3,
  },
  {
    id: 'luminary',
    minLevel: 30,
    maxLevel: 999,
    title: 'Celestial Legend',
    tierName: 'Diamond',
    badgeEmoji: '🌌',
    colorClass: 'text-cyan-500 dark:text-cyan-300',
    bgClass: 'bg-cyan-50 dark:bg-cyan-950/50',
    borderClass: 'border-cyan-300 dark:border-cyan-700',
    gradientClass: 'from-cyan-400 via-indigo-500 to-fuchsia-500',
    perkDescription: '+40% Mastery XP Boost & Diamond Celestial Prestige',
    xpMultiplierBonus: 0.4,
  },
];

export interface LevelMilestoneReward {
  level: number;
  title: string;
  description: string;
  gems: number;
  coins: number;
  xpBonus: number;
  icon: string;
}

export const LEVEL_MILESTONE_REWARDS: LevelMilestoneReward[] = [
  {
    level: 2,
    title: 'Apprentice Promotion Chest',
    description: 'First level-up milestone! Keep building your study momentum.',
    gems: 30,
    coins: 5,
    xpBonus: 50,
    icon: '🎁',
  },
  {
    level: 4,
    title: 'Explorer Supply Drop',
    description: 'Unlocked Silver Prestige Tier & +10% permanent XP boost.',
    gems: 60,
    coins: 10,
    xpBonus: 120,
    icon: '🧭',
  },
  {
    level: 7,
    title: 'Tactician Vault',
    description: 'High-retention scholar reward for reaching Level 7.',
    gems: 100,
    coins: 18,
    xpBonus: 250,
    icon: '🎯',
  },
  {
    level: 10,
    title: 'Golden Vanguard Chest',
    description: 'Double-digit mastery! Massive Gem & Mascot Coin jackpot.',
    gems: 175,
    coins: 30,
    xpBonus: 450,
    icon: '🏆',
  },
  {
    level: 15,
    title: 'Arcane Polymath Reliquary',
    description: 'Elite retention milestone for dedicated scholars.',
    gems: 250,
    coins: 45,
    xpBonus: 750,
    icon: '🔮',
  },
  {
    level: 20,
    title: 'Grandmaster Sovereign Chest',
    description: 'Legendary milestone reached by top 1% of learners.',
    gems: 400,
    coins: 75,
    xpBonus: 1200,
    icon: '👑',
  },
  {
    level: 30,
    title: 'Celestial Legend Trove',
    description: 'Supreme pinnacle of lifelong learning & mastery.',
    gems: 750,
    coins: 120,
    xpBonus: 2500,
    icon: '🌌',
  },
];

/**
 * Challenging progressive XP required to advance from `level` to `level + 1`.
 * Level 1 -> 2 requires 300 XP
 * Level 2 -> 3 requires 525 XP
 * Level 3 -> 4 requires 800 XP
 * Level 4 -> 5 requires 1,125 XP
 * Scales with L^1.45 so each level feels earned and meaningful!
 */
export function getXpRequiredForLevelStep(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  const raw = 300 * Math.pow(safeLevel, 1.45);
  return Math.round(raw / 25) * 25;
}

/**
 * Total cumulative XP required to reach `targetLevel` (starting from Level 1 at 0 XP).
 */
export function getCumulativeXpForLevel(targetLevel: number): number {
  const safeTarget = Math.max(1, Math.floor(targetLevel));
  let total = 0;
  for (let lvl = 1; lvl < safeTarget; lvl++) {
    total += getXpRequiredForLevelStep(lvl);
  }
  return total;
}

/**
 * Calculates current level from total cumulative XP using the challenging curve.
 */
export function calculateLevelFromXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  let level = 1;
  let accumulated = 0;

  while (level < 100) {
    const stepXp = getXpRequiredForLevelStep(level);
    if (safeXp < accumulated + stepXp) {
      break;
    }
    accumulated += stepXp;
    level++;
  }
  return level;
}

export function getRankForLevel(level: number): RankTierInfo {
  const safeLevel = Math.max(1, level);
  for (let i = PRESTIGE_RANKS.length - 1; i >= 0; i--) {
    if (safeLevel >= PRESTIGE_RANKS[i].minLevel) {
      return PRESTIGE_RANKS[i];
    }
  }
  return PRESTIGE_RANKS[0];
}

export interface LevelProgressDetails {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  xpRequiredForNextLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
  rank: RankTierInfo;
  nextRank: RankTierInfo | null;
  nextMilestone: LevelMilestoneReward | null;
  streakMultiplierPercent: number;
}

export function getLevelProgress(xp: number, streak = 1): LevelProgressDetails {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  const level = calculateLevelFromXp(safeXp);
  const levelStartXp = getCumulativeXpForLevel(level);
  const xpRequiredForNextLevel = getXpRequiredForLevelStep(level);
  const currentLevelXp = Math.max(0, safeXp - levelStartXp);
  const xpToNextLevel = Math.max(0, xpRequiredForNextLevel - currentLevelXp);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentLevelXp / xpRequiredForNextLevel) * 100))
  );

  const rank = getRankForLevel(level);
  const nextRank = PRESTIGE_RANKS.find((r) => r.minLevel > level) || null;
  const nextMilestone = LEVEL_MILESTONE_REWARDS.find((m) => m.level > level) || null;
  const streakMultiplierPercent = Math.min(50, Math.max(0, (streak - 1) * 5));

  return {
    level,
    totalXp: safeXp,
    currentLevelXp,
    xpRequiredForNextLevel,
    xpToNextLevel,
    progressPercent,
    rank,
    nextRank,
    nextMilestone,
    streakMultiplierPercent,
  };
}

/**
 * Calculates challenging, retention-driven XP & Gems for completing a quiz.
 * Rewards accuracy, difficulty, streak consistency, and daily first-play retention.
 */
export function calculateRetentionQuizRewards(params: {
  score: number;
  total: number;
  difficulty?: DifficultyType;
  streak: number;
  level: number;
  speedBonusXp?: number;
  maxCombo?: number;
}): {
  totalXpEarned: number;
  baseXp: number;
  accuracyBonusXp: number;
  streakBonusXp: number;
  difficultyBonusXp: number;
  dailyFirstQuizBonusXp: number;
  gemsEarned: number;
  passedMasteryThreshold: boolean;
  summaryTags: string[];
} {
  const {
    score,
    total,
    difficulty = 'Intermediate',
    streak = 1,
    level = 1,
    speedBonusXp = 0,
    maxCombo = 0,
  } = params;

  const accuracy = total > 0 ? score / total : 0;
  const percent = Math.round(accuracy * 100);
  const passedMasteryThreshold = percent >= 60;
  const summaryTags: string[] = [];

  // Challenging base XP: requires getting answers right; <60% accuracy yields reduced XP
  const perCorrectBase = passedMasteryThreshold ? 14 : 7;
  const baseXp = score * perCorrectBase + Math.min(40, Math.round(speedBonusXp * 0.5));

  // Accuracy Mastery Bonus (80%+ or 100% Flawless)
  let accuracyBonusXp = 0;
  if (percent === 100 && total >= 3) {
    accuracyBonusXp = 55;
    summaryTags.push('🌟 Flawless 100% Mastery (+55 XP)');
  } else if (percent >= 90) {
    accuracyBonusXp = 35;
    summaryTags.push('🎯 90%+ High Precision (+35 XP)');
  } else if (percent >= 80) {
    accuracyBonusXp = 20;
    summaryTags.push('✨ 80%+ Solid Mastery (+20 XP)');
  } else if (!passedMasteryThreshold) {
    summaryTags.push('⚠️ Below 60% Accuracy (Reduced XP — Retry to Master!)');
  }

  // Difficulty Multiplier Bonus
  const diffMult =
    difficulty === 'Master' ? 0.35 : difficulty === 'Intermediate' ? 0.15 : 0;
  const difficultyBonusXp = passedMasteryThreshold
    ? Math.round((baseXp + accuracyBonusXp) * diffMult)
    : 0;
  if (difficultyBonusXp > 0) {
    summaryTags.push(`🔥 ${difficulty} Tier (+${difficultyBonusXp} XP)`);
  }

  // Streak & Rank Retention Multiplier
  const streakBonusPct = Math.min(0.5, Math.max(0, (streak - 1) * 0.05));
  const rankBonusPct = getRankForLevel(level).xpMultiplierBonus;
  const combinedRetentionMult = streakBonusPct + rankBonusPct;
  const streakBonusXp = passedMasteryThreshold
    ? Math.round((baseXp + accuracyBonusXp) * combinedRetentionMult) + Math.min(25, maxCombo * 3)
    : 0;
  if (streakBonusXp > 0) {
    summaryTags.push(`⚡ Streak & Rank Retention Boost (+${streakBonusXp} XP)`);
  }

  // Daily First-Quiz-of-the-Day Bonus (+75 XP if accuracy >= 60%)
  let dailyFirstQuizBonusXp = 0;
  if (typeof window !== 'undefined' && passedMasteryThreshold) {
    const todayKey = new Date().toISOString().slice(0, 10);
    const lastFirstQuizDate = localStorage.getItem('quizme_daily_first_quiz_date_v3');
    if (lastFirstQuizDate !== todayKey) {
      dailyFirstQuizBonusXp = 75;
      localStorage.setItem('quizme_daily_first_quiz_date_v3', todayKey);
      summaryTags.push('☀️ First Mastery Quiz of the Day (+75 XP)');
    }
  }

  const totalXpEarned =
    score <= 0
      ? 0
      : Math.max(
          5,
          baseXp + accuracyBonusXp + difficultyBonusXp + streakBonusXp + dailyFirstQuizBonusXp
        );

  const gemsEarned =
    score <= 0
      ? 0
      : Math.max(
          1,
          score * 2 + (percent === 100 ? 12 : percent >= 80 ? 5 : 0)
        );

  return {
    totalXpEarned,
    baseXp,
    accuracyBonusXp,
    streakBonusXp,
    difficultyBonusXp,
    dailyFirstQuizBonusXp,
    gemsEarned,
    passedMasteryThreshold,
    summaryTags,
  };
}

export interface DailyRetentionCheckInState {
  dayIndex: number; // 1 to 7
  claimedToday: boolean;
  lastClaimDate: string | null;
  totalCheckIns: number;
}

export const DAILY_CHECKIN_REWARDS = [
  { day: 1, xp: 40, gems: 10, coins: 1, label: 'Day 1 Spark', icon: '⚡' },
  { day: 2, xp: 60, gems: 15, coins: 2, label: 'Day 2 Momentum', icon: '🔥' },
  { day: 3, xp: 85, gems: 25, coins: 3, label: 'Day 3 Scholar', icon: '🎯' },
  { day: 4, xp: 110, gems: 35, coins: 4, label: 'Day 4 Focus', icon: '💎' },
  { day: 5, xp: 140, gems: 50, coins: 6, label: 'Day 5 Star', icon: '🌟' },
  { day: 6, xp: 180, gems: 70, coins: 8, label: 'Day 6 Surge', icon: '🚀' },
  { day: 7, xp: 300, gems: 120, coins: 15, label: 'Day 7 Grand Chest', icon: '👑' },
];

export function getDailyRetentionCheckIn(): DailyRetentionCheckInState {
  if (typeof window === 'undefined') {
    return { dayIndex: 1, claimedToday: false, lastClaimDate: null, totalCheckIns: 0 };
  }
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(DAILY_CHECKIN_STORAGE_KEY);
    if (!raw) {
      return { dayIndex: 1, claimedToday: false, lastClaimDate: null, totalCheckIns: 0 };
    }
    const parsed = JSON.parse(raw);
    const claimedToday = parsed.lastClaimDate === today;

    // Check if yesterday was claimed to advance cycle, or wrap around 1..7
    let nextDayIndex = parsed.dayIndex || 1;
    if (!claimedToday && parsed.lastClaimDate) {
      const lastDate = new Date(parsed.lastClaimDate + 'T00:00:00');
      const currDate = new Date(today + 'T00:00:00');
      const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        nextDayIndex = (nextDayIndex % 7) + 1;
      } else if (diffDays > 1) {
        nextDayIndex = 1; // Streak broken — resets 7-day check-in ladder for high retention!
      }
    }

    return {
      dayIndex: nextDayIndex,
      claimedToday,
      lastClaimDate: parsed.lastClaimDate || null,
      totalCheckIns: parsed.totalCheckIns || 0,
    };
  } catch {
    return { dayIndex: 1, claimedToday: false, lastClaimDate: null, totalCheckIns: 0 };
  }
}

export function claimDailyRetentionCheckIn(): {
  reward: (typeof DAILY_CHECKIN_REWARDS)[0];
  newState: DailyRetentionCheckInState;
} | null {
  const current = getDailyRetentionCheckIn();
  if (current.claimedToday) return null;

  const today = new Date().toISOString().slice(0, 10);
  const reward =
    DAILY_CHECKIN_REWARDS.find((r) => r.day === current.dayIndex) || DAILY_CHECKIN_REWARDS[0];

  const newState: DailyRetentionCheckInState = {
    dayIndex: current.dayIndex,
    claimedToday: true,
    lastClaimDate: today,
    totalCheckIns: current.totalCheckIns + 1,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(DAILY_CHECKIN_STORAGE_KEY, JSON.stringify(newState));
  }

  return { reward, newState };
}

export function getClaimedLevelMilestones(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CLAIMED_LEVEL_MILESTONES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markLevelMilestoneClaimed(level: number): number[] {
  const current = getClaimedLevelMilestones();
  if (current.includes(level)) return current;
  const updated = [...current, level];
  if (typeof window !== 'undefined') {
    localStorage.setItem(CLAIMED_LEVEL_MILESTONES_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function createFreshResetStats(existing?: Partial<UserStats>): UserStats {
  return {
    streak: 1,
    hearts: 5,
    maxHearts: 5,
    xp: 0,
    gems: existing?.gems ?? 25,
    coins: existing?.coins ?? 0,
    unlockedMascots: existing?.unlockedMascots ?? ['quizzie', 'foxy', 'boba', 'astro', 'sparky'],
    unlockedAccessories: existing?.unlockedAccessories ?? ['none'],
    equippedAccessory: existing?.equippedAccessory ?? 'none',
    level: 1,
    quizzesCompleted: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    badges: [],
  };
}
