import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Award,
  Sliders,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import {
  PersonaType,
  UserStats,
  QuizRecommendation,
  QuizResponse,
  DifficultyType,
  QuestionType,
} from '../types/quiz';
import { QuizHistoryRecord } from './HistoryView';
import { QuizTrackDetailDrawer, SelectedTrackInfo } from './QuizTrackDetailDrawer';
import { soundFx } from '../utils/audio';

interface RecommendedQuizzesSectionProps {
  persona: PersonaType;
  stats: UserStats;
  historyRecords: QuizHistoryRecord[];
  onStartQuiz: (quiz: QuizResponse) => void;
  onCustomizeTopic?: (prompt: string, difficulty: DifficultyType, types: QuestionType[]) => void;
  compact?: boolean;
}

export const RecommendedQuizzesSection: React.FC<RecommendedQuizzesSectionProps> = ({
  persona,
  stats,
  historyRecords,
  onStartQuiz,
  onCustomizeTopic,
  compact = false,
}) => {
  const [recommendations, setRecommendations] = useState<QuizRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Remediation' | 'Progression' | 'Reinforcement'>('ALL');
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<SelectedTrackInfo | null>(null);

  const handleOpenRecDetail = (rec: QuizRecommendation) => {
    soundFx.playSelect();
    const quizData = rec.prebuiltQuiz || {
      app_name: 'Quiz Me!' as const,
      persona,
      quiz_title: rec.title,
      summary: `${rec.description} Diagnostic context: ${rec.matchReason}`,
      difficulty: rec.difficulty,
      pedagogical_topic: rec.targetDomain,
      questions: [
        {
          id: 1,
          type: 'multiple_choice' as const,
          question: `Key concept in ${rec.topic}: ${rec.matchReason}`,
          correct_answer: rec.topic,
          explanation: `${rec.description}. Focused review of this topic reinforces mastery before the quiz.`,
          gamified_feedback: { success_quote: 'Great focus on key principles!', hint: 'Review foundational definitions.' },
        },
      ],
    };

    setSelectedTrackForDetail({
      id: rec.id,
      title: rec.title,
      description: rec.description,
      category: rec.targetDomain,
      pedagogical_topic: rec.targetDomain,
      inputText: `${rec.description}\n\nKey Focus Areas: ${rec.topic}\nDiagnostic Need: ${rec.matchReason}\n\nStudy Syllabus:\n${rec.samplePrompt}`,
      quiz: quizData as QuizResponse,
    });
  };

  const fetchRecommendations = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
      soundFx.playClick();
    } else {
      setIsLoading(true);
    }
    setErrorNotice(null);

    try {
      // Package recent quiz performances & weak questions
      const recentQuizzesPayload = historyRecords.slice(0, 8).map((rec) => {
        const weakAnswers = (rec.answers || [])
          .filter((a) => !a.isCorrect)
          .map((a) => {
            const matchedQ = rec.quizData?.questions?.find((q) => q.id === a.questionId);
            return {
              questionText: matchedQ?.question || 'Question concept',
              userAnswer: a.userAnswer,
              correctAnswer: matchedQ?.correct_answer || 'Expected answer',
              domain: matchedQ?.domain,
              explanation: matchedQ?.explanation || '',
            };
          });

        return {
          quizTitle: rec.quizTitle,
          score: rec.score,
          total: rec.total,
          percentage: rec.percentage,
          difficulty: rec.difficulty,
          weakQuestions: weakAnswers,
          studyGuideReview: rec.quizData?.study_guide?.recommended_review,
          tags: rec.quizData?.tags,
        };
      });

      const response = await fetch('/api/recommended-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          stats: {
            quizzesCompleted: stats.quizzesCompleted,
            totalCorrect: stats.totalCorrect,
            totalQuestions: stats.totalQuestions,
            xp: stats.xp,
            level: stats.level,
            streak: stats.streak,
          },
          recentQuizzes: recentQuizzesPayload,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }
    } catch (err: unknown) {
      console.warn('Could not load AI recommendations from server:', err);
      // Fallback in-memory recommendations
      setRecommendations([
        {
          id: 'rec_async_closures',
          title: 'JavaScript Event Loop & Microtask Queues',
          topic: 'JavaScript Concurrency Model & Promise Resolution Order',
          description: 'Strengthen mental models on how the Call Stack, Macro/Microtask Queues, and Promises execute in order.',
          difficulty: 'Intermediate',
          targetDomain: 'Syntax & Execution',
          reasonCategory: 'Remediation',
          matchReason: 'Pedagogical Diagnostic: Identified need for precision in asynchronous order of execution and edge cases.',
          suggestedQuestionCount: 4,
          suggestedTypes: ['multiple_choice', 'code_media_challenge', 'fill_in_blank'],
          estimatedMinutes: 4,
          xpReward: 120,
          icon: '⚡',
          samplePrompt: 'Focus on the JavaScript event loop, microtasks (Promise.then, queueMicrotask) vs macrotasks (setTimeout, setInterval), execution order, and async/await subtleties.',
        },
        {
          id: 'rec_photosynthesis_biochem',
          title: 'Cellular Respiration vs Photosynthesis Pathways',
          topic: 'Calvin Cycle, ATP Synthase, and Chemiosmosis',
          description: 'Master electron transport chains, light-independent Calvin cycle carbon fixation, and cellular energy synthesis.',
          difficulty: 'Intermediate',
          targetDomain: 'Analytical Reasoning',
          reasonCategory: 'Remediation',
          matchReason: 'Pedagogical Diagnostic: Reinforces complex biochemical pathways and energy transformation concepts.',
          suggestedQuestionCount: 4,
          suggestedTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
          estimatedMinutes: 5,
          xpReward: 140,
          icon: '🌿',
          samplePrompt: 'Focus on the light-dependent reactions of photosynthesis, the Calvin-Benson cycle, NADPH generation, proton gradients, and ATP synthase mechanics.',
        },
        {
          id: 'rec_recursion_complexity',
          title: 'Algorithmic Complexity & Recursive Branching',
          topic: 'Big-O Asymptotics and Divide & Conquer Recurrences',
          description: 'Deepen analytical understanding of call-stack space complexity and Master Theorem runtime bounds.',
          difficulty: 'Master',
          targetDomain: 'Applied Logic',
          reasonCategory: 'Progression',
          matchReason: 'Growth Path: Advance your cognitive depth into higher-order algorithmic problem solving and recursion.',
          suggestedQuestionCount: 5,
          suggestedTypes: ['code_media_challenge', 'open_explanation', 'multiple_choice'],
          estimatedMinutes: 6,
          xpReward: 180,
          icon: '🧠',
          samplePrompt: 'Focus on recursive algorithms, tree traversals, call-stack frame allocations, recurrence relations, and Big-O / Big-Theta complexity calculations.',
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [persona, stats, historyRecords]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleLaunchRecommendation = async (rec: QuizRecommendation) => {
    soundFx.playClick();
    setLaunchingId(rec.id);
    setErrorNotice(null);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: rec.samplePrompt,
          persona,
          questionTypes: rec.suggestedTypes,
          difficulty: rec.difficulty,
          questionCount: rec.suggestedQuestionCount || 4,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate tailored quiz.');
      }

      soundFx.playComplete();
      onStartQuiz(data.quiz);
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Direct launch fallback:', error);
      setErrorNotice(`Could not generate real-time quiz: ${error.message}. You can customize this prompt in the Studio.`);
    } finally {
      setLaunchingId(null);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return r.reasonCategory === activeFilter;
  });

  const remediationCount = recommendations.filter((r) => r.reasonCategory === 'Remediation').length;

  return (
    <div
      id="ai-recommended-quizzes-section"
      className="rounded-3xl border border-indigo-100 dark:border-indigo-950/80 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-5 sm:p-7 shadow-xs space-y-5 transition-colors"
    >
      {/* Section Header with Diagnostics Badge & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Recommended Quizzes
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              For You
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Personalized topics based on your recent quiz scores, missed questions, and study progress.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="refresh-ai-recommendations-btn"
            disabled={isLoading || isRefreshing}
            onClick={() => fetchRecommendations(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Finding quizzes...' : 'Refresh Suggestions'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      {!compact && recommendations.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: `All (${recommendations.length})` },
            { id: 'Remediation', label: `Needs Review (${remediationCount})`, isAlert: remediationCount > 0 },
            { id: 'Progression', label: 'Next Level' },
            { id: 'Reinforcement', label: 'Practice Again' },
          ].map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveFilter(tab.id as 'ALL' | 'Remediation' | 'Progression' | 'Reinforcement');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Error Alert */}
      {errorNotice && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3">
          <span>{errorNotice}</span>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="text-rose-700 dark:text-rose-300 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => {
            const isLaunching = launchingId === rec.id;
            const isRemediation = rec.reasonCategory === 'Remediation';
            const isProgression = rec.reasonCategory === 'Progression';

            return (
              <div
                key={rec.id}
                id={`rec-card-${rec.id}`}
                className={`rounded-2xl p-5 border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 relative overflow-hidden ${
                  isRemediation
                    ? 'border-amber-200 dark:border-amber-900/60'
                    : isProgression
                    ? 'border-indigo-200 dark:border-indigo-900/60'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Accent top stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isRemediation
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : isProgression
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                />

                <div className="space-y-3">
                  {/* Top Badges & Meta */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{rec.icon || '⚡'}</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isRemediation
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : isProgression
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {isRemediation ? 'Needs Improvement' : isProgression ? 'Growth Level-Up' : 'Core Retention'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rec.difficulty}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{rec.targetDomain}</span>
                    </div>
                  </div>

                  {/* Title & Topic */}
                  <div
                    onClick={() => handleOpenRecDetail(rec)}
                    className="cursor-pointer group/title"
                    title="Click to view Key Takeaways & review source material"
                  >
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {rec.topic}
                    </p>
                  </div>

                  {/* Pedagogical Diagnostic Reason Banner */}
                  <div
                    className={`p-3 rounded-xl text-xs space-y-0.5 border ${
                      isRemediation
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200'
                        : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Diagnostic Rationale</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-medium">
                      {rec.matchReason}
                    </p>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>
                </div>

                {/* Card Footer: Metrics & Action Buttons */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>~{rec.estimatedMinutes} min</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.suggestedQuestionCount} questions</span>
                      </span>
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                      +{rec.xpReward} XP
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenRecDetail(rec)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs hover:shadow-xs"
                    title="Review AI-generated key takeaways & source summary before starting"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Key Takeaways & Review</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {onCustomizeTopic && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          onCustomizeTopic(rec.samplePrompt, rec.difficulty, rec.suggestedTypes);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
                        title="Customize in Studio before generating"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isLaunching}
                      onClick={() => handleLaunchRecommendation(rec)}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isRemediation
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                      }`}
                    >
                      {isLaunching ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating AI Quiz...</span>
                        </>
                      ) : (
                        <>
                          <span>Start Targeted Quiz</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRecs.length === 0 && (
        <div className="text-center py-8 space-y-2 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            No specific weaknesses found in this filter!
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Take a few new quizzes across different subjects to refresh your diagnostic learning profile.
          </p>
        </div>
      )}

      {/* QuizTrack Detail Drawer with AI Key Takeaways Summary Section */}
      <QuizTrackDetailDrawer
        isOpen={!!selectedTrackForDetail}
        onClose={() => setSelectedTrackForDetail(null)}
        track={selectedTrackForDetail}
        persona={persona}
        onStartQuiz={(quiz) => {
          if (selectedTrackForDetail) {
            const matchedRec = recommendations.find((r) => r.id === selectedTrackForDetail.id);
            if (matchedRec) {
              handleLaunchRecommendation(matchedRec);
            } else {
              onStartQuiz(quiz);
            }
          } else {
            onStartQuiz(quiz);
          }
        }}
      />
    </div>
  );
};
