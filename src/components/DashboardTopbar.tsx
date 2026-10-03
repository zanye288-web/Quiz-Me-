import React from 'react';
import {
  Menu,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  FileCode,
  Plus,
  Sun,
  Moon,
  Flame,
  Award,
  BookOpen,
  Search,
  Command,
  HelpCircle,
  Cloud,
  LogIn,
  LogOut,
  User as UserIcon,
  Users,
  Upload,
  Timer,
  Radio,
  WifiOff,
} from 'lucide-react';
import { DashboardTab } from './DashboardSidebar';
import { QuizResponse, UserStats, PersonaType } from '../types/quiz';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePomodoro } from '../context/PomodoroContext';
import { soundFx } from '../utils/audio';
import { UserAvatar } from './UserAvatar';

interface DashboardTopbarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onToggleMobileSidebar: () => void;
  onOpenSettings: () => void;
  onOpenRawJsonModal?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
  onOpenProfileModal?: () => void;
  onOpenUploadQuiz?: () => void;
  activeQuiz: QuizResponse | null;
  stats: UserStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  persona: PersonaType;
  onPersonaChange?: (p: PersonaType) => void;
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  activeTab,
  onSelectTab,
  onToggleMobileSidebar,
  onOpenSettings,
  onOpenRawJsonModal,
  onOpenCommandPalette,
  onOpenShortcuts,
  onOpenProfileModal,
  onOpenUploadQuiz,
  activeQuiz,
  stats,
  soundEnabled,
  onToggleSound,
  persona,
  onPersonaChange,
}) => {
  const { resolvedTheme, toggleTheme, currentAccentConfig } = useTheme();
  const { user, userProfile, isFirebaseConnected, logout, switchAccount } = useAuth();
  const {
    isOpen: isPomodoroOpen,
    toggleOpen: togglePomodoro,
    isRunning: isPomodoroRunning,
    timeLeft: pomodoroTimeLeft,
    formatTime: formatPomodoroTime,
    mode: pomodoroMode,
  } = usePomodoro();

  const [isOnline, setIsOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getPageInfo = () => {
    switch (activeTab) {
      case 'studio':
        return {
          title: 'AI Quiz Studio',
          subtitle: 'Generate assessments from topics, study notes, documents & audio',
        };
      case 'gamma':
        return {
          title: 'Gamma Interactive Deck Studio',
          subtitle: 'Create, present & play interactive slide quizzes with rich educational imagery',
        };
      case 'curricula':
        return {
          title: 'Quiz Library',
          subtitle: 'Browse 12+ ready-to-play tracks in science, coding, history & trivia',
        };
      case 'community':
        return {
          title: 'Community Feed',
          subtitle: 'Discover, like, and study quizzes created by students and teachers',
        };
      case 'live':
        return {
          title: 'Live Battle Rooms',
          subtitle: 'Synchronous competitive multiplayer assessments with unique room codes',
        };
      case 'authoring':
        return {
          title: 'Custom Quiz Builder',
          subtitle: 'Create and structure custom questions, code snippets & rubrics',
        };
      case 'analytics':
        return {
          title: 'Performance & XP Analytics',
          subtitle: 'Track your Bloom taxonomy mastery, streaks, accuracy & leaderboard',
        };
      case 'history':
        return {
          title: 'History & Diplomas',
          subtitle: 'Review previous attempts, answer breakdowns & verified certificates',
        };
      case 'settings':
        return {
          title: 'Settings & UI Customization',
          subtitle: 'Personalize themes, typography, audio synthesis & evaluation modes',
        };
      case 'runner':
        return {
          title: activeQuiz?.quiz_title || 'Active Assessment',
          subtitle: `In Progress • ${activeQuiz?.questions?.length || 0} questions • ${activeQuiz?.difficulty || 'Intermediate'}`,
        };
      case 'complete':
        return {
          title: 'Evaluation Scorecard',
          subtitle: 'Detailed performance breakdown, XP gains & concept review',
        };
      default:
        return {
          title: 'Quiz Me!',
          subtitle: 'Intelligent Learning Platform',
        };
    }
  };

  const page = getPageInfo();

  const handleThemeClick = () => {
    soundFx.playThemeToggle();
    toggleTheme();
  };

  const handleSoundClick = () => {
    onToggleSound();
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onToggleMobileSidebar();
            }}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              {page.title}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate hidden sm:block">
              {page.subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Badges, Actions, Audio, Theme & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Command Palette / Search Trigger */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenCommandPalette();
              }}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs text-xs font-semibold"
              title="Search & Command Menu (Cmd + K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-slate-600 dark:text-slate-300">Quick Actions</span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Keyboard Shortcuts Trigger */}
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenShortcuts();
              }}
              className="hidden lg:flex p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
              title="Keyboard Shortcuts Cheatsheet (?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {/* Offline Mode Indicator */}
          {!isOnline && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700 font-bold text-xs shadow-2xs"
              title="Working Offline: Core quizzes & flashcards remain fully functional via local caching"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Offline Mode</span>
            </div>
          )}

          {/* Pomodoro Study Timer Quick-Toggle Button */}
          <button
            type="button"
            id="topbar-pomodoro-toggle-btn"
            onClick={togglePomodoro}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-black shadow-2xs transition-all cursor-pointer ${
              isPomodoroRunning
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/20'
                : isPomodoroOpen
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Toggle Pomodoro Study Timer Overlay"
          >
            <Timer className={`w-3.5 h-3.5 ${isPomodoroRunning ? 'text-amber-500 animate-spin' : 'text-slate-500 dark:text-slate-400'}`} />
            <span className="font-mono">{isPomodoroRunning ? formatPomodoroTime(pomodoroTimeLeft) : 'Pomodoro'}</span>
          </button>

          {/* Live Battle Quick Trigger */}
          {activeTab !== 'live' && (
            <button
              type="button"
              id="topbar-live-room-btn"
              onClick={() => {
                soundFx.playClick();
                onSelectTab('live');
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Join or host a live synchronous multiplayer quiz battle"
            >
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span className="hidden xl:inline">Live Room</span>
            </button>
          )}

          {/* Streak & XP Badges */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs backdrop-blur-sm">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/50 font-black text-xs shadow-2xs group cursor-default"
              title={`${stats.streak} day streak`}
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
              <span className="whitespace-nowrap">{stats.streak}d Streak</span>
            </div>

            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40 dark:border-indigo-700/50 font-black text-xs shadow-2xs group cursor-default"
              title={`${stats.xp} Total Experience Points`}
            >
              <Award className="w-4 h-4 text-indigo-500" />
              <span className="whitespace-nowrap">{stats.xp} XP</span>
            </div>

            {stats.gems !== undefined && (
              <div
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/50 font-black text-xs shadow-2xs"
                title={`${stats.gems} Gems`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>{stats.gems}</span>
              </div>
            )}
          </div>

          {/* Student / Teacher Mode Selector */}
          {onPersonaChange && (
            <div className="hidden lg:flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-black shadow-inner">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onPersonaChange('Student');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  persona === 'Student'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onPersonaChange('Teacher');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  persona === 'Teacher'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Teacher
              </button>
            </div>
          )}

          {/* Firebase Cloud Sync Status */}
          {isFirebaseConnected && (
            <div
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-xs shadow-2xs whitespace-nowrap"
              title="Connected to Firebase Firestore with real-time cloud persistence"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cloud Synced</span>
            </div>
          )}

          {/* User Account / Profile Customization */}
          {user && (
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenProfileModal?.();
                }}
                className="flex items-center gap-1.5 p-0.5 sm:px-1.5 hover:opacity-85 transition-opacity cursor-pointer text-left"
                title="Customize your scholar profile"
              >
                <UserAvatar
                  displayName={userProfile?.displayName || user.displayName}
                  photoURL={userProfile?.avatarType === 'icon' ? null : (userProfile?.photoURL || user.photoURL)}
                  avatarType={userProfile?.avatarType}
                  avatarIcon={userProfile?.avatarIcon}
                  avatarBg={userProfile?.avatarBg}
                  size="xs"
                />
                <div className="hidden xl:flex flex-col min-w-0 max-w-[90px]">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                    {userProfile?.displayName || user.displayName || 'Scholar'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-none">
                    {userProfile?.headline || 'Edit Profile'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenProfileModal?.();
                }}
                className="hidden md:flex p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                title="Customize Profile"
              >
                <UserIcon className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  switchAccount();
                }}
                className="hidden md:flex p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                title="Switch scholar account"
              >
                <Users className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  logout();
                }}
                className="hidden md:flex p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Upload Created Quiz Button */}
          {onOpenUploadQuiz && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenUploadQuiz();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-black shadow-2xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer whitespace-nowrap"
              title="Upload your created quiz file (JSON or formatted text)"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden md:inline">Upload Quiz</span>
            </button>
          )}

          {/* New Quiz Quick Action Button */}
          {activeTab !== 'studio' && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onSelectTab('studio');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-black shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">New Quiz</span>
            </button>
          )}

          {/* Light / Dark Mode Switcher */}
          <button
            type="button"
            id="theme-mode-toggle"
            onClick={handleThemeClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light and Dark Mode"
          >
            {resolvedTheme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold hidden lg:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold hidden lg:inline">Dark</span>
              </>
            )}
          </button>

          {/* Sound Effects Toggle Button */}
          <button
            type="button"
            id="sound-fx-toggle"
            onClick={handleSoundClick}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                : 'border-slate-200/80 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900 text-slate-400'
            }`}
            title={soundEnabled ? 'Sound Effects Active' : 'Sound Effects Muted'}
            aria-label="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Open Settings Studio"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
