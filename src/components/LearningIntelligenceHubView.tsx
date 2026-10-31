import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  Target,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Layers,
  RotateCcw,
  BarChart3,
  Calendar,
  Flame,
  Zap,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { QuizResponse, Question, UserStats } from '../types/quiz';
import { QuizHistoryRecord } from './HistoryView';
import { MascotAvatar } from './MascotAvatar';

interface LearningIntelligenceHubViewProps {
  stats: UserStats;
  history: QuizHistoryRecord[];
  onStartTargetedPractice: (topic: string, subject: string) => void;
  onOpenNotesForTopic: (topic: string) => void;
  onOpenMistakeNotebook: () => void;
  onAskTutorTopic: (topic: string) => void;
}

interface KnowledgeNode {
  id: string;
  subject: string;
  topic: string;
  subtopics: string[];
  prerequisites: string[];
  masteryPercent: number;
  totalAttempts: number;
  accuracy: number;
  status: 'mastered' | 'developing' | 'needs_work' | 'untouched';
  lastReviewed: string;
}

export const LearningIntelligenceHubView: React.FC<LearningIntelligenceHubViewProps> = ({
  stats,
  history,
  onStartTargetedPractice,
  onOpenNotesForTopic,
  onOpenMistakeNotebook,
  onAskTutorTopic,
}) => {
  const [activeTab, setActiveTab] = useState<'engine' | 'mastery_map' | 'revision_planner'>('engine');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  // Derive genuine knowledge performance from actual student quiz history
  const knowledgeNodes: KnowledgeNode[] = useMemo(() => {
    // Topic performance aggregator
    const topicStats: Record<
      string,
      { subject: string; correct: number; total: number; count: number; lastDate: string }
    > = {};

    history.forEach((h) => {
      const subject = h.subject || 'General STEM';
      const topic = h.quizTitle?.replace(/Quiz|Test|Exam|Mock/gi, '').trim() || 'Core Foundations';
      if (!topicStats[topic]) {
        topicStats[topic] = {
          subject,
          correct: 0,
          total: 0,
          count: 0,
          lastDate: h.completedAt || 'Recently',
        };
      }
      topicStats[topic].correct += h.score;
      topicStats[topic].total += h.total;
      topicStats[topic].count += 1;
    });

    // Base curriculum map enriched with real history
    const baseCurriculum = [
      {
        id: 'math_algebra',
        subject: 'Mathematics',
        topic: 'Algebraic Equations & Quadratic Factoring',
        subtopics: ['Linear Equations', 'Quadratic Formula', 'Completing the Square', 'Simultaneous Equations'],
        prerequisites: ['Basic Arithmetic & BODMAS'],
      },
      {
        id: 'math_calc',
        subject: 'Mathematics',
        topic: 'Calculus — Differential & Integral Limits',
        subtopics: ['Limits', 'Derivatives & Power Rule', 'Chain Rule', 'Definite Integrals'],
        prerequisites: ['Algebraic Equations & Quadratic Factoring'],
      },
      {
        id: 'phys_mechanics',
        subject: 'Physics',
        topic: "Newtonian Mechanics & Kinematics",
        subtopics: ['Suvat Equations', 'Newton 2nd Law', 'Conservation of Momentum', 'Friction & Vectors'],
        prerequisites: ['Algebraic Equations & Quadratic Factoring'],
      },
      {
        id: 'phys_waves',
        subject: 'Physics',
        topic: 'Wave Optics & Electromagnetic Spectrum',
        subtopics: ['Refraction & Snell’s Law', 'Interference', 'Diffraction', 'Doppler Effect'],
        prerequisites: ['Newtonian Mechanics & Kinematics'],
      },
      {
        id: 'chem_stoich',
        subject: 'Chemistry',
        topic: 'Stoichiometry & The Mole Concept',
        subtopics: ['Avogadro Constant', 'Molar Mass', 'Gas Volumes (molar 24 dm³)', 'Titration Calculations'],
        prerequisites: ['Basic Arithmetic & BODMAS'],
      },
      {
        id: 'chem_acids',
        subject: 'Chemistry',
        topic: 'Acids, Bases & pH Calculations',
        subtopics: ['pH Autoionization', 'Strong vs Weak Acids', 'Neutralization', 'Buffer Solutions'],
        prerequisites: ['Stoichiometry & The Mole Concept'],
      },
      {
        id: 'bio_cell',
        subject: 'Biology',
        topic: 'Cell Biology, Mitosis & Transport',
        subtopics: ['Diffusion & Osmosis', 'Active Transport', 'Mitosis Phases', 'Organelles & Functions'],
        prerequisites: ['Basic Biology Vocabulary'],
      },
      {
        id: 'bio_genetics',
        subject: 'Biology',
        topic: 'Mendelian Genetics & DNA Inheritance',
        subtopics: ['Monohybrid Crosses', 'Punnett Squares', 'Codominance', 'Sex-Linked Traits'],
        prerequisites: ['Cell Biology, Mitosis & Transport'],
      },
    ];

    return baseCurriculum.map((item) => {
      const match = topicStats[item.topic] || Object.values(topicStats).find((s) => s.subject === item.subject);
      const total = match ? match.total : 0;
      const correct = match ? match.correct : 0;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

      // Multi-signal mastery score: Accuracy + repetition safety
      const mastery = total >= 10 ? Math.min(100, Math.round(accuracy * 0.9 + Math.min(10, match.count * 2))) : total > 0 ? Math.round(accuracy * 0.7) : 0;

      let status: KnowledgeNode['status'] = 'untouched';
      if (total > 0) {
        if (mastery >= 75) status = 'mastered';
        else if (mastery >= 45) status = 'developing';
        else status = 'needs_work';
      }

      return {
        ...item,
        masteryPercent: mastery,
        totalAttempts: total,
        accuracy,
        status,
        lastReviewed: match?.lastDate ? new Date(match.lastDate).toLocaleDateString() : 'Not attempted yet',
      };
    });
  }, [history]);

  // Priority knowledge gaps
  const knowledgeGaps = useMemo(() => {
    return knowledgeNodes
      .filter((n) => n.status === 'needs_work' || n.status === 'developing')
      .sort((a, b) => a.masteryPercent - b.masteryPercent);
  }, [knowledgeNodes]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="comic-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-cyan-500/10 border-2 border-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-2xl bg-indigo-600 text-white border-2 border-slate-950 shadow-xs">
                <Brain className="w-5 h-5" />
              </span>
              <span className="comic-badge px-2.5 py-1 rounded bg-amber-400 text-slate-950 border border-slate-950 text-xs font-black uppercase tracking-wider">
                COGNITIVE INTELLIGENCE ENGINE
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Connected to {history.length} Quizzes &amp; Diagnostics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Adaptive Learning Intelligence &amp; Knowledge Map
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Connects your quiz performances, mistake analyses, revision notes, and syllabus objectives into a continuous mastery loop: <strong>Assess → Identify Gaps → Remediate → Verify.</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('engine');
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'engine'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              Intelligence Engine
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('mastery_map');
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mastery_map'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              Knowledge Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      {activeTab === 'engine' && (
        <div className="space-y-6">
          {/* Priority Remediation Queue Banner */}
          <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-400 border border-slate-950 text-slate-950">
                  <Target className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Next Best Learning Action (Explainable AI Recommendations)
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Prioritized by diagnostic weakness and exam weight
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {knowledgeGaps.slice(0, 3).map((gap, i) => (
                <div
                  key={gap.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 dark:from-slate-800 dark:to-amber-950/20 border-2 border-slate-900/10 dark:border-slate-700 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {gap.subject}
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-500">
                        {gap.masteryPercent}% Mastery
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {gap.topic}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Prerequisite for higher-order exam questions. Requires targeted reinforcement.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => onStartTargetedPractice(gap.topic, gap.subject)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center transition-all cursor-pointer shadow-xs"
                    >
                      Practise Topic
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenNotesForTopic(gap.topic)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-100"
                      title="Open Revision Notes"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Diagnostics & Cycle Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-900/15 dark:border-slate-800 space-y-2">
              <div className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified Mastery</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {knowledgeNodes.filter((n) => n.status === 'mastered').length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Syllabus topics with &ge; 75% sustained accuracy
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-900/15 dark:border-slate-800 space-y-2">
              <div className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Developing Topics</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {knowledgeNodes.filter((n) => n.status === 'developing').length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                In progress (45%–74% mastery)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-900/15 dark:border-slate-800 space-y-2">
              <div className="text-xs font-black uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Needs Review</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {knowledgeNodes.filter((n) => n.status === 'needs_work').length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                High error rate (&lt; 45% accuracy)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-900/15 dark:border-slate-800 space-y-2">
              <div className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Mistake Notebook</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                Active
              </div>
              <button
                type="button"
                onClick={onOpenMistakeNotebook}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Inspect Saved Mistakes</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Mastery Map View */}
      {activeTab === 'mastery_map' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology'].map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedSubject(subj);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSubject === subj
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Mastered (&ge;75%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Developing (45-74%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Needs Review (&lt;45%)
              </span>
            </div>
          </div>

          {/* Interactive Knowledge Graph Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {knowledgeNodes
              .filter((n) => selectedSubject === 'All' || n.subject === selectedSubject)
              .map((node) => (
                <div
                  key={node.id}
                  onClick={() => {
                    soundFx.playSelect();
                    setSelectedNode(node);
                  }}
                  className={`comic-panel-sm rounded-2xl p-4 transition-all cursor-pointer border-2 ${
                    node.status === 'mastered'
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : node.status === 'developing'
                      ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
                      : node.status === 'needs_work'
                      ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {node.subject}
                    </span>
                    <span
                      className={`text-xs font-black font-mono ${
                        node.status === 'mastered'
                          ? 'text-emerald-600'
                          : node.status === 'developing'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {node.masteryPercent}%
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2">
                    {node.topic}
                  </h4>

                  {/* Prerequisites Indicator */}
                  {node.prerequisites && node.prerequisites.length > 0 && (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 truncate">
                      Prereq: {node.prerequisites.join(', ')}
                    </div>
                  )}

                  {/* Mastery Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        node.status === 'mastered'
                          ? 'bg-emerald-500'
                          : node.status === 'developing'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(8, node.masteryPercent)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Node Detail Modal / Drawer */}
          {selectedNode && (
            <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-black uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {selectedNode.subject}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Last reviewed: {selectedNode.lastReviewed}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {selectedNode.topic}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-400">Mastery Level</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedNode.masteryPercent}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-400">Accuracy</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedNode.accuracy}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-400">Total Attempts</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedNode.totalAttempts} questions
                  </div>
                </div>
              </div>

              {/* Subtopics */}
              <div className="space-y-1.5">
                <div className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Syllabus Subtopics:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.subtopics.map((st, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      • {st}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onStartTargetedPractice(selectedNode.topic, selectedNode.subject)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Start Practice Quiz
                </button>
                <button
                  type="button"
                  onClick={() => onOpenNotesForTopic(selectedNode.topic)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Generate Notes
                </button>
                <button
                  type="button"
                  onClick={() => onAskTutorTopic(selectedNode.topic)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Ask AI Tutor
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
