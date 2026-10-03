import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/audio';

export type MascotMood = 'idle' | 'happy' | 'streak' | 'thinking' | 'comforting' | 'teacher';
export type MascotTheme = 'indigo' | 'emerald' | 'amber' | 'cyan' | 'violet' | 'rose';
export type MascotCharacterId = 'kitsune' | 'axolotl' | 'astronaut' | 'redpanda' | 'dragon';

export interface MascotCharacterMeta {
  id: MascotCharacterId;
  name: string;
  title: string;
  species: string;
  tagline: string;
  defaultTheme: MascotTheme;
  greeting: string;
  particles: string[];
}

export const MASCOT_CATALOG: MascotCharacterMeta[] = [
  {
    id: 'kitsune',
    name: 'Kiko',
    title: 'Kiko the Star Kitsune',
    species: 'Celestial Origami Fox',
    tagline: 'Clever cosmic fox with a glowing insight star-gem and aurora tail.',
    defaultTheme: 'indigo',
    greeting: 'Spark on! Ready to outsmart today’s toughest questions?',
    particles: ['✨', '🦊', '⭐', '💡', '🌟', '🔥'],
  },
  {
    id: 'axolotl',
    name: 'Axo',
    title: 'Axo the Crystal Axolotl',
    species: 'Bioluminescent Amphibian',
    tagline: 'Playful deep-sea scholar with glowing pearl gill fronds and crystal scales.',
    defaultTheme: 'cyan',
    greeting: 'Bloop bloop! Let’s dive deep into new concepts together!',
    particles: ['🫧', '✨', '💎', '🌊', '💡', '🌟'],
  },
  {
    id: 'astronaut',
    name: 'Nova-9',
    title: 'Nova-9 the Astro-Bot',
    species: 'Holographic Space Droid',
    tagline: 'Levitating AI probe with magnetic hover-fins and an LED visor.',
    defaultTheme: 'violet',
    greeting: 'Systems online! Scanning knowledge galaxies at warp speed!',
    particles: ['🚀', '⚡', '🪐', '✨', '💡', '🌟'],
  },
  {
    id: 'redpanda',
    name: 'Bonsai',
    title: 'Bonsai the Red Panda',
    species: 'Zen Mountain Red Panda',
    tagline: 'Cozy, focused scholar with a fluffy ringed tail and warm curiosity.',
    defaultTheme: 'amber',
    greeting: 'Yip yip! Calm focus and steady practice win every exam!',
    particles: ['🎋', '✨', '⭐', '🐾', '💡', '🌟'],
  },
  {
    id: 'dragon',
    name: 'Draco',
    title: 'Draco the Nebula Dragon',
    species: 'Pocket Constellation Dragon',
    tagline: 'Friendly stardust dragon with crystalline horns and nebula wings.',
    defaultTheme: 'rose',
    greeting: 'Roar-spark! Let’s ignite your curiosity and conquer the leaderboard!',
    particles: ['🐉', '🔥', '✨', '💎', '⚡', '🌟'],
  },
];

export const MASCOT_THEME_CATALOG: { id: MascotTheme; label: string; swatchClass: string; hex: string }[] = [
  { id: 'indigo', label: 'Starlight Indigo', swatchClass: 'bg-indigo-500', hex: '#6366F1' },
  { id: 'cyan', label: 'Bioluminescent Cyan', swatchClass: 'bg-sky-500', hex: '#0EA5E9' },
  { id: 'amber', label: 'Solar Amber', swatchClass: 'bg-amber-500', hex: '#F59E0B' },
  { id: 'violet', label: 'Nebula Violet', swatchClass: 'bg-purple-500', hex: '#A855F7' },
  { id: 'rose', label: 'Crimson Rose', swatchClass: 'bg-rose-500', hex: '#F43F5E' },
  { id: 'emerald', label: 'Jade Mint', swatchClass: 'bg-emerald-500', hex: '#10B981' },
];

const MASCOT_CHARACTER_STORAGE_KEY = 'quizme_mascot_character_v1';
const MASCOT_THEME_STORAGE_KEY = 'quizzie_theme';
const MASCOT_SYNC_EVENT = 'quizme_mascot_updated';

export function getSavedMascotCharacter(): MascotCharacterId {
  if (typeof window === 'undefined') return 'kitsune';
  const saved = localStorage.getItem(MASCOT_CHARACTER_STORAGE_KEY) as MascotCharacterId;
  if (MASCOT_CATALOG.some((m) => m.id === saved)) return saved;
  return 'kitsune';
}

export function getSavedMascotTheme(): MascotTheme {
  if (typeof window === 'undefined') return 'indigo';
  const saved = localStorage.getItem(MASCOT_THEME_STORAGE_KEY) as MascotTheme;
  if (MASCOT_THEME_CATALOG.some((t) => t.id === saved)) return saved;
  return 'indigo';
}

export function setGlobalMascotCharacter(character: MascotCharacterId, autoMatchTheme = false) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MASCOT_CHARACTER_STORAGE_KEY, character);
  if (autoMatchTheme) {
    const found = MASCOT_CATALOG.find((m) => m.id === character);
    if (found) {
      localStorage.setItem(MASCOT_THEME_STORAGE_KEY, found.defaultTheme);
    }
  }
  window.dispatchEvent(new CustomEvent(MASCOT_SYNC_EVENT));
}

export function setGlobalMascotTheme(theme: MascotTheme) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MASCOT_THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent(MASCOT_SYNC_EVENT));
}

export function useMascotPreferences() {
  const [mascotCharacter, setCharacterState] = useState<MascotCharacterId>(getSavedMascotCharacter);
  const [mascotTheme, setThemeState] = useState<MascotTheme>(getSavedMascotTheme);

  useEffect(() => {
    const handleSync = () => {
      setCharacterState(getSavedMascotCharacter());
      setThemeState(getSavedMascotTheme());
    };
    window.addEventListener(MASCOT_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(MASCOT_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const currentMascotMeta =
    MASCOT_CATALOG.find((m) => m.id === mascotCharacter) || MASCOT_CATALOG[0];

  return {
    mascotCharacter,
    mascotTheme,
    currentMascotMeta,
    setMascotCharacter: (char: MascotCharacterId, autoMatchTheme = false) =>
      setGlobalMascotCharacter(char, autoMatchTheme),
    setMascotTheme: (theme: MascotTheme) => setGlobalMascotTheme(theme),
  };
}

export interface MascotAvatarProps {
  mood?: MascotMood;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
  interactive?: boolean;
  theme?: MascotTheme;
  character?: MascotCharacterId;
  onClick?: () => void;
  showHoverTip?: boolean;
}

const SCHOLAR_WISDOMS = [
  'Small daily steps build massive long-term mastery!',
  'Mistakes aren’t failures — they are neural upgrades!',
  'Take a deep breath. You know more than you think!',
  'Curiosity is your superpower. Keep asking why!',
  'Active recall turns short-term facts into permanent intuition!',
  'Hydrate, stretch, and conquer the next challenge!',
  'Focus on steady progress, not instant perfection!',
  'Press [M] in any quiz to speak your answer out loud!',
];

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  mood = 'idle',
  size = 'md',
  showSpeechBubble = false,
  speechText = '',
  className = '',
  interactive = true,
  theme,
  character,
  onClick,
}) => {
  const { mascotCharacter: globalCharacter, mascotTheme: globalTheme } = useMascotPreferences();
  const activeCharacter: MascotCharacterId = character || globalCharacter;
  const activeTheme: MascotTheme = theme || globalTheme;

  const characterMeta =
    MASCOT_CATALOG.find((m) => m.id === activeCharacter) || MASCOT_CATALOG[0];

  const [isWiggling, setIsWiggling] = useState(false);
  const [particles, setParticles] = useState<{ id: number; char: string; x: number; y: number }[]>([]);
  const [interactiveTip, setInteractiveTip] = useState<string | null>(null);
  const [tipTimeout, setTipTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
    '2xl': 'w-44 h-44',
  };

  // Unique SVG gradient instance ID to prevent clashes across multiple mascots on screen
  const [instanceId] = useState(() => Math.random().toString(36).substring(2, 7));
  const grad = `ms_${activeCharacter}_${mood}_${activeTheme}_${instanceId}`;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    if (!interactive) return;

    soundFx.playPop();
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);

    const particleChars = characterMeta.particles;
    const randomChar = particleChars[Math.floor(Math.random() * particleChars.length)];
    const newParticle = {
      id: Date.now(),
      char: randomChar,
      x: (Math.random() - 0.5) * 40,
      y: -20,
    };
    setParticles((prev) => [...prev.slice(-3), newParticle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1000);

    if (!speechText) {
      if (tipTimeout) clearTimeout(tipTimeout);
      const pool = [characterMeta.greeting, ...SCHOLAR_WISDOMS];
      const randomWisdom = pool[Math.floor(Math.random() * pool.length)];
      setInteractiveTip(randomWisdom);
      const timeout = setTimeout(() => {
        setInteractiveTip(null);
      }, 3500);
      setTipTimeout(timeout);
    }
  };

  useEffect(() => {
    return () => {
      if (tipTimeout) clearTimeout(tipTimeout);
    };
  }, [tipTimeout]);

  // Dynamic Theme Colors
  const themePalette = {
    indigo: {
      bodyStart: '#818CF8',
      bodyMid: '#6366F1',
      bodyEnd: '#3730A3',
      secondaryStart: '#4F46E5',
      secondaryEnd: '#1E1B4B',
      accentPop: '#FBBF24',
      accentGlow: 'from-indigo-500/35 via-violet-500/25 to-sky-400/20',
      detailStroke: '#4338CA',
    },
    cyan: {
      bodyStart: '#38BDF8',
      bodyMid: '#0EA5E9',
      bodyEnd: '#0369A1',
      secondaryStart: '#0284C7',
      secondaryEnd: '#082F49',
      accentPop: '#F472B6',
      accentGlow: 'from-sky-400/35 via-cyan-400/25 to-indigo-500/20',
      detailStroke: '#0284C7',
    },
    amber: {
      bodyStart: '#FB923C',
      bodyMid: '#EA580C',
      bodyEnd: '#9A3412',
      secondaryStart: '#C2410C',
      secondaryEnd: '#431407',
      accentPop: '#FDE047',
      accentGlow: 'from-amber-500/35 via-orange-400/25 to-yellow-300/20',
      detailStroke: '#C2410C',
    },
    violet: {
      bodyStart: '#C084FC',
      bodyMid: '#9333EA',
      bodyEnd: '#581C87',
      secondaryStart: '#7E22CE',
      secondaryEnd: '#3B0764',
      accentPop: '#38BDF8',
      accentGlow: 'from-purple-500/35 via-fuchsia-400/25 to-indigo-500/20',
      detailStroke: '#7E22CE',
    },
    rose: {
      bodyStart: '#FB7185',
      bodyMid: '#E11D48',
      bodyEnd: '#881337',
      secondaryStart: '#BE123C',
      secondaryEnd: '#4C0519',
      accentPop: '#FBBF24',
      accentGlow: 'from-rose-500/35 via-pink-500/25 to-amber-400/20',
      detailStroke: '#BE123C',
    },
    emerald: {
      bodyStart: '#34D399',
      bodyMid: '#10B981',
      bodyEnd: '#065F46',
      secondaryStart: '#059669',
      secondaryEnd: '#064E3B',
      accentPop: '#FBBF24',
      accentGlow: 'from-emerald-500/35 via-teal-400/25 to-cyan-500/20',
      detailStroke: '#059669',
    },
  }[activeTheme];

  let activePalette = themePalette;
  if (mood === 'streak') {
    activePalette = {
      ...themePalette,
      accentGlow: 'from-amber-500/45 via-orange-500/35 to-yellow-400/40',
    };
  }

  const effectiveSpeechText = speechText || (interactiveTip ?? '');
  const shouldShowBubble = showSpeechBubble || Boolean(interactiveTip);

  // Shared Eyes Renderer (adapts for standard characters vs Astro-Bot LED visor)
  const renderEyes = (isRobotVisor = false) => {
    const eyeY = isRobotVisor ? 48 : 49;
    const leftX = 43;
    const rightX = 77;

    if (mood === 'happy' || mood === 'streak') {
      return (
        <g>
          {!isRobotVisor && (
            <>
              <circle cx={leftX} cy={eyeY} r="13.5" fill="white" />
              <circle cx={rightX} cy={eyeY} r="13.5" fill="white" />
            </>
          )}
          <path
            d={`M${leftX - 8} ${eyeY + 1}C${leftX - 6} ${eyeY - 8} ${leftX + 6} ${eyeY - 8} ${leftX + 8} ${eyeY + 1}`}
            stroke={isRobotVisor ? '#38BDF8' : '#0F172A'}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path
            d={`M${rightX - 8} ${eyeY + 1}C${rightX - 6} ${eyeY - 8} ${rightX + 6} ${eyeY - 8} ${rightX + 8} ${eyeY + 1}`}
            stroke={isRobotVisor ? '#38BDF8' : '#0F172A'}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          {/* Sparkle stars */}
          <path
            d={`M${leftX} ${eyeY - 7}L${leftX + 1.5} ${eyeY - 4}L${leftX + 4.5} ${eyeY - 2.5}L${leftX + 1.5} ${eyeY - 1}L${leftX} ${eyeY + 2}L${leftX - 1.5} ${eyeY - 1}L${leftX - 4.5} ${eyeY - 2.5}L${leftX - 1.5} ${eyeY - 4}Z`}
            fill="#FBBF24"
          />
          <path
            d={`M${rightX} ${eyeY - 7}L${rightX + 1.5} ${eyeY - 4}L${rightX + 4.5} ${eyeY - 2.5}L${rightX + 1.5} ${eyeY - 1}L${rightX} ${eyeY + 2}L${rightX - 1.5} ${eyeY - 1}L${rightX - 4.5} ${eyeY - 2.5}L${rightX - 1.5} ${eyeY - 4}Z`}
            fill="#FBBF24"
          />
          {/* Rosy cheeks */}
          <ellipse cx="30" cy={eyeY + 12} rx="6" ry="3.5" fill="#FB7185" fillOpacity="0.65" />
          <ellipse cx="90" cy={eyeY + 12} rx="6" ry="3.5" fill="#FB7185" fillOpacity="0.65" />
        </g>
      );
    }

    if (mood === 'comforting') {
      return (
        <g>
          {!isRobotVisor && (
            <>
              <circle cx={leftX} cy={eyeY} r="14" fill="white" />
              <circle cx={rightX} cy={eyeY} r="14" fill="white" />
            </>
          )}
          <circle cx={leftX} cy={eyeY} r="9.5" fill={isRobotVisor ? '#38BDF8' : '#0F172A'} />
          <circle cx={rightX} cy={eyeY} r="9.5" fill={isRobotVisor ? '#38BDF8' : '#0F172A'} />
          <circle cx={leftX + 3} cy={eyeY - 3} r="3.5" fill="white" />
          <circle cx={rightX + 3} cy={eyeY - 3} r="3.5" fill="white" />
          <circle cx={leftX - 2.5} cy={eyeY + 3.5} r="1.8" fill="white" />
          <circle cx={rightX - 2.5} cy={eyeY + 3.5} r="1.8" fill="white" />
          <ellipse cx="30" cy={eyeY + 12} rx="6" ry="3.5" fill="#F472B6" fillOpacity="0.55" />
          <ellipse cx="90" cy={eyeY + 12} rx="6" ry="3.5" fill="#F472B6" fillOpacity="0.55" />
        </g>
      );
    }

    // Idle / Thinking / Teacher
    return (
      <g>
        {!isRobotVisor && (
          <>
            <circle cx={leftX} cy={eyeY} r="13.5" fill="white" />
            <circle cx={rightX} cy={eyeY} r="13.5" fill="white" />
          </>
        )}
        <circle cx={leftX} cy={eyeY} r="8.8" fill={isRobotVisor ? '#38BDF8' : `url(#${grad}_iris)`} />
        <circle cx={rightX} cy={eyeY} r="8.8" fill={isRobotVisor ? '#38BDF8' : `url(#${grad}_iris)`} />
        <circle
          cx={leftX}
          cy={eyeY}
          r="6.2"
          stroke={isRobotVisor ? '#E0F2FE' : activePalette.bodyStart}
          strokeWidth="1.2"
          opacity="0.5"
          fill="none"
        />
        <circle
          cx={rightX}
          cy={eyeY}
          r="6.2"
          stroke={isRobotVisor ? '#E0F2FE' : activePalette.bodyStart}
          strokeWidth="1.2"
          opacity="0.5"
          fill="none"
        />
        <circle cx={leftX + 3} cy={eyeY - 3} r="3.2" fill="white" />
        <circle cx={rightX + 3} cy={eyeY - 3} r="3.2" fill="white" />
        <circle cx={leftX - 2.5} cy={eyeY + 3} r="1.5" fill="white" />
        <circle cx={rightX - 2.5} cy={eyeY + 3} r="1.5" fill="white" />
      </g>
    );
  };

  // Shared Mood Accessories (Streak Flame Headband, Teacher Cap & Glasses, Thinking Monocle)
  const renderMoodAccessories = () => (
    <>
      {/* Streak Flame Headband */}
      {mood === 'streak' && (
        <g filter={`url(#${grad}_softShadow)`}>
          <rect x="25" y="26" width="70" height="8.5" rx="4.25" fill="#EF4444" />
          <rect x="25" y="26" width="70" height="2" fill="#FCA5A5" rx="1" />
          <circle cx="60" cy="30" r="6.5" fill="#18181B" />
          <path
            d="M54.5 30.5C54.5 21 60 13.5 60 13.5C60 13.5 65.5 21 65.5 30.5C65.5 33.5 63 35.5 60 35.5C57 35.5 54.5 33.5 54.5 30.5Z"
            fill="#F59E0B"
          />
          <path
            d="M56.8 30.5C56.8 24 60 18.5 60 18.5C60 18.5 63.2 24 63.2 30.5C63.2 32.5 61.8 34 60 34C58.2 34 56.8 32.5 56.8 30.5Z"
            fill="#FDE047"
          />
        </g>
      )}

      {/* Teacher Scholar Cap & Smart Glasses */}
      {mood === 'teacher' && (
        <g filter={`url(#${grad}_softShadow)`}>
          <polygon points="60,4 102,18 60,32 18,18" fill="#1E1B4B" />
          <polygon points="36,22 84,22 77,33 43,33" fill="#312E81" />
          <line x1="18" y1="18" x2="60" y2="32" stroke="#6366F1" strokeWidth="1.2" />
          <line x1="60" y1="32" x2="102" y2="18" stroke="#6366F1" strokeWidth="1.2" />
          <circle cx="60" cy="18" r="2.8" fill="#F59E0B" />
          <path d="M60 18Q78 20 93 32" stroke="#F59E0B" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="93" cy="34" r="3" fill="#F59E0B" />

          {/* Smart Glasses */}
          <circle cx="43" cy="49" r="14.5" stroke="#F59E0B" strokeWidth="2.2" fill="none" />
          <circle cx="77" cy="49" r="14.5" stroke="#F59E0B" strokeWidth="2.2" fill="none" />
          <line x1="57.5" y1="49" x2="62.5" y2="49" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}

      {/* Thinking Holographic Monocle & Spark */}
      {mood === 'thinking' && (
        <g>
          <circle cx="77" cy="49" r="15" stroke="#F59E0B" strokeWidth="2.5" fill="#FEF3C7" fillOpacity="0.18" />
          <path d="M92 49Q98 58 95 72" stroke="#F59E0B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle
            cx="77"
            cy="49"
            r="11.5"
            stroke="#F59E0B"
            strokeWidth="0.9"
            strokeDasharray="3 3"
            fill="none"
            opacity="0.75"
          />
          <g transform="translate(17, 22)">
            <circle cx="0" cy="0" r="4.5" fill="#FDE047" filter={`url(#${grad}_glow)`} />
            <path d="M0 -7V-5M0 5V7M-7 0H-5M5 0H7" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      )}
    </>
  );

  // 1. KITSUNE (Kiko the Star Kitsune - Celestial Origami Fox)
  const renderKitsune = () => (
    <>
      {/* Fluffy Sweeping Star-Tipped Fox Tail behind right side */}
      <g filter={`url(#${grad}_softShadow)`}>
        <path
          d="M84 94C106 92 117 72 113 52C109 37 97 44 95 56C93 68 86 78 78 86Z"
          fill={`url(#${grad}_body)`}
        />
        {/* Creamy White Fox Tail Tip */}
        <path
          d="M113 52C109 37 97 44 95 56C101 58 108 57 113 52Z"
          fill={`url(#${grad}_belly)`}
        />
      </g>

      {/* Tall Pointed Fox Ears with Inner Aurora Gradient */}
      <g filter={`url(#${grad}_softShadow)`}>
        {/* Left Fox Ear */}
        <path d="M24 44L14 9L45 26Z" fill={`url(#${grad}_secondary)`} />
        <path d="M26 39L19 15L40 27Z" fill={`url(#${grad}_accent)`} opacity="0.85" />
        {/* Right Fox Ear */}
        <path d="M96 44L106 9L75 26Z" fill={`url(#${grad}_secondary)`} />
        <path d="M94 39L101 15L80 27Z" fill={`url(#${grad}_accent)`} opacity="0.85" />
      </g>

      {/* Main Sculpted Fox Head & Torso */}
      <path
        d="M60 20C35 20 20 36 20 62C20 88 36 108 60 108C84 108 100 88 100 62C100 36 85 20 60 20Z"
        fill={`url(#${grad}_body)`}
        filter={`url(#${grad}_softShadow)`}
      />

      {/* Fluffy Fox Cheek Ruffs (Dual-tone side fur tufts) */}
      <path
        d="M20 56L10 62L18 70L12 76L25 81C22 72 20 64 20 56Z"
        fill={`url(#${grad}_belly)`}
      />
      <path
        d="M100 56L110 62L102 70L108 76L95 81C98 72 100 64 100 56Z"
        fill={`url(#${grad}_belly)`}
      />

      {/* Frosted White Fox Chest & Facial Mask */}
      <path
        d="M60 56C44 56 31 66 31 82C31 97 43 107 60 107C77 107 89 97 89 82C89 66 76 56 60 56Z"
        fill={`url(#${grad}_belly)`}
      />

      {/* Glowing Forehead Insight Star-Gem */}
      <polygon
        points="60,25 65,32 60,39 55,32"
        fill={`url(#${grad}_accent)`}
        stroke="white"
        strokeWidth="1"
      />

      {/* Expressive Eyes */}
      {renderEyes(false)}

      {/* Cute Fox Nose & Whiskers & Happy/Curious Mouth */}
      <g>
        <polygon points="55,58 65,58 60,64" fill="#0F172A" />
        <path
          d="M52 66Q56 70 60 66Q64 70 68 66"
          stroke="#0F172A"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Subtle Cheek Whiskers */}
        <line x1="18" y1="62" x2="28" y2="64" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <line x1="102" y1="62" x2="92" y2="64" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </g>

      {/* Paws (Raised in Victory on happy/streak, Resting otherwise) */}
      {mood === 'happy' || mood === 'streak' ? (
        <g filter={`url(#${grad}_softShadow)`}>
          <ellipse cx="18" cy="52" rx="7" ry="11" transform="rotate(-28 18 52)" fill={`url(#${grad}_secondary)`} />
          <ellipse cx="102" cy="52" rx="7" ry="11" transform="rotate(28 102 52)" fill={`url(#${grad}_secondary)`} />
        </g>
      ) : (
        <g filter={`url(#${grad}_softShadow)`}>
          <ellipse cx="45" cy="107" rx="8.5" ry="5" fill={`url(#${grad}_secondary)`} />
          <ellipse cx="75" cy="107" rx="8.5" ry="5" fill={`url(#${grad}_secondary)`} />
          <circle cx="45" cy="106.5" r="2.5" fill="white" opacity="0.7" />
          <circle cx="75" cy="106.5" r="2.5" fill="white" opacity="0.7" />
        </g>
      )}

      {renderMoodAccessories()}
    </>
  );

  // 2. AXOLOTL (Axo the Crystal Axolotl - Bioluminescent Amphibian)
  const renderAxolotl = () => (
    <>
      {/* Translucent Wavy Aquatic Fin Tail behind */}
      <path
        d="M82 95C105 96 116 80 112 64C108 52 96 60 90 74Z"
        fill={`url(#${grad}_accent)`}
        opacity="0.75"
      />

      {/* Signature 3 Feathery Bioluminescent Gill Fronds on Each Side */}
      <g filter={`url(#${grad}_softShadow)`}>
        {/* Left 3 Gill Fronds */}
        <path d="M24 36C12 28 7 32 13 40L24 44Z" fill={`url(#${grad}_accent)`} />
        <path d="M21 48C8 45 5 51 12 56L22 56Z" fill={`url(#${grad}_accent)`} />
        <path d="M23 60C11 62 9 68 17 70L26 66Z" fill={`url(#${grad}_accent)`} />
        <circle cx="11" cy="33" r="3" fill="#FFF" opacity="0.9" />
        <circle cx="8" cy="49" r="3" fill="#FFF" opacity="0.9" />
        <circle cx="12" cy="65" r="3" fill="#FFF" opacity="0.9" />

        {/* Right 3 Gill Fronds */}
        <path d="M96 36C108 28 113 32 107 40L96 44Z" fill={`url(#${grad}_accent)`} />
        <path d="M99 48C112 45 115 51 108 56L98 56Z" fill={`url(#${grad}_accent)`} />
        <path d="M97 60C109 62 111 68 103 70L94 66Z" fill={`url(#${grad}_accent)`} />
        <circle cx="109" cy="33" r="3" fill="#FFF" opacity="0.9" />
        <circle cx="112" cy="49" r="3" fill="#FFF" opacity="0.9" />
        <circle cx="108" cy="65" r="3" fill="#FFF" opacity="0.9" />
      </g>

      {/* Smooth Pearlescent Axolotl Body */}
      <path
        d="M60 22C34 22 21 38 21 63C21 89 36 108 60 108C84 108 99 89 99 63C99 38 86 22 60 22Z"
        fill={`url(#${grad}_body)`}
        filter={`url(#${grad}_softShadow)`}
      />

      {/* Luminous Belly & Crystal Scales */}
      <ellipse cx="60" cy="80" rx="25" ry="23" fill={`url(#${grad}_belly)`} />
      <polygon points="60,72 64,77 60,82 56,77" fill={activePalette.bodyStart} opacity="0.55" />
      <polygon points="50,83 53,87 50,91 47,87" fill={activePalette.bodyStart} opacity="0.45" />
      <polygon points="70,83 73,87 70,91 67,87" fill={activePalette.bodyStart} opacity="0.45" />

      {/* Expressive Eyes */}
      {renderEyes(false)}

      {/* Cute Wide Amphibian Smile */}
      <path
        d="M49 61Q60 69 71 61"
        stroke="#0F172A"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cute Stubby Axolotl Hands & Feet */}
      <ellipse cx="22" cy="74" rx="6" ry="4.5" transform="rotate(-20 22 74)" fill={`url(#${grad}_body)`} />
      <ellipse cx="98" cy="74" rx="6" ry="4.5" transform="rotate(20 98 74)" fill={`url(#${grad}_body)`} />
      <ellipse cx="45" cy="107" rx="7.5" ry="4.5" fill={`url(#${grad}_secondary)`} />
      <ellipse cx="75" cy="107" rx="7.5" ry="4.5" fill={`url(#${grad}_secondary)`} />

      {renderMoodAccessories()}
    </>
  );

  // 3. ASTRONAUT (Nova-9 the Astro-Bot - Holographic Space Droid)
  const renderAstronaut = () => (
    <>
      {/* Cosmic Antenna Spire & Orbiting Energy Ring */}
      <g filter={`url(#${grad}_softShadow)`}>
        <line x1="60" y1="20" x2="60" y2="8" stroke={activePalette.bodyStart} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="60" cy="7" r="4.5" fill="#38BDF8" />
        <ellipse
          cx="60"
          cy="14"
          rx="14"
          ry="3.5"
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          fill="none"
          opacity="0.8"
        />
      </g>

      {/* Magnetic Levitating Wing-Fins */}
      <g filter={`url(#${grad}_softShadow)`}>
        <path
          d={
            mood === 'happy' || mood === 'streak'
              ? 'M18 46C8 34 6 52 14 66L20 60Z'
              : 'M17 56C9 60 9 76 17 84L21 72Z'
          }
          fill={`url(#${grad}_secondary)`}
          stroke="#38BDF8"
          strokeWidth="1.2"
        />
        <path
          d={
            mood === 'happy' || mood === 'streak'
              ? 'M102 46C112 34 114 52 106 66L100 60Z'
              : 'M103 56C111 60 111 76 103 84L99 72Z'
          }
          fill={`url(#${grad}_secondary)`}
          stroke="#38BDF8"
          strokeWidth="1.2"
        />
      </g>

      {/* Main Spherical Space-Pod Chassis */}
      <rect
        x="22"
        y="20"
        width="76"
        height="84"
        rx="36"
        fill={`url(#${grad}_body)`}
        filter={`url(#${grad}_softShadow)`}
      />
      {/* Metallic White/Silver Upper Shell */}
      <rect
        x="25"
        y="22"
        width="70"
        height="78"
        rx="33"
        fill={`url(#${grad}_belly)`}
        opacity="0.92"
      />

      {/* Deep Obsidian Curved Space Helmet Visor */}
      <rect
        x="28"
        y="31"
        width="64"
        height="38"
        rx="19"
        fill="#090D16"
        stroke={activePalette.bodyMid}
        strokeWidth="2.5"
      />
      {/* Visor Glass Specular Glare */}
      <path
        d="M36 36C48 33 72 33 84 36"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.45"
        fill="none"
      />

      {/* Holographic LED Eyes inside Visor */}
      {renderEyes(true)}

      {/* Glowing Arc-Reactor Knowledge Core on Chest */}
      <circle cx="60" cy="84" r="10" fill="#0F172A" stroke={activePalette.bodyMid} strokeWidth="2" />
      <circle cx="60" cy="84" r="6" fill="#38BDF8" />
      <circle cx="60" cy="84" r="3" fill="white" />

      {/* Anti-Gravity Hover Thruster Glow Rings at Base */}
      <ellipse cx="60" cy="108" rx="22" ry="4" fill="#38BDF8" fillOpacity="0.65" />
      <ellipse cx="60" cy="112" rx="14" ry="2.5" fill="#38BDF8" fillOpacity="0.4" />

      {renderMoodAccessories()}
    </>
  );

  // 4. RED PANDA (Bonsai the Red Panda - Zen Scholar)
  const renderRedPanda = () => (
    <>
      {/* Fluffy Striped Ring-Tail Curving on Right */}
      <g filter={`url(#${grad}_softShadow)`}>
        <path
          d="M80 96C106 96 118 76 112 56C107 42 94 48 92 62C90 74 84 82 76 88Z"
          fill={`url(#${grad}_body)`}
        />
        {/* Striped Tail Bands */}
        <path d="M95 56C101 55 107 58 111 63" stroke="#FFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
        <path d="M91 70C97 70 104 73 107 78" stroke="#FFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* Round Fluffy Bear-Style Ears with White Rims */}
      <g filter={`url(#${grad}_softShadow)`}>
        <circle cx="28" cy="26" r="13" fill={`url(#${grad}_secondary)`} stroke="white" strokeWidth="3" />
        <circle cx="28" cy="26" r="7" fill={`url(#${grad}_body)`} />
        <circle cx="92" cy="26" r="13" fill={`url(#${grad}_secondary)`} stroke="white" strokeWidth="3" />
        <circle cx="92" cy="26" r="7" fill={`url(#${grad}_body)`} />
      </g>

      {/* Cozy Rounded Red Panda Torso & Head */}
      <path
        d="M60 20C34 20 20 36 20 62C20 88 35 108 60 108C85 108 100 88 100 62C100 36 86 20 60 20Z"
        fill={`url(#${grad}_body)`}
        filter={`url(#${grad}_softShadow)`}
      />

      {/* Signature White Cheek Mask Patches & Eyebrow Teardrops */}
      <ellipse cx="34" cy="56" rx="12" ry="9" transform="rotate(-12 34 56)" fill="white" opacity="0.95" />
      <ellipse cx="86" cy="56" rx="12" ry="9" transform="rotate(12 86 56)" fill="white" opacity="0.95" />
      <ellipse cx="45" cy="34" rx="4.5" ry="2.8" transform="rotate(-15 45 34)" fill="white" opacity="0.95" />
      <ellipse cx="75" cy="34" rx="4.5" ry="2.8" transform="rotate(15 75 34)" fill="white" opacity="0.95" />

      {/* Warm Cream Belly & Scholar Badge */}
      <ellipse cx="60" cy="84" rx="25" ry="21" fill={`url(#${grad}_belly)`} />
      {/* Golden Scholar Collar Medallion */}
      <path d="M36 70Q60 79 84 70" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="75" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.2" />

      {/* Expressive Eyes */}
      {renderEyes(false)}

      {/* White Muzzle & Dark Button Snout */}
      <ellipse cx="60" cy="61" rx="11" ry="8" fill="white" />
      <ellipse cx="60" cy="58.5" rx="4.5" ry="3.2" fill="#0F172A" />
      <path
        d="M54 63.5Q60 68 66 63.5"
        stroke="#0F172A"
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cozy Paws */}
      <ellipse cx="45" cy="107" rx="8.5" ry="5" fill={`url(#${grad}_secondary)`} />
      <ellipse cx="75" cy="107" rx="8.5" ry="5" fill={`url(#${grad}_secondary)`} />

      {renderMoodAccessories()}
    </>
  );

  // 5. DRAGON (Draco the Nebula Dragon - Pocket Constellation Dragon)
  const renderDragon = () => (
    <>
      {/* Constellation Dragon Wings on Left & Right */}
      <g filter={`url(#${grad}_softShadow)`}>
        {/* Left Wing */}
        <path
          d="M22 52C6 34 2 48 8 68C12 63 17 65 21 72Z"
          fill={`url(#${grad}_secondary)`}
        />
        <circle cx="11" cy="49" r="2" fill="#FDE047" />
        <circle cx="14" cy="58" r="1.5" fill="#38BDF8" />
        {/* Right Wing */}
        <path
          d="M98 52C114 34 118 48 112 68C108 63 103 65 99 72Z"
          fill={`url(#${grad}_secondary)`}
        />
        <circle cx="109" cy="49" r="2" fill="#FDE047" />
        <circle cx="106" cy="58" r="1.5" fill="#38BDF8" />
      </g>

      {/* Dragon Tail with Star-Flame Tip */}
      <path
        d="M84 96C103 96 112 84 109 70"
        stroke={activePalette.bodyMid}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M109 62C109 62 115 68 111 73C107 76 104 71 109 62Z"
        fill="#FBBF24"
      />

      {/* Sculpted Curved Crystal Horns */}
      <g filter={`url(#${grad}_softShadow)`}>
        <path d="M36 26C28 14 22 10 26 8C32 6 40 15 44 23Z" fill={`url(#${grad}_accent)`} />
        <path d="M84 26C92 14 98 10 94 8C88 6 80 15 76 23Z" fill={`url(#${grad}_accent)`} />
      </g>

      {/* Dragon Head & Torso */}
      <path
        d="M60 20C35 20 21 36 21 62C21 88 36 108 60 108C84 108 99 88 99 62C99 36 85 20 60 20Z"
        fill={`url(#${grad}_body)`}
        filter={`url(#${grad}_softShadow)`}
      />

      {/* Ribbed Dragon Belly Scales */}
      <ellipse cx="60" cy="80" rx="24" ry="24" fill={`url(#${grad}_belly)`} />
      <line x1="42" y1="72" x2="78" y2="72" stroke={activePalette.detailStroke} strokeWidth="1.6" opacity="0.35" />
      <line x1="39" y1="81" x2="81" y2="81" stroke={activePalette.detailStroke} strokeWidth="1.6" opacity="0.35" />
      <line x1="43" y1="90" x2="77" y2="90" stroke={activePalette.detailStroke} strokeWidth="1.6" opacity="0.35" />

      {/* Expressive Eyes */}
      {renderEyes(false)}

      {/* Cute Dragon Snout & Fang Smile */}
      <g>
        <ellipse cx="60" cy="60" rx="11" ry="6.5" fill={activePalette.bodyStart} />
        <circle cx="55.5" cy="59" r="1.8" fill="#0F172A" />
        <circle cx="64.5" cy="59" r="1.8" fill="#0F172A" />
        <path d="M52 64Q60 69 68 64" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* Tiny cute fang */}
        <polygon points="54,65 56,69 58,65.5" fill="white" />
      </g>

      {/* Dragon Claws/Feet */}
      <ellipse cx="45" cy="107" rx="8.5" ry="5" fill={`url(#${grad}_secondary)`} />
      <ellipse cx="75" cy="107" rx="8.5" ry="5" fill={`url(#${grad}_secondary)`} />

      {renderMoodAccessories()}
    </>
  );

  return (
    <div className={`relative inline-flex items-center gap-3.5 select-none ${className}`}>
      <div
        onClick={handleClick}
        className={`relative ${sizeClasses[size]} shrink-0 transition-transform duration-300 ${
          interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : ''
        } ${isWiggling ? 'animate-bounce' : 'hover:-rotate-2'} filter drop-shadow-md`}
        title={interactive ? `Click ${characterMeta.name} for study tips!` : characterMeta.title}
      >
        {/* Floating Interactive Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none text-base font-black animate-out fade-out slide-out-to-top-6 duration-1000 z-30"
            style={{
              left: `calc(50% + ${p.x}px)`,
              top: `${p.y}px`,
            }}
          >
            {p.char}
          </div>
        ))}

        {/* Ambient Halo Lighting */}
        {(mood === 'streak' || mood === 'happy' || mood === 'teacher') && (
          <div
            className={`absolute -inset-1.5 bg-gradient-to-tr ${activePalette.accentGlow} rounded-full blur-xl animate-pulse -z-10`}
          />
        )}

        <svg
          viewBox="0 0 120 120"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`${grad}_body`} x1="24" y1="18" x2="96" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activePalette.bodyStart} />
              <stop offset="45%" stopColor={activePalette.bodyMid} />
              <stop offset="100%" stopColor={activePalette.bodyEnd} />
            </linearGradient>

            <linearGradient id={`${grad}_secondary`} x1="16" y1="20" x2="90" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activePalette.secondaryStart} />
              <stop offset="100%" stopColor={activePalette.secondaryEnd} />
            </linearGradient>

            <linearGradient id={`${grad}_accent`} x1="20" y1="10" x2="100" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor={activePalette.accentPop} />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <linearGradient id={`${grad}_belly`} x1="60" y1="44" x2="60" y2="108" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
              <stop offset="65%" stopColor="#F8FAFC" stopOpacity="0.93" />
              <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.9" />
            </linearGradient>

            <radialGradient id={`${grad}_iris`} cx="43" cy="49" r="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="70%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            <filter id={`${grad}_softShadow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#0F172A" floodOpacity="0.2" />
            </filter>
            <filter id={`${grad}_glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Cast Ground Shadow */}
          <ellipse cx="60" cy="113" rx="33" ry="4.5" fill="#0F172A" fillOpacity="0.16" />

          {/* Render Active Original Mascot Character */}
          {activeCharacter === 'kitsune' && renderKitsune()}
          {activeCharacter === 'axolotl' && renderAxolotl()}
          {activeCharacter === 'astronaut' && renderAstronaut()}
          {activeCharacter === 'redpanda' && renderRedPanda()}
          {activeCharacter === 'dragon' && renderDragon()}
        </svg>
      </div>

      {/* Speech Bubble */}
      {shouldShowBubble && effectiveSpeechText && (
        <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 max-w-xs animate-in fade-in slide-in-from-left-3 duration-300 z-20">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[8px] border-r-white dark:border-r-slate-800 drop-shadow-[-1px_0_0_rgba(226,232,240,0.8)]" />
          <p className="leading-snug tracking-tight">{effectiveSpeechText}</p>
        </div>
      )}
    </div>
  );
};
