// ============================================================
// Mobile API — typed wrappers over Supabase for the mobile app.
// All reads are RLS-safe. User writes are scoped to auth.uid().
// ============================================================

import { supabase } from './supabase';

function ok<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error('No data returned');
  return data;
}

// ─── Types (mirror DB schema) ──────────────────────────────────

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type BillCycle  = 'monthly' | 'sixmonths' | 'yearly';
export type PlanType   = 'exam_pack' | 'gold_learner' | 'pro';
export type SubTier    = 'Free' | 'Exam Pack';

export type Exam       = { id: string; name: string; short: string; description: string | null; subjects_count: number; tricks_count: number; accent: string; is_active: boolean; sort_order: number; exam_date: string | null; medium?: string; image_url?: string | null };
export type Subject    = { id: string; name: string; icon: string | null; chapters_count: number; exam_id: string; color: string; sort_order: number };
export type Chapter    = { id: string; name: string; subject_id: string; tricks_count: number; icon: string | null; sort_order: number };
export type Topic      = { id: string; name: string; chapter_id: string; tricks_count: number; icon: string | null; sort_order: number };
export type Trick      = { id: string; title: string; content: string; explanation: string; difficulty: Difficulty; subject_tag: string | null; topic_id: string; sort_order: number };
export type ShortNote  = { id: string; topic_id: string; title: string; content: string; is_custom: boolean };
export type ExamNews   = { id: string; exam_id: string; title: string; date_label: string | null; tag: string; accent: string | null };
export type ExamPricing= { exam_id: string; monthly: number; sixmonths: number; yearly: number; discount_percent?: number };
export type TrickRating= { trick_id: string; avg_rating: number; total_ratings: number; star1: number; star2: number; star3: number; star4: number; star5: number };
export type UserProfile= { id: string; name: string; phone: string | null; avatar_url: string | null; tier: SubTier; streak: number; tricks_learned: number; last_active_at: string };
export type Subscription={ id: string; user_id: string; exam_id: string | null; plan_type: string; billing_cycle: BillCycle; amount_paise: number; status: string; expires_at: string; created_at: string; transaction_id: string | null };
export type AppSettings = { app_name: string; tagline: string; version: string; description: string | null; support_email: string | null; website_url: string | null; team_members: {name:string;role:string;photo?:string}[]; social_links: {platform:string;url:string}[] };

// ─── Auth ─────────────────────────────────────────────────────

export const mobileAuth = {
  async signUp(email: string, password: string, name: string, phone?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  async currentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
  },

  async signInWithApple() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
  },

  onAuthChange(cb: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(cb);
  },
};

// ─── Content (read-only, public after login) ──────────────────

export const contentApi = {
  async loadAll() {
    const [exams, subjects, chapters, topics, tricks, notes, news, pricing] = await Promise.all([
      supabase.from('exams').select('*').order('sort_order').then(r => ok(r.data, r.error)),
      supabase.from('subjects').select('*').order('sort_order').then(r => ok(r.data, r.error)),
      supabase.from('chapters').select('*').order('sort_order').then(r => ok(r.data, r.error)),
      supabase.from('topics').select('*').order('sort_order').then(r => ok(r.data, r.error)),
      supabase.from('tricks_english').select('*').order('sort_order').then(r => ok(r.data, r.error)),
      supabase.from('short_notes').select('*').order('sort_order').then(r => ok(r.data, r.error)),
      supabase.from('exam_news').select('*').eq('is_active', true).order('created_at', { ascending: false }).then(r => ok(r.data, r.error)),
      supabase.from('exam_pricing').select('*').then(r => ok(r.data, r.error)),
    ]);
    return { exams, subjects, chapters, topics, tricks, notes, news, pricing } as {
      exams: Exam[]; subjects: Subject[]; chapters: Chapter[]; topics: Topic[];
      tricks: Trick[]; notes: ShortNote[]; news: ExamNews[]; pricing: ExamPricing[];
    };
  },

  async loadHindiTricks(): Promise<Trick[]> {
    const { data, error } = await supabase.from('tricks_hindi').select('*').order('sort_order');
    return ok(data, error) as Trick[];
  },

  async searchTricks(query: string, limit = 20): Promise<Trick[]> {
    const { data, error } = await supabase.rpc('search_tricks', { query, lim: limit });
    return ok(data, error) as Trick[];
  },

  async getTricksOfDay(): Promise<{ trick: Trick; note: string | null; accent: string | null }[]> {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('trick_of_day')
      .select('note, accent, trick:tricks_english(*)')
      .eq('date', today)
      .order('id')
      .limit(3);
    if (!data || !data.length) return [];
    return (data as any[])
      .filter((row) => row.trick)
      .map((row) => ({ trick: row.trick as Trick, note: row.note as string | null, accent: (row.accent as string | null) ?? null }));
  },

  async getAppSettings(): Promise<AppSettings | null> {
    const { data } = await supabase.from('app_settings').select('*').eq('id', 1).maybeSingle();
    return data as AppSettings | null;
  },
};

// ─── User Profile ─────────────────────────────────────────────

export const profileApi = {
  async get(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
    return ok(data, error) as UserProfile;
  },

  async update(userId: string, payload: Partial<Pick<UserProfile, 'name' | 'phone' | 'avatar_url'>>): Promise<UserProfile> {
    const { data, error } = await supabase.from('user_profiles').update(payload).eq('id', userId).select().single();
    return ok(data, error) as UserProfile;
  },

  async touchActive(userId: string) {
    await supabase.from('user_profiles').update({ last_active_at: new Date().toISOString() }).eq('id', userId);
  },

  async updateStreak(userId: string, streak: number) {
    await supabase.from('user_profiles').update({ streak }).eq('id', userId);
  },

  async setReferredBy(userId: string, code: string) {
    // Only sets referred_by if it hasn't been set yet (idempotent)
    await supabase.from('user_profiles').update({ referred_by: code } as any).eq('id', userId).is('referred_by' as any, null);
  },

  async getReferralCount(referralCode: string): Promise<number> {
    const q = supabase.from('user_profiles').select('*', { count: 'exact', head: true }) as any;
    const { count } = await q.eq('referred_by', referralCode);
    return (count as number | null) ?? 0;
  },
};

// ─── Progress ─────────────────────────────────────────────────

export const progressApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('user_progress').select('trick_id, mastered').eq('user_id', userId);
    const rows = ok(data, error) as { trick_id: string; mastered: boolean }[];
    const viewed  = new Set(rows.map(r => r.trick_id));
    const mastered = new Set(rows.filter(r => r.mastered).map(r => r.trick_id));
    return { viewed, mastered };
  },

  async markViewed(userId: string, trickId: string) {
    await supabase.from('user_progress')
      .upsert({ user_id: userId, trick_id: trickId, viewed_at: new Date().toISOString() }, { onConflict: 'user_id,trick_id' });
  },

  async toggleMastered(userId: string, trickId: string, mastered: boolean) {
    await supabase.from('user_progress')
      .upsert({
        user_id: userId, trick_id: trickId,
        mastered,
        mastered_at: mastered ? new Date().toISOString() : null,
      }, { onConflict: 'user_id,trick_id' });
  },
};

// ─── Bookmarks ────────────────────────────────────────────────

export const bookmarkApi = {
  async getIds(userId: string): Promise<Set<string>> {
    const { data, error } = await supabase.from('user_bookmarks').select('trick_id').eq('user_id', userId);
    return new Set(ok(data, error).map((r: any) => r.trick_id as string));
  },

  async add(userId: string, trickId: string) {
    const { error } = await supabase.from('user_bookmarks').insert({ user_id: userId, trick_id: trickId });
    if (error && error.code !== '23505') throw new Error(error.message);
  },

  async remove(userId: string, trickId: string) {
    await supabase.from('user_bookmarks').delete().eq('user_id', userId).eq('trick_id', trickId);
  },

  async toggle(userId: string, trickId: string, currentlyBookmarked: boolean): Promise<boolean> {
    if (currentlyBookmarked) {
      await bookmarkApi.remove(userId, trickId);
      return false;
    } else {
      await bookmarkApi.add(userId, trickId);
      return true;
    }
  },

  async getCount(trickId: string): Promise<number> {
    const { count } = await supabase
      .from('user_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('trick_id', trickId);
    return count ?? 0;
  },
};

// ─── Ratings ──────────────────────────────────────────────────

export const ratingApi = {
  async getAggregated(trickIds: string[]): Promise<Record<string, TrickRating>> {
    if (!trickIds.length) return {};
    const { data, error } = await supabase.from('trick_ratings').select('*').in('trick_id', trickIds);
    const rows = ok(data, error) as TrickRating[];
    return Object.fromEntries(rows.map(r => [r.trick_id, r]));
  },

  async getUserRatings(userId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase.from('user_ratings').select('trick_id, stars').eq('user_id', userId);
    return Object.fromEntries(ok(data, error).map((r: any) => [r.trick_id as string, r.stars as number]));
  },

  async rate(userId: string, trickId: string, stars: number) {
    await supabase.from('user_ratings')
      .upsert({ user_id: userId, trick_id: trickId, stars }, { onConflict: 'user_id,trick_id' });
  },
};

// ─── Subscriptions ────────────────────────────────────────────

export const subscriptionApi = {
  async getActive(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());
    return ok(data, error) as Subscription[];
  },

  async getSubscribedExamIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase.rpc('get_user_subscribed_exams', { p_user_id: userId });
    return ok(data, error).map((r: any) => r.exam_id as string);
  },

  async create(payload: {
    userId: string;
    examId?: string;
    planType: PlanType;
    billingCycle: BillCycle;
    amountPaise: number;
    transactionId?: string;
  }): Promise<Subscription> {
    const months = { monthly: 1, sixmonths: 6, yearly: 12 }[payload.billingCycle];
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id:       payload.userId,
        exam_id:       payload.examId ?? null,
        plan_type:     payload.planType,
        billing_cycle: payload.billingCycle,
        amount_paise:  payload.amountPaise,
        status:        'active',
        expires_at:    expiresAt.toISOString(),
        transaction_id:payload.transactionId ?? null,
      })
      .select().single();
    return ok(data, error) as Subscription;
  },

  async getExpiryWarning(userId: string, warningDays = 5): Promise<Subscription | null> {
    const subs = await subscriptionApi.getActive(userId);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + warningDays);
    const expiring = subs.filter(s => new Date(s.expires_at) <= cutoff);
    if (!expiring.length) return null;
    return expiring.sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())[0];
  },
};

// ─── Exam Medium Preferences ──────────────────────────────────

export const examMediumApi = {
  async getAll(userId: string): Promise<Record<string, 'hindi' | 'english'>> {
    const { data } = await supabase
      .from('user_exam_medium_preferences')
      .select('exam_id, medium')
      .eq('user_id', userId);
    const prefs: Record<string, 'hindi' | 'english'> = {};
    (data ?? []).forEach((r: { exam_id: string; medium: string }) => {
      prefs[r.exam_id] = r.medium === 'hindi' ? 'hindi' : 'english';
    });
    return prefs;
  },
  async set(userId: string, examId: string, medium: 'hindi' | 'english'): Promise<void> {
    await supabase.from('user_exam_medium_preferences').upsert(
      { user_id: userId, exam_id: examId, medium, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,exam_id' }
    );
  },
};

// ─── Support Issues ───────────────────────────────────────────

export const issueApi = {
  async submit(payload: {
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    message: string;
  }) {
    const { error } = await supabase.from('support_issues').insert({
      user_id:    payload.userId,
      user_name:  payload.userName,
      user_email: payload.userEmail,
      subject:    payload.subject,
      message:    payload.message,
      status:     'open',
      priority:   'medium',
    });
    if (error) throw new Error(error.message);
  },
};

// ─── User Custom Tricks ───────────────────────────────────────

export type UserTrick = {
  id: string;
  user_id: string;
  exam_id: string;
  subject_name: string;
  chapter_name: string;
  topic_name: string;
  title: string;
  content: string;
  created_at: string;
};

export const userTrickApi = {
  async getAll(userId: string): Promise<UserTrick[]> {
    const { data, error } = await supabase
      .from('user_tricks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as UserTrick[];
  },

  async create(payload: Omit<UserTrick, 'id' | 'created_at'>): Promise<UserTrick> {
    const { data, error } = await supabase.from('user_tricks').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data as UserTrick;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('user_tricks').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Mock Tests ───────────────────────────────────────────────

export type TopicMap = { id: string; topic_id: string; title: string; image_url: string; sort_order: number; created_at: string };

export type MockQuestion = {
  id: string;
  exam_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
  difficulty: string;
};

export const mockTestApi = {
  async getQuestions(examId: string): Promise<MockQuestion[]> {
    const { data, error } = await supabase
      .from('mock_questions')
      .select('*')
      .eq('exam_id', examId)
      .order('sort_order');
    if (error) throw new Error(error.message);
    return (data ?? []) as MockQuestion[];
  },

  async getCountsPerExam(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('mock_questions')
      .select('exam_id');
    if (error || !data) return {};
    return data.reduce((acc: Record<string, number>, row: { exam_id: string }) => {
      acc[row.exam_id] = (acc[row.exam_id] ?? 0) + 1;
      return acc;
    }, {});
  },
};

// ─── Topic Maps ───────────────────────────────────────────────

export const mapsApi = {
  async getByTopic(topicId: string): Promise<TopicMap[]> {
    const { data, error } = await supabase
      .from('topic_maps')
      .select('*')
      .eq('topic_id', topicId)
      .order('sort_order');
    if (error) throw new Error(error.message);
    return (data ?? []) as TopicMap[];
  },

  async loadAll(): Promise<TopicMap[]> {
    const { data, error } = await supabase
      .from('topic_maps')
      .select('*')
      .order('sort_order');
    if (error) throw new Error(error.message);
    return (data ?? []) as TopicMap[];
  },
};

// ─── Notifications (in-app feed) ──────────────────────────────

export const notificationsApi = {
  async getFeed(limit = 30) {
    const now = new Date().toISOString();
    const [sentRes, scheduledRes] = await Promise.all([
      supabase.from('push_notifications').select('*').eq('status', 'sent')
        .order('created_at', { ascending: false }).limit(limit),
      supabase.from('push_notifications').select('*').eq('status', 'scheduled')
        .lte('scheduled_at', now).order('created_at', { ascending: false }).limit(limit),
    ]);
    const combined = [...(sentRes.data ?? []), ...(scheduledRes.data ?? [])]
      .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
      .slice(0, limit);
    return combined;
  },

  subscribeToNew(callback: (n: unknown) => void) {
    return supabase
      .channel('new_notifications')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public',
        table: 'push_notifications',
        filter: "status=eq.sent",
      }, (payload) => callback(payload.new))
      .subscribe();
  },
};
