import { useState } from "react";
import { Bell, CalendarDays, Flame, Megaphone, Sparkles, TrendingUp, ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { KrackItLogo } from "./KrackItLogo";
import { type Exam, type Trick } from "@/lib/krackit-data";
import { cn } from "@/lib/utils";
import type { T } from "@/lib/translations";
import { useData } from "@/lib/DataContext";


// Nearest upcoming exam and days remaining (static demo data keyed by exam id)
const examDates: Record<string, { label: string; date: string }> = {
  upsc: { label: "UPSC Prelims 2026", date: "2026-06-01" },
  ssc:  { label: "SSC CGL Tier 1",    date: "2026-07-09" },
  neet: { label: "NEET UG 2026",      date: "2026-05-04" },
  jee:  { label: "JEE Main Session 2", date: "2026-04-02" },
  cat:  { label: "CAT 2026",           date: "2026-11-30" },
  bank: { label: "IBPS PO 2026",       date: "2026-08-17" },
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function ExamCountdown() {
  const entries = Object.values(examDates).map((e) => ({ ...e, days: daysUntil(e.date) }));
  const future = entries.filter((e) => e.days >= 0).sort((a, b) => a.days - b.days);
  const nearest = future[0];

  if (!nearest) {
    return (
      <div className="flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-surface p-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/40 ring-1 ring-white/10">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Exam Countdown</p>
        </div>
        <p className="text-[11px] text-muted-foreground">No upcoming exams</p>
      </div>
    );
  }

  const urgent = nearest.days < 7;
  const soon = nearest.days < 30;
  const color = urgent ? "rose" : soon ? "amber" : "sky";

  const colorMap = {
    rose: { border: "border-rose-400/25", bg: "from-rose-400/12", label: "text-rose-400", ring: "ring-rose-400/20", iconBg: "bg-rose-400/15" },
    amber: { border: "border-amber-400/25", bg: "from-amber-400/12", label: "text-amber-400", ring: "ring-amber-400/20", iconBg: "bg-amber-400/15" },
    sky: { border: "border-sky-400/25", bg: "from-sky-400/12", label: "text-sky-400", ring: "ring-sky-400/20", iconBg: "bg-sky-400/15" },
  }[color];

  return (
    <div className={cn(
      "flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border p-3.5",
      colorMap.border, `bg-gradient-to-br ${colorMap.bg} via-surface to-surface`
    )}>
      <div className="flex items-center gap-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl ring-1", colorMap.iconBg, colorMap.ring)}>
          <CalendarDays className={cn("h-4 w-4", colorMap.label)} />
        </div>
        <div>
          <p className={cn("text-[10px] font-semibold uppercase tracking-widest", colorMap.label)}>Exam Countdown</p>
          <p className="text-xl font-bold leading-none text-foreground">{nearest.days}d</p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-tight truncate">{nearest.label}</p>
      <div className={cn("mt-auto rounded-lg px-2 py-1 text-[10px] font-bold text-left", colorMap.iconBg, colorMap.label)}>
        {urgent ? "⚠ Very soon!" : soon ? "Start revising now" : "Keep up the pace"}
      </div>
    </div>
  );
}

export function HomeScreen({
  saved,
  mastered,
  openedTricks,
  toggleSave,
  openTrick,
  openExam,
  onSeeAllExams,
  onOpenNotifications,
  t,
  userName,
}: {
  saved: Set<string>;
  mastered: Set<string>;
  openedTricks: Set<string>;
  toggleSave: (id: string) => void;
  openTrick: (trick: Trick, list: Trick[]) => void;
  openExam: (e: Exam) => void;
  onSeeAllExams: () => void;
  onOpenNotifications: () => void;
  t: T;
  userName: string;
}) {
  const { exams, examNews, tricks, tricksOfDay } = useData();
  const todList = tricksOfDay.length ? tricksOfDay : (tricks[0] ? [tricks[0]] : []);
  const [todIdx, setTodIdx] = useState(0);
  const clampedIdx = Math.min(todIdx, todList.length - 1);
  const trickOfDay = todList[clampedIdx] ?? null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.goodMorning : hour < 17 ? "Good afternoon," : "Good evening,";

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <KrackItLogo size={36} />
          <div>
            <p className="text-xs text-muted-foreground">{greeting}</p>
            <p className="text-sm font-semibold text-foreground">{userName} 👋</p>
          </div>
        </div>
        <button
          onClick={onOpenNotifications}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold" />
        </button>
      </header>

      {/* Streak + Exam Countdown */}
      <section className="mx-5 mt-4 flex gap-3">
        {/* Streak card */}
        <div className="flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/20 via-surface to-surface p-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/40 ring-1 ring-gold/30">
              <Flame className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">{t.streak}</p>
              <p className="text-xl font-bold leading-none text-foreground">12 🔥</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">Learn 3 tricks to keep it alive</p>
          <div className="flex gap-1">
            {[1, 1, 1, 1, 1, 0.4, 0.4].map((v, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-background/50">
                <div className="h-full rounded-full gold-gradient" style={{ width: `${v * 100}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Exam Countdown */}
        <ExamCountdown />
      </section>

      {/* Weekly progress bar */}
      <section className="mx-5 mt-3 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-2.5">
        <TrendingUp className="h-4 w-4 shrink-0 text-gold" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-foreground">
            This week: {mastered.size + 14} tricks · {mastered.size} mastered
          </p>
          <p className="text-[10px] text-muted-foreground">+3 from last week</p>
        </div>
        <span className="text-[11px] font-bold text-gold">↑ 27%</span>
      </section>

      {/* Pick your exam */}
      <section className="mt-6 px-5">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold text-foreground">{t.pickYourExam}</h2>
          <button onClick={onSeeAllExams} className="text-xs font-medium text-gold">{t.seeAll}</button>
        </div>
        <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3">
            {exams.map((e) => (
              <button
                key={e.id}
                onClick={() => openExam(e)}
                className={`flex w-40 shrink-0 flex-col gap-3 rounded-2xl border border-border bg-gradient-to-br ${e.accent} p-4 text-left transition-transform active:scale-95`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/40 font-display text-sm font-bold text-foreground ring-1 ring-white/10">
                  {e.short}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{e.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{e.subjects} subjects · {e.tricks} tricks</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming exam news */}
      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2 px-5">
          <Megaphone className="h-4 w-4 text-gold" />
          <h2 className="text-lg font-bold text-foreground">{t.upcomingExamNews}</h2>
        </div>
        <div className="overflow-hidden px-5 pb-2">
          <div className="flex w-max gap-3 animate-marquee">
            {[...examNews, ...examNews].map((n, i) => (
              <article
                key={`${n.id}-${i}`}
                className={`w-72 shrink-0 rounded-2xl border border-border bg-gradient-to-br ${n.accent} p-4`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold ring-1 ring-gold/30">
                    {n.exam}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{n.date}</span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-snug text-foreground">{n.title}</p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{n.tag}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trick of the day — immersive hero card */}
      {trickOfDay && (
        <section className="mt-6 px-5 pb-4">
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <h2 className="text-lg font-bold text-foreground">{t.trickOfTheDay}</h2>
            {todList.length > 1 && (
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold text-gold">
                {clampedIdx + 1}/{todList.length}
              </span>
            )}
            <span className="ml-auto rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>

          <button
            onClick={() => openTrick(trickOfDay, todList)}
            className="group relative w-full overflow-hidden rounded-3xl text-left shadow-xl transition-transform active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #1a130a 0%, #2a1d0a 40%, #1e1508 100%)" }}
          >
            {/* Glow orbs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, #D4A24C 0%, transparent 70%)" }} />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #F2D58A 0%, transparent 70%)" }} />

            <div className="relative p-5">
              {/* Top row: badge + subject */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                    trickOfDay.difficulty === "Easy"   ? "bg-emerald-400/20 text-emerald-400" :
                    trickOfDay.difficulty === "Medium" ? "bg-amber-400/20 text-amber-400"    :
                                                         "bg-rose-400/20 text-rose-400"
                  )}>
                    <Zap className="h-2.5 w-2.5" />
                    {trickOfDay.difficulty}
                  </span>
                  {trickOfDay.subject && (
                    <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                      {trickOfDay.subject}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1">
                  <Sparkles className="h-3 w-3 text-gold" />
                  <span className="text-[10px] font-bold text-gold">Daily</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold leading-snug text-white mb-4">{trickOfDay.title}</h3>

              {/* Mnemonic box — the hero element */}
              <div className="relative mb-4 rounded-2xl border border-gold/25 px-5 py-4"
                style={{ background: "linear-gradient(135deg, rgba(212,162,76,0.18) 0%, rgba(212,162,76,0.06) 100%)" }}>
                <p className="text-center font-display text-2xl font-black tracking-[0.15em] text-gold drop-shadow-sm">
                  {trickOfDay.content}
                </p>
              </div>

              {/* Explanation preview */}
              <p className="text-sm leading-relaxed text-white/65 line-clamp-2 mb-4">
                {trickOfDay.explanation}
              </p>

              {/* CTA row */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {todList.length > 1 ? (
                    todList.map((_, i) => (
                      <div key={i} className="h-1.5 w-5 rounded-full" style={{ background: i === clampedIdx ? "linear-gradient(90deg,#F2D58A,#D4A24C)" : "rgba(255,255,255,0.12)" }} />
                    ))
                  ) : (
                    [1,2,3,4,5].map((i) => (
                      <div key={i} className="h-1.5 w-5 rounded-full" style={{ background: i <= 3 ? "linear-gradient(90deg,#F2D58A,#D4A24C)" : "rgba(255,255,255,0.12)" }} />
                    ))
                  )}
                </div>
                <span className="flex items-center gap-1 rounded-full gold-gradient px-3.5 py-1.5 text-xs font-bold text-[#1a1410] shadow-lg shadow-gold/30">
                  Learn now <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </button>

          {/* Prev/Next navigation for multiple tricks */}
          {todList.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-4">
              <button
                onClick={() => setTodIdx((i) => Math.max(0, i - 1))}
                disabled={clampedIdx === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                {todList.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTodIdx(i)}
                    className="h-2 rounded-full transition-all"
                    style={{ width: i === clampedIdx ? "1.5rem" : "0.5rem", background: i === clampedIdx ? "var(--gold)" : "var(--border)" }}
                  />
                ))}
              </div>
              <button
                onClick={() => setTodIdx((i) => Math.min(todList.length - 1, i + 1))}
                disabled={clampedIdx === todList.length - 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
