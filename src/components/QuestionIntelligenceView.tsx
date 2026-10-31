import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  Award,
  BookOpen,
  HelpCircle,
  Eye,
  RefreshCw,
  FileCheck,
  Check,
  X,
} from 'lucide-react';
import { auditQuestionQuality } from '../services/examinerService';
import { QuestionQualityAudit, ExamBoard, QuestionVerificationStatus } from '../types/examinerIntelligence';
import { soundFx } from '../utils/audio';

interface SampleAuditedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  examBoard: ExamBoard;
  examYear?: string;
  marks: number;
  verificationStatus: QuestionVerificationStatus;
  clarityScore: number;
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  sourceCitation: string;
  isOfficialMarkScheme: boolean;
}

const INITIAL_AUDITED_QUESTIONS: SampleAuditedQuestion[] = [
  {
    id: 'waec-bio-2024-q1',
    question: 'Which of the following cellular organelles is primarily responsible for the synthesis of adenosine triphosphate (ATP) via aerobic cellular respiration?',
    options: ['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Endoplasmic reticulum'],
    correctAnswer: 'Mitochondrion',
    explanation: 'The mitochondrion contains the enzymes of the citric acid (Krebs) cycle and electron transport chain on its inner cristae, generating ATP through oxidative phosphorylation.',
    subject: 'Biology',
    topic: 'Cell Ultrastructure and Physiology',
    examBoard: 'WAEC',
    examYear: '2024',
    marks: 1,
    verificationStatus: 'official_verified',
    clarityScore: 98,
    bloomsLevel: 'understand',
    sourceCitation: 'WASSCE Biology Paper 1 (Objective) June 2024, Question 4',
    isOfficialMarkScheme: true,
  },
  {
    id: 'caie-phy-0625-q3',
    question: 'A car accelerates uniformly from rest to a speed of 24 m/s in 8.0 s. What is the distance travelled by the car during this time?',
    options: ['48 m', '96 m', '192 m', '384 m'],
    correctAnswer: '96 m',
    explanation: 'Distance is the area under the speed-time graph: s = 0.5 × base × height = 0.5 × 8.0 s × 24 m/s = 96 m (or using s = ((u + v)/2) × t = (24/2) × 8 = 96 m).',
    subject: 'Physics',
    topic: 'Kinematics & Speed-Time Graphs',
    examBoard: 'Cambridge_IGCSE',
    examYear: '2023',
    marks: 1,
    verificationStatus: 'official_verified',
    clarityScore: 96,
    bloomsLevel: 'apply',
    sourceCitation: 'Cambridge IGCSE Physics (0625) Paper 2 Multiple Choice June 2023',
    isOfficialMarkScheme: true,
  },
  {
    id: 'sat-math-alg-q7',
    question: 'If 3x - 5 = 16, what is the value of 6x - 7?',
    options: ['32', '35', '42', '45'],
    correctAnswer: '35',
    explanation: 'First solve for x: 3x = 21 => x = 7. Then substitute into the expression: 6(7) - 7 = 42 - 7 = 35. Alternatively, observe 6x = 2(3x) = 2(21) = 42, so 42 - 7 = 35.',
    subject: 'Digital SAT Mathematics',
    topic: 'Heart of Algebra & Linear Equations',
    examBoard: 'SAT',
    examYear: '2025',
    marks: 1,
    verificationStatus: 'human_reviewed',
    clarityScore: 94,
    bloomsLevel: 'apply',
    sourceCitation: 'College Board Official Digital SAT Math Framework Sample Set',
    isOfficialMarkScheme: false,
  },
  {
    id: 'waec-chem-titr-q12',
    question: 'During a standard acid-base titration of hydrochloric acid with sodium hydroxide using phenolphthalein indicator, what is the color change at the equivalence point when acid is in the conical flask?',
    options: ['Pink to colorless', 'Colorless to persistent pale pink', 'Yellow to red', 'Orange to yellow'],
    correctAnswer: 'Colorless to persistent pale pink',
    explanation: 'Phenolphthalein is colorless in acidic solution and turns pink in alkaline media (pH > 8.2). When base is added from the burette to acid in the flask, the first permanent faint pink tint indicates the endpoint.',
    subject: 'Chemistry',
    topic: 'Volumetric Analysis & Acid-Base Titration',
    examBoard: 'WAEC',
    examYear: '2023',
    marks: 1,
    verificationStatus: 'official_verified',
    clarityScore: 95,
    bloomsLevel: 'remember',
    sourceCitation: 'WASSCE Chemistry Paper 2 Scheme',
    isOfficialMarkScheme: true,
  },
];

export const QuestionIntelligenceView: React.FC = () => {
  const [questions, setQuestions] = useState<SampleAuditedQuestion[]>(INITIAL_AUDITED_QUESTIONS);
  const [selectedBoard, setSelectedBoard] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<SampleAuditedQuestion>(INITIAL_AUDITED_QUESTIONS[0]);

  // Live Audit Form State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<QuestionQualityAudit | null>(null);

  const filteredQuestions = questions.filter((q) => {
    if (selectedBoard !== 'ALL' && q.examBoard !== selectedBoard) return false;
    if (selectedStatus !== 'ALL' && q.verificationStatus !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.question.toLowerCase().includes(query) ||
        q.subject.toLowerCase().includes(query) ||
        q.topic.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadge = (status: QuestionVerificationStatus) => {
    switch (status) {
      case 'official_verified':
        return {
          label: 'Official Source Verified',
          color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
        };
      case 'human_reviewed':
        return {
          label: 'Human Educator Reviewed',
          color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
        };
      case 'ai_reviewed':
        return {
          label: 'AI Psychometrics Audited',
          color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
        };
      case 'ai_generated':
        return {
          label: 'AI Practice Item',
          color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
        };
      default:
        return {
          label: 'Unverified',
          color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const handleAuditLive = async (target: SampleAuditedQuestion) => {
    setIsAuditing(true);
    setAuditResult(null);

    try {
      const audit = await auditQuestionQuality({
        question: target.question,
        options: target.options,
        correctAnswer: target.correctAnswer,
        explanation: target.explanation,
        subject: target.subject,
        topic: target.topic,
        examBoard: target.examBoard,
      });

      setAuditResult(audit);
      soundFx.playCorrect();
    } catch (e) {
      console.error('Audit failed', e);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Psychometrics & Quality Control</span>
              <span aria-hidden="true">·</span>
              <span>Question Verification Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Question Intelligence & Quality Audit
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Inspect question verification statuses, source citations, distractor validity, and Bloom&apos;s Taxonomy
              cognitive tiers. Official past paper items are strictly verified against examination syndicate mark schemes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {questions.filter((q) => q.verificationStatus === 'official_verified').length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Official Verified</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {questions.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Audited Bank</div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Board:</span>
            {['ALL', 'WAEC', 'Cambridge_IGCSE', 'SAT'].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBoard(b)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedBoard === b
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {b === 'ALL' ? 'All Boards' : b.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search question bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Question List (6 cols) + Inspector Card (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Bank (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          {filteredQuestions.map((q) => {
            const isSelected = q.id === selectedQuestion.id;
            const badge = getStatusBadge(q.verificationStatus);

            return (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuestion(q);
                  setAuditResult(null);
                  soundFx.playClick();
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 ring-2 ring-indigo-500 border-indigo-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {q.examBoard.replace('_', ' ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{q.subject}</span>
                    {q.examYear && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{q.examYear}</span>
                      </>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {q.question}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Topic: {q.topic}</span>
                  <span className="font-mono text-emerald-600 font-semibold">Clarity: {q.clarityScore}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Deep Quality Inspector (6 cols) */}
        <div className="lg:col-span-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            {/* Header & Verification Stamp */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>ID: {selectedQuestion.id}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">Bloom: {selectedQuestion.bloomsLevel}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Psychometric Audit Dossier
                </h3>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    getStatusBadge(selectedQuestion.verificationStatus).color
                  }`}
                >
                  {getStatusBadge(selectedQuestion.verificationStatus).label}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Examination Question:
              </label>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white leading-relaxed">
                {selectedQuestion.question}
              </div>
            </div>

            {/* Options & Stated Correct Answer */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Distractor Options & Key:
              </label>
              <div className="space-y-1.5">
                {selectedQuestion.options.map((opt, i) => {
                  const isCorrect = opt === selectedQuestion.correctAnswer;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && (
                        <span className="text-[10px] uppercase font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Key Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Source Citation & Mark Scheme */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-500" />
                <span>Source Attribution & Copyright Notice:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 italic">
                {selectedQuestion.sourceCitation}
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                Official Marking Scheme Scheme: {selectedQuestion.isOfficialMarkScheme ? 'Verified CAIE/WAEC rubric' : 'AI-generated curriculum rubric'}
              </div>
            </div>

            {/* AI Audit Action */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <button
                onClick={() => handleAuditLive(selectedQuestion)}
                disabled={isAuditing}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing Psychometrics & Distractor Ambiguity...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Psychometrics Quality Inspection</span>
                  </>
                )}
              </button>

              {auditResult && (
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                      Audit Inspection Report
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      Clarity: {auditResult.clarityScore}/100
                    </span>
                  </div>

                  <div className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Reviewer Notes: </span>
                    {auditResult.reviewerNotes}
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span>
                      Distractor Ambiguity:{' '}
                      <strong className={auditResult.potentialDistractorAmbiguity ? 'text-red-500' : 'text-emerald-500'}>
                        {auditResult.potentialDistractorAmbiguity ? 'Detected' : 'None (Clean)'}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Bloom: {auditResult.bloomsLevel.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
