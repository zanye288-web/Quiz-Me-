import React, { useState } from 'react';
import { X, Sun, Moon, Monitor, Sliders, Volume2, VolumeX, ShieldCheck, Check, Clock, Sparkles, Zap, Timer, Flame, Headphones, ChevronRight, Save, Music } from 'lucide-react';
import { useTheme, ANIMATION_STYLE_CATALOG } from '../context/ThemeContext';
import { AssessmentConfig } from '../types/quiz';
import { soundFx, SOUND_PROFILES, SoundProfileType } from '../utils/audio';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import {
  MascotAvatar,
  MASCOT_CATALOG,
  MASCOT_THEME_CATALOG,
  useMascotPreferences,
} from './MascotAvatar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  assessmentConfig: AssessmentConfig;
  onUpdateAssessmentConfig: (newConfig: Partial<AssessmentConfig>) => void;
  onOpenFullSettings?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  assessmentConfig,
  onUpdateAssessmentConfig,
  onOpenFullSettings,
}) => {
  const { theme, setTheme, animationStyle, setAnimationStyle } = useTheme();
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const {
    mascotCharacter,
    mascotTheme,
    currentMascotMeta,
    setMascotCharacter,
    setMascotTheme,
  } = useMascotPreferences();

  if (!isOpen) return null;

  const isChallengeMode = assessmentConfig.challengeMode ?? false;
  const challengeTimer = assessmentConfig.challengeTimerSeconds ?? 15;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                Quick Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theme, sounds, and timer controls
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full Studio Banner */}
        {onOpenFullSettings && (
          <div className="px-5 py-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Want deeper customization?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
                onOpenFullSettings();
              }}
              className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Challenge Mode Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Challenge Mode</span>
              </label>
              {isChallengeMode && (
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-500" />
                  <span>Up to 2.5x Speed XP</span>
                </span>
              )}
            </div>

            {/* Main Challenge Toggle Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isChallengeMode
                ? 'border-amber-400 dark:border-amber-600/80 bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-orange-50/50 dark:from-amber-950/40 dark:via-slate-850 dark:to-orange-950/30 ring-2 ring-amber-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-colors shadow-2xs ${
                    isChallengeMode
                      ? 'bg-amber-500 text-white shadow-amber-500/30'
                      : 'bg-white dark:bg-slate-700 text-slate-400'
                  }`}>
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Per-Question Countdown</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Fast correct answers earn progressive bonus XP and streak rewards
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="challenge-mode-toggle"
                  onClick={() => {
                    const next = !isChallengeMode;
                    if (next) soundFx.playSpeedBonus();
                    else soundFx.playClick();
                    onUpdateAssessmentConfig({ challengeMode: next });
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                    isChallengeMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
                </button>
              </div>

              {/* Sub-options for Challenge Mode: Timer Seconds */}
              {isChallengeMode && (
                <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/60 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                    <span>Question Time Limit:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-extrabold">{challengeTimer}s per question</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[10, 15, 20, 30].map((secs) => (
                      <button
                        key={secs}
                        type="button"
                        onClick={() => {
                          soundFx.playSelect();
                          onUpdateAssessmentConfig({ challengeTimerSeconds: secs });
                        }}
                        className={`py-1.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                          challengeTimer === secs
                            ? 'border-amber-500 bg-amber-500 text-white font-extrabold shadow-xs shadow-amber-500/20'
                            : 'border-amber-200 dark:border-amber-900 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                        }`}
                      >
                        {secs}s
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight">
                    🔥 Responding within the first 30% of time awards maximum 2.5x XP multiplier!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Theme Mode */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Appearance
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playThemeToggle();
                  setTheme('light');
                }}
                className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-50/60 text-indigo-900 font-extrabold ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playThemeToggle();
                  setTheme('dark');
                }}
                className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-extrabold ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Animation Physics Quick Switcher */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Animation Physics
              </label>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                {animationStyle}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {ANIMATION_STYLE_CATALOG.map((anim) => {
                const isSelected = animationStyle === anim.id;
                return (
                  <button
                    key={anim.id}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setAnimationStyle(anim.id);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-black ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    title={anim.tagline}
                  >
                    <span className="text-base">{anim.icon}</span>
                    <span className="text-[10px] font-bold capitalize">{anim.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mascot Companion Character & Aura Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mascot Companion
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {currentMascotMeta.title}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-3.5">
              <div className="grid grid-cols-5 gap-2">
                {MASCOT_CATALOG.map((m) => {
                  const isSelected = mascotCharacter === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setMascotCharacter(m.id, true);
                      }}
                      className={`flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-white dark:bg-slate-900 ring-2 ring-indigo-500/20 scale-105 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 opacity-80 hover:opacity-100'
                      }`}
                      title={`${m.title} — ${m.species}`}
                    >
                      <MascotAvatar
                        character={m.id}
                        theme={isSelected ? mascotTheme : m.defaultTheme}
                        size="xs"
                        interactive={false}
                      />
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-1.5 truncate max-w-full">
                        {m.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Color Aura:
                </span>
                <div className="flex items-center gap-1.5">
                  {MASCOT_THEME_CATALOG.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setMascotTheme(t.id);
                      }}
                      className={`w-6 h-6 rounded-full ${t.swatchClass} transition-transform cursor-pointer ${
                        mascotTheme === t.id
                          ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={t.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

            {/* Sound Effects */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Audio & Narration
              </label>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs">
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Sound Effects
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Zero-latency harmonic chimes, pops & feedback
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleSound();
                      if (!soundEnabled) soundFx.playCorrect();
                    }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
                  </button>
                </div>

                {soundEnabled && (
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Sound Palette Profile:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SOUND_PROFILES.map((p) => {
                        const isCurrent = soundFx.getSoundProfile() === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              soundFx.setSoundProfile(p.id);
                              soundFx.playCorrect();
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-650'
                            }`}
                          >
                            <span>{p.icon}</span>
                            <span className="truncate">{p.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Minimal Gamified Background Music (Removable in Settings) */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Minimal Gamified Background Music
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Gentle Kahoot! & study groove (can be removed anytime)
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !soundFx.bgMusicEnabled;
                        soundFx.setBgMusicEnabled(next);
                        if (next) {
                          soundFx.startBgMusic();
                        } else {
                          soundFx.stopBgMusic();
                        }
                        soundFx.playClick();
                      }}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                        soundFx.bgMusicEnabled
                          ? 'bg-emerald-600 justify-end'
                          : 'bg-slate-300 dark:bg-slate-600 justify-start'
                      }`}
                      title={
                        soundFx.bgMusicEnabled
                          ? 'Remove / Disable Background Music'
                          : 'Enable Minimal Gamified Background Music'
                      }
                    >
                      <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
                    </button>
                  </div>

                  {soundFx.bgMusicEnabled && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.toggleBgMusic();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold cursor-pointer transition-colors"
                      >
                        {soundFx.isBgMusicPlaying ? 'Pause Background Music' : 'Play Minimal Groove Now'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.setBgMusicEnabled(false);
                          soundFx.stopBgMusic();
                          soundFx.playClick();
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        Remove Music
                      </button>
                    </div>
                  )}
                </div>
              </div>

            {/* Voice & TTS Narration Configuration Button */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowVoiceSettings(true);
              }}
              className="w-full p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-between transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-2xs">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <span>Voice Narration & TTS Settings</span>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-black">
                      AI Voice
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-700/70 dark:text-indigo-300/70">
                    Change voice persona, reading speed, pitch, and options
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {onOpenFullSettings && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                  onOpenFullSettings();
                }}
                className="w-full p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center justify-between transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      Custom Sound Effects Studio
                    </div>
                    <div className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
                      Upload MP3/WAV, record from mic, or build custom synth chimes
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Quiz Timer Preferences */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Entire Assessment Time Limit
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    onUpdateAssessmentConfig({ timeLimitMinutes: mins });
                  }}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    assessmentConfig.timeLimitMinutes === mins
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mins === 0 ? 'Untimed' : `${mins}m`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {savedNotice ? '✓ Changes saved to profile & device!' : 'Auto-saves locally as you adjust'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playCorrect();
                const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                localStorage.setItem('quizme_settings_last_saved_at', timeLabel);
                setSavedNotice(true);
                setTimeout(() => {
                  setSavedNotice(false);
                  onClose();
                }, 650);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedNotice ? 'Saved!' : 'Save & Close'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Settings Submodal */}
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
      />
    </div>
  );
};
