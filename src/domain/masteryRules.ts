// ============================================================================
// QUIZ-ME! — DOMAIN MASTERY ENGINE & CALCULATION RULES
// Multi-signal mathematical estimation of academic comprehension.
// ============================================================================

import { DomainAssessmentAttempt, DomainMasterySignal } from './entities';

export interface MasteryEvaluationInput {
  attempts: DomainAssessmentAttempt[];
  subject: string;
  topic: string;
  activeMistakesCount: number;
}

/**
 * Calculates genuine pedagogical mastery (0 - 100) based on:
 * 1. Historical weighted accuracy (recent attempts carry higher weight).
 * 2. Attempt volume and verification depth (sample size confidence).
 * 3. Penalty for active un-remediated misconceptions in Mistake Notebook.
 * 4. Recency decay (knowledge fades without spaced revision).
 */
export function calculateDomainMastery(input: MasteryEvaluationInput): DomainMasterySignal {
  const { attempts, subject, topic, activeMistakesCount } = input;

  const relevantAttempts = attempts.filter(
    (a) =>
      a.subject.toLowerCase() === subject.toLowerCase() &&
      (topic === 'ALL' || a.topic.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(a.topic.toLowerCase()))
  );

  if (relevantAttempts.length === 0) {
    return {
      subject,
      topic,
      totalAttempts: 0,
      correctAttempts: 0,
      averageAccuracy: 0,
      lastAttemptedAt: new Date().toISOString(),
      estimatedMastery: 0,
      confidenceTier: 'low',
      isPrerequisiteWeak: activeMistakesCount > 0,
    };
  }

  // Sort chronologically ascending
  const sorted = [...relevantAttempts].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  let weightedAccuracySum = 0;
  let weightSum = 0;
  let totalScore = 0;
  let totalMax = 0;

  sorted.forEach((attempt, index) => {
    // Exponential weight favoring recent attempts (index 0 gets 1.0, index N gets up to 2.5)
    const recencyWeight = 1.0 + (index / sorted.length) * 1.5;
    weightedAccuracySum += attempt.accuracyPercentage * recencyWeight;
    weightSum += recencyWeight;

    totalScore += attempt.score;
    totalMax += attempt.maxScore;
  });

  const baseAccuracy = weightSum > 0 ? weightedAccuracySum / weightSum : 0;
  const rawAverage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

  // Confidence factor based on attempt sample size (starts at 0.75 for verified attempts, reaches 1.0 at 5+ attempts)
  const sampleConfidence = 0.75 + Math.min(0.25, (relevantAttempts.length / 5) * 0.25);

  // Active misconception penalty: each unresolved mistake subtracts 5 points from mastery
  const mistakeDeduction = Math.min(30, activeMistakesCount * 5);

  // Time decay: if last attempt was > 14 days ago, slight decay for spaced retrieval requirement
  const lastAttemptDate = new Date(sorted[sorted.length - 1].completedAt);
  const daysSinceLast = Math.max(0, (Date.now() - lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeDecayFactor = daysSinceLast > 14 ? Math.max(0.85, 1.0 - (daysSinceLast - 14) * 0.01) : 1.0;

  // Final estimated mastery score
  let estimated = Math.round((baseAccuracy * sampleConfidence - mistakeDeduction) * timeDecayFactor);
  estimated = Math.max(0, Math.min(100, estimated));

  const confidenceTier: 'low' | 'moderate' | 'high' =
    relevantAttempts.length >= 5 ? 'high' : relevantAttempts.length >= 2 ? 'moderate' : 'low';

  const isPrerequisiteWeak = estimated < 50 || activeMistakesCount >= 2;

  return {
    subject,
    topic,
    totalAttempts: relevantAttempts.length,
    correctAttempts: Math.round((rawAverage / 100) * relevantAttempts.length),
    averageAccuracy: Math.round(rawAverage),
    lastAttemptedAt: sorted[sorted.length - 1].completedAt,
    estimatedMastery: estimated,
    confidenceTier,
    isPrerequisiteWeak,
  };
}

/**
 * Calculates Spaced Repetition interval (in days) using SuperMemo SM-2 adaptation
 */
export function calculateNextRevisionIntervalDays(
  consecutiveSuccessCount: number,
  lastScorePercentage: number
): number {
  if (lastScorePercentage < 60) return 1; // repeat tomorrow
  if (consecutiveSuccessCount === 1) return 2;
  if (consecutiveSuccessCount === 2) return 5;
  return Math.min(60, Math.round(5 * Math.pow(2.2, consecutiveSuccessCount - 2)));
}
