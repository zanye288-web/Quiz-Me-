import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Zap,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Target,
  Crown,
} from 'lucide-react';
import { UserStats as UserStatsType } from '../types/quiz';

interface UserStatsProps {
  stats: UserStatsType;
  isCollapsed?: boolean;
  onOpenAnalytics?: () => void;
}

export const UserStats: React.FC<UserStatsProps> = ({
  stats,
  isCollapsed = false,
  onOpenAnalytics,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Level Progression Math
  const XP_PER_LEVEL = 150;
  const currentLevel = stats.level || Math.floor(stats.xp / XP_PER_LEVEL) + 1;
  const currentLevelXp = stats.xp % XP_PER_LEVEL;
  const xpNeeded = XP_PER_LEVEL - currentLevelXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / XP_PER_LEVEL) * 100)));

  // Accuracy calculation
  const accuracyPercent =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 100;

  // Rank / Title based on level
  const getRankTitle = (lvl: number) => {
    if (lvl >= 10) return { title: 'Grandmaster', icon: Crown, color: 'text-amber-500' };
    if (lvl >= 7) return { title: 'Expert Scholar', icon: Award, color: 'text-purple-500' };
    if (lvl >= 4) return { title: 'Proficient', icon: Sparkles, color: 'text-indigo-500' };
    if (lvl >= 2) return { title: 'Apprentice', icon: Zap, color: 'text-blue-500' };
    return { title: 'Quiz Novice', icon: Target, color: 'text-emerald-500' };
  };

  const rank = getRankTitle(currentLevel);
  const RankIcon = rank.icon;

  if (isCollapsed) {
    // Collapsed Mode: Compact Circular Progress Ring & Level Indicator
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
      <div
        className="relative group flex flex-col items-center justify-center p-2 cursor-pointer"
        onClick={onOpenAnalytics}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Circular SVG Ring */}
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="transparent"
            />
            <motion.circle
              cx="22"
              cy="22"
              r={radius}
              stroke="url(#xpGradient)"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
            <defs>
              <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Level Center Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">
              L{currentLevel}
            </span>
          </div>
        </div>

        {/* Hover Tooltip in collapsed mode */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-16 z-50 w-48 p-3 rounded-2xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700 pointer-events-none"
            >
              <div className="flex items-center justify-between font-bold pb-1 border-b border-slate-800">
                <span className="text-indigo-400">Level {currentLevel} Scholar</span>
                <span className="text-amber-400">{stats.xp} XP</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5">
                {currentLevelXp} / {XP_PER_LEVEL} XP ({progressPercent}%)
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {xpNeeded} XP to Level {currentLevel + 1}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className="p-3.5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3 relative overflow-hidden group transition-all hover:border-indigo-300 dark:hover:border-indigo-600/60"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background ambient glow effect */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-indigo-500/20" />

      {/* Header Info: Level Badge & XP Count */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-indigo-500/30">
              <span className="text-xs">L{currentLevel}</span>
            </div>
            {/* Active streak mini indicator */}
            {stats.streak > 0 && (
              <div
                className="absolute -top-1 -right-1.5 flex items-center justify-center px-1 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black border border-white dark:border-slate-800 shadow-xs"
                title={`${stats.streak} day streak`}
              >
                <Flame className="w-2.5 h-2.5 fill-white" />
                <span>{stats.streak}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                Level {currentLevel}
              </span>
              <span className={`text-[10px] font-bold ${rank.color} flex items-center gap-0.5`}>
                <RankIcon className="w-2.5 h-2.5" />
                {rank.title}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {stats.quizzesCompleted} {stats.quizzesCompleted === 1 ? 'quiz' : 'quizzes'} completed
            </p>
          </div>
        </div>

        {/* Total XP pill */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
            <Zap className="w-3 h-3 fill-indigo-500 text-indigo-500" />
            <span className="text-xs font-black tracking-tight">{stats.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Main Animated XP Progress Bar Section */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-extrabold">
          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <span>Next Level</span>
            <span className="text-[10px] text-slate-400 font-semibold">
              ({currentLevelXp}/{XP_PER_LEVEL} XP)
            </span>
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-black">
            {progressPercent}%
          </span>
        </div>

        {/* Multi-layered Progress Track */}
        <div className="relative w-full bg-slate-100 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
          {/* Animated Bar Fill with Framer Motion */}
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-500 relative overflow-hidden shadow-xs"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{
              type: 'spring',
              stiffness: 60,
              damping: 15,
              mass: 0.8,
            }}
          >
            {/* Shimmer light sweep animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: 'linear',
              }}
            />
          </motion.div>
        </div>

        {/* XP needed label */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-0.5">
          <span>{xpNeeded} XP to Level {currentLevel + 1}</span>
          <span className="font-bold text-slate-500 dark:text-slate-400">
            {accuracyPercent}% Accuracy
          </span>
        </div>
      </div>

      {/* Mini Streak & Accuracy Sub-Bars */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 relative z-10 text-[10px]">
        {/* Streak Indicator */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-300">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
          <div className="truncate">
            <span className="font-bold">{stats.streak}d Streak</span>
          </div>
        </div>

        {/* Accuracy Indicator */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <div className="truncate">
            <span className="font-bold">{accuracyPercent}% Score</span>
          </div>
        </div>
      </div>
    </div>
  );
};
