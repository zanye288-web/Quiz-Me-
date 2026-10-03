import React, { useState } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  Volume2,
  VolumeX,
  X,
  Minimize2,
  Maximize2,
  Flame,
  Coffee,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { usePomodoro, PomodoroMode } from '../context/PomodoroContext';
import { soundFx } from '../utils/audio';

export const PomodoroTimerOverlay: React.FC = () => {
  const {
    mode,
    timeLeft,
    totalDuration,
    isRunning,
    isOpen,
    isCompact,
    completedSessions,
    durations,
    soundEnabled,
    startTimer,
    pauseTimer,
    resetTimer,
    skipStage,
    setMode,
    setIsOpen,
    setIsCompact,
    toggleCompact,
    setDurations,
    setSoundEnabled,
    formatTime,
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);
  const [customFocus, setCustomFocus] = useState(durations.focus);
  const [customShortBreak, setCustomShortBreak] = useState(durations.shortBreak);
  const [customLongBreak, setCustomLongBreak] = useState(durations.longBreak);

  if (!isOpen) return null;

  // Calculate percentage for circular progress ring
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const modeConfig = {
    focus: {
      label: 'Focus Study',
      icon: Flame,
      color: 'text-amber-500',
      strokeColor: '#f59e0b',
      bgGlow: 'from-amber-500/10 to-orange-500/5',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    },
    short_break: {
      label: 'Short Break',
      icon: Coffee,
      color: 'text-emerald-500',
      strokeColor: '#10b981',
      bgGlow: 'from-emerald-500/10 to-teal-500/5',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    },
    long_break: {
      label: 'Long Rest',
      icon: Sparkles,
      color: 'text-indigo-500',
      strokeColor: '#6366f1',
      bgGlow: 'from-indigo-500/10 to-purple-500/5',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    },
  }[mode];

  const CurrentIcon = modeConfig.icon;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setDurations({
      focus: Math.max(1, Math.min(120, customFocus)),
      shortBreak: Math.max(1, Math.min(60, customShortBreak)),
      longBreak: Math.max(1, Math.min(60, customLongBreak)),
    });
    setShowSettings(false);
    soundFx.playClick();
  };

  // Compact floating pill mode (non-intrusive bottom corner widget)
  if (isCompact) {
    return (
      <div
        id="pomodoro-compact-pill"
        className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200"
      >
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl hover:shadow-2xl transition-all">
          <button
            type="button"
            onClick={toggleCompact}
            className="flex items-center gap-2 text-left cursor-pointer group"
            title="Click to expand Pomodoro study panel"
          >
            <div className={`p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${modeConfig.color}`}>
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {modeConfig.label}
              </span>
              <span className="font-mono font-black text-sm tracking-tight text-slate-800 dark:text-slate-100">
                {formatTime(timeLeft)}
              </span>
            </div>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Quick Play/Pause button */}
          <button
            type="button"
            onClick={isRunning ? pauseTimer : startTimer}
            className={`p-1.5 rounded-xl text-white transition-transform active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Expand to full view */}
          <button
            type="button"
            onClick={toggleCompact}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Expand timer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Close timer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Expanded Floating Overlay Card
  return (
    <div
      id="pomodoro-overlay-card"
      className="fixed bottom-5 right-5 z-40 w-80 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Top Banner & Mode Selector */}
      <div className={`p-4 bg-gradient-to-br ${modeConfig.bgGlow} border-b border-slate-100 dark:border-slate-800/80`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${modeConfig.badge}`}>
              <CurrentIcon className="w-3.5 h-3.5" />
              <span>{modeConfig.label}</span>
            </span>
            {isRunning && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer"
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer"
              title="Pomodoro Durations"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCompact(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer"
              title="Minimize to mini pill"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer"
              title="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode switcher tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('focus')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Study
          </button>
          <button
            type="button"
            onClick={() => setMode('short_break')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Short Break
          </button>
          <button
            type="button"
            onClick={() => setMode('long_break')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Long Rest
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5">
        {showSettings ? (
          /* Durations Configuration Panel */
          <form onSubmit={handleSaveSettings} className="space-y-3 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Customize Intervals (Minutes)
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Focus
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={customFocus}
                  onChange={(e) => setCustomFocus(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Short Break
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={customShortBreak}
                  onChange={(e) => setCustomShortBreak(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Long Rest
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={customLongBreak}
                  onChange={(e) => setCustomLongBreak(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
              >
                Save Durations
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Timer Display & Controls */
          <div className="flex flex-col items-center">
            {/* SVG Circular Progress Gauge */}
            <div className="relative flex items-center justify-center my-1">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke={modeConfig.strokeColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-mono font-black text-3xl tracking-tight text-slate-900 dark:text-white">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                  {isRunning ? 'in progress' : 'paused'}
                </span>
              </div>
            </div>

            {/* Cycle indicators (4 sessions cycle) */}
            <div className="flex items-center gap-1.5 my-3">
              {[1, 2, 3, 4].map((step) => {
                const currentCycleIndex = (completedSessions % 4) + 1;
                const isCompleted = step <= (completedSessions % 4);
                const isCurrent = step === currentCycleIndex;

                return (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      isCompleted
                        ? 'w-4 bg-amber-500'
                        : isCurrent
                        ? 'w-6 bg-amber-400 animate-pulse'
                        : 'w-2 bg-slate-200 dark:bg-slate-700'
                    }`}
                    title={`Session ${step} of 4`}
                  />
                );
              })}
              <span className="ml-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {completedSessions} sessions done
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-3 w-full mt-1">
              <button
                type="button"
                onClick={resetTimer}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                title="Reset current interval"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="pomodoro-main-toggle-btn"
                onClick={isRunning ? pauseTimer : startTimer}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                    <span>Start Study</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={skipStage}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                title="Skip to next interval"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
