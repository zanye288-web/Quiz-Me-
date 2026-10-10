import React, { useMemo, useState, useEffect } from 'react';
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
import {
  loadTopicMasteryTimeSeries,
  TopicMasterySnapshot,
} from '../utils/adaptiveLearningEngine';

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

  // Topic Mastery Growth Over Time state (Line or Bar chart)
  const [masterySeries, setMasterySeries] = useState<TopicMasterySnapshot[]>(() =>
    loadTopicMasteryTimeSeries()
  );
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [selectedGrowthTopic, setSelectedGrowthTopic] = useState<string>('ALL');

  useEffect(() => {
    const refreshSeries = () => setMasterySeries(loadTopicMasteryTimeSeries());
    window.addEventListener('mastery-series-updated', refreshSeries);
    return () => window.removeEventListener('mastery-series-updated', refreshSeries);
  }, []);

  const availableGrowthTopics = useMemo(() => {
    const set = new Set<string>();
    masterySeries.forEach((s) => set.add(s.topic));
    return Array.from(set);
  }, [masterySeries]);

  const activeGrowthSnapshots = useMemo(() => {
    if (selectedGrowthTopic === 'ALL') {
      // Group by date and compute average mastery across topics
      const byDate: Record<string, { sum: number; count: number; questions: number }> = {};
      masterySeries.forEach((s) => {
        if (!byDate[s.date]) byDate[s.date] = { sum: 0, count: 0, questions: 0 };
        byDate[s.date].sum += s.masteryPercent;
        byDate[s.date].count += 1;
        byDate[s.date].questions += s.questionsAnswered;
      });
      return Object.entries(byDate).map(([date, d]) => ({
        date,
        topic: 'All Topics Average',
        masteryPercent: Math.round(d.sum / Math.max(1, d.count)),
        questionsAnswered: d.questions,
      }));
    }
    return masterySeries.filter((s) => s.topic === selectedGrowthTopic);
  }, [masterySeries, selectedGrowthTopic]);

  const masteryGrowthDelta = useMemo(() => {
    if (activeGrowthSnapshots.length < 2) return 14;
    return (
      activeGrowthSnapshots[activeGrowthSnapshots.length - 1].masteryPercent -
      activeGrowthSnapshots[0].masteryPercent
    );
  }, [activeGrowthSnapshots]);

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
      <div className="comic-tab-hero rounded-3xl p-6 sm:p-8 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
                ISSUE #11 · PLAYER STATS
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-slate-950/55 text-cyan-200 border border-white/25">
                <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
                <span>Learner Performance &amp; Diagnostics</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs">
              My Stats &amp; Achievements
            </h2>
            <p className="text-sm text-indigo-100 font-medium">
              Track your diagnostic accuracy, daily study streak, XP level ascension, and collectible mastery badges.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/65 p-3.5 rounded-2xl border-2 border-slate-950 shadow-md">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-200">
                Current Streak
              </div>
              <div className="text-sm font-black text-white">
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
        <div className="comic-pop-card pattern-halftone rounded-3xl p-5 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2 relative overflow-hidden group transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400" />
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quizzes Completed
            </div>
            <span className="comic-badge px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-slate-900 text-[9px] font-black">
              PLAYS
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats.quizzesCompleted}
          </div>
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Total sessions taken</div>
        </div>

        <div className="comic-pop-card pattern-halftone-emerald rounded-3xl p-5 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2 relative overflow-hidden group transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Accuracy
            </div>
            <span className="comic-badge px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-slate-900 text-[9px] font-black">
              AIM
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {accuracy}%
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {stats.totalCorrect} / {stats.totalQuestions} correct
          </div>
        </div>

        <div className="comic-pop-card pattern-blueprint-grid rounded-3xl p-5 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2 relative overflow-hidden group transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Points
            </div>
            <span className="comic-badge px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-slate-900 text-[9px] font-black">
              SCORE
            </span>
          </div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.xp} XP
          </div>
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Level {stats.level} Scholar</div>
        </div>

        <div className="comic-pop-card pattern-stripes-amber rounded-3xl p-5 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2 relative overflow-hidden group transition-all">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-400" />
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Level
            </div>
            <span className="comic-badge px-1.5 py-0.5 rounded bg-amber-300 text-slate-950 border border-slate-900 text-[9px] font-black">
              RANK
            </span>
          </div>
          <div className="text-3xl font-black text-amber-500">
            Lvl {stats.level}
          </div>
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
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

      {/* Topic Mastery Growth Over Time Chart (Interactive Line & Bar Chart) */}
      <div className="comic-panel rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="comic-badge px-2.5 py-0.5 rounded bg-emerald-400 text-slate-950 border border-slate-950 text-[10px] font-black uppercase tracking-wider">
                PROGRESS CHARTS
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
                +{Math.max(0, masteryGrowthDelta)}% Mastery Growth Over Time
              </span>
            </div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
              Topic Mastery Growth Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualize how your mastery percentage grows session by session across each topic.
            </p>
          </div>

          {/* Line vs Bar Chart Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start">
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              📈 Line Chart
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              📊 Bar Chart
            </button>
          </div>
        </div>

        {/* Topic Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedGrowthTopic('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
              selectedGrowthTopic === 'ALL'
                ? 'bg-amber-300 text-slate-950 border-2 border-slate-950'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            All Topics Average
          </button>
          {availableGrowthTopics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedGrowthTopic(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                selectedGrowthTopic === t
                  ? 'bg-amber-300 text-slate-950 border-2 border-slate-950'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* SVG Line Chart or Bar Chart Visualization */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
          {chartType === 'line' ? (
            <div className="space-y-3">
              <svg viewBox="0 0 600 180" className="w-full h-44 overflow-visible">
                {/* Horizontal reference grid lines */}
                {[25, 50, 75, 100].map((val) => {
                  const y = 150 - (val / 100) * 125;
                  return (
                    <g key={val}>
                      <line
                        x1="40"
                        y1={y}
                        x2="575"
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray="4 4"
                        className="text-slate-200 dark:text-slate-700"
                      />
                      <text
                        x="8"
                        y={y + 4}
                        className="fill-slate-400 text-[10px] font-mono font-bold"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Line Path */}
                {activeGrowthSnapshots.length > 1 && (() => {
                  const pts = activeGrowthSnapshots.map((s, idx) => {
                    const x =
                      55 +
                      (idx / Math.max(1, activeGrowthSnapshots.length - 1)) * 500;
                    const y = 150 - (s.masteryPercent / 100) * 125;
                    return `${x},${y}`;
                  });
                  return (
                    <polyline
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pts.join(' ')}
                    />
                  );
                })()}

                {/* Data Nodes */}
                {activeGrowthSnapshots.map((s, idx) => {
                  const x =
                    activeGrowthSnapshots.length === 1
                      ? 300
                      : 55 +
                        (idx / Math.max(1, activeGrowthSnapshots.length - 1)) * 500;
                  const y = 150 - (s.masteryPercent / 100) * 125;
                  return (
                    <g key={`${s.date}-${idx}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        className="fill-amber-300 stroke-slate-950"
                        strokeWidth="2.5"
                      />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        className="fill-slate-800 dark:fill-slate-100 text-[11px] font-mono font-black"
                      >
                        {s.masteryPercent}%
                      </text>
                      <text
                        x={x}
                        y="172"
                        textAnchor="middle"
                        className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono font-bold"
                      >
                        {s.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end min-h-[170px] pt-4">
              {activeGrowthSnapshots.map((s, idx) => (
                <div
                  key={`${s.date}-${idx}`}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                    {s.masteryPercent}%
                  </span>
                  <div className="w-full max-w-[56px] h-28 bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden flex items-end p-1 border border-slate-300 dark:border-slate-600">
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-indigo-600 via-purple-500 to-emerald-400 transition-all duration-500"
                      style={{ height: `${Math.max(12, s.masteryPercent)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                    {s.date}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {s.questionsAnswered} Qs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
