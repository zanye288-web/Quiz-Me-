import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Copy,
  Check,
  Play,
  RotateCcw,
  Trophy,
  Flame,
  Clock,
  ArrowRight,
  Zap,
  Award,
  Crown,
  Medal,
  LogOut,
  UserPlus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  LiveSessionData,
  LiveParticipant,
} from '../../types/liveSession';
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
}

export const LiveSessionRoom: React.FC<LiveSessionRoomProps> = ({
  roomCode,
  initialData,
  isHost,
  currentUserId,
  onLeave,
}) => {
  const [session, setSession] = useState<LiveSessionData>(() => ({
    ...initialData,
    quiz: normalizeQuizForLiveBattle(initialData.quiz),
  }));
  const [copied, setCopied] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState<number>(3);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState<boolean>(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [timeLeftOnQuestion, setTimeLeftOnQuestion] = useState<number>(
    initialData.settings?.timePerQuestion || 20
  );

  const sessionRef = useRef<LiveSessionData>(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Subscribe to real-time updates (BroadcastChannel + Server Store + Firestore)
  useEffect(() => {
    const unsubscribe = subscribeLiveSession(roomCode, (updated) => {
      if (updated) {
        setSession({
          ...updated,
          quiz: normalizeQuizForLiveBattle(updated.quiz),
        });
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  const timeLimit = session.settings?.timePerQuestion || 20;

  // Reset local answer selection ONLY when question index changes or returning to lobby/countdown
  useEffect(() => {
    if (session.status === 'lobby' || session.status === 'countdown') {
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
      setLastAnswerCorrect(null);
      setEarnedPoints(0);
      setTimeLeftOnQuestion(timeLimit);
      return;
    }

    if (session.status === 'in_progress') {
      const existingAns =
        session.participants?.[currentUserId]?.answers?.[session.currentQuestionIndex];
      if (existingAns) {
        setSelectedOption(existingAns.selectedAnswer);
        setHasSubmittedAnswer(true);
        setLastAnswerCorrect(existingAns.isCorrect);
        setEarnedPoints(existingAns.pointsEarned);
      } else {
        setSelectedOption(null);
        setHasSubmittedAnswer(false);
        setLastAnswerCorrect(null);
        setEarnedPoints(0);
        setTimeLeftOnQuestion(timeLimit);
      }
    }
  }, [session.currentQuestionIndex, session.status, currentUserId, timeLimit]);

  // Drive 3-2-1 Countdown across all connected clients
  useEffect(() => {
    if (session.status !== 'countdown') return;

    setCountdownNumber(3);
    let count = 3;

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNumber(count);
        soundFx.playClick();
      } else {
        clearInterval(interval);
        setCountdownNumber(0);
        if (isHost) {
          updateSessionStatus(roomCode, 'in_progress', {
            currentQuestionIndex: 0,
            questionStartTime: Date.now(),
          });
        }
      }
    }, 900);

    return () => clearInterval(interval);
  }, [session.status, isHost, roomCode]);

  // Synchronous Question Countdown Timer
  useEffect(() => {
    if (session.status !== 'in_progress') return;

    const startTime = session.questionStartTime || Date.now();

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeLeftOnQuestion(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        if (isHost && sessionRef.current.status === 'in_progress') {
          updateSessionStatus(roomCode, 'question_review');
        }
      }
    }, 200);

    return () => clearInterval(timer);
  }, [session.status, session.currentQuestionIndex, session.questionStartTime, timeLimit, isHost, roomCode]);

  // Simulate AI Challenger Classmates (`bot_` participants) answering during `in_progress`
  useEffect(() => {
    if (!isHost || session.status !== 'in_progress') return;

    const qIdx = session.currentQuestionIndex;
    const question = session.quiz.questions[qIdx];
    if (!question) return;

    const options = question.options || [];
    const correctAns = question.correct_answer || options[0] || '';
    const bots = Object.values(session.participants || {}).filter(
      (p) => p.id.startsWith('bot_') && !p.hasAnsweredCurrent
    );

    if (bots.length === 0) return;

    const timers = bots.map((bot, idx) => {
      // Staggered realistic thinking time between 1.8s and 5.8s
      const delayMs = 1800 + idx * 1200 + Math.floor(Math.random() * 1400);
      return setTimeout(() => {
        const latestSession = sessionRef.current;
        if (
          latestSession.status !== 'in_progress' ||
          latestSession.currentQuestionIndex !== qIdx
        ) {
          return;
        }
        const latestBot = latestSession.participants?.[bot.id];
        if (!latestBot || latestBot.hasAnsweredCurrent) return;

        // 75% accuracy for competitive challenge
        const isCorrect = Math.random() < 0.75;
        const wrongOptions = options.filter(
          (o) => o.trim().toLowerCase() !== correctAns.trim().toLowerCase()
        );
        const chosenAnswer =
          isCorrect || wrongOptions.length === 0
            ? correctAns
            : wrongOptions[Math.floor(Math.random() * wrongOptions.length)];

        const points = calculateAnswerPoints(
          isCorrect,
          delayMs,
          timeLimit,
          latestBot.streak || 0,
          latestSession.settings?.streakBonusesEnabled ?? true
        );
        const newScore = (latestBot.score || 0) + points;
        const newStreak = isCorrect ? (latestBot.streak || 0) + 1 : 0;

        submitLiveAnswer(
          roomCode,
          bot.id,
          qIdx,
          {
            selectedAnswer: chosenAnswer,
            isCorrect,
            responseTimeMs: delayMs,
            pointsEarned: points,
          },
          newScore,
          newStreak
        );
      }, delayMs);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isHost, session.status, session.currentQuestionIndex, roomCode, timeLimit]);

  // Auto-advance to question_review 1.2s after ALL participants have answered
  const participantsList: LiveParticipant[] = Object.values(session.participants || {});
  const answeredCount = participantsList.filter((p) => p.hasAnsweredCurrent).length;
  const totalParticipants = participantsList.length;

  useEffect(() => {
    if (
      !isHost ||
      session.status !== 'in_progress' ||
      totalParticipants === 0 ||
      answeredCount < totalParticipants
    ) {
      return;
    }

    const advanceTimer = setTimeout(() => {
      if (sessionRef.current.status === 'in_progress') {
        updateSessionStatus(roomCode, 'question_review');
      }
    }, 1200);

    return () => clearTimeout(advanceTimer);
  }, [isHost, session.status, answeredCount, totalParticipants, roomCode]);

  // Handle Confetti on Finish
  useEffect(() => {
    if (session.status === 'finished') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        soundFx.playVictory();
      } catch {
        // ignore
      }
    }
  }, [session.status]);

  // Current Question Object
  const currentQuestion = session.quiz.questions[session.currentQuestionIndex];
  const currentParticipant = session.participants?.[currentUserId];

  // Leaderboard ranking (sorted by score descending)
  const sortedParticipants = [...participantsList].sort((a, b) => b.score - a.score);

  // Copy Room Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    soundFx.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  // Host starts the live game
  const handleStartGame = () => {
    soundFx.playLevelUp();
    updateSessionStatus(roomCode, 'countdown');
  };

  // Skip countdown directly to Question 1
  const handleSkipCountdown = () => {
    soundFx.playClick();
    updateSessionStatus(roomCode, 'in_progress', {
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
    });
  };

  // Participant submits answer
  const handleSubmitAnswer = async (option: string) => {
    if (hasSubmittedAnswer || session.status !== 'in_progress' || !currentQuestion) return;

    setSelectedOption(option);
    setHasSubmittedAnswer(true);

    const isCorrect =
      option.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
    setLastAnswerCorrect(isCorrect);

    const responseTimeMs = Math.max(200, Date.now() - (session.questionStartTime || Date.now()));
    const currentStreak = currentParticipant?.streak || 0;

    const points = calculateAnswerPoints(
      isCorrect,
      responseTimeMs,
      timeLimit,
      currentStreak,
      session.settings?.streakBonusesEnabled ?? true
    );

    setEarnedPoints(points);

    if (isCorrect) {
      soundFx.playCorrect();
    } else {
      soundFx.playIncorrect();
    }

    const newScore = (currentParticipant?.score || 0) + points;
    const newStreak = isCorrect ? currentStreak + 1 : 0;

    await submitLiveAnswer(
      roomCode,
      currentUserId,
      session.currentQuestionIndex,
      {
        selectedAnswer: option,
        isCorrect,
        responseTimeMs,
        pointsEarned: points,
      },
      newScore,
      newStreak
    );
  };

  // Host advances to question review or next question
  const handleHostNext = async () => {
    soundFx.playClick();
    if (session.status === 'in_progress') {
      await updateSessionStatus(roomCode, 'question_review');
    } else if (session.status === 'question_review') {
      const nextIdx = session.currentQuestionIndex + 1;
      if (nextIdx >= session.quiz.questions.length) {
        await updateSessionStatus(roomCode, 'finished');
      } else {
        await advanceToNextQuestion(roomCode, nextIdx, session.participants);
      }
    }
  };

  // Host restarts a completed battle from Question 1
  const handleRematch = async () => {
    soundFx.playLevelUp();
    const resetParticipants: Record<string, LiveParticipant> = {};
    Object.entries(session.participants || {}).forEach(([pid, p]) => {
      resetParticipants[pid] = {
        ...p,
        score: 0,
        streak: 0,
        answers: {},
        hasAnsweredCurrent: false,
      };
    });
    await updateSessionStatus(roomCode, 'in_progress', {
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      participants: resetParticipants,
    });
  };

  // Host adds simulated bots for demo testing
  const handleAddBots = async () => {
    soundFx.playClick();
    await addSimulatedParticipants(roomCode, participantsList.length);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between p-4 mb-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PIN
            </span>
            <span className="font-mono font-black text-base text-indigo-600 dark:text-indigo-400 tracking-wider">
              {roomCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            title="Copy Room PIN"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Center Title */}
        <div className="hidden sm:block text-center">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
            {session.quiz.quiz_title}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Hosted by {session.hostName}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{participantsList.length}</span>
          </div>

          <button
            type="button"
            onClick={onLeave}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
            title="Leave Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STAGE 1: LOBBY */}
      {session.status === 'lobby' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center py-8 px-6 rounded-3xl bg-gradient-to-b from-indigo-50/70 via-white to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/50 shadow-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5 fill-indigo-500" />
              Live Battle Lobby
            </span>

            <h2 className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-slate-900 dark:text-white mb-2">
              {roomCode}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Share this 6-digit PIN with classmates in another tab or device, or start battling right away!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Code Copied!' : 'Copy Room Code'}</span>
              </button>

              {isHost && (
                <button
                  type="button"
                  onClick={handleAddBots}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                  title="Add 3 more AI challenger classmates"
                >
                  <UserPlus className="w-4 h-4 text-indigo-500" />
                  <span>+ Add More AI Classmates</span>
                </button>
              )}
            </div>
          </div>

          {/* Joined Participants Grid */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Connected Scholars ({participantsList.length})
              </h4>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {participantsList.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs animate-in fade-in duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {p.name}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                      {p.id.startsWith('bot_') ? 'AI Challenger' : p.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Host Start Trigger / Student Waiting Status */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
              {isHost ? (
                <button
                  type="button"
                  id="host-start-live-battle-btn"
                  onClick={handleStartGame}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all active:scale-98 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start Live Battle ({session.quiz.questions.length} Questions)</span>
                </button>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>Waiting for {session.hostName} to launch the assessment...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: COUNTDOWN */}
      {session.status === 'countdown' && (
        <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-75 duration-300">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-6 animate-pulse">
            <span className="font-mono font-black text-7xl text-white">
              {countdownNumber > 0 ? countdownNumber : 'GO!'}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Get Ready, Scholars!
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            First question starting now...
          </p>
          {isHost && (
            <button
              type="button"
              onClick={handleSkipCountdown}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Start Question 1 Immediately →
            </button>
          )}
        </div>
      )}

      {/* STAGE 3: SYNCHRONOUS QUESTION */}
      {session.status === 'in_progress' && currentQuestion && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Question Header & Timer */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs">
                  Question {session.currentQuestionIndex + 1} of {session.quiz.questions.length}
                </span>
                {currentQuestion.domain && (
                  <span className="text-xs font-semibold text-slate-400">
                    • {currentQuestion.domain}
                  </span>
                )}
              </div>

              {/* Countdown Timer Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-mono font-black text-sm ${
                  timeLeftOnQuestion <= 5
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 animate-bounce'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timeLeftOnQuestion}s</span>
              </div>
            </div>

            {/* Time progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-6">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 ease-linear rounded-full"
                style={{
                  width: `${(timeLeftOnQuestion / timeLimit) * 100}%`,
                }}
              />
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {currentQuestion.question}
            </h2>

            {/* Code Snippet if present */}
            {currentQuestion.code_snippet && (
              <pre className="mt-4 p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto border border-slate-800">
                <code>{currentQuestion.code_snippet}</code>
              </pre>
            )}
          </div>

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(currentQuestion.options || [
              'Superposition',
              'Decoherence',
              'Entanglement',
              'Binary State',
            ]).map((option, idx) => {
              const isSelected = selectedOption === option;
              const optionLetters = ['A', 'B', 'C', 'D'];
              const optionColorStyles = [
                'hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30',
                'hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30',
                'hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
                'hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30',
              ][idx % 4];

              return (
                <button
                  key={`${session.currentQuestionIndex}_${idx}_${option}`}
                  type="button"
                  disabled={hasSubmittedAnswer}
                  onClick={() => handleSubmitAnswer(option)}
                  className={`p-5 rounded-3xl text-left border-2 transition-all cursor-pointer flex items-center gap-4 ${
                    isSelected
                      ? lastAnswerCorrect === false
                        ? 'border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-600/25 scale-[1.01]'
                        : 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-[1.01]'
                      : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${optionColorStyles}`
                  } ${hasSubmittedAnswer && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {optionLetters[idx] || idx + 1}
                  </span>
                  <span className="font-bold text-sm sm:text-base leading-snug">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Score Badge upon answering */}
          {hasSubmittedAnswer && (
            <div
              className={`p-5 rounded-3xl border flex items-center justify-between animate-in slide-in-from-bottom-3 duration-200 shadow-sm ${
                lastAnswerCorrect
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80'
                  : 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-2xl text-white ${
                    lastAnswerCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {lastAnswerCorrect ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {lastAnswerCorrect
                      ? 'Correct Answer Locked In!'
                      : `Locked In — Correct answer: ${currentQuestion.correct_answer}`}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {answeredCount < totalParticipants
                      ? `Waiting for remaining scholars (${answeredCount}/${totalParticipants} answered)...`
                      : 'All scholars answered! Revealing standings...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono font-black text-sm flex items-center gap-1">
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                  +{earnedPoints} PTS
                </span>
              </div>
            </div>
          )}

          {/* Live Response Status Bar & Host Controls */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {answeredCount} of {totalParticipants} scholars responded
              </span>
            </div>
            {isHost && (
              <button
                type="button"
                onClick={handleHostNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                <span>Show Standings & Explanation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STAGE 4: QUESTION REVIEW & LIVE LEADERBOARD */}
      {session.status === 'question_review' && currentQuestion && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Correct Answer Explanation Box */}
          <div className="p-6 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-2">
              <Check className="w-3.5 h-3.5" />
              Correct Answer: {currentQuestion.correct_answer}
            </span>
            <p className="text-sm text-emerald-950 dark:text-emerald-100 mt-2 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>

          {/* Real-time Leaderboard Ranking */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Live Battle Standings
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                After Question {session.currentQuestionIndex + 1} of {session.quiz.questions.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {sortedParticipants.map((p, index) => {
                const isCurrentUser = p.id === currentUserId;
                const isFirst = index === 0;
                const qAns = p.answers?.[session.currentQuestionIndex];

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isCurrentUser
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                          isFirst
                            ? 'bg-amber-400 text-amber-950'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {p.name}
                          </span>
                          {p.streak > 1 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                              <Flame className="w-3 h-3 fill-amber-500" />
                              {p.streak}
                            </span>
                          )}
                          {qAns && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                qAns.isCorrect
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {qAns.isCorrect ? `+${qAns.pointsEarned}` : '+0'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {p.score.toLocaleString()} PTS
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Host Next Button */}
            {isHost && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  id="live-host-next-btn"
                  onClick={handleHostNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <span>
                    {session.currentQuestionIndex + 1 >= session.quiz.questions.length
                      ? 'View Final Podium'
                      : 'Next Question'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 5: FINISHED & PODIUM CELEBRATION */}
      {session.status === 'finished' && (
        <div className="space-y-8 py-6 animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-black mb-3">
              <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Assessment Complete</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Victory Podium
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Outstanding competitive performance by all scholars!
            </p>
          </div>

          {/* 3-Tier Podium Pedestals */}
          <div className="flex items-end justify-center gap-3 sm:gap-6 pt-6 pb-2 max-w-lg mx-auto">
            {/* 2nd Place */}
            {sortedParticipants[1] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-black text-sm text-slate-800 dark:text-white shadow-md mb-2">
                  <Medal className="w-6 h-6 text-slate-400" />
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[90px] text-center">
                  {sortedParticipants[1].name}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {sortedParticipants[1].score} pts
                </span>
                <div className="w-full h-24 mt-2 rounded-t-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500">
                  2nd
                </div>
              </div>
            )}

            {/* 1st Place */}
            {sortedParticipants[0] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center font-black text-base text-white shadow-xl shadow-amber-500/30 mb-2 ring-4 ring-amber-300/40 animate-bounce">
                  <Crown className="w-8 h-8 fill-white" />
                </div>
                <span className="font-black text-sm text-slate-900 dark:text-white truncate max-w-[110px] text-center">
                  {sortedParticipants[0].name}
                </span>
                <span className="font-mono text-xs font-bold text-amber-500">
                  {sortedParticipants[0].score} pts
                </span>
                <div className="w-full h-32 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-400 to-amber-500 flex items-center justify-center font-black text-amber-950 text-xl shadow-lg">
                  1st
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {sortedParticipants[2] && (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-700/80 flex items-center justify-center font-black text-sm text-amber-100 shadow-md mb-2">
                  <Award className="w-6 h-6 text-amber-200" />
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[90px] text-center">
                  {sortedParticipants[2].name}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {sortedParticipants[2].score} pts
                </span>
                <div className="w-full h-18 mt-2 rounded-t-2xl bg-amber-900/40 dark:bg-amber-950 flex items-center justify-center font-black text-amber-600">
                  3rd
                </div>
              </div>
            )}
          </div>

          {/* Full Scores Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Final Assessment Results
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedParticipants.map((p, idx) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-slate-400 w-5">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {p.name}
                    </span>
                  </div>
                  <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                    {p.score.toLocaleString()} PTS
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {isHost && (
              <button
                type="button"
                onClick={handleRematch}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-98 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Rematch</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLeave}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-600/25 transition-all active:scale-98 cursor-pointer"
            >
              Back to Live Battle Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
