/**
 * QUIZ-ME! — PROJECT ASCENSION
 * Authoritative Central Progression Engine
 * Manages XP transactions, Level curves, Academic Ranks, Topic Mastery, Quests & Habits.
 */

import {
  AcademicRankId,
  AscensionProfile,
  AscensionQuest,
  MasteryTier,
  ProgressionEvent,
  TopicMasteryDetail,
  XPTransaction,
} from '../types/ascension';
import { UserStats } from '../types/quiz';
import { ACADEMIC_RANKS, RANK_ORDER_LIST, ASCENSION_TITLES } from '../data/ascensionRanksAndTitles';
import {
  INITIAL_DAILY_QUESTS,
  INITIAL_WEEKLY_QUESTS,
  INITIAL_EPIC_QUESTS,
  ASCENSION_ACHIEVEMENTS_CATALOG,
  SUBJECT_SPECIALISATIONS,
} from '../data/ascensionQuestsAndAchievements';
import { calculateLevelFromXp, getCumulativeXpForLevel, getXpRequiredForLevelStep } from '../utils/levelingSystem';
import { syncUserProgression } from './supabaseService';

const ASCENSION_STORAGE_KEY = 'quizme_ascension_profile_v1';

// In-memory active listeners for real-time UI updates
type ProgressionListener = (profile: AscensionProfile, notification?: { type: string; title: string; subtitle: string; icon: string }) => void;
const listeners: Set<ProgressionListener> = new Set();

export function subscribeAscension(listener: ProgressionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(profile: AscensionProfile, notification?: { type: string; title: string; subtitle: string; icon: string }) {
  listeners.forEach((fn) => {
    try {
      fn(profile, notification);
    } catch (e) {
      console.warn('Error in Ascension listener:', e);
    }
  });
}

/**
 * Creates default initial Ascension Profile
 */
export function createDefaultAscensionProfile(legacyStats?: Partial<UserStats>): AscensionProfile {
  const xp = legacyStats?.xp || 0;
  const level = calculateLevelFromXp(xp);
  const startXp = getCumulativeXpForLevel(level);
  const stepXp = getXpRequiredForLevelStep(level);
  const currentLevelXp = Math.max(0, xp - startXp);

  return {
    level,
    cumulativeXp: xp,
    currentLevelXp,
    xpRequiredForNextLevel: stepXp,
    rankId: 'initiate',
    equippedTitleId: 'novice_inquirer',
    equippedEmblemId: '🌱',
    equippedFrameId: 'bronze_simple',
    gems: legacyStats?.gems || 50,
    consistency: {
      streakDays: legacyStats?.streak || 1,
      personalBestStreak: Math.max(1, legacyStats?.streak || 1),
      weeklyTargetDays: 5,
      studyDaysThisWeek: 1,
      activeWeekDays: [new Date().getDay() || 7],
      streakShields: 2,
      maxStreakShields: 3,
      restDayActive: false,
      lastStudyDateIso: new Date().toISOString(),
    },
    masteryRecords: {},
    activeQuests: [...INITIAL_DAILY_QUESTS, ...INITIAL_WEEKLY_QUESTS, ...INITIAL_EPIC_QUESTS],
    achievements: { ...ASCENSION_ACHIEVEMENTS_CATALOG },
    unlockedTitleIds: ['novice_inquirer'],
    unlockedCosmetics: {
      emblems: ['🌱', '⚡'],
      frames: ['bronze_simple'],
    },
    transactions: [],
    specialisations: [...SUBJECT_SPECIALISATIONS],
    lastUpdatedIso: new Date().toISOString(),
  };
}

/**
 * Loads the Ascension profile from storage, gracefully initializing if absent
 */
export function getAscensionProfile(legacyStats?: UserStats): AscensionProfile {
  if (typeof window === 'undefined') {
    return createDefaultAscensionProfile(legacyStats);
  }

  try {
    const raw = localStorage.getItem(ASCENSION_STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultAscensionProfile(legacyStats);
      saveAscensionProfile(initial);
      return initial;
    }

    const parsed: AscensionProfile = JSON.parse(raw);

    // Sync legacy XP if legacy stats are higher (e.g. from prior runs)
    if (legacyStats && legacyStats.xp > parsed.cumulativeXp) {
      parsed.cumulativeXp = legacyStats.xp;
      parsed.level = calculateLevelFromXp(parsed.cumulativeXp);
      const startXp = getCumulativeXpForLevel(parsed.level);
      parsed.currentLevelXp = Math.max(0, parsed.cumulativeXp - startXp);
      parsed.xpRequiredForNextLevel = getXpRequiredForLevelStep(parsed.level);
    }

    return parsed;
  } catch (err) {
    console.warn('Notice parsing ascension profile, falling back to default:', err);
    return createDefaultAscensionProfile(legacyStats);
  }
}

/**
 * Persists Ascension profile to local storage and alerts listeners
 */
export function saveAscensionProfile(profile: AscensionProfile, notification?: { type: string; title: string; subtitle: string; icon: string }) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ASCENSION_STORAGE_KEY, JSON.stringify(profile));
      const activeUid = localStorage.getItem('quizme_active_uid') || 'anonymous_scholar';
      syncUserProgression(activeUid, profile).catch(() => {});
    } catch (e) {
      console.warn('Notice writing to localStorage for ascension profile:', e);
    }
  }
  notifyListeners(profile, notification);
}

/**
 * Determines Topic Mastery Tier (0 to 5) based on evidence
 */
export function calculateMasteryTier(attempts: number, accuracy: number, activeMisconceptions = 0): { tier: MasteryTier; tierLevel: number } {
  if (attempts <= 0) return { tier: 'unexplored', tierLevel: 0 };
  if (attempts === 1) return { tier: 'introduced', tierLevel: 1 };
  if (attempts <= 3 && accuracy < 75) return { tier: 'developing', tierLevel: 2 };
  if (attempts >= 3 && accuracy >= 75 && accuracy < 85) return { tier: 'proficient', tierLevel: 3 };
  if (attempts >= 4 && accuracy >= 85 && accuracy < 95) return { tier: 'advanced', tierLevel: 4 };
  if (attempts >= 5 && accuracy >= 95 && activeMisconceptions === 0) return { tier: 'mastered', tierLevel: 5 };
  return { tier: 'advanced', tierLevel: 4 };
}

/**
 * Evaluates whether user qualifies for rank advancement
 */
export function evaluateRankAdvancement(profile: AscensionProfile, totalExamsCompleted = 0, overallAccuracy = 80): AcademicRankId {
  const currentRank = ACADEMIC_RANKS[profile.rankId] || ACADEMIC_RANKS.initiate;
  const currentIndex = RANK_ORDER_LIST.indexOf(currentRank.id);

  // Count total mastered topics (Tier 5)
  const masteredCount = Object.values(profile.masteryRecords).filter((r) => r.tier === 'mastered').length;

  let highestEligibleRank = currentRank.id;

  for (let i = currentIndex + 1; i < RANK_ORDER_LIST.length; i++) {
    const candidateId = RANK_ORDER_LIST[i];
    const candidateRank = ACADEMIC_RANKS[candidateId];
    const req = candidateRank.requirements;

    const meetsLevel = profile.level >= req.minLevel;
    const meetsXp = profile.cumulativeXp >= req.minCumulativeXp;
    const meetsMastery = masteredCount >= req.minMasteredTopics;
    const meetsExams = totalExamsCompleted >= req.minExamsCompleted;
    const meetsAccuracy = overallAccuracy >= req.minOverallAccuracy;
    const meetsStreak = profile.consistency.streakDays >= req.minStudyConsistencyStreak;

    if (meetsLevel && meetsXp && meetsMastery && meetsExams && meetsAccuracy && meetsStreak) {
      highestEligibleRank = candidateId;
    } else {
      break; // Sequential rank advancement
    }
  }

  return highestEligibleRank;
}

/**
 * Generates auditable SHA-like hash for verified XP transactions
 */
function createTransactionHash(id: string, amount: number, timestamp: string): string {
  let hash = 0;
  const str = `${id}:${amount}:${timestamp}:verified_ascension`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Central event processor: Authoritatively processes all educational actions
 */
export function recordProgressionEvent(
  event: ProgressionEvent,
  currentProfile?: AscensionProfile
): { updatedProfile: AscensionProfile; notifications: Array<{ type: string; title: string; subtitle: string; icon: string }> } {
  const profile = currentProfile ? { ...currentProfile } : getAscensionProfile();
  const notifications: Array<{ type: string; title: string; subtitle: string; icon: string }> = [];

  const nowIso = new Date().toISOString();
  let xpToAdd = 0;
  let gemsToAdd = 0;
  let transactionSummary = '';
  let verifiedEffort = true;

  // 1. Process Event Types
  switch (event.type) {
    case 'quiz_completed': {
      const { score, total, accuracy, timeSpentSeconds, difficulty, answeredCount } = event;
      // Anti-abuse check: must answer questions and spend realistic time (minimum 2 seconds per question)
      if (answeredCount <= 0 || timeSpentSeconds < Math.min(10, total * 2)) {
        verifiedEffort = false;
        xpToAdd = 10; // Nominal participation
      } else {
        const baseXP = score * 20;
        const diffMultiplier = difficulty === 'Master' ? 1.5 : difficulty === 'Intermediate' ? 1.25 : 1.0;
        const accuracyBonus = accuracy >= 90 ? 50 : accuracy >= 80 ? 25 : 0;
        const streakBonus = Math.min(50, profile.consistency.streakDays * 5);

        xpToAdd = Math.round(baseXP * diffMultiplier + accuracyBonus + streakBonus);
        gemsToAdd = accuracy >= 80 ? Math.max(5, Math.round(score * 2)) : 2;
      }

      transactionSummary = `Completed quiz "${event.quizTitle}": ${score}/${total} (${accuracy}%)`;

      // Update Topic Mastery
      if (event.subject && event.topic) {
        const key = `${event.subject}:${event.topic}`;
        const existing = profile.masteryRecords[key] || {
          subject: event.subject,
          topic: event.topic,
          tier: 'unexplored',
          tierLevel: 0,
          accuracy: 0,
          totalAttempts: 0,
          totalCorrect: 0,
          lastPracticedIso: nowIso,
          retentionDecayFactor: 1.0,
          activeMisconceptionsCount: 0,
        };

        const newAttempts = existing.totalAttempts + 1;
        const newCorrect = existing.totalCorrect + score;
        const newAcc = Math.round((newCorrect / (existing.totalAttempts * total + total)) * 100);
        const { tier, tierLevel } = calculateMasteryTier(newAttempts, newAcc, existing.activeMisconceptionsCount);

        profile.masteryRecords[key] = {
          ...existing,
          totalAttempts: newAttempts,
          totalCorrect: newCorrect,
          accuracy: newAcc,
          tier,
          tierLevel,
          lastPracticedIso: nowIso,
        };

        // Notify if newly mastered
        if (existing.tier !== 'mastered' && tier === 'mastered') {
          notifications.push({
            type: 'mastery',
            title: 'Topic Mastered!',
            subtitle: `Attained Tier 5 Mastered status in ${event.topic}`,
            icon: '🎯',
          });
        }
      }

      // Update Quests for Quizzes
      profile.activeQuests = profile.activeQuests.map((q) => {
        if (q.status !== 'active') return q;
        if (q.objectiveType === 'quiz_complete') {
          const next = q.currentCount + 1;
          return { ...q, currentCount: next, status: next >= q.targetCount ? 'completed' : 'active' };
        }
        if (q.objectiveType === 'perfect_score' && accuracy >= 85) {
          const next = q.currentCount + 1;
          return { ...q, currentCount: next, status: next >= q.targetCount ? 'completed' : 'active' };
        }
        return q;
      });

      // Update Achievements for first step / accuracy
      if (profile.achievements.first_step && !profile.achievements.first_step.isUnlocked) {
        profile.achievements.first_step.isUnlocked = true;
        profile.achievements.first_step.unlockedAtIso = nowIso;
        notifications.push({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          subtitle: profile.achievements.first_step.name,
          icon: '✨',
        });
      }

      if (accuracy === 100 && total >= 5 && profile.achievements.accuracy_apprentice && !profile.achievements.accuracy_apprentice.isUnlocked) {
        profile.achievements.accuracy_apprentice.isUnlocked = true;
        profile.achievements.accuracy_apprentice.unlockedAtIso = nowIso;
        notifications.push({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          subtitle: profile.achievements.accuracy_apprentice.name,
          icon: '🎯',
        });
      }

      break;
    }

    case 'exam_completed': {
      xpToAdd = Math.round(event.score * 25 + 150);
      gemsToAdd = 25;
      transactionSummary = `Completed examination "${event.title}" (${event.examFormat}): ${event.accuracy}%`;

      // Update Quests for Exam
      profile.activeQuests = profile.activeQuests.map((q) => {
        if (q.status === 'active' && q.objectiveType === 'exam_complete') {
          const next = q.currentCount + 1;
          return { ...q, currentCount: next, status: next >= q.targetCount ? 'completed' : 'active' };
        }
        return q;
      });

      // Update Exam Veteran Achievement
      if (profile.achievements.exam_veteran && !profile.achievements.exam_veteran.isUnlocked) {
        profile.achievements.exam_veteran.current += 1;
        if (profile.achievements.exam_veteran.current >= profile.achievements.exam_veteran.target) {
          profile.achievements.exam_veteran.isUnlocked = true;
          profile.achievements.exam_veteran.unlockedAtIso = nowIso;
          notifications.push({
            type: 'achievement',
            title: 'Achievement Unlocked!',
            subtitle: profile.achievements.exam_veteran.name,
            icon: '🏆',
          });
        }
      }
      break;
    }

    case 'mistake_reviewed': {
      xpToAdd = 40;
      gemsToAdd = 3;
      transactionSummary = `Reviewed mistake in ${event.subject} — ${event.topic}`;

      // Update Quests
      profile.activeQuests = profile.activeQuests.map((q) => {
        if (q.status === 'active' && q.objectiveType === 'mistakes_review') {
          const next = q.currentCount + 1;
          return { ...q, currentCount: next, status: next >= q.targetCount ? 'completed' : 'active' };
        }
        return q;
      });

      // Update mistake remediator achievement
      if (profile.achievements.mistake_remediator && !profile.achievements.mistake_remediator.isUnlocked) {
        profile.achievements.mistake_remediator.current += 1;
        if (profile.achievements.mistake_remediator.current >= profile.achievements.mistake_remediator.target) {
          profile.achievements.mistake_remediator.isUnlocked = true;
          profile.achievements.mistake_remediator.unlockedAtIso = nowIso;
          if (!profile.unlockedTitleIds.includes('mistake_conqueror')) {
            profile.unlockedTitleIds.push('mistake_conqueror');
          }
          notifications.push({
            type: 'achievement',
            title: 'Achievement Unlocked!',
            subtitle: profile.achievements.mistake_remediator.name,
            icon: '📖',
          });
        }
      }
      break;
    }

    case 'flashcard_mastered': {
      xpToAdd = event.count * 15;
      gemsToAdd = Math.max(1, Math.floor(event.count / 2));
      transactionSummary = `Mastered ${event.count} flashcards in ${event.topic}`;

      // Update Quests
      profile.activeQuests = profile.activeQuests.map((q) => {
        if (q.status === 'active' && q.objectiveType === 'flashcard_master') {
          const next = q.currentCount + event.count;
          return { ...q, currentCount: next, status: next >= q.targetCount ? 'completed' : 'active' };
        }
        return q;
      });
      break;
    }

    case 'notes_studied': {
      xpToAdd = 50;
      gemsToAdd = 5;
      transactionSummary = `Studied comprehensive notes on ${event.topic}`;

      // Update Quests
      profile.activeQuests = profile.activeQuests.map((q) => {
        if (q.status === 'active' && q.objectiveType === 'notes_study') {
          const next = q.currentCount + 1;
          return { ...q, currentCount: next, status: next >= q.targetCount ? 'completed' : 'active' };
        }
        return q;
      });
      break;
    }

    case 'quest_claimed': {
      const q = profile.activeQuests.find((item) => item.id === event.questId);
      if (q && q.status === 'completed') {
        xpToAdd = q.rewardXp;
        gemsToAdd = q.rewardGems;
        q.status = 'claimed';
        transactionSummary = `Claimed quest reward: "${q.title}"`;

        if (q.rewardTitleId && !profile.unlockedTitleIds.includes(q.rewardTitleId)) {
          profile.unlockedTitleIds.push(q.rewardTitleId);
          notifications.push({
            type: 'title',
            title: 'New Title Unlocked!',
            subtitle: ASCENSION_TITLES.find((t) => t.id === q.rewardTitleId)?.title || q.rewardTitleId,
            icon: '👑',
          });
        }
      }
      break;
    }

    case 'achievement_claimed': {
      const a = profile.achievements[event.achievementId];
      if (a && a.isUnlocked && !a.isClaimed) {
        xpToAdd = a.xpReward;
        gemsToAdd = a.gemsReward;
        a.isClaimed = true;
        transactionSummary = `Claimed achievement reward: "${a.name}"`;

        if (a.titleRewardId && !profile.unlockedTitleIds.includes(a.titleRewardId)) {
          profile.unlockedTitleIds.push(a.titleRewardId);
        }
      }
      break;
    }
  }

  // 2. Apply XP, Leveling & Check Level Up
  if (xpToAdd > 0) {
    const priorLevel = profile.level;
    profile.cumulativeXp += xpToAdd;
    profile.gems += gemsToAdd;

    const newLevel = calculateLevelFromXp(profile.cumulativeXp);
    const startXp = getCumulativeXpForLevel(newLevel);
    profile.level = newLevel;
    profile.currentLevelXp = Math.max(0, profile.cumulativeXp - startXp);
    profile.xpRequiredForNextLevel = getXpRequiredForLevelStep(newLevel);

    if (newLevel > priorLevel) {
      notifications.push({
        type: 'level_up',
        title: 'Level Up!',
        subtitle: `Ascended to Scholar Level ${newLevel}`,
        icon: '⚡',
      });
    }

    // Record Transaction
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tx: XPTransaction = {
      id: txId,
      timestampIso: nowIso,
      eventType: event.type as any,
      xpAwarded: xpToAdd,
      gemsAwarded: gemsToAdd,
      summary: transactionSummary,
      verifiedEffort,
      hash: createTransactionHash(txId, xpToAdd, nowIso),
    };
    profile.transactions = [tx, ...profile.transactions.slice(0, 49)]; // keep 50 audit entries
  }

  // 3. Evaluate Consistency Habits & Daily Streak
  const todayDateString = nowIso.split('T')[0];
  const lastStudyDateString = profile.consistency.lastStudyDateIso ? profile.consistency.lastStudyDateIso.split('T')[0] : '';

  if (todayDateString !== lastStudyDateString) {
    const todayDay = new Date().getDay() || 7;
    const daysSinceLast = lastStudyDateString
      ? Math.floor((new Date(todayDateString).getTime() - new Date(lastStudyDateString).getTime()) / 86400000)
      : 1;

    if (daysSinceLast === 1) {
      profile.consistency.streakDays += 1;
      profile.consistency.personalBestStreak = Math.max(
        profile.consistency.personalBestStreak,
        profile.consistency.streakDays
      );
    } else if (daysSinceLast > 1) {
      // Use streak shield if available
      if (profile.consistency.streakShields > 0) {
        profile.consistency.streakShields -= 1;
        notifications.push({
          type: 'shield',
          title: 'Streak Shield Deployed!',
          subtitle: `Preserved your ${profile.consistency.streakDays}-day streak via Consistency Vault`,
          icon: '🛡️',
        });
      } else {
        profile.consistency.streakDays = 1;
      }
    }

    if (!profile.consistency.activeWeekDays.includes(todayDay)) {
      profile.consistency.activeWeekDays.push(todayDay);
      profile.consistency.studyDaysThisWeek = profile.consistency.activeWeekDays.length;
    }
    profile.consistency.lastStudyDateIso = nowIso;
  }

  // 4. Evaluate Academic Rank Advancement
  const newRank = evaluateRankAdvancement(profile);
  if (newRank !== profile.rankId) {
    profile.rankId = newRank;
    const rankData = ACADEMIC_RANKS[newRank];
    notifications.push({
      type: 'rank_advance',
      title: 'Academic Rank Advance!',
      subtitle: `Promoted to ${rankData.title} (${rankData.tierName})`,
      icon: rankData.emblem,
    });
  }

  // 5. Update Specialisation Progress
  profile.specialisations = profile.specialisations.map((spec) => {
    const matchingTopics = Object.values(profile.masteryRecords).filter((r) => r.subject.toLowerCase() === spec.subject.toLowerCase());
    const mastered = matchingTopics.filter((r) => r.tier === 'mastered').length;
    const total = spec.totalTopicsCount;
    const percent = Math.min(100, Math.round((mastered / Math.max(1, total)) * 100));
    const isUnlocked = mastered >= Math.min(3, Math.ceil(total * 0.5));
    return {
      ...spec,
      masteredTopicsCount: mastered,
      proficiencyPercent: percent,
      isUnlocked,
    };
  });

  profile.lastUpdatedIso = nowIso;

  // Persist and notify
  saveAscensionProfile(profile, notifications[0]);

  return { updatedProfile: profile, notifications };
}
