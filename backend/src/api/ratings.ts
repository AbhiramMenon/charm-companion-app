// ============================================================
// Ratings API
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type { TrickRating, UserRating } from '../types';

export function ratingApi(sb: KrackitClient) {
  return {
    // Get aggregated rating for one trick
    async get(trickId: string): Promise<TrickRating | null> {
      const { data } = await sb
        .from('trick_ratings')
        .select('*')
        .eq('trick_id', trickId)
        .maybeSingle();
      return data;
    },

    // Bulk fetch all trick ratings (admin analytics)
    async listAll(): Promise<TrickRating[]> {
      const { data, error } = await sb
        .from('trick_ratings')
        .select('*')
        .order('total_ratings', { ascending: false });
      return assertOk(data, error);
    },

    // Fetch ratings for a specific set of tricks (mobile — after loading tricks)
    async listForTricks(trickIds: string[]): Promise<TrickRating[]> {
      if (!trickIds.length) return [];
      const { data, error } = await sb
        .from('trick_ratings')
        .select('*')
        .in('trick_id', trickIds);
      return assertOk(data, error);
    },

    // Submit or update a user's rating for a trick
    async rate(userId: string, trickId: string, stars: number): Promise<UserRating> {
      if (stars < 1 || stars > 5) throw new Error('Stars must be between 1 and 5');
      const { data, error } = await sb
        .from('user_ratings')
        .upsert({ user_id: userId, trick_id: trickId, stars }, { onConflict: 'user_id,trick_id' })
        .select()
        .single();
      return assertOk(data, error);
    },

    // Get this user's rating for a trick
    async getUserRating(userId: string, trickId: string): Promise<number | null> {
      const { data } = await sb
        .from('user_ratings')
        .select('stars')
        .eq('user_id', userId)
        .eq('trick_id', trickId)
        .maybeSingle();
      return data?.stars ?? null;
    },

    // Bulk fetch all user ratings for this user (mobile — for UI state)
    async getUserRatings(userId: string): Promise<Record<string, number>> {
      const { data, error } = await sb
        .from('user_ratings')
        .select('trick_id, stars')
        .eq('user_id', userId);
      const rows = assertOk(data, error);
      return Object.fromEntries(rows.map(r => [r.trick_id, r.stars]));
    },
  };
}
