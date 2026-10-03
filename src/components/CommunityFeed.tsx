import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Heart,
  Sparkles,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  Play,
  Layers,
  MessageSquare,
  Share2,
  BookOpen,
  Atom,
  Landmark,
  Globe,
  Palette,
  Briefcase,
  X,
  UploadCloud,
  Award,
} from 'lucide-react';
import { QuizResponse, PersonaType } from '../types/quiz';
import { SavedQuizDocument, toggleQuizLike } from '../services/firestore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { soundFx } from '../utils/audio';
import { COMMUNITY_SEED_QUIZZES } from '../data/communitySeedQuizzes';
import { CANONICAL_PEDAGOGICAL_TOPICS, derivePedagogicalTopic } from '../utils/pedagogicalClassifier';
import { QuizCommentsModal } from './QuizCommentsModal';
import { ShareQuizModal } from './ShareQuizModal';
import { MascotAvatar } from './MascotAvatar';
import { QuizTrackDetailDrawer, SelectedTrackInfo } from './QuizTrackDetailDrawer';
import { TopCreatorBadge } from './TopCreatorBadge';
import { evaluateCreatorStatus, calculateAuthorAssessmentCounts } from '../utils/creatorUtils';
import {
  AUDIENCE_TIER_CONFIG,
  AUDIENCE_FILTER_OPTIONS,
  classifyAudience,
} from '../utils/audienceClassifier';

const LIKED_QUIZZES_STORAGE_KEY = 'quizme_liked_quizzes_v1';

interface CommunityFeedProps {
  currentPersona: PersonaType;
  onStartQuiz: (quiz: QuizResponse) => void;
  onOpenFlashcards?: (quiz: QuizResponse) => void;
  onOpenWorksheet?: (quiz: QuizResponse) => void;
  onOpenRawJsonModal?: (quiz: QuizResponse) => void;
  onPublishCurrentQuiz?: () => void;
  activeQuiz?: QuizResponse | null;
  customQuizzes?: SavedQuizDocument[];
  onDeleteCustomQuiz?: (quizId: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  currentPersona,
  onStartQuiz,
  onOpenFlashcards,
  onOpenWorksheet,
  onOpenRawJsonModal,
  onPublishCurrentQuiz,
  activeQuiz,
  customQuizzes = [],
  onDeleteCustomQuiz,
}) => {
  const { user } = useAuth();
  const { currentAccentConfig } = useTheme();

  // Search, filter, and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState<'all' | 'top' | 'Teacher' | 'Student' | 'liked'>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'questions'>('popular');

  // Preview drawer / modal state
  const [previewQuiz, setPreviewQuiz] = useState<SavedQuizDocument | null>(null);

  // Active quiz for comments modal
  const [activeCommentsQuiz, setActiveCommentsQuiz] = useState<{
    id: string;
    title: string;
    difficulty?: string;
    persona?: string;
    likesCount?: number;
  } | null>(null);

  // Active quiz for sharing
  const [sharingQuiz, setSharingQuiz] = useState<{ quiz: QuizResponse; cloudId?: string } | null>(null);

  // Selected track for Key Takeaways summary drawer
  const [selectedTrackForDetail, setSelectedTrackForDetail] = useState<SelectedTrackInfo | null>(null);

  // Likes state with local persistence
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LIKED_QUIZZES_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Dynamic counts for likes
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});

  // Sync likedIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LIKED_QUIZZES_STORAGE_KEY, JSON.stringify(Array.from(likedIds)));
    } catch {
      // ignore
    }
  }, [likedIds]);

  // Combine custom Firestore quizzes with curated community seed quizzes (deduplicating by ID)
  const allCommunityQuizzes = useMemo(() => {
    const map = new Map<string, SavedQuizDocument>();

    // Add Firestore custom quizzes first
    customQuizzes.forEach((q) => {
      if (q.isPublic !== false) {
        map.set(q.id, q);
      }
    });

    // Add seed quizzes if not already present
    COMMUNITY_SEED_QUIZZES.forEach((sq) => {
      if (!map.has(sq.id)) {
        map.set(sq.id, sq);
      }
    });

    return Array.from(map.values());
  }, [customQuizzes]);

  // Initialize likesCountMap from items
  useEffect(() => {
    setLikesCountMap((prev) => {
      const updated = { ...prev };
      allCommunityQuizzes.forEach((q) => {
        if (updated[q.id] === undefined) {
          updated[q.id] = q.likesCount || 0;
        }
      });
      return updated;
    });
  }, [allCommunityQuizzes]);

  // Handle Like Toggle
  const handleToggleLike = (quiz: SavedQuizDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyLiked = likedIds.has(quiz.id);

    if (!isCurrentlyLiked) {
      soundFx.playStreak();
    } else {
      soundFx.playClick();
    }

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyLiked) {
        next.delete(quiz.id);
      } else {
        next.add(quiz.id);
      }
      return next;
    });

    setLikesCountMap((prev) => {
      const current = prev[quiz.id] !== undefined ? prev[quiz.id] : quiz.likesCount || 0;
      return {
        ...prev,
        [quiz.id]: Math.max(0, isCurrentlyLiked ? current - 1 : current + 1),
      };
    });

    // If authenticated, sync with Firestore
    if (user) {
      toggleQuizLike(quiz.id, user.uid, isCurrentlyLiked).catch((err) => {
        console.warn('Community like sync note:', err?.message || err);
      });
    }
  };

  // Convert SavedQuizDocument to standard QuizResponse
  const toQuizResponse = (doc: SavedQuizDocument): QuizResponse => {
    return {
      app_name: 'Quiz Me!',
      persona: doc.persona || 'Student',
      quiz_title: doc.quiz_title,
      summary: doc.summary,
      difficulty: doc.difficulty,
      questions: doc.questions,
      study_guide: doc.study_guide,
      tags: doc.tags,
      pedagogical_topic: doc.pedagogical_topic,
      pedagogical_subtopic: doc.pedagogical_subtopic,
      target_audience: doc.targetAudience,
    };
  };

  // Author assessment counts map for dynamic evaluation
  const authorAssessmentCounts = useMemo(() => {
    return calculateAuthorAssessmentCounts(allCommunityQuizzes);
  }, [allCommunityQuizzes]);

  // Filter & Sort Logic
  const filteredQuizzes = useMemo(() => {
    const qLower = searchQuery.toLowerCase().trim();

    return allCommunityQuizzes
      .filter((quiz) => {
        // 1. Author Filter
        if (authorFilter === 'liked' && !likedIds.has(quiz.id)) {
          return false;
        }
        if (authorFilter === 'top') {
          const status = evaluateCreatorStatus(quiz, authorAssessmentCounts);
          if (!status.isTopCreator) {
            return false;
          }
        }
        if (authorFilter === 'Teacher' && quiz.creatorRole !== 'Teacher' && quiz.persona !== 'Teacher') {
          return false;
        }
        if (authorFilter === 'Student' && quiz.creatorRole !== 'Student' && quiz.persona !== 'Student') {
          return false;
        }

        // 2. Topic Filter
        if (topicFilter !== 'All') {
          const derived = quiz.pedagogical_topic || derivePedagogicalTopic(quiz.quiz_title, quiz.tags);
          if (derived !== topicFilter) {
            return false;
          }
        }

        // 3. Age / Audience Filter
        if (audienceFilter !== 'all') {
          const tier = classifyAudience(quiz);
          if (tier !== audienceFilter) {
            return false;
          }
        }

        // 4. Search Query
        if (qLower) {
          const matchTitle = (quiz.quiz_title || '').toLowerCase().includes(qLower);
          const matchAuthor = (quiz.creatorName || '').toLowerCase().includes(qLower);
          const matchSummary = (quiz.summary || '').toLowerCase().includes(qLower);
          const matchTags = (quiz.tags || []).some((t) => t.toLowerCase().includes(qLower));
          const matchTopic = (quiz.pedagogical_topic || '').toLowerCase().includes(qLower);
          if (!matchTitle && !matchAuthor && !matchSummary && !matchTags && !matchTopic) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          const likesA = likesCountMap[a.id] !== undefined ? likesCountMap[a.id] : a.likesCount || 0;
          const likesB = likesCountMap[b.id] !== undefined ? likesCountMap[b.id] : b.likesCount || 0;
          return likesB - likesA;
        }
        if (sortBy === 'questions') {
          return (b.questions?.length || 0) - (a.questions?.length || 0);
        }
        // 'recent'
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [allCommunityQuizzes, authorFilter, topicFilter, searchQuery, sortBy, likedIds, likesCountMap, authorAssessmentCounts]);

  // Aggregate Metrics
  const totalLikesCount = useMemo(() => {
    return allCommunityQuizzes.reduce((acc, q) => {
      const count = likesCountMap[q.id] !== undefined ? likesCountMap[q.id] : q.likesCount || 0;
      return acc + count;
    }, 0);
  }, [allCommunityQuizzes, likesCountMap]);

  const topCreatorCount = useMemo(() => {
    return allCommunityQuizzes.filter((q) => evaluateCreatorStatus(q, authorAssessmentCounts).isTopCreator).length;
  }, [allCommunityQuizzes, authorAssessmentCounts]);

  const teacherCount = useMemo(() => {
    return allCommunityQuizzes.filter((q) => q.creatorRole === 'Teacher' || q.persona === 'Teacher').length;
  }, [allCommunityQuizzes]);

  const studentCount = useMemo(() => {
    return allCommunityQuizzes.filter((q) => q.creatorRole === 'Student' || q.persona === 'Student').length;
  }, [allCommunityQuizzes]);

  const getTopicIcon = (topic?: string) => {
    switch (topic) {
      case 'STEM':
        return <Atom className="w-3 h-3 text-emerald-400" />;
      case 'History':
        return <Landmark className="w-3 h-3 text-amber-400" />;
      case 'Social Sciences':
        return <Globe className="w-3 h-3 text-sky-400" />;
      case 'Humanities & Literature':
        return <BookOpen className="w-3 h-3 text-purple-400" />;
      case 'Arts & Culture':
        return <Palette className="w-3 h-3 text-rose-400" />;
      case 'Business & Finance':
        return <Briefcase className="w-3 h-3 text-teal-400" />;
      default:
        return <Sparkles className="w-3 h-3 text-indigo-400" />;
    }
  };

  const getDifficultyBadge = (diff?: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Master':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 border border-indigo-800/40 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-indigo-200">
              <Users className="w-3.5 h-3.5 text-pink-400" />
              <span>Scholar Community Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Community Feed
            </h1>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Explore, study, and like quizzes shared by teachers and fellow students. Tap the heart to show appreciation and boost your favorite assessments!
            </p>
          </div>

          {/* Aggregate Community Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap bg-white/5 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10">
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-white">{allCommunityQuizzes.length}</div>
              <div className="text-[11px] font-semibold text-indigo-300">Shared Quizzes</div>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-rose-400 flex items-center justify-center gap-1">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>{totalLikesCount}</span>
              </div>
              <div className="text-[11px] font-semibold text-indigo-300">Community Likes</div>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-amber-300">{teacherCount + studentCount}</div>
              <div className="text-[11px] font-semibold text-indigo-300">Scholars Active</div>
            </div>
          </div>
        </div>

        {/* Action to Publish Current Active Quiz */}
        {activeQuiz && onPublishCurrentQuiz && (
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                You have an active quiz: <strong className="text-white">"{activeQuiz.quiz_title}"</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onPublishCurrentQuiz();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Share to Community Feed</span>
            </button>
          </div>
        )}
      </div>

      {/* Quizzie Mascot Greeting & All-Ages Inclusivity Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3.5 min-w-0">
          <MascotAvatar mood="happy" size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Quizzie's All-Ages Discovery Desk
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Kid & Family Friendly
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
              Explore engaging quizzes tailored for every stage: playful elementary science, middle school phenomenon drills, AP/Honors mastery, and multi-generational family trivia!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setAudienceFilter('junior');
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-extrabold hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <span>🧒</span>
            <span>Ages 6-10</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setAudienceFilter('all_ages');
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-extrabold hover:bg-amber-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <span>🌟</span>
            <span>Family Fun</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Sorting */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shared quizzes, topics, tags or creators (e.g. Eleanor, Hawking, Big-O)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
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

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/70 dark:border-slate-700/70">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('popular');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortBy === 'popular'
                    ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3 text-rose-500" />
                <span>Popular</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('recent');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortBy === 'recent'
                    ? 'bg-white dark:bg-slate-900 text-indigo-500 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Recent</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSortBy('questions');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortBy === 'questions'
                    ? 'bg-white dark:bg-slate-900 text-indigo-500 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Size</span>
              </button>
            </div>
          </div>
        </div>

        {/* Creator Persona & Saved Filter Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setAuthorFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                authorFilter === 'all'
                  ? `${currentAccentConfig.activeBtn} text-white shadow-2xs`
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>All Creators</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                {allCommunityQuizzes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setAuthorFilter('top');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                authorFilter === 'top'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Top Creators</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                {topCreatorCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setAuthorFilter('Teacher');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                authorFilter === 'Teacher'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Teachers Only</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                {teacherCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setAuthorFilter('Student');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                authorFilter === 'Student'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Students Only</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                {studentCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setAuthorFilter('liked');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                authorFilter === 'liked'
                  ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>Liked by Me</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                {likedIds.size}
              </span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{filteredQuizzes.length}</strong> quizzes
          </div>
        </div>

        {/* Pedagogical Topic Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setTopicFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              topicFilter === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            All Topics
          </button>
          {CANONICAL_PEDAGOGICAL_TOPICS.map((topic) => {
            const isSelected = topicFilter === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setTopicFilter(topic)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700 font-bold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {getTopicIcon(topic)}
                <span>{topic}</span>
              </button>
            );
          })}
        </div>

        {/* Target Audience / Age Group Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0">
            Age Level:
          </span>
          {AUDIENCE_FILTER_OPTIONS.map((opt) => {
            const isSelected = audienceFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setAudienceFilter(opt.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400 dark:border-amber-600 shadow-2xs font-black'
                    : 'border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed List Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500">
            <Users className="w-8 h-8 opacity-70" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              No matching community quizzes found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search terms or filter selection. You can also publish your own quizzes to help grow the community library!
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setAuthorFilter('all');
                setTopicFilter('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => {
            const isLiked = likedIds.has(quiz.id);
            const likesCount = likesCountMap[quiz.id] !== undefined ? likesCountMap[quiz.id] : quiz.likesCount || 0;
            const commentsCount = quiz.commentsCount || 0;
            const isTeacher = quiz.creatorRole === 'Teacher' || quiz.persona === 'Teacher';
            const topic = quiz.pedagogical_topic || derivePedagogicalTopic(quiz.quiz_title, quiz.tags);
            const questionCount = quiz.questions?.length || 0;
            const isOwner = user && quiz.creatorId === user.uid;
            const creatorStatus = evaluateCreatorStatus(quiz, authorAssessmentCounts);
            const isTopCreator = creatorStatus.isTopCreator;

            return (
              <div
                key={quiz.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 hover:border-indigo-400/50 dark:hover:border-indigo-500/40 p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                {/* Card Header: Creator & Role Badge */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        {quiz.creatorAvatar ? (
                          <img
                            src={quiz.creatorAvatar}
                            alt={quiz.creatorName}
                            className={`w-9 h-9 rounded-full object-cover border ${
                              isTopCreator
                                ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs ${
                              isTopCreator
                                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                                : isTeacher
                                ? 'bg-indigo-600'
                                : 'bg-emerald-600'
                            }`}
                          >
                            {quiz.creatorName ? quiz.creatorName.slice(0, 2).toUpperCase() : 'SC'}
                          </div>
                        )}
                        {isTopCreator && (
                          <div
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs border border-white dark:border-slate-900"
                            title={creatorStatus.tooltipText}
                          >
                            <Award className="w-2.5 h-2.5 fill-white text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {quiz.creatorName || 'Scholar Creator'}
                          </span>
                          {isTopCreator && (
                            <TopCreatorBadge
                              status={creatorStatus}
                              size="xs"
                            />
                          )}
                          {isOwner && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            {isTeacher ? (
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                                <GraduationCap className="w-3 h-3" /> Teacher
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                                <Sparkles className="w-3 h-3" /> Student
                              </span>
                            )}
                          </span>
                          <span>&bull;</span>
                          {isTopCreator ? (
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5" title={creatorStatus.tooltipText}>
                              Lv.{creatorStatus.level} • {creatorStatus.assessmentsCount} Created
                            </span>
                          ) : (
                            <span>Shared</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Like Action Pill (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(quiz, e)}
                      title={isLiked ? 'Unlike quiz' : 'Like this quiz'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500 border-rose-200 dark:border-rose-800 shadow-xs scale-105'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-50/50'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform ${
                          isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400 group-hover:text-rose-400'
                        }`}
                      />
                      <span>{likesCount}</span>
                    </button>
                  </div>

                  {/* Badges Bar: Pedagogical Topic, Audience Tier & Difficulty */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {getTopicIcon(topic)}
                      <span>{topic}</span>
                    </span>

                    {/* Audience Tier Badge */}
                    {(() => {
                      const tier = classifyAudience(quiz);
                      const tierCfg = AUDIENCE_TIER_CONFIG[tier];
                      return (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${tierCfg.badgeBg} ${tierCfg.badgeBorder} ${tierCfg.badgeText}`}
                          title={`${tierCfg.label} - ${tierCfg.description}`}
                        >
                          <span>{tierCfg.emoji}</span>
                          <span>{tierCfg.shortLabel}</span>
                        </span>
                      );
                    })()}

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getDifficultyBadge(
                        quiz.difficulty
                      )}`}
                    >
                      {quiz.difficulty || 'Intermediate'}
                    </span>

                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                      {questionCount} Questions
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div
                    onClick={() => {
                      soundFx.playSelect();
                      setSelectedTrackForDetail({
                        id: quiz.id,
                        title: quiz.quiz_title,
                        description: quiz.summary,
                        category: quiz.pedagogical_topic,
                        pedagogical_topic: quiz.pedagogical_topic,
                        pedagogical_subtopic: quiz.pedagogical_subtopic,
                        inputText: (quiz as any).sourceText || quiz.summary,
                        quiz: toQuizResponse(quiz),
                        creatorName: quiz.creatorName,
                        creatorAvatar: quiz.creatorAvatar || undefined,
                        isTopCreator,
                        creatorLevel: creatorStatus.level,
                        creatorAssessmentsCount: creatorStatus.assessmentsCount,
                      });
                    }}
                    className="space-y-1 cursor-pointer group/title"
                    title="Click to view Key Takeaways & review source material"
                  >
                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-2 group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                      {quiz.quiz_title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {quiz.summary || 'Adaptive high-yield assessment designed for mastery and retention.'}
                    </p>
                  </div>


                  {/* Tags */}
                  {quiz.tags && quiz.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {quiz.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                      {quiz.tags.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{quiz.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Interactive Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setSelectedTrackForDetail({
                        id: quiz.id,
                        title: quiz.quiz_title,
                        description: quiz.summary,
                        category: quiz.pedagogical_topic,
                        pedagogical_topic: quiz.pedagogical_topic,
                        pedagogical_subtopic: quiz.pedagogical_subtopic,
                        inputText: (quiz as any).sourceText || quiz.summary,
                        quiz: toQuizResponse(quiz),
                        creatorName: quiz.creatorName,
                        creatorAvatar: quiz.creatorAvatar || undefined,
                        isTopCreator,
                        creatorLevel: creatorStatus.level,
                        creatorAssessmentsCount: creatorStatus.assessmentsCount,
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs hover:shadow-xs"
                    title="Review AI-generated key takeaways & source summary before starting"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Key Takeaways & Review</span>
                  </button>

                  <div className="flex items-center justify-between gap-2">
                    {/* Primary Take Quiz Button */}
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onStartQuiz(toQuizResponse(quiz));
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Take Quiz</span>
                    </button>

                    {/* Secondary Actions */}
                    {onOpenFlashcards && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          onOpenFlashcards(toQuizResponse(quiz));
                        }}
                        title="Study Flashcards"
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveCommentsQuiz({
                          id: quiz.id,
                          title: quiz.quiz_title,
                          difficulty: quiz.difficulty,
                          persona: quiz.persona,
                          likesCount,
                        })
                      }
                      title="Comments & Discussion"
                      className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      {commentsCount > 0 && (
                        <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 rounded-full bg-blue-500 text-white font-black text-[9px] flex items-center justify-center">
                          {commentsCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSharingQuiz({ quiz: toQuizResponse(quiz), cloudId: quiz.id })}
                      title="Share link"
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal for Questions & Study Guide */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Curriculum Assessment Preview</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {previewQuiz.quiz_title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuiz(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Audience & Difficulty Badges in Preview */}
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const tier = classifyAudience(previewQuiz);
                  const tierCfg = AUDIENCE_TIER_CONFIG[tier];
                  return (
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${tierCfg.badgeBg} ${tierCfg.badgeBorder} ${tierCfg.badgeText}`}
                    >
                      <span className="text-sm">{tierCfg.emoji}</span>
                      <span>Target: {tierCfg.label}</span>
                    </div>
                  );
                })()}

                <div className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                  Difficulty: {previewQuiz.difficulty || 'Intermediate'}
                </div>

                <div className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                  Role: {previewQuiz.persona || 'Student'}
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {previewQuiz.summary}
              </p>

              {/* Study Guide Takeaways */}
              {previewQuiz.study_guide?.key_takeaways && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Key Learning Takeaways
                  </h4>
                  <ul className="space-y-1.5 text-xs text-indigo-950 dark:text-indigo-200 list-disc list-inside">
                    {previewQuiz.study_guide.key_takeaways.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Questions ({previewQuiz.questions?.length || 0})
                </h4>
                <div className="space-y-2.5">
                  {previewQuiz.questions?.map((q: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                          Q{idx + 1} &bull; {q.type || 'multiple_choice'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">{q.points || 10} pts</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{q.question}</p>
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt: string, optIdx: number) => (
                            <div
                              key={optIdx}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300"
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewQuiz(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = previewQuiz;
                  setPreviewQuiz(null);
                  soundFx.playClick();
                  onStartQuiz(toQuizResponse(target));
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discussion & Comments Modal */}
      {activeCommentsQuiz && (
        <QuizCommentsModal
          quizId={activeCommentsQuiz.id}
          quizTitle={activeCommentsQuiz.title}
          difficulty={activeCommentsQuiz.difficulty}
          persona={activeCommentsQuiz.persona}
          likesCount={likesCountMap[activeCommentsQuiz.id] || activeCommentsQuiz.likesCount || 0}
          isLiked={likedIds.has(activeCommentsQuiz.id)}
          onToggleLike={() => {
            const doc = allCommunityQuizzes.find((q) => q.id === activeCommentsQuiz.id);
            if (doc) {
              handleToggleLike(doc, { stopPropagation: () => {} } as any);
            }
          }}
          isOpen={true}
          onClose={() => setActiveCommentsQuiz(null)}
        />
      )}

      {/* Share Modal */}
      {sharingQuiz && (
        <ShareQuizModal
          isOpen={true}
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
        persona={currentPersona}
        onStartQuiz={onStartQuiz}
        onOpenFlashcards={onOpenFlashcards}
        onOpenWorksheet={onOpenWorksheet}
      />
    </div>
  );
};

