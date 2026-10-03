import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  User,
  GraduationCap,
  Award,
  BookOpen,
  Target,
  Palette,
  Image as ImageIcon,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PersonaType, UserStats } from '../types/quiz';
import { soundFx } from '../utils/audio';

export const SCHOLAR_AVATARS = [
  { id: 'scholar', emoji: '🎓', label: 'Scholar' },
  { id: 'prodigy', emoji: '⚡', label: 'Prodigy' },
  { id: 'sage', emoji: '🦉', label: 'Sage' },
  { id: 'innovator', emoji: '🚀', label: 'Innovator' },
  { id: 'researcher', emoji: '🧪', label: 'Researcher' },
  { id: 'creative', emoji: '🎨', label: 'Creator' },
  { id: 'biologist', emoji: '🧬', label: 'Biologist' },
  { id: 'engineer', emoji: '💻', label: 'Engineer' },
  { id: 'cosmologist', emoji: '🌌', label: 'Astrophysicist' },
  { id: 'champion', emoji: '🦁', label: 'Champion' },
  { id: 'historian', emoji: '📚', label: 'Historian' },
  { id: 'medic', emoji: '🩺', label: 'Medic' },
  { id: 'ai', emoji: '🤖', label: 'AI Pioneer' },
  { id: 'explorer', emoji: '🧭', label: 'Explorer' },
  { id: 'strategist', emoji: '🎯', label: 'Strategist' },
  { id: 'philosopher', emoji: '🏛️', label: 'Philosopher' },
];

export const AVATAR_BG_GRADIENTS = [
  { id: 'indigo', name: 'Indigo Aura', gradient: 'from-indigo-600 to-violet-700', border: 'border-indigo-500', text: 'text-indigo-600' },
  { id: 'purple', name: 'Cosmic Violet', gradient: 'from-purple-600 to-pink-700', border: 'border-purple-500', text: 'text-purple-600' },
  { id: 'emerald', name: 'Emerald Jade', gradient: 'from-emerald-600 to-teal-700', border: 'border-emerald-500', text: 'text-emerald-600' },
  { id: 'amber', name: 'Solar Amber', gradient: 'from-amber-500 to-orange-600', border: 'border-amber-500', text: 'text-amber-600' },
  { id: 'rose', name: 'Crimson Rose', gradient: 'from-rose-600 to-pink-600', border: 'border-rose-500', text: 'text-rose-600' },
  { id: 'cyan', name: 'Ocean Cyan', gradient: 'from-cyan-600 to-blue-600', border: 'border-cyan-500', text: 'text-cyan-600' },
];

const HEADLINE_SUGGESTIONS = [
  'Computer Science Undergrad',
  'Pre-Med Sophomore',
  'High School AP Scholar',
  'Engineering Student',
  'Lifelong Learner',
  'Educator & Mentor',
];

const GOAL_SUGGESTIONS = [
  'Ace upcoming semester exams',
  'Master technical interview questions',
  'Daily trivia and knowledge retention',
  'Explore diverse sciences & tech',
];

interface ProfileCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOptionalOnboarding?: boolean;
  stats?: UserStats;
}

export const ProfileCustomizationModal: React.FC<ProfileCustomizationModalProps> = ({
  isOpen,
  onClose,
  isOptionalOnboarding = false,
  stats,
}) => {
  const { user, userProfile, updateUserProfileInCloud } = useAuth();

  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || user?.displayName || 'Scholar'
  );
  const [headline, setHeadline] = useState(
    userProfile?.headline || 'Lifelong Learner'
  );
  const [bio, setBio] = useState(
    userProfile?.bio || 'Curious mind exploring knowledge across disciplines.'
  );
  const [learningGoal, setLearningGoal] = useState(
    userProfile?.learningGoal || 'Master core concepts and daily recall.'
  );
  const [avatarType, setAvatarType] = useState<'google' | 'icon'>(
    userProfile?.avatarType || (user?.photoURL ? 'google' : 'icon')
  );
  const [avatarIcon, setAvatarIcon] = useState(userProfile?.avatarIcon || '🎓');
  const [avatarBg, setAvatarBg] = useState(userProfile?.avatarBg || 'indigo');
  const [role, setRole] = useState<PersonaType>(userProfile?.role || 'Student');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const currentGradient =
    AVATAR_BG_GRADIENTS.find((g) => g.id === avatarBg) || AVATAR_BG_GRADIENTS[0];

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
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8 text-slate-900 dark:text-slate-100 transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                {isOptionalOnboarding ? 'Welcome Setup • Optional' : 'Scholar Profile Settings'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {isOptionalOnboarding ? 'Personalize Your Profile' : 'Customize Scholar Identity'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isOptionalOnboarding
                ? 'Customizing is completely optional! You can set your name, avatar, and study goals now or skip.'
                : 'Update your display avatar, title, and study targets for leaderboards and scorecards.'}
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
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-850 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative">
            {avatarType === 'google' && user?.photoURL ? (
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

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {displayName || 'Scholar'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                {role}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 truncate">
              {headline || 'Scholar'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">
              &ldquo;{bio || 'Ready to learn.'}&rdquo;
            </p>
          </div>
        </div>

        {/* Customization Form */}
        <div className="mt-6 space-y-6">
          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Scholar Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={36}
              placeholder="e.g. Alex Chen"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Choose Avatar Identity
              </label>
              {user?.photoURL && (
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAvatarType('google');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      avatarType === 'google'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Google Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAvatarType('icon');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      avatarType === 'icon'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Scholar Emojis
                  </button>
                </div>
              )}
            </div>

            {avatarType === 'icon' ? (
              <>
                {/* Emoji Grid */}
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

                {/* Aura / Gradient Palette */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Avatar Aura Color:
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
            ) : (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <img
                  src={user?.photoURL || ''}
                  alt="Google Profile"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Linked to Google Profile
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Your avatar updates automatically whenever your Google Account photo changes.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Academic Headline / Specialization */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Academic Headline or Field
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={50}
              placeholder="e.g. Computer Science Major"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            />
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
          </div>

          {/* Study Goal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Primary Learning Goal
            </label>
            <input
              type="text"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              maxLength={60}
              placeholder="e.g. Ace semester finals"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {GOAL_SUGGESTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setLearningGoal(g);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  + {g}
                </button>
              ))}
            </div>
          </div>

          {/* Bio / Motto */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Short Bio / Study Motto
              </label>
              <span className="text-[11px] text-slate-400">{bio.length}/160</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={2}
              placeholder="Write a brief personal intro or study motto..."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Role Preference */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Preferred Learning Persona
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Focus on quizzes, practice, gamified XP, and diagnostic review.
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
                  <span>Teacher / Instructor</span>
                  {role === 'Teacher' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Focus on exam creation, Bloom taxonomy design, and rubrics.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
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
