import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Keyboard,
  BookOpen,
  Bot,
  ChevronDown,
  X,
  Palette,
  Compass,
  Headphones,
  Coins,
  Lock,
  UserCheck,
  Download,
  Monitor,
  Trophy,
  Lightbulb,
  Zap,
  MessageSquare,
  RefreshCw,
  Gauge,
} from 'lucide-react';
import {
  MascotAvatar,
  MascotMood,
  MASCOT_CATALOG,
  MASCOT_ACCESSORY_CATALOG,
  MASCOT_THEME_CATALOG,
  useMascotPreferences,
  getMascotIconDataUrl,
  downloadCustomMascotDesktopIcon,
} from './MascotAvatar';
import { soundFx, AmbientSoundscapeMode } from '../utils/audio';
import { UserStats as UserStatsType, PersonaType, QuizResponse, DifficultyType } from '../types/quiz';
import { useAuth } from '../context/AuthContext';
import { getLevelProgress } from '../utils/levelingSystem';
import { useTheme, UI_THEME_CATALOG } from '../context/ThemeContext';

interface QuizzieCompanionWidgetProps {
  stats: UserStatsType;
  persona: PersonaType;
  soundEnabled: boolean;
  isQuizRunning?: boolean;
  activeQuiz?: QuizResponse | null;
  onToggleSound: () => void;
  onOpenShortcuts: () => void;
  onOpenTutor: () => void;
  onNavigateToNotes?: () => void;
  onNavigateToStudio?: () => void;
  onOpenStarterTutorial?: () => void;
}

interface TutorComicHint {
  badge: string;
  title: string;
  text: string;
  ctaLabel?: string;
}

const TUTOR_COMIC_HINTS: TutorComicHint[] = [
  {
    badge: 'ZAP! TUTOR HINT',
    title: 'First-Principles Elimination',
    text: 'Stuck on a tough multiple-choice option? Cross out the two choices that violate core definitions first!',
    ctaLabel: 'Ask 1-on-1 Tutor',
  },
  {
    badge: 'POW! MEMORY HACK',
    title: 'Active Recall > Rereading',
    text: 'Testing yourself before you feel 100% ready strengthens neural pathways 3x faster than passive reading!',
    ctaLabel: 'Open Tutor',
  },
  {
    badge: 'WHAM! EXAM STRATEGY',
    title: 'Spot the Qualifier Words',
    text: 'Watch out for absolutes like "always" or "never" in distractors—scientific truths usually specify conditions!',
    ctaLabel: 'Ask 1-on-1 Tutor',
  },
  {
    badge: 'BOOM! LOOT SECRET',
    title: 'Earn Bonus Mascot Coins',
    text: 'Score 80%+ on any verified quiz for +2 Coins, 90%+ for +4 Coins, or a 100% Perfect Run for +8 Coins!',
  },
  {
    badge: 'SPARK! SOCRATIC CLUE',
    title: 'Explain It Out Loud',
    text: 'If you can explain why a wrong answer is wrong in one sentence, you have mastered the whole concept!',
    ctaLabel: 'Practice with Tutor',
  },
];

const LEVEL_MILESTONE_TITLES: Record<number, { rank: string; perk: string }> = {
  1: { rank: 'Novice Cadet', perk: 'Unlock Starter Mascots & Daily Streak Shield' },
  2: { rank: 'Rising Scholar', perk: 'Unlock Speed Bonus Multipliers in Challenge Mode' },
  3: { rank: 'Concept Vanguard', perk: 'Unlock Advanced Bloom Taxonomy Synthesis' },
  5: { rank: 'Arena Contender', perk: 'Unlock Boss Rush Hard Mode & Rare Accessories' },
  10: { rank: 'Grandmaster Sage', perk: 'Unlock Prestige Gold Aura & Championship Title' },
};

function getNextMilestoneInfo(level: number) {
  const milestones = [2, 3, 5, 10, 15, 20, 25, 50];
  const nextTarget = milestones.find((m) => m > level) || level + 5;
  const currentMeta =
    LEVEL_MILESTONE_TITLES[level] ||
    (level >= 10
      ? { rank: `Grandmaster Tier ${level}`, perk: 'Maximum Mastery Prestige Active!' }
      : { rank: `Scholar Rank ${level}`, perk: 'Keep solving verified quizzes to rank up!' });
  return {
    nextTarget,
    rank: currentMeta.rank,
    perk: currentMeta.perk,
  };
}

export interface DifficultyRatingMeta {
  difficulty: DifficultyType;
  comicTag: string;
  ratingPercent: number;
  needleAngle: number; // -72 deg (left) to +72 deg (right)
  xpMultiplier: string;
  cognitiveDesc: string;
  hexColor: string;
  badgeBgClass: string;
  pillClass: string;
  surfaceClass: string;
  segmentIndex: 0 | 1 | 2 | 3;
}

const DIFFICULTY_TIERS_ORDER: DifficultyType[] = [
  'Foundational',
  'Intermediate',
  'Advanced',
  'Expert',
];

function getQuizDifficultyRatingMeta(
  quiz: QuizResponse | null | undefined,
  fallbackDifficulty: DifficultyType = 'Intermediate'
): DifficultyRatingMeta {
  const rawDiff: DifficultyType = quiz?.difficulty || fallbackDifficulty;

  // Compute subtle bonus complexity from question count & open/code items if quiz is present
  const qCount = quiz?.questions?.length || 0;
  const openOrCodeCount =
    quiz?.questions?.filter((q) => q.type === 'open_ended' || Boolean(q.code_snippet)).length || 0;
  const complexityNudge = Math.min(6, Math.round(openOrCodeCount * 1.5 + (qCount >= 20 ? 3 : 0)));

  switch (rawDiff) {
    case 'Foundational': {
      const ratingPercent = Math.min(34, 24 + complexityNudge);
      return {
        difficulty: 'Foundational',
        comicTag: 'EASY BREEZE',
        ratingPercent,
        needleAngle: -64 + complexityNudge,
        xpMultiplier: '1.0x XP',
        cognitiveDesc: 'Core definitions, terminology & foundational recall',
        hexColor: '#10b981',
        badgeBgClass: 'bg-emerald-400 text-slate-950 border-slate-900',
        pillClass: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-slate-900',
        surfaceClass: 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500',
        segmentIndex: 0,
      };
    }
    case 'Intermediate': {
      const ratingPercent = Math.min(62, 52 + complexityNudge);
      return {
        difficulty: 'Intermediate',
        comicTag: 'STEADY PACE',
        ratingPercent,
        needleAngle: -16 + complexityNudge,
        xpMultiplier: '1.25x XP',
        cognitiveDesc: 'Multi-step concept application & analytical linking',
        hexColor: '#06b6d4',
        badgeBgClass: 'bg-cyan-300 text-slate-950 border-slate-900',
        pillClass: 'bg-cyan-300 hover:bg-cyan-200 text-slate-950 border-slate-900',
        surfaceClass: 'bg-cyan-50/90 dark:bg-cyan-950/40 border-cyan-500',
        segmentIndex: 1,
      };
    }
    case 'Advanced': {
      const ratingPercent = Math.min(86, 76 + complexityNudge);
      return {
        difficulty: 'Advanced',
        comicTag: 'HIGH VOLTAGE',
        ratingPercent,
        needleAngle: 28 + complexityNudge,
        xpMultiplier: '1.6x XP',
        cognitiveDesc: 'Deep synthesis, edge-case traps & rigorous proofs',
        hexColor: '#f59e0b',
        badgeBgClass: 'bg-amber-300 text-slate-950 border-slate-900',
        pillClass: 'bg-amber-300 hover:bg-amber-200 text-slate-950 border-slate-900',
        surfaceClass: 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500',
        segmentIndex: 2,
      };
    }
    case 'Expert':
    default: {
      const ratingPercent = Math.min(99, 93 + Math.min(6, complexityNudge));
      return {
        difficulty: 'Expert',
        comicTag: 'BOSS TIER!',
        ratingPercent,
        needleAngle: 66 + Math.min(6, complexityNudge),
        xpMultiplier: '2.0x XP',
        cognitiveDesc: 'Olympiad-grade mastery & first-principles deduction',
        hexColor: '#f43f5e',
        badgeBgClass: 'bg-rose-500 text-white border-slate-900',
        pillClass: 'bg-rose-500 hover:bg-rose-400 text-white border-slate-900',
        surfaceClass: 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-500',
        segmentIndex: 3,
      };
    }
  }
}

export const QuizzieCompanionWidget: React.FC<QuizzieCompanionWidgetProps> = ({
  stats,
  persona,
  soundEnabled,
  isQuizRunning = false,
  activeQuiz = null,
  onToggleSound,
  onOpenShortcuts,
  onOpenTutor,
  onNavigateToNotes,
  onOpenStarterTutorial,
}) => {
  const { userProfile, updateUserProfileInCloud } = useAuth();
  const { uiTheme, setUiTheme } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<'mascots' | 'accessories' | 'tools'>('mascots');
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(soundFx.isFocusHumming);
  const [ambientMode, setAmbientMode] = useState<AmbientSoundscapeMode>(soundFx.ambientMode);

  // Comic Speech Bubble State ('hint' | 'milestone' | 'difficulty')
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(true);
  const [bubbleMode, setBubbleMode] = useState<'hint' | 'milestone' | 'difficulty'>('hint');
  const [bubbleAnimKey, setBubbleAnimKey] = useState<number>(0);
  const [milestoneBannerText, setMilestoneBannerText] = useState<string | null>(null);
  const [previewDifficulty, setPreviewDifficulty] = useState<DifficultyType>('Intermediate');

  // Automatically pop the Difficulty Rating Gauge when a new quiz starts running
  const prevQuizTitleRef = useRef<string | null>(activeQuiz?.quiz_title || null);
  useEffect(() => {
    if (activeQuiz && activeQuiz.quiz_title !== prevQuizTitleRef.current) {
      prevQuizTitleRef.current = activeQuiz.quiz_title;
      setBubbleMode('difficulty');
      setShowSpeechBubble(true);
      setBubbleAnimKey((k) => k + 1);
    }
  }, [activeQuiz]);

  // Track previous level/xp/streak to automatically pop Level-Up & Milestone comic bubbles
  const prevLevelRef = useRef<number>(stats.level);
  const prevXpRef = useRef<number>(stats.xp);
  const prevStreakRef = useRef<number>(stats.streak);

  useEffect(() => {
    if (stats.level > prevLevelRef.current) {
      setBubbleMode('milestone');
      setShowSpeechBubble(true);
      setBubbleAnimKey((k) => k + 1);
      setMilestoneBannerText(`POW! LEVEL ${stats.level} UNLOCKED!`);
      soundFx.playLevelUp?.();
    } else if (stats.streak > prevStreakRef.current && stats.streak >= 3) {
      setBubbleMode('milestone');
      setShowSpeechBubble(true);
      setBubbleAnimKey((k) => k + 1);
      setMilestoneBannerText(`BOOM! ${stats.streak}-DAY STREAK COMBO!`);
    } else if (stats.xp > prevXpRef.current) {
      const gained = stats.xp - prevXpRef.current;
      setBubbleMode('milestone');
      setShowSpeechBubble(true);
      setBubbleAnimKey((k) => k + 1);
      setMilestoneBannerText(`KAPOW! +${gained} VERIFIED XP!`);
    }
    prevLevelRef.current = stats.level;
    prevXpRef.current = stats.xp;
    prevStreakRef.current = stats.streak;
  }, [stats.level, stats.xp, stats.streak]);

  const {
    mascotCharacter,
    mascotTheme,
    mascotAccessory,
    mascotCoins,
    unlockedMascots,
    unlockedAccessories,
    currentMascotMeta,
    currentAccessoryMeta,
    setMascotTheme,
    purchaseMascot,
    purchaseAccessory,
  } = useMascotPreferences();

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3200);
  };

  const handleNextTip = () => {
    soundFx.playClick?.();
    setBubbleMode('hint');
    setTipIndex((prev) => (prev + 1) % TUTOR_COMIC_HINTS.length);
    setBubbleAnimKey((k) => k + 1);
  };

  const handleTriggerMilestoneBubble = () => {
    soundFx.playPop?.();
    setBubbleMode('milestone');
    setShowSpeechBubble(true);
    setBubbleAnimKey((k) => k + 1);
  };

  const handlePetMascot = () => {
    soundFx.playPop();
    setShowSpeechBubble(true);
    setBubbleAnimKey((k) => k + 1);
  };

  const handleSetAsProfilePicture = async () => {
    soundFx.playComplete();
    await updateUserProfileInCloud({
      avatarType: 'mascot',
      mascotCharacter,
      mascotTheme,
      equippedAccessory: mascotAccessory,
    });
    showToast(`${currentMascotMeta.title} is now your profile picture!`);
  };

  const mascotMood: MascotMood =
    bubbleMode === 'milestone' || stats.streak > 3
      ? 'streak'
      : persona === 'Teacher'
      ? 'teacher'
      : 'idle';

  const isMascotProfileActive = userProfile?.avatarType === 'mascot';

  const levelProgress = getLevelProgress(stats.xp, stats.streak);
  const xpProgress = {
    currentLevelXp: levelProgress.currentLevelXp,
    xpNeededForNextLevel: levelProgress.xpRequiredForNextLevel,
    progressPercent: levelProgress.progressPercent,
  };
  const milestoneMeta = {
    nextTarget: levelProgress.nextMilestone?.level || stats.level + 5,
    rank: `${levelProgress.rank.badgeEmoji} ${levelProgress.rank.title}`,
    perk: levelProgress.rank.perkDescription,
  };

  const difficultyMeta = getQuizDifficultyRatingMeta(activeQuiz, previewDifficulty);

  // Reusable Neo-Comic Semi-Circular SVG Gauge + 4-Zone Color Indicator
  const renderDifficultyGaugeCard = (compact = false) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {activeQuiz ? `Active Quiz: ${activeQuiz.quiz_title}` : 'Difficulty Rating Preview'}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-black text-slate-950 dark:text-white">
              {difficultyMeta.difficulty}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${difficultyMeta.badgeBgClass}`}
            >
              {difficultyMeta.comicTag}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 text-[9px] font-mono font-black">
              {difficultyMeta.xpMultiplier}
            </span>
          </div>
        </div>

        {/* Semi-Circular Comic SVG Gauge Chart */}
        <div className="relative w-22 h-13 shrink-0 flex flex-col items-center justify-end">
          <svg viewBox="0 0 100 58" className="w-full h-full overflow-visible">
            {/* Background Track Arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#1e293b"
              strokeWidth="11"
              strokeLinecap="round"
              opacity="0.18"
            />
            {/* Zone 1: Foundational (Emerald) */}
            <path
              d="M 10 50 A 40 40 0 0 1 23 21"
              fill="none"
              stroke="#10b981"
              strokeWidth="9"
              strokeLinecap="butt"
            />
            {/* Zone 2: Intermediate (Cyan) */}
            <path
              d="M 25 19 A 40 40 0 0 1 50 10"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="9"
              strokeLinecap="butt"
            />
            {/* Zone 3: Advanced (Amber) */}
            <path
              d="M 50 10 A 40 40 0 0 1 75 19"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="9"
              strokeLinecap="butt"
            />
            {/* Zone 4: Expert (Crimson Rose) */}
            <path
              d="M 77 21 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="9"
              strokeLinecap="butt"
            />
            {/* Pivoting Gauge Needle */}
            <g
              transform={`translate(50, 50) rotate(${difficultyMeta.needleAngle})`}
              style={{ transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <polygon points="-2.8,0 0,-34 2.8,0" fill="#0f172a" />
              <polygon points="-1.4,0 0,-32 1.4,0" fill={difficultyMeta.hexColor} />
              <circle cx="0" cy="0" r="5.5" fill="#0f172a" />
              <circle cx="0" cy="0" r="2.8" fill="#fde047" />
            </g>
          </svg>
          <span className="text-[9px] font-mono font-black text-slate-900 dark:text-white -mt-1">
            {difficultyMeta.ratingPercent}% Load
          </span>
        </div>
      </div>

      {/* 4-Segment Color-Coded Difficulty Bar */}
      <div className="grid grid-cols-4 gap-1 pt-0.5">
        {DIFFICULTY_TIERS_ORDER.map((tier, idx) => {
          const isCurrentTier = difficultyMeta.segmentIndex === idx;
          const isFilled = idx <= difficultyMeta.segmentIndex;
          const segColors = [
            'bg-emerald-400 border-emerald-700',
            'bg-cyan-400 border-cyan-700',
            'bg-amber-400 border-amber-700',
            'bg-rose-500 border-rose-800',
          ];
          return (
            <button
              key={tier}
              type="button"
              onClick={() => {
                if (!activeQuiz) {
                  soundFx.playSelect?.();
                  setPreviewDifficulty(tier);
                  setBubbleAnimKey((k) => k + 1);
                }
              }}
              className={`h-2.5 rounded-md border transition-all ${
                isFilled ? segColors[idx] : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50'
              } ${isCurrentTier ? 'ring-2 ring-slate-900 dark:ring-white scale-y-115' : ''} ${
                !activeQuiz ? 'cursor-pointer hover:opacity-100' : 'cursor-default'
              }`}
              title={`${tier} Tier`}
            />
          );
        })}
      </div>

      {!compact && (
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300 pt-0.5">
          <span className="truncate">{difficultyMeta.cognitiveDesc}</span>
          {activeQuiz && (
            <span className="font-mono font-black text-slate-900 dark:text-white shrink-0 ml-2">
              {activeQuiz.questions?.length || 0} Qs
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Build contextual tutor hint when a quiz is actively running
  const activeHint: TutorComicHint =
    isQuizRunning && activeQuiz && tipIndex % 2 === 0
      ? {
          badge: 'LIVE QUIZ HINT!',
          title: `Coaching: ${activeQuiz.quiz_title}`,
          text: `Focus on ${activeQuiz.difficulty} concepts! Break each question stem into keywords before locking in your answer.`,
          ctaLabel: 'Open Socratic Tutor',
        }
      : TUTOR_COMIC_HINTS[tipIndex % TUTOR_COMIC_HINTS.length];

  const positionClasses = isQuizRunning
    ? 'fixed bottom-24 left-4 z-30 pointer-events-none'
    : 'fixed bottom-4 left-4 md:left-auto md:right-5 z-30 pointer-events-none';

  const tailDirectionClass = isQuizRunning
    ? 'comic-speech-tail-left'
    : 'comic-speech-tail-left md:comic-speech-tail-right';

  if (isMinimized) {
    return (
      <div className={`${positionClasses} animate-in fade-in slide-in-from-bottom-3 duration-300`}>
        <button
          type="button"
          onClick={() => {
            soundFx.playClick?.();
            setIsMinimized(false);
            setShowSpeechBubble(true);
          }}
          className="pointer-events-auto comic-pop-card flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-300 rounded-full shadow-md transition-all hover:scale-105 group cursor-pointer"
          title={`Open ${currentMascotMeta.title}`}
        >
          <MascotAvatar mood={mascotMood} size="xs" interactive={false} />
          <span className="text-xs font-black text-slate-900 dark:text-white">
            {currentMascotMeta.name}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] font-black text-slate-950 bg-amber-300 border border-slate-900 px-1.5 py-0.5 rounded-full">
            <Coins className="w-3 h-3 text-slate-950" />
            {mascotCoins}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`${positionClasses} flex flex-col ${isQuizRunning ? 'items-start' : 'items-start md:items-end'}`}>
      {/* ===================================================================== */}
      {/* FLOATING ANIMATED COMIC SPEECH BUBBLE (TUTOR HINTS & LEVEL MILESTONES) */}
      {/* ===================================================================== */}
      {!isOpen && showSpeechBubble && (
        <div
          key={`${bubbleMode}-${bubbleAnimKey}`}
          className={`pointer-events-auto mb-3.5 w-76 sm:w-84 rounded-2xl p-3.5 comic-speech-bubble ${tailDirectionClass} ${
            bubbleMode === 'milestone'
              ? 'comic-speech-bubble-milestone pattern-stripes-amber bg-amber-50 dark:bg-slate-900'
              : 'pattern-halftone bg-white dark:bg-slate-900'
          }`}
        >
          {/* Top Action Callout Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {bubbleMode === 'milestone' ? (
              <span className="comic-burst-badge px-2.5 py-0.5 rounded-md bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                <Trophy className="w-3 h-3 text-slate-950" />
                <span>{milestoneBannerText || `LEVEL ${stats.level} MILESTONE!`}</span>
              </span>
            ) : bubbleMode === 'difficulty' ? (
              <span
                className={`comic-burst-badge px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${difficultyMeta.badgeBgClass}`}
              >
                <Gauge className="w-3 h-3" />
                <span>DIFFICULTY GAUGE · {difficultyMeta.ratingPercent}%</span>
              </span>
            ) : (
              <span className="comic-burst-badge px-2.5 py-0.5 rounded-md bg-cyan-300 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                <Lightbulb className="w-3 h-3 text-slate-950" />
                <span>{activeHint.badge}</span>
              </span>
            )}

            <div className="flex items-center gap-1">
              {/* Mode Switch Pills: Hint / Gauge / Milestone */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  setBubbleMode((prev) =>
                    prev === 'hint' ? 'difficulty' : prev === 'difficulty' ? 'milestone' : 'hint'
                  );
                  setBubbleAnimKey((k) => k + 1);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase tracking-wider hover:bg-indigo-600 transition-colors cursor-pointer"
                title="Cycle between Tutor Hint, Difficulty Rating Gauge & Level Milestone"
              >
                {bubbleMode === 'hint'
                  ? '🎯 Gauge'
                  : bubbleMode === 'difficulty'
                  ? '🏆 Rank'
                  : '💡 Hint'}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  setShowSpeechBubble(false);
                }}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                title="Dismiss speech bubble"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Speech Bubble Body Content */}
          {bubbleMode === 'difficulty' ? (
            renderDifficultyGaugeCard(false)
          ) : bubbleMode === 'milestone' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                    <span>Rank: {milestoneMeta.rank}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-black uppercase">
                      Lv.{stats.level}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {milestoneMeta.perk}
                  </p>
                </div>
              </div>

              {/* Comic XP Milestone Bar */}
              <div className="p-2 rounded-xl bg-white/90 dark:bg-slate-950/80 border-2 border-slate-900 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-black">
                  <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    Next Milestone: Lv.{stats.level + 1}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {xpProgress.currentLevelXp} / {xpProgress.xpNeededForNextLevel} XP ({xpProgress.progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${Math.max(8, xpProgress.progressPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-600 dark:text-slate-400">
                  <span>Major Rank Target: Lv.{milestoneMeta.nextTarget}</span>
                  <span>🔥 {stats.streak}d Streak</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-950 dark:text-white">
                {currentMascotMeta.name}: &ldquo;{activeHint.title}&rdquo;
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-snug font-semibold">
                {activeHint.text}
              </p>

              {/* Inline Color-Coded Difficulty Rating Indicator Strip */}
              <div
                onClick={() => {
                  soundFx.playClick?.();
                  setBubbleMode('difficulty');
                  setBubbleAnimKey((k) => k + 1);
                }}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-900/20 dark:border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors"
                title="Click to open full Difficulty Rating Gauge"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Gauge className="w-3.5 h-3.5 shrink-0" style={{ color: difficultyMeta.hexColor }} />
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">
                    Difficulty: {difficultyMeta.difficulty}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border shrink-0 ${difficultyMeta.badgeBgClass}`}
                >
                  {difficultyMeta.ratingPercent}% · {difficultyMeta.xpMultiplier}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleNextTip}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-900/20 dark:border-slate-600 text-[10px] font-black transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>Next Hint</span>
                </button>

                {activeHint.ctaLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick?.();
                      onOpenTutor();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white border border-slate-950 text-[10px] font-black shadow-2xs transition-all cursor-pointer"
                  >
                    <Bot className="w-3 h-3" />
                    <span>{activeHint.ctaLabel}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* EXPANDED NEO-COMIC COMPANION COMMAND DRAWER                           */}
      {/* ===================================================================== */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-84 sm:w-[415px] comic-pop-card bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Card Top Banner */}
          <div className="relative p-3.5 pattern-halftone bg-indigo-50/90 dark:bg-slate-800/90 border-b-2 border-slate-900 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <MascotAvatar mood={mascotMood} size="sm" onClick={handlePetMascot} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="comic-badge px-1.5 py-0.5 rounded bg-amber-300 text-slate-950 text-[9px] font-black uppercase">
                    COMPANION
                  </span>
                  <h3 className="font-black text-sm tracking-tight text-slate-950 dark:text-white truncate">
                    {currentMascotMeta.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-300 text-slate-950 border border-slate-900 shrink-0">
                    <Coins className="w-3 h-3 text-slate-950" />
                    {mascotCoins}
                  </span>
                </div>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold truncate mt-0.5">
                  Pose: {currentMascotMeta.uniquePose} • {currentAccessoryMeta.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  setIsMinimized(true);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-rose-50 text-slate-700 dark:text-slate-200 hover:text-rose-600 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="grid grid-cols-3 p-1.5 bg-slate-100 dark:bg-slate-850 border-b-2 border-slate-900 dark:border-slate-800 text-[11px] font-black">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveSubTab('mascots');
              }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'mascots'
                  ? 'bg-indigo-600 text-white border border-slate-900 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950'
              }`}
            >
              Mascots (10)
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveSubTab('accessories');
              }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'accessories'
                  ? 'bg-indigo-600 text-white border border-slate-900 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950'
              }`}
            >
              Accessories
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveSubTab('tools');
              }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'tools'
                  ? 'bg-indigo-600 text-white border border-slate-900 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950'
              }`}
            >
              Comic Coach
            </button>
          </div>

          {/* Card Body */}
          <div className="p-3.5 space-y-3 max-h-[68vh] overflow-y-auto">
            {statusToast && (
              <div className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border-2 border-indigo-600 text-[11px] font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                <span>{statusToast}</span>
              </div>
            )}

            {/* Quick Set as Profile Picture + Desktop/Website Icon Banner */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl pattern-speed-stripes bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-900/15 dark:border-slate-700">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={getMascotIconDataUrl(mascotCharacter, mascotTheme, mascotAccessory)}
                  alt="Custom App Icon"
                  className="w-8 h-8 rounded-lg border border-slate-900/20 shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1 truncate">
                    <Monitor className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>App &amp; Tab Icon Synced</span>
                  </div>
                  <p className="text-[9px] text-slate-600 dark:text-slate-300 font-semibold truncate">
                    Updates your desktop &amp; website icon live
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleSetAsProfilePicture}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer border border-slate-900 ${
                    isMascotProfileActive
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs'
                  }`}
                  title="Use your customized mascot as your profile picture"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>{isMascotProfileActive ? 'Profile Active' : 'Set as Profile Pic'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    downloadCustomMascotDesktopIcon(mascotCharacter, mascotTheme, mascotAccessory);
                  }}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-indigo-600 cursor-pointer"
                  title="Download custom 512x512 desktop icon (.png)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {activeSubTab === 'mascots' && (
              <>
                <div className="grid grid-cols-5 gap-1.5">
                  {MASCOT_CATALOG.map((m) => {
                    const isSelected = mascotCharacter === m.id;
                    const isUnlocked = unlockedMascots.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          const res = purchaseMascot(m.id);
                          if (res.success) {
                            soundFx.playPop();
                          } else {
                            soundFx.playClick();
                          }
                          showToast(res.message);
                        }}
                        className={`flex flex-col items-center p-1.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 scale-102'
                            : isUnlocked
                            ? 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            : 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-slate-900/40 opacity-90 hover:opacity-100'
                        }`}
                        title={`${m.title} — Unique Pose: ${m.uniquePose}`}
                      >
                        <MascotAvatar
                          character={m.id}
                          theme={isSelected ? mascotTheme : m.defaultTheme}
                          accessory={isSelected ? mascotAccessory : m.defaultAccessory || 'none'}
                          size="xs"
                          interactive={false}
                        />
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 mt-1 truncate max-w-full">
                          {m.name}
                        </span>
                        {!isUnlocked ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-700 dark:text-amber-400">
                            <Lock className="w-2.5 h-2.5" />
                            {m.costCoins}
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400">
                            {isSelected ? 'Active' : 'Owned'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Mascot Color Palette Picker */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5 text-indigo-600" />
                      Mascot Color Aura
                    </span>
                    <span className="capitalize text-slate-900 dark:text-white font-black">
                      {mascotTheme}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    {MASCOT_THEME_CATALOG.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick?.();
                          setMascotTheme(t.id);
                        }}
                        className={`flex-1 h-6 rounded-xl border border-slate-900/20 ${t.swatchClass} transition-transform cursor-pointer ${
                          mascotTheme === t.id
                            ? 'ring-2 ring-offset-2 ring-indigo-600 scale-105'
                            : 'opacity-75 hover:opacity-100'
                        }`}
                        title={t.label}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeSubTab === 'accessories' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  <span>Unlock Accessories with Mascot Coins</span>
                  <span className="text-amber-700 dark:text-amber-400 font-black">
                    {mascotCoins} Coins
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {MASCOT_ACCESSORY_CATALOG.map((acc) => {
                    const isUnlocked = unlockedAccessories.includes(acc.id);
                    const isSelected = mascotAccessory === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          const res = purchaseAccessory(acc.id);
                          if (res.success) {
                            soundFx.playPop();
                          } else {
                            soundFx.playClick();
                          }
                          showToast(res.message);
                        }}
                        className={`flex flex-col items-start p-2 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60'
                            : isUnlocked
                            ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-amber-400'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="text-sm">{acc.previewEmoji}</span>
                          {!isUnlocked ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-300 text-slate-950 border border-slate-900">
                              <Coins className="w-2.5 h-2.5 text-slate-950" />
                              {acc.costCoins}
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                              {isSelected ? 'On' : 'Owned'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 mt-1 truncate max-w-full">
                          {acc.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1 font-medium">
                  <strong>How to earn Mascot Coins:</strong> Score 80%+ on a quiz (+2 Coins), 90%+ (+4 Coins), or 100% Perfect (+8 Coins)!
                </p>
              </div>
            )}

            {activeSubTab === 'tools' && (
              <>
                {/* Active Quiz Difficulty Rating Gauge Panel inside Drawer */}
                <div className="p-3 rounded-2xl comic-pop-card bg-slate-50 dark:bg-slate-850 border-2 border-slate-900 dark:border-slate-700">
                  {renderDifficultyGaugeCard(false)}
                </div>

                {/* Quick 6 UI Themes Switcher inside Quizzie Companion */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border-2 border-slate-900/20 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>UI Theme World</span>
                    </span>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                      {UI_THEME_CATALOG.find((t) => t.id === uiTheme)?.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {UI_THEME_CATALOG.map((th) => {
                      const active = uiTheme === th.id;
                      return (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => {
                            soundFx.playPop?.();
                            setUiTheme(th.id);
                            showToast(`UI Theme: ${th.name}`);
                          }}
                          className={`px-2 py-1.5 rounded-xl border-2 text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer truncate ${
                            active
                              ? 'border-slate-950 dark:border-amber-300 bg-indigo-600 text-white shadow-2xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                          }`}
                          title={th.tagline}
                        >
                          <span>{th.emoji}</span>
                          <span className="truncate">{th.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Animated Comic Speech Bubble Inside Drawer (Tutor Hints + Level-Up Milestones) */}
                <div
                  key={`drawer-bubble-${bubbleMode}-${bubbleAnimKey}`}
                  className={`p-3.5 rounded-2xl comic-speech-bubble ${
                    bubbleMode === 'milestone'
                      ? 'comic-speech-bubble-milestone pattern-stripes-amber bg-amber-50 dark:bg-slate-850'
                      : 'pattern-halftone bg-indigo-50/60 dark:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`comic-burst-badge px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        bubbleMode === 'milestone'
                          ? 'bg-amber-300 text-slate-950'
                          : 'bg-cyan-300 text-slate-950'
                      }`}
                    >
                      {bubbleMode === 'milestone' ? '🏆 LEVEL MILESTONE!' : activeHint.badge}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick?.();
                          setBubbleMode('hint');
                          setBubbleAnimKey((k) => k + 1);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase cursor-pointer ${
                          bubbleMode === 'hint'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        💡 Hint
                      </button>
                      <button
                        type="button"
                        onClick={handleTriggerMilestoneBubble}
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase cursor-pointer ${
                          bubbleMode === 'milestone'
                            ? 'bg-amber-400 text-slate-950 border border-slate-900'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        🏆 Lv.{stats.level}
                      </button>
                    </div>
                  </div>

                  {bubbleMode === 'milestone' ? (
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-slate-950 dark:text-white">
                        {currentMascotMeta.name}: &ldquo;You’re Rank {milestoneMeta.rank} (Lv.{stats.level})!&rdquo;
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {milestoneMeta.perk}
                      </p>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-900 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-rose-500"
                          style={{ width: `${Math.max(8, xpProgress.progressPercent)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black text-slate-800 dark:text-slate-200">
                        <span>{xpProgress.currentLevelXp} / {xpProgress.xpNeededForNextLevel} XP</span>
                        <span>Next Major Milestone: Lv.{milestoneMeta.nextTarget}</span>
                      </div>
                    </div>
                  ) : (
                    <div onClick={handleNextTip} className="cursor-pointer group space-y-1">
                      <div className="flex items-center justify-between text-xs font-black text-slate-950 dark:text-white">
                        <span>&ldquo;{activeHint.title}&rdquo;</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 group-hover:underline">
                          Next ↻
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                        {activeHint.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Ambient Study Soundscape Quick-Mixer */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5 text-cyan-600" />
                      Study Soundscape
                    </span>
                    <span className="text-[10px] font-black text-cyan-700 dark:text-cyan-400">
                      {isAmbientPlaying ? '● Playing' : 'Off'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'alpha432' as AmbientSoundscapeMode, label: '432Hz Focus' },
                        { id: 'rain' as AmbientSoundscapeMode, label: 'Study Rain' },
                        { id: 'pinknoise' as AmbientSoundscapeMode, label: 'Pink Noise' },
                      ]
                    ).map((sc) => {
                      const active = isAmbientPlaying && ambientMode === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            if (active) {
                              soundFx.stopFocusHum();
                              setIsAmbientPlaying(false);
                            } else {
                              setAmbientMode(sc.id);
                              soundFx.startFocusHum(sc.id);
                              setIsAmbientPlaying(true);
                            }
                          }}
                          className={`py-1.5 px-2 rounded-xl border-2 text-[10px] font-black transition-all cursor-pointer ${
                            active
                              ? 'border-cyan-600 bg-cyan-300 text-slate-950'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:border-cyan-500'
                          }`}
                        >
                          {sc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
                  {onOpenStarterTutorial && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick?.();
                        onOpenStarterTutorial();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 text-xs font-black transition-colors cursor-pointer border-2 border-slate-900"
                    >
                      <span className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-slate-950" />
                        Interactive Starter Tutorial
                      </span>
                      <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-md border border-slate-900 font-black">
                        Guide
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick?.();
                      onOpenTutor();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-colors cursor-pointer border-2 border-slate-900"
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      Chat with 1-on-1 Tutor
                    </span>
                    <span className="text-[10px] bg-indigo-800 px-1.5 py-0.5 rounded-md font-mono">T</span>
                  </button>

                  {onNavigateToNotes && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick?.();
                        onNavigateToNotes();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white text-xs font-black transition-colors cursor-pointer border-2 border-slate-900/20 dark:border-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        Open Study Guides
                      </span>
                      <span className="text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md font-mono">N</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onToggleSound}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-slate-200 text-xs font-black border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Toggle Sound Effects"
                    >
                      {soundEnabled ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sound On</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                          <span>Muted</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick?.();
                        onOpenShortcuts();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-slate-200 text-xs font-black border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Keyboard Shortcuts [?]"
                    >
                      <Keyboard className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Keys</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FLOATING COMPANION TRIGGER BAR & SPEECH BUBBLE QUICK TOGGLES          */}
      {/* ===================================================================== */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        {!isOpen && (
          <>
            {/* Color-Coded Difficulty Rating Indicator Pill */}
            <button
              type="button"
              onClick={() => {
                soundFx.playPop?.();
                setShowSpeechBubble(true);
                setBubbleMode('difficulty');
                setBubbleAnimKey((k) => k + 1);
              }}
              className={`comic-pop-card flex items-center gap-1 px-2.5 py-1.5 rounded-full border-2 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-transform active:scale-95 ${difficultyMeta.pillClass}`}
              title={`Active Quiz Difficulty Rating: ${difficultyMeta.difficulty} (${difficultyMeta.ratingPercent}% Load • ${difficultyMeta.xpMultiplier})`}
            >
              <Gauge className="w-3 h-3" />
              <span>{difficultyMeta.difficulty}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playPop?.();
                if (!showSpeechBubble) {
                  setShowSpeechBubble(true);
                  setBubbleAnimKey((k) => k + 1);
                } else {
                  setBubbleMode((prev) =>
                    prev === 'hint' ? 'difficulty' : prev === 'difficulty' ? 'milestone' : 'hint'
                  );
                  setBubbleAnimKey((k) => k + 1);
                }
              }}
              className="comic-pop-card flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-slate-900 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-transform active:scale-95"
              title="Pop or switch Quizzie's Comic Speech Bubble (Tutor Hints, Difficulty Gauge & Level Milestones)"
            >
              <MessageSquare className="w-3 h-3 fill-slate-950" />
              <span>
                {showSpeechBubble
                  ? bubbleMode === 'hint'
                    ? '🎯 Gauge'
                    : bubbleMode === 'difficulty'
                    ? '🏆 Rank'
                    : '💡 Hint'
                  : '💬 Bubble'}
              </span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            soundFx.playClick?.();
            setIsOpen((prev) => !prev);
          }}
          className="comic-pop-card flex items-center gap-2 pl-2 pr-3.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-200 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
          title={`${currentMascotMeta.title} Companion`}
        >
          <div className="relative">
            <MascotAvatar mood={mascotMood} size="xs" interactive={false} />
            {stats.streak > 2 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 flex items-center justify-center animate-pulse">
                <span className="w-1 h-1 bg-slate-950 rounded-full" />
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {currentMascotMeta.name}
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-300 text-slate-950 border border-slate-900 flex items-center gap-0.5">
                <Coins className="w-2.5 h-2.5 text-slate-950" />
                {mascotCoins}
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

