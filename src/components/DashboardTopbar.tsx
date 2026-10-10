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
  ShieldCheck,
  Palette,
} from 'lucide-react';
import { DashboardTab } from './DashboardSidebar';
import { QuizResponse, UserStats, PersonaType } from '../types/quiz';
import { useTheme, GRAPHICS_MODE_CATALOG, UI_THEME_CATALOG, UI_STYLE_CATALOG } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePomodoro } from '../context/PomodoroContext';
import { soundFx } from '../utils/audio';
import { UserAvatar } from './UserAvatar';
import { AppLogo } from './AppLogo';
import { useMascotPreferences, MascotCharacter, MascotColorTheme, MascotAccessory } from './MascotAvatar';
import { getLevelProgress, getDailyRetentionCheckIn } from '../utils/levelingSystem';
import { getDailyEffortVerificationStatus } from '../utils/xpIntegrity';
import { loadMasteryProfile } from '../utils/adaptiveLearningEngine';

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
    uiTheme,
    setUiTheme,
    uiStyle,
    setUiStyle,
  } = useTheme();
  const [isGfxMenuOpen, setIsGfxMenuOpen] = React.useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false);
  const themeMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeMenuOpen]);
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
  const [masteryProfile, setMasteryProfile] = React.useState(() => loadMasteryProfile());

  React.useEffect(() => {
    const syncMastery = () => {
      const next = loadMasteryProfile();
      setMasteryProfile(next);
      if (next.equippedThemeBadge && next.equippedThemeBadge.includes('Golden')) {
        setUiTheme('sunset_manga');
      }
    };
    window.addEventListener('mastery-profile-updated', syncMastery);
    window.addEventListener('storage', syncMastery);
    return () => {
      window.removeEventListener('mastery-profile-updated', syncMastery);
      window.removeEventListener('storage', syncMastery);
    };
  }, [setUiTheme]);
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
          title: 'Quiz Maker & Quick-Play Arena',
          subtitle: 'Pick a topic, choose your difficulty & play an interactive quiz in seconds',
        };
      case 'exam':
        return {
          title: 'Official Exam Mode · Checkpoint, WAEC, JAMB, IGCSE & SAT',
          subtitle: 'Timed standardized exam simulator with authentic grading scales and AI paper generator',
        };
      case 'past_papers':
        return {
          title: 'Past Papers & Exam Textbooks Hub',
          subtitle: 'Download printable WAEC, JAMB, Checkpoint, NECO, IGCSE & SAT past papers, marking schemes & textbooks',
        };
      case 'searcher':
        return {
          title: 'Global Quiz Searcher',
          subtitle: 'Play AI-verified community quizzes, climb the creator leaderboard & challenge peers',
        };
      case 'games':
        return {
          title: 'Quiz Arcade · Word-Chain, Math & Spelling Bee',
          subtitle: 'Turn-based One by One Word-Chain, Speed Math Quiz & Academic Spelling Bee',
        };
      case 'notes':
        return {
          title: 'AI Notes Generator & Study Guides',
          subtitle: 'Generate custom study notes, WAEC/JAMB/Checkpoint cram sheets & practice checks',
        };
      case 'flashcards':
        return {
          title: 'Flashcard Speed Drill',
          subtitle: 'Flip active-recall quiz cards to lock in definitions and formulas',
        };
      case 'gamma':
        return {
          title: 'Gamma AI+ Presentation Maker & Interactive Studio',
          subtitle: 'Build interactive slide decks with live quizzes, polls, simulators & export to PPTX, PDF, HTML5 & DOC',
        };
      case 'curricula':
        return {
          title: 'Quiz Deck Library',
          subtitle: 'Ready-to-play subject quiz decks across STEM, History, Literature & Trivia',
        };
      case 'community':
        return {
          title: 'Community Quiz Decks',
          subtitle: 'Play, like, and comment on quizzes created by students and teachers',
        };
      case 'live':
        return {
          title: 'Live Multiplayer Quiz Battles',
          subtitle: 'Host or join a real-time multiplayer quiz arena with a 6-digit PIN',
        };
      case 'music':
        return {
          title: 'Quiz Show & Study Beats',
          subtitle: 'Full-length royalty-free NCS & classical study tracks with credit attribution',
        };
      case 'authoring':
        return {
          title: 'Custom Quiz Creator Studio',
          subtitle: 'Write your own multiple-choice, fill-in-the-blank & open quiz questions',
        };
      case 'suggestions':
        return {
          title: 'Quiz Topic Ideas & Voting',
          subtitle: 'Vote on new quiz packs or launch a trending community quiz topic',
        };
      case 'achievements':
        return {
          title: 'Trophy Case & Quiz Badges',
          subtitle: 'Unlock 1,000+ quiz mastery badges, streak medals, and championship titles',
        };
      case 'analytics':
        return {
          title: 'Player Stats & Accuracy',
          subtitle: 'Track your quiz accuracy, subject mastery radar, XP rank, and daily streak',
        };
      case 'history':
        return {
          title: 'Past Quizzes & 5-Star Certificates',
          subtitle: 'Review completed quizzes, answer breakdowns, and downloadable 5-star certificates',
        };
      case 'settings':
        return {
          title: 'Quiz Settings & Keybinds',
          subtitle: 'Customize 5 UI styles (3D, Modern, Legacy, Playful, Default), keybinds & audio',
        };
      case 'runner':
        return {
          title: activeQuiz?.quiz_title || 'Live Quiz Stage',
          subtitle: `Question Arena • ${activeQuiz?.questions?.length || 0} Questions • ${activeQuiz?.difficulty || 'Intermediate'}`,
        };
      case 'complete':
        return {
          title: 'Quiz Podium & Final Scoreboard',
          subtitle: 'Your final score, XP earned, 5-star rating, and question-by-question review',
        };
      default:
        return {
          title: 'Quiz Me!',
          subtitle: 'Interactive Quiz & Trivia Arena',
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

  const primaryArcadePills: Array<{ id: DashboardTab; emoji: string; label: string; badge?: string }> = [
    { id: 'studio', emoji: '⚡', label: 'Play & Create' },
    { id: 'exam', emoji: '🎓', label: 'Exam Mode', badge: 'WAEC/JAMB' },
    { id: 'past_papers', emoji: '📚', label: 'Past Papers Hub', badge: 'PDF/BOOK' },
    { id: 'gamma', emoji: '🖥️', label: 'Presentation Maker', badge: 'PPTX/PDF' },
    { id: 'notes', emoji: '📝', label: 'Notes Generator' },
    { id: 'curricula', emoji: '🎯', label: 'Quiz Decks' },
  ];

  const lvlProg = getLevelProgress(stats.xp || 0, stats.streak || 1);
  const dailyCheck = getDailyRetentionCheckIn();
  const effortStatus = getDailyEffortVerificationStatus();

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b-2 border-slate-900 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-[1460px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* ZONE 1: All Modes Drawer Button & Vibrant QuizMe! Arcade Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onToggleMobileSidebar();
            }}
            className="comic-panel-sm arcade-btn flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs font-black whitespace-nowrap"
            aria-label="Open All Modes & Game Menu"
            title="Open All 16 Quiz Modes, Trophies & Tools"
          >
            <Menu className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">All Modes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onSelectTab('studio');
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 border-2 border-slate-950 border-b-4 border-b-slate-950 flex items-center justify-center text-amber-300 font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  QuizMe!
                </span>
                <span className="comic-badge hidden sm:inline-block px-2 py-0.5 rounded-lg bg-amber-300 border-2 border-slate-950 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  ARCADE
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* ZONE 2: Modern Floating Glass Arcade Pill Dock */}
        <nav
          aria-label="Primary Quiz Arcade Navigation"
          className="comic-panel-sm hidden lg:flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/95 dark:bg-slate-900/95"
        >
          {primaryArcadePills.map((item, idx) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectTab(item.id);
                }}
                className={`arcade-btn relative px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  idx >= 5 ? 'hidden xl:flex' : 'flex'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white border-2 border-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-sm leading-none">{item.emoji}</span>
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="comic-badge px-1.5 py-0.2 rounded-md bg-rose-500 border border-slate-950 text-white text-[9px] font-black uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ZONE 3: Gamified Player HUD (Streak Flame, XP Gem, Clock & Controls) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Gamified Streak + Level XP Pill */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              if (onOpenLevelRoadmap) onOpenLevelRoadmap();
              else onSelectTab('analytics');
            }}
            className="comic-panel-sm pattern-stripes-amber arcade-btn hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-amber-50/90 dark:bg-slate-900 transition-all cursor-pointer whitespace-nowrap"
            title={`Lv.${lvlProg.level} ${lvlProg.rank.title} • ${stats.xp.toLocaleString()} XP • Click for Player Rewards & Rank Roadmap`}
          >
            <span className="flex items-center gap-1 text-xs font-black text-orange-600 dark:text-orange-400">
              <span>🔥</span>
              <span>{stats.streak}d</span>
            </span>
            <span className="w-px h-3.5 bg-amber-300 dark:bg-amber-800" />
            <span className="flex items-center gap-1 text-xs font-black text-indigo-700 dark:text-indigo-300">
              <span>💎</span>
              <span>Lv.{lvlProg.level}</span>
            </span>
            <span
              className={`hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                effortStatus.unlocked
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              title={`Zero-Loophole XP Shield: ${effortStatus.verifiedCorrectToday}/${effortStatus.requiredCorrect} verified correct today`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>{effortStatus.verifiedCorrectToday}✓</span>
            </span>
            <span className="hidden 2xl:inline text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
              {regionalClock.time}
            </span>
            {!dailyCheck.claimedToday && (
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"
                title="Daily Bonus Ready!"
              />
            )}
          </button>

          {/* Search / Command Trigger */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenCommandPalette();
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
              title="Quick Search & Jump (Cmd + K)"
              aria-label="Open Command Palette"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* UI Themes Studio Popover + Light/Dark Toggle */}
          <div ref={themeMenuRef} className="relative flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsThemeMenuOpen((prev) => !prev);
              }}
              className="arcade-btn flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-amber-300 hover:bg-amber-200 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-2xs"
              title="Switch UI Theme (6 Comic & Arcade Palettes + 5 UI Geometry Styles)"
              aria-label="Open UI Themes Menu"
            >
              <Palette className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden xl:inline">
                {UI_THEME_CATALOG.find((t) => t.id === uiTheme)?.emoji || '⚡'} Themes
              </span>
            </button>

            <button
              type="button"
              id="theme-mode-toggle"
              onClick={handleThemeClick}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-violet-400 transition-colors cursor-pointer"
              title={resolvedTheme === 'dark' ? 'Switch to Bright Day Mode' : 'Switch to Neon Night Mode'}
              aria-label="Toggle Light and Dark Mode"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-3xl comic-pop-card bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-200 p-4 z-50 space-y-3.5 shadow-2xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="comic-badge px-2 py-0.5 rounded bg-amber-300 text-slate-950 text-[10px] font-black uppercase">
                      6 UI THEMES
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Visual Theme &amp; Geometry
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleThemeClick}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    {resolvedTheme === 'dark' ? '☀️ Day Mode' : '🌙 Night Mode'}
                  </button>
                </div>

                {/* 6 Curated UI Themes */}
                <div className="grid grid-cols-2 gap-2">
                  {UI_THEME_CATALOG.map((themeItem) => {
                    const isSelected = uiTheme === themeItem.id;
                    return (
                      <button
                        key={themeItem.id}
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setUiTheme(themeItem.id);
                        }}
                        className={`flex flex-col items-start p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-950 dark:border-amber-300 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/60 dark:bg-slate-800/50'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between mb-1">
                          <span className="text-base">{themeItem.emoji}</span>
                          <span
                            className={`w-6 h-2.5 rounded-full bg-gradient-to-r ${themeItem.swatchGradient} border border-slate-900/30`}
                          />
                        </div>
                        <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">
                          {themeItem.name}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {themeItem.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 5 Geometry Styles (Default, 3D Tactile, Modern Glass, Playful, Legacy) */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Card Shape &amp; Button Physics
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {UI_STYLE_CATALOG.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          soundFx.playSelect();
                          setUiStyle(st.id);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                          uiStyle === st.id
                            ? 'bg-indigo-600 text-white border-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            id="sound-fx-toggle"
            onClick={handleSoundClick}
            className="hidden sm:inline-flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-violet-400 transition-colors cursor-pointer"
            title={soundEnabled ? 'Arcade Sound FX On' : 'Arcade Sound FX Muted'}
            aria-label="Toggle Sound Effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Preferences Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-violet-400 transition-colors cursor-pointer"
            title="UI Styles (3D, Playful, Modern) & Keybinds"
            aria-label="Open Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Resume Active Quiz Pill */}
          {activeQuiz && activeTab !== 'runner' && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onSelectTab('runner');
              }}
              className="arcade-btn hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 border-b-4 border-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
            >
              <span>▶ Resume Game</span>
            </button>
          )}

          {user && (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsProfileMenuOpen((prev) => !prev);
                }}
                className="flex items-center gap-2 p-1 sm:pr-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-b-4 border-slate-200 dark:border-slate-800 hover:border-violet-400 transition-all cursor-pointer"
                title="Player Profile & Quick Menu"
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
                <div className="hidden xl:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 max-w-[110px] truncate flex items-center gap-1">
                    {masteryProfile.equippedAvatarId && <span>{masteryProfile.equippedAvatarId}</span>}
                    <span>{userProfile?.displayName || user.displayName || 'Scholar'}</span>
                  </span>
                  {masteryProfile.equippedTitle && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 truncate max-w-[110px]">
                      {masteryProfile.equippedTitle}
                    </span>
                  )}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FFFDF9] dark:bg-[#121816] border border-stone-300 dark:border-stone-800 shadow-xl p-2.5 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-800">
                    <div className="font-editorial text-sm font-bold text-stone-900 dark:text-white truncate">
                      {userProfile?.displayName || user.displayName || 'Scholar'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-mono tabular-nums text-stone-500 dark:text-stone-400">
                      <span>{persona} Mode</span>
                      <span>·</span>
                      <span>{stats.xp.toLocaleString()} XP</span>
                      <span>·</span>
                      <span>{mascotCoins} Coins</span>
                    </div>
                  </div>

                  {onPersonaChange && (
                    <div className="px-3 py-1.5 flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">Perspective</span>
                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg">
                        {(['Student', 'Teacher'] as PersonaType[]).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              onPersonaChange(p);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer ${
                              persona === p
                                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                                : 'text-stone-500'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsProfileMenuOpen(false);
                      onOpenProfileModal?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>Scholar Profile & Mascot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsProfileMenuOpen(false);
                      togglePomodoro();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Timer className="w-3.5 h-3.5 text-stone-500" />
                      <span>Pomodoro Focus Timer</span>
                    </span>
                    {isPomodoroRunning && (
                      <span className="font-mono text-[11px] tabular-nums text-amber-700 dark:text-amber-400">
                        {formatPomodoroTime(pomodoroTimeLeft)}
                      </span>
                    )}
                  </button>

                  {onOpenUploadQuiz && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsProfileMenuOpen(false);
                        onOpenUploadQuiz();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-stone-500" />
                      <span>Import Quiz Dossier</span>
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
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                      <span>Keyboard Shortcuts (?)</span>
                    </button>
                  )}

                  <div className="pt-1 border-t border-stone-200 dark:border-stone-800 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsProfileMenuOpen(false);
                        switchAccount();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
