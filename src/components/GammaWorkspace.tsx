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
  HelpCircle,
  Share2,
  Download,
  Upload,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Palette,
  Eye,
  Layers,
  Award,
  Maximize2,
  Minimize2,
  Check,
  Search,
  ExternalLink,
  Wand2,
  Flame,
  Layout,
  Sliders,
  X,
  Globe,
} from 'lucide-react';
import { Question, QuizResponse, PersonaType, DifficultyType, DeckTheme } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { THEMATIC_VISUAL_ASSETS, resolveThematicVisual } from '../utils/thematicImages';
import { MediaAttributionBadge } from './MediaAttributionBadge';

interface GammaWorkspaceProps {
  persona: PersonaType;
  onLaunchAssessment: (quiz: QuizResponse) => void;
  onSaveToLibrary?: (quiz: QuizResponse) => void;
  initialQuiz?: QuizResponse | null;
}

const DECK_THEMES: Array<{
  id: DeckTheme;
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

export const GammaWorkspace: React.FC<GammaWorkspaceProps> = ({
  persona,
  onLaunchAssessment,
  onSaveToLibrary,
  initialQuiz,
}) => {
  // Deck State
  const [deckTitle, setDeckTitle] = useState('Interactive Knowledge Deck');
  const [deckSummary, setDeckSummary] = useState('Crafted in Gamma Interactive Studio');
  const [deckTheme, setDeckTheme] = useState<DeckTheme>('gamma-dark');
  const [difficulty, setDifficulty] = useState<DifficultyType>('Intermediate');
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Mode: 'editor' or 'present' (Interactive Player)
  const [mode, setMode] = useState<'editor' | 'present'>('editor');

  // AI Generator Prompt Modal / Bar
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCardCount, setAiCardCount] = useState(5);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Image Picker Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageSearchKeyword, setImageSearchKeyword] = useState('');
  const [imageCaptionDraft, setImageCaptionDraft] = useState('');
  const [liveSearchResults, setLiveSearchResults] = useState<
    Array<{ url: string; thumbnail?: string; caption: string; source: string; sourceUrl?: string; attribution?: string }>
  >([]);
  const [imageEngine, setImageEngine] = useState<'all' | 'web' | 'wikimedia'>('all');
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'search' | 'curated' | 'custom'>('search');

  // Interactive Presenter State
  const [presenterIndex, setPresenterIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initial Questions Structure
  const [cards, setCards] = useState<Question[]>([
    {
      id: 1,
      type: 'multiple_choice',
      question: 'Which planetary moon in our solar system exhibits active cryovolcanic plumes erupting water vapor into space?',
      options: ['Europa (Jupiter)', 'Enceladus (Saturn)', 'Titan (Saturn)', 'Triton (Neptune)'],
      correct_answer: 'Enceladus (Saturn)',
      explanation:
        'Cassini spacecraft data revealed that Saturn’s ice-covered moon Enceladus ejects high-velocity plumes of saline water, silica nanoparticles, and simple organics from its south polar "tiger stripe" fractures.',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      image_caption: 'Deep space probe capture of active planetary moons and celestial oceans.',
      image_layout: 'top',
      image_source: 'Unsplash',
      image_source_url: 'https://unsplash.com',
      image_attribution: 'Unsplash Educational Collection',
      gamified_feedback: {
        success_quote: 'Outstanding astrophysics knowledge! Enceladus is one of the premier ocean world candidates.',
        hint: 'This moon orbits the ringed planet Saturn and feeds its diffuse E-ring.',
      },
      points: 20,
      bloom_level: 'Understand',
      domain: 'Foundations',
    },
    {
      id: 2,
      type: 'multiple_choice',
      question: 'What organelle within eukaryotic cells houses the electron transport chain across its inner folded cristae?',
      options: ['Mitochondria', 'Endoplasmic Reticulum', 'Golgi Apparatus', 'Peroxisome'],
      correct_answer: 'Mitochondria',
      explanation:
        'The mitochondrial inner membrane contains Complexes I through IV and ATP synthase, using a proton electrochemical gradient to synthesize adenosine triphosphate (ATP).',
      image_url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&auto=format&fit=crop&q=80',
      image_caption: 'Fluorescence microscopy showing eukaryotic organelle architecture and cellular metabolism.',
      image_layout: 'split',
      image_source: 'Unsplash',
      image_source_url: 'https://unsplash.com',
      image_attribution: 'Unsplash Educational Collection',
      gamified_feedback: {
        success_quote: 'Spot on! Cellular bioenergetics mastered.',
        hint: 'Often termed the energetic powerhouse of eukaryotic cells.',
      },
      points: 20,
      bloom_level: 'Apply',
      domain: 'Applied Logic',
    },
  ]);

  // Load initialQuiz if passed in
  useEffect(() => {
    if (initialQuiz && initialQuiz.questions && initialQuiz.questions.length > 0) {
      setDeckTitle(initialQuiz.quiz_title || 'Imported Quiz Deck');
      setDeckSummary(initialQuiz.summary || 'Interactive Gamma Assessment');
      if (initialQuiz.deck_theme) setDeckTheme(initialQuiz.deck_theme);
      if (initialQuiz.difficulty) setDifficulty(initialQuiz.difficulty);

      // Ensure every question has an image
      const enriched = initialQuiz.questions.map((q, idx) => {
        if (!q.image_url) {
          const vis = resolveThematicVisual(
            `${initialQuiz.quiz_title || ''} ${q.correct_answer || ''} ${q.image_search_query || ''} ${q.question || ''}`,
            idx
          );
          return {
            ...q,
            image_url: vis.url,
            image_caption: q.image_caption || vis.caption,
            image_layout: q.image_layout || vis.layout,
            image_source: 'Unsplash',
            image_source_url: 'https://unsplash.com',
            image_attribution: 'Unsplash Educational Collection',
          };
        }
        return q;
      });
      setCards(enriched);
      setActiveCardIndex(0);
    }
  }, [initialQuiz]);

  const activeCard = cards[activeCardIndex] || cards[0];
  const activeTheme = DECK_THEMES.find((t) => t.id === deckTheme) || DECK_THEMES[0];

  // Helper to update active card
  const updateActiveCard = (partial: Partial<Question>) => {
    setCards((prev) => {
      const copy = [...prev];
      if (copy[activeCardIndex]) {
        copy[activeCardIndex] = { ...copy[activeCardIndex], ...partial };
      }
      return copy;
    });
  };

  // Add Card
  const handleAddCard = () => {
    soundFx.playClick();
    const newId = cards.length + 1;
    const visual = resolveThematicVisual(deckTitle, newId);
    const newCard: Question = {
      id: newId,
      type: 'multiple_choice',
      question: `New Interactive Question #${newId}`,
      options: ['Correct Option A', 'Distractor B', 'Distractor C', 'Distractor D'],
      correct_answer: 'Correct Option A',
      explanation: 'Detailed learning explanation explaining why Option A is correct.',
      image_url: visual.url,
      image_caption: visual.caption,
      image_layout: 'top',
      image_source: 'Unsplash',
      image_source_url: 'https://unsplash.com',
      image_attribution: 'Unsplash Educational Collection',
      gamified_feedback: {
        success_quote: 'Great thinking! Concept identified accurately.',
        hint: 'Look closely at the key terminology in the question.',
      },
      points: 20,
      bloom_level: 'Understand',
      domain: 'Applied Logic',
    };
    setCards([...cards, newCard]);
    setActiveCardIndex(cards.length);
  };

  // Duplicate Card
  const handleDuplicateCard = (idx: number) => {
    soundFx.playClick();
    const target = cards[idx];
    if (!target) return;
    const duplicated: Question = {
      ...JSON.parse(JSON.stringify(target)),
      id: cards.length + 1,
      question: `${target.question} (Copy)`,
    };
    const next = [...cards];
    next.splice(idx + 1, 0, duplicated);
    setCards(next);
    setActiveCardIndex(idx + 1);
  };

  // Delete Card
  const handleDeleteCard = (idx: number) => {
    if (cards.length <= 1) return;
    soundFx.playClick();
    const next = cards.filter((_, i) => i !== idx);
    setCards(next);
    setActiveCardIndex(Math.max(0, idx - 1));
  };

  // Move Card Up/Down
  const handleMoveCard = (idx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === cards.length - 1)) return;
    soundFx.playClick();
    const targetIndex = direction === 'up' ? idx - 1 : idx + 1;
    const next = [...cards];
    const temp = next[idx];
    next[idx] = next[targetIndex];
    next[targetIndex] = temp;
    setCards(next);
    setActiveCardIndex(targetIndex);
  };

  // AI Prompt to Deck Generator
  const handleGenerateDeckAI = async () => {
    if (!aiPrompt.trim()) return;
    soundFx.playClick();
    setIsGeneratingDeck(true);
    setAiError(null);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: aiPrompt.trim(),
          questionCount: aiCardCount,
          difficulty,
          persona,
          promptStyle: 'Interactive Visual Slideshow',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.quiz) {
        throw new Error(data.error || 'Failed to generate interactive deck.');
      }

      const generatedQuiz: QuizResponse = data.quiz;
      setDeckTitle(generatedQuiz.quiz_title || aiPrompt);
      setDeckSummary(generatedQuiz.summary || `Interactive deck on ${aiPrompt}`);
      if (generatedQuiz.questions && generatedQuiz.questions.length > 0) {
        setCards(generatedQuiz.questions);
        setActiveCardIndex(0);
      }
      soundFx.playComplete();
    } catch (err: unknown) {
      soundFx.playIncorrect();
      setAiError((err as Error).message || 'Generation error. Please retry.');
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  // Local Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateActiveCard({
          image_url: reader.result,
          image_caption: file.name.replace(/\.[^/.]+$/, ''),
        });
        setIsImageModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Perform Live Search for Google, Web, and Wikimedia Commons visuals
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

  // Open Image Studio with auto-prefilled topic
  const handleOpenImageStudio = () => {
    soundFx.playClick();
    const defaultSearch = activeCard.image_search_query || activeCard.question.replace(/^(what is|what are|which of the following|which|how does|why do)\s+/i, '').replace(/[?!.,;:()]/g, ' ').trim().slice(0, 45);
    setImageSearchKeyword(defaultSearch);
    setImageCaptionDraft(activeCard.image_caption || '');
    setIsImageModalOpen(true);
    handlePerformLiveSearch(defaultSearch);
  };

  // Auto-Match directly related educational image for the active card
  const handleAutoMatchImageForActiveCard = async () => {
    if (!activeCard) return;
    setIsAutoMatching(true);
    soundFx.playClick();
    try {
      const phrase = activeCard.image_search_query || activeCard.question;
      const res = await fetch('/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: phrase }),
      });
      const data = await res.json();
      if (data.success && data.images && data.images.length > 0) {
        const topImg = data.images[0];
        updateActiveCard({
          image_url: topImg.url,
          image_caption: topImg.caption,
          image_search_query: phrase,
          image_source: topImg.source,
          image_source_url: topImg.sourceUrl,
          image_attribution: topImg.attribution,
        });
        soundFx.playCorrect();
      } else {
        soundFx.playIncorrect();
      }
    } catch (e) {
      console.warn('Auto match image error:', e);
      soundFx.playIncorrect();
    } finally {
      setIsAutoMatching(false);
    }
  };

  // Start Interactive Presentation Mode
  const handleStartPresenting = () => {
    soundFx.playClick();
    setPresenterIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setScore(0);
    setStreak(0);
    setIsComplete(false);
    setShowConfetti(false);
    setMode('present');
  };

  // Answer Selected in Presenter
  const handleSelectAnswerInPresenter = (option: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(option);
    setHasAnswered(true);

    const currentPresenterCard = cards[presenterIndex];
    const isCorrect = option.trim().toLowerCase() === currentPresenterCard.correct_answer.trim().toLowerCase();

    if (isCorrect) {
      soundFx.playCorrect();
      setScore((prev) => prev + (currentPresenterCard.points || 20));
      setStreak((prev) => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      soundFx.playIncorrect();
      setStreak(0);
    }
  };

  // Advance in Presenter
  const handleNextInPresenter = () => {
    soundFx.playClick();
    if (presenterIndex + 1 < cards.length) {
      setPresenterIndex(presenterIndex + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      soundFx.playComplete();
      setIsComplete(true);
    }
  };

  const handlePrevInPresenter = () => {
    if (presenterIndex > 0) {
      soundFx.playClick();
      setPresenterIndex(presenterIndex - 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    }
  };

  // Export as Full Quiz Me! Assessment
  const handleLaunchToRunner = () => {
    soundFx.playClick();
    const quizPayload: QuizResponse = {
      app_name: 'Quiz Me!',
      persona,
      quiz_title: deckTitle,
      summary: deckSummary,
      difficulty,
      deck_theme: deckTheme,
      cover_image: cards[0]?.image_url,
      questions: cards,
    };
    onLaunchAssessment(quizPayload);
  };

  // Save Deck to Library / Local
  const handleSaveDeck = () => {
    soundFx.playClick();
    const quizPayload: QuizResponse = {
      app_name: 'Quiz Me!',
      persona,
      quiz_title: deckTitle,
      summary: deckSummary,
      difficulty,
      deck_theme: deckTheme,
      cover_image: cards[0]?.image_url,
      questions: cards,
    };
    if (onSaveToLibrary) {
      onSaveToLibrary(quizPayload);
    }
    const blob = new Blob([JSON.stringify(quizPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-deck.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${activeTheme.bgClass} transition-colors duration-300 flex flex-col`}>
      {/* 1. GAMMA TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 px-4 py-3 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Left: Deck Branding & Editable Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
            <Layout className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              className="font-black text-base sm:text-lg tracking-tight bg-transparent text-white border-b border-transparent hover:border-slate-600 focus:border-cyan-400 focus:outline-none transition-colors truncate w-48 sm:w-80"
              title="Click to rename deck"
            />
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{cards.length} Interactive Cards</span>
              <span>•</span>
              <span className="capitalize">{difficulty}</span>
              <span>•</span>
              <span className="text-cyan-400 font-semibold">Gamma Visual Studio</span>
            </div>
          </div>
        </div>

        {/* Center: Theme Selector Dropdown */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <Palette className="w-4 h-4 text-slate-400 ml-1.5 mr-0.5" />
          {DECK_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setDeckTheme(theme.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                deckTheme === theme.id
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={`Switch theme to ${theme.name}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-slate-700"
                style={{ backgroundColor: theme.previewColor }}
              />
              <span className="hidden md:inline">{theme.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Right: Mode Toggles & Launch Actions */}
        <div className="flex items-center gap-2">
          {mode === 'editor' ? (
            <>
              <button
                type="button"
                onClick={handleStartPresenting}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Present Deck</span>
              </button>
              <button
                type="button"
                onClick={handleLaunchToRunner}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Launch in main assessment engine with timed scoring"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Exam Mode</span>
              </button>
              <button
                type="button"
                onClick={handleSaveDeck}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title="Export deck as JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setMode('editor');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Back to Editor</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTENT */}
      {mode === 'editor' ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: GAMMA THUMBNAIL SLIDE STRIP */}
          <aside className="w-full lg:w-72 xl:w-80 border-r border-slate-800/80 bg-slate-950/40 p-4 flex flex-col gap-3 overflow-y-auto max-h-60 lg:max-h-[calc(100vh-65px)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Card Slides ({cards.length})</span>
              </span>
              <button
                type="button"
                onClick={handleAddCard}
                className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Add new card"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Thumbnail Cards List */}
            <div className="space-y-2.5 flex-1">
              {cards.map((card, idx) => {
                const isActive = idx === activeCardIndex;
                return (
                  <div
                    key={card.id || idx}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveCardIndex(idx);
                    }}
                    className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {/* Slide Number & Thumbnail */}
                    <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      {card.image_url ? (
                        <img
                          src={card.image_url}
                          alt="Thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono font-bold text-white">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Card Snippet */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-snug">
                        {card.question || 'Untitled Question'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {card.options?.length || 4} options
                        </span>
                        <span>•</span>
                        <span>{card.points || 20}pts</span>
                      </div>
                    </div>

                    {/* Quick Reorder / Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveCard(idx, 'up');
                        }}
                        disabled={idx === 0}
                        className="text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateCard(idx);
                        }}
                        className="text-slate-400 hover:text-cyan-300 cursor-pointer"
                        title="Duplicate Card"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(idx);
                        }}
                        disabled={cards.length <= 1}
                        className="text-slate-400 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveCard(idx, 'down');
                        }}
                        disabled={idx === cards.length - 1}
                        className="text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Generator Quick Trigger */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-300">
                    <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Gamma AI Co-Pilot</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                    {aiCardCount} {aiCardCount === 1 ? 'card' : 'cards'}
                  </span>
                </div>

                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Quantum Physics, Roman Empire, Photosynthesis..."
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-indigo-900/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />

                {/* Question Count Selector */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>Card Count</span>
                    <span>Max: 100</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {[5, 10, 25, 50, 75, 100].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setAiCardCount(cnt)}
                        className={`py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          aiCardCount === cnt
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs shadow-indigo-600/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={aiCardCount}
                    onChange={(e) => setAiCardCount(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded-lg mt-1"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateDeckAI}
                  disabled={isGeneratingDeck || !aiPrompt.trim()}
                  className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-600/30"
                >
                  {isGeneratingDeck ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating {aiCardCount} Cards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate {aiCardCount} Cards</span>
                    </>
                  )}
                </button>
                {aiError && <p className="text-[11px] text-rose-400 leading-tight">{aiError}</p>}
              </div>
            </div>
          </aside>

          {/* CENTER: ACTIVE CARD VISUAL CANVAS */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-6">
              {/* Card Canvas Outer Container */}
              <div className={`rounded-3xl border p-6 sm:p-8 transition-all ${activeTheme.cardClass}`}>
                {/* Visual Header / Image Studio */}
                <div className="space-y-3 pb-6 border-b border-slate-800/60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${activeTheme.badgeClass}`}>
                        Card {activeCardIndex + 1} of {cards.length}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {activeCard.domain || 'Applied Logic'} • {activeCard.points || 20} pts
                      </span>
                    </div>

                    {/* Image Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={isAutoMatching}
                        onClick={handleAutoMatchImageForActiveCard}
                        title="Search Wikipedia & Commons for real image matching this question"
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Wand2 className={`w-3.5 h-3.5 ${isAutoMatching ? 'animate-spin' : ''}`} />
                        <span>{isAutoMatching ? 'Matching...' : 'Auto-Match Image'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenImageStudio}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Image Studio</span>
                      </button>

                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {(['top', 'split'] as const).map((lay) => (
                          <button
                            key={lay}
                            type="button"
                            onClick={() => updateActiveCard({ image_layout: lay })}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                              (activeCard.image_layout || 'top') === lay
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {lay} View
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Visual Image Render */}
                  {activeCard.image_url && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-md group">
                      <img
                        src={activeCard.image_url}
                        alt={activeCard.image_caption || 'Card visual context'}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.dataset.hasFallenBack) {
                            target.dataset.hasFallenBack = 'true';
                            const fallback = resolveThematicVisual(
                              `${deckTitle || ''} ${activeCard.image_search_query || ''} ${activeCard.question || ''}`
                            );
                            target.src = fallback.url;
                          }
                        }}
                        className="w-full max-h-80 object-cover object-center rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                      />
                      {/* Top-Right Floating Attribution Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <MediaAttributionBadge
                          imageUrl={activeCard.image_url}
                          source={activeCard.image_source}
                          sourceUrl={activeCard.image_source_url}
                          attribution={activeCard.image_attribution}
                          variant="badge"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300 z-10">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <input
                            type="text"
                            value={activeCard.image_caption || ''}
                            onChange={(e) => updateActiveCard({ image_caption: e.target.value })}
                            placeholder="Add image caption..."
                            className="bg-transparent border-b border-slate-600 focus:border-cyan-400 focus:outline-none text-xs text-white placeholder-slate-400 w-64 sm:w-96"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => updateActiveCard({ image_url: null })}
                          className="px-2 py-1 rounded bg-black/60 hover:bg-rose-600/80 text-[10px] text-white transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Prompt Editor */}
                <div className="py-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Question Prompt
                    </label>
                    <textarea
                      value={activeCard.question}
                      onChange={(e) => updateActiveCard({ question: e.target.value })}
                      rows={3}
                      className="w-full p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-white text-base sm:text-lg font-bold leading-relaxed focus:outline-none focus:border-cyan-400 transition-colors"
                      placeholder="Type the interactive question prompt here..."
                    />
                  </div>

                  {/* Options List with designation of correct answer */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Interactive Answer Options (Select the correct answer)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const curr = activeCard.options || [];
                          if (curr.length < 6) {
                            updateActiveCard({ options: [...curr, `Option ${String.fromCharCode(65 + curr.length)}`] });
                          }
                        }}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(activeCard.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, optIdx) => {
                        const isCorrect = opt.trim().toLowerCase() === activeCard.correct_answer.trim().toLowerCase();
                        const letter = String.fromCharCode(65 + optIdx);

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50'
                                : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                updateActiveCard({ correct_answer: opt });
                              }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 cursor-pointer ${
                                isCorrect
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                              title={isCorrect ? 'Correct answer' : 'Click to set as correct answer'}
                            >
                              {isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : letter}
                            </button>

                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const nextOptions = [...(activeCard.options || [])];
                                nextOptions[optIdx] = e.target.value;
                                const isChangingCorrect = opt === activeCard.correct_answer;
                                updateActiveCard({
                                  options: nextOptions,
                                  correct_answer: isChangingCorrect ? e.target.value : activeCard.correct_answer,
                                });
                              }}
                              className="flex-1 bg-transparent text-sm font-medium text-white focus:outline-none"
                            />

                            {(activeCard.options || []).length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const nextOptions = (activeCard.options || []).filter((_, i) => i !== optIdx);
                                  updateActiveCard({
                                    options: nextOptions,
                                    correct_answer: isCorrect ? nextOptions[0] : activeCard.correct_answer,
                                  });
                                }}
                                className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                title="Remove Option"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation & Pedagogy Card */}
                  <div className="pt-4 border-t border-slate-800/60 space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Learning Rationale & Explanation
                      </label>
                      <textarea
                        value={activeCard.explanation}
                        onChange={(e) => updateActiveCard({ explanation: e.target.value })}
                        rows={2}
                        className="w-full p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                        placeholder="Explain why the correct answer is right and impart core concept knowledge..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Success Celebration Quote</label>
                        <input
                          type="text"
                          value={activeCard.gamified_feedback?.success_quote || ''}
                          onChange={(e) =>
                            updateActiveCard({
                              gamified_feedback: {
                                ...(activeCard.gamified_feedback || { hint: '' }),
                                success_quote: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          placeholder="e.g. Spot on! Brilliant analysis."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Gamified Learning Hint</label>
                        <input
                          type="text"
                          value={activeCard.gamified_feedback?.hint || ''}
                          onChange={(e) =>
                            updateActiveCard({
                              gamified_feedback: {
                                ...(activeCard.gamified_feedback || { success_quote: '' }),
                                hint: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          placeholder="e.g. Think about the organelle's inner membrane folds."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeCardIndex > 0) {
                      soundFx.playClick();
                      setActiveCardIndex(activeCardIndex - 1);
                    }
                  }}
                  disabled={activeCardIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-bold text-xs border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Card</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {cards.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setActiveCardIndex(i);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        i === activeCardIndex ? 'w-6 bg-cyan-400' : 'bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (activeCardIndex < cards.length - 1) {
                      soundFx.playClick();
                      setActiveCardIndex(activeCardIndex + 1);
                    } else {
                      handleAddCard();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <span>{activeCardIndex === cards.length - 1 ? '+ Add Next Card' : 'Next Card'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </main>
        </div>
      ) : (
        /* 3. GAMMA INTERACTIVE PRESENTER MODE ("PLAY DECK") */
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
          {!isComplete ? (
            <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Presenter Progress & Streak HUD */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-mono">
                    Card {presenterIndex + 1} of {cards.length}
                  </span>
                  {streak > 1 && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 animate-bounce">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{streak} Streak!</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono font-bold text-sm">Score: {score} XP</span>
                </div>
              </div>

              {/* Gamma Presenter Card */}
              <div className={`rounded-3xl border p-6 sm:p-10 shadow-2xl transition-all ${activeTheme.cardClass}`}>
                {/* Visual Header Image */}
                {cards[presenterIndex]?.image_url && (
                  <div className="mb-6 relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-lg group/media">
                    <img
                      src={cards[presenterIndex].image_url!}
                      alt="Question Visual"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.dataset.hasFallenBack) {
                          target.dataset.hasFallenBack = 'true';
                          const fallback = resolveThematicVisual(
                            `${deckTitle || ''} ${cards[presenterIndex]?.image_search_query || ''} ${cards[presenterIndex]?.question || ''}`
                          );
                          target.src = fallback.url;
                        }
                      }}
                      className="w-full max-h-80 object-cover object-center rounded-2xl"
                    />
                    {!cards[presenterIndex].image_caption && (
                      <div className="absolute top-3 right-3 z-10">
                        <MediaAttributionBadge
                          imageUrl={cards[presenterIndex].image_url}
                          source={cards[presenterIndex].image_source}
                          sourceUrl={cards[presenterIndex].image_source_url}
                          attribution={cards[presenterIndex].image_attribution}
                          variant="badge"
                        />
                      </div>
                    )}
                    {cards[presenterIndex].image_caption && (
                      <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-xs text-xs text-slate-300 flex items-center justify-between gap-3 border-t border-slate-800/60">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{cards[presenterIndex].image_caption}</span>
                        </div>
                        <MediaAttributionBadge
                          imageUrl={cards[presenterIndex].image_url}
                          source={cards[presenterIndex].image_source}
                          sourceUrl={cards[presenterIndex].image_source_url}
                          attribution={cards[presenterIndex].image_attribution}
                          variant="caption"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Question */}
                <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed tracking-tight mb-6">
                  {cards[presenterIndex]?.question}
                </h2>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                  {(cards[presenterIndex]?.options || []).map((option, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = selectedAnswer === option;
                    const isCorrectAnswer =
                      option.trim().toLowerCase() === cards[presenterIndex]?.correct_answer.trim().toLowerCase();

                    let btnStyle =
                      'bg-slate-950/40 border-slate-800 hover:border-cyan-400 text-slate-200 hover:bg-slate-900/60';

                    if (hasAnswered) {
                      if (isCorrectAnswer) {
                        btnStyle = 'bg-emerald-950/60 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 shadow-lg';
                      } else if (isSelected && !isCorrectAnswer) {
                        btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                      } else {
                        btnStyle = 'bg-slate-950/20 border-slate-850 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswerInPresenter(option)}
                        disabled={hasAnswered}
                        className={`p-4 rounded-2xl border text-left font-bold text-sm sm:text-base flex items-center gap-3 transition-all cursor-pointer ${btnStyle}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            hasAnswered && isCorrectAnswer
                              ? 'bg-emerald-400 text-slate-950'
                              : hasAnswered && isSelected
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {hasAnswered && isCorrectAnswer ? <Check className="w-4 h-4 stroke-[3]" /> : letter}
                        </span>
                        <span className="flex-1">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Reveal */}
                {hasAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2">
                      {selectedAnswer?.trim().toLowerCase() ===
                      cards[presenterIndex]?.correct_answer.trim().toLowerCase() ? (
                        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{cards[presenterIndex]?.gamified_feedback?.success_quote || 'Correct! Superb Recall!'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
                          <XCircle className="w-4 h-4" />
                          <span>Not quite. Correct: {cards[presenterIndex]?.correct_answer}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{cards[presenterIndex]?.explanation}</p>
                  </div>
                )}
              </div>

              {/* Presenter Footer Navigation */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevInPresenter}
                  disabled={presenterIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-20 text-white font-bold text-xs border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextInPresenter}
                  disabled={!hasAnswered}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <span>{presenterIndex === cards.length - 1 ? 'Finish Deck' : 'Next Card'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Deck Completion Screen */
            <div className={`w-full max-w-lg rounded-3xl border p-8 text-center space-y-6 ${activeTheme.cardClass} animate-in zoom-in-95 duration-300`}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/30">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight">Interactive Deck Completed!</h2>
                <p className="text-xs text-slate-400">Great mastery of {deckTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">{score}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">XP Points</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{cards.length}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cards Solved</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartPresenting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Replay Deck</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('editor')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit in Canvas</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. IMAGE PICKER & VISUAL SEARCH MODAL */}
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
                  <p className="text-[11px] text-slate-400">Search Google & Web Images or encyclopedias for hyper-specific visual media</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveImageTab('search')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeImageTab === 'search'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Google & Web Search</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveImageTab('curated')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeImageTab === 'curated'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Curated Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveImageTab('custom')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeImageTab === 'custom'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Custom URL & Upload</span>
              </button>
            </div>

            {/* TAB 1: Live Web & Google Images Search */}
            {activeImageTab === 'search' && (
              <div className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePerformLiveSearch(imageSearchKeyword);
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={imageSearchKeyword}
                      onChange={(e) => setImageSearchKeyword(e.target.value)}
                      placeholder="Search Google & Web Images (e.g., mitochondria cristae diagram, Apollo 11 eagle)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isLiveSearching}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLiveSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Search</span>
                    </button>
                    <a
                      href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(imageSearchKeyword || activeCard?.question || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                      title="Open search in Google Images in a new tab"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Google Images</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                </form>

                {/* Engine Selector Chips */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400">Source:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setImageEngine('all');
                        handlePerformLiveSearch(imageSearchKeyword, 'all');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                        imageEngine === 'all'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      🌐 All Web Sources
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageEngine('web');
                        handlePerformLiveSearch(imageSearchKeyword, 'web');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                        imageEngine === 'web'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      🔍 Google & Web
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageEngine('wikimedia');
                        handlePerformLiveSearch(imageSearchKeyword, 'wikimedia');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                        imageEngine === 'wikimedia'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      📚 Wikipedia & Commons
                    </button>
                  </div>
                </div>

                {/* Fast Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Try searching:</span>
                  {['Mitochondria cristae', 'DNA double helix', 'French Revolution', 'Apollo 11 Eagle', 'Photosynthesis Calvin cycle', 'Black hole event horizon'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setImageSearchKeyword(term);
                        handlePerformLiveSearch(term);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {/* Results Grid */}
                {isLiveSearching ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="text-xs">Searching Google & Web Images for hyper-specific visual media...</span>
                  </div>
                ) : liveSearchResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
                    {liveSearchResults.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          updateActiveCard({
                            image_url: img.url,
                            image_caption: img.caption,
                            image_search_query: imageSearchKeyword,
                            image_source: img.source,
                            image_source_url: img.sourceUrl,
                            image_attribution: img.attribution,
                          });
                          setIsImageModalOpen(false);
                        }}
                        className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-400 text-left transition-all cursor-pointer bg-slate-950 flex flex-col"
                      >
                        <div className="relative w-full h-28 bg-slate-900 overflow-hidden">
                          <img
                            src={img.thumbnail || img.url}
                            alt={img.caption}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (img.thumbnail && target.src !== img.thumbnail) {
                                target.src = img.thumbnail;
                              }
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[9px] font-bold text-cyan-300 border border-slate-800">
                            {img.attribution || img.source}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-950/95 border-t border-slate-800 flex-1 flex flex-col justify-between">
                          <p className="text-[11px] font-semibold text-slate-200 line-clamp-2 leading-tight">
                            {img.caption}
                          </p>
                          <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold block mt-1">
                            {img.source}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    No results found. Try typing a specific scientific, historical, or conceptual query above.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Curated Thematic Library */}
            {activeImageTab === 'curated' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Curated High-Definition Educational Imagery
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                  {THEMATIC_VISUAL_ASSETS.map((asset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        updateActiveCard({
                          image_url: asset.url,
                          image_caption: asset.caption,
                          image_source: 'Unsplash',
                          image_source_url: 'https://unsplash.com',
                          image_attribution: 'Unsplash Educational Collection',
                        });
                        setIsImageModalOpen(false);
                      }}
                      className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-400 text-left transition-all cursor-pointer"
                    >
                      <img
                        src={asset.url}
                        alt={asset.caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[11px] font-bold text-white capitalize leading-tight">
                          {asset.keywords[0]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Direct Image URL & Upload */}
            {activeImageTab === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Custom Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          updateActiveCard({ image_url: customImageUrl.trim() });
                          setIsImageModalOpen(false);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Upload Local Image</label>
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
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Choose Image File</span>
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
