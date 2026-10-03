import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileCode,
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Printer,
  FileCheck,
  Brain,
  Sliders,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { QuizResponse } from '../types/quiz';
import { soundFx } from '../utils/audio';
import {
  formatQuizUsableJson,
  formatQuizMarkdown,
  downloadQuizJson,
  downloadQuizDocFile,
  downloadQuizMarkdown,
} from '../utils/quizExporter';
import {
  exportCompletedQuizToPdf,
  printCompletedQuizPdf,
} from '../utils/quizPdfExporter';
import { QuizSummaryData } from './QuizSummaryCard';

interface QuizExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizResponse | null;
  results?: {
    score: number;
    total: number;
    timeSpentSeconds?: number;
    answers: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  };
  summaryData?: QuizSummaryData | null;
  initialTab?: 'pdf' | 'docs' | 'json' | 'markdown';
}

export const QuizExportModal: React.FC<QuizExportModalProps> = ({
  isOpen,
  onClose,
  quiz,
  results,
  summaryData,
  initialTab = 'pdf',
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'docs' | 'json' | 'markdown'>(initialTab);
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(true);
  const [studentName, setStudentName] = useState<string>('Scholar / Learner');
  const [includeTakeaways, setIncludeTakeaways] = useState<boolean>(true);
  const [includeAreasForStudy, setIncludeAreasForStudy] = useState<boolean>(true);
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);
  const [includeNotesSection, setIncludeNotesSection] = useState<boolean>(true);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen || !quiz) return null;

  const pdfOptions = {
    studentName,
    includeTakeaways,
    includeAreasForStudy,
    includeExplanations,
    includeNotesSection,
  };

  const handleCopy = () => {
    soundFx.playClick();
    let textToCopy = '';
    if (activeTab === 'json') {
      textToCopy = formatQuizUsableJson(quiz);
    } else if (activeTab === 'markdown') {
      textToCopy = formatQuizMarkdown(quiz, includeAnswers);
    } else if (activeTab === 'docs') {
      textToCopy = formatQuizMarkdown(quiz, includeAnswers);
    } else {
      // PDF summary text
      const lines = [
        `# ${quiz.quiz_title} - Study Guide`,
        `Student: ${studentName}`,
        results ? `Score: ${results.score}/${results.total} (${Math.round((results.score / results.total) * 100)}%)` : '',
        summaryData ? `\n## AI Synopsis\n${summaryData.synopsis}` : '',
        summaryData?.keyTakeaways.length ? `\n## Key Takeaways\n${summaryData.keyTakeaways.map((t) => `- ${t}`).join('\n')}` : '',
        summaryData?.areasForStudy.length ? `\n## Priority Areas for Study\n${summaryData.areasForStudy.map((a) => `- ${a.topic} [${a.needLevel}]: ${a.explanation}`).join('\n')}` : '',
        '\n## Questions & Review',
        ...quiz.questions.map((q, i) => `${i + 1}. ${q.question}\nCorrect Answer: ${q.correct_answer}\nExplanation: ${q.explanation || ''}`),
      ];
      textToCopy = lines.filter(Boolean).join('\n');
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      soundFx.playCorrect();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadDoc = () => {
    soundFx.playClick();
    downloadQuizDocFile(quiz, includeAnswers);
  };

  const handleDownloadJson = () => {
    soundFx.playClick();
    downloadQuizJson(quiz);
  };

  const handleDownloadMarkdown = () => {
    soundFx.playClick();
    downloadQuizMarkdown(quiz, includeAnswers);
  };

  const handleDownloadPdf = () => {
    soundFx.playClick();
    setIsExportingPdf(true);
    try {
      exportCompletedQuizToPdf(quiz, results, summaryData, pdfOptions);
      soundFx.playCorrect();
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintPdf = () => {
    soundFx.playClick();
    printCompletedQuizPdf(quiz, results, summaryData, pdfOptions);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Export & Study Materials</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                    PDF, DOCS & JSON
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                  {quiz.quiz_title} ({quiz.questions.length} questions)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector & Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-900/40 flex-wrap">
            {/* Format Tabs */}
            <div className="flex items-center p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl flex-wrap gap-1">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('pdf');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pdf'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF Study Guide (.pdf)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('docs');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'docs'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Docs / Word (.doc)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('json');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('markdown');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'markdown'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Markdown (.md)</span>
              </button>
            </div>

            {/* Config Toggles */}
            {activeTab === 'docs' && (
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={(e) => setIncludeAnswers(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <span>Include Teacher Answer Key</span>
              </label>
            )}
          </div>

          {/* PDF Customization Settings Bar */}
          {activeTab === 'pdf' && (
            <div className="px-6 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-slate-700 dark:text-slate-300">PDF Options:</span>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Student / Learner Name"
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 max-w-[160px]"
                />
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={includeTakeaways}
                    onChange={(e) => setIncludeTakeaways(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Synopsis & Takeaways</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={includeAreasForStudy}
                    onChange={(e) => setIncludeAreasForStudy(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Study Areas</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={includeExplanations}
                    onChange={(e) => setIncludeExplanations(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Explanations</span>
                </label>
              </div>
            </div>
          )}

          {/* Preview Area */}
          <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/80 min-h-[260px] max-h-[460px]">
            {activeTab === 'json' && (
              <pre className="whitespace-pre-wrap break-all leading-relaxed">
                {formatQuizUsableJson(quiz)}
              </pre>
            )}

            {activeTab === 'markdown' && (
              <pre className="whitespace-pre-wrap break-words leading-relaxed font-sans text-xs">
                {formatQuizMarkdown(quiz, includeAnswers)}
              </pre>
            )}

            {activeTab === 'docs' && (
              <div className="font-sans text-xs space-y-4 max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {quiz.quiz_title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Difficulty: {quiz.difficulty} &bull; Questions: {quiz.questions.length} &bull; Persona: {quiz.persona}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                  <span>Student Name: {studentName || '_____________________'}</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                  <span>Score: {results ? `${results.score} / ${results.total}` : `_____ / ${quiz.questions.length}`}</span>
                </div>

                <div className="space-y-4 pt-2">
                  {quiz.questions.slice(0, 3).map((q, idx) => (
                    <div key={q.id} className="space-y-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {idx + 1}. {q.question}
                      </p>
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-4 text-slate-600 dark:text-slate-400">
                          {q.options.map((opt, i) => (
                            <div key={i}>
                              ({['A', 'B', 'C', 'D'][i] || i + 1}) {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {quiz.questions.length > 3 && (
                    <p className="text-center text-slate-400 italic text-[11px] pt-2">
                      ...and {quiz.questions.length - 3} more questions included in the document
                    </p>
                  )}
                </div>

                {includeAnswers && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Includes complete answer key, rubrics & pedagogical rationale page break</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pdf' && (
              <div className="font-sans text-xs space-y-4 max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                {/* Header preview */}
                <div className="border-b-2 border-indigo-600 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      QUIZME &bull; PRINTABLE STUDY MATERIAL
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {quiz.quiz_title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Student: <strong className="text-slate-700 dark:text-slate-200">{studentName || 'Scholar / Learner'}</strong> &bull; Date: {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  {results && (
                    <div className="text-right">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                        {results.score}/{results.total}
                      </span>
                      <p className="text-[10px] text-slate-500 font-bold">
                        {Math.round((results.score / results.total) * 100)}% Accuracy
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Synopsis Preview */}
                {includeTakeaways && summaryData && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span>AI Performance Synopsis ({summaryData.masteryLevel})</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {summaryData.synopsis}
                    </p>
                    {summaryData.keyTakeaways.length > 0 && (
                      <div className="pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Key Takeaways:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                          {summaryData.keyTakeaways.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Areas for Study Preview */}
                {includeAreasForStudy && summaryData && summaryData.areasForStudy.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Priority Focus Areas</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {summaryData.areasForStudy.map((area, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/40 text-[10px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{area.topic}</span>
                          <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                            {area.needLevel}
                          </span>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{area.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions Preview */}
                <div className="space-y-3 pt-1">
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Question Breakdown & Explanations ({quiz.questions.length} Items)</span>
                  </h5>
                  {quiz.questions.slice(0, 2).map((q, idx) => (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {idx + 1}. {q.question}
                      </p>
                      {q.options && (
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-400 pl-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx}>
                              ({['A', 'B', 'C', 'D'][optIdx] || optIdx + 1}) {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      {includeExplanations && (
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg">
                          Correct: {q.correct_answer} &bull; {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                  {quiz.questions.length > 2 && (
                    <p className="text-center text-slate-400 italic text-[11px] pt-1">
                      ...and {quiz.questions.length - 2} more questions formatted with study notes in output PDF
                    </p>
                  )}
                </div>

                {includeNotesSection && (
                  <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl space-y-1">
                    <span className="font-bold text-slate-500 text-[10px]">Student Reflections & Action Items:</span>
                    <div className="h-6 border-b border-dashed border-slate-200 dark:border-slate-800" />
                    <div className="h-6 border-b border-dashed border-slate-200 dark:border-slate-800" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                {activeTab === 'pdf'
                  ? 'Clean, vectorized printable PDF with AI synopsis, takeaways & study notes'
                  : activeTab === 'docs'
                  ? 'Compatible with Microsoft Word, Google Docs, Apple Pages & LibreOffice'
                  : activeTab === 'json'
                  ? 'Ready for LMS imports, Canvas, Moodle, Anki & QuizMe re-import'
                  : 'Plain Markdown formatted for Notion, Obsidian & GitHub'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              {activeTab === 'pdf' && (
                <>
                  <button
                    type="button"
                    onClick={handlePrintPdf}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save to PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingPdf ? 'Exporting...' : 'Download .pdf File'}</span>
                  </button>
                </>
              )}

              {activeTab === 'docs' && (
                <button
                  type="button"
                  onClick={handleDownloadDoc}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .doc File</span>
                </button>
              )}

              {activeTab === 'json' && (
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JSON File</span>
                </button>
              )}

              {activeTab === 'markdown' && (
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Markdown</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
