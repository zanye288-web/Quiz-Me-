import React from 'react';
import {
  MascotMood,
  useMascotPreferences,
  getMascotIconDataUrl,
} from './MascotAvatar';

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

const ICON_SIZE_CLASSES: Record<NonNullable<AppLogoProps['size']>, string> = {
  xs: 'w-9 h-9 rounded-xl',
  sm: 'w-11 h-11 rounded-2xl',
  md: 'w-12 h-12 rounded-2xl',
  lg: 'w-16 h-16 rounded-3xl',
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
  const { mascotCharacter, mascotTheme, mascotAccessory, currentMascotMeta } =
    useMascotPreferences();

  const iconUrl = getMascotIconDataUrl(mascotCharacter, mascotTheme, mascotAccessory);

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
      title={`Quiz Me! — ${currentMascotMeta.title} App Icon`}
    >
      {/* Official Mascot App Icon Badge */}
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src={iconUrl}
          alt={`${currentMascotMeta.title} App Icon`}
          referrerPolicy="no-referrer"
          className={`${ICON_SIZE_CLASSES[size]} object-cover shadow-md border border-indigo-400/40 dark:border-indigo-500/40 group-hover:scale-105 transition-transform duration-200`}
        />
      </div>

      {/* Brand Wordmark & Mascot Subtitle */}
      {!collapsed && (
        <div className="flex flex-col min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent leading-none ${
                size === 'lg'
                  ? 'text-2xl sm:text-3xl'
                  : size === 'md'
                  ? 'text-xl'
                  : 'text-lg'
              }`}
            >
              Quiz Me!
            </span>
            {showBadge && (
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs shrink-0">
                AI
              </span>
            )}
          </div>

          {showSubtitle && (
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide truncate mt-0.5">
              {subtitleText || `Featuring ${currentMascotMeta.title}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
