// ============================================================
// Content API — Exams, Subjects, Chapters, Topics, Tricks,
//               ShortNotes, ExamNews
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type {
  Exam, Subject, Chapter, Topic, Trick, ShortNote, ExamNews,
  CreateExam, UpdateExam, CreateSubject, UpdateSubject,
  CreateChapter, UpdateChapter, CreateTopic, UpdateTopic,
  CreateTrick, UpdateTrick, CreateShortNote, CreateExamNews, UpdateExamNews,
} from '../types';

// ─── EXAMS ───────────────────────────────────────────────────

export function examApi(sb: KrackitClient) {
  return {
    async list(): Promise<Exam[]> {
      const { data, error } = await sb
        .from('exams')
        .select('*')
        .order('sort_order');
      return assertOk(data, error);
    },

    async get(id: string): Promise<Exam> {
      const { data, error } = await sb
        .from('exams')
        .select('*')
        .eq('id', id)
        .single();
      return assertOk(data, error);
    },

    async create(payload: CreateExam): Promise<Exam> {
      const { data, error } = await sb
        .from('exams')
        .insert(payload)
        .select()
        .single();
      return assertOk(data, error);
    },

    async update(id: string, payload: UpdateExam): Promise<Exam> {
      const { data, error } = await sb
        .from('exams')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      return assertOk(data, error);
    },

    async delete(id: string): Promise<void> {
      const { error } = await sb.from('exams').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}

// ─── SUBJECTS ────────────────────────────────────────────────

export function subjectApi(sb: KrackitClient) {
  return {
    async list(examId?: string): Promise<Subject[]> {
      let q = sb.from('subjects').select('*').order('sort_order');
      if (examId) q = q.eq('exam_id', examId);
      const { data, error } = await q;
      return assertOk(data, error);
    },

    async get(id: string): Promise<Subject> {
      const { data, error } = await sb
        .from('subjects').select('*').eq('id', id).single();
      return assertOk(data, error);
    },

    async create(payload: CreateSubject): Promise<Subject> {
      const { data, error } = await sb
        .from('subjects').insert(payload).select().single();
      return assertOk(data, error);
    },

    async update(id: string, payload: UpdateSubject): Promise<Subject> {
      const { data, error } = await sb
        .from('subjects').update(payload).eq('id', id).select().single();
      return assertOk(data, error);
    },

    async delete(id: string): Promise<void> {
      const { error } = await sb.from('subjects').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}

// ─── CHAPTERS ────────────────────────────────────────────────

export function chapterApi(sb: KrackitClient) {
  return {
    async list(subjectId?: string): Promise<Chapter[]> {
      let q = sb.from('chapters').select('*').order('sort_order');
      if (subjectId) q = q.eq('subject_id', subjectId);
      const { data, error } = await q;
      return assertOk(data, error);
    },

    async get(id: string): Promise<Chapter> {
      const { data, error } = await sb
        .from('chapters').select('*').eq('id', id).single();
      return assertOk(data, error);
    },

    async create(payload: CreateChapter): Promise<Chapter> {
      const { data, error } = await sb
        .from('chapters').insert(payload).select().single();
      return assertOk(data, error);
    },

    async update(id: string, payload: UpdateChapter): Promise<Chapter> {
      const { data, error } = await sb
        .from('chapters').update(payload).eq('id', id).select().single();
      return assertOk(data, error);
    },

    async delete(id: string): Promise<void> {
      const { error } = await sb.from('chapters').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}

// ─── TOPICS ──────────────────────────────────────────────────

export function topicApi(sb: KrackitClient) {
  return {
    async list(chapterId?: string): Promise<Topic[]> {
      let q = sb.from('topics').select('*').order('sort_order');
      if (chapterId) q = q.eq('chapter_id', chapterId);
      const { data, error } = await q;
      return assertOk(data, error);
    },

    async get(id: string): Promise<Topic> {
      const { data, error } = await sb
        .from('topics').select('*').eq('id', id).single();
      return assertOk(data, error);
    },

    async create(payload: CreateTopic): Promise<Topic> {
      const { data, error } = await sb
        .from('topics').insert(payload).select().single();
      return assertOk(data, error);
    },

    async update(id: string, payload: UpdateTopic): Promise<Topic> {
      const { data, error } = await sb
        .from('topics').update(payload).eq('id', id).select().single();
      return assertOk(data, error);
    },

    async delete(id: string): Promise<void> {
      const { error } = await sb.from('topics').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}

// ─── TRICKS ──────────────────────────────────────────────────

export function trickApi(sb: KrackitClient) {
  return {
    async list(topicId?: string, difficulty?: string): Promise<Trick[]> {
      let q = sb.from('tricks').select('*').order('sort_order');
      if (topicId) q = q.eq('topic_id', topicId);
      if (difficulty) q = q.eq('difficulty', difficulty);
      const { data, error } = await q;
      return assertOk(data, error);
    },

    async get(id: string): Promise<Trick> {
      const { data, error } = await sb
        .from('tricks').select('*').eq('id', id).single();
      return assertOk(data, error);
    },

    async search(query: string, limit = 20): Promise<(Trick & { rank: number })[]> {
      const { data, error } = await sb
        .rpc('search_tricks', { query, lim: limit });
      return assertOk(data, error) as (Trick & { rank: number })[];
    },

    async create(payload: CreateTrick): Promise<Trick> {
      const { data, error } = await sb
        .from('tricks').insert(payload).select().single();
      return assertOk(data, error);
    },

    async update(id: string, payload: UpdateTrick): Promise<Trick> {
      const { data, error } = await sb
        .from('tricks').update(payload).eq('id', id).select().single();
      return assertOk(data, error);
    },

    async delete(id: string): Promise<void> {
      const { error } = await sb.from('tricks').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}

// ─── SHORT NOTES ─────────────────────────────────────────────

export function shortNoteApi(sb: KrackitClient) {
  return {
    async list(topicId?: string): Promise<ShortNote[]> {
      let q = sb.from('short_notes').select('*').order('sort_order');
      if (topicId) q = q.eq('topic_id', topicId);
      const { data, error } = await q;
      return assertOk(data, error);
    },

    async create(payload: CreateShortNote): Promise<ShortNote> {
      const { data, error } = await sb
        .from('short_notes').insert(payload).select().single();
      return assertOk(data, error);
    },

    async update(id: string, payload: Partial<CreateShortNote>): Promise<ShortNote> {
      const { data, error } = await sb
        .from('short_notes').update(payload).eq('id', id).select().single();
      return assertOk(data, error);
    },

    async delete(id: string): Promise<void> {
      const { error } = await sb.from('short_notes').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}

// ─── EXAM NEWS ───────────────────────────────────────────────

export function examNewsApi(sb: KrackitClient) {
  return {
    async list(examId?: string): Promise<ExamNews[]> {
      let q = sb.from('exam_news').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (examId) q = q.eq('exam_id', examId);
      const { data, error } = await q;
      return assertOk(data, error);
    },

    async create(payload: CreateExamNews): Promise<ExamNews> {
      const { data, error } = await sb
        .from('exam_news').insert(payload).select().single();
      return assertOk(data, error);
    },

    async update(id: string, payload: UpdateExamNews): Promise<ExamNews> {
      const { data, error } = await sb
        .from('exam_news').update(payload).eq('id', id).select().single();
      return assertOk(data, error);
    },

    async delete(id: string): Promise<void> {
      const { error } = await sb.from('exam_news').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}

// ─── FULL CONTENT LOADER (mobile — one shot) ─────────────────
// Fetches the entire content hierarchy in parallel for offline caching.

export async function loadAllContent(sb: KrackitClient) {
  const [exams, subjects, chapters, topics, tricks, notes, news] = await Promise.all([
    sb.from('exams').select('*').order('sort_order').then(r => assertOk(r.data, r.error)),
    sb.from('subjects').select('*').order('sort_order').then(r => assertOk(r.data, r.error)),
    sb.from('chapters').select('*').order('sort_order').then(r => assertOk(r.data, r.error)),
    sb.from('topics').select('*').order('sort_order').then(r => assertOk(r.data, r.error)),
    sb.from('tricks').select('*').order('sort_order').then(r => assertOk(r.data, r.error)),
    sb.from('short_notes').select('*').order('sort_order').then(r => assertOk(r.data, r.error)),
    sb.from('exam_news').select('*').eq('is_active', true).order('created_at', { ascending: false }).then(r => assertOk(r.data, r.error)),
  ]);
  return { exams, subjects, chapters, topics, tricks, notes, news };
}
