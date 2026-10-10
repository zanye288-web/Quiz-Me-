import React from 'react';
import {
  Sparkles,
  BookOpen,
  BarChart3,
  History,
  Sliders,
  PlayCircle,
  Sun,
  Moon,
  PlusCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Flame,
  Award,
  GraduationCap,
  Trophy,
  Upload,
  Radio,
  Layout,
  Users,
  FileText,
  Lightbulb,
  Music,
  Search,
  Gamepad2,
  FolderDown,
} from 'lucide-react';
import { PersonaType, UserStats as UserStatsType, QuizResponse } from '../types/quiz';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/audio';
import { UserStats } from './UserStats';
import { UserAvatar } from './UserAvatar';
import { MascotAvatar } from './MascotAvatar';
import { AppLogo } from './AppLogo';

export type DashboardTab = 'studio' | 'exam' | 'past_papers' | 'searcher' | 'games' | 'notes' | 'gamma' | 'flashcards' | 'curricula' | 'community' | 'live' | 'music' | 'authoring' | 'suggestions' | 'achievements' | 'analytics' | 'history' | 'settings' | 'runner' | 'complete';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  persona: PersonaType;
  onPersonaChange: (p: PersonaType) => void;
  stats: UserStatsType;
  activeQuiz: QuizResponse | null;
  hasCompletedResults: boolean;
  onOpenSettings: () => void;
  onOpenProfileModal?: () => void;
  onOpenUploadQuiz?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  historyCount: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  persona,
  onPersonaChange,
  stats,
  activeQuiz,
  hasCompletedResults,
  onOpenSettings,
  onOpenProfileModal,
  onOpenUploadQuiz,
  isCollapsed,
  onToggleCollapse,
  historyCount,
}) => {
  const { resolvedTheme, toggleTheme, currentAccentConfig } = useTheme();
  const { user, userProfile } = useAuth();

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    'Play & Compete': true,
    'Create & Study': true,
    'Player Rank & Career': true,
  });

  const navigationSections = [
    {
      title: 'Play & Compete',
      items: [
        {
          id: 'studio' as DashboardTab,
          label: 'Quiz Maker',
          shortLabel: 'Play',
          icon: Sparkles,
          badge: 'PLAY',
          description: 'Create & play an interactive quiz in seconds',
        },
        {
          id: 'exam' as DashboardTab,
          label: 'Exam Mode',
          shortLabel: 'Exams',
          icon: GraduationCap,
          badge: 'WAEC/JAMB',
          description: 'Checkpoint, WAEC, JAMB, NECO, IGCSE, SAT & AP/IB mock exams',
        },
        {
          id: 'searcher' as DashboardTab,
          label: 'Quiz Searcher',
          shortLabel: 'Searcher',
          icon: Search,
          badge: 'DB',
          description: 'Search AI-verified quizzes, leaderboards & creators',
        },
        {
          id: 'curricula' as DashboardTab,
          label: 'Quiz Decks',
          shortLabel: 'Decks',
          icon: BookOpen,
          badge: '12+',
          description: 'Ready-to-play subject quiz decks across STEM & trivia',
        },
        {
          id: 'games' as DashboardTab,
          label: 'Quiz Arcade',
          shortLabel: 'Arcade',
          icon: Gamepad2,
          badge: '3 MODES',
          description: 'One by One Word-Chain, Math Quiz & Spelling Bee',
        },
        {
          id: 'live' as DashboardTab,
          label: 'Live Quiz Room',
          shortLabel: 'Live',
          icon: Radio,
          badge: 'PIN',
          description: 'Multiplayer live quiz battles with a room code',
        },
        {
          id: 'community' as DashboardTab,
          label: 'Community Quizzes',
          shortLabel: 'Community',
          icon: Users,
          badge: null,
          description: 'Play quizzes shared by students & teachers',
        },
      ],
    },
    {
      title: 'Create & Study',
      items: [
        {
          id: 'past_papers' as DashboardTab,
          label: 'Past Papers Hub',
          shortLabel: 'Papers',
          icon: FolderDown,
          badge: 'DOWNLOAD',
          description: 'Download WAEC, JAMB, Checkpoint, IGCSE & SAT past papers & textbooks',
        },
        {
          id: 'notes' as DashboardTab,
          label: 'Notes Generator',
          shortLabel: 'Notes',
          icon: FileText,
          badge: 'AI NOTES',
          description: 'Generate AI study notes, exam cheat sheets & practice checks',
        },
        {
          id: 'gamma' as DashboardTab,
          label: 'Presentation Maker',
          shortLabel: 'Slides',
          icon: Layout,
          badge: 'PPTX/PDF',
          description: 'Gamma AI+ interactive presentations with polls, quizzes & PPTX/PDF export',
        },
        {
          id: 'flashcards' as DashboardTab,
          label: 'Flashcard Drill',
          shortLabel: 'Cards',
          icon: Layers,
          badge: null,
          description: 'Flip active-recall cards to memorize facts fast',
        },
        {
          id: 'authoring' as DashboardTab,
          label: 'Write Your Own',
          shortLabel: 'Author',
          icon: PlusCircle,
          badge: null,
          description: 'Write custom quiz questions & mark schemes',
        },
      ],
    },
    {
      title: 'Player Rank & Career',
      items: [
        {
          id: 'achievements' as DashboardTab,
          label: 'Trophies & Badges',
          shortLabel: 'Badges',
          icon: Trophy,
          badge: '1K+',
          description: 'Unlock 1,000+ quiz medals, trophies & titles',
        },
        {
          id: 'analytics' as DashboardTab,
          label: 'Player Stats',
          shortLabel: 'Stats',
          icon: BarChart3,
          badge: `${stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 100}%`,
          description: 'Your quiz accuracy, streaks & XP radar',
        },
        {
          id: 'history' as DashboardTab,
          label: 'Past Quizzes',
          shortLabel: 'History',
          icon: History,
          badge: historyCount > 0 ? String(historyCount) : null,
          description: 'Review past quizzes & 5-star certificates',
        },
        {
          id: 'music' as DashboardTab,
          label: 'Quiz Show Beats',
          shortLabel: 'Music',
          icon: Music,
          badge: null,
          description: 'Full NCS & study tracks with credit attribution',
        },
        {
          id: 'suggestions' as DashboardTab,
          label: 'Quiz Topic Ideas',
          shortLabel: 'Ideas',
          icon: Lightbulb,
          badge: null,
          description: 'Vote on quiz topics & pick what to play next',
        },
        {
          id: 'settings' as DashboardTab,
          label: 'Settings & UI',
          shortLabel: 'Settings',
          icon: Sliders,
          badge: null,
          description: '5 UI styles, custom keybinds, sounds & profile',
        },
      ],
    },
  ];

  const toggleGroup = (title: string) => {
    soundFx.playClick();
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleTabClick = (tab: DashboardTab) => {
    soundFx.playClick();
    onSelectTab(tab);
  };

  const handleThemeToggle = () => {
    soundFx.playThemeToggle();
    toggleTheme();
  };

  return (
    <aside
      className={`relative flex flex-col h-full bg-white dark:bg-slate-950 border-r-2 border-slate-900 dark:border-slate-800 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Arcade Drawer Header */}
      <div className="px-4 py-3 border-b-2 border-slate-900 dark:border-slate-800 pattern-halftone bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between min-h-[60px]">
        <button
          type="button"
          onClick={() => handleTabClick('studio')}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <span className="w-9 h-9 rounded-2xl bg-indigo-600 border-2 border-slate-950 border-b-4 border-b-slate-950 text-amber-300 font-black text-base flex items-center justify-center shadow-sm shrink-0">
            ⚡
          </span>
          {!isCollapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white block leading-none">
                  QuizMe!
                </span>
                <span className="comic-badge px-1.5 py-0.5 rounded-md bg-amber-300 text-slate-950 border border-slate-950 text-[8px] font-black uppercase tracking-wider">
                  COMIC POP
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mt-1">
                All Game Modes
              </span>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onToggleCollapse();
          }}
          className="flex p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Menu' : 'Close Menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Categorized Navigation Sections */}
      <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto scrollbar-none">
        {navigationSections.map((sec, secIdx) => {
          const hasActiveItem = sec.items.some((i) => i.id === activeTab);
          const isGroupOpen = isCollapsed || expandedGroups[sec.title] || hasActiveItem;
          return (
            <div key={sec.title} className="space-y-1">
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(sec.title)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <span>{sec.title}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isGroupOpen ? '' : '-rotate-90'
                    }`}
                  />
                </button>
              ) : secIdx > 0 ? (
                <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
              ) : null}

              {isGroupOpen &&
                sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={`nav-tab-${item.id}`}
                      onClick={() => handleTabClick(item.id)}
                      className={`arcade-btn w-full flex items-center gap-2.5 px-2.5 py-2 rounded-2xl text-left transition-all cursor-pointer group relative border-2 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 border-slate-950 dark:border-cyan-300 border-b-4 text-white font-black shadow-sm'
                          : 'border-transparent hover:border-slate-900 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-900/80 font-bold'
                      }`}
                      title={`${item.label} — ${item.description}`}
                    >
                      <div
                        className={`p-1.5 rounded-xl transition-colors shrink-0 border ${
                          isActive
                            ? 'bg-white/20 border-white/40 text-white'
                            : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-cyan-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {!isCollapsed && (
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                          <span className="text-xs font-extrabold truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`comic-badge text-[9px] font-black px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 border ${
                                isActive
                                  ? 'bg-amber-300 text-slate-950 border-slate-950'
                                  : 'bg-indigo-50 dark:bg-indigo-950/90 text-indigo-700 dark:text-indigo-300 border-slate-900/30 dark:border-indigo-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          );
        })}

        {/* Active Quiz / Completed Scorecard Quick Jump */}
        {(activeQuiz || hasCompletedResults) && (
          <div className="pt-3 border-t border-stone-200/90 dark:border-stone-800 space-y-1.5">
            {activeQuiz && (
              <button
                type="button"
                onClick={() => handleTabClick('runner')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                  activeTab === 'runner'
                    ? 'bg-emerald-900 border-emerald-950 text-[#FFFDF9] font-semibold shadow-xs'
                    : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/70'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                  <PlayCircle className="w-4 h-4 animate-pulse" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold block truncate">Resume Live Quiz</span>
                    <span className="text-[10px] opacity-80 truncate block">
                      {activeQuiz.quiz_title}
                    </span>
                  </div>
                )}
              </button>
            )}

            {hasCompletedResults && (
              <button
                type="button"
                onClick={() => handleTabClick('complete')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                  activeTab === 'complete'
                    ? 'bg-stone-900 dark:bg-amber-300 border-stone-950 text-[#FFFDF9] dark:text-stone-950 font-semibold shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold block truncate">Quiz Scorecard</span>
                  </div>
                )}
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Compact User Progress Gauge Footer */}
      <div className="p-3 border-t border-stone-200/90 dark:border-stone-800/90 bg-stone-100/50 dark:bg-stone-900/50">
        <UserStats
          stats={stats}
          isCollapsed={isCollapsed}
          onOpenAnalytics={() => handleTabClick('analytics')}
        />
      </div>
    </aside>
  );
};
