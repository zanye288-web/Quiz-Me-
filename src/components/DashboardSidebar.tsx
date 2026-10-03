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
  Flame,
  Award,
  GraduationCap,
  Trophy,
  Upload,
  Radio,
  Layout,
  Users,
  FileText,
} from 'lucide-react';
import { PersonaType, UserStats as UserStatsType, QuizResponse } from '../types/quiz';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/audio';
import { UserStats } from './UserStats';
import { UserAvatar } from './UserAvatar';

export type DashboardTab = 'studio' | 'notes' | 'gamma' | 'flashcards' | 'curricula' | 'community' | 'live' | 'authoring' | 'achievements' | 'analytics' | 'history' | 'settings' | 'runner' | 'complete';

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

  const navigationSections = [
    {
      title: 'Study & Practice',
      items: [
        {
          id: 'studio' as DashboardTab,
          label: 'AI Quiz Studio',
          shortLabel: 'Studio',
          icon: Sparkles,
          badge: 'Create',
          description: 'Generate from topics, files & audio',
        },
        {
          id: 'notes' as DashboardTab,
          label: 'AI Study Notes',
          shortLabel: 'Notes',
          icon: FileText,
          badge: 'AI Tutor',
          description: 'Structured concepts, pitfalls & self-checks',
        },
        {
          id: 'gamma' as DashboardTab,
          label: 'Gamma Deck Studio',
          shortLabel: 'Gamma',
          icon: Layout,
          badge: 'Interactive',
          description: 'Interactive visual decks like Gamma',
        },
        {
          id: 'flashcards' as DashboardTab,
          label: 'Flashcard Studio',
          shortLabel: 'Cards',
          icon: Layers,
          badge: 'AI Deck',
          description: 'Generate flashcards & spaced recall',
        },
        {
          id: 'curricula' as DashboardTab,
          label: 'Quiz Library',
          shortLabel: 'Library',
          icon: BookOpen,
          badge: '12 Sets',
          description: 'Science, coding, history & trivia',
        },
        {
          id: 'community' as DashboardTab,
          label: 'Community Feed',
          shortLabel: 'Community',
          icon: Users,
          badge: 'Feed',
          description: 'Quizzes shared by teachers & students',
        },
        {
          id: 'live' as DashboardTab,
          label: 'Live Battles',
          shortLabel: 'Live',
          icon: Radio,
          badge: 'Multiplayer',
          description: 'Synchronous room code sessions',
        },
        {
          id: 'authoring' as DashboardTab,
          label: 'Custom Builder',
          shortLabel: 'Builder',
          icon: PlusCircle,
          badge: 'Manual',
          description: 'Write custom questions & rubrics',
        },
      ],
    },
    {
      title: 'Progress & Awards',
      items: [
        {
          id: 'achievements' as DashboardTab,
          label: 'Learning Path & Awards',
          shortLabel: 'Path',
          icon: Trophy,
          badge: 'Tree & XP',
          description: 'Adaptive skill tree & badge trophies',
        },
        {
          id: 'analytics' as DashboardTab,
          label: 'Performance & XP',
          shortLabel: 'Stats',
          icon: BarChart3,
          badge: `${stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 100}%`,
          description: 'Mastery levels, streaks & accuracy',
        },
        {
          id: 'history' as DashboardTab,
          label: 'History & Diplomas',
          shortLabel: 'History',
          icon: History,
          badge: historyCount > 0 ? String(historyCount) : null,
          description: 'Past quiz archives & certificates',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'settings' as DashboardTab,
          label: 'Settings & UI',
          shortLabel: 'Settings',
          icon: Sliders,
          badge: 'Custom',
          description: 'Colors, typography & voice audio',
        },
      ],
    },
  ];

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
      {/* App Brand Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between min-h-[68px]">
        {!isCollapsed ? (
          <button
            type="button"
            onClick={() => handleTabClick('studio')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
                  Quiz Me!
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40 dark:border-indigo-700/40">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                AI Learning Platform
              </p>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleTabClick('studio')}
            className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-110 hover:rotate-6 transition-all duration-300"
            title="Quiz Me! Studio"
          >
            ⚡
          </button>
        )}

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
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navigationSections.map((sec, secIdx) => (
          <div key={sec.title} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {sec.title}
              </div>
            ) : secIdx > 0 ? (
              <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
            ) : null}

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer group relative ${
                    isActive
                      ? `${currentAccentConfig.activeBtn} font-bold shadow-xs`
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                  }`}
                  title={item.label}
                >
                  <div
                    className={`p-2 rounded-xl transition-colors shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : `bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:${currentAccentConfig.activeText}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              isActive
                                ? 'bg-white/25 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[10px] truncate mt-0.5 ${
                          isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Active Quiz Quick Jump */}
        {activeQuiz && (
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                In Progress
              </div>
            )}
            <button
              type="button"
              onClick={() => handleTabClick('runner')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'runner'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
            >
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shrink-0">
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
          </div>
        )}

        {/* Completed Results Quick Jump */}
        {hasCompletedResults && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleTabClick('complete')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'complete'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold block truncate">View Scorecard</span>
                  <span className="text-[10px] opacity-75 truncate block">Latest Evaluation</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Upload Created Quiz Quick Action */}
        {onOpenUploadQuiz && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenUploadQuiz();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl border border-dashed border-indigo-300/80 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Upload your created quiz (JSON or text file)"
            >
              <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Upload className="w-3.5 h-3.5" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-xs font-black block truncate">Upload Quiz</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Import JSON or Text</span>
                </div>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* User Progress & Quick Settings Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
        {/* Scholar Profile Card (Optional Customization Trigger) */}
        {user && (
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenProfileModal?.();
            }}
            className={`w-full flex items-center gap-2.5 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-850/90 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 text-left transition-all cursor-pointer group shadow-2xs ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Scholar Profile (Click to customize - Optional)"
          >
            <UserAvatar
              displayName={userProfile?.displayName || user.displayName}
              photoURL={userProfile?.avatarType === 'icon' ? null : (userProfile?.photoURL || user.photoURL)}
              avatarType={userProfile?.avatarType}
              avatarIcon={userProfile?.avatarIcon}
              avatarBg={userProfile?.avatarBg}
              size={isCollapsed ? 'sm' : 'sm'}
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {userProfile?.displayName || user.displayName || 'Scholar'}
                  </span>
                  <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    Edit
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {userProfile?.headline || 'Customize Profile (Optional)'}
                </p>
              </div>
            )}
          </button>
        )}

        <UserStats
          stats={stats}
          isCollapsed={isCollapsed}
          onOpenAnalytics={() => handleTabClick('analytics')}
        />

        {/* Bottom Quick Controls: Theme Toggle & Settings */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleThemeToggle}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Toggle Light / Dark Mode"
          >
            {resolvedTheme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                {!isCollapsed && <span>Light</span>}
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                {!isCollapsed && <span>Dark</span>}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
