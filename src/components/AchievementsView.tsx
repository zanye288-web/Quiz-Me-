import React, { useState, useMemo } from 'react';
import {
  Award,
  Flame,
  Crown,
  Zap,
  Target,
  BookOpen,
  Sparkles,
  Trophy,
  CheckCircle2,
  Layers,
  GraduationCap,
  Lock,
  Filter,
  TrendingUp,
  Share2,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  Gift,
  PartyPopper,
  SlidersHorizontal,
  Shield,
  Compass,
  Star,
} from 'lucide-react';
import { UserStats, PersonaType } from '../types/quiz';
import {
  BADGE_CATALOG,
  BADGE_TIER_CONFIG,
  BADGE_CATEGORY_META,
  BadgeCategory,
  BadgeDefinition,
  BadgeTier,
} from '../types/badges';
import { soundFx } from '../utils/audio';
import { BadgeCelebrationModal } from './BadgeCelebrationModal';
import { MasteryProgressPath } from './MasteryProgressPath';
import { buildInterleavedMixQuiz } from '../utils/adaptiveLearningEngine';

interface AchievementsViewProps {
  stats: UserStats;
  persona: PersonaType;
  historyRecords?: any[];
  onStartQuiz?: (quiz: any) => void;
  onGenerateNotes?: (topic: string) => void;
  onCelebrateBadge?: (badge: BadgeDefinition) => void;
  onClaimXpBonus?: (badgeId: string, xpBonus: number) => void;
  onSelectTab?: (tab: any) => void;
  onUpdateStats?: (delta: Partial<UserStats>) => void;
}

const ITEMS_PER_PAGE = 48;

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  stats,
  persona,
  onStartQuiz,
  onCelebrateBadge,
  onClaimXpBonus,
  onSelectTab,
  onUpdateStats,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | BadgeCategory>('all');
  const [selectedTier, setSelectedTier] = useState<'all' | BadgeTier>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'in_progress' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'closest' | 'tier_desc' | 'tier_asc' | 'xp_desc'>('closest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [previewBadge, setPreviewBadge] = useState<BadgeDefinition | null>(null);
  const [claimedBadgeIds, setClaimedBadgeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quizme_claimed_badge_xp_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [claimedQuests, setClaimedQuests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quizme_claimed_daily_quests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Precompute unlock status and progress for all 1,105+ badges
  const enrichedBadges = useMemo(() => {
    const tierRank: Record<BadgeTier, number> = {
      Bronze: 1,
      Silver: 2,
      Gold: 3,
      Diamond: 4,
      Mythic: 5,
    };

    return BADGE_CATALOG.map((badge) => {
      const unlocked = badge.checkUnlocked(stats);
      const progress = badge.getProgress(stats);
      return {
        badge,
        unlocked,
        progress,
        tierWeight: tierRank[badge.tier] || 1,
      };
    });
  }, [stats]);

  const unlockedList = useMemo(
    () => enrichedBadges.filter((item) => item.unlocked),
    [enrichedBadges]
  );

  const totalBonusXpEarned = useMemo(
    () => unlockedList.reduce((acc, item) => acc + item.badge.xpBonus, 0),
    [unlockedList]
  );

  // Closest to unlock (Next Up Milestones)
  const nextUpMilestones = useMemo(() => {
    return enrichedBadges
      .filter((item) => !item.unlocked && item.progress.percent > 0)
      .sort((a, b) => b.progress.percent - a.progress.percent || a.badge.xpBonus - b.badge.xpBonus)
      .slice(0, 4);
  }, [enrichedBadges]);

  // Tier breakdown counts
  const tierBreakdown = useMemo(() => {
    const counts: Record<BadgeTier, { unlocked: number; total: number }> = {
      Bronze: { unlocked: 0, total: 0 },
      Silver: { unlocked: 0, total: 0 },
      Gold: { unlocked: 0, total: 0 },
      Diamond: { unlocked: 0, total: 0 },
      Mythic: { unlocked: 0, total: 0 },
    };
    enrichedBadges.forEach(({ badge, unlocked }) => {
      counts[badge.tier].total += 1;
      if (unlocked) counts[badge.tier].unlocked += 1;
    });
    return counts;
  }, [enrichedBadges]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, { unlocked: number; total: number }> = {
      all: { unlocked: unlockedList.length, total: enrichedBadges.length },
    };
    (Object.keys(BADGE_CATEGORY_META) as BadgeCategory[]).forEach((cat) => {
      map[cat] = { unlocked: 0, total: 0 };
    });
    enrichedBadges.forEach(({ badge, unlocked }) => {
      if (map[badge.category]) {
        map[badge.category].total += 1;
        if (unlocked) map[badge.category].unlocked += 1;
      }
    });
    return map;
  }, [enrichedBadges, unlockedList.length]);

  // Filtered & sorted badges
  const filteredBadges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = enrichedBadges.filter(({ badge, unlocked, progress }) => {
      const matchesCat = selectedCategory === 'all' || badge.category === selectedCategory;
      const matchesTier = selectedTier === 'all' || badge.tier === selectedTier;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'unlocked'
          ? unlocked
          : statusFilter === 'in_progress'
          ? !unlocked && progress.percent > 0
          : !unlocked;
      const matchesSearch =
        !q ||
        badge.title.toLowerCase().includes(q) ||
        badge.description.toLowerCase().includes(q) ||
        badge.requirementText.toLowerCase().includes(q) ||
        badge.tier.toLowerCase().includes(q);

      return matchesCat && matchesTier && matchesStatus && matchesSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === 'closest') {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return b.progress.percent - a.progress.percent || a.tierWeight - b.tierWeight;
      }
      if (sortBy === 'tier_desc') {
        return b.tierWeight - a.tierWeight || b.progress.percent - a.progress.percent;
      }
      if (sortBy === 'tier_asc') {
        return a.tierWeight - b.tierWeight || b.progress.percent - a.progress.percent;
      }
      return b.badge.xpBonus - a.badge.xpBonus;
    });
  }, [enrichedBadges, selectedCategory, selectedTier, statusFilter, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBadges.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBadges = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredBadges.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBadges, safePage]);

  // Daily Gamified Quests
  const dailyQuests = useMemo(
    () => [
      {
        id: 'quest_daily_quiz',
        title: 'Complete an Assessment',
        desc: 'Finish at least 1 quiz in the AI Studio or Curated Tracks',
        current: Math.min(stats.quizzesCompleted, 1),
        target: 1,
        xpReward: 150,
        gemsReward: 25,
        emoji: '⚡',
      },
      {
        id: 'quest_precision_10',
        title: 'Answer 10 Questions Correctly',
        desc: 'Demonstrate sharp recall across your study sessions',
        current: Math.min(stats.totalCorrect, 10),
        target: 10,
        xpReward: 250,
        gemsReward: 40,
        emoji: '🎯',
      },
      {
        id: 'quest_streak_3',
        title: 'Maintain a 3+ Day Streak',
        desc: 'Keep your study flame burning bright',
        current: Math.min(stats.streak, 3),
        target: 3,
        xpReward: 300,
        gemsReward: 50,
        emoji: '🔥',
      },
    ],
    [stats.quizzesCompleted, stats.totalCorrect, stats.streak]
  );

  const handleClaimQuest = (quest: (typeof dailyQuests)[0]) => {
    if (claimedQuests.includes(quest.id) || quest.current < quest.target) return;
    soundFx.playBadgeUnlock();
    const updatedClaimed = [...claimedQuests, quest.id];
    setClaimedQuests(updatedClaimed);
    try {
      localStorage.setItem('quizme_claimed_daily_quests', JSON.stringify(updatedClaimed));
    } catch {
      // ignore
    }
    if (onUpdateStats) {
      onUpdateStats({
        xp: stats.xp + quest.xpReward,
        gems: stats.gems + quest.gemsReward,
      });
    } else if (onClaimXpBonus) {
      onClaimXpBonus(quest.id, quest.xpReward);
    }
  };

  const handleClaimBadgeXp = (e: React.MouseEvent, badge: BadgeDefinition) => {
    e.stopPropagation();
    if (claimedBadgeIds.includes(badge.id)) return;
    soundFx.playBadgeUnlock();
    const updated = [...claimedBadgeIds, badge.id];
    setClaimedBadgeIds(updated);
    try {
      localStorage.setItem('quizme_claimed_badge_xp_v2', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (onClaimXpBonus) {
      onClaimXpBonus(badge.id, badge.xpBonus);
    } else if (onUpdateStats) {
      onUpdateStats({
        xp: stats.xp + badge.xpBonus,
        gems: stats.gems + 5,
      });
    }
  };

  const renderBadgeIcon = (iconName: BadgeDefinition['iconName'], unlocked: boolean) => {
    const iconClass = `w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
      unlocked ? 'text-white drop-shadow-xs' : 'text-slate-400 dark:text-slate-600'
    }`;

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
      case 'Shield':
        return <Shield className={iconClass} />;
      case 'Compass':
        return <Compass className={iconClass} />;
      case 'Star':
        return <Star className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const handleShareAchievements = () => {
    soundFx.playClick();
    const summary = `🏆 Quiz Me! Grand Trophy Vault:\n• Unlocked: ${unlockedList.length}/${BADGE_CATALOG.length.toLocaleString()} Achievements\n• Scholar Level ${stats.level} (${stats.xp.toLocaleString()} XP)\n• Active Streak: ${stats.streak} Days 🔥\n• Bonus Achievement XP: +${totalBonusXpEarned.toLocaleString()} XP`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const completionPercentage = Math.round((unlockedList.length / BADGE_CATALOG.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Hero Banner */}
      <div className="comic-tab-hero rounded-3xl text-white p-6 sm:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
                ISSUE #10 · TROPHY VAULT
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-950/60 text-amber-300 border border-amber-400/40">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Grand Hall of 1,100+ Achievements</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/50 text-cyan-200 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>5 Prestige Tiers • Click Any Unlocked Trophy to Celebrate</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-xs">
              Scholar Achievements &amp; Trophy Vault
            </h1>
            <p className="text-indigo-100 text-sm leading-relaxed font-medium">
              Conquer over <span className="font-black text-amber-300">{BADGE_CATALOG.length.toLocaleString()}</span> milestones across Daily Streaks, Precision Mastery, Kahoot! Live Arena Battles, Scholar Levels, and Polymath Synergies.
            </p>
          </div>

          {/* Right Summary Stat Pills */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                Unlocked
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {unlockedList.length.toLocaleString()}
                <span className="text-xs text-indigo-300 font-semibold">
                  /{BADGE_CATALOG.length.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                Bonus XP
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                +{totalBonusXpEarned.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                Vault Mastery
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {completionPercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Tier Breakdown Progress Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {(['Bronze', 'Silver', 'Gold', 'Diamond', 'Mythic'] as BadgeTier[]).map((tier) => {
            const info = tierBreakdown[tier];
            const tierCfg = BADGE_TIER_CONFIG[tier];
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTier(isSelected ? 'all' : tier);
                  setCurrentPage(1);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-white/20 border-white shadow-lg scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${tierCfg.gradient} shadow-xs`} />
                  <div>
                    <div className="text-xs font-black text-white">{tier}</div>
                    <div className="text-[10px] text-slate-300 font-semibold">
                      {info.unlocked} / {info.total}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-black text-indigo-200">
                  {info.total > 0 ? Math.round((info.unlocked / info.total) * 100) : 0}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Action Row */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
              <span>Global Achievement Vault Progress</span>
              <span>
                {unlockedList.length.toLocaleString()} of {BADGE_CATALOG.length.toLocaleString()} Unlocked
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800/90 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-fuchsia-400 transition-all duration-700"
                style={{ width: `${Math.max(2, completionPercentage)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onSelectTab && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectTab('live');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md"
              >
                <Crown className="w-4 h-4" />
                <span>Play Kahoot! Live Battle</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleShareAchievements}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/15"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied Vault Summary!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Vault</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fun Layer Tied to Learning: Mastery Progress Map & Unlockable Cosmetics */}
      <MasteryProgressPath
        streakDays={stats.streak}
        onLaunchInterleavedQuiz={
          onStartQuiz ? () => onStartQuiz(buildInterleavedMixQuiz('Student')) : undefined
        }
        onOpenMyNotes={onSelectTab ? () => onSelectTab('notes') : undefined}
      />

      {/* Daily Gamified Quests & Next Up Milestones Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Quests (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Active Scholar Bounties
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Complete tasks to claim instant XP &amp; Gem boosts
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {dailyQuests.map((q) => {
              const isDone = q.current >= q.target;
              const isClaimed = claimedQuests.includes(q.id);
              const pct = Math.min(100, Math.round((q.current / q.target) * 100));

              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isClaimed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/50'
                      : isDone
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xl shrink-0">{q.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {q.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {q.desc}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">
                          {q.current}/{q.target}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-black">
                        <Check className="w-3.5 h-3.5" />
                        Claimed
                      </span>
                    ) : isDone ? (
                      <button
                        type="button"
                        onClick={() => handleClaimQuest(q)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-black shadow-md cursor-pointer animate-bounce"
                      >
                        Claim +{q.xpReward} XP
                      </button>
                    ) : (
                      <span className="inline-flex flex-col items-end text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="text-amber-600 dark:text-amber-400 font-black">
                          +{q.xpReward} XP
                        </span>
                        <span>+{q.gemsReward} 💎</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Up Milestones (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Closest to Unlock • Next Milestones
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Your highest-progress locked trophies ready to be conquered next
                </p>
              </div>
            </div>
            {onSelectTab && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectTab('studio');
                }}
                className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Launch Quiz →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nextUpMilestones.map(({ badge, progress }) => {
              const tierCfg = BADGE_TIER_CONFIG[badge.tier];
              return (
                <div
                  key={badge.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tierCfg.gradient} flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        {renderBadgeIcon(badge.iconName, true)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {badge.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {badge.requirementText}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${tierCfg.badgeBg}`}
                    >
                      +{badge.xpBonus} XP
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">
                        Progress: {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">
                        {progress.percent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${tierCfg.gradient} transition-all duration-500`}
                        style={{ width: `${Math.max(5, progress.percent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search, Category Filter Pills & Sort Controls */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Top Search + Status & Sort Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search all ${BADGE_CATALOG.length.toLocaleString()} achievements by title, tier, or requirement...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'unlocked', label: `Unlocked (${unlockedList.length})` },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'locked', label: 'Locked' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setStatusFilter(st.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  soundFx.playClick();
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="closest">Sort: Closest to Unlock</option>
                <option value="tier_desc">Sort: Highest Tier First</option>
                <option value="tier_asc">Sort: Easiest Tier First</option>
                <option value="xp_desc">Sort: Highest XP Bonus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 dark:bg-white/15">
              {categoryCounts.all?.total || BADGE_CATALOG.length}
            </span>
          </button>

          {(Object.keys(BADGE_CATEGORY_META) as BadgeCategory[]).map((cat) => {
            const meta = BADGE_CATEGORY_META[cat];
            const counts = categoryCounts[cat] || { unlocked: 0, total: 0 };
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{meta.shortLabel}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {counts.unlocked}/{counts.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Pagination Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Showing{' '}
          <span className="font-black text-slate-900 dark:text-white">
            {filteredBadges.length > 0 ? (safePage - 1) * ITEMS_PER_PAGE + 1 : 0}–
            {Math.min(safePage * ITEMS_PER_PAGE, filteredBadges.length)}
          </span>{' '}
          of <span className="font-black text-indigo-600 dark:text-indigo-400">{filteredBadges.length.toLocaleString()}</span> matching achievements
          {selectedTier !== 'all' && ` • Tier: ${selectedTier}`}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => {
                soundFx.playClick();
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-800 dark:text-slate-200">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => {
                soundFx.playClick();
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Achievement Cards Grid */}
      {paginatedBadges.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Trophy className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            No Matching Achievements Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try clearing your search query or switching your category and tier filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedTier('all');
              setStatusFilter('all');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedBadges.map(({ badge, unlocked, progress }) => {
            const tierCfg = BADGE_TIER_CONFIG[badge.tier];

            return (
              <div
                key={badge.id}
                onClick={() => {
                  if (unlocked) {
                    if (onCelebrateBadge) {
                      onCelebrateBadge(badge);
                    } else {
                      setPreviewBadge(badge);
                    }
                  } else {
                    soundFx.playClick();
                  }
                }}
                className={`group relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  unlocked
                    ? `bg-white dark:bg-slate-900 ${tierCfg.border} shadow-md ${tierCfg.glow} hover:-translate-y-1 cursor-pointer`
                    : 'bg-slate-50/90 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80 opacity-85 hover:opacity-100'
                }`}
              >
                {unlocked && (
                  <div
                    className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${tierCfg.gradient} opacity-15 blur-xl pointer-events-none group-hover:opacity-30 transition-opacity`}
                  />
                )}

                <div className="space-y-3.5 relative z-10">
                  {/* Top Row: Icon Medallion + Tier & XP */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
                        unlocked
                          ? `bg-gradient-to-br ${tierCfg.gradient} shadow-lg`
                          : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {renderBadgeIcon(badge.iconName, unlocked)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${tierCfg.badgeBg}`}
                      >
                        {unlocked ? (
                          <Sparkles className="w-2.5 h-2.5" />
                        ) : (
                          <Lock className="w-2.5 h-2.5 opacity-60" />
                        )}
                        <span>{badge.tier}</span>
                      </span>

                      {unlocked && !claimedBadgeIds.includes(badge.id) ? (
                        <button
                          type="button"
                          onClick={(e) => handleClaimBadgeXp(e, badge)}
                          className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black shadow-2xs cursor-pointer transition-transform hover:scale-105"
                        >
                          Claim +{badge.xpBonus} XP
                        </button>
                      ) : (
                        <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                          {unlocked && claimedBadgeIds.includes(badge.id)
                            ? `✓ +${badge.xpBonus} XP`
                            : `+${badge.xpBonus} XP`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      className={`text-sm font-black tracking-tight line-clamp-1 ${
                        unlocked
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                      title={badge.title}
                    >
                      {badge.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 relative z-10">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[65%]">
                      {badge.requirementText}
                    </span>
                    <span
                      className={
                        unlocked
                          ? 'text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1'
                          : 'text-slate-600 dark:text-slate-400'
                      }
                    >
                      {unlocked ? (
                        <>
                          <PartyPopper className="w-3 h-3" />
                          <span>Celebrate!</span>
                        </>
                      ) : (
                        `${progress.current.toLocaleString()}/${progress.target.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        unlocked
                          ? `bg-gradient-to-r ${tierCfg.gradient}`
                          : 'bg-indigo-500 dark:bg-indigo-400'
                      }`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => {
              soundFx.playClick();
              setCurrentPage(1);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
          >
            First
          </button>
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => {
              soundFx.playClick();
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-black text-indigo-700 dark:text-indigo-300">
            Page {safePage} of {totalPages} ({BADGE_CATALOG.length.toLocaleString()} Total)
          </span>

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => {
              soundFx.playClick();
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => {
              soundFx.playClick();
              setCurrentPage(totalPages);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
          >
            Last
          </button>
        </div>
      )}

      {/* Celebration Modal Replay */}
      <BadgeCelebrationModal
        badge={previewBadge}
        isOpen={!!previewBadge}
        onClose={() => setPreviewBadge(null)}
      />
    </div>
  );
};
