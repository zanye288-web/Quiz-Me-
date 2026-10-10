import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Edit3,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Palette,
  Layers,
  Award,
  Check,
  Search,
  ExternalLink,
  Wand2,
  Flame,
  Layout,
  X,
  Globe,
  FileText,
  FileSpreadsheet,
  Code,
  Sliders,
  BarChart3,
  ListChecks,
  HelpCircle,
  MessageSquare,
  Eye,
  BookOpen,
} from 'lucide-react';
import { Question, QuizResponse, PersonaType, DifficultyType, DeckTheme } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { THEMATIC_VISUAL_ASSETS, resolveThematicVisual } from '../utils/thematicImages';
import { MediaAttributionBadge } from './MediaAttributionBadge';
import {
  PresentationDeck,
  PresentationSlide,
  SlideLayoutType,
  InteractiveWidgetType,
  exportPresentationToPptx,
  exportPresentationToPdf,
  exportPresentationToInteractiveHtml,
  exportPresentationToMarkdown,
  exportPresentationToWordDoc,
} from '../utils/presentationExporter';
import {
  CURATED_PRESENTATION_TEMPLATES,
  convertQuizToPresentationDeck,
  expandPresentationDeckToTargetSlides,
} from '../data/presentationTemplates';

interface GammaWorkspaceProps {
  persona: PersonaType;
  onLaunchAssessment: (quiz: QuizResponse) => void;
  onSaveToLibrary?: (quiz: QuizResponse) => void;
  initialQuiz?: QuizResponse | null;
}

const DECK_THEMES: Array<{
  id: string;
  name: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
  accentClass: string;
  borderClass: string;
  badgeClass: string;
  previewColor: string;
}> = [
  {
    id: 'gamma-dark',
    name: 'Obsidian Cyber',
    bgClass: 'bg-slate-950 text-slate-100',
    cardClass: 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl backdrop-blur-md',
    textClass: 'text-white',
    accentClass: 'from-cyan-500 to-indigo-500 text-cyan-400 border-cyan-500/40',
    borderClass: 'border-slate-800',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
    previewColor: '#0f172a',
  },
  {
    id: 'gamma-emerald',
    name: 'Emerald Studio',
    bgClass: 'bg-emerald-950 text-emerald-50',
    cardClass: 'bg-emerald-900/80 border-emerald-800 text-emerald-50 shadow-2xl backdrop-blur-md',
    textClass: 'text-emerald-100',
    accentClass: 'from-emerald-400 to-teal-500 text-emerald-300 border-emerald-500/40',
    borderClass: 'border-emerald-800',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
    previewColor: '#064e3b',
  },
  {
    id: 'gamma-ocean',
    name: 'Oceanic Azure',
    bgClass: 'bg-sky-950 text-sky-50',
    cardClass: 'bg-sky-900/80 border-sky-800 text-sky-50 shadow-2xl backdrop-blur-md',
    textClass: 'text-sky-100',
    accentClass: 'from-sky-400 to-blue-600 text-sky-300 border-sky-500/40',
    borderClass: 'border-sky-800',
    badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-700',
    previewColor: '#082f49',
  },
  {
    id: 'gamma-sunset',
    name: 'Sunset Velvet',
    bgClass: 'bg-stone-950 text-stone-100',
    cardClass: 'bg-stone-900/90 border-amber-900/40 text-stone-100 shadow-2xl backdrop-blur-md',
    textClass: 'text-amber-100',
    accentClass: 'from-amber-500 to-rose-500 text-amber-300 border-amber-500/40',
    borderClass: 'border-amber-900/30',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800',
    previewColor: '#292524',
  },
  {
    id: 'gamma-minimal',
    name: 'Nordic Clean',
    bgClass: 'bg-slate-100 text-slate-900',
    cardClass: 'bg-white border-slate-200 text-slate-900 shadow-xl',
    textClass: 'text-slate-900',
    accentClass: 'from-indigo-600 to-purple-600 text-indigo-600 border-indigo-200',
    borderClass: 'border-slate-200',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    previewColor: '#f8fafc',
  },
];

const SLIDE_LAYOUT_OPTIONS: Array<{
  id: SlideLayoutType;
  label: string;
  short: string;
}> = [
  { id: 'hero-cover', label: 'Hero Cover', short: 'Cover' },
  { id: 'split-visual', label: 'Split Visual + Bullets', short: 'Split' },
  { id: 'bento-grid', label: 'Bento Grid (4 Cards)', short: 'Bento' },
  { id: 'timeline-process', label: 'Process Timeline', short: 'Timeline' },
  { id: 'data-chart', label: 'Interactive Data Chart', short: 'Chart' },
  { id: 'comparison-table', label: 'Comparison Matrix', short: 'Compare' },
];

const INTERACTIVE_WIDGET_OPTIONS: Array<{
  id: InteractiveWidgetType;
  label: string;
}> = [
  { id: 'quiz', label: '⚡ Live Quiz Check' },
  { id: 'poll', label: '📊 Live Audience Poll' },
  { id: 'flashcards', label: '🃏 3D Flip Flashcards' },
  { id: 'accordion', label: '📂 Deep-Dive Accordions' },
  { id: 'simulator', label: '🎛️ Formula / Rate Simulator' },
  { id: 'none', label: 'None (Content Only)' },
];

export const GammaWorkspace: React.FC<GammaWorkspaceProps> = ({
  persona,
  onLaunchAssessment,
  onSaveToLibrary,
  initialQuiz,
}) => {
  // Presentation Deck State
  const [deck, setDeck] = useState<PresentationDeck>(() => CURATED_PRESENTATION_TEMPLATES[0]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyType>('Intermediate');

  // Mode: 'editor' or 'present'
  const [mode, setMode] = useState<'editor' | 'present'>('editor');

  // AI Presentation Generator State (supports 1 to 250+ slides)
  const [aiSourceMode, setAiSourceMode] = useState<'topic' | 'notes'>('topic');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiNotesInput, setAiNotesInput] = useState('');
  const [aiSlideCount, setAiSlideCount] = useState(100);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [includeSpeakerNotesInExport, setIncludeSpeakerNotesInExport] = useState(true);
  const [includeAnswerKeysInExport, setIncludeAnswerKeysInExport] = useState(true);
  const [isExportingFile, setIsExportingFile] = useState<string | null>(null);

  // Image Studio State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageSearchKeyword, setImageSearchKeyword] = useState('');
  const [liveSearchResults, setLiveSearchResults] = useState<
    Array<{ url: string; thumbnail?: string; caption: string; source: string; sourceUrl?: string; attribution?: string }>
  >([]);
  const [imageEngine, setImageEngine] = useState<'all' | 'web' | 'wikimedia'>('all');
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'search' | 'curated' | 'custom'>('search');

  // Interactive Widget Live State (Works in BOTH Editor Preview & Presenter Mode!)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizHintsShown, setQuizHintsShown] = useState<Record<string, boolean>>({});
  const [pollVotesCast, setPollVotesCast] = useState<Record<string, number>>({});
  const [flippedFlashcards, setFlippedFlashcards] = useState<Record<string, boolean>>({});
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [simulatorValues, setSimulatorValues] = useState<Record<string, number>>({});

  // Presenter Mode Specific State
  const [presenterIndex, setPresenterIndex] = useState(0);
  const [showSpeakerNotesHud, setShowSpeakerNotesHud] = useState(true);
  const [laserPointerActive, setLaserPointerActive] = useState(false);
  const [laserCoords, setLaserCoords] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const deckJsonInputRef = useRef<HTMLInputElement | null>(null);

  // Convert initialQuiz if provided
  useEffect(() => {
    if (initialQuiz && initialQuiz.questions && initialQuiz.questions.length > 0) {
      const converted = convertQuizToPresentationDeck(initialQuiz, 'gamma-dark', true);
      setDeck(converted);
      setActiveSlideIndex(0);
      if (initialQuiz.difficulty) setDifficulty(initialQuiz.difficulty);
    }
  }, [initialQuiz]);

  // Keyboard navigation in Presenter Mode
  useEffect(() => {
    if (mode !== 'present') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (presenterIndex + 1 < deck.slides.length) {
          setPresenterIndex((p) => p + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (presenterIndex > 0) {
          setPresenterIndex((p) => p - 1);
        }
      } else if (e.key === 'Escape') {
        setMode('editor');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, presenterIndex, deck.slides.length]);

  const slides = deck.slides;
  const activeSlide = slides[activeSlideIndex] || slides[0];
  const activeTheme = DECK_THEMES.find((t) => t.id === deck.themeId) || DECK_THEMES[0];

  const updateActiveSlide = (partial: Partial<PresentationSlide>) => {
    setDeck((prev) => {
      const nextSlides = [...prev.slides];
      if (nextSlides[activeSlideIndex]) {
        nextSlides[activeSlideIndex] = { ...nextSlides[activeSlideIndex], ...partial };
      }
      return { ...prev, slides: nextSlides };
    });
  };

  // Add New Slide
  const handleAddSlide = (layout: SlideLayoutType = 'split-visual') => {
    soundFx.playClick();
    const newNum = slides.length + 1;
    const visual = resolveThematicVisual(deck.title, newNum);
    const newSlide: PresentationSlide = {
      id: `slide-${Date.now()}`,
      slideNumber: newNum,
      layout,
      kicker: `Slide ${newNum} · Core Concept`,
      title: `New Interactive Slide #${newNum}`,
      subtitle: 'Summarize the core thesis or learning objective for this slide.',
      bullets: [
        'Primary analytical takeaway or foundational mechanism',
        'Real-world application and experimental evidence',
        'Common exam trap or boundary condition to watch for',
      ],
      bentoItems: [
        { title: 'Core Pillar 1', metricOrBadge: '01', description: 'Explain the first foundational dimension.' },
        { title: 'Core Pillar 2', metricOrBadge: '02', description: 'Explain the second foundational dimension.' },
        { title: 'Core Pillar 3', metricOrBadge: '03', description: 'Explain the third foundational dimension.' },
        { title: 'Core Pillar 4', metricOrBadge: '04', description: 'Explain the fourth foundational dimension.' },
      ],
      timelineSteps: [
        { step: 'Step 01', title: 'Initial Phase', detail: 'First stage of the process or historical sequence.' },
        { step: 'Step 02', title: 'Transformation', detail: 'Intermediate reaction or catalytic mechanism.' },
        { step: 'Step 03', title: 'Final Outcome', detail: 'Resulting product or equilibrium state.' },
      ],
      chartData: {
        chartTitle: 'Quantitative Comparison Metrics',
        bars: [
          { label: 'Baseline Group', value: 42, unit: '%' },
          { label: 'Experimental Group A', value: 74, unit: '%' },
          { label: 'Optimized System B', value: 93, unit: '%' },
        ],
      },
      comparisonData: {
        leftHeader: 'Model / Concept A',
        rightHeader: 'Model / Concept B',
        rows: [
          { feature: 'Primary Mechanism', leftValue: 'Direct pathway', rightValue: 'Feedback-regulated pathway' },
          { feature: 'Efficiency / Yield', leftValue: 'Moderate under standard conditions', rightValue: 'High under peak load' },
        ],
      },
      imageUrl: visual.url,
      imageCaption: visual.caption,
      imageLayout: 'right',
      imageSource: 'Unsplash',
      imageAttribution: 'Unsplash Educational Collection',
      interactiveType: 'quiz',
      quizWidget: {
        question: `Quick Checkpoint: What is the primary takeaway from Slide #${newNum}?`,
        options: ['Primary Correct Concept', 'Secondary Distractor B', 'Alternative Hypothesis C', 'Unrelated Factor D'],
        correctAnswer: 'Primary Correct Concept',
        explanation: 'This option directly reflects the governing mechanism outlined on this slide.',
        hint: 'Review the first bullet point and key takeaway.',
        points: 20,
      },
      pollWidget: {
        prompt: 'Live Audience Poll: Which aspect of this topic do you find most challenging?',
        options: [
          { label: 'Core Theoretical Definitions', votes: 12 },
          { label: 'Mathematical & Formula Applications', votes: 24 },
          { label: 'Multi-Step Exam Problem Solving', votes: 19 },
        ],
      },
      flashcardsWidget: [
        { front: 'Key Concept Definition', back: 'Detailed explanation of the primary mechanism.' },
        { front: 'Exam Application Rule', back: 'Always verify units and boundary conditions first.' },
      ],
      accordionWidget: [
        { title: 'Deep-Dive Mechanism & Proof', content: 'Step-by-step derivation and underlying theoretical justification.' },
        { title: 'Real-World Case Study', content: 'How this concept operates in industrial or biological systems.' },
      ],
      simulatorWidget: {
        title: 'Interactive Parameter Simulator',
        variableLabel: 'Input Parameter (X)',
        unit: 'units',
        min: 10,
        max: 200,
        step: 10,
        defaultValue: 80,
        formulaDescription: 'Models linear output response Y = 1.5 × X.',
        multiplier: 1.5,
        outputLabel: 'Calculated System Output (Y)',
        outputUnit: 'units',
      },
      speakerNotes: 'Introduce the visual diagram first, walk through the structured points, and invite the audience to complete the interactive widget.',
      keyTakeaway: 'Summarize the single most important rule students should remember from this slide.',
    };

    setDeck((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    setActiveSlideIndex(slides.length);
  };

  // Duplicate Slide
  const handleDuplicateSlide = (idx: number) => {
    soundFx.playClick();
    const target = slides[idx];
    if (!target) return;
    const copy: PresentationSlide = {
      ...JSON.parse(JSON.stringify(target)),
      id: `slide-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    const next = [...slides];
    next.splice(idx + 1, 0, copy);
    setDeck((prev) => ({
      ...prev,
      slides: next.map((s, i) => ({ ...s, slideNumber: i + 1 })),
    }));
    setActiveSlideIndex(idx + 1);
  };

  // Delete Slide
  const handleDeleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    soundFx.playClick();
    const next = slides.filter((_, i) => i !== idx).map((s, i) => ({ ...s, slideNumber: i + 1 }));
    setDeck((prev) => ({ ...prev, slides: next }));
    setActiveSlideIndex(Math.max(0, idx - 1));
  };

  // Move Slide Up/Down
  const handleMoveSlide = (idx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === slides.length - 1)) return;
    soundFx.playClick();
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const next = [...slides];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setDeck((prev) => ({
      ...prev,
      slides: next.map((s, i) => ({ ...s, slideNumber: i + 1 })),
    }));
    setActiveSlideIndex(targetIdx);
  };

  // Scale / Expand Current Deck to 50, 100, 150, or 200+ Slides
  const handleScaleDeckToCount = (targetCount: number) => {
    soundFx.playClick();
    const safeTarget = Math.max(1, Math.min(250, targetCount));
    setDeck((prev) => expandPresentationDeckToTargetSlides(prev, safeTarget));
    soundFx.playComplete();
  };

  // AI Generate Full Presentation Deck (Supports 1 to 250+ Slides)
  const handleGenerateDeckAI = async () => {
    const rawInput = aiSourceMode === 'topic' ? aiPrompt.trim() : aiNotesInput.trim();
    if (!rawInput) return;
    soundFx.playClick();
    setIsGeneratingDeck(true);
    setAiError(null);

    const requestedSlides = Math.max(1, Math.min(250, aiSlideCount));
    // Request a rich core set from AI (up to 16 core modules for speed) and expand to exact targetSlideCount (up to 250 slides)
    const coreApiCount = Math.min(requestedSlides, 16);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: rawInput,
          questionCount: coreApiCount,
          difficulty,
          persona,
          promptStyle: 'Interactive Visual Presentation Deck with Rich Explanations',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.quiz) {
        throw new Error(data.error || 'Failed to generate interactive presentation.');
      }

      const generatedQuiz: QuizResponse = data.quiz;
      const newDeck = convertQuizToPresentationDeck(
        generatedQuiz,
        deck.themeId,
        true,
        requestedSlides
      );
      setDeck(newDeck);
      setActiveSlideIndex(0);
      soundFx.playComplete();
    } catch (err: unknown) {
      // Fallback: synthesize a structured deck of requestedSlides directly from the user topic/notes so 100+ slide PPTX generation always succeeds
      const fallbackSeedDeck: PresentationDeck = {
        ...CURATED_PRESENTATION_TEMPLATES[0],
        id: `custom-mega-${Date.now()}`,
        title: `${rawInput.slice(0, 68)} — Interactive Presentation`,
        subtitle: `Comprehensive ${requestedSlides}-Slide Interactive Presentation Deck`,
        themeId: deck.themeId,
      };
      const expandedFallback = expandPresentationDeckToTargetSlides(
        fallbackSeedDeck,
        requestedSlides,
        rawInput.slice(0, 68)
      );
      setDeck(expandedFallback);
      setActiveSlideIndex(0);
      soundFx.playComplete();
      console.warn('Used instant mega-deck synthesizer fallback:', err);
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  // AI Slide Co-Pilot Magic Enhancer
  const handleAiMagicAction = (action: 'concise' | 'bento' | 'timeline' | 'add_quiz' | 'add_simulator') => {
    soundFx.playClick();
    if (!activeSlide) return;

    if (action === 'bento') {
      const items = (activeSlide.bullets.length >= 2 ? activeSlide.bullets : ['Core Mechanism', 'Applied Analysis', 'Experimental Proof', 'Exam Strategy'])
        .slice(0, 4)
        .map((b, i) => ({
          title: `Key Dimension 0${i + 1}`,
          metricOrBadge: `Pillar ${i + 1}`,
          description: b,
        }));
      updateActiveSlide({ layout: 'bento-grid', bentoItems: items });
    } else if (action === 'timeline') {
      const steps = (activeSlide.bullets.length >= 2 ? activeSlide.bullets : ['Initial State', 'Intermediate Transition', 'Final Equilibrium'])
        .slice(0, 4)
        .map((b, i) => ({
          step: `Stage 0${i + 1}`,
          title: `Phase ${i + 1}`,
          detail: b,
        }));
      updateActiveSlide({ layout: 'timeline-process', timelineSteps: steps });
    } else if (action === 'add_quiz') {
      updateActiveSlide({
        interactiveType: 'quiz',
        quizWidget: activeSlide.quizWidget || {
          question: `Which statement best summarizes ${activeSlide.title}?`,
          options: [
            activeSlide.bullets[0] || 'Primary governing principle',
            'Inverse relationship independent of input variables',
            'Occurs only at absolute zero temperature',
            'Requires zero activation energy or catalyst',
          ],
          correctAnswer: activeSlide.bullets[0] || 'Primary governing principle',
          explanation: activeSlide.keyTakeaway || 'Directly supported by the primary concept on this slide.',
          hint: 'Check the first key takeaway on this slide.',
          points: 25,
        },
      });
    } else if (action === 'add_simulator') {
      updateActiveSlide({
        interactiveType: 'simulator',
        simulatorWidget: activeSlide.simulatorWidget || {
          title: `Interactive ${activeSlide.title.slice(0, 32)} Simulator`,
          variableLabel: 'Input Factor (X)',
          unit: 'units',
          min: 10,
          max: 500,
          step: 10,
          defaultValue: 120,
          formulaDescription: 'Dynamic real-time proportional response model.',
          multiplier: 1.75,
          outputLabel: 'Predicted Response Output',
          outputUnit: 'units',
        },
      });
    } else if (action === 'concise') {
      updateActiveSlide({
        bullets: activeSlide.bullets.map((b) => (b.length > 110 ? b.slice(0, 107) + '...' : b)),
      });
    }
  };

  // Convert Deck Back to QuizResponse for CBT Runner / Saving
  const buildQuizPayloadFromDeck = (): QuizResponse => {
    const questions: Question[] = deck.slides.map((s, idx) => {
      const qWidget = s.quizWidget;
      return {
        id: idx + 1,
        type: 'multiple_choice',
        question: qWidget?.question || `Regarding "${s.title}", which of the following is accurate?`,
        options:
          qWidget?.options && qWidget.options.length >= 2
            ? qWidget.options
            : [s.keyTakeaway || s.bullets[0] || 'Core Principle', 'Distractor Option B', 'Distractor Option C', 'Distractor Option D'],
        correct_answer: qWidget?.correctAnswer || s.keyTakeaway || s.bullets[0] || 'Core Principle',
        explanation: qWidget?.explanation || s.bullets.join(' ') || s.subtitle || 'Review the presentation slide notes.',
        image_url: s.imageUrl || null,
        image_caption: s.imageCaption,
        image_layout: 'top',
        image_source: s.imageSource || 'Unsplash',
        image_attribution: s.imageAttribution || 'Unsplash Educational',
        gamified_feedback: {
          success_quote: 'Spot on! Presentation concept mastered.',
          hint: qWidget?.hint || s.keyTakeaway || 'Think about the slide headline.',
        },
        points: qWidget?.points || 20,
        bloom_level: 'Understand',
        domain: s.kicker || 'Presentation Mastery',
      };
    });

    return {
      app_name: 'Quiz Me!',
      persona,
      quiz_title: deck.title,
      summary: deck.subtitle,
      difficulty,
      deck_theme: (deck.themeId as DeckTheme) || 'gamma-dark',
      cover_image: deck.slides[0]?.imageUrl || null,
      questions,
    };
  };

  // Export Handlers
  const handleRunExport = async (format: 'pptx' | 'pdf' | 'html' | 'md' | 'doc' | 'json') => {
    soundFx.playClick();
    setIsExportingFile(format);
    try {
      if (format === 'pptx') {
        await exportPresentationToPptx(deck, includeSpeakerNotesInExport, includeAnswerKeysInExport);
      } else if (format === 'pdf') {
        exportPresentationToPdf(deck, includeSpeakerNotesInExport, includeAnswerKeysInExport);
      } else if (format === 'html') {
        exportPresentationToInteractiveHtml(deck);
      } else if (format === 'md') {
        exportPresentationToMarkdown(deck);
      } else if (format === 'doc') {
        exportPresentationToWordDoc(deck);
      } else if (format === 'json') {
        const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deck.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-gamma-deck.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      soundFx.playCorrect();
    } catch (err) {
      console.error('Export error:', err);
      soundFx.playIncorrect();
    } finally {
      setIsExportingFile(null);
    }
  };

  // Import Deck JSON
  const handleImportDeckJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && Array.isArray(parsed.slides)) {
          setDeck(parsed);
          setActiveSlideIndex(0);
          soundFx.playComplete();
        } else if (parsed && Array.isArray(parsed.questions)) {
          setDeck(convertQuizToPresentationDeck(parsed, deck.themeId, true));
          setActiveSlideIndex(0);
          soundFx.playComplete();
        }
      } catch (err) {
        console.warn('Invalid deck JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  // Image Search & Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateActiveSlide({
          imageUrl: reader.result,
          imageCaption: file.name.replace(/\.[^/.]+$/, ''),
        });
        setIsImageModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePerformLiveSearch = async (queryStr: string, engineOverride?: 'all' | 'web' | 'wikimedia') => {
    const q = queryStr.trim();
    if (!q) return;
    setIsLiveSearching(true);
    const selectedEngine = engineOverride || imageEngine;
    try {
      const res = await fetch('/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, engine: selectedEngine, limit: 16 }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        setLiveSearchResults(data.images);
      }
    } catch (err) {
      console.warn('[Gamma] Live image search failed:', err);
    } finally {
      setIsLiveSearching(false);
    }
  };

  const handleOpenImageStudio = () => {
    soundFx.playClick();
    const defaultSearch = activeSlide.title.slice(0, 45);
    setImageSearchKeyword(defaultSearch);
    setIsImageModalOpen(true);
    handlePerformLiveSearch(defaultSearch);
  };

  const handleAutoMatchImageForActiveSlide = async () => {
    if (!activeSlide) return;
    setIsAutoMatching(true);
    soundFx.playClick();
    try {
      const phrase = `${deck.title} ${activeSlide.title}`;
      const res = await fetch('/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: phrase }),
      });
      const data = await res.json();
      if (data.success && data.images && data.images.length > 0) {
        const topImg = data.images[0];
        updateActiveSlide({
          imageUrl: topImg.url,
          imageCaption: topImg.caption,
          imageSource: topImg.source,
          imageAttribution: topImg.attribution,
        });
        soundFx.playCorrect();
      }
    } catch {
      soundFx.playIncorrect();
    } finally {
      setIsAutoMatching(false);
    }
  };

  // Render any Slide's Interactive Widget (Shared between Live Canvas Preview & Presenter Mode!)
  const renderInteractivePart = (slide: PresentationSlide, isPresenter = false) => {
    if (slide.interactiveType === 'none') return null;

    // 1. LIVE INTERACTIVE QUIZ WIDGET
    if (slide.interactiveType === 'quiz' && slide.quizWidget) {
      const q = slide.quizWidget;
      const chosen = quizAnswers[slide.id];
      const hasAnswered = Boolean(chosen);
      const showHint = Boolean(quizHintsShown[slide.id]);

      return (
        <div className="mt-6 p-5 rounded-2xl bg-slate-950/75 border-2 border-cyan-500/40 space-y-4 shadow-lg">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                ⚡ Interactive Checkpoint
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">+{q.points || 20} XP</span>
            </div>
            <div className="flex items-center gap-2">
              {q.hint && (
                <button
                  type="button"
                  onClick={() => setQuizHintsShown((prev) => ({ ...prev, [slide.id]: !prev[slide.id] }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
              )}
              {hasAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    const copy = { ...quizAnswers };
                    delete copy[slide.id];
                    setQuizAnswers(copy);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <h4 className="text-base sm:text-lg font-black text-white leading-snug">{q.question}</h4>

          {showHint && q.hint && (
            <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200">
              💡 <strong>Hint:</strong> {q.hint}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isSelected = chosen === opt;
              const isCorrect = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              let style = 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-cyan-400';
              if (hasAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-1 ring-emerald-400';
                } else if (isSelected && !isCorrect) {
                  style = 'bg-rose-950/80 border-rose-500 text-rose-200';
                } else {
                  style = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-65';
                }
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => {
                    setQuizAnswers((prev) => ({ ...prev, [slide.id]: opt }));
                    if (isCorrect) {
                      soundFx.playCorrect();
                      if (isPresenter) {
                        setScore((s) => s + (q.points || 20));
                        setStreak((st) => st + 1);
                      }
                    } else {
                      soundFx.playIncorrect();
                      if (isPresenter) setStreak(0);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${style}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black shrink-0">
                    {hasAnswered && isCorrect ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : letter}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs space-y-1">
              <div className="font-black flex items-center gap-1.5">
                {chosen.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Correct!
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Correct Answer: {q.correctAnswer}
                  </span>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </div>
      );
    }

    // 2. LIVE AUDIENCE POLL WIDGET
    if (slide.interactiveType === 'poll' && slide.pollWidget) {
      const poll = slide.pollWidget;
      const votedIndex = pollVotesCast[slide.id];
      const hasVoted = votedIndex !== undefined;
      const totalVotes = poll.options.reduce((acc, o, idx) => acc + o.votes + (votedIndex === idx ? 1 : 0), 0) || 1;

      return (
        <div className="mt-6 p-5 rounded-2xl bg-slate-950/75 border-2 border-indigo-500/40 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider">
              📊 Live Interactive Poll
            </span>
            <span className="text-xs text-slate-400 font-mono">{totalVotes} responses</span>
          </div>
          <h4 className="text-base font-black text-white">{poll.prompt}</h4>
          <div className="space-y-2.5">
            {poll.options.map((opt, idx) => {
              const count = opt.votes + (votedIndex === idx ? 1 : 0);
              const pct = Math.round((count / totalVotes) * 100);
              const isChosen = votedIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setPollVotesCast((prev) => ({ ...prev, [slide.id]: idx }));
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isChosen ? 'border-indigo-400 bg-indigo-950/50' : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  {hasVoted && (
                    <div
                      className="absolute inset-y-0 left-0 bg-indigo-500/25 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between text-xs sm:text-sm font-bold text-white">
                    <span>{opt.label}</span>
                    {hasVoted && <span className="font-mono text-indigo-300">{pct}% ({count})</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 3. INTERACTIVE 3D FLASHCARD FLIPPER WIDGET
    if (slide.interactiveType === 'flashcards' && slide.flashcardsWidget && slide.flashcardsWidget.length > 0) {
      return (
        <div className="mt-6 p-5 rounded-2xl bg-slate-950/75 border-2 border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              🃏 Interactive Recall Flip Cards (Click any card to flip)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {slide.flashcardsWidget.map((fc, idx) => {
              const key = `${slide.id}-fc-${idx}`;
              const isFlipped = Boolean(flippedFlashcards[key]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setFlippedFlashcards((prev) => ({ ...prev, [key]: !prev[key] }));
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer min-h-28 flex flex-col justify-between ${
                    isFlipped
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100'
                      : 'bg-slate-900/90 border-slate-700 text-white hover:border-emerald-400/60'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    {isFlipped ? '✓ Answer Revealed' : `Card #${idx + 1} · Click to Flip`}
                  </div>
                  <p className="text-xs sm:text-sm font-bold leading-snug my-2">
                    {isFlipped ? fc.back : fc.front}
                  </p>
                  <div className="text-[10px] text-slate-400">Tap to toggle</div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 4. INTERACTIVE ACCORDION REVEAL WIDGET
    if (slide.interactiveType === 'accordion' && slide.accordionWidget && slide.accordionWidget.length > 0) {
      return (
        <div className="mt-6 p-5 rounded-2xl bg-slate-950/75 border-2 border-amber-500/40 space-y-2.5">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
            📂 Interactive Deep-Dive Accordions
          </span>
          {slide.accordionWidget.map((item, idx) => {
            const key = `${slide.id}-acc-${idx}`;
            const isOpen = Boolean(openAccordions[key]);
            return (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
                  }}
                  className="w-full px-4 py-3 text-left text-xs sm:text-sm font-bold text-white flex items-center justify-between hover:bg-slate-800/60 cursor-pointer"
                >
                  <span>{item.title}</span>
                  <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // 5. INTERACTIVE FORMULA / PARAMETER SIMULATOR WIDGET
    if (slide.interactiveType === 'simulator' && slide.simulatorWidget) {
      const sim = slide.simulatorWidget;
      const currentVal = simulatorValues[slide.id] ?? sim.defaultValue;
      const computedOutput = (currentVal * sim.multiplier).toFixed(1);
      const pct = Math.min(100, Math.max(5, Math.round(((currentVal - sim.min) / Math.max(1, sim.max - sim.min)) * 100)));

      return (
        <div className="mt-6 p-5 rounded-2xl bg-slate-950/75 border-2 border-purple-500/40 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              🎛️ Interactive Live Parameter Simulator
            </span>
            <span className="text-[11px] text-purple-300 font-mono">{sim.formulaDescription}</span>
          </div>

          <h4 className="text-base font-black text-white">{sim.title}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>{sim.variableLabel}</span>
                <span className="font-mono text-cyan-400 text-sm">
                  {currentVal} {sim.unit}
                </span>
              </div>
              <input
                type="range"
                min={sim.min}
                max={sim.max}
                step={sim.step}
                value={currentVal}
                onChange={(e) =>
                  setSimulatorValues((prev) => ({
                    ...prev,
                    [slide.id]: Number(e.target.value),
                  }))
                }
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Min: {sim.min} {sim.unit}</span>
                <span>Max: {sim.max} {sim.unit}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2">
              <div className="text-xs text-slate-400 font-bold">{sim.outputLabel}</div>
              <div className="text-2xl font-black font-mono text-purple-300">
                {computedOutput} <span className="text-xs font-normal text-slate-400">{sim.outputUnit}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-200"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Render Slide Body Layout (Bento, Timeline, Chart, Comparison, Split)
  const renderSlideLayoutBody = (slide: PresentationSlide) => {
    if (slide.layout === 'bento-grid' && slide.bentoItems && slide.bentoItems.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
          {slide.bentoItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/55 border border-slate-800/90 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-black text-cyan-300">{item.title}</h4>
                {item.metricOrBadge && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-bold text-amber-300">
                    {item.metricOrBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      );
    }

    if (slide.layout === 'timeline-process' && slide.timelineSteps && slide.timelineSteps.length > 0) {
      return (
        <div className="space-y-2.5 my-4">
          {slide.timelineSteps.map((st, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-950/55 border border-slate-800/90 flex items-start gap-3.5"
            >
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-black shrink-0">
                {st.step}
              </span>
              <div>
                <h4 className="text-sm font-black text-white">{st.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{st.detail}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (slide.layout === 'data-chart' && slide.chartData) {
      return (
        <div className="p-4 rounded-2xl bg-slate-950/55 border border-slate-800/90 space-y-3 my-4">
          <div className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            <span>{slide.chartData.chartTitle}</span>
          </div>
          <div className="space-y-2.5">
            {slide.chartData.bars.map((bar, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span>{bar.label}</span>
                  <span className="font-mono text-cyan-300">
                    {bar.value}
                    {bar.unit || '%'}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(8, bar.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (slide.layout === 'comparison-table' && slide.comparisonData) {
      return (
        <div className="overflow-x-auto my-4 rounded-2xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 text-cyan-300 border-b border-slate-800">
                <th className="p-3 font-black">Dimension</th>
                <th className="p-3 font-black">{slide.comparisonData.leftHeader}</th>
                <th className="p-3 font-black">{slide.comparisonData.rightHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 bg-slate-950/40">
              {slide.comparisonData.rows.map((r, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-bold text-white">{r.feature}</td>
                  <td className="p-3 text-slate-300">{r.leftValue}</td>
                  <td className="p-3 text-slate-300">{r.rightValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Default / Split-Visual / Hero-Cover bullets
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center my-4">
        <div className={slide.imageUrl ? 'lg:col-span-7 space-y-2.5' : 'lg:col-span-12 space-y-2.5'}>
          {slide.bullets.map((b, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{b}</span>
            </div>
          ))}
        </div>

        {slide.imageUrl && (
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
              <img
                src={slide.imageUrl}
                alt={slide.imageCaption || slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-52 object-cover"
              />
              {slide.imageCaption && (
                <div className="p-2 bg-slate-950/85 text-[11px] text-slate-300 truncate">
                  {slide.imageCaption}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${activeTheme.bgClass} transition-colors duration-300 flex flex-col`}>
      {/* 1. GAMMA AI+ TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 px-4 py-3 border-b-2 border-slate-950 pattern-halftone bg-slate-950/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-amber-300 text-slate-950 border-2 border-slate-950 shadow-md">
            <Layout className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="comic-badge px-2 py-0.5 rounded-md bg-amber-300 text-slate-950 border border-slate-950 text-[9px] font-black uppercase tracking-wider shrink-0">
                GAMMA AI+ STUDIO
              </span>
              <input
                type="text"
                value={deck.title}
                onChange={(e) => setDeck((prev) => ({ ...prev, title: e.target.value }))}
                className="font-black text-base sm:text-lg tracking-tight bg-transparent text-white border-b border-transparent hover:border-slate-600 focus:border-cyan-400 focus:outline-none transition-colors truncate w-48 sm:w-80"
                title="Click to rename presentation"
              />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300 font-semibold">
              <span>{slides.length} Interactive Slides</span>
              <span>•</span>
              <span>PDF, PPTX, HTML5 & DOC Export</span>
            </div>
          </div>
        </div>

        {/* Center: Theme Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <Palette className="w-4 h-4 text-slate-400 ml-1.5 mr-0.5" />
          {DECK_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setDeck((prev) => ({ ...prev, themeId: theme.id }));
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                deck.themeId === theme.id
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-slate-700"
                style={{ backgroundColor: theme.previewColor }}
              />
              <span className="hidden xl:inline">{theme.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Right: Present, Export (PDF/PPTX/HTML) & CBT Runner */}
        <div className="flex items-center gap-2 flex-wrap">
          {mode === 'editor' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setPresenterIndex(0);
                  setIsComplete(false);
                  setMode('present');
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Present Live</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsExportModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-black text-xs border-2 border-slate-950 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download (PPTX / PDF / HTML)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  const quizPayload = buildQuizPayloadFromDeck();
                  if (onSaveToLibrary) onSaveToLibrary(quizPayload);
                  onLaunchAssessment(quizPayload);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Launch all interactive checkpoints as a timed CBT exam"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Test as CBT</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLaserPointerActive((p) => !p)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  laserPointerActive
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                🔴 Laser Pointer {laserPointerActive ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => setShowSpeakerNotesHud((p) => !p)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
              >
                Speaker Notes {showSpeakerNotesHud ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => setMode('editor')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Back to Studio</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      {mode === 'editor' ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT SIDEBAR: SLIDE FILMSTRIP, TEMPLATES & AI GENERATOR */}
          <aside className="w-full lg:w-80 xl:w-88 border-r border-slate-800/80 bg-slate-950/50 p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-65px)]">
            {/* Curated Interactive Templates Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                <span>Starter Interactive Decks</span>
                <button
                  type="button"
                  onClick={() => deckJsonInputRef.current?.click()}
                  className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" /> Import JSON
                </button>
                <input
                  ref={deckJsonInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportDeckJson}
                  className="hidden"
                />
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {CURATED_PRESENTATION_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setDeck(JSON.parse(JSON.stringify(tpl)));
                      setActiveSlideIndex(0);
                    }}
                    className={`px-3 py-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      deck.id === tpl.id
                        ? 'bg-cyan-950/50 border-cyan-400 text-white font-bold'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{tpl.title}</span>
                    <span className="text-[10px] font-mono text-cyan-400 shrink-0 ml-2">
                      {tpl.slides.length} slides
                    </span>
                  </button>
                ))}
                {/* 1-Click 110-Slide Mega-Deck Preset */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    const megaBase: PresentationDeck = {
                      ...JSON.parse(JSON.stringify(CURATED_PRESENTATION_TEMPLATES[0])),
                      id: 'tpl-mega-110-slides',
                      title: 'Complete Exam & STEM Master Encyclopedia (110-Slide Mega-Deck)',
                      subtitle: '110-Slide Comprehensive Interactive Presentation with Quizzes, Polls, Simulators & Bento Grids',
                    };
                    setDeck(expandPresentationDeckToTargetSlides(megaBase, 110));
                    setActiveSlideIndex(0);
                    soundFx.playComplete();
                  }}
                  className={`px-3 py-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                    deck.id === 'tpl-mega-110-slides'
                      ? 'bg-amber-950/60 border-amber-400 text-amber-200 font-black'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:border-amber-400 font-bold'
                  }`}
                >
                  <span className="truncate">🚀 Complete Exam Master Mega-Deck</span>
                  <span className="text-[10px] font-mono bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded shrink-0 ml-2">
                    110 slides
                  </span>
                </button>
              </div>
            </div>

            {/* 1-Click 100+ Slide Mega-Deck Scaler Bar */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-cyan-300">
                <span>⚡ Scale PPTX Deck (100+ Slides)</span>
                <span className="font-mono text-amber-300">{slides.length} / 250 max</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: '+15 Slides', count: Math.min(250, slides.length + 15) },
                  { label: '50 Slides', count: 50 },
                  { label: '100 Slides', count: 100 },
                  { label: '150 Slides', count: 150 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleScaleDeckToCount(btn.count)}
                    className="px-1.5 py-1.5 rounded-lg bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-slate-800 text-[10px] font-black transition-all cursor-pointer text-center"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Filmstrip List */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/70">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Slides ({slides.length})</span>
              </span>
              <button
                type="button"
                onClick={() => handleAddSlide('split-visual')}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Slide</span>
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {slides.map((s, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <div
                    key={s.id || idx}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveSlideIndex(idx);
                    }}
                    className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer flex gap-2.5 ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/50'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-xs font-mono font-black text-cyan-400 shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{s.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span className="capitalize">{s.layout.replace('-', ' ')}</span>
                        <span>•</span>
                        <span className="text-cyan-300 uppercase font-mono">{s.interactiveType}</span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, 'up');
                        }}
                        disabled={idx === 0}
                        className="text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateSlide(idx);
                        }}
                        className="text-slate-400 hover:text-cyan-300 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(idx);
                        }}
                        disabled={slides.length <= 1}
                        className="text-slate-400 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, 'down');
                        }}
                        disabled={idx === slides.length - 1}
                        className="text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Presentation Co-Pilot Generator */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-700/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Presentation Maker</span>
                </span>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setAiSourceMode('topic')}
                    className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                      aiSourceMode === 'topic' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Topic
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiSourceMode('notes')}
                    className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                      aiSourceMode === 'notes' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Paste Notes
                  </button>
                </div>
              </div>

              {aiSourceMode === 'topic' ? (
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Organic Chemistry Alkanes, World War II, Calculus..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-indigo-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              ) : (
                <textarea
                  value={aiNotesInput}
                  onChange={(e) => setAiNotesInput(e.target.value)}
                  rows={3}
                  placeholder="Paste raw study notes, textbook paragraphs, or syllabus outline to convert into slides..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-indigo-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                  <span>Slide Count (Up to 250):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={250}
                      value={aiSlideCount}
                      onChange={(e) =>
                        setAiSlideCount(Math.max(1, Math.min(250, Number(e.target.value) || 1)))
                      }
                      className="w-16 px-2 py-0.5 rounded-lg bg-slate-950 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-black text-center focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">slides</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={4}
                  max={200}
                  step={1}
                  value={Math.min(200, aiSlideCount)}
                  onChange={(e) => setAiSlideCount(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg"
                />
                <div className="flex flex-wrap gap-1">
                  {[8, 16, 30, 50, 100, 120, 150, 200].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setAiSlideCount(cnt)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                        aiSlideCount === cnt
                          ? 'bg-cyan-500 text-slate-950 font-black'
                          : cnt >= 100
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {cnt >= 100 ? `🔥 ${cnt}` : cnt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateDeckAI}
                disabled={isGeneratingDeck || !(aiSourceMode === 'topic' ? aiPrompt.trim() : aiNotesInput.trim())}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {isGeneratingDeck ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Building {aiSlideCount}-Slide Deck...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate Interactive Deck</span>
                  </>
                )}
              </button>
              {aiError && <p className="text-[11px] text-rose-400">{aiError}</p>}
            </div>
          </aside>

          {/* CENTER: LIVE INTERACTIVE SLIDE CANVAS & BLOCK EDITOR */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col items-center">
            <div className="w-full max-w-5xl space-y-6">
              {/* Slide Layout & Interactive Widget Control Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                {/* Layout Switcher */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1">
                    Layout:
                  </span>
                  {SLIDE_LAYOUT_OPTIONS.map((lay) => (
                    <button
                      key={lay.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        updateActiveSlide({ layout: lay.id });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeSlide.layout === lay.id
                          ? 'bg-cyan-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {lay.short}
                    </button>
                  ))}
                </div>

                {/* Interactive Part Selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                    Interactive Part:
                  </span>
                  <select
                    value={activeSlide.interactiveType}
                    onChange={(e) =>
                      updateActiveSlide({ interactiveType: e.target.value as InteractiveWidgetType })
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
                  >
                    {INTERACTIVE_WIDGET_OPTIONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Magic Co-Pilot Quick Actions Bar */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Slide Co-Pilot:
                </span>
                <button
                  type="button"
                  onClick={() => handleAiMagicAction('bento')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold cursor-pointer"
                >
                  ✨ Convert to 4-Card Bento
                </button>
                <button
                  type="button"
                  onClick={() => handleAiMagicAction('timeline')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold cursor-pointer"
                >
                  ⏳ Convert to Process Timeline
                </button>
                <button
                  type="button"
                  onClick={() => handleAiMagicAction('add_simulator')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800 font-semibold cursor-pointer"
                >
                  🎛️ Embed Formula Simulator
                </button>
                <button
                  type="button"
                  onClick={handleAutoMatchImageForActiveSlide}
                  disabled={isAutoMatching}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 font-semibold cursor-pointer"
                >
                  🖼️ {isAutoMatching ? 'Matching...' : 'Auto-Match Visual'}
                </button>
                <button
                  type="button"
                  onClick={handleOpenImageStudio}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold cursor-pointer"
                >
                  🔍 Open Image Studio
                </button>
              </div>

              {/* LIVE WYSIWYG GAMMA SLIDE CANVAS */}
              <div className={`rounded-3xl border p-6 sm:p-10 transition-all ${activeTheme.cardClass}`}>
                {/* Kicker & Slide Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <input
                    type="text"
                    value={activeSlide.kicker || ''}
                    onChange={(e) => updateActiveSlide({ kicker: e.target.value })}
                    placeholder="SLIDE KICKER / MODULE TAG"
                    className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 focus:outline-none w-72"
                  />
                  <span className="text-xs font-mono text-slate-400">
                    Slide {activeSlideIndex + 1} / {slides.length}
                  </span>
                </div>

                {/* Editable Slide Title */}
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateActiveSlide({ title: e.target.value })}
                  className="w-full text-2xl sm:text-3xl font-black text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 focus:outline-none mb-2"
                  placeholder="Slide Headline..."
                />

                {/* Editable Subtitle */}
                <textarea
                  value={activeSlide.subtitle || ''}
                  onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
                  rows={2}
                  placeholder="Add slide subtitle or narrative summary..."
                  className="w-full text-sm sm:text-base text-slate-300 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 focus:outline-none resize-none mb-4"
                />

                {/* Dynamic Visual Layout Preview */}
                {renderSlideLayoutBody(activeSlide)}

                {/* Key Takeaway Banner */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 shrink-0">
                    Key Takeaway:
                  </span>
                  <input
                    type="text"
                    value={activeSlide.keyTakeaway || ''}
                    onChange={(e) => updateActiveSlide({ keyTakeaway: e.target.value })}
                    placeholder="Core takeaway rule for students..."
                    className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none"
                  />
                </div>

                {/* LIVE INTERACTIVE WIDGET PREVIEW & TESTER */}
                {renderInteractivePart(activeSlide, false)}
              </div>

              {/* STRUCTURED SLIDE CONTENT & INTERACTIVE PART EDITOR PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column: Bullet Points & Layout Content Editor */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                      Slide Bullet Points & Narrative
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveSlide({
                          bullets: [...activeSlide.bullets, 'New analytical point or example'],
                        })
                      }
                      className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Point
                    </button>
                  </div>
                  <div className="space-y-2">
                    {activeSlide.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">{bIdx + 1}.</span>
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => {
                            const next = [...activeSlide.bullets];
                            next[bIdx] = e.target.value;
                            updateActiveSlide({ bullets: next });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                        {activeSlide.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveSlide({
                                bullets: activeSlide.bullets.filter((_, i) => i !== bIdx),
                              })
                            }
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Speaker Notes Editor */}
                  <div className="pt-3 border-t border-slate-800">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Presenter Speaker Notes (Included in PPTX & PDF Exports)
                    </label>
                    <textarea
                      value={activeSlide.speakerNotes}
                      onChange={(e) => updateActiveSlide({ speakerNotes: e.target.value })}
                      rows={2}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      placeholder="Add talking points, timing cues, and classroom instructions..."
                    />
                  </div>
                </div>

                {/* Right Column: Interactive Widget Customizer */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Customize Interactive Widget ({activeSlide.interactiveType.toUpperCase()})
                  </h4>

                  {activeSlide.interactiveType === 'quiz' && activeSlide.quizWidget && (
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={activeSlide.quizWidget.question}
                        onChange={(e) =>
                          updateActiveSlide({
                            quizWidget: { ...activeSlide.quizWidget!, question: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
                        placeholder="Quiz checkpoint question..."
                      />
                      <div className="space-y-1.5">
                        {activeSlide.quizWidget.options.map((opt, oIdx) => {
                          const isCorrect =
                            opt.trim().toLowerCase() ===
                            activeSlide.quizWidget!.correctAnswer.trim().toLowerCase();
                          return (
                            <div key={oIdx} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateActiveSlide({
                                    quizWidget: { ...activeSlide.quizWidget!, correctAnswer: opt },
                                  })
                                }
                                className={`w-6 h-6 rounded-lg text-[10px] font-black cursor-pointer ${
                                  isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                }`}
                                title="Click to mark as correct answer"
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </button>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const nextOpts = [...activeSlide.quizWidget!.options];
                                  const wasCorrect = isCorrect;
                                  nextOpts[oIdx] = e.target.value;
                                  updateActiveSlide({
                                    quizWidget: {
                                      ...activeSlide.quizWidget!,
                                      options: nextOpts,
                                      correctAnswer: wasCorrect
                                        ? e.target.value
                                        : activeSlide.quizWidget!.correctAnswer,
                                    },
                                  });
                                }}
                                className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                              />
                            </div>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        value={activeSlide.quizWidget.explanation}
                        onChange={(e) =>
                          updateActiveSlide({
                            quizWidget: { ...activeSlide.quizWidget!, explanation: e.target.value },
                          })
                        }
                        placeholder="Answer explanation..."
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                      />
                    </div>
                  )}

                  {activeSlide.interactiveType === 'simulator' && activeSlide.simulatorWidget && (
                    <div className="space-y-2 text-xs">
                      <input
                        type="text"
                        value={activeSlide.simulatorWidget.title}
                        onChange={(e) =>
                          updateActiveSlide({
                            simulatorWidget: { ...activeSlide.simulatorWidget!, title: e.target.value },
                          })
                        }
                        placeholder="Simulator Title"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={activeSlide.simulatorWidget.variableLabel}
                          onChange={(e) =>
                            updateActiveSlide({
                              simulatorWidget: {
                                ...activeSlide.simulatorWidget!,
                                variableLabel: e.target.value,
                              },
                            })
                          }
                          placeholder="Input Variable Name"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={activeSlide.simulatorWidget.multiplier}
                          onChange={(e) =>
                            updateActiveSlide({
                              simulatorWidget: {
                                ...activeSlide.simulatorWidget!,
                                multiplier: Number(e.target.value) || 1,
                              },
                            })
                          }
                          placeholder="Formula Multiplier"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {activeSlide.interactiveType !== 'quiz' && activeSlide.interactiveType !== 'simulator' && (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Interact directly with the <strong>{activeSlide.interactiveType}</strong> widget on the slide canvas above, or switch to Quiz / Simulator to customize parameters.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        /* 3. CINEMA INTERACTIVE PRESENTER MODE */
        <div
          onMouseMove={(e) => {
            if (laserPointerActive) {
              setLaserCoords({ x: e.clientX, y: e.clientY });
            }
          }}
          className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full relative"
        >
          {laserPointerActive && laserCoords && (
            <div
              className="fixed w-5 h-5 rounded-full bg-rose-500 shadow-[0_0_20px_8px_rgba(244,63,94,0.85)] pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
              style={{ left: laserCoords.x, top: laserCoords.y }}
            />
          )}

          {!isComplete ? (
            <div className="w-full space-y-5">
              {/* Presenter Top HUD */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono">
                    Slide {presenterIndex + 1} of {slides.length}
                  </span>
                  {streak > 1 && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{streak} Streak!</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-mono font-bold">Session XP: {score}</span>
                </div>
              </div>

              {/* Active Presenter Slide */}
              {slides[presenterIndex] && (
                <div className={`rounded-3xl border p-8 sm:p-12 shadow-2xl ${activeTheme.cardClass}`}>
                  {slides[presenterIndex].kicker && (
                    <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-2">
                      {slides[presenterIndex].kicker}
                    </div>
                  )}
                  <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-3">
                    {slides[presenterIndex].title}
                  </h1>
                  {slides[presenterIndex].subtitle && (
                    <p className="text-base sm:text-lg text-slate-300 mb-6 leading-relaxed">
                      {slides[presenterIndex].subtitle}
                    </p>
                  )}

                  {renderSlideLayoutBody(slides[presenterIndex])}

                  {slides[presenterIndex].keyTakeaway && (
                    <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 text-sm font-bold text-cyan-200">
                      💡 <strong>Key Takeaway:</strong> {slides[presenterIndex].keyTakeaway}
                    </div>
                  )}

                  {renderInteractivePart(slides[presenterIndex], true)}
                </div>
              )}

              {/* Speaker Notes Teleprompter HUD */}
              {showSpeakerNotesHud && slides[presenterIndex]?.speakerNotes && (
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-amber-300 uppercase tracking-wider mr-2">
                      Presenter Teleprompter:
                    </span>
                    <span>{slides[presenterIndex].speakerNotes}</span>
                  </div>
                </div>
              )}

              {/* Presenter Controls Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (presenterIndex > 0) {
                      soundFx.playClick();
                      setPresenterIndex(presenterIndex - 1);
                    }
                  }}
                  disabled={presenterIndex === 0}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-bold text-xs border border-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Slide</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPresenterIndex(i)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        i === presenterIndex ? 'w-7 bg-cyan-400' : 'w-2.5 bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    if (presenterIndex + 1 < slides.length) {
                      setPresenterIndex(presenterIndex + 1);
                    } else {
                      soundFx.playComplete();
                      setIsComplete(true);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>{presenterIndex === slides.length - 1 ? 'Finish Presentation' : 'Next Slide'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className={`w-full max-w-lg rounded-3xl border p-8 text-center space-y-6 ${activeTheme.cardClass}`}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 mx-auto flex items-center justify-center text-slate-950 shadow-xl">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Presentation Complete!</h2>
              <p className="text-xs text-slate-300">
                You completed all {slides.length} interactive slides in <strong>{deck.title}</strong> and earned{' '}
                <strong className="text-cyan-300">{score} XP</strong>.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPresenterIndex(0);
                    setIsComplete(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Replay Presentation
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Download PPTX / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setMode('editor')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Back to Editor
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MULTI-FORMAT EXPORT & DOWNLOAD MODAL (PPTX, PDF, HTML5, DOC, MD, JSON) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 text-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-300 text-slate-950 flex items-center justify-center font-black">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Download Presentation Deck</h3>
                  <p className="text-xs text-slate-400">
                    Export "{deck.title}" ({slides.length} slides) in PowerPoint, Widescreen PDF, Interactive HTML5 & more
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Export Options Checkboxes */}
            <div className="flex flex-wrap items-center gap-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                <input
                  type="checkbox"
                  checked={includeSpeakerNotesInExport}
                  onChange={(e) => setIncludeSpeakerNotesInExport(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>Include Presenter Speaker Notes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                <input
                  type="checkbox"
                  checked={includeAnswerKeysInExport}
                  onChange={(e) => setIncludeAnswerKeysInExport(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>Include Interactive Quiz Answer Keys & Explanations</span>
              </label>
            </div>

            {/* Export Format Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRunExport('pptx')}
                disabled={isExportingFile !== null}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/90 border-2 border-amber-400/60 text-left transition-all cursor-pointer flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm text-white flex items-center gap-2">
                    <span>PowerPoint Deck (.PPTX)</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-300 text-slate-950 text-[9px] font-black">
                      16:9 NATIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Editable Microsoft PowerPoint & Google Slides deck with themed cards, quizzes & speaker notes.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRunExport('pdf')}
                disabled={isExportingFile !== null}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/90 border-2 border-cyan-400/60 text-left transition-all cursor-pointer flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-cyan-400/20 text-cyan-300 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm text-white flex items-center gap-2">
                    <span>Widescreen Slides (.PDF)</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 text-[9px] font-black">
                      PRINT / SHARE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    High-resolution 16:9 landscape PDF slide deck ready for projection or printing.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRunExport('html')}
                disabled={isExportingFile !== null}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-400 text-left transition-all cursor-pointer flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-emerald-400/20 text-emerald-300 shrink-0">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm text-white">Interactive Web App (.HTML)</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standalone offline HTML5 presentation with playable quizzes & keyboard navigation.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRunExport('doc')}
                disabled={isExportingFile !== null}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-400 text-left transition-all cursor-pointer flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-indigo-400/20 text-indigo-300 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm text-white">Word Lecture Handout (.DOC)</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Formatted Microsoft Word study handout with tables, checkpoints & notes.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRunExport('md')}
                disabled={isExportingFile !== null}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-600 text-left transition-all cursor-pointer flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm text-white">Markdown Study Notes (.MD)</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Clean Notion / Obsidian compatible Markdown outline of all slides.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRunExport('json')}
                disabled={isExportingFile !== null}
                className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-600 text-left transition-all cursor-pointer flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-300 shrink-0">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm text-white">Gamma Deck Project (.JSON)</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Save full project file to reload and edit in Gamma AI+ Studio anytime.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. IMAGE PICKER & VISUAL SEARCH MODAL */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Visual Image Studio</h3>
                  <p className="text-[11px] text-slate-400">
                    Search Google & Web Images or encyclopedias for slide visuals
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveImageTab('search')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold cursor-pointer ${
                  activeImageTab === 'search' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Google & Web Search
              </button>
              <button
                type="button"
                onClick={() => setActiveImageTab('curated')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold cursor-pointer ${
                  activeImageTab === 'curated' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Curated Gallery
              </button>
              <button
                type="button"
                onClick={() => setActiveImageTab('custom')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold cursor-pointer ${
                  activeImageTab === 'custom' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom URL & Upload
              </button>
            </div>

            {activeImageTab === 'search' && (
              <div className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePerformLiveSearch(imageSearchKeyword);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={imageSearchKeyword}
                    onChange={(e) => setImageSearchKeyword(e.target.value)}
                    placeholder="Search scientific diagrams, historical photos, charts..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={isLiveSearching}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    {isLiveSearching ? 'Searching...' : 'Search'}
                  </button>
                </form>

                {liveSearchResults.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto">
                    {liveSearchResults.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          updateActiveSlide({
                            imageUrl: img.url,
                            imageCaption: img.caption,
                            imageSource: img.source,
                            imageAttribution: img.attribution,
                          });
                          setIsImageModalOpen(false);
                        }}
                        className="rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-400 text-left bg-slate-950 flex flex-col cursor-pointer"
                      >
                        <img
                          src={img.thumbnail || img.url}
                          alt={img.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-24 object-cover"
                        />
                        <div className="p-2 text-[10px] text-slate-300 line-clamp-2">{img.caption}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeImageTab === 'curated' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto">
                {THEMATIC_VISUAL_ASSETS.map((asset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      updateActiveSlide({
                        imageUrl: asset.url,
                        imageCaption: asset.caption,
                      });
                      setIsImageModalOpen(false);
                    }}
                    className="relative rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-400 text-left cursor-pointer"
                  >
                    <img src={asset.url} alt={asset.caption} className="w-full h-28 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1.5 text-[10px] font-bold text-white capitalize">
                      {asset.keywords[0]}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeImageTab === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Direct Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          updateActiveSlide({ imageUrl: customImageUrl.trim() });
                          setIsImageModalOpen(false);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Upload Image File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Choose Local Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
