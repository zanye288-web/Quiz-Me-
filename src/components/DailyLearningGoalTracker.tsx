import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Zap,
  CheckCircle2,
  Sparkles,
  Flame,
  Settings2,
  Play,
  ArrowRight,
  TrendingUp,
  Award,
  RotateCcw,
  Check,
} from 'lucide-react';
import { QuizHistoryRecord } from './HistoryView';
import { QuizResponse } from '../types/quiz';
import { soundFx } from '../utils/audio';

export type GoalMetric = 'questions' | 'xp';

export interface DailyGoalConfig {
  metric: GoalMetric;
  target: number;
}

const STORAGE_KEY = 'quizme_daily_goal_config_v2';

const DEFAULT_CONFIG: DailyGoalConfig = {
  metric: 'questions',
  target: 20,
};

const PRESET_TARGETS: Record<GoalMetric, number[]> = {
  questions: [5, 10, 20, 30, 50],
  xp: [50, 100, 200, 300, 500],
};

interface DailyLearningGoalTrackerProps {
  historyRecords?: QuizHistoryRecord[];
  onStartQuiz?: (quiz: QuizResponse) => void;
  className?: string;
}

export const DailyLearningGoalTracker: React.FC<DailyLearningGoalTrackerProps> = ({
  historyRecords = [],
  onStartQuiz,
  className = '',
}) => {
  // Goal configuration state
  const [config, setConfig] = useState<DailyGoalConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.metric && typeof parsed.target === 'number') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempMetric, setTempMetric] = useState<GoalMetric>(config.metric);
  const [tempTarget, setTempTarget] = useState<number>(config.target);
  const [customInputValue, setCustomInputValue] = useState<string>('');

  // Persist config
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Calculate today's achievements
  const todaysStats = useMemo(() => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const todayRecords = historyRecords.filter((record) => {
      try {
        const recordDate = new Date(record.date);
        return (
          recordDate.getFullYear() === todayYear &&
          recordDate.getMonth() === todayMonth &&
          recordDate.getDate() === todayDate
        );
      } catch {
        return false;
      }
    });

    const questionsAnswered = todayRecords.reduce((sum, r) => sum + (r.total || 0), 0);
    const correctCount = todayRecords.reduce((sum, r) => sum + (r.score || 0), 0);
    const xpEarned = todayRecords.reduce((sum, r) => sum + (r.xpEarned || 0), 0);
    const quizzesCount = todayRecords.length;

    return {
      todayRecords,
      questionsAnswered,
      correctCount,
      xpEarned,
      quizzesCount,
    };
  }, [historyRecords]);

  // Current metric value
  const currentValue =
    config.metric === 'questions' ? todaysStats.questionsAnswered : todaysStats.xpEarned;
  const targetValue = Math.max(1, config.target);
  const rawPercentage = Math.round((currentValue / targetValue) * 100);
  const percentage = Math.min(100, rawPercentage);
  const isGoalReached = currentValue >= targetValue;

  // SVG Progress Ring calculations
  // radius = 54 -> circumference = 2 * PI * 54 = 339.29
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleOpenEdit = () => {
    soundFx.playClick();
    setTempMetric(config.metric);
    setTempTarget(config.target);
    setCustomInputValue('');
    setIsEditingGoal(true);
  };

  const handleSaveGoal = () => {
    soundFx.playStreak();
    let finalTarget = tempTarget;
    if (customInputValue.trim()) {
      const parsed = parseInt(customInputValue.trim(), 10);
      if (!isNaN(parsed) && parsed > 0) {
        finalTarget = Math.min(1000, parsed);
      }
    }
    setConfig({
      metric: tempMetric,
      target: finalTarget,
    });
    setIsEditingGoal(false);
  };

  const motivationalMessage = useMemo(() => {
    if (isGoalReached) {
      return 'Goal completed! You fortified your daily knowledge streak today.';
    }
    if (percentage >= 75) {
      return `Almost there! Just ${targetValue - currentValue} ${config.metric} remaining to finish.`;
    }
    if (percentage >= 50) {
      return 'Halfway mark crossed! Keep the momentum surging forward.';
    }
    if (percentage > 0) {
      return 'Solid start! Continue answering questions to lock in today’s goal.';
    }
    return 'Ignite your daily target! Complete a quick quiz session to begin.';
  }, [isGoalReached, percentage, targetValue, currentValue, config.metric]);

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm relative overflow-hidden transition-all ${className}`}
    >
      {/* Background glow accent */}
      <div
        className={`absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors ${
          isGoalReached
            ? 'bg-emerald-400 dark:bg-emerald-600'
            : config.metric === 'questions'
            ? 'bg-indigo-400 dark:bg-indigo-600'
            : 'bg-amber-400 dark:bg-amber-600'
        }`}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left: Header and Goal Description */}
        <div className="space-y-3 flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${
                isGoalReached
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              }`}
            >
              {isGoalReached ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              ) : (
                <Target className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span>
                {isGoalReached ? 'Daily Goal Achieved!' : 'Daily Learning Target'}
              </span>
            </span>

            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
              title="Customize target metric & count"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Change Goal</span>
            </button>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {config.metric === 'questions' ? 'Daily Question Sprint' : 'Daily XP Mastery Goal'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
              {motivationalMessage}
            </p>
          </div>

          {/* Quick Metrics Bar for Today */}
          <div className="flex items-center justify-center lg:justify-start gap-3 pt-1 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{todaysStats.quizzesCount} Sessions Today</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>+{todaysStats.xpEarned} XP Earned</span>
            </div>
            {todaysStats.questionsAnswered > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {todaysStats.correctCount}/{todaysStats.questionsAnswered} Correct
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center: The Progress Ring */}
        <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              {/* Background Track */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />

              {/* Dynamic Gradient Definition */}
              <defs>
                <linearGradient id="goalProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  {isGoalReached ? (
                    <>
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </>
                  ) : config.metric === 'questions' ? (
                    <>
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </>
                  )}
                </linearGradient>
              </defs>

              {/* Progress Foreground Bar */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="url(#goalProgressGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {percentage}%
              </span>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 mt-1">
                {currentValue} / {targetValue}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                {config.metric === 'questions' ? 'Questions' : 'XP'}
              </span>
            </div>
          </div>

          {/* Right Status Card */}
          <div className="space-y-2 text-center sm:text-left min-w-[140px]">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Goal Pace
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {isGoalReached ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center sm:justify-start">
                  <Flame className="w-4 h-4 fill-emerald-500 text-emerald-500" /> Complete!
                </span>
              ) : (
                <span>
                  {targetValue - currentValue}{' '}
                  <span className="text-xs font-semibold text-slate-500">to go</span>
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Target:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {targetValue} {config.metric === 'questions' ? 'Questions' : 'XP'}
              </strong>
            </div>

            {/* If there's an onStartQuiz prop and goal not reached, button to practice */}
            {onStartQuiz && !isGoalReached && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  // Trigger onStartQuiz or jump to practice
                  const firstWithData = historyRecords.find((r) => r.quizData);
                  if (firstWithData) {
                    onStartQuiz(firstWithData.quizData);
                  } else {
                    // Start generic session
                    onStartQuiz({
                      app_name: 'Quiz Me!',
                      persona: 'Student',
                      quiz_title: 'Daily Goal Booster Practice',
                      difficulty: 'Intermediate',
                      summary: 'Adaptive practice session designed to conquer your daily target.',
                      questions: [],
                    } as any);
                  }
                }}
                className="mt-2 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Practice Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Goal Customization Modal / Dialog */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Set Daily Learning Goal
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Choose whether you want to measure progress by questions answered or XP earned, and set a daily target that challenges your learning rhythm.
            </p>

            {/* Metric Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                1. Select Goal Metric
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setTempMetric('questions');
                    setTempTarget(20);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tempMetric === 'questions'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Questions</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setTempMetric('xp');
                    setTempTarget(100);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tempMetric === 'xp'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>XP Points</span>
                </button>
              </div>
            </div>

            {/* Target Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                2. Choose Target ({tempMetric === 'questions' ? 'Questions / Day' : 'XP / Day'})
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_TARGETS[tempMetric].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setTempTarget(val);
                      setCustomInputValue('');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      tempTarget === val && !customInputValue
                        ? tempMetric === 'questions'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-105'
                          : 'bg-amber-500 text-white border-amber-500 shadow-xs scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {val} {tempMetric === 'questions' ? 'Qs' : 'XP'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Or enter custom target:
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                placeholder={`e.g. ${tempMetric === 'questions' ? '25' : '150'}`}
                value={customInputValue}
                onChange={(e) => {
                  setCustomInputValue(e.target.value);
                  const parsed = parseInt(e.target.value, 10);
                  if (!isNaN(parsed) && parsed > 0) {
                    setTempTarget(parsed);
                  }
                }}
                className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer"
              >
                Save Daily Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
