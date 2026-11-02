import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  Crown,
  Zap,
  Target,
  Flame,
  Shield,
  BookOpen,
  Compass,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  Clock,
  History,
  FileText,
  HelpCircle,
  Trophy,
  Brain,
  Star,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  AscensionProfile,
  AscensionQuest,
  AscensionAchievement,
  TopicMasteryDetail,
  SkillTreeNode,
  SubjectSpecialisation,
} from '../../types/ascension';
import { ACADEMIC_RANKS, ASCENSION_TITLES, RANK_ORDER_LIST } from '../../data/ascensionRanksAndTitles';
import { ASCENSION_SKILL_TREES } from '../../data/ascensionSkillTrees';
import {
  getAscensionProfile,
  recordProgressionEvent,
  subscribeAscension,
} from '../../services/ascensionEngine';
import { soundFx } from '../../utils/audio';
import { UserStats, QuizResponse, PersonaType } from '../../types/quiz';

interface AscensionDashboardViewProps {
  stats: UserStats;
  persona: PersonaType;
  onStartQuiz: (quiz: QuizResponse) => void;
  onOpenNotes: (topic: string) => void;
  onOpenFlashcards: (topic: string) => void;
  onOpenTutor: (concept: string) => void;
  onUpdateStats?: (delta: Partial<UserStats>) => void;
}

type AscensionTab = 'overview' | 'skill_trees' | 'quests' | 'ranks' | 'achievements' | 'titles' | 'audit_log';

export const AscensionDashboardView: React.FC<AscensionDashboardViewProps> = ({
  stats,
  persona,
  onStartQuiz,
  onOpenNotes,
  onOpenFlashcards,
  onOpenTutor,
  onUpdateStats,
}) => {
  const [profile, setProfile] = useState<AscensionProfile>(() => getAscensionProfile(stats));
  const [activeTab, setActiveTab] = useState<AscensionTab>('overview');
  const [selectedSubjectTree, setSelectedSubjectTree] = useState<string>('Mathematics');
  const [selectedNode, setSelectedNode] = useState<SkillTreeNode | null>(null);
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [achievementSearch, setAchievementSearch] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Synchronize profile updates with engine subscriptions
  useEffect(() => {
    const unsubscribe = subscribeAscension((updatedProfile, notification) => {
      setProfile(updatedProfile);
      if (notification) {
        showNotice(`${notification.icon} ${notification.title}: ${notification.subtitle}`);
      }
    });
    return () => unsubscribe();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3800);
  };

  const currentRank = ACADEMIC_RANKS[profile.rankId] || ACADEMIC_RANKS.initiate;
  const nextRankId = RANK_ORDER_LIST[RANK_ORDER_LIST.indexOf(profile.rankId) + 1] || null;
  const nextRank = nextRankId ? ACADEMIC_RANKS[nextRankId] : null;

  // Level XP calculations
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((profile.currentLevelXp / Math.max(1, profile.xpRequiredForNextLevel)) * 100))
  );

  // Claim Quest handler
  const handleClaimQuest = (quest: AscensionQuest) => {
    if (quest.status !== 'completed') return;
    soundFx.playBadgeUnlock();
    const { updatedProfile } = recordProgressionEvent({
      type: 'quest_claimed',
      questId: quest.id,
    });
    setProfile(updatedProfile);
    if (onUpdateStats) {
      onUpdateStats({
        xp: updatedProfile.cumulativeXp,
        gems: updatedProfile.gems,
      });
    }
    showNotice(`Claimed "${quest.title}": +${quest.rewardXp} XP & +${quest.rewardGems} Gems!`);
  };

  // Equip Title handler
  const handleEquipTitle = (titleId: string) => {
    soundFx.playClick();
    const updated: AscensionProfile = {
      ...profile,
      equippedTitleId: titleId,
    };
    setProfile(updated);
    showNotice(`Equipped title: "${ASCENSION_TITLES.find((t) => t.id === titleId)?.title || titleId}"`);
  };

  // Launch Node Quiz handler
  const handleLaunchNodeQuiz = (node: SkillTreeNode) => {
    soundFx.playClick();
    onStartQuiz({
      app_name: 'Quiz Me!',
      persona,
      quiz_title: `${node.subject} — ${node.title}`,
      summary: `Targeted mastery assessment covering key concepts: ${node.keyConcepts.join(', ')}`,
      difficulty: node.tier >= 3 ? 'Master' : 'Intermediate',
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: `In ${node.subject}, which fundamental theorem or invariant governs ${node.title}?`,
          options: [
            `Verified axiomatic principle of ${node.keyConcepts[0] || node.title}`,
            `Transient empirical approximation without mathematical proof`,
            `Arbitrary scalar perturbation with unconstrained boundary`,
            `Independent linear deviation from nominal state`,
          ],
          correct_answer: `Verified axiomatic principle of ${node.keyConcepts[0] || node.title}`,
          explanation: `Mastery of ${node.title} requires precise synthesis of ${node.keyConcepts.join(' and ')}.`,
          topic: node.title,
          difficulty: 'Intermediate',
          gamified_feedback: {
            success_quote: 'Knowledge node reinforced!',
            hint: 'Recall the core invariant principle.',
          },
        },
      ],
      tags: [node.subject, node.domain, 'Skill Tree'],
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-900 rounded-2xl shadow-xl border border-slate-700/50 dark:border-slate-200/50 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400 dark:text-amber-600 shrink-0" />
          <span className="text-xs font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* ASCENSION HEADER / RPG HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-4 sm:p-6 lg:p-8 border border-indigo-900/40 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          {/* Character Identity */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border-2 border-indigo-400/50 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
                {currentRank.emblem}
              </div>
              <div className="absolute -bottom-2 -right-2 px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-600 text-[9px] sm:text-[10px] font-black tracking-wider uppercase border border-indigo-300">
                Lvl {profile.level}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  {currentRank.title}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-[11px] font-medium text-amber-300">
                  {ASCENSION_TITLES.find((t) => t.id === profile.equippedTitleId)?.title || 'Novice Inquirer'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Project Ascension
                <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  RPG Learning Engine
                </span>
              </h1>
              <p className="text-xs text-slate-300 max-w-xl mt-1 line-clamp-2">
                {currentRank.description}
              </p>
            </div>
          </div>

          {/* Quick Stats & Next Rank Target */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold">{profile.consistency.streakDays} Day Streak</span>
                <span className="text-[10px] text-slate-400">({profile.consistency.streakShields} Shields)</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">{profile.gems} Gems</span>
              </div>
            </div>

            {/* Level XP Bar */}
            <div className="w-full sm:w-64 space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-300">
                <span>Progress to Lvl {profile.level + 1}</span>
                <span className="font-bold text-indigo-300">
                  {profile.currentLevelXp} / {profile.xpRequiredForNextLevel} XP ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-5 sm:mt-8 pt-3 sm:pt-4 border-t border-indigo-900/50 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Command Overview', icon: Brain },
            { id: 'skill_trees', label: 'Academic Skill Trees', icon: Compass },
            { id: 'quests', label: 'Quests & Objectives', icon: Target },
            { id: 'ranks', label: 'Prestige Ranks', icon: Crown },
            { id: 'achievements', label: 'Achievements 2.0', icon: Award },
            { id: 'titles', label: 'Titles & Armory', icon: Star },
            { id: 'audit_log', label: 'Audit Log & History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id as AscensionTab);
                }}
                className={`px-3 py-2 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer min-h-[38px] whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Active Objectives & Habit Vault */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Quests Highlight */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" />
                    Active Learning Quests
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real educational objectives auto-verified against your study actions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('quests')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All ({profile.activeQuests.length})
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.activeQuests.slice(0, 4).map((q) => {
                  const isDone = q.currentCount >= q.targetCount;
                  const isClaimed = q.status === 'claimed';
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone && !isClaimed
                          ? 'bg-amber-500/10 border-amber-400/50 dark:border-amber-500/30'
                          : isClaimed
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                          {q.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 uppercase">
                          {q.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {q.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-600 dark:text-slate-300">
                        <span>Progress</span>
                        <span>
                          {q.currentCount} / {q.targetCount}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-3">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, (q.currentCount / q.targetCount) * 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                          +{q.rewardXp} XP • +{q.rewardGems} Gems
                        </span>
                        {isDone && !isClaimed && (
                          <button
                            type="button"
                            onClick={() => handleClaimQuest(q)}
                            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm cursor-pointer"
                          >
                            Claim
                          </button>
                        )}
                        {isClaimed && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Claimed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject Specialisation Journey */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-500" />
                    Subject Specialisations
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Develop demonstrable academic strengths across major disciplines.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('skill_trees')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Explore Skill Trees
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.specialisations.map((spec) => (
                  <div
                    key={spec.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3"
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                      {spec.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {spec.specialistTitle}
                        </h3>
                        {spec.isUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> {spec.masteredTopicsCount}/{spec.totalTopicsCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {spec.description}
                      </p>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${spec.proficiencyPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Next Rank Requirements & Consistency Vault */}
          <div className="space-y-6">
            {/* Next Academic Rank Milestone */}
            <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-3xl border border-indigo-200 dark:border-indigo-800/60 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-indigo-100 dark:border-indigo-900">
                  {nextRank ? nextRank.emblem : '🌌'}
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Next Rank Promotion
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {nextRank ? nextRank.title : 'Supreme Ascendant'}
                  </h3>
                </div>
              </div>

              {nextRank ? (
                <div className="space-y-2.5 pt-2">
                  <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Advancement Criteria:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center justify-between">
                      <span>Scholar Level</span>
                      <span className="font-bold">
                        {profile.level} / {nextRank.requirements.minLevel}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Cumulative XP</span>
                      <span className="font-bold">
                        {profile.cumulativeXp} / {nextRank.requirements.minCumulativeXp}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Tier 5 Mastered Topics</span>
                      <span className="font-bold">
                        {(Object.values(profile.masteryRecords) as TopicMasteryDetail[]).filter((r) => r.tier === 'mastered').length} /{' '}
                        {nextRank.requirements.minMasteredTopics}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Consistency Streak</span>
                      <span className="font-bold">
                        {profile.consistency.streakDays} / {nextRank.requirements.minStudyConsistencyStreak} Days
                      </span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ranks')}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer text-center"
                    >
                      Inspect Rank Hierarchy
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  You have achieved the highest academic rank in the known universe!
                </p>
              )}
            </div>

            {/* Consistency & Study Habit Vault */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Study Habit Vault
                </h3>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {profile.consistency.studyDaysThisWeek}/{profile.consistency.weeklyTargetDays} Target Days
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encouraging sustainable consistency rather than punitive pressure.
              </p>

              {/* Weekly Day Circles */}
              <div className="flex items-center justify-between gap-1 py-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayLetter, index) => {
                  const dayNum = index + 1;
                  const isActive = profile.consistency.activeWeekDays.includes(dayNum);
                  return (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {dayLetter}
                      </div>
                      <span className="text-[10px] text-slate-400">{isActive ? '✓' : '•'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Streak Protection Shield status */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-sky-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {profile.consistency.streakShields} Streak Shields
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Automatically protects your streak if a study day is missed.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC SKILL TREES */}
      {activeTab === 'skill_trees' && (
        <div className="space-y-6">
          {/* Subject Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {Object.keys(ASCENSION_SKILL_TREES).map((subj) => {
              const isSelected = selectedSubjectTree === subj;
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedSubjectTree(subj);
                    setSelectedNode(null);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {subj}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Tree Graph Container */}
            <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-500" />
                    {selectedSubjectTree} Knowledge Graph
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any concept node to review prerequisites, launch targeted quizzes, or study notes.
                  </p>
                </div>
              </div>

              {/* Node Layout by Tiers */}
              <div className="space-y-4 pt-2">
                {[1, 2, 3, 4].map((tierNum) => {
                  const nodesInTier = (ASCENSION_SKILL_TREES[selectedSubjectTree] || []).filter(
                    (n) => n.tier === tierNum
                  );
                  if (nodesInTier.length === 0) return null;

                  return (
                    <div key={tierNum} className="space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Tier {tierNum} Concepts
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nodesInTier.map((node) => {
                          const isSelected = selectedNode?.id === node.id;
                          const isMastered = node.status === 'mastered';
                          const isProficient = node.status === 'proficient';
                          const isLocked = node.status === 'unexplored' && node.prerequisiteNodeIds.length > 0;

                          return (
                            <button
                              key={node.id}
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                setSelectedNode(node);
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30'
                                  : isMastered
                                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                                  : isProficient
                                  ? 'border-sky-300 dark:border-sky-800 bg-sky-50/20 dark:bg-sky-950/10'
                                  : isLocked
                                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 opacity-70'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                                  {node.title}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                                    isMastered
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                                      : isProficient
                                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'
                                      : isLocked
                                      ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                                  }`}
                                >
                                  {node.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                {node.description}
                              </p>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                                <span>Mastery: {node.masteryPercent}%</span>
                                <span>{node.practiceQuizzesCount} Quizzes Completed</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Node Detail Sheet & Real Educational Action Launcher */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {selectedNode.subject} • {selectedNode.domain}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedNode.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {selectedNode.description}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Key Foundational Concepts:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      {selectedNode.keyConcepts.map((c, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions connecting to real application functionality */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleLaunchNodeQuiz(selectedNode)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Target className="w-4 h-4" />
                      Start Adaptive Quiz on Node
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenNotes(selectedNode.title)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Read / Generate Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenFlashcards(selectedNode.title)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      Practice Spaced Flashcards
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenTutor(selectedNode.title)}
                      className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      Engage Socratic AI Tutor
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-semibold">Select a concept node on the left to inspect and launch study activities.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUESTS */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Quests Column */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Daily Quests
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Resets in 24h</span>
              </div>
              <div className="space-y-3">
                {profile.activeQuests
                  .filter((q) => q.category === 'daily')
                  .map((q) => {
                    const isDone = q.currentCount >= q.targetCount;
                    const isClaimed = q.status === 'claimed';
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border ${
                          isDone && !isClaimed
                            ? 'bg-amber-500/10 border-amber-400/50'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                          {q.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                          {q.description}
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          <span>{q.currentCount}/{q.targetCount}</span>
                          <span className="text-amber-500 font-bold">+{q.rewardXp} XP</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${Math.min(100, (q.currentCount / q.targetCount) * 100)}%` }}
                          />
                        </div>
                        {isDone && !isClaimed && (
                          <button
                            type="button"
                            onClick={() => handleClaimQuest(q)}
                            className="w-full py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs shadow-sm cursor-pointer mt-1"
                          >
                            Claim Reward
                          </button>
                        )}
                        {isClaimed && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold text-center mt-1">
                            ✓ Claimed
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Weekly Quests Column */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Weekly Objectives
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Resets Sunday</span>
              </div>
              <div className="space-y-3">
                {profile.activeQuests
                  .filter((q) => q.category === 'weekly')
                  .map((q) => {
                    const isDone = q.currentCount >= q.targetCount;
                    const isClaimed = q.status === 'claimed';
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border ${
                          isDone && !isClaimed
                            ? 'bg-amber-500/10 border-amber-400/50'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                          {q.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                          {q.description}
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          <span>{q.currentCount}/{q.targetCount}</span>
                          <span className="text-amber-500 font-bold">+{q.rewardXp} XP • +{q.rewardGems} Gems</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(100, (q.currentCount / q.targetCount) * 100)}%` }}
                          />
                        </div>
                        {isDone && !isClaimed && (
                          <button
                            type="button"
                            onClick={() => handleClaimQuest(q)}
                            className="w-full py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs shadow-sm cursor-pointer mt-1"
                          >
                            Claim Reward
                          </button>
                        )}
                        {isClaimed && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold text-center mt-1">
                            ✓ Claimed
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Long-Term Epic Quests Column */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Epic Milestones
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Long-term</span>
              </div>
              <div className="space-y-3">
                {profile.activeQuests
                  .filter((q) => q.category === 'epic')
                  .map((q) => {
                    const isDone = q.currentCount >= q.targetCount;
                    const isClaimed = q.status === 'claimed';
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border ${
                          isDone && !isClaimed
                            ? 'bg-amber-500/10 border-amber-400/50'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                          {q.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                          {q.description}
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          <span>{q.currentCount}/{q.targetCount}</span>
                          <span className="text-amber-500 font-bold">+{q.rewardXp} XP</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, (q.currentCount / q.targetCount) * 100)}%` }}
                          />
                        </div>
                        {isDone && !isClaimed && (
                          <button
                            type="button"
                            onClick={() => handleClaimQuest(q)}
                            className="w-full py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs shadow-sm cursor-pointer mt-1"
                          >
                            Claim Reward
                          </button>
                        )}
                        {isClaimed && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold text-center mt-1">
                            ✓ Claimed
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRESTIGE RANKS */}
      {activeTab === 'ranks' && (
        <div className="space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
              Academic Prestige Hierarchy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranks represent significant educational milestones, evaluated on levels, topic mastery, exams completed, and consistency.
            </p>
          </div>

          <div className="space-y-3">
            {RANK_ORDER_LIST.map((rankId, idx) => {
              const rank = ACADEMIC_RANKS[rankId];
              const isCurrent = profile.rankId === rankId;
              const isPast = RANK_ORDER_LIST.indexOf(profile.rankId) > idx;
              const isLocked = !isCurrent && !isPast;

              return (
                <div
                  key={rank.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/5 border-indigo-400 dark:border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                      : isPast
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {rank.emblem}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {rank.title}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rank.badgeBg} border ${rank.badgeBorder}`}>
                            {rank.tierName}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase">
                              Active Rank
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {rank.description}
                        </p>
                      </div>
                    </div>

                    {/* Requirements checklist */}
                    <div className="text-xs space-y-1 sm:text-right shrink-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Requirements</div>
                      <div className="text-slate-700 dark:text-slate-300 font-semibold">
                        Lvl {rank.requirements.minLevel} • {rank.requirements.minCumulativeXp} XP • {rank.requirements.minMasteredTopics} Mastered Topics
                      </div>
                    </div>
                  </div>

                  {/* Perks list */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2">
                    {rank.perks.map((p, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ACHIEVEMENTS 2.0 */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Achievements 2.0 & Accolades
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rewarding genuine educational accomplishments across Common, Rare, and Mythic tiers.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter achievements..."
                  value={achievementSearch}
                  onChange={(e) => setAchievementSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.values(profile.achievements) as AscensionAchievement[])
              .filter((a) => {
                if (achievementSearch && !a.name.toLowerCase().includes(achievementSearch.toLowerCase())) return false;
                return true;
              })
              .map((ach) => {
                const rarityColor =
                  ach.rarity === 'mythic'
                    ? 'text-cyan-400 border-cyan-400/50 bg-cyan-500/10'
                    : ach.rarity === 'legendary'
                    ? 'text-amber-400 border-amber-400/50 bg-amber-500/10'
                    : ach.rarity === 'epic'
                    ? 'text-purple-400 border-purple-400/50 bg-purple-500/10'
                    : 'text-indigo-400 border-indigo-400/50 bg-indigo-500/10';

                return (
                  <div
                    key={ach.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      ach.isUnlocked
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                        : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        {ach.isUnlocked ? <Trophy className="w-5 h-5 text-amber-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${rarityColor}`}>
                        {ach.rarity}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">
                      {ach.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {ach.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-500">+{ach.xpReward} XP</span>
                      {ach.isUnlocked ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Earned
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">In Progress</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 6: TITLES & ARMORY */}
      {activeTab === 'titles' && (
        <div className="space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
              Title Armory & Identity Showcase
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Equip earned titles to customize your academic identity across Leaderboards, Classrooms, and Community Quizzes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ASCENSION_TITLES.map((t) => {
              const isUnlocked = profile.unlockedTitleIds.includes(t.id);
              const isEquipped = profile.equippedTitleId === t.id;

              return (
                <div
                  key={t.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isEquipped
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20'
                      : isUnlocked
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {t.title}
                    </h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {t.description}
                  </p>
                  <div className="text-[11px] text-slate-400 mb-4">
                    Unlock: {t.unlockCondition}
                  </div>

                  {isEquipped ? (
                    <div className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs text-center">
                      Currently Equipped
                    </div>
                  ) : isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handleEquipTitle(t.id)}
                      className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                    >
                      Equip Title
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                      <Lock className="w-3 h-3" /> Locked
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOG */}
      {activeTab === 'audit_log' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                Auditable XP Transaction Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent and verified ledger of educational actions, preventing exploits and button-mashing abuse.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {profile.transactions.length} Verified Entries
            </span>
          </div>

          <div className="space-y-2">
            {profile.transactions.length > 0 ? (
              profile.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                      +{tx.xpAwarded} XP
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {tx.summary}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{new Date(tx.timestampIso).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">Hash: {tx.hash}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {tx.verifiedEffort ? '✓ Verified' : 'Standard'}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Complete a quiz or assessment session to record your first verified XP transaction.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
