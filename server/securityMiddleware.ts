import { Request, Response, NextFunction } from 'express';

/**
 * Blue Team Security Middleware & Defense Utilities
 *
 * Implements:
 * 1. HTTP Security Response Headers (OWASP recommendations)
 * 2. In-Memory Sliding-Window IP Rate Limiting (DoS / API Quota Exhaustion Defense)
 * 3. SSRF & Protocol Validation (Cloud Metadata & Internal Network Guard)
 * 4. Input Sanitization & Payload Clamping
 * 5. Sensitive Data / Key Leakage Protection in Error Responses
 */

// --- 1. HTTP Security Response Headers ---
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Allow embedding inside AI Studio preview and published app iframes
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  
  // Modern XSS auditor disabling (relying on modern CSP & strict frameworks)
  res.setHeader('X-XSS-Protection', '0');
  
  // Restrict referrer data leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict access to sensitive device hardware
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  next();
}

// --- 2. In-Memory Sliding-Window Rate Limiter ---
interface RateLimitRecord {
  timestamps: number[];
}

export function createRateLimiter(options: {
  windowMs: number; // e.g. 60,000 ms (1 minute)
  maxRequests: number; // max requests within windowMs
  name: string;
}) {
  const ipStore = new Map<string, RateLimitRecord>();

  // Cleanup old records periodically every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);
      if (record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    }
  }, 120_000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // Extract client IP (handle standard proxy headers)
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    let record = ipStore.get(clientIp);

    if (!record) {
      record = { timestamps: [] };
      ipStore.set(clientIp, record);
    }

    // Keep timestamps within the active sliding window
    record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);

    if (record.timestamps.length >= options.maxRequests) {
      const oldest = record.timestamps[0];
      const resetTimeSeconds = Math.ceil((oldest + options.windowMs - now) / 1000);

      res.setHeader('Retry-After', String(Math.max(1, resetTimeSeconds)));
      res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');

      res.status(429).json({
        success: false,
        error: `Rate limit reached for ${options.name}. Please wait ${Math.max(1, resetTimeSeconds)}s before trying again.`,
        retryAfter: resetTimeSeconds,
      });
      return;
    }

    record.timestamps.push(now);
    res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(options.maxRequests - record.timestamps.length));

    next();
  };
}

// Pre-configured rate limit tiers
export const aiGenerationRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 120, // 120 AI generations per minute per client
  name: 'AI Quiz Generation',
});

export const searchRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 240, // 240 visual/diagnostic requests per minute
  name: 'Media Search',
});

export const ttsRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 160, // 160 voice syntheses per minute
  name: 'Speech Synthesis',
});

// --- 3. SSRF & Protocol Guard ---
// Protects against accessing cloud metadata (169.254.169.254), loopback, and internal private RFC 1918 subnets
export function isSafeExternalHttpUrl(urlString?: string | null): boolean {
  if (!urlString || typeof urlString !== 'string') return false;

  const trimmed = urlString.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    // Block loopback and local hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    // Block AWS / GCP / Azure instance metadata IP
    if (hostname === '169.254.169.254' || hostname.startsWith('169.254.')) {
      return false;
    }

    // Block RFC 1918 Private IPv4 address ranges
    if (
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// --- 4. Input Sanitization & Bounds Clamping ---
export function clampInteger(val: unknown, min: number, max: number, fallback: number): number {
  const num = parseInt(String(val), 10);
  if (isNaN(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

export function sanitizeString(
  val: unknown,
  maxChars = 10_000,
  fallback = ''
): string {
  if (typeof val !== 'string') return fallback;
  // Remove null bytes and control chars while preserving newlines and tabs
  return val
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, maxChars)
    .trim();
}

/**
 * Neutralizes prompt injection payload attempts by disarming command overrides
 */
export function neutralizePromptInjection(text: string): string {
  if (!text) return '';
  
  // Neutralize common instruction-override trigger phrases
  return text
    .replace(/ignore\s+all\s+(previous|prior)\s+instructions/gi, '[neutralized directive]')
    .replace(/disregard\s+(all\s+)?(system|prior)\s+(instructions|prompts)/gi, '[neutralized directive]')
    .replace(/you\s+are\s+now\s+(DAN|jailbroken|unrestricted)/gi, '[neutralized directive]')
    .replace(/reveal\s+(your\s+)?(system\s+prompt|api\s*key)/gi, '[neutralized query]')
    .replace(/output\s+(your\s+)?system\s+instruction/gi, '[neutralized query]');
}

// --- 5. Error Sanitization & Key Leakage Prevention ---
export function sanitizeErrorMessage(err: unknown, defaultMessage = 'An unexpected server error occurred'): string {
  if (!err) return defaultMessage;
  const raw = err instanceof Error ? err.message : String(err);

  // Mask any potential API key patterns (Google AI, GCP, Firebase keys)
  return raw
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/key=[a-zA-Z0-9_-]{20,}/g, 'key=[REDACTED]')
    .replace(/\/app\/[a-zA-Z0-9_\-/.]+/g, '[INTERNAL_PATH]')
    .slice(0, 300);
}
