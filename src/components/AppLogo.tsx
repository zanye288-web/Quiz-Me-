import React from 'react';
import { MascotAvatar, MascotMood, MascotTheme } from './MascotAvatar';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  collapsed?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
  mood?: MascotMood;
  theme?: MascotTheme;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  collapsed = false,
  showBadge = true,
  badgeText = 'Pro',
  showSubtitle = true,
  subtitleText = 'AI Learning Platform',
  mood = 'idle',
  theme,
  interactive = true,
  className = '',
  onClick,
}) => {
  const avatarSize = size === 'xs' ? 'xs' : size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }[size];

  if (collapsed) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center transition-transform hover:scale-105 select-none ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
        title="Quiz Me! - Home"
      >
        <MascotAvatar mood={mood} size={avatarSize} theme={theme} interactive={interactive} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 text-left select-none transition-transform ${
        onClick ? 'cursor-pointer hover:opacity-95' : ''
      } ${className}`}
    >
      <div className="shrink-0 relative">
        <MascotAvatar
          mood={mood}
          size={avatarSize}
          theme={theme}
          interactive={interactive}
          className="shrink-0"
        />
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent ${textSizeClasses}`}
          >
            Quiz Me!
          </span>
          {showBadge && (
            <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40 dark:border-indigo-700/40">
              {badgeText}
            </span>
          )}
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate">
            {subtitleText}
          </p>
        )}
      </div>
    </div>
  );
};
