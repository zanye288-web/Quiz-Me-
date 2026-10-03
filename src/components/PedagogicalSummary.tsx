import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Brain,
  TrendingUp,
  Target,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QuizResponse, PersonaType } from '../types/quiz';
import { soundFx } from '../utils/audio';

export interface PedagogicalSummaryData {
  headline: string;
  pedagogicalOverview: string;
  strengths: string[];
  areasForImprovement: string[];
  actionableRecommendation: string;
  bloomLevelFocus: string;
}

interface PedagogicalSummaryProps {
  quiz: QuizResponse;
  persona: PersonaType;
  results: {
    score: number;
    total: number;
    answers: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  };
}

export const PedagogicalSummary: React.FC<PedagogicalSummaryProps> = ({
  quiz,
  persona,
  results,
}) => {
  const [summaryData, setSummaryData] = useState<PedagogicalSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const accuracy = Math.round((results.score / results.total) * 100);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const answersPayload = results.answers.map((ans) => {
        const q = quiz.questions.find((item) => item.id === ans.questionId);
        return {
          questionText: q?.question || `Question #${ans.questionId}`,
          questionType: q?.type || 'multiple_choice',
          isCorrect: ans.isCorrect,
          userAnswer: ans.userAnswer || '(no answer provided)',
          correctAnswer: q?.correct_answer || '',
          domain: q?.domain || 'General Knowledge',
        };
      });

      const response = await fetch('/api/pedagogical-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizTitle: quiz.quiz_title,
          persona,
          score: results.score,
          total: results.total,
          accuracy,
          answers: answersPayload,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to retrieve pedagogical diagnostics.');
      }

      setSummaryData(data.summary);
    } catch (err: unknown) {
      const e = err as Error;
      console.warn('Pedagogical summary generation notice:', e.message);
      // Construct dependable local fallback summary
      const localStrengths =
        accuracy >= 80
          ? [
              'High accuracy on core recall & conceptual multiple-choice items',
              'Consistent precision in fundamental subject terminology',
            ]
          : [
              'Good persistence through challenging multi-format questions',
              'Demonstrated active problem-solving attempts',
            ];

      const localWeaknesses =
        accuracy < 100
          ? [
              'Review specific nuances in missed questions and terminology definitions',
              'Strengthen recall for multi-step reasoning questions',
            ]
          : ['Ready to advance to higher complexity synthesis or speed drill challenges'];

      setSummaryData({
        headline:
          accuracy === 100
            ? 'Mastery Level: Flawless Conceptual Grasp'
            : accuracy >= 75
            ? 'Proficient: Solid Conceptual Foundation'
            : 'Developing: Targeted Practice Recommended',
        pedagogicalOverview: `The learner answered ${results.score} of ${results.total} questions correctly (${accuracy}%). Performance reveals a ${
          accuracy >= 75
            ? 'firm command of foundational concepts with minor gaps in fringe edge cases.'
            : 'developing mental model that will benefit from active retrieval practice and flashcard review.'
        }`,
        strengths: localStrengths,
        areasForImprovement: localWeaknesses,
        actionableRecommendation:
          accuracy >= 80
            ? 'Solidify mastery by explaining these concepts in your own words or testing with a higher difficulty.'
            : 'Revisit missed questions using the Flashcards mode below and review the detailed answer explanations.',
        bloomLevelFocus: accuracy >= 80 ? 'Analyze & Evaluate' : 'Remember & Understand',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [quiz.quiz_title, results.score, results.total]);

  return (
    <div
      id="pedagogical-ai-summary-card"
      className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 p-5 sm:p-7 shadow-sm relative overflow-hidden transition-all"
    >
      {/* Decorative Glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-50 dark:opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
        }}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Learning Feedback</span>
              </span>
              {summaryData?.bloomLevelFocus && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/70 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  <Layers className="w-3 h-3 text-indigo-500" />
                  <span>Focus: {summaryData.bloomLevelFocus}</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {isLoading ? 'Analyzing your quiz results...' : summaryData?.headline || 'Performance Summary & Recommendations'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Diagnosis Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              fetchSummary();
            }}
            disabled={isLoading}
            title="Re-generate diagnostic summary"
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Collapsible toggle */}
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="pt-4 space-y-5"
          >
            {isLoading ? (
              // Loading Skeleton
              <div className="space-y-4 py-3">
                <div className="space-y-2">
                  <div className="h-4 bg-indigo-200/60 dark:bg-indigo-900/40 rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-indigo-200/40 dark:bg-indigo-900/30 rounded-full w-4/5 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="h-24 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 animate-pulse" />
                  <div className="h-24 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 animate-pulse" />
                </div>
              </div>
            ) : summaryData ? (
              <div className="space-y-5">
                {/* 1. Concise Pedagogical Overview */}
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100/80 dark:border-indigo-900/40 backdrop-blur-xs">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {summaryData.pedagogicalOverview}
                  </p>
                </div>

                {/* 2. Side-by-Side Strengths vs Areas for Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mastered Strengths */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>What You Did Well</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {summaryData.strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                      <Target className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>What to Review Next</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {summaryData.areasForImprovement.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3. Actionable Recommendation */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-pink-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs">
                    <Lightbulb className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      Recommended Next Step
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                      {summaryData.actionableRecommendation}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
