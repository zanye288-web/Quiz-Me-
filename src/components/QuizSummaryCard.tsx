import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Target,
  BookOpen,
  Award,
  Clock,
  HelpCircle,
  FileDown,
  Printer,
} from 'lucide-react';
import { QuizResponse, PersonaType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { exportCompletedQuizToPdf, printCompletedQuizPdf } from '../utils/quizPdfExporter';

export interface AreaForStudy {
  topic: string;
  explanation: string;
  needLevel: 'High' | 'Medium' | 'Low';
  suggestedAction: string;
}

export interface QuizSummaryData {
  synopsis: string;
  masteryLevel: string;
  keyTakeaways: string[];
  areasForStudy: AreaForStudy[];
  quickStudyTip: string;
  suggestedNextStep: string;
}

interface QuizSummaryCardProps {
  quiz: QuizResponse;
  persona: PersonaType;
  results: {
    score: number;
    total: number;
    timeSpentSeconds?: number;
    answers: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  };
  onSummaryLoaded?: (data: QuizSummaryData) => void;
  className?: string;
}

export const QuizSummaryCard: React.FC<QuizSummaryCardProps> = ({
  quiz,
  persona,
  results,
  onSummaryLoaded,
  className = '',
}) => {
  const [summaryData, setSummaryData] = useState<QuizSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'takeaways' | 'study_areas'>('all');

  const accuracy = Math.round((results.score / results.total) * 100);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payloadQuestions = results.answers.map((ans) => {
        const q = quiz.questions.find((item) => item.id === ans.questionId);
        return {
          id: ans.questionId,
          questionText: q?.question || `Question #${ans.questionId}`,
          questionType: q?.type || 'multiple_choice',
          domain: q?.domain,
          isCorrect: ans.isCorrect,
          userAnswer: ans.userAnswer || '(none)',
          correctAnswer: q?.correct_answer || '',
          explanation: q?.explanation || '',
        };
      });

      const response = await fetch('/api/quiz-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizTitle: quiz.quiz_title,
          quizSummary: quiz.summary,
          persona,
          difficulty: quiz.difficulty,
          score: results.score,
          total: results.total,
          accuracy,
          timeSpentSeconds: results.timeSpentSeconds || 0,
          questions: payloadQuestions,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate AI synopsis');
      }

      setSummaryData(data.summary);
      onSummaryLoaded?.(data.summary);
    } catch (err: unknown) {
      const e = err as Error;
      console.warn('Quiz summary notice:', e.message);
      // Construct dependable local fallback so the card always works
      const incorrectAnswers = results.answers.filter((a) => !a.isCorrect);
      const studyAreas: AreaForStudy[] = [];

      if (incorrectAnswers.length > 0) {
        incorrectAnswers.slice(0, 3).forEach((a) => {
          const q = quiz.questions.find((item) => item.id === a.questionId);
          studyAreas.push({
            topic: q?.domain || 'Target Concept Recall',
            explanation: q ? `Review prompt: "${q.question}". Correct target: "${q.correct_answer}".` : 'Re-examine this question in the review breakdown.',
            needLevel: 'High',
            suggestedAction: 'Consult tutor notes and review definition prior to retaking assessment.',
          });
        });
      } else {
        studyAreas.push({
          topic: 'Advanced Edge Cases & Next-Tier Synthesis',
          explanation: 'All questions were answered with 100% precision. Focus on high-order synthesis and real-world edge cases.',
          needLevel: 'Low',
          suggestedAction: 'Advance to Master difficulty assessments or create custom prompt challenges.',
        });
      }

      const fallbackSummary: QuizSummaryData = {
        synopsis: accuracy === 100
          ? `Outstanding mastery demonstrated on "${quiz.quiz_title}"! You answered all ${results.total} questions with complete conceptual accuracy.`
          : `Solid performance on "${quiz.quiz_title}", answering ${results.score} of ${results.total} questions (${accuracy}%). Core principles are in place, with targeted study recommended on the areas below.`,
        masteryLevel: accuracy === 100 ? 'Exemplary Mastery' : accuracy >= 80 ? 'Proficient Understanding' : 'Developing Competence',
        keyTakeaways: [
          `Demonstrated active analytical recall across ${quiz.quiz_title} core learning competencies.`,
          `Maintained steady assessment pace (${results.timeSpentSeconds ? `${Math.round(results.timeSpentSeconds / 60)}m` : 'self-paced'}).`,
          ...(accuracy >= 75 ? ['Strong foundational grasp of primary terminology and core principles.'] : ['Good persistence navigating diverse multi-format questions.']),
        ],
        areasForStudy: studyAreas,
        quickStudyTip: accuracy >= 80
          ? 'Use spaced repetition intervals (re-testing in 72 hours) to lock newly gained concepts into durable semantic memory.'
          : 'Formulate a 1-sentence personal mental model for each missed question before re-attempting.',
        suggestedNextStep: incorrectAnswers.length > 0
          ? 'Review the highlighted question explanations in the Question Breakdown tab.'
          : 'Claim your verified certificate of completion and proceed to advanced curriculum modules.',
      };
      setSummaryData(fallbackSummary);
      onSummaryLoaded?.(fallbackSummary);
    } finally {
      setIsLoading(false);
    }
  }, [quiz, persona, results, accuracy, onSummaryLoaded]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Handle Speech Synthesis
  const handleToggleSpeech = () => {
    soundFx.playClick();
    if (isSpeaking) {
      speechEngine.stop();
      setIsSpeaking(false);
      return;
    }

    if (!summaryData) return;

    const speechScript = `Quiz synopsis for ${quiz.quiz_title}. ${summaryData.synopsis}. Key takeaways: ${summaryData.keyTakeaways.join('. ')}. Areas that need more study: ${summaryData.areasForStudy.map((a) => `${a.topic}: ${a.explanation}`).join('. ')}. Quick tip: ${summaryData.quickStudyTip}`;

    setIsSpeaking(true);
    speechEngine.speak(speechScript, {
      onEnd: () => setIsSpeaking(false),
    });
  };

  // Handle Copy to Clipboard
  const handleCopySummary = async () => {
    soundFx.playClick();
    if (!summaryData) return;

    const markdown = `# AI Quiz Synopsis: ${quiz.quiz_title}
**Score:** ${results.score}/${results.total} (${accuracy}%)
**Mastery Level:** ${summaryData.masteryLevel}

## Synopsis
${summaryData.synopsis}

## Key Learning Takeaways
${summaryData.keyTakeaways.map((t) => `- ${t}`).join('\n')}

## Areas for More Study
${summaryData.areasForStudy.map((a) => `### ${a.topic} [Priority: ${a.needLevel}]\n${a.explanation}\n*Suggested Action:* ${a.suggestedAction}`).join('\n\n')}

## Strategic Study Tip
${summaryData.quickStudyTip}

*Next Step:* ${summaryData.suggestedNextStep}
`;

    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const getPriorityBadgeClass = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getMasteryColor = (level: string) => {
    if (level.includes('Exemplary') || level.includes('Mastery')) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (level.includes('Proficient')) {
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  };

  // Handle PDF Export
  const handleDownloadPdf = () => {
    soundFx.playClick();
    setIsExportingPdf(true);
    try {
      exportCompletedQuizToPdf(quiz, results, summaryData, {
        studentName: 'Scholar / Learner',
        includeExplanations: true,
        includeTakeaways: true,
        includeAreasForStudy: true,
      });
      soundFx.playCorrect();
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintPdf = () => {
    soundFx.playClick();
    printCompletedQuizPdf(quiz, results, summaryData, {
      studentName: 'Scholar / Learner',
      includeExplanations: true,
      includeTakeaways: true,
      includeAreasForStudy: true,
    });
  };

  return (
    <div
      id="quiz-summary-card"
      className={`comic-panel rounded-3xl bg-white dark:bg-slate-900 overflow-hidden transition-colors ${className}`}
    >
      {/* Top Banner Header */}
      <div className="pattern-halftone p-5 sm:p-6 border-b-2 border-slate-900/15 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-indigo-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 border-2 border-slate-950 text-white flex items-center justify-center shadow-xs shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="comic-badge px-2 py-0.5 rounded-md bg-amber-300 text-slate-950 border border-slate-950 text-[10px] font-black uppercase tracking-wider">
                AI SYNOPSIS
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                AI Quiz Synopsis &amp; Diagnostic
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Gemini 3.8 Flash</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized learning synopsis, verified competencies, and targeted study plan
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap">
          {/* PDF Study Material Download Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isLoading || isExportingPdf}
            title="Download printable study guide PDF with synopsis & questions"
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer"
          >
            <FileDown className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span>PDF Study Guide</span>
          </button>

          {/* Quick Print Button */}
          <button
            type="button"
            onClick={handlePrintPdf}
            disabled={isLoading}
            title="Print or Save as PDF via browser dialog"
            className="p-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleSpeech}
            disabled={isLoading}
            title={isSpeaking ? 'Stop narration' : 'Listen to AI synopsis'}
            className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isSpeaking
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 animate-pulse'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            disabled={isLoading || !summaryData}
            title="Copy synopsis & takeaways"
            className="p-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              fetchSummary();
            }}
            disabled={isLoading}
            title="Regenerate synopsis with Gemini"
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            <span className="hidden lg:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {isLoading ? (
          /* Loading Skeleton */
          <div className="space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
              <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-md" />
              <div className="h-4 w-3/5 bg-slate-200 dark:bg-slate-700 rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="h-32 bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800" />
              <div className="h-32 bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800" />
            </div>
            <div className="text-center pt-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                Gemini is synthesizing assessment takeaways and study priorities...
              </span>
            </div>
          </div>
        ) : error && !summaryData ? (
          /* Error Banner */
          <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Unable to load AI synopsis</p>
              <p className="text-xs">{error}</p>
              <button
                type="button"
                onClick={fetchSummary}
                className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Try again
              </button>
            </div>
          </div>
        ) : summaryData ? (
          /* Rendered Synopsis & Takeaways */
          <div className="space-y-6">
            {/* Synopsis Lead Section */}
            <div className="space-y-3 p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-extrabold tracking-wider uppercase text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Executive Assessment Synopsis
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getMasteryColor(
                    summaryData.masteryLevel
                  )}`}
                >
                  {summaryData.masteryLevel}
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                "{summaryData.synopsis}"
              </p>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1 border-t border-indigo-100/60 dark:border-indigo-900/30 flex-wrap">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  Score: {results.score}/{results.total} ({accuracy}%)
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {results.timeSpentSeconds
                    ? `${Math.floor(results.timeSpentSeconds / 60)}m ${results.timeSpentSeconds % 60}s elapsed`
                    : 'Self-paced completion'}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  Difficulty: {quiz.difficulty || 'Intermediate'}
                </span>
              </div>
            </div>

            {/* Filter Toggle Pill Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All Insights ({summaryData.keyTakeaways.length + summaryData.areasForStudy.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('takeaways')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'takeaways'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Key Takeaways ({summaryData.keyTakeaways.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('study_areas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'study_areas'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Areas to Study ({summaryData.areasForStudy.length})
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Key Learning Takeaways Column */}
              {(filterMode === 'all' || filterMode === 'takeaways') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Key Learning Takeaways
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {summaryData.keyTakeaways.map((takeaway, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                          {idx + 1}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                          {takeaway}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas That Need More Study Column */}
              {(filterMode === 'all' || filterMode === 'study_areas') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <Target className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Areas That Need More Study
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {summaryData.areasForStudy.map((area, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {area.topic}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${getPriorityBadgeClass(
                              area.needLevel
                            )}`}
                          >
                            {area.needLevel} Priority
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {area.explanation}
                        </p>

                        <div className="pt-1.5 flex items-start gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                          <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-500" />
                          <span>Action: {area.suggestedAction}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Strategic Study Tip Callout */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    High-Yield Study Strategy
                  </span>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    {summaryData.quickStudyTip}
                  </p>
                </div>
              </div>

              {summaryData.suggestedNextStep && (
                <div className="sm:self-center shrink-0 w-full sm:w-auto">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Next:</span> {summaryData.suggestedNextStep}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
