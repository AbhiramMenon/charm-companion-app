import { BookOpen, BookText, FileText, GraduationCap, Lightbulb, Newspaper, StickyNote, Users, IndianRupee, Star, MessageSquare, Bell, CalendarDays } from "lucide-react";
import type { Store } from "../lib/data";
import type { Page } from "../App";

type CardDef = { label: string; icon: typeof GraduationCap; color: string; page: Page; getValue: (s: Store) => number };

const CONTENT_CARDS: CardDef[] = [
  { label: "Exams",       icon: GraduationCap, color: "text-amber-400 bg-amber-400/10",   page: "exams",    getValue: (s) => s.exams.length    },
  { label: "Subjects",    icon: BookOpen,      color: "text-sky-400 bg-sky-400/10",       page: "subjects", getValue: (s) => s.subjects.length  },
  { label: "Chapters",    icon: BookText,      color: "text-violet-400 bg-violet-400/10", page: "chapters", getValue: (s) => s.chapters.length  },
  { label: "Topics",      icon: FileText,      color: "text-emerald-400 bg-emerald-400/10",page:"topics",   getValue: (s) => s.topics.length    },
  { label: "Tricks",      icon: Lightbulb,     color: "text-[var(--gold)] bg-[var(--gold)]/10", page: "tricks", getValue: (s) => s.tricks.length },
  { label: "Short Notes", icon: StickyNote,    color: "text-rose-400 bg-rose-400/10",     page: "notes",    getValue: (s) => s.notes.length     },
  { label: "Exam News",   icon: Newspaper,     color: "text-cyan-400 bg-cyan-400/10",     page: "news",     getValue: (s) => s.news.length      },
  { label: "Trick of Day",icon: CalendarDays,  color: "text-amber-300 bg-amber-300/10",   page: "trickofday", getValue: (s) => s.trickOfDay.length },
];

const ANALYTICS_CARDS: CardDef[] = [
  { label: "Total Users",   icon: Users,         color: "text-sky-400 bg-sky-400/10",       page: "users",    getValue: (s) => s.users.length         },
  { label: "Subscribed",    icon: IndianRupee,   color: "text-emerald-400 bg-emerald-400/10",page:"revenue",  getValue: (s) => s.users.filter((u) => u.tier !== "Free").length },
  { label: "Rated Tricks",  icon: Star,          color: "text-amber-400 bg-amber-400/10",   page: "ratings",  getValue: (s) => s.ratings.length        },
  { label: "Open Issues",   icon: MessageSquare, color: "text-rose-400 bg-rose-400/10",     page: "issues",   getValue: (s) => s.issues.filter((i) => i.status === "open").length },
  { label: "Notifications", icon: Bell,          color: "text-violet-400 bg-violet-400/10", page: "notifications", getValue: (s) => s.notifications.length },
];

function CardGrid({ cards, store, onNavigate }: { cards: CardDef[]; store: Store; onNavigate: (p: Page) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map(({ label, icon: Icon, color, page, getValue }) => (
        <button
          key={page + label}
          onClick={() => onNavigate(page)}
          className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition-colors hover:border-[var(--gold)]/40 hover:bg-[var(--surface-2)]"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{getValue(store)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export function Dashboard({ store, onNavigate }: { store: Store; onNavigate: (p: Page) => void }) {
  const subscribedRevenue = store.users
    .filter((u) => u.tier !== "Free" && u.billingCycle && u.subscribedExams.length > 0)
    .reduce((sum, u) => {
      const price: Record<string, number> = { monthly: 149, sixmonths: 749, yearly: 1299 };
      return sum + (price[u.billingCycle!] ?? 0) * u.subscribedExams.length;
    }, 0);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">KrackIT admin overview</p>
      </div>

      {/* Quick revenue stat */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1 rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-4">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-[var(--gold)] mt-1">₹{subscribedRevenue.toLocaleString("en-IN")}</p>
          <button onClick={() => onNavigate("revenue")} className="text-[10px] text-[var(--gold)] mt-1 hover:underline">View details →</button>
        </div>
        <div className="col-span-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Open Issues</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{store.issues.filter((i) => i.status === "open").length}</p>
          <button onClick={() => onNavigate("issues")} className="text-[10px] text-rose-400 mt-1 hover:underline">Review now →</button>
        </div>
        <div className="col-span-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Scheduled Notifs</p>
          <p className="text-2xl font-bold text-sky-400 mt-1">{store.notifications.filter((n) => n.status === "scheduled").length}</p>
          <button onClick={() => onNavigate("notifications")} className="text-[10px] text-sky-400 mt-1 hover:underline">Manage →</button>
        </div>
      </div>

      {/* Content */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Content</h2>
        <CardGrid cards={CONTENT_CARDS} store={store} onNavigate={onNavigate} />
      </div>

      {/* Analytics */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Users & Analytics</h2>
        <CardGrid cards={ANALYTICS_CARDS} store={store} onNavigate={onNavigate} />
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Getting started</h2>
        <ul className="space-y-2 text-sm text-[var(--foreground)]/80">
          <li>• Add <strong className="text-[var(--foreground)]">Exams</strong> first — subjects and chapters depend on them.</li>
          <li>• Use <strong className="text-[var(--foreground)]">Trick of Day</strong> to schedule which trick is featured in the mobile app.</li>
          <li>• Use <strong className="text-[var(--foreground)]">Notifications</strong> to push alerts to mobile users.</li>
          <li>• Use <strong className="text-[var(--gold)]">Export Excel</strong> to download all data, edit offline, and re-import via <strong className="text-sky-400">Import Excel</strong>.</li>
          <li>• Changes save automatically to your browser's local storage.</li>
        </ul>
      </div>
    </div>
  );
}
