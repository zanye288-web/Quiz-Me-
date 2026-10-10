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
  ExamFormatId,
} from '../types/quiz';
import {
  EXAM_FORMAT_CATALOG,
  getExamFormatSpec,
  evaluateExamBoardGrade,
} from '../utils/examFormats';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { usePomodoro } from '../context/PomodoroContext';
import { useTheme, FONT_CATALOG } from '../context/ThemeContext';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { ExamWorksheetModal } from './ExamWorksheetModal';
import { FlashcardStudyDeck } from './FlashcardStudyDeck';
import { MediaAttributionBadge } from './MediaAttributionBadge';
import { resolveThematicVisual } from '../utils/thematicImages';
import { MascotAvatar } from './MascotAvatar';
import { classifyAudience, AUDIENCE_TIER_CONFIG } from '../utils/audienceClassifier';
import { StudyToolsWidget } from './StudyToolsWidget';
import {
  inferQuestionDifficulty,
  inferQuestionTopic,
  getEncouragingFeedbackCopy,
  getDetailedAnswerExplanation,
  generateFollowUpQuestion,
  recordTopicAttemptAndAdaptDifficulty,
  interleaveQuestionsByTopic,
  recordQuestionMiss,
  getQuestionMissCount,
  saveTakeawayNote,
  recordFixedMistakeInProfile,
  recordConsistentPracticeSession,
  getHintUsageForQuestion,
  recordHintUsageForQuestion,
  generateTwoStepHintsForQuestion,
  QuestionHintUsageRecord,
  recordWrongAnswerChoice,
  recordDailyPracticeMinutesAndQuestions,
  recordDailyChallengeCompletion,
  recordBossChallengePassed,
  loadPersistedTextSize,
  savePersistedTextSize,
} from '../utils/adaptiveLearningEngine';
import { DifficultyType } from '../types/quiz';

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
    fixedQuestionIds?: number[];
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

  // Shortcuts, Flashcards, Study Guide & Worksheet Modals
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState<boolean>(false);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState<boolean>(false);
  const [showStudyGuidePanel, setShowStudyGuidePanel] = useState<boolean>(false);

  // QoL & Accessibility: Persisted Font Size Scaling & Zen Mode
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'xlarge'>(() =>
    loadPersistedTextSize()
  );
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showFontPopover, setShowFontPopover] = useState<boolean>(false);
  const { fontFamily, setFontFamily } = useTheme();

  const updateFontSizeScale = (nextSize: 'normal' | 'large' | 'xlarge') => {
    setFontSizeScale(nextSize);
    savePersistedTextSize(nextSize);
  };

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

  // Hints (Up to 2 Hints per Question with Slight Point Cost, Never Blocks Mastery) & AI Tutor Concept Summary States
  const [showHint, setShowHint] = useState<boolean>(false);
  const [currentHintUsage, setCurrentHintUsage] = useState<QuestionHintUsageRecord | null>(null);
  const [conceptSummaries, setConceptSummaries] = useState<
    Record<
      number,
      {
        conceptTitle: string;
        simplifiedSummary: string;
        realWorldAnalogy: string;
        keyPrinciple: string;
        generatedPostAnswer?: boolean;
      }
    >
  >({});
  const [isGeneratingConcept, setIsGeneratingConcept] = useState<boolean>(false);
  const [showConceptCard, setShowConceptCard] = useState<boolean>(false);
  const [savedConceptToNotes, setSavedConceptToNotes] = useState<Record<number, boolean>>({});

  // Interleaving & Adaptive Difficulty (70-80% Target) States
  const [isInterleavedMode, setIsInterleavedMode] = useState<boolean>(
    Boolean(assessmentConfig.interleavedMode)
  );
  const [activeExamFormat, setActiveExamFormat] = useState<ExamFormatId | undefined>(
    quiz.examFormat || (assessmentConfig.mode === 'exam' ? assessmentConfig.examFormat || 'waec' : undefined)
  );
  const isExamModeActive = Boolean(activeExamFormat || assessmentConfig.mode === 'exam');
  const activeExamSpec = getExamFormatSpec(activeExamFormat || 'waec');
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>(() => {
    const tagged = (quiz.questions || []).map((q, idx) => ({
      ...q,
      difficulty: inferQuestionDifficulty(q, idx, quiz.difficulty),
      topic: inferQuestionTopic(q, quiz.quiz_title),
    }));
    return assessmentConfig.interleavedMode ? interleaveQuestionsByTopic(tagged) : tagged;
  });

  // Sync sessionQuestions when quiz prop changes
  useEffect(() => {
    const tagged = (quiz.questions || []).map((q, idx) => ({
      ...q,
      difficulty: inferQuestionDifficulty(q, idx, quiz.difficulty),
      topic: inferQuestionTopic(q, quiz.quiz_title),
    }));
    setSessionQuestions(isInterleavedMode ? interleaveQuestionsByTopic(tagged) : tagged);
  }, [quiz]);

  const handleToggleInterleavedMode = () => {
    soundFx.playSelect();
    const nextVal = !isInterleavedMode;
    setIsInterleavedMode(nextVal);
    const tagged = (quiz.questions || []).map((q, idx) => ({
      ...q,
      difficulty: inferQuestionDifficulty(q, idx, quiz.difficulty),
      topic: inferQuestionTopic(q, quiz.quiz_title),
    }));
    setSessionQuestions(nextVal ? interleaveQuestionsByTopic(tagged) : tagged);
  };

  // Adaptive Difficulty State (Target: 70-80% Accuracy per Topic)
  const [activeAdaptiveDifficulty, setActiveAdaptiveDifficulty] = useState<DifficultyType>(
    quiz.difficulty || 'Intermediate'
  );
  const [topicAccuracyPercent, setTopicAccuracyPercent] = useState<number>(75);
  const [adaptiveStepBanner, setAdaptiveStepBanner] = useState<string | null>(null);

  // Follow-Up Question (Same Concept, Different Wording) after a Miss
  const [activeFollowUpQuestion, setActiveFollowUpQuestion] = useState<Question | null>(null);
  const [followUpSelectedOption, setFollowUpSelectedOption] = useState<string | null>(null);
  const [followUpChecked, setFollowUpChecked] = useState<boolean>(false);
  const [followUpCorrect, setFollowUpCorrect] = useState<boolean>(false);

  // "Review Pile" that collects missed questions and resurfaces them later in the session
  const [reviewPile, setReviewPile] = useState<Question[]>([]);
  const [fixedQuestionIds, setFixedQuestionIds] = useState<number[]>([]);
  const [isReviewingPileMode, setIsReviewingPileMode] = useState<boolean>(false);
  const [reviewPileSelectedOption, setReviewPileSelectedOption] = useState<string | null>(null);
  const [reviewPileChecked, setReviewPileChecked] = useState<boolean>(false);
  const [reviewPileCorrect, setReviewPileCorrect] = useState<boolean>(false);

  // Optional "Explain it in your own words" prompt for missed questions
  const [ownWordsText, setOwnWordsText] = useState<string>('');
  const [ownWordsSaved, setOwnWordsSaved] = useState<boolean>(false);
  const [currentMissCount, setCurrentMissCount] = useState<number>(0);

  // Separate Optional "Speed Round" Mode (Timer is strictly optional and does not affect mastery levels)
  const [isSpeedRoundMode, setIsSpeedRoundMode] = useState<boolean>(
    Boolean(assessmentConfig.speedRoundMode ?? assessmentConfig.challengeMode ?? false)
  );
  const isChallengeMode = isSpeedRoundMode;
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

  // Global Timer & Time Range System
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [liveTimeRangeEnabled, setLiveTimeRangeEnabled] = useState<boolean>(
    Boolean(assessmentConfig.timerRangeEnabled || assessmentConfig.timeLimitMinutes > 0)
  );
  const [liveMinMinutes, setLiveMinMinutes] = useState<number>(
    assessmentConfig.minTimeMinutes ?? (assessmentConfig.timeLimitMinutes > 0 ? Math.max(1, Math.floor(assessmentConfig.timeLimitMinutes * 0.3)) : 2)
  );
  const [liveMaxMinutes, setLiveMaxMinutes] = useState<number>(
    assessmentConfig.maxTimeMinutes || assessmentConfig.timeLimitMinutes || 10
  );
  const [showTimeRangePopover, setShowTimeRangePopover] = useState<boolean>(false);

  const minRangeSecs = liveTimeRangeEnabled ? liveMinMinutes * 60 : 0;
  const totalTimeLimitSecs = liveTimeRangeEnabled ? liveMaxMinutes * 60 : assessmentConfig.timeLimitMinutes * 60;
  const isTimedExam = liveTimeRangeEnabled || assessmentConfig.timeLimitMinutes > 0;
  const isInTargetTimeRange =
    liveTimeRangeEnabled && secondsElapsed >= minRangeSecs && secondsElapsed <= totalTimeLimitSecs;

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

  const currentQuestion = sessionQuestions[currentIndex] || sessionQuestions[0] || quiz.questions[0];
  const currentQuestionDifficulty = inferQuestionDifficulty(currentQuestion, currentIndex, quiz.difficulty);
  const currentQuestionTopic = inferQuestionTopic(currentQuestion, quiz.quiz_title);
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
  const questionShownAtRef = useRef<number>(Date.now());
  useEffect(() => {
    questionShownAtRef.current = Date.now();
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
    const existingHint = getHintUsageForQuestion(currentQuestion);
    setCurrentHintUsage(existingHint);
    setShowHint(existingHint.hintsUsedCount > 0);
    if (existingHint.hint2Used && currentQuestion.options && currentQuestion.options.length >= 3) {
      const twoStep = generateTwoStepHintsForQuestion(currentQuestion);
      if (twoStep.wrongOptionsToRemove.length > 0) {
        setEliminatedOptions((prev) => ({
          ...prev,
          [currentQuestion.id]: twoStep.wrongOptionsToRemove,
        }));
      }
    }
    setPeekImageClue(false);
    setVoiceTranscript('');
    setVoiceFeedbackMsg(null);
    setLastSpeedMultiplier(speedMultipliers[currentQuestion.id] || null);
    setActiveFollowUpQuestion(null);
    setFollowUpSelectedOption(null);
    setFollowUpChecked(false);
    setFollowUpCorrect(false);
    setOwnWordsText('');
    setOwnWordsSaved(false);
    setCurrentMissCount(getQuestionMissCount(currentQuestion));
    setShowConceptCard(false);
  }, [currentIndex, currentQuestion]);

  // Unlock Hint #1 (-15% pts, First Letter & Concept Clue) or Hint #2 (-30% pts total, Remove 2 Wrong Options)
  const handleUnlockHintTier = (tier: 1 | 2) => {
    soundFx.playHint();
    const updatedUsage = recordHintUsageForQuestion(currentQuestion, tier);
    setCurrentHintUsage(updatedUsage);
    setShowHint(true);

    if (tier === 2) {
      const twoStep = generateTwoStepHintsForQuestion(currentQuestion);
      if (twoStep.wrongOptionsToRemove.length > 0) {
        setEliminatedOptions((prev) => ({
          ...prev,
          [currentQuestion.id]: twoStep.wrongOptionsToRemove,
        }));
        if (selectedOption && twoStep.wrongOptionsToRemove.includes(selectedOption)) {
          setSelectedOption(null);
        }
      }
    }
  };

  // Calls the AI Tutor to generate a simplified 'Explain this Concept' summary specific to the active question's context
  const handleExplainConcept = async (targetQuestion: Question = currentQuestion, forceRefresh = false) => {
    soundFx.playSelect();
    const qId = targetQuestion.id;
    const isCheckedNow = Boolean(userAnswers[qId]?.checked);
    const cached = conceptSummaries[qId];

    if (showConceptCard && cached && !forceRefresh && cached.generatedPostAnswer === isCheckedNow) {
      setShowConceptCard(false);
      return;
    }

    setShowConceptCard(true);
    if (cached && !forceRefresh && cached.generatedPostAnswer === isCheckedNow) {
      return;
    }

    setIsGeneratingConcept(true);
    const qTopic = inferQuestionTopic(targetQuestion, quiz.quiz_title);
    const qDiff = inferQuestionDifficulty(targetQuestion, currentIndex, quiz.difficulty);

    try {
      const response = await fetch('/api/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: targetQuestion.question,
          topic: qTopic,
          domain: targetQuestion.domain,
          difficulty: qDiff,
          quizTitle: quiz.quiz_title,
          codeSnippet: targetQuestion.code_snippet,
          explanation: targetQuestion.explanation,
          correctAnswer: targetQuestion.correct_answer,
          isAnswerChecked: isCheckedNow,
          persona,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success && data.concept) {
        setConceptSummaries((prev) => ({
          ...prev,
          [qId]: {
            ...data.concept,
            generatedPostAnswer: isCheckedNow,
          },
        }));
      } else {
        throw new Error(data.error || 'Fallback concept summary');
      }
    } catch {
      setConceptSummaries((prev) => ({
        ...prev,
        [qId]: {
          conceptTitle: `${qTopic} — Simplified Concept`,
          simplifiedSummary: targetQuestion.explanation
            ? `In plain terms, this question focuses on ${qTopic.toLowerCase()}. ${
                isCheckedNow
                  ? targetQuestion.explanation
                  : 'Identify the primary rule connecting the scenario in the question to the core mechanism.'
              }`
            : `This question explores the foundational principles of ${qTopic}. Break the stem down into what is changing and what rule governs that change.`,
          realWorldAnalogy: `Think of ${qTopic.toLowerCase()} like a blueprint: when the foundational rule is respected, the whole system works predictably.`,
          keyPrinciple: isCheckedNow
            ? `Key Rule: "${targetQuestion.correct_answer}" directly satisfies the core mechanism of ${qTopic}.`
            : `Focus on the underlying cause-and-effect relationship in ${qTopic} rather than surface wording.`,
          generatedPostAnswer: isCheckedNow,
        },
      }));
    } finally {
      setIsGeneratingConcept(false);
    }
  };

  const handleSaveConceptToMyNotes = (targetQuestion: Question = currentQuestion) => {
    const summary = conceptSummaries[targetQuestion.id];
    if (!summary) return;
    soundFx.playComplete();
    const qTopic = inferQuestionTopic(targetQuestion, quiz.quiz_title);
    saveTakeawayNote({
      oneLineTakeaway: `AI Tutor (${summary.conceptTitle}): ${summary.simplifiedSummary} [Key Rule: ${summary.keyPrinciple}]`,
      topic: qTopic,
      quizTitle: quiz.quiz_title,
    });
    setSavedConceptToNotes((prev) => ({ ...prev, [targetQuestion.id]: true }));
  };

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

      // Ctrl+Enter (or Cmd+Enter) submits or moves next; Enter alone moves downwards
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
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

      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        if (activeTag === 'TEXTAREA') {
          // Allow default Enter behavior in textarea (moves downwards to new line)
          return;
        }
        if (
          !isAnswerChecked &&
          currentQuestion.options &&
          currentQuestion.options.length > 0
        ) {
          e.preventDefault();
          const opts = currentQuestion.options;
          const curIdx = selectedOption ? opts.indexOf(selectedOption) : -1;
          const nextIdx = (curIdx + 1) % opts.length;
          setSelectedOption(opts[nextIdx]);
          soundFx.playClick();
          return;
        }
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

  // Calculate speed multiplier based on remaining time in Challenge Mode (requires >=1.2s genuine reading dwell & no hint)
  const calculateSpeedMultiplier = (): number => {
    if (!isChallengeMode || showHint) return 1.0;
    const dwellMs = Date.now() - questionShownAtRef.current;
    if (dwellMs < 1200) return 1.0; // Prevent instant button-mash speed farming
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
      // Apply Hint Cost Multiplier (1.0x for 0 hints, 0.85x for 1 hint, 0.70x for 2 hints) — NEVER blocks mastery!
      const hintUsageNow = getHintUsageForQuestion(currentQuestion);
      const hintMultiplier = hintUsageNow.pointMultiplier ?? 1.0;
      const speedFactor = isChallengeMode
        ? Math.max(0.5, questionTimeRemaining / questionTimeLimit)
        : 0.88;
      let rawArcadePts =
        Math.round((600 + 400 * speedFactor) * hintMultiplier) +
        Math.min(500, (nextStreak - 1) * 100);
      if (doublePointsArmed) {
        rawArcadePts *= 2;
        setDoublePointsArmed(false);
        setDoublePointsUsed(true);
      }
      setLastPointsEarned(rawArcadePts);
      setKahootArcadePoints((prev) => prev + rawArcadePts);

      if (nextStreak >= 3) {
        soundFx.playKahootStreakFire();
        soundFx.playCorrect(nextStreak);
      } else if (isChallengeMode) {
        multiplier = calculateSpeedMultiplier();
        setSpeedMultipliers((prev) => ({
          ...prev,
          [currentQuestion.id]: multiplier,
        }));
        setLastSpeedMultiplier(multiplier);

        if (multiplier >= 2.0) {
          soundFx.playSpeedBonus();
          soundFx.playCorrect(nextStreak);
        } else {
          soundFx.playCorrect(nextStreak);
        }
      } else {
        soundFx.playCorrect(nextStreak);
      }
    } else {
      soundFx.playIncorrect(kahootStreak);
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

    // Track player's recent accuracy per topic & adjust difficulty automatically (target: 70-80%)
    // Note: Using a hint NEVER blocks mastery credit!
    const adaptResult = recordTopicAttemptAndAdaptDifficulty(
      currentQuestionTopic,
      isCorrect,
      activeAdaptiveDifficulty,
      isSpeedRoundMode
    );
    setActiveAdaptiveDifficulty(adaptResult.nextDifficulty);
    setTopicAccuracyPercent(adaptResult.topicAccuracyPercent);
    if (adaptResult.adjustmentReason) {
      setAdaptiveStepBanner(adaptResult.adjustmentReason);
    }

    // Track daily practice goals (minutes & questions) + Streak Freeze progress
    recordDailyPracticeMinutesAndQuestions(0.5, 1);

    if (!isCorrect) {
      // 0. Track Mistake Pattern Detection (which wrong answer was chosen & which concept pair is confused)
      recordWrongAnswerChoice(currentQuestion, submitted);
      // 1. Add missed question to the Review Pile so it resurfaces later in the session
      setReviewPile((prev) => {
        if (prev.some((item) => item.id === currentQuestion.id)) return prev;
        return [...prev, currentQuestion];
      });
      // 2. Generate a similar follow-up question (same concept, different wording)
      setActiveFollowUpQuestion(generateFollowUpQuestion(currentQuestion));
      setFollowUpSelectedOption(null);
      setFollowUpChecked(false);
      setFollowUpCorrect(false);
      // 3. Track repeated misses for the "Explain in your own words" reflection hook
      const missCountNow = recordQuestionMiss(currentQuestion);
      setCurrentMissCount(missCountNow);
    }

    if (isCorrect && autoNextOnCorrect) {
      setTimeout(() => {
        if (currentIndex + 1 < sessionQuestions.length) {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 1450);
    }
  };

  // Handle checking the Follow-Up Question (Same Concept, Different Wording)
  const handleCheckFollowUpAnswer = () => {
    if (!activeFollowUpQuestion || !followUpSelectedOption || followUpChecked) return;
    const isRight =
      followUpSelectedOption.trim().toLowerCase() ===
      activeFollowUpQuestion.correct_answer.trim().toLowerCase();
    setFollowUpChecked(true);
    setFollowUpCorrect(isRight);
    if (isRight) {
      soundFx.playCorrect();
      recordFixedMistakeInProfile(1);
      setFixedQuestionIds((prev) =>
        prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
      );
      onUpdateStats({
        fixedMistakesCount: (stats.fixedMistakesCount || 0) + 1,
      });
    } else {
      soundFx.playClick();
    }
  };

  // Handle checking a resurfaced question in the Review Pile
  const handleCheckReviewPileAnswer = () => {
    const activeReviewQ = reviewPile[0];
    if (!activeReviewQ || !reviewPileSelectedOption || reviewPileChecked) return;
    const isRight =
      reviewPileSelectedOption.trim().toLowerCase() ===
      activeReviewQ.correct_answer.trim().toLowerCase();
    setReviewPileChecked(true);
    setReviewPileCorrect(isRight);
    if (isRight) {
      soundFx.playCorrect();
      recordFixedMistakeInProfile(1);
      setFixedQuestionIds((prev) =>
        prev.includes(activeReviewQ.id) ? prev : [...prev, activeReviewQ.id]
      );
      onUpdateStats({
        fixedMistakesCount: (stats.fixedMistakesCount || 0) + 1,
      });
    } else {
      soundFx.playClick();
    }
  };

  const handleAdvanceReviewPile = () => {
    soundFx.playClick();
    if (reviewPileCorrect) {
      const remaining = reviewPile.slice(1);
      setReviewPile(remaining);
      setReviewPileSelectedOption(null);
      setReviewPileChecked(false);
      setReviewPileCorrect(false);
      if (remaining.length === 0) {
        setIsReviewingPileMode(false);
      }
    } else {
      // Rotate to back of Review Pile so learner gets another encouraging shot
      const [first, ...rest] = reviewPile;
      setReviewPile([...rest, first]);
      setReviewPileSelectedOption(null);
      setReviewPileChecked(false);
      setReviewPileCorrect(false);
    }
  };

  const handleSaveInlineOwnWords = () => {
    if (!ownWordsText.trim()) return;
    soundFx.playComplete();
    saveTakeawayNote({
      oneLineTakeaway: `My Explanation (${currentQuestionTopic}): ${ownWordsText.trim()}`,
      topic: currentQuestionTopic,
      quizTitle: quiz.quiz_title,
      ownWordsExplanations: [
        {
          questionId: currentQuestion.id,
          questionText: currentQuestion.question,
          userExplanation: ownWordsText.trim(),
          correctAnswer: currentQuestion.correct_answer,
        },
      ],
    });
    setOwnWordsSaved(true);
  };

  const handleJumpToQuestion = (index: number) => {
    soundFx.playClick();
    setIsReviewingPileMode(false);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    soundFx.playClick();
    // Resurface Review Pile every 3 questions or before finishing the session!
    if (
      reviewPile.length > 0 &&
      !isReviewingPileMode &&
      (currentIndex + 1 >= sessionQuestions.length || (currentIndex + 1) % 3 === 0)
    ) {
      setIsReviewingPileMode(true);
      setReviewPileSelectedOption(null);
      setReviewPileChecked(false);
      setReviewPileCorrect(false);
      return;
    }

    if (currentIndex + 1 < sessionQuestions.length) {
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
    
    // Effort-gated XP calculation: 0 correct answers = 0 XP
    // Hints slightly reduce points (0.85x for 1 hint, 0.70x for 2 hints) while keeping 100% mastery credit intact
    let xpEarned = 0;
    if (totalCorrect > 0) {
      answersArray.forEach((a) => {
        if (a.isCorrect) {
          const qObj = sessionQuestions.find((sq) => sq.id === a.questionId) || quiz.questions[0];
          const hintMult = getHintUsageForQuestion(qObj).pointMultiplier ?? 1.0;
          const speedMult = isChallengeMode ? speedMultipliers[a.questionId] || 1.0 : 1.0;
          xpEarned += Math.round(20 * hintMult * speedMult);
        }
      });

      if (isInTargetTimeRange && totalCorrect / Math.max(1, total) >= 0.6) {
        xpEarned = Math.round(xpEarned * 1.25);
      }
    }

    const gemsEarned = totalCorrect > 0 ? (isChallengeMode ? totalCorrect * 3 : totalCorrect * 2) : 0;

    recordConsistentPracticeSession({
      isInterleaved: isInterleavedMode,
      isSpeedRound: isSpeedRoundMode,
      accuracyPercent: Math.round((totalCorrect / Math.max(1, total)) * 100),
      fixedInSessionCount: fixedQuestionIds.length,
    });

    // Check if this session was a Daily Challenge or a Topic Boss Challenge
    if (quiz.tags?.includes('#DailyChallenge')) {
      recordDailyChallengeCompletion(totalCorrect, total);
    }
    if (quiz.tags?.includes('#BossChallenge') && totalCorrect / Math.max(1, total) >= 0.6) {
      const bossTag = quiz.tags.find((t) => t.startsWith('#BossTopic_'));
      const bossTopic = bossTag
        ? bossTag.replace('#BossTopic_', '')
        : inferQuestionTopic(sessionQuestions[0] || quiz.questions[0], quiz.quiz_title);
      recordBossChallengePassed(bossTopic);
    }

    onFinishQuiz({
      quiz: {
        ...quiz,
        examFormat: activeExamFormat || quiz.examFormat,
        questions: sessionQuestions,
      },
      answers: answersArray,
      score: totalCorrect,
      total,
      xpEarned,
      gemsEarned,
      timeSpentSeconds: secondsElapsed,
      flaggedIds: Array.from(flaggedIds),
      fixedQuestionIds,
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
        <div className="comic-panel-sm sticky top-4 z-40 w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
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
        <div className="comic-panel pattern-halftone bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 transition-colors">
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
                updateFontSizeScale(
                  fontSizeScale === 'xlarge' ? 'large' : fontSizeScale === 'large' ? 'normal' : 'normal'
                );
              }}
              className="px-2 py-1 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              title="Decrease Font Size (Persisted)"
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
                updateFontSizeScale(
                  fontSizeScale === 'normal' ? 'large' : fontSizeScale === 'large' ? 'xlarge' : 'xlarge'
                );
              }}
              className="px-2 py-1 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
              title="Increase Font Size (Persisted)"
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

          {/* Overall Time Counter + Interactive Time Range Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowTimeRangePopover((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all ${
                isTimedExam && totalTimeLimitSecs - secondsElapsed <= 60
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                  : isInTargetTimeRange
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
              title="Click to configure Quiz Time Range (Min – Max Target Window)"
            >
              <Clock className={`w-3.5 h-3.5 ${isInTargetTimeRange ? 'text-emerald-500' : 'text-indigo-500'}`} />
              <span>
                {liveTimeRangeEnabled
                  ? `${formatSeconds(secondsElapsed)} / ${liveMinMinutes}m–${liveMaxMinutes}m`
                  : isTimedExam
                  ? `${formatSeconds(Math.max(0, totalTimeLimitSecs - secondsElapsed))} left`
                  : formatSeconds(secondsElapsed)}
              </span>
              {isInTargetTimeRange && (
                <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-sans font-black uppercase">
                  +35% XP Zone
                </span>
              )}
            </button>

            {showTimeRangePopover && (
              <div className="absolute right-0 top-11 z-50 w-72 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      ⏱️ Quiz Time Range
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Finish inside the Min–Max window for +35% XP!
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setLiveTimeRangeEnabled((prev) => !prev);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer ${
                      liveTimeRangeEnabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {liveTimeRangeEnabled ? 'Range: ON' : 'Range: OFF'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: '⚡ 1–3m', min: 1, max: 3 },
                    { label: '🎯 3–10m', min: 3, max: 10 },
                    { label: '🏛️ 10–25m', min: 10, max: 25 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setLiveTimeRangeEnabled(true);
                        setLiveMinMinutes(p.min);
                        setLiveMaxMinutes(p.max);
                        setShowTimeRangePopover(false);
                      }}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-black cursor-pointer ${
                        liveTimeRangeEnabled && liveMinMinutes === p.min && liveMaxMinutes === p.max
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {liveTimeRangeEnabled && (
                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>Min Target Time</span>
                        <span className="font-mono font-black text-emerald-600">{liveMinMinutes} min</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={liveMinMinutes}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setLiveMinMinutes(v);
                          if (liveMaxMinutes <= v) setLiveMaxMinutes(v + 2);
                        }}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>Max Cutoff Time</span>
                        <span className="font-mono font-black text-indigo-600">{liveMaxMinutes} min</span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={60}
                        value={liveMaxMinutes}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setLiveMaxMinutes(v);
                          if (liveMinMinutes >= v) setLiveMinMinutes(Math.max(1, v - 1));
                        }}
                        className="w-full accent-indigo-600 cursor-pointer h-1.5"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setLiveMaxMinutes((prev) => prev + 2);
                    }}
                    className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    +2 Min Extra Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTimeRangePopover(false)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>{answeredCount}/{quiz.questions.length}</span>
          </div>
        </div>
      </div>
    )}

      {/* Live Quiz Time Range Progress Bar (Displays when Time Range is active) */}
      {liveTimeRangeEnabled && totalTimeLimitSecs > 0 && (
        <div className="comic-panel-sm bg-white/95 dark:bg-slate-900/95 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
              ⏱️ Time Range: {liveMinMinutes}m – {liveMaxMinutes}m
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {secondsElapsed < minRangeSecs
                ? `Warm-Up Pace (${formatSeconds(minRangeSecs - secondsElapsed)} until Gold Target Window)`
                : isInTargetTimeRange
                ? `🎯 In Gold Target Range! Finish within ${formatSeconds(Math.max(0, totalTimeLimitSecs - secondsElapsed))} for +35% XP!`
                : 'Time limit reached'}
            </span>
          </div>

          <div className="relative w-full sm:w-64 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/70 dark:border-slate-700">
            {/* Highlight Gold Target Zone between Min and Max */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/20 border-l-2 border-emerald-500"
              style={{
                left: `${Math.min(95, Math.round((minRangeSecs / Math.max(1, totalTimeLimitSecs)) * 100))}%`,
                right: '0%',
              }}
              title={`Target Window: ${liveMinMinutes}m to ${liveMaxMinutes}m`}
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalTimeLimitSecs - secondsElapsed <= 60
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : isInTargetTimeRange
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{
                width: `${Math.min(100, Math.round((secondsElapsed / Math.max(1, totalTimeLimitSecs)) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Official Standardized Exam Mode HUD Banner (Checkpoint, WAEC, JAMB, NECO, IGCSE, SAT, AP/IB) */}
      {!isDistractionFree && (
        <div
          className={`comic-panel-sm rounded-2xl px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-all ${
            isExamModeActive
              ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-slate-950'
              : 'bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                if (activeExamFormat) {
                  setActiveExamFormat(undefined);
                } else {
                  setActiveExamFormat(assessmentConfig.examFormat || 'waec');
                }
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                isExamModeActive
                  ? 'bg-amber-300 text-slate-950 border-slate-950 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
              title="Toggle Official Exam Board Mode (Checkpoint, WAEC, JAMB, IGCSE, SAT)"
            >
              <span>🎓</span>
              <span>{isExamModeActive ? `Exam Mode: ${activeExamSpec.shortName}` : 'Enable Exam Mode'}</span>
            </button>

            <div className="flex flex-wrap items-center gap-1">
              {EXAM_FORMAT_CATALOG.slice(0, 7).map((fmt) => {
                const isSelected = activeExamFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setActiveExamFormat(fmt.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500 text-white border border-indigo-300 shadow-2xs font-black'
                        : isExamModeActive
                        ? 'bg-white/10 hover:bg-white/20 text-indigo-100'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300'
                    }`}
                    title={`${fmt.fullName} (${fmt.gradingScaleLabel})`}
                  >
                    {fmt.badgeEmoji} {fmt.shortName.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {isExamModeActive && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-indigo-200 font-bold">
                {activeExamSpec.paperStructure}
              </span>
              {(() => {
                const correctSoFar = Object.values(userAnswers).filter((a) => a.checked && a.isCorrect).length;
                const livePct = answeredCount > 0 ? Math.round((correctSoFar / answeredCount) * 100) : 100;
                const boardStanding = evaluateExamBoardGrade(activeExamFormat, livePct);
                return (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black tabular-nums">
                    Standing: {boardStanding.gradeBadge}
                  </span>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Main Assessment Layout Grid (Question Jumper Palette + Active Question Canvas) */}
      <div className={`grid ${isDistractionFree ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1 lg:grid-cols-12'} gap-4 items-start`}>
        {/* Left/Sidebar: Question Matrix & Classification Jumper (3 cols) - Hidden in Focus / Zen Mode */}
        {!isDistractionFree && (
          <div className="lg:col-span-3 space-y-3">
            <div className="comic-panel-sm bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3 transition-colors">
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
              <div className="comic-panel bg-white dark:bg-slate-900 rounded-3xl p-4 space-y-2 animate-in fade-in duration-200">
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
          {/* Multi-Feature Study & Interactive Mode Switcher Bar */}
          {!isDistractionFree && (
            <div className="comic-panel-sm bg-white dark:bg-slate-900 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setShowStudyGuidePanel(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    !showStudyGuidePanel
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Interactive Quiz ({quiz.questions.length} Qs)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setIsFlashcardModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>3D Flashcards</span>
                </button>

                {quiz.study_guide && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setShowStudyGuidePanel((prev) => !prev);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      showStudyGuidePanel
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{showStudyGuidePanel ? 'Hide Study Guide' : 'AI Study Guide & Vocab'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onOpenTutor(currentQuestion);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>1-on-1 AI Tutor</span>
                </button>

                {/* Interleaving Mode Toggle (Mixes questions from different topics) */}
                <button
                  type="button"
                  onClick={handleToggleInterleavedMode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    isInterleavedMode
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                      : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100'
                  }`}
                  title="Mixes questions from different topics instead of grouping them by topic"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isInterleavedMode ? 'Interleaved Mix: ON' : 'Interleave Topics'}</span>
                </button>

                {/* Review Pile Button (Collects missed questions & resurfaces them) */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    if (reviewPile.length > 0) {
                      setIsReviewingPileMode((prev) => !prev);
                      setReviewPileSelectedOption(null);
                      setReviewPileChecked(false);
                      setReviewPileCorrect(false);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    isReviewingPileMode
                      ? 'bg-amber-400 text-slate-950 border-slate-950 shadow-xs'
                      : reviewPile.length > 0
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-400 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Review Pile collects missed questions and resurfaces them later in the session"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Review Pile ({reviewPile.length})</span>
                  {fixedQuestionIds.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black">
                      {fixedQuestionIds.length} Fixed
                    </span>
                  )}
                </button>

                {/* Optional Speed Round Mode Toggle (Separate from Mastery) */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsSpeedRoundMode((prev) => !prev);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    isSpeedRoundMode
                      ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                  title="Optional Speed Round timer — does not affect your topic mastery levels"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{isSpeedRoundMode ? 'Speed Round: ON (Mastery Safe)' : 'Optional Speed Round'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Adaptive Difficulty Sweet Spot Indicator (Target: 70-80%) */}
                <span
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5"
                  title="Adaptive Difficulty tracks recent accuracy per topic and steps up/down to keep accuracy around 70-80%"
                >
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Adaptive: {activeAdaptiveDifficulty}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-mono">
                    {topicAccuracyPercent}% (70-80% Zone)
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsWorksheetModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
                  title="Open Printable Exam Paper & Mark Scheme"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Exam Paper / PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* Adaptive Difficulty Step-Up / Step-Down Notification Banner */}
          {adaptiveStepBanner && (
            <div className="comic-panel-sm rounded-2xl p-3.5 bg-gradient-to-r from-indigo-50 via-emerald-50 to-amber-50 dark:from-indigo-950/50 dark:via-emerald-950/30 dark:to-slate-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-xs font-black text-slate-900 dark:text-white">
                <span className="px-2 py-0.5 rounded bg-amber-300 text-slate-950 border border-slate-950 text-[10px] uppercase">
                  70–80% Sweet Spot
                </span>
                <span>{adaptiveStepBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setAdaptiveStepBanner(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
              >
                Dismiss ✕
              </button>
            </div>
          )}

          {/* Resurfaced Review Pile Stage (Collects missed questions & resurfaces them later in the session) */}
          {isReviewingPileMode && reviewPile.length > 0 && (
            <div className="comic-panel pattern-halftone rounded-3xl bg-gradient-to-br from-amber-50/95 via-white to-indigo-50/80 dark:from-slate-900 dark:via-indigo-950/40 dark:to-amber-950/20 p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-slate-900 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
                    🔄 REVIEW PILE RESURFACED ({reviewPile.length} LEFT)
                  </span>
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                    Second-Chance Mastery • Fixing a Missed Concept!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewingPileMode(false)}
                  className="text-xs font-extrabold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Return to Main Flow →
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 text-[11px] font-black">
                    Topic: {inferQuestionTopic(reviewPile[0], quiz.quiz_title)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[11px] font-black">
                    Difficulty: {inferQuestionDifficulty(reviewPile[0], 0, quiz.difficulty)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug flex-1">
                    {reviewPile[0].question}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleExplainConcept(reviewPile[0])}
                    disabled={isGeneratingConcept}
                    className="comic-panel-sm shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-slate-950 text-xs font-black transition-all cursor-pointer"
                    title="Ask AI Tutor to generate a simplified 'Explain this Concept' summary for this question"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Explain this Concept</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    reviewPile[0].options || [
                      reviewPile[0].correct_answer,
                      'Alternative concept distractor',
                      'Secondary edge case',
                      'None of the above',
                    ]
                  ).map((opt, idx) => {
                    const isPicked = reviewPileSelectedOption === opt;
                    const isRightOpt =
                      opt.trim().toLowerCase() ===
                      reviewPile[0].correct_answer.trim().toLowerCase();
                    let style =
                      'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white';
                    if (reviewPileChecked) {
                      if (isRightOpt) {
                        style =
                          'bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-600 text-emerald-950 dark:text-emerald-100 font-black';
                      } else if (isPicked) {
                        style =
                          'bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-500 text-amber-950 dark:text-amber-100';
                      }
                    } else if (isPicked) {
                      style =
                        'bg-indigo-50 dark:bg-indigo-950/80 border-2 border-indigo-600 text-indigo-950 dark:text-white font-black';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={reviewPileChecked}
                        onClick={() => {
                          soundFx.playClick();
                          setReviewPileSelectedOption(opt);
                        }}
                        className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 ${style}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-mono font-black flex items-center justify-center shrink-0">
                          {['A', 'B', 'C', 'D'][idx] || idx + 1}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {reviewPileChecked && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
                    <div className="font-black text-emerald-900 dark:text-emerald-200">
                      {reviewPileCorrect
                        ? '🎉 Mistake Fixed! You mastered this resurfaced question and removed it from your Review Pile!'
                        : `🌱 Almost there! The target answer is "${reviewPile[0].correct_answer}". We'll keep it in your Review Pile for one more look!`}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{reviewPile[0].explanation}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  {!reviewPileChecked ? (
                    <button
                      type="button"
                      disabled={!reviewPileSelectedOption}
                      onClick={handleCheckReviewPileAnswer}
                      className="comic-panel-sm px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-black cursor-pointer"
                    >
                      Check Resurfaced Question
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAdvanceReviewPile}
                      className="comic-panel-sm px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
                    >
                      {reviewPileCorrect && reviewPile.length === 1
                        ? 'Review Pile Cleared! Continue Session →'
                        : 'Next in Review Pile →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Collapsible AI Study Guide & Core Vocabulary Panel */}
          {showStudyGuidePanel && quiz.study_guide && (
            <div className="comic-panel-sm bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    AI Study Guide & Core Vocabulary — {quiz.quiz_title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStudyGuidePanel(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              {quiz.study_guide.key_takeaways && quiz.study_guide.key_takeaways.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Key Takeaways
                  </span>
                  <ul className="space-y-1.5">
                    {quiz.study_guide.key_takeaways.map((kt, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{kt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {quiz.study_guide.core_vocabulary && quiz.study_guide.core_vocabulary.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Essential Vocabulary
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quiz.study_guide.core_vocabulary.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-xs"
                      >
                        <span className="font-black text-indigo-600 dark:text-indigo-400 block">{v.term}</span>
                        <span className="text-slate-600 dark:text-slate-300">{v.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="comic-panel comic-pop-card bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 space-y-4 transition-colors relative overflow-hidden">
            {/* Neo-Comic Top Accent Pattern Ribbon */}
            <div className="pattern-speed-stripes -mx-5 sm:-mx-7 -mt-5 sm:-mt-7 mb-4 px-5 sm:px-7 py-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border-b-2 border-slate-900 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="comic-badge comic-badge-tilt-left px-2.5 py-0.5 rounded-md bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  PANEL #{currentIndex + 1}
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                  Interactive Comic Challenge Stage
                </span>
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                {currentQuestion.type.replace('_', ' ')}
              </span>
            </div>

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
                  {currentQuestionTopic}
                </span>

                {/* Explicit Question Difficulty Level Tag */}
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                    currentQuestionDifficulty === 'Master'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      : currentQuestionDifficulty === 'Intermediate'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  Difficulty: {currentQuestionDifficulty}
                </span>

                {isSpeedRoundMode && (
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
                    ⚡ Speed Round (Does Not Affect Mastery)
                  </span>
                )}

                {/* Bloom's Level */}
                {currentQuestion.bloom_level && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Level: {currentQuestion.bloom_level}
                  </span>
                )}

                {/* Points (Reflects Hint Cost Multiplier if Hints Used) */}
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {Math.round((currentQuestion.points || 20) * (currentHintUsage?.pointMultiplier ?? 1.0))} pts
                  {currentHintUsage && currentHintUsage.hintsUsedCount > 0
                    ? ` (${currentHintUsage.hintsUsedCount}/2 Hints • Mastery Safe)`
                    : ''}
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

            {/* Question Text + Next-to-Question 'Explain this Concept' AI Tutor Button */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <h3
                  className={`font-black text-slate-900 dark:text-white leading-snug tracking-tight flex-1 ${
                    fontSizeScale === 'xlarge'
                      ? 'text-2xl sm:text-3xl'
                      : fontSizeScale === 'large'
                      ? 'text-xl sm:text-2xl'
                      : 'text-lg sm:text-xl'
                  }`}
                >
                  {currentQuestion.question}
                </h3>

                <button
                  type="button"
                  onClick={() => handleExplainConcept(currentQuestion)}
                  disabled={isGeneratingConcept}
                  className={`comic-panel-sm shrink-0 self-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    showConceptCard
                      ? 'bg-amber-300 text-slate-950 border-2 border-slate-950'
                      : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white border-2 border-slate-950'
                  }`}
                  title="Call the AI Tutor to generate a simplified 'Explain this Concept' summary specific to this question"
                >
                  {isGeneratingConcept ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Explaining Concept...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{showConceptCard ? 'Hide Concept Summary' : 'Explain this Concept'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Tutor 'Explain this Concept' Simplified Summary Panel */}
              {showConceptCard && (
                <div className="comic-panel-sm pattern-halftone rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-indigo-50/95 via-white to-amber-50/85 dark:from-indigo-950/75 dark:via-slate-900 dark:to-violet-950/50 border-2 border-slate-900 dark:border-indigo-400 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <MascotAvatar
                        mood={persona === 'Teacher' ? 'teacher' : 'happy'}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="comic-badge px-2 py-0.5 rounded bg-amber-300 text-slate-950 border border-slate-950 text-[10px] font-black uppercase tracking-wider">
                            🦉 AI TUTOR • EXPLAIN THIS CONCEPT
                          </span>
                          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                            {currentQuestionTopic} ({currentQuestionDifficulty})
                          </span>
                        </div>
                        <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate mt-0.5">
                          {isGeneratingConcept
                            ? 'Synthesizing simplified concept breakdown...'
                            : conceptSummaries[currentQuestion.id]?.conceptTitle ||
                              `${currentQuestionTopic} — Simplified Summary`}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isGeneratingConcept && conceptSummaries[currentQuestion.id] && (
                        <button
                          type="button"
                          onClick={() => handleExplainConcept(currentQuestion, true)}
                          className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
                          title="Regenerate simplified summary"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConceptCard(false)}
                        className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 text-slate-500 hover:text-rose-600 border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
                        title="Close concept summary"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isGeneratingConcept ? (
                    <div className="py-4 flex items-center gap-3 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                      <span>
                        AI Tutor is breaking down this question’s core concept into simple, everyday language...
                      </span>
                    </div>
                  ) : (
                    conceptSummaries[currentQuestion.id] && (
                      <div className="space-y-3 text-xs sm:text-sm">
                        <div className="p-3.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-indigo-800/80 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                            💡 Simplified Concept Summary
                          </span>
                          <p className="text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
                            {conceptSummaries[currentQuestion.id].simplifiedSummary}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                              🧩 Real-World Analogy
                            </span>
                            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                              {conceptSummaries[currentQuestion.id].realWorldAnalogy}
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/80 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                              🎯 Core Rule to Remember
                            </span>
                            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                              {conceptSummaries[currentQuestion.id].keyPrinciple}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveConceptToMyNotes(currentQuestion)}
                              disabled={Boolean(savedConceptToNotes[currentQuestion.id])}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                                savedConceptToNotes[currentQuestion.id]
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>
                                {savedConceptToNotes[currentQuestion.id]
                                  ? '✓ Saved to My Notes'
                                  : 'Save Summary to My Notes'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                const c = conceptSummaries[currentQuestion.id];
                                if (!c) return;
                                speechEngine.speak(
                                  `${c.conceptTitle}. ${c.simplifiedSummary} Analogy: ${c.realWorldAnalogy}. Core rule: ${c.keyPrinciple}`,
                                  { id: `concept_${currentQuestion.id}`, lang: quiz.language }
                                );
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Read Summary Aloud</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              onOpenTutor(currentQuestion);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Ask Follow-Up in AI Tutor Chat →</span>
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

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

            {/* QUESTION INPUT FORMAT: MULTIPLE CHOICE — VIBRANT OFFICIAL & FUN TACTILE TILES */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {currentQuestion.options.map((option, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
                  const isSelected = selectedOption === option;
                  const isEliminated = (eliminatedOptions[currentQuestion.id] || []).includes(option);

                  const badgeColors = [
                    'bg-blue-600 text-white border-blue-800',
                    'bg-emerald-600 text-white border-emerald-800',
                    'bg-amber-400 text-slate-950 border-amber-600',
                    'bg-rose-600 text-white border-rose-800',
                  ];
                  const hoverBorders = [
                    'hover:border-blue-500 dark:hover:border-blue-400',
                    'hover:border-emerald-500 dark:hover:border-emerald-400',
                    'hover:border-amber-500 dark:hover:border-amber-400',
                    'hover:border-rose-500 dark:hover:border-rose-400',
                  ];

                  let optionStyle = `border-2 border-b-[5px] border-slate-200 dark:border-slate-700 border-b-slate-300 dark:border-b-slate-800 bg-white dark:bg-slate-800/95 ${
                    hoverBorders[idx % 4]
                  } text-slate-900 dark:text-white shadow-xs`;

                  if (isEliminated && !isAnswerChecked) {
                    optionStyle =
                      'opacity-45 border-2 border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 text-slate-400 line-through';
                  } else if (isSelected) {
                    optionStyle =
                      'border-2 border-b-[5px] border-indigo-600 dark:border-indigo-400 border-b-indigo-800 dark:border-b-indigo-600 bg-indigo-50/95 dark:bg-indigo-950/70 text-slate-950 dark:text-white ring-2 ring-indigo-500/30 font-extrabold -translate-y-0.5 shadow-md';
                  }

                  if (isAnswerChecked) {
                    if (
                      option.trim().toLowerCase() ===
                      currentQuestion.correct_answer.trim().toLowerCase()
                    ) {
                      optionStyle =
                        'border-2 border-b-[5px] border-emerald-600 dark:border-emerald-500 border-b-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-100 font-black ring-2 ring-emerald-500 shadow-md';
                    } else if (isSelected && !isCurrentCorrect) {
                      optionStyle =
                        'border-2 border-b-[5px] border-rose-500 border-b-rose-700 bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 font-bold';
                    } else {
                      optionStyle =
                        'opacity-45 border-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400';
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
                      key={`${currentQuestion.id}-${idx}`}
                      onClick={() => {
                        if (isAnswerChecked || isEliminated) return;
                        soundFx.playClick();
                        setSelectedOption(option);
                      }}
                      onDoubleClick={() => {
                        if (isAnswerChecked || isEliminated) return;
                        soundFx.playSelect();
                        setSelectedOption(option);
                        handleVoiceDirectCheck(option);
                      }}
                      title="Click to select, or Double-Tap / Double-Click to lock in as your answer"
                      className={`arcade-btn animate-24fps-deal delay-24fps-${(idx % 4) + 1} p-4 rounded-2xl text-left transition-all flex items-center gap-3.5 cursor-pointer ${optionStyle}`}
                    >
                      <span
                        className={`w-10 h-10 rounded-xl font-mono font-black text-sm flex items-center justify-center shrink-0 border-b-3 shadow-xs transition-transform ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-900 scale-105'
                            : badgeColors[idx % 4]
                        }`}
                      >
                        {letter}
                      </span>
                      <span className={`${optSizeClass} font-bold flex-1 leading-snug`}>
                        {option}
                      </span>
                      {!isAnswerChecked && (
                        <button
                          type="button"
                          onClick={(e) => toggleEliminateOption(option, e)}
                          className={`p-1.5 rounded-xl border text-[10px] font-bold transition-colors cursor-pointer shrink-0 ${
                            isEliminated
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 border-slate-200/80 dark:border-slate-700/80'
                          }`}
                          title={isEliminated ? 'Restore option' : 'Cross out / Eliminate distractor'}
                        >
                          <Scissors className="w-3 h-3" />
                        </button>
                      )}
                      <span className="hidden sm:inline-block text-[10px] font-mono font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-200/80 dark:border-slate-600">
                        {idx + 1}
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
                    maxLength={5000}
                    value={fillBlankAnswer}
                    disabled={isAnswerChecked}
                    onChange={(e) => setFillBlankAnswer(e.target.value)}
                    placeholder="Type the exact missing term or phrase (Ctrl+Enter to submit)..."
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                )}
              </div>
            )}

            {/* QUESTION INPUT FORMAT: OPEN EXPLANATION */}
            {currentQuestion.type === 'open_explanation' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <textarea
                    rows={4}
                    maxLength={5000}
                    value={openTextAnswer}
                    disabled={isAnswerChecked}
                    onChange={(e) => setOpenTextAnswer(e.target.value)}
                    placeholder="Explain your reasoning or describe the solution steps in full... (Enter moves downwards, Ctrl+Enter to submit)"
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                    <span>Enter = Move Downwards · Ctrl + Enter = Submit Response</span>
                    <span>{openTextAnswer.length} / 5000 characters</span>
                  </div>
                </div>

                {/* Rubric Guidance — Strictly visible ONLY after the question has been answered */}
                {isAnswerChecked && currentQuestion.rubric && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 animate-in fade-in duration-200">
                    <span className="font-extrabold block mb-1">Post-Answer Evaluation Criteria:</span>
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
                          onDoubleClick={() => {
                            if (isAnswerChecked) return;
                            soundFx.playSelect();
                            setSelectedOption(option);
                            handleVoiceDirectCheck(option);
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

            {/* 2-Step Hints with a Cost Accordion (Up to 2 Hints/Question, Slight Point Reduction, Never Blocks Mastery) */}
            {showHint && (() => {
              const twoStep = generateTwoStepHintsForQuestion(currentQuestion);
              const usage = currentHintUsage || getHintUsageForQuestion(currentQuestion);
              return (
                <div className="comic-panel-sm p-4 rounded-2xl bg-amber-50/95 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-100 text-xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200/80 dark:border-amber-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="font-black uppercase tracking-wider text-[11px] text-amber-900 dark:text-amber-200">
                        💡 Hints With a Cost ({usage.hintsUsedCount}/2 Used on This Question)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-black">
                      🛡️ Never Blocks Mastery Credit • {Math.round(usage.pointMultiplier * 100)}% Point Value
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Hint #1 Card: First Letter & Concept Clue */}
                    <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                          Hint #1: First Letter & Clue
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          -15% pts
                        </span>
                      </div>
                      {usage.hint1Used ? (
                        <p className="font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                          {twoStep.hint1Text}
                        </p>
                      ) : (
                        <button
                          type="button"
                          disabled={isAnswerChecked}
                          onClick={() => handleUnlockHintTier(1)}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-300 hover:bg-amber-400 text-slate-950 font-black text-xs border border-slate-950 transition-all cursor-pointer disabled:opacity-40"
                        >
                          Unlock Hint #1 (First Letter Clue)
                        </button>
                      )}
                    </div>

                    {/* Hint #2 Card: Remove 2 Wrong Options / Structural Pattern */}
                    <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                          Hint #2: Remove 2 Wrong Options
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          -30% pts total
                        </span>
                      </div>
                      {usage.hint2Used ? (
                        <p className="font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                          {twoStep.hint2Text}
                        </p>
                      ) : (
                        <button
                          type="button"
                          disabled={isAnswerChecked}
                          onClick={() => handleUnlockHintTier(2)}
                          className="w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-xs border border-slate-950 transition-all cursor-pointer disabled:opacity-40"
                        >
                          Unlock Hint #2 (Eliminate 2 Options)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Checked Rationale Box with Encouraging Learning Moments, Distractor Breakdown & Follow-Up Question */}
            {isAnswerChecked && (() => {
              const submittedAns = userAnswers[currentQuestion.id]?.userAnswer || '';
              const detailedExp = getDetailedAnswerExplanation(
                currentQuestion,
                submittedAns,
                isCurrentCorrect
              );
              const encouragingCopy = getEncouragingFeedbackCopy(currentQuestion.id);

              return (
                <div
                  className={`comic-panel-sm p-5 rounded-3xl animate-in fade-in duration-200 space-y-4 ${
                    isCurrentCorrect
                      ? 'bg-emerald-50/85 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                      : 'bg-amber-50/90 dark:bg-indigo-950/40 border-amber-300 dark:border-indigo-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <MascotAvatar
                      mood={isCurrentCorrect ? (stats.streak > 2 ? 'streak' : 'happy') : 'encourage'}
                      size="sm"
                    />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        {isCurrentCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />
                        )}
                        <h4 className="font-black text-sm sm:text-base tracking-tight">
                          {isCurrentCorrect
                            ? currentQuestion.gamified_feedback?.success_quote ||
                              'Spark on! Correct! Nicely done.'
                            : encouragingCopy.headline}
                        </h4>
                        {isCurrentCorrect && lastPointsEarned > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-600 text-white shadow-2xs">
                            +{lastPointsEarned.toLocaleString()} pts
                          </span>
                        )}
                        {!isCurrentCorrect && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-300 text-slate-950 border border-slate-950">
                            📚 Added to Review Pile
                          </span>
                        )}
                        {streakSavedBanner && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                            🛡️ Streak Shield Saved Your {kahootStreak}x Streak!
                          </span>
                        )}
                      </div>

                      {!isCurrentCorrect && (
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          {encouragingCopy.subtext}
                        </p>
                      )}

                      {/* 1. Why the Chosen Option Was Incorrect (Shown on Wrong Answers) */}
                      {!isCurrentCorrect && detailedExp.whyChosenWasIncorrect && (
                        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/80 border-2 border-amber-300 dark:border-amber-700/80 text-xs space-y-1">
                          <span className="font-black uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-300 block">
                            🔍 Why Your Choice (“{submittedAns}”) Didn’t Fit:
                          </span>
                          <p className="text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">
                            {detailedExp.whyChosenWasIncorrect}
                          </p>
                        </div>
                      )}

                      {/* 2. Why the Correct Answer Is Right (Shown After Every Answer) */}
                      <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/80 border-2 border-emerald-300 dark:border-emerald-700/80 text-xs space-y-1">
                        <span className="font-black uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-300 block">
                          ✓ Why “{currentQuestion.correct_answer}” Is Right:
                        </span>
                        <p className="text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">
                          {detailedExp.whyCorrectIsRight}
                        </p>
                      </div>
                    </div>
                  </div>

                  {currentQuestion.pedagogy_note && (
                    <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <span className="font-extrabold">Study Tip:</span> {currentQuestion.pedagogy_note}
                    </p>
                  )}

                  {/* 3. Similar Follow-Up Question (Same Concept, Different Wording) After a Miss */}
                  {!isCurrentCorrect && activeFollowUpQuestion && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="comic-badge px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black uppercase">
                            FOLLOW-UP PRACTICE
                          </span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            Try a Similar Question (Same Concept, Fresh Wording)
                          </span>
                        </div>
                        {followUpChecked && followUpCorrect && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-black">
                            🌟 Concept Redeemed! (+1 Fixed Mistake)
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                        {activeFollowUpQuestion.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(activeFollowUpQuestion.options || []).map((opt, idx) => {
                          const isPicked = followUpSelectedOption === opt;
                          const isRight =
                            opt.trim().toLowerCase() ===
                            activeFollowUpQuestion.correct_answer.trim().toLowerCase();
                          let btnCls =
                            'bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
                          if (followUpChecked) {
                            if (isRight) {
                              btnCls =
                                'bg-emerald-100 dark:bg-emerald-950/70 border-2 border-emerald-600 text-emerald-950 dark:text-emerald-100 font-black';
                            } else if (isPicked) {
                              btnCls =
                                'bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-500 text-amber-950 dark:text-amber-100';
                            }
                          } else if (isPicked) {
                            btnCls =
                              'bg-indigo-50 dark:bg-indigo-950/70 border-2 border-indigo-600 text-indigo-950 dark:text-white font-black';
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={followUpChecked}
                              onClick={() => {
                                soundFx.playClick();
                                setFollowUpSelectedOption(opt);
                              }}
                              className={`p-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${btnCls}`}
                            >
                              <span className="w-5 h-5 rounded bg-slate-900 text-white text-[10px] font-mono font-black flex items-center justify-center shrink-0">
                                {['A', 'B', 'C', 'D'][idx] || idx + 1}
                              </span>
                              <span className="flex-1">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {!followUpChecked ? (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={!followUpSelectedOption}
                            onClick={handleCheckFollowUpAnswer}
                            className="comic-panel-sm px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-black cursor-pointer"
                          >
                            Check Follow-Up Answer
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {followUpCorrect
                            ? activeFollowUpQuestion.explanation
                            : `Good effort! The target concept is "${activeFollowUpQuestion.correct_answer}". You'll get another friendly look in your Review Pile!`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 4. Optional "Explain It In Your Own Words" Prompt for Missed / Repeatedly Missed Questions */}
                  {!isCurrentCorrect && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-800 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                          🧠 Optional Reflection: Explain It In Your Own Words
                          {currentMissCount > 1 ? ` (Missed ${currentMissCount}x)` : ''}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Saves directly to your “My Notes” screen
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={ownWordsText}
                          disabled={ownWordsSaved}
                          onChange={(e) => setOwnWordsText(e.target.value)}
                          placeholder="In one sentence, how would you explain why the right answer works?"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={!ownWordsText.trim() || ownWordsSaved}
                          onClick={handleSaveInlineOwnWords}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer disabled:opacity-40 shrink-0 ${
                            ownWordsSaved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {ownWordsSaved ? '✓ Saved to My Notes' : 'Save Reflection'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Bottom Assessment Control Deck */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 transition-colors">
            {/* Left Tools: Hint & AI Tutor Consultation */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (!showHint && (!currentHintUsage || currentHintUsage.hintsUsedCount === 0)) {
                    handleUnlockHintTier(1);
                  } else {
                    soundFx.playHint();
                    setShowHint(!showHint);
                  }
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-extrabold hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  {showHint
                    ? `Hints (${currentHintUsage?.hintsUsedCount || 0}/2 Used)`
                    : currentHintUsage && currentHintUsage.hintsUsedCount > 0
                    ? `Show Hints (${currentHintUsage.hintsUsedCount}/2)`
                    : 'Use Hint (Max 2)'}
                </span>
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

              <StudyToolsWidget
                calculatorEnabled={
                  quiz.calculatorEnabled ??
                  assessmentConfig.calculatorEnabled ??
                  true
                }
                dictionaryEnabled={
                  quiz.dictionaryEnabled ??
                  assessmentConfig.dictionaryEnabled ??
                  true
                }
              />
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
      {isWorksheetModalOpen && (
        <ExamWorksheetModal
          quiz={quiz}
          isOpen={isWorksheetModalOpen}
          onClose={() => setIsWorksheetModalOpen(false)}
        />
      )}

      {/* 3D Interactive Flashcard Study Deck Modal */}
      {isFlashcardModalOpen && (
        <FlashcardStudyDeck
          quiz={quiz}
          onClose={() => setIsFlashcardModalOpen(false)}
        />
      )}

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

