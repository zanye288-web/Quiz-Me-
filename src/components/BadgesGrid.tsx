import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Filter,
  Zap,
  Flame,
  Crown,
  Target,
  BookOpen,
  Trophy,
  Layers,
  GraduationCap,
  Info,
  Play,
  Search,
} from 'lucide-react';
import { UserStats } from '../types/quiz';
import { BadgeDefinition, BadgeTier, BadgeCategory, BADGE_CATALOG, BADGE_TIER_CONFIG } from '../types/badges';
import { soundFx } from '../utils/audio';

interface BadgesGridProps {
  stats: UserStats;
  onCelebrateBadge?: (badge: BadgeDefinition) => void;
}

export const BadgesGrid: React.FC<BadgesGridProps> = ({ stats, onCelebrateBadge }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'locked' | BadgeTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<BadgeDefinition | null>(null);

  // Compute status for all badges
  const evaluatedBadges = useMemo(() => {
    return BADGE_CATALOG.map((badge) => {
      const isUnlocked = badge.checkUnlocked(stats);
      const progress = badge.getProgress(stats);
      return {
        ...badge,
        isUnlocked,
        progress,
      };
    });
  }, [stats]);

  // Totals & Progress
  const totalCount = evaluatedBadges.length;
  const unlockedCount = evaluatedBadges.filter((b) => b.isUnlocked).length;
  const overallPercent = Math.round((unlockedCount / totalCount) * 100);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return evaluatedBadges.filter((badge) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = badge.title.toLowerCase().includes(q);
        const matchDesc = badge.description.toLowerCase().includes(q);
        const matchCategory = badge.category.toLowerCase().includes(q);
        const matchTier = badge.tier.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCategory && !matchTier) return false;
      }

      // Tab filter
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'unlocked') return badge.isUnlocked;
      if (selectedFilter === 'locked') return !badge.isUnlocked;
      return badge.tier === selectedFilter;
    });
  }, [evaluatedBadges, selectedFilter, searchQuery]);

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean, tier: BadgeTier) => {
    const iconClass = `w-6 h-6 ${isUnlocked ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`;
    switch (iconName) {
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Crown':
        return <Crown className={iconClass} />;
      case 'Trophy':
        return <Trophy className={iconClass} />;
      case 'Zap':
        return <Zap className={iconClass} />;
      case 'Target':
        return <Target className={iconClass} />;
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={iconClass} />;
      case 'Layers':
        return <Layers className={iconClass} />;
      case 'GraduationCap':
        return <GraduationCap className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Progress Summary Header */}
      <div className="rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Trophy className="w-4 h-4" />
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Badges & Achievements
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Earn badges as you hit milestones, maintain your streak, answer questions with high precision, and explore custom quizzes.
            </p>
          </div>

          {/* Progress Ring / Percentage Box */}
          <div className="flex items-center gap-4 bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs shrink-0">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Mastery Progress</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {unlockedCount} / {totalCount}
                </span>
              </div>
              <div className="w-40 sm:w-48 bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                />
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                {overallPercent}% of all badges unlocked
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { id: 'locked', label: `Locked (${totalCount - unlockedCount})` },
            { id: 'Diamond', label: 'Diamond' },
            { id: 'Gold', label: 'Gold' },
            { id: 'Silver', label: 'Silver' },
            { id: 'Bronze', label: 'Bronze' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setSelectedFilter(tab.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search badges..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Badges Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const tierConfig = BADGE_TIER_CONFIG[badge.tier];
          return (
            <motion.div
              key={badge.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                badge.isUnlocked
                  ? 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-80 hover:opacity-100'
              }`}
              onClick={() => {
                soundFx.playSelect();
                if (badge.isUnlocked && onCelebrateBadge) {
                  onCelebrateBadge(badge);
                } else {
                  setSelectedBadgeDetail(badge);
                }
              }}
            >
              {/* Subtle background tier tint */}
              {badge.isUnlocked && (
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity"
                  style={{ background: tierConfig.glowColor }}
                />
              )}

              {/* Card Top: Medallion & Tier Tag */}
              <div className="space-y-3.5">
                <div className="flex items-start justify-between">
                  {/* Badge Medallion */}
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${
                        badge.isUnlocked
                          ? `bg-gradient-to-br ${tierConfig.gradient} shadow-md`
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {renderBadgeIcon(badge.iconName, badge.isUnlocked, badge.tier)}
                    </div>

                    {/* Unlocked / Locked Mini Status Pill */}
                    <div className="absolute -bottom-1 -right-1">
                      {badge.isUnlocked ? (
                        <div
                          className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-800"
                          title="Unlocked!"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center border-2 border-white dark:border-slate-800"
                          title="Locked"
                        >
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tier & XP Chip */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        badge.isUnlocked ? tierConfig.pillBgLight + ' ' + tierConfig.pillBgDark : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {badge.tier}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 text-amber-500" />
                      +{badge.xpBonus} XP
                    </span>
                  </div>
                </div>

                {/* Badge Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                      {badge.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Progress Bar or Unlocked Tag */}
              <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                {badge.isUnlocked ? (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                    {onCelebrateBadge && (
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
                        <Play className="w-2.5 h-2.5 fill-indigo-500" />
                        <span>Celebrate</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span>{badge.progress.label}</span>
                      <span>{badge.progress.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${badge.progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
          <Award className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold">No badges found matching your search</p>
          <button
            type="button"
            onClick={() => {
              setSelectedFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Badge Detail Drawer / Modal for Locked Badges */}
      <AnimatePresence>
        {selectedBadgeDetail && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-center"
            >
              <div className="flex justify-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    selectedBadgeDetail.isUnlocked
                      ? `bg-gradient-to-br ${BADGE_TIER_CONFIG[selectedBadgeDetail.tier].gradient}`
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {renderBadgeIcon(
                    selectedBadgeDetail.iconName,
                    selectedBadgeDetail.isUnlocked,
                    selectedBadgeDetail.tier
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    BADGE_TIER_CONFIG[selectedBadgeDetail.tier].pillBgLight
                  } ${BADGE_TIER_CONFIG[selectedBadgeDetail.tier].pillBgDark}`}
                >
                  {selectedBadgeDetail.tier} Tier • {selectedBadgeDetail.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedBadgeDetail.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {selectedBadgeDetail.description}
                </p>
              </div>

              {/* Requirement Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                  <span>Requirement:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {selectedBadgeDetail.requirementText}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Current Progress:</span>
                  <span className="font-bold">{selectedBadgeDetail.progress.label}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${selectedBadgeDetail.progress.percent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedBadgeDetail.isUnlocked && onCelebrateBadge && (
                  <button
                    type="button"
                    onClick={() => {
                      const b = selectedBadgeDetail;
                      setSelectedBadgeDetail(null);
                      onCelebrateBadge(b);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs cursor-pointer"
                  >
                    Play Celebration
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedBadgeDetail(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
