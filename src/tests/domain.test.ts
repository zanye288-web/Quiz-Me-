// ============================================================================
// QUIZ-ME! — ARCHITECTURE FOUNDATION TEST SUITE
// Automated verification of domain logic, mastery calculations, and validation rules.
// ============================================================================

import { calculateDomainMastery, calculateNextRevisionIntervalDays } from '../domain/masteryRules';
import { validateQuestion, validateAssessmentSubmission } from '../domain/validation';
import { DomainAssessmentAttempt } from '../domain/entities';
import { generateUnifiedLearningDiagnostic } from '../services/learningEngineService';

export function runAllTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${testName}`);
    } else {
      failed++;
      errors.push(testName);
      console.error(`  ✗ ${testName}`);
    }
  }

  console.log('\n--- Running Quiz-Me! Foundation Test Suite ---');

  // Test 1: Question Validation
  console.log('\n1. Domain Question Validation:');
  const validQ = {
    prompt: 'What is the powerhouse of eukaryotic cells?',
    type: 'multiple_choice' as const,
    options: ['Ribosome', 'Mitochondrion', 'Nucleus'],
    correctAnswer: 'Mitochondrion',
    subject: 'Biology',
    topic: 'Cell Biology',
    difficulty: 'Beginner' as const,
  };
  const res1 = validateQuestion(validQ);
  assert(res1.isValid && res1.errors.length === 0, 'Valid question passes validation');

  const invalidQ = {
    prompt: 'Short',
    type: 'multiple_choice' as const,
    options: ['A', 'A'], // duplicate options, missing correct answer
    correctAnswer: 'B',
  };
  const res2 = validateQuestion(invalidQ);
  assert(!res2.isValid && res2.errors.length > 0, 'Invalid question with duplicates is rejected');

  // Test 2: Mastery Calculation Rules
  console.log('\n2. Domain Mastery & SuperMemo Spaced Rules:');
  const sampleAttempts: DomainAssessmentAttempt[] = [
    {
      id: 'a1',
      userId: 'u1',
      assessmentId: 'q1',
      assessmentTitle: 'Cell Biology 1',
      subject: 'Biology',
      topic: 'Cell Biology',
      score: 8,
      maxScore: 10,
      accuracyPercentage: 80,
      timeSpentSeconds: 120,
      xpEarned: 100,
      mistakesCount: 2,
      completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'a2',
      userId: 'u1',
      assessmentId: 'q2',
      assessmentTitle: 'Cell Biology 2',
      subject: 'Biology',
      topic: 'Cell Biology',
      score: 10,
      maxScore: 10,
      accuracyPercentage: 100,
      timeSpentSeconds: 100,
      xpEarned: 150,
      mistakesCount: 0,
      completedAt: new Date().toISOString(),
    },
  ];

  const mastery = calculateDomainMastery({
    attempts: sampleAttempts,
    subject: 'Biology',
    topic: 'Cell Biology',
    activeMistakesCount: 0,
  });

  assert(mastery.estimatedMastery >= 70, 'Accurate recent attempts yield high estimated mastery');
  assert(mastery.totalAttempts === 2, 'Attempt counts are accurately tallied');
  assert(!mastery.isPrerequisiteWeak, 'Strong scores confirm solid prerequisite foundation');

  // Spaced revision intervals
  const interval1 = calculateNextRevisionIntervalDays(1, 80);
  const interval2 = calculateNextRevisionIntervalDays(2, 90);
  assert(interval1 === 2, 'First spaced repetition interval is 2 days');
  assert(interval2 === 5, 'Second consecutive repetition interval is 5 days');

  // Test 3: Assessment Submission Validation
  console.log('\n3. Assessment Submission Validation:');
  const subRes = validateAssessmentSubmission({
    answers: { '1': 'Mitochondrion' },
    totalQuestions: 1,
  });
  assert(subRes.isValid, 'Standard submission passes validation');

  const emptySub = validateAssessmentSubmission({
    answers: {},
    totalQuestions: 0,
  });
  assert(!emptySub.isValid, 'Zero-question submission is rejected');

  // Test 4: Learning Engine Diagnostic Synthesis
  console.log('\n4. Learning Engine Diagnostic Synthesis:');
  const diag = generateUnifiedLearningDiagnostic(sampleAttempts);
  assert(diag.totalQuestionsAnswered === 20, 'Aggregates total questions answered correctly');
  assert(diag.topicMasterySignals.length > 0, 'Emits topic mastery signals');
  assert(Array.isArray(diag.spacedRevisionQueue), 'Constructs prioritized spaced revision queue');

  console.log(`\nTest Results: ${passed} passed, ${failed} failed.\n`);
  return { passed, failed, errors };
}
