import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  FileCode,
  Copy,
  Check,
  Download,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Layers,
  Flag,
  Award,
  Filter,
  CheckSquare,
  ShieldCheck,
  BrainCircuit,
  Volume2,
  VolumeX,
  Printer,
  Video,
  Bot,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { QuizResponse, PersonaType, UserStats, CognitiveDomain } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { triggerPerfectScoreConfetti, triggerStandardConfetti } from '../utils/confetti';
import { PerfectScoreCelebration } from './PerfectScoreCelebration';
import { OfficialCertificateModal } from './OfficialCertificateModal';
import { FlashcardStudyDeck } from './FlashcardStudyDeck';
import { PedagogicalSummary } from './PedagogicalSummary';
import { QuizSummaryCard, QuizSummaryData } from './QuizSummaryCard';
import { QuizExportModal } from './QuizExportModal';
import { MascotAvatar } from './MascotAvatar';
import { classifyAudience, AUDIENCE_TIER_CONFIG } from '../utils/audienceClassifier';
import { StudyRecommendationsHub } from './StudyRecommendationsHub';
import { MistakeAnalysisReport, IntelligentNote, MistakeAnalysisItem } from '../types/learningSystem';
import { QuizMistakesDiagnosticsView } from './QuizMistakesDiagnosticsView';
import { IntelligentNotesViewer } from './IntelligentNotesViewer';
import { IntelligentNotesGeneratorModal } from './IntelligentNotesGeneratorModal';
import { IntelligentTutorDrawer } from './IntelligentTutorDrawer';

interface QuizCompleteProps {
  quiz: QuizResponse;
  persona: PersonaType;
  stats: UserStats;
  results: {
    score: number;
    total: number;
    xpEarned: number;
    gemsEarned: number;
    timeSpentSeconds?: number;
    flaggedIds?: number[];
    answers: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  };
  onRestartQuiz: () => void;
  onNewQuiz: () => void;
  onOpenJsonView: () => void;
  onOpenTutor?: (questionId?: number) => void;
}

export const QuizComplete: React.FC<QuizCompleteProps> = ({
  quiz,
  persona,
  stats,
  results,
  onRestartQuiz,
  onNewQuiz,
  onOpenJsonView,
  onOpenTutor,
}) => {
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'review' | 'matrix' | 'study_guide' | 'flashcards' | 'recommendations' | 'diagnostics' | 'notes'>('review');
  const [itemFilter, setItemFilter] = useState<'all' | 'incorrect' | 'flagged'>('all');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportInitialTab, setExportInitialTab] = useState<'pdf' | 'docs' | 'json' | 'markdown'>('pdf');
  const [summaryData, setSummaryData] = useState<QuizSummaryData | null>(null);
  const [showFullDeckModal, setShowFullDeckModal] = useState<boolean>(false);
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);
  const [speakingReviewId, setSpeakingReviewId] = useState<number | null>(null);

  // Feature 1: Intelligent Learning System States
  const [mistakeReport, setMistakeReport] = useState<MistakeAnalysisReport | null>(null);
  const [isLoadingMistakes, setIsLoadingMistakes] = useState<boolean>(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState<boolean>(false);
  const [currentIntelligentNote, setCurrentIntelligentNote] = useState<IntelligentNote | null>(null);
  const [isTutorDrawerOpen, setIsTutorDrawerOpen] = useState<boolean>(false);
  const [tutorInitialQuery, setTutorInitialQuery] = useState<string>('');
  const [tutorActiveQuestion, setTutorActiveQuestion] = useState<(typeof quiz.questions)[0] | null>(null);

  const accuracy = Math.round((results.score / results.total) * 100);
  const isPerfectScore = accuracy === 100 && results.total > 0;
  const flaggedSet = new Set(results.flaggedIds || []);

  useEffect(() => {
    const unsub = speechEngine.subscribeState((speaking, currentId) => {
      if (!speaking) {
        setSpeakingReviewId(null);
      }
    });
    return () => {
      unsub();
      speechEngine.stop();
    };
  }, []);

  const handleSpeakReviewItem = (q: (typeof quiz.questions)[0]) => {
    soundFx.playClick();
    if (speakingReviewId === q.id) {
      speechEngine.stop();
      setSpeakingReviewId(null);
      return;
    }

    setSpeakingReviewId(q.id);
    const text = `Question: ${q.question}. Target correct answer: ${q.correct_answer}. Explanation: ${q.explanation}`;
    speechEngine.speak(text, {
      id: `review_q_${q.id}`,
      onEnd: () => setSpeakingReviewId(null),
      onError: () => setSpeakingReviewId(null),
    });
  };

  useEffect(() => {
    if (isPerfectScore) {
      soundFx.playBadgeUnlock();
      triggerPerfectScoreConfetti();
    } else {
      soundFx.playComplete();
      triggerStandardConfetti();
    }
  }, [isPerfectScore]);

  // Automatically trigger Mistake Diagnostics analysis if there are missed questions
  useEffect(() => {
    const missedQuestions = quiz.questions
      .map((q) => {
        const userAns = results.answers.find((a) => a.questionId === q.id);
        const isCorrect = userAns?.isCorrect ?? false;
        return {
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
          userAnswer: userAns?.userAnswer || '(no answer)',
          explanation: q.explanation,
          domain: q.domain,
          isCorrect,
        };
      });

    if (results.score < results.total) {
      setIsLoadingMistakes(true);
      fetch('/api/analyze-mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizTitle: quiz.quiz_title,
          totalQuestions: results.total,
          score: results.score,
          questions: missedQuestions,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.analysis) {
            setMistakeReport(data.analysis);
          }
        })
        .catch((err) => {
          console.warn('Mistake diagnostics non-fatal error:', err);
        })
        .finally(() => {
          setIsLoadingMistakes(false);
        });
    }
  }, [quiz, results]);

  const handleCopyJson = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(JSON.stringify(quiz, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    soundFx.playClick();
    const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.quiz_title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_assessment.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Domain & Bloom Breakdown Calculation
  const domainStats: Record<string, { total: number; correct: number }> = {};
  const bloomStats: Record<string, { total: number; correct: number }> = {};

  quiz.questions.forEach((q) => {
    const domain = q.domain || 'General Knowledge';
    const bloom = q.bloom_level || 'Understand';
    const ans = results.answers.find((a) => a.questionId === q.id);
    const isCorrect = ans?.isCorrect ?? false;

    if (!domainStats[domain]) domainStats[domain] = { total: 0, correct: 0 };
    domainStats[domain].total += 1;
    if (isCorrect) domainStats[domain].correct += 1;

    if (!bloomStats[bloom]) bloomStats[bloom] = { total: 0, correct: 0 };
    bloomStats[bloom].total += 1;
    if (isCorrect) bloomStats[bloom].correct += 1;
  });

  const filteredQuestions = quiz.questions.filter((q) => {
    const ans = results.answers.find((a) => a.questionId === q.id);
    const isCorrect = ans?.isCorrect ?? false;
    if (itemFilter === 'incorrect') return !isCorrect;
    if (itemFilter === 'flagged') return flaggedSet.has(q.id);
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-in fade-in duration-300">
      {/* 100% Perfect Score Celebration Banner */}
      {isPerfectScore && (
        <PerfectScoreCelebration
          score={results.score}
          total={results.total}
          xpEarned={results.xpEarned}
        />
      )}

      {/* Quiz Summary Header Card with Mascot Companion */}
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 max-w-2xl min-w-0">
            <MascotAvatar
              mood={isPerfectScore ? 'streak' : accuracy >= 70 ? 'happy' : 'comforting'}
              size="md"
            />
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isPerfectScore ? '🌟 100% Perfection!' : accuracy >= 80 ? '🎉 High Score!' : 'Quiz Complete!'}</span>
                </div>

                {(() => {
                  const tier = classifyAudience(quiz);
                  const tierCfg = AUDIENCE_TIER_CONFIG[tier];
                  return (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${tierCfg.badgeBg} ${tierCfg.badgeBorder} ${tierCfg.badgeText}`}
                    >
                      <span>{tierCfg.emoji}</span>
                      <span>{tierCfg.shortLabel}</span>
                    </span>
                  );
                })()}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isPerfectScore
                  ? 'Phenomenal! Flawless Mastery!'
                  : accuracy >= 80
                  ? 'Superb work! You nailed it!'
                  : accuracy >= 60
                  ? 'Good effort! Keep expanding your knowledge!'
                  : 'Great practice session! Review and grow!'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed truncate">
                Quiz: <span className="font-bold text-slate-900 dark:text-slate-100">{quiz.quiz_title}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {results.score}/{results.total}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Score
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {accuracy}%
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Accuracy
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playComplete();
                setShowCertificateModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Questions Correct
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {results.score} / {results.total}
          </div>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {accuracy >= 75 ? 'Passed' : 'Needs practice'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            XP Earned
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            +{results.xpEarned || 80} XP
          </div>
          <p className="text-xs font-bold text-slate-500">Scholar Points</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Time Taken
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {results.timeSpentSeconds ? `${Math.floor(results.timeSpentSeconds / 60)}m ${results.timeSpentSeconds % 60}s` : 'Self-Paced'}
          </div>
          <p className="text-xs font-bold text-slate-500">Duration</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Flagged Questions
          </span>
          <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
            <Flag className="w-5 h-5 fill-amber-500" />
            <span>{flaggedSet.size}</span>
          </div>
          <p className="text-xs font-bold text-slate-500">Marked to Review</p>
        </div>
      </div>

      {/* AI Synopsis & Learning Takeaways Card */}
      <QuizSummaryCard
        quiz={quiz}
        persona={persona}
        results={results}
        onSummaryLoaded={setSummaryData}
      />

      {/* AI Pedagogical Performance Diagnostic Summary */}
      <PedagogicalSummary
        quiz={quiz}
        persona={persona}
        results={results}
      />

      {/* Personalized Study Plan & 1-on-1 AI Tutor Banner */}
      <div className="rounded-3xl p-5 sm:p-6 border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-pink-50/70 dark:from-slate-900 dark:via-indigo-950/40 dark:to-purple-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Personalized Learning Pathway
              </span>
              <span className="text-xs font-bold text-slate-500">
                Videos • Websites • Documents • 1-on-1 AI Tutor
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Targeted Study Sources & AI Tutor Ready
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              We analyzed what you passed and missed. Explore curated resources or have Quizzie tutor you step-by-step with analogies!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFx.playSelect();
            setActiveTab('recommendations');
          }}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <Bot className="w-4 h-4" />
          <span>Explore Sources & Tutor</span>
        </button>
      </div>

      {/* Tabs: Breakdown, Matrix, Study Guide, Flashcards, Recommendations */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setActiveTab('review');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'review'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Question Breakdown ({quiz.questions.length})
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('recommendations');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'recommendations'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs font-extrabold'
                  : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Study Sources & AI Tutor</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold">
                New
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('matrix');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Topic Performance</span>
            </button>


            {quiz.study_guide && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('study_guide');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'study_guide'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <span>Study Guide</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('flashcards');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'flashcards'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Flashcards
            </button>

            {/* Feature 1: AI Mistakes Diagnostics Tab */}
            {results.score < results.total && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('diagnostics');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'diagnostics'
                    ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Mistake Diagnostics</span>
                {isLoadingMistakes && <RefreshCw className="w-3 h-3 animate-spin" />}
              </button>
            )}

            {/* Feature 1: Intelligent Notes Tab */}
            {currentIntelligentNote && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('notes');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Study Notes</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Create Intelligent Notes Button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsNotesModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Create Notes</span>
            </button>
            {/* Primary Action: Export Printable PDF */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setExportInitialTab('pdf');
                setShowExportModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Export Printable PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setExportInitialTab('docs');
                setShowExportModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Docs / JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenJsonView}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              <span>View JSON</span>
            </button>
          </div>
        </div>

        {/* TAB: Review */}
        {activeTab === 'review' && (
          <div className="space-y-4">
            {/* Filter Sub-bar */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filter:</span>
                <button
                  type="button"
                  onClick={() => setItemFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    itemFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All ({quiz.questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setItemFilter('incorrect')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    itemFilter === 'incorrect'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Incorrect ({quiz.questions.length - results.score})
                </button>
                {flaggedSet.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setItemFilter('flagged')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      itemFilter === 'flagged'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Flagged ({flaggedSet.size})
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => {
                const ans = results.answers.find((a) => a.questionId === q.id);
                const isCorrect = ans?.isCorrect ?? false;
                const isExpanded = expandedQuestion === q.id;
                const isFlagged = flaggedSet.has(q.id);

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                    }`}
                  >
                    <div
                      onClick={() => {
                        soundFx.playClick();
                        setExpandedQuestion(isExpanded ? null : q.id);
                      }}
                      className="flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                              Item {q.id}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {q.domain || 'Foundations'}
                            </span>
                            {q.bloom_level && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                Bloom: {q.bloom_level}
                              </span>
                            )}
                            {isFlagged && (
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded flex items-center gap-1">
                                <Flag className="w-3 h-3 fill-amber-500 text-amber-500" /> Flagged
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                            {q.question}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeakReviewItem(q);
                          }}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            speakingReviewId === q.id
                              ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse'
                              : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={speakingReviewId === q.id ? 'Stop audio' : 'Listen to question & explanation'}
                        >
                          {speakingReviewId === q.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button type="button" className="text-slate-400 p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-slate-500 dark:text-slate-400">Target Answer: </span>
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            {q.correct_answer}
                          </span>
                        </div>

                        {ans && (
                          <div>
                            <span className="font-bold text-slate-500 dark:text-slate-400">Your Submission: </span>
                            <span
                              className={`font-semibold px-2 py-0.5 rounded ${
                                isCorrect
                                  ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/40'
                                  : 'text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/40'
                              }`}
                            >
                              {ans.userAnswer || '(no answer recorded)'}
                            </span>
                          </div>
                        )}

                        <div className="pt-1">
                          <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                            Explanation & Rationale:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            {q.explanation}
                          </p>
                        </div>

                        {q.pedagogy_note && (
                          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200">
                            <span className="font-extrabold text-[10px] uppercase tracking-wider block">
                              Pedagogical Assessment Note:
                            </span>
                            <p className="text-[11px] leading-relaxed">{q.pedagogy_note}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playSelect();
                              setActiveTab('recommendations');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer border border-purple-200 dark:border-purple-800"
                          >
                            <Bot className="w-3.5 h-3.5 text-purple-500" />
                            <span>Tutor Me on Q#{q.id}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playSelect();
                              setActiveTab('recommendations');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                          >
                            <Video className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Recommended Videos & Sources</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: Taxonomy Matrix */}
        {activeTab === 'matrix' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Domain Performance */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Cognitive Domain Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(domainStats).map(([domain, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100);
                  return (
                    <div
                      key={domain}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {domain}
                        </span>
                        <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                          {data.correct}/{data.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bloom's Level Performance */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Bloom's Taxonomy Performance
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(bloomStats).map(([bloom, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100);
                  return (
                    <div
                      key={bloom}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          Bloom: {bloom}
                        </span>
                        <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                          {data.correct}/{data.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Study Guide */}
        {activeTab === 'study_guide' && quiz.study_guide && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Key Takeaways */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>Curriculum Takeaways</span>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {quiz.study_guide.key_takeaways.map((point, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {pIdx + 1}
                    </span>
                    <p className="font-medium leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Vocabulary */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Core Glossary & Definitions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quiz.study_guide.core_vocabulary.map((vocab, vIdx) => (
                  <div
                    key={vIdx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <h5 className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                      {vocab.term}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{vocab.definition}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Review */}
            {quiz.study_guide.recommended_review && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-300 block mb-1">
                  Target Remediation Action:
                </span>
                <p className="font-semibold leading-relaxed">
                  {quiz.study_guide.recommended_review}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Flashcards */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Flashcard {flashcardIndex + 1} of {quiz.questions.length} • Click to flip
            </p>

            <div
              onClick={() => {
                soundFx.playClick();
                setFlashcardFlipped(!flashcardFlipped);
              }}
              className="min-h-[220px] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shadow-sm cursor-pointer transition-all flex flex-col items-center justify-center gap-3 select-none"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {flashcardFlipped ? 'Target Answer & Concept' : 'Question Prompt'}
              </span>

              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white max-w-lg leading-relaxed">
                {flashcardFlipped
                  ? quiz.questions[flashcardIndex].correct_answer
                  : quiz.questions[flashcardIndex].question}
              </h3>

              {flashcardFlipped && (
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
                  {quiz.questions[flashcardIndex].explanation}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={flashcardIndex === 0}
                onClick={() => {
                  soundFx.playClick();
                  setFlashcardIndex((prev) => Math.max(0, prev - 1));
                  setFlashcardFlipped(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Previous Card
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowFullDeckModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Launch Interactive Drill Studio</span>
              </button>

              <button
                type="button"
                disabled={flashcardIndex === quiz.questions.length - 1}
                onClick={() => {
                  soundFx.playClick();
                  setFlashcardIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1));
                  setFlashcardFlipped(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-30 text-xs font-bold text-white dark:text-slate-900"
              >
                Next Card
              </button>
            </div>
          </div>
        )}

        {/* TAB: Study Recommendations & 1-on-1 AI Tutor */}
        {activeTab === 'recommendations' && (
          <StudyRecommendationsHub
            quiz={quiz}
            persona={persona}
            results={results}
            onRestartQuiz={onRestartQuiz}
          />
        )}

        {/* Feature 1: TAB: Mistake Diagnostics */}
        {activeTab === 'diagnostics' && mistakeReport && (
          <QuizMistakesDiagnosticsView
            report={mistakeReport}
            onGenerateNotesFromMistakes={() => {
              setIsNotesModalOpen(true);
            }}
            onAskTutorAboutMistake={(mistake) => {
              setTutorInitialQuery(`Can you explain question #${mistake.questionId} step-by-step? I answered "${mistake.userAnswer}", but the correct answer is "${mistake.correctAnswer}". Why was my answer wrong and what is the underlying rule?`);
              const foundQ = quiz.questions.find((q) => q.id === mistake.questionId);
              setTutorActiveQuestion(foundQ || null);
              setIsTutorDrawerOpen(true);
            }}
            onPracticeRemediation={onRestartQuiz}
          />
        )}

        {/* Feature 1: TAB: Intelligent Study Notes */}
        {activeTab === 'notes' && currentIntelligentNote && (
          <IntelligentNotesViewer
            note={currentIntelligentNote}
            onLaunchPracticeQuiz={(topic) => {
              onRestartQuiz();
            }}
            onAskTutorAboutNote={(conceptTitle, context) => {
              setTutorInitialQuery(`Can you tutor me on this concept: "${conceptTitle}"? Context: ${context}`);
              setIsTutorDrawerOpen(true);
            }}
          />
        )}
      </div>


      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowExportModal(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-extrabold transition-colors w-full sm:w-auto justify-center cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Export to JSON or Docs (.doc / Word)</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRestartQuiz}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Assessment</span>
          </button>

          <button
            type="button"
            onClick={onNewQuiz}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* Export to PDF / JSON / Docs Modal */}
      <QuizExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        quiz={quiz}
        results={results}
        summaryData={summaryData}
        initialTab={exportInitialTab}
      />

      {/* Official Certificate Modal */}
      {showCertificateModal && (
        <OfficialCertificateModal
          quiz={quiz}
          stats={stats}
          score={results.score}
          total={results.total}
          timeSpentSeconds={results.timeSpentSeconds || 0}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* Full 3D Interactive Flashcard Study Deck */}
      {showFullDeckModal && (
        <FlashcardStudyDeck
          quiz={quiz}
          onClose={() => setShowFullDeckModal(false)}
        />
      )}

      {/* Feature 1: Intelligent Notes Generator Modal */}
      <IntelligentNotesGeneratorModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        sourceQuiz={quiz}
        initialTopic={quiz.quiz_title}
        persona={persona}
        missedQuestions={results.answers
          .filter((a) => !a.isCorrect)
          .map((a) => {
            const q = quiz.questions.find((item) => item.id === a.questionId);
            return {
              question: q ? q.question : `Question #${a.questionId}`,
              userAnswer: a.userAnswer,
              correctAnswer: q ? q.correct_answer : 'Correct Answer',
              explanation: q?.explanation,
            };
          })}
        onNoteGenerated={(note) => {
          setCurrentIntelligentNote(note);
          setActiveTab('notes');
        }}
      />

      {/* Feature 1: Intelligent AI Academic Tutor Drawer */}
      <IntelligentTutorDrawer
        isOpen={isTutorDrawerOpen}
        onClose={() => setIsTutorDrawerOpen(false)}
        persona={persona}
        currentQuizTitle={quiz.quiz_title}
        question={tutorActiveQuestion}
        initialQuery={tutorInitialQuery}
        learnerContext={{
          accuracy,
          weakTopics: mistakeReport?.weakTopics,
          strongTopics: mistakeReport?.strongTopics,
          recentMistakes: mistakeReport?.detailedMistakes.map((m) => m.questionText),
          currentLevel: stats.level,
        }}
        onGenerateNotes={(topic) => {
          setIsTutorDrawerOpen(false);
          setIsNotesModalOpen(true);
        }}
        onStartPracticeQuiz={() => {
          setIsTutorDrawerOpen(false);
          onRestartQuiz();
        }}
      />
    </div>
  );
};
