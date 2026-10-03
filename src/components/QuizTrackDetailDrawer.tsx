import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Sparkles,
  BookOpen,
  Layers,
  BrainCircuit,
  Printer,
  Volume2,
  VolumeX,
  Clock,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  Share2,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { QuizResponse, PersonaType, TrackKeyTakeaways } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { classifyAudience, AUDIENCE_TIER_CONFIG } from '../utils/audienceClassifier';
import { MascotAvatar } from './MascotAvatar';
import { TopCreatorBadge } from './TopCreatorBadge';

export interface SelectedTrackInfo {
  id: string;
  title: string;
  description: string;
  category?: string;
  pedagogical_topic?: string;
  pedagogical_subtopic?: string;
  inputText?: string;
  mediaUrl?: string;
  quiz: QuizResponse;
  creatorName?: string;
  creatorAvatar?: string;
  isTopCreator?: boolean;
  creatorLevel?: number;
  creatorAssessmentsCount?: number;
}

interface QuizTrackDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  track: SelectedTrackInfo | null;
  persona: PersonaType;
  onStartQuiz: (quiz: QuizResponse) => void;
  onOpenFlashcards?: (quiz: QuizResponse) => void;
  onOpenWorksheet?: (quiz: QuizResponse) => void;
}

const takeawaysCache = new Map<string, TrackKeyTakeaways>();

function generateLocalTakeaways(track: SelectedTrackInfo): TrackKeyTakeaways {
  const rawMaterial = (track.inputText || track.quiz?.summary || track.description || '').trim();
  const cleanLines = rawMaterial
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && !l.startsWith('http'));

  const bullets: string[] = [];
  if (cleanLines.length > 0) {
    cleanLines.slice(0, 4).forEach((line) => {
      const cleaned = line.replace(/^At \[\d\d:\d\d\],?\s*/i, '').replace(/^[•\-\*]\s*/, '');
      if (cleaned.length > 15) {
        bullets.push(cleaned);
      }
    });
  }

  if (bullets.length < 3 && track.quiz?.questions && track.quiz.questions.length > 0) {
    track.quiz.questions.slice(0, 4).forEach((q) => {
      if (q.explanation) {
        bullets.push(`${q.correct_answer}: ${q.explanation.slice(0, 140)}`);
      }
    });
  }

  if (bullets.length === 0) {
    bullets.push(
      `Foundational mechanics and principles governing ${track.title}.`,
      'Key definitions, core relationships, and cause-and-effect dynamics.',
      'Practical applications and standard problem-solving rules.'
    );
  }

  const coreConcepts = (track.quiz?.questions || []).slice(0, 3).map((q) => ({
    term: q.correct_answer.slice(0, 35),
    explanation: q.explanation
      ? q.explanation.slice(0, 150)
      : `Core principle tested in this track.`,
  }));

  return {
    executiveSummary: rawMaterial
      ? `${rawMaterial.slice(0, 240)}... Reviewing these foundational principles before the quiz will sharpen your recall and applied reasoning.`
      : `This curriculum track evaluates core conceptual mastery of "${track.title}". Use these key takeaways to prime your memory before taking the assessment.`,
    keyTakeaways: bullets.slice(0, 4),
    coreConcepts: coreConcepts.length > 0 ? coreConcepts : [
      { term: 'Foundations', explanation: `Core terminology and governing laws of ${track.title}.` },
      { term: 'Applied Logic', explanation: 'How theoretical rules apply to solve practical scenarios.' },
    ],
    prepTip: 'Focus on the exact relationships between cause and effect. Pay special attention to precise terminology when eliminating distractor options.',
    sourceSnippet: rawMaterial ? rawMaterial.slice(0, 300) : undefined,
    estimatedReadMinutes: 2,
  };
}

export const QuizTrackDetailDrawer: React.FC<QuizTrackDetailDrawerProps> = ({
  isOpen,
  onClose,
  track,
  persona,
  onStartQuiz,
  onOpenFlashcards,
  onOpenWorksheet,
}) => {
  const [takeaways, setTakeaways] = useState<TrackKeyTakeaways | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showSourceSnippet, setShowSourceSnippet] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        speechEngine.stop();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !track) {
      setTakeaways(null);
      setIsSpeaking(false);
      speechEngine.stop();
      return;
    }

    const cacheKey = `${track.id}_${track.title}_${persona}`;
    if (track.quiz?.key_takeaways) {
      setTakeaways(track.quiz.key_takeaways);
      setLoading(false);
      return;
    }
    if (takeawaysCache.has(cacheKey)) {
      setTakeaways(takeawaysCache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    async function fetchTakeaways() {
      try {
        const response = await fetch('/api/track-takeaways', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackTitle: track?.title,
            sourceMaterial: track?.inputText,
            summary: track?.quiz?.summary || track?.description,
            questions: track?.quiz?.questions?.map((q) => ({
              question: q.question,
              correct_answer: q.correct_answer,
              explanation: q.explanation,
            })),
            persona,
            targetAudience: track?.quiz?.target_audience,
          }),
        });

        const data = await response.json();
        if (isMounted && data.success && data.takeaways) {
          setTakeaways(data.takeaways);
          takeawaysCache.set(cacheKey, data.takeaways);
        } else if (isMounted) {
          const fallback = generateLocalTakeaways(track!);
          setTakeaways(fallback);
          takeawaysCache.set(cacheKey, fallback);
        }
      } catch (err) {
        console.warn('Failed to load track takeaways, using local synthesizer:', err);
        if (isMounted) {
          const fallback = generateLocalTakeaways(track!);
          setTakeaways(fallback);
          takeawaysCache.set(cacheKey, fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTakeaways();

    return () => {
      isMounted = false;
      speechEngine.stop();
    };
  }, [isOpen, track?.id, track?.title, persona]);

  if (!isOpen || !track) return null;

  const quizData = track.quiz;
  const tier = classifyAudience(quizData);
  const tierCfg = AUDIENCE_TIER_CONFIG[tier];

  const handleToggleSpeak = () => {
    soundFx.playClick();
    if (isSpeaking) {
      speechEngine.stop();
      setIsSpeaking(false);
      return;
    }

    if (!takeaways) return;

    setIsSpeaking(true);
    const textToSpeak = `Key Takeaways for ${track.title}. ${takeaways.executiveSummary}. Core points: ${takeaways.keyTakeaways.join('. ')}. Preparation tip: ${takeaways.prepTip}`;

    speechEngine.speak(textToSpeak, {
      id: `takeaways_${track.id}`,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStart = () => {
    soundFx.playClick();
    speechEngine.stop();
    onClose();
    onStartQuiz(quizData);
  };

  const handleFlashcards = () => {
    soundFx.playClick();
    speechEngine.stop();
    onClose();
    if (onOpenFlashcards) {
      onOpenFlashcards(quizData);
    }
  };

  const handleCopyTakeaways = () => {
    if (!takeaways) return;
    soundFx.playClick();
    const formatted = `📚 Key Takeaways: ${track.title}
${takeaways.executiveSummary}

Key Points:
${takeaways.keyTakeaways.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Core Terms:
${takeaways.coreConcepts.map((c) => `• ${c.term}: ${c.explanation}`).join('\n')}

💡 Pre-Quiz Tip: ${takeaways.prepTip}`;

    navigator.clipboard.writeText(formatted).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundFx.playClick();
          speechEngine.stop();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 transition-colors">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-900/80 gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>QuizTrack Overview</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${tierCfg.badgeBg} ${tierCfg.badgeBorder} ${tierCfg.badgeText}`}
              >
                <span>{tierCfg.emoji}</span>
                <span>{tierCfg.shortLabel}</span>
              </span>

              {track.pedagogical_topic && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {track.pedagogical_topic}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {track.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {track.description}
            </p>

            {track.creatorName && (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  By <strong className="text-slate-900 dark:text-white">{track.creatorName}</strong>
                </span>
                {track.isTopCreator && (
                  <TopCreatorBadge
                    level={track.creatorLevel}
                    assessmentsCount={track.creatorAssessmentsCount}
                    size="xs"
                    showDetails={true}
                  />
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              speechEngine.stop();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Questions
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {quizData.questions.length} Items
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Difficulty
              </span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {quizData.difficulty || 'Intermediate'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Review Time
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                ~{takeaways?.estimatedReadMinutes || 2} Min
              </span>
            </div>
          </div>

          {/* KEY TAKEAWAYS SUMMARY SECTION */}
          <div className="rounded-3xl p-5 sm:p-6 border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-2xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Key Takeaways & Source Summary</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      AI Generated
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review foundational source material before starting the quiz
                  </p>
                </div>
              </div>

              {/* Action Buttons: Audio Listen & Copy */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {takeaways && (
                  <button
                    type="button"
                    onClick={handleCopyTakeaways}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                    title="Copy Key Takeaways to clipboard"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}

                {takeaways && (
                  <button
                    type="button"
                    onClick={handleToggleSpeak}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSpeaking
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                    title={isSpeaking ? 'Stop audio' : 'Listen to Key Takeaways'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center space-y-3">
                <div className="inline-flex p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  Synthesizing Source Material & High-Yield Takeaways...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Distilling key rules, definitions, and facts to help you prepare before playing.
                </p>
              </div>
            ) : takeaways ? (
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Executive Summary */}
                <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Source Material Executive Overview
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {takeaways.executiveSummary}
                  </p>
                </div>

                {/* Core Takeaways Bullets */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Core Concepts to Remember:
                  </span>
                  <div className="space-y-2">
                    {takeaways.keyTakeaways.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Terminology & Concepts */}
                {takeaways.coreConcepts && takeaways.coreConcepts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Target Terminology & Mechanics:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {takeaways.coreConcepts.map((concept, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1"
                        >
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
                            {concept.term}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            {concept.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preparation Tip */}
                {takeaways.prepTip && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        Pro Pre-Quiz Tip:
                      </span>
                      <p className="leading-relaxed font-medium">{takeaways.prepTip}</p>
                    </div>
                  </div>
                )}

                {/* Source Snippet Collapsible */}
                {takeaways.sourceSnippet && (
                  <div className="border-t border-slate-200/80 dark:border-slate-700/80 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowSourceSnippet(!showSourceSnippet)}
                      className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showSourceSnippet ? 'Hide Source Material' : 'View Source Material / Syllabus'}</span>
                      {showSourceSnippet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showSourceSnippet && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
                        {takeaways.sourceSnippet}
                      </div>
                    )}
                  </div>
                )}

                {/* Media URL Reference */}
                {track.mediaUrl && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Origin Source Media:</span>
                    <a
                      href={track.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Watch Source Video / Media</span>
                    </a>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Questions Sample Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assessment Questions ({quizData.questions.length})
              </h4>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                Bloom Taxonomy Aligned
              </span>
            </div>

            <div className="space-y-2">
              {quizData.questions.slice(0, 3).map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Q{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {q.domain || 'Core Principle'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    {q.question}
                  </p>
                </div>
              ))}
              {quizData.questions.length > 3 && (
                <p className="text-center text-xs text-slate-400 font-bold py-1">
                  +{quizData.questions.length - 3} more questions in this track
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleFlashcards}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
              <span>Study Flashcards</span>
            </button>

            {onOpenWorksheet && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenWorksheet(quizData);
                }}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
                title="Print Exam Worksheet"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Quiz Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
