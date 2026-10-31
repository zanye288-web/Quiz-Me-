import React, { useState } from 'react';
import {
  Calculator,
  BookOpen,
  Edit3,
  BarChart3,
  Headphones,
  Printer,
  Database,
  Flame,
  ChevronUp,
  ChevronDown,
  Sparkles,
  FileSpreadsheet,
  FlaskConical,
  Sigma,
  Monitor,
  Heart,
  Brain,
  Feather,
  Compass,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface FloatingExamToolkitDockProps {
  onOpenToolbox: (tab: any) => void;
  onOpenHeatmap: () => void;
  onOpenPodcast: () => void;
  onOpenCheatSheet: () => void;
  onOpenBackup: () => void;
  onOpenStem?: () => void;
  onOpenHumanities?: () => void;
  onOpenMathSandbox?: () => void;
  onOpenExamSim?: () => void;
  onOpenWellness?: () => void;
  onOpenMnemonics?: () => void;
  onOpenFoundation?: () => void;
}

export const FloatingExamToolkitDock: React.FC<FloatingExamToolkitDockProps> = ({
  onOpenToolbox,
  onOpenHeatmap,
  onOpenPodcast,
  onOpenCheatSheet,
  onOpenBackup,
  onOpenStem,
  onOpenHumanities,
  onOpenMathSandbox,
  onOpenExamSim,
  onOpenWellness,
  onOpenMnemonics,
  onOpenFoundation,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Expanded Tools Palette */}
      {isExpanded && (
        <div className="p-3 rounded-3xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md flex flex-col gap-2 animate-in slide-in-from-bottom-3 duration-150 max-w-sm">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between gap-3">
            <span>Candidate Examination Superpowers</span>
            <span className="text-amber-400 font-mono font-bold">150 Features Active</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-1">
            {/* Row 1: Core Tools */}
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenToolbox('calculator');
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Scientific & Graphing Calculator"
            >
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Calc</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenToolbox('formulas');
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Official Formula Booklet"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Formulas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenToolbox('scratchpad');
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Working Scratchpad Canvas"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Scratch</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenToolbox('omr_sheet');
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="OMR 20-Item Bubble Sheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>OMR</span>
            </button>

            {/* Row 2: STEM & Math */}
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenStem?.();
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Interactive Science & STEM Lab"
            >
              <FlaskConical className="w-4 h-4 text-teal-400" />
              <span>STEM Lab</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenMathSandbox?.();
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Math & Statistics Sandbox"
            >
              <Sigma className="w-4 h-4 text-blue-400" />
              <span>Math Box</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenHumanities?.();
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Humanities, Literature & PEEL"
            >
              <Feather className="w-4 h-4 text-amber-300" />
              <span>Literature</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenExamSim?.();
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="JAMB 8-Key CBT & Exam Dockets"
            >
              <Monitor className="w-4 h-4 text-rose-400" />
              <span>CBT Pass</span>
            </button>

            {/* Row 3: Memory & Diagnostics */}
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenMnemonics?.();
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Mnemonics & Memory Vault"
            >
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Mnemonics</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenWellness?.();
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Candidate Wellness & Breathing"
            >
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Wellness</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenHeatmap();
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Diagnostic Syllabus Heatmap"
            >
              <BarChart3 className="w-4 h-4 text-pink-400" />
              <span>Heatmap</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenPodcast();
                setIsExpanded(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Audio Revision Podcasts"
            >
              <Headphones className="w-4 h-4 text-violet-400" />
              <span>Podcast</span>
            </button>

            {/* Row 4: Foundation Anchor */}
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenFoundation?.();
                setIsExpanded(false);
              }}
              className="col-span-4 p-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-400/40 flex items-center justify-center gap-2 text-xs text-amber-300 hover:text-white transition-all cursor-pointer font-bold shadow-xs"
              title="First-Principles Foundation Explorer & Scaffolding Engine (Alt+0)"
            >
              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
              <span>First-Principles Foundation Explorer</span>
              <span className="text-[10px] bg-amber-400/30 px-1.5 py-0.5 rounded text-amber-200 border border-amber-400/40">
                Alt+0
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2 text-[10px]">
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenCheatSheet();
                setIsExpanded(false);
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3 h-3 text-teal-400" />
              <span>Printable A4 Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onOpenBackup();
                setIsExpanded(false);
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Database className="w-3 h-3 text-sky-400" />
              <span>Sync &amp; Backup</span>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Pill Button */}
      <button
        type="button"
        onClick={() => {
          soundFx.playClick();
          setIsExpanded((prev) => !prev);
        }}
        className="px-4 py-2.5 rounded-full bg-slate-900 text-white border border-slate-700 shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span>150 Superpowers</span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>
    </div>
  );
};
