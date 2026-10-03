import { DifficultyType, PersonaType, QuizResponse } from './quiz';

export type GoalStatus =
  | 'not_started'
  | 'in_progress'
  | 'improving'
  | 'nearly_complete'
  | 'completed'
  | 'needs_attention'
  | 'deadline_approaching';

export type GoalTrend = 'improving' | 'steady' | 'declining';

export interface LearningGoal {
  id: string;
  userId?: string;
  title: string;
  subject: string;
  topic: string;
  targetScore?: number; // e.g. 80 (%)
  targetQuizzesCount?: number; // e.g. 10
  deadline?: string; // ISO date string
  difficulty?: DifficultyType;
  description?: string;
  currentScore: number;
  currentQuizzesCount: number;
  status: GoalStatus;
  recommendedAction: string;
  recentTrend: GoalTrend;
  createdAt: string;
  updatedAt: string;
}

export interface IntelligentNoteSection {
  title: string;
  content: string;
}

export interface SelfCheckQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface CommonMistakeItem {
  mistake: string;
  correction: string;
  whyItHappens: string;
}

export interface IntelligentNote {
  id: string;
  title: string;
  subject: string;
  topic: string;
  sourceType: 'topic' | 'quiz' | 'mistakes' | 'questions' | 'goal' | 'custom';
  sourceId?: string;
  targetAudience?: string;
  topicIntroduction: string;
  keyConcepts: Array<{ title: string; explanation: string }>;
  detailedExplanation: string[]; // progressive explanations
  examples: Array<{ scenario: string; explanation: string }>;
  commonMistakes: CommonMistakeItem[];
  rememberThis: string[]; // high-value concise facts
  quickRevision: string[]; // concise summary points
  selfCheckQuestions: SelfCheckQuestion[];
  visualAsset?: {
    url: string;
    caption: string;
    imageType?: string;
    source?: string;
    attribution?: string;
    educationalPurpose?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TutorChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    action: 'generate_notes' | 'start_quiz' | 'explain_concept' | 'view_goal';
    payload?: any;
  }>;
  referencedQuestions?: number[];
  generatedNotePreview?: Partial<IntelligentNote>;
}

export interface MistakeAnalysisItem {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  diagnosedMisconception?: string;
  topic: string;
  domain?: string;
}

export interface MistakeAnalysisReport {
  overallAccuracy: number;
  totalQuestions: number;
  incorrectCount: number;
  strongTopics: string[];
  weakTopics: string[];
  misconceptions: string[];
  difficultyAreas: string[];
  topicsRequiringRevision: string[];
  detailedMistakes: MistakeAnalysisItem[];
  tutorStudyPlan: string;
  recommendedNextAction: string;
}

export type EducationalImageType =
  | 'Diagram'
  | 'Scientific Illustration'
  | 'Map'
  | 'Chart'
  | 'Graph'
  | 'Historical Photograph'
  | 'Photograph'
  | 'Infographic'
  | 'Technical Diagram'
  | 'Artwork'
  | 'Object Photograph';

export interface EducationalImageMetadata {
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  attribution?: string;
  imageType: EducationalImageType;
  relevanceScore: number;
  educationalPurpose: string;
  qualityVerified: boolean;
  width?: number;
  height?: number;
}

export interface LearnerProfileSignals {
  totalQuizzesTaken: number;
  overallAccuracy: number;
  currentStreak: number;
  strongAreas: Array<{ topic: string; score: number; count: number }>;
  weakAreas: Array<{ topic: string; score: number; count: number }>;
  recentTrend: 'improving' | 'steady' | 'declining';
  recommendedNextTopic: string;
  recommendedActionText: string;
  activeGoalsCount: number;
  completedGoalsCount: number;
}
