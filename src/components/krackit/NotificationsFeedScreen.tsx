import { ArrowLeft, Bell, BellOff, CalendarCheck, FileText, Megaphone, Star, Zap, Lightbulb, Trophy, Clock } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

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

function loadAdminNotifications(): AppAlert[] {
  try {
    const raw = localStorage.getItem("krackit_admin_store");
    if (!raw) return [];
    const store = JSON.parse(raw) as {
      notifications?: { id: string; title: string; body: string; type: string; status: string; scheduledAt: string }[];
    };
    return (store.notifications ?? [])
      .filter((n) => n.status === "sent")
      .map((n, i) => ({
        id: `admin-${n.id ?? i}`,
        type: (n.type as AlertType) ?? "tip",
        title: n.title,
        body: n.body,
        time: n.scheduledAt?.slice(0, 10) ?? "Recently",
        read: false,
        fromAdmin: true,
      }));
  } catch { return []; }
}

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

export function NotificationsFeedScreen({ onBack }: { onBack: () => void }) {
  const { examNews } = useData();
  const [tab, setTab] = useState<"alerts" | "news">("alerts");
  const adminAlerts = useMemo(loadAdminNotifications, []);
  const [alerts, setAlerts] = useState<AppAlert[]>(() => [...adminAlerts, ...STATIC_ALERTS]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  const markRead = (id: string) => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-3 pt-6">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-medium text-gold">
              Mark all read
            </button>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <p className="mt-0.5 text-sm text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
        </div>

        {/* Tabs */}
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
              const Icon = alertIcons[alert.type];
              return (
                <button
                  key={alert.id}
                  onClick={() => markRead(alert.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                    alert.read
                      ? "border-border bg-surface opacity-70"
                      : "border-gold/20 bg-gradient-to-br from-gold/8 to-surface"
                  )}
                >
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", alertIconColors[alert.type])}>
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
          {examNews.map((n) => (
            <article
              key={n.id}
              className={`rounded-2xl border border-border bg-gradient-to-br ${n.accent} p-4`}
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
          ))}

          {/* Extra placeholder alerts that could come from a real API */}
          {[
            { exam: "CAT", title: "CAT 2026 registration window opens July 31", date: "Jul 31", tag: "Notification" as const, accent: "from-violet-500/20 to-violet-900/5" },
            { exam: "JEE", title: "JEE Advanced 2026 eligibility criteria revised", date: "Aug 05", tag: "Notification" as const, accent: "from-sky-500/20 to-sky-900/5" },
          ].map((n, i) => (
            <article
              key={`extra-${i}`}
              className={`rounded-2xl border border-border bg-gradient-to-br ${n.accent} p-4`}
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
          ))}
        </div>
      )}
    </div>
  );
}
