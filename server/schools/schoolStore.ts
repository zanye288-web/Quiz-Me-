import type { Firestore } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MemberRole = 'admin' | 'member';

export interface School {
  /** Doc id is the school's email domain, so one domain can only ever be one school. */
  id: string;
  name: string;
  domain: string;
  adminUid: string;
  createdAt: number;
}

export interface Member {
  uid: string;
  schoolId: string;
  schoolName: string;
  /** The verified school email address. */
  email: string;
  /** sha256 of the canonical email; guarantees one school email maps to one account. */
  emailKey: string;
  role: MemberRole;
  displayName: string;
  joinedAt: number;
}

export interface Challenge {
  purpose: 'join' | 'register';
  email: string;
  canonical: string;
  domain: string;
  schoolName?: string;
  salt: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  lockedUntil: number;
  createdAt: number;
}

export type CreateSchoolResult = 'ok' | 'school_exists' | 'already_member' | 'email_taken';
export type AddMemberResult = 'ok' | 'already_member' | 'email_taken';

/**
 * Storage contract for the school feature. The Firestore implementation is
 * used in production; an in-memory implementation is used by the tests.
 * Every method that must be race-safe is atomic in both.
 */
export interface SchoolStore {
  getSchool(id: string): Promise<School | null>;
  getMember(uid: string): Promise<Member | null>;
  listMembers(schoolId: string, limit: number): Promise<Member[]>;

  getChallenge(uid: string): Promise<Challenge | null>;
  putChallenge(uid: string, challenge: Challenge): Promise<void>;
  deleteChallenge(uid: string): Promise<void>;
  /** Atomically counts one guess and returns the challenge as it stands afterwards (null if none). */
  recordAttempt(uid: string): Promise<Challenge | null>;
  lockChallenge(uid: string, until: number): Promise<void>;

  /** Atomically takes one slot from a sliding-window quota. Returns false when the quota is used up. */
  consumeQuota(key: string, max: number, windowMs: number, now: number): Promise<boolean>;

  createSchoolWithAdmin(school: School, member: Member): Promise<CreateSchoolResult>;
  addMember(member: Member): Promise<AddMemberResult>;
  removeMember(uid: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Firestore implementation (server-side, Admin SDK: bypasses security rules)
// ---------------------------------------------------------------------------

const SCHOOLS = 'schools';
const MEMBERS = 'school_members';
const EMAILS = 'school_emails';
const CHALLENGES = 'school_verifications';
const QUOTAS = 'school_send_log';

export class FirestoreSchoolStore implements SchoolStore {
  constructor(private readonly db: Firestore) {}

  async getSchool(id: string): Promise<School | null> {
    const snap = await this.db.collection(SCHOOLS).doc(id).get();
    return snap.exists ? (snap.data() as School) : null;
  }

  async getMember(uid: string): Promise<Member | null> {
    const snap = await this.db.collection(MEMBERS).doc(uid).get();
    return snap.exists ? (snap.data() as Member) : null;
  }

  async listMembers(schoolId: string, limit: number): Promise<Member[]> {
    const snap = await this.db.collection(MEMBERS).where('schoolId', '==', schoolId).limit(limit).get();
    return snap.docs.map((d) => d.data() as Member);
  }

  async getChallenge(uid: string): Promise<Challenge | null> {
    const snap = await this.db.collection(CHALLENGES).doc(uid).get();
    return snap.exists ? (snap.data() as Challenge) : null;
  }

  async putChallenge(uid: string, challenge: Challenge): Promise<void> {
    await this.db
      .collection(CHALLENGES)
      .doc(uid)
      // expireAt lets you enable a Firestore TTL policy to auto-delete stale rows.
      .set({ ...challenge, expireAt: new Date(challenge.expiresAt + 60 * 60 * 1000) });
  }

  async deleteChallenge(uid: string): Promise<void> {
    await this.db.collection(CHALLENGES).doc(uid).delete();
  }

  async recordAttempt(uid: string): Promise<Challenge | null> {
    const ref = this.db.collection(CHALLENGES).doc(uid);
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      const current = snap.data() as Challenge;
      const updated: Challenge = { ...current, attempts: current.attempts + 1 };
      tx.update(ref, { attempts: updated.attempts });
      return updated;
    });
  }

  async lockChallenge(uid: string, until: number): Promise<void> {
    const ref = this.db.collection(CHALLENGES).doc(uid);
    await this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      tx.update(ref, { lockedUntil: until, expireAt: new Date(until + 60 * 60 * 1000) });
    });
  }

  async consumeQuota(key: string, max: number, windowMs: number, now: number): Promise<boolean> {
    const ref = this.db.collection(QUOTAS).doc(key);
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? (snap.data() as { windowStart: number; count: number }) : null;

      if (!data || now - data.windowStart >= windowMs) {
        tx.set(ref, { windowStart: now, count: 1, expireAt: new Date(now + windowMs + 60 * 60 * 1000) });
        return true;
      }
      if (data.count >= max) return false;
      tx.update(ref, { count: data.count + 1 });
      return true;
    });
  }

  async createSchoolWithAdmin(school: School, member: Member): Promise<CreateSchoolResult> {
    const schoolRef = this.db.collection(SCHOOLS).doc(school.id);
    const memberRef = this.db.collection(MEMBERS).doc(member.uid);
    const emailRef = this.db.collection(EMAILS).doc(member.emailKey);

    return this.db.runTransaction(async (tx) => {
      const [schoolSnap, memberSnap, emailSnap] = await Promise.all([
        tx.get(schoolRef),
        tx.get(memberRef),
        tx.get(emailRef),
      ]);
      if (schoolSnap.exists) return 'school_exists';
      if (memberSnap.exists) return 'already_member';
      if (emailSnap.exists && (emailSnap.data() as { uid: string }).uid !== member.uid) return 'email_taken';

      tx.set(schoolRef, school);
      tx.set(memberRef, member);
      tx.set(emailRef, { uid: member.uid, schoolId: school.id });
      return 'ok';
    });
  }

  async addMember(member: Member): Promise<AddMemberResult> {
    const memberRef = this.db.collection(MEMBERS).doc(member.uid);
    const emailRef = this.db.collection(EMAILS).doc(member.emailKey);

    return this.db.runTransaction(async (tx) => {
      const [memberSnap, emailSnap] = await Promise.all([tx.get(memberRef), tx.get(emailRef)]);
      if (memberSnap.exists) return 'already_member';
      if (emailSnap.exists && (emailSnap.data() as { uid: string }).uid !== member.uid) return 'email_taken';

      tx.set(memberRef, member);
      tx.set(emailRef, { uid: member.uid, schoolId: member.schoolId });
      return 'ok';
    });
  }

  async removeMember(uid: string): Promise<boolean> {
    const memberRef = this.db.collection(MEMBERS).doc(uid);
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(memberRef);
      if (!snap.exists) return false;
      const member = snap.data() as Member;
      tx.delete(memberRef);
      tx.delete(this.db.collection(EMAILS).doc(member.emailKey));
      return true;
    });
  }
}
