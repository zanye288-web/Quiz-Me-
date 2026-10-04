import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Zap,
  ChevronRight,
  TrendingUp,
  Gift,
} from 'lucide-react';
import { UserStats as UserStatsType } from '../types/quiz';
import { getLevelProgress } from '../utils/levelingSystem';

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

  const progress = getLevelProgress(stats.xp || 0, stats.streak || 1);
  const {
    level: currentLevel,
    currentLevelXp,
    xpRequiredForNextLevel,
    xpToNextLevel,
    progressPercent,
    rank,
    nextMilestone,
    streakMultiplierPercent,
  } = progress;

  // Accuracy calculation
  const accuracyPercent =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 100;

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

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">
              L{currentLevel}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-16 z-50 w-56 p-3 rounded-2xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700 pointer-events-none"
            >
              <div className="flex items-center justify-between font-bold pb-1 border-b border-slate-800">
                <span className="text-indigo-400">
                  {rank.badgeEmoji} Lv.{currentLevel} {rank.title}
                </span>
                <span className="text-amber-400">{stats.xp.toLocaleString()} XP</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5">
                {currentLevelXp.toLocaleString()} / {xpRequiredForNextLevel.toLocaleString()} XP ({progressPercent}%)
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {xpToNextLevel.toLocaleString()} XP needed for Level {currentLevel + 1}
              </p>
              {nextMilestone && (
                <p className="text-[10px] text-emerald-400 mt-1 font-bold">
                  {nextMilestone.icon} Next Chest at Lv.{nextMilestone.level}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const gaugeRadius = 22;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeStrokeDashoffset = gaugeCircumference - (progressPercent / 100) * gaugeCircumference;

  return (
    <div
      onClick={onOpenAnalytics}
      className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs relative overflow-hidden group transition-all hover:border-indigo-300 dark:hover:border-indigo-600/60 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="View Progression & Mastery Roadmap"
    >
      <div className="flex items-center gap-3 relative z-10">
        {/* Circular Progress Gauge */}
        <div className="relative w-13 h-13 shrink-0 flex items-center justify-center">
          <svg className="w-13 h-13 -rotate-90" viewBox="0 0 52 52">
            <circle
              cx="26"
              cy="26"
              r={gaugeRadius}
              className="text-slate-100 dark:text-slate-700"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
            />
            <motion.circle
              cx="26"
              cy="26"
              r={gaugeRadius}
              stroke="url(#sidebarXpGauge)"
              strokeWidth="4"
              strokeDasharray={gaugeCircumference}
              initial={{ strokeDashoffset: gaugeCircumference }}
              animate={{ strokeDashoffset: gaugeStrokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
            <defs>
              <linearGradient id="sidebarXpGauge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">
              L{currentLevel}
            </span>
            <span className="text-[8px] font-bold text-indigo-500 dark:text-indigo-400 mt-0.5">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Right Info & Metrics */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[11px] font-black ${rank.colorClass} flex items-center gap-1 truncate`}>
              <span>{rank.badgeEmoji}</span>
              <span className="truncate">{rank.title}</span>
            </span>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 shrink-0">
              {stats.xp.toLocaleString()} XP
            </span>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
            {xpToNextLevel.toLocaleString()} XP to Level {currentLevel + 1}
          </div>

          <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400" title="Daily Streak">
              <Flame className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
              {stats.streak}d
            </span>
            {streakMultiplierPercent > 0 && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400" title="Streak Retention XP Boost">
                  <Zap className="w-2.5 h-2.5 fill-current shrink-0" />
                  +{streakMultiplierPercent}%
                </span>
              </>
            )}
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400" title="Overall Accuracy">
              <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
              {accuracyPercent}%
            </span>
            {nextMilestone && (
              <Gift
                className="w-3 h-3 text-fuchsia-500 ml-auto shrink-0"
                title={`Next Milestone Chest at Level ${nextMilestone.level}: ${nextMilestone.title}`}
              />
            )}
            {!nextMilestone && (
              <ChevronRight className="w-3 h-3 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
