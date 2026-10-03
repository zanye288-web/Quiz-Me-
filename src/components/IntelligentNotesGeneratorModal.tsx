import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  X,
  Target,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { PersonaType, QuizResponse } from '../types/quiz';
import { IntelligentNote } from '../types/learningSystem';
import { soundFx } from '../utils/audio';
import { resolveThematicVisual } from '../utils/thematicImages';

interface IntelligentNotesGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteGenerated: (note: IntelligentNote) => void;
  initialTopic?: string;
  initialSubject?: string;
  sourceQuiz?: QuizResponse | null;
  missedQuestions?: Array<{ question: string; userAnswer: string; correctAnswer: string; explanation?: string }>;
  persona: PersonaType;
}

export const IntelligentNotesGeneratorModal: React.FC<IntelligentNotesGeneratorModalProps> = ({
  isOpen,
  onClose,
  onNoteGenerated,
  initialTopic = '',
  initialSubject = '',
  sourceQuiz = null,
  missedQuestions = [],
  persona,
}) => {
  const [sourceType, setSourceType] = useState<'topic' | 'quiz' | 'mistakes' | 'goal' | 'custom'>(
    missedQuestions.length > 0 ? 'mistakes' : sourceQuiz ? 'quiz' : 'topic'
  );
  const [topic, setTopic] = useState(initialTopic || (sourceQuiz ? sourceQuiz.quiz_title : ''));
  const [subject, setSubject] = useState(initialSubject || 'Academic Foundations');
  const [customPrompt, setCustomPrompt] = useState('');
  const [learnerLevel, setLearnerLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && sourceType !== 'custom') return;
    setIsLoading(true);
    setError(null);
    soundFx.playClick();

    try {
      const response = await fetch('/api/intelligent-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || 'Core Foundations',
          subject: subject.trim(),
          sourceType,
          contextDetails: customPrompt.trim(),
          missedQuestions: sourceType === 'mistakes' ? missedQuestions : undefined,
          persona,
          learnerLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.notes) {
        throw new Error(data.error || 'Failed to generate study notes');
      }

      // Attach thematic visual asset if none was provided
      const contextString = [data.notes.topic, data.notes.subject, ...(data.notes.tags || [])].join(' ');
      const visual = resolveThematicVisual(contextString);
      const finalNote: IntelligentNote = {
        ...data.notes,
        id: `note_${Date.now()}`,
        sourceType,
        sourceId: sourceQuiz?.quiz_title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visualAsset: visual
          ? {
              url: visual.url,
              caption: visual.caption,
              imageType: data.notes.subject || 'Academic Illustration',
            }
          : undefined,
      };

      soundFx.playComplete();
      onNoteGenerated(finalNote);
      onClose();
    } catch (err: any) {
      console.warn('Notes generator fallback:', err);
      setError(err.message || 'Unable to generate notes right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Create Intelligent Study Notes</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI structured notes with concepts, progressive explanation, mistakes & self-check
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          {/* Source Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              Generate Notes From:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSourceType('topic')}
                className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-center border cursor-pointer ${
                  sourceType === 'topic'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                Subject / Topic
              </button>

              {sourceQuiz && (
                <button
                  type="button"
                  onClick={() => setSourceType('quiz')}
                  className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-center border cursor-pointer ${
                    sourceType === 'quiz'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  Current Quiz
                </button>
              )}

              {missedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSourceType('mistakes')}
                  className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-center border cursor-pointer ${
                    sourceType === 'mistakes'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  Missed Questions ({missedQuestions.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => setSourceType('goal')}
                className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-center border cursor-pointer ${
                  sourceType === 'goal'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                Learning Goal
              </button>

              <button
                type="button"
                onClick={() => setSourceType('custom')}
                className={`p-2.5 rounded-2xl text-xs font-bold transition-all text-center border cursor-pointer ${
                  sourceType === 'custom'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                Custom Prompt
              </button>
            </div>
          </div>

          {/* Topic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Topic or Concept Title
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Mitosis & Cell Division, Quantum Entanglement, French Revolution"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Subject Field & Learner Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Broad Subject / Discipline
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Biology, Physics, World History"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Learner Depth / Level
              </label>
              <select
                value={learnerLevel}
                onChange={(e) => setLearnerLevel(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="Beginner">Beginner (Foundations & Intuition)</option>
                <option value="Intermediate">Intermediate (Core Mechanics & Rules)</option>
                <option value="Advanced">Advanced (Rigorous Edge Cases & Synthesis)</option>
              </select>
            </div>
          </div>

          {/* Optional Custom Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Specific Focus or Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Focus on why telophase differs from anaphase, or use real-world sports analogies..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (!topic.trim() && sourceType !== 'custom')}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Study Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Notes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
