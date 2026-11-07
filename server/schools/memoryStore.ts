import type {
  AddMemberResult,
  Challenge,
  CreateSchoolResult,
  Member,
  School,
  SchoolStore,
} from './schoolStore';

/**
 * In-memory SchoolStore. Used by the tests; behaves like the Firestore store
 * (JS is single-threaded, so each method is naturally atomic).
 */
export class MemorySchoolStore implements SchoolStore {
  schools = new Map<string, School>();
  members = new Map<string, Member>();
  emails = new Map<string, { uid: string; schoolId: string }>();
  challenges = new Map<string, Challenge>();
  quotas = new Map<string, { windowStart: number; count: number }>();

  async getSchool(id: string) {
    return this.schools.get(id) ?? null;
  }

  async getMember(uid: string) {
    return this.members.get(uid) ?? null;
  }

  async listMembers(schoolId: string, limit: number) {
    return [...this.members.values()].filter((m) => m.schoolId === schoolId).slice(0, limit);
  }

  async getChallenge(uid: string) {
    const c = this.challenges.get(uid);
    return c ? { ...c } : null;
  }

  async putChallenge(uid: string, challenge: Challenge) {
    this.challenges.set(uid, { ...challenge });
  }

  async deleteChallenge(uid: string) {
    this.challenges.delete(uid);
  }

  async recordAttempt(uid: string) {
    const c = this.challenges.get(uid);
    if (!c) return null;
    c.attempts += 1;
    return { ...c };
  }

  async lockChallenge(uid: string, until: number) {
    const c = this.challenges.get(uid);
    if (c) c.lockedUntil = until;
  }

  async consumeQuota(key: string, max: number, windowMs: number, now: number) {
    const q = this.quotas.get(key);
    if (!q || now - q.windowStart >= windowMs) {
      this.quotas.set(key, { windowStart: now, count: 1 });
      return true;
    }
    if (q.count >= max) return false;
    q.count += 1;
    return true;
  }

  async createSchoolWithAdmin(school: School, member: Member): Promise<CreateSchoolResult> {
    if (this.schools.has(school.id)) return 'school_exists';
    if (this.members.has(member.uid)) return 'already_member';
    const owner = this.emails.get(member.emailKey);
    if (owner && owner.uid !== member.uid) return 'email_taken';

    this.schools.set(school.id, school);
    this.members.set(member.uid, member);
    this.emails.set(member.emailKey, { uid: member.uid, schoolId: school.id });
    return 'ok';
  }

  async addMember(member: Member): Promise<AddMemberResult> {
    if (this.members.has(member.uid)) return 'already_member';
    const owner = this.emails.get(member.emailKey);
    if (owner && owner.uid !== member.uid) return 'email_taken';

    this.members.set(member.uid, member);
    this.emails.set(member.emailKey, { uid: member.uid, schoolId: member.schoolId });
    return 'ok';
  }

  async removeMember(uid: string) {
    const m = this.members.get(uid);
    if (!m) return false;
    this.members.delete(uid);
    this.emails.delete(m.emailKey);
    return true;
  }
}
