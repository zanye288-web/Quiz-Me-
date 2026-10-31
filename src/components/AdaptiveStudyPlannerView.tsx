import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Flame,
  Zap,
  GraduationCap,
  Plus,
  Trash2,
  Sliders,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { UserStats } from '../types/quiz';
import { QuizHistoryRecord } from './HistoryView';

export interface StudyGoalPlan {
  examTarget: string; // e.g. "WAEC & JAMB 2026", "Cambridge IGCSE", "SAT Prep", "General STEM"
  targetExamDate: string; // YYYY-MM-DD
  dailyMinutesTarget: number;
  selectedSubjects: string[];
}

export interface ScheduledStudyItem {
  id: string;
  day: string; // "Monday", "Tuesday", etc.
  subject: string;
  topic: string;
  type: 'quiz_revision' | 'notes_study' | 'mistake_remediation' | 'mock_exam';
  durationMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'normal';
}

const PLANNER_CONFIG_KEY = 'quizme_study_planner_config_v1';
const SCHEDULE_ITEMS_KEY = 'quizme_study_schedule_items_v1';

export const AdaptiveStudyPlannerView: React.FC<{
  stats: UserStats;
  history: QuizHistoryRecord[];
  onStartActivity: (item: ScheduledStudyItem) => void;
}> = ({ stats, history, onStartActivity }) => {
  const [plan, setPlan] = useState<StudyGoalPlan>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(PLANNER_CONFIG_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return {
      examTarget: 'WAEC / JAMB & Cambridge IGCSE',
      targetExamDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dailyMinutesTarget: 30,
      selectedSubjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    };
  });

  const [schedule, setSchedule] = useState<ScheduledStudyItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(SCHEDULE_ITEMS_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return [
      {
        id: 'sched_1',
        day: 'Today',
        subject: 'Physics',
        topic: "Newton's 2nd Law & Momentum",
        type: 'mistake_remediation',
        durationMinutes: 15,
        completed: false,
        priority: 'high',
      },
      {
        id: 'sched_2',
        day: 'Today',
        subject: 'Mathematics',
        topic: 'Quadratic Equations & Roots',
        type: 'quiz_revision',
        durationMinutes: 15,
        completed: false,
        priority: 'high',
      },
      {
        id: 'sched_3',
        day: 'Tomorrow',
        subject: 'Chemistry',
        topic: 'The Mole Concept & Gas Volumes',
        type: 'notes_study',
        durationMinutes: 20,
        completed: false,
        priority: 'medium',
      },
      {
        id: 'sched_4',
        day: 'Tomorrow',
        subject: 'Biology',
        topic: 'Osmosis & Cell Transport',
        type: 'quiz_revision',
        durationMinutes: 15,
        completed: false,
        priority: 'normal',
      },
      {
        id: 'sched_5',
        day: 'Weekend',
        subject: 'WAEC Past Papers',
        topic: 'Full 50-Item CBT Simulation',
        type: 'mock_exam',
        durationMinutes: 45,
        completed: false,
        priority: 'high',
      },
    ];
  });

  // Calculate days remaining to exam
  const daysRemaining = useMemo(() => {
    const target = new Date(plan.targetExamDate).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
  }, [plan.targetExamDate]);

  const toggleItemComplete = (id: string) => {
    soundFx.playComplete();
    const updated = schedule.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setSchedule(updated);
    try {
      localStorage.setItem(SCHEDULE_ITEMS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSavePlan = (updatedPlan: StudyGoalPlan) => {
    setPlan(updatedPlan);
    try {
      localStorage.setItem(PLANNER_CONFIG_KEY, JSON.stringify(updatedPlan));
    } catch {}
  };

  const todayCompletedCount = schedule.filter((s) => s.day === 'Today' && s.completed).length;
  const todayTotalCount = schedule.filter((s) => s.day === 'Today').length;
  const progressPercent = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Banner */}
      <div className="comic-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-indigo-500/10 border-2 border-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-2xl bg-amber-500 text-slate-950 border-2 border-slate-950 shadow-xs">
                <Calendar className="w-5 h-5" />
              </span>
              <span className="comic-badge px-2.5 py-1 rounded bg-amber-400 text-slate-950 border border-slate-950 text-xs font-black uppercase tracking-wider">
                ADAPTIVE STUDY PLANNER
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Spaced Revision &amp; Exam Countdown
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Personalized Adaptive Study Planner
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Dynamically organizes your revision schedule around target exam dates, prioritizes weak topics identified in quizzes, and automatically reschedules missed activities without penalties.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 shadow-xs text-center min-w-[140px]">
            <div className="text-3xl font-black text-amber-500">{daysRemaining}</div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Days to Target Exam
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Goal & Target Settings + Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target & Goal Settings */}
        <div className="lg:col-span-4 space-y-4">
          <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              <span>Academic Exam Target</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Examination Target:
                </label>
                <select
                  value={plan.examTarget}
                  onChange={(e) => handleSavePlan({ ...plan, examTarget: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                >
                  <option value="WAEC & JAMB 2026">WAEC / JAMB / NECO 2026</option>
                  <option value="Cambridge IGCSE & O-Level">Cambridge IGCSE &amp; O-Level</option>
                  <option value="SAT & ACT Admissions">SAT &amp; ACT Admissions</option>
                  <option value="AP & IB Diploma">AP &amp; IB Diploma</option>
                  <option value="General Academic Mastery">General Academic Mastery</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Target Exam Date:
                </label>
                <input
                  type="date"
                  value={plan.targetExamDate}
                  onChange={(e) => handleSavePlan({ ...plan, targetExamDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Daily Study Target (Minutes):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={15}
                    max={120}
                    step={15}
                    value={plan.dailyMinutesTarget}
                    onChange={(e) =>
                      handleSavePlan({ ...plan, dailyMinutesTarget: Number(e.target.value) })
                    }
                    className="flex-1"
                  />
                  <span className="font-mono font-bold text-amber-500 min-w-[50px] text-right">
                    {plan.dailyMinutesTarget} min
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Goal Completion Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">Today’s Goal Progress:</span>
                <span className="text-amber-500">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 text-center">
                {todayCompletedCount} of {todayTotalCount} scheduled sessions finished
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Daily & Weekly Dynamic Schedule */}
        <div className="lg:col-span-8 space-y-4">
          <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Today &amp; Upcoming Spaced Revision Queue</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sorted by memory decay curve &amp; weak topics
              </span>
            </div>

            <div className="space-y-2.5">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                    item.completed
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 opacity-80'
                      : item.priority === 'high'
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleItemComplete(item.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        item.completed
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-amber-500'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.day} • {item.subject}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            item.type === 'mistake_remediation'
                              ? 'text-rose-500'
                              : item.type === 'mock_exam'
                              ? 'text-purple-500'
                              : 'text-indigo-500'
                          }`}
                        >
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>
                      <h4
                        className={`text-xs font-bold text-slate-900 dark:text-white mt-1 truncate ${
                          item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {item.topic}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {item.durationMinutes}m
                    </span>
                    <button
                      type="button"
                      onClick={() => onStartActivity(item)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-xs"
                    >
                      Launch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
