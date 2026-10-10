import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Layers,
  FileText,
  Target,
} from 'lucide-react';
import { MistakeAnalysisReport, MistakeAnalysisItem } from '../types/learningSystem';
import { soundFx } from '../utils/audio';

interface QuizMistakesDiagnosticsViewProps {
  report: MistakeAnalysisReport;
  onGenerateNotesFromMistakes: () => void;
  onAskTutorAboutMistake: (mistake: MistakeAnalysisItem) => void;
  onPracticeRemediation?: () => void;
}

export const QuizMistakesDiagnosticsView: React.FC<QuizMistakesDiagnosticsViewProps> = ({
  report,
  onGenerateNotesFromMistakes,
  onAskTutorAboutMistake,
  onPracticeRemediation,
}) => {
  const [selectedMistakeId, setSelectedMistakeId] = useState<number | null>(
    report.detailedMistakes.length > 0 ? report.detailedMistakes[0].questionId : null
  );

  return (
    <div className="comic-panel rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-6 transition-colors">
      {/* Diagnostics Header & Key Indicators */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-900/15 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-xl bg-amber-300 border-2 border-slate-950 text-slate-950">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="comic-badge px-2 py-0.5 rounded-md bg-rose-500 text-white border border-slate-950 text-[10px] font-black uppercase tracking-wider">
              GAP DIAGNOSTICS
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Pedagogical Mistake Diagnostics &amp; Knowledge Gap Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Identifies conceptual misconceptions causing errors and prescribes targeted remedial action.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onGenerateNotesFromMistakes();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Generate Remediation Notes</span>
          </button>
        </div>
      </div>

      {/* Accuracy & Topic Balance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Strong Topics */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Strong Topics</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {report.strongTopics.map((st, i) => (
              <span
                key={i}
                className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700/60 shadow-2xs"
              >
                {st}
              </span>
            ))}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-700 dark:text-rose-400">
            <XCircle className="w-4 h-4" />
            <span>Weak Topics / Needs Work</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {report.weakTopics.map((wt, i) => (
              <span
                key={i}
                className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 border border-rose-300/60 dark:border-rose-700/60 shadow-2xs"
              >
                {wt}
              </span>
            ))}
          </div>
        </div>

        {/* Actionable Study Plan */}
        <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-700 dark:text-purple-400">
            <Lightbulb className="w-4 h-4" />
            <span>Tutor Study Plan</span>
          </div>
          <p className="text-xs text-purple-950 dark:text-purple-200 font-medium leading-relaxed">
            {report.tutorStudyPlan}
          </p>
        </div>
      </div>

      {/* Identified Misconceptions Summary */}
      {report.misconceptions && report.misconceptions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 space-y-2">
          <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-2 uppercase tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Identified Cognitive Misconceptions</span>
          </h4>
          <div className="space-y-1.5">
            {report.misconceptions.map((m, i) => (
              <div key={i} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <span className="font-bold text-amber-600 mt-0.5">•</span>
                <p className="leading-relaxed">{m}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Per-Question Mistake Breakdown */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Missed Questions Breakdown ({report.detailedMistakes.length})</span>
          <span className="text-[10px] text-slate-500 font-bold">Click question to diagnose</span>
        </h4>

        <div className="space-y-3">
          {report.detailedMistakes.map((m) => {
            const isSelected = selectedMistakeId === m.questionId;
            return (
              <div
                key={m.questionId}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/40 dark:bg-slate-800 border-indigo-400 dark:border-indigo-600 shadow-sm'
                    : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                }`}
                onClick={() => setSelectedMistakeId(m.questionId)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black flex items-center justify-center">
                        ✗
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                        {m.topic}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {m.questionText}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playClick();
                      onAskTutorAboutMistake(m);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 shadow-2xs shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain with AI Tutor</span>
                  </button>
                </div>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40">
                    <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">
                      Your Selected Answer:
                    </span>
                    <p className="font-bold text-rose-900 dark:text-rose-200 mt-0.5">
                      {m.userAnswer || '(None provided)'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40">
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                      Correct Answer:
                    </span>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                      {m.correctAnswer}
                    </p>
                  </div>
                </div>

                {/* Diagnosed Misconception & Explanation */}
                <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  {m.diagnosedMisconception && (
                    <div className="text-amber-800 dark:text-amber-300 font-semibold flex items-start gap-1.5">
                      <span className="font-black text-amber-600">Cognitive Gap:</span>
                      <span>{m.diagnosedMisconception}</span>
                    </div>
                  )}
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Rule: </span>
                    {m.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
