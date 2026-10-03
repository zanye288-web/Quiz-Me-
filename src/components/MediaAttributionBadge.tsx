import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { getMediaAttribution } from '../utils/mediaAttribution';

interface MediaAttributionBadgeProps {
  imageUrl?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  attribution?: string | null;
  variant?: 'badge' | 'caption' | 'minimal';
  className?: string;
  showPrefix?: boolean;
}

// Blue Team Hardening: Protocol verification prevents XSS via javascript: or data: in href attributes
function isSafeWebLink(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const MediaAttributionBadge: React.FC<MediaAttributionBadgeProps> = ({
  imageUrl,
  source,
  sourceUrl,
  attribution,
  variant = 'badge',
  className = '',
  showPrefix = true,
}) => {
  const credit = getMediaAttribution({ imageUrl, source, sourceUrl, attribution });

  // Only show attribution for external media fetched from APIs or the web
  if (!credit || !credit.isExternal) {
    return null;
  }

  const tooltip = `Media credit: ${credit.sourceName}${credit.creditText ? ` • ${credit.creditText}` : ''}`;
  const label = showPrefix ? `Source: ${credit.displayLabel}` : credit.displayLabel;
  const hasSafeLink = Boolean(credit.sourceUrl && isSafeWebLink(credit.sourceUrl));

  const content = (
    <>
      <Globe className="w-2.5 h-2.5 opacity-70 shrink-0" aria-hidden="true" />
      <span className="truncate max-w-[140px] sm:max-w-[200px]">{label}</span>
      {hasSafeLink && (
        <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0 transition-opacity" aria-hidden="true" />
      )}
    </>
  );

  // Variant styling
  if (variant === 'caption') {
    return hasSafeLink ? (
      <a
        href={credit.sourceUrl!}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={tooltip}
        className={`group inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-400 hover:text-cyan-300 dark:text-slate-400 dark:hover:text-cyan-300 transition-colors shrink-0 cursor-pointer ${className}`}
      >
        {content}
      </a>
    ) : (
      <span
        title={tooltip}
        className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-400 shrink-0 ${className}`}
      >
        {content}
      </span>
    );
  }

  if (variant === 'minimal') {
    return hasSafeLink ? (
      <a
        href={credit.sourceUrl!}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={tooltip}
        className={`group inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer ${className}`}
      >
        {content}
      </a>
    ) : (
      <span
        title={tooltip}
        className={`inline-flex items-center gap-1 text-[10px] text-slate-400 ${className}`}
      >
        {content}
      </span>
    );
  }

  // Default 'badge' pill variant
  return hasSafeLink ? (
    <a
      href={credit.sourceUrl!}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={tooltip}
      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 hover:bg-slate-900/90 text-slate-300 hover:text-white border border-white/10 backdrop-blur-xs transition-all shadow-xs text-[10px] font-medium cursor-pointer ${className}`}
    >
      {content}
    </a>
  ) : (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 text-slate-300 border border-white/10 backdrop-blur-xs shadow-xs text-[10px] font-medium ${className}`}
    >
      {content}
    </span>
  );
};
