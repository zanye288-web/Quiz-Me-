import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Zap,
  Flame,
  Crown,
  Target,
  BookOpen,
  Layers,
  GraduationCap,
  Search,
  Filter,
  Star,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Compass,
} from 'lucide-react';
import { UserStats, PersonaType, QuizResponse } from '../types/quiz';
import { BadgeDefinition, BadgeTier, BADGE_CATALOG, BADGE_TIER_CONFIG } from '../types/badges';
import { soundFx } from '../utils/audio';
import { QuizHistoryRecord } from './HistoryView';
import { AdaptiveLearningPath } from './AdaptiveLearningPath';

interface AchievementsViewProps {
  stats: UserStats;
  persona: PersonaType;
  historyRecords?: QuizHistoryRecord[];
  onStartQuiz?: (quiz: QuizResponse) => void;
  onGenerateNotes?: (topic: string) => void;
  onCelebrateBadge?: (badge: BadgeDefinition) => void;
  onClaimXpBonus?: (badgeId: string, xpBonus: number) => void;
  initialTab?: 'skill_tree' | 'badges';
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  stats,
  persona,
  historyRecords = [],
  onStartQuiz,
  onGenerateNotes,
  onCelebrateBadge,
  onClaimXpBonus,
  initialTab = 'skill_tree',
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'skill_tree' | 'badges'>(initialTab);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'locked' | BadgeTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<BadgeDefinition | null>(null);
  const [claimedBadges, setClaimedBadges] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('quizme_claimed_badge_bonuses');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Calculate status for each badge
  const evaluatedBadges = useMemo(() => {
    return BADGE_CATALOG.map((badge) => {
      const isUnlocked = badge.checkUnlocked(stats);
      const progress = badge.getProgress(stats);
      const isClaimed = claimedBadges.has(badge.id);
      return {
        ...badge,
        isUnlocked,
        progress,
        isClaimed,
      };
    });
  }, [stats, claimedBadges]);

  const totalCount = evaluatedBadges.length;
  const unlockedCount = evaluatedBadges.filter((b) => b.isUnlocked).length;
  const overallPercent = Math.round((unlockedCount / totalCount) * 100);

  // Rarity Breakdown
  const tierCounts = useMemo(() => {
    const counts = { Bronze: 0, Silver: 0, Gold: 0, Diamond: 0, Special: 0 };
    evaluatedBadges.forEach((b) => {
      if (b.isUnlocked && b.tier in counts) {
        counts[b.tier as keyof typeof counts]++;
      }
    });
    return counts;
  }, [evaluatedBadges]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return evaluatedBadges.filter((b) => {
      // Category filter
      if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchDesc = b.description.toLowerCase().includes(q);
        const matchCategory = b.category.toLowerCase().includes(q);
        const matchTier = b.tier.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCategory && !matchTier) return false;
      }

      // Tab filter
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'unlocked') return b.isUnlocked;
      if (selectedFilter === 'locked') return !b.isUnlocked;
      return b.tier === selectedFilter;
    });
  }, [evaluatedBadges, selectedFilter, searchQuery, selectedCategory]);

  const handleClaimBonus = (e: React.MouseEvent, badge: BadgeDefinition) => {
    e.stopPropagation();
    soundFx.playBadgeUnlock();
    const newClaimed = new Set(claimedBadges);
    newClaimed.add(badge.id);
    setClaimedBadges(newClaimed);
    try {
      localStorage.setItem('quizme_claimed_badge_bonuses', JSON.stringify([...newClaimed]));
    } catch {}

    if (onClaimXpBonus) {
      onClaimXpBonus(badge.id, badge.xpBonus);
    }
  };

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
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
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Top View Selector: Skill Tree vs Badges */}
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
        <button
          type="button"
          onClick={() => {
            soundFx.playSelect();
            setActiveViewTab('skill_tree');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeViewTab === 'skill_tree'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-200/50 dark:border-indigo-800/50'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 text-indigo-500" />
          <span>Adaptive Learning Path (Skill Tree)</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold border border-indigo-200 dark:border-indigo-800 hidden sm:inline">
            Interactive Tree
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playSelect();
            setActiveViewTab('badges');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeViewTab === 'badges'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200/50 dark:border-amber-800/50'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Trophies & Badges Collection</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-extrabold border border-amber-200 dark:border-amber-800 hidden sm:inline">
            {unlockedCount}/{totalCount}
          </span>
        </button>
      </div>

      {activeViewTab === 'skill_tree' ? (
        <AdaptiveLearningPath
          stats={stats}
          persona={persona}
          historyRecords={historyRecords}
          onStartQuiz={onStartQuiz}
          onGenerateNotes={onGenerateNotes}
        />
      ) : (
        <>
          {/* Header Banner */}
          <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Academic Trophy Room & Badges</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Achievements System
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Unlock prestigious badges as you master new subjects, maintain daily study streaks, maintain high accuracy, and explore challenging questions.
            </p>
          </div>

          {/* Trophy Stats Box */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-3xl border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="text-2xl font-black text-amber-500">
                {unlockedCount} / {totalCount}
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Unlocked
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-indigo-500">
                {overallPercent}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Mastery Rate
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">Overall Trophy Progress</span>
            <span className="text-amber-600 dark:text-amber-400">{unlockedCount} of {totalCount} Badges Unlocked</span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* Tier Count Pills */}
        <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
            🥉 Bronze: {tierCounts.Bronze}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
            🥈 Silver: {tierCounts.Silver}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 font-bold">
            🥇 Gold: {tierCounts.Gold}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold">
            💎 Diamond: {tierCounts.Diamond}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold">
            👑 Special: {tierCounts.Special}
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search achievements by name or objective..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto">
            {(['all', 'unlocked', 'locked', 'Gold', 'Diamond'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setSelectedFilter(tab);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  selectedFilter === tab
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {tab === 'all' ? 'All Trophies' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Milestone', 'Accuracy', 'Streak', 'XP', 'Mastery', 'Special'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs font-extrabold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const tierCfg = BADGE_TIER_CONFIG[badge.tier] || BADGE_TIER_CONFIG.Bronze;
          const isUnlocked = badge.isUnlocked;

          return (
            <div
              key={badge.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedBadgeDetail(badge);
                if (isUnlocked && onCelebrateBadge) {
                  onCelebrateBadge(badge);
                }
              }}
              className={`rounded-3xl p-5 border transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-xs hover:shadow-md'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
              }`}
            >
              <div>
                {/* Header with Icon and Tier */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                      isUnlocked
                        ? `bg-gradient-to-tr ${tierCfg.gradient}`
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    {isUnlocked ? renderBadgeIcon(badge.iconName, true) : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${tierCfg.pillBgLight} dark:${tierCfg.pillBgDark}`}>
                      {badge.tier}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      +{badge.xpBonus} XP
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {badge.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Progress Bar and Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Requirement:</span>
                  <span className={isUnlocked ? 'text-emerald-600 font-extrabold' : 'text-slate-600 dark:text-slate-300'}>
                    {badge.progress.label || badge.requirementText}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, badge.progress.percent)}%` }}
                  />
                </div>

                {/* Claim XP Bonus Button if unlocked */}
                {isUnlocked && (
                  <div className="pt-1">
                    {badge.isClaimed ? (
                      <div className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>XP Bonus Claimed (+{badge.xpBonus} XP)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleClaimBonus(e, badge)}
                        className="w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Claim +{badge.xpBonus} XP Bonus</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadgeDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="text-center space-y-2">
                <div
                  className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
                    selectedBadgeDetail.checkUnlocked(stats)
                      ? `bg-gradient-to-tr ${BADGE_TIER_CONFIG[selectedBadgeDetail.tier].gradient}`
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <span className="text-4xl">{selectedBadgeDetail.emoji}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedBadgeDetail.title}
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {selectedBadgeDetail.tier} Tier &bull; {selectedBadgeDetail.category}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 leading-relaxed">
                  {selectedBadgeDetail.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-500">Requirement:</span>
                  <span className="text-slate-900 dark:text-white">{selectedBadgeDetail.requirementText}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-500">Reward:</span>
                  <span className="text-amber-600 font-extrabold">+{selectedBadgeDetail.xpBonus} XP Bonus</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-500">Current Status:</span>
                  <span className={selectedBadgeDetail.checkUnlocked(stats) ? 'text-emerald-600 font-black' : 'text-slate-400'}>
                    {selectedBadgeDetail.checkUnlocked(stats) ? 'Unlocked & Verified' : 'In Progress'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadgeDetail(null)}
                className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs cursor-pointer transition-all"
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};
