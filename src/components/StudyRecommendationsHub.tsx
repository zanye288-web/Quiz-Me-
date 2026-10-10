import React, { useState, useEffect } from 'react';
import {
  Video,
  Globe,
  FileText,
  Sparkles,
  Bot,
  ExternalLink,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  Layers,
  ChevronRight,
  BookmarkCheck,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import {
  QuizResponse,
  PersonaType,
  StudyRecommendationsData,
  RecommendedVideo,
  RecommendedWebsite,
  RecommendedDocument,
} from '../types/quiz';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { MascotAvatar } from './MascotAvatar';
import { InteractiveTutorLounge } from './InteractiveTutorLounge';

interface StudyRecommendationsHubProps {
  quiz: QuizResponse;
  persona: PersonaType;
  results: {
    score: number;
    total: number;
    answers: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  };
  onRestartQuiz?: () => void;
  onNavigateToQuestion?: (questionId: number) => void;
}

export const StudyRecommendationsHub: React.FC<StudyRecommendationsHubProps> = ({
  quiz,
  persona,
  results,
  onRestartQuiz,
  onNavigateToQuestion,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<StudyRecommendationsData | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'website' | 'document' | 'failed' | 'passed'>('all');
  const [activeView, setActiveView] = useState<'resources' | 'tutor'>('resources');
  const [selectedQuestionForTutor, setSelectedQuestionForTutor] = useState<number | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<RecommendedVideo | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [speakingDocId, setSpeakingDocId] = useState<string | null>(null);

  const accuracy = Math.round((results.score / results.total) * 100);

  // Group passed and failed questions with text
  const passedQuestions = quiz.questions
    .filter((q) => {
      const a = results.answers.find((ans) => ans.questionId === q.id);
      return a?.isCorrect ?? false;
    })
    .map((q) => {
      const a = results.answers.find((ans) => ans.questionId === q.id);
      return {
        id: q.id,
        questionText: q.question,
        domain: q.domain,
        userAnswer: a?.userAnswer || '',
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      };
    });

  const failedQuestions = quiz.questions
    .filter((q) => {
      const a = results.answers.find((ans) => ans.questionId === q.id);
      return a ? !a.isCorrect : true;
    })
    .map((q) => {
      const a = results.answers.find((ans) => ans.questionId === q.id);
      return {
        id: q.id,
        questionText: q.question,
        domain: q.domain,
        userAnswer: a?.userAnswer || '(unanswered)',
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      };
    });

  useEffect(() => {
    let isMounted = true;

    async function fetchRecommendations() {
      setLoading(true);
      try {
        const response = await fetch('/api/study-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizTitle: quiz.quiz_title,
            targetAudience: quiz.target_audience,
            persona,
            score: results.score,
            total: results.total,
            accuracy,
            passedQuestions,
            failedQuestions,
          }),
        });

        const data = await response.json();
        if (isMounted && data.success && data.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        console.warn('Failed to load study recommendations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecommendations();

    return () => {
      isMounted = false;
      speechEngine.stop();
    };
  }, [quiz.quiz_title, results.score, results.total]);

  const handleLaunchTutorForQuestion = (questionId: number) => {
    soundFx.playSelect();
    setSelectedQuestionForTutor(questionId);
    setActiveView('tutor');
  };

  const handleLaunchTutorGeneral = (initialPrompt?: string) => {
    soundFx.playSelect();
    setSelectedQuestionForTutor(failedQuestions[0]?.id ?? null);
    setActiveView('tutor');
  };

  const handleCopyDoc = (doc: RecommendedDocument) => {
    soundFx.playClick();
    const content = `${doc.title}\n\nSummary:\n${doc.summary}\n\nKey Takeaways:\n${doc.keyTakeaways.map((t) => `• ${t}`).join('\n')}`;
    navigator.clipboard.writeText(content);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2000);
  };

  const handleSpeakDoc = (doc: RecommendedDocument) => {
    soundFx.playClick();
    if (speakingDocId === doc.id) {
      speechEngine.stop();
      setSpeakingDocId(null);
      return;
    }

    setSpeakingDocId(doc.id);
    const speech = `${doc.title}. Summary: ${doc.summary}. Key points: ${doc.keyTakeaways.join('. ')}`;
    speechEngine.speak(speech, {
      id: `doc_${doc.id}`,
      onEnd: () => setSpeakingDocId(null),
      onError: () => setSpeakingDocId(null),
    });
  };

  const filteredVideos = (recommendations?.videos || []).filter((v) => {
    if (filterType === 'video' || filterType === 'all') return true;
    if (filterType === 'failed') return v.targetType === 'failed';
    if (filterType === 'passed') return v.targetType === 'passed';
    return false;
  });

  const filteredWebsites = (recommendations?.websites || []).filter((w) => {
    if (filterType === 'website' || filterType === 'all') return true;
    if (filterType === 'failed') return w.targetType === 'failed';
    if (filterType === 'passed') return w.targetType === 'passed';
    return false;
  });

  const filteredDocuments = (recommendations?.documents || []).filter((d) => {
    if (filterType === 'document' || filterType === 'all') return true;
    if (filterType === 'failed') return d.targetType === 'failed';
    if (filterType === 'passed') return d.targetType === 'passed';
    return false;
  });

  const totalFilteredCount = filteredVideos.length + filteredWebsites.length + filteredDocuments.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Diagnostic Performance & Mode Selector */}
      <div className="comic-panel pattern-halftone rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <MascotAvatar
              mood={accuracy >= 80 ? 'happy' : accuracy >= 60 ? 'thinking' : 'comforting'}
              size="md"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="comic-badge px-2 py-0.5 rounded-md bg-amber-300 text-slate-950 border border-slate-950 text-[10px] font-black uppercase tracking-wider">
                  STUDY ENGINE
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Adaptive Study Recommendation Engine</span>
                </span>
                {failedQuestions.length > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>{failedQuestions.length} Concepts to Master</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>100% Perfection: Advanced Horizons</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {recommendations?.tutorPlan?.headline || 'Tailored Sources & Interactive AI Tutor'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {recommendations?.tutorPlan?.diagnosticSummary ||
                  'Based on what you got right and what you missed, here are curated videos, trusted websites, reference documents, or step into a 1-on-1 tutoring session with Quizzie!'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setActiveView('resources');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeView === 'resources'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Videos & Sources</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                handleLaunchTutorGeneral();
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeView === 'tutor'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                  : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>1-on-1 AI Tutor</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                Live
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Recommended Sources & Videos */}
      {activeView === 'resources' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setFilterType('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All Sources
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setFilterType('video');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'video'
                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-red-500" />
                <span>Videos ({recommendations?.videos.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setFilterType('website');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'website'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Websites ({recommendations?.websites.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setFilterType('document');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'document'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Documents & Sheets ({recommendations?.documents.length || 0})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setFilterType(filterType === 'failed' ? 'all' : 'failed');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  filterType === 'failed'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Focus: Failed Items</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setFilterType(filterType === 'passed' ? 'all' : 'passed');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  filterType === 'passed'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Explore: Passed Items</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl p-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 animate-pulse">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Analyzing Quiz Mistakes & Generating Personalized Sources...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Comparing your answers against curriculum standards to recommend targeted videos, websites, and reference documents.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* SECTION 1: VIDEOS */}
              {(filterType === 'all' || filterType === 'video' || filterType === 'failed' || filterType === 'passed') && filteredVideos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                        <Video className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                        Recommended Videos & Visual Explanations
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {filteredVideos.length} videos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredVideos.map((video) => (
                      <div
                        key={video.id}
                        className={`rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900 ${
                          video.targetType === 'failed'
                            ? 'border-amber-200 dark:border-amber-900/50 hover:border-amber-300'
                            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                video.targetType === 'failed'
                                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                              }`}
                            >
                              {video.targetType === 'failed' ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Remediation Focus</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Mastery Extension</span>
                                </>
                              )}
                            </span>

                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{video.durationMinutes} min</span>
                            </div>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {video.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Why watch: </span>
                            {video.reason}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                          <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 truncate">
                            Channel: <span className="text-slate-800 dark:text-slate-200 font-bold">{video.channel}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playSelect();
                                setActiveVideoModal(video);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-extrabold transition-colors cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Preview</span>
                            </button>

                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => soundFx.playClick()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                              <span>YouTube</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: WEBSITES & INTERACTIVE LABS */}
              {(filterType === 'all' || filterType === 'website' || filterType === 'failed' || filterType === 'passed') && filteredWebsites.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                        Websites, Reference Portals & Interactive Simulators
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {filteredWebsites.length} sites
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredWebsites.map((site) => (
                      <div
                        key={site.id}
                        className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-md flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/50">
                              {site.domain}
                            </span>
                            {site.interactive && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                🎮 Interactive Practice
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                            {site.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {site.description}
                          </p>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Target context: </span>
                            {site.reason}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => soundFx.playClick()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            <span>Open Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: DOCUMENTS & CHEATSHEETS */}
              {(filterType === 'all' || filterType === 'document' || filterType === 'failed' || filterType === 'passed') && filteredDocuments.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                        Study Documents, Cheatsheets & Synthesis Guides
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {filteredDocuments.length} documents
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-md flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                              <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                              <span>{doc.docType}</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSpeakDoc(doc)}
                                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                                  speakingDocId === doc.id
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                }`}
                                title="Listen to document summary"
                              >
                                {speakingDocId === doc.id ? (
                                  <VolumeX className="w-3.5 h-3.5" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyDoc(doc)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs transition-colors cursor-pointer"
                                title="Copy study notes"
                              >
                                {copiedDocId === doc.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                            {doc.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {doc.summary}
                          </p>

                          {doc.keyTakeaways && doc.keyTakeaways.length > 0 && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                                Core Takeaways:
                              </span>
                              <ul className="space-y-1">
                                {doc.keyTakeaways.map((point, idx) => (
                                  <li
                                    key={idx}
                                    className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5"
                                  >
                                    <span className="text-emerald-500 font-bold">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 truncate">
                            {doc.reason}
                          </span>

                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => soundFx.playClick()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <span>Read OpenStax</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Callout Footer: Tutor Me */}
              <div className="rounded-3xl p-6 border border-purple-200 dark:border-purple-900/50 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Want 1-on-1 Guidance Instead of Self-Study?
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Step into the AI Tutor Lounge. Quizzie will walk you through your exact mistakes with analogies!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchTutorGeneral()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Start AI Tutor Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 1-on-1 Interactive AI Tutor Lounge */}
      {activeView === 'tutor' && (
        <InteractiveTutorLounge
          quiz={quiz}
          persona={persona}
          passedQuestions={passedQuestions}
          failedQuestions={failedQuestions}
          initialQuestionId={selectedQuestionForTutor}
          tutorPlan={recommendations?.tutorPlan}
          onBackToSources={() => setActiveView('resources')}
        />
      )}

      {/* Video Modal Player / Preview */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  <Video className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {activeVideoModal.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Channel: {activeVideoModal.channel} • {activeVideoModal.durationMinutes} minutes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Why this video is recommended for your score:
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeVideoModal.reason}
                </p>
                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  Topic: {activeVideoModal.topic} • Audience: {quiz.target_audience || 'All Ages'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>

                <a
                  href={activeVideoModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveVideoModal(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-colors shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
