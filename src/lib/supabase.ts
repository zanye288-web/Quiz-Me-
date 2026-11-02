import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getActiveSupabaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('quizme_supabase_url');
    if (custom && custom.trim().startsWith('http')) return custom.trim();
  }
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    ''
  );
}

export function getActiveSupabaseAnonKey(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('quizme_supabase_anon_key');
    if (custom && custom.trim()) return custom.trim();
  }
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
    ''
  );
}

export function setCustomSupabaseCredentials(url: string, anonKey: string): boolean {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('quizme_supabase_url', url.trim());
      localStorage.setItem('quizme_supabase_anon_key', anonKey.trim());
      supabaseInstance = null; // force re-instantiation
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function clearCustomSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('quizme_supabase_url');
    localStorage.removeItem('quizme_supabase_anon_key');
    supabaseInstance = null;
  }
}

// Database Schema Interfaces matching Quiz-Me! PostgreSQL / Supabase tables
export interface SupabaseUserProfile {
  id: string; // matches uid
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
  bio: string | null;
  role: 'student' | 'teacher' | 'scholar';
  created_at: string;
  updated_at: string;
}

export interface SupabaseQuizRecord {
  id: string;
  creator_uid: string;
  creator_name: string;
  title: string;
  description: string | null;
  subject: string;
  topic: string;
  difficulty: string;
  questions: any[];
  likes_count: number;
  saves_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseQuizHistoryRecord {
  id: string;
  user_id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  accuracy: number;
  time_spent_seconds: number;
  xp_earned: number;
  mistakes_count: number;
  created_at: string;
}

export interface SupabaseUserProgressionRecord {
  id: string;
  user_id: string;
  level: number;
  cumulative_xp: number;
  rank_id: string;
  equipped_title_id: string;
  gems: number;
  streak_days: number;
  streak_shields: number;
  weekly_target_days: number;
  study_days_this_week: number;
  last_study_date_iso: string;
  updated_at: string;
}

export interface SupabaseAchievementRecord {
  id: string;
  user_id: string;
  achievement_id: string;
  is_unlocked: boolean;
  unlocked_at_iso: string | null;
  is_claimed: boolean;
  current_progress: number;
  updated_at: string;
}

export interface SupabaseQuestRecord {
  id: string;
  user_id: string;
  quest_id: string;
  category: string;
  current_count: number;
  target_count: number;
  status: 'active' | 'completed' | 'claimed';
  updated_at: string;
}

export interface SupabaseDatabaseSchema {
  users: SupabaseUserProfile;
  quizzes: SupabaseQuizRecord;
  quiz_history: SupabaseQuizHistoryRecord;
  user_progression: SupabaseUserProgressionRecord;
  user_achievements: SupabaseAchievementRecord;
  user_quests: SupabaseQuestRecord;
}

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns true if Supabase credentials are valid & configured
 */
export function isSupabaseConfigured(): boolean {
  const url = getActiveSupabaseUrl();
  const key = getActiveSupabaseAnonKey();
  return Boolean(url && key && url.startsWith('http'));
}

/**
 * Initializes and returns the Supabase client.
 * If credentials are not set, returns null to allow fallback.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const url = getActiveSupabaseUrl();
  const key = getActiveSupabaseAnonKey();

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

/**
 * Helper to get current Supabase config metadata for UI status
 */
export function getSupabaseConfigStatus() {
  const isConfigured = isSupabaseConfigured();
  const url = getActiveSupabaseUrl();
  return {
    isConfigured,
    url: isConfigured ? url : 'Not configured (using local/Cloud SQL hybrid)',
    hasAnonKey: Boolean(getActiveSupabaseAnonKey()),
    provider: isConfigured ? 'Supabase Real-Time Cloud (PostgreSQL)' : 'Cloud SQL / Drizzle Hybrid Fallback',
  };
}
