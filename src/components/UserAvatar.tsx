import React, { useState, useEffect } from 'react';
import {
  MascotAvatar,
  MascotCharacter,
  MascotColorTheme,
  MascotAccessory,
  useMascotPreferences,
} from './MascotAvatar';

export interface UserAvatarProps {
  displayName?: string | null;
  photoURL?: string | null;
  avatarType?: 'google' | 'icon' | 'custom' | 'mascot';
  avatarIcon?: string | null;
  avatarBg?: string | null;
  mascotCharacter?: MascotCharacter;
  mascotTheme?: MascotColorTheme;
  equippedAccessory?: MascotAccessory;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<UserAvatarProps['size']>, string> = {
  xs: 'w-7 h-7 text-xs rounded-xl',
  sm: 'w-9 h-9 text-sm rounded-xl',
  md: 'w-11 h-11 text-base rounded-2xl',
  lg: 'w-14 h-14 text-xl rounded-2xl',
  xl: 'w-20 h-20 text-3xl rounded-3xl',
};

const MASCOT_SIZE_MAP: Record<NonNullable<UserAvatarProps['size']>, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
  xl: 'lg',
};

const COLOR_PALETTES = [
  'bg-gradient-to-br from-indigo-500 to-violet-600 text-white',
  'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
  'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
  'bg-gradient-to-br from-sky-500 to-blue-600 text-white',
  'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white',
];

function getDeterministicPalette(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'S';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  displayName,
  photoURL,
  avatarType,
  avatarIcon,
  avatarBg,
  mascotCharacter: propMascotCharacter,
  mascotTheme: propMascotTheme,
  equippedAccessory: propEquippedAccessory,
  size = 'sm',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const { mascotCharacter, mascotTheme, mascotAccessory } = useMascotPreferences();

  useEffect(() => {
    setImgError(false);
  }, [photoURL]);

  const sizeClass = SIZE_CLASSES[size];
  const fallbackPalette = getDeterministicPalette(displayName || 'Scholar');
  const activeBg = avatarBg || fallbackPalette;

  // 0. If user selected their customized Mascot as their profile picture
  if (avatarType === 'mascot') {
    return (
      <div
        className={`${sizeClass} ${activeBg} flex items-center justify-center shrink-0 select-none shadow-xs border border-indigo-400/40 overflow-hidden ${className}`}
        title={displayName ? `${displayName} (Mascot Profile)` : 'Scholar Mascot Profile'}
      >
        <MascotAvatar
          character={propMascotCharacter || mascotCharacter}
          theme={propMascotTheme || mascotTheme}
          accessory={propEquippedAccessory !== undefined ? propEquippedAccessory : mascotAccessory}
          size={MASCOT_SIZE_MAP[size]}
          interactive={false}
          className="!w-full !h-full p-0.5"
        />
      </div>
    );
  }

  // 1. If user explicitly selected an icon avatar
  if (avatarType === 'icon' && avatarIcon) {
    return (
      <div
        className={`${sizeClass} ${activeBg} flex items-center justify-center font-black shrink-0 select-none shadow-xs border border-white/20 ${className}`}
        title={displayName || 'Scholar'}
      >
        <span className="leading-none">{avatarIcon}</span>
      </div>
    );
  }

  // 2. If user has a valid photoURL (from Google, social login, or custom uploaded URL) and it hasn't errored
  if (photoURL && !imgError) {
    return (
      <img
        src={photoURL}
        alt={displayName || 'Scholar Avatar'}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImgError(true)}
        className={`${sizeClass} object-cover shrink-0 select-none shadow-xs border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 ${className}`}
      />
    );
  }

  // 3. Fallback: If user has an avatarIcon set even when photoURL failed or is missing
  if (avatarIcon) {
    return (
      <div
        className={`${sizeClass} ${activeBg} flex items-center justify-center font-black shrink-0 select-none shadow-xs border border-white/20 ${className}`}
        title={displayName || 'Scholar'}
      >
        <span className="leading-none">{avatarIcon}</span>
      </div>
    );
  }

  // 4. Clean deterministic initials avatar
  return (
    <div
      className={`${sizeClass} ${activeBg} flex items-center justify-center font-black tracking-tight shrink-0 select-none shadow-xs border border-white/20 ${className}`}
      title={displayName || 'Scholar'}
    >
      <span className="leading-none">{getInitials(displayName)}</span>
    </div>
  );
};
