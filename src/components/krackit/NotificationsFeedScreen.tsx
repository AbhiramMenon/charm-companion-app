import { ArrowLeft, Bell, BellOff, CalendarCheck, FileText, Megaphone, Star, Zap, Lightbulb, Trophy, Clock } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { notificationsApi } from "@/lib/mobileApi";
import type { ExamNews } from "@/lib/krackit-data";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type AlertType = "streak" | "goal" | "achievement" | "reminder" | "tip" | "exam_news";

type AppAlert = {
  id: string;
  type: AlertType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  fromAdmin?: boolean;
};

const STATIC_ALERTS: AppAlert[] = [
  { id: "a1", type: "streak",      title: "Streak at risk! 🔥",       body: "You haven't learned any tricks today. Keep your 12-day streak alive — just 3 tricks needed.", time: "2h ago",    read: false },
  { id: "a2", type: "goal",        title: "Daily goal almost done",    body: "You've learned 2 of 3 tricks today. One more to hit your daily target!",                        time: "4h ago",    read: false },
  { id: "a3", type: "achievement", title: "Achievement unlocked 🏅",   body: "You mastered 'Fundamental Rights' — 100% completion on that chapter!",                          time: "Yesterday", read: true  },
  { id: "a4", type: "tip",         title: "Spaced repetition reminder", body: "You last reviewed 'Mughal Emperors' 3 days ago. Time to revisit and lock it in.",              time: "2 days ago",read: true  },
  { id: "a5", type: "reminder",    title: "UPSC Prelims — 42 days left",body: "You've covered 18% of UPSC topics. Pick up the pace — aim for 2–3 chapters this week.",       time: "3 days ago",read: true  },
];

const tagColors: Record<string, string> = {
  Notification: "text-amber-400 bg-amber-400/10",
  "Admit Card": "text-sky-400 bg-sky-400/10",
  Result: "text-emerald-400 bg-emerald-400/10",
  "Exam Date": "text-rose-400 bg-rose-400/10",
};

const alertIcons: Record<AlertType, React.ElementType> = {
  streak:      Zap,
  goal:        Star,
  achievement: Trophy,
  reminder:    Clock,
  tip:         Lightbulb,
  exam_news:   Megaphone,
};

const alertIconColors: Record<AlertType, string> = {
  streak:      "bg-amber-400/15 text-amber-400",
  goal:        "bg-gold/15 text-gold",
  achievement: "bg-emerald-400/15 text-emerald-400",
  reminder:    "bg-sky-400/15 text-sky-400",
  tip:         "bg-violet-400/15 text-violet-400",
  exam_news:   "bg-rose-400/15 text-rose-400",
};

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch { return "Recently"; }
}

function parseExamBody(body: string): { text: string; tag: string; accent: string } {
  try {
    const p = JSON.parse(body);
    if (p && typeof p === "object" && p.text) {
      return { text: p.text, tag: p.tag ?? "Notification", accent: p.accent ?? "from-amber-500/20 to-amber-900/5" };
    }
  } catch {}
  return { text: body, tag: "Notification", accent: "from-amber-500/20 to-amber-900/5" };
}

export function NotificationsFeedScreen({ onBack }: { onBack: () => void }) {
  const { examNews, exams } = useData();
  const [tab, setTab] = useState<"alerts" | "news">("alerts");
  const [alerts, setAlerts] = useState<AppAlert[]>(STATIC_ALERTS);
  const [adminNews, setAdminNews] = useState<ExamNews[]>([]);

  useEffect(() => {
    notificationsApi.getFeed(50).then((items) => {
      const all = items as any[];
      // Regular alerts (non exam_news type)
      const adminAlerts: AppAlert[] = all
        .filter((n) => n.type !== "exam_news")
        .map((n) => ({
          id: `admin-${n.id}`,
          type: (n.type as AlertType) ?? "tip",
          title: n.title,
          body: n.body,
          time: formatTime(n.sent_at ?? n.scheduled_at ?? ""),
          read: false,
          fromAdmin: true,
        }));
      setAlerts([...adminAlerts, ...STATIC_ALERTS]);

      // Exam news from admin push_notifications
      const examNewsItems: ExamNews[] = all
        .filter((n) => n.type === "exam_news")
        .map((n) => {
          const { text, tag, accent } = parseExamBody(n.body);
          const matchedExam = exams.find((e) => e.id === n.target_exam_id);
          return {
            id: `admin-news-${n.id}`,
            exam: matchedExam?.short ?? "General",
            title: n.title,
            date: formatTime(n.sent_at ?? n.scheduled_at ?? ""),
            tag: tag as ExamNews["tag"],
            accent,
          };
        });
      setAdminNews(examNewsItems);
    }).catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge DB exam_news + admin exam_news (admin news first since they're newest)
  const allNews = useMemo(() => [...adminNews, ...examNews], [adminNews, examNews]);

  const unreadCount = alerts.filter((a) => !a.read).length;
  const markRead = (id: string) => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));

  // Auto-mark all alerts read when screen opens
  useEffect(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-3 pt-6">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          </div>
        </div>

        <div className="mt-4 flex rounded-2xl bg-surface p-1 gap-1">
          {(["alerts", "news"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
                tab === t ? "gold-gradient text-[#1a1410]" : "text-muted-foreground"
              )}
            >
              {t === "alerts" ? <Bell className="h-3.5 w-3.5" /> : <Megaphone className="h-3.5 w-3.5" />}
              {t === "alerts" ? "Alerts" : "Exam News"}
              {t === "alerts" && unreadCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1a1410]/30 px-1 text-[9px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {tab === "alerts" && (
        <div className="space-y-2 px-5 pt-2">
          {alerts.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
              <BellOff className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No alerts right now.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = alertIcons[alert.type] ?? FileText;
              return (
                <button
                  key={alert.id}
                  onClick={() => markRead(alert.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                    alert.read
                      ? "border-border bg-surface opacity-70"
                      : "border-gold/20 bg-linear-to-br from-gold/8 to-surface"
                  )}
                >
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", alertIconColors[alert.type] ?? "bg-surface-2 text-muted-foreground")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className={cn("text-sm font-semibold leading-snug", alert.read ? "text-foreground/70" : "text-foreground")}>
                          {alert.title}
                        </p>
                        {alert.fromAdmin && (
                          <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">Admin</span>
                        )}
                      </div>
                      {!alert.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{alert.body}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground/60">{alert.time}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {tab === "news" && (
        <div className="space-y-3 px-5 pt-2">
          <p className="text-xs text-muted-foreground">Latest updates from exam authorities</p>
          {allNews.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No exam news yet.</p>
            </div>
          ) : (
            allNews.map((n) => (
              <article
                key={n.id}
                className={`rounded-2xl border border-border bg-linear-to-br ${n.accent} p-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-background/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold ring-1 ring-gold/30">
                    {n.exam}
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", tagColors[n.tag] ?? "text-muted-foreground bg-muted")}>
                    {n.tag}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-snug text-foreground">{n.title}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <CalendarCheck className="h-3 w-3" />
                  <span>{n.date}</span>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
