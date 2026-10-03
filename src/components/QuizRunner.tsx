import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Code2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Flag,
  Bookmark,
  BookOpen,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Edit3,
  Check,
  AlertTriangle,
  HelpCircle,
  Award,
  Layers,
  ChevronRight,
  X,
  Zap,
  Flame,
  Timer,
  Headphones,
  Printer,
  Maximize2,
  Minimize2,
  Type,
  Target,
} from 'lucide-react';
import {
  Question,
  QuizResponse,
  PersonaType,
  UserStats,
  AssessmentConfig,
} from '../types/quiz';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { usePomodoro } from '../context/PomodoroContext';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { ExamWorksheetModal } from './ExamWorksheetModal';
import { MediaAttributionBadge } from './MediaAttributionBadge';
import { resolveThematicVisual } from '../utils/thematicImages';
import { MascotAvatar } from './MascotAvatar';
import { classifyAudience, AUDIENCE_TIER_CONFIG } from '../utils/audienceClassifier';

interface QuizRunnerProps {
  quiz: QuizResponse;
  persona: PersonaType;
  stats: UserStats;
  assessmentConfig: AssessmentConfig;
  isFocusMode?: boolean;
  onToggleFocusMode?: (val: boolean) => void;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onFinishQuiz: (results: {
    quiz: QuizResponse;
    answers: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
    score: number;
    total: number;
    xpEarned: number;
    gemsEarned: number;
    timeSpentSeconds: number;
    flaggedIds: number[];
  }) => void;
  onQuitQuiz: () => void;
  onOpenTutor: (q: Question) => void;
  onOpenWorksheet?: (quiz: QuizResponse) => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  quiz,
  persona,
  stats,
  assessmentConfig,
  isFocusMode = false,
  onToggleFocusMode,
  onUpdateStats,
  onFinishQuiz,
  onQuitQuiz,
  onOpenTutor,
  onOpenWorksheet,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<
    Record<number, { isCorrect?: boolean; userAnswer: string; checked: boolean }>
  >({});
  const [flaggedIds, setFlaggedIds] = useState<Set<number>>(new Set());

  // Input states for current question
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState<string>('');
  const [openTextAnswer, setOpenTextAnswer] = useState<string>('');
  const [isEvaluatingOpen, setIsEvaluatingOpen] = useState<boolean>(false);
  const [openEvaluation, setOpenEvaluation] = useState<{
    isCorrect: boolean;
    score: number;
    feedback: string;
  } | null>(null);

  // Scratchpad drawer
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchpadText, setScratchpadText] = useState<string>('');

  // Shortcuts & Worksheet Modals
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState<boolean>(false);

  // QoL: Font Size Scaling & Zen Mode
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Voice & Narration Settings Modal
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [isSpeakingCurrent, setIsSpeakingCurrent] = useState<boolean>(false);

  // Ambient Focus Tone
  const [isFocusHumActive, setIsFocusHumActive] = useState<boolean>(false);

  // Copied code status
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Hints
  const [showHint, setShowHint] = useState<boolean>(false);

  // Challenge Mode Configuration & States
  const isChallengeMode = assessmentConfig.challengeMode ?? false;
  const questionTimeLimit = assessmentConfig.challengeTimerSeconds ?? 15;
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(questionTimeLimit);
  const [lastSpeedMultiplier, setLastSpeedMultiplier] = useState<number | null>(null);
  const [speedMultipliers, setSpeedMultipliers] = useState<Record<number, number>>({});

  // Global Timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const totalTimeLimitSecs = assessmentConfig.timeLimitMinutes * 60;
  const isTimedExam = assessmentConfig.timeLimitMinutes > 0;

  // Pomodoro Context
  const {
    isOpen: isPomodoroOpen,
    toggleOpen: togglePomodoro,
    isRunning: isPomodoroRunning,
    timeLeft: pomodoroTimeLeft,
    formatTime: formatPomodoroTime,
  } = usePomodoro();

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm my-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Questions Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">This assessment does not contain any questions. Please try generating a new quiz.</p>
        <button
          type="button"
          onClick={onQuitQuiz}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors cursor-pointer"
        >
          Return to Studio
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex] || quiz.questions[0];
  const isAnswerChecked = userAnswers[currentQuestion.id]?.checked || false;
  const isCurrentCorrect = userAnswers[currentQuestion.id]?.isCorrect || false;

  // Subscribe to speech synthesis state
  useEffect(() => {
    const unsub = speechEngine.subscribeState((speaking, currentId) => {
      setIsSpeakingCurrent(speaking && currentId === `q_${currentQuestion.id}`);
    });
    return () => unsub();
  }, [currentQuestion.id]);

  // Stop speaking when switching questions
  useEffect(() => {
    speechEngine.stop();
  }, [currentIndex]);

  // Toggle ambient focus audio
  const handleToggleFocusHum = () => {
    const nextState = soundFx.toggleFocusHum();
    setIsFocusHumActive(nextState);
  };

  // Copy code snippet
  const handleCopyCode = (code: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Cleanup audio & TTS on unmount
  useEffect(() => {
    return () => {
      soundFx.stopFocusHum();
      speechEngine.stop();
    };
  }, []);

  // Global Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        if (isTimedExam && prev + 1 >= totalTimeLimitSecs) {
          // Time expired -> auto submit
          clearInterval(timer);
          handleSubmitAssessment();
          return totalTimeLimitSecs;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimedExam, totalTimeLimitSecs]);

  // Challenge Mode: Per-question countdown timer
  useEffect(() => {
    if (!isChallengeMode || isAnswerChecked) {
      return;
    }

    setQuestionTimeRemaining(questionTimeLimit);

    const interval = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time ran out for this question
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        if (prev <= 5) {
          // Subtle audio tick for final 4 seconds
          soundFx.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, isChallengeMode, isAnswerChecked, questionTimeLimit]);

  // Handle Question Time Expiration in Challenge Mode
  const handleTimeExpired = () => {
    if (isAnswerChecked) return;
    soundFx.playIncorrect();

    const fallbackAnswer = selectedOption || fillBlankAnswer || openTextAnswer || '(Time Expired)';
    
    // Check if what they currently had selected happens to be right
    let isCorrect = false;
    if (currentQuestion.type === 'multiple_choice') {
      isCorrect = fallbackAnswer.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
    } else if (currentQuestion.type === 'fill_in_blank') {
      isCorrect = fallbackAnswer.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        userAnswer: fallbackAnswer,
        isCorrect,
        checked: true,
      },
    }));

    setSpeedMultipliers((prev) => ({
      ...prev,
      [currentQuestion.id]: 1.0,
    }));
    setLastSpeedMultiplier(1.0);
  };

  // Sync inputs when navigating between questions
  useEffect(() => {
    const existing = userAnswers[currentQuestion.id];
    if (existing) {
      if (currentQuestion.type === 'multiple_choice') {
        setSelectedOption(existing.userAnswer);
      } else if (currentQuestion.type === 'fill_in_blank') {
        setFillBlankAnswer(existing.userAnswer);
      } else if (currentQuestion.type === 'open_explanation') {
        setOpenTextAnswer(existing.userAnswer);
      } else if (currentQuestion.type === 'code_media_challenge') {
        if (currentQuestion.options && currentQuestion.options.length > 0) {
          setSelectedOption(existing.userAnswer);
        } else {
          setFillBlankAnswer(existing.userAnswer);
        }
      }
    } else {
      setSelectedOption(null);
      setFillBlankAnswer('');
      setOpenTextAnswer('');
    }
    setShowHint(false);
    setLastSpeedMultiplier(speedMultipliers[currentQuestion.id] || null);
  }, [currentIndex, currentQuestion]);

  // Enhanced Keyboard hotkeys & navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

      if (e.key === '?' && !isTyping) {
        e.preventDefault();
        soundFx.playClick();
        setShowShortcutsModal(true);
        return;
      }

      // Focus Mode Hotkeys: 'F' toggles, 'Escape' exits
      if (!isTyping && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        soundFx.playClick();
        onToggleFocusMode?.(!isFocusMode);
        return;
      }

      if (e.key === 'Escape' && isFocusMode) {
        e.preventDefault();
        soundFx.playClick();
        onToggleFocusMode?.(false);
        return;
      }

      if (showScratchpad && isTyping) return;

      // Handle option selection hotkeys (1-4 or A-D)
      if (
        !isTyping &&
        (currentQuestion.type === 'multiple_choice' ||
          (currentQuestion.type === 'code_media_challenge' && currentQuestion.options))
      ) {
        const num = parseInt(e.key);
        const optionsCount = currentQuestion.options?.length || 0;
        if (!isNaN(num) && num >= 1 && num <= optionsCount && !isAnswerChecked) {
          e.preventDefault();
          setSelectedOption(currentQuestion.options![num - 1]);
          soundFx.playClick();
          return;
        }

        const lowerKey = e.key.toLowerCase();
        const letterIndex = ['a', 'b', 'c', 'd'].indexOf(lowerKey);
        if (letterIndex >= 0 && letterIndex < optionsCount && !isAnswerChecked) {
          e.preventDefault();
          setSelectedOption(currentQuestion.options![letterIndex]);
          soundFx.playClick();
          return;
        }
      }

      // Enter key submits or moves next
      if (e.key === 'Enter') {
        if (!isAnswerChecked && canCheckAnswer()) {
          e.preventDefault();
          handleCheckOrSaveAnswer();
        } else if (isAnswerChecked) {
          e.preventDefault();
          if (currentIndex < quiz.questions.length - 1) {
            handleJumpToQuestion(currentIndex + 1);
          } else {
            handleSubmitAssessment();
          }
        }
        return;
      }

      if (isTyping) return;

      // Question navigation arrows
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        handleJumpToQuestion(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < quiz.questions.length - 1) {
        e.preventDefault();
        handleJumpToQuestion(currentIndex + 1);
      }

      // Hotkey B: Bookmark / Flag
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        toggleFlag(currentQuestion.id);
      }

      // Hotkey H: Hint
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowHint((prev) => !prev);
      }

      // Hotkey T: Tutor
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        soundFx.playClick();
        onOpenTutor(currentQuestion);
      }

      // Hotkey S: Scratchpad
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowScratchpad((prev) => !prev);
      }

      // Hotkey V: Voice
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handleSpeakQuestion();
      }

      // Hotkey Z: Zen Mode
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentIndex,
    isAnswerChecked,
    selectedOption,
    fillBlankAnswer,
    openTextAnswer,
    showScratchpad,
    currentQuestion,
    quiz.questions.length,
  ]);

  const toggleFlag = (qId: number) => {
    soundFx.playClick();
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const canCheckAnswer = (): boolean => {
    if (currentQuestion.type === 'multiple_choice') {
      return selectedOption !== null;
    }
    if (currentQuestion.type === 'fill_in_blank') {
      return fillBlankAnswer.trim().length > 0;
    }
    if (currentQuestion.type === 'open_explanation') {
      return openTextAnswer.trim().length > 0;
    }
    if (currentQuestion.type === 'code_media_challenge') {
      return (
        selectedOption !== null ||
        fillBlankAnswer.trim().length > 0 ||
        openTextAnswer.trim().length > 0
      );
    }
    return false;
  };

  // Calculate speed multiplier based on remaining time in Challenge Mode
  const calculateSpeedMultiplier = (): number => {
    if (!isChallengeMode) return 1.0;
    const timeFraction = questionTimeRemaining / questionTimeLimit;
    if (timeFraction >= 0.7) {
      return 2.5; // Top speed (< 30% of allowed time used)
    } else if (timeFraction >= 0.4) {
      return 2.0; // Fast (< 60% of allowed time used)
    } else if (timeFraction >= 0.2) {
      return 1.5; // Moderate
    }
    return 1.1; // Baseline speed bonus for beating the timer
  };

  const handleCheckOrSaveAnswer = async () => {
    if (!canCheckAnswer()) return;

    let submitted = '';
    let isCorrect = false;

    if (currentQuestion.type === 'multiple_choice') {
      submitted = selectedOption || '';
      isCorrect = submitted.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
    } else if (currentQuestion.type === 'fill_in_blank') {
      submitted = fillBlankAnswer.trim();
      isCorrect = submitted.toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
    } else if (currentQuestion.type === 'open_explanation') {
      submitted = openTextAnswer.trim();
      setIsEvaluatingOpen(true);
      try {
        const res = await fetch('/api/evaluate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: currentQuestion.question,
            correctAnswer: currentQuestion.correct_answer,
            userAnswer: submitted,
            explanation: currentQuestion.explanation,
            persona,
            rubric: currentQuestion.rubric,
          }),
        });
        const evalData = await res.json();
        isCorrect = evalData.isCorrect ?? (evalData.score >= 60);
        setOpenEvaluation(evalData);
      } catch {
        isCorrect = submitted.length > 10;
        setOpenEvaluation({
          isCorrect,
          score: isCorrect ? 85 : 40,
          feedback: isCorrect ? 'Valid conceptual analysis.' : 'Check the model explanation.',
        });
      } finally {
        setIsEvaluatingOpen(false);
      }
    } else if (currentQuestion.type === 'code_media_challenge') {
      if (currentQuestion.options && currentQuestion.options.length > 0) {
        submitted = selectedOption || '';
        isCorrect = submitted.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
      } else {
        submitted = fillBlankAnswer || openTextAnswer;
        isCorrect = submitted.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
      }
    }

    let multiplier = 1.0;
    if (isCorrect) {
      if (isChallengeMode) {
        multiplier = calculateSpeedMultiplier();
        setSpeedMultipliers((prev) => ({
          ...prev,
          [currentQuestion.id]: multiplier,
        }));
        setLastSpeedMultiplier(multiplier);

        if (multiplier >= 2.0) {
          soundFx.playSpeedBonus();
        } else {
          soundFx.playCorrect();
        }
      } else {
        soundFx.playCorrect();
      }
    } else {
      soundFx.playIncorrect();
      setSpeedMultipliers((prev) => ({
        ...prev,
        [currentQuestion.id]: 1.0,
      }));
      setLastSpeedMultiplier(1.0);
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        userAnswer: submitted,
        isCorrect,
        checked: true,
      },
    }));
  };

  const handleJumpToQuestion = (index: number) => {
    soundFx.playClick();
    setCurrentIndex(index);
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  const handlePrev = () => {
    soundFx.playClick();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    soundFx.playComplete();

    const answersArray = quiz.questions.map((q) => {
      const rec = userAnswers[q.id];
      return {
        questionId: q.id,
        isCorrect: rec ? (rec.isCorrect || false) : false,
        userAnswer: rec ? rec.userAnswer : '',
      };
    });

    const totalCorrect = answersArray.filter((a) => a.isCorrect).length;
    const total = quiz.questions.length;
    
    // Dynamic XP calculation: Apply speed multipliers if in Challenge Mode
    let xpEarned = 0;
    if (isChallengeMode) {
      answersArray.forEach((a) => {
        if (a.isCorrect) {
          const mult = speedMultipliers[a.questionId] || 1.0;
          xpEarned += Math.round(30 * mult);
        }
      });
      xpEarned += 35; // Challenge mode completion bonus
    } else {
      xpEarned = totalCorrect * 30 + 20;
    }

    const gemsEarned = isChallengeMode ? totalCorrect * 8 : totalCorrect * 5;

    onFinishQuiz({
      quiz,
      answers: answersArray,
      score: totalCorrect,
      total,
      xpEarned,
      gemsEarned,
      timeSpentSeconds: secondsElapsed,
      flaggedIds: Array.from(flaggedIds),
    });
  };

  const handleSpeakQuestion = () => {
    soundFx.playClick();

    if (isSpeakingCurrent) {
      speechEngine.stop();
      return;
    }

    const settings = speechEngine.getSettings();
    let textToSpeak = `Question ${currentIndex + 1}. ${currentQuestion.question}`;

    if (settings.readCodeSnippet && currentQuestion.code_snippet) {
      textToSpeak += `. Code snippet in ${currentQuestion.language || 'code'} provided.`;
    }

    if (settings.readOptions && currentQuestion.type === 'multiple_choice' && currentQuestion.options) {
      const optionsText = currentQuestion.options
        .map((opt, idx) => `Option ${String.fromCharCode(65 + idx)}: ${opt}`)
        .join('. ');
      textToSpeak += `. ${optionsText}`;
    } else if (currentQuestion.type === 'fill_in_blank') {
      textToSpeak += '. Fill in the blank.';
    } else if (currentQuestion.type === 'open_explanation') {
      textToSpeak += '. Write your conceptual explanation.';
    }

    speechEngine.speak(textToSpeak, {
      id: `q_${currentQuestion.id}`,
      lang: quiz.language,
    });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[Number(k)]?.checked).length;
  const progressPercent = (answeredCount / quiz.questions.length) * 100;

  // Domain coloring helper
  const getDomainColor = (domain?: string) => {
    switch (domain) {
      case 'Foundations':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Applied Logic':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Syntax & Execution':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Analytical Reasoning':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Edge Cases':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const isDistractionFree = isZenMode || isFocusMode;

  return (
    <div className={`${isFocusMode ? 'max-w-3xl' : 'max-w-6xl'} mx-auto px-4 py-6 space-y-6 transition-all duration-300`}>
      {/* Top Assessment Bar: Minimalist Focus HUD when in Focus Mode, or Full Control Bar */}
      {isFocusMode ? (
        <div className="sticky top-4 z-40 w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black text-xs border border-indigo-200/60 dark:border-indigo-800/60">
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <div className="w-24 sm:w-40 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
              {Math.round(progressPercent)}%
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {isTimedExam && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{formatSeconds(secondsElapsed)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onToggleFocusMode?.(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
              title="Exit Focus Mode (Esc or F)"
            >
              <Minimize2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Exit Focus</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 text-slate-500 rounded border border-slate-200 dark:border-slate-700 font-mono">
                Esc
              </kbd>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 transition-colors">
        {/* Title & Quit button */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onQuitQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-colors cursor-pointer shrink-0"
            title="Exit assessment"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                {quiz.quiz_title}
              </h2>
              {/* Audience Tier Badge */}
              {(() => {
                const tier = classifyAudience(quiz);
                const tierCfg = AUDIENCE_TIER_CONFIG[tier];
                return (
                  <span
                    className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${tierCfg.badgeBg} ${tierCfg.badgeBorder} ${tierCfg.badgeText}`}
                    title={`${tierCfg.label} - ${tierCfg.description}`}
                  >
                    <span>{tierCfg.emoji}</span>
                    <span>{tierCfg.shortLabel}</span>
                  </span>
                );
              })()}
              {isChallengeMode && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs shrink-0">
                  <Flame className="w-3 h-3 fill-white" />
                  <span>Speed Challenge</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {isChallengeMode ? 'Speed Challenge' : assessmentConfig.mode === 'exam' ? 'Test Mode' : 'Practice Mode'} • {persona} Style
            </p>
          </div>
        </div>

        {/* Timer & Assessment Utilities */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          {/* Focus Mode Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onToggleFocusMode?.(!isFocusMode);
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
              isFocusMode
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-indigo-500/25'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Toggle Focus Mode [F] - Hides all navigation menus & distractions"
          >
            <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Focus</span>
            <span className="hidden sm:inline"> Mode</span>
            <kbd className="hidden lg:inline px-1 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-mono">
              F
            </kbd>
          </button>

          {/* Pomodoro Timer Overlay Button */}
          <button
            type="button"
            onClick={togglePomodoro}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
              isPomodoroRunning
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/20'
                : isPomodoroOpen
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Toggle Pomodoro Study Timer"
          >
            <Timer className={`w-3.5 h-3.5 ${isPomodoroRunning ? 'text-amber-500 animate-spin' : 'text-slate-400'}`} />
            <span className="font-mono">{isPomodoroRunning ? formatPomodoroTime(pomodoroTimeLeft) : 'Pomodoro'}</span>
          </button>

          {/* Font Size Adjuster */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setFontSizeScale((prev) => (prev === 'xlarge' ? 'large' : prev === 'large' ? 'normal' : 'normal'));
              }}
              className="px-2 py-1 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-400">
              {fontSizeScale === 'xlarge' ? 'XL' : fontSizeScale === 'large' ? 'LG' : 'MD'}
            </span>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setFontSizeScale((prev) => (prev === 'normal' ? 'large' : prev === 'large' ? 'xlarge' : 'xlarge'));
              }}
              className="px-2 py-1 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Zen Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsZenMode(!isZenMode);
            }}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isZenMode
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Toggle Zen Distraction-Free Mode [Z]"
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 shrink-0" />}
            <span className="hidden sm:inline">Zen</span>
          </button>

          {/* Worksheet / Print Trigger */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              if (onOpenWorksheet) {
                onOpenWorksheet(quiz);
              } else {
                setIsWorksheetModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            title="Generate Printable Worksheet / Solution Key"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="hidden md:inline">Print</span>
          </button>

          {/* Focus Audio Generator */}
          <button
            type="button"
            onClick={handleToggleFocusHum}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isFocusHumActive
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isFocusHumActive ? 'Ambient Alpha Hum Active (Click to mute)' : 'Toggle Ambient Focus Hum'}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${isFocusHumActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="hidden md:inline">Focus</span>
          </button>

          {/* Keyboard Shortcuts Cheatsheet Trigger (Desktop only) */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowShortcutsModal(true);
            }}
            className="hidden md:flex p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            title="Keyboard Shortcuts Cheatsheet [?]"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Scratchpad Button */}
          <button
            type="button"
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              showScratchpad
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Scratchpad [S]"
          >
            <Edit3 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* Overall Time Counter */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              isTimedExam && totalTimeLimitSecs - secondsElapsed <= 60
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {isTimedExam
                ? `${formatSeconds(Math.max(0, totalTimeLimitSecs - secondsElapsed))} left`
                : formatSeconds(secondsElapsed)}
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>{answeredCount}/{quiz.questions.length}</span>
          </div>
        </div>
      </div>
    )}

      {/* Main Assessment Layout Grid (Question Jumper Palette + Active Question Canvas) */}
      <div className={`grid ${isDistractionFree ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1 lg:grid-cols-12'} gap-6 items-start`}>
        {/* Left/Sidebar: Question Matrix & Classification Jumper (3 cols) - Hidden in Focus / Zen Mode */}
        {!isDistractionFree && (
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Questions
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(progressPercent)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Question Quick Palette Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-5 gap-1.5 pt-1 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                {quiz.questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const ans = userAnswers[q.id];
                  const isFlagged = flaggedIds.has(q.id);

                  let btnClass = 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

                  if (ans?.checked) {
                    if (ans.isCorrect) {
                      btnClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold';
                    } else {
                      btnClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-bold';
                    }
                  }

                  if (isCurrent) {
                    btnClass += ' ring-2 ring-emerald-500 dark:ring-emerald-400 scale-105 shadow-xs font-black';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`relative p-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Matrix Legend */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Incorrect</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Flagged</span>
                </div>
              </div>

              {/* Finish Assessment Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Finish & See Results</span>
                </button>
              </div>
            </div>

            {/* Scratchpad Card when open */}
            {showScratchpad && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-indigo-200 dark:border-indigo-800 shadow-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Interactive Scratchpad</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowScratchpad(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={scratchpadText}
                  onChange={(e) => setScratchpadText(e.target.value)}
                  placeholder="Draft notes, formulas, pseudocode, or scratch working..."
                  rows={5}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Right Canvas: Question Evaluation Area (9 cols or full centered width in Focus/Zen Mode) */}
        <div className={`${isDistractionFree ? 'w-full max-w-3xl mx-auto' : 'lg:col-span-9'} space-y-6`}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
            {/* Challenge Mode Question Countdown Bar */}
            {isChallengeMode && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-900 border border-amber-300/80 dark:border-amber-700/80 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    <Timer className={`w-4 h-4 text-amber-500 ${!isAnswerChecked && questionTimeRemaining <= 5 ? 'animate-bounce text-rose-500' : ''}`} />
                    <span>Challenge Timer</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isAnswerChecked && (
                      <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full border ${
                        questionTimeRemaining <= 4
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : questionTimeRemaining <= 8
                          ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                      }`}>
                        {questionTimeRemaining}s Remaining
                      </span>
                    )}

                    {/* Speed multiplier preview or achieved */}
                    {isAnswerChecked && lastSpeedMultiplier && lastSpeedMultiplier > 1.0 && (
                      <span className="text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>{lastSpeedMultiplier}x Speed Bonus!</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Animated countdown meter */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      questionTimeRemaining <= 4
                        ? 'bg-rose-500'
                        : questionTimeRemaining <= 8
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${isAnswerChecked ? 100 : (questionTimeRemaining / questionTimeLimit) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Classification Metadata Chips */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Question {currentIndex + 1} of {quiz.questions.length}
                </span>

                {/* Domain Taxonomy Chip */}
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getDomainColor(
                    currentQuestion.domain
                  )}`}
                >
                  {currentQuestion.domain || 'Core Knowledge'}
                </span>

                {/* Bloom's Level */}
                {currentQuestion.bloom_level && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Level: {currentQuestion.bloom_level}
                  </span>
                )}

                {/* Points */}
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {currentQuestion.points || 20} pts
                </span>
              </div>

              {/* Timestamp & Flag Buttons */}
              <div className="flex items-center gap-2">
                {currentQuestion.media_timestamp && (
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>[{currentQuestion.media_timestamp}]</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    flaggedIds.has(currentQuestion.id)
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="Flag question for review"
                >
                  <Flag className="w-4 h-4" />
                </button>

                {/* Voice Narration & Settings Group */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handleSpeakQuestion}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSpeakingCurrent
                        ? 'bg-indigo-600 text-white shadow-xs animate-pulse ring-2 ring-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                    }`}
                    title={isSpeakingCurrent ? 'Reading question aloud... Click to stop' : 'Read question aloud'}
                  >
                    {isSpeakingCurrent ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span className="hidden sm:inline text-[11px]">Read</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setShowVoiceSettings(true);
                    }}
                    className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Voice settings (Change voice, pitch, speed, presets)"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h3
                className={`font-black text-slate-900 dark:text-white leading-relaxed tracking-tight ${
                  fontSizeScale === 'xlarge'
                    ? 'text-2xl sm:text-3xl'
                    : fontSizeScale === 'large'
                    ? 'text-xl sm:text-2xl'
                    : 'text-lg sm:text-xl'
                }`}
              >
                {currentQuestion.question}
              </h3>

              {/* Question Contextual Image */}
              {currentQuestion.image_url && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs bg-slate-950/5 dark:bg-slate-950/40 group/media">
                  <img
                    src={currentQuestion.image_url}
                    alt={currentQuestion.image_caption || 'Question visual reference'}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.hasFallenBack) {
                        target.dataset.hasFallenBack = 'true';
                        const fallback = resolveThematicVisual(
                          `${quiz.quiz_title || ''} ${currentQuestion.image_search_query || ''} ${currentQuestion.question || ''}`
                        );
                        target.src = fallback.url;
                      }
                    }}
                    className="w-full max-h-80 object-cover object-center rounded-2xl transition-transform hover:scale-[1.01] duration-300"
                    loading="lazy"
                  />

                  {/* Top-Right Floating Attribution Badge (when no caption bar is present) */}
                  {!currentQuestion.image_caption && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <MediaAttributionBadge
                        imageUrl={currentQuestion.image_url}
                        source={currentQuestion.image_source}
                        sourceUrl={currentQuestion.image_source_url}
                        attribution={currentQuestion.image_attribution}
                        variant="badge"
                      />
                    </div>
                  )}

                  {/* Caption & Unobtrusive Attribution Credit Bar */}
                  {currentQuestion.image_caption && (
                    <div className="px-3.5 py-2 bg-slate-900/90 backdrop-blur-xs text-xs font-medium text-slate-200 flex items-center justify-between gap-3 border-t border-slate-800/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{currentQuestion.image_caption}</span>
                      </div>
                      <MediaAttributionBadge
                        imageUrl={currentQuestion.image_url}
                        source={currentQuestion.image_source}
                        sourceUrl={currentQuestion.image_source_url}
                        attribution={currentQuestion.image_attribution}
                        variant="caption"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Code Snippet Box */}
              {currentQuestion.code_snippet && (
                <div className="rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs border border-slate-800 shadow-inner overflow-x-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentQuestion.language || 'Code Artifact'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentQuestion.media_timestamp && (
                        <span>Time Anchor: {currentQuestion.media_timestamp}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyCode(currentQuestion.code_snippet!)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        {copiedCode ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                  </div>
                  <pre className="leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.code_snippet}
                  </pre>
                </div>
              )}
            </div>

            {/* QUESTION INPUT FORMAT: MULTIPLE CHOICE */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuestion.options.map((option, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
                  const isSelected = selectedOption === option;

                  let optionStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-400 text-slate-900 dark:text-slate-100';

                  if (isSelected) {
                    optionStyle = 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-bold';
                  }

                  if (isAnswerChecked) {
                    if (
                      option.trim().toLowerCase() ===
                      currentQuestion.correct_answer.trim().toLowerCase()
                    ) {
                      optionStyle = 'border-emerald-600 dark:border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-extrabold ring-2 ring-emerald-600';
                    } else if (isSelected && !isCurrentCorrect) {
                      optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold';
                    } else {
                      optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400';
                    }
                  }

                  const optSizeClass =
                    fontSizeScale === 'xlarge'
                      ? 'text-base sm:text-lg'
                      : fontSizeScale === 'large'
                      ? 'text-sm sm:text-base'
                      : 'text-xs sm:text-sm';

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedOption(option);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {letter}
                      </span>
                      <span className={`${optSizeClass} font-semibold flex-1 leading-snug`}>
                        {option}
                      </span>
                      <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                        [{idx + 1}]
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* QUESTION INPUT FORMAT: FILL IN THE BLANK */}
            {currentQuestion.type === 'fill_in_blank' && (
              <div className="space-y-4 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-loose flex flex-wrap items-center gap-2">
                  {currentQuestion.blank_context?.prefix && (
                    <span>{currentQuestion.blank_context.prefix}</span>
                  )}

                  <span className="inline-flex items-center min-w-[140px] px-3 py-1 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-extrabold text-center justify-center">
                    {fillBlankAnswer || '___________'}
                  </span>

                  {currentQuestion.blank_context?.suffix && (
                    <span>{currentQuestion.blank_context.suffix}</span>
                  )}
                </div>

                {/* Term Bank */}
                {currentQuestion.blank_context?.word_bank &&
                  currentQuestion.blank_context.word_bank.length > 0 &&
                  !isAnswerChecked && (
                    <div className="space-y-2">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Terminology Bank:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.blank_context.word_bank.map((word, wIdx) => (
                          <button
                            key={wIdx}
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setFillBlankAnswer(word);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                              fillBlankAnswer === word
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                            }`}
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {!currentQuestion.blank_context?.word_bank && !isAnswerChecked && (
                  <input
                    type="text"
                    value={fillBlankAnswer}
                    disabled={isAnswerChecked}
                    onChange={(e) => setFillBlankAnswer(e.target.value)}
                    placeholder="Type the exact missing term or phrase..."
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                )}
              </div>
            )}

            {/* QUESTION INPUT FORMAT: OPEN EXPLANATION */}
            {currentQuestion.type === 'open_explanation' && (
              <div className="space-y-4 pt-2">
                <textarea
                  rows={4}
                  value={openTextAnswer}
                  disabled={isAnswerChecked}
                  onChange={(e) => setOpenTextAnswer(e.target.value)}
                  placeholder="Explain your reasoning or describe the solution steps in full..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
                />

                {/* Rubric Guidance */}
                {currentQuestion.rubric && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200">
                    <span className="font-extrabold block mb-1">Evaluation Criteria:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                      {currentQuestion.rubric.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* QUESTION INPUT FORMAT: CODE MEDIA CHALLENGE */}
            {currentQuestion.type === 'code_media_challenge' && (
              <div className="space-y-4 pt-2">
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, idx) => {
                      const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
                      const isSelected = selectedOption === option;

                      let optionStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-400 text-slate-900 dark:text-slate-100';

                      if (isSelected) {
                        optionStyle = 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-bold';
                      }

                      if (isAnswerChecked) {
                        if (
                          option.trim().toLowerCase() ===
                          currentQuestion.correct_answer.trim().toLowerCase()
                        ) {
                          optionStyle = 'border-emerald-600 dark:border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-extrabold ring-2 ring-emerald-600';
                        } else if (isSelected && !isCurrentCorrect) {
                          optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold';
                        } else {
                          optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAnswerChecked}
                          onClick={() => {
                            soundFx.playSelect();
                            setSelectedOption(option);
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${optionStyle}`}
                        >
                          <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            {letter}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug">
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={fillBlankAnswer}
                    disabled={isAnswerChecked}
                    onChange={(e) => setFillBlankAnswer(e.target.value)}
                    placeholder="Enter missing answer or code snippet..."
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                )}
              </div>
            )}

            {/* Hint Accordion */}
            {showHint && currentQuestion.gamified_feedback?.hint && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-300 mb-0.5">
                    Hint
                  </p>
                  <p className="font-semibold leading-relaxed">
                    {currentQuestion.gamified_feedback.hint}
                  </p>
                </div>
              </div>
            )}

            {/* Checked Rationale Box with Quizzie Mascot Support */}
            {isAnswerChecked && (
              <div
                className={`p-5 rounded-3xl border animate-in fade-in duration-200 space-y-3 ${
                  isCurrentCorrect
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <MascotAvatar
                    mood={isCurrentCorrect ? (stats.streak > 2 ? 'streak' : 'happy') : 'comforting'}
                    size="sm"
                  />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isCurrentCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                      <h4 className="font-extrabold text-sm sm:text-base tracking-tight">
                        {isCurrentCorrect
                          ? currentQuestion.gamified_feedback?.success_quote || 'Hoot hoot! Correct! Nicely done.'
                          : `Keep going! Correct Answer: ${currentQuestion.correct_answer}`}
                      </h4>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                      {currentQuestion.explanation}
                    </p>

                    {!isCurrentCorrect && (
                      <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-1">
                        <span>🌱</span>
                        <span>Quizzie's Growth Tip: Every mistake helps wire your brain for deeper understanding!</span>
                      </p>
                    )}
                  </div>
                </div>

                {currentQuestion.pedagogy_note && (
                  <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <span className="font-extrabold">Pedagogy Note:</span> {currentQuestion.pedagogy_note}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bottom Assessment Control Deck */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 transition-colors">
            {/* Left Tools: Hint & AI Tutor Consultation */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  soundFx.playHint();
                  setShowHint(!showHint);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-extrabold hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{showHint ? 'Hide Hint' : 'View Hint'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenTutor(currentQuestion);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Ask AI Tutor</span>
              </button>
            </div>

            {/* Right Action: Step Verification & Next/Prev */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                title="Previous question"
                aria-label="Previous question"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {!isAnswerChecked ? (
                <button
                  type="button"
                  disabled={!canCheckAnswer() || isEvaluatingOpen}
                  onClick={handleCheckOrSaveAnswer}
                  className="flex-1 sm:flex-initial py-2.5 px-5 sm:px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:translate-y-0.5 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  {isEvaluatingOpen ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <span>Check Answer</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 sm:flex-initial py-2.5 px-5 sm:px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs sm:text-sm shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>
                    {currentIndex + 1 < quiz.questions.length ? 'Next Question' : 'Finish Quiz'}
                  </span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Printable Exam Worksheet & Solution Key Modal */}
      <ExamWorksheetModal
        quiz={quiz}
        isOpen={isWorksheetModalOpen}
        onClose={() => setIsWorksheetModalOpen(false)}
      />

      {/* Voice & Narration Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        initialLanguage={quiz.language}
      />
    </div>
  );
};

