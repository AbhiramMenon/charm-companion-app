// ============================================================
// Analytics API (Admin only)
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type { ContentStats, UserStats, TrickRating } from '../types';

export function analyticsApi(sb: KrackitClient) {
  return {
    // Overall content counts
    async contentStats(): Promise<ContentStats> {
      const { data, error } = await sb
        .from('v_content_stats' as any)
        .select('*')
        .single();
      return assertOk(data, error) as ContentStats;
    },

    // Overall user stats
    async userStats(): Promise<UserStats> {
      const { data, error } = await sb
        .from('v_user_stats' as any)
        .select('*')
        .single();
      return assertOk(data, error) as UserStats;
    },

    // Revenue breakdown by exam
    async revenueByExam() {
      const { data, error } = await sb
        .from('v_revenue_by_exam' as any)
        .select('*');
      return assertOk(data, error);
    },

    // Tricks by difficulty distribution
    async tricksByDifficulty(): Promise<{ difficulty: string; count: number }[]> {
      const { data, error } = await sb
        .from('v_tricks_by_difficulty' as any)
        .select('*');
      return assertOk(data, error) as { difficulty: string; count: number }[];
    },

    // Top rated tricks
    async topRatedTricks(limit = 10): Promise<(TrickRating & { id: string; title: string; difficulty: string })[]> {
      const { data, error } = await sb
        .from('v_top_rated_tricks' as any)
        .select('*')
        .limit(limit);
      return assertOk(data, error) as (TrickRating & { id: string; title: string; difficulty: string })[];
    },

    // Subscriptions expiring within N days
    async expiringSubscriptions(days = 5) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);
      const { data, error } = await sb
        .from('subscriptions')
        .select('*, user_profiles(name, phone)')
        .eq('status', 'active')
        .lte('expires_at', cutoff.toISOString())
        .gt('expires_at', new Date().toISOString())
        .order('expires_at');
      return assertOk(data, error);
    },

    // Daily active users (last 7 days)
    async dailyActiveUsers(days = 7) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data, error } = await sb
        .from('user_profiles')
        .select('last_active_at')
        .gte('last_active_at', since.toISOString());
      const rows = assertOk(data, error);
      // Bucket by day
      const buckets: Record<string, number> = {};
      for (const row of rows) {
        const day = row.last_active_at.slice(0, 10);
        buckets[day] = (buckets[day] ?? 0) + 1;
      }
      return Object.entries(buckets)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    // Streak distribution buckets
    async streakDistribution() {
      const { data, error } = await sb
        .from('user_profiles')
        .select('streak');
      const rows = assertOk(data, error);
      const buckets = { '0': 0, '1-7': 0, '8-30': 0, '31-90': 0, '90+': 0 };
      for (const { streak } of rows) {
        if (streak === 0)        buckets['0']++;
        else if (streak <= 7)   buckets['1-7']++;
        else if (streak <= 30)  buckets['8-30']++;
        else if (streak <= 90)  buckets['31-90']++;
        else                    buckets['90+']++;
      }
      return Object.entries(buckets).map(([label, count]) => ({ label, count }));
    },

    // Ratings distribution across all tricks
    async ratingsDistribution() {
      const { data, error } = await sb
        .from('trick_ratings')
        .select('star1, star2, star3, star4, star5');
      const rows = assertOk(data, error);
      const dist = [0, 0, 0, 0, 0];
      for (const r of rows) {
        dist[0] += r.star1; dist[1] += r.star2; dist[2] += r.star3;
        dist[3] += r.star4; dist[4] += r.star5;
      }
      return dist.map((count, i) => ({ stars: i + 1, count }));
    },

    // Users by exam subscription
    async usersByExam() {
      const { data, error } = await sb
        .from('subscriptions')
        .select('exam_id, exams(name)')
        .eq('status', 'active')
        .not('exam_id', 'is', null);
      const rows = assertOk(data, error);
      const counts: Record<string, { name: string; count: number }> = {};
      for (const row of rows as any[]) {
        const id = row.exam_id as string;
        if (!counts[id]) counts[id] = { name: row.exams?.name ?? id, count: 0 };
        counts[id].count++;
      }
      return Object.values(counts);
    },
  };
}
