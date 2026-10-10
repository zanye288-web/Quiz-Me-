import React, { useState } from 'react';
import {
  Calculator,
  BookOpen,
  X,
  Search,
  Volume2,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Palette,
  Minimize2,
  Maximize2,
  History,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export type CalculatorSkin = 'obsidian' | 'solar' | 'cyber';

interface StudyToolsWidgetProps {
  calculatorEnabled?: boolean;
  dictionaryEnabled?: boolean;
  onInsertValue?: (val: string) => void;
}

interface DictionaryEntryResult {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
  synonyms?: string[];
}

const OFFLINE_ACADEMIC_LEXICON: Record<string, DictionaryEntryResult> = {
  mitosis: {
    word: 'Mitosis',
    phonetic: '/maɪˈtoʊsɪs/',
    partOfSpeech: 'noun (Biology)',
    definition: 'A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.',
    example: 'Somatic cells divide through mitosis to repair damaged tissue.',
    synonyms: ['karyokinesis', 'cell division'],
  },
  derivative: {
    word: 'Derivative',
    phonetic: '/dɪˈrɪvətɪv/',
    partOfSpeech: 'noun (Mathematics)',
    definition: 'The instantaneous rate of change of a function with respect to one of its variables, equivalent to the slope of the tangent line.',
    example: 'The derivative of x² with respect to x is 2x.',
    synonyms: ['instantaneous rate', 'differential coefficient'],
  },
  photosynthesis: {
    word: 'Photosynthesis',
    phonetic: '/ˌfoʊtoʊˈsɪnθəsɪs/',
    partOfSpeech: 'noun (Biology / Chemistry)',
    definition: 'The process by which green plants and certain other organisms transform light energy into chemical energy (glucose) from CO₂ and water.',
    example: 'Chlorophyll inside chloroplasts absorbs photons to drive photosynthesis.',
    synonyms: ['carbon fixation', 'phototrophic synthesis'],
  },
  entropy: {
    word: 'Entropy',
    phonetic: '/ˈɛntrəpi/',
    partOfSpeech: 'noun (Physics / Thermodynamics)',
    definition: 'A thermodynamic quantity representing the unavailability of a system’s thermal energy for conversion into mechanical work, often interpreted as the degree of disorder or randomness.',
    example: 'According to the second law of thermodynamics, the total entropy of an isolated system never decreases.',
    synonyms: ['randomness', 'disorder'],
  },
  algorithm: {
    word: 'Algorithm',
    phonetic: '/ˈælɡəˌrɪðəm/',
    partOfSpeech: 'noun (Computer Science / Math)',
    definition: 'A finite sequence of rigorous, well-defined instructions used to solve a class of specific problems or perform a computation.',
    example: 'Dijkstra’s algorithm finds the shortest paths between nodes in a weighted graph.',
    synonyms: ['procedure', 'heuristic', 'computational method'],
  },
  stoichiometry: {
    word: 'Stoichiometry',
    phonetic: '/ˌstɔɪkiˈɒmɪtri/',
    partOfSpeech: 'noun (Chemistry)',
    definition: 'The quantitative relationship between reactants and products in a balanced chemical reaction.',
    example: 'Using stoichiometry, we calculate how many moles of oxygen are required for complete combustion.',
    synonyms: ['molar ratio analysis', 'chemical proportion'],
  },
};

export const StudyToolsWidget: React.FC<StudyToolsWidgetProps> = ({
  calculatorEnabled = true,
  dictionaryEnabled = true,
  onInsertValue,
}) => {
  const [activeTool, setActiveTool] = useState<'none' | 'calculator' | 'dictionary'>('none');
  const [skin, setSkin] = useState<CalculatorSkin>('obsidian');
  const [isCompact, setIsCompact] = useState(false);
  const [scientificMode, setScientificMode] = useState(true);

  // Calculator state
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');
  const [angleUnit, setAngleUnit] = useState<'DEG' | 'RAD'>('DEG');
  const [history, setHistory] = useState<Array<{ expr: string; res: string }>>([]);
  const [copiedCalc, setCopiedCalc] = useState(false);

  // Dictionary state
  const [dictQuery, setDictQuery] = useState('');
  const [dictLoading, setDictLoading] = useState(false);
  const [dictResults, setDictResults] = useState<DictionaryEntryResult[]>([]);
  const [dictError, setDictError] = useState<string | null>(null);
  const [dictFontSize, setDictFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  if (!calculatorEnabled && !dictionaryEnabled) return null;

  const skinStyles: Record<CalculatorSkin, { panel: string; display: string; btn: string; opBtn: string; accentBtn: string }> = {
    obsidian: {
      panel: 'bg-slate-950/95 border-slate-800 text-white shadow-2xl',
      display: 'bg-slate-900 border-slate-800 text-emerald-300',
      btn: 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-800',
      opBtn: 'bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border-indigo-800/60',
      accentBtn: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-transparent',
    },
    solar: {
      panel: 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl',
      display: 'bg-slate-100 border-slate-200 text-indigo-900',
      btn: 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200',
      opBtn: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200',
      accentBtn: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent',
    },
    cyber: {
      panel: 'bg-emerald-950/95 border-emerald-700/60 text-emerald-50 shadow-2xl',
      display: 'bg-black/70 border-emerald-500/40 text-emerald-300',
      btn: 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 border-emerald-800/60',
      opBtn: 'bg-teal-900/60 hover:bg-teal-800/70 text-cyan-300 border-teal-700/60',
      accentBtn: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black border-transparent',
    },
  };

  const currentSkin = skinStyles[skin];

  const safeEvaluateMath = (rawExpression: string): string => {
    try {
      const cleaned = rawExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, String(Math.PI))
        .replace(/\be\b/g, String(Math.E))
        .replace(/\^/g, '**');

      const toRad = (x: number) => (angleUnit === 'DEG' ? (x * Math.PI) / 180 : x);

      const mathScope = {
        sin: (x: number) => Math.sin(toRad(x)),
        cos: (x: number) => Math.cos(toRad(x)),
        tan: (x: number) => Math.tan(toRad(x)),
        sqrt: (x: number) => Math.sqrt(x),
        log: (x: number) => Math.log10(x),
        ln: (x: number) => Math.log(x),
        abs: (x: number) => Math.abs(x),
      };

      const parsed = cleaned
        .replace(/sin\(/g, 'scope.sin(')
        .replace(/cos\(/g, 'scope.cos(')
        .replace(/tan\(/g, 'scope.tan(')
        .replace(/√\(/g, 'scope.sqrt(')
        .replace(/log\(/g, 'scope.log(')
        .replace(/ln\(/g, 'scope.ln(');

      if (!/^[0-9+\-*/().\s,*a-zA-Z]+$/.test(parsed)) {
        return 'Error';
      }

      const fn = new Function('scope', `return (${parsed});`);
      const val = fn(mathScope);
      if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
        return 'Error';
      }
      return Number(val.toFixed(8)).toString();
    } catch {
      return 'Error';
    }
  };

  const handleCalcInput = (token: string) => {
    soundFx.playPop();
    if (token === 'C') {
      setExpr('');
      setResult('0');
      return;
    }
    if (token === '⌫') {
      setExpr((prev) => prev.slice(0, -1));
      return;
    }
    if (token === '=') {
      if (!expr.trim()) return;
      const evaluated = safeEvaluateMath(expr);
      setResult(evaluated);
      if (evaluated !== 'Error') {
        setHistory((prev) => [{ expr, res: evaluated }, ...prev.slice(0, 7)]);
      }
      return;
    }
    if (token === 'x²') {
      setExpr((prev) => `${prev}^2`);
      return;
    }
    if (['sin', 'cos', 'tan', '√', 'log', 'ln'].includes(token)) {
      setExpr((prev) => `${prev}${token}(`);
      return;
    }
    setExpr((prev) => prev + token);
  };

  const handleSearchDictionary = async (e?: React.FormEvent, customWord?: string) => {
    if (e) e.preventDefault();
    const target = (customWord ?? dictQuery).trim();
    if (!target) return;

    setDictLoading(true);
    setDictError(null);
    soundFx.playPop();

    const lower = target.toLowerCase();
    const localHit = OFFLINE_ACADEMIC_LEXICON[lower];

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lower)}`);
      if (res.ok) {
        const data = await res.json();
        const entries: DictionaryEntryResult[] = [];
        if (localHit) entries.push(localHit);
        if (Array.isArray(data)) {
          data.slice(0, 2).forEach((item: any) => {
            const phonetic = item.phonetic || item.phonetics?.find((p: any) => p.text)?.text;
            (item.meanings || []).slice(0, 3).forEach((m: any) => {
              const firstDef = m.definitions?.[0];
              if (firstDef?.definition) {
                entries.push({
                  word: item.word || target,
                  phonetic,
                  partOfSpeech: m.partOfSpeech || 'term',
                  definition: firstDef.definition,
                  example: firstDef.example,
                  synonyms: (m.synonyms || []).slice(0, 4),
                });
              }
            });
          });
        }
        if (entries.length > 0) {
          setDictResults(entries);
          setDictLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to local academic lexicon
    }

    if (localHit) {
      setDictResults([localHit]);
    } else {
      setDictResults([
        {
          word: target,
          phonetic: `/${lower}/`,
          partOfSpeech: 'Academic Concept',
          definition: `Key term in scholarly study: "${target}". Refer to the question context or ask Quizzie Tutor for a deep-dive domain explanation.`,
          example: `Analyze how "${target}" applies to the governing rules of this problem.`,
        },
      ]);
    }
    setDictLoading(false);
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="my-2">
      {/* Sleek Toolbar Pill Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {calculatorEnabled && (
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTool((prev) => (prev === 'calculator' ? 'none' : 'calculator'));
            }}
            className={`comic-panel-sm px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTool === 'calculator'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Scientific Calculator</span>
          </button>
        )}

        {dictionaryEnabled && (
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTool((prev) => (prev === 'dictionary' ? 'none' : 'dictionary'));
            }}
            className={`comic-panel-sm px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTool === 'dictionary'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Dictionary</span>
          </button>
        )}
      </div>

      {/* Customizable Scientific Calculator Panel */}
      {activeTool === 'calculator' && calculatorEnabled && (
        <div
          className={`comic-panel mt-3 rounded-3xl p-4 transition-all ${currentSkin.panel} ${
            isCompact ? 'max-w-xs' : 'max-w-md'
          }`}
        >
          {/* Header & Customizer Bar */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700/30">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-wider">QuizMe Scientific Calc</span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Theme Switcher */}
              <button
                type="button"
                onClick={() =>
                  setSkin((prev) => (prev === 'obsidian' ? 'solar' : prev === 'solar' ? 'cyber' : 'obsidian'))
                }
                title="Customize Calculator Theme"
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Palette className="w-3 h-3" />
                <span className="capitalize">{skin}</span>
              </button>
              {/* DEG / RAD */}
              <button
                type="button"
                onClick={() => setAngleUnit((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'))}
                className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-black cursor-pointer"
              >
                {angleUnit}
              </button>
              {/* Scientific Toggle */}
              <button
                type="button"
                onClick={() => setScientificMode((prev) => !prev)}
                className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-black cursor-pointer"
              >
                {scientificMode ? 'SCI' : 'STD'}
              </button>
              {/* Compact Toggle */}
              <button
                type="button"
                onClick={() => setIsCompact((prev) => !prev)}
                className="p-1 rounded-lg opacity-75 hover:opacity-100 cursor-pointer"
              >
                {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('none')}
                className="p-1 rounded-lg opacity-75 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calculator Display */}
          <div className={`mt-3 p-3 rounded-xl border font-mono text-right ${currentSkin.display}`}>
            <div className="text-xs opacity-70 min-h-[1.25rem] break-all">{expr || '0'}</div>
            <div className="text-2xl font-black tracking-tight flex items-center justify-between gap-2 mt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(result);
                    setCopiedCalc(true);
                    setTimeout(() => setCopiedCalc(false), 1500);
                    if (onInsertValue && result !== 'Error') onInsertValue(result);
                  }}
                  title="Copy or insert result into answer"
                  className="px-2 py-1 rounded-lg bg-black/20 hover:bg-black/40 text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedCalc ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{onInsertValue ? 'Use Result' : 'Copy'}</span>
                </button>
              </div>
              <span className="truncate">= {result}</span>
            </div>
          </div>

          {/* Scientific Row */}
          {scientificMode && (
            <div className="grid grid-cols-6 gap-1.5 mt-2.5">
              {['sin', 'cos', 'tan', '√', 'log', 'ln', 'π', 'e', 'x²', '^', '(', ')'].map((fnKey) => (
                <button
                  key={fnKey}
                  type="button"
                  onClick={() => handleCalcInput(fnKey)}
                  className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${currentSkin.opBtn}`}
                >
                  {fnKey}
                </button>
              ))}
            </div>
          )}

          {/* Main Keypad */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {['C', '⌫', '(', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', ')', '='].map(
              (key) => {
                const isEq = key === '=';
                const isOp = ['÷', '×', '-', '+', 'C', '⌫', '(', ')'].includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCalcInput(key)}
                    className={`py-2.5 rounded-xl border text-sm font-black transition-all cursor-pointer ${
                      isEq ? currentSkin.accentBtn : isOp ? currentSkin.opBtn : currentSkin.btn
                    }`}
                  >
                    {key}
                  </button>
                );
              }
            )}
          </div>

          {/* Calculation Tape History */}
          {history.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-700/30">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold opacity-70 mb-1">
                <span className="flex items-center gap-1">
                  <History className="w-3 h-3" /> History Tape
                </span>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
                >
                  <Trash2 className="w-2.5 h-2.5" /> Clear
                </button>
              </div>
              <div className="max-h-20 overflow-y-auto space-y-1 pr-1">
                {history.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setExpr(h.expr);
                      setResult(h.res);
                    }}
                    className="w-full flex items-center justify-between text-xs font-mono px-2 py-1 rounded bg-black/20 hover:bg-black/30 cursor-pointer"
                  >
                    <span className="truncate opacity-75">{h.expr}</span>
                    <span className="font-bold text-emerald-400">= {h.res}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customizable Academic Dictionary & Lexicon Panel */}
      {activeTool === 'dictionary' && dictionaryEnabled && (
        <div className={`mt-3 rounded-2xl border p-4 max-w-lg transition-all ${currentSkin.panel}`}>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700/30">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider">Academic Dictionary & Lexicon</span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Theme Switcher */}
              <button
                type="button"
                onClick={() =>
                  setSkin((prev) => (prev === 'obsidian' ? 'solar' : prev === 'solar' ? 'cyber' : 'obsidian'))
                }
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Palette className="w-3 h-3" />
                <span className="capitalize">{skin}</span>
              </button>
              {/* Font Size Switcher */}
              <button
                type="button"
                onClick={() =>
                  setDictFontSize((prev) => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm'))
                }
                className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase cursor-pointer"
              >
                Text: {dictFontSize}
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('none')}
                className="p-1 rounded-lg opacity-75 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={(e) => handleSearchDictionary(e)} className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                value={dictQuery}
                onChange={(e) => setDictQuery(e.target.value)}
                placeholder="Look up any word, scientific term, or concept..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/20 border border-slate-700/50 text-xs font-medium focus:outline-none focus:border-emerald-400"
              />
            </div>
            <button
              type="submit"
              disabled={dictLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
            >
              {dictLoading ? '...' : 'Define'}
            </button>
          </form>

          {/* Quick Suggested Academic Terms */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[10px] font-bold opacity-60">Quick Terms:</span>
            {Object.keys(OFFLINE_ACADEMIC_LEXICON).map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setDictQuery(term);
                  handleSearchDictionary(undefined, term);
                }}
                className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-bold capitalize cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>

          {dictError && <p className="text-xs text-rose-400 mt-2">{dictError}</p>}

          {dictResults.length > 0 && (
            <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {dictResults.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/20 border border-slate-700/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base capitalize">{entry.word}</span>
                      {entry.phonetic && (
                        <span className="text-xs font-mono opacity-70">{entry.phonetic}</span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        {entry.partOfSpeech}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakWord(entry.word)}
                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 cursor-pointer"
                      title="Pronounce word"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p
                    className={`leading-relaxed opacity-90 ${
                      dictFontSize === 'lg' ? 'text-sm' : dictFontSize === 'sm' ? 'text-[11px]' : 'text-xs'
                    }`}
                  >
                    {entry.definition}
                  </p>
                  {entry.example && (
                    <p className="text-[11px] italic opacity-75 border-l-2 border-emerald-500/50 pl-2">
                      “{entry.example}”
                    </p>
                  )}
                  {entry.synonyms && entry.synonyms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] font-bold opacity-60">Synonyms:</span>
                      {entry.synonyms.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
