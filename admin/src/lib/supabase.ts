// Admin Supabase client
// Uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY for authentication,
// then relies on the is_admin() RLS function for write access.
// Keep this file out of public repositories.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill in your Supabase project details.'
  );
}

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession:   true,
    storage:          sessionStorage, // admin session lives in tab only
  },
  global: { headers: { 'x-client-info': 'krackit-admin/1.0' } },
});
