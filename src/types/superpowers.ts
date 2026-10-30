import { ExamFormatId } from './quiz';

export type AcademicSubjectCategory = 'mathematics' | 'physics' | 'chemistry' | 'biology' | 'general_science' | 'literature_english';

export interface FormulaBookletItem {
  id: string;
  category: AcademicSubjectCategory;
  title: string;
  formulaLatex: string;
  formulaPlain: string;
  targetBoards: ExamFormatId[];
  explanation: string;
  variables: Array<{ symbol: string; meaning: string; unit?: string }>;
  commonExaminerTrap?: string;
  exampleProblem?: {
    prompt: string;
    answer: string;
  };
}

export interface PhysicalConstantItem {
  name: string;
  symbol: string;
  value: string;
  units: string;
  category: 'mechanics' | 'electromagnetism' | 'thermodynamics' | 'atomic' | 'general';
}

export interface CommandWordItem {
  word: string;
  level: 'Low' | 'Medium' | 'High' | 'Evaluative';
  expectedMarks: string;
  meaning: string;
  examinerExpectation: string;
  examplePrompt: string;
  proTip: string;
}

export interface GradeBoundaryRule {
  gradeLabel: string;
  minPercentage: number;
  maxPercentage: number;
  description: string;
  classification: 'distinction' | 'credit' | 'pass' | 'fail';
  colorBadgeClass: string;
}

export interface ExamBoardGradeSystem {
  boardId: ExamFormatId;
  boardName: string;
  boundaries: GradeBoundaryRule[];
  distinctionNotes: string;
}

export interface OmrRowState {
  questionNumber: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  correctOption?: 'A' | 'B' | 'C' | 'D';
  isFlagged?: boolean;
}

export interface SyllabusHeatmapTopic {
  id: string;
  code: string;
  subject: string;
  topicName: string;
  domain: string;
  attemptedQuestions: number;
  correctAnswers: number;
  masteryPercentage: number;
  targetExamBoards: ExamFormatId[];
  status: 'mastered' | 'review_needed' | 'critical_weakness';
  errorBreakdown: {
    carelessMath: number;
    conceptualGap: number;
    commandWordMisread: number;
    timePressure: number;
  };
  recommendedSubtopicDrill: string;
}

export interface ExamCountdownTarget {
  id: string;
  boardId: ExamFormatId;
  examTitle: string;
  seriesSession: string;
  targetDateIso: string; // e.g. "2026-05-18T09:00:00"
  officialWebsite: string;
  iconEmoji: string;
}
