import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { contentApi, mapsApi, mobileAuth, mockTestApi } from './mobileApi';
import type {
  Exam as DbExam, Subject as DbSubject, Chapter as DbChapter,
  Topic as DbTopic, Trick as DbTrick, ShortNote as DbNote, ExamNews as DbNews,
  ExamPricing, TopicMap as DbTopicMap,
} from './mobileApi';
import type { Exam, Subject, Chapter, Topic, Trick, ShortNote, ExamNews, TopicMap } from './krackit-data';
import { autoTranslateBatch, getCachedTranslation } from './auto-translate';

// ── Mapping: DB snake_case → UI camelCase ──────────────────────

export function mapExam(d: DbExam): Exam {
  return {
    id: d.id, name: d.name, short: d.short, description: d.description ?? '',
    subjects: d.subjects_count, tricks: d.tricks_count, accent: d.accent,
    examDate: d.exam_date ?? undefined,
    medium: (d.medium === 'hindi' ? 'hindi' : 'english') as 'hindi' | 'english',
    imageUrl: d.image_url ?? undefined,
  };
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
export function mapTopicMap(d: DbTopicMap): TopicMap {
  return { id: d.id, topicId: d.topic_id, title: d.title, imageUrl: d.image_url, sortOrder: d.sort_order };
}

// ── Trick-of-day entry (includes accent + note set by admin) ──

export type TrickOfDayEntry = {
  trick: Trick;
  note: string | null;
  accent: string; // e.g. 'gold' | 'rose' | 'emerald' | 'sky' | 'violet' | 'cyan'
};

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
  tricksOfDay: TrickOfDayEntry[];
  maps: TopicMap[];
  loaded: boolean;
  offline: boolean;
  translating: boolean;
  // translate(text) → Hindi (or original) based on active medium
  translate: (text: string) => string;
  // Call when user opens an exam with a given medium preference
  setExamMedium: (medium: string, examId: string) => void;
};

const EMPTY: ContentData = {
  exams: [], subjects: [], chapters: [], topics: [], tricks: [],
  shortNotes: [], examNews: [], pricing: [], tricksOfDay: [], maps: [],
  loaded: false, offline: false, translating: false,
  translate: (t) => t,
  setExamMedium: () => {},
};

const DataContext = createContext<ContentData>(EMPTY);

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Omit<ContentData, 'translate' | 'setExamMedium' | 'translating'>>(EMPTY);
  const [tricksHindi, setTricksHindi] = useState<Trick[]>([]);
  const hindiTricksLoaded = useRef(false);
  // transMap: text → translated text for the active medium
  const [transMap, setTransMap] = useState<Record<string, string>>({});
  const [activeMedium, setActiveMedium] = useState('english');
  const [translating, setTranslating] = useState(false);
  // track last translated (medium + examId) to avoid repeat work
  const lastTranslated = useRef('');

  const refreshTricksOfDay = () => {
    contentApi.getTricksOfDay().then((tod) => {
      setData((prev) => ({
        ...prev,
        tricksOfDay: tod.map((t) => ({
          trick: mapTrick(t.trick),
          note: t.note,
          accent: t.accent ?? 'gold',
        })),
      }));
    }).catch(() => {});
  };

  const loadData = () => {
    if (!navigator.onLine) {
      setData((d) => ({ ...d, loaded: true, offline: true }));
      return;
    }
    contentApi.loadAll().then((content) => {
      const basePart = {
        exams:      content.exams.map(mapExam),
        subjects:   content.subjects.map(mapSubject),
        chapters:   content.chapters.map(mapChapter),
        topics:     content.topics.map(mapTopic),
        tricks:     content.tricks.map(mapTrick),
        shortNotes: content.notes.map(mapNote),
        examNews:   content.news.map(mapNews),
        pricing:    content.pricing,
      };
      const todPromise = contentApi.getTricksOfDay().catch(() => []);
      const mapsPromise = mapsApi.loadAll().catch(() => [] as DbTopicMap[]);
      Promise.all([todPromise, mapsPromise]).then(([tod, rawMaps]) => {
        setData({
          ...basePart,
          maps:        rawMaps.map(mapTopicMap),
          tricksOfDay: tod.map((t) => ({
            trick: mapTrick(t.trick),
            note: t.note,
            accent: t.accent ?? 'gold',
          })),
          loaded: true,
          offline: false,
        });
      }).catch(() => {
        setData((d) => ({ ...d, ...basePart, loaded: true }));
      });
    }).catch((err) => {
      console.error('[DataContext] Failed to load content:', err);
      setData((d) => ({ ...d, loaded: true, offline: !navigator.onLine }));
    });
  };

  useEffect(() => {
    loadData();

    const handleOnline = () => {
      setData((d) => ({ ...d, offline: false }));
      loadData();
    };
    const handleOffline = () => setData((d) => ({ ...d, offline: true }));

    // Refresh tricks-of-day whenever app comes back into focus
    // so admin-scheduled tricks appear without a full reload
    const handleVisibility = () => {
      if (!document.hidden) refreshTricksOfDay();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibility);

    const { data: { subscription } } = mobileAuth.onAuthChange(async (event) => {
      if (event === 'SIGNED_IN') loadData();
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // translate: sync lookup — returns cached translation or original text
  const translate = useCallback((text: string): string => {
    if (activeMedium === 'english' || !text) return text;
    return transMap[text] ?? getCachedTranslation(text, activeMedium) ?? text;
  }, [activeMedium, transMap]);

  // setExamMedium: called by routes when user opens an exam with a medium preference
  const setExamMedium = useCallback((medium: string, examId: string) => {
    const key = `${medium}:${examId}`;
    if (medium === 'english') { setActiveMedium('english'); setTransMap({}); return; }
    setActiveMedium(medium);
    // Lazily load Hindi tricks on first Hindi selection
    if (medium === 'hindi' && !hindiTricksLoaded.current) {
      hindiTricksLoaded.current = true;
      contentApi.loadHindiTricks().then((ht) => {
        setTricksHindi(ht.map(mapTrick));
      }).catch(() => {});
    }
    if (lastTranslated.current === key) return; // already done
    lastTranslated.current = key;

    // Collect all text that belongs to this exam
    const examSubjectIds = data.subjects.filter(s => s.examId === examId).map(s => s.id);
    const examChapterIds = data.chapters.filter(c => examSubjectIds.includes(c.subjectId)).map(c => c.id);
    const examTopicIds   = data.topics.filter(t => examChapterIds.includes(t.chapterId)).map(t => t.id);

    const texts: string[] = [];
    data.subjects.filter(s => s.examId === examId).forEach(s => texts.push(s.name));
    data.chapters.filter(c => examSubjectIds.includes(c.subjectId)).forEach(c => texts.push(c.name));
    data.topics.filter(t => examChapterIds.includes(t.chapterId)).forEach(t => texts.push(t.name));
    data.shortNotes.filter(n => examTopicIds.includes(n.topicId)).forEach(n => {
      texts.push(n.title, n.content);
    });

    setTranslating(true);
    mockTestApi.getQuestions(examId)
      .then((qs) => {
        qs.forEach(q => {
          texts.push(q.question, q.option_a, q.option_b, q.option_c, q.option_d);
          if (q.explanation) texts.push(q.explanation);
        });
      })
      .catch(() => {})
      .then(() => autoTranslateBatch(texts, medium))
      .then((map) => {
        setTransMap(prev => ({ ...prev, ...map }));
        setTranslating(false);
      })
      .catch(() => setTranslating(false));
  }, [data]);

  // Switch tricks source based on active medium
  const tricks = activeMedium === 'hindi' ? tricksHindi : data.tricks;

  const ctx: ContentData = {
    ...data, tricks, translating, translate, setExamMedium,
  };

  return <DataContext.Provider value={ctx}>{children}</DataContext.Provider>;
}
