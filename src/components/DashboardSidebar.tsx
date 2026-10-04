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
} from 'lucide-react';
import { PersonaType, UserStats as UserStatsType, QuizResponse } from '../types/quiz';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/audio';
import { UserStats } from './UserStats';
import { UserAvatar } from './UserAvatar';
import { MascotAvatar } from './MascotAvatar';
import { AppLogo } from './AppLogo';

export type DashboardTab = 'studio' | 'notes' | 'gamma' | 'flashcards' | 'curricula' | 'community' | 'live' | 'music' | 'authoring' | 'suggestions' | 'achievements' | 'analytics' | 'history' | 'settings' | 'runner' | 'complete';

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
    'Create & Study': true,
    'Explore & Compete': true,
    'Progress & Mastery': true,
  });

  const navigationSections = [
    {
      title: 'Create & Study',
      items: [
        {
          id: 'studio' as DashboardTab,
          label: 'Make a Quiz',
          shortLabel: 'Create',
          icon: Sparkles,
          badge: 'New',
          description: 'Turn any topic, notes, or file into a quiz',
        },
        {
          id: 'notes' as DashboardTab,
          label: 'Study Guides',
          shortLabel: 'Notes',
          icon: FileText,
          badge: null,
          description: 'Easy study notes, tips & quick summaries',
        },
        {
          id: 'flashcards' as DashboardTab,
          label: 'Flashcards',
          shortLabel: 'Cards',
          icon: Layers,
          badge: null,
          description: 'Flip cards to memorize key facts fast',
        },
        {
          id: 'gamma' as DashboardTab,
          label: 'Slide Decks',
          shortLabel: 'Slides',
          icon: Layout,
          badge: null,
          description: 'Visual study slides with built-in questions',
        },
        {
          id: 'authoring' as DashboardTab,
          label: 'Write Your Own',
          shortLabel: 'Builder',
          icon: PlusCircle,
          badge: null,
          description: 'Create your own questions from scratch',
        },
      ],
    },
    {
      title: 'Explore & Compete',
      items: [
        {
          id: 'curricula' as DashboardTab,
          label: 'Quiz Library',
          shortLabel: 'Library',
          icon: BookOpen,
          badge: '12',
          description: 'Ready-to-play quizzes in science, coding & history',
        },
        {
          id: 'community' as DashboardTab,
          label: 'Community Quizzes',
          shortLabel: 'Community',
          icon: Users,
          badge: null,
          description: 'Quizzes shared by other learners & teachers',
        },
        {
          id: 'live' as DashboardTab,
          label: 'Live Battles',
          shortLabel: 'Live',
          icon: Radio,
          badge: 'Live',
          description: 'Play live with friends using a game code',
        },
        {
          id: 'music' as DashboardTab,
          label: 'Music & Beats',
          shortLabel: 'Music',
          icon: Music,
          badge: 'Fresh',
          description: 'Study beats, sound effects & custom tempo',
        },
        {
          id: 'suggestions' as DashboardTab,
          label: 'Ideas & Feedback',
          shortLabel: 'Ideas',
          icon: Lightbulb,
          badge: null,
          description: 'Send suggestions or pick what to study next',
        },
      ],
    },
    {
      title: 'Progress & Mastery',
      items: [
        {
          id: 'achievements' as DashboardTab,
          label: 'Achievements',
          shortLabel: 'Badges',
          icon: Trophy,
          badge: null,
          description: 'Unlock 1,000+ badges, trophies & rewards',
        },
        {
          id: 'analytics' as DashboardTab,
          label: 'My Stats',
          shortLabel: 'Stats',
          icon: BarChart3,
          badge: `${stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 100}%`,
          description: 'Your accuracy, streaks & level progress',
        },
        {
          id: 'history' as DashboardTab,
          label: 'Past Quizzes',
          shortLabel: 'History',
          icon: History,
          badge: historyCount > 0 ? String(historyCount) : null,
          description: 'Review past quizzes & certificates',
        },
        {
          id: 'settings' as DashboardTab,
          label: 'Settings',
          shortLabel: 'Settings',
          icon: Sliders,
          badge: null,
          description: 'Themes, animations, sounds & profile',
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
      className={`relative flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* App Brand Header with Mascot as Official Logo */}
      <div className="px-3 py-2.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between min-h-[56px]">
        <AppLogo
          collapsed={isCollapsed}
          mood={persona === 'Teacher' ? 'teacher' : stats.streak > 3 ? 'streak' : 'idle'}
          onClick={() => handleTabClick('studio')}
        />

        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onToggleCollapse();
          }}
          className="hidden md:flex p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Categorized Navigation Sections */}
      <nav className="flex-1 px-2.5 py-2 space-y-2 overflow-y-auto scrollbar-none">
        {navigationSections.map((sec, secIdx) => {
          const hasActiveItem = sec.items.some((i) => i.id === activeTab);
          const isGroupOpen = isCollapsed || expandedGroups[sec.title] || hasActiveItem;
          return (
            <div key={sec.title} className="space-y-0.5">
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(sec.title)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <span>{sec.title}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isGroupOpen ? '' : '-rotate-90'
                    }`}
                  />
                </button>
              ) : secIdx > 0 ? (
                <div className="my-1.5 border-t border-slate-200 dark:border-slate-800" />
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
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer group relative ${
                        isActive
                          ? `${currentAccentConfig.activeBtn} font-bold shadow-xs`
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                      }`}
                      title={`${item.label} — ${item.description}`}
                    >
                      <div
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : `bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:${currentAccentConfig.activeText}`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {!isCollapsed && (
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                          <span className="text-xs font-bold truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                                isActive
                                  ? 'bg-white/25 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
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
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
            {activeQuiz && (
              <button
                type="button"
                onClick={() => handleTabClick('runner')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-2xl text-left transition-all cursor-pointer ${
                  activeTab === 'runner'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                }`}
              >
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shrink-0">
                  <PlayCircle className="w-4 h-4 animate-pulse" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black block truncate">Resume Exam</span>
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
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-2xl text-left transition-all cursor-pointer ${
                  activeTab === 'complete'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block truncate">View Scorecard</span>
                  </div>
                )}
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Compact User Progress Gauge Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <UserStats
          stats={stats}
          isCollapsed={isCollapsed}
          onOpenAnalytics={() => handleTabClick('analytics')}
        />
      </div>
    </aside>
  );
};
