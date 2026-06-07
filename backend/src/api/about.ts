// ============================================================
// App Settings (About) API
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type { AppSettings } from '../types';

export function aboutApi(sb: KrackitClient) {
  return {
    // Get app settings (publicly readable — call from mobile without auth)
    async get(): Promise<AppSettings> {
      const { data, error } = await sb
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();
      return assertOk(data, error);
    },

    // Admin: update app settings (only admins can do this via RLS)
    async update(payload: Partial<Omit<AppSettings, 'id' | 'updated_at'>>): Promise<AppSettings> {
      const { data, error } = await sb
        .from('app_settings')
        .update(payload)
        .eq('id', 1)
        .select()
        .single();
      return assertOk(data, error);
    },

    // Ensure the singleton row exists (call once during setup)
    async ensureExists(): Promise<AppSettings> {
      const { data } = await sb
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (data) return data as AppSettings;
      const { data: inserted, error } = await sb
        .from('app_settings')
        .insert({ id: 1 })
        .select()
        .single();
      return assertOk(inserted, error);
    },
  };
}
