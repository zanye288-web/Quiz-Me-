import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Volume2,
  Shuffle,
  RotateCcw,
  BookOpen,
  Code2,
  Layers,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Question, QuizResponse, PersonaType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';

interface FlashcardStudyDeckProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizResponse;
  persona: PersonaType;
}

export const FlashcardStudyDeck: React.FC<FlashcardStudyDeckProps> = ({
  isOpen,
  onClose,
  quiz,
  persona,
}) => {
  const [cards, setCards] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [learningIds, setLearningIds] = useState<Set<number>>(new Set());

  // Initialize cards on open
  useEffect(() => {
    if (isOpen && quiz.questions) {
      setCards([...quiz.questions]);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen, quiz]);

  // Keyboard navigation for interactive drill
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isOpen, currentIndex, isFlipped, cards]);

  if (!isOpen || cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  const isMastered = masteredIds.has(currentCard.id);
  const isLearning = learningIds.has(currentCard.id);

  const handleFlip = () => {
    soundFx.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    soundFx.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    soundFx.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleMarkMastered = () => {
    soundFx.playCorrect();
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.add(currentCard.id);
      return next;
    });
    setLearningIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    if (currentIndex < cards.length - 1) {
      handleNext();
    }
  };

  const handleMarkLearning = () => {
    soundFx.playClick();
    setLearningIds((prev) => {
      const next = new Set(prev);
      next.add(currentCard.id);
      return next;
    });
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    if (currentIndex < cards.length - 1) {
      handleNext();
    }
  };

  const handleShuffle = () => {
    soundFx.playClick();
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleResetProgress = () => {
    soundFx.playClick();
    setMasteredIds(new Set());
    setLearningIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Stop speaking when card flips or changes or closes
  useEffect(() => {
    speechEngine.stop();
  }, [currentIndex, isFlipped, isOpen]);

  const handleSpeak = (text: string) => {
    soundFx.playClick();
    speechEngine.speak(text, { id: `card_${currentCard.id}_${isFlipped ? 'ans' : 'q'}` });
  };

  const progressPercent = Math.round((masteredIds.size / cards.length) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Interactive Study Deck</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {cards.length} Cards
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {quiz.quiz_title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffle}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Shuffle Cards"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetProgress}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Mastery Status"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress & Deck Status Bar */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {masteredIds.size} Mastered
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                <HelpCircle className="w-3.5 h-3.5" />
                {learningIds.size} Review Needed
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 w-44">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-slate-500">{progressPercent}%</span>
          </div>
        </div>

        {/* 3D Flip Card Container */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto flex flex-col items-center justify-center min-h-[360px]">
          <div
            onClick={handleFlip}
            className="w-full max-w-xl min-h-[300px] p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-md cursor-pointer transition-all flex flex-col justify-between select-none relative group"
          >
            {/* Top metadata row on card */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentCard.domain || 'Core Concept'}
                </span>
                {currentCard.bloom_level && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {currentCard.bloom_level}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(isFlipped ? currentCard.explanation : currentCard.question);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                  {isFlipped ? 'Answer' : 'Question'}
                </span>
              </div>
            </div>

            {/* Main Question / Answer Body */}
            <div className="py-6 flex-1 flex flex-col justify-center">
              {!isFlipped ? (
                <div className="space-y-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Question Prompt
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.question}
                  </p>

                  {currentCard.code_snippet && (
                    <div className="p-3 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                      <code>{currentCard.code_snippet}</code>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Verified Target Answer
                    </span>
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80">
                      {currentCard.correct_answer}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Conceptual Explanation
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentCard.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer Hint */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Click card or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300">Space</kbd> to flip</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {isFlipped ? 'Tap to view question' : 'Tap to reveal answer'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation & Mastery Evaluation Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Card pagination arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Evaluation buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleMarkLearning}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isLearning
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Need Review (1)</span>
            </button>

            <button
              type="button"
              onClick={handleMarkMastered}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isMastered
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Mastered (2)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
