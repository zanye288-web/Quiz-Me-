import React from 'react';
import { AVATAR_BG_GRADIENTS } from './ProfileCustomizationModal';

interface UserAvatarProps {
  displayName?: string | null;
  photoURL?: string | null;
  avatarType?: 'google' | 'icon' | 'custom';
  avatarIcon?: string | null;
  avatarBg?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLevelBadge?: boolean;
  level?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  displayName = 'Scholar',
  photoURL,
  avatarType = 'google',
  avatarIcon,
  avatarBg = 'indigo',
  size = 'md',
  className = '',
  showLevelBadge = false,
  level = 1,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-3xl',
  };

  const gradientObj =
    AVATAR_BG_GRADIENTS.find((g) => g.id === avatarBg) || AVATAR_BG_GRADIENTS[0];

  const initial = (displayName || 'S').charAt(0).toUpperCase();

  const renderContent = () => {
    // If user explicitly chose icon avatar
    if (avatarType === 'icon' && avatarIcon) {
      return (
        <div
          className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${gradientObj.gradient} flex items-center justify-center shadow-2xs select-none ${className}`}
        >
          <span>{avatarIcon}</span>
        </div>
      );
    }

    // If user has a Google photo
    if (photoURL) {
      return (
        <img
          src={photoURL}
          alt={displayName || 'User'}
          className={`${sizeClasses[size]} rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs ${className}`}
          referrerPolicy="no-referrer"
        />
      );
    }

    // If avatarIcon exists even without type === 'icon'
    if (avatarIcon) {
      return (
        <div
          className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${gradientObj.gradient} flex items-center justify-center shadow-2xs select-none ${className}`}
        >
          <span>{avatarIcon}</span>
        </div>
      );
    }

    // Default initial avatar
    return (
      <div
        className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${gradientObj.gradient} text-white font-bold flex items-center justify-center shadow-2xs select-none ${className}`}
      >
        <span>{initial}</span>
      </div>
    );
  };

  return (
    <div className="relative inline-block shrink-0">
      {renderContent()}
      {showLevelBadge && (
        <div className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-md bg-amber-400 text-slate-900 text-[9px] font-black shadow-xs border border-white dark:border-slate-900 leading-tight">
          Lv.{level}
        </div>
      )}
    </div>
  );
};
