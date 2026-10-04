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
  Mic,
  MicOff,
  Eye,
  EyeOff,
  Scissors,
  ZoomIn,
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
import { useTheme, FONT_CATALOG } from '../context/ThemeContext';
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
  const [showFontPopover, setShowFontPopover] = useState<boolean>(false);
  const { fontFamily, setFontFamily } = useTheme();

  // QoL: Auto-Next on Correct, Option Elimination, Matrix Filter, Spoiler Shield & Image Zoom
  const [autoNextOnCorrect, setAutoNextOnCorrect] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<number, string[]>>({});
  const [matrixFilter, setMatrixFilter] = useState<'all' | 'todo' | 'flagged'>('all');
  const [peekImageClue, setPeekImageClue] = useState<boolean>(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  // Microphone Voice Answer States
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceFeedbackMsg, setVoiceFeedbackMsg] = useState<string | null>(null);
  const [autoCheckVoice, setAutoCheckVoice] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  // Kahoot! Arcade Streak, Points & Power-Ups State
  const [kahootStreak, setKahootStreak] = useState<number>(0);
  const [kahootArcadePoints, setKahootArcadePoints] = useState<number>(0);
  const [lastPointsEarned, setLastPointsEarned] = useState<number>(0);
  const [doublePointsArmed, setDoublePointsArmed] = useState<boolean>(false);
  const [doublePointsUsed, setDoublePointsUsed] = useState<boolean>(false);
  const [streakShieldArmed, setStreakShieldArmed] = useState<boolean>(false);
  const [streakShieldUsed, setStreakShieldUsed] = useState<boolean>(false);
  const [streakSavedBanner, setStreakSavedBanner] = useState<boolean>(false);

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
    setPeekImageClue(false);
    setVoiceTranscript('');
    setVoiceFeedbackMsg(null);
    setLastSpeedMultiplier(speedMultipliers[currentQuestion.id] || null);
  }, [currentIndex, currentQuestion]);

  // Stop active voice recognition when switching questions or unmounting
  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListeningVoice(false);
  };

  useEffect(() => {
    stopVoiceRecognition();
  }, [currentIndex]);

  // Redacts the correct answer from image captions prior to answering so images never spoil the answer
  const getSpoilerSafeCaption = (rawCaption?: string | null): string => {
    if (!rawCaption) return 'Visual reference for this question';
    const ans = (currentQuestion.correct_answer || '').trim();
    if (!ans) return rawCaption;

    let safe = rawCaption;
    const escapedAns = ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    safe = safe.replace(new RegExp(escapedAns, 'gi'), '[•••]');

    const stopWords = new Set(['that', 'this', 'with', 'from', 'have', 'what', 'when', 'where', 'which', 'both', 'none', 'above', 'below', 'into', 'over', 'under']);
    const ansTokens = ans
      .split(/[\s,;/()-]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3 && !stopWords.has(t.toLowerCase()));

    for (const tok of ansTokens) {
      const escapedTok = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      safe = safe.replace(new RegExp(`\\b${escapedTok}\\b`, 'gi'), '[•••]');
    }
    return safe;
  };

  // Matches spoken microphone transcript to the current question's options or text input
  const applySpokenAnswer = (rawText: string, serverMatchedOption?: string) => {
    const clean = rawText.trim();
    if (!clean) return;
    setVoiceTranscript(clean);

    const lower = clean.toLowerCase().replace(/[.,!?]/g, '').trim();
    const wantsImmediateSubmit =
      autoCheckVoice ||
      /\b(submit|check answer|final answer|lock in)\b/i.test(lower);

    const strippedSpeech = lower
      .replace(/\b(submit|check answer|final answer|lock in|my answer is|the answer is|i choose|i pick|select)\b/gi, '')
      .trim();

    if (
      currentQuestion.type === 'multiple_choice' ||
      (currentQuestion.type === 'code_media_challenge' &&
        currentQuestion.options &&
        currentQuestion.options.length > 0)
    ) {
      const opts = currentQuestion.options || [];
      let matchedOpt: string | null = null;
      let matchedIdx = -1;

      if (serverMatchedOption && opts.includes(serverMatchedOption)) {
        matchedOpt = serverMatchedOption;
        matchedIdx = opts.indexOf(serverMatchedOption);
      }

      // 1. Check explicit letter / number commands ("Option A", "A", "1", "First", etc.)
      if (!matchedOpt) {
        const letterMatch =
          strippedSpeech.match(/^(?:option|choice|letter|answer)?\s*([abcd])$/i) ||
          lower.match(/\b(?:option|choice|letter)\s+([abcd])\b/i);
        if (letterMatch) {
          const idx = ['a', 'b', 'c', 'd'].indexOf(letterMatch[1].toLowerCase());
          if (idx >= 0 && idx < opts.length) {
            matchedOpt = opts[idx];
            matchedIdx = idx;
          }
        }
      }

      if (!matchedOpt) {
        const numMap: Record<string, number> = {
          '1': 0, 'one': 0, 'first': 0, 'first one': 0,
          '2': 1, 'two': 1, 'second': 1, 'second one': 1,
          '3': 2, 'three': 2, 'third': 2, 'third one': 2,
          '4': 3, 'four': 3, 'fourth': 3, 'fourth one': 3, 'last': opts.length - 1,
        };
        const cleanedNum = strippedSpeech.replace(/^(?:number|option|choice)\s+/i, '').trim();
        if (cleanedNum in numMap && numMap[cleanedNum] < opts.length) {
          matchedIdx = numMap[cleanedNum];
          matchedOpt = opts[matchedIdx];
        }
      }

      // 2. Fuzzy text similarity match against each option
      if (!matchedOpt && opts.length > 0) {
        let bestScore = 0;
        const speechTokens = strippedSpeech.split(/\s+/).filter((w) => w.length > 1);

        opts.forEach((opt, idx) => {
          const optLower = opt.toLowerCase().replace(/[.,!?]/g, '').trim();
          let score = 0;
          if (optLower === strippedSpeech || optLower === lower) {
            score = 100;
          } else if (optLower.includes(strippedSpeech) && strippedSpeech.length >= 3) {
            score = 80;
          } else if (strippedSpeech.includes(optLower) && optLower.length >= 2) {
            score = 75;
          } else {
            const optTokens = optLower.split(/\s+/).filter((w) => w.length > 1);
            let hits = 0;
            for (const st of speechTokens) {
              if (optTokens.some((ot) => ot.includes(st) || st.includes(ot))) {
                hits++;
              }
            }
            if (optTokens.length > 0 && hits > 0) {
              score = (hits / Math.max(optTokens.length, speechTokens.length)) * 65 + hits * 10;
            }
          }

          if (score > bestScore) {
            bestScore = score;
            matchedOpt = opt;
            matchedIdx = idx;
          }
        });

        if (bestScore < 15) {
          matchedOpt = null;
          matchedIdx = -1;
        }
      }

      if (matchedOpt && matchedIdx >= 0) {
        soundFx.playSelect();
        setSelectedOption(matchedOpt);
        const letter = ['A', 'B', 'C', 'D'][matchedIdx] || `${matchedIdx + 1}`;
        setVoiceFeedbackMsg(`Heard "${clean}" → Selected Option ${letter}: ${matchedOpt}`);
        if (wantsImmediateSubmit) {
          setTimeout(() => {
            handleVoiceDirectCheck(matchedOpt!);
          }, 350);
        }
      } else {
        soundFx.playClick();
        setVoiceFeedbackMsg(
          `Heard "${clean}" — Say "Option A/B/C/D" or speak the exact choice text to select.`
        );
      }
      return;
    }

    if (currentQuestion.type === 'fill_in_blank' || currentQuestion.type === 'code_media_challenge') {
      const cleanTerm = clean.replace(/[.!?]+$/, '').trim();
      const bank = currentQuestion.blank_context?.word_bank || [];
      const bankMatch = bank.find(
        (w) =>
          w.toLowerCase() === cleanTerm.toLowerCase() ||
          cleanTerm.toLowerCase().includes(w.toLowerCase())
      );
      const chosen = bankMatch || cleanTerm;
      soundFx.playSelect();
      setFillBlankAnswer(chosen);
      setVoiceFeedbackMsg(`Heard "${clean}" → Filled blank with "${chosen}"`);
      if (wantsImmediateSubmit && chosen.length > 0) {
        setTimeout(() => {
          handleVoiceDirectCheck(chosen);
        }, 350);
      }
      return;
    }

    if (currentQuestion.type === 'open_explanation') {
      soundFx.playSelect();
      setOpenTextAnswer((prev) => {
        const next = prev ? `${prev.trim()} ${clean}` : clean;
        return next;
      });
      setVoiceFeedbackMsg(`Dictated to answer: "${clean}"`);
    }
  };

  // Helper to check a voice-supplied answer immediately
  const handleVoiceDirectCheck = (directAnswer: string) => {
    if (isAnswerChecked || !directAnswer.trim()) return;
    if (
      currentQuestion.type === 'multiple_choice' ||
      currentQuestion.type === 'fill_in_blank' ||
      (currentQuestion.type === 'code_media_challenge' && currentQuestion.options?.length)
    ) {
      const isCorrect =
        directAnswer.trim().toLowerCase() ===
        currentQuestion.correct_answer.trim().toLowerCase();

      if (isCorrect) {
        soundFx.playCorrect();
        if (autoNextOnCorrect) {
          setTimeout(() => {
            if (currentIndex + 1 < quiz.questions.length) {
              setCurrentIndex((prev) => prev + 1);
            }
          }, 1450);
        }
      } else {
        soundFx.playIncorrect();
      }

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          userAnswer: directAnswer.trim(),
          isCorrect,
          checked: true,
        },
      }));
    }
  };

  // Starts or stops Microphone Voice Answering (Web Speech API + MediaRecorder Server Fallback)
  const handleToggleVoiceAnswer = async () => {
    if (isAnswerChecked) return;
    soundFx.playClick();
    speechEngine.stop();

    if (isListeningVoice) {
      stopVoiceRecognition();
      return;
    }

    setVoiceFeedbackMsg('Listening... Speak your answer or say "Option A, B, C, or D"');
    setIsListeningVoice(true);

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;
        recognition.lang = quiz.language || speechEngine.getSettings().currentLanguage || 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;

        let finalTranscript = '';

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const tr = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += tr;
            } else {
              interim += tr;
            }
          }
          const currentSpoken = (finalTranscript || interim).trim();
          if (currentSpoken) {
            setVoiceTranscript(currentSpoken);
          }
          if (finalTranscript.trim()) {
            applySpokenAnswer(finalTranscript.trim());
          }
        };

        recognition.onerror = () => {
          setIsListeningVoice(false);
        };

        recognition.onend = () => {
          setIsListeningVoice(false);
        };

        recognition.start();
        return;
      } catch {
        // Fall through to MediaRecorder fallback
      }
    }

    // Fallback: Record microphone via MediaRecorder and transcribe via /api/transcribe-answer
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          setIsListeningVoice(false);
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          if (audioBlob.size === 0) return;

          setVoiceFeedbackMsg('Transcribing spoken answer...');
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Audio = String(reader.result || '');
              const res = await fetch('/api/transcribe-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Audio,
                  mimeType: recorder.mimeType || 'audio/webm',
                  language: quiz.language || 'en-US',
                  options: currentQuestion.options,
                  question: currentQuestion.question,
                }),
              });
              const data = await res.json();
              if (data.success && data.transcript) {
                applySpokenAnswer(data.transcript, data.matchedOption);
              } else {
                setVoiceFeedbackMsg('Could not hear clearly. Please try speaking again.');
              }
            } catch {
              setVoiceFeedbackMsg('Voice transcription unavailable. Please try again.');
            }
          };
          reader.readAsDataURL(audioBlob);
        };

        recorder.start();
        setTimeout(() => {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }, 4000);
      } catch {
        setIsListeningVoice(false);
        setVoiceFeedbackMsg('Microphone permission is needed to speak answers.');
      }
    } else {
      setIsListeningVoice(false);
      setVoiceFeedbackMsg('Voice input is not supported in this browser.');
    }
  };

  // Toggle strike-through elimination on a Multiple Choice option
  const toggleEliminateOption = (optionText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnswerChecked) return;
    soundFx.playClick();
    setEliminatedOptions((prev) => {
      const currentList = prev[currentQuestion.id] || [];
      const exists = currentList.includes(optionText);
      const nextList = exists
        ? currentList.filter((o) => o !== optionText)
        : [...currentList, optionText];
      return { ...prev, [currentQuestion.id]: nextList };
    });
    if (selectedOption === optionText) {
      setSelectedOption(null);
    }
  };

  // 50/50 Smart Narrow: Eliminate 2 wrong distractors on MCQ questions
  const handleFiftyFiftyNarrow = () => {
    if (isAnswerChecked || !currentQuestion.options || currentQuestion.options.length < 3) return;
    soundFx.playHint();
    const wrongOptions = currentQuestion.options.filter(
      (o) => o.trim().toLowerCase() !== currentQuestion.correct_answer.trim().toLowerCase()
    );
    const toEliminate = wrongOptions.slice(0, 2);
    setEliminatedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: toEliminate,
    }));
    if (selectedOption && toEliminate.includes(selectedOption)) {
      setSelectedOption(null);
    }
  };

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

      // Hotkey V: Voice Read Question
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handleSpeakQuestion();
      }

      // Hotkey M: Microphone Speak Answer
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleVoiceAnswer();
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
      const nextStreak = kahootStreak + 1;
      setKahootStreak(nextStreak);
      setStreakSavedBanner(false);

      // Calculate Kahoot! style arcade points (base 750-1000 + streak bonus + 2x power-up)
      const speedFactor = isChallengeMode
        ? Math.max(0.5, questionTimeRemaining / questionTimeLimit)
        : 0.88;
      let rawArcadePts = Math.round(600 + 400 * speedFactor) + Math.min(500, (nextStreak - 1) * 100);
      if (doublePointsArmed) {
        rawArcadePts *= 2;
        setDoublePointsArmed(false);
        setDoublePointsUsed(true);
      }
      setLastPointsEarned(rawArcadePts);
      setKahootArcadePoints((prev) => prev + rawArcadePts);

      if (nextStreak >= 3) {
        soundFx.playKahootStreakFire();
      } else if (isChallengeMode) {
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
      setLastPointsEarned(0);
      if (doublePointsArmed) {
        setDoublePointsArmed(false);
        setDoublePointsUsed(true);
      }
      if (streakShieldArmed && kahootStreak > 0) {
        // Streak Shield protects the streak!
        setStreakShieldArmed(false);
        setStreakShieldUsed(true);
        setStreakSavedBanner(true);
      } else {
        setKahootStreak(0);
        setStreakSavedBanner(false);
      }
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

    if (isCorrect && autoNextOnCorrect) {
      setTimeout(() => {
        if (currentIndex + 1 < quiz.questions.length) {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 1450);
    }
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

          {/* Font Size Adjuster + Quick Font Switcher */}
          <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
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
            <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowFontPopover((prev) => !prev);
              }}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              title="Switch Font Family (12 Curated Study Fonts)"
            >
              <Type className="w-3 h-3" />
              <span className="hidden xl:inline capitalize">{fontFamily}</span>
            </button>

            {showFontPopover && (
              <div className="absolute right-0 top-10 z-50 w-64 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Study Font ({FONT_CATALOG.length} Styles)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFontPopover(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {FONT_CATALOG.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setFontFamily(f.id);
                        setShowFontPopover(false);
                      }}
                      style={{ fontFamily: f.cssFamily }}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        fontFamily === f.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <span className="block font-bold">{f.name}</span>
                        <span className="block text-[10px] text-slate-400">{f.style}</span>
                      </div>
                      {f.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
                          {f.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auto-Next on Correct QoL Toggle */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setAutoNextOnCorrect((prev) => !prev);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              autoNextOnCorrect
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-2xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Auto-Next on Correct Answer (Flow State Mode)"
          >
            <Zap className={`w-3.5 h-3.5 shrink-0 ${autoNextOnCorrect ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Auto-Next</span>
          </button>

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
      <div className={`grid ${isDistractionFree ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1 lg:grid-cols-12'} gap-4 items-start`}>
        {/* Left/Sidebar: Question Matrix & Classification Jumper (3 cols) - Hidden in Focus / Zen Mode */}
        {!isDistractionFree && (
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
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

              {/* Matrix Filter Pills (All / Unanswered / Flagged) */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[10px] font-bold">
                {(
                  [
                    { id: 'all', label: `All (${quiz.questions.length})` },
                    { id: 'todo', label: `Todo (${quiz.questions.length - answeredCount})` },
                    { id: 'flagged', label: `Flag (${flaggedIds.size})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setMatrixFilter(tab.id);
                    }}
                    className={`py-1 px-1.5 rounded-lg transition-colors cursor-pointer truncate ${
                      matrixFilter === tab.id
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Question Quick Palette Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-5 gap-1.5 pt-1 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                {quiz.questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const ans = userAnswers[q.id];
                  const isFlagged = flaggedIds.has(q.id);

                  if (matrixFilter === 'todo' && ans?.checked) return null;
                  if (matrixFilter === 'flagged' && !isFlagged) return null;

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
        <div className={`${isDistractionFree ? 'w-full max-w-3xl mx-auto' : 'lg:col-span-9'} space-y-4`}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
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

                {/* Score & Answer Streak Pill */}
                <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{kahootArcadePoints.toLocaleString()} Score</span>
                </span>

                {kahootStreak >= 2 && (
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>{kahootStreak}x Streak</span>
                  </span>
                )}
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

                {/* Voice Narration, Microphone Answer & Settings Group */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {!isAnswerChecked && (
                    <button
                      type="button"
                      onClick={handleToggleVoiceAnswer}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isListeningVoice
                          ? 'bg-rose-600 text-white shadow-xs animate-pulse ring-2 ring-rose-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80'
                      }`}
                      title={
                        isListeningVoice
                          ? 'Listening for your spoken answer... Click to stop [M]'
                          : 'Speak your answer with Microphone [M]'
                      }
                    >
                      {isListeningVoice ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 animate-bounce" />
                          <span className="text-[11px] font-black uppercase tracking-wider">Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Speak Answer</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSpeakQuestion}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSpeakingCurrent
                        ? 'bg-indigo-600 text-white shadow-xs animate-pulse ring-2 ring-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                    }`}
                    title={isSpeakingCurrent ? 'Reading question aloud... Click to stop [V]' : 'Read question aloud [V]'}
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

              {/* Question Contextual Image (with Spoiler Shield before answering & Zoom Lightbox) */}
              {currentQuestion.image_url && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs bg-slate-950/5 dark:bg-slate-950/40 group/media">
                  <img
                    src={currentQuestion.image_url}
                    alt={
                      isAnswerChecked
                        ? currentQuestion.image_caption || 'Question visual reference'
                        : 'Question visual reference'
                    }
                    referrerPolicy="no-referrer"
                    onClick={() => setZoomedImageUrl(currentQuestion.image_url || null)}
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
                    className="w-full max-h-80 object-cover object-center rounded-t-2xl transition-transform hover:scale-[1.01] duration-300 cursor-zoom-in"
                    loading="lazy"
                  />

                  {/* Top-Right Zoom Lightbox Button */}
                  <button
                    type="button"
                    onClick={() => setZoomedImageUrl(currentQuestion.image_url || null)}
                    className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/75 hover:bg-slate-900 text-white text-[10px] font-bold backdrop-blur-xs border border-white/15 transition-all cursor-pointer"
                    title="Zoom visual diagram"
                  >
                    <ZoomIn className="w-3 h-3" />
                    <span>Zoom</span>
                  </button>

                  {/* Caption & Unobtrusive Attribution Credit Bar (Spoiler-Protected until answered!) */}
                  <div className="px-3.5 py-2 bg-slate-900/95 backdrop-blur-xs text-xs font-medium text-slate-200 flex items-center justify-between gap-3 border-t border-slate-800/60">
                    {isAnswerChecked ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          {currentQuestion.image_caption || 'Educational visual reference'}
                        </span>
                      </div>
                    ) : peekImageClue ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate text-amber-200">
                          {getSpoilerSafeCaption(currentQuestion.image_caption)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPeekImageClue(false)}
                          className="text-[10px] font-bold text-slate-400 hover:text-white underline shrink-0 cursor-pointer"
                        >
                          Hide
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <EyeOff className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate text-slate-300 text-[11px]">
                          Image description hidden until answered to prevent spoilers
                        </span>
                        {currentQuestion.image_caption && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setPeekImageClue(true);
                            }}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-bold border border-slate-700 shrink-0 cursor-pointer"
                          >
                            Peek Safe Clue
                          </button>
                        )}
                      </div>
                    )}
                    <MediaAttributionBadge
                      imageUrl={currentQuestion.image_url}
                      source={currentQuestion.image_source}
                      sourceUrl={currentQuestion.image_source_url}
                      attribution={currentQuestion.image_attribution}
                      variant="caption"
                    />
                  </div>
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

            {/* Interactive Voice Answer & QoL Bar */}
            {!isAnswerChecked && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={handleToggleVoiceAnswer}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                      isListeningVoice
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isListeningVoice ? (
                      <>
                        <MicOff className="w-4 h-4 animate-bounce" />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Speak Answer</span>
                        <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-indigo-700 text-indigo-100 rounded font-mono">
                          M
                        </kbd>
                      </>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {isListeningVoice ? (
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 truncate">
                        🎙️ {voiceTranscript ? `Hearing: "${voiceTranscript}"` : 'Listening... Speak the answer or say "Option A / B / C / D"'}
                      </p>
                    ) : voiceFeedbackMsg ? (
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 truncate">
                        🎙️ {voiceFeedbackMsg}
                      </p>
                    ) : (
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        Use your microphone to speak the answer out loud, or press <strong className="font-bold">M</strong> anytime.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2 shrink-0">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoCheckVoice}
                      onChange={(e) => setAutoCheckVoice(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Auto-Submit Voice</span>
                  </label>

                  {/* 2x Double Points Booster */}
                  <button
                    type="button"
                    disabled={doublePointsUsed}
                    onClick={() => {
                      soundFx.playKahootPowerUp();
                      setDoublePointsArmed((prev) => !prev);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold transition-all cursor-pointer disabled:opacity-40 ${
                      doublePointsArmed
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs ring-2 ring-amber-400/40'
                        : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                    }`}
                    title="Double your points on this question (1 per quiz)"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>{doublePointsArmed ? '2x Active' : doublePointsUsed ? '2x Used' : '2x Boost'}</span>
                  </button>

                  {/* Streak Shield Booster */}
                  <button
                    type="button"
                    disabled={streakShieldUsed}
                    onClick={() => {
                      soundFx.playKahootPowerUp();
                      setStreakShieldArmed((prev) => !prev);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold transition-all cursor-pointer disabled:opacity-40 ${
                      streakShieldArmed
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs ring-2 ring-emerald-400/40'
                        : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                    title="Keep your streak safe even if you miss this question (1 per quiz)"
                  >
                    <Flame className="w-3 h-3" />
                    <span>{streakShieldArmed ? 'Shield ON' : streakShieldUsed ? 'Shield Used' : 'Streak Shield'}</span>
                  </button>

                  {currentQuestion.type === 'multiple_choice' &&
                    currentQuestion.options &&
                    currentQuestion.options.length >= 3 &&
                    assessmentConfig.mode !== 'exam' && (
                      <button
                        type="button"
                        onClick={handleFiftyFiftyNarrow}
                        disabled={(eliminatedOptions[currentQuestion.id]?.length || 0) >= 2}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-extrabold hover:bg-purple-100 transition-colors cursor-pointer disabled:opacity-40"
                        title="Hide 2 wrong choices (50/50)"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>50/50</span>
                      </button>
                    )}
                </div>
              </div>
            )}

            {/* QUESTION INPUT FORMAT: MULTIPLE CHOICE */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuestion.options.map((option, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
                  const badgeAccent = [
                    'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                    'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
                    'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                    'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                  ][idx % 4];
                  const isSelected = selectedOption === option;
                  const isEliminated = (eliminatedOptions[currentQuestion.id] || []).includes(option);

                  let optionStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-400 text-slate-900 dark:text-slate-100';

                  if (isEliminated && !isAnswerChecked) {
                    optionStyle = 'opacity-45 border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 text-slate-400 line-through';
                  } else if (isSelected) {
                    optionStyle = 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-bold';
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
                    <div
                      key={idx}
                      onClick={() => {
                        if (isAnswerChecked || isEliminated) return;
                        soundFx.playClick();
                        setSelectedOption(option);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border shadow-2xs ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : badgeAccent
                        }`}
                      >
                        {letter}
                      </span>
                      <span className={`${optSizeClass} font-semibold flex-1 leading-snug`}>
                        {option}
                      </span>
                      {!isAnswerChecked && (
                        <button
                          type="button"
                          onClick={(e) => toggleEliminateOption(option, e)}
                          className={`p-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer shrink-0 ${
                            isEliminated
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                              : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-rose-500 border-slate-200/60 dark:border-slate-700/60'
                          }`}
                          title={isEliminated ? 'Restore option' : 'Cross out / Eliminate distractor'}
                        >
                          <Scissors className="w-3 h-3" />
                        </button>
                      )}
                      <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                        [{idx + 1}]
                      </span>
                    </div>
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
                    <div className="flex items-center flex-wrap gap-2">
                      {isCurrentCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                      <h4 className="font-extrabold text-sm sm:text-base tracking-tight">
                        {isCurrentCorrect
                          ? currentQuestion.gamified_feedback?.success_quote || 'Spark on! Correct! Nicely done.'
                          : `Keep going! Correct Answer: ${currentQuestion.correct_answer}`}
                      </h4>
                      {isCurrentCorrect && lastPointsEarned > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-600 text-white shadow-2xs">
                          +{lastPointsEarned.toLocaleString()} pts
                        </span>
                      )}
                      {streakSavedBanner && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                          🛡️ Streak Shield Saved Your {kahootStreak}x Streak!
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                      {currentQuestion.explanation}
                    </p>

                    {!isCurrentCorrect && (
                      <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-1">
                        <span>🌱</span>
                        <span>Tip: Every mistake helps you learn the concept even better!</span>
                      </p>
                    )}
                  </div>
                </div>

                {currentQuestion.pedagogy_note && (
                  <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <span className="font-extrabold">Study Tip:</span> {currentQuestion.pedagogy_note}
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

      {/* Fullscreen Image Zoom Lightbox Modal */}
      {zoomedImageUrl && (
        <div
          onClick={() => setZoomedImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setZoomedImageUrl(null)}
              className="absolute -top-10 right-0 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close Zoom</span>
            </button>
            <img
              src={zoomedImageUrl}
              alt="Zoomed question visual"
              referrerPolicy="no-referrer"
              className="max-h-[82vh] w-auto object-contain rounded-2xl border border-white/15 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

