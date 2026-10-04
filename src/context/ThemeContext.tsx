import React, { createContext, useContext, useEffect, useState } from 'react';
import { soundFx } from '../utils/audio';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'slate';
export type FontFamilyChoice =
  | 'sans'
  | 'serif'
  | 'mono'
  | 'rounded'
  | 'outfit'
  | 'lexend'
  | 'space'
  | 'lora'
  | 'fredoka'
  | 'sora'
  | 'caveat'
  | 'atkinson';
export type CardCornerRadius = '3xl' | '2xl' | 'xl' | 'md';
export type UiDensity = 'comfortable' | 'compact';
export type QuestionLayoutStyle = 'stacked' | 'split' | 'focus';

export interface FontCatalogItem {
  id: FontFamilyChoice;
  name: string;
  style: string;
  sample: string;
  cssFamily: string;
  badge?: string;
}

export const FONT_CATALOG: FontCatalogItem[] = [
  {
    id: 'sans',
    name: 'Plus Jakarta Sans',
    style: 'Modern Clean Sans',
    sample: 'The quick brown fox jumps over the lazy dog',
    cssFamily: "'Plus Jakarta Sans', sans-serif",
    badge: 'Default',
  },
  {
    id: 'lexend',
    name: 'Lexend Reading',
    style: 'Dyslexia-Friendly & Hyper-Smooth',
    sample: 'Designed to reduce visual stress & boost reading speed',
    cssFamily: "'Lexend', sans-serif",
    badge: 'Reading Aid',
  },
  {
    id: 'fredoka',
    name: 'Fredoka Gamified',
    style: 'Bubbly Duolingo-Style Rounded',
    sample: 'Streak unlocked! +50 Bonus XP earned!',
    cssFamily: "'Fredoka', sans-serif",
    badge: 'Playful',
  },
  {
    id: 'space',
    name: 'Space Grotesk',
    style: 'Futuristic STEM & Tech Sans',
    sample: 'Quantum entanglement & algorithmic complexity',
    cssFamily: "'Space Grotesk', sans-serif",
    badge: 'STEM',
  },
  {
    id: 'outfit',
    name: 'Outfit Geometric',
    style: 'Modern Display Geometric',
    sample: 'Crisp geometric proportions for modern screens',
    cssFamily: "'Outfit', sans-serif",
  },
  {
    id: 'sora',
    name: 'Sora Precision',
    style: 'Contemporary UI & Sharp Clarity',
    sample: 'High-velocity active recall & conceptual mastery',
    cssFamily: "'Sora', sans-serif",
    badge: 'New',
  },
  {
    id: 'rounded',
    name: 'Quicksand Rounded',
    style: 'Friendly & Soft Geometric',
    sample: 'Warm and welcoming typography for relaxed study',
    cssFamily: "'Quicksand', sans-serif",
  },
  {
    id: 'serif',
    name: 'Playfair Display',
    style: 'Academic Editorial Serif',
    sample: 'Classical inquiry, history & literary analysis',
    cssFamily: "'Playfair Display', serif",
  },
  {
    id: 'lora',
    name: 'Lora Textbook',
    style: 'Classic Book & Essay Serif',
    sample: 'Long-form scholarly reading with warm brush curves',
    cssFamily: "'Lora', serif",
    badge: 'Bookish',
  },
  {
    id: 'mono',
    name: 'JetBrains Mono',
    style: 'Developer & Code Monospace',
    sample: 'const mastery = await evaluate(answer);',
    cssFamily: "'JetBrains Mono', monospace",
  },
  {
    id: 'atkinson',
    name: 'Atkinson Hyperlegible',
    style: 'Low-Vision High-Clarity Accessibility',
    sample: 'Distinct letterforms: 0O, 1lI, 8B for zero ambiguity',
    cssFamily: "'Atkinson Hyperlegible', sans-serif",
    badge: 'Accessible',
  },
  {
    id: 'caveat',
    name: 'Patrick Hand',
    style: 'Handwritten Study Notebook',
    sample: 'Feels like your favorite handwritten study flashcards!',
    cssFamily: "'Patrick Hand', cursive",
    badge: 'Notebook',
  },
];

export interface AccentConfigItem {
  id: AccentColor;
  name: string;
  subtitle: string;
  primaryHex: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  activeBtn: string;
  activeText: string;
  ring: string;
  lightBg: string;
  border: string;
  glow: string;
}

export const ACCENT_PALETTES: Record<AccentColor, AccentConfigItem> = {
  indigo: {
    id: 'indigo',
    name: 'Electric Indigo',
    subtitle: 'Modern Academic & Clean Logic',
    primaryHex: '#6366f1',
    gradient: 'from-indigo-600 to-violet-600',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    activeBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
    activeText: 'text-indigo-600 dark:text-indigo-400',
    ring: 'focus:ring-indigo-500',
    lightBg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-800',
    glow: 'rgba(99, 102, 241, 0.25)',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    subtitle: 'Growth, Focus & Vitality',
    primaryHex: '#10b981',
    gradient: 'from-emerald-600 to-teal-600',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    activeBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
    activeText: 'text-emerald-600 dark:text-emerald-400',
    ring: 'focus:ring-emerald-500',
    lightBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    glow: 'rgba(16, 185, 129, 0.25)',
  },
  amber: {
    id: 'amber',
    name: 'Amber Cyberpunk',
    subtitle: 'Warm Energy & High-Velocity',
    primaryHex: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-600 dark:text-amber-400',
    activeBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
    activeText: 'text-amber-600 dark:text-amber-400',
    ring: 'focus:ring-amber-500',
    lightBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    glow: 'rgba(245, 158, 11, 0.25)',
  },
  rose: {
    id: 'rose',
    name: 'Rose Bloom',
    subtitle: 'Vibrant, Warm & Creative',
    primaryHex: '#f43f5e',
    gradient: 'from-rose-500 to-pink-600',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-600 dark:text-rose-400',
    activeBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
    activeText: 'text-rose-600 dark:text-rose-400',
    ring: 'focus:ring-rose-500',
    lightBg: 'bg-rose-50/70 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800',
    glow: 'rgba(244, 63, 94, 0.25)',
  },
  cyan: {
    id: 'cyan',
    name: 'Cyan Deep Ocean',
    subtitle: 'Crisp Technology & Exploration',
    primaryHex: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60',
    badgeText: 'text-cyan-600 dark:text-cyan-400',
    activeBtn: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/20',
    activeText: 'text-cyan-600 dark:text-cyan-400',
    ring: 'focus:ring-cyan-500',
    lightBg: 'bg-cyan-50/70 dark:bg-cyan-950/30',
    border: 'border-cyan-200 dark:border-cyan-800',
    glow: 'rgba(6, 182, 212, 0.25)',
  },
  violet: {
    id: 'violet',
    name: 'Violet Nebula',
    subtitle: 'Deep Mystery & Intellectual Insight',
    primaryHex: '#8b5cf6',
    gradient: 'from-violet-600 to-purple-600',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/60',
    badgeText: 'text-violet-600 dark:text-violet-400',
    activeBtn: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20',
    activeText: 'text-violet-600 dark:text-violet-400',
    ring: 'focus:ring-violet-500',
    lightBg: 'bg-violet-50/70 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800',
    glow: 'rgba(139, 92, 246, 0.25)',
  },
  slate: {
    id: 'slate',
    name: 'Slate Minimalist',
    subtitle: 'Monochrome High-Precision Focus',
    primaryHex: '#475569',
    gradient: 'from-slate-700 to-slate-900',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-200',
    activeBtn: 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-slate-500/20',
    activeText: 'text-slate-900 dark:text-slate-100',
    ring: 'focus:ring-slate-500',
    lightBg: 'bg-slate-100/70 dark:bg-slate-800/40',
    border: 'border-slate-300 dark:border-slate-700',
    glow: 'rgba(71, 85, 105, 0.25)',
  },
};

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  theme: ThemeMode;
  accent: AccentColor;
  fontFamily: FontFamilyChoice;
  uiDensity: UiDensity;
  cardRadius: CardCornerRadius;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'preset_indigo_modern',
    name: 'Modern Studio',
    tagline: 'Crisp light layout with electric indigo accents and clean sans-serif typography.',
    icon: '⚡',
    theme: 'light',
    accent: 'indigo',
    fontFamily: 'sans',
    uiDensity: 'comfortable',
    cardRadius: '3xl',
  },
  {
    id: 'preset_emerald_academy',
    name: 'Emerald Academy',
    tagline: 'Scholarly atmosphere with emerald highlights and editorial serif headings.',
    icon: '🌿',
    theme: 'light',
    accent: 'emerald',
    fontFamily: 'serif',
    uiDensity: 'comfortable',
    cardRadius: '2xl',
  },
  {
    id: 'preset_midnight_cyber',
    name: 'Midnight Cyber',
    tagline: 'High-contrast dark mode, vibrant amber accents, and technical monospace code styling.',
    icon: '🕶️',
    theme: 'dark',
    accent: 'amber',
    fontFamily: 'mono',
    uiDensity: 'compact',
    cardRadius: 'md',
  },
  {
    id: 'preset_rose_bloom',
    name: 'Rose Playful',
    tagline: 'Warm rounded typography, friendly rose tones, and rounded card styling.',
    icon: '🌸',
    theme: 'light',
    accent: 'rose',
    fontFamily: 'rounded',
    uiDensity: 'comfortable',
    cardRadius: '3xl',
  },
  {
    id: 'preset_ocean_explorer',
    name: 'Ocean Scholar',
    tagline: 'Deep cyan ocean tones paired with modern Outfit geometry.',
    icon: '🌊',
    theme: 'light',
    accent: 'cyan',
    fontFamily: 'outfit',
    uiDensity: 'comfortable',
    cardRadius: '2xl',
  },
  {
    id: 'preset_violet_nebula',
    name: 'Nebula Pro',
    tagline: 'Deep dark twilight palette with glowing violet highlights.',
    icon: '🔮',
    theme: 'dark',
    accent: 'violet',
    fontFamily: 'sans',
    uiDensity: 'comfortable',
    cardRadius: '3xl',
  },
  {
    id: 'preset_monochrome_slate',
    name: 'Monochrome Strict',
    tagline: 'Distraction-free high-density monochromatic palette for pure focus.',
    icon: '♟️',
    theme: 'light',
    accent: 'slate',
    fontFamily: 'sans',
    uiDensity: 'compact',
    cardRadius: 'xl',
  },
];

export type AnimationStyle = 'bouncy' | 'smooth' | 'snappy' | 'minimal';
export type AnimationIntensity = 'subtle' | 'normal' | 'extra';

export const ANIMATION_STYLE_CATALOG: {
  id: AnimationStyle;
  name: string;
  tagline: string;
  icon: string;
  badge: string;
}[] = [
  {
    id: 'bouncy',
    name: 'Playful Bouncy Spring',
    tagline: 'Elastic spring physics, tactile button squish & lively overshoot pops.',
    icon: '🏀',
    badge: 'Gamified Default',
  },
  {
    id: 'smooth',
    name: 'Silky Smooth & Fluid',
    tagline: 'Velvety quintic easing with graceful glides and zero overshoot.',
    icon: '🌊',
    badge: 'Editorial',
  },
  {
    id: 'snappy',
    name: 'Hyper-Snappy Arcade',
    tagline: 'Instant high-velocity micro-pops engineered for speed runners.',
    icon: '⚡',
    badge: 'Esports / Fast',
  },
  {
    id: 'minimal',
    name: 'Minimal / No Motion',
    tagline: 'Disables spring transitions and floating loops for pure stillness.',
    icon: '🧘',
    badge: 'Vestibular Safe',
  },
];

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  fontFamily: FontFamilyChoice;
  setFontFamily: (font: FontFamilyChoice) => void;
  uiDensity: UiDensity;
  setUiDensity: (density: UiDensity) => void;
  cardRadius: CardCornerRadius;
  setCardRadius: (radius: CardCornerRadius) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  animationStyle: AnimationStyle;
  setAnimationStyle: (style: AnimationStyle) => void;
  animationIntensity: AnimationIntensity;
  setAnimationIntensity: (intensity: AnimationIntensity) => void;
  buttonBounceEnabled: boolean;
  setButtonBounceEnabled: (val: boolean) => void;
  cardHoverLiftEnabled: boolean;
  setCardHoverLiftEnabled: (val: boolean) => void;
  confettiEnabled: boolean;
  setConfettiEnabled: (val: boolean) => void;
  soundVolume: number;
  setSoundVolume: (vol: number) => void;
  questionLayout: QuestionLayoutStyle;
  setQuestionLayout: (layout: QuestionLayoutStyle) => void;
  autoReadQuestions: boolean;
  setAutoReadQuestions: (val: boolean) => void;
  currentAccentConfig: AccentConfigItem;
  applyPreset: (presetId: string) => void;
  resetAllSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'quizme_theme_mode_v3';
const ACCENT_KEY = 'quizme_accent_v3';
const DENSITY_KEY = 'quizme_density_v3';
const FONT_KEY = 'quizme_font_v1';
const RADIUS_KEY = 'quizme_card_radius_v1';
const CONTRAST_KEY = 'quizme_high_contrast_v1';
const MOTION_KEY = 'quizme_reduced_motion_v1';
const ANIM_STYLE_KEY = 'quizme_animation_style_v1';
const ANIM_INTENSITY_KEY = 'quizme_animation_intensity_v1';
const BTN_BOUNCE_KEY = 'quizme_btn_bounce_v1';
const CARD_LIFT_KEY = 'quizme_card_lift_v1';
const CONFETTI_KEY = 'quizme_confetti_enabled_v1';
const VOLUME_KEY = 'quizme_sound_volume';
const LAYOUT_KEY = 'quizme_question_layout_v1';
const AUTOREAD_KEY = 'quizme_auto_read_tts_v1';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY) as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    }
    return 'light';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACCENT_KEY) as AccentColor;
      if (saved && ACCENT_PALETTES[saved]) return saved;
    }
    return 'indigo';
  });

  const [fontFamily, setFontFamilyState] = useState<FontFamilyChoice>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FONT_KEY) as FontFamilyChoice;
      if (FONT_CATALOG.some((f) => f.id === saved)) return saved;
    }
    return 'sans';
  });

  const [uiDensity, setUiDensityState] = useState<UiDensity>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DENSITY_KEY) as UiDensity;
      if (saved === 'compact' || saved === 'comfortable') return saved;
    }
    return 'comfortable';
  });

  const [cardRadius, setCardRadiusState] = useState<CardCornerRadius>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(RADIUS_KEY) as CardCornerRadius;
      if (['3xl', '2xl', 'xl', 'md'].includes(saved)) return saved;
    }
    return '3xl';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CONTRAST_KEY) === 'true';
    }
    return false;
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(MOTION_KEY) === 'true';
    }
    return false;
  });

  const [animationStyle, setAnimationStyleState] = useState<AnimationStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ANIM_STYLE_KEY) as AnimationStyle;
      if (['bouncy', 'smooth', 'snappy', 'minimal'].includes(saved)) return saved;
    }
    return 'bouncy';
  });

  const [animationIntensity, setAnimationIntensityState] = useState<AnimationIntensity>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ANIM_INTENSITY_KEY) as AnimationIntensity;
      if (['subtle', 'normal', 'extra'].includes(saved)) return saved;
    }
    return 'normal';
  });

  const [buttonBounceEnabled, setButtonBounceEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(BTN_BOUNCE_KEY) !== 'false';
    }
    return true;
  });

  const [cardHoverLiftEnabled, setCardHoverLiftEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CARD_LIFT_KEY) !== 'false';
    }
    return true;
  });

  const [confettiEnabled, setConfettiEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CONFETTI_KEY) !== 'false';
    }
    return true;
  });

  const [soundVolume, setSoundVolumeState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VOLUME_KEY);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
    }
    return 0.85;
  });

  const [questionLayout, setQuestionLayoutState] = useState<QuestionLayoutStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LAYOUT_KEY) as QuestionLayoutStyle;
      if (['stacked', 'split', 'focus'].includes(saved)) return saved;
    }
    return 'stacked';
  });

  const [autoReadQuestions, setAutoReadQuestionsState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTOREAD_KEY) === 'true';
    }
    return false;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const applyThemeToDOM = (
    isDark: boolean,
    currentAccent: AccentColor,
    currentFont: FontFamilyChoice,
    currentDensity: UiDensity,
    currentRadius: CardCornerRadius,
    isHighContrast: boolean,
    isReducedMotion: boolean,
    currentAnimStyle: AnimationStyle = animationStyle,
    currentAnimIntensity: AnimationIntensity = animationIntensity,
    isBtnBounce: boolean = buttonBounceEnabled,
    isCardLift: boolean = cardHoverLiftEnabled
  ) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    const effectiveStyle = isReducedMotion ? 'minimal' : currentAnimStyle;

    root.setAttribute('data-accent', currentAccent);
    root.setAttribute('data-font', currentFont);
    root.setAttribute('data-density', currentDensity);
    root.setAttribute('data-radius', currentRadius);
    root.setAttribute('data-contrast', isHighContrast ? 'high' : 'standard');
    root.setAttribute('data-motion', effectiveStyle === 'minimal' ? 'reduced' : effectiveStyle);
    root.setAttribute('data-animation-style', effectiveStyle);
    root.setAttribute('data-animation-intensity', currentAnimIntensity);
    root.setAttribute('data-button-bounce', isBtnBounce && effectiveStyle !== 'minimal' ? 'true' : 'false');
    root.setAttribute('data-card-lift', isCardLift && effectiveStyle !== 'minimal' ? 'true' : 'false');

    const palette = ACCENT_PALETTES[currentAccent] || ACCENT_PALETTES.indigo;
    root.style.setProperty('--accent-hex', palette.primaryHex);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = theme === 'dark';
      }

      setResolvedTheme(isDark ? 'dark' : 'light');
      applyThemeToDOM(
        isDark,
        accent,
        fontFamily,
        uiDensity,
        cardRadius,
        highContrast,
        reducedMotion,
        animationStyle,
        animationIntensity,
        buttonBounceEnabled,
        cardHoverLiftEnabled
      );
    };

    updateResolvedTheme();

    const listener = () => {
      if (theme === 'system') updateResolvedTheme();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [
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
  ]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    const isDark =
      newTheme === 'dark' ||
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setResolvedTheme(isDark ? 'dark' : 'light');
    applyThemeToDOM(isDark, accent, fontFamily, uiDensity, cardRadius, highContrast, reducedMotion);
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem(ACCENT_KEY, newAccent);
    applyThemeToDOM(
      resolvedTheme === 'dark',
      newAccent,
      fontFamily,
      uiDensity,
      cardRadius,
      highContrast,
      reducedMotion
    );
  };

  const setFontFamily = (newFont: FontFamilyChoice) => {
    setFontFamilyState(newFont);
    localStorage.setItem(FONT_KEY, newFont);
    applyThemeToDOM(
      resolvedTheme === 'dark',
      accent,
      newFont,
      uiDensity,
      cardRadius,
      highContrast,
      reducedMotion
    );
  };

  const setUiDensity = (newDensity: UiDensity) => {
    setUiDensityState(newDensity);
    localStorage.setItem(DENSITY_KEY, newDensity);
    applyThemeToDOM(
      resolvedTheme === 'dark',
      accent,
      fontFamily,
      newDensity,
      cardRadius,
      highContrast,
      reducedMotion
    );
  };

  const setCardRadius = (newRadius: CardCornerRadius) => {
    setCardRadiusState(newRadius);
    localStorage.setItem(RADIUS_KEY, newRadius);
    applyThemeToDOM(
      resolvedTheme === 'dark',
      accent,
      fontFamily,
      uiDensity,
      newRadius,
      highContrast,
      reducedMotion
    );
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    localStorage.setItem(CONTRAST_KEY, String(val));
    applyThemeToDOM(
      resolvedTheme === 'dark',
      accent,
      fontFamily,
      uiDensity,
      cardRadius,
      val,
      reducedMotion
    );
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    localStorage.setItem(MOTION_KEY, String(val));
    if (val) {
      setAnimationStyleState('minimal');
      localStorage.setItem(ANIM_STYLE_KEY, 'minimal');
    } else if (animationStyle === 'minimal') {
      setAnimationStyleState('bouncy');
      localStorage.setItem(ANIM_STYLE_KEY, 'bouncy');
    }
    applyThemeToDOM(
      resolvedTheme === 'dark',
      accent,
      fontFamily,
      uiDensity,
      cardRadius,
      highContrast,
      val,
      val ? 'minimal' : animationStyle === 'minimal' ? 'bouncy' : animationStyle,
      animationIntensity,
      buttonBounceEnabled,
      cardHoverLiftEnabled
    );
  };

  const setAnimationStyle = (style: AnimationStyle) => {
    setAnimationStyleState(style);
    localStorage.setItem(ANIM_STYLE_KEY, style);
    const isMin = style === 'minimal';
    setReducedMotionState(isMin);
    localStorage.setItem(MOTION_KEY, String(isMin));
    applyThemeToDOM(
      resolvedTheme === 'dark',
      accent,
      fontFamily,
      uiDensity,
      cardRadius,
      highContrast,
      isMin,
      style,
      animationIntensity,
      buttonBounceEnabled,
      cardHoverLiftEnabled
    );
  };

  const setAnimationIntensity = (intensity: AnimationIntensity) => {
    setAnimationIntensityState(intensity);
    localStorage.setItem(ANIM_INTENSITY_KEY, intensity);
    applyThemeToDOM(
      resolvedTheme === 'dark',
      accent,
      fontFamily,
      uiDensity,
      cardRadius,
      highContrast,
      reducedMotion,
      animationStyle,
      intensity,
      buttonBounceEnabled,
      cardHoverLiftEnabled
    );
  };

  const setButtonBounceEnabled = (val: boolean) => {
    setButtonBounceEnabledState(val);
    localStorage.setItem(BTN_BOUNCE_KEY, String(val));
    applyThemeToDOM(
      resolvedTheme === 'dark',
      accent,
      fontFamily,
      uiDensity,
      cardRadius,
      highContrast,
      reducedMotion,
      animationStyle,
      animationIntensity,
      val,
      cardHoverLiftEnabled
    );
  };

  const setCardHoverLiftEnabled = (val: boolean) => {
    setCardHoverLiftEnabledState(val);
    localStorage.setItem(CARD_LIFT_KEY, String(val));
    applyThemeToDOM(
      resolvedTheme === 'dark',
      accent,
      fontFamily,
      uiDensity,
      cardRadius,
      highContrast,
      reducedMotion,
      animationStyle,
      animationIntensity,
      buttonBounceEnabled,
      val
    );
  };

  const setConfettiEnabled = (val: boolean) => {
    setConfettiEnabledState(val);
    localStorage.setItem(CONFETTI_KEY, String(val));
  };

  const setSoundVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSoundVolumeState(clamped);
    soundFx.setVolume(clamped);
    localStorage.setItem(VOLUME_KEY, String(clamped));
  };

  const setQuestionLayout = (layout: QuestionLayoutStyle) => {
    setQuestionLayoutState(layout);
    localStorage.setItem(LAYOUT_KEY, layout);
  };

  const setAutoReadQuestions = (val: boolean) => {
    setAutoReadQuestionsState(val);
    localStorage.setItem(AUTOREAD_KEY, String(val));
  };

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    soundFx.playCorrect();

    setTheme(preset.theme);
    setAccent(preset.accent);
    setFontFamily(preset.fontFamily);
    setUiDensity(preset.uiDensity);
    setCardRadius(preset.cardRadius);
  };

  const resetAllSettings = () => {
    soundFx.playClick();
    setTheme('light');
    setAccent('indigo');
    setFontFamily('sans');
    setUiDensity('comfortable');
    setCardRadius('3xl');
    setHighContrast(false);
    setReducedMotion(false);
    setAnimationStyle('bouncy');
    setAnimationIntensity('normal');
    setButtonBounceEnabled(true);
    setCardHoverLiftEnabled(true);
    setConfettiEnabled(true);
    setSoundVolume(0.85);
    setQuestionLayout('stacked');
    setAutoReadQuestions(false);
  };

  const currentAccentConfig = ACCENT_PALETTES[accent] || ACCENT_PALETTES.indigo;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        accent,
        setAccent,
        fontFamily,
        setFontFamily,
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
        soundVolume,
        setSoundVolume,
        questionLayout,
        setQuestionLayout,
        autoReadQuestions,
        setAutoReadQuestions,
        currentAccentConfig,
        applyPreset,
        resetAllSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


