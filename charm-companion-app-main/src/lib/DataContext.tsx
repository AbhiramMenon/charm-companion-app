import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { contentApi } from './mobileApi';
import type {
  Exam as DbExam, Subject as DbSubject, Chapter as DbChapter,
  Topic as DbTopic, Trick as DbTrick, ShortNote as DbNote, ExamNews as DbNews,
  ExamPricing,
} from './mobileApi';
import type { Exam, Subject, Chapter, Topic, Trick, ShortNote, ExamNews } from './krackit-data';

// ── Mapping: DB snake_case → UI camelCase ──────────────────────

export function mapExam(d: DbExam): Exam {
  return { id: d.id, name: d.name, short: d.short, description: d.description ?? '', subjects: d.subjects_count, tricks: d.tricks_count, accent: d.accent };
}
export function mapSubject(d: DbSubject): Subject {
  return { id: d.id, name: d.name, icon: d.icon ?? '', chapters: d.chapters_count, examId: d.exam_id, color: d.color };
}
export function mapChapter(d: DbChapter): Chapter {
  return { id: d.id, name: d.name, subjectId: d.subject_id, tricksCount: d.tricks_count, progress: 0, icon: d.icon ?? undefined };
}
export function mapTopic(d: DbTopic): Topic {
  return { id: d.id, name: d.name, chapterId: d.chapter_id, tricksCount: d.tricks_count, icon: d.icon ?? undefined };
}
export function mapTrick(d: DbTrick): Trick {
  return { id: d.id, title: d.title, content: d.content, explanation: d.explanation, difficulty: d.difficulty, subject: d.subject_tag ?? '', topic: d.topic_id };
}
export function mapNote(d: DbNote): ShortNote {
  return { id: d.id, topicId: d.topic_id, title: d.title, content: d.content, isCustom: d.is_custom };
}
export function mapNews(d: DbNews): ExamNews {
  return { id: d.id, exam: d.exam_id, title: d.title, date: d.date_label ?? '', tag: d.tag as ExamNews['tag'], accent: d.accent ?? '' };
}

// ── Context ────────────────────────────────────────────────────

type ContentData = {
  exams: Exam[];
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  tricks: Trick[];
  shortNotes: ShortNote[];
  examNews: ExamNews[];
  pricing: ExamPricing[];
  tricksOfDay: Trick[];
  loaded: boolean;
};

const EMPTY: ContentData = {
  exams: [], subjects: [], chapters: [], topics: [], tricks: [],
  shortNotes: [], examNews: [], pricing: [], tricksOfDay: [], loaded: false,
};

const DataContext = createContext<ContentData>(EMPTY);

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ContentData>(EMPTY);

  useEffect(() => {
    contentApi.loadAll().then((content) => {
      contentApi.getTricksOfDay().then((tod) => {
        setData({
          exams:       content.exams.map(mapExam),
          subjects:    content.subjects.map(mapSubject),
          chapters:    content.chapters.map(mapChapter),
          topics:      content.topics.map(mapTopic),
          tricks:      content.tricks.map(mapTrick),
          shortNotes:  content.notes.map(mapNote),
          examNews:    content.news.map(mapNews),
          pricing:     content.pricing,
          tricksOfDay: tod.map((t) => mapTrick(t.trick)),
          loaded: true,
        });
      });
    }).catch((err) => {
      console.error('[DataContext] Failed to load content:', err);
      setData((d) => ({ ...d, loaded: true }));
    });
  }, []);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}
