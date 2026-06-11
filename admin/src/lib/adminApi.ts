// ============================================================
// Admin API — typed wrappers over Supabase
// Replaces the localStorage-based Store pattern.
// All write operations require the authenticated user to have
// is_admin = true in their user_profiles row (enforced by RLS).
// ============================================================

import { supabase } from './supabase';

// Re-export DB types aligned with existing admin types
export type {
  Exam, Subject, Chapter, Topic, Trick, ShortNote, ExamNews,
  ExamPricing, AppSettings, TrickOfDay, TrickRating,
  SupportIssue, PushNotification, UserProfile, Subscription, TopicMap,
} from './adminApiTypes';

import type {
  Exam, Subject, Chapter, Topic, Trick, ShortNote, ExamNews,
  ExamPricing, AppSettings, TrickOfDay, TrickRating,
  SupportIssue, PushNotification, UserProfile,
} from './adminApiTypes';

// ─── Auth ─────────────────────────────────────────────────────

export const adminAuth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // Verify admin flag
    const { data: profile } = await supabase
      .from('user_profiles').select('is_admin').eq('id', data.user.id).single();
    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      throw new Error('Access denied. This account does not have admin privileges.');
    }
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthChange(cb: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(cb);
  },
};

// ─── Helper ───────────────────────────────────────────────────

function ok<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error('No data returned');
  return data;
}

// ─── Exams ────────────────────────────────────────────────────

export const examsApi = {
  async list(): Promise<Exam[]> {
    const { data, error } = await supabase.from('exams').select('*').order('sort_order');
    return ok(data, error);
  },
  async create(payload: Omit<Exam, 'subjects_count' | 'tricks_count' | 'created_at' | 'updated_at'>): Promise<Exam> {
    const { data, error } = await supabase.from('exams').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<Exam>): Promise<Exam> {
    const { data, error } = await supabase.from('exams').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Subjects ─────────────────────────────────────────────────

export const subjectsApi = {
  async list(): Promise<Subject[]> {
    const { data, error } = await supabase.from('subjects').select('*').order('sort_order');
    return ok(data, error);
  },
  async create(payload: Omit<Subject, 'chapters_count' | 'created_at' | 'updated_at'>): Promise<Subject> {
    const { data, error } = await supabase.from('subjects').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<Subject>): Promise<Subject> {
    const { data, error } = await supabase.from('subjects').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Chapters ─────────────────────────────────────────────────

export const chaptersApi = {
  async list(): Promise<Chapter[]> {
    const { data, error } = await supabase.from('chapters').select('*').order('sort_order');
    return ok(data, error);
  },
  async create(payload: Omit<Chapter, 'tricks_count' | 'created_at' | 'updated_at'>): Promise<Chapter> {
    const { data, error } = await supabase.from('chapters').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<Chapter>): Promise<Chapter> {
    const { data, error } = await supabase.from('chapters').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Topics ───────────────────────────────────────────────────

export const topicsApi = {
  async list(): Promise<Topic[]> {
    const { data, error } = await supabase.from('topics').select('*').order('sort_order');
    return ok(data, error);
  },
  async create(payload: Omit<Topic, 'tricks_count' | 'created_at' | 'updated_at'>): Promise<Topic> {
    const { data, error } = await supabase.from('topics').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<Topic>): Promise<Topic> {
    const { data, error } = await supabase.from('topics').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('topics').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Tricks ───────────────────────────────────────────────────

export const tricksApi = {
  async list(): Promise<Trick[]> {
    const { data, error } = await supabase.from('tricks_english').select('*').order('sort_order');
    return ok(data, error);
  },
  async create(payload: Omit<Trick, 'created_at' | 'updated_at'>): Promise<Trick> {
    const { data, error } = await supabase.from('tricks_english').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<Trick>): Promise<Trick> {
    const { data, error } = await supabase.from('tricks_english').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tricks_english').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

export const tricksHindiApi = {
  async list(): Promise<Trick[]> {
    const { data, error } = await supabase.from('tricks_hindi').select('*').order('sort_order');
    return ok(data, error);
  },
  async create(payload: Omit<Trick, 'created_at' | 'updated_at'>): Promise<Trick> {
    const { data, error } = await supabase.from('tricks_hindi').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<Trick>): Promise<Trick> {
    const { data, error } = await supabase.from('tricks_hindi').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tricks_hindi').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Short Notes ──────────────────────────────────────────────

export const notesApi = {
  async list(): Promise<ShortNote[]> {
    const { data, error } = await supabase.from('short_notes').select('*').order('sort_order');
    return ok(data, error);
  },
  async create(payload: Omit<ShortNote, 'created_at'>): Promise<ShortNote> {
    const { data, error } = await supabase.from('short_notes').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<ShortNote>): Promise<ShortNote> {
    const { data, error } = await supabase.from('short_notes').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('short_notes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Exam News ────────────────────────────────────────────────

export const newsApi = {
  async list(): Promise<ExamNews[]> {
    const { data, error } = await supabase.from('exam_news').select('*').order('created_at', { ascending: false });
    return ok(data, error);
  },
  async create(payload: Omit<ExamNews, 'created_at' | 'updated_at'>): Promise<ExamNews> {
    const { data, error } = await supabase.from('exam_news').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<ExamNews>): Promise<ExamNews> {
    const { data, error } = await supabase.from('exam_news').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('exam_news').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Users ────────────────────────────────────────────────────

export const usersApi = {
  async list(): Promise<UserProfile[]> {
    const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
    return ok(data, error);
  },
  async update(id: string, payload: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase.from('user_profiles').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
};

// ─── Ratings ──────────────────────────────────────────────────

export const ratingsApi = {
  async list(): Promise<TrickRating[]> {
    const { data, error } = await supabase.from('trick_ratings').select('*').order('total_ratings', { ascending: false });
    return ok(data, error);
  },
};

// ─── Issues ───────────────────────────────────────────────────

export const issuesApi = {
  async list(): Promise<SupportIssue[]> {
    const { data, error } = await supabase.from('support_issues').select('*').order('created_at', { ascending: false });
    return ok(data, error);
  },
  async create(payload: Omit<SupportIssue, 'id' | 'created_at' | 'updated_at'>): Promise<SupportIssue> {
    const { data, error } = await supabase.from('support_issues').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<SupportIssue>): Promise<SupportIssue> {
    const updates = { ...payload };
    if (payload.status === 'resolved' && !payload.resolved_at) {
      (updates as any).resolved_at = new Date().toISOString();
    }
    const { data, error } = await supabase.from('support_issues').update(updates).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('support_issues').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Notifications ────────────────────────────────────────────

export const notificationsApi = {
  async list(): Promise<PushNotification[]> {
    const { data, error } = await supabase.from('push_notifications').select('*').order('scheduled_at', { ascending: false });
    return ok(data, error);
  },
  async create(payload: Omit<PushNotification, 'id' | 'sent_at' | 'recipient_count' | 'created_at' | 'updated_at'>): Promise<PushNotification> {
    const { data, error } = await supabase.from('push_notifications').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<PushNotification>): Promise<PushNotification> {
    const { data, error } = await supabase.from('push_notifications').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('push_notifications').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Trick of Day ─────────────────────────────────────────────

export const trickOfDayApi = {
  async list(): Promise<TrickOfDay[]> {
    const { data, error } = await supabase.from('trick_of_day').select('*').order('date', { ascending: false });
    return ok(data, error);
  },
  async create(trickId: string, date: string, note?: string, accent?: string): Promise<TrickOfDay> {
    const id = `tod-${date.replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7)}`;
    const { data, error } = await supabase
      .from('trick_of_day')
      .insert({ id, trick_id: trickId, date, note: note ?? null, accent: accent ?? 'gold' })
      .select().single();
    return ok(data, error);
  },
  async update(id: string, trickId: string, note?: string, accent?: string): Promise<void> {
    const { error } = await supabase
      .from('trick_of_day')
      .update({ trick_id: trickId, note: note ?? null, accent: accent ?? 'gold' })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },
  async upsert(trickId: string, date: string, note?: string, accent?: string): Promise<TrickOfDay> {
    return trickOfDayApi.create(trickId, date, note, accent);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('trick_of_day').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Pricing ──────────────────────────────────────────────────

export const pricingApi = {
  async list(): Promise<ExamPricing[]> {
    const { data, error } = await supabase.from('exam_pricing').select('*');
    return ok(data, error);
  },
  async upsert(examId: string, monthly: number, sixmonths: number, yearly: number, discountPercent = 0): Promise<ExamPricing> {
    const { data, error } = await supabase
      .from('exam_pricing')
      .upsert({ exam_id: examId, monthly, sixmonths, yearly, discount_percent: discountPercent }, { onConflict: 'exam_id' })
      .select().single();
    return ok(data, error);
  },
};

// ─── App Settings (About) ─────────────────────────────────────

export const aboutApi = {
  async get(): Promise<AppSettings> {
    const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    return ok(data, error);
  },
  async update(payload: Partial<Omit<AppSettings, 'id' | 'updated_at'>>): Promise<AppSettings> {
    const { data, error } = await supabase.from('app_settings').update(payload).eq('id', 1).select().single();
    return ok(data, error);
  },
};

// ─── Subscriptions ────────────────────────────────────────────

import type { Subscription } from './adminApiTypes';

export const subscriptionsApi = {
  async list(): Promise<Subscription[]> {
    const { data, error } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
    return ok(data, error);
  },
};

// ─── Analytics ────────────────────────────────────────────────

export const analyticsApi = {
  async contentStats() {
    const { data, error } = await supabase.from('v_content_stats' as any).select('*').single();
    return ok(data, error);
  },
  async userStats() {
    const { data, error } = await supabase.from('v_user_stats' as any).select('*').single();
    return ok(data, error);
  },
  async revenueByExam() {
    const { data, error } = await supabase.from('v_revenue_by_exam' as any).select('*');
    return ok(data, error);
  },
};

// ─── Auto-sync counts (keeps DB values aligned with actual data) ──────

export async function syncAllCounts(data: {
  exams: import('./adminApiTypes').Exam[];
  subjects: import('./adminApiTypes').Subject[];
  chapters: import('./adminApiTypes').Chapter[];
  topics: import('./adminApiTypes').Topic[];
  tricks: import('./adminApiTypes').Trick[];
}): Promise<void> {
  const updates: PromiseLike<unknown>[] = [];

  for (const topic of data.topics) {
    const count = data.tricks.filter(t => t.topic_id === topic.id).length;
    if (count !== topic.tricks_count) {
      updates.push(supabase.from('topics').update({ tricks_count: count }).eq('id', topic.id).then(() => {}));
    }
  }

  for (const chapter of data.chapters) {
    const topicIds = data.topics.filter(t => t.chapter_id === chapter.id).map(t => t.id);
    const count = data.tricks.filter(t => topicIds.includes(t.topic_id)).length;
    if (count !== chapter.tricks_count) {
      updates.push(supabase.from('chapters').update({ tricks_count: count }).eq('id', chapter.id).then(() => {}));
    }
  }

  for (const subject of data.subjects) {
    const count = data.chapters.filter(c => c.subject_id === subject.id).length;
    if (count !== subject.chapters_count) {
      updates.push(supabase.from('subjects').update({ chapters_count: count }).eq('id', subject.id).then(() => {}));
    }
  }

  for (const exam of data.exams) {
    const subjectIds  = data.subjects.filter(s => s.exam_id === exam.id).map(s => s.id);
    const chapterIds  = data.chapters.filter(c => subjectIds.includes(c.subject_id)).map(c => c.id);
    const topicIds    = data.topics.filter(t => chapterIds.includes(t.chapter_id)).map(t => t.id);
    const subCount    = subjectIds.length;
    const trickCount  = data.tricks.filter(t => topicIds.includes(t.topic_id)).length;
    if (subCount !== exam.subjects_count || trickCount !== exam.tricks_count) {
      updates.push(supabase.from('exams').update({ subjects_count: subCount, tricks_count: trickCount }).eq('id', exam.id).then(() => {}));
    }
  }

  await Promise.allSettled(updates);
}

// ─── Mock Questions ───────────────────────────────────────────

import type { MockQuestion } from './adminApiTypes';

export const mockQuestionsApi = {
  async list(): Promise<MockQuestion[]> {
    const { data, error } = await supabase.from('mock_questions').select('*').order('exam_id').order('sort_order');
    return ok(data, error);
  },
  async create(q: Omit<MockQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<MockQuestion> {
    const { data, error } = await supabase.from('mock_questions').insert(q).select().single();
    return ok(data, error);
  },
  async update(id: string, q: Partial<Omit<MockQuestion, 'id' | 'created_at' | 'updated_at'>>): Promise<MockQuestion> {
    const { data, error } = await supabase.from('mock_questions').update(q).eq('id', id).select().single();
    return ok(data, error);
  },
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('mock_questions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Topic Maps ───────────────────────────────────────────────

import type { TopicMap } from './adminApiTypes';

export const mapsApi = {
  async list(): Promise<TopicMap[]> {
    const { data, error } = await supabase.from('topic_maps').select('*').order('topic_id').order('sort_order');
    return ok(data, error);
  },
  async listByTopic(topicId: string): Promise<TopicMap[]> {
    const { data, error } = await supabase.from('topic_maps').select('*').eq('topic_id', topicId).order('sort_order');
    return ok(data, error);
  },
  async create(payload: Omit<TopicMap, 'id' | 'created_at'>): Promise<TopicMap> {
    const { data, error } = await supabase.from('topic_maps').insert(payload).select().single();
    return ok(data, error);
  },
  async update(id: string, payload: Partial<Omit<TopicMap, 'id' | 'created_at'>>): Promise<TopicMap> {
    const { data, error } = await supabase.from('topic_maps').update(payload).eq('id', id).select().single();
    return ok(data, error);
  },
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('topic_maps').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ─── Storage ──────────────────────────────────────────────────

const BUCKET = 'krackit-assets';

async function ensureBucket() {
  await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 10485760 }).catch(() => {});
}

async function uploadFile(folder: string, file: File): Promise<string> {
  await ensureBucket();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    if (error.message.toLowerCase().includes('bucket') || error.message.toLowerCase().includes('not found')) {
      throw new Error('Storage bucket not found. Go to Supabase Dashboard → Storage and create a public bucket named "krackit-assets".');
    }
    throw new Error(error.message);
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const storageApi = {
  uploadMapImage:  (file: File) => uploadFile('maps', file),
  uploadExamImage: (file: File) => uploadFile('exams', file),

  async deleteByUrl(publicUrl: string): Promise<void> {
    // Extract the path segment after the bucket name
    const marker = `/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const path = publicUrl.slice(idx + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  },
};

// ─── Load everything in one shot (replaces loadStore()) ──────

export async function loadAdminData() {
  const [
    exams, subjects, chapters, topics, tricks, tricksHindi, notes, news,
    users, ratings, issues, notifications, trickOfDay, pricing, about, mockQuestions, subscriptions, maps,
  ] = await Promise.all([
    examsApi.list(),
    subjectsApi.list(),
    chaptersApi.list(),
    topicsApi.list(),
    tricksApi.list(),
    tricksHindiApi.list().catch(() => [] as Trick[]),
    notesApi.list(),
    newsApi.list(),
    usersApi.list(),
    ratingsApi.list(),
    issuesApi.list(),
    notificationsApi.list(),
    trickOfDayApi.list(),
    pricingApi.list(),
    aboutApi.get(),
    mockQuestionsApi.list().catch(() => [] as MockQuestion[]),
    subscriptionsApi.list().catch(() => [] as Subscription[]),
    mapsApi.list().catch(() => [] as TopicMap[]),
  ]);
  return { exams, subjects, chapters, topics, tricks, tricksHindi, notes, news, users, ratings, issues, notifications, trickOfDay, pricing, about, mockQuestions, subscriptions, maps };
}
