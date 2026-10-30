import React, { useState } from 'react';
import {
  X,
  Sigma,
  PieChart,
  Calculator,
  Compass,
  Layers,
  Sparkles,
  Check,
  TrendingUp,
  Circle,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { MathTab } from '../../types/extendedSuperpowers';
import { CIRCLE_THEOREMS } from '../../data/extendedExaminationData';

interface MathematicsSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: MathTab;
}

export const MathematicsSandboxModal: React.FC<MathematicsSandboxModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'quadratic_solver',
}) => {
  const [activeTab, setActiveTab] = useState<MathTab>(initialTab);

  // Quadratic Solver State
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-5);
  const [quadC, setQuadC] = useState<number>(6);

  // Simultaneous Equations State (2x2)
  const [simA1, setSimA1] = useState<number>(2);
  const [simB1, setSimB1] = useState<number>(3);
  const [simC1, setSimC1] = useState<number>(12);
  const [simA2, setSimA2] = useState<number>(3);
  const [simB2, setSimB2] = useState<number>(-1);
  const [simC2, setSimC2] = useState<number>(7);

  // Statistics State
  const [rawStatsInput, setRawStatsInput] = useState<string>('12, 15, 18, 18, 22, 25, 30, 35, 40');

  // Normal Distribution State
  const [normX, setNormX] = useState<number>(72);
  const [normMean, setNormMean] = useState<number>(60);
  const [normSd, setNormSd] = useState<number>(8);

  // Sequences State
  const [seqType, setSeqType] = useState<'AP' | 'GP'>('AP');
  const [seqA, setSeqA] = useState<number>(3);
  const [seqDiffOrRatio, setSeqDiffOrRatio] = useState<number>(4);
  const [seqN, setSeqN] = useState<number>(10);

  // Combinatorics State
  const [combN, setCombN] = useState<number>(7);
  const [combR, setCombR] = useState<number>(3);

  // Circle Theorem State
  const [activeTheoremId, setActiveTheoremId] = useState<string>('ct_1');

  // Set Theory State
  const [setA, setSetA] = useState<number>(40);
  const [setB, setSetB] = useState<number>(35);
  const [setBoth, setSetBoth] = useState<number>(15);
  const [setTotal, setSetTotal] = useState<number>(70);

  if (!isOpen) return null;

  // Quadratic calculations
  const discriminant = quadB * quadB - 4 * quadA * quadC;
  let root1 = '';
  let root2 = '';
  let natureOfRoots = '';
  if (quadA === 0) {
    natureOfRoots = 'Linear equation (a cannot be zero for quadratic)';
  } else if (discriminant > 0) {
    const r1 = (-quadB + Math.sqrt(discriminant)) / (2 * quadA);
    const r2 = (-quadB - Math.sqrt(discriminant)) / (2 * quadA);
    root1 = r1.toFixed(3);
    root2 = r2.toFixed(3);
    natureOfRoots = 'Two distinct real roots (Δ > 0)';
  } else if (discriminant === 0) {
    const r = -quadB / (2 * quadA);
    root1 = r.toFixed(3);
    root2 = r.toFixed(3);
    natureOfRoots = 'Two equal real roots / repeated root (Δ = 0)';
  } else {
    const realPart = (-quadB / (2 * quadA)).toFixed(3);
    const imagPart = (Math.sqrt(-discriminant) / (2 * quadA)).toFixed(3);
    root1 = `${realPart} + ${imagPart}i`;
    root2 = `${realPart} - ${imagPart}i`;
    natureOfRoots = 'Complex conjugate roots (Δ < 0, no real roots)';
  }
  const vertexX = quadA !== 0 ? (-quadB / (2 * quadA)).toFixed(3) : '0';
  const vertexY = quadA !== 0 ? (quadC - (quadB * quadB) / (4 * quadA)).toFixed(3) : '0';

  // Simultaneous 2x2 calculations (Cramer's rule)
  const detD = simA1 * simB2 - simA2 * simB1;
  const detDx = simC1 * simB2 - simC2 * simB1;
  const detDy = simA1 * simC2 - simA2 * simC1;
  const simX = detD !== 0 ? (detDx / detD).toFixed(3) : 'Undefined (Parallel/Coincident)';
  const simY = detD !== 0 ? (detDy / detD).toFixed(3) : 'Undefined';

  // Statistics parsing
  const statNumbers = rawStatsInput
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);
  const n = statNumbers.length;
  const statSum = statNumbers.reduce((a, b) => a + b, 0);
  const statMean = n > 0 ? (statSum / n).toFixed(2) : '0';
  const statMedian =
    n > 0
      ? n % 2 === 1
        ? statNumbers[Math.floor(n / 2)].toFixed(2)
        : (((statNumbers[n / 2 - 1] + statNumbers[n / 2]) / 2).toFixed(2))
      : '0';
  const statVariance =
    n > 1
      ? (statNumbers.reduce((acc, val) => acc + Math.pow(val - parseFloat(statMean), 2), 0) / (n - 1)).toFixed(2)
      : '0';
  const statSd = Math.sqrt(parseFloat(statVariance)).toFixed(2);
  const statMin = n > 0 ? statNumbers[0] : 0;
  const statMax = n > 0 ? statNumbers[n - 1] : 0;
  const statRange = (statMax - statMin).toFixed(2);

  // Normal Distribution Z-score
  const zScore = normSd > 0 ? ((normX - normMean) / normSd).toFixed(2) : '0';
  // Approximation of standard normal CDF
  const zVal = parseFloat(zScore);
  const cdfProb = (1 / (1 + Math.exp(-0.07056 * Math.pow(zVal, 3) - 1.5976 * zVal))).toFixed(4);

  // Factorial utility
  const factorial = (num: number): number => {
    if (num <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= num; i++) res *= i;
    return res;
  };

  const nPr = combN >= combR && combR >= 0 ? factorial(combN) / factorial(combN - combR) : 0;
  const nCr = combN >= combR && combR >= 0 ? factorial(combN) / (factorial(combR) * factorial(combN - combR)) : 0;

  // Sequences
  let tn = 0;
  let sn = 0;
  if (seqType === 'AP') {
    tn = seqA + (seqN - 1) * seqDiffOrRatio;
    sn = (seqN / 2) * (2 * seqA + (seqN - 1) * seqDiffOrRatio);
  } else {
    tn = seqA * Math.pow(seqDiffOrRatio, seqN - 1);
    sn = seqDiffOrRatio !== 1 ? (seqA * (Math.pow(seqDiffOrRatio, seqN) - 1)) / (seqDiffOrRatio - 1) : seqA * seqN;
  }
  const sInfinity = seqType === 'GP' && Math.abs(seqDiffOrRatio) < 1 ? (seqA / (1 - seqDiffOrRatio)).toFixed(3) : 'Diverges (|r| ≥ 1)';

  // Set theory
  const unionAB = setA + setB - setBoth;
  const neither = Math.max(0, setTotal - unionAB);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sigma className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Mathematical Analysis &amp; Statistics Sandbox
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  WAEC · JAMB · IGCSE · SAT Math
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quadratic &amp; Matrix Solvers, Descriptive Statistics, Z-Score CDF, Circle Theorems, AP/GP &amp; Venn Engine
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
            { id: 'quadratic_solver' as MathTab, label: 'Quadratic & Roots Solver', icon: Calculator },
            { id: 'simultaneous_equations' as MathTab, label: 'Simultaneous Equations (2×2)', icon: Layers },
            { id: 'statistics' as MathTab, label: 'Descriptive Statistics Engine', icon: PieChart },
            { id: 'normal_distribution' as MathTab, label: 'Normal Distribution & Z-Score', icon: TrendingUp },
            { id: 'circle_theorems' as MathTab, label: 'Circle Theorems Visual Guide', icon: Circle },
            { id: 'sequences' as MathTab, label: 'AP & GP Series Solver', icon: Sigma },
            { id: 'combinatorics' as MathTab, label: 'Permutations & Combinations (nPr/nCr)', icon: Sparkles },
            { id: 'set_theory' as MathTab, label: 'Set Theory & Venn Calculator', icon: Compass },
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
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold border border-slate-200/80 dark:border-slate-700'
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
          {/* TAB 1: QUADRATIC SOLVER */}
          {activeTab === 'quadratic_solver' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    General Quadratic Equation: ax² + bx + c = 0
                  </h3>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    Δ = b² - 4ac
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Coefficient a (x²)</label>
                    <input
                      type="number"
                      value={quadA}
                      onChange={(e) => setQuadA(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-base font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Coefficient b (x)</label>
                    <input
                      type="number"
                      value={quadB}
                      onChange={(e) => setQuadB(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-base font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Constant c</label>
                    <input
                      type="number"
                      value={quadC}
                      onChange={(e) => setQuadC(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-base font-bold text-center"
                    />
                  </div>
                </div>

                {/* Roots and Discriminant Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Discriminant (Δ)</div>
                    <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                      Δ = {discriminant}
                    </div>
                    <div className="text-slate-500 mt-1 font-semibold">{natureOfRoots}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Calculated Roots (x₁, x₂)</div>
                    <div className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      x₁ = {root1}
                    </div>
                    <div className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      x₂ = {root2}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Parabola Vertex (h, k)</div>
                    <div className="text-base font-black font-mono text-slate-800 dark:text-slate-200 mt-1">
                      ({vertexX}, {vertexY})
                    </div>
                    <div className="text-slate-500 mt-1">
                      {quadA > 0 ? 'Minimum turning point (opens upward)' : 'Maximum turning point (opens downward)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIMULTANEOUS EQUATIONS */}
          {activeTab === 'simultaneous_equations' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Simultaneous Linear System (2 Equations in 2 Unknowns)
                  </h3>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    Cramer&apos;s Rule
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-bold text-slate-900 dark:text-white">Equation 1: a₁x + b₁y = c₁</div>
                    <div className="grid grid-cols-3 gap-2 font-mono">
                      <input
                        type="number"
                        value={simA1}
                        onChange={(e) => setSimA1(parseFloat(e.target.value) || 0)}
                        className="p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-center"
                        placeholder="a₁"
                      />
                      <input
                        type="number"
                        value={simB1}
                        onChange={(e) => setSimB1(parseFloat(e.target.value) || 0)}
                        className="p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-center"
                        placeholder="b₁"
                      />
                      <input
                        type="number"
                        value={simC1}
                        onChange={(e) => setSimC1(parseFloat(e.target.value) || 0)}
                        className="p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-center"
                        placeholder="c₁"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="font-bold text-slate-900 dark:text-white">Equation 2: a₂x + b₂y = c₂</div>
                    <div className="grid grid-cols-3 gap-2 font-mono">
                      <input
                        type="number"
                        value={simA2}
                        onChange={(e) => setSimA2(parseFloat(e.target.value) || 0)}
                        className="p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-center"
                        placeholder="a₂"
                      />
                      <input
                        type="number"
                        value={simB2}
                        onChange={(e) => setSimB2(parseFloat(e.target.value) || 0)}
                        className="p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-center"
                        placeholder="b₂"
                      />
                      <input
                        type="number"
                        value={simC2}
                        onChange={(e) => setSimC2(parseFloat(e.target.value) || 0)}
                        className="p-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-center"
                        placeholder="c₂"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">System Determinant (D)</div>
                    <div className="text-lg font-black font-mono text-slate-800 dark:text-slate-200 mt-1">{detD}</div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">Solution for x (Dx / D)</div>
                    <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                      x = {simX}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">Solution for y (Dy / D)</div>
                    <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                      y = {simY}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESCRIPTIVE STATISTICS */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Descriptive Statistics &amp; Dispersion Analyzer
                  </h3>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    n = {n} data points
                  </span>
                </div>

                <div>
                  <label className="text-slate-500 text-xs block mb-1">
                    Enter raw comma-separated values (e.g. test scores, measurements):
                  </label>
                  <input
                    type="text"
                    value={rawStatsInput}
                    onChange={(e) => setRawStatsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Arithmetic Mean (x̄)</div>
                    <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">{statMean}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Median (Q2)</div>
                    <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">{statMedian}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Sample Std Dev (s)</div>
                    <div className="text-lg font-black font-mono text-teal-600 dark:text-teal-400 mt-1">{statSd}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Range (Max - Min)</div>
                    <div className="text-lg font-black font-mono text-slate-800 dark:text-slate-200 mt-1">{statRange}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NORMAL DISTRIBUTION */}
          {activeTab === 'normal_distribution' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Standard Normal Distribution &amp; Z-Score Lookup
                  </h3>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    Z = (X - μ) / σ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Target Score (X)</label>
                    <input
                      type="number"
                      value={normX}
                      onChange={(e) => setNormX(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Population Mean (μ)</label>
                    <input
                      type="number"
                      value={normMean}
                      onChange={(e) => setNormMean(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Standard Deviation (σ)</label>
                    <input
                      type="number"
                      value={normSd}
                      onChange={(e) => setNormSd(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">Calculated Z-Score</div>
                    <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                      Z = {zScore}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">Cumulative Probability P(Z ≤ z)</div>
                    <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                      {(parseFloat(cdfProb) * 100).toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">p = {cdfProb}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CIRCLE THEOREMS */}
          {activeTab === 'circle_theorems' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Euclidean Circle Theorems &amp; High-Yield Mark Scheme Proofs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {CIRCLE_THEOREMS.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{t.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold">
                          {t.formula}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{t.rule}</p>
                      <div className="text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                        Examiner Note: {t.examinerNotes}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SEQUENCES (AP/GP) */}
          {activeTab === 'sequences' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Arithmetic &amp; Geometric Progression Series Solver
                  </h3>
                  <div className="flex gap-1 text-xs">
                    {(['AP', 'GP'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSeqType(type);
                        }}
                        className={`px-3 py-1 rounded-xl font-bold cursor-pointer ${
                          seqType === type
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {type === 'AP' ? 'Arithmetic (AP)' : 'Geometric (GP)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">First Term (a)</label>
                    <input
                      type="number"
                      value={seqA}
                      onChange={(e) => setSeqA(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">
                      {seqType === 'AP' ? 'Common Difference (d)' : 'Common Ratio (r)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={seqDiffOrRatio}
                      onChange={(e) => setSeqDiffOrRatio(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Term Number (n)</label>
                    <input
                      type="number"
                      value={seqN}
                      onChange={(e) => setSeqN(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">n-th Term (T_n)</div>
                    <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                      T_{seqN} = {tn.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Sum of First n Terms (S_n)</div>
                    <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      S_{seqN} = {sn.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Sum to Infinity (S_∞)</div>
                    <div className="text-sm font-black font-mono text-slate-800 dark:text-slate-200 mt-1">
                      {sInfinity}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: COMBINATORICS (nPr/nCr) */}
          {activeTab === 'combinatorics' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Permutations &amp; Combinations (Arrangements &amp; Selections)
                  </h3>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    n! / (r!(n-r)!)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Total Set Size (n)</label>
                    <input
                      type="number"
                      value={combN}
                      onChange={(e) => setCombN(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Selected Subset Size (r)</label>
                    <input
                      type="number"
                      value={combR}
                      onChange={(e) => setCombR(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-lg font-bold text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] font-mono">Permutations nPr (Order Matters)</div>
                    <div className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-2">
                      {nPr.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">{combN}! / ({combN} - {combR})!</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] font-mono">Combinations nCr (Order Does Not Matter)</div>
                    <div className="text-3xl font-black font-mono text-teal-600 dark:text-teal-400 mt-2">
                      {nCr.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">{combN}! / ({combR}! × ({combN} - {combR})!)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SET THEORY & VENN */}
          {activeTab === 'set_theory' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    2-Set Venn Diagram &amp; Inclusion-Exclusion Principle
                  </h3>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    n(A ∪ B) = n(A) + n(B) - n(A ∩ B)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Universal Set n(ξ)</label>
                    <input
                      type="number"
                      value={setTotal}
                      onChange={(e) => setSetTotal(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Total in Set A n(A)</label>
                    <input
                      type="number"
                      value={setA}
                      onChange={(e) => setSetA(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Total in Set B n(B)</label>
                    <input
                      type="number"
                      value={setB}
                      onChange={(e) => setSetB(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Both n(A ∩ B)</label>
                    <input
                      type="number"
                      value={setBoth}
                      onChange={(e) => setSetBoth(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs text-center">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Only A: n(A ∩ B&apos;)</div>
                    <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                      {Math.max(0, setA - setBoth)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Both: n(A ∩ B)</div>
                    <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      {setBoth}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Only B: n(B ∩ A&apos;)</div>
                    <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                      {Math.max(0, setB - setBoth)}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between text-xs font-mono">
                  <span>Union n(A ∪ B) = {unionAB}</span>
                  <span className="text-slate-500">Neither (A ∪ B)&apos; = {neither}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
