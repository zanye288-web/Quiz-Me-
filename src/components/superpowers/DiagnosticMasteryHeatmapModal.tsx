import React, { useState } from 'react';
import {
  X,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Play,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Download,
  Filter,
} from 'lucide-react';
import { SYLLABUS_HEATMAP_SEEDS } from '../../data/examinationFormulasAndConstants';
import { SyllabusHeatmapTopic } from '../../types/superpowers';
import { ExamFormatId, PersonaType, QuizResponse, Question } from '../../types/quiz';
import { soundFx } from '../../utils/audio';

interface DiagnosticMasteryHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaType;
  onStartQuiz: (quiz: QuizResponse) => void;
  studentName?: string;
}

export const DiagnosticMasteryHeatmapModal: React.FC<DiagnosticMasteryHeatmapModalProps> = ({
  isOpen,
  onClose,
  persona,
  onStartQuiz,
  studentName = 'Candidate Scholar',
}) => {
  const [topics, setTopics] = useState<SyllabusHeatmapTopic[]>(SYLLABUS_HEATMAP_SEEDS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'review' | 'mastered'>('all');
  const [activeDrillTopic, setActiveDrillTopic] = useState<SyllabusHeatmapTopic | null>(null);

  if (!isOpen) return null;

  const filteredTopics = topics.filter((t) => {
    if (selectedFilter === 'critical') return t.status === 'critical_weakness';
    if (selectedFilter === 'review') return t.status === 'review_needed';
    if (selectedFilter === 'mastered') return t.status === 'mastered';
    return true;
  });

  const totalAttempted = topics.reduce((s, t) => s + t.attemptedQuestions, 0);
  const totalCorrect = topics.reduce((s, t) => s + t.correctAnswers, 0);
  const overallMastery = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 75;

  const handleLaunchTargetedDrill = (t: SyllabusHeatmapTopic) => {
    soundFx.playSelect();
    setActiveDrillTopic(t);

    const drillQuestions: Question[] = [
      {
        id: 1,
        type: 'multiple_choice',
        question: `[Targeted Drill · ${t.topicName}] Which fundamental principle is critical for resolving boundary conditions in ${t.topicName}?`,
        options: [
          'Direct application of the primary syllabus conservation invariant',
          'Approximation without error term checking',
          'Assuming uniform conditions across irregular boundaries',
          'Omitting intermediate method marks',
        ],
        correct_answer: 'Direct application of the primary syllabus conservation invariant',
        explanation: `Chief Examiner Guidance for ${t.topicName}: Always explicitly state the governing equation before performing algebraic transformations.`,
        topic: t.subject,
        difficulty: 'Intermediate',
        gamified_feedback: {
          success_quote: 'Outstanding! You locked in the core syllabus principle with precision.',
          hint: 'Remember that conservation principles are fundamental invariables across examination boards.',
        },
      },
      {
        id: 2,
        type: 'open_explanation',
        question: `[Targeted Drill · ${t.topicName}] Explain the step-by-step diagnostic method to avoid common examiner traps in ${t.topicName}.`,
        correct_answer: 'Identify given variables, state formula, perform unit conversion, and check significance.',
        explanation: 'Method marks [M1] are awarded for proper variable isolation and [A1] for dimensional accuracy.',
        topic: t.subject,
        difficulty: 'Intermediate',
        gamified_feedback: {
          success_quote: 'Brilliant articulation of the marking criteria!',
          hint: 'Think about M1 (method) and A1 (accuracy) criteria in examiners reports.',
        },
      },
      {
        id: 3,
        type: 'multiple_choice',
        question: `[Targeted Drill · ${t.topicName}] Practice Application: Solve the high-yield scenario for ${t.recommendedSubtopicDrill}`,
        options: [
          'Exact derivation matching official mark scheme standard',
          'Intermediate estimate lacking precision',
          'Unsubstantiated heuristic conclusion',
          'Irrelevant tangential derivation',
        ],
        correct_answer: 'Exact derivation matching official mark scheme standard',
        explanation: 'Matches the Chief Examiner benchmark criteria.',
        topic: t.subject,
        difficulty: 'Master',
        gamified_feedback: {
          success_quote: 'Phenomenal exam readiness! You resolved the high-yield trap with zero errors.',
          hint: 'Evaluate standard derivation steps and avoid shortcuts that cost method marks.',
        },
      },
    ];

    const quizResponse: QuizResponse = {
      app_name: 'Quiz Me!',
      persona,
      quiz_title: `${t.topicName} — 3-Question Remedial Drill`,
      summary: `Targeted conceptual review to eliminate errors in ${t.topicName}. Focus area: ${t.recommendedSubtopicDrill}`,
      questions: drillQuestions,
      difficulty: 'Intermediate',
      tags: [t.subject, 'Targeted Drill', 'Remediation'],
    };

    onClose();
    onStartQuiz(quizResponse);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Syllabus Topic Mastery Heatmap &amp; Mistake Diagnostics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual matrix tracking conceptual gaps, careless math errors, and automated 3-question remedial drills.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 block">Overall Mastery Index</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block tabular-nums">
              {overallMastery}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-emerald-700 dark:text-emerald-400 block">Mastered Topics</span>
            <span className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5 block tabular-nums">
              {topics.filter((t) => t.status === 'mastered').length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <span className="text-amber-700 dark:text-amber-400 block">Review Recommended</span>
            <span className="text-xl font-black text-amber-800 dark:text-amber-300 mt-0.5 block tabular-nums">
              {topics.filter((t) => t.status === 'review_needed').length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <span className="text-rose-700 dark:text-rose-400 block">Critical Remediation</span>
            <span className="text-xl font-black text-rose-800 dark:text-rose-300 mt-0.5 block tabular-nums">
              {topics.filter((t) => t.status === 'critical_weakness').length}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[
              { id: 'all', label: `All Topics (${topics.length})` },
              { id: 'critical', label: '🔴 Critical Remediation' },
              { id: 'review', label: '🟡 Review Needed' },
              { id: 'mastered', label: '🟢 Mastered' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Heatmap Cards List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredTopics.map((topic) => {
            const isCritical = topic.status === 'critical_weakness';
            const isReview = topic.status === 'review_needed';

            return (
              <div
                key={topic.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCritical
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    : isReview
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-mono font-bold text-slate-500">{topic.code}</span>
                    <span>·</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{topic.subject}</span>
                    <span>·</span>
                    <span className="text-slate-500">{topic.domain}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {topic.topicName}
                  </h4>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 max-w-xs h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCritical ? 'bg-rose-500' : isReview ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${topic.masteryPercentage}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-xs tabular-nums text-slate-700 dark:text-slate-300">
                      {topic.masteryPercentage}% ({topic.correctAnswers}/{topic.attemptedQuestions})
                    </span>
                  </div>

                  {/* Mistake Pattern Diagnostic breakdown */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-1">
                    <span>Errors:</span>
                    <span className="text-rose-600">Conceptual: {topic.errorBreakdown.conceptualGap}</span>
                    <span>·</span>
                    <span className="text-amber-600">Calculation: {topic.errorBreakdown.carelessMath}</span>
                    <span>·</span>
                    <span className="text-slate-600">Misread Word: {topic.errorBreakdown.commandWordMisread}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchTargetedDrill(topic)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Launch 3-Q Remedial Drill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
