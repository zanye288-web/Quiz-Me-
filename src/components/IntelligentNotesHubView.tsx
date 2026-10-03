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
import { PersonaType, QuizResponse } from '../types/quiz';
import { IntelligentNotesViewer } from './IntelligentNotesViewer';
import { IntelligentNotesGeneratorModal } from './IntelligentNotesGeneratorModal';
import { IntelligentTutorDrawer } from './IntelligentTutorDrawer';
import { soundFx } from '../utils/audio';

interface IntelligentNotesHubViewProps {
  persona: PersonaType;
  onStartPracticeQuiz?: (topic: string) => void;
  activeQuiz?: QuizResponse | null;
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
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Intelligent Notes & Academic Knowledge Base</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Intelligent Study Notes & Concept Library
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer backdrop-blur-xs shadow-xs"
            >
              <Bot className="w-4 h-4 text-indigo-300" />
              <span>Ask AI Tutor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsGeneratorModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notes</span>
            </button>
          </div>
        </div>
      </div>

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
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                {/* Visual Thumbnail */}
                {note.visualAsset && (
                  <div className="h-36 w-full overflow-hidden bg-slate-900 relative">
                    <img
                      src={note.visualAsset.url}
                      alt={note.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2.5 left-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-600/90 text-white backdrop-blur-xs">
                      {note.subject}
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1">
                  {!note.visualAsset && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {note.subject}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

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
