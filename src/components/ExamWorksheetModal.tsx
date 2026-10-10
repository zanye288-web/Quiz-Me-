import React, { useState, useEffect } from 'react';
import { QuizResponse, Question } from '../types/quiz';
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  FileCode,
  ClipboardCheck,
  Calculator,
  Clock,
  Award,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ExamWorksheetModalProps {
  quiz: QuizResponse;
  isOpen?: boolean;
  onClose: () => void;
}

interface OrganizedExamData {
  examCode: string;
  institutionHeader: string;
  paperTitle: string;
  recommendedTimeMinutes: number;
  calculatorAllowed: boolean;
  totalMarks: number;
  candidateInstructions: string[];
  organizedItems: Array<{
    questionNumber: number;
    section: string;
    marks: number;
    commandWord: string;
    formattedPrompt: string;
    options?: string[];
    markSchemeBreakdown: string[];
    examinerNotes: string;
  }>;
}

export const ExamWorksheetModal: React.FC<ExamWorksheetModalProps> = ({
  quiz,
  isOpen = true,
  onClose,
}) => {
  const [worksheetType, setWorksheetType] = useState<'student' | 'solution' | 'both'>('both');
  const [institutionName, setInstitutionName] = useState('Quiz Me! International Examination Board');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(Math.max(15, quiz.questions.length * 3));
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [aiOrganizing, setAiOrganizing] = useState(false);
  const [organizedExam, setOrganizedExam] = useState<OrganizedExamData | null>(null);

  const runAiExamOrganizer = async () => {
    setAiOrganizing(true);
    soundFx.playClick();
    try {
      const res = await fetch('/api/organize-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizTitle: quiz.quiz_title,
          difficulty: quiz.difficulty || 'Intermediate',
          questions: quiz.questions,
        }),
      });
      const data = await res.json();
      if (data.success && data.organizedExam) {
        setOrganizedExam(data.organizedExam);
        if (data.organizedExam.recommendedTimeMinutes) {
          setTimeLimitMinutes(data.organizedExam.recommendedTimeMinutes);
        }
        soundFx.playSuccess();
      }
    } catch {
      // Fallback handled automatically
    } finally {
      setAiOrganizing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    runAiExamOrganizer();
  }, [quiz.quiz_title, isOpen]);

  if (!isOpen) return null;

  const handlePrintPdf = () => {
    soundFx.playClick();
    window.print();
  };

  const getItemMarks = (idx: number, q: Question) => {
    const org = organizedExam?.organizedItems?.[idx];
    if (org?.marks) return org.marks;
    return q.type === 'open_explanation' ? 4 : q.type === 'fill_in_blank' ? 2 : 1;
  };

  const getItemMarkScheme = (idx: number, q: Question): string[] => {
    const org = organizedExam?.organizedItems?.[idx];
    if (org?.markSchemeBreakdown && org.markSchemeBreakdown.length > 0) {
      return org.markSchemeBreakdown;
    }
    const marks = getItemMarks(idx, q);
    if (marks === 1) return [`[B1] 1 mark for correct identification: "${q.correct_answer}"`];
    if (marks === 2) {
      return [
        `[M1] 1 mark for identifying core principle or method`,
        `[A1] 1 mark for exact answer: "${q.correct_answer}"`,
      ];
    }
    return [
      `[C1] 1 mark for clear conceptual definition`,
      `[M1] 1 mark for step-by-step analytical reasoning`,
      `[A1] 1 mark for accurate synthesis: "${q.correct_answer}"`,
      `[E1] 1 mark for relevant example or boundary check`,
    ];
  };

  const totalPossibleMarks =
    organizedExam?.totalMarks ||
    quiz.questions.reduce((acc, q, idx) => acc + getItemMarks(idx, q), 0);

  const handleDownloadTxt = () => {
    soundFx.playClick();
    const lines: string[] = [];
    lines.push('============================================================================');
    lines.push(institutionName.toUpperCase());
    lines.push(`OFFICIAL EXAMINATION PAPER: ${quiz.quiz_title.toUpperCase()}`);
    lines.push(`PAPER CODE: ${organizedExam?.examCode || 'QM-EXAM-2025'} | TIME ALLOWED: ${timeLimitMinutes} MINS | TOTAL MARKS: ${totalPossibleMarks}`);
    lines.push('============================================================================\n');

    if (worksheetType === 'student' || worksheetType === 'both') {
      lines.push('CANDIDATE NAME: ___________________________   DATE: _______________');
      lines.push('CANDIDATE ID:   ___________________________   SCORE: ____ / ' + totalPossibleMarks + '\n');
      lines.push('CANDIDATE INSTRUCTIONS:');
      (organizedExam?.candidateInstructions || [
        'Answer ALL questions in the spaces provided.',
        'Show all working clearly to earn method marks [M1] and accuracy marks [A1].',
      ]).forEach((inst, i) => lines.push(`  ${i + 1}. ${inst}`));
      lines.push('\n----------------------------------------------------------------------------');
      lines.push('SECTION 1: EXAMINATION QUESTIONS');
      lines.push('----------------------------------------------------------------------------\n');

      quiz.questions.forEach((q: Question, idx: number) => {
        const marks = getItemMarks(idx, q);
        const orgItem = organizedExam?.organizedItems?.[idx];
        lines.push(`Question ${idx + 1} [${marks} ${marks === 1 ? 'mark' : 'marks'}] (${orgItem?.section || q.domain || 'Core Assessment'}):`);
        lines.push(`${orgItem?.formattedPrompt || q.question}\n`);
        if (q.code_snippet) {
          lines.push('--- Code / Reference Block ---');
          lines.push(q.code_snippet);
          lines.push('------------------------------\n');
        }
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, oIdx) => {
            const letter = String.fromCharCode(65 + oIdx);
            lines.push(`   [ ${letter} ] ${opt}`);
          });
          lines.push('');
        } else {
          lines.push('   Working / Written Answer: _______________________________________________');
          lines.push('   _________________________________________________________________________\n');
        }
      });
    }

    if (worksheetType === 'solution' || worksheetType === 'both') {
      lines.push('\n============================================================================');
      lines.push('OFFICIAL EXAMINER MARK SCHEME & GRADING RUBRIC');
      lines.push('============================================================================\n');
      quiz.questions.forEach((q: Question, idx: number) => {
        const marks = getItemMarks(idx, q);
        const breakdown = getItemMarkScheme(idx, q);
        lines.push(`Q${idx + 1} (${marks} ${marks === 1 ? 'mark' : 'marks'}) — Verified Answer: ${q.correct_answer}`);
        breakdown.forEach((b) => lines.push(`   • ${b}`));
        if (includeExplanations && q.explanation) {
          lines.push(`   Examiner Rationale: ${q.explanation}`);
        }
        lines.push('');
      });
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.quiz_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_exam_${worksheetType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = () => {
    soundFx.playClick();
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>${quiz.quiz_title} - Exam & Mark Scheme</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; color: #111827; line-height: 1.5; padding: 24px; }
        h1 { font-size: 20pt; margin-bottom: 4px; color: #1e1b4b; }
        h2 { font-size: 14pt; margin-top: 20px; border-bottom: 2px solid #1e1b4b; padding-bottom: 4px; }
        .meta { font-size: 10pt; color: #4b5563; margin-bottom: 16px; }
        .question-box { margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
        .marks { font-weight: bold; color: #4338ca; float: right; }
        .mark-scheme { background-color: #f0fdf4; border: 1px solid #86efac; padding: 10px; margin-top: 8px; }
      </style>
      </head>
      <body>
        <div style="text-align:center; border-bottom: 3px double #111827; padding-bottom: 12px; margin-bottom: 20px;">
          <div style="font-size: 10pt; font-weight: bold; letter-spacing: 2px;">${institutionName.toUpperCase()}</div>
          <h1>${quiz.quiz_title}</h1>
          <div class="meta">Paper Code: ${organizedExam?.examCode || 'QM-2025'} | Time Allowed: ${timeLimitMinutes} Minutes | Total Marks: ${totalPossibleMarks}</div>
        </div>
        ${
          worksheetType === 'student' || worksheetType === 'both'
            ? `
          <p><strong>Candidate Name:</strong> ____________________________ &nbsp;&nbsp; <strong>Candidate ID:</strong> ________________</p>
          <h2>Section I: Examination Paper</h2>
          ${quiz.questions
            .map((q, idx) => {
              const marks = getItemMarks(idx, q);
              return `
                <div class="question-box">
                  <p><strong>Question ${idx + 1} (${marks} ${marks === 1 ? 'mark' : 'marks'}):</strong> ${q.question}</p>
                  ${
                    q.options && q.options.length > 0
                      ? `<ul>${q.options.map((opt, i) => `<li><strong>${String.fromCharCode(65 + i)}.</strong> ${opt}</li>`).join('')}</ul>`
                      : `<p><em>Answer / Working:</em><br/>________________________________________________________________________<br/>________________________________________________________________________</p>`
                  }
                </div>
              `;
            })
            .join('')}
        `
            : ''
        }
        ${
          worksheetType === 'solution' || worksheetType === 'both'
            ? `
          <br style="page-break-before: always;" />
          <h2>Section II: Official Examiner Mark Scheme</h2>
          ${quiz.questions
            .map((q, idx) => {
              const marks = getItemMarks(idx, q);
              const breakdown = getItemMarkScheme(idx, q);
              return `
                <div class="mark-scheme">
                  <p><strong>Q${idx + 1} [${marks} ${marks === 1 ? 'mark' : 'marks'}] — Verified Answer:</strong> ${q.correct_answer}</p>
                  <ul>${breakdown.map((b) => `<li>${b}</li>`).join('')}</ul>
                  ${includeExplanations && q.explanation ? `<p><em>Examiner Rationale:</em> ${q.explanation}</p>` : ''}
                </div>
              `;
            })
            .join('')}
        `
            : ''
        }
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.quiz_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_exam_${worksheetType}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Modal Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  AI Exam Generator & Official Mark Scheme
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                  PDF • DOC • TXT Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI-organized examination paper with point allocations ([M1], [A1], [B1]) and official grading rubric
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={runAiExamOrganizer}
              disabled={aiOrganizing}
              className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiOrganizing ? 'animate-spin' : ''}`} />
              <span>{aiOrganizing ? 'AI Organizing...' : 'AI Re-Organize Exam'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDocx}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>DOC / Word</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF / Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="px-5 py-3 bg-slate-100/70 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'both', label: 'Exam + Mark Scheme Bundle' },
              { id: 'student', label: 'Candidate Exam Paper Only' },
              { id: 'solution', label: 'Official Mark Scheme Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setWorksheetType(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  worksheetType === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
              placeholder="Institution Header"
            />
            <label className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeExplanations}
                onChange={(e) => setIncludeExplanations(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span>Examiner Notes</span>
            </label>
          </div>
        </div>

        {/* Printable Exam & Mark Scheme Preview */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 print:shadow-none print:border-0 print:p-0">
            {/* Official Exam Cover Banner */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                <span>{institutionName}</span>
                <span>PAPER CODE: {organizedExam?.examCode || 'QM-2025-STD'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {organizedExam?.paperTitle || quiz.quiz_title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Time Allowed: {timeLimitMinutes} Minutes</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Total Marks: {totalPossibleMarks} Marks</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    Calculator: {organizedExam?.calculatorAllowed || quiz.calculatorEnabled ? 'Permitted' : 'Not Required'}
                  </span>
                </span>
              </div>

              {worksheetType !== 'solution' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Candidate Name</span>
                    <div className="h-5 border-b border-dotted border-slate-300 dark:border-slate-700 mt-1" />
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Candidate ID / Seat</span>
                    <div className="h-5 border-b border-dotted border-slate-300 dark:border-slate-700 mt-1" />
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Examiner Score</span>
                    <div className="h-5 font-mono font-black text-right text-slate-500 mt-1">
                      _____ / {totalPossibleMarks}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Questions & Mark Scheme Items */}
            <div className="space-y-6">
              {quiz.questions.map((q: Question, idx: number) => {
                const orgItem = organizedExam?.organizedItems?.[idx];
                const marks = getItemMarks(idx, q);
                const scheme = getItemMarkScheme(idx, q);

                return (
                  <div
                    key={q.id || idx}
                    className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs shrink-0 mt-0.5">
                          Q{idx + 1}
                        </span>
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {orgItem?.section || q.domain || 'Section A'} • Command: {orgItem?.commandWord || 'Analyze'}
                          </div>
                          <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {orgItem?.formattedPrompt || q.question}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-black text-xs shrink-0">
                        [{marks} {marks === 1 ? 'mark' : 'marks'}]
                      </span>
                    </div>

                    {q.code_snippet && (
                      <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                        <code>{q.code_snippet}</code>
                      </pre>
                    )}

                    {/* Options for Objective Questions */}
                    {worksheetType !== 'solution' && q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          return (
                            <div
                              key={optIdx}
                              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-2 text-xs"
                            >
                              <span className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 bg-white dark:bg-slate-700">
                                {letter}
                              </span>
                              <span className="flex-1">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Written answer lines for Student Paper */}
                    {worksheetType !== 'solution' && (!q.options || q.options.length === 0) && (
                      <div className="pl-8 pt-2 space-y-3">
                        <div className="h-6 border-b border-dashed border-slate-300 dark:border-slate-700" />
                        <div className="h-6 border-b border-dashed border-slate-300 dark:border-slate-700" />
                        <div className="h-6 border-b border-dashed border-slate-300 dark:border-slate-700" />
                      </div>
                    )}

                    {/* Official Mark Scheme Box */}
                    {(worksheetType === 'solution' || worksheetType === 'both') && (
                      <div className="ml-8 mt-3 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <ClipboardCheck className="w-4 h-4" />
                            <span>OFFICIAL MARK SCHEME — Target Answer: {q.correct_answer}</span>
                          </span>
                          <span className="font-mono font-bold text-[11px] text-emerald-700 dark:text-emerald-400">
                            Max: {marks} {marks === 1 ? 'pt' : 'pts'}
                          </span>
                        </div>

                        <ul className="space-y-1 pl-1">
                          {scheme.map((criterion, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{criterion}</span>
                            </li>
                          ))}
                        </ul>

                        {includeExplanations && (orgItem?.examinerNotes || q.explanation) && (
                          <div className="pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/50 text-[11px] text-slate-600 dark:text-slate-300">
                            <strong className="font-bold">Examiner Guidance: </strong>
                            {orgItem?.examinerNotes || q.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
