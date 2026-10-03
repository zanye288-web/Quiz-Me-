import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Crown,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Globe,
  Filter,
  Users,
  ChevronRight,
  Shield,
  Star,
} from 'lucide-react';
import { UserStats, PersonaType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { fetchLeaderboardUsers } from '../services/firestore';

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  persona: PersonaType;
  level: number;
  xp: number;
  streak: number;
  accuracy: number;
  tier: 'Diamond' | 'Master' | 'Gold' | 'Silver' | 'Bronze';
  badgeTitle: string;
  countryCode?: string;
  isCurrentUser?: boolean;
}

interface GlobalLeaderboardProps {
  stats: UserStats;
  persona: PersonaType;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ stats, persona }) => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'Diamond' | 'Master' | 'Gold'>('ALL');
  const [cheeredIds, setCheeredIds] = useState<Record<string, number>>({});
  const [cloudUsers, setCloudUsers] = useState<LeaderboardUser[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetchLeaderboardUsers(user?.uid)
      .then((users) => {
        if (isMounted) {
          setCloudUsers(users);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingLeaderboard(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Dynamically insert current user into standings
  const currentUserAccuracy =
    stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 100;

  const currentUserName = user?.displayName ? `${user.displayName} (You)` : 'You (Scholar)';
  const currentUserAvatar =
    user?.photoURL ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.uid || 'current_user')}`;

  const currentUserItem: LeaderboardUser = {
    rank: 1, // Will be computed
    id: user?.uid || 'current_user',
    name: currentUserName,
    avatar: currentUserAvatar,
    persona,
    level: stats.level,
    xp: stats.xp,
    streak: stats.streak,
    accuracy: currentUserAccuracy,
    tier: stats.xp >= 1500 ? 'Diamond' : stats.xp >= 1000 ? 'Master' : stats.xp >= 500 ? 'Gold' : stats.xp >= 200 ? 'Silver' : 'Bronze',
    badgeTitle: stats.level >= 5 ? 'Knowledge Maestro' : 'Active Learner',
    countryCode: '🌟',
    isCurrentUser: true,
  };

  // Filter out any duplicate cloud record of current user so in-memory live stats are shown
  const otherUsers = cloudUsers.filter(
    (u) => !u.isCurrentUser && (user ? u.id !== user.uid : true)
  );

  const combinedList = [...otherUsers, currentUserItem]
    .sort((a, b) => b.xp - a.xp)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const currentUserRank = combinedList.find((u) => u.isCurrentUser)?.rank || 1;

  const filteredList = combinedList.filter((u) => {
    if (tierFilter === 'ALL') return true;
    return u.tier === tierFilter;
  });

  const handleCheer = (userId: string) => {
    soundFx.playCorrect();
    setCheeredIds((prev) => ({
      ...prev,
      [userId]: (prev[userId] || 0) + 1,
    }));
  };

  const getTierColor = (tier: LeaderboardUser['tier']) => {
    switch (tier) {
      case 'Diamond':
        return 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800';
      case 'Master':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800';
      case 'Gold':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
      case 'Silver':
        return 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
      default:
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800';
    }
  };

  return (
    <div
      id="global-leaderboard-component"
      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8 space-y-6 transition-colors"
    >
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Global Leaderboard
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-600" />
              Live League
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Compete against top scholars and quiz masters across global diagnostic challenges. Ranks refresh every Sunday at midnight.
          </p>
        </div>

        {/* Timeframe selector tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          {(['weekly', 'monthly', 'allTime'] as const).map((tf) => {
            const isSelected = timeframe === tf;
            const labels = { weekly: 'Weekly', monthly: 'Monthly', allTime: 'All-Time' };
            return (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setTimeframe(tf);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {labels[tf]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current User Standings Highlight Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-2 border-indigo-500/30 dark:border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="relative">
            <img
              src={currentUserItem.avatar}
              alt="You"
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500"
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-indigo-600 text-white font-black text-[10px]">
              #{currentUserRank}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 dark:text-white">Your Global Standing</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getTierColor(currentUserItem.tier)}`}>
                {currentUserItem.tier} Tier
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Level {stats.level} Scholar • {stats.xp} Total XP • {stats.streak} Day Streak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-indigo-100 dark:border-indigo-900/50">
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Rank Progress</span>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {currentUserRank === 1 ? '👑 #1 Leader' : `Top ${Math.max(1, Math.round((currentUserRank / (combinedList.length + 20)) * 100))}%`}
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-xs">
            {stats.xp} XP
          </div>
        </div>
      </div>

      {/* Tier Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['ALL', 'Diamond', 'Master', 'Gold'] as const).map((tier) => {
          const isSelected = tierFilter === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setTierFilter(tier);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {tier === 'ALL' ? 'All Divisions' : `${tier} League`}
            </button>
          );
        })}
      </div>

      {/* Podium for Top 3 (on ALL filter) */}
      {tierFilter === 'ALL' && combinedList.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 pb-2 items-end">
          {/* Rank 2 (Silver) */}
          <div className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center order-1 space-y-2">
            <div className="relative">
              <img
                src={combinedList[1].avatar}
                alt={combinedList[1].name}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-slate-400"
              />
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white font-black text-xs flex items-center justify-center shadow-xs">
                2
              </span>
            </div>
            <div className="w-full truncate">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                {combinedList[1].name}
              </p>
              <p className="text-[10px] text-slate-500 font-bold">{combinedList[1].xp} XP</p>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              🥈 Silver
            </span>
          </div>

          {/* Rank 1 (Gold / Champion) */}
          <div className="flex flex-col items-center p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700/60 text-center order-2 space-y-2 relative shadow-md">
            <Crown className="w-6 h-6 text-amber-500 fill-amber-500 absolute -top-3.5 left-1/2 -translate-x-1/2 drop-shadow-sm" />
            <div className="relative mt-2">
              <img
                src={combinedList[0].avatar}
                alt={combinedList[0].name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover ring-4 ring-amber-400"
              />
              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
                1
              </span>
            </div>
            <div className="w-full truncate">
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                {combinedList[0].name}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-extrabold">
                {combinedList[0].xp} XP
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
              👑 Champion
            </span>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center order-3 space-y-2">
            <div className="relative">
              <img
                src={combinedList[2].avatar}
                alt={combinedList[2].name}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-amber-700/60"
              />
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-700/80 text-white font-black text-xs flex items-center justify-center shadow-xs">
                3
              </span>
            </div>
            <div className="w-full truncate">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                {combinedList[2].name}
              </p>
              <p className="text-[10px] text-slate-500 font-bold">{combinedList[2].xp} XP</p>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              🥉 Bronze
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoadingLeaderboard && (
          <div className="p-6 text-center text-slate-400 text-xs font-semibold animate-pulse flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
            <span>Syncing real scholar standings from Firestore...</span>
          </div>
        )}
        {!isLoadingLeaderboard && filteredList.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <p className="font-bold text-sm">No scholars currently in this division.</p>
            <p className="text-xs">Complete assessments to rank up into this division!</p>
          </div>
        )}
        {filteredList.map((user) => {
          const isUser = user.isCurrentUser;
          const cheerCount = cheeredIds[user.id] || 0;

          return (
            <div
              key={user.id}
              id={`leaderboard-row-${user.id}`}
              className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                isUser
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold border-l-4 border-l-indigo-600'
                  : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Rank & User Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 text-center font-black text-xs sm:text-sm text-slate-500 shrink-0">
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                </div>

                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ${
                      isUser ? 'ring-2 ring-indigo-600' : 'ring-1 ring-slate-200 dark:ring-slate-700'
                    }`}
                  />
                  {user.countryCode && (
                    <span className="absolute -bottom-1 -right-1 text-[10px]">
                      {user.countryCode}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs sm:text-sm font-extrabold truncate ${isUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                      {user.name}
                    </span>
                    {isUser && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-600 text-white">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span>{user.badgeTitle}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {user.streak}d
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {user.accuracy}% acc
                    </span>
                  </div>
                </div>
              </div>

              {/* XP, Tier & Cheer Action */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getTierColor(user.tier)}`}>
                  {user.tier}
                </span>

                <div className="text-right">
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {user.xp.toLocaleString()} XP
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    Lvl {user.level}
                  </div>
                </div>

                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCheer(user.id)}
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Cheer learner"
                  >
                    <span>👏</span>
                    {cheerCount > 0 && <span className="text-[10px] font-extrabold text-amber-600">{cheerCount}</span>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
