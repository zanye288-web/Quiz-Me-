import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  BookMarked,
  Award,
} from 'lucide-react';
import { OFFICIAL_SYLLABUS_REGISTRY } from '../data/syllabuses';
import { SyllabusDocument, SyllabusTopic, SyllabusSubtopic, ExamBoard } from '../types/examinerIntelligence';
import { soundFx } from '../utils/audio';

interface SyllabusTrackerViewProps {
  onStartQuizOnTopic?: (subject: string, topic: string) => void;
  onOpenNotesOnTopic?: (subject: string, topic: string) => void;
  onOpenFlashcardsOnTopic?: (subject: string, topic: string) => void;
}

const STORAGE_KEY = 'quizme_syllabus_progress_v1';

export const SyllabusTrackerView: React.FC<SyllabusTrackerViewProps> = ({
  onStartQuizOnTopic,
  onOpenNotesOnTopic,
  onOpenFlashcardsOnTopic,
}) => {
  const [selectedBoard, setSelectedBoard] = useState<string>('ALL');
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>(OFFICIAL_SYLLABUS_REGISTRY[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    [OFFICIAL_SYLLABUS_REGISTRY[0].topics[0]?.id || '']: true,
  });

  // Track completed subtopic IDs and mastered subtopic IDs in localStorage
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(parsed.completed || []);
      }
    } catch (e) {
      console.warn('Failed to load syllabus progress', e);
    }
    return new Set(['waec-m-1-1']); // default sample completion
  });

  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(parsed.mastered || []);
      }
    } catch (e) {
      console.warn('Failed to load syllabus progress', e);
    }
    return new Set(['waec-m-1-1']);
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          completed: Array.from(completedIds),
          mastered: Array.from(masteredIds),
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Failed to save syllabus progress', e);
    }
  }, [completedIds, masteredIds]);

  const activeSyllabus =
    OFFICIAL_SYLLABUS_REGISTRY.find((s) => s.id === selectedSyllabusId) || OFFICIAL_SYLLABUS_REGISTRY[0];

  const availableBoards = Array.from(new Set(OFFICIAL_SYLLABUS_REGISTRY.map((s) => s.board)));

  const filteredSyllabi = OFFICIAL_SYLLABUS_REGISTRY.filter((s) => {
    if (selectedBoard !== 'ALL' && s.board !== selectedBoard) return false;
    return true;
  });

  const toggleTopicExpand = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
    soundFx.playClick();
  };

  const toggleSubtopicCompleted = (subtopicId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(subtopicId)) {
        next.delete(subtopicId);
      } else {
        next.add(subtopicId);
        soundFx.playCorrect();
      }
      return next;
    });
  };

  const toggleSubtopicMastered = (subtopicId: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(subtopicId)) {
        next.delete(subtopicId);
      } else {
        next.add(subtopicId);
        soundFx.playComplete();
      }
      return next;
    });
  };

  // Calculate coverage stats
  const allSubtopics = activeSyllabus.topics.flatMap((t) => t.subtopics);
  const totalSubtopicsCount = allSubtopics.length;
  const completedCount = allSubtopics.filter((s) => completedIds.has(s.id)).length;
  const masteredCount = allSubtopics.filter((s) => masteredIds.has(s.id)).length;
  const coveragePercentage = totalSubtopicsCount > 0 ? Math.round((completedCount / totalSubtopicsCount) * 100) : 0;
  const masteryPercentage = totalSubtopicsCount > 0 ? Math.round((masteredCount / totalSubtopicsCount) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <BookMarked className="w-4 h-4" />
              <span>Official Examination Curriculum</span>
              <span aria-hidden="true">·</span>
              <span>Verified Scheme</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Syllabus Tracker
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Track your exact examination syllabus progress topic by topic. Connect curriculum learning objectives
              directly to AI Tutor lessons, practice quizzes, and mistake retention.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{coveragePercentage}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Syllabus Covered</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{masteryPercentage}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Assessed Mastery</div>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {totalSubtopicsCount - completedCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Topics Left</div>
            </div>
          </div>
        </div>

        {/* Board & Syllabus Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Examination Board:
            </span>
            <button
              onClick={() => setSelectedBoard('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedBoard === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Boards
            </button>
            {availableBoards.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBoard(b)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedBoard === b
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {b.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Syllabus Select Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="syllabus-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Subject Specification:
            </label>
            <select
              id="syllabus-select"
              value={selectedSyllabusId}
              onChange={(e) => {
                setSelectedSyllabusId(e.target.value);
                soundFx.playClick();
              }}
              className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {filteredSyllabi.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.board.replace('_', ' ')}: {s.subject} ({s.qualification})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Syllabus Header Details & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{activeSyllabus.board.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span>{activeSyllabus.qualification}</span>
              <span aria-hidden="true">·</span>
              <span>Effective {activeSyllabus.effectiveYear}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeSyllabus.subject}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Source: <span className="italic">{activeSyllabus.sourceReference}</span> (Verified {activeSyllabus.lastVerifiedDate})
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics & objectives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Overall Progress</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {completedCount} of {totalSubtopicsCount} topics studied ({coveragePercentage}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${masteryPercentage}%` }}
              title={`Mastered: ${masteryPercentage}%`}
            />
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${Math.max(0, coveragePercentage - masteryPercentage)}%` }}
              title={`Studied: ${coveragePercentage - masteryPercentage}%`}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Mastered ({masteredCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              Completed ({completedCount - masteredCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 inline-block" />
              Unstudied ({totalSubtopicsCount - completedCount})
            </span>
          </div>
        </div>
      </div>

      {/* Syllabus Topics Accordion List */}
      <div className="space-y-4">
        {activeSyllabus.topics.map((topic) => {
          const isExpanded = Boolean(expandedTopics[topic.id]);
          const topicSubtopics = topic.subtopics;
          const topicCompleted = topicSubtopics.filter((s) => completedIds.has(s.id)).length;
          const topicMastered = topicSubtopics.filter((s) => masteredIds.has(s.id)).length;
          const topicPercent = topicSubtopics.length > 0 ? Math.round((topicCompleted / topicSubtopics.length) * 100) : 0;

          // Filter subtopics if search query is provided
          const displayedSubtopics = searchQuery.trim()
            ? topicSubtopics.filter(
                (st) =>
                  st.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  st.learningObjectives.some((obj) => obj.toLowerCase().includes(searchQuery.toLowerCase()))
              )
            : topicSubtopics;

          if (searchQuery.trim() && displayedSubtopics.length === 0) return null;

          return (
            <div
              key={topic.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              {/* Topic Header */}
              <button
                onClick={() => toggleTopicExpand(topic.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-indigo-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>Exam Weight: {topic.weightPercentage}%</span>
                      <span aria-hidden="true">·</span>
                      <span>{topic.subtopics.length} subtopics</span>
                      {topic.recommendedHours && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{topic.recommendedHours} hrs recommended</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {topicCompleted}/{topicSubtopics.length} Done
                    </div>
                    <div className="text-[11px] text-slate-500">{topicPercent}% Progress</div>
                  </div>
                  <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                    <svg className="w-10 h-10 transform -rotate-90">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-800"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={100}
                        strokeDashoffset={100 - topicPercent}
                        className="text-indigo-600 dark:text-indigo-400 transition-all duration-300"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {topicPercent}%
                    </span>
                  </div>
                </div>
              </button>

              {/* Subtopics Content */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  {displayedSubtopics.map((st) => {
                    const isCompleted = completedIds.has(st.id);
                    const isMastered = masteredIds.has(st.id);

                    return (
                      <div
                        key={st.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isMastered
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                            : isCompleted
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40'
                            : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="space-y-2.5 max-w-3xl">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleSubtopicCompleted(st.id)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-600" />
                                )}
                                <span>{st.title}</span>
                              </button>

                              {isMastered && (
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                  · Mastered
                                </span>
                              )}
                            </div>

                            {/* Learning Objectives */}
                            <div className="space-y-1 pl-6">
                              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Syllabus Learning Objectives:
                              </div>
                              <ul className="list-disc list-outside ml-3.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                {st.learningObjectives.map((obj, i) => (
                                  <li key={i}>{obj}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Prerequisites & Definitions */}
                            {st.prerequisites && st.prerequisites.length > 0 && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 pl-6 flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">Prerequisites:</span>
                                {st.prerequisites.map((p, idx) => (
                                  <span key={idx} className="bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded text-[11px]">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}

                            {st.keyDefinitions && st.keyDefinitions.length > 0 && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 pl-6 space-y-0.5">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">Examiner Definitions:</span>
                                <div className="space-y-0.5 italic text-slate-600 dark:text-slate-400">
                                  {st.keyDefinitions.map((d, idx) => (
                                    <div key={idx}>• {d}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons for this Subtopic */}
                          <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0 pt-2 lg:pt-0">
                            <button
                              onClick={() => toggleSubtopicMastered(st.id)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                                isMastered
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                              }`}
                            >
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
                            </button>

                            {onStartQuizOnTopic && (
                              <button
                                onClick={() => {
                                  soundFx.playClick();
                                  onStartQuizOnTopic(activeSyllabus.subject, st.title);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Practice Topic Quiz</span>
                              </button>
                            )}

                            {onOpenNotesOnTopic && (
                              <button
                                onClick={() => {
                                  soundFx.playClick();
                                  onOpenNotesOnTopic(activeSyllabus.subject, st.title);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Read Study Notes</span>
                              </button>
                            )}

                            {onOpenFlashcardsOnTopic && (
                              <button
                                onClick={() => {
                                  soundFx.playClick();
                                  onOpenFlashcardsOnTopic(activeSyllabus.subject, st.title);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Topic Flashcards</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
