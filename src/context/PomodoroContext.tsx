import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { soundFx } from '../utils/audio';

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export interface PomodoroDurations {
  focus: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
}

interface PomodoroContextType {
  mode: PomodoroMode;
  timeLeft: number; // seconds
  totalDuration: number; // seconds
  isRunning: boolean;
  isOpen: boolean;
  isCompact: boolean;
  completedSessions: number;
  durations: PomodoroDurations;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipStage: () => void;
  setMode: (mode: PomodoroMode) => void;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setIsCompact: (compact: boolean) => void;
  toggleCompact: () => void;
  setDurations: (durations: Partial<PomodoroDurations>) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAutoStartBreaks: (val: boolean) => void;
  setAutoStartFocus: (val: boolean) => void;
  formatTime: (seconds: number) => string;
}

const STORAGE_KEY = 'quizme_pomodoro_state_v1';

const DEFAULT_DURATIONS: PomodoroDurations = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const PomodoroContext = createContext<PomodoroContextType | null>(null);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [durations, setDurationsState] = useState<PomodoroDurations>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_durations`);
      if (saved) {
        try {
          return { ...DEFAULT_DURATIONS, ...JSON.parse(saved) };
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_DURATIONS;
  });

  const [mode, setModeState] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(durations.focus * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY}_completed`);
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoStartBreaks, setAutoStartBreaks] = useState<boolean>(false);
  const [autoStartFocus, setAutoStartFocus] = useState<boolean>(false);

  // Reference to track real-time target timestamp for accurate background ticking
  const endTimeRef = useRef<number | null>(null);

  // Total duration in seconds for current mode
  const getTotalDuration = useCallback(
    (currentMode: PomodoroMode): number => {
      switch (currentMode) {
        case 'focus':
          return durations.focus * 60;
        case 'short_break':
          return durations.shortBreak * 60;
        case 'long_break':
          return durations.longBreak * 60;
      }
    },
    [durations]
  );

  const totalDuration = getTotalDuration(mode);

  // Play pleasant chime on period completion
  const playPeriodEndChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      soundFx.playLevelUp();
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Transition to next stage when timer reaches 0
  const handleStageComplete = useCallback(() => {
    playPeriodEndChime();

    if (mode === 'focus') {
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);
      localStorage.setItem(`${STORAGE_KEY}_completed`, newCompleted.toString());

      // Every 4 focus sessions, take a long break
      const nextMode: PomodoroMode = newCompleted % 4 === 0 ? 'long_break' : 'short_break';
      setModeState(nextMode);
      const nextTime = getTotalDuration(nextMode);
      setTimeLeft(nextTime);
      setIsRunning(autoStartBreaks);
      if (autoStartBreaks) {
        endTimeRef.current = Date.now() + nextTime * 1000;
      } else {
        endTimeRef.current = null;
      }
    } else {
      // Break is complete -> start new focus session
      setModeState('focus');
      const nextTime = getTotalDuration('focus');
      setTimeLeft(nextTime);
      setIsRunning(autoStartFocus);
      if (autoStartFocus) {
        endTimeRef.current = Date.now() + nextTime * 1000;
      } else {
        endTimeRef.current = null;
      }
    }
  }, [
    mode,
    completedSessions,
    autoStartBreaks,
    autoStartFocus,
    getTotalDuration,
    playPeriodEndChime,
  ]);

  // Timer tick interval with accurate wall-clock timestamp calculation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      interval = setInterval(() => {
        if (!endTimeRef.current) return;
        const remainingMs = endTimeRef.current - Date.now();
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        if (remainingSeconds <= 0) {
          setTimeLeft(0);
          setIsRunning(false);
          endTimeRef.current = null;
          handleStageComplete();
        } else {
          setTimeLeft(remainingSeconds);
        }
      }, 500);
    } else {
      endTimeRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleStageComplete]);

  // Start timer
  const startTimer = useCallback(() => {
    endTimeRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);
    soundFx.playClick();
  }, [timeLeft]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
    soundFx.playClick();
  }, []);

  // Reset current stage
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
    const dur = getTotalDuration(mode);
    setTimeLeft(dur);
    soundFx.playClick();
  }, [mode, getTotalDuration]);

  // Skip to next stage
  const skipStage = useCallback(() => {
    soundFx.playClick();
    handleStageComplete();
  }, [handleStageComplete]);

  // Switch mode directly
  const setMode = useCallback(
    (newMode: PomodoroMode) => {
      setIsRunning(false);
      endTimeRef.current = null;
      setModeState(newMode);
      setTimeLeft(getTotalDuration(newMode));
      soundFx.playClick();
    },
    [getTotalDuration]
  );

  // Update durations configuration
  const setDurations = useCallback(
    (newDurations: Partial<PomodoroDurations>) => {
      setDurationsState((prev) => {
        const updated = { ...prev, ...newDurations };
        localStorage.setItem(`${STORAGE_KEY}_durations`, JSON.stringify(updated));
        // If not running, adjust current timeLeft
        if (!isRunning) {
          if (mode === 'focus' && newDurations.focus) {
            setTimeLeft(newDurations.focus * 60);
          } else if (mode === 'short_break' && newDurations.shortBreak) {
            setTimeLeft(newDurations.shortBreak * 60);
          } else if (mode === 'long_break' && newDurations.longBreak) {
            setTimeLeft(newDurations.longBreak * 60);
          }
        }
        return updated;
      });
    },
    [isRunning, mode]
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
    soundFx.playClick();
  }, []);

  const toggleCompact = useCallback(() => {
    setIsCompact((prev) => !prev);
    soundFx.playClick();
  }, []);

  const formatTime = useCallback((totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <PomodoroContext.Provider
      value={{
        mode,
        timeLeft,
        totalDuration,
        isRunning,
        isOpen,
        isCompact,
        completedSessions,
        durations,
        soundEnabled,
        autoStartBreaks,
        autoStartFocus,
        startTimer,
        pauseTimer,
        resetTimer,
        skipStage,
        setMode,
        setIsOpen,
        toggleOpen,
        setIsCompact,
        toggleCompact,
        setDurations,
        setSoundEnabled,
        setAutoStartBreaks,
        setAutoStartFocus,
        formatTime,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
