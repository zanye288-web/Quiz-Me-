import { UserStats } from './quiz';

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Special';
export type BadgeCategory = 'Milestone' | 'Accuracy' | 'Streak' | 'XP' | 'Mastery' | 'Special';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  tier: BadgeTier;
  category: BadgeCategory;
  emoji: string;
  iconName: string;
  xpBonus: number;
  requirementText: string;
  checkUnlocked: (stats: UserStats, historyCount?: number) => boolean;
  getProgress: (stats: UserStats, historyCount?: number) => {
    current: number;
    max: number;
    percent: number;
    label: string;
  };
}

export const BADGE_TIER_CONFIG: Record<
  BadgeTier,
  {
    label: string;
    borderLight: string;
    borderDark: string;
    bgLight: string;
    bgDark: string;
    pillBgLight: string;
    pillBgDark: string;
    textColor: string;
    glowColor: string;
    gradient: string;
  }
> = {
  Bronze: {
    label: 'Bronze',
    borderLight: 'border-amber-600/30',
    borderDark: 'border-amber-500/30',
    bgLight: 'bg-amber-50/50',
    bgDark: 'bg-amber-950/20',
    pillBgLight: 'bg-amber-100 text-amber-800',
    pillBgDark: 'bg-amber-950 text-amber-300',
    textColor: 'text-amber-700 dark:text-amber-400',
    glowColor: 'rgba(217, 119, 6, 0.25)',
    gradient: 'from-amber-600 to-yellow-700',
  },
  Silver: {
    label: 'Silver',
    borderLight: 'border-slate-300',
    borderDark: 'border-slate-700',
    bgLight: 'bg-slate-50',
    bgDark: 'bg-slate-800/40',
    pillBgLight: 'bg-slate-200 text-slate-700',
    pillBgDark: 'bg-slate-800 text-slate-300',
    textColor: 'text-slate-700 dark:text-slate-300',
    glowColor: 'rgba(148, 163, 184, 0.25)',
    gradient: 'from-slate-400 to-slate-600',
  },
  Gold: {
    label: 'Gold',
    borderLight: 'border-yellow-500/40',
    borderDark: 'border-yellow-500/40',
    bgLight: 'bg-yellow-50/50',
    bgDark: 'bg-yellow-950/20',
    pillBgLight: 'bg-yellow-100 text-yellow-800',
    pillBgDark: 'bg-yellow-950 text-yellow-300',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    glowColor: 'rgba(234, 179, 8, 0.35)',
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
  },
  Diamond: {
    label: 'Diamond',
    borderLight: 'border-cyan-500/40',
    borderDark: 'border-cyan-500/40',
    bgLight: 'bg-cyan-50/50',
    bgDark: 'bg-cyan-950/20',
    pillBgLight: 'bg-cyan-100 text-cyan-800',
    pillBgDark: 'bg-cyan-950 text-cyan-300',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
  },
  Special: {
    label: 'Special',
    borderLight: 'border-purple-500/40',
    borderDark: 'border-purple-500/40',
    bgLight: 'bg-purple-50/50',
    bgDark: 'bg-purple-950/20',
    pillBgLight: 'bg-purple-100 text-purple-800',
    pillBgDark: 'bg-purple-950 text-purple-300',
    textColor: 'text-purple-700 dark:text-purple-300',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    gradient: 'from-purple-500 via-pink-500 to-indigo-600',
  },
};

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your very first quiz assessment session.',
    tier: 'Bronze',
    category: 'Milestone',
    emoji: '🎯',
    iconName: 'Target',
    xpBonus: 25,
    requirementText: 'Complete 1 quiz',
    checkUnlocked: (stats) => (stats.quizzesCompleted || 0) >= 1,
    getProgress: (stats) => {
      const current = Math.min(1, stats.quizzesCompleted || 0);
      return {
        current,
        max: 1,
        percent: Math.min(100, (current / 1) * 100),
        label: `${current} / 1 quiz`,
      };
    },
  },
  {
    id: 'quiz_enthusiast',
    title: 'Quiz Enthusiast',
    description: 'Successfully complete 5 different quiz sessions.',
    tier: 'Bronze',
    category: 'Milestone',
    emoji: '📚',
    iconName: 'BookOpen',
    xpBonus: 50,
    requirementText: 'Complete 5 quizzes',
    checkUnlocked: (stats) => (stats.quizzesCompleted || 0) >= 5,
    getProgress: (stats) => {
      const current = Math.min(5, stats.quizzesCompleted || 0);
      return {
        current,
        max: 5,
        percent: Math.min(100, Math.round((current / 5) * 100)),
        label: `${current} / 5 quizzes`,
      };
    },
  },
  {
    id: 'evaluator_pro',
    title: 'Master Evaluator',
    description: 'Take on and finish 12 comprehensive quiz sessions.',
    tier: 'Silver',
    category: 'Milestone',
    emoji: '🏆',
    iconName: 'Trophy',
    xpBonus: 100,
    requirementText: 'Complete 12 quizzes',
    checkUnlocked: (stats) => (stats.quizzesCompleted || 0) >= 12,
    getProgress: (stats) => {
      const current = Math.min(12, stats.quizzesCompleted || 0);
      return {
        current,
        max: 12,
        percent: Math.min(100, Math.round((current / 12) * 100)),
        label: `${current} / 12 quizzes`,
      };
    },
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Answer at least 30 total assessment questions.',
    tier: 'Gold',
    category: 'Milestone',
    emoji: '💯',
    iconName: 'CheckCircle2',
    xpBonus: 120,
    requirementText: 'Answer 30 questions',
    checkUnlocked: (stats) => (stats.totalQuestions || 0) >= 30,
    getProgress: (stats) => {
      const current = Math.min(30, stats.totalQuestions || 0);
      return {
        current,
        max: 30,
        percent: Math.min(100, Math.round((current / 30) * 100)),
        label: `${current} / 30 questions`,
      };
    },
  },
  {
    id: 'sharp_mind',
    title: 'Sharp Mind',
    description: 'Maintain an 80%+ accuracy rating across at least 15 questions.',
    tier: 'Silver',
    category: 'Accuracy',
    emoji: '⚡',
    iconName: 'Zap',
    xpBonus: 75,
    requirementText: '80%+ accuracy with 15+ questions',
    checkUnlocked: (stats) => {
      const total = stats.totalQuestions || 0;
      if (total < 15) return false;
      const acc = Math.round(((stats.totalCorrect || 0) / total) * 100);
      return acc >= 80;
    },
    getProgress: (stats) => {
      const total = stats.totalQuestions || 0;
      const acc = total > 0 ? Math.round(((stats.totalCorrect || 0) / total) * 100) : 0;
      return {
        current: acc,
        max: 80,
        percent: Math.min(100, Math.round((acc / 80) * 100)),
        label: `${acc}% accuracy (${total}/15 Qs)`,
      };
    },
  },
  {
    id: 'precision_genius',
    title: 'Precision Genius',
    description: 'Achieve an elite 90%+ overall accuracy with 25+ questions answered.',
    tier: 'Diamond',
    category: 'Accuracy',
    emoji: '💎',
    iconName: 'Sparkles',
    xpBonus: 200,
    requirementText: '90%+ accuracy with 25+ questions',
    checkUnlocked: (stats) => {
      const total = stats.totalQuestions || 0;
      if (total < 25) return false;
      const acc = Math.round(((stats.totalCorrect || 0) / total) * 100);
      return acc >= 90;
    },
    getProgress: (stats) => {
      const total = stats.totalQuestions || 0;
      const acc = total > 0 ? Math.round(((stats.totalCorrect || 0) / total) * 100) : 0;
      return {
        current: acc,
        max: 90,
        percent: Math.min(100, Math.round((acc / 90) * 100)),
        label: `${acc}% accuracy (${total}/25 Qs)`,
      };
    },
  },
  {
    id: 'daily_spark',
    title: 'Daily Spark',
    description: 'Build a consistent habit with a 3-day active quiz streak.',
    tier: 'Bronze',
    category: 'Streak',
    emoji: '🔥',
    iconName: 'Flame',
    xpBonus: 50,
    requirementText: '3-day streak',
    checkUnlocked: (stats) => (stats.streak || 0) >= 3,
    getProgress: (stats) => {
      const current = Math.min(3, stats.streak || 0);
      return {
        current,
        max: 3,
        percent: Math.min(100, Math.round((current / 3) * 100)),
        label: `${current} / 3 days`,
      };
    },
  },
  {
    id: 'unstoppable_flame',
    title: 'Unstoppable Flame',
    description: 'Master daily discipline by holding a 7-day study streak.',
    tier: 'Gold',
    category: 'Streak',
    emoji: '🌟',
    iconName: 'Flame',
    xpBonus: 150,
    requirementText: '7-day streak',
    checkUnlocked: (stats) => (stats.streak || 0) >= 7,
    getProgress: (stats) => {
      const current = Math.min(7, stats.streak || 0);
      return {
        current,
        max: 7,
        percent: Math.min(100, Math.round((current / 7) * 100)),
        label: `${current} / 7 days`,
      };
    },
  },
  {
    id: 'xp_pioneer',
    title: 'XP Pioneer',
    description: 'Accumulate 300 or more total experience points.',
    tier: 'Bronze',
    category: 'XP',
    emoji: '✨',
    iconName: 'Zap',
    xpBonus: 30,
    requirementText: 'Reach 300 XP',
    checkUnlocked: (stats) => (stats.xp || 0) >= 300,
    getProgress: (stats) => {
      const current = Math.min(300, stats.xp || 0);
      return {
        current,
        max: 300,
        percent: Math.min(100, Math.round((current / 300) * 100)),
        label: `${current} / 300 XP`,
      };
    },
  },
  {
    id: 'grand_scholar',
    title: 'Grand Scholar',
    description: 'Amass 1,000+ XP through diligent learning and testing.',
    tier: 'Gold',
    category: 'XP',
    emoji: '👑',
    iconName: 'Crown',
    xpBonus: 150,
    requirementText: 'Reach 1,000 XP',
    checkUnlocked: (stats) => (stats.xp || 0) >= 1000,
    getProgress: (stats) => {
      const current = Math.min(1000, stats.xp || 0);
      return {
        current,
        max: 1000,
        percent: Math.min(100, Math.round((current / 1000) * 100)),
        label: `${current} / 1,000 XP`,
      };
    },
  },
  {
    id: 'level_vanguard',
    title: 'Tier 5 Vanguard',
    description: 'Climb the knowledge ranks and attain Scholar Level 5.',
    tier: 'Silver',
    category: 'Mastery',
    emoji: '🎖️',
    iconName: 'Award',
    xpBonus: 100,
    requirementText: 'Reach Level 5',
    checkUnlocked: (stats) => (stats.level || 1) >= 5,
    getProgress: (stats) => {
      const current = Math.min(5, stats.level || 1);
      return {
        current,
        max: 5,
        percent: Math.min(100, Math.round((current / 5) * 100)),
        label: `Level ${current} / 5`,
      };
    },
  },
  {
    id: 'grandmaster_ascendant',
    title: 'Grandmaster Ascendant',
    description: 'Reach the pinnacle of academic mastery at Level 10.',
    tier: 'Diamond',
    category: 'Mastery',
    emoji: '🌌',
    iconName: 'Crown',
    xpBonus: 250,
    requirementText: 'Reach Level 10',
    checkUnlocked: (stats) => (stats.level || 1) >= 10,
    getProgress: (stats) => {
      const current = Math.min(10, stats.level || 1);
      return {
        current,
        max: 10,
        percent: Math.min(100, Math.round((current / 10) * 100)),
        label: `Level ${current} / 10`,
      };
    },
  },
  {
    id: 'quiz_architect',
    title: 'Quiz Architect',
    description: 'Design and author your own custom quiz in the studio.',
    tier: 'Special',
    category: 'Special',
    emoji: '🛠️',
    iconName: 'Layers',
    xpBonus: 60,
    requirementText: 'Author a custom quiz',
    checkUnlocked: (stats) => (stats.badges || []).includes('quiz_architect') || (stats.badges || []).includes('Authoring Studio Master'),
    getProgress: (stats) => {
      const isUnlocked = (stats.badges || []).includes('quiz_architect') || (stats.badges || []).includes('Authoring Studio Master');
      return {
        current: isUnlocked ? 1 : 0,
        max: 1,
        percent: isUnlocked ? 100 : 0,
        label: isUnlocked ? 'Completed' : 'Build a custom quiz',
      };
    },
  },
  {
    id: 'distinction_certified',
    title: 'Distinction Certified',
    description: 'Earn a verified Certificate of Completion with distinction.',
    tier: 'Special',
    category: 'Special',
    emoji: '📜',
    iconName: 'GraduationCap',
    xpBonus: 75,
    requirementText: 'Earn an assessment certificate',
    checkUnlocked: (stats) => (stats.badges || []).includes('distinction_certified') || (stats.badges || []).includes('Multimodal Ingest Certified'),
    getProgress: (stats) => {
      const isUnlocked = (stats.badges || []).includes('distinction_certified') || (stats.badges || []).includes('Multimodal Ingest Certified');
      return {
        current: isUnlocked ? 1 : 0,
        max: 1,
        percent: isUnlocked ? 100 : 0,
        label: isUnlocked ? 'Certified' : 'Score high & print certificate',
      };
    },
  },
];
