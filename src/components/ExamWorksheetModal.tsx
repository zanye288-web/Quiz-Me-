import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Sliders,
  Award,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { QuizResponse, Question } from '../types/quiz';
import { soundFx } from '../utils/audio';

interface ExamWorksheetModalProps {
  quiz: QuizResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExamWorksheetModal: React.FC<ExamWorksheetModalProps> = ({
  quiz,
  isOpen,
  onClose,
}) => {
  const [worksheetType, setWorksheetType] = useState<'student' | 'solution'>('student');
  const [fontSize, setFontSize] = useState<'compact' | 'normal' | 'large'>('normal');
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  if (!isOpen || !quiz) return null;

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const handleCopyRaw = () => {
    soundFx.playClick();
    let text = `${quiz.quiz_title.toUpperCase()}\n`;
    text += `Topic: ${quiz.topic || 'General'} | Difficulty: ${quiz.difficulty || 'Intermediate'}\n`;
    text += `Total Questions: ${quiz.questions.length}\n`;
    text += `========================================\n\n`;

    quiz.questions.forEach((q, idx) => {
      text += `Question ${idx + 1}: ${q.question}\n`;
      if (q.code_snippet) {
        text += `\nCode (${q.language || 'text'}):\n${q.code_snippet}\n\n`;
      }
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, optIdx) => {
          text += `  [${String.fromCharCode(65 + optIdx)}] ${opt}\n`;
        });
      }

      if (worksheetType === 'solution') {
        text += `\n✓ Correct Answer: ${q.correct_answer}\n`;
        if (q.explanation) {
          text += `Explanation: ${q.explanation}\n`;
        }
      }
      text += `\n----------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'compact':
        return 'text-xs leading-normal';
      case 'large':
        return 'text-base leading-relaxed';
      default:
        return 'text-sm leading-relaxed';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Toolbar Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Exam Worksheet & Study Guide Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print or export clean formatted paper tests and answer keys
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleCopyRaw}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Worksheet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Student vs Instructor toggle */}
          <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setWorksheetType('student');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                worksheetType === 'student'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Student Exam Sheet
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setWorksheetType('solution');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                worksheetType === 'solution'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Teacher Solution Key
            </button>
          </div>

          {/* Controls: Font Size & Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Text Size:</span>
              <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {(['compact', 'normal', 'large'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz)}
                    className={`px-2 py-1 rounded text-[11px] font-bold capitalize cursor-pointer ${
                      fontSize === sz
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Header Box</span>
            </label>
          </div>
        </div>

        {/* Printable Worksheet Preview Canvas */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/40">
          <div
            id="printable-exam-sheet"
            className={`max-w-3xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6 ${getFontSizeClasses()}`}
          >
            {/* Header section for Student info */}
            {includeHeader && (
              <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      Assessment Examination Sheet
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {quiz.quiz_title}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Subject: {quiz.topic || 'General Science'} • Difficulty: {quiz.difficulty || 'Intermediate'} • Total Questions: {quiz.questions.length}
                    </p>
                  </div>

                  {worksheetType === 'solution' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 font-black text-xs">
                      INSTRUCTOR ANSWER KEY
                    </span>
                  )}
                </div>

                {worksheetType === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg">
                      <span className="font-bold text-slate-500">Student Name:</span>
                    </div>
                    <div className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg">
                      <span className="font-bold text-slate-500">Date:</span>
                    </div>
                    <div className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg">
                      <span className="font-bold text-slate-500">Score / Grade:</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6 pt-2">
              {quiz.questions.map((q: Question, idx: number) => {
                return (
                  <div key={q.id || idx} className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                          {idx + 1}.
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {q.question}
                        </div>
                      </div>
                      {q.domain && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {q.domain}
                        </span>
                      )}
                    </div>

                    {/* Code Snippet if present */}
                    {q.code_snippet && (
                      <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                        <code>{q.code_snippet}</code>
                      </pre>
                    )}

                    {/* Options (MCQ) */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const isCorrect =
                            worksheetType === 'solution' &&
                            opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs transition-colors ${
                                isCorrect
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 bg-white dark:bg-slate-700">
                                {letter}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Free response line for student sheet if no options */}
                    {worksheetType === 'student' && (!q.options || q.options.length === 0) && (
                      <div className="pl-5 pt-2 space-y-3">
                        <div className="h-6 border-b border-dashed border-slate-300 dark:border-slate-700" />
                        <div className="h-6 border-b border-dashed border-slate-300 dark:border-slate-700" />
                      </div>
                    )}

                    {/* Solution & Explanation Box for Teacher mode */}
                    {worksheetType === 'solution' && (
                      <div className="mt-2 pl-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct Answer: {q.correct_answer}</span>
                        </div>
                        {q.explanation && includeExplanations && (
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Rationale: </span>
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Answer Grid at end if student sheet */}
            {worksheetType === 'student' && (
              <div className="pt-6 border-t-2 border-slate-900 dark:border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Answer Record Grid
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {quiz.questions.map((_, i) => (
                    <div
                      key={i}
                      className="border border-slate-300 dark:border-slate-700 rounded p-1 text-center text-xs"
                    >
                      <div className="font-bold text-[10px] text-slate-400">{i + 1}</div>
                      <div className="h-4" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
