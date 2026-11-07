import {
  CODE_TTL_MS,
  LOCKOUT_MS,
  MAX_CODE_ATTEMPTS,
  MAX_SENDS_PER_ACCOUNT_PER_WINDOW,
  MAX_SENDS_PER_EMAIL_PER_WINDOW,
  RESEND_COOLDOWN_MS,
  SEND_WINDOW_MS,
  emailKey,
  generateCode,
  generateSalt,
  hashCode,
  isPublicEmailDomain,
  normalizeCodeInput,
  parseEmail,
  quotaKey,
  safeEqualHex,
  sanitizeSchoolName,
  schoolDomainProblem,
} from './schoolLogic';
import {
  MailDeliveryError,
  MailNotConfiguredError,
  buildCodeEmail,
  type Mailer,
} from './mailer';
import type { Challenge, Member, School, SchoolStore } from './schoolStore';

// ---------------------------------------------------------------------------
// Errors & shapes
// ---------------------------------------------------------------------------

export class SchoolError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = 'SchoolError';
  }
}

export interface Actor {
  uid: string;
  displayName: string;
  /** True for guest/anonymous sessions, which can never join a school. */
  isAnonymous: boolean;
}

export interface MembershipView {
  school: { id: string; name: string; domain: string };
  role: 'admin' | 'member';
  email: string;
  joinedAt: number;
}

export interface CodeSentView {
  sentTo: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

export interface RosterEntry {
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: number;
}

const ROSTER_LIMIT = 500;

export function maskEmail(address: string): string {
  const [local, domain] = address.split('@');
  if (!local || !domain) return address;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'*'.repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export function createSchoolService(deps: { store: SchoolStore; mailer: Mailer; now?: () => number }) {
  const { store, mailer } = deps;
  const now = deps.now ?? (() => Date.now());

  function requireRealAccount(actor: Actor): void {
    if (actor.isAnonymous) {
      throw new SchoolError(403, 'guest_not_allowed', 'Sign in with a full account to use school features.');
    }
  }

  function toView(member: Member, school: School): MembershipView {
    return {
      school: { id: school.id, name: school.name, domain: school.domain },
      role: member.role,
      email: member.email,
      joinedAt: member.joinedAt,
    };
  }

  /** Rate-limits, creates and emails a fresh code. Shared by register + join. */
  async function sendChallenge(params: {
    actor: Actor;
    purpose: 'join' | 'register';
    email: { address: string; canonical: string; domain: string };
    schoolName: string;
  }): Promise<CodeSentView> {
    const { actor, purpose, email, schoolName } = params;
    const t = now();

    const existing = await store.getChallenge(actor.uid);
    if (existing && existing.lockedUntil > t) {
      throw new SchoolError(
        429,
        'locked',
        'Too many incorrect codes. Please wait a while before requesting a new one.',
        Math.ceil((existing.lockedUntil - t) / 1000)
      );
    }

    // Quotas. These also protect the recipient's inbox and our sender reputation.
    if (!(await store.consumeQuota(quotaKey('cooldown', actor.uid), 1, RESEND_COOLDOWN_MS, t))) {
      throw new SchoolError(
        429,
        'cooldown',
        'Please wait a minute before requesting another code.',
        Math.ceil(RESEND_COOLDOWN_MS / 1000)
      );
    }
    if (
      !(await store.consumeQuota(quotaKey('acct', actor.uid), MAX_SENDS_PER_ACCOUNT_PER_WINDOW, SEND_WINDOW_MS, t)) ||
      !(await store.consumeQuota(quotaKey('mail', email.canonical), MAX_SENDS_PER_EMAIL_PER_WINDOW, SEND_WINDOW_MS, t))
    ) {
      throw new SchoolError(
        429,
        'too_many_codes',
        'Too many codes requested. Please try again in an hour.',
        Math.ceil(SEND_WINDOW_MS / 1000)
      );
    }

    const code = generateCode();
    const salt = generateSalt();
    const challenge: Challenge = {
      purpose,
      email: email.address,
      canonical: email.canonical,
      domain: email.domain,
      ...(purpose === 'register' ? { schoolName } : {}),
      salt,
      codeHash: hashCode(code, salt, actor.uid, email.address),
      expiresAt: t + CODE_TTL_MS,
      attempts: 0,
      lockedUntil: 0,
      createdAt: t,
    };
    await store.putChallenge(actor.uid, challenge);

    try {
      await mailer(
        buildCodeEmail({
          to: email.address,
          code,
          purpose,
          schoolName,
          ttlMinutes: Math.round(CODE_TTL_MS / 60000),
        })
      );
    } catch (err) {
      // Don't leave a code behind that nobody received.
      await store.deleteChallenge(actor.uid);
      if (err instanceof MailNotConfiguredError) {
        throw new SchoolError(503, 'email_unavailable', 'Email verification is not available right now. Please try again later.');
      }
      if (err instanceof MailDeliveryError) {
        throw new SchoolError(502, 'email_failed', 'We could not send the verification email. Check the address and try again.');
      }
      throw err;
    }

    return {
      sentTo: maskEmail(email.address),
      expiresInSeconds: Math.round(CODE_TTL_MS / 1000),
      resendAfterSeconds: Math.round(RESEND_COOLDOWN_MS / 1000),
    };
  }

  return {
    /** Step 1 of registering a school: prove you own a mailbox on the school's domain. */
    async startRegistration(actor: Actor, input: { schoolName: unknown; email: unknown }): Promise<CodeSentView> {
      requireRealAccount(actor);

      const schoolName = sanitizeSchoolName(input.schoolName);
      if (!schoolName) throw new SchoolError(400, 'invalid_school_name', 'Enter your school’s name (2–100 characters).');

      const email = parseEmail(input.email);
      if (!email) throw new SchoolError(400, 'invalid_email', 'Enter a valid email address.');

      const problem = schoolDomainProblem(email.domain);
      if (problem) throw new SchoolError(400, 'invalid_school_domain', problem);

      if (await store.getMember(actor.uid)) {
        throw new SchoolError(409, 'already_member', 'Your account already belongs to a school.');
      }
      if (await store.getSchool(email.domain)) {
        throw new SchoolError(
          409,
          'school_exists',
          'A school with this email domain is already registered. Use “Join your school” instead.'
        );
      }

      return sendChallenge({ actor, purpose: 'register', email, schoolName });
    },

    /** Step 1 of joining: a school email on a registered school domain. */
    async startJoin(actor: Actor, input: { email: unknown }): Promise<CodeSentView> {
      requireRealAccount(actor);

      const email = parseEmail(input.email);
      if (!email) throw new SchoolError(400, 'invalid_email', 'Enter a valid email address.');

      if (isPublicEmailDomain(email.domain)) {
        throw new SchoolError(400, 'personal_email', 'Use your school email address, not a personal one like Gmail or Yahoo.');
      }

      if (await store.getMember(actor.uid)) {
        throw new SchoolError(409, 'already_member', 'Your account already belongs to a school.');
      }

      const school = await store.getSchool(email.domain);
      if (!school) {
        throw new SchoolError(
          404,
          'school_not_registered',
          'No school is registered for this email domain yet. Ask your school to register it first.'
        );
      }

      return sendChallenge({ actor, purpose: 'join', email, schoolName: school.name });
    },

    /** Step 2 (both flows): check the code and, if correct, create the membership. */
    async verifyCode(actor: Actor, input: { code: unknown }): Promise<MembershipView> {
      requireRealAccount(actor);

      const code = normalizeCodeInput(input.code);
      if (!code) throw new SchoolError(400, 'invalid_code', `Enter the 6-digit code from your email.`);

      const t = now();
      const pending = await store.getChallenge(actor.uid);
      if (!pending) {
        throw new SchoolError(400, 'no_pending_code', 'There is no pending code. Request a new one.');
      }
      if (pending.lockedUntil > t) {
        throw new SchoolError(
          429,
          'locked',
          'Too many incorrect codes. Please wait a while before trying again.',
          Math.ceil((pending.lockedUntil - t) / 1000)
        );
      }
      if (t > pending.expiresAt) {
        await store.deleteChallenge(actor.uid);
        throw new SchoolError(400, 'code_expired', 'That code has expired. Request a new one.');
      }

      // Count the guess atomically BEFORE comparing, so parallel guesses can't exceed the limit.
      const counted = await store.recordAttempt(actor.uid);
      if (!counted) {
        throw new SchoolError(400, 'no_pending_code', 'There is no pending code. Request a new one.');
      }
      if (counted.attempts > MAX_CODE_ATTEMPTS) {
        await store.lockChallenge(actor.uid, t + LOCKOUT_MS);
        throw new SchoolError(429, 'locked', 'Too many incorrect codes. Please wait a while before trying again.', Math.ceil(LOCKOUT_MS / 1000));
      }

      const expected = counted.codeHash;
      const actual = hashCode(code, counted.salt, actor.uid, counted.email);
      if (!safeEqualHex(expected, actual)) {
        if (counted.attempts >= MAX_CODE_ATTEMPTS) {
          await store.lockChallenge(actor.uid, t + LOCKOUT_MS);
          throw new SchoolError(
            429,
            'locked',
            'Too many incorrect codes. Please wait a while before requesting a new one.',
            Math.ceil(LOCKOUT_MS / 1000)
          );
        }
        throw new SchoolError(
          400,
          'wrong_code',
          `That code is not correct. ${MAX_CODE_ATTEMPTS - counted.attempts} attempt(s) left.`
        );
      }

      // Code is correct: create the membership.
      const base = {
        uid: actor.uid,
        email: counted.email,
        emailKey: emailKey(counted.canonical),
        displayName: actor.displayName.slice(0, 120),
        joinedAt: t,
      };

      if (counted.purpose === 'register') {
        const problem = schoolDomainProblem(counted.domain);
        if (problem || !counted.schoolName) {
          await store.deleteChallenge(actor.uid);
          throw new SchoolError(400, 'invalid_school_domain', problem ?? 'Registration details are missing. Start again.');
        }
        const school: School = {
          id: counted.domain,
          name: counted.schoolName,
          domain: counted.domain,
          adminUid: actor.uid,
          createdAt: t,
        };
        const member: Member = { ...base, schoolId: school.id, schoolName: school.name, role: 'admin' };
        const result = await store.createSchoolWithAdmin(school, member);
        if (result !== 'ok') {
          await store.deleteChallenge(actor.uid);
          throw conflictError(result);
        }
        await store.deleteChallenge(actor.uid);
        return toView(member, school);
      }

      const school = await store.getSchool(counted.domain);
      if (!school) {
        await store.deleteChallenge(actor.uid);
        throw new SchoolError(404, 'school_not_registered', 'This school is no longer registered.');
      }
      const member: Member = { ...base, schoolId: school.id, schoolName: school.name, role: 'member' };
      const result = await store.addMember(member);
      if (result !== 'ok') {
        await store.deleteChallenge(actor.uid);
        throw conflictError(result);
      }
      await store.deleteChallenge(actor.uid);
      return toView(member, school);
    },

    async getMembership(actor: Actor): Promise<MembershipView | null> {
      const member = await store.getMember(actor.uid);
      if (!member) return null;
      const school = await store.getSchool(member.schoolId);
      if (!school) return null;
      return toView(member, school);
    },

    async listRoster(actor: Actor): Promise<{ school: { id: string; name: string }; members: RosterEntry[] }> {
      const me = await store.getMember(actor.uid);
      if (!me || me.role !== 'admin') {
        throw new SchoolError(403, 'not_school_admin', 'Only the school admin can view the member list.');
      }
      const members = await store.listMembers(me.schoolId, ROSTER_LIMIT);
      return {
        school: { id: me.schoolId, name: me.schoolName },
        members: members
          .map((m) => ({
            uid: m.uid,
            displayName: m.displayName,
            email: m.email,
            role: m.role,
            joinedAt: m.joinedAt,
          }))
          .sort((a, b) => a.joinedAt - b.joinedAt),
      };
    },

    async leave(actor: Actor): Promise<void> {
      const me = await store.getMember(actor.uid);
      if (!me) throw new SchoolError(404, 'not_a_member', 'You are not part of a school.');
      if (me.role === 'admin') {
        throw new SchoolError(
          409,
          'admin_cannot_leave',
          'The school admin cannot leave. Remove the other members first or contact support.'
        );
      }
      await store.removeMember(actor.uid);
    },

    async removeMember(actor: Actor, targetUid: string): Promise<void> {
      const me = await store.getMember(actor.uid);
      if (!me || me.role !== 'admin') {
        throw new SchoolError(403, 'not_school_admin', 'Only the school admin can remove members.');
      }
      const target = await store.getMember(targetUid);
      // Same response for "not found" and "different school" so uids can't be probed.
      if (!target || target.schoolId !== me.schoolId) {
        throw new SchoolError(404, 'member_not_found', 'That member was not found.');
      }
      if (target.role === 'admin') {
        throw new SchoolError(409, 'cannot_remove_admin', 'The school admin cannot be removed.');
      }
      await store.removeMember(targetUid);
    },
  };
}

function conflictError(result: 'school_exists' | 'already_member' | 'email_taken'): SchoolError {
  switch (result) {
    case 'school_exists':
      return new SchoolError(409, 'school_exists', 'This school was just registered by someone else. Use “Join your school”.');
    case 'already_member':
      return new SchoolError(409, 'already_member', 'Your account already belongs to a school.');
    case 'email_taken':
      return new SchoolError(409, 'email_taken', 'This school email is already linked to another account.');
  }
}

export type SchoolService = ReturnType<typeof createSchoolService>;
