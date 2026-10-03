import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ArrowRight,
  Sparkles,
  Code2,
  Atom,
  Dna,
  TrendingUp,
  BrainCircuit,
  Award,
  Filter,
  CheckCircle,
  Star,
  Printer,
  Trash2,
  Users,
  Upload,
  Heart,
  Bookmark,
  MessageSquare,
  Share2,
  Landmark,
  Globe,
  Palette,
  Briefcase,
  Tag,
  X,
} from 'lucide-react';
import { PRESET_TOPICS, PresetTopic } from '../data/presets';
import { PersonaType, QuizResponse } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { FlashcardStudyDeck } from './FlashcardStudyDeck';
import { QuizCommentsModal } from './QuizCommentsModal';
import { ShareQuizModal } from './ShareQuizModal';
import { classifyAudience, AUDIENCE_TIER_CONFIG } from '../utils/audienceClassifier';
import { QuizTrackDetailDrawer, SelectedTrackInfo } from './QuizTrackDetailDrawer';
import { TopCreatorBadge } from './TopCreatorBadge';
import { evaluateCreatorStatus } from '../utils/creatorUtils';
import { useAuth } from '../context/AuthContext';
import {
  CANONICAL_PEDAGOGICAL_TOPICS,
  PEDAGOGICAL_THEME_CONFIG,
  derivePedagogicalTopic,
  CanonicalPedagogicalTopic,
} from '../utils/pedagogicalClassifier';
import {
  subscribeFavorites,
  toggleFavoriteInFirestore,
  toggleQuizLike,
  toggleQuizSave,
  subscribeUserSavedQuizzes,
  SavedQuizDocument,
} from '../services/firestore';

const FAVORITES_STORAGE_KEY = 'quizme_favorite_presets_v1';
const LIKED_QUIZZES_KEY = 'quizme_liked_quizzes_v1';
const SAVED_QUIZZES_KEY = 'quizme_saved_quizzes_v1';

interface CurriculumCatalogProps {
  persona: PersonaType;
  onStartQuiz: (quiz: QuizResponse) => void;
  onOpenRawJsonModal?: (quiz: QuizResponse) => void;
  onOpenWorksheet?: (quiz: QuizResponse) => void;
  customQuizzes?: SavedQuizDocument[];
  onDeleteCustomQuiz?: (quizId: string) => void;
  onOpenUploadQuiz?: () => void;
}

export const CurriculumCatalog: React.FC<CurriculumCatalogProps> = ({
  persona,
  onStartQuiz,
  onOpenWorksheet,
  customQuizzes = [],
  onDeleteCustomQuiz,
  onOpenUploadQuiz,
}) => {
  const { currentAccentConfig } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [studyingQuiz, setStudyingQuiz] = useState<QuizResponse | null>(null);

  // Active quiz for comments/discussion modal
  const [activeCommentsQuiz, setActiveCommentsQuiz] = useState<{
    id: string;
    title: string;
    difficulty?: string;
    persona?: string;
  } | null>(null);

  // Active quiz for sharing
  const [sharingQuiz, setSharingQuiz] = useState<{ quiz: QuizResponse; cloudId?: string } | null>(null);

  // Selected track for Key Takeaways summary drawer
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<SelectedTrackInfo | null>(null);

  const handleOpenTrackDetail = (preset: PresetTopic, quizData: QuizResponse) => {
    soundFx.playSelect();
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

  const handleOpenCustomTrackDetail = (doc: SavedQuizDocument, quizData: QuizResponse) => {
    soundFx.playSelect();
    setSelectedTrackForDetail({
      id: doc.id,
      title: quizData.quiz_title,
      description: quizData.summary,
      pedagogical_topic: quizData.pedagogical_topic,
      pedagogical_subtopic: quizData.pedagogical_subtopic,
      inputText: doc.sourceText || quizData.summary,
      quiz: quizData,
    });
  };

  // Likes and Saves state with local persistence
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LIKED_QUIZZES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(SAVED_QUIZZES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Dynamic counts maps
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});
  const [commentsCountMap, setCommentsCountMap] = useState<Record<string, number>>({});

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch {
          // fallback
        }
      }
    }
    return new Set();
  });

  // Subscribe to cloud favorites and saved quizzes when authenticated
  useEffect(() => {
    if (!user) return;
    const unsubFav = subscribeFavorites(user.uid, (cloudFavs) => {
      if (cloudFavs && cloudFavs.size > 0) {
        setFavorites(new Set(cloudFavs));
      }
    });

    const unsubSaved = subscribeUserSavedQuizzes(user.uid, (cloudSaved) => {
      if (cloudSaved && cloudSaved.size > 0) {
        setSavedIds((prev) => new Set([...prev, ...cloudSaved]));
      }
    });

    return () => {
      unsubFav();
      unsubSaved();
    };
  }, [user]);

  // Sync custom quiz counts from Firestore docs
  useEffect(() => {
    if (customQuizzes && customQuizzes.length > 0) {
      setLikesCountMap((prev) => {
        const next = { ...prev };
        customQuizzes.forEach((q) => {
          if (q.likesCount !== undefined) {
            next[q.id] = q.likesCount;
          }
        });
        return next;
      });

      setCommentsCountMap((prev) => {
        const next = { ...prev };
        customQuizzes.forEach((q) => {
          if (q.commentsCount !== undefined) {
            next[q.id] = q.commentsCount;
          }
        });
        return next;
      });
    }
  }, [customQuizzes]);

  // Persist liked & saved sets locally
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(LIKED_QUIZZES_KEY, JSON.stringify(Array.from(likedIds)));
    } catch {}
  }, [likedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_QUIZZES_KEY, JSON.stringify(Array.from(savedIds)));
    } catch {}
  }, [savedIds]);

  const toggleFavorite = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    const willBeFav = !favorites.has(presetId);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(presetId)) next.delete(presetId);
      else next.add(presetId);
      return next;
    });
    if (user) {
      toggleFavoriteInFirestore(user.uid, presetId, willBeFav).catch((err) => {
        console.error('Error toggling favorite in Firestore:', err);
      });
    }
  };

  const handleToggleLike = (quizId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyLiked = likedIds.has(quizId);
    if (!isCurrentlyLiked) {
      soundFx.playStreak();
    } else {
      soundFx.playClick();
    }

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(quizId);
      else next.add(quizId);
      return next;
    });

    setLikesCountMap((prev) => {
      const current = prev[quizId] || 0;
      return {
        ...prev,
        [quizId]: Math.max(0, isCurrentlyLiked ? current - 1 : current + 1),
      };
    });

    if (user) {
      toggleQuizLike(quizId, user.uid, isCurrentlyLiked).catch((err) => {
        console.warn('Like sync notice:', err);
      });
    }
  };

  const handleToggleSave = (quizId: string, quizTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playSelect();
    const isCurrentlySaved = savedIds.has(quizId);

    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(quizId);
      else next.add(quizId);
      return next;
    });

    if (user) {
      toggleQuizSave(user.uid, quizId, quizTitle, isCurrentlySaved).catch((err) => {
        console.warn('Save sync notice:', err);
      });
    }
  };

  const handleOpenComments = (
    quizId: string,
    title: string,
    difficulty?: string,
    persona?: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    soundFx.playClick();
    setActiveCommentsQuiz({
      id: quizId,
      title,
      difficulty,
      persona,
    });
  };

  const categories = useMemo(() => {
    return [
      'All',
      'STEM',
      'History',
      'Social Sciences',
      'Humanities & Literature',
      'Arts & Culture',
      'Business & Finance',
      'Community & Cloud',
      'Saved Quizzes',
    ];
  }, []);

  const getPresetQuiz = (preset: PresetTopic): QuizResponse => {
    return persona === 'Teacher' ? preset.prebuiltTeacherQuiz : preset.prebuiltStudentQuiz;
  };

  // Safely extract quiz data whether stored nested as doc.quiz or top-level fields
  const getQuizFromDoc = (doc: SavedQuizDocument): QuizResponse => {
    const rawQuiz = doc.quiz || (doc as any);
    const tags = rawQuiz.tags || doc.tags || [];
    const derivedTopic =
      rawQuiz.pedagogical_topic ||
      doc.pedagogical_topic ||
      derivePedagogicalTopic(tags, doc.quiz_title, '');

    return {
      app_name: 'Quiz Me!',
      persona: doc.persona || rawQuiz.persona || 'Student',
      quiz_title: doc.quiz_title || rawQuiz.quiz_title || 'Community Quiz',
      summary: doc.summary || rawQuiz.summary || 'Custom assessment from the community.',
      difficulty: doc.difficulty || rawQuiz.difficulty || 'Intermediate',
      questions: doc.questions || rawQuiz.questions || [],
      study_guide: doc.study_guide || rawQuiz.study_guide || null,
      tags,
      pedagogical_topic: derivedTopic,
      pedagogical_subtopic: rawQuiz.pedagogical_subtopic || doc.pedagogical_subtopic,
    };
  };

  // Dynamic module counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: PRESET_TOPICS.length + customQuizzes.length,
      'Saved Quizzes': savedIds.size + favorites.size,
      'Community & Cloud': customQuizzes.length,
    };

    CANONICAL_PEDAGOGICAL_TOPICS.forEach((cat) => {
      let count = 0;
      PRESET_TOPICS.forEach((p) => {
        const ped =
          p.pedagogical_topic ||
          derivePedagogicalTopic(p.prebuiltStudentQuiz?.tags, p.title, p.category);
        if (ped === cat) count++;
      });
      customQuizzes.forEach((doc) => {
        const q = getQuizFromDoc(doc);
        if (q.pedagogical_topic === cat) count++;
      });
      counts[cat] = count;
    });

    return counts;
  }, [customQuizzes, savedIds, favorites]);

  const filteredPresets = useMemo(() => {
    if (selectedCategory === 'Community & Cloud') return [];
    return PRESET_TOPICS.filter((preset) => {
      let matchesCat = true;
      const pedTopic =
        preset.pedagogical_topic ||
        derivePedagogicalTopic(preset.prebuiltStudentQuiz?.tags, preset.title, preset.category);

      if (selectedCategory === 'Saved Quizzes') {
        matchesCat = savedIds.has(preset.id) || favorites.has(preset.id);
      } else if (selectedCategory !== 'All') {
        matchesCat =
          preset.category === selectedCategory ||
          pedTopic === selectedCategory ||
          (preset.prebuiltStudentQuiz?.tags || []).some(
            (t) => t.replace(/^#/, '').toLowerCase() === selectedCategory.replace(/\s+/g, '').toLowerCase()
          );
      }

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const tagsMatch = (preset.prebuiltStudentQuiz?.tags || []).some((t) =>
        t.toLowerCase().includes(q)
      );

      const matchesSearch =
        preset.title.toLowerCase().includes(q) ||
        preset.description.toLowerCase().includes(q) ||
        preset.category.toLowerCase().includes(q) ||
        pedTopic.toLowerCase().includes(q) ||
        (preset.pedagogical_subtopic || '').toLowerCase().includes(q) ||
        tagsMatch;

      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory, savedIds, favorites]);

  const filteredCustomQuizzes = useMemo(() => {
    if (!customQuizzes || customQuizzes.length === 0) return [];
    return customQuizzes.filter((doc) => {
      const q = getQuizFromDoc(doc);
      const pedTopic = q.pedagogical_topic || 'STEM';

      let matchesCat = true;
      if (selectedCategory === 'Saved Quizzes') {
        matchesCat = savedIds.has(doc.id);
      } else if (selectedCategory === 'Community & Cloud') {
        matchesCat = true;
      } else if (selectedCategory !== 'All') {
        matchesCat =
          pedTopic === selectedCategory ||
          (q.tags || []).some(
            (t) => t.replace(/^#/, '').toLowerCase() === selectedCategory.replace(/\s+/g, '').toLowerCase()
          );
      }

      if (!matchesCat) return false;

      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      const title = (q.quiz_title || '').toLowerCase();
      const summary = (q.summary || '').toLowerCase();
      const topicStr = (q.pedagogical_topic || '').toLowerCase();
      const subtopicStr = (q.pedagogical_subtopic || '').toLowerCase();
      const tagsMatch = (q.tags || []).some((t) => t.toLowerCase().includes(query));

      return (
        title.includes(query) ||
        summary.includes(query) ||
        topicStr.includes(query) ||
        subtopicStr.includes(query) ||
        tagsMatch
      );
    });
  }, [customQuizzes, selectedCategory, searchQuery, savedIds]);

  const handleLaunch = (preset: PresetTopic) => {
    soundFx.playClick();
    const quizData = getPresetQuiz(preset);
    onStartQuiz(quizData);
  };

  const handleLaunchFlashcards = (preset: PresetTopic) => {
    soundFx.playClick();
    const quizData = getPresetQuiz(preset);
    setStudyingQuiz(quizData);
  };

  const renderPresetIcon = (iconName: string, pedagogicalTopic?: string) => {
    if (pedagogicalTopic === 'History' || iconName === 'Landmark') {
      return <Landmark className="w-5 h-5 text-amber-500" />;
    }
    if (pedagogicalTopic === 'Social Sciences' || iconName === 'TrendingUp') {
      return <TrendingUp className="w-5 h-5 text-sky-500" />;
    }
    if (pedagogicalTopic === 'Humanities & Literature') {
      return <BookOpen className="w-5 h-5 text-purple-500" />;
    }
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-5 h-5 text-emerald-500" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-indigo-500" />;
      case 'Dna':
        return <Dna className="w-5 h-5 text-cyan-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-sky-500" />;
      case 'BrainCircuit':
        return <BrainCircuit className="w-5 h-5 text-indigo-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-indigo-500" />;
    }
  };

  const renderPedagogicalBadge = (topic?: string, subtopic?: string) => {
    const canonical = (topic as CanonicalPedagogicalTopic) || 'STEM';
    const config = PEDAGOGICAL_THEME_CONFIG[canonical] || PEDAGOGICAL_THEME_CONFIG.STEM;

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-colors shadow-2xs ${config.badgeClass}`}>
        {canonical === 'STEM' && <Atom className="w-3 h-3 shrink-0" />}
        {canonical === 'History' && <Landmark className="w-3 h-3 shrink-0" />}
        {canonical === 'Social Sciences' && <Globe className="w-3 h-3 shrink-0" />}
        {canonical === 'Humanities & Literature' && <BookOpen className="w-3 h-3 shrink-0" />}
        {canonical === 'Arts & Culture' && <Palette className="w-3 h-3 shrink-0" />}
        {canonical === 'Business & Finance' && <Briefcase className="w-3 h-3 shrink-0" />}
        <span>{config.label}</span>
        {subtopic && (
          <>
            <span className="opacity-40">•</span>
            <span className="font-semibold opacity-90">{subtopic}</span>
          </>
        )}
      </div>
    );
  };

  const renderTagsList = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        {tags.slice(0, 4).map((tag, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playSelect();
              const cleanTag = tag.replace(/^#/, '');
              setSearchQuery(cleanTag);
            }}
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
            title={`Filter by tag ${tag}`}
          >
            {tag}
          </button>
        ))}
      </div>
    );
  };

  const totalResultsCount = filteredPresets.length + filteredCustomQuizzes.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Community Curricula & Assessment Library</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Curriculum & Community Quizzes
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore curated curriculum tracks, interact with community assessments via likes and comments, bookmark your favorites, or launch interactive flashcard decks.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap w-full lg:w-auto">
            {onOpenUploadQuiz && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenUploadQuiz();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span>Upload Quiz File</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedCategory('Community & Cloud')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'Community & Cloud'
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Community ({customQuizzes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('Saved Quizzes')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'Saved Quizzes'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Saved ({savedIds.size})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pedagogical topics, subjects, tags (e.g. STEM, History, Photosynthesis)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1 shrink-0">
            Showing <strong className="text-slate-900 dark:text-white">{totalResultsCount}</strong> modules
          </div>
        </div>

        {/* Pedagogical Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border flex items-center gap-1.5 ${
                  isSelected
                    ? `${currentAccentConfig.activeBtn} text-white shadow-2xs`
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat === 'Saved Quizzes' && <Bookmark className="w-3 h-3 inline fill-amber-400 text-amber-400" />}
                {cat === 'Community & Cloud' && <Sparkles className="w-3 h-3 inline text-indigo-400" />}
                {cat === 'STEM' && <Atom className="w-3 h-3 inline text-emerald-400" />}
                {cat === 'History' && <Landmark className="w-3 h-3 inline text-amber-400" />}
                {cat === 'Social Sciences' && <Globe className="w-3 h-3 inline text-sky-400" />}
                {cat === 'Humanities & Literature' && <BookOpen className="w-3 h-3 inline text-purple-400" />}
                {cat === 'Arts & Culture' && <Palette className="w-3 h-3 inline text-rose-400" />}
                {cat === 'Business & Finance' && <Briefcase className="w-3 h-3 inline text-teal-400" />}
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tag / Search indicator */}
        {searchQuery && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span>Filtering by tag/keyword: <strong className="text-indigo-600 dark:text-indigo-400">"{searchQuery}"</strong></span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[11px] underline text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {totalResultsCount === 0 && (
        <div className="rounded-3xl p-10 sm:p-14 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-2xs">
            {selectedCategory === 'Saved Quizzes' ? (
              <Bookmark className="w-7 h-7 fill-amber-400 text-amber-400" />
            ) : (
              <BookOpen className="w-7 h-7" />
            )}
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {selectedCategory === 'Saved Quizzes'
              ? 'No Saved Quizzes Yet'
              : 'No modules match your filter'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {selectedCategory === 'Saved Quizzes'
              ? 'Click the bookmark icon on any community quiz or curriculum topic to save it to your personal library for quick review anytime.'
              : 'Try clearing your search terms or choosing "All" to browse all verified learning tracks.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Curated Preset Modules */}
        {filteredPresets.map((preset) => {
          const quizData = getPresetQuiz(preset);
          const isFav = favorites.has(preset.id);
          const isLiked = likedIds.has(preset.id);
          const isSaved = savedIds.has(preset.id);
          const likesCount = likesCountMap[preset.id] || 0;
          const commentsCount = commentsCountMap[preset.id] || 0;

          return (
            <div
              key={preset.id}
              className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-2xl flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 group-hover:scale-105 transition-transform shadow-2xs shrink-0">
                    {renderPresetIcon(preset.icon, preset.pedagogical_topic)}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Like button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(preset.id, e)}
                      className={`px-2 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-black ${
                        isLiked
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500'
                      }`}
                      title={isLiked ? 'Unlike topic' : 'Like topic'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{likesCount}</span>
                    </button>

                    {/* Save button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSave(preset.id, preset.title, e)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSaved
                          ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-500 shadow-2xs scale-105'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-amber-500'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save quiz to library'}
                      aria-label="Toggle Save"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    {/* Comments button */}
                    <button
                      type="button"
                      onClick={(e) =>
                        handleOpenComments(
                          preset.id,
                          preset.title,
                          'Intermediate',
                          persona,
                          e
                        )
                      }
                      className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 text-[11px] font-black transition-colors cursor-pointer"
                      title="Read and post comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{commentsCount}</span>
                    </button>

                    {onOpenWorksheet && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          onOpenWorksheet(quizData);
                        }}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Print / Export Exam Worksheet"
                        aria-label="Print Worksheet"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {renderPedagogicalBadge(preset.pedagogical_topic, preset.pedagogical_subtopic)}
                    {(() => {
                      const tier = classifyAudience(quizData);
                      const tierCfg = AUDIENCE_TIER_CONFIG[tier];
                      return (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tierCfg.badgeBg} ${tierCfg.badgeBorder} ${tierCfg.badgeText}`}
                          title={`${tierCfg.label} - ${tierCfg.description}`}
                        >
                          <span>{tierCfg.emoji}</span>
                          <span>{tierCfg.shortLabel}</span>
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div
                  onClick={() => handleOpenTrackDetail(preset, quizData)}
                  className="cursor-pointer group/title"
                  title="Click to view Key Takeaways & review source material"
                >
                  <h3 className="font-black text-base text-slate-900 dark:text-white group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {preset.description}
                  </p>
                  {renderTagsList(quizData.tags)}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 font-semibold">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{quizData.questions.length} Questions</span>
                  <span>•</span>
                  <span>{preset.mediaType.toUpperCase()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenTrackDetail(preset, quizData)}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs hover:shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Key Takeaways & Review</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchFlashcards(preset)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Flashcards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunch(preset)}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/25 hover:shadow-md hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    <span>Play Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}


        {/* Real Custom & Community Quizzes from Firestore */}
        {filteredCustomQuizzes.map((doc) => {
          const quizData = getQuizFromDoc(doc);
          const isCreator = user && doc.creatorId === user.uid;
          const isLiked = likedIds.has(doc.id);
          const isSaved = savedIds.has(doc.id);
          const likesCount = likesCountMap[doc.id] ?? (doc.likesCount || 0);
          const commentsCount = commentsCountMap[doc.id] ?? (doc.commentsCount || 0);

          return (
            <div
              key={doc.id}
              className="group rounded-3xl p-5 sm:p-6 border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-br from-white via-indigo-50/20 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-lg shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Like button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(doc.id, e)}
                      className={`px-2 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-black ${
                        isLiked
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500'
                      }`}
                      title={isLiked ? 'Unlike quiz' : 'Like quiz'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{likesCount}</span>
                    </button>

                    {/* Save button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSave(doc.id, quizData.quiz_title, e)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSaved
                          ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-500 shadow-2xs scale-105'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-500'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save quiz to library'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    {/* Comments button */}
                    <button
                      type="button"
                      onClick={(e) =>
                        handleOpenComments(
                          doc.id,
                          quizData.quiz_title,
                          quizData.difficulty || 'Intermediate',
                          quizData.persona || 'Student',
                          e
                        )
                      }
                      className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 text-[11px] font-black transition-colors cursor-pointer"
                      title="Read and post comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{commentsCount}</span>
                    </button>

                    {isCreator && onDeleteCustomQuiz && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          onDeleteCustomQuiz(doc.id);
                        }}
                        className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
                        title="Delete custom quiz from cloud"
                        aria-label="Delete Quiz"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onOpenWorksheet && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          onOpenWorksheet(quizData);
                        }}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Print / Export Exam Worksheet"
                        aria-label="Print Worksheet"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        setSharingQuiz({ quiz: quizData, cloudId: doc.id });
                      }}
                      className="p-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                      title="Share Quiz with Peers"
                      aria-label="Share Quiz"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
                      Community • {doc.creatorName || 'Scholar'}
                    </span>
                    {(() => {
                      const creatorStatus = evaluateCreatorStatus(doc);
                      if (creatorStatus.isTopCreator) {
                        return <TopCreatorBadge status={creatorStatus} size="xs" />;
                      }
                      return null;
                    })()}
                    {renderPedagogicalBadge(quizData.pedagogical_topic, quizData.pedagogical_subtopic)}
                    {(() => {
                      const tier = classifyAudience(doc);
                      const tierCfg = AUDIENCE_TIER_CONFIG[tier];
                      return (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tierCfg.badgeBg} ${tierCfg.badgeBorder} ${tierCfg.badgeText}`}
                          title={`${tierCfg.label} - ${tierCfg.description}`}
                        >
                          <span>{tierCfg.emoji}</span>
                          <span>{tierCfg.shortLabel}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <div
                    onClick={() => handleOpenCustomTrackDetail(doc, quizData)}
                    className="cursor-pointer group/title"
                    title="Click to view Key Takeaways & review source material"
                  >
                    <h3 className="font-black text-base text-slate-900 dark:text-white group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                      {quizData.quiz_title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {quizData.summary || 'Custom authored assessment saved to cloud.'}
                    </p>
                    {renderTagsList(quizData.tags)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 font-semibold">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{quizData.questions.length} Questions</span>
                    <span>•</span>
                    <span>{quizData.difficulty || 'Intermediate'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">

                  <button
                    type="button"
                    onClick={() => handleOpenCustomTrackDetail(doc, quizData)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs hover:shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Key Takeaways & Review</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setStudyingQuiz(quizData);
                      }}
                      className="py-2.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Flashcards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onStartQuiz(quizData);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/25 hover:shadow-md hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                    >
                      <span>Play Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


      {/* Interactive Flashcard Modal */}
      {studyingQuiz && (
        <FlashcardStudyDeck
          quiz={studyingQuiz}
          onClose={() => setStudyingQuiz(null)}
        />
      )}

      {/* Discussion & Comments Modal */}
      {activeCommentsQuiz && (
        <QuizCommentsModal
          quizId={activeCommentsQuiz.id}
          quizTitle={activeCommentsQuiz.title}
          difficulty={activeCommentsQuiz.difficulty}
          persona={activeCommentsQuiz.persona}
          likesCount={likesCountMap[activeCommentsQuiz.id] || 0}
          isLiked={likedIds.has(activeCommentsQuiz.id)}
          isSaved={savedIds.has(activeCommentsQuiz.id)}
          onToggleLike={() => handleToggleLike(activeCommentsQuiz.id, { stopPropagation: () => {} } as any)}
          onToggleSave={() => handleToggleSave(activeCommentsQuiz.id, activeCommentsQuiz.title, { stopPropagation: () => {} } as any)}
          isOpen={true}
          onClose={() => setActiveCommentsQuiz(null)}
          onCommentCountChange={(count) => {
            setCommentsCountMap((prev) => ({
              ...prev,
              [activeCommentsQuiz.id]: count,
            }));
          }}
        />
      )}

      {/* Share Quiz Modal */}
      {sharingQuiz && (
        <ShareQuizModal
          isOpen={!!sharingQuiz}
          onClose={() => setSharingQuiz(null)}
          quiz={sharingQuiz.quiz}
          cloudQuizId={sharingQuiz.cloudId}
        />
      )}

      {/* QuizTrack Detail Drawer with AI Key Takeaways Summary Section */}
      <QuizTrackDetailDrawer
        isOpen={!!selectedTrackForDetail}
        onClose={() => setSelectedTrackForDetail(null)}
        track={selectedTrackForDetail}
        persona={persona}
        onStartQuiz={onStartQuiz}
        onOpenFlashcards={(q) => setStudyingQuiz(q)}
        onOpenWorksheet={onOpenWorksheet}
      />
    </div>
  );
};

