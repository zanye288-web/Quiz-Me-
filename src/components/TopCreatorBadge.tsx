import React from 'react';
import { Award, Crown, Sparkles } from 'lucide-react';
import { CreatorStatus } from '../utils/creatorUtils';

interface TopCreatorBadgeProps {
  status?: CreatorStatus;
  level?: number;
  assessmentsCount?: number;
  size?: 'xs' | 'sm' | 'md';
  showDetails?: boolean;
  className?: string;
}

export const TopCreatorBadge: React.FC<TopCreatorBadgeProps> = ({
  status,
  level = status?.level,
  assessmentsCount = status?.assessmentsCount,
  size = 'xs',
  showDetails = false,
  className = '',
}) => {
  const tooltip =
    status?.tooltipText ||
    `Top Creator${level ? ` • Level ${level}` : ''}${assessmentsCount ? ` • ${assessmentsCount} assessments` : ''}`;

  const isElite = (level && level >= 7) || (assessmentsCount && assessmentsCount >= 12);

  if (size === 'xs') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-tight transition-transform hover:scale-105 select-none shrink-0 ${
          isElite
            ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/60 dark:border-amber-500/60 shadow-2xs'
            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-600/60 shadow-2xs'
        } ${className}`}
        title={tooltip}
        aria-label={tooltip}
      >
        {isElite ? (
          <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />
        ) : (
          <Award className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />
        )}
        <span>Top Creator</span>
        {showDetails && level && level > 1 && (
          <span className="text-[9px] font-black px-1 rounded-sm bg-amber-500/20 text-amber-800 dark:text-amber-200">
            Lv.{level}
          </span>
        )}
      </span>
    );
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-black transition-all hover:shadow-xs select-none shrink-0 ${
          isElite
            ? 'bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-yellow-500/25 text-amber-800 dark:text-amber-200 border border-amber-400/80 dark:border-amber-500/80 shadow-2xs'
            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600/70 shadow-2xs'
        } ${className}`}
        title={tooltip}
        aria-label={tooltip}
      >
        {isElite ? (
          <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
        ) : (
          <Award className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
        )}
        <span>Top Creator</span>
        {level && level > 1 && (
          <span className="text-[10px] font-bold opacity-80">
            • Lv.{level}
          </span>
        )}
      </span>
    );
  }

  // Medium / detailed banner
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-yellow-500/15 text-amber-800 dark:text-amber-200 border border-amber-400/50 dark:border-amber-500/50 shadow-2xs ${className}`}
      title={tooltip}
    >
      <div className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
        {isElite ? <Crown className="w-3 h-3 fill-white" /> : <Award className="w-3 h-3 fill-white" />}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[11px] font-black leading-tight text-amber-900 dark:text-amber-100 flex items-center gap-1">
          {status?.tierLabel || 'Top Creator'}
          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
        </span>
        <span className="text-[9px] font-medium text-amber-700/90 dark:text-amber-300/90 leading-tight">
          {level ? `Level ${level}` : ''}
          {level && assessmentsCount ? ' • ' : ''}
          {assessmentsCount ? `${assessmentsCount} quizzes created` : ''}
        </span>
      </div>
    </div>
  );
};
