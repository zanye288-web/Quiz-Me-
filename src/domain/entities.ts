// ============================================================================
// QUIZ-ME! — DOMAIN LAYER ENTITIES
// Pure business logic entities decoupled from database and presentation details.
// ============================================================================

export type DomainSubject =
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English Language'
  | 'Literature'
  | 'Economics'
  | 'Government'
  | 'General Academic';

export type DomainDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery';

export interface DomainUser {
  id: string;
  email: string | null;
  displayName: string;
  photoUrl: string | null;
  xp: number;
  level: number;
  streakDays: number;
  role: 'student' | 'teacher' | 'scholar';
  createdAt: string;
  updatedAt: string;
}

export interface DomainQuestion {
  id: string | number;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'open_ended';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: DomainDifficulty;
  weightMarks?: number;
  examinerTrap?: string;
  prerequisiteAxiom?: string;
}

export interface DomainAssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  assessmentTitle: string;
  subject: string;
  topic: string;
  score: number;
  maxScore: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  xpEarned: number;
  mistakesCount: number;
  completedAt: string;
}

export interface DomainMasterySignal {
  subject: string;
  topic: string;
  totalAttempts: number;
  correctAttempts: number;
  averageAccuracy: number;
  lastAttemptedAt: string;
  estimatedMastery: number; // 0 - 100
  confidenceTier: 'low' | 'moderate' | 'high';
  isPrerequisiteWeak: boolean;
}

export interface DomainMistakeRecord {
  id: string;
  userId?: string;
  questionPrompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  diagnosedMisconception: string;
  subject: string;
  topic: string;
  status: 'needs_review' | 'practicing' | 'mastered';
  retriesCount: number;
  savedAt: string;
}
