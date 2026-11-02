// ============================================================================
// QUIZ-ME! — UNIFIED LEARNING ENGINE SERVICE
// Central intelligence orchestrator combining assessment data, mistake notebook,
// syllabus progress, oral viva scores, and prerequisite dependencies.
// ============================================================================

import { DomainAssessmentAttempt, DomainMasterySignal } from '../domain/entities';
import { calculateDomainMastery, calculateNextRevisionIntervalDays } from '../domain/masteryRules';
import { loadSavedMistakes } from '../components/MistakeNotebookView';

export interface ComprehensiveLearningDiagnostic {
  overallMasteryPercentage: number;
  totalStudyMinutes: number;
  totalQuestionsAnswered: number;
  totalMistakesResolved: number;
  activeMistakesCount: number;
  topicMasterySignals: DomainMasterySignal[];
  priorityGaps: Array<{
    subject: string;
    topic: string;
    urgency: 'critical' | 'moderate' | 'maintenance';
    reason: string;
    recommendedAction: 'targeted_quiz' | 'read_notes' | 'viva_defense' | 'stem_lab';
  }>;
  spacedRevisionQueue: Array<{
    id: string;
    subject: string;
    topic: string;
    dueDateDays: number;
    recommendedMinutes: number;
  }>;
}

export function generateUnifiedLearningDiagnostic(attempts: DomainAssessmentAttempt[]): ComprehensiveLearningDiagnostic {
  const mistakes = loadSavedMistakes();
  const activeMistakes = mistakes.filter((m) => m.status !== 'mastered');
  const resolvedMistakes = mistakes.filter((m) => m.status === 'mastered');

  // Subjects covered
  const subjectTopicsMap = new Map<string, Set<string>>();

  attempts.forEach((a) => {
    if (!subjectTopicsMap.has(a.subject)) {
      subjectTopicsMap.set(a.subject, new Set());
    }
    subjectTopicsMap.get(a.subject)!.add(a.topic);
  });

  // Calculate mastery signal for each subject and topic
  const signals: DomainMasterySignal[] = [];

  subjectTopicsMap.forEach((topics, subject) => {
    topics.forEach((topic) => {
      const topicMistakesCount = activeMistakes.filter(
        (m) => m.subject.toLowerCase() === subject.toLowerCase() && m.topic.toLowerCase().includes(topic.toLowerCase())
      ).length;

      const signal = calculateDomainMastery({
        attempts,
        subject,
        topic,
        activeMistakesCount: topicMistakesCount,
      });

      signals.push(signal);
    });
  });

  // Aggregate overall metrics
  const totalQuestions = attempts.reduce((acc, curr) => acc + (curr.maxScore || 1), 0);
  const totalSeconds = attempts.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 60), 0);
  const averageMastery =
    signals.length > 0
      ? Math.round(signals.reduce((acc, curr) => acc + curr.estimatedMastery, 0) / signals.length)
      : 75;

  // Identify priority gaps
  const priorityGaps: ComprehensiveLearningDiagnostic['priorityGaps'] = [];

  signals.forEach((s) => {
    if (s.isPrerequisiteWeak || s.estimatedMastery < 55) {
      priorityGaps.push({
        subject: s.subject,
        topic: s.topic,
        urgency: s.estimatedMastery < 40 ? 'critical' : 'moderate',
        reason: `Assessed mastery is ${s.estimatedMastery}%. Needs review to maintain prerequisite foundation.`,
        recommendedAction: s.estimatedMastery < 40 ? 'read_notes' : 'targeted_quiz',
      });
    }
  });

  // If no gaps, add a constructive maintenance recommendation
  if (priorityGaps.length === 0 && signals.length > 0) {
    const lowest = [...signals].sort((a, b) => a.estimatedMastery - b.estimatedMastery)[0];
    if (lowest) {
      priorityGaps.push({
        subject: lowest.subject,
        topic: lowest.topic,
        urgency: 'maintenance',
        reason: `Solid overall progress. Refresh ${lowest.topic} to maintain retrieval speed.`,
        recommendedAction: 'targeted_quiz',
      });
    }
  }

  // Construct spaced revision queue
  const spacedRevisionQueue: ComprehensiveLearningDiagnostic['spacedRevisionQueue'] = signals.slice(0, 5).map((s, idx) => {
    const intervalDays = calculateNextRevisionIntervalDays(Math.max(1, s.totalAttempts), s.averageAccuracy);
    return {
      id: `rev_${s.subject}_${idx}`,
      subject: s.subject,
      topic: s.topic,
      dueDateDays: intervalDays,
      recommendedMinutes: s.estimatedMastery < 60 ? 25 : 15,
    };
  });

  return {
    overallMasteryPercentage: averageMastery,
    totalStudyMinutes: Math.round(totalSeconds / 60),
    totalQuestionsAnswered: totalQuestions,
    totalMistakesResolved: resolvedMistakes.length,
    activeMistakesCount: activeMistakes.length,
    topicMasterySignals: signals,
    priorityGaps,
    spacedRevisionQueue,
  };
}
