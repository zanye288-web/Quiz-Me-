/**
 * QUIZ-ME! — SUPABASE CLIENT & REAL-TIME PROGRESSION SERVICE
 * Core infrastructure service managing user progression, real-time synchronization across
 * sessions, and achievement states.
 */

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { AscensionProfile, AscensionAchievement, AscensionQuest, TopicMasteryDetail } from '../types/ascension';

export interface SupabaseSyncResult {
  success: boolean;
  syncedAt: string;
  source: 'supabase_cloud' | 'local_hybrid_fallback';
  error?: string;
}

// Cross-tab broadcast channel for local cross-session / multi-tab synchronization
let crossTabBroadcast: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    crossTabBroadcast = new BroadcastChannel('quizme_ascension_cross_tab');
  } catch {
    crossTabBroadcast = null;
  }
}

/**
 * Tests live connection to Supabase instance
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      message: 'Supabase credentials not configured. Operating in local / Cloud SQL hybrid mode.',
      latencyMs: 0,
    };
  }

  const start = Date.now();
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    const latencyMs = Date.now() - start;

    if (error && error.code !== 'PGRST116') {
      return {
        ok: false,
        message: `Supabase returned error: ${error.message}`,
        latencyMs,
      };
    }

    return {
      ok: true,
      message: `Connected to Supabase Real-Time successfully (${latencyMs}ms)`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err.message || 'Network error connecting to Supabase',
      latencyMs: Date.now() - start,
    };
  }
}

/**
 * Synchronizes user progression profile to Supabase in real time
 */
export async function syncUserProgression(
  userId: string,
  profile: AscensionProfile
): Promise<SupabaseSyncResult> {
  const syncedAt = new Date().toISOString();

  // 1. Always broadcast across browser tabs/sessions immediately
  if (crossTabBroadcast) {
    try {
      crossTabBroadcast.postMessage({
        type: 'PROGRESSION_UPDATED',
        userId,
        profile,
        syncedAt,
      });
    } catch {
      // ignore broadcast error
    }
  }

  const supabase = getSupabaseClient();
  if (!supabase || !userId) {
    return {
      success: true,
      syncedAt,
      source: 'local_hybrid_fallback',
    };
  }

  try {
    // Upsert into Supabase user_progression table
    const { error: progError } = await supabase.from('user_progression').upsert(
      {
        id: `prog_${userId}`,
        user_id: userId,
        level: profile.level,
        cumulative_xp: profile.cumulativeXp,
        rank_id: profile.rankId,
        equipped_title_id: profile.equippedTitleId,
        gems: profile.gems,
        streak_days: profile.consistency.streakDays,
        streak_shields: profile.consistency.streakShields,
        weekly_target_days: profile.consistency.weeklyTargetDays,
        study_days_this_week: profile.consistency.studyDaysThisWeek,
        last_study_date_iso: profile.consistency.lastStudyDateIso,
        updated_at: syncedAt,
      },
      { onConflict: 'user_id' }
    );

    // Also update public.users record for leaderboards
    await supabase.from('users').upsert(
      {
        id: userId,
        xp: profile.cumulativeXp,
        level: profile.level,
        streak_days: profile.consistency.streakDays,
        updated_at: syncedAt,
      },
      { onConflict: 'id' }
    );

    if (progError) {
      console.warn('Notice syncing to Supabase user_progression:', progError.message);
      return {
        success: false,
        syncedAt,
        source: 'supabase_cloud',
        error: progError.message,
      };
    }

    return {
      success: true,
      syncedAt,
      source: 'supabase_cloud',
    };
  } catch (err: any) {
    console.warn('Notice during Supabase progression sync:', err);
    return {
      success: false,
      syncedAt,
      source: 'supabase_cloud',
      error: err.message || 'Unknown network error',
    };
  }
}

/**
 * Synchronizes unlocked achievements to Supabase
 */
export async function syncUserAchievements(
  userId: string,
  achievements: Record<string, AscensionAchievement>
): Promise<SupabaseSyncResult> {
  const syncedAt = new Date().toISOString();
  const supabase = getSupabaseClient();

  if (!supabase || !userId) {
    return { success: true, syncedAt, source: 'local_hybrid_fallback' };
  }

  try {
    const records = Object.values(achievements).map((a) => ({
      id: `${userId}_${a.id}`,
      user_id: userId,
      achievement_id: a.id,
      is_unlocked: a.isUnlocked,
      unlocked_at_iso: a.unlockedAtIso || null,
      is_claimed: a.isClaimed,
      current_progress: a.current,
      updated_at: syncedAt,
    }));

    if (records.length > 0) {
      await supabase.from('user_achievements').upsert(records, { onConflict: 'id' });
    }

    return { success: true, syncedAt, source: 'supabase_cloud' };
  } catch (err: any) {
    return { success: false, syncedAt, source: 'supabase_cloud', error: err.message };
  }
}

/**
 * Loads user progression from Supabase
 */
export async function loadUserProgression(userId: string): Promise<Partial<AscensionProfile> | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_progression')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      level: data.level,
      cumulativeXp: data.cumulative_xp,
      rankId: data.rank_id,
      equippedTitleId: data.equipped_title_id,
      gems: data.gems,
      consistency: {
        streakDays: data.streak_days,
        personalBestStreak: data.streak_days,
        weeklyTargetDays: data.weekly_target_days || 5,
        studyDaysThisWeek: data.study_days_this_week || 1,
        activeWeekDays: [new Date().getDay() || 7],
        streakShields: data.streak_shields ?? 2,
        maxStreakShields: 3,
        restDayActive: false,
        lastStudyDateIso: data.last_study_date_iso || new Date().toISOString(),
      },
    };
  } catch (err) {
    console.warn('Notice loading progression from Supabase:', err);
    return null;
  }
}

/**
 * Subscribes to real-time progression changes across devices & sessions
 */
export function subscribeRealtimeProgression(
  userId: string,
  onRemoteUpdate: (progression: Partial<AscensionProfile>) => void
): () => void {
  const cleanups: Array<() => void> = [];

  // 1. Cross-tab real-time listener
  if (crossTabBroadcast) {
    const handler = (evt: MessageEvent) => {
      if (evt.data && evt.data.type === 'PROGRESSION_UPDATED' && evt.data.userId === userId) {
        onRemoteUpdate(evt.data.profile);
      }
    };
    crossTabBroadcast.addEventListener('message', handler);
    cleanups.push(() => {
      crossTabBroadcast?.removeEventListener('message', handler);
    });
  }

  // 2. Supabase Real-time Channel (PostgreSQL CDC)
  const supabase = getSupabaseClient();
  if (supabase && userId) {
    try {
      const channel = supabase
        .channel(`public:user_progression:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_progression',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const row: any = payload.new;
            if (row) {
              onRemoteUpdate({
                level: row.level,
                cumulativeXp: row.cumulative_xp,
                rankId: row.rank_id,
                equippedTitleId: row.equipped_title_id,
                gems: row.gems,
              });
            }
          }
        )
        .subscribe();

      cleanups.push(() => {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore cleanup error
        }
      });
    } catch (err) {
      console.warn('Notice setting up Supabase realtime channel:', err);
    }
  }

  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore
      }
    });
  };
}
