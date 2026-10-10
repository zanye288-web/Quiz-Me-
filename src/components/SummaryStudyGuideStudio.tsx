import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  FileText,
  Zap,
  Download,
  Printer,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Check,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SummaryStudyGuideStudioProps {
  onGenerateQuizFromTopic?: (topic: string) => void;
  onAwardXp?: (xp: number, reason: string) => void;
}

interface GeneratedGuide {
  title: string;
  subtitle: string;
  readingTimeMinutes: number;
  executiveOverview: string;
  keyPillars: Array<{
    heading: string;
    summary: string;
    bulletPoints: string[];
    examTip: string;
  }>;
  keyTermsGlossary: Array<{
    term: string;
    definition: string;
  }>;
  formulaOrRuleBox: string[];
  selfCheckQuestions: Array<{
    question: string;
    answer: string;
  }>;
}

export const SummaryStudyGuideStudio: React.FC<SummaryStudyGuideStudioProps> = ({
  onGenerateQuizFromTopic,
  onAwardXp,
}) => {
  const [topicOrMaterial, setTopicOrMaterial] = useState('');
  const [mode, setMode] = useState<'executive_summary' | 'comprehensive_study_guide' | 'exam_cram_sheet'>(
    'comprehensive_study_guide'
  );
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Master'>('Intermediate');
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<GeneratedGuide | null>(null);
  const [revealedCheckIdx, setRevealedCheckIdx] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [themeStyle, setThemeStyle] = useState<'editorial' | 'midnight' | 'emerald'>('editorial');

  const samplePresets = [
    'Cellular Respiration, Glycolysis, Krebs Cycle & ATP Synthase',
    'Calculus: Derivatives, Chain Rule, and Optimization Problems',
    'World War II: European & Pacific Theaters and Geopolitical Impact',
    'Data Structures: Binary Search Trees, Hash Tables & Graph Traversal',
  ];

  const handleGenerate = async (customTopic?: string) => {
    const input = (customTopic ?? topicOrMaterial).trim();
    if (!input) return;

    setLoading(true);
    soundFx.playClick();

    try {
      const res = await fetch('/api/summary-study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOrMaterial: input.slice(0, 5000),
          mode,
          difficulty,
        }),
      });
      const data = await res.json();
      if (data.success && data.guide) {
        setGuide(data.guide);
        setRevealedCheckIdx({});
        soundFx.playSuccess();
        if (onAwardXp) onAwardXp(35, 'Generated AI Study Guide & Summary');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!guide) return;
    const lines: string[] = [
      `====================================================================`,
      `${guide.title.toUpperCase()}`,
      `${guide.subtitle}`,
      `====================================================================`,
      ``,
      `EXECUTIVE OVERVIEW:`,
      guide.executiveOverview,
      ``,
      `KEY PILLARS & CONCEPTUAL BREAKDOWN:`,
      ...guide.keyPillars.flatMap((p) => [
        `\n--- ${p.heading} ---`,
        p.summary,
        ...p.bulletPoints.map((b) => `  • ${b}`),
        `  [EXAM TIP]: ${p.examTip}`,
      ]),
      ``,
      `ESSENTIAL RULES & FORMULAS:`,
      ...guide.formulaOrRuleBox.map((r) => `  * ${r}`),
      ``,
      `KEY TERMS GLOSSARY:`,
      ...guide.keyTermsGlossary.map((g) => `  • ${g.term}: ${g.definition}`),
      ``,
      `ACTIVE RECALL SELF-CHECK:`,
      ...guide.selfCheckQuestions.flatMap((q, i) => [
        `  Q${i + 1}: ${q.question}`,
        `  A${i + 1}: ${q.answer}`,
      ]),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_study_guide.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    if (!guide) return;
    const md = `# ${guide.title}\n_${guide.subtitle}_\n\n## Executive Summary\n${guide.executiveOverview}\n\n${guide.keyPillars
      .map(
        (p) =>
          `### ${p.heading}\n${p.summary}\n${p.bulletPoints.map((b) => `- ${b}`).join('\n')}\n> **Exam Tip:** ${p.examTip}`
      )
      .join('\n\n')}`;
    navigator.clipboard?.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="comic-panel pattern-blueprint-grid p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
                AI CRAM SHEET
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Summary &amp; Study Guide Studio</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Sleek Executive Summaries &amp; Master Study Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
              Paste up to 5,000 characters of lecture notes, textbook chapters, or any academic topic to synthesize a structured, exam-ready visual study guide.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'executive_summary', label: 'Executive Summary', icon: FileText },
              { id: 'comprehensive_study_guide', label: 'Master Study Guide', icon: BookOpen },
              { id: 'exam_cram_sheet', label: 'Exam Cram Sheet', icon: Zap },
            ].map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-slate-950 shadow-lg'
                      : 'bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Box */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <textarea
              value={topicOrMaterial}
              onChange={(e) => setTopicOrMaterial(e.target.value.slice(0, 5000))}
              rows={4}
              placeholder="Enter any topic, syllabus, or paste lecture notes (up to 5,000 characters)... Press Ctrl + Enter to generate, or Enter for a new line."
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="w-full p-4 rounded-2xl bg-slate-950/70 border border-indigo-400/30 text-sm text-white placeholder-indigo-300/40 focus:outline-none focus:border-indigo-400 resize-y"
            />
            <div className="absolute bottom-3 right-3 text-[11px] font-mono text-indigo-300/70">
              {topicOrMaterial.length} / 5000 chars
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-indigo-300">Quick Presets:</span>
              {samplePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setTopicOrMaterial(preset);
                    handleGenerate(preset);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/20 text-[11px] font-bold text-indigo-100 cursor-pointer"
                >
                  {preset.split(':')[0]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-indigo-400/30 text-xs font-bold text-white"
              >
                <option value="Beginner">Beginner Depth</option>
                <option value="Intermediate">Intermediate Depth</option>
                <option value="Master">Master / AP Depth</option>
              </select>

              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={loading || !topicOrMaterial.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:opacity-95 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Synthesizing Guide...' : 'Generate Sleek Guide'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rendered Study Guide Canvas */}
      {guide && (
        <div
          className={`rounded-3xl border p-6 sm:p-8 transition-all shadow-xl space-y-6 ${
            themeStyle === 'midnight'
              ? 'bg-slate-950 border-slate-800 text-slate-100'
              : themeStyle === 'emerald'
              ? 'bg-emerald-950/95 border-emerald-800/70 text-emerald-50'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
          }`}
        >
          {/* Top Action & Theme Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-xs font-black flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{guide.readingTimeMinutes} min read</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-xs font-black flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>{difficulty} Rigor</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['editorial', 'midnight', 'emerald'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setThemeStyle(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize border cursor-pointer ${
                    themeStyle === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-300 dark:border-slate-700 opacity-75'
                  }`}
                >
                  {t} UI
                </button>
              ))}

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-indigo-400"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied MD' : 'Copy Markdown'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-indigo-400"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TXT</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-indigo-400"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>

              {onGenerateQuizFromTopic && (
                <button
                  type="button"
                  onClick={() => onGenerateQuizFromTopic(guide.title)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Practice Quiz on This</span>
                </button>
              )}
            </div>
          </div>

          {/* Title & Executive Overview */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{guide.title}</h1>
            <p className="text-sm opacity-75 font-medium">{guide.subtitle}</p>
            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
              <div className="text-xs font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Executive Synopsis</span>
              </div>
              <p className="text-sm leading-relaxed">{guide.executiveOverview}</p>
            </div>
          </div>

          {/* Key Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guide.keyPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <h3 className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {pillar.heading}
                  </h3>
                  <p className="text-xs leading-relaxed opacity-85">{pillar.summary}</p>
                  <ul className="space-y-1.5 pt-1">
                    {pillar.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx} className="text-xs flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px]">
                  <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-0.5">
                    💡 High-Yield Exam Tip
                  </span>
                  <span className="opacity-90">{pillar.examTip}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Formula / Rule Box + Glossary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                📐 Governing Rules, Axioms & Formulas
              </h3>
              <div className="space-y-2">
                {guide.formulaOrRuleBox.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/80 border border-purple-500/20 font-mono text-xs"
                  >
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                📖 Essential Terminology Glossary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {guide.keyTermsGlossary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800"
                  >
                    <div className="font-black text-xs text-indigo-600 dark:text-indigo-400">
                      {item.term}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5 leading-relaxed">{item.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Recall Self-Check Questions */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Active Recall Self-Check (Click to Reveal Model Answers)</span>
            </h3>
            <div className="space-y-2">
              {guide.selfCheckQuestions.map((sc, idx) => {
                const open = Boolean(revealedCheckIdx[idx]);
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedCheckIdx((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                      className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold">
                        Q{idx + 1}. {sc.question}
                      </span>
                      {open ? (
                        <ChevronUp className="w-4 h-4 shrink-0 opacity-60" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
                      )}
                    </button>
                    {open && (
                      <div className="p-4 bg-emerald-500/10 border-t border-emerald-500/20 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                        <strong className="font-black text-emerald-600 dark:text-emerald-400">
                          Verified Model Answer:{' '}
                        </strong>
                        {sc.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
