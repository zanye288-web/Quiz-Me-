import React from 'react';
import { MascotMood } from './MascotAvatar';

export interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  mood?: MascotMood;
  collapsed?: boolean;
  showSubtitle?: boolean;
  showBadge?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  className?: string;
}

const BADGE_SIZE_CLASSES: Record<NonNullable<AppLogoProps['size']>, string> = {
  xs: 'w-9 h-9 rounded-xl p-1',
  sm: 'w-11 h-11 rounded-2xl p-1.5',
  md: 'w-12 h-12 rounded-2xl p-1.5',
  lg: 'w-16 h-16 rounded-3xl p-2',
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'sm',
  collapsed = false,
  showSubtitle = true,
  showBadge = true,
  subtitleText,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`inline-flex items-center gap-2.5 select-none group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      title="Quiz Me! — Interactive Quiz & Trivia Arena"
    >
      {/* Sleek Modern Glowing Quiz Emblem (24fps Animated SVG, No App Thumbnails or Kahoot Clones) */}
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/25 border border-white/25 shrink-0 group-hover:scale-105 transition-transform duration-200 ${BADGE_SIZE_CLASSES[size]}`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-full h-full p-0.5 animate-24fps-float"
          aria-hidden="true"
        >
          <path
            d="M18.5 3L7 17.5H15.5L13.5 29L25 14.5H16.5L18.5 3Z"
            fill="currentColor"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="24.5" cy="7.5" r="2.2" fill="#FDE047" />
        </svg>
      </div>

      {/* Brand Wordmark & Quiz Subtitle */}
      {!collapsed && (
        <div className="flex flex-col min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-slate-900 dark:text-white leading-none ${
                size === 'lg'
                  ? 'text-2xl sm:text-3xl'
                  : size === 'md'
                  ? 'text-xl'
                  : 'text-lg'
              }`}
            >
              QuizMe
            </span>
          </div>

          {showSubtitle && (
            <span className="text-[10px] font-bold tracking-wide text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
              {subtitleText || 'Interactive Quiz Lounge'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
