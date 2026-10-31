import { auth } from '../lib/firebase';
import { UserStats, QuizResponse } from '../types/quiz';
import { QuizHistoryRecord } from '../components/HistoryView';
import { SavedQuizDocument, UserProfileDocument, QuizComment } from './firestore';

async function getAuthHeader(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch {
      // Failed to retrieve token, proceed without
    }
  }
  return headers;
}

// 1. User Profile Sync with PostgreSQL
export async function fetchRelationalProfile(): Promise<UserProfileDocument | null> {
  try {
    const headers = await getAuthHeader();
    if (!headers['Authorization']) return null;

    const res = await fetch('/api/db/profile', { headers });
    if (!res.ok) return null;
    const json = await res.json();
    return json.profile || null;
  } catch {
    return null;
  }
}

export async function updateRelationalProfile(updates: Partial<UserProfileDocument>): Promise<boolean> {
  try {
    const headers = await getAuthHeader();
    if (!headers['Authorization']) return false;

    const res = await fetch('/api/db/profile', {
      method: 'POST',
      headers,
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 2. Global Leaderboard from PostgreSQL
export async function fetchRelationalLeaderboard(): Promise<any[]> {
  try {
    const res = await fetch('/api/db/leaderboard');
    if (!res.ok) return [];
    const json = await res.json();
    return json.leaders || [];
  } catch {
    return [];
  }
}

// 3. Quizzes from PostgreSQL
export async function fetchRelationalQuizzes(): Promise<SavedQuizDocument[]> {
  try {
    const res = await fetch('/api/db/quizzes');
    if (!res.ok) return [];
    const json = await res.json();
    return json.quizzes || [];
  } catch {
    return [];
  }
}

export async function saveRelationalQuiz(quiz: SavedQuizDocument): Promise<boolean> {
  try {
    const headers = await getAuthHeader();
    if (!headers['Authorization']) return false;

    const res = await fetch('/api/db/quizzes', {
      method: 'POST',
      headers,
      body: JSON.stringify(quiz),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 4. Quiz History in PostgreSQL
export async function fetchRelationalHistory(): Promise<QuizHistoryRecord[]> {
  try {
    const headers = await getAuthHeader();
    if (!headers['Authorization']) return [];

    const res = await fetch('/api/db/history', { headers });
    if (!res.ok) return [];
    const json = await res.json();
    return json.history || [];
  } catch {
    return [];
  }
}

export async function saveRelationalHistory(record: QuizHistoryRecord): Promise<boolean> {
  try {
    const headers = await getAuthHeader();
    if (!headers['Authorization']) return false;

    const res = await fetch('/api/db/history', {
      method: 'POST',
      headers,
      body: JSON.stringify(record),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 5. Worksheet Scanner API
export async function scanWorksheetFile(params: {
  imageBase64?: string;
  mimeType?: string;
  textSnippet?: string;
  fileName?: string;
}): Promise<any> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/scan-worksheet', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'Failed to scan worksheet');
  }
  return res.json();
}
