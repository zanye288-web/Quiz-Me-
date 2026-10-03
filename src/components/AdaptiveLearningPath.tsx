import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  Atom,
  Landmark,
  Globe,
  Palette,
  BookOpen,
  Code2,
  TrendingUp,
  Award,
  Zap,
  Star,
  Compass,
  Filter,
  Flame,
  ChevronRight,
  Info,
} from 'lucide-react';
import { QuizResponse, PersonaType, UserStats } from '../types/quiz';
import { QuizHistoryRecord } from './HistoryView';
import { soundFx } from '../utils/audio';

export type SkillDomain = 'STEM' | 'History' | 'Social Sciences' | 'Humanities' | 'General';

export type SkillNodeStatus = 'completed' | 'available' | 'locked';

export interface SkillNode {
  id: string;
  title: string;
  domain: SkillDomain;
  tier: 1 | 2 | 3; // 1 = Foundation, 2 = Core Branch, 3 = Advanced Specialization
  description: string;
  tags: string[];
  prerequisiteIds: string[];
  xpReward: number;
  iconName: string;
}

// Canonical Skill Tree Definitions
export const CANONICAL_SKILL_NODES: SkillNode[] = [
  // --- STEM & TECHNOLOGY DOMAIN ---
  {
    id: 'stem_foundations',
    title: 'Scientific Method & Empirical Logic',
    domain: 'STEM',
    tier: 1,
    description: 'Foundations of hypothesis testing, deductive reasoning, and empirical observation.',
    tags: ['#STEM', '#Science', '#Logic', '#Methodology'],
    prerequisiteIds: [],
    xpReward: 50,
    iconName: 'Atom',
  },
  {
    id: 'astronomy_space',
    title: 'Cosmic Exploration & Solar Systems',
    domain: 'STEM',
    tier: 2,
    description: 'Planetary geology, cosmic orbits, celestial physics, and astronomical discoveries.',
    tags: ['#SolarSystem', '#SpaceScience', '#Astronomy', '#Planets'],
    prerequisiteIds: ['stem_foundations'],
    xpReward: 100,
    iconName: 'Sparkles',
  },
  {
    id: 'astrophysics_quantum',
    title: 'Quantum Mechanics & Black Holes',
    domain: 'STEM',
    tier: 3,
    description: 'Quantum superposition, entanglement, relativistic singularity, and Hawking radiation.',
    tags: ['#Astrophysics', '#Quantum', '#BlackHoles', '#Relativity'],
    prerequisiteIds: ['astronomy_space'],
    xpReward: 200,
    iconName: 'Zap',
  },
  {
    id: 'algorithms_logic',
    title: 'Algorithmic Complexity & Big-O',
    domain: 'STEM',
    tier: 2,
    description: 'Asymptotic notation, searching & sorting efficiency, recursive paradigms, and graphs.',
    tags: ['#Algorithms', '#BigO', '#ComputerScience', '#Coding'],
    prerequisiteIds: ['stem_foundations'],
    xpReward: 100,
    iconName: 'Code2',
  },
  {
    id: 'ai_systems',
    title: 'Neural Networks & Machine Learning',
    domain: 'STEM',
    tier: 3,
    description: 'Deep neural architectures, backpropagation, attention mechanisms, and predictive models.',
    tags: ['#AI', '#MachineLearning', '#NeuralNetworks', '#DataScience'],
    prerequisiteIds: ['algorithms_logic'],
    xpReward: 200,
    iconName: 'BrainCircuit',
  },
  {
    id: 'earth_geology',
    title: 'Dynamic Earth, Tectonics & Volcanoes',
    domain: 'STEM',
    tier: 2,
    description: 'Plate tectonics, seismic boundaries, mantle convection, and volcanic eruptions.',
    tags: ['#Volcanoes', '#EarthScience', '#Geology', '#PlateTectonics'],
    prerequisiteIds: ['stem_foundations'],
    xpReward: 100,
    iconName: 'Globe',
  },

  // --- HISTORY & HUMANITIES DOMAIN ---
  {
    id: 'history_foundations',
    title: 'Historical Inquiry & Primary Sources',
    domain: 'History',
    tier: 1,
    description: 'Historiography, source verification, archival synthesis, and temporal contextualization.',
    tags: ['#History', '#Historiography', '#Archives', '#Sources'],
    prerequisiteIds: [],
    xpReward: 50,
    iconName: 'Landmark',
  },
  {
    id: 'renaissance_revolution',
    title: 'The Renaissance & Intellectual Rebirth',
    domain: 'History',
    tier: 2,
    description: 'Humanism, Florentine innovation, perspective art, and scientific reformation.',
    tags: ['#Renaissance', '#ArtHistory', '#Humanism', '#Italy'],
    prerequisiteIds: ['history_foundations'],
    xpReward: 100,
    iconName: 'Palette',
  },
  {
    id: 'modern_philosophies',
    title: 'Modern Political & Moral Philosophy',
    domain: 'History',
    tier: 3,
    description: 'Social contract theory, utilitarianism, deontological ethics, and existentialism.',
    tags: ['#Philosophy', '#Ethics', '#Governance', '#PoliticalTheory'],
    prerequisiteIds: ['renaissance_revolution'],
    xpReward: 200,
    iconName: 'BookOpen',
  },

  // --- SOCIAL SCIENCES & ECONOMICS DOMAIN ---
  {
    id: 'social_foundations',
    title: 'Human Ecology & Social Systems',
    domain: 'Social Sciences',
    tier: 1,
    description: 'Interconnected communities, cultural adaptation, demographic dynamics, and habitats.',
    tags: ['#SocialSciences', '#Sociology', '#Ecology', '#Society'],
    prerequisiteIds: [],
    xpReward: 50,
    iconName: 'Globe',
  },
  {
    id: 'behavioral_economics',
    title: 'Behavioral Economics & Heuristics',
    domain: 'Social Sciences',
    tier: 2,
    description: 'Cognitive biases, prospect theory, nudge architecture, and bounded rationality.',
    tags: ['#BehavioralEconomics', '#Economics', '#Psychology', '#Heuristics'],
    prerequisiteIds: ['social_foundations'],
    xpReward: 100,
    iconName: 'TrendingUp',
  },
  {
    id: 'global_trade_policy',
    title: 'Macroeconomic Systems & Global Markets',
    domain: 'Social Sciences',
    tier: 3,
    description: 'Fiscal levers, monetary velocity, international liquidity, and trade equilibria.',
    tags: ['#Macroeconomics', '#GlobalMarkets', '#Finance', '#Trade'],
    prerequisiteIds: ['behavioral_economics'],
    xpReward: 200,
    iconName: 'Award',
  },
  {
    id: 'animal_kingdom_ecology',
    title: 'Biodiversity & Ecological Niches',
    domain: 'Social Sciences',
    tier: 2,
    description: 'Symbiotic relationships, trophic cascades, evolutionary adaptations, and habitats.',
    tags: ['#AnimalKingdom', '#Ecosystems', '#Wildlife', '#Biodiversity'],
    prerequisiteIds: ['social_foundations'],
    xpReward: 100,
    iconName: 'Compass',
  },
];

interface AdaptiveLearningPathProps {
  stats: UserStats;
  persona: PersonaType;
  historyRecords?: QuizHistoryRecord[];
  onStartQuiz?: (quiz: QuizResponse) => void;
  onGenerateNotes?: (topic: string) => void;
  className?: string;
}

export const AdaptiveLearningPath: React.FC<AdaptiveLearningPathProps> = ({
  stats,
  persona,
  historyRecords = [],
  onStartQuiz,
  onGenerateNotes,
  className = '',
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  // Evaluate each node's status based on completed quiz history records
  const evaluatedNodes = useMemo(() => {
    // 1. Identify which nodes are completed by checking history records
    const completedNodeIds = new Set<string>();
    const nodeScores: Record<string, { bestScore: number; attempts: number; lastDate: string }> = {};

    historyRecords.forEach((record) => {
      // Must have passed with at least 60%
      if (record.percentage < 60) return;

      const recordTitleLower = (record.quizTitle || '').toLowerCase();
      const recordTags = (record.quizData?.tags || []).map((t) => t.toLowerCase());
      const recordTopicLower = (record.quizData?.pedagogical_topic || '').toLowerCase();
      const recordSubtopicLower = (record.quizData?.pedagogical_subtopic || '').toLowerCase();

      CANONICAL_SKILL_NODES.forEach((node) => {
        let isMatch = false;

        // Check matching tags
        const nodeTagsLower = node.tags.map((t) => t.toLowerCase().replace('#', ''));
        const matchesTag = recordTags.some((rt) =>
          nodeTagsLower.some((nt) => rt.includes(nt) || nt.includes(rt.replace('#', '')))
        );

        // Check matching titles or keywords
        const nodeTitleWords = node.title.toLowerCase().split(' ');
        const matchesTitle = nodeTitleWords.some(
          (w) => w.length > 3 && (recordTitleLower.includes(w) || recordSubtopicLower.includes(w))
        );

        // Check matching domain
        const matchesTopic =
          recordTopicLower.includes(node.domain.toLowerCase()) ||
          node.domain.toLowerCase().includes(recordTopicLower);

        if (matchesTag || (matchesTitle && matchesTopic)) {
          isMatch = true;
        }

        if (isMatch) {
          completedNodeIds.add(node.id);
          const current = nodeScores[node.id] || { bestScore: 0, attempts: 0, lastDate: record.date };
          nodeScores[node.id] = {
            bestScore: Math.max(current.bestScore, record.percentage),
            attempts: current.attempts + 1,
            lastDate: record.date,
          };
        }
      });
    });

    // If no quizzes are recorded yet, unlock Tier 1 foundation nodes by default so user can start
    // 2. Determine node status based on prerequisites
    return CANONICAL_SKILL_NODES.map((node) => {
      const isCompleted = completedNodeIds.has(node.id);

      let status: SkillNodeStatus = 'locked';
      if (isCompleted) {
        status = 'completed';
      } else {
        // Available if all prerequisites are completed or if it has no prerequisites (Tier 1 roots)
        const allPrereqsMet =
          node.prerequisiteIds.length === 0 ||
          node.prerequisiteIds.every((pid) => completedNodeIds.has(pid));
        if (allPrereqsMet) {
          status = 'available';
        } else {
          status = 'locked';
        }
      }

      const scoreInfo = nodeScores[node.id];

      return {
        ...node,
        status,
        bestScore: scoreInfo?.bestScore || 0,
        attempts: scoreInfo?.attempts || 0,
        lastCompletedDate: scoreInfo?.lastDate,
      };
    });
  }, [historyRecords]);

  // Node map for fast prerequisite lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof evaluatedNodes[0]>();
    evaluatedNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [evaluatedNodes]);

  // Overall path metrics
  const totalNodesCount = evaluatedNodes.length;
  const completedNodesCount = evaluatedNodes.filter((n) => n.status === 'completed').length;
  const availableNodesCount = evaluatedNodes.filter((n) => n.status === 'available').length;
  const masteryPercentage = Math.round((completedNodesCount / totalNodesCount) * 100);

  // Recommended next node to tackle
  const nextRecommendedNode = useMemo(() => {
    return (
      evaluatedNodes.find((n) => n.status === 'available' && n.tier === 1) ||
      evaluatedNodes.find((n) => n.status === 'available' && n.tier === 2) ||
      evaluatedNodes.find((n) => n.status === 'available') ||
      null
    );
  }, [evaluatedNodes]);

  // Filtered nodes by domain
  const filteredNodes = useMemo(() => {
    if (selectedDomain === 'All') return evaluatedNodes;
    if (selectedDomain === 'Completed') return evaluatedNodes.filter((n) => n.status === 'completed');
    if (selectedDomain === 'Available') return evaluatedNodes.filter((n) => n.status === 'available');
    return evaluatedNodes.filter((n) => n.domain === selectedDomain);
  }, [evaluatedNodes, selectedDomain]);

  // Group nodes by tier for the visual branching skill tree columns/tiers
  const tier1Nodes = useMemo(() => filteredNodes.filter((n) => n.tier === 1), [filteredNodes]);
  const tier2Nodes = useMemo(() => filteredNodes.filter((n) => n.tier === 2), [filteredNodes]);
  const tier3Nodes = useMemo(() => filteredNodes.filter((n) => n.tier === 3), [filteredNodes]);

  const renderNodeIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Atom':
        return <Atom className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Code2':
        return <Code2 className={className} />;
      case 'BrainCircuit':
        return <BrainCircuit className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'Palette':
        return <Palette className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      default:
        return <Globe className={className} />;
    }
  };

  const handleLaunchQuizForNode = (node: typeof evaluatedNodes[0]) => {
    soundFx.playClick();
    if (!onStartQuiz) return;

    // Build synthesized quiz or practice prompt matching the node
    const quizPayload: QuizResponse = {
      app_name: 'Quiz Me!',
      persona,
      quiz_title: `${node.title}: Mastery Assessment`,
      summary: node.description,
      difficulty: node.tier === 1 ? 'Beginner' : node.tier === 2 ? 'Intermediate' : 'Master',
      pedagogical_topic: node.domain,
      tags: node.tags,
      questions: [],
    };
    onStartQuiz(quizPayload);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview & Progress Banner */}
      <div className="rounded-3xl p-6 sm:p-7 border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-300/50 dark:border-indigo-700/50">
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Adaptive Skill Tree Visualizer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Adaptive Learning Path
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore your branching curriculum mastery tree. Complete assessments to unlock higher-tier specializations, conquer prerequisites, and fortify subject domains.
            </p>
          </div>

          {/* Path Stats Widget */}
          <div className="flex items-center gap-4 bg-white/90 dark:bg-slate-800/90 p-4 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-xs shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-slate-100 dark:text-slate-700"
                  fill="transparent"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  stroke="#6366f1"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 - (masteryPercentage / 100) * 2 * Math.PI * 24}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-900 dark:text-white">
                {masteryPercentage}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-black text-slate-900 dark:text-white">
                {completedNodesCount} of {totalNodesCount} Mastered
              </div>
              <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{availableNodesCount} Unlocked & Ready</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Tier 1 Foundational &rarr; Tier 3 Mastery
              </div>
            </div>
          </div>
        </div>

        {/* Adaptive Recommendation Pill */}
        {nextRecommendedNode && (
          <div className="mt-5 pt-4 border-t border-indigo-100/80 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-200 font-extrabold text-[10px] uppercase tracking-wide">
                Next Recommendation
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {nextRecommendedNode.title}
              </span>
              <span className="text-slate-400 hidden sm:inline">&bull;</span>
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                +{nextRecommendedNode.xpReward} XP Reward
              </span>
            </div>

            {onStartQuiz && (
              <button
                type="button"
                onClick={() => handleLaunchQuizForNode(nextRecommendedNode)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <span>Launch Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Domain Filters Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'STEM', 'History', 'Social Sciences', 'Available', 'Completed'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setSelectedDomain(d);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
                selectedDomain === d
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {d === 'STEM' && <Atom className="w-3.5 h-3.5 text-emerald-500" />}
              {d === 'History' && <Landmark className="w-3.5 h-3.5 text-amber-500" />}
              {d === 'Social Sciences' && <Globe className="w-3.5 h-3.5 text-sky-500" />}
              {d === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              {d === 'Available' && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{d === 'All' ? 'All Tree Nodes' : d}</span>
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-slate-400">
          Showing <strong>{filteredNodes.length}</strong> Branch Nodes
        </div>
      </div>

      {/* Branching Skill Tree Grid (3 Vertical Progression Tiers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Tier 1 Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tier 1: Foundations
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              Root Level
            </span>
          </div>

          <div className="space-y-3.5">
            {tier1Nodes.map((node) => (
              <SkillNodeCard
                key={node.id}
                node={node}
                renderIcon={renderNodeIcon}
                onSelect={() => setSelectedNode(node)}
                onLaunch={() => handleLaunchQuizForNode(node)}
              />
            ))}
            {tier1Nodes.length === 0 && (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                No foundational nodes in this filter.
              </div>
            )}
          </div>
        </div>

        {/* Tier 2 Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tier 2: Core Branching
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              Intermediate
            </span>
          </div>

          <div className="space-y-3.5">
            {tier2Nodes.map((node) => (
              <SkillNodeCard
                key={node.id}
                node={node}
                renderIcon={renderNodeIcon}
                onSelect={() => setSelectedNode(node)}
                onLaunch={() => handleLaunchQuizForNode(node)}
              />
            ))}
            {tier2Nodes.length === 0 && (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                No intermediate branch nodes in this filter.
              </div>
            )}
          </div>
        </div>

        {/* Tier 3 Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tier 3: Mastery Peaks
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              Specialized
            </span>
          </div>

          <div className="space-y-3.5">
            {tier3Nodes.map((node) => (
              <SkillNodeCard
                key={node.id}
                node={node}
                renderIcon={renderNodeIcon}
                onSelect={() => setSelectedNode(node)}
                onLaunch={() => handleLaunchQuizForNode(node)}
              />
            ))}
            {tier3Nodes.length === 0 && (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                No mastery peak nodes in this filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Node Detail Inspection Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                    selectedNode.domain === 'STEM'
                      ? 'bg-emerald-600'
                      : selectedNode.domain === 'History'
                      ? 'bg-amber-600'
                      : 'bg-indigo-600'
                  }`}
                >
                  {renderNodeIcon(selectedNode.iconName, 'w-5 h-5')}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Tier {selectedNode.tier} Skill &bull; {selectedNode.domain}
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {selectedNode.title}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Status & Proficiency Stats */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Skill Status
                </span>
                {(() => {
                  const nodeWithStatus = nodeMap.get(selectedNode.id);
                  if (nodeWithStatus?.status === 'completed') {
                    return (
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                        <span>Mastered ({nodeWithStatus.bestScore}%)</span>
                      </span>
                    );
                  }
                  if (nodeWithStatus?.status === 'available') {
                    return (
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ready to Unlock</span>
                      </span>
                    );
                  }
                  return (
                    <span className="text-xs font-black text-slate-500 flex items-center gap-1 mt-0.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked (Prerequisites)</span>
                    </span>
                  );
                })()}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  XP Bounty
                </span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>+{selectedNode.xpReward} XP</span>
                </span>
              </div>
            </div>

            {/* Prerequisites */}
            {selectedNode.prerequisiteIds.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Prerequisites Required:
                </label>
                <div className="space-y-1">
                  {selectedNode.prerequisiteIds.map((pid) => {
                    const prereq = nodeMap.get(pid);
                    const isPrereqDone = prereq?.status === 'completed';
                    return (
                      <div
                        key={pid}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold border ${
                          isPrereqDone
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{prereq?.title || pid}</span>
                        {isPrereqDone ? (
                          <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> Incomplete
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedNode.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              {onGenerateNotes && (
                <button
                  type="button"
                  onClick={() => {
                    const topicTitle = selectedNode.title;
                    setSelectedNode(null);
                    onGenerateNotes(topicTitle);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Create Notes</span>
                </button>
              )}
              {onStartQuiz && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNode(null);
                    const nodeWithStatus = nodeMap.get(selectedNode.id);
                    if (nodeWithStatus) {
                      handleLaunchQuizForNode(nodeWithStatus);
                    }
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Assessment for this Skill</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual skill node card
interface SkillNodeCardProps {
  node: SkillNode & {
    status: SkillNodeStatus;
    bestScore: number;
    attempts: number;
    lastCompletedDate?: string;
  };
  renderIcon: (name: string, className?: string) => React.ReactNode;
  onSelect: () => void;
  onLaunch: () => void;
}

const SkillNodeCard: React.FC<SkillNodeCardProps> = ({
  node,
  renderIcon,
  onSelect,
  onLaunch,
}) => {
  const isCompleted = node.status === 'completed';
  const isAvailable = node.status === 'available';
  const isLocked = node.status === 'locked';

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl p-4 border transition-all cursor-pointer ${
        isCompleted
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80 hover:border-emerald-400 shadow-xs'
          : isAvailable
          ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-700/80 hover:border-indigo-500 shadow-xs hover:shadow-md hover:-translate-y-0.5'
          : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 opacity-60 hover:opacity-85'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs font-bold ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : isAvailable
                ? 'bg-indigo-600 text-white group-hover:scale-105 transition-transform'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
          >
            {isLocked ? (
              <Lock className="w-4 h-4 text-slate-400" />
            ) : (
              renderIcon(node.iconName, 'w-4 h-4')
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {node.title}
            </h4>
            <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{node.domain}</span>
              <span>&bull;</span>
              <span>+{node.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              <span>{node.bestScore}%</span>
            </span>
          )}
          {isAvailable && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
              <span>Ready</span>
            </span>
          )}
          {isLocked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Lock className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
        {node.description}
      </p>

      {/* Card Action footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
        <span className="text-[10px] font-bold text-slate-400">
          {isCompleted ? 'Click to Review' : isAvailable ? 'Click to Start' : 'Prerequisites Required'}
        </span>
        <div className="text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-0.5 text-xs group-hover:translate-x-0.5 transition-transform">
          <span>Inspect</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
