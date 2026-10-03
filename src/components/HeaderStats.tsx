import React from 'react';
import {
  Sun,
  Moon,
  Monitor,
  GraduationCap,
  Sparkles,
  Sliders,
  Flame,
  CheckCircle,
  Activity,
  Layers,
  BookOpen,
} from 'lucide-react';
import { PersonaType, UserStats } from '../types/quiz';
import { useTheme } from '../context/ThemeContext';
import { soundFx } from '../utils/audio';

interface HeaderStatsProps {
  stats: UserStats;
  persona: PersonaType;
  onPersonaChange: (p: PersonaType) => void;
  onOpenSettings: () => void;
  onNavigateHome: () => void;
  currentView: 'ingest' | 'runner' | 'complete';
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  stats,
  persona,
  onPersonaChange,
  onOpenSettings,
  onNavigateHome,
  currentView,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleCycleTheme = () => {
    soundFx.playClick();
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const accuracyPercent = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 100;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onNavigateHome();
            }}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-emerald-500 flex items-center justify-center text-white dark:text-slate-950 font-black text-lg shadow-sm border border-slate-700 dark:border-emerald-400 group-hover:scale-105 transition-transform">
              Q!
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  Quiz Me!
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Multimodal Assessment Studio
              </p>
            </div>
          </button>
        </div>

        {/* Persona Mode Switcher (Teacher Pedagogical vs Student Active Recall) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onPersonaChange('Student');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              persona === 'Student'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Student</span>
            <span className="sm:hidden">Student</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onPersonaChange('Teacher');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              persona === 'Teacher'
                ? 'bg-indigo-600 text-white shadow-xs font-extrabold border border-indigo-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Teacher</span>
            <span className="sm:hidden">Teacher</span>
          </button>
        </div>

        {/* Orderly Diagnostic Metrics & Utility Toolbar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Diagnostic Accuracy Metric */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs"
            title="Overall Assessment Accuracy"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-slate-500 dark:text-slate-400">Mastery:</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100">
              {accuracyPercent}%
            </span>
          </div>

          {/* Quizzes Completed Count */}
          <div
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs"
            title="Total Assessments Completed"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-500 dark:text-slate-400">Evaluations:</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100">
              {stats.quizzesCompleted}
            </span>
          </div>

          {/* Active Consistency Days */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs font-extrabold text-amber-700 dark:text-amber-400"
            title="Consistency Streak (Days)"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{stats.streak}d</span>
          </div>

          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={handleCycleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={`Current Theme: ${theme}. Click to switch.`}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Monitor className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Settings & Customization Drawer Trigger */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Configure Assessment & Theme Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
