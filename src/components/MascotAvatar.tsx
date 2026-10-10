import React, { useId, useState, useEffect } from 'react';

export type MascotMood =
  | 'idle'
  | 'happy'
  | 'celebrate'
  | 'thinking'
  | 'encourage'
  | 'comforting'
  | 'streak'
  | 'teacher'
  | 'trophy';

export type MascotCharacter =
  | 'quizzie'
  | 'foxy'
  | 'astro'
  | 'boba'
  | 'sparky'
  | 'pixel'
  | 'zeno'
  | 'nova'
  | 'atlas'
  | 'solaris';

export type MascotColorTheme =
  | 'indigo'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'sky';

export type MascotAccessory =
  | 'none'
  | 'scholar_glasses'
  | 'bow_tie'
  | 'party_hat'
  | 'headphones'
  | 'detective_monocle'
  | 'viking_helm'
  | 'pirate_tricorn'
  | 'wizard_hat'
  | 'angel_halo'
  | 'cyber_visor'
  | 'royal_crown';

export interface MascotCharacterMeta {
  id: MascotCharacter;
  name: string;
  title: string;
  species: string;
  tagline: string;
  greeting?: string;
  uniquePose: string;
  defaultTheme: MascotColorTheme;
  defaultAccessory?: MascotAccessory;
  appIconUrl?: string;
  costCoins: number;
  rarity: 'Starter' | 'Rare' | 'Epic' | 'Legendary';
}

export const MASCOT_APP_ICON_MAP: Record<MascotCharacter, string> = {
  quizzie: '',
  foxy: '',
  astro: '',
  boba: '',
  sparky: '',
  pixel: '',
  zeno: '',
  nova: '',
  atlas: '',
  solaris: '',
};

export interface MascotAccessoryMeta {
  id: MascotAccessory;
  name: string;
  category: 'None' | 'Eyewear' | 'Headwear' | 'Flair' | 'Aura';
  description: string;
  costCoins: number;
  rarity: 'Starter' | 'Rare' | 'Epic' | 'Legendary';
  previewEmoji: string;
}

export const MASCOT_CATALOG: MascotCharacterMeta[] = [
  {
    id: 'quizzie',
    name: 'Quizzie',
    title: 'Quizzie the Owl',
    species: 'Mystical Arcane Owl',
    tagline: 'Wisdom & deep mastery',
    uniquePose: 'Mystic Lightbulb Tome',
    defaultTheme: 'violet',
    defaultAccessory: 'scholar_glasses',
    appIconUrl: '/src/assets/images/mascot_icon_quizzie_1791114060337.jpg',
    costCoins: 0,
    rarity: 'Starter',
  },
  {
    id: 'foxy',
    name: 'Foxy',
    title: 'Foxy the Fox',
    species: 'Electric Kitsune Fox',
    tagline: 'Quick thinking & sharp logic',
    uniquePose: 'Clever Kitsune Chin Pose',
    defaultTheme: 'sky',
    defaultAccessory: 'bow_tie',
    appIconUrl: '/src/assets/images/mascot_icon_foxy_1791114068832.jpg',
    costCoins: 0,
    rarity: 'Starter',
  },
  {
    id: 'astro',
    name: 'Astro',
    title: 'Astro the Cat',
    species: 'Cosmic Nebula Kitten',
    tagline: 'Curiosity & STEM discovery',
    uniquePose: 'Starlight Helmet & Tablet',
    defaultTheme: 'indigo',
    defaultAccessory: 'headphones',
    appIconUrl: '/src/assets/images/mascot_icon_astro_1791114028726.jpg',
    costCoins: 0,
    rarity: 'Starter',
  },
  {
    id: 'boba',
    name: 'Boba',
    title: 'Boba the Bear',
    species: 'Botanical Leaf Koala-Bear',
    tagline: 'Calm focus & steady memory',
    uniquePose: 'Greenhouse Scholar Tome',
    defaultTheme: 'emerald',
    defaultAccessory: 'party_hat',
    appIconUrl: '/src/assets/images/mascot_icon_boba_1791114040082.jpg',
    costCoins: 0,
    rarity: 'Starter',
  },
  {
    id: 'sparky',
    name: 'Sparky',
    title: 'Sparky the Dragon',
    species: 'Fiery Ember Drake',
    tagline: 'Fierce streaks & bold challenges',
    uniquePose: 'Flame-Tail Book Master',
    defaultTheme: 'rose',
    defaultAccessory: 'viking_helm',
    appIconUrl: '/src/assets/images/mascot_icon_sparky_1791114048182.jpg',
    costCoins: 0,
    rarity: 'Starter',
  },
  {
    id: 'pixel',
    name: 'Pixel',
    title: 'Pixel the Axolotl',
    species: 'Neon Cyber Axolotl',
    tagline: 'Regenerative memory & coding wizardry',
    uniquePose: 'Peace-Sign Wave',
    defaultTheme: 'sky',
    defaultAccessory: 'cyber_visor',
    costCoins: 25,
    rarity: 'Rare',
  },
  {
    id: 'zeno',
    name: 'Zeno',
    title: 'Zeno the Shiba',
    species: 'Loyal Scholar Shiba Inu',
    tagline: 'Unbreakable daily streak guardian',
    uniquePose: 'Heroic Scarf Salute',
    defaultTheme: 'amber',
    defaultAccessory: 'detective_monocle',
    costCoins: 35,
    rarity: 'Rare',
  },
  {
    id: 'nova',
    name: 'Nova',
    title: 'Nova the Unicorn',
    species: 'Starlight Astral Alicorn',
    tagline: 'Creative brilliance & imagination',
    uniquePose: 'Magical Prancing Rear-Up',
    defaultTheme: 'violet',
    defaultAccessory: 'wizard_hat',
    costCoins: 50,
    rarity: 'Epic',
  },
  {
    id: 'atlas',
    name: 'Atlas',
    title: 'Atlas the Penguin',
    species: 'Emperor Navigator Penguin',
    tagline: 'Cool-headed exam tactician',
    uniquePose: "Explorer's Golden Compass",
    defaultTheme: 'sky',
    defaultAccessory: 'pirate_tricorn',
    costCoins: 65,
    rarity: 'Epic',
  },
  {
    id: 'solaris',
    name: 'Solaris',
    title: 'Solaris the Phoenix',
    species: 'Mythic Golden Sunbird',
    tagline: 'Grandmaster perfection & eternal fire',
    uniquePose: 'Radiant Sunburst Crest',
    defaultTheme: 'rose',
    defaultAccessory: 'royal_crown',
    costCoins: 100,
    rarity: 'Legendary',
  },
];

export const MASCOT_ACCESSORY_CATALOG: MascotAccessoryMeta[] = [
  {
    id: 'none',
    name: 'No Accessory',
    category: 'None',
    description: 'Natural mascot look with their signature pose.',
    costCoins: 0,
    rarity: 'Starter',
    previewEmoji: '✨',
  },
  {
    id: 'scholar_glasses',
    name: 'Gold Scholar Frames',
    category: 'Eyewear',
    description: 'Classic round golden frames for sharp focus.',
    costCoins: 12,
    rarity: 'Starter',
    previewEmoji: '👓',
  },
  {
    id: 'bow_tie',
    name: 'Crimson Silk Bowtie',
    category: 'Flair',
    description: 'Dapper professor bowtie worn proudly under the chin.',
    costCoins: 15,
    rarity: 'Starter',
    previewEmoji: '🎀',
  },
  {
    id: 'party_hat',
    name: 'Starlight Party Cone',
    category: 'Headwear',
    description: 'Festive striped celebration cone with a golden pom-pom.',
    costCoins: 18,
    rarity: 'Rare',
    previewEmoji: '🎉',
  },
  {
    id: 'headphones',
    name: 'Studio Beats Headset',
    category: 'Headwear',
    description: 'Over-ear study headphones for deep lo-fi focus.',
    costCoins: 22,
    rarity: 'Rare',
    previewEmoji: '🎧',
  },
  {
    id: 'detective_monocle',
    name: 'Sherlock Monocle',
    category: 'Eyewear',
    description: 'Polished brass monocle with a delicate gold chain.',
    costCoins: 28,
    rarity: 'Rare',
    previewEmoji: '🧐',
  },
  {
    id: 'viking_helm',
    name: 'Valhalla Horned Helm',
    category: 'Headwear',
    description: 'Fierce Nordic iron helmet with curved ivory horns.',
    costCoins: 35,
    rarity: 'Epic',
    previewEmoji: '⚔️',
  },
  {
    id: 'pirate_tricorn',
    name: "Captain's Tricorn Hat",
    category: 'Headwear',
    description: 'Swashbuckling captain hat with a golden skull crest.',
    costCoins: 40,
    rarity: 'Epic',
    previewEmoji: '🏴‍☠️',
  },
  {
    id: 'wizard_hat',
    name: 'Archmage Star Hat',
    category: 'Headwear',
    description: 'Mystic indigo pointed hat adorned with moons and stars.',
    costCoins: 45,
    rarity: 'Epic',
    previewEmoji: '🧙',
  },
  {
    id: 'angel_halo',
    name: 'Radiant Golden Halo',
    category: 'Aura',
    description: 'Floating luminous ring of pure golden light.',
    costCoins: 55,
    rarity: 'Epic',
    previewEmoji: '😇',
  },
  {
    id: 'cyber_visor',
    name: 'Neon Cyber Visor',
    category: 'Eyewear',
    description: 'Holographic cyan-magenta HUD visor from 2099.',
    costCoins: 65,
    rarity: 'Legendary',
    previewEmoji: '🥽',
  },
  {
    id: 'royal_crown',
    name: 'Sovereign Gem Crown',
    category: 'Headwear',
    description: 'Solid gold grandmaster crown set with rubies and sapphires.',
    costCoins: 85,
    rarity: 'Legendary',
    previewEmoji: '👑',
  },
];

export const MASCOT_THEME_CATALOG: Array<{
  id: MascotColorTheme;
  label: string;
  swatchClass: string;
  bgHex: string;
}> = [
  { id: 'indigo', label: 'Royal Indigo', swatchClass: 'bg-indigo-600', bgHex: '#312e81' },
  { id: 'violet', label: 'Cosmic Violet', swatchClass: 'bg-violet-600', bgHex: '#4c1d95' },
  { id: 'emerald', label: 'Sage Emerald', swatchClass: 'bg-emerald-600', bgHex: '#064e3b' },
  { id: 'amber', label: 'Solar Amber', swatchClass: 'bg-amber-500', bgHex: '#78350f' },
  { id: 'rose', label: 'Crimson Rose', swatchClass: 'bg-rose-600', bgHex: '#881337' },
  { id: 'sky', label: 'Glacier Sky', swatchClass: 'bg-sky-500', bgHex: '#0c4a6e' },
];

export const MASCOT_STORAGE_KEYS = {
  CHARACTER: 'quizme_mascot_character_v1',
  THEME: 'quizme_mascot_theme_v1',
  ACCESSORY: 'quizme_mascot_accessory_v1',
  COINS: 'quizme_mascot_coins_v1',
  UNLOCKED_MASCOTS: 'quizme_unlocked_mascots_v1',
  UNLOCKED_ACCESSORIES: 'quizme_unlocked_accessories_v1',
};

const DEFAULT_UNLOCKED_MASCOTS: MascotCharacter[] = [
  'quizzie',
  'foxy',
  'astro',
  'boba',
  'sparky',
];

const DEFAULT_UNLOCKED_ACCESSORIES: MascotAccessory[] = ['none'];

const THEME_PALETTES: Record<
  MascotColorTheme,
  {
    bodyStart: string;
    bodyMid: string;
    bodyEnd: string;
    wingStart: string;
    wingEnd: string;
    earInner: string;
    accent: string;
    capTop: string;
    capBase: string;
    glowClass: string;
    bgHexStart: string;
    bgHexEnd: string;
  }
> = {
  indigo: {
    bodyStart: '#818cf8',
    bodyMid: '#6366f1',
    bodyEnd: '#4338ca',
    wingStart: '#4f46e5',
    wingEnd: '#3730a3',
    earInner: '#c7d2fe',
    accent: '#f59e0b',
    capTop: '#1e1b4b',
    capBase: '#312e81',
    glowClass: 'from-indigo-500/30 via-purple-500/20 to-amber-400/20',
    bgHexStart: '#4338ca',
    bgHexEnd: '#1e1b4b',
  },
  violet: {
    bodyStart: '#c084fc',
    bodyMid: '#9333ea',
    bodyEnd: '#6b21a8',
    wingStart: '#7e22ce',
    wingEnd: '#581c87',
    earInner: '#e9d5ff',
    accent: '#fbbf24',
    capTop: '#2e1065',
    capBase: '#4c1d95',
    glowClass: 'from-violet-500/30 via-fuchsia-500/20 to-amber-400/20',
    bgHexStart: '#7e22ce',
    bgHexEnd: '#2e1065',
  },
  emerald: {
    bodyStart: '#34d399',
    bodyMid: '#10b981',
    bodyEnd: '#047857',
    wingStart: '#059669',
    wingEnd: '#065f46',
    earInner: '#a7f3d0',
    accent: '#f59e0b',
    capTop: '#022c22',
    capBase: '#064e3b',
    glowClass: 'from-emerald-500/30 via-teal-500/20 to-amber-400/20',
    bgHexStart: '#059669',
    bgHexEnd: '#022c22',
  },
  amber: {
    bodyStart: '#fbbf24',
    bodyMid: '#f59e0b',
    bodyEnd: '#b45309',
    wingStart: '#d97706',
    wingEnd: '#92400e',
    earInner: '#fde68a',
    accent: '#ef4444',
    capTop: '#451a03',
    capBase: '#78350f',
    glowClass: 'from-amber-500/30 via-orange-500/20 to-yellow-400/20',
    bgHexStart: '#d97706',
    bgHexEnd: '#451a03',
  },
  rose: {
    bodyStart: '#fb7185',
    bodyMid: '#f43f5e',
    bodyEnd: '#be123c',
    wingStart: '#e11d48',
    wingEnd: '#9f1239',
    earInner: '#fecdd3',
    accent: '#fbbf24',
    capTop: '#4c0519',
    capBase: '#881337',
    glowClass: 'from-rose-500/30 via-pink-500/20 to-amber-400/20',
    bgHexStart: '#e11d48',
    bgHexEnd: '#4c0519',
  },
  sky: {
    bodyStart: '#38bdf8',
    bodyMid: '#0ea5e9',
    bodyEnd: '#0369a1',
    wingStart: '#0284c7',
    wingEnd: '#075985',
    earInner: '#bae6fd',
    accent: '#f59e0b',
    capTop: '#082f49',
    capBase: '#0c4a6e',
    glowClass: 'from-sky-500/30 via-cyan-500/20 to-amber-400/20',
    bgHexStart: '#0284c7',
    bgHexEnd: '#082f49',
  },
};

/**
 * Challenging Mascot Coin calculation for quiz completions:
 * - Below 80% accuracy: 0 Mascot Coins (requires real mastery!)
 * - 80% to 89% accuracy: +2 Mascot Coins
 * - 90% to 99% accuracy: +4 Mascot Coins
 * - 100% Perfect Score (at least 3 questions): +8 Mascot Coins
 * - Master/Hard difficulty bonus (with 80%+): +3 Mascot Coins
 * - 5+ Day Streak bonus (with 80%+): +2 Mascot Coins
 */
export function calculateQuizMascotCoinsEarned(
  score: number,
  total: number,
  difficulty?: string,
  streak?: number
): { coins: number; breakdown: string[] } {
  if (total <= 0) return { coins: 0, breakdown: [] };
  const pct = Math.round((score / total) * 100);
  if (pct < 80) {
    return {
      coins: 0,
      breakdown: ['Score 80%+ on a quiz to earn Mascot Coins!'],
    };
  }

  let coins = 0;
  const breakdown: string[] = [];

  if (pct === 100 && total >= 3) {
    coins += 8;
    breakdown.push('Flawless 100% Score (+8 Coins)');
  } else if (pct >= 90) {
    coins += 4;
    breakdown.push('90%+ High Mastery (+4 Coins)');
  } else {
    coins += 2;
    breakdown.push('80%+ Solid Pass (+2 Coins)');
  }

  if (difficulty === 'Master' || difficulty === 'Hard') {
    coins += 3;
    breakdown.push('Master Difficulty Bonus (+3 Coins)');
  }

  if ((streak || 0) >= 5) {
    coins += 2;
    breakdown.push('5+ Day Streak Multiplier (+2 Coins)');
  }

  return { coins, breakdown };
}

/**
 * Generates a standalone SVG string representing the customized mascot
 * (including character, unique pose, theme color aura, and equipped accessory)
 * for dynamic browser favicon, Apple touch icon, and desktop PWA app icon.
 */
export function generateMascotIconSvgString(
  character: MascotCharacter,
  theme: MascotColorTheme,
  accessory: MascotAccessory
): string {
  const palette = THEME_PALETTES[theme] || THEME_PALETTES.indigo;

  const renderCharacterIconLayer = () => {
    switch (character) {
      case 'foxy':
        return `
          <!-- Foxy Unique Pose: Clever Crossed Paws & Front-Curled Bushy Tail -->
          <path d="M 88 86 C 108 76, 114 96, 94 104 C 76 110, 56 108, 42 102 Z" fill="${palette.bodyStart}" />
          <path d="M 100 88 C 110 86, 110 98, 98 102 Z" fill="#ffffff" />
          <ellipse cx="60" cy="76" rx="34" ry="30" fill="${palette.bodyMid}" />
          <polygon points="26,56 16,20 46,44" fill="${palette.bodyEnd}" />
          <polygon points="28,52 21,26 42,44" fill="${palette.earInner}" />
          <polygon points="94,56 104,20 74,44" fill="${palette.bodyEnd}" />
          <polygon points="92,52 99,26 78,44" fill="${palette.earInner}" />
          <path d="M 26 74 Q 42 92 60 88 Q 78 92 94 74 Q 86 102 60 102 Q 34 102 26 74 Z" fill="#ffffff" />
          <!-- Crossed Paws -->
          <ellipse cx="48" cy="92" rx="11" ry="6" transform="rotate(14 48 92)" fill="${palette.bodyEnd}" stroke="#ffffff" stroke-width="1.5" />
          <ellipse cx="72" cy="92" rx="11" ry="6" transform="rotate(-14 72 92)" fill="${palette.bodyEnd}" stroke="#ffffff" stroke-width="1.5" />
        `;
      case 'astro':
        return `
          <!-- Astro Unique Pose: Zero-Gravity Star Reach -->
          <path d="M 90 92 C 110 82, 112 58, 98 52" stroke="${palette.bodyEnd}" stroke-width="7" stroke-linecap="round" fill="none" />
          <polygon points="30,52 22,22 50,40" fill="${palette.bodyMid}" />
          <polygon points="90,52 98,22 70,40" fill="${palette.bodyMid}" />
          <ellipse cx="60" cy="74" rx="35" ry="31" fill="${palette.bodyMid}" />
          <ellipse cx="60" cy="84" rx="22" ry="18" fill="#ffffff" opacity="0.92" />
          <!-- Raised Left Paw Reaching for Floating Star -->
          <ellipse cx="24" cy="58" rx="8" ry="13" transform="rotate(-28 24 58)" fill="#ffffff" stroke="${palette.bodyEnd}" stroke-width="2" />
          <polygon points="18,36 20,41 26,41 21,44 23,49 18,46 13,49 15,44 10,41 16,41" fill="#fbbf24" />
        `;
      case 'boba':
        return `
          <!-- Boba Unique Pose: Zen Boba Tea Sip -->
          <circle cx="30" cy="34" r="13" fill="${palette.capTop}" />
          <circle cx="90" cy="34" r="13" fill="${palette.capTop}" />
          <ellipse cx="60" cy="74" rx="37" ry="33" fill="#ffffff" stroke="${palette.bodyMid}" stroke-width="3" />
          <!-- Holding Boba Cup in Center -->
          <rect x="49" y="82" width="22" height="24" rx="5" fill="#fde68a" stroke="#d97706" stroke-width="2" />
          <line x1="60" y1="73" x2="64" y2="84" stroke="#ec4899" stroke-width="3.5" stroke-linecap="round" />
          <circle cx="54" cy="101" r="2.2" fill="#451a03" />
          <circle cx="60" cy="102" r="2.2" fill="#451a03" />
          <circle cx="66" cy="101" r="2.2" fill="#451a03" />
          <ellipse cx="46" cy="92" rx="7" ry="5" fill="${palette.capTop}" />
          <ellipse cx="74" cy="92" rx="7" ry="5" fill="${palette.capTop}" />
        `;
      case 'sparky':
        return `
          <!-- Sparky Unique Pose: Wing-Spread Flame Puff -->
          <path d="M 26 70 L 6 46 L 16 74 L 8 86 L 28 84 Z" fill="${palette.wingStart}" />
          <path d="M 94 70 L 114 46 L 104 74 L 112 86 L 92 84 Z" fill="${palette.wingStart}" />
          <path d="M 38 42 C 30 22, 20 18, 22 32 C 23 40, 32 46, 38 46 Z" fill="#fbbf24" />
          <path d="M 82 42 C 90 22, 100 18, 98 32 C 97 40, 88 46, 82 46 Z" fill="#fbbf24" />
          <ellipse cx="60" cy="76" rx="34" ry="31" fill="${palette.bodyMid}" />
          <ellipse cx="60" cy="86" rx="22" ry="18" fill="#fef3c7" />
          <circle cx="84" cy="76" r="5" fill="#fb923c" opacity="0.85" />
          <circle cx="92" cy="72" r="3.5" fill="#fde047" />
        `;
      case 'pixel':
        return `
          <!-- Pixel Unique Pose: Axolotl Frills & Peace-Sign Wave -->
          <path d="M 26 52 L 8 42 M 24 64 L 6 62 M 26 76 L 10 80" stroke="#f472b6" stroke-width="5" stroke-linecap="round" />
          <path d="M 94 52 L 112 42 M 96 64 L 114 62 M 94 76 L 110 80" stroke="#f472b6" stroke-width="5" stroke-linecap="round" />
          <ellipse cx="60" cy="74" rx="34" ry="30" fill="${palette.bodyStart}" />
          <ellipse cx="60" cy="84" rx="23" ry="17" fill="#ffffff" opacity="0.9" />
          <!-- Peace Sign Hand -->
          <circle cx="24" cy="84" r="7" fill="${palette.bodyStart}" stroke="#ffffff" stroke-width="1.5" />
          <line x1="21" y1="78" x2="18" y2="70" stroke="${palette.bodyStart}" stroke-width="3.5" stroke-linecap="round" />
          <line x1="26" y1="78" x2="28" y2="70" stroke="${palette.bodyStart}" stroke-width="3.5" stroke-linecap="round" />
        `;
      case 'zeno':
        return `
          <!-- Zeno Unique Pose: Heroic Shiba Salute & Red Scarf -->
          <polygon points="28,52 20,20 48,40" fill="${palette.bodyMid}" />
          <polygon points="92,52 100,20 72,40" fill="${palette.bodyMid}" />
          <ellipse cx="60" cy="74" rx="35" ry="31" fill="${palette.bodyStart}" />
          <path d="M 28 76 Q 45 64 60 76 Q 75 64 92 76 Q 86 104 60 104 Q 34 104 28 76 Z" fill="#ffffff" />
          <!-- Heroic Red Scholar Scarf -->
          <path d="M 32 92 Q 60 102 88 92 L 96 102 L 82 106 L 78 96 Z" fill="#e11d48" />
          <!-- Salute Paw -->
          <ellipse cx="26" cy="58" rx="9" ry="5.5" transform="rotate(-35 26 58)" fill="#ffffff" stroke="${palette.bodyMid}" stroke-width="2" />
        `;
      case 'nova':
        return `
          <!-- Nova Unique Pose: Magical Prancing Unicorn & Spiraled Horn -->
          <ellipse cx="60" cy="76" rx="34" ry="30" fill="#ffffff" stroke="${palette.bodyStart}" stroke-width="3" />
          <path d="M 26 52 Q 14 68 24 88" stroke="#c084fc" stroke-width="8" stroke-linecap="round" fill="none" />
          <polygon points="60,12 52,44 68,44" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
          <!-- Prancing Front Hooves -->
          <ellipse cx="34" cy="92" rx="7" ry="5" fill="#fbbf24" />
          <ellipse cx="86" cy="86" rx="7" ry="5" fill="#fbbf24" />
        `;
      case 'atlas':
        return `
          <!-- Atlas Unique Pose: Emperor Penguin & Golden Compass -->
          <ellipse cx="60" cy="74" rx="35" ry="33" fill="#0f172a" />
          <ellipse cx="60" cy="80" rx="24" ry="25" fill="#ffffff" />
          <!-- Golden Compass held in right flipper -->
          <circle cx="90" cy="86" r="9" fill="#fbbf24" stroke="#b45309" stroke-width="2" />
          <polygon points="90,80 92,86 90,92 88,86" fill="#ef4444" />
        `;
      case 'solaris':
        return `
          <!-- Solaris Unique Pose: Radiant Sunburst Crest Phoenix -->
          <polygon points="60,8 48,36 60,28 72,36" fill="#fbbf24" />
          <path d="M 22 76 L 6 50 L 20 58 L 10 38 L 30 52 Z" fill="#f97316" />
          <path d="M 98 76 L 114 50 L 100 58 L 110 38 L 90 52 Z" fill="#f97316" />
          <ellipse cx="60" cy="76" rx="34" ry="30" fill="${palette.bodyMid}" />
          <ellipse cx="60" cy="86" rx="22" ry="18" fill="#fde68a" />
        `;
      case 'quizzie':
      default:
        return `
          <!-- Quizzie Unique Pose: Professor's Raised Wing & Golden Quill -->
          <ellipse cx="60" cy="74" rx="35" ry="32" fill="${palette.bodyMid}" />
          <ellipse cx="60" cy="82" rx="24" ry="21" fill="#ffffff" opacity="0.92" />
          <path d="M 25 68 C 12 52, 14 38, 28 48" fill="${palette.wingStart}" />
          <!-- Golden Feather Quill in Raised Left Wing -->
          <path d="M 16 48 Q 8 28 24 22 Q 26 36 16 48 Z" fill="#fbbf24" />
        `;
    }
  };

  const renderAccessoryIconLayer = () => {
    switch (accessory) {
      case 'scholar_glasses':
        return `
          <circle cx="44" cy="64" r="14" stroke="#fbbf24" stroke-width="3" fill="none" />
          <circle cx="76" cy="64" r="14" stroke="#fbbf24" stroke-width="3" fill="none" />
          <line x1="58" y1="64" x2="62" y2="64" stroke="#fbbf24" stroke-width="3" />
        `;
      case 'bow_tie':
        return `
          <polygon points="60,88 45,81 45,95" fill="#e11d48" />
          <polygon points="60,88 75,81 75,95" fill="#e11d48" />
          <circle cx="60" cy="88" r="4" fill="#fbbf24" />
        `;
      case 'party_hat':
        return `
          <polygon points="60,8 44,42 76,42" fill="#ec4899" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="60" cy="8" r="5" fill="#fde047" />
        `;
      case 'headphones':
        return `
          <path d="M 24 64 A 36 36 0 0 1 96 64" stroke="#0f172a" stroke-width="6" fill="none" />
          <rect x="16" y="54" width="10" height="22" rx="5" fill="#38bdf8" stroke="#0f172a" stroke-width="2" />
          <rect x="94" y="54" width="10" height="22" rx="5" fill="#38bdf8" stroke="#0f172a" stroke-width="2" />
        `;
      case 'detective_monocle':
        return `
          <circle cx="76" cy="64" r="14" stroke="#fbbf24" stroke-width="3.5" fill="rgba(56,189,248,0.18)" />
          <path d="M 88 70 Q 94 86 84 98" stroke="#fbbf24" stroke-width="2" fill="none" stroke-dasharray="2 2" />
        `;
      case 'viking_helm':
        return `
          <path d="M 38 42 C 20 34, 16 16, 28 14 C 30 24, 34 32, 42 36 Z" fill="#fef3c7" stroke="#92400e" stroke-width="1.5" />
          <path d="M 82 42 C 100 34, 104 16, 92 14 C 90 24, 86 32, 78 36 Z" fill="#fef3c7" stroke="#92400e" stroke-width="1.5" />
          <path d="M 36 42 Q 60 22 84 42 Z" fill="#64748b" stroke="#334155" stroke-width="2" />
        `;
      case 'pirate_tricorn':
        return `
          <path d="M 22 42 Q 60 12 98 42 L 84 46 L 36 46 Z" fill="#1e293b" stroke="#fbbf24" stroke-width="2.5" />
          <circle cx="60" cy="34" r="4.5" fill="#fbbf24" />
        `;
      case 'wizard_hat':
        return `
          <ellipse cx="60" cy="40" rx="34" ry="7" fill="#312e81" stroke="#fbbf24" stroke-width="2" />
          <polygon points="64,4 40,40 80,40" fill="#4338ca" stroke="#fbbf24" stroke-width="1.5" />
          <polygon points="60,24 62,28 66,28 63,31 64,35 60,32 56,35 57,31 54,28 58,28" fill="#fde047" />
        `;
      case 'angel_halo':
        return `
          <ellipse cx="60" cy="18" rx="24" ry="6" stroke="#fde047" stroke-width="4.5" fill="none" />
        `;
      case 'cyber_visor':
        return `
          <rect x="26" y="54" width="68" height="19" rx="9" fill="#06b6d4" fill-opacity="0.82" stroke="#f472b6" stroke-width="2.5" />
          <line x1="34" y1="60" x2="86" y2="60" stroke="#ffffff" stroke-width="2" stroke- opacity="0.8" />
        `;
      case 'royal_crown':
        return `
          <polygon points="34,42 30,18 48,30 60,12 72,30 90,18 86,42" fill="#fbbf24" stroke="#b45309" stroke-width="2" />
          <circle cx="60" cy="28" r="3.5" fill="#e11d48" />
          <circle cx="44" cy="33" r="2.5" fill="#3b82f6" />
          <circle cx="76" cy="33" r="2.5" fill="#3b82f6" />
        `;
      default:
        return '';
    }
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="512" height="512">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bgHexStart}" />
        <stop offset="100%" stop-color="${palette.bgHexEnd}" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="112" height="112" rx="28" fill="url(#bgGrad)" stroke="${palette.accent}" stroke-width="3" />
    ${renderCharacterIconLayer()}
    <!-- Expressive Mascot Eyes -->
    <circle cx="44" cy="64" r="10" fill="#ffffff" />
    <circle cx="76" cy="64" r="10" fill="#ffffff" />
    <circle cx="44" cy="64" r="5.5" fill="#1e1b4b" />
    <circle cx="76" cy="64" r="5.5" fill="#1e1b4b" />
    <circle cx="41.5" cy="61.5" r="2.2" fill="#ffffff" />
    <circle cx="73.5" cy="61.5" r="2.2" fill="#ffffff" />
    <polygon points="56,70 64,70 60,77" fill="#f59e0b" />
    ${renderAccessoryIconLayer()}
  </svg>`;
}

export function getMascotIconDataUrl(
  character: MascotCharacter,
  theme?: MascotColorTheme,
  accessory?: MascotAccessory
): string {
  const svg = generateMascotIconSvgString(character, theme || 'indigo', accessory || 'none');
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

let customManifestBlobUrl: string | null = null;

/**
 * Dynamically updates the website's <link rel="icon">, <link rel="apple-touch-icon">,
 * and PWA Web App Manifest (<link rel="manifest">) so both the browser tab icon
 * and desktop / home-screen app icon match the user's chosen mascot app icon!
 */
export function syncMascotFaviconAndDesktopIcon(
  character: MascotCharacter,
  theme: MascotColorTheme,
  accessory: MascotAccessory
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const iconUrl = getMascotIconDataUrl(character, theme, accessory);
    const mascotMeta = MASCOT_CATALOG.find((m) => m.id === character) || MASCOT_CATALOG[0];

    // 1. Update favicon & shortcut icon immediately
    let iconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    iconLink.type = iconUrl.endsWith('.jpg') ? 'image/jpeg' : 'image/svg+xml';
    iconLink.href = iconUrl;

    let shortcutLink = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement | null;
    if (!shortcutLink) {
      shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      document.head.appendChild(shortcutLink);
    }
    shortcutLink.href = iconUrl;

    // 2. Render rounded app icon PNGs on an offscreen canvas for Apple Touch Icon & Desktop PWA Manifest
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const createPngUrl = (size: number) => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Rounded app-icon squircle clip
            const r = Math.round(size * 0.22);
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(size - r, 0);
            ctx.quadraticCurveTo(size, 0, size, r);
            ctx.lineTo(size, size - r);
            ctx.quadraticCurveTo(size, size, size - r, size);
            ctx.lineTo(r, size);
            ctx.quadraticCurveTo(0, size, 0, size - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(img, 0, 0, size, size);

            // If user also equipped an accessory badge, composite a small badge indicator in top-left
            const accMeta = MASCOT_ACCESSORY_CATALOG.find((a) => a.id === accessory);
            if (accMeta && accMeta.id !== 'none') {
              const badgeSize = Math.round(size * 0.22);
              const pad = Math.round(size * 0.05);
              ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
              ctx.beginPath();
              ctx.arc(pad + badgeSize / 2, pad + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = Math.max(2, Math.round(size * 0.012));
              ctx.stroke();
              ctx.font = `${Math.round(badgeSize * 0.62)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(accMeta.previewEmoji, pad + badgeSize / 2, pad + badgeSize / 2 + 2);
            }

            return canvas.toDataURL('image/png');
          }
          return iconUrl;
        };

        const png64 = createPngUrl(64);
        const png192 = createPngUrl(192);
        const png512 = createPngUrl(512);

        if (iconLink) {
          iconLink.type = 'image/png';
          iconLink.href = png64;
        }
        if (shortcutLink) {
          shortcutLink.href = png64;
        }

        let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.head.appendChild(appleLink);
        }
        appleLink.href = png192;

        // Update Web App Manifest for Desktop / Home Screen installation
        const dynamicManifest = {
          name: `Quiz Me! — ${mascotMeta.title}`,
          short_name: 'Quiz Me!',
          description: 'Interactive Quiz Studio & Gamified Learning Companion',
          start_url: '/',
          display: 'standalone',
          background_color: '#0f172a',
          theme_color: THEME_PALETTES[theme]?.bgHexStart || '#4f46e5',
          icons: [
            {
              src: png192,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: png512,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        };

        if (customManifestBlobUrl) {
          URL.revokeObjectURL(customManifestBlobUrl);
        }
        const blob = new Blob([JSON.stringify(dynamicManifest)], {
          type: 'application/manifest+json',
        });
        customManifestBlobUrl = URL.createObjectURL(blob);

        let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement | null;
        if (!manifestLink) {
          manifestLink = document.createElement('link');
          manifestLink.rel = 'manifest';
          document.head.appendChild(manifestLink);
        }
        manifestLink.href = customManifestBlobUrl;
      } catch {
        // non-fatal canvas fallback
      }
    };
    img.src = iconUrl;
  } catch (e) {
    console.warn('Could not update dynamic mascot favicon:', e);
  }
}

/**
 * Downloads a crisp 512x512 PNG of the user's personalized mascot desktop icon
 */
export function downloadCustomMascotDesktopIcon(
  character: MascotCharacter,
  theme: MascotColorTheme,
  accessory: MascotAccessory
): void {
  if (typeof window === 'undefined') return;
  const iconUrl = getMascotIconDataUrl(character, theme, accessory);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const r = Math.round(size * 0.22);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, 0, 0, size, size);

    const accMeta = MASCOT_ACCESSORY_CATALOG.find((a) => a.id === accessory);
    if (accMeta && accMeta.id !== 'none') {
      const badgeSize = Math.round(size * 0.2);
      const pad = Math.round(size * 0.05);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(pad + badgeSize / 2, pad + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.font = `${Math.round(badgeSize * 0.62)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(accMeta.previewEmoji, pad + badgeSize / 2, pad + badgeSize / 2 + 2);
    }

    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `quizme-${character}-${accessory}-app-icon.png`;
    a.click();
  };
  img.src = iconUrl;
}

export function getSavedMascotPreferences(): {
  character: MascotCharacter;
  theme: MascotColorTheme;
  accessory: MascotAccessory;
  coins: number;
  unlockedMascots: MascotCharacter[];
  unlockedAccessories: MascotAccessory[];
} {
  if (typeof window === 'undefined') {
    return {
      character: 'quizzie',
      theme: 'indigo',
      accessory: 'none',
      coins: 15,
      unlockedMascots: DEFAULT_UNLOCKED_MASCOTS,
      unlockedAccessories: DEFAULT_UNLOCKED_ACCESSORIES,
    };
  }
  const savedChar = localStorage.getItem(MASCOT_STORAGE_KEYS.CHARACTER) as MascotCharacter | null;
  const savedTheme = localStorage.getItem(MASCOT_STORAGE_KEYS.THEME) as MascotColorTheme | null;
  const savedAcc = localStorage.getItem(MASCOT_STORAGE_KEYS.ACCESSORY) as MascotAccessory | null;
  const savedCoinsRaw = localStorage.getItem(MASCOT_STORAGE_KEYS.COINS);
  const savedUnlockedMascotsRaw = localStorage.getItem(MASCOT_STORAGE_KEYS.UNLOCKED_MASCOTS);
  const savedUnlockedAccRaw = localStorage.getItem(MASCOT_STORAGE_KEYS.UNLOCKED_ACCESSORIES);

  const validChar = MASCOT_CATALOG.some((m) => m.id === savedChar) ? savedChar! : 'quizzie';
  const validTheme = MASCOT_THEME_CATALOG.some((t) => t.id === savedTheme)
    ? savedTheme!
    : 'indigo';
  const validAcc = MASCOT_ACCESSORY_CATALOG.some((a) => a.id === savedAcc)
    ? savedAcc!
    : 'none';

  let coins = 15;
  if (savedCoinsRaw !== null) {
    const parsed = parseInt(savedCoinsRaw, 10);
    if (!isNaN(parsed) && parsed >= 0) coins = parsed;
  }

  let unlockedMascots: MascotCharacter[] = [...DEFAULT_UNLOCKED_MASCOTS];
  if (savedUnlockedMascotsRaw) {
    try {
      const parsed = JSON.parse(savedUnlockedMascotsRaw);
      if (Array.isArray(parsed)) {
        unlockedMascots = Array.from(new Set([...DEFAULT_UNLOCKED_MASCOTS, ...parsed]));
      }
    } catch {
      // fallback
    }
  }

  let unlockedAccessories: MascotAccessory[] = [...DEFAULT_UNLOCKED_ACCESSORIES];
  if (savedUnlockedAccRaw) {
    try {
      const parsed = JSON.parse(savedUnlockedAccRaw);
      if (Array.isArray(parsed)) {
        unlockedAccessories = Array.from(new Set([...DEFAULT_UNLOCKED_ACCESSORIES, ...parsed]));
      }
    } catch {
      // fallback
    }
  }

  return {
    character: validChar,
    theme: validTheme,
    accessory: validAcc,
    coins,
    unlockedMascots,
    unlockedAccessories,
  };
}

export function saveMascotPreferences(
  character: MascotCharacter,
  theme: MascotColorTheme,
  accessory?: MascotAccessory,
  coins?: number,
  unlockedMascots?: MascotCharacter[],
  unlockedAccessories?: MascotAccessory[]
): void {
  if (typeof window === 'undefined') return;
  const current = getSavedMascotPreferences();
  const nextChar = character ?? current.character;
  const nextTheme = theme ?? current.theme;
  const nextAcc = accessory !== undefined ? accessory : current.accessory;
  const nextCoins = coins !== undefined ? coins : current.coins;
  const nextUnlockedMascots = unlockedMascots ?? current.unlockedMascots;
  const nextUnlockedAcc = unlockedAccessories ?? current.unlockedAccessories;

  localStorage.setItem(MASCOT_STORAGE_KEYS.CHARACTER, nextChar);
  localStorage.setItem(MASCOT_STORAGE_KEYS.THEME, nextTheme);
  localStorage.setItem(MASCOT_STORAGE_KEYS.ACCESSORY, nextAcc);
  localStorage.setItem(MASCOT_STORAGE_KEYS.COINS, String(nextCoins));
  localStorage.setItem(MASCOT_STORAGE_KEYS.UNLOCKED_MASCOTS, JSON.stringify(nextUnlockedMascots));
  localStorage.setItem(MASCOT_STORAGE_KEYS.UNLOCKED_ACCESSORIES, JSON.stringify(nextUnlockedAcc));

  syncMascotFaviconAndDesktopIcon(nextChar, nextTheme, nextAcc);

  window.dispatchEvent(
    new CustomEvent('quizme-mascot-updated', {
      detail: {
        character: nextChar,
        theme: nextTheme,
        accessory: nextAcc,
        coins: nextCoins,
        unlockedMascots: nextUnlockedMascots,
        unlockedAccessories: nextUnlockedAcc,
      },
    })
  );
}

export function addMascotCoinsGlobal(deltaCoins: number): number {
  const current = getSavedMascotPreferences();
  const nextCoins = Math.max(0, current.coins + deltaCoins);
  saveMascotPreferences(
    current.character,
    current.theme,
    current.accessory,
    nextCoins,
    current.unlockedMascots,
    current.unlockedAccessories
  );
  return nextCoins;
}

export function useMascotPreferences() {
  const [prefs, setPrefs] = useState(getSavedMascotPreferences);

  useEffect(() => {
    // Ensure website & desktop icon is synced on mount
    syncMascotFaviconAndDesktopIcon(prefs.character, prefs.theme, prefs.accessory);

    const handleUpdate = () => {
      setPrefs(getSavedMascotPreferences());
    };
    window.addEventListener('quizme-mascot-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('quizme-mascot-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const setMascotCharacter = (character: MascotCharacter, syncDefaultTheme = false) => {
    const meta = MASCOT_CATALOG.find((m) => m.id === character);
    const nextTheme = syncDefaultTheme && meta ? meta.defaultTheme : prefs.theme;
    saveMascotPreferences(
      character,
      nextTheme,
      prefs.accessory,
      prefs.coins,
      prefs.unlockedMascots,
      prefs.unlockedAccessories
    );
  };

  const setMascotTheme = (theme: MascotColorTheme) => {
    saveMascotPreferences(
      prefs.character,
      theme,
      prefs.accessory,
      prefs.coins,
      prefs.unlockedMascots,
      prefs.unlockedAccessories
    );
  };

  const setMascotAccessory = (accessory: MascotAccessory) => {
    saveMascotPreferences(
      prefs.character,
      prefs.theme,
      accessory,
      prefs.coins,
      prefs.unlockedMascots,
      prefs.unlockedAccessories
    );
  };

  const addMascotCoins = (delta: number) => {
    return addMascotCoinsGlobal(delta);
  };

  const purchaseMascot = (characterId: MascotCharacter): { success: boolean; message: string } => {
    const meta = MASCOT_CATALOG.find((m) => m.id === characterId);
    if (!meta) return { success: false, message: 'Mascot not found.' };
    if (prefs.unlockedMascots.includes(characterId)) {
      setMascotCharacter(characterId, true);
      return { success: true, message: `${meta.title} equipped!` };
    }
    if (prefs.coins < meta.costCoins) {
      return {
        success: false,
        message: `Need ${meta.costCoins - prefs.coins} more Mascot Coins! Complete quizzes with 80%+ accuracy to earn Coins.`,
      };
    }
    const nextCoins = prefs.coins - meta.costCoins;
    const nextUnlocked = [...prefs.unlockedMascots, characterId];
    saveMascotPreferences(
      characterId,
      meta.defaultTheme,
      prefs.accessory,
      nextCoins,
      nextUnlocked,
      prefs.unlockedAccessories
    );
    return {
      success: true,
      message: `Unlocked ${meta.title}! Browser & desktop icon updated.`,
    };
  };

  const purchaseAccessory = (
    accessoryId: MascotAccessory
  ): { success: boolean; message: string } => {
    const meta = MASCOT_ACCESSORY_CATALOG.find((a) => a.id === accessoryId);
    if (!meta) return { success: false, message: 'Accessory not found.' };
    if (prefs.unlockedAccessories.includes(accessoryId)) {
      setMascotAccessory(accessoryId);
      return { success: true, message: `${meta.name} equipped!` };
    }
    if (prefs.coins < meta.costCoins) {
      return {
        success: false,
        message: `Need ${meta.costCoins - prefs.coins} more Mascot Coins! Score 80%+ on quizzes to earn Coins.`,
      };
    }
    const nextCoins = prefs.coins - meta.costCoins;
    const nextUnlocked = [...prefs.unlockedAccessories, accessoryId];
    saveMascotPreferences(
      prefs.character,
      prefs.theme,
      accessoryId,
      nextCoins,
      prefs.unlockedMascots,
      nextUnlocked
    );
    return {
      success: true,
      message: `Unlocked & equipped ${meta.name}!`,
    };
  };

  const currentMascotMeta =
    MASCOT_CATALOG.find((m) => m.id === prefs.character) || MASCOT_CATALOG[0];

  const currentAccessoryMeta =
    MASCOT_ACCESSORY_CATALOG.find((a) => a.id === prefs.accessory) || MASCOT_ACCESSORY_CATALOG[0];

  return {
    mascotCharacter: prefs.character,
    mascotTheme: prefs.theme,
    mascotAccessory: prefs.accessory,
    mascotCoins: prefs.coins,
    unlockedMascots: prefs.unlockedMascots,
    unlockedAccessories: prefs.unlockedAccessories,
    currentMascotMeta,
    currentAccessoryMeta,
    setMascotCharacter,
    setMascotTheme,
    setMascotAccessory,
    addMascotCoins,
    purchaseMascot,
    purchaseAccessory,
  };
}

interface MascotAvatarProps {
  mood?: MascotMood;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  showBadge?: boolean;
  character?: MascotCharacter;
  theme?: MascotColorTheme;
  accessory?: MascotAccessory;
}

const SIZE_MAP: Record<NonNullable<MascotAvatarProps['size']>, string> = {
  xs: 'w-8 h-8',
  sm: 'w-11 h-11',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  mood = 'idle',
  size = 'md',
  className = '',
  interactive = true,
  onClick,
  character: propCharacter,
  theme: propTheme,
  accessory: propAccessory,
}) => {
  const uid = useId().replace(/:/g, '');
  const [isBouncing, setIsBouncing] = useState(false);
  const { mascotCharacter, mascotTheme, mascotAccessory } = useMascotPreferences();

  const activeCharacter = propCharacter || mascotCharacter;
  const activeTheme = propTheme || mascotTheme;
  const activeAccessory = propAccessory !== undefined ? propAccessory : mascotAccessory;
  const palette = THEME_PALETTES[activeTheme] || THEME_PALETTES.indigo;

  const handleClick = () => {
    if (interactive) {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 600);
    }
    if (onClick) onClick();
  };

  const getMoodMotionClass = () => {
    if (isBouncing) return 'scale-110 -translate-y-1.5 rotate-3';
    switch (mood) {
      case 'celebrate':
      case 'trophy':
        return 'animate-bounce';
      case 'happy':
      case 'streak':
        return 'hover:scale-105 hover:-translate-y-0.5';
      case 'thinking':
        return 'hover:rotate-3';
      default:
        return 'hover:scale-105';
    }
  };

  const bodyGradId = `mascotBody_${uid}`;
  const bellyGradId = `mascotBelly_${uid}`;
  const wingGradId = `mascotWing_${uid}`;
  const goldGradId = `mascotGold_${uid}`;

  // Render each mascot's UNIQUE POSE & SILHOUETTE
  const renderUniqueCharacterPose = () => {
    switch (activeCharacter) {
      case 'foxy':
        // Foxy Unique Pose: Clever Crossed Paws & Front-Curled Bushy Tail
        return (
          <>
            {/* Bushy Fox Tail curling around right side to front */}
            <path
              d="M 84 88 C 110 76, 118 96, 98 106 C 82 112, 66 110, 52 104 Z"
              fill={`url(#${bodyGradId})`}
            />
            <path
              d="M 100 88 C 112 85, 112 99, 100 104 C 94 106, 90 96, 100 88 Z"
              fill="#ffffff"
            />
            {/* Pointed Fox Ears */}
            <polygon points="24,54 14,16 46,42" fill={`url(#${wingGradId})`} />
            <polygon points="27,50 19,24 41,42" fill={palette.earInner} />
            <polygon points="96,54 106,16 74,42" fill={`url(#${wingGradId})`} />
            <polygon points="93,50 101,24 79,42" fill={palette.earInner} />
            {/* Fox Head & Torso */}
            <ellipse cx="60" cy="74" rx="36" ry="32" fill={`url(#${bodyGradId})`} />
            {/* White Fox Cheek Fur */}
            <path
              d="M 24 74 Q 42 92 60 86 Q 78 92 96 74 Q 88 106 60 106 Q 32 106 24 74 Z"
              fill={`url(#${bellyGradId})`}
            />
            {/* Unique Pose: Confident Crossed Paws on Chest */}
            <ellipse
              cx="49"
              cy="91"
              rx="12"
              ry="6"
              transform="rotate(15 49 91)"
              fill={`url(#${wingGradId})`}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <ellipse
              cx="71"
              cy="91"
              rx="12"
              ry="6"
              transform="rotate(-15 71 91)"
              fill={`url(#${wingGradId})`}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </>
        );

      case 'astro':
        // Astro Unique Pose: Zero-Gravity Floating Tilt & Reaching for an Orbiting Star
        return (
          <g transform="rotate(-4 60 70)">
            {/* Curled Cosmic Cat Tail */}
            <path
              d="M 90 94 C 112 86, 114 58, 98 52 C 90 49, 88 60, 96 63"
              stroke={`url(#${wingGradId})`}
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cat Ears */}
            <polygon points="28,50 20,20 48,38" fill={`url(#${bodyGradId})`} />
            <polygon points="31,47 25,26 44,39" fill={palette.earInner} />
            <polygon points="92,50 100,20 72,38" fill={`url(#${bodyGradId})`} />
            <polygon points="89,47 95,26 76,39" fill={palette.earInner} />
            {/* Cat Body */}
            <ellipse cx="60" cy="74" rx="35" ry="32" fill={`url(#${bodyGradId})`} />
            <ellipse cx="60" cy="84" rx="23" ry="19" fill={`url(#${bellyGradId})`} />
            {/* Astro Spacesuit Collar Ring */}
            <ellipse
              cx="60"
              cy="90"
              rx="28"
              ry="6"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              opacity="0.85"
            />
            {/* Unique Pose: Left Paw Raised High Reaching for Orbiting Star */}
            <ellipse
              cx="22"
              cy="56"
              rx="7.5"
              ry="13"
              transform="rotate(-30 22 56)"
              fill="#ffffff"
              stroke={`url(#${wingGradId})`}
              strokeWidth="2"
            />
            <polygon
              points="15,34 17.5,39 23,39 18.5,42.5 20,48 15,44.5 10,48 11.5,42.5 7,39 12.5,39"
              fill="#fde047"
            />
            {/* Whiskers */}
            <line x1="16" y1="68" x2="28" y2="70" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="74" x2="28" y2="74" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="104" y1="68" x2="92" y2="70" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="104" y1="74" x2="92" y2="74" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );

      case 'boba':
        // Boba Unique Pose: Zen Bamboo Panda Holding a Pearl Boba Tea Cup with Both Paws
        return (
          <>
            {/* Round Bear Ears */}
            <circle cx="29" cy="33" r="13" fill={`url(#${wingGradId})`} />
            <circle cx="29" cy="33" r="7" fill={palette.earInner} />
            <circle cx="91" cy="33" r="13" fill={`url(#${wingGradId})`} />
            <circle cx="91" cy="33" r="7" fill={palette.earInner} />
            {/* Plump Panda Body */}
            <ellipse cx="60" cy="74" rx="37" ry="33" fill="#ffffff" stroke={palette.bodyMid} strokeWidth="3" />
            <ellipse cx="60" cy="84" rx="26" ry="20" fill={`url(#${bellyGradId})`} />
            {/* Unique Pose: Boba Milk Tea Cup with Straw & Tapioca Pearls held between both paws */}
            <rect
              x="49"
              y="81"
              width="22"
              height="24"
              rx="5"
              fill="#fde68a"
              stroke="#d97706"
              strokeWidth="2"
            />
            <rect x="47" y="79" width="26" height="4" rx="2" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
            <line x1="60" y1="71" x2="64" y2="81" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="54" cy="99" r="2.2" fill="#451a03" />
            <circle cx="60" cy="100" r="2.2" fill="#451a03" />
            <circle cx="66" cy="99" r="2.2" fill="#451a03" />
            {/* Both Panda Paws Holding the Cup */}
            <ellipse cx="46" cy="91" rx="7.5" ry="5.5" fill={`url(#${wingGradId})`} />
            <ellipse cx="74" cy="91" rx="7.5" ry="5.5" fill={`url(#${wingGradId})`} />
          </>
        );

      case 'sparky':
        // Sparky Unique Pose: Wide Dragon Wings Spread & Friendly Flame Puff
        return (
          <>
            {/* Spread Crystal Dragon Wings */}
            <path
              d="M 26 70 L 4 44 L 14 72 L 6 86 L 28 84 Z"
              fill={`url(#${wingGradId})`}
              stroke={palette.earInner}
              strokeWidth="1.5"
            />
            <path
              d="M 94 70 L 116 44 L 106 72 L 114 86 L 92 84 Z"
              fill={`url(#${wingGradId})`}
              stroke={palette.earInner}
              strokeWidth="1.5"
            />
            {/* Curved Golden Dragon Horns */}
            <path
              d="M 38 42 C 28 22, 18 18, 20 32 C 21 40, 30 46, 38 46 Z"
              fill={`url(#${goldGradId})`}
            />
            <path
              d="M 82 42 C 92 22, 102 18, 100 32 C 99 40, 90 46, 82 46 Z"
              fill={`url(#${goldGradId})`}
            />
            {/* Dragon Body */}
            <ellipse cx="60" cy="75" rx="34" ry="31" fill={`url(#${bodyGradId})`} />
            {/* Scaled Belly */}
            <ellipse cx="60" cy="85" rx="22" ry="19" fill="#fef3c7" />
            <line x1="44" y1="80" x2="76" y2="80" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
            <line x1="42" y1="87" x2="78" y2="87" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
            <line x1="46" y1="94" x2="74" y2="94" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
            {/* Unique Pose: Friendly Flame Spark Puff by Snout */}
            <path
              d="M 78 73 C 88 67, 96 73, 90 80 C 86 83, 80 79, 78 73 Z"
              fill="#f97316"
            />
            <circle cx="87" cy="75" r="3" fill="#fde047" />
          </>
        );

      case 'pixel':
        // Pixel the Axolotl Unique Pose: Fanned Neon External Gills & Cheerful Peace-Sign Wave
        return (
          <>
            {/* Axolotl Fanned External Gills (3 per side) */}
            <path
              d="M 26 52 L 8 40 M 23 64 L 5 62 M 26 76 L 9 82"
              stroke="#f472b6"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path
              d="M 94 52 L 112 40 M 97 64 L 115 62 M 94 76 L 111 82"
              stroke="#f472b6"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Axolotl Smooth Body */}
            <ellipse cx="60" cy="75" rx="34" ry="30" fill={`url(#${bodyGradId})`} />
            <ellipse cx="60" cy="86" rx="23" ry="17" fill={`url(#${bellyGradId})`} />
            {/* Unique Pose: Left Hand Raised in V / Peace Wave + Floating Digital Pixel Cubes */}
            <circle cx="22" cy="82" r="6.5" fill={palette.bodyStart} stroke="#ffffff" strokeWidth="1.5" />
            <line x1="19" y1="76" x2="16" y2="68" stroke={palette.bodyStart} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="24" y1="76" x2="27" y2="68" stroke={palette.bodyStart} strokeWidth="3.5" strokeLinecap="round" />
            <rect x="96" y="24" width="6" height="6" rx="1" fill="#38bdf8" opacity="0.9" />
            <rect x="104" y="32" width="4.5" height="4.5" rx="1" fill="#f472b6" opacity="0.85" />
          </>
        );

      case 'zeno':
        // Zeno the Shiba Unique Pose: Crisp Forehead Salute & Flowing Red Scholar Scarf
        return (
          <>
            {/* Curled Shiba Tail */}
            <path
              d="M 88 86 C 106 78, 108 58, 94 56 C 86 55, 86 68, 94 70"
              stroke={`url(#${bodyGradId})`}
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Pointed Shiba Ears */}
            <polygon points="28,50 20,20 48,38" fill={`url(#${bodyGradId})`} />
            <polygon points="31,47 25,26 44,39" fill="#fef3c7" />
            <polygon points="92,50 100,20 72,38" fill={`url(#${bodyGradId})`} />
            <polygon points="89,47 95,26 76,39" fill="#fef3c7" />
            {/* Shiba Body */}
            <ellipse cx="60" cy="74" rx="35" ry="31" fill={`url(#${bodyGradId})`} />
            {/* Shiba Cream Urajiro Markings */}
            <path
              d="M 28 74 Q 44 62 60 74 Q 76 62 92 74 Q 86 104 60 104 Q 34 104 28 74 Z"
              fill="#fffbeb"
            />
            <circle cx="48" cy="50" r="3" fill="#fffbeb" />
            <circle cx="72" cy="50" r="3" fill="#fffbeb" />
            {/* Flowing Red Scholar Scarf */}
            <path
              d="M 32 90 Q 60 100 88 90 L 102 98 L 90 105 L 80 95 Z"
              fill="#e11d48"
              stroke="#9f1239"
              strokeWidth="1"
            />
            {/* Unique Pose: Left Paw Raised to Brow in a Crisp Guardian Salute */}
            <ellipse
              cx="25"
              cy="55"
              rx="10"
              ry="5.5"
              transform="rotate(-32 25 55)"
              fill="#fffbeb"
              stroke={`url(#${wingGradId})`}
              strokeWidth="2"
            />
          </>
        );

      case 'nova':
        // Nova the Unicorn Unique Pose: Magical Prancing Rear-Up with Flowing Rainbow Mane & Golden Horn
        return (
          <>
            {/* Flowing Shimmering Mane */}
            <path
              d="M 28 46 C 10 54, 8 76, 24 88"
              stroke="#f472b6"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 26 54 C 12 64, 12 82, 26 92"
              stroke="#38bdf8"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Unicorn Ears */}
            <polygon points="34,46 24,22 46,36" fill="#ffffff" stroke={palette.bodyStart} strokeWidth="2" />
            <polygon points="86,46 96,22 74,36" fill="#ffffff" stroke={palette.bodyStart} strokeWidth="2" />
            {/* Spiraled Golden Alicorn Horn */}
            <polygon points="60,10 52,42 68,42" fill={`url(#${goldGradId})`} stroke="#b45309" strokeWidth="1.5" />
            <line x1="55" y1="32" x2="65" y2="28" stroke="#fef3c7" strokeWidth="1.5" />
            <line x1="57" y1="22" x2="63" y2="19" stroke="#fef3c7" strokeWidth="1.5" />
            {/* Unicorn Body */}
            <ellipse cx="60" cy="75" rx="34" ry="30" fill="#ffffff" stroke={palette.bodyStart} strokeWidth="2.5" />
            <ellipse cx="60" cy="85" rx="22" ry="17" fill={palette.earInner} opacity="0.65" />
            {/* Unique Pose: Prancing Golden Front Hooves Raised */}
            <ellipse
              cx="32"
              cy="88"
              rx="8"
              ry="5.5"
              transform="rotate(-20 32 88)"
              fill={`url(#${goldGradId})`}
              stroke="#b45309"
              strokeWidth="1.5"
            />
            <ellipse
              cx="88"
              cy="82"
              rx="8"
              ry="5.5"
              transform="rotate(20 88 82)"
              fill={`url(#${goldGradId})`}
              stroke="#b45309"
              strokeWidth="1.5"
            />
          </>
        );

      case 'atlas':
        // Atlas the Penguin Unique Pose: Flipper on Hip & Holding an Explorer's Golden Compass
        return (
          <>
            {/* Tuxedo Emperor Penguin Body */}
            <ellipse cx="60" cy="74" rx="35" ry="33" fill="#0f172a" stroke={palette.bodyStart} strokeWidth="2" />
            <ellipse cx="60" cy="80" rx="24" ry="24" fill="#ffffff" />
            {/* Golden Emperor Neck Patch */}
            <path d="M 42 74 Q 60 84 78 74 Q 60 78 42 74 Z" fill="#fbbf24" opacity="0.85" />
            {/* Left Flipper on Hip */}
            <path d="M 25 66 C 14 74, 18 90, 32 88" fill="#0f172a" stroke={palette.bodyStart} strokeWidth="1.5" />
            {/* Right Flipper Holding Golden Navigator Compass */}
            <path d="M 95 66 C 106 74, 102 90, 88 88" fill="#0f172a" stroke={palette.bodyStart} strokeWidth="1.5" />
            <circle cx="92" cy="86" r="9.5" fill={`url(#${goldGradId})`} stroke="#78350f" strokeWidth="2" />
            <circle cx="92" cy="86" r="6.5" fill="#fffbeb" />
            <polygon points="92,80 94,86 92,92 90,86" fill="#ef4444" />
          </>
        );

      case 'solaris':
        // Solaris the Phoenix Unique Pose: Radiant Sunburst Tail Crest & Rising Wings
        return (
          <>
            {/* Radiant Sunburst Tail Feathers Behind Body */}
            <polygon points="60,6 47,36 60,28 73,36" fill={`url(#${goldGradId})`} />
            <polygon points="34,14 38,42 48,34" fill="#f97316" />
            <polygon points="86,14 82,42 72,34" fill="#f97316" />
            {/* Triumphant Rising Phoenix Wings */}
            <path
              d="M 24 78 C 6 62, 6 36, 22 44 C 16 54, 20 64, 28 70 Z"
              fill={`url(#${goldGradId})`}
              stroke="#ea580c"
              strokeWidth="1.5"
            />
            <path
              d="M 96 78 C 114 62, 114 36, 98 44 C 104 54, 100 64, 92 70 Z"
              fill={`url(#${goldGradId})`}
              stroke="#ea580c"
              strokeWidth="1.5"
            />
            {/* Phoenix Body */}
            <ellipse cx="60" cy="76" rx="34" ry="30" fill={`url(#${bodyGradId})`} />
            <ellipse cx="60" cy="86" rx="22" ry="18" fill="#fef3c7" />
            {/* Flame Medallion on Chest */}
            <polygon points="60,78 65,86 60,94 55,86" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          </>
        );

      case 'quizzie':
      default:
        // Quizzie the Owl Unique Pose: Professor's Raised Wing Holding a Golden Feather Quill
        return (
          <>
            {/* Left Wing Raised Holding Golden Quill */}
            <path
              d="M 25 68 C 10 54, 12 36, 28 48 C 24 58, 24 64, 27 72 Z"
              fill={`url(#${wingGradId})`}
            />
            {/* Golden Feather Quill */}
            <path
              d="M 16 48 C 8 30, 18 16, 28 20 C 28 32, 22 42, 16 48 Z"
              fill={`url(#${goldGradId})`}
              stroke="#fef3c7"
              strokeWidth="1"
            />
            <line x1="14" y1="52" x2="24" y2="24" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
            {/* Right Wing */}
            <path
              d="M 95 66 C 107 74, 106 92, 92 95 C 95 85, 95 75, 93 66 Z"
              fill={`url(#${wingGradId})`}
            />
            {/* Owl Body */}
            <ellipse cx="60" cy="74" rx="35" ry="32" fill={`url(#${bodyGradId})`} />
            {/* Owl Ear Tufts */}
            <path d="M 30 48 L 20 30 L 42 42 Z" fill={`url(#${wingGradId})`} />
            <path d="M 90 48 L 100 30 L 78 42 Z" fill={`url(#${wingGradId})`} />
            {/* Soft Cream Belly Patch with Feather Chevrons */}
            <ellipse cx="60" cy="83" rx="24" ry="21" fill={`url(#${bellyGradId})`} />
            <path
              d="M 52 84 Q 56 87 60 84 Q 64 87 68 84"
              stroke={palette.bodyStart}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M 48 92 Q 54 95 60 92 Q 66 95 72 92"
              stroke={palette.bodyStart}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
          </>
        );
    }
  };

  // Render Equipped Accessory SVG Layer
  const renderAccessoryLayer = () => {
    switch (activeAccessory) {
      case 'scholar_glasses':
        return (
          <g>
            <circle cx="44" cy="64" r="14.5" stroke={`url(#${goldGradId})`} strokeWidth="2.8" fill="rgba(255,255,255,0.08)" />
            <circle cx="76" cy="64" r="14.5" stroke={`url(#${goldGradId})`} strokeWidth="2.8" fill="rgba(255,255,255,0.08)" />
            <path d="M 58.5 64 Q 60 61 61.5 64" stroke={`url(#${goldGradId})`} strokeWidth="2.8" fill="none" />
            <line x1="25" y1="60" x2="29.5" y2="62" stroke={`url(#${goldGradId})`} strokeWidth="2.2" strokeLinecap="round" />
            <line x1="95" y1="60" x2="90.5" y2="62" stroke={`url(#${goldGradId})`} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );

      case 'bow_tie':
        return (
          <g>
            <polygon points="60,86 45,79 45,93" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
            <polygon points="60,86 75,79 75,93" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
            <circle cx="60" cy="86" r="4" fill={`url(#${goldGradId})`} />
          </g>
        );

      case 'party_hat':
        return (
          <g>
            <polygon points="60,8 44,41 76,41" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="49" y1="31" x2="71" y2="31" stroke="#fde047" strokeWidth="3" />
            <line x1="54" y1="21" x2="66" y2="21" stroke="#38bdf8" strokeWidth="3" />
            <circle cx="60" cy="8" r="5" fill="#fde047" />
          </g>
        );

      case 'headphones':
        return (
          <g>
            <path
              d="M 22 64 A 38 38 0 0 1 98 64"
              stroke="#1e293b"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            <rect x="14" y="52" width="11" height="24" rx="5.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
            <rect x="95" y="52" width="11" height="24" rx="5.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          </g>
        );

      case 'detective_monocle':
        return (
          <g>
            <circle
              cx="76"
              cy="64"
              r="14.5"
              stroke={`url(#${goldGradId})`}
              strokeWidth="3.2"
              fill="rgba(56, 189, 248, 0.16)"
            />
            <path
              d="M 89 70 Q 96 86 84 100"
              stroke={`url(#${goldGradId})`}
              strokeWidth="2"
              strokeDasharray="2.5 2.5"
              fill="none"
            />
          </g>
        );

      case 'viking_helm':
        return (
          <g>
            <path
              d="M 38 40 C 18 32, 14 14, 27 12 C 29 22, 33 30, 42 34 Z"
              fill="#fef3c7"
              stroke="#92400e"
              strokeWidth="1.5"
            />
            <path
              d="M 82 40 C 102 32, 106 14, 93 12 C 91 22, 87 30, 78 34 Z"
              fill="#fef3c7"
              stroke="#92400e"
              strokeWidth="1.5"
            />
            <path
              d="M 35 41 Q 60 20 85 41 Z"
              fill="#64748b"
              stroke="#1e293b"
              strokeWidth="2"
            />
            <rect x="57" y="28" width="6" height="15" rx="2" fill="#94a3b8" stroke="#1e293b" strokeWidth="1" />
          </g>
        );

      case 'pirate_tricorn':
        return (
          <g>
            <path
              d="M 20 42 Q 60 10 100 42 L 85 46 L 35 46 Z"
              fill="#0f172a"
              stroke={`url(#${goldGradId})`}
              strokeWidth="2.5"
            />
            <circle cx="60" cy="33" r="4.5" fill="#fbbf24" />
          </g>
        );

      case 'wizard_hat':
        return (
          <g>
            <ellipse cx="60" cy="40" rx="35" ry="7" fill="#312e81" stroke="#fbbf24" strokeWidth="2" />
            <polygon points="65,4 39,40 81,40" fill="#4338ca" stroke="#fbbf24" strokeWidth="1.5" />
            <polygon
              points="60,22 62,27 67,27 63,30 64.5,35 60,32 55.5,35 57,30 53,27 58,27"
              fill="#fde047"
            />
          </g>
        );

      case 'angel_halo':
        return (
          <g>
            <ellipse
              cx="60"
              cy="17"
              rx="25"
              ry="6.5"
              stroke="#fde047"
              strokeWidth="4.5"
              fill="none"
            />
            <ellipse
              cx="60"
              cy="17"
              rx="25"
              ry="6.5"
              stroke="#ffffff"
              strokeWidth="1.5"
              fill="none"
              opacity="0.8"
            />
          </g>
        );

      case 'cyber_visor':
        return (
          <g>
            <rect
              x="25"
              y="54"
              width="70"
              height="19"
              rx="9.5"
              fill="#06b6d4"
              fillOpacity="0.82"
              stroke="#f472b6"
              strokeWidth="2.5"
            />
            <line x1="34" y1="60" x2="86" y2="60" stroke="#ffffff" strokeWidth="2" opacity="0.85" />
          </g>
        );

      case 'royal_crown':
        return (
          <g>
            <polygon
              points="34,41 29,17 48,29 60,11 72,29 91,17 86,41"
              fill={`url(#${goldGradId})`}
              stroke="#b45309"
              strokeWidth="2"
            />
            <circle cx="60" cy="28" r="3.5" fill="#e11d48" />
            <circle cx="44" cy="33" r="2.5" fill="#3b82f6" />
            <circle cx="76" cy="33" r="2.5" fill="#3b82f6" />
          </g>
        );

      case 'none':
      default:
        // Show scholar cap if no headwear accessory is overriding it and mood is not trophy
        if (mood === 'trophy') return null;
        return (
          <g transform={mood === 'celebrate' ? 'translate(0, -4) rotate(-3 60 25)' : ''}>
            <path d="M 42 36 L 42 44 Q 60 50 78 44 L 78 36 Z" fill={palette.capBase} />
            <polygon
              points="60,20 26,33 60,44 94,33"
              fill={palette.capTop}
              stroke={palette.bodyStart}
              strokeWidth="1.5"
            />
            <circle cx="60" cy="32" r="3" fill={`url(#${goldGradId})`} />
            <path
              d="M 60 32 Q 78 35 84 48"
              stroke={`url(#${goldGradId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="84" cy="49" r="3.5" fill={`url(#${goldGradId})`} />
          </g>
        );
    }
  };

  return (
    <div
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      title={
        interactive
          ? `Click to high-five ${MASCOT_CATALOG.find((m) => m.id === activeCharacter)?.title || 'Quizzie'}!`
          : undefined
      }
      className={`relative inline-flex items-center justify-center select-none transition-all duration-300 ${
        SIZE_MAP[size]
      } ${interactive ? 'cursor-pointer' : ''} ${getMoodMotionClass()} ${className}`}
    >
      {/* Ambient Aura Glow */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${palette.glowClass} blur-md -z-10 transition-opacity duration-300 ${
          mood === 'celebrate' || mood === 'streak' || mood === 'trophy'
            ? 'opacity-100 scale-110'
            : 'opacity-70'
        }`}
      />

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          <linearGradient id={bodyGradId} x1="20" y1="20" x2="100" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.bodyStart} />
            <stop offset="55%" stopColor={palette.bodyMid} />
            <stop offset="100%" stopColor={palette.bodyEnd} />
          </linearGradient>

          <linearGradient id={bellyGradId} x1="60" y1="55" x2="60" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>

          <linearGradient id={wingGradId} x1="0" y1="50" x2="40" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.wingStart} />
            <stop offset="100%" stopColor={palette.wingEnd} />
          </linearGradient>

          <linearGradient id={goldGradId} x1="30" y1="10" x2="90" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Shadow under feet */}
        <ellipse cx="60" cy="112" rx="28" ry="5" fill="rgba(15, 23, 42, 0.18)" />

        {/* Cute Feet */}
        <path
          d="M 42 104 C 38 109, 44 111, 47 107 C 49 111, 54 109, 51 104 Z"
          fill={`url(#${goldGradId})`}
        />
        <path
          d="M 69 104 C 66 109, 71 111, 73 107 C 76 111, 82 109, 78 104 Z"
          fill={`url(#${goldGradId})`}
        />

        {/* Character Body + Unique Pose */}
        {renderUniqueCharacterPose()}

        {/* Eyes Socket Background */}
        <circle
          cx="44"
          cy="64"
          r="14"
          fill={activeCharacter === 'boba' ? palette.capTop : '#ffffff'}
          stroke="#e0e7ff"
          strokeWidth="1.5"
        />
        <circle
          cx="76"
          cy="64"
          r="14"
          fill={activeCharacter === 'boba' ? palette.capTop : '#ffffff'}
          stroke="#e0e7ff"
          strokeWidth="1.5"
        />
        {activeCharacter === 'boba' && (
          <>
            <circle cx="44" cy="64" r="10.5" fill="#ffffff" />
            <circle cx="76" cy="64" r="10.5" fill="#ffffff" />
          </>
        )}

        {/* Expressive Eyes based on Mood */}
        {mood === 'happy' || mood === 'celebrate' ? (
          <>
            <path
              d="M 36 65 Q 44 56 52 65"
              stroke="#1e1b4b"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 68 65 Q 76 56 84 65"
              stroke="#1e1b4b"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <circle
              cx={mood === 'thinking' ? 46 : 44}
              cy={mood === 'thinking' ? 61 : 64}
              r="7.5"
              fill="#1e1b4b"
            />
            <circle cx={mood === 'thinking' ? 43 : 41.5} cy={mood === 'thinking' ? 58 : 61} r="2.8" fill="#ffffff" />
            <circle cx="46.5" cy="66.5" r="1.3" fill="#ffffff" />

            <circle
              cx={mood === 'thinking' ? 78 : 76}
              cy={mood === 'thinking' ? 61 : 64}
              r="7.5"
              fill="#1e1b4b"
            />
            <circle cx={mood === 'thinking' ? 75 : 73.5} cy={mood === 'thinking' ? 58 : 61} r="2.8" fill="#ffffff" />
            <circle cx="78.5" cy="66.5" r="1.3" fill="#ffffff" />
          </>
        )}

        {/* Rosy Blushing Cheeks */}
        <ellipse cx="30" cy="73" rx="4.5" ry="2.5" fill="#fb7185" opacity="0.65" />
        <ellipse cx="90" cy="73" rx="4.5" ry="2.5" fill="#fb7185" opacity="0.65" />

        {/* Nose / Beak / Snout */}
        {activeCharacter === 'quizzie' || activeCharacter === 'atlas' || activeCharacter === 'solaris' ? (
          <polygon points="55,69 65,69 60,77" fill={`url(#${goldGradId})`} />
        ) : (
          <>
            <ellipse cx="60" cy="70" rx="4" ry="3" fill="#1e1b4b" />
            <path
              d="M 55 75 Q 60 79 65 75"
              stroke="#1e1b4b"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        {/* Equipped Accessory Layer */}
        {renderAccessoryLayer()}

        {/* Streak Flame Badge */}
        {mood === 'streak' && (
          <g transform="translate(85, 8)">
            <path
              d="M 12 2 C 12 2, 22 10, 20 20 C 19 26, 13 29, 10 28 C 5 27, 2 21, 5 14 C 7 10, 12 2, 12 2 Z"
              fill="#f97316"
            />
            <path
              d="M 12 10 C 12 10, 17 15, 16 21 C 15 24, 12 26, 10 25 C 8 24, 7 20, 9 16 C 10 13, 12 10, 12 10 Z"
              fill="#fde047"
            />
          </g>
        )}

        {/* Thinking Bubble */}
        {mood === 'thinking' && (
          <g>
            <circle cx="98" cy="36" r="3" fill="#a5b4fc" />
            <circle cx="105" cy="26" r="4.5" fill="#818cf8" />
            <circle cx="112" cy="14" r="6.5" fill={palette.bodyMid} />
          </g>
        )}

        {/* Celebrate Sparkles */}
        {(mood === 'celebrate' || mood === 'happy') && (
          <g>
            <path d="M 14 28 L 16 22 L 18 28 L 24 30 L 18 32 L 16 38 L 14 32 L 8 30 Z" fill="#fbbf24" />
            <path d="M 104 22 L 105.5 17 L 107 22 L 112 23.5 L 107 25 L 105.5 30 L 104 25 L 99 23.5 Z" fill="#ec4899" />
          </g>
        )}
      </svg>
    </div>
  );
};
