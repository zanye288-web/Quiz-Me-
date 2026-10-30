import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Calculator,
  BookOpen,
  Edit3,
  CheckCircle2,
  Clock,
  HelpCircle,
  Award,
  Search,
  Copy,
  Check,
  RotateCcw,
  Download,
  Trash2,
  Volume2,
  Play,
  Pause,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';
import { ExamFormatId } from '../../types/quiz';
import {
  FORMULA_BOOKLET_DATA,
  PHYSICAL_CONSTANTS_CATALOG,
  EXAM_COMMAND_WORDS,
  GRADE_BOUNDARY_SYSTEMS,
  UPCOMING_EXAM_SCHEDULES,
} from '../../data/examinationFormulasAndConstants';
import { soundFx } from '../../utils/audio';

export type ToolboxTab =
  | 'formulas'
  | 'calculator'
  | 'scratchpad'
  | 'omr_sheet'
  | 'grade_boundaries'
  | 'command_words'
  | 'countdowns'
  | 'pomodoro';

interface ExamToolboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ToolboxTab;
  currentExamFormat?: ExamFormatId;
  onInsertCalculation?: (val: string) => void;
}

export const ExamToolboxModal: React.FC<ExamToolboxModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'formulas',
  currentExamFormat = 'waec',
  onInsertCalculation,
}) => {
  const [activeTab, setActiveTab] = useState<ToolboxTab>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // ==================== 1. FORMULA BOOKLET STATE ====================
  const [formulaSubject, setFormulaSubject] = useState<'all' | 'mathematics' | 'physics' | 'chemistry'>('all');
  const [formulaSearch, setFormulaSearch] = useState('');
  const [copiedFormulaId, setCopiedFormulaId] = useState<string | null>(null);

  const handleCopyFormula = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormulaId(id);
    soundFx.playClick();
    setTimeout(() => setCopiedFormulaId(null), 2000);
  };

  const filteredFormulas = FORMULA_BOOKLET_DATA.filter((item) => {
    if (formulaSubject !== 'all' && item.category !== formulaSubject) return false;
    if (formulaSearch.trim()) {
      const q = formulaSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.formulaPlain.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q) ||
        item.variables.some((v) => v.meaning.toLowerCase().includes(q) || v.symbol.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // ==================== 2. SCIENTIFIC CALCULATOR STATE ====================
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [memoryVal, setMemoryVal] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');

  const handleCalcInput = (token: string) => {
    soundFx.playClick();
    setCalcDisplay((prev) => {
      if (prev === '0' && !isNaN(Number(token))) return token;
      if (prev === 'Error') return token;
      return prev + token;
    });
  };

  const handleCalcClear = () => {
    soundFx.playClick();
    setCalcDisplay('0');
  };

  const handleCalcBackspace = () => {
    soundFx.playClick();
    setCalcDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const handleCalcEvaluate = () => {
    try {
      soundFx.playClick();
      // Replace friendly tokens with Math expressions safely
      let expr = calcDisplay
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e(?![a-z])/g, 'Math.E')
        .replace(/sin\(/g, angleMode === 'DEG' ? 'Math.sin((Math.PI/180)*' : 'Math.sin(')
        .replace(/cos\(/g, angleMode === 'DEG' ? 'Math.cos((Math.PI/180)*' : 'Math.cos(')
        .replace(/tan\(/g, angleMode === 'DEG' ? 'Math.tan((Math.PI/180)*' : 'Math.tan(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/\^/g, '**');

      // Safe arithmetic evaluation
      const res = Function(`'use strict'; return (${expr})`)();
      if (typeof res === 'number' && !isNaN(res)) {
        const rounded = Number(res.toFixed(8)).toString();
        setCalcHistory((prev) => [`${calcDisplay} = ${rounded}`, ...prev.slice(0, 8)]);
        setCalcDisplay(rounded);
      } else {
        setCalcDisplay('Error');
      }
    } catch {
      setCalcDisplay('Error');
    }
  };

  // ==================== 3. SCRATCHPAD CANVAS STATE ====================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#4f46e5');
  const [penSize, setPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [historySnapshots, setHistorySnapshots] = useState<ImageData[]>([]);

  useEffect(() => {
    if (activeTab !== 'scratchpad') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Set resolution matching client size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = 420 * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [activeTab]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistorySnapshots((prev) => [...prev.slice(-10), snap]);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    saveCanvasState();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = isEraser ? '#ffffff' : penColor;
    ctx.lineWidth = isEraser ? penSize * 4 : penSize;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleCanvasUndo = () => {
    if (historySnapshots.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const last = historySnapshots[historySnapshots.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistorySnapshots((prev) => prev.slice(0, -1));
    soundFx.playClick();
  };

  const handleCanvasClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistorySnapshots([]);
    soundFx.playClick();
  };

  const handleCanvasDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `exam-working-scratchpad-${Date.now()}.png`;
    a.click();
    soundFx.playClick();
  };

  // ==================== 4. OMR BUBBLE SHEET SIMULATOR ====================
  const [omrAnswers, setOmrAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [omrAnswerKey] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({
    1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A',
    6: 'B', 7: 'C', 8: 'A', 9: 'D', 10: 'C',
    11: 'B', 12: 'A', 13: 'D', 14: 'C', 15: 'B',
    16: 'A', 17: 'C', 18: 'D', 19: 'B', 20: 'A',
  });
  const [omrSubmitted, setOmrSubmitted] = useState(false);

  const handleSelectOmrBubble = (qNum: number, opt: 'A' | 'B' | 'C' | 'D') => {
    if (omrSubmitted) return;
    soundFx.playClick();
    setOmrAnswers((prev) => ({ ...prev, [qNum]: opt }));
  };

  const omrScore = Object.keys(omrAnswers).reduce((acc, k) => {
    const qNum = Number(k);
    return acc + (omrAnswers[qNum] === omrAnswerKey[qNum] ? 1 : 0);
  }, 0);

  // ==================== 5. GRADE BOUNDARY ESTIMATOR ====================
  const [selectedGradeBoard, setSelectedGradeBoard] = useState<ExamFormatId>(currentExamFormat);
  const [userRawScore, setUserRawScore] = useState<number>(76);

  const activeGradeSystem = GRADE_BOUNDARY_SYSTEMS.find((g) => g.boardId === selectedGradeBoard) || GRADE_BOUNDARY_SYSTEMS[0];
  const predictedGrade = activeGradeSystem.boundaries.find(
    (b) => userRawScore >= b.minPercentage && userRawScore <= b.maxPercentage
  ) || activeGradeSystem.boundaries[activeGradeSystem.boundaries.length - 1];

  // ==================== 6. POMODORO TIMER STATE ====================
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoRoundsCompleted, setPomoRoundsCompleted] = useState(0);
  const [ambientAudioMode, setAmbientAudioMode] = useState<'off' | 'binaural432' | 'rain' | 'whitenoise'>('off');

  useEffect(() => {
    if (!pomoRunning) return;
    const interval = setInterval(() => {
      setPomoSeconds((prevSec) => {
        if (prevSec > 0) return prevSec - 1;
        setPomoMinutes((prevMin) => {
          if (prevMin > 0) return prevMin - 1;
          // Completed
          soundFx.playComplete();
          setPomoRoundsCompleted((r) => r + 1);
          setPomoRunning(false);
          return 25;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomoRunning]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Global Examination Superpowers &amp; Candidate Tools
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Formula Compendiums · Scientific Calculator · Working Scratchpad · OMR Bubble Sheet · Boundary Predictor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'formulas', label: 'Formula Booklet & Constants', icon: BookOpen },
            { id: 'calculator', label: 'Scientific & Graphing Calc', icon: Calculator },
            { id: 'scratchpad', label: 'Working Scratchpad', icon: Edit3 },
            { id: 'omr_sheet', label: 'OMR Bubble Sheet', icon: FileSpreadsheet },
            { id: 'grade_boundaries', label: 'Grade Predictor', icon: Award },
            { id: 'command_words', label: 'Command Words', icon: HelpCircle },
            { id: 'countdowns', label: 'Exam Countdowns', icon: Clock },
            { id: 'pomodoro', label: 'Pomodoro Focus Clock', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setActiveTab(tab.id as ToolboxTab);
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body per Tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* ==================== TAB 1: FORMULA BOOKLET & PHYSICAL CONSTANTS ==================== */}
          {activeTab === 'formulas' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {[
                    { id: 'all', label: 'All Subjects' },
                    { id: 'mathematics', label: '📐 Mathematics' },
                    { id: 'physics', label: '⚡ Physics' },
                    { id: 'chemistry', label: '🧪 Chemistry' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormulaSubject(cat.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        formulaSubject === cat.id
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formulaSearch}
                    onChange={(e) => setFormulaSearch(e.target.value)}
                    placeholder="Search formula, variable or rule..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Physical Constants Strip */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
                  <span>Physical &amp; Chemical Constants (Official Reference)</span>
                  <span className="text-[10px] text-slate-400">Standard &amp; WASSCE Approved Values</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px]">
                  {PHYSICAL_CONSTANTS_CATALOG.slice(0, 5).map((c) => (
                    <div key={c.symbol} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">{c.symbol}</div>
                      <div className="font-mono text-slate-900 dark:text-white truncate">{c.value} {c.units}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulas Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredFormulas.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 flex flex-col justify-between shadow-2xs hover:border-indigo-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {item.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyFormula(item.id, item.formulaPlain)}
                          className="px-2 py-0.5 rounded text-[11px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedFormulaId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                        {item.title}
                      </h4>

                      {/* Formula Box */}
                      <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 font-mono text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 my-2">
                        {item.formulaPlain}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {item.explanation}
                      </p>

                      {/* Variables list */}
                      <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                        {item.variables.map((v) => (
                          <div key={v.symbol} className="truncate">
                            <strong className="text-slate-700 dark:text-slate-300">{v.symbol}:</strong> {v.meaning} {v.unit ? `(${v.unit})` : ''}
                          </div>
                        ))}
                      </div>

                      {item.commonExaminerTrap && (
                        <div className="mt-2.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200">
                          <strong>⚠️ Chief Examiner Trap:</strong> {item.commonExaminerTrap}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 2: SCIENTIFIC & GRAPHING CALCULATOR ==================== */}
          {activeTab === 'calculator' && (
            <div className="max-w-xl mx-auto space-y-4">
              {/* Display Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono border border-slate-700 space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'))}
                    className="px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    {angleMode}
                  </button>
                  <span className="truncate max-w-[200px]">
                    {calcHistory[0] || 'Memory: ' + memoryVal}
                  </span>
                </div>
                <div className="text-right text-2xl sm:text-3xl font-bold tracking-wider overflow-x-auto py-1">
                  {calcDisplay}
                </div>
              </div>

              {/* Calculator Keypad */}
              <div className="grid grid-cols-5 gap-2 text-xs font-bold">
                {/* Row 1 */}
                <button type="button" onClick={() => handleCalcInput('sin(')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50">sin</button>
                <button type="button" onClick={() => handleCalcInput('cos(')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50">cos</button>
                <button type="button" onClick={() => handleCalcInput('tan(')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50">tan</button>
                <button type="button" onClick={handleCalcBackspace} className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 hover:bg-amber-200">DEL</button>
                <button type="button" onClick={handleCalcClear} className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 hover:bg-rose-200">AC</button>

                {/* Row 2 */}
                <button type="button" onClick={() => handleCalcInput('ln(')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">ln</button>
                <button type="button" onClick={() => handleCalcInput('log(')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">log</button>
                <button type="button" onClick={() => handleCalcInput('^')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">x^y</button>
                <button type="button" onClick={() => handleCalcInput('(')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">(</button>
                <button type="button" onClick={() => handleCalcInput(')')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">)</button>

                {/* Row 3 */}
                <button type="button" onClick={() => handleCalcInput('√(')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">√</button>
                <button type="button" onClick={() => handleCalcInput('7')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">7</button>
                <button type="button" onClick={() => handleCalcInput('8')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">8</button>
                <button type="button" onClick={() => handleCalcInput('9')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">9</button>
                <button type="button" onClick={() => handleCalcInput('÷')} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-base">÷</button>

                {/* Row 4 */}
                <button type="button" onClick={() => handleCalcInput('π')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">π</button>
                <button type="button" onClick={() => handleCalcInput('4')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">4</button>
                <button type="button" onClick={() => handleCalcInput('5')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">5</button>
                <button type="button" onClick={() => handleCalcInput('6')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">6</button>
                <button type="button" onClick={() => handleCalcInput('×')} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-base">×</button>

                {/* Row 5 */}
                <button type="button" onClick={() => handleCalcInput('e')} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">e</button>
                <button type="button" onClick={() => handleCalcInput('1')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">1</button>
                <button type="button" onClick={() => handleCalcInput('2')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">2</button>
                <button type="button" onClick={() => handleCalcInput('3')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">3</button>
                <button type="button" onClick={() => handleCalcInput('-')} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-base">-</button>

                {/* Row 6 */}
                <button type="button" onClick={() => { setMemoryVal(Number(calcDisplay) || 0); soundFx.playClick(); }} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">M+</button>
                <button type="button" onClick={() => handleCalcInput('0')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">0</button>
                <button type="button" onClick={() => handleCalcInput('.')} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm">.</button>
                <button type="button" onClick={handleCalcEvaluate} className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold shadow-md">=</button>
                <button type="button" onClick={() => handleCalcInput('+')} className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-base">+</button>
              </div>

              {onInsertCalculation && (
                <button
                  type="button"
                  onClick={() => {
                    onInsertCalculation(calcDisplay);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Insert Calculated Value into Active Answer</span>
                </button>
              )}
            </div>
          )}

          {/* ==================== TAB 3: WORKING SCRATCHPAD ==================== */}
          {activeTab === 'scratchpad' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                {/* Pen Colors */}
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Color:</span>
                  {['#4f46e5', '#059669', '#dc2626', '#0f172a'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setPenColor(c);
                        setIsEraser(false);
                      }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        penColor === c && !isEraser ? 'scale-125 border-indigo-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Stroke Slider */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Size:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={penSize}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    className="w-20 cursor-pointer"
                  />
                  <span>{penSize}px</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEraser((prev) => !prev)}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                      isEraser ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isEraser ? 'Eraser (Active)' : 'Eraser'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCanvasUndo}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={handleCanvasClear}
                    className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleCanvasDownload}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white shadow-inner cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className="w-full h-[400px] block"
                />
              </div>
            </div>
          )}

          {/* ==================== TAB 4: OMR BUBBLE SHEET SIMULATOR ==================== */}
          {activeTab === 'omr_sheet' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Standard 20-Item Optical Mark Reader (OMR) Sheet Practice
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Practice shading multiple-choice bubble options (A, B, C, D) exactly like official WAEC, JAMB CBT, and SAT exams.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!omrSubmitted ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playComplete();
                        setOmrSubmitted(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-xs"
                    >
                      Scan &amp; Grade OMR Sheet
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setOmrSubmitted(false);
                        setOmrAnswers({});
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Reset Blank Sheet
                    </button>
                  )}
                </div>
              </div>

              {omrSubmitted && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-sm">
                      OMR Optical Scan Complete: {omrScore} / 20 Correct ({Math.round((omrScore / 20) * 100)}%)
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400">
                      Shaded bubbles matched against official Chief Examiner answer key.
                    </span>
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round((omrScore / 20) * 100)}%
                  </span>
                </div>
              )}

              {/* 20 Questions OMR Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((qNum) => {
                  const picked = omrAnswers[qNum];
                  const correct = omrAnswerKey[qNum];
                  const isCorrect = picked === correct;

                  return (
                    <div
                      key={qNum}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        omrSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-6">
                        {qNum < 10 ? `0${qNum}` : qNum}.
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                          const isPicked = picked === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectOmrBubble(qNum, opt)}
                              className={`w-6 h-6 rounded-full border text-[11px] font-bold flex items-center justify-center cursor-pointer transition-all ${
                                isPicked
                                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: GRADE BOUNDARY ESTIMATOR ==================== */}
          {activeTab === 'grade_boundaries' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Examination Authority Scale
                  </label>
                  <select
                    value={selectedGradeBoard}
                    onChange={(e) => setSelectedGradeBoard(e.target.value as ExamFormatId)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="waec">WAEC (WASSCE) 9-Point Scale (A1–F9)</option>
                    <option value="igcse">Cambridge IGCSE Scale (A*–G)</option>
                    <option value="sat">College Board Digital SAT (400–1600)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Input Your Raw Practice Score (%):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={userRawScore}
                      onChange={(e) => setUserRawScore(Number(e.target.value))}
                      className="flex-1 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 w-12 text-right">
                      {userRawScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Resulting Grade Banner */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-slate-400 block">
                    Predicted Examination Grade Result
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-indigo-400">
                      {predictedGrade?.gradeLabel}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${predictedGrade?.colorBadgeClass}`}>
                      {predictedGrade?.classification.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {predictedGrade?.description}
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 text-xs text-slate-400">
                  <span>Distinction Threshold:</span>
                  <div className="font-bold text-sm text-white mt-0.5">
                    {activeGradeSystem.boundaries[0]?.minPercentage}%+
                  </div>
                </div>
              </div>

              {/* Complete Boundary Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3">Grade Tier</th>
                      <th className="p-3">Score Range</th>
                      <th className="p-3">Standard Classification</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeGradeSystem.boundaries.map((b) => {
                      const isCurrent = predictedGrade?.gradeLabel === b.gradeLabel;
                      return (
                        <tr key={b.gradeLabel} className={isCurrent ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold' : ''}>
                          <td className="p-3">{b.gradeLabel}</td>
                          <td className="p-3 font-mono">{b.minPercentage}% – {b.maxPercentage}%</td>
                          <td className="p-3 capitalize">{b.classification}</td>
                          <td className="p-3">
                            {isCurrent && <span className="text-indigo-600 dark:text-indigo-400 font-bold">● Active Estimate</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 6: COMMAND WORDS LEXICON ==================== */}
          {activeTab === 'command_words' && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500">
                Examiners award marks based on strict command words. Review what each term demands before drafting written answers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXAM_COMMAND_WORDS.map((cw) => (
                  <div
                    key={cw.word}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        &ldquo;{cw.word}&rdquo;
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-indigo-600 dark:text-indigo-400">
                        {cw.expectedMarks}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Meaning:</strong> {cw.meaning}
                    </p>
                    <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 text-[11px] text-indigo-900 dark:text-indigo-200 font-medium">
                      <strong>Examiner Rubric:</strong> {cw.examinerExpectation}
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      💡 Pro Tip: {cw.proTip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 7: EXAM COUNTDOWN SCHEDULES ==================== */}
          {activeTab === 'countdowns' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {UPCOMING_EXAM_SCHEDULES.map((sched) => {
                  const target = new Date(sched.targetDateIso);
                  const now = new Date();
                  const diffMs = target.getTime() - now.getTime();
                  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
                  const hours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

                  return (
                    <div
                      key={sched.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{sched.iconEmoji}</span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {target.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {sched.examTitle}
                        </h4>
                        <p className="text-xs text-slate-500">{sched.seriesSession}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                            {days}
                          </span>
                          <span className="text-xs text-slate-500 font-medium ml-1">Days &amp; {hours}h Left</span>
                        </div>
                        <a
                          href={sched.officialWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== TAB 8: POMODORO FOCUS CLOCK ==================== */}
          {activeTab === 'pomodoro' && (
            <div className="max-w-md mx-auto text-center space-y-5 py-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Focus &amp; Spaced Study Timer
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  25-Minute Study Interval
                </h4>
              </div>

              {/* Big Clock Display */}
              <div className="w-48 h-48 mx-auto rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-indigo-50/50 dark:bg-slate-800/80 shadow-lg">
                <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                  {pomoMinutes < 10 ? `0${pomoMinutes}` : pomoMinutes}:{pomoSeconds < 10 ? `0${pomoSeconds}` : pomoSeconds}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setPomoRunning((prev) => !prev);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {pomoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{pomoRunning ? 'Pause Timer' : 'Start Focus Session'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setPomoRunning(false);
                    setPomoMinutes(25);
                    setPomoSeconds(0);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Reset 25 min"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Completed Today: <strong className="text-slate-900 dark:text-white">{pomoRoundsCompleted}</strong> Focus Rounds ({pomoRoundsCompleted * 25} minutes total study time)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
