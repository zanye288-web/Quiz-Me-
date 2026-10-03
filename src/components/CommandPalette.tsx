import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  Sparkles,
  BookOpen,
  Sliders,
  History,
  Award,
  Layers,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Keyboard,
  Printer,
  Code2,
  ArrowRight,
  Headphones,
  Check,
  Flame,
  BrainCircuit,
  FileCode,
  Users,
  FileText,
  Lightbulb,
  Compass,
} from 'lucide-react';
import { DashboardTab } from './DashboardSidebar';
import { PRESET_TOPICS, PresetTopic } from '../data/presets';
import { QuizResponse, PersonaType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  onStartQuiz: (quiz: QuizResponse) => void;
  onOpenShortcuts: () => void;
  onOpenSettings?: () => void;
  onOpenWorksheet?: (quiz?: QuizResponse) => void;
  onOpenRawJson?: () => void;
  activeQuiz: QuizResponse | null;
  persona: PersonaType;
  onPersonaChange?: (p: PersonaType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStarterTutorial?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Quizzes' | 'Actions' | 'Tools';
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onStartQuiz,
  onOpenShortcuts,
  onOpenSettings,
  onOpenWorksheet,
  onOpenRawJson,
  activeQuiz,
  persona,
  onPersonaChange,
  soundEnabled,
  onToggleSound,
  onOpenStarterTutorial,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command items
  const allCommands: CommandItem[] = [
    // Navigation
    {
      id: 'nav_studio',
      title: 'AI Assessment Studio',
      subtitle: 'Generate quizzes from topics, study notes, PDFs & audio',
      category: 'Navigation',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onSelectTab('studio');
        onClose();
      },
    },
    {
      id: 'nav_notes',
      title: 'AI Study Notes & Concept Library',
      subtitle: 'Structured study notes with concepts, common mistakes & self-check questions',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4 text-purple-500" />,
      action: () => {
        onSelectTab('notes');
        onClose();
      },
    },
    {
      id: 'nav_curricula',
      title: 'Curriculum & Quiz Catalog',
      subtitle: 'Browse 12+ ready-to-play tracks in tech, science & trivia',
      category: 'Navigation',
      icon: <BookOpen className="w-4 h-4 text-blue-500" />,
      action: () => {
        onSelectTab('curricula');
        onClose();
      },
    },
    {
      id: 'nav_community',
      title: 'Community Feed',
      subtitle: 'View and like quizzes shared by students and teachers',
      category: 'Navigation',
      icon: <Users className="w-4 h-4 text-pink-500" />,
      action: () => {
        onSelectTab('community');
        onClose();
      },
    },
    {
      id: 'nav_authoring',
      title: 'Custom Question Builder',
      subtitle: 'Author custom questions, code media & scoring rubrics',
      category: 'Navigation',
      icon: <Code2 className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onSelectTab('authoring');
        onClose();
      },
    },
    {
      id: 'nav_suggestions',
      title: 'Suggestions & Ideas Hub',
      subtitle: 'Personalized AI study recommendations, topic sparks, QoL upgrades & feedback',
      category: 'Navigation',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
      action: () => {
        onSelectTab('suggestions');
        onClose();
      },
    },
    {
      id: 'nav_analytics',
      title: 'Performance & XP Analytics',
      subtitle: 'Bloom taxonomy mastery, leaderboard & badge showcase',
      category: 'Navigation',
      icon: <Award className="w-4 h-4 text-amber-500" />,
      action: () => {
        onSelectTab('analytics');
        onClose();
      },
    },
    {
      id: 'nav_history',
      title: 'Assessment History & Diplomas',
      subtitle: 'Review past attempts, scorecards & verified certificates',
      category: 'Navigation',
      icon: <History className="w-4 h-4 text-purple-500" />,
      action: () => {
        onSelectTab('history');
        onClose();
      },
    },
    {
      id: 'nav_settings',
      title: 'Settings & UI Customization',
      subtitle: 'Themes, typography scale, sound profiles & speech narrator',
      category: 'Navigation',
      icon: <Sliders className="w-4 h-4 text-slate-500" />,
      action: () => {
        onSelectTab('settings');
        onClose();
      },
    },

    // Actions
    {
      id: 'act_theme',
      title: resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle global color scheme',
      category: 'Actions',
      icon: resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />,
      action: () => {
        soundFx.playThemeToggle();
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'act_sound',
      title: soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects',
      subtitle: 'Synthesized Web Audio tactile feedback',
      category: 'Actions',
      icon: soundEnabled ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onToggleSound();
        onClose();
      },
    },
    {
      id: 'act_focus_hum',
      title: soundFx.isFocusHumming ? 'Stop 432Hz Focus Hum' : 'Play 432Hz Ambient Focus Hum',
      subtitle: 'Binaural alpha wave background tone for deep concentration',
      category: 'Actions',
      icon: <Headphones className="w-4 h-4 text-cyan-500" />,
      action: () => {
        soundFx.toggleFocusHum();
        onClose();
      },
    },
    {
      id: 'act_worksheet',
      title: 'Print / Export Exam Worksheet',
      subtitle: 'Generate clean printable student exams and teacher solution guides',
      category: 'Tools',
      icon: <Printer className="w-4 h-4 text-indigo-500" />,
      action: () => {
        if (onOpenWorksheet) {
          onOpenWorksheet(activeQuiz || PRESET_TOPICS[0].prebuiltStudentQuiz);
        }
        onClose();
      },
    },
    {
      id: 'act_shortcuts',
      title: 'Keyboard Shortcuts Cheatsheet',
      subtitle: 'View all keyboard shortcuts and hotkeys',
      category: 'Tools',
      icon: <Keyboard className="w-4 h-4 text-slate-500" />,
      shortcut: ['?'],
      action: () => {
        onOpenShortcuts();
        onClose();
      },
    },
    ...(onOpenStarterTutorial
      ? [
          {
            id: 'act_starter_tutorial',
            title: 'Interactive Starter Tutorial & Guide',
            subtitle: 'Explore features, choose your mascot companion & claim +50 Starter XP',
            category: 'Tools' as const,
            icon: <Compass className="w-4 h-4 text-amber-500" />,
            action: () => {
              onOpenStarterTutorial();
              onClose();
            },
          },
        ]
      : []),
    {
      id: 'act_raw_json',
      title: 'View Raw Assessment JSON',
      subtitle: 'Inspect schema structure and exported questions',
      category: 'Tools',
      icon: <FileCode className="w-4 h-4 text-emerald-500" />,
      action: () => {
        if (onOpenRawJson) {
          onOpenRawJson();
        }
        onClose();
      },
    },

    // Preset Quizzes
    ...PRESET_TOPICS.map((preset): CommandItem => ({
      id: `preset_${preset.id}`,
      title: `Play Quiz: ${preset.title}`,
      subtitle: `${preset.category} • ${preset.prebuiltStudentQuiz.difficulty || 'Intermediate'} • ${preset.prebuiltStudentQuiz.questions.length} Questions`,
      category: 'Quizzes',
      icon: <span className="text-base">{preset.icon}</span>,
      action: () => {
        soundFx.playClick();
        const quiz = persona === 'Teacher' ? preset.prebuiltTeacherQuiz : preset.prebuiltStudentQuiz;
        onStartQuiz(quiz);
        onClose();
      },
    })),
  ];

  // Filter commands
  const filteredCommands = allCommands.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Handle keyboard navigation within palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-850/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search quizzes (e.g. quantum, settings, dark, print)..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] font-mono font-bold shadow-2xs">
            Esc
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="p-3 overflow-y-auto space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching actions or quizzes found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    cmd.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 shadow-2xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cmd.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {cmd.title}
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {cmd.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-4">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px] font-bold">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px] font-bold">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px] font-bold">↵</kbd> Select
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
};
