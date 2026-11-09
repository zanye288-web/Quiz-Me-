import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Monitor,
  FileCheck2,
  Clock,
  AlertTriangle,
  Briefcase,
  Printer,
  CheckCircle2,
  Circle,
  Sparkles,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import type { Question } from '../../types/quiz';
import { ExamSimTab, CandidateSlipData } from '../../types/extendedSuperpowers';
import { EXAM_PACKING_LIST } from '../../data/extendedExaminationData';

interface ExamSimulationSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ExamSimTab;
  studentName?: string;
  /** Real multiple-choice questions (4 options) to run the CBT simulation with. */
  questions?: Question[];
}

export const ExamSimulationSuiteModal: React.FC<ExamSimulationSuiteModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'jamb_cbt',
  studentName = 'Scholar Candidate',
  questions = [],
}) => {
  const [activeTab, setActiveTab] = useState<ExamSimTab>(initialTab);

  // JAMB 8-Key Simulator State
  const [jambQuestionIndex, setJambQuestionIndex] = useState<number>(0);
  const [jambAnswers, setJambAnswers] = useState<Record<number, string>>({});
  const [jambSubmitted, setJambSubmitted] = useState<boolean>(false);
  const [jambTimeRemaining, setJambTimeRemaining] = useState<number>(1800); // 30 mins

  // Candidate Seat Slip State
  const [slipData, setSlipData] = useState<CandidateSlipData>({
    candidateName: studentName,
    registrationNumber: '',
    centerNumber: '',
    centerName: '',
    examinationBoard: '',
    sessionYear: '',
    subjects: [],
  });

  // Time Budget Advisor State
  const [totalExamMinutes, setTotalExamMinutes] = useState<number>(120);
  const [totalExamQuestions, setTotalExamQuestions] = useState<number>(50);
  const [readingTimeMinutes, setReadingTimeMinutes] = useState<number>(10);
  const [reviewBufferMinutes, setReviewBufferMinutes] = useState<number>(15);

  // Packing Checklist State
  const [packingChecked, setPackingChecked] = useState<Record<string, boolean>>({
    p1: true,
    p2: true,
    p3: true,
    p4: true,
    p5: true,
    p6: true,
    p7: true,
  });

  // Negative Marking Simulator State
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(40);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(60); // % confidence in knowledge
  const [penaltyPerWrong, setPenaltyPerWrong] = useState<number>(0.25); // -0.25 or -1.0

  // Only genuine 4-option multiple-choice questions are used; nothing is hardcoded here.
  const examQuestions = useMemo(
    () =>
      questions
        .filter((q) => q.type === 'multiple_choice' && Array.isArray(q.options) && q.options.length === 4)
        .map((q) => {
          const opts = q.options as string[];
          const idx = opts.findIndex((o) => o === q.correct_answer);
          return {
            q: q.question,
            a: opts[0],
            b: opts[1],
            c: opts[2],
            d: opts[3],
            key: idx >= 0 ? 'ABCD'[idx] : '',
          };
        }),
    [questions]
  );
  const questionCount = examQuestions.length;

  // Real countdown (replaces a frozen label)
  useEffect(() => {
    if (!isOpen || activeTab !== 'jamb_cbt' || jambSubmitted || questionCount === 0) return;
    const t = setInterval(() => {
      setJambTimeRemaining((prev) => {
        if (prev <= 1) {
          setJambSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isOpen, activeTab, jambSubmitted, questionCount]);

  // 8-Key Keyboard listener for JAMB CBT
  useEffect(() => {
    if (!isOpen || activeTab !== 'jamb_cbt') return;

    const handleJambKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (questionCount === 0) return;
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        e.preventDefault();
        soundFx.playClick();
        setJambAnswers((prev) => ({ ...prev, [jambQuestionIndex]: key }));
      } else if (key === 'N') {
        e.preventDefault();
        soundFx.playClick();
        setJambQuestionIndex((prev) => Math.min(questionCount - 1, prev + 1));
      } else if (key === 'P') {
        e.preventDefault();
        soundFx.playClick();
        setJambQuestionIndex((prev) => Math.max(0, prev - 1));
      } else if (key === 'R') {
        e.preventDefault();
        soundFx.playClick();
        setJambAnswers((prev) => {
          const updated = { ...prev };
          delete updated[jambQuestionIndex];
          return updated;
        });
      } else if (key === 'S') {
        e.preventDefault();
        soundFx.playComplete();
        setJambSubmitted(true);
      }
    };

    window.addEventListener('keydown', handleJambKey);
    return () => window.removeEventListener('keydown', handleJambKey);
  }, [isOpen, activeTab, jambQuestionIndex, questionCount]);

  if (!isOpen) return null;

  const mm = String(Math.floor(jambTimeRemaining / 60)).padStart(2, '0');
  const ss = String(jambTimeRemaining % 60).padStart(2, '0');

  // Time Budget calculations
  const netSolvingMinutes = Math.max(10, totalExamMinutes - readingTimeMinutes - reviewBufferMinutes);
  const secondsPerQuestion = Math.round((netSolvingMinutes * 60) / (totalExamQuestions || 1));

  // Negative Marking expected score
  const correctCount = Math.round((questionsAnswered * confidenceLevel) / 100);
  const wrongCount = questionsAnswered - correctCount;
  const expectedRawScore = (correctCount * 1 - wrongCount * penaltyPerWrong).toFixed(2);
  const randomGuessEV = (questionsAnswered * (0.25 * 1 - 0.75 * penaltyPerWrong)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Examination Simulation &amp; Hall Pass Suite
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                  JAMB 8-Key CBT · Hall Pass · Budgeting
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official 8-Key Computer Based Testing, Candidate Docket Generator, Time Budgeting &amp; Equipment Checklist
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'jamb_cbt' as ExamSimTab, label: 'JAMB 8-Key CBT Simulator', icon: Monitor },
            { id: 'seat_slip' as ExamSimTab, label: 'Candidate Seat Slip / Docket', icon: FileCheck2 },
            { id: 'time_budget' as ExamSimTab, label: 'Exam Time Budgeting Advisor', icon: Clock },
            { id: 'guessing_penalty' as ExamSimTab, label: 'Negative Marking Risk Simulator', icon: AlertTriangle },
            { id: 'packing_checklist' as ExamSimTab, label: 'Exam Day Packing Checklist', icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-2xs font-bold border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Stage Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: JAMB 8-KEY CBT */}
          {activeTab === 'jamb_cbt' && questionCount === 0 && (
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No questions loaded yet</h3>
              <p className="text-xs text-slate-500">
                The CBT simulator runs on real exam questions. Generate or open an exam from Exam Mode, then launch the
                simulator again.
              </p>
            </div>
          )}

          {activeTab === 'jamb_cbt' && questionCount > 0 && (
            <div className="space-y-5">
              {/* CBT Topbar Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs font-mono shadow-md">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">JAMB UTME CBT ONLINE SYSTEM</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Candidate: <strong>{studentName}</strong></span>
                  <span className="text-amber-400 font-bold">Time Left: {mm}:{ss}</span>
                </div>
              </div>

              {/* Question Stage + Palette */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Question Area */}
                <div className="lg:col-span-3 p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      Question {jambQuestionIndex + 1} of {questionCount}
                    </span>
                    <span className="text-slate-500">
                      Answered: {Object.keys(jambAnswers).length} / {questionCount}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {examQuestions[jambQuestionIndex].q}
                  </h3>

                  {/* Options A, B, C, D */}
                  <div className="space-y-2 pt-2">
                    {[
                      { key: 'A', text: examQuestions[jambQuestionIndex].a },
                      { key: 'B', text: examQuestions[jambQuestionIndex].b },
                      { key: 'C', text: examQuestions[jambQuestionIndex].c },
                      { key: 'D', text: examQuestions[jambQuestionIndex].d },
                    ].map((opt) => {
                      const isSelected = jambAnswers[jambQuestionIndex] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setJambAnswers((prev) => ({ ...prev, [jambQuestionIndex]: opt.key }));
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-semibold ring-2 ring-rose-500/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                              isSelected
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="text-xs">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 8-KEY VIRTUAL KEYPAD (A, B, C, D, N, P, R, S) */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400 mb-2 uppercase font-bold text-center">
                      Official JAMB 8-Key Physical Keypad (Type on Keyboard or Click Below)
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {['A', 'B', 'C', 'D'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setJambAnswers((prev) => ({ ...prev, [jambQuestionIndex]: key }));
                          }}
                          className={`py-2.5 rounded-xl font-mono font-black text-sm border shadow-2xs transition-all cursor-pointer ${
                            jambAnswers[jambQuestionIndex] === key
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          [{key}]
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setJambQuestionIndex((prev) => Math.max(0, prev - 1));
                        }}
                        className="py-2.5 rounded-xl font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        [P] Prev
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setJambQuestionIndex((prev) => Math.min(questionCount - 1, prev + 1));
                        }}
                        className="py-2.5 rounded-xl font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        [N] Next
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setJambAnswers((prev) => {
                            const updated = { ...prev };
                            delete updated[jambQuestionIndex];
                            return updated;
                          });
                        }}
                        className="py-2.5 rounded-xl font-mono font-bold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        [R] Reverse
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playComplete();
                          setJambSubmitted(true);
                        }}
                        className="py-2.5 rounded-xl font-mono font-bold text-xs bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-500 shadow-xs cursor-pointer"
                      >
                        [S] Submit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Palette Grid */}
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Question Palette</div>
                  <div className="grid grid-cols-5 gap-2">
                    {examQuestions.map((_, idx) => {
                      const isAnswered = !!jambAnswers[idx];
                      const isCurrent = jambQuestionIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setJambQuestionIndex(idx);
                          }}
                          className={`w-full aspect-square rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isCurrent
                              ? 'bg-rose-600 text-white ring-2 ring-rose-600/40'
                              : isAnswered
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-emerald-600" />
                      <span>Answered ({Object.keys(jambAnswers).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-white dark:bg-slate-800 border border-slate-300" />
                      <span>Unattempted ({questionCount - Object.keys(jambAnswers).length})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATE SEAT SLIP / DOCKET */}
          {activeTab === 'seat_slip' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Exam Day Card</h3>
                  <p className="text-xs text-slate-500">
                    A personal reminder you fill in yourself. It is not an official document and does not replace your
                    admission slip from the exam body.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Card</span>
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-4 max-w-2xl mx-auto">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-black">
                  Personal reminder · not an official document
                </span>
                {([
                  ['candidateName', 'Your name'],
                  ['registrationNumber', 'Registration number (from your official slip)'],
                  ['examinationBoard', 'Exam (e.g. JAMB UTME, WAEC)'],
                  ['sessionYear', 'Session / year'],
                  ['centerName', 'Exam centre name'],
                  ['centerNumber', 'Centre number'],
                ] as const).map(([field, label]) => (
                  <label key={field} className="block text-xs">
                    <span className="text-slate-500">{label}</span>
                    <input
                      value={slipData[field]}
                      onChange={(e) => setSlipData((prev) => ({ ...prev, [field]: e.target.value.slice(0, 120) }))}
                      className="mt-1 w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </label>
                ))}

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-slate-100 dark:bg-slate-800 p-2.5 font-bold font-mono text-[11px]">
                    <span>Subject</span>
                    <span>Date</span>
                    <span>Time</span>
                    <span>Paper</span>
                  </div>
                  {slipData.subjects.map((sub, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-1 p-1.5 border-b border-slate-100 dark:border-slate-800">
                      {(['name', 'date', 'time', 'paper'] as const).map((f) => (
                        <input
                          key={f}
                          value={sub[f]}
                          aria-label={f}
                          onChange={(e) =>
                            setSlipData((prev) => ({
                              ...prev,
                              subjects: prev.subjects.map((x, i) => (i === idx ? { ...x, [f]: e.target.value.slice(0, 60) } : x)),
                            }))
                          }
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px]"
                        />
                      ))}
                    </div>
                  ))}
                  {slipData.subjects.length === 0 && (
                    <div className="p-3 text-slate-500">No subjects added yet.</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSlipData((prev) => ({
                      ...prev,
                      subjects: [...prev.subjects, { code: '', name: '', date: '', time: '', paper: '' }],
                    }))
                  }
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
                >
                  + Add subject
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TIME BUDGET ADVISOR */}
          {activeTab === 'time_budget' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Examination Time-Allocation Budgeting Calculator
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Total Exam Time (mins)</label>
                    <input
                      type="number"
                      value={totalExamMinutes}
                      onChange={(e) => setTotalExamMinutes(parseInt(e.target.value, 10) || 60)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Total Questions</label>
                    <input
                      type="number"
                      value={totalExamQuestions}
                      onChange={(e) => setTotalExamQuestions(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Reading Buffer (mins)</label>
                    <input
                      type="number"
                      value={readingTimeMinutes}
                      onChange={(e) => setReadingTimeMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Final Review Buffer (mins)</label>
                    <input
                      type="number"
                      value={reviewBufferMinutes}
                      onChange={(e) => setReviewBufferMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                </div>

                {/* Time Allocation Result */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">Net Solving Window</div>
                    <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200 mt-1">
                      {netSolvingMinutes} mins
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">Target Time Per Question</div>
                    <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                      {Math.floor(secondsPerQuestion / 60)}m {secondsPerQuestion % 60}s
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">({secondsPerQuestion} seconds total)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NEGATIVE MARKING SIMULATOR */}
          {activeTab === 'guessing_penalty' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Negative Marking Penalty &amp; Guessing Risk Calculator
                  </h3>
                  <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold">
                    Penalty: -{penaltyPerWrong} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Questions Attempted</label>
                    <input
                      type="number"
                      value={questionsAnswered}
                      onChange={(e) => setQuestionsAnswered(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Candidate Accuracy Confidence ({confidenceLevel}%)</label>
                    <input
                      type="range"
                      min="25"
                      max="100"
                      value={confidenceLevel}
                      onChange={(e) => setConfidenceLevel(parseInt(e.target.value, 10))}
                      className="w-full cursor-pointer accent-rose-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Penalty Fraction</label>
                    <select
                      value={penaltyPerWrong}
                      onChange={(e) => setPenaltyPerWrong(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono cursor-pointer"
                    >
                      <option value="0.25">-0.25 (Old SAT / Standard 4-option 1/4 deduction)</option>
                      <option value="0.33">-0.33 (3-option 1/3 deduction)</option>
                      <option value="1.0">-1.0 (Severe JEE/NEET full negative mark)</option>
                      <option value="0.0">0.0 (WAEC / JAMB / Digital SAT — No negative marks)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] font-mono">Net Expected Raw Score</div>
                    <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                      {expectedRawScore} / {questionsAnswered}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      {correctCount} correct (+{correctCount}) - {wrongCount} wrong (-{(wrongCount * penaltyPerWrong).toFixed(2)})
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] font-mono">Blind Random Guessing EV</div>
                    <div className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400 mt-2">
                      {randomGuessEV}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      {penaltyPerWrong === 0 ? 'Always guess! EV is positive.' : 'Do NOT blind guess if you cannot eliminate at least 2 options.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PACKING CHECKLIST */}
          {activeTab === 'packing_checklist' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Official Exam Day Equipment &amp; Stationery Checklist
                  </h3>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {Object.values(packingChecked).filter(Boolean).length} / {EXAM_PACKING_LIST.length} Packed
                  </span>
                </div>

                <div className="space-y-2">
                  {EXAM_PACKING_LIST.map((item) => {
                    const isChecked = !!packingChecked[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setPackingChecked((prev) => ({ ...prev, [item.id]: !isChecked }));
                        }}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/60 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                          <span className={`text-xs ${isChecked ? 'line-through opacity-80' : 'font-semibold'}`}>
                            {item.item}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {item.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
