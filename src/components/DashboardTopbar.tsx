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
  Music,
  Coins,
} from 'lucide-react';
import { DashboardTab } from './DashboardSidebar';
import { QuizResponse, UserStats, PersonaType } from '../types/quiz';
import { useTheme, GRAPHICS_MODE_CATALOG } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePomodoro } from '../context/PomodoroContext';
import { soundFx } from '../utils/audio';
import { UserAvatar } from './UserAvatar';
import { AppLogo } from './AppLogo';
import { useMascotPreferences, MascotCharacter, MascotColorTheme, MascotAccessory } from './MascotAvatar';
import { getLevelProgress, getDailyRetentionCheckIn } from '../utils/levelingSystem';

interface DashboardTopbarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onToggleMobileSidebar: () => void;
  onOpenSettings: () => void;
  onOpenRawJsonModal?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
  onOpenProfileModal?: () => void;
  onOpenLevelRoadmap?: () => void;
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
  onOpenLevelRoadmap,
  onOpenUploadQuiz,
  activeQuiz,
  stats,
  soundEnabled,
  onToggleSound,
  persona,
  onPersonaChange,
}) => {
  const {
    resolvedTheme,
    toggleTheme,
    currentAccentConfig,
    graphicsMode,
    setGraphicsMode,
    rtxEnabled,
    setRtxEnabled,
    fpsCounterEnabled,
    setFpsCounterEnabled,
  } = useTheme();
  const [isGfxMenuOpen, setIsGfxMenuOpen] = React.useState(false);
  const { user, userProfile, isFirebaseConnected, logout, switchAccount } = useAuth();
  const { mascotCoins, mascotCharacter, mascotTheme, mascotAccessory } = useMascotPreferences();
  const {
    isOpen: isPomodoroOpen,
    toggleOpen: togglePomodoro,
    isRunning: isPomodoroRunning,
    timeLeft: pomodoroTimeLeft,
    formatTime: formatPomodoroTime,
    mode: pomodoroMode,
  } = usePomodoro();

  const [isOnline, setIsOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [regionalClock, setRegionalClock] = React.useState<{ time: string; region: string }>(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      const shortRegion = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
      return {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        region: shortRegion,
      };
    } catch {
      return { time: new Date().toLocaleTimeString(), region: 'Local' };
    }
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
        const shortRegion = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
        setRegionalClock({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          region: shortRegion,
        });
      } catch {
        // ignore
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const [isBgMusicPlaying, setIsBgMusicPlaying] = React.useState<boolean>(soundFx.isBgMusicPlaying);
  const [bgMusicEnabled, setBgMusicEnabled] = React.useState<boolean>(soundFx.bgMusicEnabled);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const unsub = soundFx.subscribeBgMusic(() => {
      setIsBgMusicPlaying(soundFx.isBgMusicPlaying);
      setBgMusicEnabled(soundFx.bgMusicEnabled);
    });
    return () => unsub();
  }, []);

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

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const getPageInfo = () => {
    switch (activeTab) {
      case 'studio':
        return {
          title: 'Make a Quiz',
          subtitle: 'Create a quiz from any topic, notes, document, or voice recording',
        };
      case 'searcher':
        return {
          title: 'Quiz Searcher',
          subtitle: 'Search AI-verified community quizzes, follow creators & explore leaderboards',
        };
      case 'games':
        return {
          title: 'Games · One by One, Math & Spelling Bee',
          subtitle: 'Fast-paced educational word-chain challenge, Math Quiz & Spelling Bee',
        };
      case 'notes':
        return {
          title: 'Study Guides',
          subtitle: 'Clear study notes, key takeaways, and quick practice checks',
        };
      case 'flashcards':
        return {
          title: 'Flashcards',
          subtitle: 'Flip through smart cards to memorize key facts quickly',
        };
      case 'gamma':
        return {
          title: 'Slide Decks',
          subtitle: 'Create and play visual study slides with interactive questions',
        };
      case 'curricula':
        return {
          title: 'Quiz Library',
          subtitle: 'Browse 12+ ready-to-play quizzes in science, coding, history & trivia',
        };
      case 'community':
        return {
          title: 'Community Quizzes',
          subtitle: 'Explore and play quizzes shared by students and teachers',
        };
      case 'live':
        return {
          title: 'Live Battles',
          subtitle: 'Play real-time multiplayer quiz games with a room code',
        };
      case 'music':
        return {
          title: 'Music & Beats',
          subtitle: 'Background study tracks, live visualizer, tempo controls & soundboard',
        };
      case 'authoring':
        return {
          title: 'Write Your Own Quiz',
          subtitle: 'Build custom questions, answers, and explanations from scratch',
        };
      case 'suggestions':
        return {
          title: 'Ideas & Feedback',
          subtitle: 'Share your ideas, vote on features, or pick a suggested topic to study',
        };
      case 'achievements':
        return {
          title: 'Achievements & Rewards',
          subtitle: 'Track your 1,000+ unlockable badges, trophies, and milestones',
        };
      case 'analytics':
        return {
          title: 'My Stats & Progress',
          subtitle: 'See your accuracy, daily streaks, XP level, and strengths',
        };
      case 'history':
        return {
          title: 'Past Quizzes',
          subtitle: 'Review your past scores, answers, and printable certificates',
        };
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Customize colors, animations, background music, and sound effects',
        };
      case 'runner':
        return {
          title: activeQuiz?.quiz_title || 'Active Quiz',
          subtitle: `In Progress • ${activeQuiz?.questions?.length || 0} questions • ${activeQuiz?.difficulty || 'Medium'}`,
        };
      case 'complete':
        return {
          title: 'Quiz Results',
          subtitle: 'Your score, XP earned, and step-by-step answer review',
        };
      default:
        return {
          title: 'Quiz Me!',
          subtitle: 'Smart & Fun Learning',
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
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
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

          <div className="md:hidden flex items-center shrink-0">
            <AppLogo size="xs" showSubtitle={false} showBadge={false} onClick={() => onSelectTab('studio')} />
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              {page.title}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate hidden sm:block">
              {page.subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Streamlined Search, Mastery Pill, Mode Selector, Utilities & Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Regional Clock QoL Widget */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 select-none"
            title={`Regional Clock linked to ${Intl.DateTimeFormat().resolvedOptions().timeZone || 'your region'}`}
          >
            <Timer className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{regionalClock.time}</span>
            <span className="text-slate-400">·</span>
            <span className="font-sans text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 truncate max-w-[90px]">
              {regionalClock.region}
            </span>
          </div>
          {/* Quick Command Palette / Search Trigger */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenCommandPalette();
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs text-xs font-semibold"
              title="Search & Command Menu (Cmd + K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-slate-600 dark:text-slate-300">Search</span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Offline Mode Indicator */}
          {!isOnline && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700 font-bold text-xs shadow-2xs"
              title="Working Offline: Core quizzes & flashcards remain fully functional via local caching"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Student / Teacher Mode Selector */}
          {onPersonaChange && (
            <div className="hidden md:flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-black shadow-inner">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onPersonaChange('Student');
                }}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  persona === 'Student'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25'
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
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  persona === 'Teacher'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Teacher
              </button>
            </div>
          )}

          {/* Unified Rank, Streak, XP & Mascot Coins Action Bar */}
          {(() => {
            const lvlProg = getLevelProgress(stats.xp || 0, stats.streak || 1);
            const dailyCheck = getDailyRetentionCheckIn();
            return (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  if (onOpenLevelRoadmap) onOpenLevelRoadmap();
                  else if (onOpenProfileModal) onOpenProfileModal();
                  else onSelectTab('analytics');
                }}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs text-xs font-black cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                title={`Lv.${lvlProg.level} ${lvlProg.rank.title} • ${stats.xp} XP (${lvlProg.progressPercent}% to Lv.${lvlProg.level + 1}) • Click for Level Roadmap & Daily Check-In`}
              >
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <span>{lvlProg.rank.badgeEmoji}</span>
                  <span>Lv.{lvlProg.level}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{stats.streak}d</span>
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{stats.xp.toLocaleString()} XP</span>
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{mascotCoins}</span>
                </span>
                {!dailyCheck.claimedToday && (
                  <span className="ml-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Daily Check-In Reward Available!" />
                )}
              </button>
            );
          })()}

          {/* New Quiz Quick Action Button (Only when not in Studio) */}
          {activeTab !== 'studio' && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onSelectTab('studio');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-black shadow-sm shadow-indigo-500/25 hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">New Quiz</span>
            </button>
          )}

          {/* Compact Utility Group: Graphics/RTX, Pomodoro, Theme, Sound, Settings */}
          <div className="relative flex items-center gap-1 p-1 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            {/* Quick Graphics & RTX Mode Button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsGfxMenuOpen((prev) => !prev);
              }}
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                rtxEnabled && graphicsMode !== 'simple'
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title="Switch Graphics Mode (Simple / Medium / Performance 120Hz / Ultra RTX)"
            >
              <span>{graphicsMode === 'ultra' ? '💎' : graphicsMode === 'performance' ? '⚡' : graphicsMode === 'medium' ? '⚖️' : '🌿'}</span>
              <span className="uppercase">{graphicsMode === 'ultra' ? 'RTX' : graphicsMode}</span>
            </button>

            {isGfxMenuOpen && (
              <div className="absolute right-0 top-11 z-50 w-72 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                      <span>💎 Graphics & RTX Engine</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Real-time shaders, lighting & frame pacing
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      const next = !rtxEnabled;
                      setRtxEnabled(next);
                      if (next && graphicsMode === 'simple') setGraphicsMode('ultra');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer ${
                      rtxEnabled && graphicsMode !== 'simple'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {rtxEnabled && graphicsMode !== 'simple' ? 'RTX ON' : 'RTX OFF'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {GRAPHICS_MODE_CATALOG.map((gm) => (
                    <button
                      key={gm.id}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setGraphicsMode(gm.id);
                        setIsGfxMenuOpen(false);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        graphicsMode === gm.id
                          ? gm.id === 'ultra'
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50'
                            : 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{gm.icon}</span>
                        <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                          {gm.badge}
                        </span>
                      </div>
                      <div className="text-[11px] font-black text-slate-900 dark:text-white mt-0.5">
                        {gm.shortName}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setFpsCounterEnabled(!fpsCounterEnabled);
                    }}
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg cursor-pointer ${
                      fpsCounterEnabled
                        ? 'bg-slate-900 text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {fpsCounterEnabled ? '🟢 Live FPS HUD: ON' : 'Show Live FPS HUD'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGfxMenuOpen(false)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              id="topbar-pomodoro-toggle-btn"
              onClick={togglePomodoro}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isPomodoroRunning
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400/50'
                  : isPomodoroOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title="Toggle Pomodoro Study Timer"
            >
              <Timer className={`w-3.5 h-3.5 ${isPomodoroRunning ? 'text-amber-500 animate-spin' : ''}`} />
              {isPomodoroRunning && (
                <span className="font-mono text-[11px]">{formatPomodoroTime(pomodoroTimeLeft)}</span>
              )}
            </button>

            <button
              type="button"
              id="theme-mode-toggle"
              onClick={handleThemeClick}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Light and Dark Mode"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <button
              type="button"
              id="sound-fx-toggle"
              onClick={handleSoundClick}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={soundEnabled ? 'Sound Effects Active' : 'Sound Effects Muted'}
              aria-label="Toggle Sound Effects"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {bgMusicEnabled && (
              <button
                type="button"
                id="bg-music-quick-toggle"
                onClick={() => {
                  soundFx.playClick();
                  soundFx.toggleBgMusic();
                }}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isBgMusicPlaying
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
                title={
                  isBgMusicPlaying
                    ? 'Minimal Gamified Background Music Playing (Click to pause)'
                    : 'Play Minimal Gamified Background Music'
                }
                aria-label="Toggle Minimal Background Music"
              >
                <Music className={`w-4 h-4 ${isBgMusicPlaying ? 'animate-pulse' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenSettings();
              }}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Open Quick Preferences"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          {/* User Account / Scholar Menu Dropdown */}
          {user && (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsProfileMenuOpen((prev) => !prev);
                }}
                className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer shadow-2xs"
                title="Scholar Profile & Quick Menu"
              >
                <UserAvatar
                  displayName={userProfile?.displayName || user.displayName}
                  photoURL={
                    userProfile?.avatarType === 'icon' || userProfile?.avatarType === 'mascot'
                      ? null
                      : userProfile?.photoURL || user.photoURL
                  }
                  avatarType={userProfile?.avatarType}
                  avatarIcon={userProfile?.avatarIcon}
                  avatarBg={userProfile?.avatarBg}
                  mascotCharacter={(userProfile?.mascotCharacter as MascotCharacter) || mascotCharacter}
                  mascotTheme={(userProfile?.mascotTheme as MascotColorTheme) || mascotTheme}
                  equippedAccessory={(userProfile?.equippedAccessory as MascotAccessory) || mascotAccessory}
                  size="xs"
                />
                <span className="hidden xl:inline text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[90px] truncate">
                  {userProfile?.displayName || user.displayName || 'Scholar'}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {userProfile?.displayName || user.displayName || 'Scholar'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      {isFirebaseConnected && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Cloud Synced
                        </span>
                      )}
                      <span>•</span>
                      <span>{stats.gems ?? 0} Gems</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsProfileMenuOpen(false);
                      onOpenProfileModal?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Customize Scholar Profile</span>
                  </button>

                  {onOpenUploadQuiz && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsProfileMenuOpen(false);
                        onOpenUploadQuiz();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Upload Quiz File</span>
                    </button>
                  )}

                  {activeTab !== 'live' && (
                    <button
                      type="button"
                      id="topbar-live-room-btn"
                      onClick={() => {
                        soundFx.playClick();
                        setIsProfileMenuOpen(false);
                        onSelectTab('live');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5 text-rose-500" />
                      <span>Live Multiplayer Room</span>
                    </button>
                  )}

                  {onOpenShortcuts && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsProfileMenuOpen(false);
                        onOpenShortcuts();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Keyboard Shortcuts (?)</span>
                    </button>
                  )}

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsProfileMenuOpen(false);
                        switchAccount();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
