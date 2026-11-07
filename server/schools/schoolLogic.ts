import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 10 * 60 * 1000; // a code is valid for 10 minutes
export const MAX_CODE_ATTEMPTS = 5; // wrong guesses before the code is burned
export const LOCKOUT_MS = 15 * 60 * 1000; // lockout after too many wrong guesses
export const RESEND_COOLDOWN_MS = 60 * 1000; // min gap between codes for one account
export const SEND_WINDOW_MS = 60 * 60 * 1000;
export const MAX_SENDS_PER_ACCOUNT_PER_WINDOW = 5;
export const MAX_SENDS_PER_EMAIL_PER_WINDOW = 5;

/**
 * Mailbox providers that anyone can sign up for. A school can never be
 * identified by one of these domains, otherwise every gmail user would
 * "belong" to the same school.
 */
const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'ymail.com',
  'rocketmail.com',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'gmx.com',
  'gmx.net',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'yandex.ru',
  'qq.com',
  '163.com',
  '126.com',
  'tutanota.com',
  'tuta.io',
  'fastmail.com',
  'hey.com',
  'inbox.com',
]);

/**
 * Shared public suffixes. These belong to a whole country's schools, not to a
 * single school, so they can't be registered as one school's domain.
 * (Not exhaustive: add more as needed.)
 */
const SHARED_SUFFIXES = new Set([
  'edu',
  'edu.ng',
  'sch.ng',
  'gov.ng',
  'com.ng',
  'org.ng',
  'ac.ng',
  'edu.gh',
  'edu.au',
  'edu.eg',
  'edu.in',
  'ac.in',
  'ac.uk',
  'sch.uk',
  'co.uk',
  'org.uk',
  'ac.za',
  'edu.za',
  'ac.ke',
  'sc.ke',
  'ac.tz',
  'ac.ug',
  'co.za',
  'k12.us',
]);

// ---------------------------------------------------------------------------
// Email / domain helpers
// ---------------------------------------------------------------------------

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
const LOCAL_RE = /^[a-z0-9._%+'-]+$/;

export interface ParsedEmail {
  /** Lower-cased address exactly as the person typed it (what we send mail to). */
  address: string;
  local: string;
  domain: string;
  /** Address with any "+tag" removed. Used to stop one mailbox counting as many accounts. */
  canonical: string;
}

export function parseEmail(raw: unknown): ParsedEmail | null {
  if (typeof raw !== 'string') return null;
  const address = raw.trim().toLowerCase();
  if (address.length < 6 || address.length > 254) return null;

  const at = address.lastIndexOf('@');
  if (at < 1 || at !== address.indexOf('@')) return null; // exactly one @
  const local = address.slice(0, at);
  const domain = address.slice(at + 1);

  if (local.length > 64) return null;
  if (!LOCAL_RE.test(local)) return null;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  if (!DOMAIN_RE.test(domain)) return null;

  const base = local.split('+')[0];
  if (!base) return null;

  return { address, local, domain, canonical: `${base}@${domain}` };
}

export function isPublicEmailDomain(domain: string): boolean {
  return PUBLIC_EMAIL_DOMAINS.has(domain.toLowerCase());
}

export function isSharedSuffix(domain: string): boolean {
  return SHARED_SUFFIXES.has(domain.toLowerCase());
}

/** Returns an error message if this domain can't identify a school, otherwise null. */
export function schoolDomainProblem(domain: string): string | null {
  if (isPublicEmailDomain(domain)) {
    return 'Personal email providers (like Gmail or Yahoo) cannot be used to register a school. Use an email address on your school’s own domain.';
  }
  if (isSharedSuffix(domain)) {
    return 'That domain is shared by many institutions. Use an email address on your school’s own domain.';
  }
  return null;
}

export function sanitizeSchoolName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  // Strip control characters and collapse whitespace.
  const cleaned = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length < 2 || cleaned.length > 100) return null;
  return cleaned;
}

export function emailKey(canonicalEmail: string): string {
  return crypto.createHash('sha256').update(canonicalEmail).digest('hex');
}

export function quotaKey(scope: string, value: string): string {
  return crypto.createHash('sha256').update(`${scope}:${value}`).digest('hex');
}

// ---------------------------------------------------------------------------
// Verification codes
// ---------------------------------------------------------------------------

let devSecret: string | null = null;

function getCodeSecret(): string {
  const fromEnv = process.env.SCHOOL_CODE_SECRET;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SCHOOL_CODE_SECRET must be set (16+ characters) in production.');
  }
  // Local development only: a random per-process secret (codes reset on restart).
  if (!devSecret) devSecret = crypto.randomBytes(32).toString('hex');
  return devSecret;
}

/** Cryptographically random numeric code, zero padded (e.g. "048213"). */
export function generateCode(): string {
  return crypto.randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, '0');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/** Codes are never stored in plain text: only this keyed hash is. */
export function hashCode(code: string, salt: string, uid: string, emailAddress: string): string {
  return crypto
    .createHmac('sha256', getCodeSecret())
    .update(`${salt}|${uid}|${emailAddress}|${code}`)
    .digest('hex');
}

export function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  if (ba.length !== bb.length || ba.length === 0) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function normalizeCodeInput(raw: unknown): string | null {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const digits = String(raw).replace(/[\s-]/g, '');
  return new RegExp(`^\\d{${CODE_LENGTH}}$`).test(digits) ? digits : null;
}
