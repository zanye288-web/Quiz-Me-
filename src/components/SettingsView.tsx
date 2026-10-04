import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Type,
  Maximize2,
  Palette,
  Flame,
  Zap,
  Timer,
  ShieldCheck,
  Check,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Headphones,
  Eye,
  Layers,
  Sparkle,
  BookOpen,
  GraduationCap,
  Shuffle,
  HelpCircle,
  Clock,
  Gauge,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  User as UserIcon,
  Edit3,
  Save,
  Mic,
  Square,
  Music,
  Compass,
  Coins,
  Lock,
  UserCheck,
} from 'lucide-react';
import {
  useTheme,
  THEME_PRESETS,
  ACCENT_PALETTES,
  FONT_CATALOG,
  ANIMATION_STYLE_CATALOG,
  PARTICLE_PRESET_CATALOG,
  GRAPHICS_MODE_CATALOG,
  UI_STYLE_CATALOG,
  UiStyleMode,
  AccentColor,
  FontFamilyChoice,
  CardCornerRadius,
  UiDensity,
  AnimationStyle,
  AnimationIntensity,
  GraphicsQualityMode,
} from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { resetAllSignedInUsersLevelsInFirestore } from '../services/firestore';
import { createFreshResetStats } from '../utils/levelingSystem';
import { AssessmentConfig, PersonaType, DifficultyType, UserStats } from '../types/quiz';
import { QuizHistoryRecord } from './HistoryView';
import {
  soundFx,
  SOUND_PROFILES,
  SoundProfileType,
  CUSTOM_SOUND_SLOTS_META,
  CustomSoundSlot,
  CustomSoundConfig,
  AmbientSoundscapeMode,
  BG_MUSIC_TRACKS,
  BgMusicTrackId,
} from '../utils/audio';
import { speechEngine, SpeechSettings, VOICE_PRESETS, VoicePreset } from '../utils/speech';
import { UserAvatar } from './UserAvatar';
import { SCHOLAR_AVATARS, AVATAR_BG_GRADIENTS } from './ProfileCustomizationModal';
import {
  MascotAvatar,
  MASCOT_CATALOG,
  MASCOT_ACCESSORY_CATALOG,
  MASCOT_THEME_CATALOG,
  MascotMood,
  useMascotPreferences,
  getMascotIconDataUrl,
  downloadCustomMascotDesktopIcon,
} from './MascotAvatar';

interface SettingsViewProps {
  assessmentConfig: AssessmentConfig;
  onUpdateAssessmentConfig: (cfg: Partial<AssessmentConfig>) => void;
  persona: PersonaType;
  onPersonaChange: (p: PersonaType) => void;
  stats: UserStats;
  onUpdateStats: (stats: UserStats) => void;
  historyRecords: QuizHistoryRecord[];
  onUpdateHistoryRecords: (records: QuizHistoryRecord[]) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenProfileModal?: () => void;
  onOpenStarterTutorial?: () => void;
}

type SettingsSection = 'profile' | 'appearance' | 'audio_voice' | 'assessment' | 'accessibility' | 'data';

export const SettingsView: React.FC<SettingsViewProps> = ({
  assessmentConfig,
  onUpdateAssessmentConfig,
  persona,
  onPersonaChange,
  stats,
  onUpdateStats,
  historyRecords,
  onUpdateHistoryRecords,
  soundEnabled,
  onToggleSound,
  onOpenProfileModal,
  onOpenStarterTutorial,
}) => {
  const {
    theme,
    resolvedTheme,
    setTheme,
    accent,
    setAccent,
    fontFamily,
    setFontFamily,
    uiStyle,
    setUiStyle,
    uiDensity,
    setUiDensity,
    cardRadius,
    setCardRadius,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    animationStyle,
    setAnimationStyle,
    animationIntensity,
    setAnimationIntensity,
    buttonBounceEnabled,
    setButtonBounceEnabled,
    cardHoverLiftEnabled,
    setCardHoverLiftEnabled,
    confettiEnabled,
    setConfettiEnabled,
    particlesEnabled,
    setParticlesEnabled,
    particlePreset,
    setParticlePreset,
    particleDensity,
    setParticleDensity,
    particleSpeed,
    setParticleSpeed,
    particleInteractive,
    setParticleInteractive,
    ambientOrbsEnabled,
    setAmbientOrbsEnabled,
    eyeComfortWarmth,
    setEyeComfortWarmth,
    adaptiveDifficultyEnabled,
    setAdaptiveDifficultyEnabled,
    streakShieldAutoEnabled,
    setStreakShieldAutoEnabled,
    graphicsMode,
    setGraphicsMode,
    rtxEnabled,
    setRtxEnabled,
    rtxGlobalIllumination,
    setRtxGlobalIllumination,
    rtxReflections,
    setRtxReflections,
    rtxVolumetricBloom,
    setRtxVolumetricBloom,
    fpsCounterEnabled,
    setFpsCounterEnabled,
    soundVolume,
    setSoundVolume,
    questionLayout,
    setQuestionLayout,
    autoReadQuestions,
    setAutoReadQuestions,
    currentAccentConfig,
    applyPreset,
    resetAllSettings,
  } = useTheme();

  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [currentSoundProfile, setCurrentSoundProfile] = useState<SoundProfileType>(() => soundFx.getSoundProfile());
  const [isFocusHummingPreview, setIsFocusHummingPreview] = useState<boolean>(soundFx.isFocusHumming);
  const [ambientMode, setAmbientMode] = useState<AmbientSoundscapeMode>(soundFx.ambientMode);
  const [bgMusicEnabled, setBgMusicEnabled] = useState<boolean>(soundFx.bgMusicEnabled);
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState<boolean>(soundFx.isBgMusicPlaying);
  const [bgMusicTrack, setBgMusicTrack] = useState<BgMusicTrackId>(soundFx.bgMusicTrack);
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(soundFx.bgMusicVolume);

  useEffect(() => {
    const unsub = soundFx.subscribeBgMusic(() => {
      setBgMusicEnabled(soundFx.bgMusicEnabled);
      setIsBgMusicPlaying(soundFx.isBgMusicPlaying);
      setBgMusicTrack(soundFx.bgMusicTrack);
      setBgMusicVolume(soundFx.bgMusicVolume);
    });
    return () => unsub();
  }, []);
  const [previewMascotMood, setPreviewMascotMood] = useState<MascotMood>('idle');
  const {
    mascotCharacter,
    mascotTheme,
    mascotAccessory,
    mascotCoins,
    unlockedMascots,
    unlockedAccessories,
    currentMascotMeta,
    currentAccessoryMeta,
    setMascotCharacter,
    setMascotTheme,
    purchaseMascot,
    purchaseAccessory,
  } = useMascotPreferences();

  // Custom Sound Effects State
  const [customSounds, setCustomSounds] = useState<Partial<Record<CustomSoundSlot, CustomSoundConfig>>>(() =>
    soundFx.getCustomSounds()
  );
  const [activeCustomSlotModal, setActiveCustomSlotModal] = useState<CustomSoundSlot | null>(null);
  const [recordingSlot, setRecordingSlot] = useState<CustomSoundSlot | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const customAudioInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadTargetSlot, setUploadTargetSlot] = useState<CustomSoundSlot>('correct');
  const [synthWave, setSynthWave] = useState<OscillatorType>('sine');
  const [synthStartFreq, setSynthStartFreq] = useState<number>(523);
  const [synthEndFreq, setSynthEndFreq] = useState<number>(1046);
  const [synthDurationMs, setSynthDurationMs] = useState<number>(280);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('quizme_settings_last_saved_at');
    }
    return null;
  });
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);

  // Profile Customization State in Settings
  const [customKeybinds, setCustomKeybinds] = useState<{
    submitResponse: string;
    moveDownwards: string;
    nextQuestion: string;
    prevQuestion: string;
    toggleHint: string;
    askAiTutor: string;
    speakAnswer: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('quizme_custom_keybinds_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      submitResponse: 'Ctrl + Enter',
      moveDownwards: 'Enter',
      nextQuestion: 'ArrowRight',
      prevQuestion: 'ArrowLeft',
      toggleHint: 'H',
      askAiTutor: 'T',
      speakAnswer: 'M',
    };
  });

  const handleUpdateKeybind = (key: string, val: string) => {
    setCustomKeybinds((prev) => {
      const next = { ...prev, [key]: val };
      localStorage.setItem('quizme_custom_keybinds_v1', JSON.stringify(next));
      return next;
    });
  };
  const { user, userProfile, updateUserProfileInCloud } = useAuth();
  const [profileName, setProfileName] = useState(userProfile?.displayName || user?.displayName || 'Scholar');
  const [profileHeadline, setProfileHeadline] = useState(userProfile?.headline || 'Lifelong Learner');
  const [profileBio, setProfileBio] = useState(userProfile?.bio || 'Curious mind exploring knowledge across disciplines.');
  const [profileGoal, setProfileGoal] = useState(userProfile?.learningGoal || 'Master core concepts and daily recall.');
  const [profileAvatarType, setProfileAvatarType] = useState<'google' | 'icon' | 'custom' | 'mascot'>(
    userProfile?.avatarType || (user?.photoURL ? 'google' : 'mascot')
  );
  const [profileAvatarIcon, setProfileAvatarIcon] = useState(userProfile?.avatarIcon || '🎓');
  const [profileAvatarBg, setProfileAvatarBg] = useState(userProfile?.avatarBg || 'indigo');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) setProfileName(userProfile.displayName);
      if (userProfile.headline) setProfileHeadline(userProfile.headline);
      if (userProfile.bio) setProfileBio(userProfile.bio);
      if (userProfile.learningGoal) setProfileGoal(userProfile.learningGoal);
      if (userProfile.avatarType) setProfileAvatarType(userProfile.avatarType);
      if (userProfile.avatarIcon) setProfileAvatarIcon(userProfile.avatarIcon);
      if (userProfile.avatarBg) setProfileAvatarBg(userProfile.avatarBg);
    }
  }, [userProfile]);

  const handleSaveProfileFromSettings = async () => {
    try {
      setIsSavingProfile(true);
      soundFx.playCorrect();
      await updateUserProfileInCloud({
        displayName: profileName.trim() || user?.displayName || 'Scholar',
        headline: profileHeadline.trim() || 'Scholar',
        bio: profileBio.trim(),
        learningGoal: profileGoal.trim(),
        avatarType: profileAvatarType,
        avatarIcon: profileAvatarIcon,
        avatarBg: profileAvatarBg,
        hasCustomizedProfile: true,
      });
      triggerSaveNotice('Scholar Profile successfully updated in Firestore!');
    } catch (err) {
      console.error('Error saving profile in settings:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Speech TTS state
  const [speechSettings, setSpeechSettings] = useState<SpeechSettings>(() => speechEngine.getSettings());
  const [isSpeakingTest, setIsSpeakingTest] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Interactive Live Preview State
  const [previewSelectedOption, setPreviewSelectedOption] = useState<number | null>(1);
  const [saveBannerText, setSaveBannerText] = useState<string | null>(null);

  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvailableVoices(speechEngine.getVoices());
    const unsubSpeech = speechEngine.subscribeState((speaking) => {
      setIsSpeakingTest(speaking);
    });
    const unsubSettings = speechEngine.subscribeSettings((settings) => {
      setSpeechSettings(settings);
    });
    return () => {
      unsubSpeech();
      unsubSettings();
    };
  }, []);

  const triggerSaveNotice = (msg: string) => {
    setSaveBannerText(msg);
    setTimeout(() => {
      setSaveBannerText(null);
    }, 2800);
  };

  // Unified Save All Settings (Local Snapshot + Cloud Firestore Sync)
  const handleSaveAllSettings = async () => {
    try {
      setIsSavingAll(true);
      soundFx.playCorrect();
      const snapshot = {
        theme,
        accent,
        fontFamily,
        uiDensity,
        cardRadius,
        highContrast,
        reducedMotion,
        animationStyle,
        animationIntensity,
        buttonBounceEnabled,
        cardHoverLiftEnabled,
        confettiEnabled,
        soundVolume,
        soundEnabled,
        soundProfile: currentSoundProfile,
        questionLayout,
        autoReadQuestions,
        mascotCharacter,
        mascotTheme,
        persona,
        assessmentConfig,
        speechSettings,
      };
      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('quizme_saved_settings_snapshot_v1', JSON.stringify(snapshot));
      localStorage.setItem('quizme_settings_last_saved_at', timeLabel);
      setLastSavedTimestamp(timeLabel);

      if (user) {
        await updateUserProfileInCloud({
          displayName: profileName.trim() || user?.displayName || 'Scholar',
          headline: profileHeadline.trim() || 'Scholar',
          bio: profileBio.trim(),
          learningGoal: profileGoal.trim(),
          avatarType: profileAvatarType,
          avatarIcon: profileAvatarIcon,
          avatarBg: profileAvatarBg,
          hasCustomizedProfile: true,
          assessmentConfig,
          savedSettings: snapshot,
        });
      }
      triggerSaveNotice('All settings & preferences saved locally and synced to cloud!');
    } catch (err) {
      console.warn('Settings save notice:', err);
      triggerSaveNotice('All settings saved to device storage!');
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleRestoreSavedSnapshot = () => {
    const raw = localStorage.getItem('quizme_saved_settings_snapshot_v1');
    if (!raw) {
      triggerSaveNotice('No saved snapshot found yet — click Save All Changes first!');
      return;
    }
    try {
      const snap = JSON.parse(raw);
      if (snap.theme) setTheme(snap.theme);
      if (snap.accent) setAccent(snap.accent);
      if (snap.fontFamily) setFontFamily(snap.fontFamily);
      if (snap.uiDensity) setUiDensity(snap.uiDensity);
      if (snap.cardRadius) setCardRadius(snap.cardRadius);
      if (typeof snap.highContrast === 'boolean') setHighContrast(snap.highContrast);
      if (typeof snap.reducedMotion === 'boolean') setReducedMotion(snap.reducedMotion);
      if (snap.animationStyle) setAnimationStyle(snap.animationStyle);
      if (snap.animationIntensity) setAnimationIntensity(snap.animationIntensity);
      if (typeof snap.buttonBounceEnabled === 'boolean') setButtonBounceEnabled(snap.buttonBounceEnabled);
      if (typeof snap.cardHoverLiftEnabled === 'boolean') setCardHoverLiftEnabled(snap.cardHoverLiftEnabled);
      if (typeof snap.confettiEnabled === 'boolean') setConfettiEnabled(snap.confettiEnabled);
      if (typeof snap.soundVolume === 'number') setSoundVolume(snap.soundVolume);
      if (snap.soundProfile) {
        setCurrentSoundProfile(snap.soundProfile);
        soundFx.setSoundProfile(snap.soundProfile);
      }
      if (snap.questionLayout) setQuestionLayout(snap.questionLayout);
      if (typeof snap.autoReadQuestions === 'boolean') setAutoReadQuestions(snap.autoReadQuestions);
      if (snap.mascotCharacter) setMascotCharacter(snap.mascotCharacter);
      if (snap.mascotTheme) setMascotTheme(snap.mascotTheme);
      if (snap.persona) onPersonaChange(snap.persona);
      if (snap.assessmentConfig) onUpdateAssessmentConfig(snap.assessmentConfig);
      soundFx.playCorrect();
      triggerSaveNotice('Restored your last saved settings snapshot!');
    } catch {
      triggerSaveNotice('Could not restore snapshot.');
    }
  };

  // Support Ctrl+S / Cmd+S inside SettingsView
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAllSettings();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Custom Sound File Upload Handler
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      triggerSaveNotice('Please choose an audio clip under 2.5 MB for instant playback.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const cfg: CustomSoundConfig = {
        slot: uploadTargetSlot,
        name: file.name.replace(/\.[^/.]+$/, '').slice(0, 28),
        enabled: true,
        sourceType: 'upload',
        dataUrl,
        updatedAt: new Date().toISOString(),
      };
      soundFx.setCustomSound(uploadTargetSlot, cfg);
      setCustomSounds(soundFx.getCustomSounds());
      soundFx.playCustomSoundSlot(uploadTargetSlot, true);
      triggerSaveNotice(`Uploaded custom sound "${cfg.name}" for ${uploadTargetSlot}!`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Custom Sound Microphone Recorder (up to 4 seconds)
  const handleToggleMicRecordSlot = async (slot: CustomSoundSlot) => {
    if (recordingSlot === slot && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecordingSlot(null);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mediaRecorderRef.current = recorder;
      setRecordingSlot(slot);

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const cfg: CustomSoundConfig = {
            slot,
            name: `Mic Recording (${new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })})`,
            enabled: true,
            sourceType: 'mic',
            dataUrl,
            updatedAt: new Date().toISOString(),
          };
          soundFx.setCustomSound(slot, cfg);
          setCustomSounds(soundFx.getCustomSounds());
          soundFx.playCustomSoundSlot(slot, true);
          triggerSaveNotice(`Saved microphone sound effect for ${slot}!`);
        };
        reader.readAsDataURL(blob);
        setRecordingSlot(null);
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 3500);
    } catch {
      triggerSaveNotice('Microphone permission is required to record custom sound effects.');
      setRecordingSlot(null);
    }
  };

  // Save Custom Synth Tone to Slot
  const handleSaveCustomSynthToSlot = (slot: CustomSoundSlot) => {
    const cfg: CustomSoundConfig = {
      slot,
      name: `Custom ${synthWave.toUpperCase()} (${synthStartFreq}Hz→${synthEndFreq}Hz)`,
      enabled: true,
      sourceType: 'synth',
      synth: {
        waveform: synthWave,
        startFreq: synthStartFreq,
        endFreq: synthEndFreq,
        durationMs: synthDurationMs,
      },
      updatedAt: new Date().toISOString(),
    };
    soundFx.setCustomSound(slot, cfg);
    setCustomSounds(soundFx.getCustomSounds());
    soundFx.playCustomSoundSlot(slot, true);
    setActiveCustomSlotModal(null);
    triggerSaveNotice(`Saved custom synth effect for ${slot}!`);
  };

  // Export data as JSON
  const handleExportData = () => {
    soundFx.playClick();
    const exportPayload = {
      app: 'Quiz Me!',
      version: '2.5',
      exportDate: new Date().toISOString(),
      persona,
      stats,
      assessmentConfig,
      historyRecords,
      themeSettings: {
        theme,
        accent,
        fontFamily,
        uiDensity,
        cardRadius,
        highContrast,
        reducedMotion,
        confettiEnabled,
        soundVolume,
        autoReadQuestions,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `quizme-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerSaveNotice('All profile stats & quiz history exported successfully!');
  };

  // Import JSON backup
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.stats) onUpdateStats(parsed.stats);
        if (parsed.historyRecords && Array.isArray(parsed.historyRecords)) {
          onUpdateHistoryRecords(parsed.historyRecords);
        }
        if (parsed.assessmentConfig) {
          onUpdateAssessmentConfig(parsed.assessmentConfig);
        }
        if (parsed.persona) {
          onPersonaChange(parsed.persona);
        }
        if (parsed.themeSettings) {
          if (parsed.themeSettings.theme) setTheme(parsed.themeSettings.theme);
          if (parsed.themeSettings.accent) setAccent(parsed.themeSettings.accent);
          if (parsed.themeSettings.fontFamily) setFontFamily(parsed.themeSettings.fontFamily);
          if (parsed.themeSettings.cardRadius) setCardRadius(parsed.themeSettings.cardRadius);
          if (parsed.themeSettings.uiDensity) setUiDensity(parsed.themeSettings.uiDensity);
        }

        soundFx.playCorrect();
        triggerSaveNotice('Backup imported and profile state restored!');
      } catch (err) {
        soundFx.playIncorrect();
        alert('Invalid JSON backup file. Please verify the format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTestSpeech = () => {
    if (isSpeakingTest) {
      speechEngine.stop();
      setIsSpeakingTest(false);
    } else {
      speechEngine.speak(
        `Welcome to Quiz Me! You have selected the ${currentAccentConfig.name} theme with crisp dynamic feedback.`,
        { id: 'preview_tts_test' }
      );
    }
  };

  const isChallengeMode = assessmentConfig.challengeMode ?? false;
  const challengeTimer = assessmentConfig.challengeTimerSeconds ?? 15;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 py-3 h-[calc(100vh-4.25rem)] flex flex-col gap-3 overflow-hidden animate-in fade-in duration-200">
      {/* Toast Notification Banner */}
      {saveBannerText && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{saveBannerText}</span>
        </div>
      )}

      {/* Compact Fit-to-Screen Hero Header + Navigation Bar */}
      <div className="shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-3.5 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${currentAccentConfig.badgeBg} ${currentAccentConfig.badgeText} border ${currentAccentConfig.border}`}>
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Settings & Advanced Studio
                </h1>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  · Live Reactive
                  {lastSavedTimestamp ? ` · Saved ${lastSavedTimestamp}` : ''}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Customize particle visual effects, themes, mascots, audio synthesis, adaptive AI difficulty, and progression.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Quick Graphics Mode Switcher in Settings Header */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {GRAPHICS_MODE_CATALOG.map((gm) => (
                <button
                  key={gm.id}
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setGraphicsMode(gm.id);
                    triggerSaveNotice(`Switched graphics engine to ${gm.name}!`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                    graphicsMode === gm.id
                      ? gm.id === 'ultra'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={gm.tagline}
                >
                  <span>{gm.icon}</span>
                  <span>{gm.shortName}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setParticlesEnabled(!particlesEnabled);
                triggerSaveNotice(
                  !particlesEnabled
                    ? 'Particle visual effects enabled!'
                    : 'Particle visual effects removed.'
                );
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                particlesEnabled
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
              title="Toggle background particle visual effects on or off"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{particlesEnabled ? 'Particles: ON' : 'Particles: OFF'}</span>
            </button>

            {onOpenStarterTutorial && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenStarterTutorial();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tutorial</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleRestoreSavedSnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Revert to your last saved settings snapshot"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restore</span>
            </button>
            <button
              type="button"
              onClick={() => {
                resetAllSettings();
                triggerSaveNotice('Default theme & settings restored.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAllSettings}
              disabled={isSavingAll}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer ${currentAccentConfig.activeBtn}`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingAll ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Main Settings Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {[
            { id: 'appearance' as SettingsSection, label: 'Appearance & Mascots', icon: Palette },
            { id: 'accessibility' as SettingsSection, label: 'Particle FX & Advanced', icon: Sparkles },
            { id: 'profile' as SettingsSection, label: 'Scholar Profile', icon: UserIcon },
            { id: 'audio_voice' as SettingsSection, label: 'Audio & Voice Synth', icon: Volume2 },
            { id: 'assessment' as SettingsSection, label: 'Quiz & AI Engine', icon: GraduationCap },
            { id: 'data' as SettingsSection, label: 'Data & Level Reset', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveSection(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `${currentAccentConfig.badgeBg} ${currentAccentConfig.badgeText} border ${currentAccentConfig.border} shadow-2xs`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Fit-to-Screen Active Tab Viewport */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-6 space-y-5">
        {activeSection === 'appearance' && (
          <div className="space-y-5">
            {/* 5 UI STYLES SELECTOR: 3D, Modern, Legacy, Playful, Default */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Global Interface Architecture
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    UI Style Engine (3D · Modern · Legacy · Playful · Default)
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Active: {UI_STYLE_CATALOG.find((s) => s.id === uiStyle)?.name || 'Default'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {UI_STYLE_CATALOG.map((styleItem) => {
                  const isCurrentStyle = uiStyle === styleItem.id;
                  return (
                    <button
                      key={styleItem.id}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setUiStyle(styleItem.id);
                        triggerSaveNotice(`Switched UI Style to ${styleItem.name}`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isCurrentStyle
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {styleItem.name}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            {styleItem.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {styleItem.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOM KEYBINDS EDITOR */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Custom Keybinds & Controls
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Keyboard Shortcuts Configuration (Ctrl+Enter Submit · Enter Move Downwards)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: 'submitResponse', label: 'Submit Response' },
                  { key: 'moveDownwards', label: 'Move Downwards / Next Option' },
                  { key: 'nextQuestion', label: 'Next Question' },
                  { key: 'prevQuestion', label: 'Previous Question' },
                  { key: 'toggleHint', label: 'Toggle Hint' },
                  { key: 'askAiTutor', label: 'Open AI Tutor' },
                  { key: 'speakAnswer', label: 'Voice Microphone' },
                ].map((kb) => (
                  <div
                    key={kb.key}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col gap-1.5"
                  >
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {kb.label}
                    </label>
                    <input
                      type="text"
                      value={(customKeybinds as any)[kb.key] || ''}
                      onChange={(e) => handleUpdateKeybind(kb.key, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-black text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>One-Click Aesthetic Presets</span>
              </label>
              <span className="text-[11px] text-slate-400">Instant full-app restyle</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {THEME_PRESETS.map((p) => {
                const isSelected =
                  theme === p.theme &&
                  accent === p.accent &&
                  fontFamily === p.fontFamily &&
                  uiDensity === p.uiDensity &&
                  cardRadius === p.cardRadius;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      applyPreset(p.id);
                      triggerSaveNotice(`Applied preset: ${p.name}`);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 group ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{p.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {p.theme} · {p.accent}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            </div>
          </div>
        )}

      {/* Section 0: Scholar Profile & Identity Customization */}
      {activeSection === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Preview Card */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <UserAvatar
                displayName={profileName}
                photoURL={profileAvatarType === 'google' ? (user?.photoURL || null) : null}
                avatarType={profileAvatarType}
                avatarIcon={profileAvatarIcon}
                avatarBg={profileAvatarBg}
                size="xl"
                showLevelBadge
                level={stats.level}
              />
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {profileName || 'Scholar'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {persona}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                  {profileHeadline || 'Scholar'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md italic">
                  &ldquo;{profileBio || 'Dedicated to learning & mastery.'}&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
                  <span>Level {stats.level}</span>
                  <span>•</span>
                  <span>{stats.xp} XP</span>
                  <span>•</span>
                  <span>{stats.streak} Days Streak</span>
                </div>
              </div>
            </div>

            {onOpenProfileModal && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenProfileModal();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Launch Profile Modal</span>
              </button>
            )}
          </div>

          {/* Detailed Customization Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity & Bio */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Identity & Bio
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  maxLength={36}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Academic Headline / Field
                </label>
                <input
                  type="text"
                  value={profileHeadline}
                  onChange={(e) => setProfileHeadline(e.target.value)}
                  maxLength={50}
                  placeholder="e.g. Computer Science Undergrad"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {['CS Undergrad', 'Pre-Med', 'AP Scholar', 'Lifelong Learner', 'Educator'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setProfileHeadline(chip);
                      }}
                      className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Primary Learning Goal
                </label>
                <input
                  type="text"
                  value={profileGoal}
                  onChange={(e) => setProfileGoal(e.target.value)}
                  maxLength={60}
                  placeholder="e.g. Ace upcoming semester exams"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Personal Motto / Bio ({profileBio.length}/160)
                </label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  maxLength={160}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Avatar Identity
                </h3>
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setProfileAvatarType('mascot');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      profileAvatarType === 'mascot'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    My Mascot
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setProfileAvatarType('icon');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      profileAvatarType === 'icon'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Emoji Badge
                  </button>
                  {user?.photoURL && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setProfileAvatarType('google');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        profileAvatarType === 'google'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Google Photo
                    </button>
                  )}
                </div>
              </div>

              {profileAvatarType === 'icon' ? (
                <>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    {SCHOLAR_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setProfileAvatarIcon(av.emoji);
                        }}
                        className={`flex flex-col items-center p-1.5 rounded-xl cursor-pointer transition-all ${
                          profileAvatarIcon === av.emoji
                            ? 'border border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 scale-105'
                            : 'hover:bg-white dark:hover:bg-slate-800'
                        }`}
                        title={av.label}
                      >
                        <span className="text-xl">{av.emoji}</span>
                        <span className="text-[9px] text-slate-500 truncate max-w-full">{av.label}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                      Avatar Aura Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_BG_GRADIENTS.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setProfileAvatarBg(g.id);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            profileAvatarBg === g.id
                              ? `${g.border} bg-white dark:bg-slate-800 ${g.text} shadow-xs`
                              : 'border-slate-200 dark:border-slate-700 text-slate-500'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full bg-gradient-to-tr ${g.gradient}`} />
                          <span>{g.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center gap-3">
                  <img
                    src={user?.photoURL || ''}
                    alt="Google Profile"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Using Google Account Photo
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Automatically synced from {user?.email || 'your Google account'}.
                    </p>
                  </div>
                </div>
              )}

              {/* Persona selection */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Default Role Persona
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onPersonaChange('Student');
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      persona === 'Student'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Student Persona
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onPersonaChange('Teacher');
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      persona === 'Teacher'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Teacher Persona
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfileFromSettings}
                  disabled={isSavingProfile}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Appearance & Theme Studio */}
      {activeSection === 'appearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mascot Companion Character, Unique Poses, Accessories & Desktop/Website Icon Studio */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Mascot & Accessory Boutique (10 Unique Poses)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    {mascotCoins} Mascot Coins
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Each mascot has its own unique pose! Earn <strong>Mascot Coins</strong> by scoring 80%+ on quizzes (<strong>100% Perfect = +8 Coins</strong>) to unlock rare mascots and accessories. Your customized mascot also updates your <strong>website tab & desktop app icon</strong> automatically!
              </p>

              {/* 10 Mascot Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
                        triggerSaveNotice(res.message);
                      }}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20 shadow-xs'
                          : isUnlocked
                          ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-850'
                          : 'border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-slate-900/40'
                      }`}
                    >
                      <MascotAvatar
                        character={m.id}
                        theme={isSelected ? mascotTheme : m.defaultTheme}
                        accessory={isSelected ? mascotAccessory : m.defaultAccessory || 'none'}
                        mood={isSelected ? previewMascotMood : 'idle'}
                        size="sm"
                        interactive={false}
                      />
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {m.name}
                        </div>
                        <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold leading-tight mt-0.5">
                          {m.uniquePose}
                        </div>
                        {!isUnlocked ? (
                          <span className="mt-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            <Lock className="w-2.5 h-2.5" />
                            {m.costCoins} Coins
                          </span>
                        ) : (
                          <span className="mt-1 inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            {isSelected ? 'Equipped' : 'Unlocked'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mascot Accessories Grid */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  <span>Mascot Accessories (Unlock with Mascot Coins)</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    Wearing: {currentAccessoryMeta.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          triggerSaveNotice(res.message);
                        }}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 ring-1 ring-indigo-500/30'
                            : isUnlocked
                            ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-amber-400'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="text-base">{acc.previewEmoji}</span>
                          {!isUnlocked ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              <Coins className="w-2.5 h-2.5 text-amber-500" />
                              {acc.costCoins}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              {isSelected ? 'Equipped' : 'Owned'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white mt-1 truncate max-w-full">
                          {acc.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Mascot Details + Set as Profile Picture + Website/Desktop Icon Sync */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="shrink-0">
                  <MascotAvatar
                    character={mascotCharacter}
                    theme={mascotTheme}
                    accessory={mascotAccessory}
                    mood={previewMascotMood}
                    size="md"
                  />
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {currentMascotMeta.title} • {currentMascotMeta.uniquePose}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {currentMascotMeta.tagline} • Wearing: {currentAccessoryMeta.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          soundFx.playComplete();
                          setProfileAvatarType('mascot');
                          await updateUserProfileInCloud({
                            avatarType: 'mascot',
                            mascotCharacter,
                            mascotTheme,
                            equippedAccessory: mascotAccessory,
                          });
                          triggerSaveNotice(`${currentMascotMeta.title} is now set as your Profile Picture!`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{profileAvatarType === 'mascot' ? 'Active Profile Pic' : 'Set as Profile Pic'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          downloadCustomMascotDesktopIcon(mascotCharacter, mascotTheme, mascotAccessory);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Download 512x512 Desktop Icon (.png)"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>App Icon</span>
                      </button>
                    </div>
                  </div>

                  {/* Color Aura Swatches */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                      Color Aura:
                    </span>
                    {MASCOT_THEME_CATALOG.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setMascotTheme(t.id);
                          triggerSaveNotice(`Mascot aura set to ${t.label}`);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                          mascotTheme === t.id
                            ? 'border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs ring-1 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${t.swatchClass}`} />
                        <span>{t.label.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Mood Tester */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                      Preview Mood:
                    </span>
                    {(['idle', 'happy', 'streak', 'thinking', 'teacher', 'comforting'] as MascotMood[]).map(
                      (mMood) => (
                        <button
                          key={mMood}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setPreviewMascotMood(mMood);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                            previewMascotMood === mMood
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300/70'
                          }`}
                        >
                          {mMood}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Mode Card */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Color Mode</span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'light' as const, label: 'Light Mode', icon: Sun, desc: 'Crisp & high-contrast' },
                  { id: 'dark' as const, label: 'Dark Mode', icon: Moon, desc: 'Onyx & eye-safe' },
                  { id: 'system' as const, label: 'System Sync', icon: Monitor, desc: 'Follows OS preference' },
                ].map((item) => {
                  const isSelected = theme === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        soundFx.playThemeToggle();
                        setTheme(item.id);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Palette Swatches */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-500" />
                  <span>Primary Color Accent</span>
                </label>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Current: <strong className="text-slate-900 dark:text-white">{currentAccentConfig.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((key) => {
                  const pal = ACCENT_PALETTES[key];
                  const isSelected = accent === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setAccent(key);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-slate-50 dark:bg-slate-800 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full shadow-xs shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: pal.primaryHex }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {pal.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography Font Pairing */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Type className="w-4 h-4 text-emerald-500" />
                  <span>Typography & Font Pairing ({FONT_CATALOG.length} Styles)</span>
                </label>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Includes Dyslexia & Low-Vision Fonts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FONT_CATALOG.map((font) => {
                  const isSelected = fontFamily === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setFontFamily(font.id);
                      }}
                      style={{ fontFamily: font.cssFamily }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {font.name}
                          </span>
                          {font.badge && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                              {font.badge}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400">{font.style}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 italic opacity-85 mt-1 truncate">
                        "{font.sample}"
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Corner Radius & UI Density */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Corner Radius */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-purple-500" />
                  <span>Card Corner Curvature</span>
                </label>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: '3xl' as CardCornerRadius, label: '3xl (24px)' },
                    { id: '2xl' as CardCornerRadius, label: '2xl (16px)' },
                    { id: 'xl' as CardCornerRadius, label: 'xl (12px)' },
                    { id: 'md' as CardCornerRadius, label: 'Sharp (6px)' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setCardRadius(r.id);
                      }}
                      className={`py-2 px-1 text-center text-xs font-bold border rounded-xl transition-all cursor-pointer ${
                        cardRadius === r.id
                          ? 'border-indigo-500 bg-indigo-600 text-white font-extrabold shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* UI Density */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-500" />
                  <span>UI Layout Density</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'comfortable' as UiDensity, label: 'Comfortable', desc: 'Spacious cards & margins' },
                    { id: 'compact' as UiDensity, label: 'Compact', desc: 'Higher information density' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setUiDensity(d.id);
                      }}
                      className={`p-2.5 border rounded-xl text-left transition-all cursor-pointer ${
                        uiDensity === d.id
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{d.label}</div>
                      <div className="text-[10px] text-slate-400">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Smooth & Bouncy Animation Physics Engine */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Smooth &amp; Bouncy Animation Physics</span>
                </label>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  Live Spring Engine
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{anim.icon}</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {anim.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {anim.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {anim.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>

              {animationStyle !== 'minimal' && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Spring Intensity:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'subtle' as AnimationIntensity, label: 'Subtle' },
                          { id: 'normal' as AnimationIntensity, label: 'Normal' },
                          { id: 'extra' as AnimationIntensity, label: 'Extra' },
                        ]
                      ).map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => {
                            soundFx.playPop();
                            setAnimationIntensity(lvl.id);
                          }}
                          className={`py-1.5 rounded-xl border text-[11px] font-black cursor-pointer ${
                            animationIntensity === lvl.id
                              ? 'border-indigo-500 bg-indigo-600 text-white'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setButtonBounceEnabled(!buttonBounceEnabled);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer flex items-center justify-between ${
                        buttonBounceEnabled
                          ? 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black">Button Bounce</div>
                        <div className="text-[10px] opacity-75">Tactile squish &amp; pop</div>
                      </div>
                      <span className="text-xs font-black">{buttonBounceEnabled ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setCardHoverLiftEnabled(!cardHoverLiftEnabled);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer flex items-center justify-between ${
                        cardHoverLiftEnabled
                          ? 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black">3D Card Lift</div>
                        <div className="text-[10px] opacity-75">Spring hover float</div>
                      </div>
                      <span className="text-xs font-black">{cardHoverLiftEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Real-Time Live Preview Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  <span>Live Interactive Preview</span>
                </label>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                  Updates Instantly
                </span>
              </div>

              {/* Mock Quiz Card rendered with user settings */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                {/* Header metadata */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${currentAccentConfig.badgeBg} ${currentAccentConfig.badgeText} border ${currentAccentConfig.border}`}>
                    Question 1 of 5
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    +20 XP
                  </span>
                </div>

                {/* Question stem */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    Which JavaScript feature schedules a microtask to execute after the current stack?
                  </h3>
                </div>

                {/* Interactive Option List */}
                <div className="space-y-2">
                  {[
                    { id: 0, label: 'setTimeout(callback, 0)' },
                    { id: 1, label: 'queueMicrotask(callback)' },
                    { id: 2, label: 'requestAnimationFrame(callback)' },
                    { id: 3, label: 'setImmediate(callback)' },
                  ].map((opt) => {
                    const isPicked = previewSelectedOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          soundFx.playSelect();
                          setPreviewSelectedOption(opt.id);
                        }}
                        className={`w-full p-3 text-left rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isPicked
                            ? `${currentAccentConfig.badgeBg} ${currentAccentConfig.border} font-bold text-slate-900 dark:text-white ring-2 ${currentAccentConfig.ring}`
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isPicked && (
                          <CheckCircle2 className={`w-4 h-4 ${currentAccentConfig.activeText}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playCorrect();
                    triggerSaveNotice('Tactile feedback preview triggered!');
                  }}
                  className={`w-full py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer text-center ${currentAccentConfig.activeBtn}`}
                >
                  Confirm & Submit Answer
                </button>

                <div className="text-[11px] text-slate-400 text-center">
                  Try clicking options and buttons to preview colors, fonts, and tactile sounds.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Audio & Voice Narration */}
      {activeSection === 'audio_voice' && (
        <div className="max-w-3xl space-y-6">
          {/* Master Sound Effects Toggle, Profiles & Volume */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${soundEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Synthesized Acoustic Sound Design
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    High-fidelity Web Audio synthesis with dynamics compression, harmonic overtones & zero latency.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onToggleSound();
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
              </button>
            </div>

            {/* Sound Volume Slider & Profiles */}
            {soundEnabled && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-5">
                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">Master Sound FX Volume</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">
                      {Math.round(soundVolume * 100)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSoundVolume(val);
                    }}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Sound Profile Selector */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Acoustic Sound Profile Pack
                    </label>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Active: {SOUND_PROFILES.find((p) => p.id === currentSoundProfile)?.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SOUND_PROFILES.map((p) => {
                      const isSelected = currentSoundProfile === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setCurrentSoundProfile(p.id);
                            soundFx.setSoundProfile(p.id);
                            triggerSaveNotice(`Switched sound palette to ${p.name}`);
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                              : 'border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{p.icon}</span>
                              <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                  {p.name}
                                </h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                  {p.character}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            {p.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sound effect tester palette */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Interactive Acoustic Soundboard
                    </span>
                    <span className="text-[10px] text-slate-400">Click any pad to preview synthesis</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => soundFx.playClick()}
                      className="px-3 py-2 text-xs font-bold border rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs text-left"
                    >
                      <div className="text-[10px] text-slate-400">Button</div>
                      <div className="truncate">Tactile Click</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => soundFx.playSelect()}
                      className="px-3 py-2 text-xs font-bold border rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs text-left"
                    >
                      <div className="text-[10px] text-slate-400">Selection</div>
                      <div className="truncate">Option Pop</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => soundFx.playCorrect()}
                      className="px-3 py-2 text-xs font-bold border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl cursor-pointer shadow-2xs text-left"
                    >
                      <div className="text-[10px] text-emerald-500">Correct</div>
                      <div className="truncate">Resonant Chime</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => soundFx.playIncorrect()}
                      className="px-3 py-2 text-xs font-bold border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl cursor-pointer shadow-2xs text-left"
                    >
                      <div className="text-[10px] text-rose-500">Incorrect</div>
                      <div className="truncate">Warm Drop</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => soundFx.playCombo(3)}
                      className="px-3 py-2 text-xs font-bold border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-xl cursor-pointer shadow-2xs text-left"
                    >
                      <div className="text-[10px] text-amber-500">3x Streak</div>
                      <div className="truncate">Combo Arpeggio</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => soundFx.playBadgeUnlock()}
                      className="px-3 py-2 text-xs font-bold border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl cursor-pointer shadow-2xs text-left"
                    >
                      <div className="text-[10px] text-purple-500">Achievement</div>
                      <div className="truncate">Golden Harp</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => soundFx.playComplete()}
                      className="px-3 py-2 text-xs font-bold border border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl cursor-pointer shadow-2xs text-left"
                    >
                      <div className="text-[10px] text-indigo-500">Completion</div>
                      <div className="truncate">Grand Fanfare</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const active = soundFx.toggleFocusHum();
                        setIsFocusHummingPreview(active);
                      }}
                      className={`px-3 py-2 text-xs font-bold border rounded-xl cursor-pointer shadow-2xs text-left transition-all ${
                        isFocusHummingPreview
                          ? 'border-cyan-500 bg-cyan-500 text-white shadow-cyan-500/25'
                          : 'border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 bg-cyan-50/60 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50'
                      }`}
                    >
                      <div className="text-[10px] opacity-80">{isFocusHummingPreview ? 'Playing' : 'Ambient'}</div>
                      <div className="truncate">{isFocusHummingPreview ? 'Stop Focus 432Hz' : '432Hz Alpha Tone'}</div>
                    </button>
                  </div>
                </div>

                {/* Minimal Gamified Background Music (Removable in Settings) */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Music className="w-4 h-4 text-indigo-500" />
                        <span>Background Study Music</span>
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Light, minimal background music that plays softly while you study or take quizzes. Turn off below anytime to remove it completely.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {bgMusicEnabled && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.toggleBgMusic();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            isBgMusicPlaying
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          }`}
                        >
                          {isBgMusicPlaying ? 'Pause Music' : 'Play Music'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const next = !bgMusicEnabled;
                          soundFx.setBgMusicEnabled(next);
                          if (next) {
                            soundFx.startBgMusic();
                            triggerSaveNotice('Background music turned on');
                          } else {
                            soundFx.stopBgMusic();
                            triggerSaveNotice('Background music turned off');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                          bgMusicEnabled
                            ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100'
                            : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {bgMusicEnabled ? 'Turn Off Music' : 'Turn On Music'}
                      </button>
                    </div>
                  </div>

                  {bgMusicEnabled && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-300">
                          Background Music Volume (Minimal Level)
                        </span>
                        <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                          {Math.round(bgMusicVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.05}
                        max={1}
                        step={0.05}
                        value={bgMusicVolume}
                        onChange={(e) => soundFx.setBgMusicVolume(parseFloat(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {BG_MUSIC_TRACKS.slice(0, 6).map((t) => {
                          const isCurrent = bgMusicTrack === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                soundFx.setBgMusicTrack(t.id, true);
                                triggerSaveNotice(`Switched background groove to ${t.title}`);
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isCurrent
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="text-xs font-extrabold truncate">{t.title}</div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {t.badge} · {t.defaultBpm} BPM
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ambient Study Soundscape Mixer */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                      Ambient Study Soundscape Mixer
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Play continuous calming background audio while studying
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'alpha432' as AmbientSoundscapeMode,
                        title: '432Hz Alpha Binaural',
                        desc: 'Warm 10Hz alpha focus wave',
                      },
                      {
                        id: 'rain' as AmbientSoundscapeMode,
                        title: 'Soft Study Rain',
                        desc: 'Calming acoustic rainfall loop',
                      },
                      {
                        id: 'pinknoise' as AmbientSoundscapeMode,
                        title: 'Warm Pink Noise',
                        desc: 'Blocks distractions & chatter',
                      },
                    ].map((sc) => {
                      const isActive = isFocusHummingPreview && ambientMode === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            if (isFocusHummingPreview && ambientMode === sc.id) {
                              soundFx.stopFocusHum();
                              setIsFocusHummingPreview(false);
                            } else {
                              setAmbientMode(sc.id);
                              soundFx.startFocusHum(sc.id);
                              setIsFocusHummingPreview(true);
                            }
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isActive
                              ? 'border-cyan-500 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 ring-2 ring-cyan-500/20'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold">{sc.title}</span>
                            <span className="text-[10px] font-bold">
                              {isActive ? '● Playing' : 'Play'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{sc.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom User Sound Effects Studio */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Custom Sound Effects Studio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload audio files (.mp3, .wav, .ogg), record your own voice/claps with the mic, or design a custom synth tone for any quiz event!
                  </p>
                </div>
              </div>
            </div>

            <input
              ref={customAudioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleCustomAudioUpload}
              className="hidden"
            />

            <div className="grid grid-cols-1 gap-3">
              {CUSTOM_SOUND_SLOTS_META.map((slotMeta) => {
                const customCfg = customSounds[slotMeta.slot];
                const isRecordingThis = recordingSlot === slotMeta.slot;
                const isDesigningThis = activeCustomSlotModal === slotMeta.slot;

                return (
                  <div
                    key={slotMeta.slot}
                    className={`p-4 rounded-2xl border transition-all ${
                      customCfg?.enabled
                        ? 'border-indigo-500/70 bg-indigo-50/30 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {slotMeta.label}
                          </span>
                          {customCfg && (
                            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              · Custom: {customCfg.name}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {slotMeta.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Upload File Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setUploadTargetSlot(slotMeta.slot);
                            customAudioInputRef.current?.click();
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer transition-colors"
                          title="Upload MP3 / WAV / OGG audio file"
                        >
                          <Upload className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Upload Audio</span>
                        </button>

                        {/* Record Mic Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleMicRecordSlot(slotMeta.slot)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors ${
                            isRecordingThis
                              ? 'border-rose-500 bg-rose-600 text-white animate-pulse'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                          title="Record up to 3.5 seconds from your microphone"
                        >
                          {isRecordingThis ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Stop Rec</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5 text-rose-500" />
                              <span>Record Mic</span>
                            </>
                          )}
                        </button>

                        {/* Custom Synth Designer Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isDesigningThis) {
                              setActiveCustomSlotModal(null);
                            } else {
                              setSynthStartFreq(
                                customCfg?.synth?.startFreq || slotMeta.defaultFreq
                              );
                              setSynthEndFreq(
                                customCfg?.synth?.endFreq || slotMeta.defaultEndFreq
                              );
                              setSynthWave(customCfg?.synth?.waveform || 'sine');
                              setSynthDurationMs(customCfg?.synth?.durationMs || 260);
                              setActiveCustomSlotModal(slotMeta.slot);
                            }
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors ${
                            isDesigningThis
                              ? 'border-amber-500 bg-amber-500 text-white'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-500" />
                          <span>Synth Tone</span>
                        </button>

                        {/* Test Custom or Default Sound */}
                        {customCfg && (
                          <>
                            <button
                              type="button"
                              onClick={() => soundFx.playCustomSoundSlot(slotMeta.slot, true)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer"
                              title="Play custom sound"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Test</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                soundFx.removeCustomSound(slotMeta.slot);
                                setCustomSounds(soundFx.getCustomSounds());
                                triggerSaveNotice(`Restored default sound for ${slotMeta.label}`);
                              }}
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 transition-colors cursor-pointer"
                              title="Remove custom sound and restore default"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Custom Synth Designer Drawer */}
                    {isDesigningThis && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Waveform
                          </label>
                          <select
                            value={synthWave}
                            onChange={(e) => setSynthWave(e.target.value as OscillatorType)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                          >
                            <option value="sine">Sine (Pure)</option>
                            <option value="triangle">Triangle (Warm)</option>
                            <option value="square">Square (Retro 8-Bit)</option>
                            <option value="sawtooth">Sawtooth (Bright)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Start Pitch: {Math.round(synthStartFreq)} Hz
                          </label>
                          <input
                            type="range"
                            min="120"
                            max="1600"
                            step="10"
                            value={synthStartFreq}
                            onChange={(e) => setSynthStartFreq(Number(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            End Pitch: {Math.round(synthEndFreq)} Hz
                          </label>
                          <input
                            type="range"
                            min="120"
                            max="2000"
                            step="10"
                            value={synthEndFreq}
                            onChange={(e) => setSynthEndFreq(Number(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveCustomSynthToSlot(slotMeta.slot)}
                            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold cursor-pointer"
                          >
                            Save Tone
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice Narration & TTS Settings */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    AI Question Voice Narration (TTS)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    High-clarity speech synthesis for questions, answers, and study notes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestSpeech}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSpeakingTest
                    ? 'bg-rose-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {isSpeakingTest ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isSpeakingTest ? 'Stop Voice' : 'Test Speech'}</span>
              </button>
            </div>

            {/* Auto-read questions toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Auto-Read Questions on Load
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically speaks each question when transitioning to a new item
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAutoReadQuestions(!autoReadQuestions);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  autoReadQuestions ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
              </button>
            </div>

            {/* Voice Personas */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Speech Persona Presets
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {VOICE_PRESETS.map((preset) => {
                  const isSelected = speechSettings.preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        speechEngine.applyPreset(preset.id);
                        setSpeechSettings(speechEngine.getSettings());
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{preset.icon}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">{preset.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Assessment Defaults & Pedagogical Rules */}
      {activeSection === 'assessment' && (
        <div className="max-w-3xl space-y-6">
          {/* Default Assessment Persona */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>Default Pedagogical Persona</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'Student' as PersonaType,
                  title: 'Student Mode',
                  badge: 'Gamified & Encouraging',
                  desc: 'Earns XP, heart streaks, cheerful badges, and friendly hints.',
                  icon: '🎓',
                },
                {
                  id: 'Teacher' as PersonaType,
                  title: 'Teacher / Instructor Mode',
                  badge: 'Pedagogical & Diagnostic',
                  desc: 'Includes Bloom taxonomy targets, rubrics, and diagnostic analytics.',
                  icon: '🧑‍🏫',
                },
              ].map((p) => {
                const isSelected = persona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      onPersonaChange(p.id);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{p.icon}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{p.title}</div>
                      <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{p.badge}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assessment Timing & Challenge Mode */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Challenge Mode Countdown</span>
              </label>
              {isChallengeMode && (
                <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-500" />
                  <span>Up to 2.5x Speed XP</span>
                </span>
              )}
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              isChallengeMode
                ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isChallengeMode ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Per-Question Timed Countdown
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enforces quick recall drills and awards speed multipliers.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !isChallengeMode;
                    if (next) soundFx.playSpeedBonus();
                    else soundFx.playClick();
                    onUpdateAssessmentConfig({ challengeMode: next });
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    isChallengeMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
                </button>
              </div>

              {isChallengeMode && (
                <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                    <span>Countdown per Question:</span>
                    <span className="font-mono font-extrabold">{challengeTimer} seconds</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[10, 15, 20, 30].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          soundFx.playSelect();
                          onUpdateAssessmentConfig({ challengeTimerSeconds: s });
                        }}
                        className={`py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                          challengeTimer === s
                            ? 'border-amber-500 bg-amber-500 text-white font-extrabold'
                            : 'border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Timing & Question Shuffling */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Exam & Feedback Timing
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  onUpdateAssessmentConfig({ feedbackTiming: 'instant' });
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  assessmentConfig.feedbackTiming === 'instant'
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850'
                }`}
              >
                <div className="text-xs font-black">⚡ Instant Feedback Mode</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Shows explanations immediately after answering each question.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  onUpdateAssessmentConfig({ feedbackTiming: 'deferred' });
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  assessmentConfig.feedbackTiming === 'deferred'
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850'
                }`}
              >
                <div className="text-xs font-black">📋 Strict Exam Simulation</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Withholds answers and scores until the complete quiz is submitted.
                </div>
              </button>
            </div>

            {/* Quiz Time Range System Card */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>Quiz Time Range Window (Min – Max Target Range)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Set a minimum target pace and maximum auto-submit cutoff. Finishing inside the range awards bonus XP & Coins!
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    const next = !assessmentConfig.timerRangeEnabled;
                    onUpdateAssessmentConfig({
                      timerRangeEnabled: next,
                      minTimeMinutes: assessmentConfig.minTimeMinutes ?? 2,
                      maxTimeMinutes: assessmentConfig.maxTimeMinutes ?? 10,
                      timeLimitMinutes: next ? (assessmentConfig.maxTimeMinutes ?? 10) : 0,
                    });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-colors ${
                    assessmentConfig.timerRangeEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {assessmentConfig.timerRangeEnabled ? 'Time Range: ON' : 'Time Range: OFF'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'untimed', label: 'No Time Range', sub: 'Relaxed pace', min: 0, max: 0 },
                  { id: 'blitz_1_3', label: '⚡ Blitz Range', sub: '1 – 3 mins (+30% XP)', min: 1, max: 3 },
                  { id: 'standard_3_10', label: '🎯 Gold Range', sub: '3 – 10 mins (+35% XP)', min: 3, max: 10 },
                  { id: 'exam_10_25', label: '🏛️ Exam Window', sub: '10 – 25 mins', min: 10, max: 25 },
                ].map((preset) => {
                  const isSelected =
                    preset.id === 'untimed'
                      ? !assessmentConfig.timerRangeEnabled && assessmentConfig.timeLimitMinutes === 0
                      : assessmentConfig.timerRangeEnabled &&
                        assessmentConfig.minTimeMinutes === preset.min &&
                        assessmentConfig.maxTimeMinutes === preset.max;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        if (preset.id === 'untimed') {
                          onUpdateAssessmentConfig({
                            timerRangeEnabled: false,
                            timeLimitMinutes: 0,
                            timerRangePreset: 'untimed',
                          });
                        } else {
                          onUpdateAssessmentConfig({
                            timerRangeEnabled: true,
                            minTimeMinutes: preset.min,
                            maxTimeMinutes: preset.max,
                            timeLimitMinutes: preset.max,
                            timerRangePreset: preset.id as any,
                          });
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="text-xs font-black text-slate-900 dark:text-white">{preset.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{preset.sub}</div>
                    </button>
                  );
                })}
              </div>

              {assessmentConfig.timerRangeEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Minimum Target Time</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {assessmentConfig.minTimeMinutes ?? 2} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={assessmentConfig.minTimeMinutes ?? 2}
                      onChange={(e) => {
                        const minVal = Number(e.target.value);
                        const maxVal = Math.max(minVal + 1, assessmentConfig.maxTimeMinutes ?? 10);
                        onUpdateAssessmentConfig({
                          minTimeMinutes: minVal,
                          maxTimeMinutes: maxVal,
                          timeLimitMinutes: maxVal,
                          timerRangePreset: 'custom_range',
                        });
                      }}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Maximum Cutoff Time</span>
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                        {assessmentConfig.maxTimeMinutes ?? 10} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="60"
                      value={assessmentConfig.maxTimeMinutes ?? 10}
                      onChange={(e) => {
                        const maxVal = Number(e.target.value);
                        const minVal = Math.min(maxVal - 1, assessmentConfig.minTimeMinutes ?? 2);
                        onUpdateAssessmentConfig({
                          minTimeMinutes: Math.max(1, minVal),
                          maxTimeMinutes: maxVal,
                          timeLimitMinutes: maxVal,
                          timerRangePreset: 'custom_range',
                        });
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Particle FX, Graphics Mode & RTX Studio */}
      {activeSection === 'accessibility' && (
        <div className="space-y-5">
          {/* Graphics Quality Mode & RTX Ray-Tracing Deck */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs">
                    RTX GRAPHICS ENGINE
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Graphics Quality Mode & RTX Features
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Switch between Simple, Medium, 120Hz Performance, and Ultra RTX Mode with real-time ray-traced lighting.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setFpsCounterEnabled(!fpsCounterEnabled);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    fpsCounterEnabled
                      ? 'bg-slate-900 text-emerald-400 border-emerald-500/50'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {fpsCounterEnabled ? '🟢 FPS HUD: ON' : 'FPS HUD: OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    const next = !rtxEnabled;
                    setRtxEnabled(next);
                    if (next && graphicsMode === 'simple') {
                      setGraphicsMode('ultra');
                    }
                    triggerSaveNotice(next ? 'RTX Shaders & Dynamic Illumination Enabled!' : 'RTX Shaders Disabled.');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    rtxEnabled && graphicsMode !== 'simple'
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {rtxEnabled && graphicsMode !== 'simple' ? '💎 RTX: ON' : 'RTX: OFF'}
                </button>
              </div>
            </div>

            {/* 4 Graphics Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {GRAPHICS_MODE_CATALOG.map((gm) => {
                const isSelected = graphicsMode === gm.id;
                return (
                  <button
                    key={gm.id}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setGraphicsMode(gm.id);
                      triggerSaveNotice(`Graphics Mode set to ${gm.name}`);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? gm.id === 'ultra'
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/25'
                          : 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/25'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{gm.icon}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            gm.id === 'ultra'
                              ? 'bg-emerald-500 text-white'
                              : isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {gm.badge}
                        </span>
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{gm.name}</div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {gm.tagline}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      {gm.specs.map((sp) => (
                        <span
                          key={sp}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Individual RTX Feature Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {[
                {
                  id: 'gi',
                  title: 'RTX Ray-Traced Cursor Light',
                  desc: 'Dynamic real-time specular illumination & caustic light tracking your cursor',
                  active: rtxGlobalIllumination,
                  toggle: () => setRtxGlobalIllumination(!rtxGlobalIllumination),
                },
                {
                  id: 'refl',
                  title: 'RTX Specular Glass Reflections',
                  desc: 'Prismatic top-edge rim reflections and multi-layered frosted depth on cards',
                  active: rtxReflections,
                  toggle: () => setRtxReflections(!rtxReflections),
                },
                {
                  id: 'bloom',
                  title: 'RTX Volumetric God-Rays & Bloom',
                  desc: 'Atmospheric light shafts and vibrant neon bloom halos across badges and buttons',
                  active: rtxVolumetricBloom,
                  toggle: () => setRtxVolumetricBloom(!rtxVolumetricBloom),
                },
              ].map((feat) => (
                <div
                  key={feat.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    rtxEnabled && graphicsMode !== 'simple' && feat.active
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/25'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                  }`}
                >
                  <div className="pr-2">
                    <div className="text-xs font-black text-slate-900 dark:text-white">{feat.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {feat.desc}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      if (!rtxEnabled) setRtxEnabled(true);
                      if (graphicsMode === 'simple') setGraphicsMode('ultra');
                      feat.toggle();
                    }}
                    className={`w-11 h-6 shrink-0 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      rtxEnabled && graphicsMode !== 'simple' && feat.active
                        ? 'bg-emerald-500 justify-end'
                        : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Interactive Particle Visual Effects Studio */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Interactive Particle Visual Effects</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Customize ambient & interactive background particles, or remove them completely anytime.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !particlesEnabled;
                  soundFx.playClick();
                  setParticlesEnabled(next);
                  triggerSaveNotice(
                    next
                      ? 'Particle visual effects enabled!'
                      : 'Particle visual effects removed.'
                  );
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  particlesEnabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {particlesEnabled ? 'Active (Remove FX)' : 'Removed (Enable FX)'}
              </button>
            </div>

            {/* Particle Style Presets */}
            <div className={`space-y-2.5 transition-opacity ${particlesEnabled ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Particle Visual Style (6 Themes)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PARTICLE_PRESET_CATALOG.map((p) => {
                  const isSelected = particlePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setParticlePreset(p.id);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                          {p.badge}
                        </span>
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                        {p.tagline}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Density & Speed Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Particle Count Density
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['low', 'medium', 'high'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setParticleDensity(d);
                        }}
                        className={`py-1.5 rounded-xl text-[11px] font-bold capitalize cursor-pointer ${
                          particleDensity === d
                            ? 'bg-indigo-600 text-white font-black'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Particle Drift Speed
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['slow', 'normal', 'fast'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setParticleSpeed(s);
                        }}
                        className={`py-1.5 rounded-xl text-[11px] font-bold capitalize cursor-pointer ${
                          particleSpeed === s
                            ? 'bg-indigo-600 text-white font-black'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Cursor Repulsion & Click Burst */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Interactive Cursor Physics & Click Bursts
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Particles gently part around your cursor and burst when you click anywhere
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setParticleInteractive(!particleInteractive);
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    particleInteractive ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
                </button>
              </div>
            </div>

            {/* Ambient Glow Orbs Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Ambient Color Aura Orbs
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Soft gradient light halos in the background workspace
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAmbientOrbsEnabled(!ambientOrbsEnabled);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  ambientOrbsEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Advanced Study Features, Eye Comfort & Accessibility */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Advanced Cognitive, Eye Comfort & Motion Controls
            </h3>

            {/* Night Study Eye Comfort Warmth Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Night Study Eye-Comfort Filter (Blue-Light Shield)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Adds a warm amber reading tint to reduce eye strain during late study sessions
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                  {eyeComfortWarmth}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={eyeComfortWarmth}
                onChange={(e) => setEyeComfortWarmth(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Adaptive Difficulty Auto-Scaling */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Smart Adaptive Difficulty Scaling
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically tunes question complexity based on your recent accuracy
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAdaptiveDifficultyEnabled(!adaptiveDifficultyEnabled);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  adaptiveDifficultyEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
              </button>
            </div>

            {/* Auto Streak Shield Protection */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Streak Freeze Auto-Shield
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Protects your daily study streak using reserve Gems if you miss a day
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setStreakShieldAutoEnabled(!streakShieldAutoEnabled);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  streakShieldAutoEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
              </button>
            </div>

            {/* High Contrast Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  High Contrast Borders & Outlines
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sharpens card borders and increases text contrast
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setHighContrast(!highContrast);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  highContrast ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
              </button>
            </div>

            {/* Confetti Celebrations */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Victory Confetti Celebrations
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Celebratory bursts on 100% scores and level-up milestones
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setConfettiEnabled(!confettiEnabled);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  confettiEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Section 5: Data, Profile & Backup */}
      {activeSection === 'data' && (
        <div className="max-w-3xl space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Profile Data & Assessment Backup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Export your accumulated XP, history records, and custom configuration as a portable JSON file.
              </p>
            </div>

            {/* Backup & Restore Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Complete Backup (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Restore Backup from File</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
            </div>

            {/* Danger Zone: Clear History & Reset Stats */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Danger Zone</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all past quiz history records?')) {
                      onUpdateHistoryRecords([]);
                      soundFx.playClick();
                      triggerSaveNotice('Quiz history cleared.');
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Past Quiz Records</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    onUpdateStats(createFreshResetStats(stats));
                    if (user?.uid) {
                      await resetAllSignedInUsersLevelsInFirestore(user.uid);
                    }
                    soundFx.playClick();
                    triggerSaveNotice('All signed-in levels & XP reset to Level 1 (0 XP)!');
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Level & Stats to Level 1</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
