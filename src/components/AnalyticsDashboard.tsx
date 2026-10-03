import React, { useMemo } from 'react';
import {
  BarChart3,
  Award,
  Flame,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Zap,
} from 'lucide-react';
import { UserStats, PersonaType, QuizResponse, DifficultyType, QuestionType } from '../types/quiz';
import { BadgeDefinition } from '../types/badges';
import { BadgesGrid } from './BadgesGrid';
import { GlobalLeaderboard } from './GlobalLeaderboard';
import { RecommendedQuizzesSection } from './RecommendedQuizzesSection';
import { QuizHistoryRecord } from './HistoryView';
import { DailyLearningGoalTracker } from './DailyLearningGoalTracker';

interface AnalyticsDashboardProps {
  stats: UserStats;
  persona: PersonaType;
  historyRecords?: QuizHistoryRecord[];
  onStartQuiz?: (quiz: QuizResponse) => void;
  onCustomizeTopic?: (prompt: string, diff: DifficultyType, types: QuestionType[]) => void;
  onResetStats?: () => void;
  onCelebrateBadge?: (badge: BadgeDefinition) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  stats,
  persona,
  historyRecords = [],
  onStartQuiz,
  onCustomizeTopic,
  onCelebrateBadge,
}) => {
  const accuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 100;

  // Real topic metrics derived from Firestore quiz history
  const topicsData = useMemo(() => {
    if (!historyRecords || historyRecords.length === 0) {
      return [
        { name: 'Core Foundations', score: accuracy, questions: stats.totalQuestions || 0 },
      ];
    }

    const topicMap: Record<string, { total: number; correct: number }> = {};
    historyRecords.forEach((record) => {
      const topicName = record.quizTitle || 'General Knowledge';
      if (!topicMap[topicName]) {
        topicMap[topicName] = { total: 0, correct: 0 };
      }
      topicMap[topicName].total += record.total || 0;
      topicMap[topicName].correct += record.score || 0;
    });

    const calculated = Object.entries(topicMap).map(([name, data]) => ({
      name,
      questions: data.total,
      score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));

    return calculated.slice(0, 6);
  }, [historyRecords, accuracy, stats.totalQuestions]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Learner Performance & Diagnostics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              My Stats & Achievements
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track your diagnostic accuracy, daily study streak, XP level ascension, and collectible mastery badges.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Current Streak
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {stats.streak} Days Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Learning Goal Tracker with Progress Ring */}
      <DailyLearningGoalTracker
        historyRecords={historyRecords}
        onStartQuiz={onStartQuiz}
      />

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-sm space-y-2 relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-700 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">
            Quizzes Completed
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.quizzesCompleted}
          </div>
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">Total sessions taken</div>
        </div>

        <div className="rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">
            Accuracy
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {accuracy}%
          </div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {stats.totalCorrect} / {stats.totalQuestions} correct
          </div>
        </div>

        <div className="rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">
            Total Points
          </div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.xp} XP
          </div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Level {stats.level} Scholar</div>
        </div>

        <div className="rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-sm space-y-2 relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-700 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">
            Current Level
          </div>
          <div className="text-3xl font-black text-amber-500">
            Lvl {stats.level}
          </div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {150 - (stats.xp % 150)} XP to Level {stats.level + 1}
          </div>
        </div>
      </div>

      {/* AI-Recommended Quizzes Section based on performance gaps */}
      {onStartQuiz && (
        <RecommendedQuizzesSection
          persona={persona}
          stats={stats}
          historyRecords={historyRecords}
          onStartQuiz={onStartQuiz}
          onCustomizeTopic={onCustomizeTopic}
        />
      )}

      {/* Global Leaderboard Section */}
      <GlobalLeaderboard stats={stats} persona={persona} />

      {/* Subject Strengths Breakdown */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Subject & Domain Proficiency
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated performance across quiz domains
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">Average Scores</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {topicsData.map((topic, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-slate-200">{topic.name}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{topic.score}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${topic.score}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {topic.questions} questions assessed
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Grid Section */}
      <BadgesGrid stats={stats} onCelebrateBadge={onCelebrateBadge} />
    </div>
  );
};
