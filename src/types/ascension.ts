/**
 * QUIZ-ME! — PROJECT ASCENSION
 * Domain Types for RPG-Inspired Learning, Ranks, Skill Trees, Quests & Titles.
 */

export type AcademicRankId =
  | 'initiate'
  | 'apprentice'
  | 'scholar'
  | 'specialist'
  | 'expert'
  | 'master'
  | 'grandmaster'
  | 'luminary'
  | 'ascendant';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type AchievementCategory =
  | 'learning'
  | 'mastery'
  | 'examination'
  | 'consistency'
  | 'improvement'
  | 'exploration'
  | 'special'
  | 'milestones';

export type MasteryTier =
  | 'unexplored'   // Tier 0: No attempts
  | 'introduced'   // Tier 1: 1 attempt, basic familiarity
  | 'developing'   // Tier 2: 2-3 attempts, 50-74% accuracy
  | 'proficient'   // Tier 3: 3+ attempts, 75-84% accuracy
  | 'advanced'     // Tier 4: 4+ attempts, 85-94% accuracy with varied formats
  | 'mastered';    // Tier 5: 5+ attempts, 95%+ accuracy, zero active misconceptions

export interface AcademicRank {
  id: AcademicRankId;
  order: number;
  title: string;
  subtitle: string;
  emblem: string; // Emoji / Icon identifier
  tierName: 'Novice' | 'Bronze' | 'Silver' | 'Gold' | 'Master' | 'Grandmaster' | 'Mythic' | 'Celestial';
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glowColor: string;
  description: string;
  perks: string[];
  requirements: {
    minLevel: number;
    minCumulativeXp: number;
    minMasteredTopics: number;
    minExamsCompleted: number;
    minOverallAccuracy: number; // percentage (0-100)
    minStudyConsistencyStreak: number;
  };
}

export interface AscensionTitle {
  id: string;
  title: string;
  description: string;
  rarity: AchievementRarity;
  category: 'academic' | 'prestige' | 'specialist' | 'endurance' | 'curiosity';
  unlockCondition: string;
  unlockedAt?: string; // ISO date string
  isEquipped?: boolean;
}

export interface TopicMasteryDetail {
  subject: string;
  topic: string;
  tier: MasteryTier;
  tierLevel: number; // 0 to 5
  accuracy: number; // percentage (0-100)
  totalAttempts: number;
  totalCorrect: number;
  lastPracticedIso: string;
  retentionDecayFactor: number; // 0.0 - 1.0 (spaced retention)
  activeMisconceptionsCount: number;
  unlockedAtIso?: string;
}

export interface SubjectSpecialisation {
  id: string;
  subject: string;
  specialistTitle: string;
  description: string;
  icon: string;
  totalTopicsCount: number;
  masteredTopicsCount: number;
  proficiencyPercent: number;
  isUnlocked: boolean;
}

export type SkillNodeStatus = 'unexplored' | 'available' | 'studying' | 'proficient' | 'mastered';

export interface SkillTreeNode {
  id: string;
  subject: string;
  domain: string;
  title: string;
  description: string;
  tier: number; // 1 to 5 depth in tree
  prerequisiteNodeIds: string[];
  status: SkillNodeStatus;
  masteryPercent: number;
  practiceQuizzesCount: number;
  keyConcepts: string[];
}

export type QuestCategory = 'daily' | 'weekly' | 'epic';

export interface AscensionQuest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  objectiveType:
    | 'quiz_complete'
    | 'perfect_score'
    | 'topic_mastery'
    | 'exam_complete'
    | 'mistakes_review'
    | 'flashcard_master'
    | 'notes_study'
    | 'subject_specialisation';
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  rewardGems: number;
  rewardTitleId?: string;
  status: 'active' | 'completed' | 'claimed';
  expiresAtIso: string;
  subjectFilter?: string;
}

export interface AscensionAchievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  gemsReward: number;
  titleRewardId?: string;
  iconName: string;
  target: number;
  current: number;
  isUnlocked: boolean;
  unlockedAtIso?: string;
  isClaimed: boolean;
}

export interface XPTransaction {
  id: string;
  timestampIso: string;
  eventType:
    | 'quiz_completed'
    | 'exam_completed'
    | 'mistake_reviewed'
    | 'flashcard_mastered'
    | 'quest_claimed'
    | 'achievement_unlocked'
    | 'study_consistency_bonus'
    | 'topic_mastered';
  xpAwarded: number;
  gemsAwarded: number;
  summary: string;
  verifiedEffort: boolean;
  hash: string;
}

export interface ConsistencyHabitProfile {
  streakDays: number;
  personalBestStreak: number;
  weeklyTargetDays: number; // default 5 days
  studyDaysThisWeek: number; // 0 to 7
  activeWeekDays: number[]; // e.g. [1, 2, 4] (Monday=1, Sunday=7)
  streakShields: number; // shields that protect streak if a day is missed
  maxStreakShields: number;
  restDayActive: boolean;
  lastStudyDateIso: string;
}

export interface AscensionProfile {
  level: number;
  cumulativeXp: number;
  currentLevelXp: number;
  xpRequiredForNextLevel: number;
  rankId: AcademicRankId;
  equippedTitleId: string;
  equippedEmblemId: string;
  equippedFrameId: string;
  gems: number;
  consistency: ConsistencyHabitProfile;
  masteryRecords: Record<string, TopicMasteryDetail>; // key: `${subject}:${topic}`
  activeQuests: AscensionQuest[];
  achievements: Record<string, AscensionAchievement>;
  unlockedTitleIds: string[];
  unlockedCosmetics: {
    emblems: string[];
    frames: string[];
  };
  transactions: XPTransaction[];
  specialisations: SubjectSpecialisation[];
  lastUpdatedIso: string;
}

export type ProgressionEvent =
  | {
      type: 'quiz_completed';
      quizTitle: string;
      subject: string;
      topic: string;
      score: number;
      total: number;
      accuracy: number;
      timeSpentSeconds: number;
      difficulty: string;
      answeredCount: number;
    }
  | {
      type: 'exam_completed';
      examFormat: string;
      title: string;
      score: number;
      total: number;
      accuracy: number;
      timeSpentSeconds: number;
    }
  | {
      type: 'mistake_reviewed';
      subject: string;
      topic: string;
      questionId: number | string;
    }
  | {
      type: 'flashcard_mastered';
      subject: string;
      topic: string;
      count: number;
    }
  | {
      type: 'notes_studied';
      subject: string;
      topic: string;
    }
  | {
      type: 'quest_claimed';
      questId: string;
    }
  | {
      type: 'achievement_claimed';
      achievementId: string;
    };
