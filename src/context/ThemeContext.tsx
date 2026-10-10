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
export type UiStyleMode = 'default' | '3d' | 'modern' | 'legacy' | 'playful';
export type UiThemeId =
  | 'comic_pop'
  | 'sunset_manga'
  | 'cyber_arcade'
  | 'emerald_academy'
  | 'royal_amethyst'
  | 'paper_ink';

export interface UiThemeCatalogItem {
  id: UiThemeId;
  name: string;
  tagline: string;
  emoji: string;
  badge: string;
  swatchGradient: string;
  recommendedMode: 'light' | 'dark';
  recommendedAccent: AccentColor;
}

export const UI_THEME_CATALOG: UiThemeCatalogItem[] = [
  {
    id: 'comic_pop',
    name: 'Comic Pop Studio',
    tagline: 'Royal Blue & Electric Indigo command deck with Ben-Day halftone dots & crisp ink borders.',
    emoji: '⚡',
    badge: 'Default Comic',
    swatchGradient: 'from-blue-600 via-indigo-600 to-violet-600',
    recommendedMode: 'light',
    recommendedAccent: 'indigo',
  },
  {
    id: 'sunset_manga',
    name: 'Sunset Manga Action',
    tagline: 'Fiery Coral-Rose, Crimson & Amber Gold action panels with warm speed-stripe energy.',
    emoji: '🔥',
    badge: 'Action Pop',
    swatchGradient: 'from-rose-600 via-orange-500 to-amber-400',
    recommendedMode: 'light',
    recommendedAccent: 'rose',
  },
  {
    id: 'cyber_arcade',
    name: 'Cyber Neon Arcade',
    tagline: 'Electric Cyan & Neon Emerald championship arena with high-contrast midnight surfaces.',
    emoji: '🕹️',
    badge: 'Esports Neon',
    swatchGradient: 'from-cyan-500 via-sky-600 to-indigo-700',
    recommendedMode: 'dark',
    recommendedAccent: 'cyan',
  },
  {
    id: 'emerald_academy',
    name: 'Emerald Botanical Lab',
    tagline: 'Official Ivy-League Emerald & Teal scientific blueprint theme with crisp mint clarity.',
    emoji: '🌿',
    badge: 'STEM Official',
    swatchGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    recommendedMode: 'light',
    recommendedAccent: 'emerald',
  },
  {
    id: 'royal_amethyst',
    name: 'Royal Amethyst Velvet',
    tagline: 'Regal Purple, Fuchsia & Championship Gold tournament deck with diamond-weave textures.',
    emoji: '👑',
    badge: 'Prestige',
    swatchGradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    recommendedMode: 'dark',
    recommendedAccent: 'violet',
  },
  {
    id: 'paper_ink',
    name: 'Sunday Ink & Paper',
    tagline: 'Warm vintage comic-strip newsprint cream canvas with bold editorial black ink frames.',
    emoji: '📰',
    badge: 'Editorial Strip',
    swatchGradient: 'from-amber-600 via-stone-700 to-slate-900',
    recommendedMode: 'light',
    recommendedAccent: 'amber',
  },
];

export interface UiStyleCatalogItem {
  id: UiStyleMode;
  name: string;
  tagline: string;
  badge: string;
}

export const UI_STYLE_CATALOG: UiStyleCatalogItem[] = [
  {
    id: 'default',
    name: 'Default',
    tagline: 'Balanced academic clarity with crisp borders and smooth responsive elevation.',
    badge: 'Standard',
  },
  {
    id: '3d',
    name: '3D Tactile',
    tagline: 'Deep isometric 3D bevels, physical push-button ledges, and layered spatial depth.',
    badge: '3D Depth',
  },
  {
    id: 'modern',
    name: 'Modern Glass',
    tagline: 'Sleek translucent glassmorphism, hairline specular edges, and ultra-clean hierarchy.',
    badge: 'Sleek',
  },
  {
    id: 'legacy',
    name: 'Legacy Classic',
    tagline: 'Timeless scholarly textbook layout with structured square-edge panels and zero distractions.',
    badge: 'Classic',
  },
  {
    id: 'playful',
    name: 'Playful Arcade',
    tagline: 'Gamified bubbly geometry, bold tactile outlines, and energetic spring physics.',
    badge: 'Fun',
  },
];

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
export type GraphicsQualityMode = 'simple' | 'medium' | 'performance' | 'ultra';
export type ParticlePresetType =
  | 'constellation'
  | 'fireflies'
  | 'bubbles'
  | 'scholar_sparks'
  | 'sakura'
  | 'snowfall';
export type ParticleDensityType = 'low' | 'medium' | 'high';
export type ParticleSpeedType = 'slow' | 'normal' | 'fast';

export interface GraphicsModeMeta {
  id: GraphicsQualityMode;
  name: string;
  shortName: string;
  tagline: string;
  badge: string;
  icon: string;
  specs: string[];
}

export const GRAPHICS_MODE_CATALOG: GraphicsModeMeta[] = [
  {
    id: 'simple',
    name: 'Simple Mode',
    shortName: 'Simple',
    tagline: 'Clean, distraction-free flat surfaces with zero particles or heavy blur for maximum battery life.',
    badge: 'Eco / Battery',
    icon: '🌿',
    specs: ['0 Particles', 'Flat Crisp Surfaces', 'Minimal GPU Load'],
  },
  {
    id: 'medium',
    name: 'Medium Balanced',
    shortName: 'Medium',
    tagline: 'Balanced frosted glass, smooth transitions, and medium ambient particles for everyday study.',
    badge: 'Balanced',
    icon: '⚖️',
    specs: ['Balanced Glass', 'Medium Particles', 'Smooth 60 FPS'],
  },
  {
    id: 'performance',
    name: 'Performance 120Hz',
    shortName: 'Performance',
    tagline: 'Esports-grade 120FPS responsiveness with hyper-snappy physics and low-latency GPU compositing.',
    badge: '120 FPS Speed',
    icon: '⚡',
    specs: ['Hyper-Snappy Physics', 'Zero Blur Latency', 'High-FPS Frame Pacing'],
  },
  {
    id: 'ultra',
    name: 'Ultra RTX Mode',
    shortName: 'Ultra RTX',
    tagline: 'Full ray-traced cursor illumination, specular glass reflections, volumetric bloom & rich particles.',
    badge: 'RTX ON',
    icon: '💎',
    specs: ['RTX Dynamic Lighting', 'Specular Glass & Bloom', 'High-Density Interactive FX'],
  },
];

function safeGetStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Ignore storage access errors in cross-origin iframes or private mode
  }
  return null;
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage write errors in cross-origin iframes or private mode
  }
}

export interface ParticlePresetMeta {
  id: ParticlePresetType;
  name: string;
  tagline: string;
  icon: string;
  badge: string;
}

export const PARTICLE_PRESET_CATALOG: ParticlePresetMeta[] = [
  {
    id: 'constellation',
    name: 'Cosmic Constellation',
    tagline: 'Starlight nodes linked by dynamic neural lines that react to your cursor.',
    icon: '✨',
    badge: 'Default FX',
  },
  {
    id: 'fireflies',
    name: 'Golden Fireflies',
    tagline: 'Warm, softly pulsing bioluminescent orbs drifting across your study space.',
    icon: '萤',
    badge: 'Cozy Glow',
  },
  {
    id: 'bubbles',
    name: 'Playful Bubbles',
    tagline: 'Iridescent floating bubbles that pop and scatter when clicked.',
    icon: '🫧',
    badge: 'All Ages Fun',
  },
  {
    id: 'scholar_sparks',
    name: 'Scholarly Runes & Sparks',
    tagline: 'Floating quiz glyphs (?, ★, ⚡, π, ∑, 💡) celebrating curiosity.',
    icon: '⚡',
    badge: 'Brain Gym',
  },
  {
    id: 'sakura',
    name: 'Sakura Blossom Drift',
    tagline: 'Gentle cherry blossom petals carried on a calm spring breeze.',
    icon: '🌸',
    badge: 'Zen Focus',
  },
  {
    id: 'snowfall',
    name: 'Aurora Crystal Snow',
    tagline: 'Crisp winter starflakes drifting softly through twilight air.',
    icon: '❄️',
    badge: 'Chill',
  },
];

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
  uiStyle: UiStyleMode;
  setUiStyle: (style: UiStyleMode) => void;
  uiTheme: UiThemeId;
  setUiTheme: (themeId: UiThemeId) => void;
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
  particlesEnabled: boolean;
  setParticlesEnabled: (val: boolean) => void;
  particlePreset: ParticlePresetType;
  setParticlePreset: (preset: ParticlePresetType) => void;
  particleDensity: ParticleDensityType;
  setParticleDensity: (density: ParticleDensityType) => void;
  particleSpeed: ParticleSpeedType;
  setParticleSpeed: (speed: ParticleSpeedType) => void;
  particleInteractive: boolean;
  setParticleInteractive: (val: boolean) => void;
  ambientOrbsEnabled: boolean;
  setAmbientOrbsEnabled: (val: boolean) => void;
  eyeComfortWarmth: number;
  setEyeComfortWarmth: (val: number) => void;
  adaptiveDifficultyEnabled: boolean;
  setAdaptiveDifficultyEnabled: (val: boolean) => void;
  streakShieldAutoEnabled: boolean;
  setStreakShieldAutoEnabled: (val: boolean) => void;
  graphicsMode: GraphicsQualityMode;
  setGraphicsMode: (mode: GraphicsQualityMode) => void;
  rtxEnabled: boolean;
  setRtxEnabled: (val: boolean) => void;
  rtxGlobalIllumination: boolean;
  setRtxGlobalIllumination: (val: boolean) => void;
  rtxReflections: boolean;
  setRtxReflections: (val: boolean) => void;
  rtxVolumetricBloom: boolean;
  setRtxVolumetricBloom: (val: boolean) => void;
  fpsCounterEnabled: boolean;
  setFpsCounterEnabled: (val: boolean) => void;
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
const UI_STYLE_KEY = 'quizme_ui_style_v1';
const UI_THEME_KEY = 'quizme_ui_theme_v1';
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
const PARTICLES_ENABLED_KEY = 'quizme_particles_enabled_v1';
const PARTICLE_PRESET_KEY = 'quizme_particle_preset_v1';
const PARTICLE_DENSITY_KEY = 'quizme_particle_density_v1';
const PARTICLE_SPEED_KEY = 'quizme_particle_speed_v1';
const PARTICLE_INTERACTIVE_KEY = 'quizme_particle_interactive_v1';
const AMBIENT_ORBS_KEY = 'quizme_ambient_orbs_v1';
const EYE_WARMTH_KEY = 'quizme_eye_warmth_v1';
const ADAPTIVE_DIFF_KEY = 'quizme_adaptive_diff_v1';
const STREAK_SHIELD_KEY = 'quizme_streak_shield_v1';
const GRAPHICS_MODE_KEY = 'quizme_graphics_mode_v1';
const RTX_ENABLED_KEY = 'quizme_rtx_enabled_v1';
const RTX_GI_KEY = 'quizme_rtx_gi_v1';
const RTX_REFLECTIONS_KEY = 'quizme_rtx_reflections_v1';
const RTX_BLOOM_KEY = 'quizme_rtx_bloom_v1';
const FPS_COUNTER_KEY = 'quizme_fps_counter_v1';
const VOLUME_KEY = 'quizme_sound_volume';
const LAYOUT_KEY = 'quizme_question_layout_v1';
const AUTOREAD_KEY = 'quizme_auto_read_tts_v1';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = safeGetStorage(THEME_KEY) as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'light';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    const saved = safeGetStorage(ACCENT_KEY) as AccentColor;
    if (saved && ACCENT_PALETTES[saved]) return saved;
    return 'indigo';
  });

  const [fontFamily, setFontFamilyState] = useState<FontFamilyChoice>(() => {
    const saved = safeGetStorage(FONT_KEY) as FontFamilyChoice;
    if (FONT_CATALOG.some((f) => f.id === saved)) return saved;
    return 'sans';
  });

  const [uiStyle, setUiStyleState] = useState<UiStyleMode>(() => {
    const saved = safeGetStorage(UI_STYLE_KEY) as UiStyleMode;
    if (['default', '3d', 'modern', 'legacy', 'playful'].includes(saved)) return saved;
    return 'default';
  });

  const [uiTheme, setUiThemeState] = useState<UiThemeId>(() => {
    const saved = safeGetStorage(UI_THEME_KEY) as UiThemeId;
    if (UI_THEME_CATALOG.some((t) => t.id === saved)) return saved;
    return 'comic_pop';
  });

  const [uiDensity, setUiDensityState] = useState<UiDensity>(() => {
    const saved = safeGetStorage(DENSITY_KEY) as UiDensity;
    if (saved === 'compact' || saved === 'comfortable') return saved;
    return 'comfortable';
  });

  const [cardRadius, setCardRadiusState] = useState<CardCornerRadius>(() => {
    const saved = safeGetStorage(RADIUS_KEY) as CardCornerRadius;
    if (['3xl', '2xl', 'xl', 'md'].includes(saved)) return saved;
    return '3xl';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return safeGetStorage(CONTRAST_KEY) === 'true';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return safeGetStorage(MOTION_KEY) === 'true';
  });

  const [animationStyle, setAnimationStyleState] = useState<AnimationStyle>(() => {
    const saved = safeGetStorage(ANIM_STYLE_KEY) as AnimationStyle;
    if (['bouncy', 'smooth', 'snappy', 'minimal'].includes(saved)) return saved;
    return 'bouncy';
  });

  const [animationIntensity, setAnimationIntensityState] = useState<AnimationIntensity>(() => {
    const saved = safeGetStorage(ANIM_INTENSITY_KEY) as AnimationIntensity;
    if (['subtle', 'normal', 'extra'].includes(saved)) return saved;
    return 'normal';
  });

  const [buttonBounceEnabled, setButtonBounceEnabledState] = useState<boolean>(() => {
    return safeGetStorage(BTN_BOUNCE_KEY) !== 'false';
  });

  const [cardHoverLiftEnabled, setCardHoverLiftEnabledState] = useState<boolean>(() => {
    return safeGetStorage(CARD_LIFT_KEY) !== 'false';
  });

  const [confettiEnabled, setConfettiEnabledState] = useState<boolean>(() => {
    return safeGetStorage(CONFETTI_KEY) !== 'false';
  });

  const [particlesEnabled, setParticlesEnabledState] = useState<boolean>(() => {
    return safeGetStorage(PARTICLES_ENABLED_KEY) !== 'false';
  });

  const [particlePreset, setParticlePresetState] = useState<ParticlePresetType>(() => {
    const saved = safeGetStorage(PARTICLE_PRESET_KEY) as ParticlePresetType;
    if (PARTICLE_PRESET_CATALOG.some((p) => p.id === saved)) return saved;
    return 'constellation';
  });

  const [particleDensity, setParticleDensityState] = useState<ParticleDensityType>(() => {
    const saved = safeGetStorage(PARTICLE_DENSITY_KEY) as ParticleDensityType;
    if (['low', 'medium', 'high'].includes(saved)) return saved;
    return 'medium';
  });

  const [particleSpeed, setParticleSpeedState] = useState<ParticleSpeedType>(() => {
    const saved = safeGetStorage(PARTICLE_SPEED_KEY) as ParticleSpeedType;
    if (['slow', 'normal', 'fast'].includes(saved)) return saved;
    return 'normal';
  });

  const [particleInteractive, setParticleInteractiveState] = useState<boolean>(() => {
    return safeGetStorage(PARTICLE_INTERACTIVE_KEY) !== 'false';
  });

  const [ambientOrbsEnabled, setAmbientOrbsEnabledState] = useState<boolean>(() => {
    return safeGetStorage(AMBIENT_ORBS_KEY) !== 'false';
  });

  const [eyeComfortWarmth, setEyeComfortWarmthState] = useState<number>(() => {
    const saved = safeGetStorage(EYE_WARMTH_KEY);
    if (saved !== null) {
      const parsed = Number(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 40) return parsed;
    }
    return 0;
  });

  const [adaptiveDifficultyEnabled, setAdaptiveDifficultyEnabledState] = useState<boolean>(() => {
    return safeGetStorage(ADAPTIVE_DIFF_KEY) !== 'false';
  });

  const [streakShieldAutoEnabled, setStreakShieldAutoEnabledState] = useState<boolean>(() => {
    return safeGetStorage(STREAK_SHIELD_KEY) !== 'false';
  });

  const [graphicsMode, setGraphicsModeState] = useState<GraphicsQualityMode>(() => {
    const saved = safeGetStorage(GRAPHICS_MODE_KEY) as GraphicsQualityMode;
    if (['simple', 'medium', 'performance', 'ultra'].includes(saved)) return saved;
    return 'performance';
  });

  const [rtxEnabled, setRtxEnabledState] = useState<boolean>(() => {
    return safeGetStorage(RTX_ENABLED_KEY) !== 'false';
  });

  const [rtxGlobalIllumination, setRtxGlobalIlluminationState] = useState<boolean>(() => {
    return safeGetStorage(RTX_GI_KEY) !== 'false';
  });

  const [rtxReflections, setRtxReflectionsState] = useState<boolean>(() => {
    return safeGetStorage(RTX_REFLECTIONS_KEY) !== 'false';
  });

  const [rtxVolumetricBloom, setRtxVolumetricBloomState] = useState<boolean>(() => {
    return safeGetStorage(RTX_BLOOM_KEY) !== 'false';
  });

  const [fpsCounterEnabled, setFpsCounterEnabledState] = useState<boolean>(() => {
    return safeGetStorage(FPS_COUNTER_KEY) === 'true';
  });

  const [soundVolume, setSoundVolumeState] = useState<number>(() => {
    const saved = safeGetStorage(VOLUME_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
    return 0.85;
  });

  const [questionLayout, setQuestionLayoutState] = useState<QuestionLayoutStyle>(() => {
    const saved = safeGetStorage(LAYOUT_KEY) as QuestionLayoutStyle;
    if (['stacked', 'split', 'focus'].includes(saved)) return saved;
    return 'stacked';
  });

  const [autoReadQuestions, setAutoReadQuestionsState] = useState<boolean>(() => {
    return safeGetStorage(AUTOREAD_KEY) === 'true';
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
    isCardLift: boolean = cardHoverLiftEnabled,
    currentGfx: GraphicsQualityMode = graphicsMode,
    isRtx: boolean = rtxEnabled,
    isRtxGi: boolean = rtxGlobalIllumination,
    isRtxRefl: boolean = rtxReflections,
    isRtxBloom: boolean = rtxVolumetricBloom
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
    root.setAttribute('data-ui-style', uiStyle);
    root.setAttribute('data-ui-theme', uiTheme);
    root.setAttribute('data-font', currentFont);
    root.setAttribute('data-density', currentDensity);
    root.setAttribute('data-radius', currentRadius);
    root.setAttribute('data-contrast', isHighContrast ? 'high' : 'standard');
    root.setAttribute('data-motion', effectiveStyle === 'minimal' ? 'reduced' : effectiveStyle);
    root.setAttribute('data-animation-style', effectiveStyle);
    root.setAttribute('data-animation-intensity', currentAnimIntensity);
    root.setAttribute('data-button-bounce', isBtnBounce && effectiveStyle !== 'minimal' ? 'true' : 'false');
    root.setAttribute('data-card-lift', isCardLift && effectiveStyle !== 'minimal' ? 'true' : 'false');
    root.setAttribute('data-graphics-mode', currentGfx);
    root.setAttribute('data-rtx', isRtx && currentGfx !== 'simple' ? 'true' : 'false');
    root.setAttribute('data-rtx-gi', isRtx && isRtxGi && currentGfx !== 'simple' ? 'true' : 'false');
    root.setAttribute('data-rtx-reflections', isRtx && isRtxRefl && currentGfx !== 'simple' ? 'true' : 'false');
    root.setAttribute('data-rtx-bloom', isRtx && isRtxBloom && currentGfx !== 'simple' ? 'true' : 'false');

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
        cardHoverLiftEnabled,
        graphicsMode,
        rtxEnabled,
        rtxGlobalIllumination,
        rtxReflections,
        rtxVolumetricBloom
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
    uiStyle,
    uiTheme,
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
    graphicsMode,
    rtxEnabled,
    rtxGlobalIllumination,
    rtxReflections,
    rtxVolumetricBloom,
  ]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    safeSetStorage(THEME_KEY, newTheme);
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
    safeSetStorage(ACCENT_KEY, newAccent);
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
    safeSetStorage(FONT_KEY, newFont);
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

  const setUiStyle = (newStyle: UiStyleMode) => {
    setUiStyleState(newStyle);
    safeSetStorage(UI_STYLE_KEY, newStyle);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-ui-style', newStyle);
    }
    if (newStyle === 'playful') {
      setFontFamily('fredoka');
      setCardRadius('3xl');
      setAnimationStyle('bouncy');
    } else if (newStyle === 'legacy') {
      setFontFamily('lora');
      setCardRadius('md');
      setAnimationStyle('minimal');
    } else if (newStyle === 'modern') {
      setFontFamily('sora');
      setCardRadius('2xl');
      setAnimationStyle('smooth');
    } else if (newStyle === '3d') {
      setFontFamily('outfit');
      setCardRadius('2xl');
      setAnimationStyle('snappy');
    } else {
      setFontFamily('sans');
      setCardRadius('3xl');
      setAnimationStyle('smooth');
    }
  };

  const setUiTheme = (newUiTheme: UiThemeId) => {
    setUiThemeState(newUiTheme);
    safeSetStorage(UI_THEME_KEY, newUiTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-ui-theme', newUiTheme);
    }
    const meta = UI_THEME_CATALOG.find((t) => t.id === newUiTheme);
    if (meta) {
      setAccent(meta.recommendedAccent);
    }
  };

  const setUiDensity = (newDensity: UiDensity) => {
    setUiDensityState(newDensity);
    safeSetStorage(DENSITY_KEY, newDensity);
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
    safeSetStorage(RADIUS_KEY, newRadius);
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
    safeSetStorage(CONTRAST_KEY, String(val));
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
    safeSetStorage(MOTION_KEY, String(val));
    if (val) {
      setAnimationStyleState('minimal');
      safeSetStorage(ANIM_STYLE_KEY, 'minimal');
    } else if (animationStyle === 'minimal') {
      setAnimationStyleState('bouncy');
      safeSetStorage(ANIM_STYLE_KEY, 'bouncy');
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
    safeSetStorage(ANIM_STYLE_KEY, style);
    const isMin = style === 'minimal';
    setReducedMotionState(isMin);
    safeSetStorage(MOTION_KEY, String(isMin));
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
    safeSetStorage(ANIM_INTENSITY_KEY, intensity);
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
    safeSetStorage(BTN_BOUNCE_KEY, String(val));
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
    safeSetStorage(CARD_LIFT_KEY, String(val));
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
    safeSetStorage(CONFETTI_KEY, String(val));
  };

  const setParticlesEnabled = (val: boolean) => {
    setParticlesEnabledState(val);
    safeSetStorage(PARTICLES_ENABLED_KEY, String(val));
  };

  const setParticlePreset = (preset: ParticlePresetType) => {
    setParticlePresetState(preset);
    safeSetStorage(PARTICLE_PRESET_KEY, preset);
  };

  const setParticleDensity = (density: ParticleDensityType) => {
    setParticleDensityState(density);
    safeSetStorage(PARTICLE_DENSITY_KEY, density);
  };

  const setParticleSpeed = (speed: ParticleSpeedType) => {
    setParticleSpeedState(speed);
    safeSetStorage(PARTICLE_SPEED_KEY, speed);
  };

  const setParticleInteractive = (val: boolean) => {
    setParticleInteractiveState(val);
    safeSetStorage(PARTICLE_INTERACTIVE_KEY, String(val));
  };

  const setAmbientOrbsEnabled = (val: boolean) => {
    setAmbientOrbsEnabledState(val);
    safeSetStorage(AMBIENT_ORBS_KEY, String(val));
  };

  const setEyeComfortWarmth = (val: number) => {
    const clamped = Math.max(0, Math.min(40, Math.round(val)));
    setEyeComfortWarmthState(clamped);
    safeSetStorage(EYE_WARMTH_KEY, String(clamped));
  };

  const setAdaptiveDifficultyEnabled = (val: boolean) => {
    setAdaptiveDifficultyEnabledState(val);
    safeSetStorage(ADAPTIVE_DIFF_KEY, String(val));
  };

  const setStreakShieldAutoEnabled = (val: boolean) => {
    setStreakShieldAutoEnabledState(val);
    safeSetStorage(STREAK_SHIELD_KEY, String(val));
  };

  const setGraphicsMode = (mode: GraphicsQualityMode) => {
    setGraphicsModeState(mode);
    safeSetStorage(GRAPHICS_MODE_KEY, mode);

    if (mode === 'simple') {
      setParticlesEnabled(false);
      setAmbientOrbsEnabled(false);
      setRtxEnabled(false);
      setAnimationStyle('smooth');
      setCardHoverLiftEnabled(false);
    } else if (mode === 'medium') {
      setParticlesEnabled(true);
      setParticleDensity('medium');
      setParticleSpeed('normal');
      setAmbientOrbsEnabled(true);
      setRtxEnabled(false);
      setAnimationStyle('smooth');
      setCardHoverLiftEnabled(true);
    } else if (mode === 'performance') {
      setParticlesEnabled(true);
      setParticleDensity('low');
      setParticleSpeed('fast');
      setAmbientOrbsEnabled(false);
      setRtxEnabled(false);
      setAnimationStyle('snappy');
      setAnimationIntensity('normal');
      setButtonBounceEnabled(true);
      setCardHoverLiftEnabled(true);
    } else if (mode === 'ultra') {
      setParticlesEnabled(true);
      setParticleDensity('high');
      setParticleSpeed('normal');
      setParticleInteractive(true);
      setAmbientOrbsEnabled(true);
      setRtxEnabled(true);
      setRtxGlobalIllumination(true);
      setRtxReflections(true);
      setRtxVolumetricBloom(true);
      setAnimationStyle('bouncy');
      setAnimationIntensity('extra');
      setButtonBounceEnabled(true);
      setCardHoverLiftEnabled(true);
    }
  };

  const setRtxEnabled = (val: boolean) => {
    setRtxEnabledState(val);
    safeSetStorage(RTX_ENABLED_KEY, String(val));
  };

  const setRtxGlobalIllumination = (val: boolean) => {
    setRtxGlobalIlluminationState(val);
    safeSetStorage(RTX_GI_KEY, String(val));
  };

  const setRtxReflections = (val: boolean) => {
    setRtxReflectionsState(val);
    safeSetStorage(RTX_REFLECTIONS_KEY, String(val));
  };

  const setRtxVolumetricBloom = (val: boolean) => {
    setRtxVolumetricBloomState(val);
    safeSetStorage(RTX_BLOOM_KEY, String(val));
  };

  const setFpsCounterEnabled = (val: boolean) => {
    setFpsCounterEnabledState(val);
    safeSetStorage(FPS_COUNTER_KEY, String(val));
  };

  const setSoundVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSoundVolumeState(clamped);
    soundFx.setVolume(clamped);
    safeSetStorage(VOLUME_KEY, String(clamped));
  };

  const setQuestionLayout = (layout: QuestionLayoutStyle) => {
    setQuestionLayoutState(layout);
    safeSetStorage(LAYOUT_KEY, layout);
  };

  const setAutoReadQuestions = (val: boolean) => {
    setAutoReadQuestionsState(val);
    safeSetStorage(AUTOREAD_KEY, String(val));
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
    setParticlesEnabled(true);
    setParticlePreset('constellation');
    setParticleDensity('medium');
    setParticleSpeed('normal');
    setParticleInteractive(true);
    setAmbientOrbsEnabled(true);
    setEyeComfortWarmth(0);
    setAdaptiveDifficultyEnabled(true);
    setStreakShieldAutoEnabled(true);
    setGraphicsMode('ultra');
    setRtxEnabled(true);
    setRtxGlobalIllumination(true);
    setRtxReflections(true);
    setRtxVolumetricBloom(true);
    setFpsCounterEnabled(false);
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
        uiStyle,
        setUiStyle,
        uiTheme,
        setUiTheme,
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


