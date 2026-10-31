import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  Bookmark,
  Share2,
  Trash2,
  Check,
  RotateCcw,
  Layers,
  GraduationCap,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { Question, QuizResponse, PersonaType } from '../types/quiz';
import { MascotAvatar } from './MascotAvatar';

export interface SavedMistakeItem {
  id: string;
  quizTitle: string;
  subject: string;
  topic: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  misconceptionReason: string;
  options?: string[];
  dateSaved: string;
  status: 'needs_review' | 'practicing' | 'mastered';
  practiceAttempts: number;
}

const MISTAKES_STORAGE_KEY = 'quizme_mistake_notebook_records_v1';

export function loadSavedMistakes(): SavedMistakeItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MISTAKES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMistakeToNotebook(mistake: Omit<SavedMistakeItem, 'id' | 'dateSaved' | 'status' | 'practiceAttempts'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadSavedMistakes();
    // Prevent duplicate entries for same question
    if (existing.some((m) => m.question === mistake.question)) return;

    const newItem: SavedMistakeItem = {
      ...mistake,
      id: `mistake_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dateSaved: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'needs_review',
      practiceAttempts: 0,
    };
    existing.unshift(newItem);
    localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(existing.slice(0, 150)));
  } catch {
    // Storage quota or parsing error
  }
}

interface MistakeNotebookViewProps {
  onPracticeQuiz?: (quiz: QuizResponse) => void;
  onOpenNotesForTopic?: (topic: string) => void;
  onAskTutor?: (question: Question) => void;
}

export const MistakeNotebookView: React.FC<MistakeNotebookViewProps> = ({
  onPracticeQuiz,
  onOpenNotesForTopic,
  onAskTutor,
}) => {
  const [mistakes, setMistakes] = useState<SavedMistakeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'needs_review' | 'practicing' | 'mastered'>('all');
  const [selectedMistake, setSelectedMistake] = useState<SavedMistakeItem | null>(null);

  // Quick retry interactive state
  const [retryAnswer, setRetryAnswer] = useState<string | null>(null);
  const [retryResult, setRetryResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  useEffect(() => {
    const records = loadSavedMistakes();
    // Seed initial pedagogical examples if completely empty so the learner immediately sees how it works
    if (records.length === 0) {
      const initialSeed: SavedMistakeItem[] = [
        {
          id: 'mistake_seed_1',
          quizTitle: 'WAEC & IGCSE Physics — Mechanics',
          subject: 'Physics',
          topic: "Newton's Second Law & Momentum",
          question: 'A 2 kg mass accelerates at 4 m/s². What net resultant force is acting upon it?',
          userAnswer: '2 N',
          correctAnswer: '8 N',
          explanation: 'Using Newton’s 2nd law: F = m × a = 2 kg × 4 m/s² = 8 N.',
          misconceptionReason: 'Divided mass by acceleration instead of multiplying (F = m × a). Common confusion between work, force, and power equations.',
          options: ['2 N', '6 N', '8 N', '16 N'],
          dateSaved: 'Yesterday',
          status: 'needs_review',
          practiceAttempts: 1,
        },
        {
          id: 'mistake_seed_2',
          quizTitle: 'Cambridge IGCSE Chemistry — Acids & Bases',
          subject: 'Chemistry',
          topic: 'pH Scale & Autoionization',
          question: 'If a solution has a pH of 3, what is its hydronium ion concentration [H+]?',
          userAnswer: '10^3 mol/dm³',
          correctAnswer: '10^-3 mol/dm³',
          explanation: 'pH = -log10[H+], so [H+] = 10^-pH = 10^-3 mol/dm³.',
          misconceptionReason: 'Forgot the negative exponent in the logarithmic definition of pH.',
          options: ['10^3 mol/dm³', '10^-3 mol/dm³', '3 mol/dm³', '0.003 mol/dm³'],
          dateSaved: '3 days ago',
          status: 'practicing',
          practiceAttempts: 2,
        },
      ];
      setMistakes(initialSeed);
      try {
        localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(initialSeed));
      } catch {}
    } else {
      setMistakes(records);
    }
  }, []);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    mistakes.forEach((m) => {
      if (m.subject) set.add(m.subject);
    });
    return ['All', ...Array.from(set)];
  }, [mistakes]);

  const filteredMistakes = useMemo(() => {
    return mistakes.filter((m) => {
      const matchSubject = selectedSubject === 'All' || m.subject === selectedSubject;
      const matchStatus = selectedStatus === 'all' || m.status === selectedStatus;
      const matchSearch =
        searchQuery.trim() === '' ||
        m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.misconceptionReason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchStatus && matchSearch;
    });
  }, [mistakes, selectedSubject, selectedStatus, searchQuery]);

  const handleUpdateStatus = (id: string, newStatus: SavedMistakeItem['status']) => {
    soundFx.playClick();
    const updated = mistakes.map((m) =>
      m.id === id ? { ...m, status: newStatus } : m
    );
    setMistakes(updated);
    if (selectedMistake?.id === id) {
      setSelectedMistake({ ...selectedMistake, status: newStatus });
    }
    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteMistake = (id: string) => {
    soundFx.playClick();
    const updated = mistakes.filter((m) => m.id !== id);
    setMistakes(updated);
    if (selectedMistake?.id === id) {
      setSelectedMistake(null);
    }
    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleCheckRetry = (chosen: string) => {
    setRetryAnswer(chosen);
    if (!selectedMistake) return;
    const isCorrect = chosen.trim().toLowerCase() === selectedMistake.correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      soundFx.playCorrect();
      setRetryResult({
        isCorrect: true,
        feedback: 'Correct! You unpacked the misconception and verified the answer.',
      });
      handleUpdateStatus(selectedMistake.id, 'mastered');
    } else {
      soundFx.playWrong();
      setRetryResult({
        isCorrect: false,
        feedback: `Not quite. The correct answer is "${selectedMistake.correctAnswer}". Review the core rule below.`,
      });
      handleUpdateStatus(selectedMistake.id, 'practicing');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="comic-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-indigo-500/10 border-2 border-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-2xl bg-rose-500 text-white border-2 border-slate-950 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <span className="comic-badge px-2.5 py-1 rounded bg-rose-400 text-slate-950 border border-slate-950 text-xs font-black uppercase tracking-wider">
                COGNITIVE MISTAKE NOTEBOOK
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {mistakes.length} Saved Learning Moments
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Personalized Mistake Notebook
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Every missed question is a learning milestone. Review the exact misconception, inspect the core explanation, and retry questions until mastery is locked into long-term memory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 shadow-xs text-center min-w-[110px]">
              <div className="text-2xl font-black text-rose-500">
                {mistakes.filter((m) => m.status === 'needs_review').length}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Needs Review
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 shadow-xs text-center min-w-[110px]">
              <div className="text-2xl font-black text-emerald-500">
                {mistakes.filter((m) => m.status === 'mastered').length}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Mastered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="comic-panel rounded-2xl p-4 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mistakes by question, topic, or misconception..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['all', 'needs_review', 'practicing', 'mastered'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedStatus(st);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'all'
                  ? 'All'
                  : st === 'needs_review'
                  ? 'Review'
                  : st === 'practicing'
                  ? 'Practicing'
                  : 'Mastered'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Mistake Cards + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mistake Cards List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredMistakes.length === 0 ? (
            <div className="comic-panel rounded-2xl p-8 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Zero Missed Questions in View
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have mastered every mistake matching this filter, or haven’t saved any yet.
              </p>
            </div>
          ) : (
            filteredMistakes.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  soundFx.playSelect();
                  setSelectedMistake(m);
                  setRetryAnswer(null);
                  setRetryResult(null);
                }}
                className={`comic-panel-sm rounded-2xl p-4 transition-all cursor-pointer border-2 ${
                  selectedMistake?.id === m.id
                    ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-400/40'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-900/15 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {m.subject}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                      {m.topic}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      m.status === 'mastered'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : m.status === 'practicing'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {m.status === 'mastered'
                      ? '✓ Mastered'
                      : m.status === 'practicing'
                      ? 'Practicing'
                      : 'Needs Review'}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 mt-2 leading-relaxed">
                  {m.question}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                  <span className="text-rose-500 font-semibold truncate max-w-[160px]">
                    Your Answer: {m.userAnswer}
                  </span>
                  <span>{m.dateSaved}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Detailed Drilldown & Interactive Retry */}
        <div className="lg:col-span-7">
          {selectedMistake ? (
            <div className="comic-panel rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-6 sticky top-20">
              {/* Question Header & Status Actions */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase">
                      {selectedMistake.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {selectedMistake.topic}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {selectedMistake.question}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteMistake(selectedMistake.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove from notebook"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Misconception Breakdown Card */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-300/80 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Why Your Previous Answer Was Incorrect:</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedMistake.misconceptionReason}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">Your Miss: </span>
                    <span className="line-through">{selectedMistake.userAnswer}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Correct: </span>
                    <span className="font-bold">{selectedMistake.correctAnswer}</span>
                  </div>
                </div>
              </div>

              {/* Full Explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-700 dark:text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Verified Educational Explanation:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {selectedMistake.explanation}
                </p>
              </div>

              {/* Interactive Retry Practice Section */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-800 dark:text-indigo-300">
                    <RotateCcw className="w-4 h-4" />
                    <span>Practise This Question Now:</span>
                  </div>
                  {retryResult && (
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded ${
                        retryResult.isCorrect
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {retryResult.isCorrect ? '✓ Solved!' : 'Try Again'}
                    </span>
                  )}
                </div>

                {selectedMistake.options && selectedMistake.options.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedMistake.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleCheckRetry(opt)}
                        className={`p-3 text-left rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                          retryAnswer === opt
                            ? opt.trim().toLowerCase() === selectedMistake.correctAnswer.trim().toLowerCase()
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : 'bg-rose-500 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-800 hover:bg-indigo-100/60 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="font-mono text-slate-400 mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type your revised answer here..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCheckRetry((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCheckRetry(selectedMistake.correctAnswer)}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 cursor-pointer"
                    >
                      Check
                    </button>
                  </div>
                )}

                {retryResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
                      retryResult.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {retryResult.feedback}
                  </div>
                )}
              </div>

              {/* Action Buttons: Open Notes, Ask AI Tutor, Status Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenNotesForTopic?.(selectedMistake.topic)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>View Related Notes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const dummyQuestion: Question = {
                        id: 9999,
                        type: 'multiple_choice',
                        question: selectedMistake.question,
                        correct_answer: selectedMistake.correctAnswer,
                        explanation: selectedMistake.explanation,
                        topic: selectedMistake.topic,
                        gamified_feedback: {
                          success_quote: 'Mistake diagnosed!',
                          hint: 'Focus on first principles.',
                        },
                      };
                      onAskTutor?.(dummyQuestion);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI Tutor Socratic Question</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Mark as:</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedMistake.id, 'mastered')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMistake.status === 'mastered'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    ✓ Mastered
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="comic-panel rounded-3xl p-12 bg-white dark:bg-slate-900 border-2 border-slate-900/15 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center border-2 border-rose-300 dark:border-rose-800">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Select a Missed Question to Inspect
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Click any saved mistake from the list on the left to see why the chosen option failed, study the core verified rule, and attempt an instant re-try.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
