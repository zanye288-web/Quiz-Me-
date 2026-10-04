import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ArrowRight,
  Coins,
  Lock,
  Sparkles,
  Download,
  Monitor,
  UserCheck,
  Palette,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/audio';
import { PersonaType, UserStats } from '../types/quiz';
import {
  MascotAvatar,
  MASCOT_CATALOG,
  MASCOT_ACCESSORY_CATALOG,
  MASCOT_THEME_CATALOG,
  useMascotPreferences,
  getMascotIconDataUrl,
  downloadCustomMascotDesktopIcon,
} from './MascotAvatar';

interface ProfileCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOptionalOnboarding?: boolean;
  stats?: UserStats;
}

export const SCHOLAR_AVATARS = [
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'brain', emoji: '🧠', label: 'Brain' },
  { id: 'atom', emoji: '⚛️', label: 'Atom' },
  { id: 'dna', emoji: '🧬', label: 'DNA' },
  { id: 'laptop', emoji: '💻', label: 'Coder' },
  { id: 'microscope', emoji: '🔬', label: 'Lab' },
  { id: 'books', emoji: '📚', label: 'Books' },
  { id: 'globe', emoji: '🌍', label: 'World' },
  { id: 'palette', emoji: '🎨', label: 'Artist' },
  { id: 'crown', emoji: '👑', label: 'Royal' },
  { id: 'lightning', emoji: '⚡', label: 'Spark' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'astronaut', emoji: '🧑‍🚀', label: 'Astro' },
  { id: 'wizard', emoji: '🧙', label: 'Mage' },
];

export const AVATAR_BG_GRADIENTS = [
  {
    id: 'from-indigo-500 to-violet-600 text-white',
    name: 'Indigo',
    gradient: 'from-indigo-500 to-violet-600',
    border: 'border-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'from-emerald-500 to-teal-600 text-white',
    name: 'Emerald',
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'from-amber-500 to-orange-600 text-white',
    name: 'Amber',
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'from-rose-500 to-pink-600 text-white',
    name: 'Rose',
    gradient: 'from-rose-500 to-pink-600',
    border: 'border-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'from-sky-500 to-blue-600 text-white',
    name: 'Sky',
    gradient: 'from-sky-500 to-blue-600',
    border: 'border-sky-500',
    text: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'from-purple-500 to-fuchsia-600 text-white',
    name: 'Fuchsia',
    gradient: 'from-purple-500 to-fuchsia-600',
    border: 'border-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
  },
];

const HEADLINE_SUGGESTIONS = [
  'Computer Science Student',
  'Pre-Med Learner',
  'High School Honors',
  'AP History Buff',
  'Full-Stack Developer',
  'Science Teacher',
];

const GOAL_SUGGESTIONS = [
  'Ace upcoming exams',
  'Keep a 14-day study streak',
  'Score 100% to earn Mascot Coins',
  'Learn 1 new topic every day',
];

export const ProfileCustomizationModal: React.FC<ProfileCustomizationModalProps> = ({
  isOpen,
  onClose,
  isOptionalOnboarding = false,
  stats,
}) => {
  const { user, userProfile, updateUserProfileInCloud } = useAuth();
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

  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [avatarType, setAvatarType] = useState<'google' | 'icon' | 'custom' | 'mascot'>('mascot');
  const [avatarIcon, setAvatarIcon] = useState('🦉');
  const [avatarBg, setAvatarBg] = useState(AVATAR_BG_GRADIENTS[0].id);
  const [role, setRole] = useState<PersonaType>('Student');
  const [isSaving, setIsSaving] = useState(false);
  const [shopFeedback, setShopFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(userProfile?.displayName || user?.displayName || 'Scholar');
      setHeadline(userProfile?.headline || 'Lifelong Learner');
      setBio(userProfile?.bio || 'Learning something new every day!');
      setLearningGoal(userProfile?.learningGoal || 'Ace upcoming quizzes');
      setAvatarType(
        userProfile?.avatarType || (user?.photoURL ? 'google' : 'mascot')
      );
      setAvatarIcon(userProfile?.avatarIcon || '🦉');
      setAvatarBg(userProfile?.avatarBg || AVATAR_BG_GRADIENTS[0].id);
      setRole(userProfile?.role || 'Student');
      setShopFeedback(null);
    }
  }, [isOpen, user, userProfile]);

  if (!isOpen) return null;

  const currentGradient =
    AVATAR_BG_GRADIENTS.find((g) => g.id === avatarBg) || AVATAR_BG_GRADIENTS[0];

  const customIconPreviewUrl = getMascotIconDataUrl(mascotCharacter, mascotTheme, mascotAccessory);

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setShopFeedback({ type, text });
    setTimeout(() => setShopFeedback(null), 3500);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      soundFx.playCorrect();

      await updateUserProfileInCloud({
        displayName: displayName.trim() || user?.displayName || 'Scholar',
        headline: headline.trim() || 'Scholar',
        bio: bio.trim(),
        learningGoal: learningGoal.trim(),
        avatarType,
        avatarIcon,
        avatarBg,
        mascotCharacter,
        mascotTheme,
        equippedAccessory: mascotAccessory,
        unlockedMascots,
        unlockedAccessories,
        coins: mascotCoins,
        role,
        hasCustomizedProfile: true,
      });

      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    soundFx.playClick();
    if (isOptionalOnboarding) {
      try {
        await updateUserProfileInCloud({
          hasCustomizedProfile: true,
        });
      } catch (err) {
        console.error('Error recording skipped onboarding:', err);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 my-8 text-slate-900 dark:text-slate-100 transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                {isOptionalOnboarding ? 'Welcome Setup • Optional' : 'Profile & Mascot Studio'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                {mascotCoins} Mascot Coins
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {isOptionalOnboarding ? 'Personalize Your Profile & Mascot' : 'Customize Profile & Mascot'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Set your mascot as your profile picture, unlock accessories with Mascot Coins, and personalize your website & desktop icon!
            </p>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Profile Card Preview Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-850 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarType === 'mascot' ? (
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentGradient.gradient} flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 overflow-hidden p-1`}
                >
                  <MascotAvatar
                    character={mascotCharacter}
                    theme={mascotTheme}
                    accessory={mascotAccessory}
                    size="md"
                    interactive={false}
                  />
                </div>
              ) : avatarType === 'google' && user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentGradient.gradient} flex items-center justify-center text-3xl shadow-md border-2 border-white dark:border-slate-800`}
                >
                  <span>{avatarIcon}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 text-[10px] font-black shadow-xs">
                Lv.{stats?.level || userProfile?.level || 1}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {displayName || 'Scholar'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  {role}
                </span>
                {avatarType === 'mascot' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Mascot Profile Active
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                {headline || 'Scholar'}
              </p>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                {currentMascotMeta.title} ({currentMascotMeta.uniquePose}) • {currentAccessoryMeta.name}
              </p>
            </div>
          </div>

          {avatarType !== 'mascot' && (
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setAvatarType('mascot');
                showNotice('ok', 'Your customized mascot is now set as your profile picture!');
              }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-sm cursor-pointer transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Use Mascot as Profile Picture</span>
            </button>
          )}
        </div>

        {/* Customization Form */}
        <div className="mt-5 space-y-5">
          {/* Avatar Identity Mode Tabs */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Profile Picture Mode
              </label>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setAvatarType('mascot');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    avatarType === 'mascot'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  My Mascot
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setAvatarType('icon');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    avatarType === 'icon'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Emoji Badge
                </button>
                {user?.photoURL && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAvatarType('google');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      avatarType === 'google'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Google Photo
                  </button>
                )}
              </div>
            </div>

            {shopFeedback && (
              <div
                className={`mb-3 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  shopFeedback.type === 'ok'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{shopFeedback.text}</span>
              </div>
            )}

            {avatarType === 'mascot' && (
              <div className="space-y-4 p-4 rounded-2xl border border-indigo-200/70 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-slate-800/40">
                {/* How to Earn Challenging Mascot Coins Banner */}
                <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>Mascot Coin Vault: {mascotCoins} Coins</span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      Earned only through high mastery: <strong>80%+ quiz = +2 Coins</strong>, <strong>90%+ = +4 Coins</strong>, <strong>100% Perfect = +8 Coins</strong>!
                    </p>
                  </div>
                </div>

                {/* 1. Choose or Unlock Mascot (All 10 have a Unique Pose) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <span>1. Choose Mascot (Each Has a Unique Pose)</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      Pose: {currentMascotMeta.uniquePose}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {MASCOT_CATALOG.map((m) => {
                      const isUnlocked = unlockedMascots.includes(m.id);
                      const isSelected = mascotCharacter === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            const res = purchaseMascot(m.id);
                            if (res.success) {
                              soundFx.playPop();
                              showNotice('ok', res.message);
                            } else {
                              soundFx.playClick();
                              showNotice('err', res.message);
                            }
                          }}
                          className={`flex flex-col items-center p-2 rounded-2xl border text-center transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-indigo-500 bg-white dark:bg-slate-800 ring-2 ring-indigo-500/20 shadow-xs'
                              : isUnlocked
                              ? 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 hover:border-indigo-300'
                              : 'border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-slate-900/40 opacity-90 hover:opacity-100'
                          }`}
                        >
                          <MascotAvatar
                            character={m.id}
                            theme={isSelected ? mascotTheme : m.defaultTheme}
                            accessory={isSelected ? mascotAccessory : m.defaultAccessory || 'none'}
                            size="xs"
                            interactive={false}
                          />
                          <span className="text-[11px] font-black text-slate-900 dark:text-white mt-1 truncate max-w-full">
                            {m.name}
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-full">
                            {m.uniquePose}
                          </span>
                          {!isUnlocked ? (
                            <span className="mt-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              <Lock className="w-2.5 h-2.5" />
                              {m.costCoins}c
                            </span>
                          ) : (
                            <span className="mt-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              {isSelected ? 'Active' : 'Owned'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Mascot Accessories Shop */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <span>2. Mascot Accessories (Buy with Mascot Coins)</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      Equipped: {currentAccessoryMeta.name}
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
                              showNotice('ok', res.message);
                            } else {
                              soundFx.playClick();
                              showNotice('err', res.message);
                            }
                          }}
                          className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-white dark:bg-slate-800 ring-2 ring-indigo-500/20 shadow-xs'
                              : isUnlocked
                              ? 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 hover:border-indigo-300'
                              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-amber-400'
                          }`}
                        >
                          <div className="w-full flex items-center justify-between">
                            <span className="text-base">{acc.previewEmoji}</span>
                            {!isUnlocked ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                <Coins className="w-2.5 h-2.5 text-amber-500" />
                                {acc.costCoins}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                {isSelected ? 'Equipped' : 'Owned'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white mt-1 truncate max-w-full">
                            {acc.name}
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {acc.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Mascot Color Aura & Personalized Website/Desktop Icon Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-500" />
                      Mascot Color Aura & Profile Ring:
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
                          className={`flex-1 h-7 rounded-xl ${t.swatchClass} transition-transform cursor-pointer ${
                            mascotTheme === t.id
                              ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105'
                              : 'opacity-75 hover:opacity-100'
                          }`}
                          title={t.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Live Website Favicon & Desktop App Icon Sync Card */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={customIconPreviewUrl}
                        alt="Custom App Icon"
                        className="w-10 h-10 rounded-xl shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[11px] font-black text-slate-900 dark:text-white">
                          <Monitor className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">Website & Desktop Icon</span>
                        </div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                          Synced live to your browser tab!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        downloadCustomMascotDesktopIcon(mascotCharacter, mascotTheme, mascotAccessory);
                      }}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                      title="Download 512x512 Desktop Icon (.png)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {avatarType === 'icon' && (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mb-3">
                  {SCHOLAR_AVATARS.map((av) => {
                    const isSelected = avatarIcon === av.emoji;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setAvatarIcon(av.emoji);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer border ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 scale-105 shadow-2xs'
                            : 'border-transparent hover:bg-white dark:hover:bg-slate-800'
                        }`}
                        title={av.label}
                      >
                        <span className="text-2xl">{av.emoji}</span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-full mt-0.5">
                          {av.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Avatar Background Color:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_BG_GRADIENTS.map((g) => {
                      const isSelected = avatarBg === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setAvatarBg(g.id);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? `${g.border} bg-white dark:bg-slate-800 ${g.text} shadow-xs`
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${g.gradient}`}
                          />
                          <span>{g.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {avatarType === 'google' && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <img
                  src={user?.photoURL || ''}
                  alt="Google Profile"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Linked to Google Profile Photo
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Or switch to &ldquo;My Mascot&rdquo; above to use your customized mascot as your profile picture!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Display Name & Headline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={36}
                placeholder="e.g. Alex Chen"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Title or Field
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={50}
                placeholder="e.g. Computer Science Student"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5">
            {HEADLINE_SUGGESTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setHeadline(tag);
                }}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* Study Goal & Bio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Main Study Goal
              </label>
              <input
                type="text"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                maxLength={60}
                placeholder="e.g. Ace semester finals"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {GOAL_SUGGESTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setLearningGoal(g);
                    }}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    + {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Short Bio / Motto
                </label>
                <span className="text-[11px] text-slate-400">{bio.length}/160</span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                placeholder="Write a brief personal intro or study motto..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Role Preference */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setRole('Student');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === 'Student'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Student / Learner</span>
                  {role === 'Student' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Quizzes, flashcards, live games, and earning Mascot Coins.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setRole('Teacher');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === 'Teacher'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Teacher / Host</span>
                  {role === 'Teacher' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Create quizzes, print worksheets, and host live battles.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isOptionalOnboarding ? (
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-center"
            >
              Skip for now
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xs shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 transition-all cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <span>Saving Profile...</span>
            ) : (
              <>
                <span>{isOptionalOnboarding ? 'Save & Start Learning' : 'Save Profile Changes'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
