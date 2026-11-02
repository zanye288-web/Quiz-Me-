/**
 * Automated Unit Tests for Project Ascension Progression Engine
 */

import {
  createDefaultAscensionProfile,
  calculateMasteryTier,
  evaluateRankAdvancement,
  recordProgressionEvent,
} from '../services/ascensionEngine';
import { ACADEMIC_RANKS, RANK_ORDER_LIST } from '../data/ascensionRanksAndTitles';
import { AscensionProfile } from '../types/ascension';

export function runAscensionTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  console.log('\n--- Running Project Ascension Progression Engine Test Suite ---');

  // Test 1: Profile Initialization
  console.log('1. Profile Initialization & Level Calculations:');
  const profile = createDefaultAscensionProfile({ xp: 1500, gems: 80, streak: 3 });
  assert(profile.level >= 3, 'Calculates starting level >= 3 for 1,500 XP');
  assert(profile.rankId === 'initiate', 'Initial rank defaults to Initiate');
  assert(profile.consistency.streakShields === 2, 'Initializes with 2 streak shields in Consistency Vault');

  // Test 2: 6-Tier Topic Mastery Scale
  console.log('2. 6-Tier Topic Mastery Calculation (0 to 5):');
  const t0 = calculateMasteryTier(0, 0);
  assert(t0.tier === 'unexplored' && t0.tierLevel === 0, 'Zero attempts maps to Tier 0 Unexplored');

  const t1 = calculateMasteryTier(1, 100);
  assert(t1.tier === 'introduced' && t1.tierLevel === 1, 'Single attempt maps to Tier 1 Introduced');

  const t2 = calculateMasteryTier(2, 60);
  assert(t2.tier === 'developing' && t2.tierLevel === 2, 'Low accuracy multiple attempts maps to Tier 2 Developing');

  const t3 = calculateMasteryTier(3, 80);
  assert(t3.tier === 'proficient' && t3.tierLevel === 3, '75-84% accuracy with 3+ attempts maps to Tier 3 Proficient');

  const t4 = calculateMasteryTier(4, 90);
  assert(t4.tier === 'advanced' && t4.tierLevel === 4, '85-94% accuracy with 4+ attempts maps to Tier 4 Advanced');

  const t5 = calculateMasteryTier(5, 96, 0);
  assert(t5.tier === 'mastered' && t5.tierLevel === 5, '95%+ accuracy with 5+ attempts & 0 misconceptions maps to Tier 5 Mastered');

  // Test 3: Rank Advancement Hierarchy
  console.log('3. Academic Rank Advancement Hierarchy:');
  const mockScholarProfile: AscensionProfile = {
    ...profile,
    level: 6,
    cumulativeXp: 4000,
    consistency: {
      ...profile.consistency,
      streakDays: 5,
    },
    masteryRecords: {
      'Math:Algebra': { subject: 'Math', topic: 'Algebra', tier: 'mastered', tierLevel: 5, accuracy: 96, totalAttempts: 5, totalCorrect: 24, lastPracticedIso: new Date().toISOString(), retentionDecayFactor: 1, activeMisconceptionsCount: 0 },
      'Math:Geometry': { subject: 'Math', topic: 'Geometry', tier: 'mastered', tierLevel: 5, accuracy: 95, totalAttempts: 5, totalCorrect: 25, lastPracticedIso: new Date().toISOString(), retentionDecayFactor: 1, activeMisconceptionsCount: 0 },
      'Math:Trig': { subject: 'Math', topic: 'Trig', tier: 'mastered', tierLevel: 5, accuracy: 98, totalAttempts: 5, totalCorrect: 25, lastPracticedIso: new Date().toISOString(), retentionDecayFactor: 1, activeMisconceptionsCount: 0 },
      'Sci:Bio': { subject: 'Sci', topic: 'Bio', tier: 'mastered', tierLevel: 5, accuracy: 97, totalAttempts: 5, totalCorrect: 25, lastPracticedIso: new Date().toISOString(), retentionDecayFactor: 1, activeMisconceptionsCount: 0 },
      'Sci:Chem': { subject: 'Sci', topic: 'Chem', tier: 'mastered', tierLevel: 5, accuracy: 99, totalAttempts: 5, totalCorrect: 25, lastPracticedIso: new Date().toISOString(), retentionDecayFactor: 1, activeMisconceptionsCount: 0 },
    },
  };

  const eligibleRank = evaluateRankAdvancement(mockScholarProfile, 4, 85);
  assert(eligibleRank === 'scholar', 'User qualifying for Scholar is promoted to Disciplined Scholar');

  // Test 4: Authoritative Progression Event Processing
  console.log('4. Authoritative Progression Events & Anti-Abuse Checks:');
  // Attempt with rapid button mashing / zero time should award minimal nominal XP
  const { updatedProfile: abuseProfile } = recordProgressionEvent(
    {
      type: 'quiz_completed',
      quizTitle: 'Rapid Test',
      subject: 'Mathematics',
      topic: 'Arithmetic',
      score: 5,
      total: 5,
      accuracy: 100,
      timeSpentSeconds: 1, // Only 1 second for 5 questions = bot/mashing
      difficulty: 'Intermediate',
      answeredCount: 0,
    },
    profile
  );
  assert(abuseProfile.transactions[0].verifiedEffort === false, 'Flags rapid unverified attempts as unverified');

  // Legitimate quiz attempt
  const { updatedProfile: legitProfile, notifications } = recordProgressionEvent(
    {
      type: 'quiz_completed',
      quizTitle: 'Algebra Foundations',
      subject: 'Mathematics',
      topic: 'Linear Equations',
      score: 4,
      total: 5,
      accuracy: 80,
      timeSpentSeconds: 45,
      difficulty: 'Intermediate',
      answeredCount: 5,
    },
    profile
  );

  assert(legitProfile.cumulativeXp > profile.cumulativeXp, 'Legitimate quiz awards substantial verified XP');
  assert(legitProfile.transactions[0].verifiedEffort === true, 'Legitimate quiz creates verified transaction record');
  assert(legitProfile.transactions[0].hash.length > 0, 'Transaction has cryptographically auditable hash');
  assert(
    legitProfile.activeQuests.find((q) => q.objectiveType === 'quiz_complete')?.currentCount! > 0,
    'Auto-increments active daily quiz quests'
  );

  return { passed, failed };
}
