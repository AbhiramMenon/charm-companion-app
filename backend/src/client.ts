// ============================================================
// Supabase Client Factory
// Use createAdminClient() in admin app (service role)
// Use createMobileClient() in mobile app (anon key + user auth)
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type KrackitClient = SupabaseClient<Database>;

/**
 * Admin client — bypasses RLS via service role key.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser bundle
 * in a public-facing app. Acceptable for an internal admin panel
 * served behind auth or on a private network.
 */
export function createAdminClient(
  supabaseUrl: string,
  serviceRoleKey: string,
): KrackitClient {
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
    global: {
      headers: { 'x-client-info': 'krackit-admin' },
    },
  });
}

/**
 * Mobile / user client — respects RLS, uses anon key + user JWT.
 */
export function createMobileClient(
  supabaseUrl: string,
  anonKey: string,
): KrackitClient {
  return createClient<Database>(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession:   true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    global: {
      headers: { 'x-client-info': 'krackit-mobile' },
    },
  });
}

// ── Error helper ─────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function assertOk<T>(
  data: T | null,
  error: { message: string; code?: string } | null,
): T {
  if (error) throw new ApiError(error.message, error.code);
  if (data === null) throw new ApiError('No data returned');
  return data;
}
