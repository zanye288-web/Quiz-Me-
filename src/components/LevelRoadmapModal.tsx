import React, { useState } from 'react';
import {
  X,
  Flame,
  Zap,
  Gift,
  Crown,
  CheckCircle2,
  Lock,
  Sparkles,
  Coins,
  TrendingUp,
  Calendar,
  Award,
} from 'lucide-react';
import { UserStats } from '../types/quiz';
import {
  getLevelProgress,
  PRESTIGE_RANKS,
  LEVEL_MILESTONE_REWARDS,
  DAILY_CHECKIN_REWARDS,
  getDailyRetentionCheckIn,
  claimDailyRetentionCheckIn,
  getClaimedLevelMilestones,
  markLevelMilestoneClaimed,
  getCumulativeXpForLevel,
  getXpRequiredForLevelStep,
} from '../utils/levelingSystem';
import { addMascotCoinsGlobal } from './MascotAvatar';
import { soundFx } from '../utils/audio';

interface LevelRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onUpdateStats: (delta: Partial<UserStats>) => void;
}

export const LevelRoadmapModal: React.FC<LevelRoadmapModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const [checkInState, setCheckInState] = useState(() => getDailyRetentionCheckIn());
  const [claimedMilestones, setClaimedMilestones] = useState<number[]>(() =>
    getClaimedLevelMilestones()
  );
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'daily' | 'milestones'>('roadmap');

  if (!isOpen) return null;

  const progress = getLevelProgress(stats.xp || 0, stats.streak || 1);

  const showToast = (msg: string) => {
    setRewardToast(msg);
    setTimeout(() => setRewardToast(null), 3500);
  };

  const handleClaimDailyCheckIn = () => {
    const res = claimDailyRetentionCheckIn();
    if (!res) return;
    soundFx.playBadgeUnlock();
    setCheckInState(res.newState);
    const newCoins = addMascotCoinsGlobal(res.reward.coins);
    onUpdateStats({
      xp: (stats.xp || 0) + res.reward.xp,
      gems: (stats.gems || 0) + res.reward.gems,
      coins: newCoins,
      streak: Math.max(1, (stats.streak || 1) + (res.newState.totalCheckIns > 1 ? 1 : 0)),
    });
    showToast(
      `Claimed ${res.reward.label}: +${res.reward.xp} XP, +${res.reward.gems} Gems & +${res.reward.coins} Mascot Coins!`
    );
  };

  const handleClaimMilestoneChest = (milestone: (typeof LEVEL_MILESTONE_REWARDS)[0]) => {
    if (progress.level < milestone.level || claimedMilestones.includes(milestone.level)) return;
    soundFx.playBadgeUnlock();
    const updated = markLevelMilestoneClaimed(milestone.level);
    setClaimedMilestones(updated);
    const newCoins = addMascotCoinsGlobal(milestone.coins);
    onUpdateStats({
      xp: (stats.xp || 0) + milestone.xpBonus,
      gems: (stats.gems || 0) + milestone.gems,
      coins: newCoins,
    });
    showToast(
      `Opened ${milestone.title}: +${milestone.xpBonus} XP, +${milestone.gems} Gems & +${milestone.coins} Coins!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Hero Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white border-b border-indigo-500/30 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center shadow-lg border border-white/20 shrink-0">
                <span className="text-xl leading-none">{progress.rank.badgeEmoji}</span>
                <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                  Lv.{progress.level}
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">
                    {progress.rank.title}
                  </h2>
                  <span className="text-[11px] font-bold text-amber-300">
                    · {progress.rank.tierName} Tier
                  </span>
                  <span className="text-[11px] font-medium text-indigo-200">
                    · Season 3 Progression
                  </span>
                </div>
                <p className="text-xs text-indigo-200/90 mt-0.5">{progress.rank.perkDescription}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Level XP Bar */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
              <div className="flex items-center gap-2 font-bold">
                <span className="text-indigo-200">
                  Level {progress.level} Progress:
                </span>
                <span className="text-white font-black">
                  {progress.currentLevelXp.toLocaleString()} /{' '}
                  {progress.xpRequiredForNextLevel.toLocaleString()} XP ({progress.progressPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {stats.streak}d Streak (+{progress.streakMultiplierPercent}% XP Boost)
                </span>
                <span className="text-emerald-300 font-bold">
                  {progress.xpToNextLevel.toLocaleString()} XP to Level {progress.level + 1}
                </span>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800/90 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 transition-all duration-500"
                style={{ width: `${Math.max(4, progress.progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reward Toast */}
        {rewardToast && (
          <div className="mx-5 mt-3 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-md animate-in fade-in duration-150 shrink-0">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{rewardToast}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
          {[
            { id: 'roadmap', label: 'Prestige Rank Ladder', icon: Crown },
            {
              id: 'daily',
              label: '7-Day Retention Check-In',
              icon: Calendar,
              badge: !checkInState.claimedToday ? 'Claim!' : undefined,
            },
            {
              id: 'milestones',
              label: 'Level Milestone Chests',
              icon: Gift,
              badge:
                LEVEL_MILESTONE_REWARDS.filter(
                  (m) => progress.level >= m.level && !claimedMilestones.includes(m.level)
                ).length || undefined,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                  active
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span>How the Revamped Progression Curve Works</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Each level requires progressively more XP (`300 × Level^1.45`). Scoring 80%+ accuracy, completing your daily first quiz (+75 XP), and maintaining your daily streak (+5% XP per day up to +50%) accelerate your climb!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESTIGE_RANKS.map((r) => {
                  const isUnlocked = progress.level >= r.minLevel;
                  const isCurrent = progress.rank.id === r.id;
                  const reqTotalXp = getCumulativeXpForLevel(r.minLevel);
                  const stepXp = getXpRequiredForLevelStep(r.minLevel);

                  return (
                    <div
                      key={r.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                          : isUnlocked
                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-75'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${r.gradientClass} flex items-center justify-center text-xl shadow-xs shrink-0`}
                      >
                        {r.badgeEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {r.title}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                            Lv.{r.minLevel}
                            {r.maxLevel < 100 ? `–${r.maxLevel}` : '+'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          {r.perkDescription}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <span>Starts at {reqTotalXp.toLocaleString()} Total XP</span>
                          <span>·</span>
                          <span>{stepXp.toLocaleString()} XP/lvl step</span>
                          {isCurrent && (
                            <span className="ml-auto text-indigo-600 dark:text-indigo-400 font-black">
                              Current Rank
                            </span>
                          )}
                          {!isCurrent && isUnlocked && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                          )}
                          {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400 ml-auto" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🔥 7-Day Scholar Retention Check-In</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Check in every day to climb the 7-day reward ladder! Missing a day resets the 7-day cycle back to Day 1.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={checkInState.claimedToday}
                  onClick={handleClaimDailyCheckIn}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                    checkInState.claimedToday
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  }`}
                >
                  {checkInState.claimedToday
                    ? '✓ Claimed Today — Come Back Tomorrow!'
                    : `Claim Day ${checkInState.dayIndex} Reward`}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {DAILY_CHECKIN_REWARDS.map((item) => {
                  const isToday = item.day === checkInState.dayIndex;
                  const isPast =
                    item.day < checkInState.dayIndex ||
                    (isToday && checkInState.claimedToday);

                  return (
                    <div
                      key={item.day}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all ${
                        isToday && !checkInState.claimedToday
                          ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                          : isPast
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-75'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                        Day {item.day}
                      </span>
                      <span className="text-2xl">{item.icon}</span>
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          +{item.xp} XP
                        </div>
                        <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          +{item.coins} Coins · +{item.gems} Gems
                        </div>
                      </div>
                      {isPast ? (
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Claimed
                        </span>
                      ) : isToday ? (
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                          Available Now
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LEVEL_MILESTONE_REWARDS.map((m) => {
                const unlocked = progress.level >= m.level;
                const claimed = claimedMilestones.includes(m.level);

                return (
                  <div
                    key={m.level}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                      unlocked && !claimed
                        ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                        : claimed
                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                        {m.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {m.title}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            · Level {m.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {m.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                          <span className="text-indigo-600 dark:text-indigo-400">
                            +{m.xpBonus} XP
                          </span>
                          <span>·</span>
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <Coins className="w-3 h-3" /> +{m.coins} Coins
                          </span>
                          <span>·</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{m.gems} Gems
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!unlocked || claimed}
                      onClick={() => handleClaimMilestoneChest(m)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                        claimed
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 cursor-default'
                          : unlocked
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {claimed ? 'Claimed' : unlocked ? 'Open Chest' : `Lv.${m.level}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
