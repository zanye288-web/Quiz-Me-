import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Zap,
  CheckCircle2,
  Sparkles,
  Flame,
  Settings2,
  Play,
  Calendar,
  BookOpen,
  Check,
} from 'lucide-react';
import { QuizHistoryRecord } from './HistoryView';
import { QuizResponse } from '../types/quiz';
import { soundFx } from '../utils/audio';

export type GoalMetric = 'questions' | 'xp' | 'concepts';

export interface GenericGoalMetadata {
  statement: string;
  subject: string;
  daysRemaining: number;
  targetDateIso: string;
  readinessPercent: number;
  conceptsDiscoveredCount: number;
}

export interface DailyGoalConfig {
  metric: GoalMetric;
  target: number;
  genericStatement?: string;
  subject?: string;
  daysRemaining?: number;
  createdAtIso?: string;
}

export const GOAL_STORAGE_KEY = 'quizme_daily_goal_config_v3';
export const ONE_BY_ONE_CONCEPTS_KEY = 'quizme_one_by_one_concepts_v1';

const DEFAULT_CONFIG: DailyGoalConfig = {
  metric: 'questions',
  target: 20,
  genericStatement: 'I have an upcoming math test in the next two days',
  subject: 'Mathematics',
  daysRemaining: 2,
  createdAtIso: new Date().toISOString(),
};

const PRESET_TARGETS: Record<GoalMetric, number[]> = {
  questions: [10, 20, 30, 50],
  xp: [100, 250, 500, 1000],
  concepts: [15, 30, 50, 100],
};

const GENERIC_GOAL_EXAMPLES = [
  'I have an upcoming math test in the next two days',
  'Learn 50 Biology concepts this week',
  'Prepare for my History & Civics exam in 3 days',
  'Master 30 Computer Science & Coding concepts today',
];

export function parseGenericGoalStatement(statement: string): {
  subject: string;
  daysRemaining: number;
  suggestedMetric: GoalMetric;
  suggestedTarget: number;
} {
  const lower = statement.toLowerCase();
  let daysRemaining = 2;
  if (lower.includes('tomorrow') || lower.includes('1 day') || lower.includes('one day') || lower.includes('today')) {
    daysRemaining = 1;
  } else if (lower.includes('two days') || lower.includes('2 days')) {
    daysRemaining = 2;
  } else if (lower.includes('three days') || lower.includes('3 days')) {
    daysRemaining = 3;
  } else if (lower.includes('week') || lower.includes('7 days')) {
    daysRemaining = 7;
  } else {
    const dayMatch = lower.match(/(\d+)\s*days?/);
    if (dayMatch) daysRemaining = Math.max(1, Math.min(30, parseInt(dayMatch[1], 10)));
  }

  let subject = 'General Knowledge';
  const subjectMap: Array<[RegExp, string]> = [
    [/\b(math|mathematics|algebra|calculus|geometry|trig|statistics)\b/i, 'Mathematics'],
    [/\b(bio|biology|cell|genetics|anatomy|ecology)\b/i, 'Biology'],
    [/\b(chem|chemistry|organic|periodic|stoichiometry)\b/i, 'Chemistry'],
    [/\b(phys|physics|mechanics|thermodynamics|quantum)\b/i, 'Physics'],
    [/\b(hist|history|war|revolution|empire|civics)\b/i, 'History'],
    [/\b(geo|geography|earth|climate|continents)\b/i, 'Geography'],
    [/\b(eng|english|literature|grammar|spelling|vocabulary)\b/i, 'English'],
    [/\b(cs|computer|coding|programming|javascript|python|algorithms)\b/i, 'Computer Science'],
  ];

  for (const [regex, name] of subjectMap) {
    if (regex.test(statement)) {
      subject = name;
      break;
    }
  }

  const numMatch = statement.match(/\b(\d{2,4})\b/);
  if (lower.includes('concept') || lower.includes('word')) {
    return {
      subject,
      daysRemaining,
      suggestedMetric: 'concepts',
      suggestedTarget: numMatch ? parseInt(numMatch[1], 10) : 50,
    };
  }
  if (lower.includes('xp')) {
    return {
      subject,
      daysRemaining,
      suggestedMetric: 'xp',
      suggestedTarget: numMatch ? parseInt(numMatch[1], 10) : 500,
    };
  }

  return {
    subject,
    daysRemaining,
    suggestedMetric: 'questions',
    suggestedTarget: numMatch ? parseInt(numMatch[1], 10) : 20,
  };
}

export function getActiveGenericGoal(): GenericGoalMetadata {
  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    const parsed: DailyGoalConfig = raw ? JSON.parse(raw) : DEFAULT_CONFIG;
    const conceptsRaw = localStorage.getItem(ONE_BY_ONE_CONCEPTS_KEY);
    const conceptsList: string[] = conceptsRaw ? JSON.parse(conceptsRaw) : [];
    const statement = parsed.genericStatement || DEFAULT_CONFIG.genericStatement!;
    const info = parseGenericGoalStatement(statement);
    return {
      statement,
      subject: parsed.subject || info.subject,
      daysRemaining: parsed.daysRemaining ?? info.daysRemaining,
      targetDateIso: parsed.createdAtIso || new Date().toISOString(),
      readinessPercent: 65,
      conceptsDiscoveredCount: conceptsList.length,
    };
  } catch {
    return {
      statement: DEFAULT_CONFIG.genericStatement!,
      subject: 'Mathematics',
      daysRemaining: 2,
      targetDateIso: new Date().toISOString(),
      readinessPercent: 50,
      conceptsDiscoveredCount: 0,
    };
  }
}

export function recordOneByOneConceptsToGoal(words: string[]): number {
  try {
    const raw = localStorage.getItem(ONE_BY_ONE_CONCEPTS_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const set = new Set(existing.map((w) => w.toUpperCase().trim()));
    words.forEach((w) => {
      const cleaned = w.toUpperCase().trim();
      if (cleaned) set.add(cleaned);
    });
    const merged = Array.from(set);
    localStorage.setItem(ONE_BY_ONE_CONCEPTS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('quizme-learning-goal-updated'));
    return merged.length;
  } catch {
    return 0;
  }
}

interface DailyLearningGoalTrackerProps {
  historyRecords?: QuizHistoryRecord[];
  onStartQuiz?: (quiz: QuizResponse) => void;
  onGenerateGoalQuiz?: (subject: string, goalStatement: string) => void;
  className?: string;
}

export const DailyLearningGoalTracker: React.FC<DailyLearningGoalTrackerProps> = ({
  historyRecords = [],
  onStartQuiz,
  onGenerateGoalQuiz,
  className = '',
}) => {
  const [config, setConfig] = useState<DailyGoalConfig>(() => {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
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

  const [oneByOneConceptsCount, setOneByOneConceptsCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(ONE_BY_ONE_CONCEPTS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempMetric, setTempMetric] = useState<GoalMetric>(config.metric);
  const [tempTarget, setTempTarget] = useState<number>(config.target);
  const [tempStatement, setTempStatement] = useState<string>(
    config.genericStatement || DEFAULT_CONFIG.genericStatement!
  );
  const [customInputValue, setCustomInputValue] = useState<string>('');

  useEffect(() => {
    const syncConcepts = () => {
      try {
        const raw = localStorage.getItem(ONE_BY_ONE_CONCEPTS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        setOneByOneConceptsCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        // ignore
      }
    };
    window.addEventListener('quizme-concepts-updated', syncConcepts);
    return () => window.removeEventListener('quizme-concepts-updated', syncConcepts);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('quizme-goal-updated', { detail: config }));
    } catch {
      // ignore
    }
  }, [config]);

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

  const currentValue =
    config.metric === 'questions'
      ? todaysStats.questionsAnswered + oneByOneConceptsCount
      : config.metric === 'concepts'
      ? oneByOneConceptsCount + todaysStats.correctCount
      : todaysStats.xpEarned;

  const targetValue = Math.max(1, config.target);
  const rawPercentage = Math.round((currentValue / targetValue) * 100);
  const percentage = Math.min(100, rawPercentage);
  const isGoalReached = currentValue >= targetValue;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const parsedGoalInfo = useMemo(
    () => parseGenericGoalStatement(config.genericStatement || DEFAULT_CONFIG.genericStatement!),
    [config.genericStatement]
  );

  const handleOpenEdit = () => {
    soundFx.playClick();
    setTempMetric(config.metric);
    setTempTarget(config.target);
    setTempStatement(config.genericStatement || DEFAULT_CONFIG.genericStatement!);
    setCustomInputValue('');
    setIsEditingGoal(true);
  };

  const handleSaveGoal = () => {
    soundFx.playStreak();
    const parsed = parseGenericGoalStatement(tempStatement);
    let finalTarget = tempTarget;
    if (customInputValue.trim()) {
      const p = parseInt(customInputValue.trim(), 10);
      if (!isNaN(p) && p > 0) {
        finalTarget = Math.min(2000, p);
      }
    }
    setConfig({
      metric: tempMetric,
      target: finalTarget,
      genericStatement: tempStatement.trim() || DEFAULT_CONFIG.genericStatement,
      subject: parsed.subject,
      daysRemaining: parsed.daysRemaining,
      createdAtIso: new Date().toISOString(),
    });
    setIsEditingGoal(false);
  };

  const motivationalMessage = useMemo(() => {
    if (isGoalReached) {
      return `Milestone reached! You are 100% on track for "${config.genericStatement}".`;
    }
    if (percentage >= 75) {
      return `Final stretch! Only ${targetValue - currentValue} ${config.metric} left to reach 100% readiness for your ${parsedGoalInfo.subject} goal.`;
    }
    if (percentage >= 40) {
      return `Steady progress (${percentage}% ready)! Recommended quizzes below have been adapted to ${parsedGoalInfo.subject}.`;
    }
    return `Active Goal: "${config.genericStatement}". Recommended quizzes & One by One word chains now prioritize ${parsedGoalInfo.subject}!`;
  }, [isGoalReached, percentage, targetValue, currentValue, config.metric, config.genericStatement, parsedGoalInfo.subject]);

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm relative overflow-hidden transition-all ${className}`}
    >
      <div
        className={`absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors ${
          isGoalReached
            ? 'bg-emerald-400 dark:bg-emerald-600'
            : 'bg-indigo-400 dark:bg-indigo-600'
        }`}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
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
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Target className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span>{isGoalReached ? 'Goal Readiness Achieved!' : 'Adaptive Learning Goal'}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-black">
              <Calendar className="w-3 h-3" />
              <span>{parsedGoalInfo.daysRemaining} Day(s) Window • {parsedGoalInfo.subject}</span>
            </span>

            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Edit Generic Goal</span>
            </button>
          </div>

          <div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              “{config.genericStatement || DEFAULT_CONFIG.genericStatement}”
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {motivationalMessage}
            </p>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-1 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{todaysStats.quizzesCount} Quizzes Today</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>+{todaysStats.xpEarned} XP Earned</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>{oneByOneConceptsCount} Word-Chain Concepts</span>
            </div>
          </div>
        </div>

        {/* Center: Progress Ring */}
        <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              <defs>
                <linearGradient id="goalProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  {isGoalReached ? (
                    <>
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </>
                  )}
                </linearGradient>
              </defs>
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {percentage}%
              </span>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 mt-1">
                {currentValue} / {targetValue}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                {config.metric}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center sm:text-left min-w-[155px]">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Goal Closeness
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {isGoalReached ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center sm:justify-start">
                  <Flame className="w-4 h-4 fill-emerald-500 text-emerald-500" /> Ready!
                </span>
              ) : (
                <span>
                  {targetValue - currentValue}{' '}
                  <span className="text-xs font-semibold text-slate-500">to target</span>
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Focus:{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">{parsedGoalInfo.subject}</strong>
            </div>

            {(onGenerateGoalQuiz || onStartQuiz) && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  if (onGenerateGoalQuiz) {
                    onGenerateGoalQuiz(
                      parsedGoalInfo.subject,
                      config.genericStatement || DEFAULT_CONFIG.genericStatement!
                    );
                  } else if (onStartQuiz) {
                    const firstWithData = historyRecords.find((r) => r.quizData);
                    if (firstWithData) onStartQuiz(firstWithData.quizData);
                  }
                }}
                className="mt-2 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Practice {parsedGoalInfo.subject}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generic Goal Modal */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Set Your Personal Learning Goal
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                1. Describe Your Goal in Plain English
              </label>
              <input
                type="text"
                value={tempStatement}
                onChange={(e) => {
                  const val = e.target.value;
                  setTempStatement(val);
                  const info = parseGenericGoalStatement(val);
                  setTempMetric(info.suggestedMetric);
                  setTempTarget(info.suggestedTarget);
                }}
                placeholder='e.g. "I have an upcoming math test in the next two days"'
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {GENERIC_GOAL_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setTempStatement(ex);
                      const info = parseGenericGoalStatement(ex);
                      setTempMetric(info.suggestedMetric);
                      setTempTarget(info.suggestedTarget);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-100 cursor-pointer"
                  >
                    “{ex}”
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                2. Tracking Metric
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                {(['questions', 'concepts', 'xp'] as GoalMetric[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setTempMetric(m);
                      setTempTarget(PRESET_TARGETS[m][1]);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
                      tempMetric === m
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                3. Target Milestone ({tempTarget} {tempMetric})
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_TARGETS[tempMetric].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setTempTarget(val);
                      setCustomInputValue('');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      tempTarget === val && !customInputValue
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {val} {tempMetric}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer"
              >
                Save Goal & Update Recommendations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
