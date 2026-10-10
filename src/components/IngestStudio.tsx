import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Upload,
  Link2,
  BookOpen,
  X,
  ArrowRight,
  HelpCircle,
  Clock,
  Flame,
  CheckCircle2,
  BarChart3,
  Lightbulb,
  FileCode,
  Image as ImageIcon,
  Zap,
  Mic,
  Compass,
  Layers,
  GraduationCap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Wand2,
  Minus,
  Plus,
  Globe,
  Check,
  Search,
  AlertTriangle,
} from 'lucide-react';
import {
  PersonaType,
  QuestionType,
  DifficultyType,
  IngestFileInput,
  QuizResponse,
  AssessmentConfig,
  UserStats,
  ExamFormatId,
} from '../types/quiz';
import { PRESET_TOPICS, PresetTopic } from '../data/presets';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { AudioRecorderStudio } from './AudioRecorderStudio';
import { RecommendedQuizzesSection } from './RecommendedQuizzesSection';
import { QuizHistoryRecord } from './HistoryView';
import { QuizTrackDetailDrawer, SelectedTrackInfo } from './QuizTrackDetailDrawer';
import { SUPPORTED_LANGUAGES, SupportedLanguage, getLanguageByCode } from '../data/languages';
import { MascotAvatar } from './MascotAvatar';
import { getLevelProgress, getDailyRetentionCheckIn } from '../utils/levelingSystem';
import {
  verifyDailyTriviaBlitzXp,
  getRewardedTriviaIdsToday,
  getDailyEffortVerificationStatus,
} from '../utils/xpIntegrity';
import { SavedQuizDocument } from '../services/firestore';
import { buildInterleavedMixQuiz } from '../utils/adaptiveLearningEngine';
import {
  EXAM_FORMAT_CATALOG,
  getExamFormatSpec,
  buildPrebuiltExamByFormat,
} from '../utils/examFormats';
import { IntelligentNote } from '../types/learningSystem';
import { IntelligentNotesViewer } from './IntelligentNotesViewer';

interface IngestStudioProps {
  persona: PersonaType;
  onPersonaChange: (p: PersonaType) => void;
  onStartQuiz: (quiz: QuizResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (err: string | null) => void;
  assessmentConfig: AssessmentConfig;
  onUpdateAssessmentConfig?: (newConfig: Partial<AssessmentConfig>) => void;
  onUpdateStats?: (newStats: Partial<UserStats>) => void;
  onOpenRawJsonModal?: (quiz: QuizResponse) => void;
  onOpenUploadQuiz?: () => void;
  onOpenTutor?: (questionId?: number) => void;
  onOpenLevelRoadmap?: () => void;
  onNavigateTab?: (tab: string) => void;
  customQuizzes?: SavedQuizDocument[];
  stats?: UserStats;
  historyRecords?: QuizHistoryRecord[];
}

export const IngestStudio: React.FC<IngestStudioProps> = ({
  persona,
  onPersonaChange,
  onStartQuiz,
  isLoading,
  setIsLoading,
  errorMessage,
  setErrorMessage,
  assessmentConfig,
  onUpdateAssessmentConfig,
  onUpdateStats,
  onOpenUploadQuiz,
  onOpenTutor,
  onOpenLevelRoadmap,
  onNavigateTab,
  customQuizzes = [],
  stats = {
    streak: 1,
    hearts: 5,
    maxHearts: 5,
    xp: 0,
    gems: 25,
    coins: 0,
    level: 1,
    quizzesCompleted: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    badges: [],
  },
  historyRecords = [],
}) => {
  const { currentAccentConfig } = useTheme();
  // Top-level Studio Workspace Organization: 'builder' | 'tracks' | 'recommended'
  const [studioSection, setStudioSection] = useState<'builder' | 'tracks' | 'recommended'>('builder');
  // Input Tabs: 'presets' | 'text' | 'file' | 'audio' | 'url' | 'exam' | 'notes_generator'
  const [activeTab, setActiveTab] = useState<'presets' | 'text' | 'file' | 'audio' | 'url' | 'exam' | 'notes_generator'>('text');
  const [inlineGeneratedNote, setInlineGeneratedNote] = useState<IntelligentNote | null>(null);
  const [isGeneratingNoteInline, setIsGeneratingNoteInline] = useState<boolean>(false);
  const selectedExamFormat: ExamFormatId = assessmentConfig.examFormat || 'waec';
  const activeExamSpec = getExamFormatSpec(selectedExamFormat);

  const handleGenerateInlineStudyNote = async (overrideTopic?: string) => {
    const rawTopic = (overrideTopic ?? inputText).trim() || `${activeExamSpec.shortName} Core Syllabus`;
    soundFx.playClick();
    setIsGeneratingNoteInline(true);
    setErrorMessage(null);
    const saveNoteToLibrary = (noteToSave: IntelligentNote) => {
      try {
        const raw = localStorage.getItem('quizme_intelligent_notes_library');
        const list: IntelligentNote[] = raw ? JSON.parse(raw) : [];
        const updated = [noteToSave, ...list.filter((n) => n.id !== noteToSave.id)];
        localStorage.setItem('quizme_intelligent_notes_library', JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
    };
    try {
      const enrichedTopic =
        assessmentConfig.mode === 'exam'
          ? `${rawTopic} (${activeExamSpec.fullName} Syllabus, Key Formulas, Marking Scheme Keywords & Worked Examples)`
          : rawTopic;
      const res = await fetch('/api/intelligent-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: enrichedTopic,
          subject: activeExamSpec.shortName,
          sourceType: 'topic',
          contextDetails:
            assessmentConfig.mode === 'exam'
              ? `Tailor this study guide specifically for ${activeExamSpec.fullName} (${activeExamSpec.governingBody}). Highlight command words, marking scheme keywords, worked examples, and common candidate pitfalls.`
              : '',
          persona,
          learnerLevel: difficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.notes) {
        throw new Error(data.error || 'Failed to generate AI Study Notes.');
      }
      const note: IntelligentNote = {
        ...data.notes,
        id: `note_${Date.now()}`,
        sourceType: 'topic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveNoteToLibrary(note);
      soundFx.playComplete();
      setInlineGeneratedNote(note);
    } catch {
      const fallbackNote: IntelligentNote = {
        id: `note-inline-${Date.now()}`,
        title: `${rawTopic} — ${activeExamSpec.shortName} Study Guide`,
        subject: activeExamSpec.shortName,
        topic: rawTopic,
        sourceType: 'topic',
        topicIntroduction: `Comprehensive revision notes, key definitions, worked examples, and marking-scheme checkpoints for ${rawTopic} (${activeExamSpec.fullName}).`,
        keyConcepts: [
          {
            title: `${rawTopic}: Core Principles & Definitions`,
            explanation: `Master the foundational laws, precise terminology, and marking-scheme keywords required by ${activeExamSpec.governingBody} for ${rawTopic}.`,
          },
          {
            title: `${activeExamSpec.shortName} High-Yield Application`,
            explanation: `Understand how ${rawTopic} is tested across ${activeExamSpec.paperStructure} and how to structure step-by-step solutions.`,
          },
        ],
        detailedExplanation: [
          `Step 1: Identify the command words and given parameters in ${rawTopic} problems.`,
          `Step 2: State the governing formula, law, or principle clearly before substituting values.`,
          `Step 3: Express your final answer with appropriate SI units and significant figures as required by ${activeExamSpec.shortName} examiners.`,
        ],
        examples: [
          {
            scenario: `${activeExamSpec.shortName} Worked Example on ${rawTopic}`,
            explanation: `Apply first principles to break down the question stem, eliminate distractors, and verify the result against boundary conditions.`,
          },
        ],
        commonMistakes: [
          {
            mistake: `Omitting units or intermediate working steps in ${rawTopic}`,
            whyItHappens: `Rushing through calculations without writing down the formula or state symbols.`,
            correction: `Always write the governing equation and check unit consistency at every step.`,
          },
        ],
        rememberThis: [
          `Review ${activeExamSpec.shortName} past paper command words for ${rawTopic}.`,
          `Always state definitions using exact syllabus terminology.`,
        ],
        selfCheckQuestions: [
          {
            id: 1,
            question: `Which strategy is most critical when answering a ${activeExamSpec.shortName} question on ${rawTopic}?`,
            options: [
              'State the governing principle/formula clearly and include proper units',
              'Skip intermediate working steps to save time',
              'Guess based on option length',
              'Ignore command words in the prompt',
            ],
            correctAnswer: 'State the governing principle/formula clearly and include proper units',
            explanation: `${activeExamSpec.governingBody} marking schemes award method marks (M1) for explicit principles/formulas and accuracy marks (A1) for correct units.`,
          },
        ],
        tags: [activeExamSpec.shortName, rawTopic, 'Exam Revision'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveNoteToLibrary(fallbackNote);
      soundFx.playComplete();
      setInlineGeneratedNote(fallbackNote);
    } finally {
      setIsGeneratingNoteInline(false);
    }
  };

  const handleSelectExamFormat = (formatId: ExamFormatId) => {
    soundFx.playSelect();
    const spec = getExamFormatSpec(formatId);
    setSelectedQuestionTypes(spec.defaultQuestionTypes);
    setCalculatorEnabled(spec.calculatorAllowed);
    onUpdateAssessmentConfig?.({
      mode: 'exam',
      examFormat: formatId,
      timeLimitMinutes: spec.defaultTimeMinutes,
      passingScorePercent: spec.defaultPassingScore,
      allowHints: spec.allowHintsInExam,
      calculatorEnabled: spec.calculatorAllowed,
    });
  };
  const [showAllPresetsInBuilder, setShowAllPresetsInBuilder] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_TOPICS[0]?.id || '');
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<SelectedTrackInfo | null>(null);
  const [inputText, setInputText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<IngestFileInput[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [isInputShaking, setIsInputShaking] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  const selectedPreset = PRESET_TOPICS.find((p) => p.id === selectedPresetId) || PRESET_TOPICS[0] || null;

  const handleOpenTrackDetail = (preset: PresetTopic) => {
    soundFx.playSelect();
    const quizData = persona === 'Teacher' ? preset.prebuiltTeacherQuiz : preset.prebuiltStudentQuiz;
    setSelectedTrackForDetail({
      id: preset.id,
      title: preset.title,
      description: preset.description,
      category: preset.category,
      pedagogical_topic: preset.pedagogical_topic,
      pedagogical_subtopic: preset.pedagogical_subtopic,
      inputText: preset.inputText,
      mediaUrl: preset.mediaUrl,
      quiz: quizData,
    });
  };

  // Assessment Options
  const [difficulty, setDifficulty] = useState<DifficultyType>('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]);
  const [isLangPickerOpen, setIsLangPickerOpen] = useState<boolean>(false);
  const [langSearch, setLangSearch] = useState<string>('');
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>([
    'multiple_choice',
    'fill_in_blank',
    'open_explanation',
    'code_media_challenge',
  ]);

  // Enhanced Prompter Flexibility Options (User Request)
  const [showAdvancedPrompter, setShowAdvancedPrompter] = useState<boolean>(false);
  const [calculatorEnabled, setCalculatorEnabled] = useState<boolean>(true);
  const [dictionaryEnabled, setDictionaryEnabled] = useState<boolean>(true);
  const [miniTriviaIndex, setMiniTriviaIndex] = useState<number>(0);
  const [miniTriviaSelected, setMiniTriviaSelected] = useState<string | null>(null);
  const [miniTriviaSolvedIds, setMiniTriviaSolvedIds] = useState<number[]>(() =>
    getRewardedTriviaIdsToday()
  );
  const [miniTriviaNotice, setMiniTriviaNotice] = useState<string | null>(null);

  const MINI_TRIVIA_QUESTIONS = [
    {
      id: 1,
      badge: '🌍 All-Ages Wonder',
      q: 'Which planet in our solar system spins clockwise (backwards compared to Earth)?',
      options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
      answer: 'Venus',
      fact: 'Venus rotates backwards so slowly that one day on Venus is longer than its entire year!',
    },
    {
      id: 2,
      badge: '🐙 Ocean Mystery',
      q: 'How many hearts does a giant Pacific octopus have?',
      options: ['1 Heart', '2 Hearts', '3 Hearts', '8 Hearts'],
      answer: '3 Hearts',
      fact: 'Two hearts pump blood to the gills, and a third pumps it to the rest of the body!',
    },
    {
      id: 3,
      badge: '🧠 Brain Teaser',
      q: 'What is the only number spelled in English with its letters in alphabetical order?',
      options: ['Eight', 'Forty', 'Ten', 'Five'],
      answer: 'Forty',
      fact: 'F-O-R-T-Y is in exact A-to-Z alphabetical order!',
    },
    {
      id: 4,
      badge: '⚡ Tech & Science',
      q: 'Roughly how long does it take sunlight to travel from the Sun to Earth?',
      options: ['8 Seconds', '8 Minutes', '8 Hours', 'Instant'],
      answer: '8 Minutes',
      fact: 'Light travels at ~300,000 km/s, reaching Earth in about 8 minutes and 20 seconds!',
    },
  ];
  const currentMiniTrivia = MINI_TRIVIA_QUESTIONS[miniTriviaIndex % MINI_TRIVIA_QUESTIONS.length];
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [promptStyle, setPromptStyle] = useState<string>('Standard');
  const [targetAudience, setTargetAudience] = useState<string>('All Ages / Family Fun');
  const [creativityLevel, setCreativityLevel] = useState<number>(0.7);
  const [intelligenceScope, setIntelligenceScope] = useState<string>('omniscient_synthesis');
  const [focusSubtopics, setFocusSubtopics] = useState<string>('');

  const PROMPT_MODIFIERS = [
    { label: '🌟 Family Fun Trivia Style', text: 'Frame questions with fascinating curiosities, fun facts, and lively historical anecdotes that engage players of all ages.' },
    { label: '🧒 Kid-Friendly Analogies', text: 'Use colorful, vivid real-world analogies, friendly vocabulary, supportive hints, and positive encouragement for younger learners.' },
    { label: '🩺 Clinical & Case Vignettes', text: 'Structure questions around realistic clinical/practical case scenarios with patient/user details.' },
    { label: '🧠 Deep First Principles', text: 'Emphasize fundamental "why" mechanisms, derivation, and underlying physical or conceptual laws.' },
    { label: '⚡ High-Yield Exam Cram', text: 'Focus strictly on high-probability questions frequently tested on board and certification exams.' },
    { label: '🔍 Tricky Edge Cases & Traps', text: 'Include plausible counter-intuitive distractors that expose common student misconceptions.' },
    { label: '💡 Mnemonics & Memory Hooks', text: 'Incorporate memorable acronyms, rhymes, or visual mental models into explanations.' },
    { label: '💻 Code Bug Hunting', text: 'Provide realistic code snippets containing subtle bugs, performance bottlenecks, or syntax pitfalls.' },
  ];

  const handleApplyModifier = (modifierText: string) => {
    soundFx.playSelect();
    setCustomInstructions((prev) => {
      const clean = prev.trim();
      if (!clean) return modifierText;
      if (clean.includes(modifierText)) return prev;
      return `${clean}\n• ${modifierText}`;
    });
    setShowAdvancedPrompter(true);
  };

  // Keyboard shortcut listener (Cmd/Ctrl + Enter to generate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isLoading) {
        e.preventDefault();
        handleGenerateQuiz();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, mediaUrl, uploadedFiles, selectedQuestionTypes, difficulty, questionCount, isLoading]);

  const QUICK_STARTER_TOPICS = [
    { label: 'Space & Black Holes', prompt: 'Mind-Blowing Space & Black Holes: Supernovas, exoplanets, galaxies, and astronaut life', icon: '🚀', color: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
    { label: 'World Trivia & Wonders', prompt: 'Amazing World Wonders, Geography, Cultural Traditions, and Record-Breaking Landmarks', icon: '🌍', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    { label: 'Ancient Myths & Legends', prompt: 'Greek, Norse, and Egyptian Mythology: Legendary gods, heroes, creatures, and epic tales', icon: '⚡', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    { label: 'Brain Riddles & Logic', prompt: 'Clever Brain Teasers, Lateral Thinking Puzzles, Pattern Logic, and Word Riddles for All Ages', icon: '🧩', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    { label: 'Ocean & Wildlife', prompt: 'Incredible Animals & Deep Ocean Mysteries: Bioluminescent creatures, rainforests, and animal superpowers', icon: '🐬', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    { label: 'Coding & Tech Future', prompt: 'Modern Computer Science, AI Breakthroughs, Cybersecurity, and Software Engineering Fundamentals', icon: '💻', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  ];

  const ALL_AGES_EXPERIENCE_MODES = [
    {
      id: 'family',
      label: 'Family Trivia',
      emoji: '🎮',
      audience: 'All Ages / Family Fun',
      diff: 'Beginner' as DifficultyType,
      prompt: 'Fun Family Trivia Night: Amazing animals, space wonders, inventions, pop culture, and surprising world facts!',
    },
    {
      id: 'kids',
      label: 'Kids Explorer',
      emoji: '🦖',
      audience: 'Elementary / Young Learners',
      diff: 'Beginner' as DifficultyType,
      prompt: 'Young Explorer Adventure: Dinosaurs, planets, ocean creatures, and cool everyday science explained simply!',
    },
    {
      id: 'riddles',
      label: 'Brain Riddles',
      emoji: '🧠',
      audience: 'All Ages / Puzzle Lovers',
      diff: 'Intermediate' as DifficultyType,
      prompt: 'Clever Brain Teasers, Logic Puzzles, Math Tricks, and Fun Riddles that test creative thinking!',
    },
    {
      id: 'school',
      label: 'School & AP Prep',
      emoji: '🎓',
      audience: 'High School / AP & IB',
      diff: 'Intermediate' as DifficultyType,
      prompt: 'High-Yield Academic Review: Biology, World History, Physics, and Critical Reading mastery.',
    },
    {
      id: 'pro',
      label: 'Pro & Career',
      emoji: '🏆',
      audience: 'University / Pro Certification',
      diff: 'Master' as DifficultyType,
      prompt: 'Advanced Professional Mastery: System Architecture, Clinical Diagnostics, Economics, and First-Principles Problem Solving.',
    },
  ];

  const SURPRISE_TOPICS_POOL = [
    'Weird & Wonderful Science Facts You Never Learned in School',
    'Deep Sea Monsters & Bioluminescent Ocean Life',
    'Legendary Video Games, Animation & Pop Culture History',
    'How Everyday Inventions Actually Work (Wi-Fi, Planes, Microwaves, GPS)',
    'Dinosaur Kingdom: T-Rex, Velociraptors & Prehistoric Earth',
    'Global Street Food, Culinary Secrets & World Flavors',
    'Detective Logic Mysteries & Deductive Reasoning Challenges',
    'Space Exploration: Mars Rovers, James Webb Telescope & Alien Worlds',
    'Human Body Superpowers: Brain Neurons, Immune System & DNA',
    'Ancient Civilizations: Pyramids, Aztecs, Samurai & Lost Cities',
  ];

  const handleSurpriseMe = () => {
    soundFx.playPop();
    const pick = SURPRISE_TOPICS_POOL[Math.floor(Math.random() * SURPRISE_TOPICS_POOL.length)];
    setActiveTab('text');
    setInputText(pick);
    setValidationWarning(null);
    setErrorMessage(null);
  };

  const handleCustomizeTopic = (prompt: string, diff: DifficultyType, types: QuestionType[]) => {
    setStudioSection('builder');
    setActiveTab('text');
    setInputText(prompt);
    setDifficulty(diff);
    if (types && types.length > 0) {
      setSelectedQuestionTypes(types);
    }
    const creationCard = document.getElementById('creation-card-main');
    if (creationCard) {
      creationCard.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            mimeType: file.type || 'text/plain',
            base64Data,
          },
        ]);
        soundFx.playClick();
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    soundFx.playClick();
  };

  const toggleQuestionType = (type: QuestionType) => {
    soundFx.playClick();
    if (selectedQuestionTypes.includes(type)) {
      if (selectedQuestionTypes.length === 1) {
        setErrorMessage('Please keep at least one question type selected.');
        return;
      }
      setSelectedQuestionTypes(selectedQuestionTypes.filter((t) => t !== type));
    } else {
      setSelectedQuestionTypes([...selectedQuestionTypes, type]);
    }
    setErrorMessage(null);
  };

  const handleLoadPreset = (preset: PresetTopic) => {
    soundFx.playClick();
    setSelectedPresetId(preset.id);
    setInputText(preset.inputText);
    setMediaUrl(preset.mediaUrl || '');
    setSelectedQuestionTypes(preset.suggestedTypes);
    setErrorMessage(null);
    setValidationWarning(null);

    const quizToUse = persona === 'Teacher' ? preset.prebuiltTeacherQuiz : preset.prebuiltStudentQuiz;
    onStartQuiz(quizToUse);
  };

  const handleAudioRecorded = (file: IngestFileInput) => {
    setUploadedFiles((prev) => {
      const filtered = prev.filter((f) => f.name !== file.name);
      return [...filtered, file];
    });
    setErrorMessage(null);
  };

  const handleDirectAudioGeneration = async (audioFile: IngestFileInput) => {
    soundFx.playClick();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: inputText.trim() ? inputText : 'Voice recording / spoken study notes provided in attached audio file.',
          mediaUrl,
          files: [audioFile],
          persona,
          questionTypes: selectedQuestionTypes.length > 0 ? selectedQuestionTypes : ['multiple_choice'],
          difficulty,
          questionCount,
          customInstructions: customInstructions.trim() || undefined,
          promptStyle,
          targetAudience,
          focusSubtopics: focusSubtopics.trim() || undefined,
          creativityLevel,
          intelligenceScope,
          language: selectedLanguage.code,
          languageName: selectedLanguage.name,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not generate quiz from recorded audio. Please try again.');
      }

      soundFx.playComplete();
      onStartQuiz(data.quiz);
    } catch (err: unknown) {
      const error = err as Error;
      soundFx.playIncorrect();
      setErrorMessage(`Audio Assessment Error: ${error.message || 'Could not process audio.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async (overridePrompt?: string) => {
    soundFx.playClick();
    setErrorMessage(null);
    setValidationWarning(null);

    // Determine effective topic text:
    let effectiveText = (overridePrompt !== undefined ? overridePrompt : inputText).trim();
    const hasFiles = uploadedFiles.length > 0;
    const hasUrl = mediaUrl.trim().length > 0;

    // If no text was manually provided, and on presets or exam tab - use the selected preset or exam topic!
    if (!effectiveText && !hasFiles && !hasUrl) {
      if (activeTab === 'presets' && selectedPreset) {
        effectiveText = selectedPreset.inputText;
      } else if (activeTab === 'exam' || assessmentConfig.mode === 'exam') {
        effectiveText = activeExamSpec.sampleTopics[0] || `${activeExamSpec.fullName} Comprehensive Mock Examination`;
      }
    }

    // Inject Exam Format Blueprint Directive when in Exam Mode or Exam tab
    const isExamRun = activeTab === 'exam' || assessmentConfig.mode === 'exam';
    const combinedInstructions = [
      customInstructions.trim(),
      isExamRun
        ? `[OFFICIAL EXAM FORMAT BLUEPRINT — ${activeExamSpec.fullName.toUpperCase()}]: ${activeExamSpec.aiBlueprintDirective} Structure Paper: ${activeExamSpec.paperStructure}. Grading Scale: ${activeExamSpec.gradingScaleLabel}.`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    if (!effectiveText && !hasFiles && !hasUrl) {
      soundFx.playIncorrect();
      const warning = 'Please enter a subject, custom notes, upload a file, or pick a starter topic below.';
      setValidationWarning(warning);
      setErrorMessage(warning);
      setIsInputShaking(true);
      setTimeout(() => setIsInputShaking(false), 800);

      if (activeTab === 'text') {
        const inputEl = document.getElementById('notes-input');
        if (inputEl) {
          inputEl.focus();
        }
      }
      return;
    }

    // Auto-fallback question formats if none selected
    const typesToUse = selectedQuestionTypes.length > 0
      ? selectedQuestionTypes
      : (['multiple_choice', 'fill_in_blank'] as QuestionType[]);

    setIsLoading(true);
    const numBatches = questionCount > 15 ? Math.ceil(questionCount / 15) : 1;
    setGenerationStep(
      questionCount > 30
        ? `Launching ${numBatches} parallel AI pillars for ${questionCount} questions...`
        : 'Analyzing topic & mapping cognitive scope...'
    );

    const stepTimer1 = setTimeout(() => {
      setGenerationStep(
        questionCount > 30
          ? `Synthesizing ${questionCount} unique questions & misconception distractors...`
          : 'Writing questions, rationales & helpful hints...'
      );
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep(`Finalizing ${questionCount}-question deck & study guide...`);
    }, 3200);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: effectiveText,
          mediaUrl,
          files: uploadedFiles,
          persona,
          questionTypes: typesToUse,
          difficulty,
          questionCount,
          customInstructions: combinedInstructions || undefined,
          promptStyle: isExamRun ? 'Exam Cram & High-Yield' : promptStyle,
          targetAudience,
          focusSubtopics: focusSubtopics.trim() || undefined,
          creativityLevel,
          intelligenceScope: isExamRun ? 'exam_olympiad_rigor' : intelligenceScope,
          language: selectedLanguage.code,
          languageName: selectedLanguage.name,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await response.json();

      if (!response.ok || !data.success || !data.quiz) {
        throw new Error(data.error || 'Could not generate quiz from AI. Please try again.');
      }

      soundFx.playComplete();
      onStartQuiz({
        ...data.quiz,
        examFormat: isExamRun ? selectedExamFormat : data.quiz.examFormat,
        calculatorEnabled,
        dictionaryEnabled,
      });
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const error = err as Error;
      soundFx.playIncorrect();
      setErrorMessage(error.message || 'Unable to generate quiz. Please refine your prompt and try again.');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  };

  const lvlInfo = getLevelProgress(stats.xp || 0, stats.streak || 1);
  const dailyCheckIn = getDailyRetentionCheckIn();
  const currentLevel = lvlInfo.level;
  const levelProgressPct = lvlInfo.progressPercent;
  const accuracyPct =
    stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 100;
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashoffset = ringCircumference - (levelProgressPct / 100) * ringCircumference;

  const displayedPresets = showAllPresetsInBuilder ? PRESET_TOPICS : PRESET_TOPICS.slice(0, 4);

  return (
    <div className="max-w-[1420px] mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
      {/* 1. VIBRANT OFFICIAL & FUN HERO BANNER & 1-CLICK INSTANT PLAY BAR */}
      <div className="animate-24fps-deal holo-command-deck holo-grid-overlay holo-shimmer-bar relative rounded-3xl p-5 sm:p-7 border-2 border-indigo-400/60 border-b-[6px] border-b-indigo-950 text-white overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/35 border border-white/25 text-xs font-extrabold tracking-wide text-white shadow-2xs">
                <span className="animate-24fps-float">⚡</span>
                <span>OFFICIAL QUIZ ARENA</span>
                <span className="opacity-60">•</span>
                <span className="text-amber-300 font-black tabular-nums">
                  <span className="animate-24fps-flame">🔥</span> {stats.streak}d Streak
                </span>
                <span className="opacity-60">•</span>
                <span className="text-emerald-300 font-black tabular-nums">
                  Lv.{currentLevel} ({stats.xp.toLocaleString()} XP)
                </span>
              </div>

              <div
                className="xp-integrity-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-400 text-slate-950 border-b-2 border-emerald-700 text-[11px] font-black shadow-2xs"
                title="Every XP point is verified by active recall, dwell-time checks, and anti-replay protection"
              >
                <span>🛡️ Effort-Verified XP</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
              Master any subject with{' '}
              <span className="inline-block px-3 py-0.5 rounded-xl bg-amber-300 text-slate-950 border-b-3 border-amber-600 font-black shadow-sm">
                1 to 100 smart questions
              </span>{' '}
              in seconds.
            </h1>
            <p className="text-xs sm:text-sm text-white/95 font-semibold max-w-xl leading-relaxed">
              Multi-disciplinary AI synthesis across 12 cognitive dimensions, timed math &amp; spelling championships, and 100% effort-verified XP progression.
            </p>
          </div>

          {/* Segmented Official Arcade Mode Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/45 border-2 border-white/25 self-start lg:self-center shrink-0">
            {[
              { id: 'builder', emoji: '⚡', label: 'Quiz Maker' },
              { id: 'exam_shortcut', emoji: '🎓', label: 'Exam Mode' },
              { id: 'past_papers_shortcut', emoji: '📚', label: 'Past Papers Hub' },
              { id: 'presentation_shortcut', emoji: '🖥️', label: 'Presentation Maker' },
              { id: 'notes_shortcut', emoji: '📝', label: 'Notes Generator' },
              { id: 'tracks', emoji: '🎯', label: `Quiz Decks (${customQuizzes.length})` },
            ].map((view) => {
              const isSelected =
                (view.id === 'exam_shortcut' && studioSection === 'builder' && activeTab === 'exam') ||
                (view.id === 'notes_shortcut' && studioSection === 'builder' && activeTab === 'notes_generator') ||
                (view.id === studioSection && activeTab !== 'exam' && activeTab !== 'notes_generator');
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    if (view.id === 'exam_shortcut') {
                      setStudioSection('builder');
                      setActiveTab('exam');
                      onUpdateAssessmentConfig?.({
                        mode: 'exam',
                        examFormat: selectedExamFormat,
                      });
                    } else if (view.id === 'past_papers_shortcut') {
                      if (onNavigateTab) {
                        onNavigateTab('past_papers');
                      } else {
                        setStudioSection('builder');
                        setActiveTab('exam');
                      }
                    } else if (view.id === 'presentation_shortcut') {
                      if (onNavigateTab) {
                        onNavigateTab('gamma');
                      }
                    } else if (view.id === 'notes_shortcut') {
                      setStudioSection('builder');
                      setActiveTab('notes_generator');
                    } else {
                      setStudioSection(view.id as 'builder' | 'tracks' | 'recommended');
                      if (view.id === 'builder' && (activeTab === 'exam' || activeTab === 'notes_generator')) {
                        setActiveTab('text');
                      }
                    }
                  }}
                  className={`arcade-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-300 text-slate-950 shadow-sm border-b-2 border-amber-600'
                      : 'text-white hover:bg-white/15'
                  }`}
                >
                  <span>{view.emoji}</span>
                  <span>{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1-Click Instant Play Arcade Strip */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/25 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-300 mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>1-Click Play:</span>
          </span>
          {QUICK_STARTER_TOPICS.slice(0, 5).map((topic) => (
            <button
              key={topic.label}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('text');
                setInputText(topic.prompt);
                setValidationWarning(null);
                setErrorMessage(null);
                handleGenerateQuiz(topic.prompt);
              }}
              className="arcade-btn px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-300 text-slate-900 hover:text-slate-950 border-b-3 border-slate-300 hover:border-amber-600 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title={`Launch instant quiz on ${topic.label}`}
            >
              <span>{topic.icon}</span>
              <span>{topic.label}</span>
              <span className="text-[10px] text-indigo-600 font-black">▶</span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="arcade-btn ml-auto px-4 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 border-b-3 border-amber-600 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>🎲</span>
            <span>Surprise Me!</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3 shadow-xs">
          <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-100 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 3: Dedicated Personalized Recommendations View */}
      {studioSection === 'recommended' && (
        <RecommendedQuizzesSection
          persona={persona}
          stats={stats}
          historyRecords={historyRecords}
          onStartQuiz={onStartQuiz}
          onCustomizeTopic={handleCustomizeTopic}
          onOpenTutor={onOpenTutor}
        />
      )}

      {/* VIEW 2: Dedicated Saved Quiz Decks View */}
      {studioSection === 'tracks' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Saved &amp; Community Quiz Decks</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                  {customQuizzes.length} Decks
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Launch any saved quiz deck immediately or create a new AI quiz in the Studio Builder.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setStudioSection('builder');
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer self-start sm:self-center"
            >
              ← Back to Studio Builder
            </button>
          </div>

          {customQuizzes.length === 0 ? (
            <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                No quizzes available
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                There are no saved quizzes in your database yet. Create a new AI quiz from any topic or upload a quiz file to get started!
              </p>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setStudioSection('builder');
                  setActiveTab('text');
                }}
                className="arcade-btn px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black cursor-pointer shadow-sm"
              >
                + Create Your First Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customQuizzes.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border-2 border-b-4 border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/50 hover:border-indigo-400 transition-all text-left flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 pt-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {q.difficulty} · {q.questions.length} Qs
                      </span>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                        By {q.creatorName || 'Scholar'}
                      </span>
                    </div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {q.quiz_title}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {q.summary}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onStartQuiz({
                          app_name: 'Quiz Me!',
                          persona: q.persona || persona,
                          quiz_title: q.quiz_title,
                          summary: q.summary,
                          difficulty: q.difficulty,
                          questions: q.questions,
                          study_guide: q.study_guide,
                          tags: q.tags,
                        });
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Play Quiz Deck</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 1: Modern Quiz Lounge & Bento Game Hub */}
      {studioSection === 'builder' && (
        <div className="space-y-6">
          {/* ZONE A: CENTER-STAGE SPOTLIGHT QUIZ LAUNCHER OMNIBOX */}
          <div
            id="creation-card-main"
            className="animate-24fps-deal delay-24fps-1 comic-pop-card rounded-3xl border-2 border-b-[6px] border-indigo-300 dark:border-indigo-800 border-b-indigo-600 dark:border-b-indigo-500 bg-white dark:bg-slate-900 overflow-hidden transition-colors"
          >
            {/* Tactile Source Mode Switcher Bar with Diagonal Comic Speed Stripes */}
            <div className="pattern-speed-stripes flex flex-wrap items-center justify-between border-b-2 border-slate-200/90 dark:border-slate-800 px-4 py-3 gap-2 bg-indigo-50/50 dark:bg-slate-950/80">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  { id: 'text', emoji: '✨', label: 'Any Topic' },
                  { id: 'exam', emoji: '🎓', label: 'Exam Mode' },
                  { id: 'notes_generator', emoji: '📝', label: 'Notes Generator' },
                  { id: 'presets', emoji: '🎯', label: 'Starter Decks' },
                  { id: 'file', emoji: '📄', label: 'Upload PDF / Doc' },
                  { id: 'audio', emoji: '🎙️', label: 'Voice Prompt' },
                  { id: 'url', emoji: '🎬', label: 'YouTube / Web' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      id={`tab-select-${tab.id}`}
                      onClick={() => {
                        soundFx.playClick();
                        setActiveTab(tab.id as 'presets' | 'text' | 'file' | 'audio' | 'url' | 'exam' | 'notes_generator');
                        if (tab.id === 'exam' && onUpdateAssessmentConfig) {
                          onUpdateAssessmentConfig({
                            mode: 'exam',
                            examFormat: selectedExamFormat,
                          });
                        }
                      }}
                      className={`arcade-btn px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        isActive
                          ? tab.id === 'exam'
                            ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm border-b-2 border-rose-950'
                            : tab.id === 'notes_generator'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-b-2 border-emerald-950'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm border-b-2 border-indigo-950'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{tab.emoji}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                { ALL_AGES_EXPERIENCE_MODES.slice(0, 3).map((m) => {
                  const isPicked = targetAudience === m.audience && difficulty === m.diff;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setTargetAudience(m.audience);
                        setDifficulty(m.diff);
                        setActiveTab('text');
                        if (!inputText.trim()) setInputText(m.prompt);
                      }}
                      className={`hidden md:inline-flex arcade-btn px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap border ${
                        isPicked
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
                {onOpenUploadQuiz && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onOpenUploadQuiz();
                    }}
                    className="arcade-btn px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-violet-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    title="Import a saved Quiz JSON or text file"
                  >
                    📂 Import
                  </button>
                )}
              </div>
            </div>

            {/* Spotlight Body */}
            <div className="p-5 sm:p-6">
              {/* Tab 1: Saved & Community Quizzes */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Saved &amp; Community Quizzes</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                          {customQuizzes.length} Available
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pick any saved quiz deck below to start right away.
                      </p>
                    </div>
                  </div>

                  {customQuizzes.length === 0 ? (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-center space-y-2.5">
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        No quizzes available
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        No saved quizzes are currently in the database. Switch to "Any Topic" to generate an AI quiz in seconds!
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setActiveTab('text');
                        }}
                        className="arcade-btn px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black cursor-pointer"
                      >
                        ✨ Generate a Quiz Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {customQuizzes.slice(0, 8).map((q) => (
                        <div
                          key={q.id}
                          onClick={() => {
                            soundFx.playClick();
                            onStartQuiz({
                              app_name: 'Quiz Me!',
                              persona: q.persona || persona,
                              quiz_title: q.quiz_title,
                              summary: q.summary,
                              difficulty: q.difficulty,
                              questions: q.questions,
                              study_guide: q.study_guide,
                              tags: q.tags,
                            });
                          }}
                          className="p-4 rounded-2xl border-2 border-b-4 border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/50 hover:border-indigo-400 transition-all text-left cursor-pointer relative flex flex-col justify-between overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5 pt-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                              <span>{q.difficulty}</span>
                              <span>⚡ {q.questions.length} Qs</span>
                            </div>
                            <div className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                              {q.quiz_title}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {q.summary}
                            </p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                            <span className="w-full py-1.5 px-2 rounded-xl bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center gap-1">
                              <Zap className="w-3 h-3 text-amber-300" />
                              <span>Play Now</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Official Exam Mode (Checkpoint, WAEC, JAMB, NECO, IGCSE, SAT, AP/IB) */}
              {activeTab === 'exam' && (
                <div className="space-y-4">
                  {/* Exam Mode Header & Strict vs Guided Toggle */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-slate-950">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                          🎓 OFFICIAL EXAM MODE &amp; CBT SIMULATOR
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-300 text-[11px] font-bold">
                          {activeExamSpec.badgeEmoji} {activeExamSpec.shortName} • {activeExamSpec.gradingScaleLabel}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black tracking-tight">
                        Choose Your Examination Board Format (Checkpoint, WAEC, JAMB, NECO, IGCSE, SAT, AP/IB)
                      </h3>
                      <p className="text-xs text-indigo-200">
                        Automatically configures authentic question styles, command words, paper structure, timers, and official board grading scales.
                      </p>
                    </div>

                    {/* Feedback Timing Switcher & Past Papers Hub Link for Exam Mode */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            onNavigateTab('past_papers');
                          }}
                          className="arcade-btn px-3.5 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <span>📚</span>
                          <span>Download Past Papers &amp; Textbooks</span>
                        </button>
                      )}
                      <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-white/15">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playSelect();
                            onUpdateAssessmentConfig?.({
                              mode: 'exam',
                              feedbackTiming: 'deferred',
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            assessmentConfig.feedbackTiming === 'deferred'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-slate-300 hover:text-white'
                          }`}
                          title="Withholds answers and mark scheme until you submit the entire exam paper"
                        >
                          📋 Strict Proctored Exam
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playSelect();
                            onUpdateAssessmentConfig?.({
                              mode: 'exam',
                              feedbackTiming: 'instant',
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            assessmentConfig.feedbackTiming === 'instant'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-300 hover:text-white'
                          }`}
                          title="Shows official mark scheme explanation after each question"
                        >
                          💡 Guided Past-Paper Drill
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Standardized Exam Format Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {EXAM_FORMAT_CATALOG.map((fmt) => {
                      const isPicked = selectedExamFormat === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => handleSelectExamFormat(fmt.id)}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
                            isPicked
                              ? 'border-indigo-600 dark:border-amber-400 bg-indigo-50/90 dark:bg-indigo-950/70 shadow-md ring-2 ring-indigo-500/25'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-indigo-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <span className="text-lg">{fmt.badgeEmoji}</span>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                  isPicked
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {fmt.regionTag}
                              </span>
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {fmt.shortName}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                              {fmt.description}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[10px] font-extrabold text-indigo-700 dark:text-amber-300">
                            <span className="truncate">{fmt.gradingScaleLabel}</span>
                            {isPicked && <span className="shrink-0 ml-1">✓ ACTIVE</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Exam Format Blueprint & Instant Launch / Custom Topic Generator */}
                  <div className="p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-slate-900/90 space-y-3.5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {activeExamSpec.badgeEmoji} {activeExamSpec.fullName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 text-[11px] font-black border border-slate-950">
                            {activeExamSpec.paperStructure}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          <strong>Official Grading Scale:</strong> {activeExamSpec.gradingScaleLabel} ·{' '}
                          <strong>Default Time:</strong> {activeExamSpec.defaultTimeMinutes} mins ·{' '}
                          <strong>Pass Mark:</strong> {activeExamSpec.defaultPassingScore}%
                        </p>
                      </div>

                      {/* 1-Click Instant Official Mock Paper Launch */}
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playComplete();
                          onUpdateAssessmentConfig?.({
                            mode: 'exam',
                            examFormat: selectedExamFormat,
                            timeLimitMinutes: activeExamSpec.defaultTimeMinutes,
                            passingScorePercent: activeExamSpec.defaultPassingScore,
                          });
                          onStartQuiz(buildPrebuiltExamByFormat(selectedExamFormat, persona));
                        }}
                        className="arcade-btn px-4 py-2.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-slate-950 font-black text-xs shadow-sm cursor-pointer flex items-center gap-2 shrink-0 self-start lg:self-center"
                      >
                        <span>⚡ Launch Instant {activeExamSpec.shortName} Mock Paper</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Custom Exam Subject / Syllabus Topic Input */}
                    <div className="flex flex-col lg:flex-row gap-2.5 items-stretch">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => {
                          setInputText(e.target.value);
                          if (validationWarning) setValidationWarning(null);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder={`Enter any subject or syllabus topic for your ${activeExamSpec.shortName} exam (e.g., ${activeExamSpec.sampleTopics[0]})...`}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          onUpdateAssessmentConfig?.({
                            mode: 'exam',
                            examFormat: selectedExamFormat,
                          });
                          handleGenerateQuiz();
                        }}
                        className="arcade-btn px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs border-2 border-indigo-800 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                      >
                        <span>
                          {isLoading
                            ? generationStep || `Building ${activeExamSpec.shortName} Exam...`
                            : `✨ Generate AI ${activeExamSpec.shortName} Paper (${questionCount} Qs)`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 1-Click Syllabus Sample Topics for Selected Exam Board */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mr-1">
                        {activeExamSpec.shortName} Past-Paper Topics:
                      </span>
                      {activeExamSpec.sampleTopics.map((sample) => (
                        <button
                          key={sample}
                          type="button"
                          onClick={() => {
                            soundFx.playSelect();
                            setInputText(sample);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
                        >
                          {activeExamSpec.badgeEmoji} {sample}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Spotlight Topic Input + Instant Launch Bar */}
              {activeTab === 'text' && (
                <div className="space-y-3">
                  <div className="flex flex-col lg:flex-row gap-3 items-stretch">
                    <div className="flex-1 relative">
                      <textarea
                        id="notes-input"
                        rows={2}
                        maxLength={5000}
                        value={inputText}
                        onChange={(e) => {
                          setInputText(e.target.value.slice(0, 5000));
                          if (validationWarning) setValidationWarning(null);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="What do you want to play today? Type any topic or paste study notes (e.g., Solar System, Anime Trivia, World War II, Python Loops)..."
                        className={`w-full h-full min-h-[76px] p-4 rounded-2xl border-2 text-sm sm:text-base font-medium transition-all focus:outline-none focus:ring-2 ${
                          isInputShaking
                            ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-500 animate-shake'
                            : 'border-indigo-200/90 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500/30'
                        }`}
                      />
                      {inputText.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setInputText('');
                          }}
                          className="absolute right-3 bottom-2.5 text-[11px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-md"
                        >
                          Clear ({inputText.length}/5,000)
                        </button>
                      )}
                    </div>

                    {/* Integrated Primary Launch Button right next to Spotlight Input */}
                    <button
                      type="button"
                      id="generate-quiz-btn"
                      disabled={isLoading}
                      onClick={() => handleGenerateQuiz()}
                      className="arcade-btn lg:w-64 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-2 border-emerald-700 border-b-[5px] border-b-emerald-900 text-white font-black text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer group disabled:opacity-50 shrink-0"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2.5 text-white">
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                          <span className="font-black text-xs sm:text-sm truncate">
                            {generationStep || 'Building Quiz...'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="w-9 h-9 rounded-xl bg-amber-300 text-slate-950 flex items-center justify-center text-lg shadow-xs shrink-0">
                            🚀
                          </span>
                          <div className="text-left">
                            <span className="block tracking-tight font-black leading-none text-white">
                              PLAY QUIZ NOW
                            </span>
                            <span className="block text-[11px] font-bold text-emerald-100 mt-1">
                              Ctrl + Enter · {questionCount} Qs
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform ml-auto" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Starter Topic Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Popular ideas:</span>
                    </span>
                    {QUICK_STARTER_TOPICS.map((topic) => (
                      <button
                        key={topic.label}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setInputText(topic.prompt);
                          setValidationWarning(null);
                          setErrorMessage(null);
                        }}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 transition-all cursor-pointer"
                      >
                        {topic.icon} {topic.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

          {/* Tab 3: Upload Files */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Upload PDF, Markdown Notes, Document, or Audio File
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  AI will analyze the ingested document structure and generate high-yield recall items.
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,.json,.png,.jpg,.jpeg,.doc,.docx,.webm,.mp3,.wav,.ogg,.m4a"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Click to select files or drop here
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Supports PDF, Audio (.mp3, .wav, .webm), Markdown, TXT, DOCX, Images (up to 25MB)
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Attached Files ({uploadedFiles.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uploadedFiles.map((f, i) => {
                      const isAudio = f.mimeType.startsWith('audio/') || f.name.endsWith('.webm') || f.name.endsWith('.mp3') || f.name.endsWith('.wav');
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isAudio ? (
                              <Mic className="w-4 h-4 text-rose-500 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                            )}
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {f.name}
                            </span>
                            <span className="text-slate-400 shrink-0">
                              ({Math.round(f.size / 1024)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Record Audio */}
          {activeTab === 'audio' && (
            <AudioRecorderStudio
              onAudioRecorded={handleAudioRecorded}
              onGenerateDirectly={handleDirectAudioGeneration}
              isLoading={isLoading}
            />
          )}

          {/* Tab 5: Video or Web Link */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label htmlFor="video-url" className="block text-sm font-extrabold text-slate-900 dark:text-white">
                Paste YouTube Video, Documentation, or Web Link
              </label>
              <div className="relative">
                <input
                  id="video-url"
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://en.wikipedia.org/wiki/..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Link2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI will extract key concepts and timestamps from the link to synthesize targeted questions.
              </p>
            </div>
          )}

          {/* Tab 6: AI Study Notes Generator */}
          {activeTab === 'notes_generator' && (
            <div className="space-y-4">
              {inlineGeneratedNote ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      ✨ Generated Interactive Study Guide
                    </span>
                    <button
                      type="button"
                      onClick={() => setInlineGeneratedNote(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                    >
                      ← Generate Another Note
                    </button>
                  </div>
                  <IntelligentNotesViewer
                    note={inlineGeneratedNote}
                    onClose={() => setInlineGeneratedNote(null)}
                    onLaunchPracticeQuiz={(topic) => {
                      setInlineGeneratedNote(null);
                      setActiveTab('text');
                      setInputText(topic);
                      handleGenerateQuiz(topic);
                    }}
                  />
                </div>
              ) : (
                <div className="p-5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                        <FileText className="w-3 h-3" />
                        <span>AI Study Notes &amp; Exam Cram Sheet Generator</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        Turn any topic or syllabus into structured revision notes
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Generates key concepts, step-by-step explanations, worked examples, flashcards &amp; embedded mini-quizzes tailored to Checkpoint, WAEC, JAMB, IGCSE, or general study.
                      </p>
                    </div>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          onNavigateTab('notes');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 text-xs font-black text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 self-start"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Open Full Notes Library →</span>
                      </button>
                    )}
                  </div>

                  {/* Exam Format Lens Selector for Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Curriculum / Exam Board Lens:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {EXAM_FORMAT_CATALOG.map((spec) => {
                        const isPicked = selectedExamFormat === spec.id;
                        return (
                          <button
                            key={spec.id}
                            type="button"
                            onClick={() => handleSelectExamFormat(spec.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isPicked
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                            }`}
                          >
                            <span>{spec.badgeEmoji}</span>
                            <span>{spec.shortName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Topic Input for Notes Generator */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Enter Topic, Syllabus Unit, or Paste Lecture Text:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`e.g., Electrolysis & Faraday's Laws, Quadratic Equations, Photosynthesis, Organic Chemistry...`}
                        className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        disabled={isGeneratingNoteInline}
                        onClick={() => handleGenerateInlineStudyNote()}
                        className="arcade-btn px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-black border-2 border-slate-950 shadow-sm cursor-pointer flex items-center justify-center gap-2 shrink-0"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>
                          {isGeneratingNoteInline ? 'Synthesizing Study Notes...' : 'Generate AI Study Notes'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Quick Study Note Topics */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1">
                      Instant Notes:
                    </span>
                    {activeExamSpec.sampleSubjects.map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        disabled={isGeneratingNoteInline}
                        onClick={() => {
                          setInputText(subj);
                          handleGenerateInlineStudyNote(subj);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        📝 {subj}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compact 1-Row Interactive Game Rules Bar with Blueprint Graph Pattern */}
        <div className="pattern-blueprint-grid px-4 sm:px-6 py-3.5 border-t-2 border-slate-200/90 dark:border-slate-800/90 bg-slate-50/90 dark:bg-slate-950/70">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Quick Question Count Pills + Custom 1-100 Input */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-0.5">
                Questions:
              </span>
              {[5, 10, 15, 25, 50, 75, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setQuestionCount(num);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer tabular-nums ${
                    questionCount === num
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {num}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={100}
                value={questionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!Number.isNaN(val)) {
                    setQuestionCount(Math.max(1, Math.min(100, val)));
                  }
                }}
                title="Custom question count (1 to 100)"
                aria-label="Custom question count (1 to 100)"
                className="w-14 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-extrabold text-center text-indigo-700 dark:text-indigo-300 tabular-nums focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick AI Intelligence Scope Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-0.5">
                AI Scope:
              </span>
              <select
                value={intelligenceScope}
                onChange={(e) => {
                  soundFx.playSelect();
                  setIntelligenceScope(e.target.value);
                }}
                aria-label="AI Intelligence and Curriculum Scope"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="omniscient_synthesis">🧠 Omniscient Synthesis (Full Scope)</option>
                <option value="deep_first_principles">🔬 Deep First Principles &amp; Why/How</option>
                <option value="exam_olympiad_rigor">🏆 Board Exam &amp; Olympiad Rigor</option>
                <option value="source_faithful">📌 Strict Source-Locked Extraction</option>
                <option value="cross_disciplinary">🌐 Cross-Disciplinary Systems</option>
              </select>
            </div>

            {/* Quick Difficulty Pills */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-0.5">
                Difficulty:
              </span>
              {(['Beginner', 'Intermediate', 'Master'] as DifficultyType[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setDifficulty(lvl);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-violet-600 border-violet-700 text-white shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-violet-400'
                  }`}
                >
                  {lvl === 'Beginner' ? 'Easy' : lvl === 'Intermediate' ? 'Medium' : 'Master'}
                </button>
              ))}
            </div>

            {/* Quick Timer Toggle Pills */}
            <div className="hidden xl:flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-0.5">
                Pace:
              </span>
              {[
                { id: 'untimed', label: '∞ Relaxed', min: 0, max: 0 },
                { id: 'blitz_1_3', label: '⚡ 1–3m', min: 1, max: 3 },
                { id: 'standard_3_10', label: '🎯 3–10m', min: 3, max: 10 },
              ].map((tr) => {
                const isActive =
                  tr.id === 'untimed'
                    ? !assessmentConfig.timerRangeEnabled && assessmentConfig.timeLimitMinutes === 0
                    : assessmentConfig.timerRangeEnabled &&
                      assessmentConfig.minTimeMinutes === tr.min &&
                      assessmentConfig.maxTimeMinutes === tr.max;
                return (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      if (!onUpdateAssessmentConfig) return;
                      if (tr.id === 'untimed') {
                        onUpdateAssessmentConfig({
                          timerRangeEnabled: false,
                          timeLimitMinutes: 0,
                          timerRangePreset: 'untimed',
                        });
                      } else {
                        onUpdateAssessmentConfig({
                          timerRangeEnabled: true,
                          minTimeMinutes: tr.min,
                          maxTimeMinutes: tr.max,
                          timeLimitMinutes: tr.max,
                          timerRangePreset: tr.id as any,
                        });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    {tr.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Exam Mode & Format Selector Pills in Rules Bar */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  const nextIsExam = assessmentConfig.mode !== 'exam';
                  onUpdateAssessmentConfig?.({
                    mode: nextIsExam ? 'exam' : 'practice',
                    examFormat: selectedExamFormat,
                  });
                  if (nextIsExam) {
                    setActiveTab('exam');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                  assessmentConfig.mode === 'exam'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:border-rose-400'
                }`}
                title="Switch between Practice Mode and Standardized Exam Mode (Checkpoint, WAEC, JAMB, IGCSE, SAT)"
              >
                🎓 {assessmentConfig.mode === 'exam' ? `Exam: ${activeExamSpec.shortName}` : 'Exam Mode'}
              </button>

              {(['checkpoint', 'waec', 'jamb', 'igcse'] as ExamFormatId[]).map((fmtId) => {
                const spec = getExamFormatSpec(fmtId);
                const isSelectedFmt =
                  assessmentConfig.mode === 'exam' && selectedExamFormat === fmtId;
                return (
                  <button
                    key={fmtId}
                    type="button"
                    onClick={() => {
                      handleSelectExamFormat(fmtId);
                      setActiveTab('exam');
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer ${
                      isSelectedFmt
                        ? 'bg-amber-300 text-slate-950 border-slate-950 shadow-2xs font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                    title={`Launch or configure ${spec.fullName}`}
                  >
                    {spec.badgeEmoji} {spec.shortName.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Interleaved Mix & Optional Speed Round Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  if (onUpdateAssessmentConfig) {
                    onUpdateAssessmentConfig({
                      interleavedMode: !assessmentConfig.interleavedMode,
                      adaptiveDifficulty: true,
                    });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                  assessmentConfig.interleavedMode
                    ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:border-teal-400'
                }`}
                title="Mixes questions from different topics and adapts difficulty to keep accuracy around 70-80%"
              >
                🧬 {assessmentConfig.interleavedMode ? 'Interleaved Mix: ON' : 'Interleave Topics'}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  if (onUpdateAssessmentConfig) {
                    onUpdateAssessmentConfig({
                      interleavedMode: true,
                      adaptiveDifficulty: true,
                    });
                  }
                  onStartQuiz(buildInterleavedMixQuiz(persona));
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-black border-2 border-slate-950 bg-amber-300 hover:bg-amber-200 text-slate-950 transition-all cursor-pointer shadow-2xs"
                title="Launch an instant Interleaved Multi-Topic Mix session with 70-80% Adaptive Difficulty"
              >
                🚀 Play Multi-Topic Mix
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  if (onUpdateAssessmentConfig) {
                    const nextSpeed = !assessmentConfig.speedRoundMode;
                    onUpdateAssessmentConfig({
                      speedRoundMode: nextSpeed,
                      challengeMode: nextSpeed,
                    });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                  assessmentConfig.speedRoundMode || assessmentConfig.challengeMode
                    ? 'bg-orange-500 text-white border-orange-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                }`}
                title="Optional Speed Round timer — kept separate so it never affects your mastery levels"
              >
                ⚡ {assessmentConfig.speedRoundMode || assessmentConfig.challengeMode ? 'Speed Round: ON' : 'Optional Speed Round'}
              </button>
            </div>

            {/* Language Picker + Customize Drawer Button */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsLangPickerOpen(!isLangPickerOpen);
                  }}
                  className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:border-indigo-400 transition-colors cursor-pointer text-xs font-bold"
                >
                  <span>{selectedLanguage.flag}</span>
                  <span className="max-w-[85px] truncate">{selectedLanguage.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isLangPickerOpen && (
                  <div className="absolute bottom-full right-0 mb-1 w-56 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 max-h-60 flex flex-col">
                    <div className="relative mb-1.5">
                      <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search language..."
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 focus:ring-1 focus:ring-indigo-500 outline-none"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto space-y-0.5 pr-0.5">
                      {SUPPORTED_LANGUAGES.filter((l) => {
                        const q = langSearch.toLowerCase().trim();
                        if (!q) return true;
                        return (
                          l.name.toLowerCase().includes(q) ||
                          l.nativeName.toLowerCase().includes(q) ||
                          l.code.toLowerCase().includes(q)
                        );
                      }).map((lang) => {
                        const isSelected = lang.code === selectedLanguage.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              soundFx.playSelect();
                              setSelectedLanguage(lang);
                              setIsLangPickerOpen(false);
                              setLangSearch('');
                            }}
                            className={`w-full p-2 rounded-lg flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span>{lang.flag}</span>
                              <span className="truncate">{lang.name}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowAdvancedPrompter(!showAdvancedPrompter);
                }}
                className="px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showAdvancedPrompter ? 'Hide Rules' : 'More Rules'}</span>
                {showAdvancedPrompter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>

            {/* Expanded Prompter & Formats Drawer */}
            {showAdvancedPrompter && (
              <div className="mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-900/50 space-y-4">
                {/* Question Formats Checkbox Row */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Cognitive Formats Included
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'multiple_choice' as QuestionType, label: 'Multiple Choice (MCQ)' },
                      { id: 'fill_in_blank' as QuestionType, label: 'Fill in the Blank' },
                      { id: 'open_explanation' as QuestionType, label: 'Short Conceptual Explanation' },
                      { id: 'code_media_challenge' as QuestionType, label: 'Code & Media Tasks' },
                    ].map((t) => {
                      const isSelected = selectedQuestionTypes.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleQuestionType(t.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 shadow-2xs font-extrabold'
                              : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Modifier Chips */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    One-Click Pedagogical Lenses
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_MODIFIERS.map((mod, i) => {
                      const isActive = customInstructions.includes(mod.text);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleApplyModifier(mod.text)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                            isActive
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                              : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600'
                          }`}
                        >
                          <span>{mod.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Participant Allowed Tools: Calculator & Dictionary */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                    Allowed Participant Study Tools:
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calculatorEnabled}
                        onChange={(e) => setCalculatorEnabled(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>🧮 Enable Scientific Calculator</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dictionaryEnabled}
                        onChange={(e) => setDictionaryEnabled(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>📖 Enable Academic Dictionary</span>
                    </label>
                  </div>
                </div>

                {/* Custom Directives Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Custom AI Prompter Directives (High Priority Instruction)</span>
                    </label>
                    {customInstructions && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setCustomInstructions('');
                        }}
                        className="text-[11px] text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        Clear Directives
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="E.g. Emphasize counter-intuitive edge cases, frame questions with clinical/workplace vignettes, require TypeScript strict mode for code questions, include memorable mnemonic hooks..."
                    className="w-full p-3 rounded-xl border border-indigo-200/80 dark:border-indigo-900/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Prompter Style */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Prompter Pedagogical Style
                    </label>
                    <select
                      value={promptStyle}
                      onChange={(e) => {
                        soundFx.playSelect();
                        setPromptStyle(e.target.value);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Standard">Standard Balanced Assessment</option>
                      <option value="Exam Cram & High-Yield">Exam Cram & High-Yield (Board/Test Focus)</option>
                      <option value="Deep First Principles">Deep Conceptual (First Principles & Derivations)</option>
                      <option value="Scenario & Case Study">Scenario & Case Study Vignettes</option>
                      <option value="Rapid Recall & Speed Drill">Rapid Recall & Speed Drill</option>
                      <option value="Code & Debugging Challenges">Code & Technical Debugging Focus</option>
                      <option value="Socratic Paradoxes & Misconceptions">Socratic Misconceptions & Edge Cases</option>
                    </select>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Target Audience / Academic Level
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => {
                        soundFx.playSelect();
                        setTargetAudience(e.target.value);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="All Ages / Family Fun">🌟 All Ages / Family Fun</option>
                      <option value="Junior Explorers (Ages 6-10)">🧒 Junior Explorers (Ages 6-10)</option>
                      <option value="Middle School (Ages 11-14)">🎒 Middle School (Ages 11-14)</option>
                      <option value="High School (Ages 14-18)">🎓 High School (Ages 14-18)</option>
                      <option value="AP & Honors College Prep">🏆 AP & Honors Prep</option>
                      <option value="College Undergraduate">🏛️ College Undergraduate</option>
                      <option value="Graduate & Professional">⚡ Graduate & Board Certification</option>
                      <option value="Industry Practitioner">💼 Industry Senior Practitioner</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Focus Subtopics */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Specific Sub-Topics to Emphasize (Optional)
                    </label>
                    <input
                      type="text"
                      value={focusSubtopics}
                      onChange={(e) => setFocusSubtopics(e.target.value)}
                      placeholder="e.g. Mitochondria only, omit historical dates, focus on Act 2"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Creativity / Temperature Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Creativity & Lateral Thinking: {creativityLevel}
                      </label>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                        {creativityLevel <= 0.3 ? 'Precise & Literal' : creativityLevel <= 0.7 ? 'Balanced Pedagogy' : 'Creative & Broad'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.1"
                      value={creativityLevel}
                      onChange={(e) => setCreativityLevel(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation Warning Banner */}
          {validationWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-sm shadow-xs animate-shake">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs sm:text-sm">{validationWarning}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Pick any starter topic below to generate your assessment right away:
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setValidationWarning(null)}
                  className="p-1 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300 transition-colors"
                  title="Dismiss warning"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-800/60">
                {QUICK_STARTER_TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setInputText(topic.prompt);
                      setActiveTab('text');
                      setValidationWarning(null);
                      setErrorMessage(null);
                      handleGenerateQuiz(topic.prompt);
                    }}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{topic.icon}</span>
                    <span>{topic.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Button when non-text tab is active */}
          {activeTab !== 'text' && (
            <div className="pt-1">
              <button
                type="button"
                id="generate-quiz-btn"
                disabled={isLoading}
                onClick={() => handleGenerateQuiz()}
                className="arcade-btn w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-700 border-b-[5px] border-b-emerald-900 text-white font-black text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-between cursor-pointer group disabled:opacity-50"
              >
                <span>{isLoading ? generationStep || 'Building Your Quiz Game...' : '🚀 LAUNCH QUIZ GAME!'}</span>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

          {/* ZONE B: EXPLORE QUIZ WORLDS — 6 ILLUSTRATED BENTO CATEGORY PORTALS */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>🌍 Explore Interactive Quiz Worlds</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pick any themed world below to jump straight into a 24fps interactive quiz run
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setStudioSection('tracks');
                }}
                className="arcade-btn px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold hover:border-indigo-400 cursor-pointer self-start sm:self-center shadow-2xs"
              >
                Browse Saved Decks ({customQuizzes.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'world-space',
                  issue: 'WORLD #01',
                  title: 'Cosmic & Space Odyssey',
                  subtitle: 'Black holes, exoplanets, orbital physics & NASA missions',
                  category: 'Science & Space',
                  xp: '+120 XP',
                  patternClass: 'pattern-halftone',
                  topBar: 'bg-indigo-600',
                  borderClass: 'border-indigo-300 dark:border-indigo-800 border-b-indigo-600 dark:border-b-indigo-500',
                  iconBg: 'bg-indigo-600 text-white border-b-3 border-indigo-900',
                  pillClass: 'bg-indigo-100 dark:bg-indigo-950/90 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
                  btnClass: 'bg-indigo-600 hover:bg-indigo-500 text-white border-b-3 border-indigo-900',
                  prompt: 'Solar System, Black Holes, Exoplanets, and Space Exploration Trivia',
                  emoji: '🌌',
                },
                {
                  id: 'world-bio',
                  issue: 'WORLD #02',
                  title: 'Life Lab & Human Body',
                  subtitle: 'DNA genetics, cellular powerhouses, brain & ecosystems',
                  category: 'Biology & Med',
                  xp: '+110 XP',
                  patternClass: 'pattern-blueprint-grid',
                  topBar: 'bg-emerald-600',
                  borderClass: 'border-emerald-300 dark:border-emerald-800 border-b-emerald-600 dark:border-b-emerald-500',
                  iconBg: 'bg-emerald-600 text-white border-b-3 border-emerald-900',
                  pillClass: 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
                  btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white border-b-3 border-emerald-900',
                  prompt: 'Human Anatomy, Genetics, Cellular Biology, and Neuroscience Quiz',
                  emoji: '🧬',
                },
                {
                  id: 'world-history',
                  issue: 'WORLD #03',
                  title: 'Ancient Empires & History',
                  subtitle: 'Rome, Egypt, revolutions, inventions & turning points',
                  category: 'World History',
                  xp: '+115 XP',
                  patternClass: 'pattern-stripes-amber',
                  topBar: 'bg-amber-500',
                  borderClass: 'border-amber-300 dark:border-amber-800 border-b-amber-500 dark:border-b-amber-600',
                  iconBg: 'bg-amber-400 text-slate-950 border-b-3 border-amber-700',
                  pillClass: 'bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700',
                  btnClass: 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-b-3 border-amber-700',
                  prompt: 'Ancient Civilizations, Roman Empire, World Wonders, and Modern History',
                  emoji: '🏛️',
                },
                {
                  id: 'world-code',
                  issue: 'WORLD #04',
                  title: 'Code, AI & Cyber Arena',
                  subtitle: 'Python, JavaScript, algorithms, AI models & tech history',
                  category: 'Tech & Coding',
                  xp: '+130 XP',
                  patternClass: 'pattern-circuit-blue',
                  topBar: 'bg-blue-600',
                  borderClass: 'border-blue-300 dark:border-blue-800 border-b-blue-600 dark:border-b-blue-500',
                  iconBg: 'bg-blue-600 text-white border-b-3 border-blue-900',
                  pillClass: 'bg-blue-100 dark:bg-blue-950/90 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
                  btnClass: 'bg-blue-600 hover:bg-blue-500 text-white border-b-3 border-blue-900',
                  prompt: 'Python Programming, JavaScript Fundamentals, Algorithms, and Modern AI',
                  emoji: '💻',
                },
                {
                  id: 'world-pop',
                  issue: 'WORLD #05',
                  title: 'Pop Culture, Cinema & Gaming',
                  subtitle: 'Blockbuster movies, gaming legends, anime & music hits',
                  category: 'Pop & Entertainment',
                  xp: '+100 XP',
                  patternClass: 'pattern-polka-pop',
                  topBar: 'bg-rose-600',
                  borderClass: 'border-rose-300 dark:border-rose-800 border-b-rose-600 dark:border-b-rose-500',
                  iconBg: 'bg-rose-600 text-white border-b-3 border-rose-900',
                  pillClass: 'bg-rose-100 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
                  btnClass: 'bg-rose-600 hover:bg-rose-500 text-white border-b-3 border-rose-900',
                  prompt: 'Iconic Movies, Video Game History, Anime Classics, and Music Trivia',
                  emoji: '🎮',
                },
                {
                  id: 'world-logic',
                  issue: 'WORLD #06',
                  title: 'Brain Teasers & Logic Puzzles',
                  subtitle: 'Lateral thinking, math riddles, paradoxes & pattern IQ',
                  category: 'Logic & Math',
                  xp: '+140 XP',
                  patternClass: 'pattern-diamond-violet',
                  topBar: 'bg-violet-600',
                  borderClass: 'border-violet-300 dark:border-violet-800 border-b-violet-600 dark:border-b-violet-500',
                  iconBg: 'bg-violet-600 text-white border-b-3 border-violet-900',
                  pillClass: 'bg-violet-100 dark:bg-violet-950/90 text-violet-800 dark:text-violet-200 border-violet-300 dark:border-violet-700',
                  btnClass: 'bg-violet-600 hover:bg-violet-500 text-white border-b-3 border-violet-900',
                  prompt: 'Brain Teasers, Logic Paradoxes, Probability Puzzles, and Mental Math',
                  emoji: '🧠',
                },
              ].map((world, idx) => (
                <div
                  key={world.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab('text');
                    setInputText(world.prompt);
                    setValidationWarning(null);
                    setErrorMessage(null);
                    handleGenerateQuiz(world.prompt);
                  }}
                  className={`arcade-card comic-pop-card ${world.patternClass} animate-24fps-deal delay-24fps-${(idx % 4) + 1} group relative rounded-3xl p-5 bg-white dark:bg-slate-900 border-2 border-b-[6px] ${world.borderClass} overflow-hidden cursor-pointer flex flex-col justify-between min-h-[178px]`}
                >
                  {/* Vibrant Top Official Color Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-2.5 ${world.topBar}`} />

                  <div className="relative z-10 flex items-center justify-between gap-2 pt-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-slate-800 text-amber-300 text-[10px] font-mono font-black tracking-wider">
                        {world.issue}
                      </span>
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-xl border ${world.pillClass}`}>
                        {world.category} · {world.xp}
                      </span>
                    </div>
                    <span className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs animate-24fps-float ${world.iconBg}`}>
                      {world.emoji}
                    </span>
                  </div>

                  <div className="relative z-10 my-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl p-1.5 -mx-1.5">
                    <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug text-slate-900 dark:text-white">
                      {world.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                      {world.subtitle}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200/80 dark:border-slate-800">
                    <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-lg">
                      {questionCount} Questions · {difficulty}
                    </span>
                    <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black shadow-2xs transition-transform group-hover:scale-105 ${world.btnClass}`}>
                      Play World ▶
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ZONE C: 3-COLUMN INTERACTIVE ARCADE LOUNGE ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Column 1 (5 Cols): Playable Daily Trivia Blitz with Comic Halftone Pattern */}
            <div className="lg:col-span-5 comic-pop-card pattern-halftone animate-24fps-deal delay-24fps-1 rounded-3xl p-5 border-2 border-b-[6px] border-violet-300 dark:border-violet-800 border-b-violet-600 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-violet-600" />

              <div className="space-y-3">
                <div className="flex items-center justify-between pt-1 text-xs font-extrabold">
                  <span className="px-2.5 py-1 rounded-lg bg-violet-600 text-white font-black">
                    🎯 Daily Trivia Blitz #{currentMiniTrivia.id}
                  </span>
                  <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border border-amber-600 font-black tabular-nums">
                    {miniTriviaSolvedIds.includes(currentMiniTrivia.id)
                      ? '✓ Claimed Today'
                      : `⚡ POW! +15 XP (${Math.min(3, miniTriviaSolvedIds.length)}/3)`}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug bg-white/90 dark:bg-slate-900/90 p-2 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  {currentMiniTrivia.q}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentMiniTrivia.options.map((opt, idx) => {
                    const letter = ['A', 'B', 'C', 'D'][idx % 4];
                    const isPicked = miniTriviaSelected === opt;
                    const isRight = opt === currentMiniTrivia.answer;
                    let btnStyle =
                      'border-2 border-b-4 border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 hover:border-violet-400';
                    if (miniTriviaSelected) {
                      if (isRight) {
                        btnStyle =
                          'border-2 border-b-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-black';
                      } else if (isPicked) {
                        btnStyle =
                          'border-2 border-b-4 border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold';
                      } else {
                        btnStyle = 'opacity-45 border border-slate-200 dark:border-slate-800';
                      }
                    }
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={!!miniTriviaSelected}
                        onClick={() => {
                          setMiniTriviaSelected(opt);
                          if (opt === currentMiniTrivia.answer) {
                            const check = verifyDailyTriviaBlitzXp(currentMiniTrivia.id);
                            soundFx.playCorrect(miniTriviaSolvedIds.length + 1);
                            if (check.allowed && check.xp > 0) {
                              setMiniTriviaSolvedIds(getRewardedTriviaIdsToday());
                              setMiniTriviaNotice(`🎉 +${check.xp} Verified XP & +${check.coins} Coins!`);
                              onUpdateStats?.({
                                xp: (stats.xp || 0) + check.xp,
                                coins: (stats.coins || 0) + check.coins,
                              });
                            } else {
                              setMiniTriviaNotice(
                                check.reason || 'Already claimed today — 0 duplicate XP'
                              );
                            }
                          } else {
                            soundFx.playIncorrect(miniTriviaSolvedIds.length);
                            setMiniTriviaNotice(null);
                          }
                        }}
                        className={`arcade-btn p-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer text-left flex items-center gap-2 ${btnStyle}`}
                      >
                        <span className="w-6 h-6 rounded-lg text-[11px] font-mono font-black flex items-center justify-center shrink-0 bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300">
                          {letter}
                        </span>
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {miniTriviaSelected ? (
                <div className="p-3 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                    <strong className="text-indigo-700 dark:text-indigo-300">
                      {miniTriviaSelected === currentMiniTrivia.answer
                        ? `${miniTriviaNotice || '✓ Correct!'} — `
                        : `💡 ${currentMiniTrivia.answer} — `}
                    </strong>
                    {currentMiniTrivia.fact}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setMiniTriviaSelected(null);
                      setMiniTriviaNotice(null);
                      setMiniTriviaIndex((prev) => prev + 1);
                    }}
                    className="arcade-btn px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shrink-0 cursor-pointer"
                  >
                    Next ▶
                  </button>
                </div>
              ) : (
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Tap any option above for instant XP</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setMiniTriviaIndex((prev) => prev + 1);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Skip Question →
                  </button>
                </div>
              )}
            </div>

            {/* Column 2 (4 Cols): 1-Click Arcade Mini-Games & Modes Portal */}
            <div className="lg:col-span-4 comic-pop-card animate-24fps-deal delay-24fps-2 rounded-3xl p-5 border-2 border-b-[6px] border-slate-300 dark:border-slate-700 border-b-indigo-600 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600" />
              <div>
                <div className="flex items-center justify-between mb-3 pt-1">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      🕹️ Arcade Game Modes
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Switch up how you play &amp; compete
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      label: 'Word-Chain',
                      sub: 'Link words vs AI',
                      emoji: '🔗',
                      tab: 'games',
                      cardStyle: 'pattern-speed-stripes bg-violet-50/90 dark:bg-violet-950/40 border-violet-300 dark:border-violet-800 border-b-violet-600 hover:border-violet-500',
                      badgeStyle: 'bg-violet-600 text-white border-b-2 border-violet-900',
                    },
                    {
                      label: 'Math & Bee',
                      sub: 'Speed & spelling',
                      emoji: '🐝',
                      tab: 'games',
                      cardStyle: 'pattern-stripes-amber bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 border-b-amber-500 hover:border-amber-500',
                      badgeStyle: 'bg-amber-400 text-slate-950 border-b-2 border-amber-700',
                    },
                    {
                      label: 'Live Battle',
                      sub: 'Multiplayer PIN',
                      emoji: '⚔️',
                      tab: 'live',
                      cardStyle: 'pattern-polka-pop bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 border-b-rose-600 hover:border-rose-500',
                      badgeStyle: 'bg-rose-600 text-white border-b-2 border-rose-900',
                    },
                    {
                      label: '3D Flashcards',
                      sub: 'Flip & memorize',
                      emoji: '🃏',
                      tab: 'flashcards',
                      cardStyle: 'pattern-blueprint-grid bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 border-b-emerald-600 hover:border-emerald-500',
                      badgeStyle: 'bg-emerald-600 text-white border-b-2 border-emerald-900',
                    },
                  ].map((mode) => (
                    <button
                      key={mode.label}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onNavigateTab?.(mode.tab);
                      }}
                      className={`arcade-card p-3.5 rounded-2xl border-2 border-b-4 ${mode.cardStyle} text-left flex flex-col justify-between gap-2 cursor-pointer group transition-all`}
                    >
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-2xs ${mode.badgeStyle}`}>
                        {mode.emoji}
                      </span>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {mode.label}
                        </div>
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {mode.sub}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onNavigateTab?.('searcher');
                  }}
                  className="arcade-btn py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 text-xs font-extrabold cursor-pointer text-center"
                >
                  🔍 Quiz Searcher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onNavigateTab?.('notes');
                  }}
                  className="arcade-btn py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 text-xs font-extrabold cursor-pointer text-center"
                >
                  📄 Study &amp; Exam PDF
                </button>
              </div>
            </div>

            {/* Column 3 (3 Cols): Player Rank, Streak Journey & Daily Loot */}
            <div className="lg:col-span-3 comic-pop-card pattern-stripes-amber animate-24fps-deal delay-24fps-3 rounded-3xl p-5 border-2 border-b-[6px] border-amber-300 dark:border-amber-800 border-b-amber-500 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-b-4 border-amber-700 text-slate-950 font-black text-sm flex items-center justify-center shadow-sm">
                      Lv.{currentLevel}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        {lvlInfo.rank.title}
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                        {stats.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                    <span className="animate-24fps-flame">🔥</span> {stats.streak}d
                  </span>
                </div>

                {/* Liquid Shimmer XP Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 rounded-full bg-slate-200/80 dark:bg-slate-800 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 animate-24fps-xp transition-all duration-300"
                      style={{ width: `${Math.max(6, levelProgressPct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>{lvlInfo.xpToNextLevel.toLocaleString()} XP to Lv.{currentLevel + 1}</span>
                    <span>🎯 {accuracyPct}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                {onOpenLevelRoadmap && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onOpenLevelRoadmap();
                    }}
                    className="arcade-btn w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 border-b-2 border-amber-700 text-slate-950 text-xs font-black text-center cursor-pointer shadow-2xs"
                  >
                    {!dailyCheckIn.claimedToday
                      ? `🎁 Claim Day ${dailyCheckIn.dayIndex} Bonus!`
                      : '🏆 Rank Roadmap & Loot'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setStudioSection('recommended');
                  }}
                  className="arcade-btn w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold cursor-pointer"
                >
                  ✨ Personalized For You
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QuizTrack Detail Drawer with AI Key Takeaways Summary Section */}
      <QuizTrackDetailDrawer
        isOpen={!!selectedTrackForDetail}
        onClose={() => setSelectedTrackForDetail(null)}
        track={selectedTrackForDetail}
        persona={persona}
        onStartQuiz={onStartQuiz}
      />
    </div>
  );
};
