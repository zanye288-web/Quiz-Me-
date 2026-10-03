import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Mic,
  Volume2,
  Type,
  Radio,
  Layers,
  Award,
  Music,
  Scissors,
  EyeOff,
  GraduationCap,
  Play,
} from 'lucide-react';
import {
  MascotAvatar,
  MASCOT_CATALOG,
  MASCOT_THEME_CATALOG,
  useMascotPreferences,
} from './MascotAvatar';
import { PersonaType, UserStats } from '../types/quiz';
import { useTheme, FONT_CATALOG } from '../context/ThemeContext';
import { soundFx } from '../utils/audio';

export const STARTER_TUTORIAL_STORAGE_KEY = 'quizme_starter_tutorial_completed_v1';
export const STARTER_BONUS_CLAIMED_KEY = 'quizme_starter_bonus_claimed_v1';

interface StarterTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaType;
  onPersonaChange: (p: PersonaType) => void;
  stats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const StarterTutorialModal: React.FC<StarterTutorialModalProps> = ({
  isOpen,
  onClose,
  persona,
  onPersonaChange,
  onUpdateStats,
  onNavigateToTab,
}) => {
  const [step, setStep] = useState<number>(0);
  const [miniQuizPick, setMiniQuizPick] = useState<string | null>(null);
  const [miniQuizNarrowed, setMiniQuizNarrowed] = useState<boolean>(false);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STARTER_BONUS_CLAIMED_KEY) === 'true';
    }
    return false;
  });

  const {
    mascotCharacter,
    mascotTheme,
    currentMascotMeta,
    setMascotCharacter,
    setMascotTheme,
  } = useMascotPreferences();
  const { fontFamily, setFontFamily } = useTheme();

  if (!isOpen) return null;

  const totalSteps = 5;

  const handleCompleteTutorial = (claimReward = true) => {
    localStorage.setItem(STARTER_TUTORIAL_STORAGE_KEY, 'true');
    if (claimReward && !bonusClaimed) {
      localStorage.setItem(STARTER_BONUS_CLAIMED_KEY, 'true');
      setBonusClaimed(true);
      soundFx.playBadgeUnlock();
      onUpdateStats((prev) => ({
        ...prev,
        xp: prev.xp + 50,
        gems: prev.gems + 15,
      }));
    } else {
      soundFx.playClick();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Starter Interactive Tutorial"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Progress Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MascotAvatar
              mood={step === 4 ? 'streak' : step === 2 ? 'thinking' : 'happy'}
              size="sm"
              interactive={false}
            />
            <div>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Welcome Guide · Step {step + 1} of {totalSteps}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {step === 0 && 'Meet Your Study Companion & Choose Your Role'}
                {step === 1 && 'Create Quizzes, Notes, Decks & Flashcards'}
                {step === 2 && 'Interactive Quiz Superpowers (Try It!)'}
                {step === 3 && 'Custom Sound Effects, 12 Fonts & Live Battles'}
                {step === 4 && 'You’re Ready! Claim Your Starter Scholar Pack'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCompleteTutorial(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Skip Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 flex-1">
          {/* STEP 0: Pick Mascot & Role */}
          {step === 0 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-4">
                <MascotAvatar mood="happy" size="md" />
                <div className="space-y-1">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    "{currentMascotMeta.greeting}"
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    I’m <strong>{currentMascotMeta.title}</strong> ({currentMascotMeta.species}). Pick your favorite companion below—you can switch characters or colors anytime in Settings!
                  </p>
                </div>
              </div>

              {/* Pick Your Companion */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                  1. Choose Your Companion Character
                </label>
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
                        className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20 scale-105'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <MascotAvatar
                          character={m.id}
                          theme={isSelected ? mascotTheme : m.defaultTheme}
                          size="xs"
                          interactive={false}
                        />
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {m.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Color Aura Swatches */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-bold text-slate-500">Color Aura:</span>
                  {MASCOT_THEME_CATALOG.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setMascotTheme(t.id);
                      }}
                      className={`w-6 h-6 rounded-full ${t.swatchClass} transition-transform cursor-pointer ${
                        mascotTheme === t.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={t.label}
                    />
                  ))}
                </div>
              </div>

              {/* Pick Persona */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                  2. Choose Your Learning Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Student', 'Teacher'] as PersonaType[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        onPersonaChange(p);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        persona === p
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {p} Mode
                        </span>
                        {persona === p && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {p === 'Student'
                          ? 'Gamified XP, streaks, friendly hints & step-by-step tutoring.'
                          : 'Bloom taxonomy levels, grading rubrics & printable worksheets.'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Studio, Notes, Gamma & Flashcards */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Turn any topic, lecture notes, PDF document, YouTube link, or voice recording into interactive learning material in seconds:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Quiz Studio</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Generate multiple-choice, fill-in-the-blank, open explanation, and coding challenges with custom difficulty and question counts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                    <Layers className="w-4 h-4" />
                    <span>Flashcards & Gamma Decks</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Study with 3D spaced-repetition flashcards or interactive Gamma-style visual presentation decks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs">
                    <GraduationCap className="w-4 h-4" />
                    <span>AI Study Notes & 1-on-1 Tutor</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Generate structured study guides with common pitfalls, or press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">T</kbd> anytime to chat with your AI Tutor.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs">
                    <Radio className="w-4 h-4" />
                    <span>Suggestions Hub & Live Battles</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Get AI-tailored study recommendations based on your weak spots, or compete with friends in synchronous room-code battles!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Interactive Mini Demo of Quiz Superpowers */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                While taking any quiz, you have built-in study tools to help you think and answer faster. Try this quick interactive demo below:
              </p>

              {/* Interactive Mini Question */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    Hands-On Sandbox Question
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playHint();
                      setMiniQuizNarrowed(true);
                    }}
                    disabled={miniQuizNarrowed}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>{miniQuizNarrowed ? '50/50 Applied!' : 'Try 50/50 Narrow'}</span>
                  </button>
                </div>

                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Which organelle is known as the powerhouse of the eukaryotic cell?
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {['Golgi Apparatus', 'Mitochondria', 'Ribosome', 'Lysosome'].map((opt) => {
                    const isEliminated =
                      miniQuizNarrowed && (opt === 'Golgi Apparatus' || opt === 'Lysosome');
                    const isPicked = miniQuizPick === opt;
                    const isCorrect = opt === 'Mitochondria';
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={isEliminated}
                        onClick={() => {
                          setMiniQuizPick(opt);
                          if (isCorrect) soundFx.playCorrect();
                          else soundFx.playIncorrect();
                        }}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          isEliminated
                            ? 'opacity-35 line-through border-slate-200 dark:border-slate-800'
                            : isPicked
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                              : 'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {miniQuizPick && (
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {miniQuizPick === 'Mitochondria'
                      ? '✓ Spot on! Mitochondria generate ATP energy for the cell.'
                      : 'Try clicking "Mitochondria" or use the 50/50 Narrow button above!'}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <Mic className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Speak Answer [M]</div>
                    <div className="text-[11px] text-slate-500">Say "Option B" or speak the answer out loud!</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <EyeOff className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Spoiler Shield</div>
                    <div className="text-[11px] text-slate-500">Image descriptions automatically hide answer spoilers.</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Read Aloud [V]</div>
                    <div className="text-[11px] text-slate-500">High-clarity AI voice reads questions & explanations.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Custom Sound Effects & 12 Fonts */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                  <Type className="w-4 h-4 text-indigo-500" />
                  <span>Try Live Font Switching (12 Curated Fonts)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch fonts anytime in Settings or directly inside the Quiz Runner top bar:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {FONT_CATALOG.slice(0, 8).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setFontFamily(f.id);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        fontFamily === f.id
                          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{f.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{f.badge || f.style}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                  <Music className="w-4 h-4 text-amber-500" />
                  <span>Custom Sound Effects & Ambient Soundscapes</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  In <strong>Settings → Audio & Voice</strong>, you can upload your own audio clips, record your voice or claps with the microphone, or design custom synth tones for correct answers, streaks, and completions!
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Starter Pack Reward */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex justify-center">
                <MascotAvatar mood="streak" size="lg" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  You’re All Set, Scholar!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {bonusClaimed
                    ? 'You have already claimed your Starter Scholar Pack! Jump into the Studio or Settings anytime.'
                    : 'Claim your complimentary Starter Scholar Pack (+50 XP & +15 Gems) to kickstart your learning journey!'}
                </p>
              </div>

              <div className="inline-flex items-center gap-4 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-black text-sm">
                <Award className="w-5 h-5 text-amber-500" />
                <span>+50 Starter XP</span>
                <span>·</span>
                <span>+15 Scholar Gems</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setStep(i);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  step === i ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setStep((prev) => prev - 1);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setStep((prev) => prev + 1);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleCompleteTutorial(true);
                  if (onNavigateToTab) onNavigateToTab('studio');
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{bonusClaimed ? 'Start Exploring' : 'Claim +50 XP & Start!'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
