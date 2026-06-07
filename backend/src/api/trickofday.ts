// ============================================================
// Trick of the Day API
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type { TrickOfDay, Trick } from '../types';

export function trickOfDayApi(sb: KrackitClient) {
  return {
    // Get today's trick of the day (with full trick data)
    async getToday(): Promise<{ entry: TrickOfDay; trick: Trick } | null> {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await sb
        .from('trick_of_day')
        .select('*, trick:tricks(*)')
        .eq('date', today)
        .maybeSingle();
      if (!data) return null;
      return {
        entry: data as unknown as TrickOfDay,
        trick: (data as any).trick as Trick,
      };
    },

    // List all scheduled trick-of-day entries (admin)
    async listAll(): Promise<TrickOfDay[]> {
      const { data, error } = await sb
        .from('trick_of_day')
        .select('*')
        .order('date', { ascending: false });
      return assertOk(data, error);
    },

    // Admin: schedule a trick for a specific date
    async schedule(trickId: string, date: string, note?: string): Promise<TrickOfDay> {
      const id = `tod-${date.replace(/-/g, '')}`;
      const { data, error } = await sb
        .from('trick_of_day')
        .upsert({ id, trick_id: trickId, date, note: note ?? null }, { onConflict: 'date' })
        .select()
        .single();
      return assertOk(data, error);
    },

    // Admin: remove a scheduled entry
    async unschedule(id: string): Promise<void> {
      const { error } = await sb.from('trick_of_day').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}
