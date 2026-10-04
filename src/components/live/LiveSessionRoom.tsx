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

const KAHOOT_SHAPES = [
  {
    index: 0,
    name: 'Triangle',
    symbol: '▲',
    keyHint: '1',
    bg: 'bg-[#e21b3c] hover:bg-[#c81533]',
    barBg: 'bg-[#e21b3c]',
    shadow: 'shadow-[0_6px_0_#9c1028]',
    border: 'border-[#ff4d6d]',
    hex: '#e21b3c',
  },
  {
    index: 1,
    name: 'Diamond',
    symbol: '◆',
    keyHint: '2',
    bg: 'bg-[#1368ce] hover:bg-[#1056ac]',
    barBg: 'bg-[#1368ce]',
    shadow: 'shadow-[0_6px_0_#0b3d7a]',
    border: 'border-[#4ea0ff]',
    hex: '#1368ce',
  },
  {
    index: 2,
    name: 'Circle',
    symbol: '●',
    keyHint: '3',
    bg: 'bg-[#d89e00] hover:bg-[#b88600]',
    barBg: 'bg-[#d89e00]',
    shadow: 'shadow-[0_6px_0_#8a6400]',
    border: 'border-[#ffd04d]',
    hex: '#d89e00',
  },
  {
    index: 3,
    name: 'Square',
    symbol: '■',
    keyHint: '4',
    bg: 'bg-[#26890c] hover:bg-[#1f7009]',
    barBg: 'bg-[#26890c]',
    shadow: 'shadow-[0_6px_0_#154d06]',
    border: 'border-[#5cd63a]',
    hex: '#26890c',
  },
];

const KAHOOT_WAITING_QUIPS = [
  'Genius machine at work...',
  'Were you fast enough for maximum speed points?',
  'Classroom legend in the making...',
  'Calculating your streak flame multiplier...',
  'Drumroll please...',
];

const AVATAR_BADGE_MAP: Record<string, string> = {
  rose: 'bg-[#e21b3c]',
  indigo: 'bg-[#1368ce]',
  amber: 'bg-[#d89e00]',
  emerald: 'bg-[#26890c]',
  violet: 'bg-[#46178f]',
  cyan: 'bg-[#0891b2]',
  teal: 'bg-[#0d9488]',
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
      setWaitingQuipIndex(Math.floor(Math.random() * KAHOOT_WAITING_QUIPS.length));

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
    <div className="max-w-6xl mx-auto space-y-5 pb-12 relative">
      {/* Floating Live Reaction Emotes Overlay */}
      <div className="fixed inset-x-0 bottom-16 pointer-events-none z-50 overflow-hidden h-64">
        {floatingEmotes.map((item) => (
          <div
            key={item.id}
            style={{ left: `${item.leftPercent}%` }}
            className="absolute bottom-0 text-4xl animate-float-emoji drop-shadow-lg"
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* ================= KAHOOT! TOP CONTROL & GAME PIN BAR ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-3xl bg-[#25076b] text-white border-2 border-purple-400/30 shadow-xl">
        <div className="flex items-center gap-3">
          {/* PIN Badge */}
          <button
            type="button"
            onClick={handleCopyRoomCode}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white text-[#25076b] font-mono font-black text-sm hover:bg-purple-100 transition-all cursor-pointer shadow-sm"
            title="Click to copy Game PIN"
          >
            <span className="text-[10px] uppercase tracking-wider text-purple-700 font-sans">
              PIN:
            </span>
            <span className="tracking-widest text-base">{roomCode}</span>
            {copiedCode ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-purple-600" />
            )}
          </button>

          <div className="hidden sm:block">
            <h2 className="text-sm font-black text-white truncate max-w-xs">
              {session.quiz?.quiz_title}
            </h2>
            <p className="text-[11px] text-purple-200 font-semibold">
              {session.status === 'lobby'
                ? 'Waiting for players in lobby...'
                : session.status === 'finished'
                ? 'Final Podium Standings'
                : `Question ${currentQIndex + 1} of ${questions.length}`}
            </p>
          </div>
        </div>

        {/* Center Reaction Emote Bar */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-2xl border border-white/15">
          {['🔥', '🎉', '⚡', '🧠', '👑', '🚀'].map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => handleTriggerEmote(em)}
              className="w-8 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center text-base transition-transform cursor-pointer"
              title={`Send ${em} reaction`}
            >
              {em}
            </button>
          ))}
        </div>

        {/* Right Music Toggle, Player Score & Leave */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
              isMusicOn
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : 'bg-white/10 text-purple-100 border-white/20 hover:bg-white/20'
            }`}
            title="Toggle synthesized Kahoot! groove music"
          >
            {isMusicOn ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{isMusicOn ? 'Groove ON' : 'Music'}</span>
          </button>

          {currentParticipant && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/15">
              {currentParticipant.streak >= 2 && (
                <span className="inline-flex items-center gap-0.5 text-xs font-black text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 animate-bounce" />
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e21b3c] hover:bg-[#c81533] text-white text-xs font-black transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* ================= 1. KAHOOT! LOBBY PHASE ================= */}
      {session.status === 'lobby' && (
        <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-[#46178f] via-[#34116c] to-[#21084a] text-white shadow-2xl border-2 border-purple-400/30 p-6 sm:p-10 space-y-8 animate-spring-pop">
          {/* Giant Kahoot! Join Header Card */}
          <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border-4 border-purple-300">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                Join at <span className="text-[#46178f]">QuizMe! Live Arena</span>
              </div>
              <div className="text-sm font-bold text-slate-600">
                Enter this Game PIN on any device or open tab:
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  GAME PIN:
                </div>
                <div className="text-4xl sm:text-6xl font-black tracking-widest text-slate-950 font-mono">
                  {roomCode}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyRoomCode}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-purple-100 text-[#46178f] transition-colors cursor-pointer"
                title="Copy Game PIN"
              >
                {copiedCode ? <Check className="w-6 h-6 text-emerald-600" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Middle Controls Bar: Player Count + Add Bots + Start Kahoot! */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-white/15 py-4">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/35 border border-white/15">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-lg font-black">{participantsList.length}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Players Ready
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isHost && (
                <button
                  type="button"
                  onClick={handleAddBots}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs border border-white/20 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-amber-300" />
                  <span>+ Add 3 AI Challengers</span>
                </button>
              )}

              {isHost ? (
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#26890c] hover:bg-[#1f7009] text-white font-black text-base shadow-[0_6px_0_#154d06] active:translate-y-1 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Kahoot! Battle</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 text-amber-300 font-black text-sm animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>You&apos;re in! See your nickname on stage...</span>
                </div>
              )}
            </div>
          </div>

          {/* Bouncy Lobby Player Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 min-h-[140px]">
            {participantsList.map((p, idx) => {
              const badgeColor = AVATAR_BADGE_MAP[p.avatarColor] || 'bg-[#1368ce]';
              const shapeSymbol = KAHOOT_SHAPES[idx % 4].symbol;
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center gap-3 shadow-lg animate-spring-pop"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${badgeColor} text-white font-black text-lg flex items-center justify-center shadow-md shrink-0`}
                  >
                    {shapeSymbol}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-sm text-white truncate flex items-center gap-1.5">
                      <span className="truncate">{p.name}</span>
                      {p.id === currentUserId && (
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-amber-400 text-slate-950 font-black uppercase shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-purple-200 font-bold">
                      {p.id.startsWith('bot_') ? '🤖 AI Challenger' : '⚡ Ready to Battle'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 2. 3-2-1-GO! KAHOOT! COUNTDOWN ================= */}
      {session.status === 'countdown' && (
        <div className="rounded-3xl bg-gradient-to-br from-[#46178f] via-[#25076b] to-[#120338] text-white p-16 text-center space-y-6 shadow-2xl border-2 border-purple-400/30 min-h-[440px] flex flex-col items-center justify-center">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Eyes on the Main Stage!
          </div>
          <div
            key={startingCount}
            className={`w-36 h-36 rounded-3xl ${
              KAHOOT_SHAPES[(3 - startingCount + 4) % 4].barBg
            } flex items-center justify-center text-7xl font-black text-white shadow-2xl border-4 border-white/40 animate-spring-pop`}
          >
            {startingCount > 0 ? startingCount : 'GO!'}
          </div>
          <p className="text-purple-200 text-base font-bold">
            Fastest accurate answers win up to 1,500 points per question!
          </p>
        </div>
      )}

      {/* ================= 3. KAHOOT! LIVE QUESTION STAGE ================= */}
      {session.status === 'in_progress' && currentQuestion && (
        <div className="space-y-5 animate-spring-pop">
          {/* "Get Ready!" Splash Overlay Banner */}
          {showGetReadySplash ? (
            <div className="rounded-3xl bg-gradient-to-br from-[#46178f] via-[#311068] to-[#1a063b] text-white p-12 sm:p-16 text-center space-y-5 shadow-2xl border-2 border-purple-400/40 min-h-[420px] flex flex-col items-center justify-center animate-spring-pop">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-amber-300 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>
                  Question {currentQIndex + 1} of {questions.length}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl leading-tight">
                {currentQuestion.question}
              </h2>

              {(isFinalDoubleRound || doublePointsActiveThisRound) && (
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm shadow-xl animate-bounce">
                  <Zap className="w-5 h-5 fill-current" />
                  <span>2X DOUBLE POINTS ACTIVE!</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                {KAHOOT_SHAPES.map((s) => (
                  <div
                    key={s.index}
                    className={`w-12 h-12 rounded-2xl ${s.barBg} flex items-center justify-center text-white text-2xl font-black shadow-lg animate-bounce`}
                  >
                    {s.symbol}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Top Question Display Stage Card */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 text-center space-y-4 relative overflow-hidden">
                {/* Top Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      timeLeft <= 5 ? 'bg-[#e21b3c]' : 'bg-[#46178f]'
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
                  <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-[#46178f] dark:text-purple-300 text-xs font-black uppercase tracking-wider">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>

                  {(isFinalDoubleRound || doublePointsActiveThisRound) && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs animate-pulse">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>2x Double Points Round</span>
                    </span>
                  )}

                  <span className="text-xs font-bold text-slate-400">
                    Press keys <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">1-4</kbd> to answer
                  </span>
                </div>

                {/* Big Stage Question Text */}
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug max-w-4xl mx-auto py-2">
                  {currentQuestion.question}
                </h2>

                {currentQuestion.code_snippet && (
                  <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto text-left max-w-3xl mx-auto border border-slate-800">
                    <code>{currentQuestion.code_snippet}</code>
                  </pre>
                )}

                {/* Middle Stage HUD: Left Timer Circle + Center Power-Ups + Right Answer Counter */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Left Kahoot! Circular Timer */}
                  <div
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-black text-white shadow-xl border-4 border-white/30 shrink-0 ${
                      timeLeft <= 5
                        ? 'bg-[#e21b3c] animate-bounce'
                        : 'bg-[#46178f] animate-kahoot-beat'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl font-mono leading-none">{timeLeft}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-80">sec</span>
                  </div>

                  {/* Center Kahoot!+ Tactical Power-Ups Dock */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      disabled={!doublePointsAvailable || hasSubmittedCurrent}
                      onClick={handleActivateDoublePoints}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        doublePointsActiveThisRound
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500 shadow-md'
                          : doublePointsAvailable
                          ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-50'
                          : 'opacity-40 bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Double your points if you answer this question right!"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{doublePointsActiveThisRound ? '2x Active!' : '2x Points'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={!fiftyFiftyAvailable || hasSubmittedCurrent}
                      onClick={handleActivateFiftyFifty}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        hiddenOptionIndices.length > 0
                          ? 'bg-indigo-600 text-white shadow-md'
                          : fiftyFiftyAvailable
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50'
                          : 'opacity-40 bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Eliminate 2 wrong geometric shapes!"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>50/50</span>
                    </button>

                    <button
                      type="button"
                      disabled={!streakShieldAvailable || hasSubmittedCurrent}
                      onClick={handleActivateStreakShield}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        streakShieldActiveThisRound
                          ? 'bg-emerald-600 text-white shadow-md'
                          : streakShieldAvailable
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50'
                          : 'opacity-40 bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Protect your answer streak even if you miss this question!"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{streakShieldActiveThisRound ? 'Shield ON' : 'Streak Shield'}</span>
                    </button>
                  </div>

                  {/* Right Kahoot! Answer Counter Circle */}
                  <div className="flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shrink-0 shadow-md">
                    <span className="text-2xl font-black font-mono leading-none">
                      {answeredCount}/{participantsList.length}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mt-1">
                      Answers
                    </span>
                  </div>
                </div>
              </div>

              {/* Iconic 2x2 Kahoot! Geometric Color Tiles Pad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(currentQuestion.options && currentQuestion.options.length > 0
                  ? currentQuestion.options
                  : [
                      currentQuestion.correct_answer,
                      'Alternative Principle B',
                      'Secondary Hypothesis C',
                      'None of the Above',
                    ]
                )
                  .slice(0, 4)
                  .map((opt, idx) => {
                    const shape = KAHOOT_SHAPES[idx % 4];
                    const selectedAnswerText =
                      localSelectedOption || myCurrentAnswer?.selectedAnswer;
                    const isPicked = selectedAnswerText === opt;
                    const isEliminated = hiddenOptionIndices.includes(idx);

                    if (isEliminated) {
                      return (
                        <div
                          key={idx}
                          className="p-6 rounded-3xl bg-slate-200/60 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-400 min-h-[104px]"
                        >
                          ✂️ Eliminated by 50/50 Power-Up
                        </div>
                      );
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={hasSubmittedCurrent}
                        onClick={() => handleSelectOption(opt)}
                        className={`group relative p-5 sm:p-7 rounded-3xl text-white font-black text-left transition-all flex items-center justify-between gap-4 min-h-[104px] ${
                          shape.bg
                        } ${shape.shadow} border-2 ${shape.border} ${
                          hasSubmittedCurrent
                            ? isPicked
                              ? 'ring-4 ring-white scale-[1.01] opacity-100'
                              : 'opacity-40 scale-[0.98]'
                            : 'cursor-pointer active:translate-y-1.5'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-13 h-13 rounded-2xl bg-black/20 flex items-center justify-center text-3xl font-black shrink-0 shadow-inner">
                            {shape.symbol}
                          </div>
                          <span className="text-base sm:text-xl font-black leading-snug drop-shadow-xs">
                            {opt}
                          </span>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isPicked ? (
                            <span className="px-3 py-1 rounded-xl bg-white text-slate-950 text-xs font-black uppercase shadow-md">
                              Locked In ✓
                            </span>
                          ) : (
                            <span className="hidden sm:inline-flex w-7 h-7 rounded-lg bg-black/20 items-center justify-center text-xs font-mono opacity-75">
                              {shape.keyHint}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Kahoot! "Answer Locked In" Suspense Bar + Host Fast-Forward */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#25076b] text-white border border-purple-400/30">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black">
                  {hasSubmittedCurrent ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                      <span className="text-amber-300">
                        Answer Locked In! {KAHOOT_WAITING_QUIPS[waitingQuipIndex]}
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Click a geometric shape above before the timer hits zero!</span>
                    </>
                  )}
                </div>

                {isHost && (
                  <button
                    type="button"
                    onClick={() => updateSessionStatus(roomCode, 'question_review')}
                    className="px-4 py-2 rounded-xl bg-white text-[#25076b] hover:bg-purple-100 text-xs font-black transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    Reveal Bar Chart Now →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= 4. KAHOOT! BAR-CHART REVEAL & SCOREBOARD CLIMBER ================= */}
      {session.status === 'question_review' && currentQuestion && (
        <div className="space-y-5 animate-spring-pop">
          {/* Top Full-Width Correct / Incorrect Feedback Banner */}
          {myCurrentAnswer ? (
            <div
              className={`p-5 sm:p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
                myCurrentAnswer.isCorrect
                  ? 'bg-gradient-to-r from-[#26890c] via-emerald-600 to-teal-600'
                  : 'bg-gradient-to-r from-[#e21b3c] via-rose-600 to-pink-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-md">
                  {myCurrentAnswer.isCorrect ? (
                    <CheckCircle2 className="w-9 h-9 text-white" />
                  ) : (
                    <XCircle className="w-9 h-9 text-white" />
                  )}
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight">
                    {myCurrentAnswer.isCorrect ? 'CORRECT! Genius Move!' : 'INCORRECT! Tough Break!'}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white/90 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>
                      Correct Answer: <strong className="underline">{currentQuestion.correct_answer}</strong>
                    </span>
                    {currentParticipant && currentParticipant.streak >= 2 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        Answer Streak {currentParticipant.streak}x!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-black/25 backdrop-blur-xs text-center shrink-0 border border-white/20">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">
                  Points Earned
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono">
                  +{myCurrentAnswer.pointsEarned.toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-slate-800 text-white flex items-center justify-between">
              <div className="font-black text-lg">⏰ Time&apos;s Up!</div>
              <div className="text-xs font-bold text-emerald-400">
                Correct Answer: {currentQuestion.correct_answer}
              </div>
            </div>
          )}

          {/* Switcher between Kahoot! Bar Chart & Scoreboard Climber + Next Question Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setReviewSubView('chart');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  reviewSubView === 'chart'
                    ? 'bg-white dark:bg-slate-900 text-[#46178f] dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Kahoot! Vote Bar Chart</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setReviewSubView('scoreboard');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  reviewSubView === 'scoreboard'
                    ? 'bg-white dark:bg-slate-900 text-[#46178f] dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Scoreboard Climber</span>
              </button>
            </div>

            {isHost && (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#1368ce] hover:bg-[#1056ac] text-white font-black text-sm shadow-[0_5px_0_#0b3d7a] active:translate-y-1 transition-all cursor-pointer"
              >
                <span>
                  {currentQIndex + 1 < questions.length
                    ? 'Next Question'
                    : 'Reveal Podium Finale 🏆'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {reviewSubView === 'chart' ? (
            /* KAHOOT! VERTICAL BAR CHART + EXPLANATION */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 7 Cols: Iconic 4-Shape Bar Chart */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
                <div className="text-center">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {currentQuestion.question}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    Room Answer Distribution ({answeredCount} Votes)
                  </p>
                </div>

                {/* Vertical Bars Container */}
                <div className="grid grid-cols-4 gap-4 items-end h-52 pt-8 px-2 sm:px-6 border-b-2 border-slate-200 dark:border-slate-800">
                  {(currentQuestion.options || []).slice(0, 4).map((opt, idx) => {
                    const shape = KAHOOT_SHAPES[idx % 4];
                    const isCorrectOpt =
                      opt.trim().toLowerCase() ===
                      currentQuestion.correct_answer.trim().toLowerCase();
                    const voteCount = participantsList.filter(
                      (p) => p.answers?.[currentQIndex]?.selectedAnswer === opt
                    ).length;
                    const heightPct =
                      answeredCount > 0
                        ? Math.max(14, Math.round((voteCount / answeredCount) * 100))
                        : isCorrectOpt
                        ? 65
                        : 18;

                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end gap-2">
                        <div className="flex items-center gap-1 text-xs font-black text-slate-800 dark:text-slate-200">
                          <span>{voteCount}</span>
                          {isCorrectOpt && (
                            <CheckCircle2 className="w-4 h-4 text-[#26890c]" />
                          )}
                        </div>
                        <div
                          className={`w-full rounded-t-2xl ${shape.barBg} transition-all duration-700 flex items-end justify-center pb-2 text-white font-black text-lg shadow-md ${
                            isCorrectOpt ? 'ring-4 ring-emerald-400/60' : 'opacity-60'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        >
                          {shape.symbol}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend Below Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(currentQuestion.options || []).slice(0, 4).map((opt, idx) => {
                    const shape = KAHOOT_SHAPES[idx % 4];
                    const isCorrectOpt =
                      opt.trim().toLowerCase() ===
                      currentQuestion.correct_answer.trim().toLowerCase();
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-2 text-xs font-bold ${
                          isCorrectOpt
                            ? 'border-[#26890c] bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg ${shape.barBg} text-white flex items-center justify-center font-black shrink-0`}
                          >
                            {shape.symbol}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                        {isCorrectOpt && (
                          <span className="px-2 py-0.5 rounded bg-[#26890c] text-white text-[10px] font-black shrink-0">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 5 Cols: Pedagogical Explanation + Top 3 Snapshot */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#46178f] dark:text-purple-400">
                    <BookOpen className="w-4 h-4" />
                    <span>Why This Shape Won</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentQuestion.explanation ||
                      `The verified solution is "${currentQuestion.correct_answer}".`}
                  </p>
                </div>

                {/* Mini Top Standings */}
                <div className="bg-[#25076b] text-white rounded-3xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
                      <Trophy className="w-4 h-4" />
                      <span>Current Top Contenders</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewSubView('scoreboard')}
                      className="text-[11px] font-bold text-purple-200 hover:text-white underline cursor-pointer"
                    >
                      Full Scoreboard →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {participantsList.slice(0, 4).map((p, rankIdx) => {
                      const roundPts = p.answers?.[currentQIndex]?.pointsEarned || 0;
                      return (
                        <div
                          key={p.id}
                          className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                              {rankIdx + 1}
                            </span>
                            <span className="font-black text-xs truncate">{p.name}</span>
                            {p.streak >= 2 && (
                              <span className="text-[10px] font-black text-orange-300">
                                🔥{p.streak}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {roundPts > 0 && (
                              <span className="text-[10px] font-black text-emerald-300">
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
            /* KAHOOT! FULL SCOREBOARD CLIMBER VIEW */
            <div className="rounded-3xl bg-gradient-to-b from-[#46178f] to-[#25076b] text-white p-6 sm:p-10 shadow-2xl space-y-6">
              <div className="text-center space-y-1">
                <div className="text-xs font-black uppercase tracking-widest text-amber-300">
                  Kahoot! Arena Standings
                </div>
                <h3 className="text-2xl sm:text-4xl font-black">Scoreboard</h3>
              </div>

              <div className="max-w-2xl mx-auto space-y-3">
                {participantsList.map((p, idx) => {
                  const roundPts = p.answers?.[currentQIndex]?.pointsEarned || 0;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
                        idx === 0
                          ? 'bg-white text-slate-950 shadow-xl scale-[1.02]'
                          : 'bg-white/15 text-white border border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-black/30 text-white'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-black text-sm sm:text-base flex items-center gap-2">
                            <span>{p.name}</span>
                            {p.streak >= 2 && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black">
                                <Flame className="w-3 h-3 fill-current" />
                                {p.streak} Streak
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {roundPts > 0 && (
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                              idx === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-emerald-400/20 text-emerald-300'
                            }`}
                          >
                            +{roundPts.toLocaleString()}
                          </span>
                        )}
                        <span className="text-lg sm:text-xl font-black font-mono">
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

      {/* ================= 5. KAHOOT! 3-2-1 SPOTLIGHT PODIUM FINALE ================= */}
      {session.status === 'finished' && (
        <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-[#46178f] via-[#2c0c5e] to-[#160433] text-white p-6 sm:p-10 shadow-2xl border-2 border-purple-400/40 space-y-10 animate-spring-pop">
          {/* Spotlight Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest shadow-lg">
              <Crown className="w-4 h-4 fill-current" />
              <span>Kahoot! Grand Podium Finale</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              {session.quiz?.quiz_title}
            </h1>
            <p className="text-purple-200 text-sm font-semibold">
              Bonus Scholar XP &amp; Gems have been added to your main profile!
            </p>
          </div>

          {/* 3-2-1 Rising Podium Pillars */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto items-end pt-6">
            {/* 2nd Place Silver */}
            <div className="flex flex-col items-center">
              {participantsList[1] ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-[#1368ce] flex items-center justify-center text-white font-black text-2xl shadow-xl mb-2 border-2 border-white">
                    ◆
                  </div>
                  <div className="font-black text-xs sm:text-sm text-white truncate max-w-full mb-1">
                    {participantsList[1].name}
                  </div>
                  <div className="text-xs font-mono font-bold text-purple-200 mb-3">
                    {participantsList[1].score.toLocaleString()} pts
                  </div>
                  <div className="w-full h-36 rounded-t-3xl bg-gradient-to-t from-slate-600 to-slate-400 border-t-4 border-slate-200 flex flex-col items-center justify-start pt-4 shadow-2xl">
                    <span className="w-10 h-10 rounded-full bg-white text-slate-900 font-black text-xl flex items-center justify-center shadow-md">
                      2
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90 mt-2">
                      Silver Medal
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-24 rounded-t-3xl bg-white/5" />
              )}
            </div>

            {/* 1st Place Gold Champion */}
            <div className="flex flex-col items-center">
              {participantsList[0] && (
                <>
                  <Crown className="w-10 h-10 text-amber-400 fill-amber-400 animate-bounce mb-1" />
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#d89e00] flex items-center justify-center text-white font-black text-3xl shadow-2xl mb-2 border-4 border-amber-300">
                    ●
                  </div>
                  <div className="font-black text-sm sm:text-lg text-amber-300 truncate max-w-full mb-1">
                    {participantsList[0].name}
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-black text-white mb-3">
                    {participantsList[0].score.toLocaleString()} pts
                  </div>
                  <div className="w-full h-48 sm:h-52 rounded-t-3xl bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 border-t-4 border-yellow-200 flex flex-col items-center justify-start pt-5 text-slate-950 shadow-2xl">
                    <span className="w-12 h-12 rounded-full bg-slate-950 text-amber-400 font-black text-2xl flex items-center justify-center shadow-lg">
                      1
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest mt-2">
                      Champion
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 3rd Place Bronze */}
            <div className="flex flex-col items-center">
              {participantsList[2] ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-[#e21b3c] flex items-center justify-center text-white font-black text-2xl shadow-xl mb-2 border-2 border-white">
                    ▲
                  </div>
                  <div className="font-black text-xs sm:text-sm text-white truncate max-w-full mb-1">
                    {participantsList[2].name}
                  </div>
                  <div className="text-xs font-mono font-bold text-purple-200 mb-3">
                    {participantsList[2].score.toLocaleString()} pts
                  </div>
                  <div className="w-full h-28 rounded-t-3xl bg-gradient-to-t from-amber-900 to-amber-700 border-t-4 border-amber-400 flex flex-col items-center justify-start pt-3 shadow-2xl">
                    <span className="w-9 h-9 rounded-full bg-white text-amber-950 font-black text-lg flex items-center justify-center shadow-md">
                      3
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 mt-1.5">
                      Bronze
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-20 rounded-t-3xl bg-white/5" />
              )}
            </div>
          </div>

          {/* Full Standings & Action Buttons */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Complete Arena Standings</span>
              </h3>
              <span className="text-xs font-bold text-emerald-300">
                {questions.length} Questions Completed
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
                    className="p-3.5 rounded-2xl bg-black/25 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-white/15 font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-black text-sm">{p.name}</div>
                        <div className="text-[11px] text-purple-200">
                          {correctCount}/{questions.length} Correct
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-black text-base text-amber-300">
                      {p.score.toLocaleString()} pts
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
              {isHost && (
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#26890c] hover:bg-[#1f7009] text-white font-black text-sm shadow-[0_5px_0_#154d06] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Another Kahoot! Round</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  soundFx.stopKahootMusic();
                  soundFx.playClick();
                  onLeave();
                }}
                className="px-6 py-3.5 rounded-2xl bg-white text-[#25076b] hover:bg-purple-100 font-black text-sm cursor-pointer shadow-md"
              >
                Back to Kahoot! Arena Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
