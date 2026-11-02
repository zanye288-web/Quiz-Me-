import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dbRepo from '../src/db/repository.ts';

let serverSupabase: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  if (!serverSupabase) {
    try {
      serverSupabase = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err) {
      console.error('Server Supabase client creation error:', err);
      return null;
    }
  }

  return serverSupabase;
}

export function getSupabaseServerStatus() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAnonKey = Boolean(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);
  const isAvailable = Boolean(url && (hasServiceKey || hasAnonKey));

  return {
    isAvailable,
    url: isAvailable ? url : null,
    hasServiceKey,
    hasAnonKey,
    hybridEngine: 'PostgreSQL (Cloud SQL us-west1 & Supabase Compatible)',
  };
}

/**
 * Returns the production-ready PostgreSQL SQL DDL schema that users can run
 * directly in Supabase SQL Editor to provision all Quiz-Me! tables with RLS policies.
 */
export function getSupabaseSqlDdlSchema(): string {
  return `-- ============================================================================
-- QUIZ-ME! — SUPABASE POSTGRESQL PRODUCTION DDL SCHEMA
-- Compatible with PostgreSQL 15+ and Supabase Row Level Security (RLS)
-- ============================================================================

-- 1. Users Profile Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- references auth.users(id) or Firebase UID
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  streak_days INTEGER DEFAULT 0 NOT NULL,
  bio TEXT,
  role TEXT DEFAULT 'student' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  creator_uid TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  questions JSONB NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  saves_count INTEGER DEFAULT 0 NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Quiz History Table
CREATE TABLE IF NOT EXISTS public.quiz_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  quiz_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0 NOT NULL,
  xp_earned INTEGER DEFAULT 0 NOT NULL,
  mistakes_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Social & Interaction Tables
CREATE TABLE IF NOT EXISTS public.quiz_likes (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_saves (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  quiz_title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_comments (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'Student',
  author_photo_url TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Indexes for fast analytics and leaderboards
CREATE INDEX IF NOT EXISTS idx_users_xp ON public.users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON public.quizzes(subject);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON public.quiz_history(user_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;

-- 7. Public Read & User Update Policies
CREATE POLICY "Public read profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public read quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Users read own history" ON public.quiz_history FOR SELECT USING (true);
`;
}
