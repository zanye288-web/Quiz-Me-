import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Flame,
  Award,
  Compass,
  ShieldCheck,
  Palette,
  Crown,
  BookOpen,
  RefreshCw,
  Swords,
  Calendar,
  GitCompare,
  Zap,
} from 'lucide-react';
import {
  MASTERY_PROGRESS_PATH_NODES,
  MasteryLearningProfile,
  loadMasteryProfile,
  saveMasteryProfile,
  loadDailyChallengeState,
  buildDailyChallengeQuiz,
  DailyChallengeState,
  loadTopicBossProgressMap,
  updateTopicSolidProgress,
  buildTopicBossChallengeQuiz,
  TopicBossProgress,
  getDetectedConfusionPatterns,
  buildConceptComparisonDrillQuiz,
  ConfusedConceptPair,
  getOverdueSpacedRepetitionItems,
} from '../utils/adaptiveLearningEngine';
import { QuizResponse, PersonaType } from '../types/quiz';
import { useTheme, UI_THEME_CATALOG } from '../context/ThemeContext';
import { soundFx } from '../utils/audio';

interface MasteryProgressPathProps {
  streakDays?: number;
  persona?: PersonaType;
  onLaunchInterleavedQuiz?: () => void;
  onLaunchCustomQuiz?: (quiz: QuizResponse) => void;
  onOpenMyNotes?: () => void;
  compact?: boolean;
}

export const MasteryProgressPath: React.FC<MasteryProgressPathProps> = ({
  streakDays,
  persona = 'Student',
  onLaunchInterleavedQuiz,
  onLaunchCustomQuiz,
  onOpenMyNotes,
  compact = false,
}) => {
  const [profile, setProfile] = useState<MasteryLearningProfile>(() => loadMasteryProfile());
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeState>(() =>
    loadDailyChallengeState()
  );
  const [bossMap, setBossMap] = useState<Record<string, TopicBossProgress>>(() =>
    loadTopicBossProgressMap()
  );
  const [confusionPairs, setConfusionPairs] = useState<ConfusedConceptPair[]>(() =>
    getDetectedConfusionPatterns()
  );
  const [overdueCount, setOverdueCount] = useState<number>(
    () => getOverdueSpacedRepetitionItems().length
  );
  const [equipToast, setEquipToast] = useState<string | null>(null);
  const { setUiTheme } = useTheme();

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(loadMasteryProfile());
      setDailyChallenge(loadDailyChallengeState());
      setBossMap(loadTopicBossProgressMap());
      setConfusionPairs(getDetectedConfusionPatterns());
      setOverdueCount(getOverdueSpacedRepetitionItems().length);
    };
    window.addEventListener('mastery-profile-updated', handleUpdate);
    window.addEventListener('daily-challenge-updated', handleUpdate);
    window.addEventListener('boss-progress-updated', handleUpdate);
    window.addEventListener('mistake-patterns-updated', handleUpdate);
    window.addEventListener('spaced-repetition-updated', handleUpdate);
    return () => {
      window.removeEventListener('mastery-profile-updated', handleUpdate);
      window.removeEventListener('daily-challenge-updated', handleUpdate);
      window.removeEventListener('boss-progress-updated', handleUpdate);
      window.removeEventListener('mistake-patterns-updated', handleUpdate);
      window.removeEventListener('spaced-repetition-updated', handleUpdate);
    };
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isDailyChallengeCompletedToday = dailyChallenge.lastCompletedDate === todayStr;

  const handleStartDailyChallenge = () => {
    soundFx.playSelect();
    if (onLaunchCustomQuiz) {
      onLaunchCustomQuiz(buildDailyChallengeQuiz(persona));
    } else if (onLaunchInterleavedQuiz) {
      onLaunchInterleavedQuiz();
    }
  };

  const handleStartBossChallenge = (topic: string) => {
    soundFx.playSelect();
    if (onLaunchCustomQuiz) {
      onLaunchCustomQuiz(buildTopicBossChallengeQuiz(topic, persona));
    } else if (onLaunchInterleavedQuiz) {
      onLaunchInterleavedQuiz();
    }
  };

  const handlePromoteTopicSolid = (topic: string) => {
    soundFx.playPop();
    updateTopicSolidProgress(topic, true);
    setBossMap(loadTopicBossProgressMap());
    setEquipToast(`+1 Solid Question recorded for "${topic}"!`);
    setTimeout(() => setEquipToast(null), 2400);
  };

  const handleStartComparisonDrill = (pair: ConfusedConceptPair) => {
    soundFx.playSelect();
    if (onLaunchCustomQuiz) {
      onLaunchCustomQuiz(buildConceptComparisonDrillQuiz(pair, persona));
    } else if (onLaunchInterleavedQuiz) {
      onLaunchInterleavedQuiz();
    }
  };

  // Sync streak days if higher in stats
  const effectiveProfile: MasteryLearningProfile = {
    ...profile,
    consistentPracticeStreakDays: Math.max(
      profile.consistentPracticeStreakDays,
      streakDays || 1
    ),
  };

  const handleEquipCosmetic = (
    type: 'title' | 'avatar' | 'theme',
    preview: string,
    name: string
  ) => {
    soundFx.playBadgeUnlock();
    const updated: MasteryLearningProfile = {
      ...effectiveProfile,
      equippedTitle: type === 'title' ? preview : effectiveProfile.equippedTitle,
      equippedAvatarId: type === 'avatar' ? preview : effectiveProfile.equippedAvatarId,
      equippedThemeBadge: type === 'theme' ? name : effectiveProfile.equippedThemeBadge,
    };
    if (type === 'theme' && UI_THEME_CATALOG.length > 0) {
      const goldPreset = UI_THEME_CATALOG.find((p) => p.id === 'sunset_manga' || p.id === 'paper_ink') || UI_THEME_CATALOG[0];
      if (goldPreset) {
        setUiTheme(goldPreset.id);
      }
    }
    setProfile(updated);
    saveMasteryProfile(updated);
    setEquipToast(`Equipped ${type.toUpperCase()}: ${preview}`);
    setTimeout(() => setEquipToast(null), 2800);
  };

  const unlockedCount = MASTERY_PROGRESS_PATH_NODES.filter(
    (n) => n.getProgress(effectiveProfile).unlocked
  ).length;

  return (
    <div className="comic-panel pattern-halftone rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-6 transition-colors">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2">
            <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
              MASTERY PATH &amp; COSMETICS
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Earned Only via Real Mastery &amp; Consistency (Never Speed or Lucky Guesses)</span>
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Learning Progress Map &amp; Unlockable Cosmetics
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Advance along the path by fixing past mistakes, maintaining daily practice streaks, mastering topics at 75%+ accuracy, and saving reflective takeaways.
          </p>
        </div>

        {/* Equipped Loadout Card */}
        <div className="comic-panel-sm flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-300 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-xs">
            {effectiveProfile.equippedAvatarId || '🦉'}
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
              Active Mastery Loadout
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {effectiveProfile.equippedTitle || '🌱 Mistake Alchemist'}
            </div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>Theme: {effectiveProfile.equippedThemeBadge}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                {unlockedCount}/{MASTERY_PROGRESS_PATH_NODES.length} Nodes
              </span>
            </div>
          </div>
        </div>
      </div>

      {equipToast && (
        <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{equipToast}</span>
        </div>
      )}

      {/* Key Learning Pillar Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="comic-panel-sm p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 text-center space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Consistent Streak
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{effectiveProfile.consistentPracticeStreakDays} Days</span>
          </div>
          <div className="text-[10px] font-bold text-slate-500">Goal: 5 Days in a Row</div>
        </div>

        <div className="comic-panel-sm p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 text-center space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Past Mistakes Fixed
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            🛠️ {effectiveProfile.fixedMistakesCount} Fixed
          </div>
          <div className="text-[10px] font-bold text-slate-500">Via Follow-Up &amp; Review Pile</div>
        </div>

        <div className="comic-panel-sm p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 text-center space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            Topics Mastered
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            🏛️ {effectiveProfile.masteredTopics.length} Topics
          </div>
          <div className="text-[10px] font-bold text-slate-500">Untimed 75%+ Accuracy</div>
        </div>

        <div className="comic-panel-sm p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 text-center space-y-0.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
            Reflections Saved
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            📓 {effectiveProfile.takeawaysSavedCount + effectiveProfile.ownWordsReflectionsCount} Notes
          </div>
          <div className="text-[10px] font-bold text-slate-500">Takeaways &amp; Own Words</div>
        </div>
      </div>

      {/* Connected Comic Progress Path Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MASTERY_PROGRESS_PATH_NODES.map((node) => {
          const prog = node.getProgress(effectiveProfile);
          const pct = Math.min(100, Math.round((prog.current / Math.max(1, prog.target)) * 100));
          const isEquipped =
            effectiveProfile.equippedTitle === node.cosmeticReward.preview ||
            effectiveProfile.equippedAvatarId === node.cosmeticReward.preview ||
            effectiveProfile.equippedThemeBadge === node.cosmeticReward.name;

          return (
            <div
              key={node.id}
              className={`comic-panel-sm rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all ${
                prog.unlocked
                  ? 'bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-amber-950/20'
                  : 'bg-slate-50/90 dark:bg-slate-800/50 opacity-90'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl border-2 border-slate-950 flex items-center justify-center text-lg font-black shrink-0 ${
                        prog.unlocked
                          ? 'bg-amber-300 text-slate-950 shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {node.iconEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-700">
                          STEP {node.stepNumber}
                        </span>
                        {prog.unlocked ? (
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white mt-0.5">
                        {node.title}
                      </h4>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-snug">
                  {node.requirementText}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-black">
                    <span className="text-slate-500 dark:text-slate-400">
                      Mastery Progress: {prog.current} / {prog.target}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prog.unlocked
                          ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Cosmetic Reward Box */}
              <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Cosmetic {node.cosmeticReward.type.toUpperCase()} Reward
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                    {node.cosmeticReward.preview}
                  </span>
                </div>

                {prog.unlocked ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleEquipCosmetic(
                        node.cosmeticReward.type,
                        node.cosmeticReward.preview,
                        node.cosmeticReward.name
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black border-2 border-slate-950 transition-all cursor-pointer shrink-0 ${
                      isEquipped
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-300 hover:bg-amber-200 text-slate-950 shadow-2xs'
                    }`}
                  >
                    {isEquipped ? '✓ Equipped' : 'Equip Reward'}
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-500 text-[10px] font-bold shrink-0">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ====================================================================
          2. DAILY CHALLENGE (5-Question Set from Weakest Topics & Overdue Reviews)
          ==================================================================== */}
      <div className="comic-panel-sm rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-50/90 via-white to-indigo-50/90 dark:from-amber-950/35 dark:via-slate-900 dark:to-indigo-950/40 border-2 border-slate-900 dark:border-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className="comic-badge px-2.5 py-0.5 rounded bg-amber-300 text-slate-950 border border-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>DAILY 5-QUESTION CHALLENGE</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800 text-[11px] font-black flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>{dailyChallenge.dailyStreak}-Day Daily Challenge Streak</span>
              </span>
              {isDailyChallengeCompletedToday && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                  ✓ Completed Today ({dailyChallenge.todayScore ?? 5}/{dailyChallenge.todayTotal ?? 5})
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Today’s Personalized 5-Question Weakest Topic &amp; Overdue Review Set
            </h4>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Automatically pulls <strong className="text-indigo-600 dark:text-indigo-400">{overdueCount} overdue Spaced Repetition review items</strong> plus questions from your lowest-accuracy topics.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartDailyChallenge}
            className="comic-panel-sm px-4 py-2.5 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-950 font-black text-xs border-2 border-slate-950 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>
              {isDailyChallengeCompletedToday
                ? 'Replay Today’s 5-Q Daily Challenge'
                : 'Play Today’s 5-Q Daily Challenge'}
            </span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          3. BOSS LEVELS (Solid on All Questions -> Mixed Boss Challenge -> Mastered)
          ==================================================================== */}
      <div className="comic-panel-sm rounded-2xl p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-800/50 border-2 border-slate-900 dark:border-slate-700 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="comic-badge px-2 py-0.5 rounded bg-rose-500 text-white border border-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Swords className="w-3 h-3" />
                <span>TOPIC BOSS LEVELS</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Reach “Solid” (4/4) in a topic to unlock its Mixed Boss Challenge!
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
              Curriculum Topic Boss Map (Pass Boss to Mark Topic Mastered &amp; Unlock Next Area)
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(bossMap).map((tb, idx) => {
            const isMastered = tb.status === 'Mastered';
            const isSolid = tb.status === 'Solid';
            const pct = Math.min(100, Math.round((tb.solidQuestionsCount / Math.max(1, tb.targetSolidQuestions)) * 100));

            return (
              <div
                key={tb.topic}
                className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between gap-2.5 ${
                  isMastered
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500'
                    : isSolid
                    ? 'bg-amber-50/95 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-400/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                      AREA #{idx + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isMastered
                          ? 'bg-emerald-600 text-white'
                          : isSolid
                          ? 'bg-amber-300 text-slate-950 border border-slate-950'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isMastered ? '👑 Mastered' : isSolid ? '⚔️ Solid (Boss Ready!)' : '🌱 Developing'}
                    </span>
                  </div>
                  <h5 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                    {tb.topic}
                  </h5>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Solid Questions: {tb.solidQuestionsCount}/{tb.targetSolidQuestions}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isMastered ? 'bg-emerald-500' : isSolid ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                  {isSolid || isMastered ? (
                    <button
                      type="button"
                      onClick={() => handleStartBossChallenge(tb.topic)}
                      className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-black border-2 border-slate-950 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isMastered
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                      }`}
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>{isMastered ? 'Replay Boss Challenge' : 'Fight Mixed Boss Challenge'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePromoteTopicSolid(tb.topic)}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-black cursor-pointer"
                    >
                      +1 Solid Question ({tb.solidQuestionsCount}/{tb.targetSolidQuestions})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          4. MISTAKE PATTERN DETECTION & TARGETED COMPARISON DRILLS
          ==================================================================== */}
      {confusionPairs.length > 0 && (
        <div className="comic-panel-sm rounded-2xl p-4 sm:p-5 bg-purple-50/70 dark:bg-purple-950/25 border-2 border-slate-900 dark:border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 dark:border-purple-800/60 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="comic-badge px-2 py-0.5 rounded bg-purple-600 text-white border border-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <GitCompare className="w-3 h-3" />
                  <span>MISTAKE PATTERN DETECTOR</span>
                </span>
                <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">
                  Tracks frequently chosen wrong answers &amp; generates side-by-side comparison drills
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                Detected Concept Confusions &amp; Targeted Comparison Drills
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {confusionPairs.slice(0, 4).map((pair) => (
              <div
                key={pair.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-300 dark:border-purple-800 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      {pair.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                      Confused {pair.confusionCount}x
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-xs pt-0.5">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-300 block">
                        ✓ Target Concept:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {pair.conceptA}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-300 block">
                        ⚠️ Frequently Chosen Distractor:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {pair.conceptB}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartComparisonDrill(pair)}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs border-2 border-slate-950 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Start 3-Q Targeted Comparison Drill</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Bar */}
      {!compact && (onLaunchInterleavedQuiz || onOpenMyNotes) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            💡 <strong className="text-slate-800 dark:text-slate-200">Pro Tip:</strong> Speed Round timers are optional and never penalize or inflate your topic mastery levels.
          </div>
          <div className="flex items-center gap-2.5">
            {onOpenMyNotes && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenMyNotes();
                }}
                className="comic-panel-sm px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>View My Notes &amp; Takeaways</span>
              </button>
            )}
            {onLaunchInterleavedQuiz && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  onLaunchInterleavedQuiz();
                }}
                className="comic-panel-sm px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Play Interleaved Multi-Topic Mix</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
