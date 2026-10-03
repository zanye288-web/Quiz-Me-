import React from 'react';
import { X, Keyboard, Zap, Sparkles, BookOpen, Volume2, HelpCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  icon: string;
  shortcuts: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const sections: ShortcutSection[] = [
    {
      title: 'Global Navigation & Actions',
      icon: '🧭',
      shortcuts: [
        { keys: ['⌘', 'K'], description: 'Open Quick Command Palette & Search' },
        { keys: ['?'], description: 'Toggle this Keyboard Shortcuts Cheatsheet' },
        { keys: ['N'], description: 'Quick jump to AI Study Notes' },
        { keys: ['T'], description: 'Open 1-on-1 AI Tutor Drawer' },
        { keys: ['M'], description: 'Toggle Sound Effects Audio on/off' },
        { keys: ['Esc'], description: 'Close active modal, drawer or palette' },
      ],
    },
    {
      title: 'Quiz & Exam Runner',
      icon: '⚡',
      shortcuts: [
        { keys: ['1', '2', '3', '4'], description: 'Select Multiple Choice options 1 to 4' },
        { keys: ['A', 'B', 'C', 'D'], description: 'Alternative letter keys to select options' },
        { keys: ['Enter'], description: 'Submit answer / Proceed to next question' },
        { keys: ['←', '→'], description: 'Navigate previous / next question' },
        { keys: ['F'], description: 'Toggle Focus Mode (hides all UI & distractions)' },
        { keys: ['B'], description: 'Bookmark / Flag question for later review' },
        { keys: ['H'], description: 'Toggle pedagogical Hint' },
        { keys: ['T'], description: 'Ask Socratic AI Tutor about current question' },
        { keys: ['V'], description: 'Voice Read Question out loud (TTS)' },
        { keys: ['M'], description: 'Microphone: Speak your answer out loud' },
        { keys: ['S'], description: 'Toggle Scratchpad working canvas' },
        { keys: ['Z'], description: 'Toggle Zen palette minimization' },
        { keys: ['Esc'], description: 'Exit Focus Mode / Close active modal' },
      ],
    },
    {
      title: 'Flashcard 3D Study Deck',
      icon: '📇',
      shortcuts: [
        { keys: ['Space', 'Enter'], description: 'Flip active flashcard' },
        { keys: ['←', '→'], description: 'Previous / Next card' },
        { keys: ['1'], description: 'Rate "Needs Review" (1 pt)' },
        { keys: ['2'], description: 'Rate "Hard" (2 pts)' },
        { keys: ['3'], description: 'Rate "Good" (3 pts)' },
        { keys: ['4'], description: 'Rate "Mastered" (4 pts)' },
        { keys: ['R'], description: 'Shuffle flashcard deck' },
      ],
    },
    {
      title: 'AI Assessment Studio',
      icon: '✨',
      shortcuts: [
        { keys: ['⌘', 'Enter'], description: 'Generate Quiz from active prompt or file' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 shadow-2xs">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Keyboard Shortcuts Cheatsheet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speed up your study workflow with instant hotkeys
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{sec.icon}</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {sec.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sec.shortcuts.map((sc, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {sc.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {sc.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-mono font-black text-[11px] shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border text-[10px] font-bold">⌘K</kbd> anywhere to open the command bar</span>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
