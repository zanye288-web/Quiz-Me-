import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/audio';

export type MascotMood = 'idle' | 'happy' | 'streak' | 'thinking' | 'comforting' | 'teacher';
export type MascotTheme = 'emerald' | 'indigo' | 'amber' | 'cyan' | 'violet';

export interface MascotAvatarProps {
  mood?: MascotMood;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
  interactive?: boolean;
  theme?: MascotTheme;
  onClick?: () => void;
  showHoverTip?: boolean;
}

// Random encouraging Quizzie tips for interactive clicks
const QUIZZIE_WISDOMS = [
  "Hoot hoot! Small daily steps build massive knowledge!",
  "Mistakes aren't failures — they're brain upgrades!",
  "Take a deep breath. You're smarter than you think!",
  "Curiosity is your superpower. Keep asking questions!",
  "Repetition turns short-term facts into lifelong mastery!",
  "Hydrate, stretch, and conquer the next question!",
  "Focus on progress, not perfection!",
  "You've got this! Let's level up together!"
];

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  mood = 'idle',
  size = 'md',
  showSpeechBubble = false,
  speechText = '',
  className = '',
  interactive = true,
  theme = 'emerald',
  onClick,
  showHoverTip = false,
}) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const [particles, setParticles] = useState<{ id: number; char: string; x: number; y: number }[]>([]);
  const [interactiveTip, setInteractiveTip] = useState<string | null>(null);
  const [tipTimeout, setTipTimeout] = useState<NodeJS.Timeout | null>(null);

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
  const grad = `qz_${mood}_${theme}_${instanceId}`;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }

    if (!interactive) return;

    soundFx.playPop();
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);

    // Spawn cute floating particle (star, heart, or spark)
    const particleChars = ['✨', '⭐', '🦉', '💡', '🌟', '💖'];
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

    // If no explicit speechText is provided, show a fun Quizzie wisdom tip on click!
    if (!speechText) {
      if (tipTimeout) clearTimeout(tipTimeout);
      const randomWisdom = QUIZZIE_WISDOMS[Math.floor(Math.random() * QUIZZIE_WISDOMS.length)];
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
    emerald: {
      bodyStart: '#34D399',
      bodyMid: '#10B981',
      bodyEnd: '#047857',
      wingStart: '#10B981',
      wingEnd: '#065F46',
      accentGlow: 'from-emerald-500/30 via-teal-400/20 to-indigo-500/20',
      featherStroke: '#059669',
    },
    indigo: {
      bodyStart: '#818CF8',
      bodyMid: '#6366F1',
      bodyEnd: '#4338CA',
      wingStart: '#4F46E5',
      wingEnd: '#312E81',
      accentGlow: 'from-indigo-500/30 via-purple-500/20 to-blue-500/20',
      featherStroke: '#4338CA',
    },
    amber: {
      bodyStart: '#FBBF24',
      bodyMid: '#F59E0B',
      bodyEnd: '#B45309',
      wingStart: '#F59E0B',
      wingEnd: '#92400E',
      accentGlow: 'from-amber-500/35 via-orange-400/25 to-yellow-300/20',
      featherStroke: '#D97706',
    },
    cyan: {
      bodyStart: '#38BDF8',
      bodyMid: '#0EA5E9',
      bodyEnd: '#0369A1',
      wingStart: '#0284C7',
      wingEnd: '#075985',
      accentGlow: 'from-sky-500/30 via-cyan-400/20 to-blue-500/20',
      featherStroke: '#0284C7',
    },
    violet: {
      bodyStart: '#C084FC',
      bodyMid: '#A855F7',
      bodyEnd: '#7E22CE',
      wingStart: '#9333EA',
      wingEnd: '#6B21A8',
      accentGlow: 'from-purple-500/30 via-fuchsia-400/20 to-indigo-500/20',
      featherStroke: '#7E22CE',
    },
  }[theme];

  // Specific mood theme overrides
  let activePalette = themePalette;
  if (mood === 'teacher') {
    activePalette = {
      bodyStart: '#818CF8',
      bodyMid: '#6366F1',
      bodyEnd: '#3730A3',
      wingStart: '#4F46E5',
      wingEnd: '#312E81',
      accentGlow: 'from-indigo-500/35 via-violet-500/25 to-blue-400/25',
      featherStroke: '#4F46E5',
    };
  } else if (mood === 'streak') {
    activePalette = {
      bodyStart: '#FBBF24',
      bodyMid: '#F59E0B',
      bodyEnd: '#D97706',
      wingStart: '#F59E0B',
      wingEnd: '#92400E',
      accentGlow: 'from-amber-500/40 via-orange-500/30 to-yellow-400/40',
      featherStroke: '#D97706',
    };
  } else if (mood === 'comforting') {
    activePalette = {
      bodyStart: '#38BDF8',
      bodyMid: '#0EA5E9',
      bodyEnd: '#0284C7',
      wingStart: '#0284C7',
      wingEnd: '#0369A1',
      accentGlow: 'from-sky-400/30 via-teal-300/25 to-blue-400/20',
      featherStroke: '#0284C7',
    };
  }

  const effectiveSpeechText = speechText || (interactiveTip ?? '');
  const shouldShowBubble = showSpeechBubble || Boolean(interactiveTip);

  return (
    <div className={`relative inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* Modern Mascot Container with 3D Depth, Ambient Lighting & Micro-Interactions */}
      <div
        onClick={handleClick}
        className={`relative ${sizeClasses[size]} shrink-0 transition-transform duration-300 ${
          interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : ''
        } ${isWiggling ? 'animate-bounce' : 'hover:-rotate-2'} filter drop-shadow-md`}
        title={interactive ? 'Click Quizzie for study tips!' : 'Quizzie the Owl'}
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

        {/* Ambient Halo Lighting depending on mood */}
        {(mood === 'streak' || mood === 'happy' || mood === 'teacher') && (
          <div
            className={`absolute -inset-1.5 bg-gradient-to-tr ${activePalette.accentGlow} rounded-full blur-xl animate-pulse -z-10`}
          />
        )}

        {/* Ultra-Modern Sleek SVG Vector Illustration of Quizzie */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Torso Gradient with Curved Depth */}
            <linearGradient id={`${grad}_body`} x1="24" y1="18" x2="96" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activePalette.bodyStart} />
              <stop offset="42%" stopColor={activePalette.bodyMid} />
              <stop offset="100%" stopColor={activePalette.bodyEnd} />
            </linearGradient>

            {/* Creamy Frosted Belly Gradient */}
            <linearGradient id={`${grad}_belly`} x1="60" y1="44" x2="60" y2="104" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#F8FAFC" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.88" />
            </linearGradient>

            {/* Wings Depth Gradient */}
            <linearGradient id={`${grad}_wing`} x1="16" y1="42" x2="36" y2="92" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activePalette.wingStart} />
              <stop offset="100%" stopColor={activePalette.wingEnd} />
            </linearGradient>

            {/* 3D Golden Faceted Beak Gradient */}
            <linearGradient id={`${grad}_beakTop`} x1="53" y1="52" x2="67" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id={`${grad}_beakBottom`} x1="60" y1="58" x2="60" y2="69" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Sleek Eye Iris Gradient */}
            <radialGradient id={`${grad}_iris`} cx="43" cy="46" r="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="70%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Top Rim Specular Light Filter */}
            <linearGradient id={`${grad}_rimLight`} x1="36" y1="18" x2="84" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
            </linearGradient>

            {/* Soft Ambient Shadow Filter */}
            <filter id={`${grad}_softShadow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#0F172A" floodOpacity="0.2" />
            </filter>
            <filter id={`${grad}_glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Cast Ground Shadow */}
          <ellipse cx="60" cy="113" rx="34" ry="5" fill="#0F172A" fillOpacity="0.16" />

          {/* Sleek Modern Aerodynamic Ear Crests */}
          <g filter={`url(#${grad}_softShadow)`}>
            {/* Left Ear Crest */}
            <path
              d="M33 36C26 23 19 12 21 11C23 10 32 18 39 25C43 29 44 33 44 35"
              fill={`url(#${grad}_wing)`}
            />
            <path
              d="M31 34C26 24 20 14 21 13C23 12 30 19 36 26"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />

            {/* Right Ear Crest */}
            <path
              d="M87 36C94 23 101 12 99 11C97 10 88 18 81 25C77 29 76 33 76 35"
              fill={`url(#${grad}_wing)`}
            />
            <path
              d="M89 34C94 24 100 14 99 13C97 12 90 19 84 26"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />
          </g>

          {/* Torso Body: Sleek Modern Capsule/Pear Silhouette */}
          <path
            d="M60 18C36 18 21 34 21 63C21 89 37 109 60 109C83 109 99 89 99 63C99 34 84 18 60 18Z"
            fill={`url(#${grad}_body)`}
            filter={`url(#${grad}_softShadow)`}
          />

          {/* Subtle Top Rim Highlight Reflection */}
          <path
            d="M35 27C42 21 51 19 60 19C69 19 78 21 85 27C78 23 69 21.2 60 21.2C51 21.2 42 23 35 27Z"
            fill={`url(#${grad}_rimLight)`}
          />

          {/* Modern Layered Wings */}
          {mood === 'happy' || mood === 'streak' ? (
            /* Joyful raised victory celebration wings */
            <g filter={`url(#${grad}_softShadow)`}>
              <path
                d="M22 52C10 33 2 45 7 66C12 79 23 72 23 72"
                fill={`url(#${grad}_wing)`}
              />
              <path
                d="M10 44C13 54 18 64 21 68"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeOpacity="0.45"
              />
              <path
                d="M98 52C110 33 118 45 113 66C108 79 97 72 97 72"
                fill={`url(#${grad}_wing)`}
              />
              <path
                d="M110 44C107 54 102 64 99 68"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeOpacity="0.45"
              />
            </g>
          ) : mood === 'thinking' ? (
            /* One resting wing, one raised to chin thoughtfully */
            <g filter={`url(#${grad}_softShadow)`}>
              <path
                d="M22 56C12 60 10 78 17 90C22 98 28 88 28 88"
                fill={`url(#${grad}_wing)`}
              />
              {/* Right wing poised touching chin */}
              <path
                d="M98 60C92 46 76 49 70 57C66 61 71 65 76 63C82 59 92 61 94 72"
                fill={`url(#${grad}_wing)`}
              />
            </g>
          ) : (
            /* Sleek resting aerodynamic tucked wings */
            <g filter={`url(#${grad}_softShadow)`}>
              {/* Left Wing */}
              <path
                d="M22 55C12 59 10 77 17 89C22 98 28 88 28 88"
                fill={`url(#${grad}_wing)`}
              />
              <path
                d="M18 64C16 73 19 82 23 86"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeOpacity="0.35"
              />
              {/* Right Wing */}
              <path
                d="M98 55C108 59 110 77 103 89C98 98 92 88 92 88"
                fill={`url(#${grad}_wing)`}
              />
              <path
                d="M102 64C104 73 101 82 97 86"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeOpacity="0.35"
              />
            </g>
          )}

          {/* Frosted Curved Belly Plume */}
          <ellipse cx="60" cy="76" rx="27" ry="29" fill={`url(#${grad}_belly)`} />
          {/* Subtle Belly Glass Edge Highlight */}
          <path
            d="M37 72C42 61 50 56 60 56C70 56 78 61 83 72"
            stroke="white"
            strokeWidth="1.2"
            strokeOpacity="0.6"
            strokeLinecap="round"
          />

          {/* Sleek Minimalist Plumage Chevrons */}
          <g stroke={activePalette.featherStroke} strokeWidth="2.2" strokeLinecap="round" opacity="0.65">
            <path d="M53 68C57 71.5 63 71.5 67 68" />
            <path d="M48 79C54 83.5 66 83.5 72 79" />
            <path d="M53 90C57 93.5 63 93.5 67 90" />
          </g>

          {/* Streak Flame Headband */}
          {mood === 'streak' && (
            <g filter={`url(#${grad}_softShadow)`}>
              <rect x="23" y="27" width="74" height="9.5" rx="4.75" fill="#EF4444" />
              <rect x="23" y="27" width="74" height="2" fill="#F87171" rx="1" />
              {/* Dynamic Sleek Flame Emblem */}
              <circle cx="60" cy="31.5" r="7" fill="#18181B" />
              <path d="M54 32C54 22 60 14 60 14C60 14 66 22 66 32C66 35 63.5 37 60 37C56.5 37 54 35 54 32Z" fill="#F59E0B" />
              <path d="M56.5 32C56.5 25 60 19 60 19C60 19 63.5 25 63.5 32C63.5 34 62 35.5 60 35.5C58 35.5 56.5 34 56.5 32Z" fill="#FDE047" />
            </g>
          )}

          {/* Teacher Scholar Cap */}
          {mood === 'teacher' && (
            <g filter={`url(#${grad}_softShadow)`}>
              {/* Mortarboard Upper Diamond */}
              <polygon points="60,3 105,19 60,34 15,19" fill="#1E1B4B" />
              <polygon points="34,23 86,23 78,35 42,35" fill="#312E81" />
              {/* Golden Specular Edge on Cap */}
              <line x1="15" y1="19" x2="60" y2="34" stroke="#4338CA" strokeWidth="1.2" />
              <line x1="60" y1="34" x2="105" y2="19" stroke="#4338CA" strokeWidth="1.2" />
              {/* Golden Center Button & Flowing Tassel */}
              <circle cx="60" cy="19" r="2.8" fill="#F59E0B" />
              <path d="M60 19Q78 21 95 33" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="95" cy="35" r="3.2" fill="#F59E0B" />
            </g>
          )}

          {/* Expressive Eyes System */}
          {mood === 'happy' || mood === 'streak' ? (
            /* Joyous anime arcs with blushing cheeks */
            <g>
              {/* Eye sockets white base */}
              <circle cx="43" cy="46" r="16" fill="white" />
              <circle cx="77" cy="46" r="16" fill="white" />
              {/* Joyous crescent curved eyes */}
              <path
                d="M33 47C35 37 51 37 53 47"
                stroke="#0F172A"
                strokeWidth="4.8"
                strokeLinecap="round"
              />
              <path
                d="M67 47C69 37 85 37 87 47"
                stroke="#0F172A"
                strokeWidth="4.8"
                strokeLinecap="round"
              />
              {/* Star sparkle accent */}
              <path
                d="M43 40L44.5 43.5L48 45L44.5 46.5L43 50L41.5 46.5L38 45L41.5 43.5Z"
                fill="#FBBF24"
                opacity="0.9"
              />
              <path
                d="M77 40L78.5 43.5L82 45L78.5 46.5L77 50L75.5 46.5L72 45L75.5 43.5Z"
                fill="#FBBF24"
                opacity="0.9"
              />
              {/* Cute Blushing Cheeks with subtle gradient */}
              <ellipse cx="29" cy="60" rx="6.5" ry="4" fill="#FB7185" fillOpacity="0.65" />
              <ellipse cx="91" cy="60" rx="6.5" ry="4" fill="#FB7185" fillOpacity="0.65" />
            </g>
          ) : mood === 'comforting' ? (
            /* Warm Caring Large Anime-Style Glossy Eyes */
            <g>
              <circle cx="43" cy="46" r="16.5" fill="white" />
              <circle cx="77" cy="46" r="16.5" fill="white" />
              {/* Pupils */}
              <circle cx="43" cy="47" r="10" fill="#0F172A" />
              <circle cx="77" cy="47" r="10" fill="#0F172A" />
              {/* Glossy Multi-Catchlights with Heart Highlights */}
              <circle cx="46.5" cy="43.5" r="4" fill="white" />
              <circle cx="80.5" cy="43.5" r="4" fill="white" />
              <circle cx="40" cy="51" r="2" fill="white" />
              <circle cx="74" cy="51" r="2" fill="white" />
              {/* Gentle Pastel Blush */}
              <ellipse cx="29" cy="60" rx="6.5" ry="4" fill="#F472B6" fillOpacity="0.55" />
              <ellipse cx="91" cy="60" rx="6.5" ry="4" fill="#F472B6" fillOpacity="0.55" />
            </g>
          ) : (
            /* Modern Sleek Curious Eyes with 3D Depth */
            <g>
              <circle cx="43" cy="46" r="16.5" fill="white" />
              <circle cx="77" cy="46" r="16.5" fill="white" />
              {/* Outer Iris Edge */}
              <circle cx="43" cy="46" r="9.8" fill={`url(#${grad}_iris)`} />
              <circle cx="77" cy="46" r="9.8" fill={`url(#${grad}_iris)`} />
              {/* Iris Glow Ring */}
              <circle cx="43" cy="47" r="7" stroke={activePalette.bodyStart} strokeWidth="1.2" opacity="0.4" fill="none" />
              <circle cx="77" cy="47" r="7" stroke={activePalette.bodyStart} strokeWidth="1.2" opacity="0.4" fill="none" />
              {/* Specular Catchlights */}
              <circle cx="46.5" cy="42.5" r="3.8" fill="white" />
              <circle cx="80.5" cy="42.5" r="3.8" fill="white" />
              <circle cx="39.5" cy="49" r="1.8" fill="white" />
              <circle cx="73.5" cy="49" r="1.8" fill="white" />
            </g>
          )}

          {/* Teacher Sleek Frameless Smart Glasses */}
          {mood === 'teacher' && (
            <g filter={`url(#${grad}_softShadow)`}>
              <circle cx="43" cy="46" r="15" stroke="#1E1B4B" strokeWidth="2.5" fill="none" />
              <circle cx="77" cy="46" r="15" stroke="#1E1B4B" strokeWidth="2.5" fill="none" />
              <line x1="58" y1="46" x2="62" y2="46" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
              {/* Lens Blue-Light Filter Glare Reflection */}
              <path d="M34 40L42 36" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.8" />
              <path d="M68 40L76 36" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.8" />
            </g>
          )}

          {/* Thinking Sleek Holographic Monocle & Lightbulb Spark */}
          {mood === 'thinking' && (
            <g>
              {/* Modern Golden Tech HUD Monocle */}
              <circle cx="77" cy="46" r="15.5" stroke="#F59E0B" strokeWidth="2.6" fill="#FEF3C7" fillOpacity="0.2" />
              <path d="M92.5 46Q99 56 96 70" stroke="#F59E0B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              {/* Holographic Data Ring */}
              <circle cx="77" cy="46" r="12" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 3" fill="none" opacity="0.7" />
              {/* Floating Lightbulb / Ideation Sparkle near left temple */}
              <g transform="translate(18, 22)">
                <circle cx="0" cy="0" r="4.5" fill="#FDE047" filter={`url(#${grad}_glow)`} />
                <path d="M0 -7V-5M0 5V7M-7 0H-5M5 0H7" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </g>
          )}

          {/* Modern 3D Faceted Beak */}
          <g filter={`url(#${grad}_softShadow)`}>
            {/* Upper Beak Facet */}
            <path
              d="M60 52C53 52 50 62 60 66C70 62 67 52 60 52Z"
              fill={`url(#${grad}_beakTop)`}
            />
            {/* Lower Beak Shadow Facet */}
            <path
              d="M52 61C56 68 64 68 68 61C65 67 55 67 52 61Z"
              fill={`url(#${grad}_beakBottom)`}
            />
            {/* Specular Highlight on Beak Ridge */}
            <path
              d="M58 54C55.5 54 54 57 57.5 61"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.75"
              fill="none"
            />
          </g>

          {/* Modern Rounded Golden Feet / Talons */}
          <g filter={`url(#${grad}_softShadow)`}>
            <ellipse cx="46" cy="108.5" rx="8" ry="4.5" fill="#F59E0B" />
            <ellipse cx="74" cy="108.5" rx="8" ry="4.5" fill="#F59E0B" />
            <ellipse cx="46" cy="107.5" rx="5" ry="2.5" fill="#FBBF24" />
            <ellipse cx="74" cy="107.5" rx="5" ry="2.5" fill="#FBBF24" />
          </g>
        </svg>
      </div>

      {/* Modern Sleek Speech Bubble with glassmorphism styling */}
      {shouldShowBubble && effectiveSpeechText && (
        <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 max-w-xs animate-in fade-in slide-in-from-left-3 duration-300 z-20">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[8px] border-r-white dark:border-r-slate-800 drop-shadow-[-1px_0_0_rgba(226,232,240,0.8)]" />
          <p className="leading-snug tracking-tight">{effectiveSpeechText}</p>
        </div>
      )}
    </div>
  );
};
