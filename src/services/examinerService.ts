import {
  WrittenAnswerEvaluation,
  OralExamTurn,
  QuestionQualityAudit,
  ExamBoard,
} from '../types/examinerIntelligence';

const API_BASE = '/api';

export async function evaluateWrittenAnswer(params: {
  questionText: string;
  studentAnswerText: string;
  imageBase64?: string;
  mimeType?: string;
  subject?: string;
  topic?: string;
  examBoard?: ExamBoard;
  maxMarks?: number;
  officialMarkScheme?: string;
}): Promise<WrittenAnswerEvaluation> {
  const res = await fetch(`${API_BASE}/examiner/evaluate-written`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to evaluate written answer.');
  }

  const data = await res.json();
  return {
    ...data.evaluation,
    id: `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    questionText: params.questionText,
    studentAnswerText: params.studentAnswerText,
    studentImageScan: params.imageBase64,
    subject: params.subject || 'General',
    topic: params.topic || 'General',
    examBoard: params.examBoard || 'WAEC',
    evaluatedAt: new Date().toISOString(),
  };
}

export async function processOralExamTurn(params: {
  subject: string;
  topic: string;
  examBoard: ExamBoard;
  academicLevel: string;
  currentTurn: number;
  totalTurns: number;
  examinerQuestion: string;
  studentTranscript: string;
  conversationHistory?: Array<{ question: string; answer: string; score?: number }>;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/examiner/oral-turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to process oral exam turn.');
  }

  return await res.json();
}

export async function auditQuestionQuality(params: {
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  subject?: string;
  topic?: string;
  examBoard?: ExamBoard;
}): Promise<QuestionQualityAudit> {
  const res = await fetch(`${API_BASE}/examiner/audit-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to audit question quality.');
  }

  const data = await res.json();
  return {
    ...data.audit,
    questionId: `q_${Date.now()}`,
    examBoard: params.examBoard || 'WAEC',
    sourceCitation: 'Examiner Syndicate AI Quality Inspection',
    isOfficialMarkScheme: false,
    lastAuditedAt: new Date().toISOString(),
  };
}
