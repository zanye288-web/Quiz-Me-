import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Keyboard,
  BookOpen,
  MessageSquare,
  Bot,
  ChevronDown,
  ChevronUp,
  X,
  Palette,
  Heart,
} from 'lucide-react';
import { MascotAvatar, MascotTheme, MascotMood } from './MascotAvatar';
import { soundFx } from '../utils/audio';
import { UserStats as UserStatsType, PersonaType } from '../types/quiz';

interface QuizzieCompanionWidgetProps {
  stats: UserStatsType;
  persona: PersonaType;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenShortcuts: () => void;
  onOpenTutor: () => void;
  onNavigateToNotes?: () => void;
  onNavigateToStudio?: () => void;
}

const MOTIVATIONAL_NUGGETS = [
  "You're making great strides! Keep that momentum going.",
  "Quick tip: Spaced repetition is 3x more effective than cramming!",
  "Mistakes teach you what textbooks can't. Embrace them!",
  "Did you know? Teaching a concept to someone else locks it in permanently.",
  "Your brain grows new synapses every time you struggle through a tough problem!",
  "Stay curious, take breaks, and let your subconscious connect the dots.",
];

export const QuizzieCompanionWidget: React.FC<QuizzieCompanionWidgetProps> = ({
  stats,
  persona,
  soundEnabled,
  onToggleSound,
  onOpenShortcuts,
  onOpenTutor,
  onNavigateToNotes,
  onNavigateToStudio,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [mascotTheme, setMascotTheme] = useState<MascotTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('quizzie_theme') as MascotTheme) || 'emerald';
    }
    return 'emerald';
  });
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [heartCount, setHeartCount] = useState<number>(0);

  // Save selected theme
  const handleThemeChange = (theme: MascotTheme) => {
    soundFx.playClick?.();
    setMascotTheme(theme);
    localStorage.setItem('quizzie_theme', theme);
  };

  const handleNextTip = () => {
    soundFx.playClick?.();
    setTipIndex((prev) => (prev + 1) % MOTIVATIONAL_NUGGETS.length);
  };

  const handlePetQuizzie = () => {
    soundFx.playPop();
    setHeartCount((prev) => prev + 1);
  };

  // Determine mood based on stats & interaction
  const mascotMood: MascotMood =
    stats.streak > 3 ? 'streak' : persona === 'Teacher' ? 'teacher' : 'idle';

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick?.();
            setIsMinimized(false);
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group cursor-pointer"
          title="Open Quizzie Companion"
        >
          <MascotAvatar mood={mascotMood} size="xs" theme={mascotTheme} interactive={false} />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Quizzie</span>
          {stats.streak > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
              <Flame className="w-3 h-3 fill-amber-500" />
              {stats.streak}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expanded Companion Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Card Top Banner */}
          <div className="relative p-4 pb-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MascotAvatar mood={mascotMood} size="sm" theme={mascotTheme} onClick={handlePetQuizzie} />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
                    Quizzie Companion
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Your AI Learning Ally
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  setIsMinimized(true);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3.5">
            {/* Encouraging Tip of the Moment */}
            <div
              onClick={handleNextTip}
              className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 cursor-pointer hover:border-emerald-500/40 transition-colors group"
              title="Click for another study tip"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Study Insight
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-500 font-normal transition-colors">
                  Tap for next ↺
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                "{MOTIVATIONAL_NUGGETS[tipIndex]}"
              </p>
            </div>

            {/* Streak & Quick Progress */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-black text-sm">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Study Streak
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="text-indigo-600 dark:text-indigo-400 font-black text-sm">
                  {stats.quizzesTaken}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Quizzes Completed
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  onOpenTutor();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60"
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Chat with 1-on-1 AI Tutor
                </span>
                <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded-md font-mono">T</span>
              </button>

              {onNavigateToNotes && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    onNavigateToNotes();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Open AI Study Notes
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md font-mono">N</span>
                </button>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onToggleSound}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
                  title="Toggle Sound Effects [M]"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Sound On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      <span>Muted</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    onOpenShortcuts();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
                  title="Keyboard Shortcuts [?]"
                >
                  <Keyboard className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Keys</span>
                </button>
              </div>
            </div>

            {/* Mascot Style Theme Picker */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span className="flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" />
                  Quizzie Outfit Theme
                </span>
                <span className="capitalize text-slate-800 dark:text-slate-200 font-extrabold">{mascotTheme}</span>
              </div>
              <div className="flex items-center justify-between gap-1.5">
                {(['emerald', 'indigo', 'amber', 'cyan', 'violet'] as MascotTheme[]).map((t) => {
                  const colors = {
                    emerald: 'bg-emerald-500',
                    indigo: 'bg-indigo-500',
                    amber: 'bg-amber-500',
                    cyan: 'bg-sky-500',
                    violet: 'bg-purple-500',
                  }[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleThemeChange(t)}
                      className={`flex-1 h-7 rounded-xl ${colors} transition-transform ${
                        mascotTheme === t
                          ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105'
                          : 'opacity-70 hover:opacity-100 hover:scale-102'
                      }`}
                      title={`${t.charAt(0).toUpperCase() + t.slice(1)} Quizzie`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quizzie Trigger Button */}
      <button
        type="button"
        onClick={() => {
          soundFx.playClick?.();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
        title="Quizzie Learning Companion [Q]"
      >
        <div className="relative">
          <MascotAvatar mood={mascotMood} size="sm" theme={mascotTheme} interactive={false} />
          {stats.streak > 2 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Quizzie
            </span>
            {stats.streak > 0 && (
              <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-amber-500" />
                {stats.streak}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Companion
          </p>
        </div>
      </button>
    </div>
  );
};
