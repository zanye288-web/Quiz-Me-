// ============================================================================
// QUIZ-ME! — UNIFIED SUPABASE & RELATIONAL REPOSITORY
// Communicates with Supabase Cloud when configured, or transparently falls back
// to Cloud SQL (PostgreSQL) REST routes (/api/db/*) and local state cache.
// ============================================================================

import { getSupabaseClient, isSupabaseConfigured, SupabaseUserProfile, SupabaseQuizRecord } from '../lib/supabase';
import * as relationalDb from './relationalDb';

export interface LeaderboardUser {
  id: string;
  name: string;
  photoURL: string | null;
  xp: number;
  level: number;
  streakDays: number;
  role: string;
}

export async function fetchScholarsLeaderboard(): Promise<LeaderboardUser[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, photo_url, xp, level, streak_days, role')
        .order('xp', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((u: any) => ({
          id: u.id,
          name: u.display_name || 'Scholar',
          photoURL: u.photo_url || null,
          xp: u.xp || 0,
          level: u.level || 1,
          streakDays: u.streak_days || 0,
          role: u.role || 'Student',
        }));
      }
    } catch (err) {
      console.warn('Supabase leaderboard fetch fallback to relational API:', err);
    }
  }

  // Graceful fallback to Cloud SQL PostgreSQL REST API
  return await relationalDb.fetchRelationalLeaderboard();
}

export async function fetchCommunityQuizzes(): Promise<any[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(40);

      if (!error && Array.isArray(data)) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase quizzes fetch fallback to relational API:', err);
    }
  }

  // Fallback to Cloud SQL PostgreSQL REST API
  return await relationalDb.fetchRelationalQuizzes();
}

export async function saveUserQuizAttempt(attempt: {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
  xpEarned: number;
  mistakesCount: number;
}): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      if (user) {
        await supabase.from('quiz_history').insert({
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user_id: user.id,
          quiz_id: attempt.quizId,
          quiz_title: attempt.quizTitle,
          score: attempt.score,
          total_questions: attempt.totalQuestions,
          accuracy: attempt.accuracy,
          time_spent_seconds: attempt.timeSpentSeconds,
          xp_earned: attempt.xpEarned,
          mistakes_count: attempt.mistakesCount,
          created_at: new Date().toISOString(),
        });
        return true;
      }
    } catch (err) {
      console.warn('Supabase attempt save fallback to relational API:', err);
    }
  }

  // Fallback to Cloud SQL PostgreSQL REST API
  try {
    await relationalDb.saveRelationalHistory({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      quizTitle: attempt.quizTitle,
      date: new Date().toISOString(),
      score: attempt.score,
      total: attempt.totalQuestions,
      percentage: attempt.accuracy,
      timeSpentSeconds: attempt.timeSpentSeconds,
      xpEarned: attempt.xpEarned,
      quizData: {
        app_name: 'Quiz Me!',
        persona: 'Teacher',
        quiz_title: attempt.quizTitle,
        summary: 'Assessment session',
        difficulty: 'Intermediate',
        questions: [],
      },
    });
    return true;
  } catch {
    return false;
  }
}
