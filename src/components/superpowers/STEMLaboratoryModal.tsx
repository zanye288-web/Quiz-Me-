import React, { useState, useId } from 'react';
import {
  X,
  FlaskConical,
  Atom,
  Flame,
  Zap,
  TrendingUp,
  Sliders,
  Scale,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { STEMTab, ChemicalElement } from '../../types/extendedSuperpowers';
import { PERIODIC_TABLE_ELEMENTS } from '../../data/extendedExaminationData';

interface STEMLaboratoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: STEMTab;
}

export const STEMLaboratoryModal: React.FC<STEMLaboratoryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'periodic_table',
}) => {
  const [activeTab, setActiveTab] = useState<STEMTab>(initialTab);

  // Periodic Table State
  const [elementSearch, setElementSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeElement, setActiveElement] = useState<ChemicalElement | null>(PERIODIC_TABLE_ELEMENTS[0]);

  // Chemical Equations State
  const [eqPreset, setEqPreset] = useState<string>('combustion_methane');
  const [customEquation, setCustomEquation] = useState<string>('CH4 + 2O2 -> CO2 + 2H2O');
  const [reactionSolved, setReactionSolved] = useState<{
    balanced: string;
    reactants: string[];
    products: string[];
    moles: string;
    type: string;
  }>({
    balanced: 'CH₄ + 2O₂ ➔ CO₂ + 2H₂O',
    reactants: ['CH₄ (Methane): 1 mol (16.04 g/mol)', 'O₂ (Oxygen): 2 mol (32.00 g/mol)'],
    products: ['CO₂ (Carbon Dioxide): 1 mol (44.01 g/mol)', 'H₂O (Water): 2 mol (18.02 g/mol)'],
    moles: '1 : 2 ➔ 1 : 2',
    type: 'Complete Combustion (Exothermic, ΔH < 0)',
  });

  // pH & Buffers State
  const [phValue, setPhValue] = useState<number>(7.0);
  const [pkaValue, setPkaValue] = useState<number>(4.76); // Acetic acid
  const [acidConc, setAcidConc] = useState<number>(0.1);
  const [saltConc, setSaltConc] = useState<number>(0.1);

  // Kinematics State
  const [initVelocity, setInitVelocity] = useState<number>(20);
  const [launchAngle, setLaunchAngle] = useState<number>(45);
  const [gravity, setGravity] = useState<number>(9.8);

  // Circuits State
  const [r1, setR1] = useState<number>(10);
  const [r2, setR2] = useState<number>(20);
  const [r3, setR3] = useState<number>(30);
  const [circuitVoltage, setCircuitVoltage] = useState<number>(12);

  // Optics State
  const [n1, setN1] = useState<number>(1.0); // Air
  const [n2, setN2] = useState<number>(1.33); // Water
  const [theta1, setTheta1] = useState<number>(30);

  // Genetics State
  const [parent1Alleles, setParent1Alleles] = useState<string>('Bb');
  const [parent2Alleles, setParent2Alleles] = useState<string>('Bb');

  // SI Units State
  const [unitCategory, setUnitCategory] = useState<'pressure' | 'energy' | 'temperature'>('pressure');
  const [unitInputValue, setUnitInputValue] = useState<number>(101325);

  const canvasId = useId();

  if (!isOpen) return null;

  // Filtered periodic table
  const filteredElements = PERIODIC_TABLE_ELEMENTS.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(elementSearch.toLowerCase()) ||
      e.symbol.toLowerCase().includes(elementSearch.toLowerCase()) ||
      e.number.toString().includes(elementSearch);
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Kinematics calculations
  const rad = (launchAngle * Math.PI) / 180;
  const timeOfFlight = (2 * initVelocity * Math.sin(rad)) / gravity;
  const maxHeight = (Math.pow(initVelocity * Math.sin(rad), 2)) / (2 * gravity);
  const range = (Math.pow(initVelocity, 2) * Math.sin(2 * rad)) / gravity;

  // Circuits calculations
  const seriesResistance = r1 + r2 + r3;
  const parallelResistance = 1 / (1 / (r1 || 1) + 1 / (r2 || 1) + 1 / (r3 || 1));
  const seriesCurrent = circuitVoltage / (seriesResistance || 1);
  const seriesPower = circuitVoltage * seriesCurrent;

  // Optics calculations
  const sinTheta2 = (n1 * Math.sin((theta1 * Math.PI) / 180)) / n2;
  const isTIR = sinTheta2 > 1.0;
  const theta2Deg = !isTIR ? (Math.asin(sinTheta2) * 180) / Math.PI : 0;
  const criticalAngleDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

  // pH calculations
  const hConc = Math.pow(10, -phValue);
  const pohValue = 14 - phValue;
  const ohConc = Math.pow(10, -pohValue);
  const bufferPh = pkaValue + Math.log10((saltConc || 0.001) / (acidConc || 0.001));

  // Genetics cross calculations
  const p1_a = parent1Alleles[0] || 'B';
  const p1_b = parent1Alleles[1] || 'b';
  const p2_a = parent2Alleles[0] || 'B';
  const p2_b = parent2Alleles[1] || 'b';
  const punnettCells = [
    { p1: p1_a, p2: p2_a, combo: `${p1_a}${p2_a}` },
    { p1: p1_a, p2: p2_b, combo: `${p1_a}${p2_b}` },
    { p1: p1_b, p2: p2_a, combo: `${p1_b}${p2_a}` },
    { p1: p1_b, p2: p2_b, combo: `${p1_b}${p2_b}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Interactive Science &amp; STEM Laboratory
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                  WAEC · IGCSE · AP · IB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                118-Element Periodic Table, Stoichiometry Balancer, pH Spectrogram, Optics Ray Tracer &amp; Kinematics
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
            { id: 'periodic_table' as STEMTab, label: 'Periodic Table & Flame Tests', icon: Atom },
            { id: 'chemical_equations' as STEMTab, label: 'Stoichiometry & Reactions', icon: FlaskConical },
            { id: 'ph_calculator' as STEMTab, label: 'pH & Acid-Base Buffers', icon: Flame },
            { id: 'kinematics' as STEMTab, label: 'Projectile Motion', icon: TrendingUp },
            { id: 'circuits' as STEMTab, label: "Ohm's Law & DC Circuits", icon: Zap },
            { id: 'optics' as STEMTab, label: "Snell's Law & Ray Optics", icon: Sliders },
            { id: 'genetics' as STEMTab, label: 'Punnett Square Genetics', icon: Sparkles },
            { id: 'units' as STEMTab, label: 'SI Metric Unit Converter', icon: Scale },
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
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-2xs font-bold border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Stage Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: PERIODIC TABLE */}
          {activeTab === 'periodic_table' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={elementSearch}
                    onChange={(e) => setElementSearch(e.target.value)}
                    placeholder="Search by element name, symbol (e.g. Cu, Fe, Na) or atomic number..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto text-xs">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="all">All Element Categories</option>
                    <option value="alkali_metal">Alkali Metals</option>
                    <option value="alkaline_earth">Alkaline Earth</option>
                    <option value="transition_metal">Transition Metals</option>
                    <option value="reactive_nonmetal">Reactive Nonmetals</option>
                    <option value="noble_gas">Noble Gases</option>
                    <option value="metalloid">Metalloids</option>
                    <option value="post_transition_metal">Post-Transition</option>
                  </select>
                </div>
              </div>

              {/* Grid + Inspector */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredElements.map((el) => {
                    const isSelected = activeElement?.number === el.number;
                    return (
                      <button
                        key={el.number}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setActiveElement(el);
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/30'
                            : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">{el.number}</span>
                          <span className="text-[10px] font-mono text-slate-500">{el.atomicMass.toFixed(1)}</span>
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-white my-1">{el.symbol}</div>
                        <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">{el.name}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Element Detail Drawer */}
                {activeElement && (
                  <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold uppercase">
                          Atomic Number {activeElement.number} · Group {activeElement.group} · Period {activeElement.period}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                          {activeElement.name} <span className="text-teal-500">({activeElement.symbol})</span>
                        </h3>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Standard Atomic Weight: {activeElement.atomicMass} u
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-lg border border-teal-500/20">
                        {activeElement.symbol}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-slate-400 text-[10px] uppercase font-mono">Electron Configuration</div>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {activeElement.electronConfiguration}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-slate-400 text-[10px] uppercase font-mono">Flame Test Color</div>
                        <div className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                          {activeElement.flameTestColor || 'No characteristic flame color'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div className="text-slate-400 text-[10px] uppercase font-mono">Electronegativity</div>
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {activeElement.electronegativity ? `${activeElement.electronegativity} (Pauling)` : 'N/A'}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <div className="text-slate-400 text-[10px] uppercase font-mono">Phase at STP</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
                            {activeElement.phaseAtSTP}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 mb-1">
                        <Info className="w-3.5 h-3.5" />
                        <span>Chief Examiner High-Yield Note</span>
                      </div>
                      <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                        {activeElement.examHighlight}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHEMICAL EQUATIONS & STOICHIOMETRY */}
          {activeTab === 'chemical_equations' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chemical Reaction &amp; Stoichiometric Solver
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { id: 'combustion_methane', label: 'Combustion of Methane (CH₄)', eq: 'CH4 + 2O2 -> CO2 + 2H2O' },
                    { id: 'haber_ammonia', label: 'Haber Process (N₂ + 3H₂ ⇌ 2NH₃)', eq: 'N2 + 3H2 -> 2NH3' },
                    { id: 'neutralization', label: 'Neutralization (HCl + NaOH)', eq: 'HCl + NaOH -> NaCl + H2O' },
                    { id: 'iron_rusting', label: 'Iron Oxidation (4Fe + 3O₂)', eq: '4Fe + 3O2 -> 2Fe2O3' },
                    { id: 'photosynthesis', label: 'Photosynthesis (6CO₂ + 6H₂O)', eq: '6CO2 + 6H2O -> C6H12O6 + 6O2' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setEqPreset(p.id);
                        setCustomEquation(p.eq);
                        if (p.id === 'haber_ammonia') {
                          setReactionSolved({
                            balanced: 'N₂ + 3H₂ ⇌ 2NH₃',
                            reactants: ['N₂: 1 mol (28.02 g/mol)', 'H₂: 3 mol (6.06 g/mol)'],
                            products: ['NH₃: 2 mol (34.08 g/mol)'],
                            moles: '1 : 3 ➔ 2',
                            type: 'Synthesis / Industrial Reversible (Exothermic, V₂O₅ / Fe catalyst)',
                          });
                        } else if (p.id === 'neutralization') {
                          setReactionSolved({
                            balanced: 'HCl + NaOH ➔ NaCl + H₂O',
                            reactants: ['HCl: 1 mol (36.46 g/mol)', 'NaOH: 1 mol (40.00 g/mol)'],
                            products: ['NaCl: 1 mol (58.44 g/mol)', 'H₂O: 1 mol (18.02 g/mol)'],
                            moles: '1 : 1 ➔ 1 : 1',
                            type: 'Acid-Base Neutralization (Enthalpy of neutralization ≈ -57.1 kJ/mol)',
                          });
                        } else if (p.id === 'iron_rusting') {
                          setReactionSolved({
                            balanced: '4Fe + 3O₂ ➔ 2Fe₂O₃',
                            reactants: ['Fe: 4 mol (223.4 g)', 'O₂: 3 mol (96.0 g)'],
                            products: ['Fe₂O₃: 2 mol (319.4 g)'],
                            moles: '4 : 3 ➔ 2',
                            type: 'Redox Oxidation (Fe is oxidized from 0 to +3)',
                          });
                        } else {
                          setReactionSolved({
                            balanced: 'CH₄ + 2O₂ ➔ CO₂ + 2H₂O',
                            reactants: ['CH₄: 1 mol (16.04 g/mol)', 'O₂: 2 mol (32.00 g/mol)'],
                            products: ['CO₂: 1 mol (44.01 g/mol)', 'H₂O: 2 mol (18.02 g/mol)'],
                            moles: '1 : 2 ➔ 1 : 2',
                            type: 'Complete Combustion (Exothermic, ΔH < 0)',
                          });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        eqPreset === p.id
                          ? 'bg-teal-500 text-white border-teal-500 font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase">Balanced Equation</div>
                  <div className="text-lg sm:text-xl font-mono font-bold text-teal-600 dark:text-teal-400">
                    {reactionSolved.balanced}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Reaction Classification: <strong className="text-slate-700 dark:text-slate-200">{reactionSolved.type}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white mb-2">Reactants (Left Side)</div>
                    <ul className="space-y-1.5 font-mono text-slate-600 dark:text-slate-400">
                      {reactionSolved.reactants.map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-bold text-slate-900 dark:text-white mb-2">Products (Right Side)</div>
                    <ul className="space-y-1.5 font-mono text-slate-600 dark:text-slate-400">
                      {reactionSolved.products.map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: pH & ACID-BASE BUFFERS */}
          {activeTab === 'ph_calculator' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      pH &amp; Universal Indicator Color Spectrum
                    </h3>
                    <p className="text-xs text-slate-500">
                      Slide to change pH and view hydronium/hydroxide ion concentrations
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                      pH {phValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Spectrum Bar */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="0.1"
                    value={phValue}
                    onChange={(e) => setPhValue(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-teal-600"
                  />
                  <div className="h-6 rounded-xl bg-gradient-to-r from-red-600 via-yellow-400 via-green-500 via-blue-500 to-purple-800 flex items-center justify-between px-2 text-[10px] font-bold text-white shadow-inner">
                    <span>0 (Strong Acid)</span>
                    <span>7 (Neutral)</span>
                    <span>14 (Strong Base)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Hydronium [H⁺]</div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {hConc.toExponential(2)} M
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">pOH</div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {pohValue.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Hydroxide [OH⁻]</div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {ohConc.toExponential(2)} M
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Solution Nature</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {phValue < 6.5 ? 'Acidic' : phValue > 7.5 ? 'Alkaline' : 'Neutral'}
                    </div>
                  </div>
                </div>

                {/* Henderson-Hasselbalch Buffer */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      Henderson-Hasselbalch Weak Acid Buffer Solver
                    </div>
                    <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                      Buffer pH = {bufferPh.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">pKa of Weak Acid</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pkaValue}
                        onChange={(e) => setPkaValue(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">[A⁻] Conjugate Base (M)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={saltConc}
                        onChange={(e) => setSaltConc(parseFloat(e.target.value) || 0.01)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">[HA] Undissociated Acid (M)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={acidConc}
                        onChange={(e) => setAcidConc(parseFloat(e.target.value) || 0.01)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTILE MOTION */}
          {activeTab === 'kinematics' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    2D Projectile Trajectory &amp; Kinematics Engine
                  </h3>
                  <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                    g = {gravity} m/s²
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Initial Launch Velocity (u in m/s)</label>
                    <input
                      type="number"
                      value={initVelocity}
                      onChange={(e) => setInitVelocity(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Launch Angle (θ in degrees)</label>
                    <input
                      type="number"
                      value={launchAngle}
                      onChange={(e) => setLaunchAngle(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Gravity Constant g (m/s²)</label>
                    <select
                      value={gravity}
                      onChange={(e) => setGravity(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono cursor-pointer"
                    >
                      <option value="9.8">9.8 m/s² (Cambridge / AP)</option>
                      <option value="10.0">10.0 m/s² (WAEC / JAMB)</option>
                      <option value="9.81">9.81 m/s² (Standard SI)</option>
                    </select>
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Time of Flight (T)</div>
                    <div className="text-lg font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                      {timeOfFlight.toFixed(2)} s
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">T = (2u sin θ) / g</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Maximum Height (H)</div>
                    <div className="text-lg font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                      {maxHeight.toFixed(2)} m
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">H = (u² sin² θ) / (2g)</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Horizontal Range (R)</div>
                    <div className="text-lg font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                      {range.toFixed(2)} m
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">R = (u² sin 2θ) / g</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DC CIRCUITS */}
          {activeTab === 'circuits' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Ohm&apos;s Law &amp; Resistor Network Solver
                  </h3>
                  <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                    V = IR · P = IV
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Supply EMF V (Volts)</label>
                    <input
                      type="number"
                      value={circuitVoltage}
                      onChange={(e) => setCircuitVoltage(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Resistor R₁ (Ω)</label>
                    <input
                      type="number"
                      value={r1}
                      onChange={(e) => setR1(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Resistor R₂ (Ω)</label>
                    <input
                      type="number"
                      value={r2}
                      onChange={(e) => setR2(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Resistor R₃ (Ω)</label>
                    <input
                      type="number"
                      value={r3}
                      onChange={(e) => setR3(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white">Series Connection</div>
                    <div className="text-lg font-black font-mono text-teal-600 dark:text-teal-400">
                      R_total = {seriesResistance.toFixed(1)} Ω
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-mono">
                      Current I = {seriesCurrent.toFixed(3)} A
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-mono">
                      Total Power P = {seriesPower.toFixed(2)} W
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white">Parallel Connection</div>
                    <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      R_total = {parallelResistance.toFixed(2)} Ω
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-mono">
                      Current I = {(circuitVoltage / (parallelResistance || 1)).toFixed(3)} A
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-mono">
                      Total Power P = {(circuitVoltage * (circuitVoltage / (parallelResistance || 1))).toFixed(2)} W
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OPTICS & SNELL'S LAW */}
          {activeTab === 'optics' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Snell&apos;s Law Refraction &amp; Total Internal Reflection
                  </h3>
                  <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                    n₁ sin θ₁ = n₂ sin θ₂
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Index n₁ (Incident Medium)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={n1}
                      onChange={(e) => setN1(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Index n₂ (Refractive Medium)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={n2}
                      onChange={(e) => setN2(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Incident Angle θ₁ (degrees)</label>
                    <input
                      type="number"
                      value={theta1}
                      onChange={(e) => setTheta1(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  {!isTIR ? (
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-mono">Angle of Refraction θ₂</div>
                      <div className="text-xl font-black font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                        {theta2Deg.toFixed(2)}°
                      </div>
                      <div className="text-slate-500 mt-1">
                        Ray bends {theta2Deg < theta1 ? 'towards' : 'away from'} the normal line.
                      </div>
                    </div>
                  ) : (
                    <div className="text-rose-600 dark:text-rose-400 font-bold">
                      ⚠️ Total Internal Reflection (TIR) Occurs!
                      <div className="text-slate-500 font-normal mt-0.5">
                        Angle of incidence ({theta1}°) exceeds critical angle ({criticalAngleDeg?.toFixed(2)}°). All light reflects back into medium 1.
                      </div>
                    </div>
                  )}

                  {criticalAngleDeg && (
                    <div className="text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800 font-mono">
                      Critical Angle θ_c = {criticalAngleDeg.toFixed(2)}° (where sin θ_c = n₂/n₁)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUNNETT SQUARE GENETICS */}
          {activeTab === 'genetics' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Monohybrid Punnett Square Genetic Cross
                  </h3>
                  <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                    Mendelian Inheritance
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Parent 1 Genotype (e.g. Bb, BB, bb)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={parent1Alleles}
                      onChange={(e) => setParent1Alleles(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-center font-bold text-base"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Parent 2 Genotype (e.g. Bb, BB, bb)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={parent2Alleles}
                      onChange={(e) => setParent2Alleles(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-center font-bold text-base"
                    />
                  </div>
                </div>

                {/* 2x2 Table */}
                <div className="max-w-xs mx-auto border-2 border-teal-500/40 rounded-2xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-3 bg-teal-500/10 text-center font-mono text-xs font-bold py-2 border-b border-teal-500/30">
                    <span className="text-slate-400">P1 \ P2</span>
                    <span className="text-teal-600 dark:text-teal-400">{p2_a}</span>
                    <span className="text-teal-600 dark:text-teal-400">{p2_b}</span>
                  </div>
                  <div className="grid grid-cols-3 text-center font-mono text-sm border-b border-slate-200 dark:border-slate-800">
                    <span className="bg-teal-500/10 font-bold py-3 text-teal-600 dark:text-teal-400">{p1_a}</span>
                    <span className="py-3 font-black text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-800">{punnettCells[0].combo}</span>
                    <span className="py-3 font-black text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-800">{punnettCells[1].combo}</span>
                  </div>
                  <div className="grid grid-cols-3 text-center font-mono text-sm">
                    <span className="bg-teal-500/10 font-bold py-3 text-teal-600 dark:text-teal-400">{p1_b}</span>
                    <span className="py-3 font-black text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-800">{punnettCells[2].combo}</span>
                    <span className="py-3 font-black text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-800">{punnettCells[3].combo}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-center">
                  <div className="font-bold text-slate-900 dark:text-white">Expected Phenotypic Ratio</div>
                  <div className="text-sm font-mono text-teal-600 dark:text-teal-400 font-bold mt-1">
                    Dominant vs Recessive: 75% : 25% (3:1 classic Mendelian F₂ ratio)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SI METRIC UNIT CONVERTER */}
          {activeTab === 'units' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    SI Metric &amp; Scientific Physical Unit Converter
                  </h3>
                  <div className="flex gap-1 text-xs">
                    {(['pressure', 'energy', 'temperature'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setUnitCategory(cat);
                          if (cat === 'pressure') setUnitInputValue(101325);
                          if (cat === 'energy') setUnitInputValue(1000);
                          if (cat === 'temperature') setUnitInputValue(25);
                        }}
                        className={`px-3 py-1 rounded-xl capitalize font-semibold cursor-pointer ${
                          unitCategory === cat
                            ? 'bg-teal-500 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-slate-500 block mb-1 font-mono">
                    Input Value in {unitCategory === 'pressure' ? 'Pascals (Pa)' : unitCategory === 'energy' ? 'Joules (J)' : 'Celsius (°C)'}
                  </label>
                  <input
                    type="number"
                    value={unitInputValue}
                    onChange={(e) => setUnitInputValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-base font-bold"
                  />
                </div>

                {unitCategory === 'pressure' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Atmospheres (atm)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(unitInputValue / 101325).toFixed(4)} atm
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Millimeters of Mercury (mmHg)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(unitInputValue / 133.322).toFixed(2)} mmHg
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Bar</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(unitInputValue / 100000).toFixed(4)} bar
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Kilopascals (kPa)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(unitInputValue / 1000).toFixed(3)} kPa
                      </div>
                    </div>
                  </div>
                )}

                {unitCategory === 'energy' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Calories (cal)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(unitInputValue / 4.184).toFixed(2)} cal
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Electronvolts (eV)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(unitInputValue / 1.602e-19).toExponential(3)} eV
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Kilowatt-hours (kWh)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(unitInputValue / 3.6e6).toExponential(4)} kWh
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Kilojoules (kJ)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(unitInputValue / 1000).toFixed(2)} kJ
                      </div>
                    </div>
                  </div>
                )}

                {unitCategory === 'temperature' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Kelvin (K)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(unitInputValue + 273.15).toFixed(2)} K
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Fahrenheit (°F)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {((unitInputValue * 9) / 5 + 32).toFixed(2)} °F
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px] font-mono">Rankine (°R)</div>
                      <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                        {(((unitInputValue + 273.15) * 9) / 5).toFixed(2)} °R
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
