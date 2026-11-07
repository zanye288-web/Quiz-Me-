import { auth } from '../lib/firebase';

export interface SchoolMembership {
  school: { id: string; name: string; domain: string };
  role: 'admin' | 'member';
  email: string;
  joinedAt: number;
}

export interface CodeSent {
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

export class SchoolApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'SchoolApiError';
  }
}

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new SchoolApiError('Please sign in first.', 'unauthorized');

  let token: string;
  try {
    token = await user.getIdToken();
  } catch {
    throw new SchoolApiError('Your session expired. Please sign in again.', 'unauthorized');
  }

  let res: Response;
  try {
    res = await fetch(`/api/schools${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new SchoolApiError('Could not reach the server. Check your connection.', 'network');
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new SchoolApiError(
      json?.error || 'Something went wrong. Please try again.',
      json?.code || 'unknown',
      json?.retryAfter
    );
  }
  return json as T;
}

export async function fetchMembership(): Promise<SchoolMembership | null> {
  const r = await call<{ membership: SchoolMembership | null }>('/me');
  return r.membership;
}

export function startSchoolRegistration(schoolName: string, email: string): Promise<CodeSent> {
  return call<CodeSent>('/register/start', { method: 'POST', body: { schoolName, email } });
}

export function startSchoolJoin(email: string): Promise<CodeSent> {
  return call<CodeSent>('/join/start', { method: 'POST', body: { email } });
}

export async function verifySchoolCode(code: string): Promise<SchoolMembership> {
  const r = await call<{ membership: SchoolMembership }>('/verify', { method: 'POST', body: { code } });
  return r.membership;
}

export async function fetchSchoolRoster(): Promise<{ school: { id: string; name: string }; members: RosterEntry[] }> {
  return call('/roster');
}

export async function leaveSchool(): Promise<void> {
  await call('/membership', { method: 'DELETE' });
}

export async function removeSchoolMember(uid: string): Promise<void> {
  await call(`/members/${encodeURIComponent(uid)}`, { method: 'DELETE' });
}
