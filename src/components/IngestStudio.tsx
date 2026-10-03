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
} from '../types/quiz';
import { PRESET_TOPICS, PresetTopic } from '../data/presets';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { AudioRecorderStudio } from './AudioRecorderStudio';
import { RecommendedQuizzesSection } from './RecommendedQuizzesSection';
import { QuizHistoryRecord } from './HistoryView';
import { QuizTrackDetailDrawer, SelectedTrackInfo } from './QuizTrackDetailDrawer';
import { SUPPORTED_LANGUAGES, SupportedLanguage, getLanguageByCode } from '../data/languages';

interface IngestStudioProps {
  persona: PersonaType;
  onPersonaChange: (p: PersonaType) => void;
  onStartQuiz: (quiz: QuizResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (err: string | null) => void;
  assessmentConfig: AssessmentConfig;
  onOpenRawJsonModal?: (quiz: QuizResponse) => void;
  onOpenUploadQuiz?: () => void;
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
  onOpenUploadQuiz,
  stats = {
    streak: 3,
    hearts: 5,
    maxHearts: 5,
    xp: 320,
    gems: 40,
    level: 2,
    quizzesCompleted: 3,
    totalCorrect: 11,
    totalQuestions: 14,
    badges: [],
  },
  historyRecords = [],
}) => {
  const { currentAccentConfig } = useTheme();
  // Input Tabs: 'presets' | 'text' | 'file' | 'audio' | 'url'
  const [activeTab, setActiveTab] = useState<'presets' | 'text' | 'file' | 'audio' | 'url'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_TOPICS[0].id);
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<SelectedTrackInfo | null>(null);
  const [inputText, setInputText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<IngestFileInput[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [isInputShaking, setIsInputShaking] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  const selectedPreset = PRESET_TOPICS.find((p) => p.id === selectedPresetId) || PRESET_TOPICS[0];

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
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [promptStyle, setPromptStyle] = useState<string>('Standard');
  const [targetAudience, setTargetAudience] = useState<string>('All Ages / Family Fun');
  const [creativityLevel, setCreativityLevel] = useState<number>(0.7);
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
    { label: 'Quantum Physics', prompt: 'Quantum Physics: Wave-particle duality, superposition, and quantum entanglement', icon: '⚛️', color: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
    { label: 'DNA & Genetics', prompt: 'Molecular Genetics: DNA replication, transcription, translation, and CRISPR gene editing', icon: '🧬', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    { label: 'Ancient Rome', prompt: 'Roman Republic and Empire: Punic wars, Julius Caesar, Senate politics, and Pax Romana', icon: '🏛️', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    { label: 'JavaScript Async', prompt: 'JavaScript Asynchronous Programming: Event loop, Promises, async/await, and microtasks', icon: '💻', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    { label: 'Microeconomics', prompt: 'Microeconomics: Supply and demand elasticity, consumer surplus, and market structures', icon: '📈', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    { label: 'Cybersecurity', prompt: 'Cybersecurity: Public key cryptography, zero-trust architecture, and common network vulnerabilities', icon: '🛡️', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  ];

  const handleCustomizeTopic = (prompt: string, diff: DifficultyType, types: QuestionType[]) => {
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

    // If no text was manually provided, and on presets tab - use the selected preset!
    if (!effectiveText && !hasFiles && !hasUrl) {
      if (activeTab === 'presets' && selectedPreset) {
        effectiveText = selectedPreset.inputText;
      }
    }

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
    setGenerationStep('Connecting to Gemini AI Engine...');

    const stepTimer1 = setTimeout(() => {
      setGenerationStep('Synthesizing pedagogical concepts & Bloom levels...');
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep('Formatting interactive options & feedback...');
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
          customInstructions: customInstructions.trim() || undefined,
          promptStyle,
          targetAudience,
          focusSubtopics: focusSubtopics.trim() || undefined,
          creativityLevel,
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
      onStartQuiz(data.quiz);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Hero Welcome Card */}
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm relative overflow-hidden transition-all">
        {/* Subtle decorative gradient mesh in the card corner */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-bl from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40 dark:border-indigo-700/50 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>AI Multi-Modal Assessment Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Custom Quizzes in Seconds
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate tailored, interactive quizzes from custom topics, documents, voice audio recordings, or YouTube video lectures.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-800/80 dark:to-indigo-950/30 p-3.5 rounded-2xl border border-slate-200/80 dark:border-indigo-900/40 shrink-0 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Evaluation Mode
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-white">
                {persona === 'Teacher' ? '🧑‍🏫 Teacher / Formative' : '🎓 Student / Practice'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Topic Capsules */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Popular Topic Starters:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_STARTER_TOPICS.map((topic) => (
              <button
                key={topic.label}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('text');
                  setInputText(topic.prompt);
                  const creationCard = document.getElementById('creation-card-main');
                  if (creationCard) {
                    creationCard.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:scale-105 hover:shadow-xs active:scale-95 ${topic.color}`}
              >
                <span>{topic.icon}</span>
                <span>{topic.label}</span>
              </button>
            ))}
          </div>
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

      {/* AI-Recommended Quizzes Section (Adaptive Pedagogical Suggestions) */}
      <RecommendedQuizzesSection
        persona={persona}
        stats={stats}
        historyRecords={historyRecords}
        onStartQuiz={onStartQuiz}
        onCustomizeTopic={handleCustomizeTopic}
      />

      {/* Main Creation Card */}
      <div
        id="creation-card-main"
        className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors"
      >
        {/* Creation Mode Tabs */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-2 gap-2 overflow-x-auto scrollbar-none items-center">
          {[
            { id: 'presets', label: 'Curated Sets', icon: Lightbulb },
            { id: 'text', label: 'Notes & Prompts', icon: FileText },
            { id: 'file', label: 'Document & Images', icon: Upload },
            { id: 'audio', label: 'Spoken Memo', icon: Mic },
            { id: 'url', label: 'Web / Video URL', icon: Link2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`tab-select-${tab.id}`}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id as 'presets' | 'text' | 'file' | 'audio' | 'url');
                }}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? `${currentAccentConfig.activeBtn} text-white shadow-xs`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'audio' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
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
              className="ml-auto flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-black border border-indigo-200/80 dark:border-indigo-800/80 transition-all cursor-pointer whitespace-nowrap shadow-2xs shrink-0"
              title="Upload your own created quiz (JSON or text)"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Upload Created Quiz</span>
            </button>
          )}
        </div>

        {/* Tab Body Contents */}
        <div className="p-6">
          {/* Tab 1: Popular Starter Topics */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Curated Curriculum Tracks</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                      {PRESET_TOPICS.length} Tracks
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select a curriculum topic to generate a fresh AI assessment with your custom matrix, or play the prebuilt track instantly.
                  </p>
                </div>
                {selectedPreset && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Active Topic: {selectedPreset.title}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRESET_TOPICS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedPresetId(preset.id);
                        setInputText(preset.inputText);
                        setSelectedQuestionTypes(preset.suggestedTypes);
                        setValidationWarning(null);
                        setErrorMessage(null);
                      }}
                      className={`p-4 rounded-2xl border transition-all text-left cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-2xl">{preset.icon}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSelected ? '✓ Selected Topic' : preset.category}
                          </span>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTrackDetail(preset);
                          }}
                          className="cursor-pointer group/title"
                          title="Click to view Key Takeaways & review source material"
                        >
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                            {preset.title}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {preset.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTrackDetail(preset);
                          }}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs hover:shadow-xs"
                          title="Review AI-generated key takeaways & source summary before starting"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Key Takeaways & Review</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFx.playClick();
                              setSelectedPresetId(preset.id);
                              setInputText(preset.inputText);
                              handleGenerateQuiz(preset.inputText);
                            }}
                            className="py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
                            title="Generate fresh questions using Gemini AI"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Quiz</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadPreset(preset);
                            }}
                            className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                            title="Play prebuilt questions immediately"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Prebuilt</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Paste Notes / Text */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="notes-input" className="block text-sm font-extrabold text-slate-900 dark:text-white">
                  Enter Subject, Custom Concept, or Lecture Notes
                </label>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab('audio');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer transition-all"
                >
                  <Mic className="w-3.5 h-3.5 text-rose-500" />
                  <span>Or Record Voice Audio</span>
                </button>
              </div>
              <textarea
                id="notes-input"
                rows={6}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (validationWarning) setValidationWarning(null);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Example: Explain the core differences between Monolithic and Microservices architecture with trade-offs in distributed transactions, latency, and observability..."
                className={`w-full p-4 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isInputShaking
                    ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-500 animate-shake'
                    : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-indigo-500'
                }`}
              />
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>{inputText.length} characters • Press ⌘+Enter to build</span>
                {inputText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setInputText('');
                    }}
                    className="text-slate-500 hover:text-red-500 cursor-pointer"
                  >
                    Clear Text
                  </button>
                )}
              </div>

              {/* Quick Topic Starter Chips */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  <span>Quick Starter Ideas (Click to populate):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
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
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all cursor-pointer"
                    >
                      {topic.icon} {topic.label}
                    </button>
                  ))}
                </div>
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
        </div>

        {/* Assessment Matrix Configuration & Generate Footer */}
        <div className="p-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Number of Questions (Limit Increased to 100) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Question Count
                </label>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {questionCount} Qs {questionCount >= 50 ? '• Marathon' : questionCount >= 25 ? '• Full Exam' : questionCount >= 10 ? '• Assessment' : '• Micro'}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[5, 10, 15, 25, 50, 75, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setQuestionCount(num);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      questionCount === num
                        ? `${currentAccentConfig.activeBtn} text-white shadow-2xs`
                        : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setQuestionCount((prev) => Math.max(1, prev - 1));
                  }}
                  disabled={questionCount <= 1}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  title="Decrease question count"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setQuestionCount((prev) => Math.min(100, prev + 1));
                  }}
                  disabled={questionCount >= 100}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  title="Increase question count"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 2. Difficulty */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Bloom Complexity
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyType[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setDifficulty(lvl);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      difficulty === lvl
                        ? `${currentAccentConfig.activeBtn} text-white shadow-2xs`
                        : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lvl === 'Beginner' ? 'Easy' : lvl === 'Intermediate' ? 'Medium' : 'Hard'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Persona Target */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Pedagogical Lens
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    onPersonaChange('Student');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    persona === 'Student'
                      ? `${currentAccentConfig.activeBtn} text-white shadow-2xs`
                      : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    onPersonaChange('Teacher');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    persona === 'Teacher'
                      ? `${currentAccentConfig.activeBtn} text-white shadow-2xs`
                      : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Instructor
                </button>
              </div>
            </div>

            {/* 4. Multilingual Target (50+ Languages) */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Quiz Language
                </label>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  50+ Languages
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsLangPickerOpen(!isLangPickerOpen);
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-between hover:border-indigo-400 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{selectedLanguage.flag}</span>
                  <span className="font-bold truncate">{selectedLanguage.name}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isLangPickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Picker Dropdown */}
              {isLangPickerOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 max-h-60 flex flex-col animate-in fade-in zoom-in-95">
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
                            <span className="text-[10px] text-slate-400 truncate">({lang.nativeName})</span>
                          </div>
                          {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prompter Flexibility & Pedagogical Directives (User Request) */}
          <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Prompter Flexibility & Custom AI Directives
                    </span>
                    {(customInstructions.trim() || promptStyle !== 'Standard' || focusSubtopics.trim()) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Customized
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Fine-tune AI pedagogical focus, target audience, style, and domain constraints.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowAdvancedPrompter(!showAdvancedPrompter);
                }}
                className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span>{showAdvancedPrompter ? 'Hide Tuning' : 'Customize Prompter'}</span>
                {showAdvancedPrompter ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Quick Modifier Chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
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

            {/* Expanded Prompter Drawer */}
            {showAdvancedPrompter && (
              <div className="mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-900/50 space-y-4">
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="button"
              id="generate-quiz-btn"
              disabled={isLoading}
              onClick={() => handleGenerateQuiz()}
              className={`w-full py-4 px-6 rounded-2xl text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 ${currentAccentConfig.activeBtn}`}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <div className="text-left">
                    <span className="block font-black text-sm">{generationStep || 'Synthesizing Custom Assessment...'}</span>
                    <span className="block text-[11px] font-normal text-white/80">Powered by Google Gemini 3.8 Flash</span>
                  </div>
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform shrink-0" />
                  <span>Generate AI Assessment</span>
                  <kbd className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-white/20 text-white ml-2">
                    ⌘ + ↵
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

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
