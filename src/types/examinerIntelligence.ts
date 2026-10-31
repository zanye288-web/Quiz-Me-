// Master Examiner Intelligence, Syllabus Tracker, Oral Exam, Classroom & Dependency Graph Types

export type ExamBoard =
  | 'WAEC'
  | 'JAMB'
  | 'NECO'
  | 'Cambridge_IGCSE'
  | 'Cambridge_ALevel'
  | 'Cambridge_Checkpoint'
  | 'SAT'
  | 'AP_IB'
  | 'National_Standard';

export type QuestionVerificationStatus =
  | 'official_verified'
  | 'human_reviewed'
  | 'ai_reviewed'
  | 'ai_generated'
  | 'unverified';

export type BloomsTaxonomyLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

// 1. Syllabus Tracker Types
export interface SyllabusSubtopic {
  id: string;
  title: string;
  learningObjectives: string[];
  prerequisites: string[];
  keyDefinitions: string[];
  suggestedActivities: string[];
  isCompleted?: boolean;
  masteryScore?: number; // 0 - 100
  needsRevision?: boolean;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  weightPercentage: number;
  subtopics: SyllabusSubtopic[];
  recommendedHours?: number;
  isCompleted?: boolean;
}

export interface SyllabusDocument {
  id: string;
  board: ExamBoard;
  qualification: string; // e.g. "WASSCE (Senior)", "IGCSE (0580)", "Digital SAT"
  subject: string;
  level: string; // "Ordinary Level", "Advanced Level", "High School Senior", "Middle School"
  syllabusVersion: string;
  effectiveYear: string;
  sourceReference: string;
  lastVerifiedDate: string;
  topics: SyllabusTopic[];
}

export interface SyllabusProgressRecord {
  syllabusId: string;
  userId: string;
  completedSubtopicIds: string[];
  masteredSubtopicIds: string[];
  needsRevisionSubtopicIds: string[];
  lastStudiedTopicId?: string;
  lastStudiedAt: string;
}

// 2. Written Answer Examiner Types
export interface CriteriaMarkAllocation {
  criterion: string;
  maxMarks: number;
  awardedMarks: number;
  examinerComment: string;
  passed: boolean;
}

export interface WrittenAnswerEvaluation {
  id: string;
  questionId?: string;
  questionText: string;
  studentAnswerText: string;
  studentImageScan?: string;
  subject: string;
  topic: string;
  examBoard: ExamBoard;
  maxMarks: number;
  awardedMarks: number;
  percentageScore: number;
  correctnessLevel: 'exemplary' | 'solid' | 'partial' | 'inadequate';
  criteriaBreakdown: CriteriaMarkAllocation[];
  missingKeyPoints: string[];
  misconceptionsDetected: string[];
  modelExaminerAnswer: string;
  examinerFeedback: string;
  suggestedImprovements: string[];
  nextRevisionTopic: string;
  isOfficialMarkScheme: boolean;
  evaluatedAt: string;
}

// 3. Knowledge Dependency Graph Types
export type KnowledgeNodeState = 'mastered' | 'in_progress' | 'weak_prerequisite' | 'locked' | 'untested';

export interface ConceptDependencyNode {
  id: string;
  domain: string; // 'mathematics' | 'physics' | 'chemistry' | 'biology'
  title: string;
  level: number; // Tier / Depth (1 = foundational, 4 = advanced)
  description: string;
  prerequisiteIds: string[];
  state: KnowledgeNodeState;
  masteryScore: number; // 0 - 100
  recentAttemptsCount: number;
  associatedTopic: string;
  keyFormulaOrLaw?: string;
  examinerTrap?: string;
}

export interface DependencyGraphEdge {
  from: string; // prerequisite concept ID
  to: string; // downstream dependent concept ID
}

// 4. Classroom & Teacher Workspace Types
export type UserClassroomRole = 'teacher' | 'student';

export interface ClassroomAssignment {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  assignmentType: 'quiz' | 'exam_paper' | 'written_answer' | 'oral_exam';
  subject: string;
  examBoard: ExamBoard;
  targetQuizId?: string;
  targetPaperTitle?: string;
  dueDate: string;
  totalPoints: number;
  createdAt: string;
}

export interface ClassroomSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  status: 'graded' | 'pending_review' | 'late';
  teacherFeedback?: string;
  misconceptionsEncountered: string[];
}

export interface Classroom {
  id: string;
  code: string; // e.g. "WAEC-74"
  name: string; // e.g. "Grade 12 Advanced Physics"
  teacherId: string;
  teacherName: string;
  subject: string;
  examBoard: ExamBoard;
  studentCount: number;
  activeAssignmentsCount: number;
  averageAccuracy: number;
  createdAt: string;
}

// 5. AI Oral Examination (Viva Voce) Types
export interface OralExamTurn {
  questionNumber: number;
  questionAudioUrl?: string;
  examinerQuestion: string;
  studentTranscript: string;
  audioDurationSeconds?: number;
  awardedScore: number; // 0 - 10
  contentAccuracy: number; // 0 - 100
  keyTerminologyUsed: string[];
  missingConcepts: string[];
  examinerObservation: string;
  followUpPrompt?: string;
  answeredAt: string;
}

export interface OralExamSession {
  id: string;
  subject: string;
  topic: string;
  examBoard: ExamBoard;
  academicLevel: string;
  candidateName: string;
  turns: OralExamTurn[];
  overallBandScore: number; // 1 - 9 (or 0 - 100)
  overallComment: string;
  examinerCommendations: string[];
  priorityRevisionAreas: string[];
  completedAt?: string;
  isComplete: boolean;
}

// 6. Question Quality & Verification Metadata
export interface QuestionQualityAudit {
  questionId: string;
  verificationStatus: QuestionVerificationStatus;
  examBoard: ExamBoard;
  examYear?: string;
  officialPaperCode?: string;
  sourceCitation: string;
  isOfficialMarkScheme: boolean;
  bloomsLevel: BloomsTaxonomyLevel;
  clarityScore: number; // 0 - 100
  potentialDistractorAmbiguity: boolean;
  detectedMisleadingTrap?: string;
  reviewerNotes?: string;
  lastAuditedAt: string;
}

// 7. Personal Learning Timeline Types
export type LearningActivityType =
  | 'quiz_completed'
  | 'exam_paper'
  | 'written_evaluation'
  | 'oral_viva'
  | 'mistake_resolved'
  | 'milestone_unlocked'
  | 'syllabus_mastered'
  | 'stem_lab_experiment';

export interface LearningTimelineEvent {
  id: string;
  activityType: LearningActivityType;
  title: string;
  subject: string;
  topic: string;
  examBoard?: ExamBoard;
  scorePercentage?: number;
  xpEarned?: number;
  badgeAwarded?: string;
  summary: string;
  timestamp: string;
  deepLinkTab: string;
}
