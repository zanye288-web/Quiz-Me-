import React, { useState } from 'react';
import {
  History,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  FileEdit,
  Mic,
  AlertTriangle,
  Flame,
  ArrowRight,
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { LearningTimelineEvent, LearningActivityType, ExamBoard } from '../types/examinerIntelligence';
import { soundFx } from '../utils/audio';

interface LearningTimelineViewProps {
  onNavigateTab?: (tab: string) => void;
}

const SAMPLE_TIMELINE_EVENTS: LearningTimelineEvent[] = [
  {
    id: 'evt_1',
    activityType: 'oral_viva',
    title: 'Cambridge IGCSE Biology Viva Voce Defense',
    subject: 'Biology',
    topic: 'Gas Exchange & Respiratory Adaptations',
    examBoard: 'Cambridge_IGCSE',
    scorePercentage: 88,
    xpEarned: 240,
    badgeAwarded: 'Articulate Scholar (Band 8.0)',
    summary: 'Candidate articulated alveolar surface area adaptations and Fick\'s Law of diffusion with precision.',
    timestamp: '2026-03-31T09:30:00Z',
    deepLinkTab: 'oral_exam',
  },
  {
    id: 'evt_2',
    activityType: 'written_evaluation',
    title: 'WAEC Written Examiner: Plant Osmosis & Plasmolysis',
    subject: 'Biology',
    topic: 'Osmosis & Plant Water Relations',
    examBoard: 'WAEC',
    scorePercentage: 90,
    xpEarned: 180,
    summary: 'Awarded 9/10 marks by Chief Examiner AI. Method and terminology marks fully satisfied.',
    timestamp: '2026-03-30T16:15:00Z',
    deepLinkTab: 'written_examiner',
  },
  {
    id: 'evt_3',
    activityType: 'mistake_resolved',
    title: 'Misconception Cleared: Direction of Frictional Forces',
    subject: 'Physics',
    topic: 'Dynamics & Newton\'s Laws',
    examBoard: 'WAEC',
    scorePercentage: 100,
    xpEarned: 120,
    summary: 'Practiced similar problem in Mistake Notebook and successfully distinguished static vs kinetic friction.',
    timestamp: '2026-03-29T11:45:00Z',
    deepLinkTab: 'mistakes',
  },
  {
    id: 'evt_4',
    activityType: 'milestone_unlocked',
    title: 'Milestone Unlocked: 7-Day Active Study Streak',
    subject: 'General Academic',
    topic: 'Consistency Habit',
    xpEarned: 350,
    badgeAwarded: 'Relentless Scholar VII',
    summary: 'Maintained consecutive daily quiz and past paper practice for 7 days.',
    timestamp: '2026-03-28T18:00:00Z',
    deepLinkTab: 'achievements',
  },
  {
    id: 'evt_5',
    activityType: 'quiz_completed',
    title: 'Digital SAT Heart of Algebra Practice Drill',
    subject: 'Digital SAT Mathematics',
    topic: 'Linear Systems & Inconsistencies',
    examBoard: 'SAT',
    scorePercentage: 85,
    xpEarned: 150,
    summary: 'Completed 10 questions in 11 minutes with 0 careless errors.',
    timestamp: '2026-03-27T14:10:00Z',
    deepLinkTab: 'studio',
  },
  {
    id: 'evt_6',
    activityType: 'syllabus_mastered',
    title: 'Syllabus Topic Mastered: WAEC Number Bases & Modulo',
    subject: 'General Mathematics',
    topic: 'Number and Numeration',
    examBoard: 'WAEC',
    scorePercentage: 95,
    xpEarned: 300,
    badgeAwarded: 'Base Arithmetic Virtuoso',
    summary: 'Achieved >90% verified score across 3 successive assessments covering modular systems.',
    timestamp: '2026-03-26T10:00:00Z',
    deepLinkTab: 'syllabus',
  },
];

export const LearningTimelineView: React.FC<LearningTimelineViewProps> = ({ onNavigateTab }) => {
  const [events, setEvents] = useState<LearningTimelineEvent[]>(SAMPLE_TIMELINE_EVENTS);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  const filteredEvents = events.filter((e) => {
    if (selectedFilter !== 'ALL' && e.activityType !== selectedFilter) return false;
    if (selectedSubject !== 'ALL' && e.subject !== selectedSubject) return false;
    return true;
  });

  const availableSubjects = Array.from(new Set(events.map((e) => e.subject)));

  const getActivityIcon = (type: LearningActivityType) => {
    switch (type) {
      case 'oral_viva':
        return <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'written_evaluation':
        return <FileEdit className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'mistake_resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'milestone_unlocked':
        return <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'syllabus_mastered':
        return <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'quiz_completed':
      default:
        return <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <History className="w-4 h-4" />
              <span>Academic Development Log</span>
              <span aria-hidden="true">·</span>
              <span>Personal Learning Timeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Personal Learning Timeline
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              A comprehensive chronicle of your academic achievements, oral viva defenses, written examiner evaluations,
              cleared misconceptions, and syllabus mastery milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {events.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Logged Milestones</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-500" />
                <span>7</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Activity:</span>
            {[
              { id: 'ALL', label: 'All Activities' },
              { id: 'oral_viva', label: 'Oral Vivas' },
              { id: 'written_evaluation', label: 'Written Exams' },
              { id: 'mistake_resolved', label: 'Mistakes Cleared' },
              { id: 'milestone_unlocked', label: 'Milestones' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFilter(f.id);
                  soundFx.playClick();
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chronological Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filteredEvents.map((evt) => {
          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Pin Icon */}
              <div className="absolute -left-6 sm:-left-8 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                {getActivityIcon(evt.activityType)}
              </div>

              {/* Event Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{evt.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span>{evt.topic}</span>
                    {evt.examBoard && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {evt.examBoard.replace('_', ' ')}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(evt.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {evt.summary}
                  </p>

                  {/* Highlights (Badge, Score, XP) */}
                  <div className="flex flex-wrap items-center justify-between pt-2 gap-3">
                    <div className="flex items-center gap-3 text-xs">
                      {evt.scorePercentage !== undefined && (
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          Score: {evt.scorePercentage}%
                        </span>
                      )}
                      {evt.badgeAwarded && (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          {evt.badgeAwarded}
                        </span>
                      )}
                      {evt.xpEarned && (
                        <span className="font-semibold text-slate-500">
                          +{evt.xpEarned} XP
                        </span>
                      )}
                    </div>

                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          onNavigateTab(evt.deepLinkTab);
                          soundFx.playClick();
                        }}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open Activity</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
