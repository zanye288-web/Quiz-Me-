import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { FORMULA_BOOKLET_DATA, PHYSICAL_CONSTANTS_CATALOG, EXAM_COMMAND_WORDS } from '../../data/examinationFormulasAndConstants';
import { soundFx } from '../../utils/audio';

interface PrintableCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableCheatSheetModal: React.FC<PrintableCheatSheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSheet, setSelectedSheet] = useState<'waec' | 'cambridge' | 'sat'>('waec');

  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header (hidden in print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Printable Examination Formula Cheat Sheet &amp; Data Booklet
              </h3>
              <p className="text-[11px] text-slate-500">
                High-density, multi-column A4/Letter formatted reference sheets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Board Switcher (hidden in print) */}
        <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 print:hidden text-xs">
          <span className="font-bold text-slate-500">Preset:</span>
          {[
            { id: 'waec', label: '🇳🇬 WAEC (WASSCE) & NECO Senior Secondary Compendium' },
            { id: 'cambridge', label: '🇬🇧 Cambridge IGCSE & A-Level Formula Sheet' },
            { id: 'sat', label: '🇺🇸 Digital SAT & AP STEM Reference Guide' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedSheet(preset.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer ${
                selectedSheet === preset.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Printable Paper Area (Formatted like official booklet) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 space-y-6 font-serif">
          {/* Cover Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1 font-sans">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              QUIZ ME! CANDIDATE ACADEMIC REFERENCE SERIES
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {selectedSheet === 'waec'
                ? 'WASSCE & NECO Senior Secondary Mathematics & Science Compendium'
                : selectedSheet === 'cambridge'
                ? 'Cambridge Assessment International Education Formula & Data Sheet'
                : 'College Board Digital SAT & Advanced Placement Reference Guide'}
            </h2>
            <p className="text-xs text-slate-600">
              Authorized revision formulas, physical constants, SI units, and command word expectations.
            </p>
          </div>

          {/* Section 1: Physical Constants Table */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              Table 1: Fundamental Physical &amp; Chemical Constants
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              {PHYSICAL_CONSTANTS_CATALOG.map((c) => (
                <div key={c.symbol} className="p-2 border border-slate-200 rounded flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{c.name} ({c.symbol})</span>
                  <span className="font-mono font-bold">{c.value} {c.units}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Mathematical & Science Formulas Grid */}
          <div className="space-y-2 pt-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              Table 2: Core Syllabus Formulas &amp; Governing Equations
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
              {FORMULA_BOOKLET_DATA.map((f) => (
                <div key={f.id} className="p-3 border border-slate-300 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{f.title}</span>
                    <span className="text-[10px] uppercase font-bold text-indigo-700">[{f.category}]</span>
                  </div>
                  <div className="font-mono font-bold text-xs p-1.5 bg-slate-100 rounded text-slate-900">
                    {f.formulaPlain}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {f.explanation}
                  </p>
                  {f.commonExaminerTrap && (
                    <p className="text-[10px] text-amber-800 italic">
                      Examiner Note: {f.commonExaminerTrap}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Command Words Quick Key */}
          <div className="space-y-2 pt-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              Table 3: Chief Examiner Command Word Marks Matrix
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
              {EXAM_COMMAND_WORDS.map((cw) => (
                <div key={cw.word} className="p-2 border border-slate-200 rounded">
                  <div className="flex items-center justify-between font-bold">
                    <span>&ldquo;{cw.word}&rdquo;</span>
                    <span className="text-indigo-700">{cw.expectedMarks}</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{cw.meaning}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Footer */}
          <div className="pt-6 border-t-2 border-slate-900 flex items-center justify-between text-xs font-sans text-slate-500">
            <div>Quiz Me! International Academic Engine</div>
            <div>Authorized Candidate Study Booklet · For Educational Revision Use Only</div>
          </div>
        </div>
      </div>
    </div>
  );
};
