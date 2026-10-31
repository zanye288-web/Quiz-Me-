import React, { useState } from 'react';
import {
  X,
  Compass,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Search,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { useFoundation } from '../../context/FoundationContext';
import {
  FOUNDATIONAL_AXIOMS,
  FOUNDATION_DIAGNOSTIC_QUESTIONS,
} from '../../data/foundationalCurriculumData';
import { FoundationSubjectDomain, FoundationalAxiom } from '../../types/foundation';

interface FoundationExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoundationExplorerModal: React.FC<FoundationExplorerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isFoundationMode, toggleFoundationMode } = useFoundation();

  const [activeDomain, setActiveDomain] = useState<FoundationSubjectDomain | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAxiom, setSelectedAxiom] = useState<FoundationalAxiom>(FOUNDATIONAL_AXIOMS[0]);

  // Diagnostic Check State
  const [activeCheckIndex, setActiveCheckIndex] = useState<number>(0);
  const [selectedCheckAnswer, setSelectedCheckAnswer] = useState<string | null>(null);
  const [checkChecked, setCheckChecked] = useState<boolean>(false);
  const [checkScore, setCheckScore] = useState<number>(0);
  const [showDiagnosticQuiz, setShowDiagnosticQuiz] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredAxioms = FOUNDATIONAL_AXIOMS.filter((ax) => {
    const matchesDomain = activeDomain === 'all' || ax.domain === activeDomain;
    const matchesSearch =
      ax.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ax.oneSentenceRule.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const currentDiag = FOUNDATION_DIAGNOSTIC_QUESTIONS[activeCheckIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Foundations &amp; Prerequisite Knowledge Explorer
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                  Universal Scaffolding
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                First-principles axioms, step-by-step thinking ladders, and prerequisite concepts across every feature
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Foundation Mode Switch */}
            <button
              type="button"
              onClick={toggleFoundationMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isFoundationMode
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs shadow-amber-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Toggle Foundation Mode across the entire app"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Foundation Mode: {isFoundationMode ? 'ACTIVE' : 'OFF'}</span>
            </button>

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
        </div>

        {/* Global Foundation Banner */}
        <div className="px-5 py-2.5 bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Foundation First Principle:</strong> Master the core elementary rule before calculating. Scaffolded hints, prerequisite definitions, and thinking steps are active on every quiz and tool.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setShowDiagnosticQuiz((prev) => !prev);
            }}
            className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer shadow-xs"
          >
            {showDiagnosticQuiz ? 'Back to Axiom Explorer' : 'Take 4-Question Prerequisite Check'}
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!showDiagnosticQuiz ? (
            <div className="space-y-6">
              {/* Domain Filters + Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search foundational axioms (e.g. BODMAS, Newton's Laws, Osmosis, Mole)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto text-xs">
                  {[
                    { id: 'all', label: 'All Domains' },
                    { id: 'mathematics', label: 'Math' },
                    { id: 'physics', label: 'Physics' },
                    { id: 'chemistry', label: 'Chemistry' },
                    { id: 'biology', label: 'Biology' },
                    { id: 'literature_english', label: 'English/Lit' },
                    { id: 'exam_technique', label: 'Exam Tech' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setActiveDomain(d.id as any);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                        activeDomain === d.id
                          ? 'bg-amber-500 text-white'
                          : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two-Column Stage */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Axioms List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredAxioms.map((ax) => {
                    const isSelected = selectedAxiom.id === ax.id;
                    return (
                      <button
                        key={ax.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedAxiom(ax);
                        }}
                        className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
                            : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{ax.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                            {ax.domain}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1">{ax.oneSentenceRule}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Axiom Scaffolding Stage */}
                <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div>
                    <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">
                      {selectedAxiom.domain} · Foundational Pillar
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedAxiom.title}
                    </h3>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <strong className="text-amber-700 dark:text-amber-300 block mb-1">Foundational Golden Rule:</strong>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {selectedAxiom.oneSentenceRule}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Why This Is True (First Principles Derivation)</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedAxiom.firstPrinciplesExplanation}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-xs">
                    <strong className="text-rose-800 dark:text-rose-300 block mb-1">Common Examiner Trap / Misconception:</strong>
                    <p className="text-rose-900/90 dark:text-rose-200/90 leading-relaxed">
                      {selectedAxiom.commonMisconception}
                    </p>
                  </div>

                  {/* Scaffolded Example Walkthrough */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Scaffolded Step-by-Step Walkthrough:
                    </div>
                    <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {selectedAxiom.scaffoldedExample.problem}
                    </div>
                    <div className="space-y-1 pt-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {selectedAxiom.scaffoldedExample.steps.map((st, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      Final Verified Answer: {selectedAxiom.scaffoldedExample.answer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Diagnostic 4-Question Check */
            <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  Prerequisite Check {activeCheckIndex + 1} of {FOUNDATION_DIAGNOSTIC_QUESTIONS.length}
                </span>
                <span className="text-slate-500">
                  Concept: {currentDiag.prerequisiteConcept}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentDiag.question}
              </h3>

              <div className="space-y-2">
                {currentDiag.options.map((opt, i) => {
                  const isSelected = selectedCheckAnswer === opt;
                  const isCorrect = opt === currentDiag.correctAnswer;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={checkChecked}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedCheckAnswer(opt);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                        checkChecked
                          ? isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                            : isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                          : isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 font-bold ring-2 ring-amber-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {checkChecked && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Foundational Concept Explanation</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentDiag.foundationExplanation}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                {!checkChecked ? (
                  <button
                    type="button"
                    disabled={!selectedCheckAnswer}
                    onClick={() => {
                      if (!selectedCheckAnswer) return;
                      setCheckChecked(true);
                      if (selectedCheckAnswer === currentDiag.correctAnswer) {
                        soundFx.playCorrect();
                        setCheckScore((s) => s + 1);
                      } else {
                        soundFx.playClick();
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Check Prerequisite Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      if (activeCheckIndex < FOUNDATION_DIAGNOSTIC_QUESTIONS.length - 1) {
                        setActiveCheckIndex((i) => i + 1);
                        setSelectedCheckAnswer(null);
                        setCheckChecked(false);
                      } else {
                        setShowDiagnosticQuiz(false);
                        setActiveCheckIndex(0);
                        setSelectedCheckAnswer(null);
                        setCheckChecked(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
                  >
                    <span>
                      {activeCheckIndex < FOUNDATION_DIAGNOSTIC_QUESTIONS.length - 1
                        ? 'Next Prerequisite Question'
                        : 'Complete Check & Return to Explorer'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
