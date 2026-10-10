import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Copy,
  Check,
  Download,
  Share2,
  RotateCcw,
  X,
  FileText,
  Bookmark,
  Layers,
  ListOrdered,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Play,
  Volume2,
} from 'lucide-react';
import { IntelligentNote, SelfCheckQuestion, CommonMistakeItem } from '../types/learningSystem';
import { soundFx } from '../utils/audio';

interface IntelligentNotesViewerProps {
  note: IntelligentNote;
  onClose?: () => void;
  onLaunchPracticeQuiz?: (topic: string, questions?: SelfCheckQuestion[]) => void;
  onAskTutorAboutNote?: (conceptTitle: string, context: string) => void;
  isModal?: boolean;
}

export const IntelligentNotesViewer: React.FC<IntelligentNotesViewerProps> = ({
  note,
  onClose,
  onLaunchPracticeQuiz,
  onAskTutorAboutNote,
  isModal = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'study' | 'mistakes' | 'revision' | 'self_check'>('study');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [userSelectedAnswers, setUserSelectedAnswers] = useState<Record<number, string>>({});
  const [checkedResults, setCheckedResults] = useState<Record<number, boolean>>({});

  const handleCopyNoteMarkdown = () => {
    soundFx.playClick();
    const md = `# ${note.title}
*Subject: ${note.subject} | Topic: ${note.topic}*

## Introduction
${note.topicIntroduction}

## Key Concepts
${note.keyConcepts.map((k) => `### ${k.title}\n${k.explanation}`).join('\n\n')}

## Detailed Explanation
${note.detailedExplanation.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

## Examples
${note.examples.map((e) => `* **${e.scenario}**: ${e.explanation}`).join('\n\n')}

## Common Mistakes & How to Fix Them
${note.commonMistakes.map((m) => `* **Mistake**: ${m.mistake}\n  * *Why it happens*: ${m.whyItHappens}\n  * *Correction*: ${m.correction}`).join('\n\n')}

## Remember This (Key Facts)
${note.rememberThis.map((r) => `* ${r}`).join('\n')}

## Quick Revision
${note.quickRevision.map((q) => `* ${q}`).join('\n')}

## Self-Check Questions
${note.selfCheckQuestions.map((q, i) => `### Question ${i + 1}: ${q.question}\n*Answer*: ${q.answer}\n*Explanation*: ${q.explanation}`).join('\n\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    soundFx.playClick();
    const md = `# ${note.title}\n\n${note.topicIntroduction}\n\n` +
      `## Key Concepts\n` + note.keyConcepts.map(c => `### ${c.title}\n${c.explanation}`).join('\n\n') +
      `\n\n## Quick Revision\n` + note.quickRevision.map(r => `- ${r}`).join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleAnswerReveal = (qIdx: number) => {
    soundFx.playClick();
    setRevealedAnswers((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  const handleSelectOption = (qIdx: number, option: string, correctAnswer: string) => {
    soundFx.playSelect();
    setUserSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
    const isCorrect = option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setCheckedResults((prev) => ({ ...prev, [qIdx]: isCorrect }));
    if (isCorrect) soundFx.playCorrect();
    else soundFx.playIncorrect();
  };

  return (
    <div className={`bg-white dark:bg-slate-900 ${isModal ? 'comic-modal-panel max-h-[90vh] overflow-y-auto rounded-3xl' : 'comic-panel rounded-3xl'} overflow-hidden transition-colors`}>
      {/* Note Header */}
      <div className="pattern-halftone p-6 sm:p-7 border-b-2 border-slate-900/15 dark:border-slate-800 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="comic-badge px-2 py-0.5 rounded-md bg-amber-300 text-slate-950 border border-slate-950 text-[10px] font-black uppercase tracking-wider">
                STUDY SHEET
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white shadow-2xs">
                <BookOpen className="w-3.5 h-3.5" />
                <span>AI Intelligent Notes</span>
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {note.subject}
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                {note.topic}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {note.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {note.topicIntroduction}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyNoteMarkdown}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
              title="Copy as Markdown"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
              title="Download Markdown Notes"
            >
              <Download className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Note Nav Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('study');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'study'
                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Concepts & Explanations</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('mistakes');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mistakes'
                ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Common Mistakes ({note.commonMistakes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('revision');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'revision'
                ? 'bg-purple-600 text-white shadow-xs font-extrabold'
                : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Quick Revision & Facts</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('self_check');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'self_check'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Self-Check ({note.selfCheckQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* TAB 1: STUDY & CONCEPTS */}
        {activeTab === 'study' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Visual Asset if present */}
            {note.visualAsset && note.visualAsset.url && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm">
                <img
                  src={note.visualAsset.url}
                  alt={note.visualAsset.caption}
                  className="w-full max-h-72 object-cover"
                />
                <div className="p-3 bg-slate-900 text-slate-300 text-xs flex items-center justify-between">
                  <p className="font-medium">{note.visualAsset.caption}</p>
                  {note.visualAsset.imageType && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400">
                      {note.visualAsset.imageType}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Key Concepts Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Key Concepts</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {note.keyConcepts.map((kc, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/50 space-y-2 hover:border-indigo-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Concept {i + 1}
                      </span>
                      {onAskTutorAboutNote && (
                        <button
                          type="button"
                          onClick={() => onAskTutorAboutNote(kc.title, kc.explanation)}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Ask Tutor</span>
                        </button>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {kc.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {kc.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Progressive Detailed Explanation */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-indigo-500" />
                <span>Step-by-Step Progressive Explanation</span>
              </h3>
              <div className="space-y-3">
                {note.detailedExplanation.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
                  >
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {i + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Examples */}
            {note.examples && note.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-purple-500" />
                  <span>Concrete Examples & Scenarios</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {note.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-1.5"
                    >
                      <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                        Scenario {i + 1}: {ex.scenario}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {ex.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMMON MISTAKES */}
        {activeTab === 'mistakes' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                  Pedagogical Misconceptions Watchlist
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                  These represent the most frequent mental errors learners make when answering questions on {note.topic}. Review them carefully to avoid standard multiple-choice traps.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {note.commonMistakes.map((cm, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shrink-0">
                      Trap {i + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {cm.mistake}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        Why this mistake happens:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {cm.whyItHappens}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-1">
                      <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>The Correct Mental Model:</span>
                      </span>
                      <p className="text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
                        {cm.correction}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUICK REVISION & REMEMBER THIS */}
        {activeTab === 'revision' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Remember This: High Value Facts */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Remember This (High-Yield Core Facts)</span>
              </h3>
              <div className="space-y-2">
                {note.rememberThis.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                    <span className="text-amber-500 font-black mt-0.5">•</span>
                    <p className="font-bold leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Revision Bullet points */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Quick Revision Checklist</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {note.quickRevision.map((point, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2.5 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      ✓
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400">Keywords:</span>
              {note.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INTERACTIVE SELF-CHECK QUESTIONS */}
        {activeTab === 'self_check' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Knowledge Verification Questions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Test whether you understand the core concepts of this note before taking a full quiz.
                </p>
              </div>

              {onLaunchPracticeQuiz && (
                <button
                  type="button"
                  onClick={() => onLaunchPracticeQuiz(note.topic, note.selfCheckQuestions)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Practice Quiz</span>
                </button>
              )}
            </div>

            <div className="space-y-4 pt-2">
              {note.selfCheckQuestions.map((q, qIdx) => {
                const isRevealed = revealedAnswers[qIdx] || false;
                const userChoice = userSelectedAnswers[qIdx];
                const isEvaluated = checkedResults[qIdx] !== undefined;
                const isCorrect = checkedResults[qIdx];

                return (
                  <div
                    key={qIdx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center shrink-0">
                          {qIdx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                          {q.question}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAnswerReveal(qIdx)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
                      >
                        {isRevealed ? 'Hide Answer' : 'Show Answer'}
                      </button>
                    </div>

                    {/* Interactive Multiple Choice Options if available */}
                    {q.options && q.options.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userChoice === opt;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectOption(qIdx, opt, q.answer)}
                              className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer border ${
                                isSelected
                                  ? isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200'
                                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-300'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && (
                                <span className="font-extrabold text-[10px]">
                                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Reveal Box */}
                    {(isRevealed || isEvaluated) && (
                      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs animate-in fade-in duration-200">
                        <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Correct Answer: {q.answer}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 rounded-b-3xl flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Source: <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">{note.sourceType}</span>
        </div>

        <div className="flex items-center gap-2">
          {onAskTutorAboutNote && (
            <button
              type="button"
              onClick={() => onAskTutorAboutNote(note.topic, note.topicIntroduction)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-400 cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>Discuss with AI Tutor</span>
            </button>
          )}

          {onLaunchPracticeQuiz && (
            <button
              type="button"
              onClick={() => onLaunchPracticeQuiz(note.topic, note.selfCheckQuestions)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Practice Questions</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
