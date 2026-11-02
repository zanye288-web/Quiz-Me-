/**
 * Automated Unit Tests for Supabase Progression Service & Infrastructure
 */

import {
  testSupabaseConnection,
  syncUserProgression,
  loadUserProgression,
} from '../services/supabaseService';
import { createDefaultAscensionProfile } from '../services/ascensionEngine';

export async function runSupabaseTests(): Promise<{ passed: number; failed: number }> {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  console.log('\n--- Running Supabase Real-Time Progression Service Test Suite ---');

  // Test 1: Connection test handles unconfigured / fallback mode gracefully
  const conn = await testSupabaseConnection();
  assert(typeof conn.ok === 'boolean', 'Connection test returns typed boolean status');
  assert(typeof conn.latencyMs === 'number', 'Connection test measures latency in milliseconds');

  // Test 2: Sync progression executes and falls back safely
  const profile = createDefaultAscensionProfile({ xp: 2500, gems: 120, streak: 4 });
  const syncResult = await syncUserProgression('test_user_scholar_1', profile);
  assert(syncResult.success === true, 'Progression synchronization succeeds with fallback protection');
  assert(
    syncResult.source === 'supabase_cloud' || syncResult.source === 'local_hybrid_fallback',
    'Sync operation resolves to authorized source'
  );

  return { passed, failed };
}
