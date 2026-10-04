export type QuestionType = 'multiple_choice' | 'fill_in_blank' | 'open_explanation' | 'code_media_challenge';
export type PersonaType = 'Teacher' | 'Student';
export type DifficultyType = 'Beginner' | 'Intermediate' | 'Master';
export type CognitiveDomain = 'Foundations' | 'Applied Logic' | 'Syntax & Execution' | 'Analytical Reasoning' | 'Edge Cases';
export type AssessmentMode = 'practice' | 'exam' | 'taxonomy';

export interface GamifiedFeedback {
  success_quote: string;
  hint: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[] | null;
  correct_answer: string;
  explanation: string;
  image_url?: string | null;
  image_caption?: string | null;
  image_layout?: 'top' | 'left' | 'split' | 'background' | 'none';
  image_search_query?: string | null;
  image_source?: string | null;
  image_source_url?: string | null;
  image_attribution?: string | null;
  media_timestamp?: string | null;
  code_snippet?: string | null;
  language?: string | null;
  blank_context?: {
    prefix?: string;
    suffix?: string;
    word_bank?: string[];
  };
  gamified_feedback: GamifiedFeedback;
  pedagogy_note?: string | null;
  rubric?: string[] | null;
  domain?: CognitiveDomain;
  points?: number;
  bloom_level?: 'Remember' | 'Understand' | 'Apply' | 'Analyze';
}

export interface StudyGuide {
  key_takeaways: string[];
  core_vocabulary: Array<{ term: string; definition: string }>;
  recommended_review: string;
}

export type DeckTheme = 'gamma-dark' | 'gamma-emerald' | 'gamma-ocean' | 'gamma-sunset' | 'gamma-minimal';

export interface QuizResponse {
  app_name: 'Quiz Me!';
  persona: PersonaType;
  quiz_title: string;
  summary: string;
  questions: Question[];
  difficulty?: DifficultyType;
  study_guide?: StudyGuide;
  key_takeaways?: TrackKeyTakeaways;
  created_at?: string;
  tags?: string[];
  pedagogical_topic?: 'STEM' | 'History' | 'Social Sciences' | 'Humanities & Literature' | 'Arts & Culture' | 'Business & Finance' | string;
  pedagogical_subtopic?: string;
  language?: string; // Language code, e.g. 'en-US', 'es-ES', 'fr-FR', 'ja-JP'
  language_name?: string; // e.g. 'Spanish (Español)'
  cover_image?: string | null;
  deck_theme?: DeckTheme;
  target_audience?: string;
}

export interface AssessmentConfig {
  mode: AssessmentMode;
  feedbackTiming: 'instant' | 'deferred'; // instant feedback vs review at end (exam)
  timeLimitMinutes: number; // 0 = untimed
  passingScorePercent: number; // e.g. 70
  shuffleQuestions: boolean;
  allowHints: boolean;
  challengeMode?: boolean; // Per-question countdown timer with speed XP multiplier
  challengeTimerSeconds?: number; // Per-question time limit, e.g. 15, 20, 30
}

export interface QuizRecommendation {
  id: string;
  title: string;
  topic: string;
  description: string;
  difficulty: DifficultyType;
  targetDomain: string;
  reasonCategory: 'Remediation' | 'Progression' | 'Reinforcement' | 'Mastery';
  matchReason: string;
  suggestedQuestionCount: number;
  suggestedTypes: QuestionType[];
  estimatedMinutes: number;
  xpReward: number;
  icon?: string;
  samplePrompt: string;
  prebuiltQuiz?: QuizResponse;
}

export interface UserStats {
  streak: number;
  hearts: number;
  maxHearts: number;
  xp: number;
  gems: number;
  coins?: number;
  unlockedMascots?: string[];
  unlockedAccessories?: string[];
  equippedAccessory?: string;
  level: number;
  quizzesCompleted: number;
  totalCorrect: number;
  totalQuestions: number;
  badges: string[];
  totalTimeSpentSeconds?: number;
  masteryByDomain?: Record<string, { correct: number; total: number }>;
}

export interface RecommendedVideo {
  id: string;
  title: string;
  channel: string;
  url: string;
  embedUrl?: string;
  durationMinutes: number;
  topic: string;
  targetType: 'failed' | 'passed';
  reason: string;
  thumbnailUrl?: string;
  difficulty?: DifficultyType;
}

export interface RecommendedWebsite {
  id: string;
  title: string;
  domain: string;
  url: string;
  description: string;
  topic: string;
  targetType: 'failed' | 'passed';
  reason: string;
  interactive?: boolean;
}

export interface RecommendedDocument {
  id: string;
  title: string;
  docType: 'guide' | 'cheatsheet' | 'textbook' | 'summary' | 'article';
  summary: string;
  topic: string;
  keyTakeaways: string[];
  url?: string;
  targetType: 'failed' | 'passed';
  reason: string;
}

export interface TutorSessionPlan {
  headline: string;
  diagnosticSummary: string;
  primaryFailedConcept?: string;
  recommendedStartingPrompt: string;
  quickPrompts: string[];
}

export interface StudyRecommendationsData {
  videos: RecommendedVideo[];
  websites: RecommendedWebsite[];
  documents: RecommendedDocument[];
  tutorPlan: TutorSessionPlan;
  failedTopicsSummary: string[];
  passedTopicsSummary: string[];
  overallMasteryPercent: number;
}

export interface IngestFileInput {
  name: string;
  size: number;
  mimeType: string;
  base64Data?: string;
  previewUrl?: string;
}

export interface TrackKeyTakeaways {
  executiveSummary: string;
  keyTakeaways: string[];
  coreConcepts: Array<{ term: string; explanation: string }>;
  prepTip: string;
  sourceSnippet?: string;
  estimatedReadMinutes?: number;
}



