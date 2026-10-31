import React, { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers,
  ChevronRight,
  Info,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { ConceptDependencyNode, DependencyGraphEdge } from '../types/examinerIntelligence';
import { soundFx } from '../utils/audio';

interface KnowledgeDependencyGraphViewProps {
  onStartQuizOnTopic?: (subject: string, topic: string) => void;
  onOpenNotesOnTopic?: (subject: string, topic: string) => void;
}

// Comprehensive concept dependency trees across STEM
const DOMAIN_NODES: Record<string, { nodes: ConceptDependencyNode[]; edges: DependencyGraphEdge[] }> = {
  mathematics: {
    nodes: [
      {
        id: 'math-arithmetic',
        domain: 'mathematics',
        title: 'Number Operations & Arithmetic',
        level: 1,
        description: 'Prime numbers, order of operations (BODMAS), fractions, and index laws.',
        prerequisiteIds: [],
        state: 'mastered',
        masteryScore: 95,
        recentAttemptsCount: 14,
        associatedTopic: 'Number and Numeration',
        keyFormulaOrLaw: 'a^m · a^n = a^(m+n)',
      },
      {
        id: 'math-linear-equations',
        domain: 'mathematics',
        title: 'Linear Equations & Transposition',
        level: 2,
        description: 'Solving ax + b = c, isolating variables, and algebraic substitution.',
        prerequisiteIds: ['math-arithmetic'],
        state: 'mastered',
        masteryScore: 88,
        recentAttemptsCount: 9,
        associatedTopic: 'Algebraic Processes',
        keyFormulaOrLaw: 'x = (c - b) / a',
      },
      {
        id: 'math-quadratics',
        domain: 'mathematics',
        title: 'Quadratic Equations & Parabolic Roots',
        level: 2,
        description: 'Factoring, completing the square, discriminant analysis, and quadratic formula.',
        prerequisiteIds: ['math-linear-equations'],
        state: 'weak_prerequisite',
        masteryScore: 42,
        recentAttemptsCount: 8,
        associatedTopic: 'Algebraic Processes',
        keyFormulaOrLaw: 'x = (-b ± √(b² - 4ac)) / (2a)',
        examinerTrap: 'Forgetting the ± when taking square roots or failing to check for negative extraneous roots in geometric contexts.',
      },
      {
        id: 'math-functions',
        domain: 'mathematics',
        title: 'Functions, Domain & Range',
        level: 3,
        description: 'Function mappings f(x), composition f(g(x)), inverse functions f⁻¹(x), and Cartesian graphs.',
        prerequisiteIds: ['math-linear-equations', 'math-quadratics'],
        state: 'in_progress',
        masteryScore: 60,
        recentAttemptsCount: 5,
        associatedTopic: 'Functions and Graphs',
        keyFormulaOrLaw: 'f(f⁻¹(x)) = x',
      },
      {
        id: 'math-limits',
        domain: 'mathematics',
        title: 'Limits & Continuity',
        level: 3,
        description: 'Behavior of functions as x approaches values, indeterminate forms (0/0), and vertical asymptotes.',
        prerequisiteIds: ['math-functions'],
        state: 'in_progress',
        masteryScore: 55,
        recentAttemptsCount: 4,
        associatedTopic: 'Calculus Foundations',
        keyFormulaOrLaw: 'lim(x→a) [f(x) - f(a)] / (x - a)',
      },
      {
        id: 'math-derivatives',
        domain: 'mathematics',
        title: 'Differentiation & Rates of Change',
        level: 4,
        description: 'Power rule, product rule, quotient rule, chain rule, and finding tangents & stationary points.',
        prerequisiteIds: ['math-limits'],
        state: 'in_progress',
        masteryScore: 48,
        recentAttemptsCount: 7,
        associatedTopic: 'Differential Calculus',
        keyFormulaOrLaw: 'd/dx [x^n] = n·x^(n-1)',
      },
      {
        id: 'math-integration',
        domain: 'mathematics',
        title: 'Definite & Indefinite Integration',
        level: 4,
        description: 'Anti-derivatives, area under curves, Riemann sums, and the Fundamental Theorem of Calculus.',
        prerequisiteIds: ['math-derivatives'],
        state: 'locked',
        masteryScore: 0,
        recentAttemptsCount: 0,
        associatedTopic: 'Integral Calculus',
        keyFormulaOrLaw: '∫ x^n dx = (x^(n+1))/(n+1) + C',
      },
    ],
    edges: [
      { from: 'math-arithmetic', to: 'math-linear-equations' },
      { from: 'math-linear-equations', to: 'math-quadratics' },
      { from: 'math-linear-equations', to: 'math-functions' },
      { from: 'math-quadratics', to: 'math-functions' },
      { from: 'math-functions', to: 'math-limits' },
      { from: 'math-limits', to: 'math-derivatives' },
      { from: 'math-derivatives', to: 'math-integration' },
    ],
  },
  physics: {
    nodes: [
      {
        id: 'phy-vectors',
        domain: 'physics',
        title: 'Scalars, Vectors & Resolving Forces',
        level: 1,
        description: 'Vector addition, head-to-tail method, and resolving components along x and y axes.',
        prerequisiteIds: [],
        state: 'mastered',
        masteryScore: 92,
        recentAttemptsCount: 11,
        associatedTopic: 'General Physics',
        keyFormulaOrLaw: 'F_x = F·cos(θ), F_y = F·sin(θ)',
      },
      {
        id: 'phy-kinematics',
        domain: 'physics',
        title: 'Kinematics & Uniform Acceleration',
        level: 2,
        description: 'Equations of motion (SUVAT), speed-time gradients, and projectile trajectories.',
        prerequisiteIds: ['phy-vectors'],
        state: 'mastered',
        masteryScore: 84,
        recentAttemptsCount: 10,
        associatedTopic: 'Mechanics',
        keyFormulaOrLaw: 'v² = u² + 2as',
      },
      {
        id: 'phy-newtons-laws',
        domain: 'physics',
        title: 'Newton\'s Laws & Dynamic Forces',
        level: 2,
        description: 'Inertia, resultant force F = ma, terminal velocity, friction, and free-body force diagrams.',
        prerequisiteIds: ['phy-kinematics', 'phy-vectors'],
        state: 'in_progress',
        masteryScore: 68,
        recentAttemptsCount: 6,
        associatedTopic: 'Mechanics',
        keyFormulaOrLaw: 'ΣF = m·a',
      },
      {
        id: 'phy-energy-momentum',
        domain: 'physics',
        title: 'Work, Energy & Momentum Conservation',
        level: 3,
        description: 'Kinetic energy, gravitational potential energy, conservation of momentum, and impulse.',
        prerequisiteIds: ['phy-newtons-laws'],
        state: 'weak_prerequisite',
        masteryScore: 38,
        recentAttemptsCount: 9,
        associatedTopic: 'Energy & Momentum',
        keyFormulaOrLaw: 'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂',
        examinerTrap: 'Failing to assign positive and negative directional signs to velocities in head-on collisions.',
      },
      {
        id: 'phy-gravitation-orbits',
        domain: 'physics',
        title: 'Circular Motion & Gravitational Fields',
        level: 4,
        description: 'Centripetal acceleration, Newton\'s Law of Universal Gravitation, and satellite orbital velocities.',
        prerequisiteIds: ['phy-energy-momentum'],
        state: 'locked',
        masteryScore: 0,
        recentAttemptsCount: 0,
        associatedTopic: 'Fields and Gravitation',
        keyFormulaOrLaw: 'F = G(m₁m₂) / r²',
      },
    ],
    edges: [
      { from: 'phy-vectors', to: 'phy-kinematics' },
      { from: 'phy-vectors', to: 'phy-newtons-laws' },
      { from: 'phy-kinematics', to: 'phy-newtons-laws' },
      { from: 'phy-newtons-laws', to: 'phy-energy-momentum' },
      { from: 'phy-energy-momentum', to: 'phy-gravitation-orbits' },
    ],
  },
};

export const KnowledgeDependencyGraphView: React.FC<KnowledgeDependencyGraphViewProps> = ({
  onStartQuizOnTopic,
  onOpenNotesOnTopic,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('mathematics');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('math-quadratics');

  const activeGraph = DOMAIN_NODES[selectedDomain] || DOMAIN_NODES.mathematics;
  const selectedNode = activeGraph.nodes.find((n) => n.id === selectedNodeId) || activeGraph.nodes[0];

  // Trace prerequisite ancestor path
  const getPrerequisiteAncestors = (nodeId: string): ConceptDependencyNode[] => {
    const ancestors: ConceptDependencyNode[] = [];
    const queue = [nodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const target = activeGraph.nodes.find((n) => n.id === current);
      if (target && current !== nodeId) {
        ancestors.push(target);
      }
      if (target) {
        queue.push(...target.prerequisiteIds);
      }
    }
    return ancestors;
  };

  // Trace downstream unlocked concepts
  const getDownstreamDependents = (nodeId: string): ConceptDependencyNode[] => {
    return activeGraph.nodes.filter((n) => n.prerequisiteIds.includes(nodeId));
  };

  const ancestors = getPrerequisiteAncestors(selectedNode.id);
  const dependents = getDownstreamDependents(selectedNode.id);

  // Check if any ancestor is a weak prerequisite
  const weakPrerequisites = ancestors.filter((a) => a.state === 'weak_prerequisite');

  const getNodeColor = (state: string) => {
    switch (state) {
      case 'mastered':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-500',
          badge: 'text-emerald-700 dark:text-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'weak_prerequisite':
        return {
          bg: 'bg-red-50 dark:bg-red-950/40',
          border: 'border-red-500 shadow-red-200/50 dark:shadow-red-900/30 shadow-md',
          badge: 'text-red-700 dark:text-red-300',
          dot: 'bg-red-500 animate-pulse',
        };
      case 'in_progress':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-500',
          badge: 'text-amber-700 dark:text-amber-300',
          dot: 'bg-amber-500',
        };
      case 'locked':
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-800/40',
          border: 'border-slate-300 dark:border-slate-700',
          badge: 'text-slate-500',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <GitFork className="w-4 h-4" />
              <span>Prerequisite Intelligence</span>
              <span aria-hidden="true">·</span>
              <span>Root Cause Diagnosis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Knowledge Dependency Graph
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Academic concepts build on foundational prerequisites. When you struggle with advanced concepts like
              differentiation or projectile motion, the graph traces your root knowledge gap back to its origin.
            </p>
          </div>

          {/* Domain Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedDomain('mathematics');
                setSelectedNodeId('math-quadratics');
                soundFx.playClick();
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                selectedDomain === 'mathematics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Mathematics DAG
            </button>
            <button
              onClick={() => {
                setSelectedDomain('physics');
                setSelectedNodeId('phy-energy-momentum');
                soundFx.playClick();
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                selectedDomain === 'physics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Physics DAG
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Graph Nodes (7 cols) + Detail Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Display (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Prerequisite Progression Tree ({selectedDomain.toUpperCase()})
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mastered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Prerequisite Gap
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> In Progress
              </span>
            </div>
          </div>

          {/* Node List as Sequenced Graph Stages */}
          <div className="space-y-3 pt-2">
            {activeGraph.nodes.map((node, index) => {
              const isSelected = node.id === selectedNode.id;
              const style = getNodeColor(node.state);

              return (
                <div key={node.id} className="relative">
                  {/* Connecting line to next node */}
                  {index < activeGraph.nodes.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-[-16px] w-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                  )}

                  <button
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      soundFx.playClick();
                    }}
                    className={`w-full text-left p-4 rounded-xl border relative z-10 transition-all flex items-start justify-between gap-4 ${
                      style.bg
                    } ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : style.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{node.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Tier {node.level}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                          {node.description}
                        </p>
                        {node.keyFormulaOrLaw && (
                          <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                            {node.keyFormulaOrLaw}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {node.masteryScore}%
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase mt-0.5">
                        {node.state.replace('_', ' ')}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector & Root Cause Diagnostics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Domain: {selectedNode.domain}</span>
                <span aria-hidden="true">·</span>
                <span>Tier {selectedNode.level}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedNode.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Foundational Gap Warning if Applicable */}
            {selectedNode.state === 'weak_prerequisite' && (
              <div className="p-4 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Foundational Prerequisite Gap Detected</span>
                </div>
                <p className="text-xs text-red-900 dark:text-red-200 leading-relaxed">
                  Your assessment history shows repeated difficulties on this concept ({selectedNode.masteryScore}% accuracy).
                  Failing to repair this node will block mastery in downstream concepts.
                </p>
                {selectedNode.examinerTrap && (
                  <div className="text-xs text-red-800 dark:text-red-300 pt-1">
                    <span className="font-semibold">Examiner Trap: </span>
                    {selectedNode.examinerTrap}
                  </div>
                )}
              </div>
            )}

            {/* Upstream Ancestor Prerequisite Path */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Prerequisite Ancestor Trail:
              </h4>
              {ancestors.length === 0 ? (
                <div className="text-xs text-slate-500 italic">
                  Root Foundational Axiom (No prior prerequisites required).
                </div>
              ) : (
                <div className="space-y-1.5">
                  {ancestors.map((anc) => (
                    <div
                      key={anc.id}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {anc.state === 'mastered' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{anc.title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{anc.masteryScore}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Downstream Unlocks */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Concepts Unlocked by This Node:
              </h4>
              {dependents.length === 0 ? (
                <div className="text-xs text-slate-500 italic">Advanced Capstone Concept</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {dependents.map((dep) => (
                    <button
                      key={dep.id}
                      onClick={() => setSelectedNodeId(dep.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-1"
                    >
                      <span>{dep.title}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions for Selected Node */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {onStartQuizOnTopic && (
                <button
                  onClick={() => onStartQuizOnTopic(selectedDomain, selectedNode.associatedTopic)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedNode.state === 'weak_prerequisite'
                      ? 'Repair Foundational Gap (Targeted Quiz)'
                      : 'Practice This Concept'}
                  </span>
                </button>
              )}

              {onOpenNotesOnTopic && (
                <button
                  onClick={() => onOpenNotesOnTopic(selectedDomain, selectedNode.associatedTopic)}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Review Explanatory Notes & Axioms</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
