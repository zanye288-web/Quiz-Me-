import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  ThumbsUp,
  Plus,
  CheckCircle2,
  Mic,
  Type,
  EyeOff,
  Zap,
  BookOpen,
  Radio,
  Sliders,
  Filter,
  Send,
  Compass,
  TrendingUp,
  Award,
  RefreshCw,
  ArrowRight,
  MessageSquarePlus,
  Layers,
  Check,
} from 'lucide-react';
import { PersonaType, QuizResponse, UserStats } from '../types/quiz';
import { QuizHistoryRecord } from './HistoryView';
import { PRESET_TOPICS } from '../data/presets';
import { useTheme, FONT_CATALOG, FontFamilyChoice } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/audio';
import { DashboardTab } from './DashboardSidebar';

export interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  category: 'Quality of Life' | 'Voice & Audio' | 'Themes & Fonts' | 'Study & AI' | 'Quiz Topic' | 'Multiplayer';
  status: 'Implemented' | 'In Progress' | 'Planned' | 'Community Idea';
  upvotes: number;
  author: string;
  createdAt: string;
  actionTab?: DashboardTab;
  actionFont?: FontFamilyChoice;
  actionLabel?: string;
}

const SUGGESTIONS_STORAGE_KEY = 'quizme_suggestions_board_v1';
const UPVOTED_IDS_STORAGE_KEY = 'quizme_upvoted_suggestions_v1';

const INITIAL_SUGGESTIONS: SuggestionItem[] = [
  {
    id: 'sug_voice_mic',
    title: 'Speak Quiz Answers with Microphone (Voice Input)',
    description:
      'Answer multiple-choice, fill-in-the-blank, and open explanation questions hands-free using your microphone or by pressing [M] during any quiz.',
    category: 'Voice & Audio',
    status: 'Implemented',
    upvotes: 142,
    author: 'Community Request',
    createdAt: 'Just Shipped',
    actionTab: 'curricula',
    actionLabel: 'Try Voice Answer in a Quiz',
  },
  {
    id: 'sug_spoiler_shield',
    title: 'Spoiler-Free Image Descriptions During Quizzes',
    description:
      'Automatically hide and redact answer spoilers from image captions until after you submit your answer, plus a fullscreen image zoom lightbox.',
    category: 'Quality of Life',
    status: 'Implemented',
    upvotes: 128,
    author: 'Community Request',
    createdAt: 'Just Shipped',
    actionTab: 'curricula',
    actionLabel: 'Test Spoiler Shield',
  },
  {
    id: 'sug_more_fonts',
    title: '12 Curated Study Fonts (Dyslexia-Friendly, Notebook & STEM)',
    description:
      'Added Lexend (Dyslexia Reading Aid), Atkinson Hyperlegible, Fredoka Gamified, Space Grotesk, Lora Textbook, Sora, and Patrick Hand Notebook fonts.',
    category: 'Themes & Fonts',
    status: 'Implemented',
    upvotes: 119,
    author: 'Community Request',
    createdAt: 'Just Shipped',
    actionFont: 'lexend',
    actionLabel: 'Preview Lexend Font',
  },
  {
    id: 'sug_option_eliminator',
    title: 'Cross-Out Distractors & 50/50 Option Narrowing',
    description:
      'Strike through wrong multiple-choice options during a test and use the 50/50 Narrow button in practice mode to eliminate two distractors.',
    category: 'Quality of Life',
    status: 'Implemented',
    upvotes: 97,
    author: 'Scholar Feedback',
    createdAt: 'Just Shipped',
    actionTab: 'curricula',
    actionLabel: 'Try in Quiz Runner',
  },
  {
    id: 'sug_live_ai_bots',
    title: '1-Click Instant Live Battle vs. AI Classmates',
    description:
      'Launch a real-time multiplayer quiz battle immediately with smart AI classmates or share a 6-digit PIN with friends.',
    category: 'Multiplayer',
    status: 'Implemented',
    upvotes: 114,
    author: 'Community Request',
    createdAt: 'Just Shipped',
    actionTab: 'live',
    actionLabel: 'Launch Live Battle',
  },
  {
    id: 'sug_spaced_rep_calendar',
    title: 'Weekly Exam Countdown & Study Planner',
    description:
      'Set an upcoming exam date and receive daily micro-quiz targets tailored to the days remaining before your test.',
    category: 'Study & AI',
    status: 'Planned',
    upvotes: 64,
    author: 'Maya L.',
    createdAt: '2 days ago',
  },
  {
    id: 'sug_diagram_hotspot',
    title: 'Interactive Diagram Pin-Drop Questions',
    description:
      'Click directly on anatomical structures, circuit diagrams, or historical maps to identify labeled regions.',
    category: 'Study & AI',
    status: 'In Progress',
    upvotes: 83,
    author: 'Prof. Rivera',
    createdAt: '3 days ago',
  },
  {
    id: 'sug_audio_podcast_recap',
    title: '2-Minute Audio Podcast Summary of Missed Questions',
    description:
      'Generate a conversational two-host audio recap explaining the concepts behind questions you missed.',
    category: 'Voice & Audio',
    status: 'Planned',
    upvotes: 71,
    author: 'Devon K.',
    createdAt: '5 days ago',
  },
];

interface SuggestedStudyTopic {
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
  reason: string;
  prompt: string;
  presetQuiz?: QuizResponse;
}

interface SuggestionsHubViewProps {
  persona: PersonaType;
  stats: UserStats;
  historyRecords: QuizHistoryRecord[];
  onStartQuiz: (quiz: QuizResponse) => void;
  onSelectTab: (tab: DashboardTab) => void;
  onRewardXp?: (xpBonus: number, gemsBonus: number) => void;
}

export const SuggestionsHubView: React.FC<SuggestionsHubViewProps> = ({
  persona,
  stats,
  historyRecords,
  onStartQuiz,
  onSelectTab,
  onRewardXp,
}) => {
  const { fontFamily, setFontFamily, currentAccentConfig } = useTheme();
  const { user, userProfile } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'study_picks' | 'feature_board' | 'qol_lab'>('study_picks');

  // Feature Suggestions Board State
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(() => {
    try {
      const saved = localStorage.getItem(SUGGESTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((i: SuggestionItem) => i.id));
          const merged = [
            ...INITIAL_SUGGESTIONS.filter((init) => !existingIds.has(init.id)),
            ...parsed,
          ];
          return merged;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_SUGGESTIONS;
  });

  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(UPVOTED_IDS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['sug_voice_mic', 'sug_spoiler_shield'];
    } catch {
      return ['sug_voice_mic', 'sug_spoiler_shield'];
    }
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // New Suggestion Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<SuggestionItem['category']>('Quality of Life');
  const [submitBanner, setSubmitBanner] = useState<string | null>(null);

  // AI Study Suggestions State
  const [aiStudyPicks, setAiStudyPicks] = useState<SuggestedStudyTopic[]>([]);
  const [isLoadingAiPicks, setIsLoadingAiPicks] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(suggestions));
    } catch {
      // ignore
    }
  }, [suggestions]);

  useEffect(() => {
    try {
      localStorage.setItem(UPVOTED_IDS_STORAGE_KEY, JSON.stringify(upvotedIds));
    } catch {
      // ignore
    }
  }, [upvotedIds]);

  // Build default personalized study picks from history + presets
  const buildPersonalizedStudyPicks = (): SuggestedStudyTopic[] => {
    const completedTitles = new Set(historyRecords.map((h) => h.quizTitle.toLowerCase()));
    const picks: SuggestedStudyTopic[] = [];

    // 1. If user has a low score on a past quiz, suggest a mastery rematch
    const needsReview = historyRecords.find((h) => h.total > 0 && h.score / h.total < 0.75);
    if (needsReview && needsReview.quizData) {
      picks.push({
        title: `Rematch: ${needsReview.quizTitle}`,
        category: 'Targeted Mastery Boost',
        difficulty: 'Intermediate',
        reason: `You scored ${Math.round((needsReview.score / needsReview.total) * 100)}% last time — retake with Voice Answer & 50/50 Narrow to lock in 100%!`,
        prompt: needsReview.quizTitle,
        presetQuiz: needsReview.quizData,
      });
    }

    // 2. Add unplayed curriculum presets
    for (const preset of PRESET_TOPICS) {
      const quiz =
        persona === 'Teacher' && preset.prebuiltTeacherQuiz
          ? preset.prebuiltTeacherQuiz
          : preset.prebuiltStudentQuiz;
      if (quiz && !completedTitles.has(preset.title.toLowerCase())) {
        picks.push({
          title: preset.title,
          category: preset.category,
          difficulty: (quiz.difficulty as 'Beginner' | 'Intermediate' | 'Master') || 'Intermediate',
          reason: `Recommended for ${persona} mode • ${preset.description}`,
          prompt: preset.inputText,
          presetQuiz: quiz,
        });
      }
      if (picks.length >= 6) break;
    }

    return picks;
  };

  useEffect(() => {
    setAiStudyPicks(buildPersonalizedStudyPicks());
  }, [historyRecords, persona]);

  const handleRefreshAiStudyPicks = async () => {
    soundFx.playClick();
    setIsLoadingAiPicks(true);
    try {
      const recentTopics = historyRecords.slice(0, 5).map((h) => h.quizTitle);
      const res = await fetch('/api/recommended-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentTopics: recentTopics.length > 0 ? recentTopics : ['General Science', 'World History', 'Computer Science'],
          accuracy: stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 85,
          level: stats.level,
          persona,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        const mapped: SuggestedStudyTopic[] = data.recommendations.map((rec: any, idx: number) => {
          const fallbackPreset = PRESET_TOPICS[idx % PRESET_TOPICS.length];
          return {
            title: rec.title || fallbackPreset.title,
            category: rec.category || fallbackPreset.category,
            difficulty: rec.difficulty || 'Intermediate',
            reason: rec.reason || rec.description || 'AI-tailored to expand your knowledge graph.',
            prompt: rec.prompt || rec.title || fallbackPreset.inputText,
            presetQuiz: fallbackPreset.prebuiltStudentQuiz,
          };
        });
        setAiStudyPicks(mapped);
        soundFx.playCorrect();
      } else {
        setAiStudyPicks(buildPersonalizedStudyPicks());
      }
    } catch {
      setAiStudyPicks(buildPersonalizedStudyPicks());
    } finally {
      setIsLoadingAiPicks(false);
    }
  };

  const handleToggleUpvote = (id: string) => {
    soundFx.playClick();
    const hasVoted = upvotedIds.includes(id);
    setUpvotedIds((prev) => (hasVoted ? prev.filter((item) => item !== id) : [...prev, id]));
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, upvotes: Math.max(0, s.upvotes + (hasVoted ? -1 : 1)) } : s
      )
    );
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundFx.playCorrect();
    const authorName = userProfile?.displayName || user?.displayName || `${persona} Scholar`;
    const newItem: SuggestionItem = {
      id: `sug_custom_${Date.now()}`,
      title: newTitle.trim(),
      description:
        newDescription.trim() ||
        'Submitted via the Quiz Me! Suggestions Hub to enhance the learning experience.',
      category: newCategory,
      status: 'Community Idea',
      upvotes: 1,
      author: authorName,
      createdAt: 'Just now',
    };

    setSuggestions((prev) => [newItem, ...prev]);
    setUpvotedIds((prev) => [...prev, newItem.id]);
    setNewTitle('');
    setNewDescription('');

    if (onRewardXp) {
      onRewardXp(15, 5);
    }

    setSubmitBanner('Suggestion posted! You earned +15 XP & +5 Gems for contributing!');
    setTimeout(() => setSubmitBanner(null), 4000);
  };

  const filteredSuggestions = suggestions
    .filter((s) => (categoryFilter === 'All' ? true : s.category === categoryFilter))
    .filter((s) => (statusFilter === 'All' ? true : s.status === statusFilter))
    .sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {submitBanner && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl border border-emerald-400 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-extrabold">{submitBanner}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`p-4 rounded-2xl ${currentAccentConfig.badgeBg} ${currentAccentConfig.badgeText} border ${currentAccentConfig.border} shadow-xs shrink-0`}
          >
            <Lightbulb className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Suggestions & QoL Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                Smart Picks + Feature Board
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Discover personalized AI quiz suggestions tailored to your stats, explore new Quality-of-Life upgrades (Voice Answer Mic, 12 Fonts, Spoiler Shield), and vote on community ideas.
            </p>
          </div>
        </div>

        {/* Sub-navigation Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-stretch md:self-auto">
          {[
            { id: 'study_picks' as const, label: 'Study Suggestions', icon: Compass },
            { id: 'qol_lab' as const, label: 'New QoL Features', icon: Zap },
            { id: 'feature_board' as const, label: 'Idea & Vote Board', icon: MessageSquarePlus },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveSubTab(tab.id);
                }}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: PERSONALIZED AI STUDY SUGGESTIONS */}
      {activeSubTab === 'study_picks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Recommended Study Tracks for You</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calibrated for Level {stats.level} {persona} • {stats.streak} Day Streak •{' '}
                {stats.totalQuestions > 0
                  ? `${Math.round((stats.totalCorrect / stats.totalQuestions) * 100)}% Career Accuracy`
                  : 'Ready for your first challenge'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefreshAiStudyPicks}
              disabled={isLoadingAiPicks}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAiPicks ? 'animate-spin' : ''}`} />
              <span>{isLoadingAiPicks ? 'Generating AI Suggestions...' : 'Refresh AI Study Suggestions'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiStudyPicks.map((pick, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                      {pick.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        pick.difficulty === 'Master'
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                          : pick.difficulty === 'Intermediate'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {pick.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {pick.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {pick.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  {pick.presetQuiz ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onStartQuiz(pick.presetQuiz!);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <span>Start Suggested Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onSelectTab('studio');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Open in AI Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: NEW QOL FEATURES & FONT STUDIO SHOWCASE */}
      {activeSubTab === 'qol_lab' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Voice Answer Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Hands-Free Voice Input
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Microphone Speak-to-Answer
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                During any quiz, click <strong>Speak Answer</strong> or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono text-[10px]">M</kbd>. Say <em>"Option A"</em>, <em>"Option B"</em>, or speak the answer text itself—Quiz Me! automatically matches and selects your spoken answer!
              </p>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  if (PRESET_TOPICS[0]?.prebuiltStudentQuiz) {
                    onStartQuiz(PRESET_TOPICS[0].prebuiltStudentQuiz);
                  } else {
                    onSelectTab('curricula');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-colors cursor-pointer"
              >
                Launch a Quiz & Try Voice Mic →
              </button>
            </div>

            {/* Spoiler-Free Image Protection Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <EyeOff className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Anti-Spoiler Protection
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Spoiler-Shield Image Descriptions
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Question image descriptions no longer give away the answer! Captions are automatically shielded and redacted until you lock in your answer, then reveal the full educational explanation afterward.
              </p>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectTab('curricula');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-colors cursor-pointer"
              >
                Explore Visual Quizzes →
              </button>
            </div>
          </div>

          {/* Instant 12-Font Switcher Showcase */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Type className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Try All {FONT_CATALOG.length} Study Fonts Instantly
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any font card below to immediately restyle the entire app
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Active Font: <strong className="capitalize">{fontFamily}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FONT_CATALOG.map((f) => {
                const isSelected = fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setFontFamily(f.id);
                    }}
                    style={{ fontFamily: f.cssFamily }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {f.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {f.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                            {f.badge}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{f.style}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 italic truncate mt-1">
                      "{f.sample}"
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COMMUNITY IDEA & FEATURE SUGGESTION BOARD */}
      {activeSubTab === 'feature_board' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Submit a Suggestion Form (4 cols) */}
          <form
            onSubmit={handleSubmitSuggestion}
            className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                <span>Submit a Suggestion</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                +15 XP Bonus
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Idea or Topic Title
              </label>
              <input
                type="text"
                required
                maxLength={90}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Add Pomodoro break mini-games"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as SuggestionItem['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Quality of Life">Quality of Life (QoL)</option>
                <option value="Voice & Audio">Voice & Microphone</option>
                <option value="Themes & Fonts">Themes & Fonts</option>
                <option value="Study & AI">Study Tools & AI</option>
                <option value="Quiz Topic">New Quiz Topic Request</option>
                <option value="Multiplayer">Live Battles & Multiplayer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Details / How it helps learners
              </label>
              <textarea
                rows={3}
                maxLength={400}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe your feature idea, QoL tweak, or quiz topic..."
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Suggestion & Claim +15 XP</span>
            </button>
          </form>

          {/* Right Column: Upvote & Roadmap List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filters */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center flex-wrap gap-1.5">
                {['All', 'Quality of Life', 'Voice & Audio', 'Themes & Fonts', 'Study & AI', 'Multiplayer'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setCategoryFilter(cat);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Statuses</option>
                <option value="Implemented">Implemented</option>
                <option value="In Progress">In Progress</option>
                <option value="Planned">Planned</option>
                <option value="Community Idea">Community Ideas</option>
              </select>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {filteredSuggestions.map((item) => {
                const isUpvoted = upvotedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* Upvote Pillar */}
                    <button
                      type="button"
                      onClick={() => handleToggleUpvote(item.id)}
                      className={`px-3 py-2.5 rounded-2xl border flex flex-col items-center justify-center min-w-[56px] transition-all cursor-pointer shrink-0 ${
                        isUpvoted
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-black shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                      }`}
                      title="Upvote this suggestion"
                    >
                      <ThumbsUp className={`w-4 h-4 mb-0.5 ${isUpvoted ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`} />
                      <span className="text-xs font-mono font-black">{item.upvotes}</span>
                    </button>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center flex-wrap gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            item.status === 'Implemented'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800'
                              : item.status === 'In Progress'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.status === 'Implemented' ? '✓ Live Now' : item.status}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • by {item.author} ({item.createdAt})
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>

                      {(item.actionTab || item.actionFont) && (
                        <div className="pt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playSelect();
                              if (item.actionFont) {
                                setFontFamily(item.actionFont);
                                setSubmitBanner(`Switched active font to ${item.actionFont.toUpperCase()}!`);
                                setTimeout(() => setSubmitBanner(null), 3000);
                              } else if (item.actionTab) {
                                onSelectTab(item.actionTab);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{item.actionLabel || 'Try It Now'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
