import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Trophy,
  Users,
  Play,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowRight,
  LogOut,
  Copy,
  Check,
  Sparkles,
  Crown,
  Zap,
  Award,
  UserPlus,
  Volume2,
  VolumeX,
  Shield,
  Scissors,
  BarChart3,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { LiveSessionData, LiveParticipant } from '../../types/liveSession';
import {
  subscribeLiveSession,
  updateSessionStatus,
  submitLiveAnswer,
  advanceToNextQuestion,
  calculateAnswerPoints,
  addSimulatedParticipants,
  normalizeQuizForLiveBattle,
} from '../../services/liveSession';
import { soundFx } from '../../utils/audio';

interface LiveSessionRoomProps {
  roomCode: string;
  initialData: LiveSessionData;
  isHost: boolean;
  currentUserId: string;
  onLeave: () => void;
  onAwardLiveRewards?: (xpEarned: number, gemsEarned: number, wonFirstPlace: boolean) => void;
}

const OPTION_TILES = [
  {
    index: 0,
    name: 'Option A',
    symbol: 'A',
    keyHint: '1',
    bg: 'bg-indigo-600 hover:bg-indigo-500',
    barBg: 'bg-indigo-600',
    shadow: 'shadow-sm',
    border: 'border-indigo-400/50',
  },
  {
    index: 1,
    name: 'Option B',
    symbol: 'B',
    keyHint: '2',
    bg: 'bg-violet-600 hover:bg-violet-500',
    barBg: 'bg-violet-600',
    shadow: 'shadow-sm',
    border: 'border-violet-400/50',
  },
  {
    index: 2,
    name: 'Option C',
    symbol: 'C',
    keyHint: '3',
    bg: 'bg-amber-600 hover:bg-amber-500',
    barBg: 'bg-amber-500',
    shadow: 'shadow-sm',
    border: 'border-amber-400/50',
  },
  {
    index: 3,
    name: 'Option D',
    symbol: 'D',
    keyHint: '4',
    bg: 'bg-emerald-600 hover:bg-emerald-500',
    barBg: 'bg-emerald-600',
    shadow: 'shadow-sm',
    border: 'border-emerald-400/50',
  },
];

const WAITING_MESSAGES = [
  'Checking your speed bonus...',
  'Nice! Waiting for everyone else to finish...',
  'Great job locking in your answer!',
  'Counting up your streak bonus...',
  'Get ready to see the results...',
];

const AVATAR_BADGE_MAP: Record<string, string> = {
  rose: 'bg-rose-600',
  indigo: 'bg-indigo-600',
  amber: 'bg-amber-600',
  emerald: 'bg-emerald-600',
  violet: 'bg-violet-600',
  cyan: 'bg-cyan-600',
  teal: 'bg-teal-600',
};

interface FloatingEmote {
  id: number;
  emoji: string;
  leftPercent: number;
}

export const LiveSessionRoom: React.FC<LiveSessionRoomProps> = ({
  roomCode,
  initialData,
  isHost,
  currentUserId,
  onLeave,
  onAwardLiveRewards,
}) => {
  const [session, setSession] = useState<LiveSessionData>(() => ({
    ...initialData,
    quiz: normalizeQuizForLiveBattle(initialData.quiz),
  }));
  const [copiedCode, setCopiedCode] = useState(false);
  const [startingCount, setStartingCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState<number>(initialData.settings?.timePerQuestion || 20);
  const [localSelectedOption, setLocalSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGetReadySplash, setShowGetReadySplash] = useState(false);
  const [reviewSubView, setReviewSubView] = useState<'chart' | 'scoreboard'>('chart');

  // Kahoot!+ Player Power-Ups (1 use each per game)
  const [doublePointsAvailable, setDoublePointsAvailable] = useState(true);
  const [doublePointsActiveThisRound, setDoublePointsActiveThisRound] = useState(false);
  const [fiftyFiftyAvailable, setFiftyFiftyAvailable] = useState(true);
  const [hiddenOptionIndices, setHiddenOptionIndices] = useState<number[]>([]);
  const [streakShieldAvailable, setStreakShieldAvailable] = useState(true);
  const [streakShieldActiveThisRound, setStreakShieldActiveThisRound] = useState(false);

  // Groove Music & Floating Reactions
  const [isMusicOn, setIsMusicOn] = useState<boolean>(false);
  const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);
  const [waitingQuipIndex, setWaitingQuipIndex] = useState(0);

  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rewardsAwardedRef = useRef(false);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeLiveSession(roomCode, (updated) => {
      if (updated) {
        setSession({
          ...updated,
          quiz: normalizeQuizForLiveBattle(updated.quiz),
        });
      }
    });
    return () => {
      unsubscribe();
      soundFx.stopKahootMusic();
    };
  }, [roomCode]);

  // Sync Kahoot! groove music mode when session status changes
  useEffect(() => {
    if (!isMusicOn) return;
    if (session.status === 'lobby' || session.status === 'countdown') {
      soundFx.startKahootMusic('lobby');
    } else if (session.status === 'in_progress') {
      soundFx.startKahootMusic('question');
    } else if (session.status === 'finished') {
      soundFx.startKahootMusic('podium');
    }
  }, [session.status, isMusicOn]);

  const participantsList: LiveParticipant[] = useMemo(() => {
    const map = session.participants || {};
    const list = Object.values(map) as LiveParticipant[];
    return list.sort((a, b) => b.score - a.score);
  }, [session.participants]);

  const currentParticipant: LiveParticipant | undefined = useMemo(() => {
    return (
      session.participants?.[currentUserId] ||
      participantsList.find((p) => p.id === currentUserId)
    );
  }, [session.participants, currentUserId, participantsList]);

  const questions = useMemo(() => {
    return normalizeQuizForLiveBattle(session.quiz).questions || [];
  }, [session.quiz]);

  const currentQIndex = session.currentQuestionIndex || 0;
  const currentQuestion = questions[currentQIndex] || questions[0];

  // Reset per-question states when question index or status changes
  useEffect(() => {
    if (session.status === 'in_progress') {
      const existingAns = currentParticipant?.answers?.[currentQIndex];
      if (!existingAns) {
        setLocalSelectedOption(null);
        setIsSubmitting(false);
      } else {
        setLocalSelectedOption(existingAns.selectedAnswer);
      }
      setHiddenOptionIndices([]);
      setReviewSubView('chart');
      setWaitingQuipIndex(Math.floor(Math.random() * WAITING_MESSAGES.length));

      // Trigger brief "Get Ready!" splash on question start
      setShowGetReadySplash(true);
      const splashTimer = setTimeout(() => {
        setShowGetReadySplash(false);
      }, 1300);
      return () => clearTimeout(splashTimer);
    } else if (session.status === 'question_review') {
      setDoublePointsActiveThisRound(false);
      setStreakShieldActiveThisRound(false);
      soundFx.playKahootGong();
    }
  }, [currentQIndex, session.status]);

  // Award profile XP & Gems when reaching the final Podium
  useEffect(() => {
    if (session.status === 'finished' && !rewardsAwardedRef.current) {
      rewardsAwardedRef.current = true;
      soundFx.playComplete();
      if (onAwardLiveRewards && currentParticipant) {
        const myRank = participantsList.findIndex((p) => p.id === currentUserId) + 1;
        const xpEarned = Math.max(100, Math.round(currentParticipant.score / 12));
        const gemsEarned = myRank === 1 ? 50 : myRank <= 3 ? 30 : 15;
        onAwardLiveRewards(xpEarned, gemsEarned, myRank === 1);
      }
    }
  }, [session.status, currentParticipant, participantsList, currentUserId, onAwardLiveRewards]);

  // Handle 3-2-1 starting countdown
  useEffect(() => {
    if (session.status !== 'countdown') return;
    setStartingCount(3);
    soundFx.playTimerTick();

    const interval = setInterval(() => {
      setStartingCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          soundFx.playSpeedBonus();
          if (isHost) {
            updateSessionStatus(roomCode, 'in_progress', {
              currentQuestionIndex: 0,
              questionStartTime: Date.now(),
            });
          }
          return 0;
        }
        soundFx.playTimerTick();
        return prev - 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [session.status, isHost, roomCode]);

  // Per-question timer countdown
  useEffect(() => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }

    if (session.status !== 'in_progress') return;

    const limitSec = session.settings?.timePerQuestion || 20;
    const startMs = session.questionStartTime || Date.now();

    const updateTick = () => {
      const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
      const remaining = Math.max(0, limitSec - elapsedSec);
      setTimeLeft(remaining);

      if (remaining <= 5 && remaining > 0) {
        soundFx.playTimerTick();
      }

      if (remaining <= 0) {
        if (questionTimerRef.current) clearInterval(questionTimerRef.current);
        if (isHost) {
          updateSessionStatus(roomCode, 'question_review');
        }
      }
    };

    updateTick();
    questionTimerRef.current = setInterval(updateTick, 500);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [session.status, session.questionStartTime, session.settings?.timePerQuestion, isHost, roomCode]);

  // Simulate AI Challenger bot answers when question is in_progress
  useEffect(() => {
    botTimersRef.current.forEach((t) => clearTimeout(t));
    botTimersRef.current = [];

    if (session.status !== 'in_progress' || !isHost || !currentQuestion) return;

    const bots = participantsList.filter(
      (p) => p.id.startsWith('bot_') && !p.answers?.[currentQIndex]
    );

    if (bots.length === 0) return;

    const opts =
      currentQuestion.options && currentQuestion.options.length > 0
        ? currentQuestion.options
        : [currentQuestion.correct_answer, 'Option B', 'Option C', 'Option D'];

    bots.forEach((bot, idx) => {
      const delayMs = 2200 + idx * 1300 + Math.floor(Math.random() * 2800);
      const timer = setTimeout(() => {
        const isBotCorrect = Math.random() < 0.72;
        const chosenAnswer = isBotCorrect
          ? currentQuestion.correct_answer
          : opts.find((o) => o !== currentQuestion.correct_answer) || opts[0];

        const pts = calculateAnswerPoints(
          chosenAnswer === currentQuestion.correct_answer,
          delayMs,
          session.settings?.timePerQuestion || 20,
          bot.streak || 0,
          session.settings?.streakBonusesEnabled ?? true
        );

        const nextScore = (bot.score || 0) + pts;
        const nextStreak =
          chosenAnswer === currentQuestion.correct_answer ? (bot.streak || 0) + 1 : 0;

        submitLiveAnswer(
          roomCode,
          bot.id,
          currentQIndex,
          {
            selectedAnswer: chosenAnswer,
            isCorrect: chosenAnswer === currentQuestion.correct_answer,
            responseTimeMs: delayMs,
            pointsEarned: pts,
          },
          nextScore,
          nextStreak
        );
      }, delayMs);

      botTimersRef.current.push(timer);
    });

    return () => {
      botTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, [session.status, currentQIndex, isHost, currentQuestion, participantsList.length, roomCode]);

  // Auto-transition to question_review once ALL active participants have answered
  const answeredCount = useMemo(() => {
    return participantsList.filter(
      (p) => p.hasAnsweredCurrent || Boolean(p.answers?.[currentQIndex])
    ).length;
  }, [participantsList, currentQIndex]);

  useEffect(() => {
    if (
      isHost &&
      session.status === 'in_progress' &&
      participantsList.length > 0 &&
      answeredCount >= participantsList.length
    ) {
      const timer = setTimeout(() => {
        updateSessionStatus(roomCode, 'question_review');
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [isHost, session.status, answeredCount, participantsList.length, roomCode]);

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    soundFx.playClick();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTriggerEmote = (emoji: string) => {
    soundFx.playPop();
    const newEmote: FloatingEmote = {
      id: Date.now() + Math.random(),
      emoji,
      leftPercent: 15 + Math.floor(Math.random() * 70),
    };
    setFloatingEmotes((prev) => [...prev.slice(-10), newEmote]);
    setTimeout(() => {
      setFloatingEmotes((prev) => prev.filter((e) => e.id !== newEmote.id));
    }, 2400);
  };

  const handleToggleMusic = () => {
    const mode =
      session.status === 'in_progress'
        ? 'question'
        : session.status === 'finished'
        ? 'podium'
        : 'lobby';
    const next = soundFx.toggleKahootMusic(mode);
    setIsMusicOn(next);
  };

  // Power-Up Handlers
  const handleActivateDoublePoints = () => {
    if (!doublePointsAvailable || doublePointsActiveThisRound || hasSubmittedCurrent) return;
    soundFx.playKahootPowerUp();
    setDoublePointsAvailable(false);
    setDoublePointsActiveThisRound(true);
    handleTriggerEmote('⚡');
  };

  const handleActivateFiftyFifty = () => {
    if (!fiftyFiftyAvailable || hiddenOptionIndices.length > 0 || hasSubmittedCurrent || !currentQuestion)
      return;
    soundFx.playKahootPowerUp();
    setFiftyFiftyAvailable(false);
    const opts = currentQuestion.options || [];
    const wrongIndices = opts
      .map((opt, idx) => ({ opt, idx }))
      .filter(
        (item) =>
          item.opt.trim().toLowerCase() !== currentQuestion.correct_answer.trim().toLowerCase()
      )
      .map((item) => item.idx);

    const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOptionIndices(shuffledWrong);
    handleTriggerEmote('✂️');
  };

  const handleActivateStreakShield = () => {
    if (!streakShieldAvailable || streakShieldActiveThisRound || hasSubmittedCurrent) return;
    soundFx.playKahootPowerUp();
    setStreakShieldAvailable(false);
    setStreakShieldActiveThisRound(true);
    handleTriggerEmote('🛡️');
  };

  const handleStartGame = async () => {
    soundFx.playClick();
    await updateSessionStatus(roomCode, 'countdown');
  };

  const handleAddBots = async () => {
    soundFx.playPop();
    await addSimulatedParticipants(roomCode, participantsList.length);
  };

  const handleSelectOption = async (optionText: string) => {
    if (
      session.status !== 'in_progress' ||
      localSelectedOption ||
      isSubmitting ||
      Boolean(currentParticipant?.answers?.[currentQIndex])
    ) {
      return;
    }

    setLocalSelectedOption(optionText);
    setIsSubmitting(true);

    const startMs = session.questionStartTime || Date.now();
    const responseTimeMs = Math.max(200, Date.now() - startMs);
    const isCorrect =
      optionText.trim().toLowerCase() ===
      (currentQuestion?.correct_answer || '').trim().toLowerCase();

    if (isCorrect) {
      soundFx.playCorrect();
      handleTriggerEmote('🔥');
    } else {
      soundFx.playIncorrect();
    }

    let pointsEarned = calculateAnswerPoints(
      isCorrect,
      responseTimeMs,
      session.settings?.timePerQuestion || 20,
      currentParticipant?.streak || 0,
      session.settings?.streakBonusesEnabled ?? true
    );

    // Apply 2x Double Points Power-Up or Final Round 2x Bonus
    const isFinalQuestion = currentQIndex === questions.length - 1 && questions.length > 1;
    if (isCorrect && (doublePointsActiveThisRound || isFinalQuestion)) {
      pointsEarned *= 2;
    }

    const newScore = (currentParticipant?.score || 0) + pointsEarned;
    const newStreak = isCorrect
      ? (currentParticipant?.streak || 0) + 1
      : streakShieldActiveThisRound
      ? currentParticipant?.streak || 0
      : 0;

    await submitLiveAnswer(
      roomCode,
      currentUserId,
      currentQIndex,
      {
        selectedAnswer: optionText,
        isCorrect,
        responseTimeMs,
        pointsEarned,
      },
      newScore,
      newStreak
    );

    setIsSubmitting(false);
  };

  // Keyboard shortcuts 1, 2, 3, 4 for Kahoot! shapes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (session.status !== 'in_progress' || showGetReadySplash) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const opts = currentQuestion?.options || [];
      const keyMap: Record<string, number> = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      };
      const idx = keyMap[e.key.toLowerCase()];
      if (idx !== undefined && opts[idx] && !hiddenOptionIndices.includes(idx)) {
        handleSelectOption(opts[idx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session.status, showGetReadySplash, currentQuestion, hiddenOptionIndices, localSelectedOption]);

  const handleNextStep = async () => {
    soundFx.playClick();
    if (currentQIndex + 1 < questions.length) {
      await advanceToNextQuestion(
        roomCode,
        currentQIndex + 1,
        session.participants || {}
      );
    } else {
      await updateSessionStatus(roomCode, 'finished');
    }
  };

  const handlePlayAgain = async () => {
    soundFx.playComplete();
    rewardsAwardedRef.current = false;
    setDoublePointsAvailable(true);
    setFiftyFiftyAvailable(true);
    setStreakShieldAvailable(true);

    // Reset participant scores and answers
    const resetMap: Record<string, LiveParticipant> = {};
    (Object.entries(session.participants || {}) as [string, LiveParticipant][]).forEach(
      ([pid, p]) => {
        resetMap[pid] = {
          ...p,
          score: 0,
          streak: 0,
          answers: {},
          hasAnsweredCurrent: false,
        };
      }
    );

    await updateSessionStatus(roomCode, 'countdown', {
      currentQuestionIndex: 0,
      participants: resetMap,
    });
  };

  const myCurrentAnswer = currentParticipant?.answers?.[currentQIndex];
  const hasSubmittedCurrent = Boolean(localSelectedOption || myCurrentAnswer);
  const isFinalDoubleRound = currentQIndex === questions.length - 1 && questions.length > 1;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-8 relative">
      {/* Floating Live Reaction Emotes Overlay */}
      <div className="fixed inset-x-0 bottom-16 pointer-events-none z-50 overflow-hidden h-56">
        {floatingEmotes.map((item) => (
          <div
            key={item.id}
            style={{ left: `${item.leftPercent}%` }}
            className="absolute bottom-0 text-3xl animate-float-emoji drop-shadow-lg"
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* ================= TOP CONTROL & GAME CODE BAR ================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          {/* Code Badge */}
          <button
            type="button"
            onClick={handleCopyRoomCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 font-mono font-black text-xs hover:bg-indigo-600/30 transition-all cursor-pointer"
            title="Click to copy Game Code"
          >
            <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-sans">
              CODE:
            </span>
            <span className="tracking-widest text-sm text-white">{roomCode}</span>
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-indigo-300" />
            )}
          </button>

          <div className="hidden sm:block">
            <h2 className="text-xs font-black text-white truncate max-w-xs">
              {session.quiz?.quiz_title}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {session.status === 'lobby'
                ? 'Waiting for players to join...'
                : session.status === 'finished'
                ? 'Final Results'
                : `Question ${currentQIndex + 1} of ${questions.length}`}
            </p>
          </div>
        </div>

        {/* Center Reaction Emote Bar */}
        <div className="flex items-center gap-1 bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-700">
          {['🔥', '🎉', '⚡', '🧠', '👑', '🚀'].map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => handleTriggerEmote(em)}
              className="w-7 h-7 rounded-lg hover:bg-slate-700 flex items-center justify-center text-sm transition-transform cursor-pointer"
              title={`Send ${em} reaction`}
            >
              {em}
            </button>
          ))}
        </div>

        {/* Right Music Toggle, Player Score & Leave */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isMusicOn
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Turn game music on or off"
          >
            {isMusicOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isMusicOn ? 'Music On' : 'Music'}</span>
          </button>

          {currentParticipant && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
              {currentParticipant.streak >= 2 && (
                <span className="inline-flex items-center gap-0.5 text-xs font-black text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {currentParticipant.streak}
                </span>
              )}
              <span className="text-xs font-black text-white font-mono">
                {(currentParticipant.score || 0).toLocaleString()} pts
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              soundFx.stopKahootMusic();
              soundFx.playClick();
              onLeave();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* ================= 1. LOBBY PHASE ================= */}
      {session.status === 'lobby' && (
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-5">
          {/* Join Header Card */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-500/30">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-indigo-300">
                Live Quiz Lobby
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300">
                Share this 6-digit Game Code with friends so they can join:
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-200">
                  GAME CODE
                </div>
                <div className="text-2xl sm:text-4xl font-black tracking-widest text-white font-mono">
                  {roomCode}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyRoomCode}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Copy Game Code"
              >
                {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Middle Controls Bar: Player Count + Add Bots + Start Game */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 dark:border-slate-800 py-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-black text-slate-900 dark:text-white">{participantsList.length}</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Players Ready
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isHost && (
                <button
                  type="button"
                  onClick={handleAddBots}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-indigo-500" />
                  <span>+ Add 3 AI Players</span>
                </button>
              )}

              {isHost ? (
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-sm transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Game</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>You&apos;re in! Waiting for host to start...</span>
                </div>
              )}
            </div>
          </div>

          {/* Lobby Player Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-h-[100px]">
            {participantsList.map((p, idx) => {
              const badgeColor = AVATAR_BADGE_MAP[p.avatarColor] || 'bg-indigo-600';
              const letterSymbol = OPTION_TILES[idx % 4].symbol;
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5 shadow-2xs"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${badgeColor} text-white font-black text-sm flex items-center justify-center shrink-0`}
                  >
                    {p.name.charAt(0).toUpperCase() || letterSymbol}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{p.name}</span>
                      {p.id === currentUserId && (
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-black uppercase shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {p.id.startsWith('bot_') ? '🤖 AI Player' : '✓ Ready'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 2. 3-2-1-GO! COUNTDOWN ================= */}
      {session.status === 'countdown' && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-10 text-center space-y-4 shadow-xl border border-indigo-500/30 min-h-[320px] flex flex-col items-center justify-center">
          <div className="text-xs font-black uppercase tracking-widest text-indigo-300">
            Get Ready!
          </div>
          <div
            key={startingCount}
            className="w-28 h-28 rounded-2xl bg-indigo-600 flex items-center justify-center text-5xl font-black text-white shadow-xl border-2 border-indigo-400/50"
          >
            {startingCount > 0 ? startingCount : 'GO!'}
          </div>
          <p className="text-slate-300 text-sm font-medium">
            Answer quickly and accurately to earn extra speed points!
          </p>
        </div>
      )}

      {/* ================= 3. LIVE QUESTION STAGE ================= */}
      {session.status === 'in_progress' && currentQuestion && (
        <div className="space-y-4">
          {/* "Get Ready!" Splash Overlay Banner */}
          {showGetReadySplash ? (
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-10 text-center space-y-4 shadow-xl border border-indigo-500/30 min-h-[320px] flex flex-col items-center justify-center">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Question {currentQIndex + 1} of {questions.length}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight max-w-2xl leading-snug">
                {currentQuestion.question}
              </h2>

              {(isFinalDoubleRound || doublePointsActiveThisRound) && (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                  <Zap className="w-4 h-4 fill-current" />
                  <span>2X POINTS ACTIVE!</span>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Top Question Display Stage Card */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 text-center space-y-4 relative overflow-hidden">
                {/* Top Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      timeLeft <= 5 ? 'bg-rose-500' : 'bg-indigo-600'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (timeLeft / (session.settings?.timePerQuestion || 20)) * 100
                      )}%`,
                    }}
                  />
                </div>

                {/* Question Metadata & Double Points Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>

                  {(isFinalDoubleRound || doublePointsActiveThisRound) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>2x Points Round</span>
                    </span>
                  )}

                  <span className="text-xs font-medium text-slate-400">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">1-4</kbd> to answer
                  </span>
                </div>

                {/* Stage Question Text */}
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug max-w-3xl mx-auto py-1">
                  {currentQuestion.question}
                </h2>

                {currentQuestion.code_snippet && (
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto text-left max-w-2xl mx-auto border border-slate-800">
                    <code>{currentQuestion.code_snippet}</code>
                  </pre>
                )}

                {/* Middle Stage HUD: Left Timer + Center Power-Ups + Right Answer Counter */}
                <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Left Circular Timer */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-white shadow-sm shrink-0 ${
                      timeLeft <= 5 ? 'bg-rose-600 animate-pulse' : 'bg-indigo-600'
                    }`}
                  >
                    <span className="text-xl font-mono leading-none">{timeLeft}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-80">sec</span>
                  </div>

                  {/* Center Power-Ups Dock */}
                  <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      disabled={!doublePointsAvailable || hasSubmittedCurrent}
                      onClick={handleActivateDoublePoints}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        doublePointsActiveThisRound
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : doublePointsAvailable
                          ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                          : 'opacity-40 bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Double your points if you get this question right"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{doublePointsActiveThisRound ? '2x Active!' : '2x Points'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={!fiftyFiftyAvailable || hasSubmittedCurrent}
                      onClick={handleActivateFiftyFifty}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        hiddenOptionIndices.length > 0
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : fiftyFiftyAvailable
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50'
                          : 'opacity-40 bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Hide 2 wrong choices"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>50/50</span>
                    </button>

                    <button
                      type="button"
                      disabled={!streakShieldAvailable || hasSubmittedCurrent}
                      onClick={handleActivateStreakShield}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        streakShieldActiveThisRound
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : streakShieldAvailable
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50'
                          : 'opacity-40 bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Keep your streak even if you miss this question"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{streakShieldActiveThisRound ? 'Shield ON' : 'Streak Shield'}</span>
                    </button>
                  </div>

                  {/* Right Answer Counter */}
                  <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shrink-0">
                    <span className="text-lg font-black font-mono leading-none">
                      {answeredCount}/{participantsList.length}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                      Answered
                    </span>
                  </div>
                </div>
              </div>

              {/* 2x2 Answer Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(currentQuestion.options && currentQuestion.options.length > 0
                  ? currentQuestion.options
                  : [
                      currentQuestion.correct_answer,
                      'Option B',
                      'Option C',
                      'None of the Above',
                    ]
                )
                  .slice(0, 4)
                  .map((opt, idx) => {
                    const tile = OPTION_TILES[idx % 4];
                    const selectedAnswerText =
                      localSelectedOption || myCurrentAnswer?.selectedAnswer;
                    const isPicked = selectedAnswerText === opt;
                    const isEliminated = hiddenOptionIndices.includes(idx);

                    if (isEliminated) {
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 min-h-[76px]"
                        >
                          Removed by 50/50
                        </div>
                      );
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={hasSubmittedCurrent}
                        onClick={() => handleSelectOption(opt)}
                        className={`group relative p-4 sm:p-5 rounded-2xl text-white font-bold text-left transition-all flex items-center justify-between gap-3 min-h-[76px] ${
                          tile.bg
                        } ${tile.shadow} border ${tile.border} ${
                          hasSubmittedCurrent
                            ? isPicked
                              ? 'ring-2 ring-white scale-[1.01] opacity-100'
                              : 'opacity-45'
                            : 'cursor-pointer active:translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center text-sm font-black shrink-0">
                            {tile.symbol}
                          </div>
                          <span className="text-sm sm:text-base font-bold leading-snug">
                            {opt}
                          </span>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isPicked ? (
                            <span className="px-2.5 py-1 rounded-lg bg-white text-slate-950 text-[11px] font-black">
                              Selected ✓
                            </span>
                          ) : (
                            <span className="hidden sm:inline-flex w-6 h-6 rounded-md bg-black/20 items-center justify-center text-[11px] font-mono opacity-75">
                              {tile.keyHint}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Status Bar + Host Skip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold">
                  {hasSubmittedCurrent ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300">
                        Answer saved! {WAITING_MESSAGES[waitingQuipIndex]}
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span>Pick an answer above before time runs out!</span>
                    </>
                  )}
                </div>

                {isHost && (
                  <button
                    type="button"
                    onClick={() => updateSessionStatus(roomCode, 'question_review')}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Show Results Now →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= 4. RESULTS REVEAL & SCOREBOARD ================= */}
      {session.status === 'question_review' && currentQuestion && (
        <div className="space-y-4">
          {/* Top Correct / Incorrect Feedback Banner */}
          {myCurrentAnswer ? (
            <div
              className={`p-4 sm:p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 ${
                myCurrentAnswer.isCorrect
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  {myCurrentAnswer.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <XCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black tracking-tight">
                    {myCurrentAnswer.isCorrect ? 'Correct! Nice work!' : 'Not quite right!'}
                  </div>
                  <div className="text-xs font-medium text-white/90 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>
                      Correct Answer: <strong className="underline">{currentQuestion.correct_answer}</strong>
                    </span>
                    {currentParticipant && currentParticipant.streak >= 2 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black">
                        <Flame className="w-3 h-3 fill-current" />
                        {currentParticipant.streak}x Streak!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-black/20 text-center shrink-0 border border-white/15">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Points Earned
                </div>
                <div className="text-xl font-black font-mono">
                  +{myCurrentAnswer.pointsEarned.toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-800 text-white flex items-center justify-between">
              <div className="font-bold text-base">⏰ Time&apos;s Up!</div>
              <div className="text-xs font-bold text-emerald-400">
                Correct Answer: {currentQuestion.correct_answer}
              </div>
            </div>
          )}

          {/* Switcher between Vote Chart & Scoreboard + Next Question Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setReviewSubView('chart');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  reviewSubView === 'chart'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Answer Breakdown</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setReviewSubView('scoreboard');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  reviewSubView === 'scoreboard'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Leaderboard</span>
              </button>
            </div>

            {isHost && (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all cursor-pointer"
              >
                <span>
                  {currentQIndex + 1 < questions.length
                    ? 'Next Question'
                    : 'Show Final Winners 🏆'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {reviewSubView === 'chart' ? (
            /* VERTICAL BAR CHART + EXPLANATION */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 7 Cols: 4-Option Bar Chart */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5">
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {currentQuestion.question}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    How players voted ({answeredCount} total)
                  </p>
                </div>

                {/* Vertical Bars Container */}
                <div className="grid grid-cols-4 gap-3 items-end h-40 pt-6 px-2 sm:px-4 border-b border-slate-200 dark:border-slate-800">
                  {(currentQuestion.options || []).slice(0, 4).map((opt, idx) => {
                    const tile = OPTION_TILES[idx % 4];
                    const isCorrectOpt =
                      opt.trim().toLowerCase() ===
                      currentQuestion.correct_answer.trim().toLowerCase();
                    const voteCount = participantsList.filter(
                      (p) => p.answers?.[currentQIndex]?.selectedAnswer === opt
                    ).length;
                    const heightPct =
                      answeredCount > 0
                        ? Math.max(16, Math.round((voteCount / answeredCount) * 100))
                        : isCorrectOpt
                        ? 65
                        : 18;

                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end gap-1.5">
                        <div className="flex items-center gap-1 text-xs font-black text-slate-800 dark:text-slate-200">
                          <span>{voteCount}</span>
                          {isCorrectOpt && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                        <div
                          className={`w-full rounded-t-xl ${tile.barBg} transition-all duration-700 flex items-end justify-center pb-2 text-white font-black text-sm shadow-xs ${
                            isCorrectOpt ? 'ring-2 ring-emerald-400' : 'opacity-60'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        >
                          {tile.symbol}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend Below Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(currentQuestion.options || []).slice(0, 4).map((opt, idx) => {
                    const tile = OPTION_TILES[idx % 4];
                    const isCorrectOpt =
                      opt.trim().toLowerCase() ===
                      currentQuestion.correct_answer.trim().toLowerCase();
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold ${
                          isCorrectOpt
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-md ${tile.barBg} text-white flex items-center justify-center font-black text-[11px] shrink-0`}
                          >
                            {tile.symbol}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                        {isCorrectOpt && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black shrink-0">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 5 Cols: Explanation + Top 3 Snapshot */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-4 h-4" />
                    <span>Why This Answer Is Right</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentQuestion.explanation ||
                      `The right answer is "${currentQuestion.correct_answer}".`}
                  </p>
                </div>

                {/* Mini Top Standings */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                      <Trophy className="w-4 h-4" />
                      <span>Top Players</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewSubView('scoreboard')}
                      className="text-[11px] font-bold text-indigo-300 hover:text-white underline cursor-pointer"
                    >
                      See All →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {participantsList.slice(0, 4).map((p, rankIdx) => {
                      const roundPts = p.answers?.[currentQIndex]?.pointsEarned || 0;
                      return (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">
                              {rankIdx + 1}
                            </span>
                            <span className="font-bold text-xs truncate">{p.name}</span>
                            {p.streak >= 2 && (
                              <span className="text-[10px] font-black text-amber-400">
                                🔥{p.streak}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {roundPts > 0 && (
                              <span className="text-[10px] font-bold text-emerald-400">
                                +{roundPts}
                              </span>
                            )}
                            <span className="font-mono font-black text-xs">
                              {p.score.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* FULL SCOREBOARD VIEW */
            <div className="rounded-2xl bg-slate-900 text-white p-6 border border-slate-800 shadow-lg space-y-5">
              <div className="text-center space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  Live Standings
                </div>
                <h3 className="text-xl sm:text-2xl font-black">Leaderboard</h3>
              </div>

              <div className="max-w-xl mx-auto space-y-2.5">
                {participantsList.map((p, idx) => {
                  const roundPts = p.answers?.[currentQIndex]?.pointsEarned || 0;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl flex items-center justify-between transition-all ${
                        idx === 0
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-white border border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>{p.name}</span>
                          {p.streak >= 2 && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black">
                              <Flame className="w-3 h-3 fill-current" />
                              {p.streak}x
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {roundPts > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-xs font-bold">
                            +{roundPts.toLocaleString()}
                          </span>
                        )}
                        <span className="text-base font-black font-mono">
                          {p.score.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 5. FINAL WINNERS PODIUM ================= */}
      {session.status === 'finished' && (
        <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/30 space-y-8">
          {/* Spotlight Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Final Podium</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {session.quiz?.quiz_title}
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm">
              Bonus XP and Gems have been added to your profile!
            </p>
          </div>

          {/* 3-2-1 Podium Pillars */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-2xl mx-auto items-end pt-4">
            {/* 2nd Place Silver */}
            <div className="flex flex-col items-center">
              {participantsList[1] ? (
                <>
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md mb-1.5 border border-white/40">
                    {participantsList[1].name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-white truncate max-w-full mb-0.5">
                    {participantsList[1].name}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-indigo-200 mb-2">
                    {participantsList[1].score.toLocaleString()} pts
                  </div>
                  <div className="w-full h-28 rounded-t-2xl bg-gradient-to-t from-slate-700 to-slate-500 border-t-2 border-slate-300 flex flex-col items-center justify-start pt-3">
                    <span className="w-8 h-8 rounded-full bg-white text-slate-900 font-black text-base flex items-center justify-center">
                      2
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 mt-1">
                      2nd Place
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-20 rounded-t-2xl bg-white/5" />
              )}
            </div>

            {/* 1st Place Gold Champion */}
            <div className="flex flex-col items-center">
              {participantsList[0] && (
                <>
                  <Crown className="w-8 h-8 text-amber-400 fill-amber-400 mb-1" />
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg mb-1.5 border-2 border-amber-200">
                    {participantsList[0].name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-black text-sm sm:text-base text-amber-300 truncate max-w-full mb-0.5">
                    {participantsList[0].name}
                  </div>
                  <div className="text-xs font-mono font-black text-white mb-2">
                    {participantsList[0].score.toLocaleString()} pts
                  </div>
                  <div className="w-full h-36 sm:h-40 rounded-t-2xl bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 border-t-2 border-yellow-200 flex flex-col items-center justify-start pt-4 text-slate-950">
                    <span className="w-10 h-10 rounded-full bg-slate-950 text-amber-400 font-black text-xl flex items-center justify-center">
                      1
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider mt-1.5">
                      Winner
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 3rd Place Bronze */}
            <div className="flex flex-col items-center">
              {participantsList[2] ? (
                <>
                  <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-lg shadow-md mb-1.5 border border-white/40">
                    {participantsList[2].name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-white truncate max-w-full mb-0.5">
                    {participantsList[2].name}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-indigo-200 mb-2">
                    {participantsList[2].score.toLocaleString()} pts
                  </div>
                  <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-700 border-t-2 border-amber-400 flex flex-col items-center justify-start pt-2.5">
                    <span className="w-7 h-7 rounded-full bg-white text-amber-950 font-black text-sm flex items-center justify-center">
                      3
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 mt-1">
                      3rd Place
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-16 rounded-t-2xl bg-white/5" />
              )}
            </div>
          </div>

          {/* Full Standings & Action Buttons */}
          <div className="max-w-xl mx-auto bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>All Players</span>
              </h3>
              <span className="text-xs font-medium text-emerald-300">
                {questions.length} Questions
              </span>
            </div>

            <div className="space-y-2">
              {participantsList.map((p, idx) => {
                const correctCount = Object.values(p.answers || {}).filter(
                  (a) => a.isCorrect
                ).length;
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-black/25 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-white/10 font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm">{p.name}</div>
                        <div className="text-[11px] text-slate-300">
                          {correctCount}/{questions.length} Correct
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-black text-sm text-amber-300">
                      {p.score.toLocaleString()} pts
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5">
              {isHost && (
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  soundFx.stopKahootMusic();
                  soundFx.playClick();
                  onLeave();
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
              >
                Back to Live Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
