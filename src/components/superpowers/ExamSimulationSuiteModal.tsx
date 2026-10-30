import React, { useState, useEffect } from 'react';
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
  QrCode,
  Download,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { ExamSimTab, CandidateSlipData } from '../../types/extendedSuperpowers';
import { EXAM_PACKING_LIST } from '../../data/extendedExaminationData';

interface ExamSimulationSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ExamSimTab;
  studentName?: string;
}

export const ExamSimulationSuiteModal: React.FC<ExamSimulationSuiteModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'jamb_cbt',
  studentName = 'Scholar Candidate',
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
    registrationNumber: `JAMB2026/894120`,
    centerNumber: `CTR-WA-489`,
    centerName: `Apex International Examination CBT Center, Hall A`,
    examinationBoard: `Joint Admissions and Matriculation Board (JAMB UTME)`,
    sessionYear: `2026/2027 Academic Session`,
    subjects: [
      { code: 'ENG101', name: 'Use of English', date: 'April 22, 2026', time: '08:30 AM', paper: 'Paper 1 (CBT)' },
      { code: 'MTH102', name: 'Mathematics', date: 'April 22, 2026', time: '10:45 AM', paper: 'Paper 1 (CBT)' },
      { code: 'PHY103', name: 'Physics', date: 'April 23, 2026', time: '08:30 AM', paper: 'Paper 1 (CBT)' },
      { code: 'CHM104', name: 'Chemistry', date: 'April 23, 2026', time: '10:45 AM', paper: 'Paper 1 (CBT)' },
    ],
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

  // 8-Key Keyboard listener for JAMB CBT
  useEffect(() => {
    if (!isOpen || activeTab !== 'jamb_cbt') return;

    const handleJambKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        e.preventDefault();
        soundFx.playClick();
        setJambAnswers((prev) => ({ ...prev, [jambQuestionIndex]: key }));
      } else if (key === 'N') {
        e.preventDefault();
        soundFx.playClick();
        setJambQuestionIndex((prev) => Math.min(9, prev + 1));
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
  }, [isOpen, activeTab, jambQuestionIndex]);

  if (!isOpen) return null;

  const mockQuestions = [
    { q: 'Which of the following organic compounds decolorizes bromine water most rapidly?', a: 'Ethene (C₂H₄)', b: 'Ethane (C₂H₆)', c: 'Benzene (C₆H₆)', d: 'Ethanol (C₂H₅OH)', key: 'A' },
    { q: 'In the simple pendulum experiment, doubling the mass of the bob will cause the period T to:', a: 'Double', b: 'Halve', c: 'Remain unchanged', d: 'Quadruple', key: 'C' },
    { q: 'What is the value of x if 2^(2x + 1) = 32?', a: 'x = 1', b: 'x = 2', c: 'x = 3', d: 'x = 4', key: 'B' },
    { q: 'The organelle primarily responsible for cellular aerobic respiration and ATP synthesis is the:', a: 'Ribosome', b: 'Golgi body', c: 'Mitochondrion', d: 'Chloroplast', key: 'C' },
    { q: 'Which constitutional conference introduced direct election to the central legislature in Nigeria?', a: 'Clifford 1922', b: 'Richards 1946', c: 'Macpherson 1951', d: 'Lyttelton 1954', key: 'C' },
    { q: 'If sin θ = 3/5 for an acute angle θ, what is the exact value of tan θ?', a: '3/4', b: '4/3', c: '4/5', d: '5/4', key: 'A' },
    { q: 'Which of the following is an amphoteric oxide?', a: 'Na₂O', b: 'SO₂', c: 'Al₂O₃', d: 'CaO', key: 'C' },
    { q: 'A car traveling at 20 m/s decelerates uniformly to rest in 5 seconds. What is the braking distance?', a: '25 m', b: '50 m', c: '100 m', d: '200 m', key: 'B' },
    { q: 'In literary analysis, when an inanimate object is given human feelings or moods, the device is:', a: 'Hyperbole', b: 'Pathetic Fallacy', c: 'Metonymy', d: 'Chiasmus', key: 'B' },
    { q: 'The boiling point of water decreases at higher altitudes because:', a: 'Atmospheric pressure is lower', b: 'Temperature is lower', c: 'Gravity is weaker', d: 'Humidity is higher', key: 'A' },
  ];

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
          {activeTab === 'jamb_cbt' && (
            <div className="space-y-5">
              {/* CBT Topbar Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs font-mono shadow-md">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">JAMB UTME CBT ONLINE SYSTEM</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Candidate: <strong>{studentName}</strong></span>
                  <span className="text-amber-400 font-bold">Time Left: 29:45</span>
                </div>
              </div>

              {/* Question Stage + Palette */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Question Area */}
                <div className="lg:col-span-3 p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      Question {jambQuestionIndex + 1} of 10
                    </span>
                    <span className="text-slate-500">
                      Answered: {Object.keys(jambAnswers).length} / 10
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {mockQuestions[jambQuestionIndex].q}
                  </h3>

                  {/* Options A, B, C, D */}
                  <div className="space-y-2 pt-2">
                    {[
                      { key: 'A', text: mockQuestions[jambQuestionIndex].a },
                      { key: 'B', text: mockQuestions[jambQuestionIndex].b },
                      { key: 'C', text: mockQuestions[jambQuestionIndex].c },
                      { key: 'D', text: mockQuestions[jambQuestionIndex].d },
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
                          setJambQuestionIndex((prev) => Math.min(9, prev + 1));
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
                    {mockQuestions.map((_, idx) => {
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
                      <span>Unattempted ({10 - Object.keys(jambAnswers).length})</span>
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Official Examination Docket &amp; Photo Admission Pass
                  </h3>
                  <p className="text-xs text-slate-500">Printable admission pass required at the examination hall gate</p>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Docket</span>
                </button>
              </div>

              {/* Admission Pass Document */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border-2 border-slate-300 dark:border-slate-700 shadow-md space-y-5 max-w-2xl mx-auto">
                <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-white pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-black">
                      OFFICIAL EXAMINATION DOCKET
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {slipData.examinationBoard}
                    </h2>
                    <div className="text-xs font-mono text-slate-500">{slipData.sessionYear}</div>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border">
                    <QrCode className="w-10 h-10 text-slate-900 dark:text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <div className="text-slate-400 text-[10px]">CANDIDATE FULL NAME</div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {slipData.candidateName}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">REGISTRATION NUMBER</div>
                    <div className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                      {slipData.registrationNumber}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-slate-400 text-[10px]">EXAMINATION CENTER</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {slipData.centerName} ({slipData.centerNumber})
                    </div>
                  </div>
                </div>

                {/* Registered Subjects Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-slate-100 dark:bg-slate-800 p-2.5 font-bold font-mono text-[11px]">
                    <span>Subject</span>
                    <span>Date</span>
                    <span>Time</span>
                    <span>Paper</span>
                  </div>
                  {slipData.subjects.map((s, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-4 p-2.5 border-b border-slate-100 dark:border-slate-800 font-mono text-[11px]"
                    >
                      <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                      <span className="text-slate-600 dark:text-slate-400">{s.date}</span>
                      <span className="text-slate-600 dark:text-slate-400">{s.time}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">{s.paper}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Authorized Signature &amp; Stamp Required</span>
                  <span>Watermark: VERIFIED_CANDIDATE_2026</span>
                </div>
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
