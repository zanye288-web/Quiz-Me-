import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Keyboard,
  BookOpen,
  Bot,
  ChevronDown,
  X,
  Palette,
  Compass,
  Headphones,
  Coins,
  Lock,
  UserCheck,
  Download,
  Monitor,
} from 'lucide-react';
import {
  MascotAvatar,
  MascotMood,
  MASCOT_CATALOG,
  MASCOT_ACCESSORY_CATALOG,
  MASCOT_THEME_CATALOG,
  useMascotPreferences,
  getMascotIconDataUrl,
  downloadCustomMascotDesktopIcon,
} from './MascotAvatar';
import { soundFx, AmbientSoundscapeMode } from '../utils/audio';
import { UserStats as UserStatsType, PersonaType } from '../types/quiz';
import { useAuth } from '../context/AuthContext';

interface QuizzieCompanionWidgetProps {
  stats: UserStatsType;
  persona: PersonaType;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenShortcuts: () => void;
  onOpenTutor: () => void;
  onNavigateToNotes?: () => void;
  onNavigateToStudio?: () => void;
  onOpenStarterTutorial?: () => void;
}

const MOTIVATIONAL_NUGGETS = [
  "You're making great strides! Keep that momentum going.",
  'Quick tip: Spaced repetition is 3x more effective than cramming!',
  "Mistakes teach you what textbooks can't. Embrace them!",
  'Score 80% or higher on quizzes to earn Mascot Coins for rare accessories!',
  'A 100% Perfect Score awards +8 Mascot Coins toward legendary mascots!',
  'Stay curious, take breaks, and let your subconscious connect the dots.',
];

export const QuizzieCompanionWidget: React.FC<QuizzieCompanionWidgetProps> = ({
  stats,
  persona,
  soundEnabled,
  onToggleSound,
  onOpenShortcuts,
  onOpenTutor,
  onNavigateToNotes,
  onOpenStarterTutorial,
}) => {
  const { userProfile, updateUserProfileInCloud } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<'mascots' | 'accessories' | 'tools'>('mascots');
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(soundFx.isFocusHumming);
  const [ambientMode, setAmbientMode] = useState<AmbientSoundscapeMode>(soundFx.ambientMode);

  const {
    mascotCharacter,
    mascotTheme,
    mascotAccessory,
    mascotCoins,
    unlockedMascots,
    unlockedAccessories,
    currentMascotMeta,
    currentAccessoryMeta,
    setMascotTheme,
    purchaseMascot,
    purchaseAccessory,
  } = useMascotPreferences();

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3200);
  };

  const handleNextTip = () => {
    soundFx.playClick?.();
    setTipIndex((prev) => (prev + 1) % MOTIVATIONAL_NUGGETS.length);
  };

  const handlePetMascot = () => {
    soundFx.playPop();
  };

  const handleSetAsProfilePicture = async () => {
    soundFx.playComplete();
    await updateUserProfileInCloud({
      avatarType: 'mascot',
      mascotCharacter,
      mascotTheme,
      equippedAccessory: mascotAccessory,
    });
    showToast(`${currentMascotMeta.title} is now your profile picture!`);
  };

  const mascotMood: MascotMood =
    stats.streak > 3 ? 'streak' : persona === 'Teacher' ? 'teacher' : 'idle';

  const isMascotProfileActive = userProfile?.avatarType === 'mascot';

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
          title={`Open ${currentMascotMeta.title}`}
        >
          <MascotAvatar mood={mascotMood} size="xs" interactive={false} />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {currentMascotMeta.name}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
            <Coins className="w-3 h-3 text-amber-500" />
            {mascotCoins}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expanded Companion Card */}
      {isOpen && (
        <div className="mb-3 w-84 sm:w-[410px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Card Top Banner */}
          <div className="relative p-3.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-sky-500/10 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <MascotAvatar mood={mascotMood} size="sm" onClick={handlePetMascot} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight text-slate-900 dark:text-white truncate">
                    {currentMascotMeta.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 shrink-0">
                    <Coins className="w-3 h-3 text-amber-500" />
                    {mascotCoins}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                  Pose: {currentMascotMeta.uniquePose} • {currentAccessoryMeta.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  setIsMinimized(true);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="grid grid-cols-3 p-1.5 bg-slate-100/80 dark:bg-slate-850 border-b border-slate-200/60 dark:border-slate-800/60 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveSubTab('mascots');
              }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'mascots'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mascots (10)
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveSubTab('accessories');
              }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'accessories'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Accessories
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveSubTab('tools');
              }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSubTab === 'tools'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Study Tools
            </button>
          </div>

          {/* Card Body */}
          <div className="p-3.5 space-y-3 max-h-[68vh] overflow-y-auto">
            {statusToast && (
              <div className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{statusToast}</span>
              </div>
            )}

            {/* Quick Set as Profile Picture + Desktop/Website Icon Banner */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={getMascotIconDataUrl(mascotCharacter, mascotTheme, mascotAccessory)}
                  alt="Custom App Icon"
                  className="w-8 h-8 rounded-lg shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-800 dark:text-slate-100 flex items-center gap-1 truncate">
                    <Monitor className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span>App & Tab Icon Synced</span>
                  </div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                    Updates your desktop & website icon live
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleSetAsProfilePicture}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                    isMascotProfileActive
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs'
                  }`}
                  title="Use your customized mascot as your profile picture"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>{isMascotProfileActive ? 'Profile Active' : 'Set as Profile Pic'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    downloadCustomMascotDesktopIcon(mascotCharacter, mascotTheme, mascotAccessory);
                  }}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-indigo-600 cursor-pointer"
                  title="Download custom 512x512 desktop icon (.png)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {activeSubTab === 'mascots' && (
              <>
                <div className="grid grid-cols-5 gap-1.5">
                  {MASCOT_CATALOG.map((m) => {
                    const isSelected = mascotCharacter === m.id;
                    const isUnlocked = unlockedMascots.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          const res = purchaseMascot(m.id);
                          if (res.success) {
                            soundFx.playPop();
                          } else {
                            soundFx.playClick();
                          }
                          showToast(res.message);
                        }}
                        className={`flex flex-col items-center p-1.5 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20 scale-102'
                            : isUnlocked
                            ? 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            : 'border-amber-200/70 dark:border-amber-900/50 bg-amber-50/30 dark:bg-slate-900/40 opacity-85 hover:opacity-100'
                        }`}
                        title={`${m.title} — Unique Pose: ${m.uniquePose}`}
                      >
                        <MascotAvatar
                          character={m.id}
                          theme={isSelected ? mascotTheme : m.defaultTheme}
                          accessory={isSelected ? mascotAccessory : m.defaultAccessory || 'none'}
                          size="xs"
                          interactive={false}
                        />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 truncate max-w-full">
                          {m.name}
                        </span>
                        {!isUnlocked ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-700 dark:text-amber-400">
                            <Lock className="w-2.5 h-2.5" />
                            {m.costCoins}
                          </span>
                        ) : (
                          <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">
                            {isSelected ? 'Active' : 'Owned'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Mascot Color Palette Picker */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5" />
                      Mascot Color Aura
                    </span>
                    <span className="capitalize text-slate-800 dark:text-slate-200 font-extrabold">
                      {mascotTheme}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    {MASCOT_THEME_CATALOG.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick?.();
                          setMascotTheme(t.id);
                        }}
                        className={`flex-1 h-6 rounded-xl ${t.swatchClass} transition-transform cursor-pointer ${
                          mascotTheme === t.id
                            ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={t.label}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeSubTab === 'accessories' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>Unlock Accessories with Mascot Coins</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black">
                    {mascotCoins} Coins
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {MASCOT_ACCESSORY_CATALOG.map((acc) => {
                    const isUnlocked = unlockedAccessories.includes(acc.id);
                    const isSelected = mascotAccessory === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          const res = purchaseAccessory(acc.id);
                          if (res.success) {
                            soundFx.playPop();
                          } else {
                            soundFx.playClick();
                          }
                          showToast(res.message);
                        }}
                        className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 ring-1 ring-indigo-500/30'
                            : isUnlocked
                            ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-amber-400'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="text-sm">{acc.previewEmoji}</span>
                          {!isUnlocked ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              <Coins className="w-2.5 h-2.5 text-amber-500" />
                              {acc.costCoins}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              {isSelected ? 'On' : 'Owned'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-1 truncate max-w-full">
                          {acc.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  <strong>How to earn Mascot Coins:</strong> Score 80%+ on a quiz (+2 Coins), 90%+ (+4 Coins), or 100% Perfect (+8 Coins)!
                </p>
              </div>
            )}

            {activeSubTab === 'tools' && (
              <>
                {/* Encouraging Tip of the Moment */}
                <div
                  onClick={handleNextTip}
                  className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 cursor-pointer hover:border-indigo-500/40 transition-colors group"
                  title="Click for another study tip"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {currentMascotMeta.name}’s Study Insight
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-500 font-normal transition-colors">
                      Tap for next ↺
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    &ldquo;{MOTIVATIONAL_NUGGETS[tipIndex]}&rdquo;
                  </p>
                </div>

                {/* Ambient Study Soundscape Quick-Mixer */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5 text-cyan-500" />
                      Study Soundscape
                    </span>
                    <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400">
                      {isAmbientPlaying ? '● Playing' : 'Off'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'alpha432' as AmbientSoundscapeMode, label: '432Hz Focus' },
                        { id: 'rain' as AmbientSoundscapeMode, label: 'Study Rain' },
                        { id: 'pinknoise' as AmbientSoundscapeMode, label: 'Pink Noise' },
                      ]
                    ).map((sc) => {
                      const active = isAmbientPlaying && ambientMode === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            if (active) {
                              soundFx.stopFocusHum();
                              setIsAmbientPlaying(false);
                            } else {
                              setAmbientMode(sc.id);
                              soundFx.startFocusHum(sc.id);
                              setIsAmbientPlaying(true);
                            }
                          }}
                          className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                            active
                              ? 'border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500/30'
                              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:border-cyan-400'
                          }`}
                        >
                          {sc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                  {onOpenStarterTutorial && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick?.();
                        onOpenStarterTutorial();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer border border-amber-200/70 dark:border-amber-800/60"
                    >
                      <span className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-500" />
                        Interactive Starter Tutorial
                      </span>
                      <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded-md font-extrabold">
                        Guide
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick?.();
                      onOpenTutor();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60"
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      Chat with 1-on-1 Tutor
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
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-500" />
                        Open Study Guides
                      </span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md font-mono">N</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onToggleSound}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
                      title="Toggle Sound Effects"
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Companion Trigger Button */}
      <button
        type="button"
        onClick={() => {
          soundFx.playClick?.();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
        title={`${currentMascotMeta.title} Companion`}
      >
        <div className="relative">
          <MascotAvatar mood={mascotMood} size="sm" interactive={false} />
          {stats.streak > 2 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {currentMascotMeta.name}
            </span>
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <Coins className="w-3 h-3 text-amber-500" />
              {mascotCoins}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {currentMascotMeta.uniquePose}
          </p>
        </div>
      </button>
    </div>
  );
};
