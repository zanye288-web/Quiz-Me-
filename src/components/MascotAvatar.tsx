import React from 'react';

export type MascotMood = 'idle' | 'happy' | 'streak' | 'thinking' | 'comforting' | 'teacher';

interface MascotAvatarProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
}

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  mood = 'idle',
  size = 'md',
  showSpeechBubble = false,
  speechText = '',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  };

  return (
    <div className={`relative inline-flex items-center gap-3 ${className}`}>
      {/* Animated Owl Mascot SVG */}
      <div className={`relative ${sizeClasses[size]} shrink-0 transition-transform duration-300 hover:scale-105 select-none`}>
        {/* Glow effect for streaks */}
        {mood === 'streak' && (
          <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
        )}
        {mood === 'happy' && (
          <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-lg animate-pulse" />
        )}

        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Owl Body */}
          <ellipse
            cx="60"
            cy="65"
            rx="42"
            ry="46"
            className={
              mood === 'teacher'
                ? 'fill-indigo-600'
                : mood === 'streak'
                ? 'fill-amber-500'
                : 'fill-emerald-500'
            }
          />

          {/* Belly */}
          <ellipse
            cx="60"
            cy="75"
            rx="28"
            ry="30"
            className={
              mood === 'teacher'
                ? 'fill-indigo-100'
                : mood === 'streak'
                ? 'fill-amber-100'
                : 'fill-emerald-100'
            }
          />
          {/* Belly Feather Chevrons */}
          <path
            d="M52 68L60 74L68 68 M48 80L60 88L72 80 M52 92L60 98L68 92"
            stroke={mood === 'teacher' ? '#4F46E5' : mood === 'streak' ? '#D97706' : '#059669'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Wings */}
          {mood === 'happy' || mood === 'streak' ? (
            <>
              {/* Joyous Flapping Wings Up */}
              <path
                d="M20 52C12 36 2 46 8 64C13 78 24 72 24 72"
                className={mood === 'streak' ? 'fill-amber-600' : 'fill-emerald-600'}
              />
              <path
                d="M100 52C108 36 118 46 112 64C107 78 96 72 96 72"
                className={mood === 'streak' ? 'fill-amber-600' : 'fill-emerald-600'}
              />
            </>
          ) : mood === 'thinking' ? (
            <>
              {/* One wing scratching chin */}
              <path
                d="M22 60C14 62 10 74 16 84C21 92 28 84 28 84"
                className="fill-emerald-600"
              />
              <path
                d="M98 62C92 50 78 52 72 60"
                stroke="#059669"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {/* Regular Rest Wings */}
              <path
                d="M22 56C12 60 10 76 16 88C22 98 28 88 28 88"
                className={mood === 'teacher' ? 'fill-indigo-700' : 'fill-emerald-600'}
              />
              <path
                d="M98 56C108 60 110 76 104 88C98 98 92 88 92 88"
                className={mood === 'teacher' ? 'fill-indigo-700' : 'fill-emerald-600'}
              />
            </>
          )}

          {/* Ear Tufts */}
          <path
            d="M30 35L22 14L44 26"
            className={mood === 'teacher' ? 'fill-indigo-700' : mood === 'streak' ? 'fill-amber-600' : 'fill-emerald-600'}
          />
          <path
            d="M90 35L98 14L76 26"
            className={mood === 'teacher' ? 'fill-indigo-700' : mood === 'streak' ? 'fill-amber-600' : 'fill-emerald-600'}
          />

          {/* Teacher Graduation Cap */}
          {mood === 'teacher' && (
            <g className="drop-shadow">
              <polygon points="60,6 102,22 60,36 18,22" fill="#1E1B4B" />
              <polygon points="34,26 86,26 80,38 40,38" fill="#312E81" />
              {/* Tassel */}
              <line x1="60" y1="22" x2="94" y2="34" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="94" cy="36" r="3" fill="#F59E0B" />
            </g>
          )}

          {/* Streak Flame Headband */}
          {mood === 'streak' && (
            <g>
              <rect x="26" y="28" width="68" height="10" rx="5" fill="#DC2626" />
              <path d="M52 28C52 20 60 14 60 14C60 14 68 20 68 28Z" fill="#F59E0B" />
              <path d="M56 28C56 22 60 18 60 18C60 18 64 22 64 28Z" fill="#FEF08A" />
            </g>
          )}

          {/* Eyes */}
          {mood === 'happy' || mood === 'streak' ? (
            <>
              {/* Joyous Crescent Eyes ^^ */}
              <circle cx="44" cy="46" r="16" fill="white" />
              <circle cx="76" cy="46" r="16" fill="white" />
              <path
                d="M34 47C36 40 52 40 54 47"
                stroke="#0F172A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M66 47C68 40 84 40 86 47"
                stroke="#0F172A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Blushing cheeks */}
              <ellipse cx="32" cy="58" rx="5" ry="3" fill="#FDA4AF" />
              <ellipse cx="88" cy="58" rx="5" ry="3" fill="#FDA4AF" />
            </>
          ) : mood === 'comforting' ? (
            <>
              {/* Gentle caring eyes */}
              <circle cx="44" cy="46" r="16" fill="white" />
              <circle cx="76" cy="46" r="16" fill="white" />
              <circle cx="44" cy="47" r="9" fill="#1E293B" />
              <circle cx="76" cy="47" r="9" fill="#1E293B" />
              <circle cx="47" cy="44" r="3.5" fill="white" />
              <circle cx="79" cy="44" r="3.5" fill="white" />
              {/* Soft smile blush */}
              <ellipse cx="32" cy="58" rx="6" ry="3" fill="#FBCFE8" />
              <ellipse cx="88" cy="58" rx="6" ry="3" fill="#FBCFE8" />
            </>
          ) : (
            <>
              {/* Standard Wide Big Owl Eyes */}
              <circle cx="44" cy="46" r="16" fill="white" />
              <circle cx="76" cy="46" r="16" fill="white" />
              <circle cx="44" cy="46" r="9" fill="#0F172A" />
              <circle cx="76" cy="46" r="9" fill="#0F172A" />
              {/* Eye Catchlights */}
              <circle cx="47" cy="43" r="3.5" fill="white" />
              <circle cx="79" cy="43" r="3.5" fill="white" />
              <circle cx="41" cy="49" r="1.5" fill="white" />
              <circle cx="73" cy="49" r="1.5" fill="white" />
            </>
          )}

          {/* Teacher Academic Glasses */}
          {mood === 'teacher' && (
            <g>
              <circle cx="44" cy="46" r="14" stroke="#1E293B" strokeWidth="3" fill="none" />
              <circle cx="76" cy="46" r="14" stroke="#1E293B" strokeWidth="3" fill="none" />
              <line x1="58" y1="46" x2="62" y2="46" stroke="#1E293B" strokeWidth="3" />
            </g>
          )}

          {/* Thinking Monocle */}
          {mood === 'thinking' && (
            <g>
              <circle cx="76" cy="46" r="14" stroke="#D97706" strokeWidth="3" fill="#FEF3C7" fillOpacity="0.3" />
              <path d="M90 46Q98 55 96 68" stroke="#D97706" strokeWidth="2" fill="none" />
            </g>
          )}

          {/* Orange Beak */}
          <polygon
            points="60,50 52,60 68,60"
            className="fill-amber-400 drop-shadow-sm"
          />

          {/* Feet */}
          <ellipse cx="46" cy="108" rx="8" ry="4" className="fill-amber-500" />
          <ellipse cx="74" cy="108" rx="8" ry="4" className="fill-amber-500" />
        </svg>
      </div>

      {/* Speech Bubble (Duolingo style) */}
      {showSpeechBubble && speechText && (
        <div className="relative bg-white text-slate-800 text-sm font-semibold py-2.5 px-4 rounded-2xl shadow-sm border border-slate-200/90 max-w-xs animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white drop-shadow-[-1px_0_0_rgba(226,232,240,1)]" />
          <p className="leading-snug">{speechText}</p>
        </div>
      )}
    </div>
  );
};
