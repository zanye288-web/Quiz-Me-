import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Bot,
  Plus,
  Search,
  Filter,
  Bookmark,
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Trash2,
  Download,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { IntelligentNote } from '../types/learningSystem';
import { PersonaType, QuizResponse, ExamFormatId } from '../types/quiz';
import { IntelligentNotesViewer } from './IntelligentNotesViewer';
import { IntelligentNotesGeneratorModal } from './IntelligentNotesGeneratorModal';
import { IntelligentTutorDrawer } from './IntelligentTutorDrawer';
import { SummaryStudyGuideStudio } from './SummaryStudyGuideStudio';
import {
  loadMyTakeaways,
  saveTakeawayNote,
  deleteTakeawayNote,
  TakeawayNote,
} from '../utils/adaptiveLearningEngine';
import { EXAM_FORMAT_CATALOG, getExamFormatSpec } from '../utils/examFormats';
import { resolveThematicVisual } from '../utils/thematicImages';
import { soundFx } from '../utils/audio';

interface IntelligentNotesHubViewProps {
  persona: PersonaType;
  onStartPracticeQuiz?: (topic: string) => void;
  activeQuiz?: QuizResponse | null;
  initialTopic?: string;
  initialExamFormat?: ExamFormatId;
}

const STORAGE_KEY = 'quizme_intelligent_notes_library';

const SEED_NOTES: IntelligentNote[] = [
  {
    id: 'seed_note_mitosis',
    title: 'Cell Division: Mitosis vs Meiosis Mastery',
    subject: 'Biology',
    topic: 'Cellular Division & Genetics',
    sourceType: 'topic',
    topicIntroduction: 'Mitosis produces two genetically identical diploid somatic cells for growth and tissue repair, while Meiosis produces four genetically diverse haploid gametes for sexual reproduction.',
    keyConcepts: [
      {
        title: 'Diploid vs Haploid Ploidy',
        explanation: 'Somatic human cells possess 46 chromosomes (2n), whereas mature gametes (sperm/egg) carry 23 chromosomes (1n).',
      },
      {
        title: 'Homologous Recombination (Crossing Over)',
        explanation: 'Occurs exclusively during Prophase I of Meiosis, exchanging non-sister chromatid segments to generate genetic variability.',
      },
      {
        title: 'Spindle Checkpoint (Metaphase-to-Anaphase)',
        explanation: 'Ensures all kinetochores are securely bound to spindle microtubules before sister chromatids are cleaved by separase.',
      },
    ],
    detailedExplanation: [
      'Step 1: Interphase duplication. During the S-phase, every chromosome is replicated into two identical sister chromatids held by cohesin rings.',
      'Step 2: Prophase compaction. Chromatin condenses into visible X-shaped structures, centrosomes migrate to opposite poles, and the nuclear envelope disintegrates.',
      'Step 3: Metaphase alignment. Chromosomes line up along the metaphase equatorial plate under tension from bipolar spindle microtubules.',
      'Step 4: Anaphase separation. Cohesin degrades, and sister chromatids are pulled toward opposite centrosome poles.',
      'Step 5: Telophase & Cytokinesis. Nuclear membranes reform around two new nuclei, and actin-myosin contractile rings pinch the cytoplasm.',
    ],
    examples: [
      {
        scenario: 'Skin Cut Healing',
        explanation: 'Epithelial cells undergo rapid mitotic division to replace damaged tissue with genetically identical cells.',
      },
      {
        scenario: 'Gamete Production',
        explanation: 'Germ cells in reproductive organs undergo meiosis to halve chromosome counts, preventing doubled ploidy upon fertilization.',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Assuming DNA replicates between Meiosis I and Meiosis II',
        whyItHappens: 'Learners assume every division requires an S-phase.',
        correction: 'Interkinesis occurs without chromosome duplication, which is why chromosome numbers halve from diploid to haploid.',
      },
      {
        mistake: 'Confusing sister chromatids with homologous chromosomes',
        whyItHappens: 'Both terms describe paired genetic structures.',
        correction: 'Sister chromatids are identical copies of one chromosome; homologous chromosomes are maternal and paternal pairs.',
      },
    ],
    rememberThis: [
      'Mitosis = 1 division, 2 identical diploid cells (2n).',
      'Meiosis = 2 divisions, 4 unique haploid cells (1n).',
      'Crossing over happens in Prophase I, NOT in Mitosis.',
    ],
    quickRevision: [
      'Verify ploidy changes before and after each phase.',
      'Check for genetic recombination markers.',
      'Remember PMAT: Prophase, Metaphase, Anaphase, Telophase.',
    ],
    selfCheckQuestions: [
      {
        question: 'Which stage of meiosis is directly responsible for generating new combinations of genetic alleles?',
        options: ['Prophase I', 'Metaphase II', 'Anaphase I', 'Telophase II'],
        answer: 'Prophase I',
        explanation: 'Synapsis and crossing over occur during Prophase I, exchanging maternal and paternal chromatid segments.',
      },
      {
        question: 'If a human skin cell with 46 chromosomes divides by mitosis, how many chromosomes will each daughter cell contain?',
        options: ['46', '23', '92', '12'],
        answer: '46',
        explanation: 'Mitosis maintains exact diploid chromosome count (2n = 46).',
      },
    ],
    visualAsset: {
      url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&auto=format&fit=crop&q=80',
      caption: 'Microscopic cellular structures and chromatin architecture during division.',
      imageType: 'Biology',
    },
    tags: ['#Biology', '#Mitosis', '#Genetics', '#CellDivision'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'seed_note_bigo',
    title: 'Algorithmic Complexity & Big-O Foundations',
    subject: 'Computer Science',
    topic: 'Algorithms & Data Structures',
    sourceType: 'topic',
    topicIntroduction: 'Big-O notation mathematically describes how an algorithm runtime or memory footprint scales asymptotically as input size N grows toward infinity.',
    keyConcepts: [
      {
        title: 'Asymptotic Growth Orders',
        explanation: 'O(1) Constant < O(log N) Logarithmic < O(N) Linear < O(N log N) Linearithmic < O(N^2) Quadratic < O(2^N) Exponential.',
      },
      {
        title: 'Worst-case vs Amortized Time',
        explanation: 'Dynamic arrays have O(1) amortized insertion, despite occasional O(N) array resizing copies.',
      },
      {
        title: 'Space Complexity Tradeoffs',
        explanation: 'Memoization trades auxiliary memory (hash maps or cache tables) to reduce exponential recursive time to polynomial.',
      },
    ],
    detailedExplanation: [
      'Step 1: Identify the primary input variable N that drives loop iterations or recursive branches.',
      'Step 2: Drop non-dominant terms (e.g. O(N^2 + 5N + 100) simplifies directly to O(N^2)).',
      'Step 3: Drop constant coefficients (e.g. 7N operations is still asymptotically O(N)).',
      'Step 4: Analyze branching factors. A binary recursion with depth D and 2 calls per level runs in O(2^D) unless memoized.',
    ],
    examples: [
      {
        scenario: 'Searching a Sorted Phone Directory',
        explanation: 'Binary Search halves the remaining search space every step, requiring only log2(1,000,000) ≈ 20 comparisons.',
      },
      {
        scenario: 'Comparing All Pairs in an Array',
        explanation: 'A nested loop over N elements executes N*(N-1)/2 iterations, resulting in quadratic O(N^2) performance.',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Assuming fewer lines of code means faster Big-O execution',
        whyItHappens: 'High-level syntactic sugar hides inner loops (e.g. array.includes inside a loop is O(N^2)).',
        correction: 'Analyze the underlying operation count of built-in methods rather than line length.',
      },
      {
        mistake: 'Confusing O(log N) with O(N)',
        whyItHappens: 'Both grow slower than quadratic curves on small inputs.',
        correction: 'Logarithmic algorithms cut problem sizes in half at each step (trees, binary search).',
      },
    ],
    rememberThis: [
      'Big-O measures scalability as N approaches infinity, not exact milliseconds on one CPU.',
      'Hash table lookups are O(1) average, O(N) worst-case under hash collisions.',
      'Merge Sort is guaranteed O(N log N) time; Quick Sort is O(N log N) average, O(N^2) worst.',
    ],
    quickRevision: [
      'Drop constants and low-order terms.',
      'Recognize divide-and-conquer logarithmic signatures.',
      'Count maximum stack frame depth for recursive space complexity.',
    ],
    selfCheckQuestions: [
      {
        question: 'What is the worst-case time complexity of searching for an item in an unsorted array of size N?',
        options: ['O(N)', 'O(1)', 'O(log N)', 'O(N^2)'],
        answer: 'O(N)',
        explanation: 'You may have to inspect all N items sequentially if the target is at the end or absent.',
      },
    ],
    visualAsset: {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      caption: 'Algorithmic logic and computing hardware execution pathways.',
      imageType: 'Computer Science',
    },
    tags: ['#ComputerScience', '#Algorithms', '#BigO', '#DataStructures'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const IntelligentNotesHubView: React.FC<IntelligentNotesHubViewProps> = ({
  persona,
  onStartPracticeQuiz,
  activeQuiz,
  initialTopic = '',
  initialExamFormat,
}) => {
  const [notes, setNotes] = useState<IntelligentNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return SEED_NOTES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedNote, setSelectedNote] = useState<IntelligentNote | null>(null);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [isTutorDrawerOpen, setIsTutorDrawerOpen] = useState(false);
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorTopicContext, setTutorTopicContext] = useState('');

  // Inline AI Notes Generator State
  const [inlineTopic, setInlineTopic] = useState<string>(
    initialTopic || activeQuiz?.quiz_title || ''
  );
  const [inlineSubject, setInlineSubject] = useState<string>('STEM & Core Academics');
  const [inlineExamLens, setInlineExamLens] = useState<ExamFormatId | 'general'>(
    initialExamFormat || (activeQuiz?.examFormat ? activeQuiz.examFormat : 'general')
  );
  const [inlineLevel, setInlineLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [inlineCustomContext, setInlineCustomContext] = useState<string>('');
  const [isGeneratingInline, setIsGeneratingInline] = useState<boolean>(false);

  useEffect(() => {
    if (initialTopic) {
      setInlineTopic(initialTopic);
    }
    if (initialExamFormat) {
      setInlineExamLens(initialExamFormat);
    }
  }, [initialTopic, initialExamFormat]);

  const handleGenerateInlineNote = async (e?: React.FormEvent, overrideTopic?: string) => {
    if (e) e.preventDefault();
    const targetTopic = (overrideTopic !== undefined ? overrideTopic : inlineTopic).trim();
    if (!targetTopic) return;

    soundFx.playClick();
    setIsGeneratingInline(true);

    const examSpec =
      inlineExamLens !== 'general' ? getExamFormatSpec(inlineExamLens) : null;
    const examDirective = examSpec
      ? `[OFFICIAL ${examSpec.fullName.toUpperCase()} REVISION GUIDE]: Structure these notes specifically for ${examSpec.shortName} (${examSpec.paperStructure}, ${examSpec.gradingScaleLabel}). Highlight Chief Examiner marking points, command-word definitions, and high-yield exam pitfalls. ${inlineCustomContext}`
      : inlineCustomContext;

    try {
      const response = await fetch('/api/intelligent-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: examSpec ? `${examSpec.shortName}: ${targetTopic}` : targetTopic,
          subject: inlineSubject,
          sourceType: 'topic',
          contextDetails: examDirective.trim(),
          persona,
          learnerLevel: inlineLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.notes) {
        throw new Error(data.error || 'Fallback synthesis');
      }

      const contextString = [data.notes.topic, data.notes.subject, ...(data.notes.tags || [])].join(' ');
      const visual = resolveThematicVisual(contextString);
      const createdNote: IntelligentNote = {
        ...data.notes,
        id: `note_${Date.now()}`,
        sourceType: 'topic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visualAsset: visual
          ? {
              url: visual.url,
              caption: visual.caption,
              imageType: data.notes.subject || 'Academic Illustration',
            }
          : undefined,
      };

      soundFx.playComplete();
      setNotes((prev) => [createdNote, ...prev]);
      setSelectedNote(createdNote);
    } catch {
      const visual = resolveThematicVisual(targetTopic);
      const fallbackNote: IntelligentNote = {
        id: `note_${Date.now()}`,
        title: examSpec
          ? `${examSpec.badgeEmoji} ${examSpec.shortName} Master Notes: ${targetTopic}`
          : `${targetTopic} — Comprehensive Study Notes`,
        subject: inlineSubject,
        topic: targetTopic,
        sourceType: 'topic',
        topicIntroduction: examSpec
          ? `High-yield ${examSpec.fullName} revision guide covering core definitions, Paper 1 & Paper 2 command-word strategies, and Chief Examiner marking points for ${targetTopic}.`
          : `Structured first-principles mastery guide covering foundational mechanisms, step-by-step derivations, and self-check questions for ${targetTopic}.`,
        keyConcepts: [
          {
            title: `Core Mechanism of ${targetTopic}`,
            explanation: `Defines the primary governing law and structural relationships tested in ${targetTopic}.`,
          },
          {
            title: examSpec ? `${examSpec.shortName} Mark-Scheme Keywords` : 'Applied Problem-Solving Framework',
            explanation: examSpec
              ? `Use precise syllabus terminology required by ${examSpec.shortName} examiners to earn full structured marks.`
              : 'Connects theoretical principles to quantitative and analytical edge cases.',
          },
          {
            title: 'Boundary Conditions & Exceptions',
            explanation: 'Identifies when standard assumptions break down and how to spot distractor traps.',
          },
        ],
        detailedExplanation: [
          `Step 1: Foundational Definition — Establish the exact meaning and units/components of ${targetTopic}.`,
          `Step 2: Cause-and-Effect Pathway — Trace how changing one variable impacts the overall system.`,
          `Step 3: ${examSpec ? `${examSpec.shortName} Exam Application` : 'Analytical Synthesis'} — Apply the rule to multi-step questions and verify units.`,
        ],
        examples: [
          {
            scenario: `Classic ${examSpec ? examSpec.shortName : 'Academic'} Vignette`,
            explanation: `Demonstrates how ${targetTopic} is framed in real examination scenarios and how to deduce the correct response systematically.`,
          },
        ],
        commonMistakes: [
          {
            mistake: 'Relying on surface keyword matching without checking constraints',
            whyItHappens: 'Distractors often include familiar terms paired with reversed causal logic.',
            correction: 'Always verify the direction of change and underlying mechanism before selecting an option.',
          },
        ],
        rememberThis: [
          `Always state the governing principle of ${targetTopic} clearly before substituting values.`,
          examSpec
            ? `Target Scale: ${examSpec.gradingScaleLabel} (${examSpec.paperStructure}).`
            : 'Focus on why the correct answer works AND why each distractor fails.',
        ],
        quickRevision: [
          `Review key definitions and formulas for ${targetTopic}.`,
          'Practice explaining the concept in one clear sentence in your own words.',
        ],
        selfCheckQuestions: [
          {
            question: `What is the most reliable strategy when solving an unfamiliar problem on ${targetTopic}?`,
            options: [
              'Break the problem down into first-principles definitions and conserved quantities',
              'Guess based on the longest option text',
              'Ignore boundary conditions and units',
              'Memorize a single example without understanding the rule',
            ],
            answer: 'Break the problem down into first-principles definitions and conserved quantities',
            explanation: 'First-principles reasoning transfers across novel exam wordings and prevents distractor traps.',
          },
        ],
        visualAsset: visual
          ? {
              url: visual.url,
              caption: visual.caption,
              imageType: inlineSubject,
            }
          : undefined,
        tags: [
          `#${inlineSubject.replace(/[^a-zA-Z0-9]/g, '')}`,
          examSpec ? `#${examSpec.shortName.split(' ')[0]}` : '#StudyNotes',
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      soundFx.playComplete();
      setNotes((prev) => [fallbackNote, ...prev]);
      setSelectedNote(fallbackNote);
    } finally {
      setIsGeneratingInline(false);
    }
  };

  // One-Line Takeaways ("My Notes" Journal) State
  const [takeaways, setTakeaways] = useState<TakeawayNote[]>(() => loadMyTakeaways());
  const [newTakeawayText, setNewTakeawayText] = useState('');
  const [newTakeawayTopic, setNewTakeawayTopic] = useState(activeQuiz?.quiz_title || 'General Study');

  const handleCreateQuickTakeaway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTakeawayText.trim()) return;
    soundFx.playComplete();
    saveTakeawayNote({
      oneLineTakeaway: newTakeawayText.trim(),
      topic: newTakeawayTopic.trim() || 'General Study',
      quizTitle: activeQuiz?.quiz_title || 'My Notes Entry',
    });
    setTakeaways(loadMyTakeaways());
    setNewTakeawayText('');
  };

  const handleRemoveTakeaway = (id: string) => {
    soundFx.playClick();
    setTakeaways(deleteTakeawayNote(id));
  };

  // Persist notes changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save notes to storage:', e);
    }
  }, [notes]);

  // Derived subjects list
  const subjects = ['All', ...Array.from(new Set(notes.map((n) => n.subject).filter(Boolean)))];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === 'All' || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleAddNote = (newNote: IntelligentNote) => {
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNote(newNote);
  };

  const handleDeleteNote = (noteId: string) => {
    soundFx.playClick();
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-300">
      {/* Hub Hero Banner */}
      <div className="comic-tab-hero rounded-3xl p-6 sm:p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
                ISSUE #07 · STUDY GUIDES
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-950/55 text-cyan-200 border border-white/25">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Intelligent Notes &amp; Academic Knowledge Base</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
              Intelligent Study Notes &amp; Concept Library
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
              Generate structured, high-yield study notes from topics, quizzes, or missed questions. Each note includes key concepts, progressive explanations, common cognitive mistakes, and interactive self-check questions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setTutorTopicContext('General Study Guidance');
                setTutorQuery('Can you recommend what academic concepts I should study next based on my learning profile?');
                setIsTutorDrawerOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950/80 border-2 border-slate-950 text-white text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>Ask AI Tutor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsGeneratorModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* INLINE AI NOTES GENERATOR STUDIO (1-Click Topic & Exam Board Notes Synthesizer) */}
      <div className="comic-panel rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border-2 border-indigo-300 dark:border-indigo-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                ✨ AI NOTES GENERATOR
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                Supports General Topics + Checkpoint • WAEC • JAMB • IGCSE • SAT
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              Generate Structured Study Notes &amp; Exam Cram Sheets Instantly
            </h2>
          </div>

          {/* Academic Level Pills */}
          <div className="flex items-center gap-1 self-start sm:self-center">
            {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setInlineLevel(lvl);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border cursor-pointer ${
                  inlineLevel === lvl
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Format Lens Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
            Exam Format Lens:
          </span>
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setInlineExamLens('general');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border cursor-pointer ${
              inlineExamLens === 'general'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            🧠 General Mastery
          </button>
          {EXAM_FORMAT_CATALOG.slice(0, 7).map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setInlineExamLens(fmt.id);
                if (!inlineTopic.trim() && fmt.sampleTopics[0]) {
                  setInlineTopic(fmt.sampleTopics[0]);
                }
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border cursor-pointer ${
                inlineExamLens === fmt.id
                  ? 'bg-amber-300 text-slate-950 border-slate-950 font-black shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {fmt.badgeEmoji} {fmt.shortName}
            </button>
          ))}
        </div>

        {/* Topic & Subject Input Row */}
        <form onSubmit={(e) => handleGenerateInlineNote(e)} className="space-y-3">
          <div className="flex flex-col lg:flex-row gap-2.5 items-stretch">
            <select
              value={inlineSubject}
              onChange={(e) => setInlineSubject(e.target.value)}
              aria-label="Note Subject Category"
              className="lg:w-52 px-3 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Biology & Life Sciences">🧬 Biology &amp; Life Sciences</option>
              <option value="Mathematics & Calculus">📐 Mathematics &amp; Calculus</option>
              <option value="Physics & Engineering">⚡ Physics &amp; Engineering</option>
              <option value="Chemistry">🧪 Chemistry</option>
              <option value="Computer Science & AI">💻 Computer Science &amp; AI</option>
              <option value="English & Literature">📚 English &amp; Literature</option>
              <option value="History & Government">🏛️ History &amp; Government</option>
              <option value="Economics & Business">📈 Economics &amp; Business</option>
            </select>

            <input
              type="text"
              value={inlineTopic}
              onChange={(e) => setInlineTopic(e.target.value)}
              placeholder="Enter any topic, chapter, or syllabus concept to generate full study notes (e.g., Electrolysis, Mitosis, Quadratic Equations, Photosynthesis)..."
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={isGeneratingInline || !inlineTopic.trim()}
              className="arcade-btn px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white border-2 border-emerald-800 font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {isGeneratingInline ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Study Notes</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <input
            type="text"
            value={inlineCustomContext}
            onChange={(e) => setInlineCustomContext(e.target.value)}
            placeholder="Optional: Paste specific lecture notes, definitions, or areas you want emphasized (e.g., include mnemonics, formulas & worked examples)..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </form>

        {/* Quick 1-Click Note Topic Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1">
            Quick Generate:
          </span>
          {[
            'WAEC Biology: Cell Structure, Osmosis & Genetics',
            'JAMB UTME Physics: Projectile Motion & Ohm’s Law',
            'Cambridge Checkpoint Science: Forces & Energy Transfer',
            'IGCSE Chemistry: Stoichiometry, Moles & Electrolysis',
            'Python & Data Structures: Big-O, Recursion & Hash Maps',
          ].map((presetTopic) => (
            <button
              key={presetTopic}
              type="button"
              onClick={() => {
                setInlineTopic(presetTopic);
                handleGenerateInlineNote(undefined, presetTopic);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-all"
            >
              ⚡ {presetTopic}
            </button>
          ))}
        </div>
      </div>

      {/* My Notes: Saved One-Line Takeaways & Own-Words Reflections */}
      <div className="comic-panel pattern-halftone rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-200 dark:border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
                MY NOTES · ONE-LINE TAKEAWAYS
              </span>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {takeaways.length} Saved {takeaways.length === 1 ? 'Takeaway' : 'Takeaways'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Personal Session Takeaways &amp; “In My Own Words” Reflections
            </h2>
          </div>
        </div>

        {/* Quick Add One-Line Takeaway Form */}
        <form onSubmit={handleCreateQuickTakeaway} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newTakeawayTopic}
            onChange={(e) => setNewTakeawayTopic(e.target.value)}
            placeholder="Topic (e.g. Biology, Algorithms)..."
            className="sm:w-52 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="text"
            maxLength={240}
            value={newTakeawayText}
            onChange={(e) => setNewTakeawayText(e.target.value)}
            placeholder="Save a one-line takeaway from your study session or topic..."
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newTakeawayText.trim()}
            className="comic-panel-sm px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-black cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Save Takeaway</span>
          </button>
        </form>

        {/* Saved Takeaways List */}
        {takeaways.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {takeaways.map((item) => (
              <div
                key={item.id}
                className="comic-panel-sm p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-slate-800/70 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black uppercase">
                      {item.topic}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()} • {item.quizTitle}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    “{item.oneLineTakeaway}”
                  </p>
                  {item.ownWordsExplanations && item.ownWordsExplanations.length > 0 && (
                    <div className="pt-1 space-y-1">
                      {item.ownWordsExplanations.map((ow, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] p-2 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-slate-700 dark:text-slate-300"
                        >
                          <span className="font-black text-amber-800 dark:text-amber-300">
                            Explained in my own words:
                          </span>{' '}
                          {ow.userExplanation}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTakeaway(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                  title="Delete takeaway"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sleek AI Summary & Study Guide Generator Studio */}
      <SummaryStudyGuideStudio
        persona={persona}
        onLaunchQuizFromTopic={(topic) => {
          if (onStartPracticeQuiz) onStartPracticeQuiz(topic);
        }}
      />

      {/* Main Layout: Note Reader or Library Grid */}
      {selectedNote ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setSelectedNote(null);
            }}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>← Back to Notes Library</span>
          </button>

          <IntelligentNotesViewer
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onLaunchPracticeQuiz={(topic) => {
              if (onStartPracticeQuiz) onStartPracticeQuiz(topic);
            }}
            onAskTutorAboutNote={(title, exp) => {
              setTutorTopicContext(title);
              setTutorQuery(`Can you explain "${title}" in more depth? Context: ${exp}`);
              setIsTutorDrawerOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by concept, topic, or keyword..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Subject Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedSubject(sub);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedNote(note);
                }}
                className="rounded-3xl border-2 border-b-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-600 text-white">
                      STUDY GUIDE · {note.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {note.topicIntroduction}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{note.keyConcepts.length} Concepts</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>{note.commonMistakes.length} Pitfalls</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{note.selfCheckQuestions.length} Checks</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold">
                    <span>Study Note</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                No matching study notes found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate a new intelligent study note from any subject, concept, or quiz topic!
              </p>
              <button
                type="button"
                onClick={() => setIsGeneratorModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Note</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Generator Modal */}
      <IntelligentNotesGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        sourceQuiz={activeQuiz}
        persona={persona}
        onNoteGenerated={handleAddNote}
      />

      {/* Tutor Drawer */}
      <IntelligentTutorDrawer
        isOpen={isTutorDrawerOpen}
        onClose={() => setIsTutorDrawerOpen(false)}
        persona={persona}
        currentQuizTitle={tutorTopicContext}
        initialQuery={tutorQuery}
        onGenerateNotes={(topic) => {
          setIsTutorDrawerOpen(false);
          setIsGeneratorModalOpen(true);
        }}
      />
    </div>
  );
};
