#!/usr/bin/env node
/**
 * Generates the 50 "extra" UI themes.
 *
 *   node scripts/generate-extra-themes.mjs
 *
 * Outputs (both are committed, so re-run this script after editing THEMES below):
 *   - src/data/extraThemes.ts   theme catalog entries + ExtraThemeId type
 *   - src/themes-extra.css      per-theme CSS variables, shared rules and page backgrounds
 *
 * To add a theme: add one entry to THEMES, run the script, done. The pickers read
 * the catalog automatically. No dependencies are required.
 *
 * Each theme is described by three colours (a = primary, b = secondary,
 * c = highlight) and one or more background pattern kinds (see PATTERNS).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ data */

// accent must be one of: indigo emerald amber rose cyan violet slate
const THEMES = [
  // --- Nature & weather -------------------------------------------------
  { id: 'ocean_reef', name: 'Coral Reef', emoji: '🐠', badge: 'Under the Sea', mode: 'light', accent: 'cyan', a: '#0891b2', b: '#f97316', c: '#fde047', kinds: ['bokeh', 'waves'], tagline: 'Turquoise water, coral-orange fish and sunny sand with drifting bubbles.' },
  { id: 'arctic_aurora', name: 'Arctic Aurora', emoji: '🌌', badge: 'Northern Lights', mode: 'dark', accent: 'cyan', a: '#22d3ee', b: '#a78bfa', c: '#34d399', kinds: ['aurora', 'stars'], tagline: 'Green and violet aurora ribbons over a frozen midnight sky.' },
  { id: 'golden_savanna', name: 'Golden Savanna', emoji: '🦁', badge: 'Safari Sun', mode: 'light', accent: 'amber', a: '#d97706', b: '#b45309', c: '#65a30d', kinds: ['horizon', 'stripes'], tagline: 'Amber grass, acacia green and a low golden sun across the plains.' },
  { id: 'rainforest_canopy', name: 'Rainforest Canopy', emoji: '🦜', badge: 'Jungle Green', mode: 'light', accent: 'emerald', a: '#15803d', b: '#16a34a', c: '#facc15', kinds: ['bigdots', 'aurora'], tagline: 'Layered leaf greens with macaw-yellow flashes and a humid glow.' },
  { id: 'alpine_snow', name: 'Alpine Snow', emoji: '🏔️', badge: 'Mountain Fresh', mode: 'light', accent: 'cyan', a: '#0ea5e9', b: '#64748b', c: '#bae6fd', kinds: ['horizon', 'dots'], tagline: 'Crisp glacier blue, slate rock and fresh white snow for a clear head.' },
  { id: 'autumn_maple', name: 'Autumn Maple', emoji: '🍁', badge: 'Fall Colors', mode: 'light', accent: 'amber', a: '#c2410c', b: '#b91c1c', c: '#f59e0b', kinds: ['scallop'], tagline: 'Maple red, pumpkin orange and golden leaves on a warm breeze.' },
  { id: 'spring_meadow', name: 'Spring Meadow', emoji: '🌼', badge: 'Fresh Bloom', mode: 'light', accent: 'emerald', a: '#65a30d', b: '#eab308', c: '#f472b6', kinds: ['bigdots'], tagline: 'Fresh grass green with buttercup yellow and tulip pink flowers.' },
  { id: 'lavender_fields', name: 'Lavender Fields', emoji: '💜', badge: 'Soft Purple', mode: 'light', accent: 'violet', a: '#8b5cf6', b: '#a78bfa', c: '#84cc16', kinds: ['vstripes', 'horizon'], tagline: 'Rows of lavender purple under a gentle countryside haze.' },
  { id: 'volcano_lava', name: 'Volcanic Lava', emoji: '🌋', badge: 'Molten', mode: 'dark', accent: 'rose', a: '#dc2626', b: '#ea580c', c: '#fbbf24', kinds: ['horizon', 'crosshatch'], tagline: 'Charcoal rock cracked with glowing lava reds and ember oranges.' },
  { id: 'deep_ocean', name: 'Deep Ocean Abyss', emoji: '🐋', badge: 'Deep Blue', mode: 'dark', accent: 'cyan', a: '#0369a1', b: '#0c4a6e', c: '#22d3ee', kinds: ['waves', 'bokeh'], tagline: 'Dark trench blues with bioluminescent cyan ripples far below.' },
  { id: 'thunderstorm', name: 'Thunderstorm', emoji: '⛈️', badge: 'Stormy', mode: 'dark', accent: 'indigo', a: '#475569', b: '#6366f1', c: '#fde047', kinds: ['stripes', 'aurora'], tagline: 'Slate storm clouds with electric-indigo flashes and lightning-yellow edges.' },
  { id: 'golden_sunrise', name: 'Golden Sunrise', emoji: '🌅', badge: 'Morning Glow', mode: 'light', accent: 'amber', a: '#f97316', b: '#fb7185', c: '#fde047', kinds: ['horizon', 'dots'], tagline: 'Peach, coral and gold light climbing the horizon for a fresh start.' },
  { id: 'rainy_day', name: 'Rainy Day Window', emoji: '☔', badge: 'Cozy Rain', mode: 'light', accent: 'slate', a: '#64748b', b: '#38bdf8', c: '#94a3b8', kinds: ['stripes', 'dots'], tagline: 'Cool gray-blue rain streaks on a window, perfect for a quiet read.' },
  { id: 'bamboo_zen', name: 'Bamboo Zen', emoji: '🎋', badge: 'Calm Grove', mode: 'light', accent: 'emerald', a: '#65a30d', b: '#4d7c0f', c: '#d9f99d', kinds: ['vstripes'], tagline: 'Bamboo greens with straight vertical stalks and a still, focused mood.' },
  { id: 'moonlit_lake', name: 'Moonlit Lake', emoji: '🌙', badge: 'Night Calm', mode: 'dark', accent: 'indigo', a: '#6366f1', b: '#38bdf8', c: '#e0e7ff', kinds: ['stars', 'waves'], tagline: 'Silver moonlight on a still indigo lake under a field of stars.' },

  // --- Places, eras & vibes ---------------------------------------------
  { id: 'pirate_voyage', name: 'Pirate Voyage', emoji: '🏴‍☠️', badge: 'Ahoy!', mode: 'dark', accent: 'amber', a: '#92400e', b: '#1e3a8a', c: '#fbbf24', kinds: ['planks', 'waves'], tagline: 'Weathered ship planks, deep-sea navy and a treasure-gold glint.' },
  { id: 'medieval_castle', name: 'Medieval Castle', emoji: '🏰', badge: 'Stone Keep', mode: 'light', accent: 'slate', a: '#57534e', b: '#b91c1c', c: '#fbbf24', kinds: ['grid'], tagline: 'Grey stonework with royal red banners and a golden crest.' },
  { id: 'steampunk_brass', name: 'Steampunk Brass', emoji: '⚙️', badge: 'Cogs & Brass', mode: 'dark', accent: 'amber', a: '#b45309', b: '#78350f', c: '#fcd34d', kinds: ['grid', 'diamonds'], tagline: 'Polished brass, copper pipes and riveted dark-iron panels.' },
  { id: 'ancient_egypt', name: 'Ancient Egypt', emoji: '🏺', badge: "Pharaoh's Study", mode: 'light', accent: 'amber', a: '#ca8a04', b: '#0d9488', c: '#1e3a8a', kinds: ['zigzag'], tagline: 'Sandstone gold, lapis blue and turquoise with zigzag borders.' },
  { id: 'greek_olympus', name: 'Greek Olympus', emoji: '🏛️', badge: 'Marble & Sea', mode: 'light', accent: 'cyan', a: '#0284c7', b: '#d4a017', c: '#e0f2fe', kinds: ['hstripes', 'horizon'], tagline: 'White marble, Aegean blue and gold laurel for a classical scholar.' },
  { id: 'samurai_dojo', name: 'Samurai Dojo', emoji: '🏯', badge: 'Bushido', mode: 'dark', accent: 'rose', a: '#b91c1c', b: '#1c1917', c: '#e5e7eb', kinds: ['vstripes'], tagline: 'Ink-black timber, crimson banners and the clean lines of a dojo.' },
  { id: 'viking_saga', name: 'Viking Saga', emoji: '⚔️', badge: 'Norse Legend', mode: 'dark', accent: 'slate', a: '#1e3a8a', b: '#78350f', c: '#94a3b8', kinds: ['crosshatch', 'waves'], tagline: 'Fjord blue, shield-wood brown and iron grey with carved texture.' },
  { id: 'wild_west', name: 'Wild West', emoji: '🤠', badge: 'Frontier', mode: 'light', accent: 'amber', a: '#b45309', b: '#92400e', c: '#fde68a', kinds: ['planks'], tagline: 'Dusty leather, saloon wood and a sheriff-badge gold.' },
  { id: 'art_deco', name: 'Art Deco Gold', emoji: '🎩', badge: 'Roaring 20s', mode: 'dark', accent: 'amber', a: '#ca8a04', b: '#0f172a', c: '#fde047', kinds: ['diamonds'], tagline: 'Black and gold geometry with sunburst diamonds from the jazz age.' },
  { id: 'victorian_library', name: 'Victorian Library', emoji: '📚', badge: 'Old Books', mode: 'dark', accent: 'rose', a: '#7f1d1d', b: '#166534', c: '#d4a017', kinds: ['crosshatch', 'horizon'], tagline: 'Oxblood leather, bottle green and gilded book spines by lamplight.' },
  { id: 'groovy_70s', name: 'Groovy 70s', emoji: '📻', badge: 'Far Out', mode: 'light', accent: 'amber', a: '#ea580c', b: '#ca8a04', c: '#84cc16', kinds: ['waves'], tagline: 'Burnt orange, mustard and avocado in concentric retro rings.' },
  { id: 'pixel_arcade', name: 'Pixel Arcade', emoji: '👾', badge: '8-Bit', mode: 'dark', accent: 'violet', a: '#7c3aed', b: '#22d3ee', c: '#facc15', kinds: ['checker'], tagline: 'Checkered pixel floors in purple, cyan and coin-yellow.' },
  { id: 'y2k_chrome', name: 'Y2K Chrome', emoji: '💿', badge: 'Millennium', mode: 'light', accent: 'cyan', a: '#94a3b8', b: '#ec4899', c: '#38bdf8', kinds: ['grid'], tagline: 'Cool chrome silver with hot-pink and sky-blue glossy grids.' },
  { id: 'vaporwave', name: 'Vaporwave', emoji: '🗿', badge: 'A E S T H E T I C', mode: 'dark', accent: 'violet', a: '#f472b6', b: '#22d3ee', c: '#a78bfa', kinds: ['horizon', 'grid'], tagline: 'Pastel pink, aqua and lilac dreamscape with a glowing horizon.' },
  { id: 'cyberpunk_city', name: 'Cyberpunk City', emoji: '🤖', badge: 'Neon Alley', mode: 'dark', accent: 'rose', a: '#facc15', b: '#ec4899', c: '#06b6d4', kinds: ['grid', 'aurora'], tagline: 'Rain-slick streets lit by yellow, magenta and cyan neon signs.' },
  { id: 'lofi_study', name: 'Lo-fi Study Room', emoji: '🎧', badge: 'Chill Beats', mode: 'dark', accent: 'violet', a: '#8b5cf6', b: '#fb923c', c: '#f9a8d4', kinds: ['bokeh'], tagline: 'Dim violet room glow with peach lamp light and soft bokeh.' },
  { id: 'coffee_shop', name: 'Coffee Shop', emoji: '☕', badge: 'Cafe Latte', mode: 'light', accent: 'amber', a: '#78350f', b: '#a16207', c: '#fef3c7', kinds: ['dots', 'horizon'], tagline: 'Espresso browns and cream foam with a warm cafe hum.' },
  { id: 'cozy_cabin', name: 'Cozy Cabin', emoji: '🔥', badge: 'Fireside', mode: 'dark', accent: 'amber', a: '#b45309', b: '#dc2626', c: '#fcd34d', kinds: ['planks', 'horizon'], tagline: 'Log-cabin planks lit by a crackling fireplace glow.' },

  // --- School, hobbies & fantasy ----------------------------------------
  { id: 'science_lab', name: 'Science Lab', emoji: '🧪', badge: 'Eureka!', mode: 'light', accent: 'emerald', a: '#10b981', b: '#06b6d4', c: '#a3e635', kinds: ['grid', 'bokeh'], tagline: 'Clean lab white with beaker green, bubbling cyan and a measuring grid.' },
  { id: 'graph_paper_math', name: 'Graph Paper Math', emoji: '📐', badge: 'Plot It', mode: 'light', accent: 'indigo', a: '#2563eb', b: '#ef4444', c: '#16a34a', kinds: ['grid'], tagline: 'Blue-ink graph paper with red axes and green highlighter marks.' },
  { id: 'periodic_neon', name: 'Periodic Neon', emoji: '⚗️', badge: 'Element Glow', mode: 'dark', accent: 'emerald', a: '#84cc16', b: '#22d3ee', c: '#e879f9', kinds: ['bigdots', 'grid'], tagline: 'Lime, cyan and magenta element-glow on a dark lab bench.' },
  { id: 'atlas_maps', name: 'Atlas & Maps', emoji: '🗺️', badge: 'Explorer', mode: 'light', accent: 'cyan', a: '#0e7490', b: '#b45309', c: '#65a30d', kinds: ['waves'], tagline: 'Sea-blue oceans, parchment land and the contour lines of an old atlas.' },
  { id: 'old_parchment', name: 'Old Parchment', emoji: '📜', badge: 'Ancient Scroll', mode: 'light', accent: 'amber', a: '#92400e', b: '#a16207', c: '#fde68a', kinds: ['dots'], tagline: 'Aged parchment with ink-brown flecks and faded gold.' },
  { id: 'concert_hall', name: 'Concert Hall', emoji: '🎼', badge: 'Symphony', mode: 'dark', accent: 'rose', a: '#7f1d1d', b: '#b45309', c: '#fcd34d', kinds: ['vstripes', 'horizon'], tagline: 'Velvet red curtains, gold trim and polished stage boards.' },
  { id: 'art_studio', name: 'Art Studio Splash', emoji: '🎨', badge: 'Paint Splash', mode: 'light', accent: 'rose', a: '#ec4899', b: '#facc15', c: '#3b82f6', kinds: ['bokeh'], tagline: 'Paint-splash pink, yellow and blue blobs on a bright canvas.' },
  { id: 'stadium_lights', name: 'Stadium Lights', emoji: '🏟️', badge: 'Game Day', mode: 'light', accent: 'emerald', a: '#16a34a', b: '#2563eb', c: '#f8fafc', kinds: ['vstripes', 'horizon'], tagline: 'Mowed turf stripes, white chalk lines and a bright stadium glow.' },
  { id: 'robotics_lab', name: 'Robotics Lab', emoji: '🦾', badge: 'Circuit Board', mode: 'dark', accent: 'cyan', a: '#64748b', b: '#06b6d4', c: '#f97316', kinds: ['grid', 'diamonds'], tagline: 'Steel grey panels with cyan circuit lines and orange status lights.' },
  { id: 'detective_noir', name: 'Detective Noir', emoji: '🕵️', badge: 'Case Closed', mode: 'dark', accent: 'slate', a: '#475569', b: '#facc15', c: '#e2e8f0', kinds: ['hstripes', 'horizon'], tagline: 'Black-and-white film noir, venetian-blind stripes and a streetlamp glow.' },
  { id: 'fairy_tale', name: 'Fairy Tale', emoji: '🧚', badge: 'Once Upon a Time', mode: 'light', accent: 'violet', a: '#c084fc', b: '#f9a8d4', c: '#fde68a', kinds: ['stars', 'bokeh'], tagline: 'Lilac, rose and starlight gold with sparkles drifting through the air.' },
  { id: 'dragon_realm', name: 'Dragon Realm', emoji: '🐉', badge: 'Fire & Scale', mode: 'dark', accent: 'rose', a: '#dc2626', b: '#15803d', c: '#fbbf24', kinds: ['scallop', 'horizon'], tagline: 'Dragon-scale scallops in ember red and emerald with a gold hoard.' },
  { id: 'dino_world', name: 'Dino World', emoji: '🦖', badge: 'Jurassic', mode: 'light', accent: 'emerald', a: '#65a30d', b: '#a16207', c: '#f97316', kinds: ['bigdots', 'horizon'], tagline: 'Fern green, amber fossil and volcanic-orange skies of the Jurassic.' },
  { id: 'kawaii_pastel', name: 'Kawaii Pastel', emoji: '🧸', badge: 'Super Cute', mode: 'light', accent: 'rose', a: '#f9a8d4', b: '#a5b4fc', c: '#fde68a', kinds: ['bigdots'], tagline: 'Marshmallow pink, periwinkle and butter-yellow polka dots.' },
  { id: 'monochrome_ink', name: 'Monochrome Ink', emoji: '⬛', badge: 'Pure Focus', mode: 'light', accent: 'slate', a: '#111827', b: '#4b5563', c: '#e5e7eb', kinds: ['crosshatch'], tagline: 'Black ink, graphite grey and paper white with fine hatching.' },
  { id: 'sunset_beach', name: 'Sunset Beach', emoji: '🏖️', badge: 'Golden Hour', mode: 'light', accent: 'amber', a: '#fb923c', b: '#f43f5e', c: '#38bdf8', kinds: ['horizon', 'waves'], tagline: 'Orange sunset skies melting into coral waves and sea-blue sand.' },
  { id: 'midnight_city', name: 'Midnight Skyline', emoji: '🌃', badge: 'City Lights', mode: 'dark', accent: 'indigo', a: '#1d4ed8', b: '#7c3aed', c: '#fbbf24', kinds: ['horizon', 'bigdots'], tagline: 'Indigo night sky, violet haze and window lights glowing across the skyline.' },
];

/* --------------------------------------------------------- colour helpers */

const ACCENTS = ['indigo', 'emerald', 'amber', 'rose', 'cyan', 'violet', 'slate'];
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (c1, c2, t) => c1.map((v, i) => Math.round(v * (1 - t) + c2[i] * t));
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const lum = ([r, g, b]) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${+a.toFixed(3)})`;
const toHex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
// Darken until the colour is dark enough for white banner text.
const forWhiteText = (c, max = 0.26) => {
  let out = c;
  for (let i = 0; i < 12 && lum(out) > max; i++) out = mix(out, BLACK, 0.12);
  return out;
};

/* -------------------------------------------------------------- patterns */

// A layer is [image, size, position, isGlow]. Glows are sorted to the back.
const L = (image, size = '100% 100%', pos = '0 0') => [image, size, pos, false];
const glow = (at, c, a, stop = 45) => [`radial-gradient(at ${at}, ${rgba(c, a)} 0px, transparent ${stop}%)`, '100% 100%', '0 0', true];

const PATTERNS = {
  dots: ({ a, b, al, k }) => [
    L(`radial-gradient(${rgba(a, al * 1.1)} 1.5px, transparent 1.5px)`, '24px 24px'),
    glow('0% 0%', a, 0.14 * k),
    glow('100% 100%', b, 0.12 * k),
  ],
  bigdots: ({ b, c, al, k, a }) => [
    L(`radial-gradient(${rgba(b, al * 1.5)} 3px, transparent 3.5px)`, '44px 44px'),
    L(`radial-gradient(${rgba(c, al * 1.5)} 3px, transparent 3.5px)`, '44px 44px', '22px 22px'),
    glow('0% 0%', a, 0.14 * k),
    glow('100% 100%', b, 0.12 * k),
  ],
  grid: ({ a, b, al, k }) => [
    L(`linear-gradient(to right, ${rgba(a, al)} 1px, transparent 1px)`, '28px 28px'),
    L(`linear-gradient(to bottom, ${rgba(a, al)} 1px, transparent 1px)`, '28px 28px'),
    glow('0% 0%', a, 0.12 * k),
    glow('100% 100%', b, 0.12 * k),
  ],
  stripes: ({ a, b, al, k }) => [
    L(`repeating-linear-gradient(-45deg, ${rgba(a, al * 0.8)} 0px, ${rgba(a, al * 0.8)} 10px, transparent 10px, transparent 22px)`),
    glow('0% 0%', a, 0.12 * k),
    glow('100% 100%', b, 0.12 * k),
  ],
  vstripes: ({ a, b, al, k }) => [
    L(`repeating-linear-gradient(90deg, ${rgba(a, al * 0.9)} 0px, ${rgba(a, al * 0.9)} 14px, transparent 14px, transparent 30px)`),
    glow('0% 0%', a, 0.12 * k),
    glow('100% 0%', b, 0.12 * k),
  ],
  hstripes: ({ a, b, al, k }) => [
    L(`repeating-linear-gradient(0deg, ${rgba(a, al * 1.2)} 0px, ${rgba(a, al * 1.2)} 2px, transparent 2px, transparent 26px)`),
    glow('0% 0%', a, 0.12 * k),
    glow('100% 100%', b, 0.12 * k),
  ],
  checker: ({ a, b, al, k }) => {
    const x = rgba(a, al * 0.9);
    const img = `linear-gradient(45deg, ${x} 25%, transparent 25%, transparent 75%, ${x} 75%)`;
    return [L(img, '44px 44px', '0 0'), L(img, '44px 44px', '22px 22px'), glow('0% 0%', a, 0.12 * k), glow('100% 100%', b, 0.12 * k)];
  },
  waves: ({ a, b, al, k }) => [
    L(`repeating-radial-gradient(circle at 0% 100%, transparent 0px, transparent 22px, ${rgba(a, al)} 22px, ${rgba(a, al)} 24px)`),
    glow('100% 0%', b, 0.14 * k),
  ],
  stars: ({ a, b, c, dark, k }) => [
    L(`radial-gradient(circle, ${rgba(c, dark ? 0.85 : 0.45)} 1px, transparent 1.6px)`, '97px 97px'),
    L(`radial-gradient(circle, ${rgba(c, dark ? 0.55 : 0.30)} 1px, transparent 1.6px)`, '61px 61px', '23px 31px'),
    glow('10% 0%', a, 0.18 * k),
    glow('95% 90%', b, 0.18 * k),
  ],
  aurora: ({ a, b, c, k }) => [
    L(`radial-gradient(ellipse at 20% 0%, ${rgba(a, 0.30 * k)} 0px, transparent 55%)`),
    L(`radial-gradient(ellipse at 60% 0%, ${rgba(b, 0.24 * k)} 0px, transparent 55%)`),
    L(`radial-gradient(ellipse at 95% 15%, ${rgba(c, 0.20 * k)} 0px, transparent 50%)`),
  ],
  horizon: ({ a, b, k }) => [
    L(`linear-gradient(to top, ${rgba(a, 0.28 * k)} 0%, transparent 45%)`),
    glow('50% 0%', b, 0.16 * k, 50),
  ],
  scallop: ({ a, b, al, k }) => [
    L(`radial-gradient(circle at 50% 100%, transparent 9px, ${rgba(a, al * 1.2)} 9px, ${rgba(a, al * 1.2)} 10.5px, transparent 10.5px)`, '28px 16px'),
    glow('0% 0%', a, 0.12 * k),
    glow('100% 100%', b, 0.12 * k),
  ],
  crosshatch: ({ a, b, al, k }) => [
    L(`repeating-linear-gradient(45deg, ${rgba(a, al * 0.6)} 0px, ${rgba(a, al * 0.6)} 1px, transparent 1px, transparent 9px)`),
    L(`repeating-linear-gradient(-45deg, ${rgba(a, al * 0.6)} 0px, ${rgba(a, al * 0.6)} 1px, transparent 1px, transparent 9px)`),
    glow('0% 0%', a, 0.12 * k),
    glow('100% 100%', b, 0.12 * k),
  ],
  diamonds: ({ a, b, al, k }) => [
    L(`linear-gradient(45deg, ${rgba(a, al)} 1px, transparent 1px)`, '36px 36px'),
    L(`linear-gradient(-45deg, ${rgba(a, al)} 1px, transparent 1px)`, '36px 36px'),
    glow('0% 0%', a, 0.12 * k),
    glow('100% 100%', b, 0.12 * k),
  ],
  zigzag: ({ a, b, al, k }) => {
    const x = rgba(a, al * 1.1);
    return [
      L(`linear-gradient(135deg, ${x} 25%, transparent 25%)`, '36px 36px', '-18px 0'),
      L(`linear-gradient(225deg, ${x} 25%, transparent 25%)`, '36px 36px', '-18px 0'),
      L(`linear-gradient(315deg, ${x} 25%, transparent 25%)`, '36px 36px', '0 0'),
      L(`linear-gradient(45deg, ${x} 25%, transparent 25%)`, '36px 36px', '0 0'),
      glow('100% 100%', b, 0.12 * k),
    ];
  },
  bokeh: ({ a, b, c, k }) => [
    L(`radial-gradient(circle at 15% 25%, ${rgba(a, 0.20 * k)} 0px, transparent 150px)`),
    L(`radial-gradient(circle at 85% 20%, ${rgba(b, 0.18 * k)} 0px, transparent 140px)`),
    L(`radial-gradient(circle at 70% 85%, ${rgba(c, 0.18 * k)} 0px, transparent 160px)`),
    L(`radial-gradient(circle at 25% 90%, ${rgba(a, 0.12 * k)} 0px, transparent 120px)`),
  ],
  planks: ({ a, b, al, k }) => [
    L(`linear-gradient(90deg, ${rgba(a, al * 1.3)} 2px, transparent 2px)`, '140px 100%'),
    L(`repeating-linear-gradient(0deg, ${rgba(a, al * 0.4)} 0px, ${rgba(a, al * 0.4)} 1px, transparent 1px, transparent 7px)`),
    glow('15% 0%', b, 0.16 * k, 50),
  ],
};

const HERO_OVERLAY = {
  dots: () => [['radial-gradient(rgba(255, 255, 255, 0.22) 1.75px, transparent 1.75px)', '18px 18px']],
  stripes: () => [['repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.07) 0px, rgba(255, 255, 255, 0.07) 10px, transparent 10px, transparent 20px)', '100% 100%']],
  vertical: () => [['repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.10) 0px, rgba(0, 0, 0, 0.10) 2px, transparent 2px, transparent 28px)', '100% 100%']],
  grid: () => [
    ['linear-gradient(to right, rgba(255, 255, 255, 0.14) 1px, transparent 1px)', '28px 28px'],
    ['linear-gradient(to bottom, rgba(255, 255, 255, 0.14) 1px, transparent 1px)', '28px 28px'],
  ],
  stars: () => [
    ['radial-gradient(circle, rgba(255, 255, 255, 0.85) 1px, transparent 1.5px)', '90px 90px'],
    ['radial-gradient(circle, rgba(255, 255, 255, 0.6) 0.8px, transparent 1.3px)', '57px 57px'],
  ],
};
const HERO_FOR_KIND = {
  stripes: 'stripes', hstripes: 'stripes', crosshatch: 'stripes', diamonds: 'stripes', zigzag: 'stripes',
  vstripes: 'vertical', planks: 'vertical',
  grid: 'grid', checker: 'grid',
  stars: 'stars',
};

/* ------------------------------------------------------------ generation */

function pageBackground(t, dark) {
  const raw = { a: hex2rgb(t.a), b: hex2rgb(t.b), c: hex2rgb(t.c) };
  // On dark backgrounds, brighten the pattern colours so they stay visible.
  const col = dark
    ? { a: mix(raw.a, WHITE, 0.35), b: mix(raw.b, WHITE, 0.35), c: mix(raw.c, WHITE, 0.2) }
    : raw;
  const base = dark
    ? mix(mix(raw.a, raw.b, 0.5), BLACK, 0.9)
    : mix(mix(raw.a, raw.b, 0.5), WHITE, 0.94);
  const params = { ...col, al: dark ? 0.13 : 0.12, k: dark ? 1.25 : 1, dark };
  let layers = t.kinds.flatMap((kind) => PATTERNS[kind](params));
  layers = [...layers.filter((l) => !l[3]), ...layers.filter((l) => l[3])];
  const sel = `html[data-ui-theme="${t.id}"]${dark ? '.dark' : ':not(.dark)'} .atelier-canvas-bg`;
  return [
    `${sel} {`,
    `  background-color: ${toHex(base).toUpperCase()};`,
    `  background-image:\n    ${layers.map((l) => l[0]).join(',\n    ')};`,
    `  background-size: ${layers.map((l) => l[1]).join(', ')};`,
    `  background-position: ${layers.map((l) => l[2]).join(', ')};`,
    `}`,
  ].join('\n');
}

function themeVariables(t) {
  const a = forWhiteText(hex2rgb(t.a));
  const b = forWhiteText(hex2rgb(t.b));
  const cRaw = hex2rgb(t.c);
  const c = forWhiteText(cRaw, 0.3);
  const overlayKind = HERO_FOR_KIND[t.kinds[0]] ?? 'dots';
  const overlay = HERO_OVERLAY[overlayKind]();
  const gradient = `linear-gradient(135deg, ${toHex(a)} 0%, ${toHex(b)} 52%, ${toHex(c)} 100%)`;
  const images = [...overlay.map((o) => o[0]), gradient];
  const sizes = [...overlay.map((o) => o[1]), '100% 100%'];
  const border = lum(cRaw) < 0.35 ? mix(cRaw, WHITE, 0.55) : cRaw;
  const panelHover = lum(cRaw) < 0.7 ? cRaw : hex2rgb(t.b);
  const ink = mix(hex2rgb(t.a), BLACK, 0.75);
  return [
    `html[data-ui-theme="${t.id}"] {`,
    `  --t-hero-img:\n    ${images.join(',\n    ')};`,
    `  --t-hero-size: ${sizes.join(', ')};`,
    `  --t-hero-border: ${toHex(border)};`,
    `  --t-hover: ${rgba(hex2rgb(t.a), 0.32)};`,
    `  --t-panel-hover: ${toHex(panelHover)};`,
    `  --t-ink: ${toHex(ink)};`,
    `}`,
  ].join('\n');
}

function buildCss() {
  const isList = THEMES.map((t) => `  [data-ui-theme="${t.id}"]`).join(',\n');
  const IS = `html:is(\n${isList}\n)`;
  const parts = [];
  parts.push(`/* ==========================================================================
   50 EXTRA UI THEMES  (GENERATED, do not edit by hand)
   Source: scripts/generate-extra-themes.mjs  ->  node scripts/generate-extra-themes.mjs
   Loaded after index.css (see main.tsx) so these rules win ties with the base styles.
   ========================================================================== */
`);
  parts.push('/* ---- Variables per theme ---- */');
  parts.push(THEMES.map(themeVariables).join('\n'));
  parts.push(`
/* ---- Shared rules (hero banners, hover colours, card ink shadow) ---- */
${IS} :is(.holo-command-deck, .command-deck-hero, .comic-tab-hero) {
  background-image: var(--t-hero-img) !important;
  background-size: var(--t-hero-size) !important;
  border-color: var(--t-hero-border) !important;
}

${IS} .comic-pop-card:hover {
  box-shadow: 4px 7px 0 0 var(--t-hover);
}

${IS} .comic-panel:hover {
  border-bottom-color: var(--t-panel-hover) !important;
}

html:not(.dark):is(
${isList}
) .comic-pop-card:not(:hover) {
  box-shadow: 0 5px 0 0 var(--t-ink);
}
`);
  parts.push('/* ---- Page backgrounds: light + dark per theme ---- */');
  for (const t of THEMES) {
    parts.push(`/* ${t.name} */`);
    parts.push(pageBackground(t, false));
    parts.push(pageBackground(t, true));
  }
  return parts.join('\n') + '\n';
}

const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function buildTs() {
  const items = THEMES.map(
    (t) => `  {
    id: ${q(t.id)},
    name: ${q(t.name)},
    tagline: ${q(t.tagline)},
    emoji: ${q(t.emoji)},
    badge: ${q(t.badge)},
    swatchGradient: ${q(`from-[${t.a}] via-[${t.b}] to-[${t.c}]`)},
    recommendedMode: ${q(t.mode)},
    recommendedAccent: ${q(t.accent)},
  },`
  ).join('\n');
  return `// GENERATED FILE, do not edit by hand.
// Source: scripts/generate-extra-themes.mjs (run \`npm run themes:generate\`).
// The matching CSS lives in src/themes-extra.css.

export const EXTRA_THEME_IDS = [
${THEMES.map((t) => `  ${q(t.id)},`).join('\n')}
] as const;

export type ExtraThemeId = (typeof EXTRA_THEME_IDS)[number];

export interface ExtraThemeCatalogItem {
  id: ExtraThemeId;
  name: string;
  tagline: string;
  emoji: string;
  badge: string;
  swatchGradient: string;
  recommendedMode: 'light' | 'dark';
  recommendedAccent: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'slate';
}

export const EXTRA_UI_THEMES: ExtraThemeCatalogItem[] = [
${items}
];
`;
}

/* ----------------------------------------------------------- validation */

const seen = new Set();
for (const t of THEMES) {
  if (seen.has(t.id)) throw new Error(`duplicate theme id: ${t.id}`);
  seen.add(t.id);
  if (!ACCENTS.includes(t.accent)) throw new Error(`${t.id}: bad accent ${t.accent}`);
  if (!['light', 'dark'].includes(t.mode)) throw new Error(`${t.id}: bad mode`);
  for (const k of ['a', 'b', 'c']) if (!/^#[0-9a-f]{6}$/i.test(t[k])) throw new Error(`${t.id}: bad colour ${k}`);
  for (const k of t.kinds) if (!PATTERNS[k]) throw new Error(`${t.id}: unknown pattern ${k}`);
}

mkdirSync(resolve(ROOT, 'src/data'), { recursive: true });
writeFileSync(resolve(ROOT, 'src/data/extraThemes.ts'), buildTs());
writeFileSync(resolve(ROOT, 'src/themes-extra.css'), buildCss());
console.log(`Generated ${THEMES.length} themes -> src/data/extraThemes.ts, src/themes-extra.css`);
