export type AudienceTier = 'all_ages' | 'junior' | 'middle' | 'high_school' | 'college_adult';

export interface AudienceTierConfig {
  id: AudienceTier;
  label: string;
  shortLabel: string;
  ageRange: string;
  emoji: string;
  tag: string;
  description: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const AUDIENCE_TIER_CONFIG: Record<AudienceTier, AudienceTierConfig> = {
  all_ages: {
    id: 'all_ages',
    label: 'All Ages & Family Fun',
    shortLabel: 'All Ages',
    ageRange: 'Everyone',
    emoji: '🌟',
    tag: '#AllAges',
    description: 'Entertaining, accessible trivia & curiosity puzzles for kids, teens, parents, and grandparents!',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeBorder: 'border-amber-300 dark:border-amber-700',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  junior: {
    id: 'junior',
    label: 'Junior Explorers (Ages 6-10)',
    shortLabel: 'Junior (6-10)',
    ageRange: 'Ages 6–10',
    emoji: '🧒',
    tag: '#JuniorExplorers',
    description: 'Vibrant, friendly, confidence-building questions with supportive hints and exciting real-world analogies.',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeBorder: 'border-emerald-300 dark:border-emerald-700',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
  middle: {
    id: 'middle',
    label: 'Middle School (Ages 11-14)',
    shortLabel: 'Middle (11-14)',
    ageRange: 'Ages 11–14',
    emoji: '🎒',
    tag: '#MiddleSchool',
    description: 'Engaging real-world connections, intriguing phenomenon drills, and gamified active recall.',
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    badgeBorder: 'border-sky-300 dark:border-sky-700',
    badgeText: 'text-sky-700 dark:text-sky-300',
  },
  high_school: {
    id: 'high_school',
    label: 'High School & Prep (Ages 14-18)',
    shortLabel: 'High School',
    ageRange: 'Ages 14–18',
    emoji: '🎓',
    tag: '#HighSchool',
    description: 'Core curriculum standards, AP/Honors prep, multi-step problem solving, and analytical reasoning.',
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    badgeBorder: 'border-indigo-300 dark:border-indigo-700',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
  },
  college_adult: {
    id: 'college_adult',
    label: 'College & Lifelong Learners',
    shortLabel: 'College / Adult',
    ageRange: 'Higher Ed & Adult',
    emoji: '🏛️',
    tag: '#CollegeLevel',
    description: 'Intellectual depth, nuanced theoretical proofs, clinical case studies, and advanced academic rigor.',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeBorder: 'border-purple-300 dark:border-purple-700',
    badgeText: 'text-purple-700 dark:text-purple-300',
  },
};

export const AUDIENCE_FILTER_OPTIONS: Array<{
  id: string;
  label: string;
  emoji: string;
  tier?: AudienceTier;
}> = [
  { id: 'all', label: 'All Age Audiences', emoji: '✨' },
  { id: 'all_ages', label: 'All Ages / Family Fun', emoji: '🌟', tier: 'all_ages' },
  { id: 'junior', label: 'Junior Explorers (6-10)', emoji: '🧒', tier: 'junior' },
  { id: 'middle', label: 'Middle School (11-14)', emoji: '🎒', tier: 'middle' },
  { id: 'high_school', label: 'High School (14-18)', emoji: '🎓', tier: 'high_school' },
  { id: 'college_adult', label: 'College & Adults', emoji: '🏛️', tier: 'college_adult' },
];

/**
 * Robustly classifies a quiz into an audience tier based on its metadata.
 */
export function classifyAudience(quiz: {
  targetAudience?: string;
  target_audience?: string;
  tags?: string[];
  difficulty?: string;
  summary?: string;
  quiz_title?: string;
}): AudienceTier {
  const explicit = (quiz.targetAudience || quiz.target_audience || '').toLowerCase();
  const tagsStr = (quiz.tags || []).join(' ').toLowerCase();
  const textCorpus = `${quiz.quiz_title || ''} ${quiz.summary || ''} ${tagsStr} ${explicit}`.toLowerCase();

  // Explicit or strong hints
  if (
    explicit.includes('junior') ||
    explicit.includes('6-10') ||
    explicit.includes('elementary') ||
    tagsStr.includes('#juniorexplorers') ||
    tagsStr.includes('#elementary') ||
    textCorpus.includes('kids') ||
    textCorpus.includes('children') ||
    textCorpus.includes('junior explorer')
  ) {
    return 'junior';
  }

  if (
    explicit.includes('middle') ||
    explicit.includes('11-14') ||
    tagsStr.includes('#middleschool') ||
    textCorpus.includes('middle school')
  ) {
    return 'middle';
  }

  if (
    explicit.includes('family') ||
    explicit.includes('all ages') ||
    tagsStr.includes('#allages') ||
    tagsStr.includes('#familyfun') ||
    textCorpus.includes('family trivia') ||
    textCorpus.includes('all ages')
  ) {
    return 'all_ages';
  }

  if (
    explicit.includes('high school') ||
    explicit.includes('14-18') ||
    explicit.includes('ap &') ||
    tagsStr.includes('#highschool') ||
    tagsStr.includes('#ap') ||
    textCorpus.includes('high school') ||
    textCorpus.includes('ap exam')
  ) {
    return 'high_school';
  }

  if (
    explicit.includes('college') ||
    explicit.includes('graduate') ||
    explicit.includes('practitioner') ||
    explicit.includes('adult') ||
    tagsStr.includes('#collegelevel') ||
    tagsStr.includes('#premed') ||
    tagsStr.includes('#graduateschool') ||
    quiz.difficulty === 'Master'
  ) {
    return 'college_adult';
  }

  // Default fallback based on difficulty
  if (quiz.difficulty === 'Beginner') {
    return 'all_ages';
  }

  return 'high_school';
}
