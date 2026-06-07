import * as XLSX from "xlsx";
import type { Store } from "./data";

type Row = Record<string, string | number | boolean | undefined>;

function toSheet(data: Row[]): XLSX.WorkSheet {
  if (!data.length) return XLSX.utils.aoa_to_sheet([]);
  return XLSX.utils.json_to_sheet(data);
}

function fromSheet<T>(ws: XLSX.WorkSheet | undefined): T[] {
  if (!ws) return [];
  return (XLSX.utils.sheet_to_json(ws) as T[]);
}

export function exportExcel(store: Store): void {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, toSheet(store.exams.map((e) => ({
    id: e.id, name: e.name, short: e.short, description: e.description,
    subjects: e.subjects, tricks: e.tricks, accent: e.accent,
  }))), "Exams");

  XLSX.utils.book_append_sheet(wb, toSheet(store.subjects.map((s) => ({
    id: s.id, name: s.name, icon: s.icon, chapters: s.chapters,
    examId: s.examId, color: s.color,
  }))), "Subjects");

  XLSX.utils.book_append_sheet(wb, toSheet(store.chapters.map((c) => ({
    id: c.id, name: c.name, subjectId: c.subjectId,
    tricksCount: c.tricksCount, progress: c.progress, icon: c.icon ?? "",
  }))), "Chapters");

  XLSX.utils.book_append_sheet(wb, toSheet(store.topics.map((t) => ({
    id: t.id, name: t.name, chapterId: t.chapterId,
    tricksCount: t.tricksCount, icon: t.icon ?? "",
  }))), "Topics");

  XLSX.utils.book_append_sheet(wb, toSheet(store.tricks.map((t) => ({
    id: t.id, title: t.title, content: t.content, explanation: t.explanation,
    difficulty: t.difficulty, subject: t.subject, topic: t.topic,
  }))), "Tricks");

  XLSX.utils.book_append_sheet(wb, toSheet(store.notes.map((n) => ({
    id: n.id, topicId: n.topicId, title: n.title,
    content: n.content, isCustom: n.isCustom ? 1 : 0,
  }))), "ShortNotes");

  XLSX.utils.book_append_sheet(wb, toSheet(store.news.map((n) => ({
    id: n.id, exam: n.exam, title: n.title, date: n.date,
    tag: n.tag, accent: n.accent,
  }))), "ExamNews");

  XLSX.utils.book_append_sheet(wb, toSheet(store.users.map((u) => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone,
    joinedAt: u.joinedAt, tier: u.tier,
    subscribedExams: u.subscribedExams.join(","),
    subscriptionExpiry: u.subscriptionExpiry ?? "",
    billingCycle: u.billingCycle ?? "",
    lastActiveAt: u.lastActiveAt, tricksLearned: u.tricksLearned, streak: u.streak,
  }))), "Users");

  XLSX.utils.book_append_sheet(wb, toSheet(store.ratings.map((r) => ({
    trickId: r.trickId, avgRating: r.avgRating, totalRatings: r.totalRatings,
    star1: r.dist[0], star2: r.dist[1], star3: r.dist[2], star4: r.dist[3], star5: r.dist[4],
  }))), "Ratings");

  XLSX.utils.book_append_sheet(wb, toSheet(store.issues.map((i) => ({
    id: i.id, userId: i.userId, userName: i.userName, userEmail: i.userEmail,
    subject: i.subject, message: i.message, status: i.status,
    priority: i.priority, createdAt: i.createdAt, resolvedAt: i.resolvedAt ?? "",
  }))), "Issues");

  XLSX.utils.book_append_sheet(wb, toSheet(store.notifications.map((n) => ({
    id: n.id, title: n.title, body: n.body, type: n.type,
    target: n.target, targetExamId: n.targetExamId ?? "",
    scheduledAt: n.scheduledAt, status: n.status,
  }))), "Notifications");

  XLSX.utils.book_append_sheet(wb, toSheet(store.trickOfDay.map((t) => ({
    id: t.id, trickId: t.trickId, date: t.date, note: t.note ?? "",
  }))), "TrickOfDay");

  XLSX.utils.book_append_sheet(wb, toSheet(store.pricing.map((p) => ({
    examId: p.examId, monthly: p.monthly, sixmonths: p.sixmonths, yearly: p.yearly,
  }))), "Pricing");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
    appName: store.about.appName, tagline: store.about.tagline,
    version: store.about.version, description: store.about.description,
    supportEmail: store.about.supportEmail, websiteUrl: store.about.websiteUrl,
    privacyUrl: store.about.privacyUrl, termsUrl: store.about.termsUrl,
    playStoreUrl: store.about.playStoreUrl, appStoreUrl: store.about.appStoreUrl,
    teamMembers: JSON.stringify(store.about.teamMembers),
    socialLinks: JSON.stringify(store.about.socialLinks),
  }]), "About");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `krackit-data-${date}.xlsx`);
}

type RawUser = {
  id: string; name: string; email: string; phone: string;
  joinedAt: string; tier: string; subscribedExams: string;
  subscriptionExpiry: string; billingCycle: string;
  lastActiveAt: string; tricksLearned: number; streak: number;
};
type RawRating = { trickId: string; avgRating: number; totalRatings: number; star1: number; star2: number; star3: number; star4: number; star5: number };

export function importExcel(file: File): Promise<Partial<Store>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });

        const get = (name: string) => wb.Sheets[name];

        const rawUsers = fromSheet<RawUser>(get("Users"));

        const result: Partial<Store> = {
          exams:     fromSheet(get("Exams")),
          subjects:  fromSheet(get("Subjects")),
          chapters:  fromSheet(get("Chapters")),
          topics:    fromSheet(get("Topics")),
          tricks:    fromSheet(get("Tricks")),
          notes:     fromSheet(get("ShortNotes")),
          news:      fromSheet(get("ExamNews")),
          users: rawUsers.map((u) => ({
            ...u,
            subscribedExams: u.subscribedExams ? u.subscribedExams.split(",").filter(Boolean) : [],
            subscriptionExpiry: u.subscriptionExpiry || undefined,
            billingCycle: (u.billingCycle || undefined) as Store["users"][0]["billingCycle"],
            tier: u.tier as Store["users"][0]["tier"],
          })),
          ratings: fromSheet<RawRating>(get("Ratings")).map((r) => ({
            trickId: r.trickId,
            avgRating: r.avgRating,
            totalRatings: r.totalRatings,
            dist: [r.star1, r.star2, r.star3, r.star4, r.star5] as [number, number, number, number, number],
          })),
          issues:        fromSheet(get("Issues")),
          notifications: fromSheet(get("Notifications")),
          trickOfDay:    fromSheet(get("TrickOfDay")),
          pricing:       fromSheet(get("Pricing")),
        };

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
