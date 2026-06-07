// ============================================================
// Users API — profile management, progress, bookmarks
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type { UserProfile, UserProgress, UserBookmark } from '../types';

// ─── AUTH HELPERS ─────────────────────────────────────────────

export function authApi(sb: KrackitClient) {
  return {
    async signUp(email: string, password: string, name: string, phone?: string) {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });
      if (error) throw new Error(error.message);
      return data;
    },

    async signIn(email: string, password: string) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      return data;
    },

    async signOut() {
      const { error } = await sb.auth.signOut();
      if (error) throw new Error(error.message);
    },

    async resetPassword(email: string, redirectTo?: string) {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw new Error(error.message);
    },

    async updatePassword(newPassword: string) {
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
    },

    getSession() {
      return sb.auth.getSession();
    },

    onAuthStateChange(callback: Parameters<typeof sb.auth.onAuthStateChange>[0]) {
      return sb.auth.onAuthStateChange(callback);
    },

    async currentUser() {
      const { data } = await sb.auth.getUser();
      return data.user;
    },
  };
}

// ─── USER PROFILE ─────────────────────────────────────────────

export function userProfileApi(sb: KrackitClient) {
  return {
    async get(userId: string): Promise<UserProfile> {
      const { data, error } = await sb
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return assertOk(data, error);
    },

    async update(userId: string, payload: Partial<Pick<UserProfile, 'name' | 'phone' | 'avatar_url'>>): Promise<UserProfile> {
      const { data, error } = await sb
        .from('user_profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();
      return assertOk(data, error);
    },

    async touchLastActive(userId: string): Promise<void> {
      await sb
        .from('user_profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', userId);
    },

    async updateStreak(userId: string, streak: number): Promise<void> {
      await sb
        .from('user_profiles')
        .update({ streak })
        .eq('id', userId);
    },

    // Admin only: list all users with optional filters
    async listAll(filters?: { tier?: string; search?: string }): Promise<UserProfile[]> {
      let q = sb.from('user_profiles').select('*').order('created_at', { ascending: false });
      if (filters?.tier) q = q.eq('tier', filters.tier);
      if (filters?.search) {
        q = q.or(`name.ilike.%${filters.search}%`);
      }
      const { data, error } = await q;
      return assertOk(data, error);
    },

    async setAdminRole(userId: string, isAdmin: boolean): Promise<void> {
      const { error } = await sb
        .from('user_profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);
      if (error) throw new Error(error.message);
    },
  };
}

// ─── USER PROGRESS ────────────────────────────────────────────

export function userProgressApi(sb: KrackitClient) {
  return {
    async list(userId: string): Promise<UserProgress[]> {
      const { data, error } = await sb
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);
      return assertOk(data, error);
    },

    async markViewed(userId: string, trickId: string): Promise<UserProgress> {
      const { data, error } = await sb
        .from('user_progress')
        .upsert({ user_id: userId, trick_id: trickId, viewed_at: new Date().toISOString() }, { onConflict: 'user_id,trick_id' })
        .select()
        .single();
      return assertOk(data, error);
    },

    async markMastered(userId: string, trickId: string, mastered: boolean): Promise<UserProgress> {
      const { data, error } = await sb
        .from('user_progress')
        .upsert({
          user_id: userId,
          trick_id: trickId,
          mastered,
          mastered_at: mastered ? new Date().toISOString() : null,
        }, { onConflict: 'user_id,trick_id' })
        .select()
        .single();
      return assertOk(data, error);
    },

    async getMasteredIds(userId: string): Promise<string[]> {
      const { data, error } = await sb
        .from('user_progress')
        .select('trick_id')
        .eq('user_id', userId)
        .eq('mastered', true);
      return assertOk(data, error).map(r => r.trick_id);
    },

    async getViewedIds(userId: string): Promise<string[]> {
      const { data, error } = await sb
        .from('user_progress')
        .select('trick_id')
        .eq('user_id', userId);
      return assertOk(data, error).map(r => r.trick_id);
    },
  };
}

// ─── BOOKMARKS ────────────────────────────────────────────────

export function bookmarkApi(sb: KrackitClient) {
  return {
    async list(userId: string): Promise<UserBookmark[]> {
      const { data, error } = await sb
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return assertOk(data, error);
    },

    async getBookmarkedIds(userId: string): Promise<string[]> {
      const { data, error } = await sb
        .from('user_bookmarks')
        .select('trick_id')
        .eq('user_id', userId);
      return assertOk(data, error).map(r => r.trick_id);
    },

    async add(userId: string, trickId: string): Promise<void> {
      const { error } = await sb
        .from('user_bookmarks')
        .insert({ user_id: userId, trick_id: trickId });
      if (error && error.code !== '23505') throw new Error(error.message); // ignore duplicate
    },

    async remove(userId: string, trickId: string): Promise<void> {
      const { error } = await sb
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('trick_id', trickId);
      if (error) throw new Error(error.message);
    },

    async toggle(userId: string, trickId: string): Promise<boolean> {
      const ids = await bookmarkApi(sb).getBookmarkedIds(userId);
      if (ids.includes(trickId)) {
        await bookmarkApi(sb).remove(userId, trickId);
        return false;
      } else {
        await bookmarkApi(sb).add(userId, trickId);
        return true;
      }
    },
  };
}
