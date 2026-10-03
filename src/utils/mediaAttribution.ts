/**
 * Media Attribution & Content Credit Utilities
 * Normalizes source crediting and external API links for question imagery
 */

export interface MediaAttributionInfo {
  sourceName: string;
  sourceUrl?: string;
  displayLabel: string;
  creditText?: string;
  isExternal: boolean;
}

function sanitizeUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return undefined;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Derives a Wikimedia Commons file page URL from a thumbnail or direct upload URL
 */
function extractCommonsFileUrl(url: string): string | undefined {
  try {
    const match = url.match(/\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+)/i);
    if (match && match[1]) {
      const fileName = decodeURIComponent(match[1]);
      return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName)}`;
    }
  } catch {
    // fallback to generic commons URL
  }
  return 'https://commons.wikimedia.org';
}

/**
 * Returns clean, unobtrusive attribution information for any question image
 */
export function getMediaAttribution(params: {
  imageUrl?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  attribution?: string | null;
}): MediaAttributionInfo | null {
  const { imageUrl, source, sourceUrl, attribution } = params;

  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return null;
  }

  const trimmedUrl = imageUrl.trim();

  // Local data-URI uploads do not require external API content credit
  if (trimmedUrl.startsWith('data:')) {
    return {
      sourceName: 'User Upload',
      displayLabel: 'Uploaded',
      isExternal: false,
    };
  }

  // 1. Explicit source passed
  if (source && source.trim()) {
    const cleanSource = source.trim();
    let computedUrl = sourceUrl?.trim();

    if (!computedUrl) {
      if (cleanSource.toLowerCase().includes('commons') || trimmedUrl.includes('wikimedia.org')) {
        computedUrl = extractCommonsFileUrl(trimmedUrl);
      } else if (cleanSource.toLowerCase().includes('wikipedia')) {
        computedUrl = 'https://en.wikipedia.org';
      } else if (cleanSource.toLowerCase().includes('unsplash') || trimmedUrl.includes('unsplash.com')) {
        computedUrl = 'https://unsplash.com';
      } else {
        computedUrl = trimmedUrl;
      }
    }

    return {
      sourceName: cleanSource,
      sourceUrl: sanitizeUrl(computedUrl),
      displayLabel: cleanSource,
      creditText: attribution || undefined,
      isExternal: true,
    };
  }

  // 2. Derive attribution from URL domain
  try {
    const parsed = new URL(trimmedUrl);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('wikimedia.org')) {
      const commonsLink = extractCommonsFileUrl(trimmedUrl);
      return {
        sourceName: 'Wikimedia Commons',
        sourceUrl: sourceUrl || commonsLink,
        displayLabel: 'Wikimedia Commons',
        creditText: attribution || 'Public Domain / CC',
        isExternal: true,
      };
    }

    if (host.includes('wikipedia.org')) {
      return {
        sourceName: 'Wikipedia',
        sourceUrl: sourceUrl || `https://${host}`,
        displayLabel: 'Wikipedia',
        creditText: attribution || 'CC BY-SA',
        isExternal: true,
      };
    }

    if (host.includes('unsplash.com')) {
      return {
        sourceName: 'Unsplash',
        sourceUrl: sourceUrl || 'https://unsplash.com',
        displayLabel: 'Unsplash',
        creditText: attribution || 'Unsplash License',
        isExternal: true,
      };
    }

    if (host.includes('pexels.com')) {
      return {
        sourceName: 'Pexels',
        sourceUrl: sourceUrl || 'https://pexels.com',
        displayLabel: 'Pexels',
        creditText: attribution || 'Pexels License',
        isExternal: true,
      };
    }

    if (host.includes('pixabay.com')) {
      return {
        sourceName: 'Pixabay',
        sourceUrl: sourceUrl || 'https://pixabay.com',
        displayLabel: 'Pixabay',
        creditText: attribution || 'Pixabay License',
        isExternal: true,
      };
    }

    // Generic external domain
    const cleanHost = host.replace(/^www\./, '');
    return {
      sourceName: cleanHost,
      sourceUrl: sourceUrl || trimmedUrl,
      displayLabel: cleanHost,
      creditText: attribution || undefined,
      isExternal: true,
    };
  } catch {
    // If URL parsing fails, default external credit if non-empty
    return {
      sourceName: 'External Media',
      sourceUrl: trimmedUrl,
      displayLabel: 'External Source',
      isExternal: true,
    };
  }
}
