import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Play,
  BookmarkPlus,
  Edit3,
  Download,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileCheck,
  ClipboardPaste,
} from 'lucide-react';
import { QuizResponse, PersonaType, DifficultyType } from '../types/quiz';
import { parseUploadedQuiz, getSampleQuizJson, ParseQuizResult } from '../utils/quizUploader';
import { soundFx } from '../utils/audio';

interface QuizUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizUploaded?: (quiz: QuizResponse) => void;
  onStartQuiz?: (quiz: QuizResponse) => void;
  onSaveToLibrary?: (quiz: QuizResponse) => Promise<void> | void;
  onEditInStudio?: (quiz: QuizResponse) => void;
  persona?: PersonaType;
}

export const QuizUploadModal: React.FC<QuizUploadModalProps> = ({
  isOpen,
  onClose,
  onQuizUploaded,
  onStartQuiz,
  onSaveToLibrary,
  onEditInStudio,
  persona = 'Student' as PersonaType,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseQuizResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreviewList, setShowPreviewList] = useState(true);

  // Editable quiz fields after parse
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDifficulty, setEditedDifficulty] = useState<DifficultyType>('Intermediate');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFileName(null);
    setFileSize(null);
    setParseResult(null);
    setPastedText('');
    setSaveSuccess(false);
    setIsSaving(false);
  };

  const handleClose = () => {
    soundFx.playClick();
    resetState();
    onClose();
  };

  const handleFileProcess = useCallback(
    (file: File) => {
      soundFx.playSelect();
      setIsProcessing(true);
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');
      setSaveSuccess(false);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = parseUploadedQuiz(content, file.name, persona);
        setParseResult(result);
        if (result.success && result.quiz) {
          setEditedTitle(result.quiz.quiz_title);
          setEditedDifficulty(result.quiz.difficulty || 'Intermediate');
          soundFx.playCorrect();
        } else {
          soundFx.playIncorrect();
        }
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setParseResult({
          success: false,
          error: 'Failed to read file from disk.',
          fileName: file.name,
        });
        soundFx.playIncorrect();
        setIsProcessing(false);
      };
      reader.readAsText(file);
    },
    [persona]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    soundFx.playSelect();
    setIsProcessing(true);
    setFileName('pasted_quiz.json');
    setFileSize((new Blob([pastedText]).size / 1024).toFixed(1) + ' KB');

    setTimeout(() => {
      const result = parseUploadedQuiz(pastedText, 'pasted_quiz.json', persona);
      setParseResult(result);
      if (result.success && result.quiz) {
        setEditedTitle(result.quiz.quiz_title);
        setEditedDifficulty(result.quiz.difficulty || 'Intermediate');
        soundFx.playCorrect();
      } else {
        soundFx.playIncorrect();
      }
      setIsProcessing(false);
    }, 150);
  };

  const handleDownloadSample = () => {
    soundFx.playClick();
    const sampleJson = getSampleQuizJson();
    const blob = new Blob([sampleJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quizme_sample_quiz_format.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getEffectiveQuiz = (): QuizResponse | null => {
    if (!parseResult?.success || !parseResult.quiz) return null;
    return {
      ...parseResult.quiz,
      quiz_title: editedTitle.trim() || parseResult.quiz.quiz_title,
      difficulty: editedDifficulty,
    };
  };

  const handlePlayNow = () => {
    const quiz = getEffectiveQuiz();
    if (!quiz) return;
    soundFx.playSelect();
    if (onQuizUploaded) {
      onQuizUploaded(quiz);
    } else if (onStartQuiz) {
      onStartQuiz(quiz);
    }
    handleClose();
  };

  const handleSaveToCloud = async () => {
    const quiz = getEffectiveQuiz();
    if (!quiz) return;
    try {
      setIsSaving(true);
      soundFx.playSelect();
      if (onSaveToLibrary) {
        await onSaveToLibrary(quiz);
      } else if (onQuizUploaded) {
        await onQuizUploaded(quiz);
      }
      setSaveSuccess(true);
      soundFx.playCorrect();
    } catch (err) {
      console.error('Failed to save uploaded quiz:', err);
      soundFx.playIncorrect();
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenInStudio = () => {
    const quiz = getEffectiveQuiz();
    if (!quiz) return;
    soundFx.playClick();
    if (onEditInStudio) {
      onEditInStudio(quiz);
    } else if (onQuizUploaded) {
      onQuizUploaded(quiz);
    }
    handleClose();
  };

  if (!isOpen) return null;

  const validQuiz = parseResult?.success && parseResult.quiz ? parseResult.quiz : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="comic-modal-panel relative w-full max-w-2xl my-8 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
          id="quiz-upload-modal-card"
        >
          {/* Header */}
          <div className="pattern-halftone flex items-center justify-between px-6 py-5 border-b-2 border-slate-900/15 dark:border-slate-800 bg-indigo-50/50 dark:bg-slate-800/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Upload Created Quiz
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Import quizzes from JSON, text, or export files to play, edit, or save to your library
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Mode Switcher */}
            {!validQuiz && (
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setActiveMode('upload');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeMode === 'upload'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setActiveMode('paste');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeMode === 'paste'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste JSON / Text</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-bold transition-all cursor-pointer"
                  title="Download standard quiz format sample JSON"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Sample Format</span>
                </button>
              </div>
            )}

            {/* Upload Area */}
            {!validQuiz && activeMode === 'upload' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".json,.txt,.md"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-3xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                  <FileCode className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    Drop your quiz file here, or{' '}
                    <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Supports JSON files (QuizMe format, question arrays) or numbered text/markdown quizzes
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    .JSON
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    .TXT
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    .MD
                  </span>
                </div>
              </div>
            )}

            {/* Paste Area */}
            {!validQuiz && activeMode === 'paste' && (
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Paste Quiz Content or JSON
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={8}
                  placeholder={`{\n  "quiz_title": "My Custom Exam",\n  "questions": [\n    {\n      "id": 1,\n      "question": "What is...?",\n      "options": ["A", "B", "C", "D"],\n      "correct_answer": "A",\n      "explanation": "..."\n    }\n  ]\n}`}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!pastedText.trim() || isProcessing}
                    onClick={handleParsePastedText}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isProcessing ? 'Validating...' : 'Parse & Validate Quiz'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {parseResult && !parseResult.success && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-rose-900 dark:text-rose-200">
                    Failed to parse quiz file
                  </p>
                  <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                    {parseResult.error}
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="text-xs font-bold text-rose-800 dark:text-rose-300 underline mt-1 inline-block cursor-pointer"
                  >
                    View or download the sample format
                  </button>
                </div>
              </div>
            )}

            {/* Successfully Parsed Quiz View */}
            {validQuiz && (
              <div className="space-y-5">
                {/* Status Bar */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Quiz Successfully Verified
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        {fileName} {fileSize ? `(${fileSize})` : ''} • {validQuiz.questions.length} questions parsed
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={resetState}
                    className="text-xs font-extrabold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                  >
                    Upload Different File
                  </button>
                </div>

                {/* Edit Quiz Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                      Quiz Title
                    </label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={editedDifficulty}
                      onChange={(e) => setEditedDifficulty(e.target.value as DifficultyType)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Master">Master</option>
                    </select>
                  </div>
                </div>

                {/* Question List Preview Accordion */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/20">
                  <div
                    onClick={() => {
                      soundFx.playClick();
                      setShowPreviewList((prev) => !prev);
                    }}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        Question Breakdown ({validQuiz.questions.length} Items)
                      </span>
                    </div>
                    {showPreviewList ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {showPreviewList && (
                    <div className="max-h-60 overflow-y-auto p-3 space-y-2 border-t border-slate-200 dark:border-slate-800">
                      {validQuiz.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5"
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                              {q.question}
                            </span>
                          </div>

                          {q.options && q.options.length > 0 && (
                            <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                              {q.options.map((opt, optIdx) => {
                                const isCorrect = opt === q.correct_answer;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center justify-between ${
                                      isCorrect
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    <span className="truncate">{opt}</span>
                                    {isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 ml-1" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.explanation && (
                            <p className="pl-7 text-[11px] text-slate-500 dark:text-slate-400 italic">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Confirmation */}
                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>Saved to your Cloud Curriculum Library! Accessible across all your devices.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {validQuiz && (
              <div className="w-full sm:w-auto flex flex-wrap items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleOpenInStudio}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Open this quiz in the builder to add or edit questions"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Edit in Studio</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={isSaving || saveSuccess}
                  className="px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Save directly into your Firestore Library"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{saveSuccess ? 'Saved in Library' : isSaving ? 'Saving...' : 'Save to Library'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePlayNow}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play Quiz Now</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
