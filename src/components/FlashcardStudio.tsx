import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Layers,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Volume2,
  Shuffle,
  RotateCcw,
  BookOpen,
  Wand2,
  Download,
  ThumbsUp,
  ThumbsDown,
  Brain,
  X,
  FileText,
  Sliders,
  Check,
  Zap,
  GraduationCap,
} from 'lucide-react';
import { QuizResponse, DifficultyType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { verifyFlashcardMasteryXp } from '../utils/xpIntegrity';
import {
  recordFlashcardSpacedRepetitionReview,
  loadSpacedRepetitionSchedule,
  SpacedRepetitionItem,
  recordDailyPracticeMinutesAndQuestions,
} from '../utils/adaptiveLearningEngine';

export interface FlashcardItem {
  id: number;
  front: string;
  back: string;
  mnemonic?: string;
  detailedExplanation: string;
  category: string;
  difficulty: string;
}

interface FlashcardStudioProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialQuiz?: QuizResponse | null;
  onFlashcardMastered?: (xpDelta: number, gemsDelta?: number) => void;
}

const STARTER_FLASHCARD_TOPICS = [
  { topic: 'Neuroscience & Synaptic Plasticity', count: 8, difficulty: 'Intermediate' as DifficultyType, icon: '🧠' },
  { topic: 'Organic Chemistry Reactions', count: 8, difficulty: 'Advanced' as DifficultyType, icon: '⚗️' },
  { topic: 'JavaScript ES6+ & Async Loop', count: 8, difficulty: 'Intermediate' as DifficultyType, icon: '💻' },
  { topic: 'Cellular Respiration & Krebs Cycle', count: 8, difficulty: 'Intermediate' as DifficultyType, icon: '🔬' },
  { topic: 'Macroeconomics & Monetary Policy', count: 8, difficulty: 'Intermediate' as DifficultyType, icon: '📊' },
  { topic: 'World War II Turning Points', count: 8, difficulty: 'Beginner' as DifficultyType, icon: '🌍' },
];

export const FlashcardStudio: React.FC<FlashcardStudioProps> = ({
  isOpen = true,
  onClose,
  initialQuiz,
  onFlashcardMastered,
}) => {
  // Mode: 'generate' | 'study'
  const [activeMode, setActiveMode] = useState<'generate' | 'study'>(initialQuiz ? 'study' : 'generate');

  // Generator State
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(8);
  const [difficulty, setDifficulty] = useState<DifficultyType>('Intermediate');
  const [focusArea, setFocusArea] = useState<string>('Core Concepts & Key Definitions');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Study Deck State
  const [deckTitle, setDeckTitle] = useState<string>('Spaced Repetition Study Deck');
  const [srScheduleMap, setSrScheduleMap] = useState<Record<string, SpacedRepetitionItem>>(() =>
    loadSpacedRepetitionSchedule()
  );
  const [cards, setCards] = useState<FlashcardItem[]>(() => {
    const srItems = Object.values(loadSpacedRepetitionSchedule());
    if (srItems.length > 0) {
      return srItems.map((sr, idx) => ({
        id: sr.questionId || idx + 1,
        front: sr.questionText,
        back: sr.correctAnswer,
        mnemonic: `Spaced Repetition Box ${sr.box} • Next Review: ${sr.nextReviewDate}`,
        detailedExplanation: sr.explanation,
        category: sr.topic,
        difficulty: 'Intermediate',
      }));
    }
    return [];
  });
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [learningIds, setLearningIds] = useState<Set<number>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'learning' | 'mastered'>('all');
  const [hasFlippedCurrent, setHasFlippedCurrent] = useState<boolean>(false);
  const [integrityToast, setIntegrityToast] = useState<{ ok: boolean; text: string } | null>(null);
  const cardShownAtRef = useRef<number>(Date.now());

  useEffect(() => {
    cardShownAtRef.current = Date.now();
    setHasFlippedCurrent(false);
  }, [currentIndex, activeMode]);

  // Initialize from initial quiz if supplied
  useEffect(() => {
    if (initialQuiz && initialQuiz.questions && initialQuiz.questions.length > 0) {
      const converted: FlashcardItem[] = initialQuiz.questions.map((q, idx) => ({
        id: q.id || idx + 1,
        front: q.question,
        back: q.correct_answer,
        mnemonic: q.hint ? `Tip: ${q.hint}` : undefined,
        detailedExplanation: q.explanation || 'Review question breakdown and rationale.',
        category: q.cognitive_domain || 'Knowledge',
        difficulty: initialQuiz.difficulty || 'Intermediate',
      }));
      setCards(converted);
      setDeckTitle(`${initialQuiz.quiz_title} Flashcards`);
      setActiveMode('study');
    }
  }, [initialQuiz]);

  // Keyboard navigation for active study drill
  useEffect(() => {
    if (activeMode !== 'study' || cards.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' || e.key === 'KeyN') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyP') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleMarkLearning();
      } else if (e.key === '2') {
        e.preventDefault();
        handleMarkMastered();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, currentIndex, isFlipped, cards, masteredIds, learningIds]);

  const handleGenerateDeck = async (overrideTopic?: string) => {
    soundFx.playClick();
    const targetTopic = overrideTopic || topic;
    if (!targetTopic.trim() && !notes.trim()) {
      setGenError('Please enter a topic or paste study notes to generate flashcards.');
      return;
    }

    setGenError(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          notes,
          cardCount,
          difficulty,
          focusArea,
          customInstructions: customPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate flashcards from AI engine.');
      }

      setCards(data.deck.cards || []);
      setDeckTitle(data.deck.title || `${targetTopic} Flashcards`);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds(new Set());
      setLearningIds(new Set());
      setActiveMode('study');
      soundFx.playComplete();
    } catch (err: unknown) {
      const error = err as Error;
      setGenError(error.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filtered Cards
  const displayedCards = cards.filter((c) => {
    if (filterMode === 'learning') return learningIds.has(c.id);
    if (filterMode === 'mastered') return masteredIds.has(c.id);
    return true;
  });

  const currentCard = displayedCards[currentIndex] || displayedCards[0] || cards[0];

  const handleFlip = () => {
    soundFx.playClick();
    if (!isFlipped) {
      setHasFlippedCurrent(true);
    }
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    soundFx.playClick();
    setIsFlipped(false);
    if (displayedCards.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % displayedCards.length);
    }
  };

  const handlePrev = () => {
    soundFx.playClick();
    setIsFlipped(false);
    if (displayedCards.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + displayedCards.length) % displayedCards.length);
    }
  };

  const handleShuffle = () => {
    soundFx.playSelect();
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkMastered = () => {
    if (!currentCard) return;
    const dwellMs = Date.now() - cardShownAtRef.current;
    const verification = verifyFlashcardMasteryXp({
      front: currentCard.front,
      back: currentCard.back,
      wasFlipped: hasFlippedCurrent || isFlipped,
      dwellTimeMs: dwellMs,
    });

    if (!verification.allowed && !(hasFlippedCurrent || isFlipped)) {
      soundFx.playIncorrect();
      setIntegrityToast({
        ok: false,
        text: verification.reason || 'Flip the card and review the answer first to earn Mastery XP!',
      });
      return;
    }

    soundFx.playCorrect();
    const srUpdated = recordFlashcardSpacedRepetitionReview({
      questionId: currentCard.id,
      questionText: currentCard.front,
      correctAnswer: currentCard.back,
      explanation: currentCard.detailedExplanation,
      topic: currentCard.category || deckTitle,
      knewIt: true,
    });
    recordDailyPracticeMinutesAndQuestions(0.4, 1);
    setSrScheduleMap(loadSpacedRepetitionSchedule());

    const newMastered = new Set(masteredIds);
    newMastered.add(currentCard.id);
    const newLearning = new Set(learningIds);
    newLearning.delete(currentCard.id);
    setMasteredIds(newMastered);
    setLearningIds(newLearning);

    if (verification.allowed && verification.xp > 0) {
      onFlashcardMastered?.(verification.xp, verification.gems);
      setIntegrityToast({
        ok: true,
        text: `✅ Knew It! Promoted to Spaced Repetition Box ${srUpdated.box} (Next review in ${srUpdated.intervalDays}d: ${srUpdated.nextReviewDate}) • +${verification.xp} XP`,
      });
    } else {
      setIntegrityToast({
        ok: true,
        text: `✅ Knew It! Promoted to Spaced Repetition Box ${srUpdated.box} (Next review in ${srUpdated.intervalDays}d: ${srUpdated.nextReviewDate}).`,
      });
    }
    handleNext();
  };

  const handleMarkLearning = () => {
    if (!currentCard) return;
    soundFx.playClick();
    const srUpdated = recordFlashcardSpacedRepetitionReview({
      questionId: currentCard.id,
      questionText: currentCard.front,
      correctAnswer: currentCard.back,
      explanation: currentCard.detailedExplanation,
      topic: currentCard.category || deckTitle,
      knewIt: false,
    });
    recordDailyPracticeMinutesAndQuestions(0.4, 1);
    setSrScheduleMap(loadSpacedRepetitionSchedule());

    const newLearning = new Set(learningIds);
    newLearning.add(currentCard.id);
    const newMastered = new Set(masteredIds);
    newMastered.delete(currentCard.id);
    setLearningIds(newLearning);
    setMasteredIds(newMastered);
    setIntegrityToast({
      ok: true,
      text: `📚 Didn't Know It — Placed in Spaced Repetition Box ${srUpdated.box} (Due Today / Daily Challenge Queue).`,
    });
    handleNext();
  };

  const handleSpeakText = (text: string) => {
    soundFx.playClick();
    speechEngine.speak(text);
  };

  const handleDownloadDeckJson = () => {
    soundFx.playClick();
    const jsonStr = JSON.stringify(
      {
        title: deckTitle,
        total_cards: cards.length,
        exportedAt: new Date().toISOString(),
        cards: cards,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckTitle.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="comic-tab-hero flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-300 text-slate-950 border-2 border-slate-950 flex items-center justify-center shadow-md shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
                ISSUE #06 · FLASHCARD DRILL
              </span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/55 text-cyan-200 border border-white/25">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI Flashcard Generator &amp; Drill</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
              Flashcard Studio
            </h2>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-950/60 border-2 border-slate-950 rounded-2xl relative z-10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveMode('generate');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMode === 'generate'
                ? 'bg-amber-300 text-slate-950 border-2 border-slate-950 shadow-xs'
                : 'text-white/85 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Generator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveMode('study');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMode === 'study'
                ? 'bg-amber-300 text-slate-950 border-2 border-slate-950 shadow-xs'
                : 'text-white/85 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Deck {cards.length > 0 && `(${cards.length})`}</span>
          </button>
        </div>
      </div>

      {/* GENERATOR MODE */}
      {activeMode === 'generate' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Generate AI Flashcard Deck
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide any subject, medical concept, code topic, or paste lecture notes. Gemini AI will synthesize active-recall prompts, definitions, and memory mnemonics.
            </p>
          </div>

          {/* Quick Starter Topics */}
          <div>
            <span className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Quick Starter Subjects
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STARTER_FLASHCARD_TOPICS.map((st, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setTopic(st.topic);
                    setCardCount(st.count);
                    setDifficulty(st.difficulty);
                  }}
                  className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-amber-400 dark:hover:border-amber-500 text-left transition-all cursor-pointer group"
                >
                  <span className="text-xl mb-1 block">{st.icon}</span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-1">
                    {st.topic}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {st.count} Cards &bull; {st.difficulty}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Deck Topic or Target Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cranial Nerves Anatomy, React Fiber Architecture, French Irregular Verbs..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Optional Notes Input */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Source Study Notes, Lecture Summary, or Reference Text (Optional)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste raw lecture bullet points, textbook paragraphs, or definitions here for targeted flashcards..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Deck Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card Count */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Deck Size
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[5, 8, 12, 16].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setCardCount(cnt);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      cardCount === cnt
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Depth Level
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyType[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setDifficulty(lvl);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lvl === 'Beginner' ? 'Intro' : lvl === 'Intermediate' ? 'Mid' : 'Deep'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pedagogical Focus Area */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Pedagogical Focus
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Core Concepts & Key Definitions">Core Concepts & Definitions</option>
                <option value="Clinical & Practical Case Vignettes">Clinical & Case Vignettes</option>
                <option value="Underlying Mechanisms & First Principles">Mechanisms & First Principles</option>
                <option value="Formula Derivations & Calculations">Formula Derivations</option>
                <option value="High-Yield Exam Cram">High-Yield Exam Cram</option>
              </select>
            </div>
          </div>

          {/* Custom Prompter Instructions */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Custom AI Flashcard Directives (Optional)
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Include mnemonics using animal metaphors, emphasize subtle edge cases..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {genError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {genError}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => handleGenerateDeck()}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                <span>Synthesizing Active Recall Flashcards...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate Flashcard Deck</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ACTIVE STUDY DECK DRILL MODE */}
      {activeMode === 'study' && (
        <div className="space-y-4">
          {/* Deck Status Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                {deckTitle}
              </span>
              <span className="px-2 py-0.5 rounded-full font-black bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                Card {displayedCards.length > 0 ? currentIndex + 1 : 0} of {displayedCards.length}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] sm:text-xs ${
                    filterMode === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  All ({cards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('learning')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] sm:text-xs ${
                    filterMode === 'learning'
                      ? 'bg-amber-500 text-slate-950 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Learning ({learningIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('mastered')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] sm:text-xs ${
                    filterMode === 'mastered'
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Mastered ({masteredIds.size})
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShuffle}
                  title="Shuffle Deck"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer shrink-0"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDeckJson}
                  title="Export Deck JSON"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Flashcard 3D Perspective Card */}
          {cards.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <Layers className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                No quizzes available
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No flashcard deck or active quiz is loaded yet. Generate an AI flashcard deck or start a quiz first!
              </p>
              <button
                type="button"
                onClick={() => setActiveMode('generate')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black cursor-pointer"
              >
                + Generate Flashcard Deck
              </button>
            </div>
          ) : displayedCards.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                No cards in this filter!
              </h3>
              <p className="text-xs text-slate-500">
                You’ve either completed all cards or haven't marked any yet.
              </p>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Show All Cards
              </button>
            </div>
          ) : (
            <div
              onClick={handleFlip}
              className="relative min-h-[340px] sm:min-h-[380px] rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 shadow-md p-8 flex flex-col justify-between cursor-pointer select-none transition-all hover:border-indigo-400 dark:hover:border-indigo-600 overflow-hidden"
            >
              {/* Category & Status Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {currentCard?.category || 'General'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {currentCard?.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {masteredIds.has(currentCard?.id) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Mastered
                    </span>
                  )}
                  {learningIds.has(currentCard?.id) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      Still Learning
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeakText(isFlipped ? currentCard.back : currentCard.front);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Center Content */}
              <div className="my-auto py-6 text-center space-y-4">
                <AnimatePresence mode="wait">
                  {!isFlipped ? (
                    <motion.div
                      key="front"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-2 max-w-xl mx-auto"
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        Prompt / Question
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                        {currentCard?.front}
                      </h3>
                      <p className="text-xs text-slate-400 italic pt-2">
                        Click card or press Space to reveal answer
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4 max-w-xl mx-auto"
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        Answer & Key Takeaway
                      </span>
                      <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                        {currentCard?.back}
                      </div>

                      {currentCard?.mnemonic && (
                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs text-left">
                          <span className="font-black">💡 Memory Hook: </span>
                          <span>{currentCard.mnemonic}</span>
                        </div>
                      )}

                      {currentCard?.detailedExplanation && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs text-left leading-relaxed">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Mechanism: </span>
                          <span>{currentCard.detailedExplanation}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Flip & Active-Recall Verification Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>
                    {hasFlippedCurrent || isFlipped
                      ? '✅ Answer Reviewed (Eligible for Verified XP)'
                      : '🔒 Flip card to verify recall before marking Mastered'}
                  </span>
                </span>
                <span className="hidden sm:inline-block">Shortcuts: Space (Flip) &bull; 1 (Learning) &bull; 2 (Mastered)</span>
              </div>
            </div>
          )}

          {integrityToast && (
            <div
              className={`px-4 py-2.5 rounded-2xl border text-xs font-extrabold flex items-center justify-between gap-2 ${
                integrityToast.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
              }`}
            >
              <span>{integrityToast.text}</span>
              <button
                type="button"
                onClick={() => setIntegrityToast(null)}
                className="text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Drill Control Buttons */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-3 sm:px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all shrink-0"
              title="Previous card"
              aria-label="Previous card"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center">
              <button
                type="button"
                onClick={handleMarkLearning}
                className="flex-1 sm:flex-initial px-3 sm:px-5 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-2 border-amber-500/40 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
                title="Didn't Know It — Add to immediate Spaced Repetition review (Shortcut: 1)"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Didn’t Know It</span>
                <span className="hidden md:inline text-[10px] opacity-75">(1)</span>
              </button>

              <button
                type="button"
                onClick={handleMarkMastered}
                className="flex-1 sm:flex-initial px-3 sm:px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all whitespace-nowrap"
                title="Knew It — Advance Spaced Repetition interval (Shortcut: 2)"
              >
                <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                <span>Knew It!</span>
                <span className="hidden md:inline text-[10px] opacity-75">(2)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="p-3 sm:px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all shrink-0"
              title="Next card"
              aria-label="Next card"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
