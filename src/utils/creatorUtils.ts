import { SavedQuizDocument } from '../services/firestore';

export interface CreatorStatus {
  isTopCreator: boolean;
  level: number;
  assessmentsCount: number;
  badgeLabel: string;
  tooltipText: string;
  tierLabel: string;
}

export const TOP_CREATOR_MIN_LEVEL = 3;
export const TOP_CREATOR_MIN_ASSESSMENTS = 3;

/**
 * Calculates how many total assessments each author (by ID and name) has in the community.
 */
export function calculateAuthorAssessmentCounts(quizzes: SavedQuizDocument[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of quizzes) {
    if (q.creatorId) {
      counts[q.creatorId] = (counts[q.creatorId] || 0) + 1;
    }
    if (q.creatorName) {
      counts[q.creatorName] = (counts[q.creatorName] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Determines whether a quiz author qualifies for the "Top Creator" badge.
 * A creator qualifies if:
 * - isTopCreator is explicitly true on the quiz document
 * - creatorLevel reaches or exceeds the threshold (level 3+)
 * - creatorAssessmentsCount reaches or exceeds the threshold (3+ assessments)
 * - or the author has created 3+ assessments in the platform
 */
export function evaluateCreatorStatus(
  quiz: Partial<SavedQuizDocument>,
  authorAssessmentCounts?: Record<string, number>
): CreatorStatus {
  const level = typeof quiz.creatorLevel === 'number' && quiz.creatorLevel > 0 ? quiz.creatorLevel : 1;
  const countFromDoc = typeof quiz.creatorAssessmentsCount === 'number' ? quiz.creatorAssessmentsCount : 1;
  const countFromAgg =
    (quiz.creatorId && authorAssessmentCounts?.[quiz.creatorId]) ||
    (quiz.creatorName && authorAssessmentCounts?.[quiz.creatorName]) ||
    0;
  const effectiveCount = Math.max(countFromDoc, countFromAgg);

  const meetsLevel = level >= TOP_CREATOR_MIN_LEVEL;
  const meetsCount = effectiveCount >= TOP_CREATOR_MIN_ASSESSMENTS;
  const isExplicit = quiz.isTopCreator === true;

  const isTop = isExplicit || meetsLevel || meetsCount;

  // Determine a tier badge title
  let tierLabel = 'Top Creator';
  if (level >= 8 || effectiveCount >= 15) {
    tierLabel = 'Master Creator';
  } else if (level >= 5 || effectiveCount >= 8) {
    tierLabel = 'Elite Creator';
  }

  let tooltipText = 'Top Creator in the QuizMe community';
  if (isTop) {
    if (meetsLevel && meetsCount) {
      tooltipText = `Top Creator • Level ${level} • ${effectiveCount} assessments created`;
    } else if (meetsLevel) {
      tooltipText = `Top Creator • Level ${level} Scholar`;
    } else if (meetsCount) {
      tooltipText = `Top Creator • ${effectiveCount} successful assessments`;
    } else {
      tooltipText = `Top Creator • Verified Community Educator`;
    }
  }

  return {
    isTopCreator: isTop,
    level,
    assessmentsCount: effectiveCount,
    badgeLabel: 'Top Creator',
    tooltipText,
    tierLabel,
  };
}
