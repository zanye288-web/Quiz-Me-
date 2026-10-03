import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Award,
  Sliders,
  HelpCircle,
  BookOpen,
  Bot,
  Cloud,
  ChevronRight,
  Flame,
  XCircle,
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
import { MascotAvatar, MascotMood } from './MascotAvatar';
import { soundFx } from '../utils/audio';

interface RecommendedQuizzesSectionProps {
  persona: PersonaType;
  stats: UserStats;
  historyRecords: QuizHistoryRecord[];
  onStartQuiz: (quiz: QuizResponse) => void;
  onCustomizeTopic?: (prompt: string, difficulty: DifficultyType, types: QuestionType[]) => void;
  onOpenTutor?: (questionId?: number) => void;
  compact?: boolean;
}

interface WeakTopicAnalysis {
  topic: string;
  lowestScore: number;
  averageScore: number;
  attemptsCount: number;
  missedQuestionsCount: number;
  missedQuestionSamples: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    domain?: string;
  }>;
  latestDate: string;
}

export const RecommendedQuizzesSection: React.FC<RecommendedQuizzesSectionProps> = ({
  persona,
  stats,
  historyRecords,
  onStartQuiz,
  onCustomizeTopic,
  onOpenTutor,
  compact = false,
}) => {
  const [recommendations, setRecommendations] = useState<QuizRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'LOWEST' | 'ALL' | 'Remediation' | 'Progression' | 'Reinforcement'>('LOWEST');
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<SelectedTrackInfo | null>(null);

  // =========================================================================
  // 1. EXTRACT & ANALYZE LOWEST SCORING TOPICS FROM FIRESTORE HISTORY
  // =========================================================================
  const weakTopicsAnalysis = useMemo(() => {
    if (!historyRecords || historyRecords.length === 0) {
      return {
        lowestTopics: [] as WeakTopicAnalysis[],
        lowestOverallQuiz: null as QuizHistoryRecord | null,
        overallAverage: 0,
        hasLowScores: false,
      };
    }

    // Sort quizzes by percentage ascending to find the absolute lowest scoring assessments
    const sortedByLowest = [...historyRecords].sort((a, b) => a.percentage - b.percentage);
    const lowestOverallQuiz = sortedByLowest[0];

    const totalPercentage = historyRecords.reduce((acc, r) => acc + r.percentage, 0);
    const overallAverage = Math.round(totalPercentage / historyRecords.length);

    // Group records by quiz title or topic
    const topicMap = new Map<string, {
      scores: number[];
      records: QuizHistoryRecord[];
      missed: Array<{
        question: string;
        userAnswer: string;
        correctAnswer: string;
        domain?: string;
      }>;
    }>();

    historyRecords.forEach((record) => {
      const topicName = record.quizTitle || 'General Assessment';
      const existing = topicMap.get(topicName) || { scores: [], records: [], missed: [] };
      existing.scores.push(record.percentage);
      existing.records.push(record);

      // Collect missed questions
      if (record.answers && Array.isArray(record.answers)) {
        record.answers
          .filter((a) => !a.isCorrect)
          .forEach((a) => {
            const matchedQ = record.quizData?.questions?.find((q) => q.id === a.questionId);
            if (matchedQ) {
              existing.missed.push({
                question: matchedQ.question || 'Concept question',
                userAnswer: a.userAnswer || 'Incorrect answer',
                correctAnswer: matchedQ.correct_answer || 'Correct solution',
                domain: matchedQ.domain,
              });
            }
          });
      }

      topicMap.set(topicName, existing);
    });

    const analyzedTopics: WeakTopicAnalysis[] = [];
    topicMap.forEach((data, topic) => {
      const minScore = Math.min(...data.scores);
      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      const latest = data.records[0]?.date || 'Recently';

      analyzedTopics.push({
        topic,
        lowestScore: minScore,
        averageScore: avgScore,
        attemptsCount: data.scores.length,
        missedQuestionsCount: data.missed.length,
        missedQuestionSamples: data.missed.slice(0, 3),
        latestDate: latest,
      });
    });

    // Sort topics by lowestScore ascending
    analyzedTopics.sort((a, b) => a.lowestScore - b.lowestScore);

    // Consider lowest topics as those under 80%, or the bottom 3 topics if all are high
    const topicsNeedingRemediation = analyzedTopics.filter((t) => t.lowestScore < 80);
    const hasLowScores = topicsNeedingRemediation.length > 0;

    return {
      lowestTopics: hasLowScores ? topicsNeedingRemediation : analyzedTopics.slice(0, 2),
      lowestOverallQuiz,
      overallAverage,
      hasLowScores,
    };
  }, [historyRecords]);

  // Handle opening preview takeaways
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

  // =========================================================================
  // 2. FETCH RECOMMENDATIONS (SENDING LOWEST SCORING TOPICS FIRST)
  // =========================================================================
  const fetchRecommendations = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
      soundFx.playClick();
    } else {
      setIsLoading(true);
    }
    setErrorNotice(null);

    try {
      // Sort history records by percentage ASC so lowest scoring topics are prioritized
      const sortedHistory = [...historyRecords].sort((a, b) => a.percentage - b.percentage);

      const payloadQuizzes = sortedHistory.slice(0, 8).map((rec) => {
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
          recentQuizzes: payloadQuizzes,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }
    } catch (err: unknown) {
      console.warn('Using client-side adaptive recommendations:', err);

      // Build targeted recommendations directly from Firestore history records
      const adaptiveRecs: QuizRecommendation[] = [];

      // 1. If user has low scoring topics, create direct remediation challenges
      if (weakTopicsAnalysis.lowestTopics.length > 0 && weakTopicsAnalysis.hasLowScores) {
        weakTopicsAnalysis.lowestTopics.slice(0, 2).forEach((wt, idx) => {
          const sampleQ = wt.missedQuestionSamples[0]?.question || `Key fundamentals in ${wt.topic}`;
          adaptiveRecs.push({
            id: `rec_remediation_firestore_${idx}`,
            title: `${wt.topic}: Targeted Remediation`,
            topic: `${wt.topic} - Knowledge Gap Recovery`,
            description: `Targeted practice to address missed questions and master core principles where you scored ${wt.lowestScore}%.`,
            difficulty: (wt.lowestScore < 50 ? 'Beginner' : 'Intermediate') as DifficultyType,
            targetDomain: 'Targeted Remediation',
            reasonCategory: 'Remediation',
            matchReason: `Identified from Firestore performance: lowest score of ${wt.lowestScore}% in "${wt.topic}" with ${wt.missedQuestionsCount} missed questions.`,
            suggestedQuestionCount: 4,
            suggestedTypes: ['multiple_choice', 'fill_in_blank'],
            estimatedMinutes: 4,
            xpReward: 140,
            icon: '🎯',
            samplePrompt: `Remediation quiz on ${wt.topic}. Address missed concepts: "${sampleQ}". Focus on clear explanations and step-by-step reasoning.`,
          });
        });
      }

      // 2. Add high-yield foundational & progression tracks to round out 4 recommendations
      adaptiveRecs.push(
        {
          id: 'rec_js_event_loop',
          title: 'JavaScript Event Loop & Microtask Queues',
          topic: 'JavaScript Concurrency Model & Promise Resolution',
          description: 'Strengthen mental models on how the Call Stack, Microtasks, and Promises execute in order.',
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
          title: 'Cellular Respiration vs Photosynthesis',
          topic: 'Calvin Cycle, ATP Synthase, and Chemiosmosis',
          description: 'Master electron transport chains, light-independent carbon fixation, and cellular energy synthesis.',
          difficulty: 'Intermediate',
          targetDomain: 'Analytical Reasoning',
          reasonCategory: 'Reinforcement',
          matchReason: 'Active Recall: Reinforce biochemical pathways and energy transformation concepts.',
          suggestedQuestionCount: 4,
          suggestedTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
          estimatedMinutes: 5,
          xpReward: 130,
          icon: '🌿',
          samplePrompt: 'Focus on the light-dependent reactions of photosynthesis, the Calvin cycle, NADPH generation, proton gradients, and ATP synthase mechanics.',
        },
        {
          id: 'rec_algorithmic_complexity',
          title: 'Algorithmic Complexity & Recursion',
          topic: 'Big-O Asymptotics and Divide & Conquer Recurrences',
          description: 'Deepen analytical understanding of call-stack space complexity and runtime bounds.',
          difficulty: 'Master',
          targetDomain: 'Applied Logic',
          reasonCategory: 'Progression',
          matchReason: 'Growth Milestone: Advance cognitive depth into higher-order algorithmic problem solving.',
          suggestedQuestionCount: 5,
          suggestedTypes: ['code_media_challenge', 'open_explanation', 'multiple_choice'],
          estimatedMinutes: 6,
          xpReward: 180,
          icon: '🧠',
          samplePrompt: 'Focus on recursive algorithms, tree traversals, call-stack frame allocations, recurrence relations, and Big-O / Big-Theta complexity calculations.',
        }
      );

      setRecommendations(adaptiveRecs.slice(0, 4));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [persona, stats, historyRecords, weakTopicsAnalysis]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Launch a recommendation
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

  // Filter recommendations
  const filteredRecs = recommendations.filter((r) => {
    if (activeFilter === 'LOWEST') {
      return r.reasonCategory === 'Remediation' || r.matchReason.toLowerCase().includes('lowest');
    }
    if (activeFilter === 'ALL') return true;
    return r.reasonCategory === activeFilter;
  });

  const remediationCount = recommendations.filter((r) => r.reasonCategory === 'Remediation').length;

  // Mascot dynamic mood
  const mascotMood: MascotMood = weakTopicsAnalysis.hasLowScores
    ? 'comforting'
    : stats.streak > 3
    ? 'streak'
    : 'thinking';

  // Mascot wisdom message
  const mascotAdvice = useMemo(() => {
    if (weakTopicsAnalysis.hasLowScores && weakTopicsAnalysis.lowestTopics[0]) {
      const lowest = weakTopicsAnalysis.lowestTopics[0];
      return `Spark on! I analyzed your Firestore history. You scored lowest on "${lowest.topic}" (${lowest.lowestScore}%). Let's review it now to turn this weak spot into mastery!`;
    }
    if (historyRecords.length > 0 && weakTopicsAnalysis.overallAverage >= 90) {
      return `Phenomenal performance! You have a ${weakTopicsAnalysis.overallAverage}% average in Firestore. Here are next-level challenge quizzes to test your limits!`;
    }
    return `Welcome to Quiz Me! Take an assessment to unlock personalized recommendations based on your lowest scoring topics in Firestore.`;
  }, [weakTopicsAnalysis, historyRecords]);

  return (
    <div
      id="ai-recommended-quizzes-section"
      className="rounded-3xl border border-indigo-100 dark:border-indigo-950/80 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-5 sm:p-7 shadow-xs space-y-5 transition-colors"
    >
      {/* Section Header with Quizzie Mascot Companion & Firestore Live Sync Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <MascotAvatar
            mood={mascotMood}
            size="md"
            showSpeechBubble={false}
            className="shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Recommended for You
              </h3>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Adaptive AI
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                <Cloud className="w-3 h-3 text-emerald-500" />
                Firestore Synced
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Tailored quizzes targeting your lowest-scoring topics and conceptual gaps from your Firestore performance history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            id="refresh-ai-recommendations-btn"
            disabled={isLoading || isRefreshing}
            onClick={() => fetchRecommendations(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
            title="Refresh recommendations based on your latest Firestore assessments"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Analyzing history...' : 'Refresh Suggestions'}</span>
          </button>
        </div>
      </div>

      {/* Quizzie Mascot Diagnostic Callout Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-850/90 border border-indigo-100/90 dark:border-indigo-900/60 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-900">
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 mr-1.5">
              Quizzie's Insight:
            </span>
            {mascotAdvice}
          </div>
        </div>

        {onOpenTutor && weakTopicsAnalysis.hasLowScores && (
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenTutor();
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer shrink-0 border border-indigo-200/60 dark:border-indigo-800/60"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-500" />
            <span>Ask Tutor</span>
          </button>
        )}
      </div>

      {/* Lowest Scoring Topics Diagnostic Pills (If user has history in Firestore) */}
      {historyRecords.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-500" />
              Past Performance Breakdown (from Firestore):
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              {historyRecords.length} {historyRecords.length === 1 ? 'quiz' : 'quizzes'} evaluated
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {weakTopicsAnalysis.lowestTopics.map((topic, i) => {
              const isCriticallyLow = topic.lowestScore < 60;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    isCriticallyLow
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
                  }`}
                  title={`${topic.attemptsCount} attempts, ${topic.missedQuestionsCount} total missed questions`}
                >
                  <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isCriticallyLow ? 'text-rose-600' : 'text-amber-600'}`} />
                  <span className="truncate max-w-[200px]">{topic.topic}</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-white/80 dark:bg-slate-900/80">
                    Lowest: {topic.lowestScore}%
                  </span>
                </div>
              );
            })}

            {weakTopicsAnalysis.lowestTopics.length === 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>All topics mastered at 80%+ accuracy!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {!compact && recommendations.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'LOWEST', label: `🎯 Lowest Scoring Topics (${remediationCount})` },
            { id: 'ALL', label: `All Quizzes (${recommendations.length})` },
            { id: 'Remediation', label: 'Needs Review' },
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
                  setActiveFilter(tab.id as 'LOWEST' | 'ALL' | 'Remediation' | 'Progression' | 'Reinforcement');
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

      {/* Recommended Quizzes Cards Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => {
            const isLaunching = launchingId === rec.id;
            const isRemediation = rec.reasonCategory === 'Remediation' || rec.matchReason.toLowerCase().includes('lowest');
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
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isRemediation
                      ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-orange-400'
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
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isRemediation
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : isProgression
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {isRemediation ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span>Lowest Scoring Remediation</span>
                          </>
                        ) : isProgression ? (
                          <span>Growth Level-Up</span>
                        ) : (
                          <span>Core Retention</span>
                        )}
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
                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-950 dark:text-rose-200'
                        : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-[10px] uppercase tracking-wider text-rose-800 dark:text-rose-300">
                      <Target className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>Why This is Recommended</span>
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
                          <span>Generating Remediation Quiz...</span>
                        </>
                      ) : (
                        <>
                          <span>Start Remediation Quiz</span>
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
        <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            No specific weak spots found in this filter!
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You're performing well across these topics. Switch to "All Quizzes" or take a new diagnostic assessment to test advanced material.
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs"
          >
            Show All Suggestions
          </button>
        </div>
      )}

      {/* Slide-Over Track Detail Drawer for Deep-Dive Takeaways */}
      {selectedTrackForDetail && (
        <QuizTrackDetailDrawer
          track={selectedTrackForDetail}
          persona={persona}
          onClose={() => setSelectedTrackForDetail(null)}
          onStartQuiz={(quiz) => {
            setSelectedTrackForDetail(null);
            onStartQuiz(quiz);
          }}
          onCustomizeTopic={onCustomizeTopic}
        />
      )}
    </div>
  );
};
