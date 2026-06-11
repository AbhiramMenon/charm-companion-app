import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, Flame, Megaphone, Sparkles, TrendingUp, ChevronRight, ChevronLeft, Zap, Bookmark, BookmarkCheck } from "lucide-react";
import { KrackItLogo } from "./KrackItLogo";
import { type Exam, type Trick } from "@/lib/krackit-data";
import { cn } from "@/lib/utils";
import type { T } from "@/lib/translations";
import { useData, type TrickOfDayEntry } from "@/lib/DataContext";
import { getExamCountdown } from "@/lib/examDates";

// Gradient palette for trick-of-day card — keyed by accent name
const TOD_ACCENTS: Record<string, { bg: string; shimmer: string; contentColor: string }> = {
  gold:    { bg: "linear-gradient(135deg,#1c1205 0%,#2a1a07 60%,#0f0a04 100%)", shimmer: "#D4A24C", contentColor: "text-gold/80" },
  rose:    { bg: "linear-gradient(135deg,#1c0507 0%,#2a0a12 60%,#0f0406 100%)", shimmer: "#fb7185", contentColor: "text-rose-300/80" },
  emerald: { bg: "linear-gradient(135deg,#041c0a 0%,#082a12 60%,#020f05 100%)", shimmer: "#34d399", contentColor: "text-emerald-300/80" },
  sky:     { bg: "linear-gradient(135deg,#041418 0%,#082028 60%,#020a0f 100%)", shimmer: "#38bdf8", contentColor: "text-sky-300/80" },
  violet:  { bg: "linear-gradient(135deg,#0a0518 0%,#120a28 60%,#06020f 100%)", shimmer: "#a78bfa", contentColor: "text-violet-300/80" },
  cyan:    { bg: "linear-gradient(135deg,#04181c 0%,#082428 60%,#020a0c 100%)", shimmer: "#22d3ee", contentColor: "text-cyan-300/80" },
};

type ExamEntry = { id: string; short: string; days: number | null; label: string };

// ── Exam Countdown ────────────────────────────────────────────────────────────

function ExamCountdown({
  countdownExamIds,
  exams,
  onBrowseExams,
  highlightExamId,
}: {
  countdownExamIds: Set<string>;
  exams: Exam[];
  onBrowseExams: () => void;
  highlightExamId?: string;
}) {
  if (countdownExamIds.size === 0) {
    return (
      <div className="flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/5 via-surface to-surface p-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/10 ring-1 ring-gold/20">
            <CalendarDays className="h-4 w-4 text-gold/60" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold/60">Countdown</p>
        </div>
        <p className="text-[11px] font-semibold text-foreground leading-tight">No exam selected</p>
        <p className="text-[10px] text-muted-foreground leading-tight">Subscribe to track your exam date.</p>
        <button
          onClick={onBrowseExams}
          className="mt-auto w-full rounded-lg gold-gradient py-1.5 text-[10px] font-bold text-[#1a1410]"
        >
          Browse Exams →
        </button>
      </div>
    );
  }

  const entries: ExamEntry[] = exams
    .filter((e) => countdownExamIds.has(e.id))
    .map((e) => {
      const info = getExamCountdown(e);
      return { id: e.id, short: e.short, days: info.days, label: info.label };
    })
    .sort((a, b) => {
      if (a.days === null && b.days === null) return 0;
      if (a.days === null) return 1;
      if (b.days === null) return -1;
      return a.days - b.days;
    });

  return <ExamCarousel entries={entries} highlightExamId={highlightExamId} />;
}

const colorForDays = (days: number | null) =>
  days === null ? "muted" : days < 7 ? "rose" : days < 30 ? "amber" : "sky";

const COLOR_MAP = {
  rose:  { border: "border-rose-400/25",  bg: "from-rose-400/12",  label: "text-rose-400",         ring: "ring-rose-400/20",  iconBg: "bg-rose-400/15",   dot: "bg-rose-400"         },
  amber: { border: "border-amber-400/25", bg: "from-amber-400/12", label: "text-amber-400",        ring: "ring-amber-400/20", iconBg: "bg-amber-400/15",  dot: "bg-amber-400"        },
  sky:   { border: "border-sky-400/25",   bg: "from-sky-400/12",   label: "text-sky-400",          ring: "ring-sky-400/20",   iconBg: "bg-sky-400/15",    dot: "bg-sky-400"          },
  muted: { border: "border-border",       bg: "from-transparent",  label: "text-muted-foreground", ring: "ring-white/10",     iconBg: "bg-background/40", dot: "bg-muted-foreground" },
} as const;

function ExamCarousel({ entries, highlightExamId }: { entries: ExamEntry[]; highlightExamId?: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!highlightExamId) return;
    const i = entries.findIndex((e) => e.id === highlightExamId);
    if (i >= 0) setIdx(i);
  }, [highlightExamId, entries]);
  const clamped = Math.min(idx, entries.length - 1);
  const cur = entries[clamped];
  const color = colorForDays(cur.days);
  const cm = COLOR_MAP[color];

  const swipeStart = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { swipeStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStart.current;
    if (dx < -30) setIdx((i) => Math.min(entries.length - 1, i + 1));
    else if (dx > 30) setIdx((i) => Math.max(0, i - 1));
    swipeStart.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "flex flex-1 flex-col gap-1.5 overflow-hidden rounded-2xl border p-3.5 select-none",
        cm.border, `bg-gradient-to-br ${cm.bg} via-surface to-surface`
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1", cm.iconBg, cm.ring)}>
          <CalendarDays className={cn("h-4 w-4", cm.label)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-[10px] font-semibold uppercase tracking-widest leading-none", cm.label)}>Countdown</p>
          <p className="text-xl font-bold leading-none text-foreground mt-0.5">
            {cur.days !== null ? `${cur.days}d` : "TBA"}
          </p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-tight truncate">{cur.label}</p>
      <div className={cn("rounded-lg px-2 py-1 text-[10px] font-bold text-left", cm.iconBg, cm.label)}>
        {cur.days === null ? "Date to be announced" : cur.days < 7 ? "⚠ Very soon!" : cur.days < 30 ? "Start revising" : "Keep up the pace"}
      </div>
      {entries.length > 1 && (
        <div className="flex items-center justify-between mt-auto pt-0.5">
          <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={clamped === 0}
            className="text-muted-foreground disabled:opacity-25 active:scale-90 transition-transform">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <div className="flex gap-1">
            {entries.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={cn("h-1 rounded-full transition-all duration-200", i === clamped ? `w-3 ${cm.dot}` : "w-1 bg-border")} />
            ))}
          </div>
          <button onClick={() => setIdx((i) => Math.min(entries.length - 1, i + 1))} disabled={clamped === entries.length - 1}
            className="text-muted-foreground disabled:opacity-25 active:scale-90 transition-transform">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────

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
  streak = 0,
  countdownExamIds,
  highlightExamId,
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
  streak?: number;
  countdownExamIds: Set<string>;
  highlightExamId?: string;
}) {
  const { exams, examNews, tricks, tricksOfDay } = useData();

  // Fall back to first trick if admin hasn't scheduled any for today
  const todList: TrickOfDayEntry[] = tricksOfDay.length
    ? tricksOfDay
    : tricks[0] ? [{ trick: tricks[0], note: null, accent: 'gold' }] : [];
  const [todIdx, setTodIdx] = useState(0);
  const clampedIdx = Math.min(todIdx, todList.length - 1);
  const todEntry = todList[clampedIdx] ?? null;
  const trickOfDay = todEntry?.trick ?? null;
  const touchStartX = useRef<number | null>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.goodMorning : hour < 17 ? "Good afternoon," : "Good evening,";

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      {/* ── Header ── */}
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

      {/* ── 2. Streak + Exam Countdown ── */}
      <section className="mx-5 mt-4 flex gap-3">
        {/* Streak card */}
        <div data-tour="streak-card" className="flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/20 via-surface to-surface p-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/40 ring-1 ring-gold/30">
              <Flame className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">{t.streak}</p>
              <p className="text-xl font-bold leading-none text-foreground">{streak} 🔥</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            {streak === 0 ? "Log in daily to build your streak!" : `${streak} day${streak === 1 ? "" : "s"} — log in tomorrow to continue`}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: 7 }, (_, i) => i < Math.min(7, streak) ? 1 : 0.4).map((v, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-background/50">
                <div className="h-full rounded-full gold-gradient" style={{ width: `${v * 100}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Exam Countdown */}
        <div data-tour="countdown-card" className="flex flex-1">
          <ExamCountdown
            countdownExamIds={countdownExamIds}
            exams={exams}
            onBrowseExams={onSeeAllExams}
            highlightExamId={highlightExamId}
          />
        </div>
      </section>

      {/* ── 3. Progress bar ── */}
      {(() => {
        const total = tricks.length;
        const pct = total > 0 ? Math.min(100, Math.round((mastered.size / total) * 100)) : 0;
        return (
          <section data-tour="progress-bar" className="mx-5 mt-3 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-2.5">
            <TrendingUp className="h-4 w-4 shrink-0 text-gold" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground">
                {mastered.size} mastered · {openedTricks.size} viewed
              </p>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full gold-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="text-[11px] font-bold text-gold">{pct}%</span>
          </section>
        );
      })()}

      {/* ── 5. Pick your exam ── */}
      <section data-tour="exam-grid" className="mt-6 px-5">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold text-foreground">{t.pickYourExam}</h2>
          <button onClick={onSeeAllExams} className="text-xs font-medium text-gold">{t.seeAll}</button>
        </div>
        <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3">
            {exams.map((e) => {
              const hasImage = !!e.imageUrl;
              return (
                <button
                  key={e.id}
                  onClick={() => openExam(e)}
                  className="relative flex w-40 shrink-0 flex-col gap-3 overflow-hidden rounded-2xl border border-border p-4 text-left transition-transform active:scale-95"
                >
                  {/* Card background — always the accent gradient */}
                  <div className={`absolute inset-0 bg-linear-to-br ${e.accent}`} />

                  {/* Badge: image fill when set, short-code text otherwise */}
                  <div className="relative flex items-center gap-2 mb-1">
                    {hasImage ? (
                      <div className="h-10 w-10 overflow-hidden rounded-xl ring-1 ring-white/15 shrink-0">
                        <img src={e.imageUrl} alt={e.short} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/40 font-display text-sm font-bold text-foreground ring-1 ring-white/10">
                        {e.short}
                      </div>
                    )}
                    {e.medium === 'hindi' && (
                      <span className="rounded-full bg-orange-400/15 px-1.5 py-0.5 text-[9px] font-bold text-orange-400 ring-1 ring-orange-400/25">HI</span>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div className="relative">
                    <p className="text-sm font-semibold text-foreground">{e.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{e.subjects} subjects · {e.tricks} tricks</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>


      {/* ── 7. Trick of the Day (compact) ── */}
      {trickOfDay && (
        <section data-tour="trick-of-day" className="mt-6 px-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <h2 className="text-lg font-bold text-foreground">{t.trickOfTheDay}</h2>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>

          {/* Compact card — background color set by admin accent */}
          {(() => {
            const accentKey = todEntry?.accent ?? 'gold';
            const palette = TOD_ACCENTS[accentKey] ?? TOD_ACCENTS.gold;
            const trickList = todList.map((e) => e.trick);
            return (
              <div
                className="relative overflow-hidden rounded-2xl border border-white/10"
                style={{ background: palette.bg }}
                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (touchStartX.current === null) return;
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  touchStartX.current = null;
                  if (dx < -40) setTodIdx((i) => Math.min(todList.length - 1, i + 1));
                  else if (dx > 40) setTodIdx((i) => Math.max(0, i - 1));
                }}
              >
                {/* top shimmer */}
                <div className="absolute inset-x-0 top-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${palette.shimmer} 40%, ${palette.shimmer}dd 50%, ${palette.shimmer} 60%, transparent)` }} />

                <div className="p-4">
                  {/* Row 1: badges */}
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 ring-1 ring-white/15">
                      <Sparkles className="h-2.5 w-2.5 text-white/70" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">Daily Pick</span>
                    </div>
                    <span className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      trickOfDay.difficulty === "Easy"   ? "bg-emerald-400/15 text-emerald-400" :
                      trickOfDay.difficulty === "Medium" ? "bg-amber-400/15 text-amber-400"     :
                                                           "bg-rose-400/15 text-rose-400"
                    )}>
                      <Zap className="h-2.5 w-2.5" /> {trickOfDay.difficulty}
                    </span>
                    {trickOfDay.subject && (
                      <span className="rounded-full bg-white/8 px-2 py-0.5 text-[9px] text-white/50">
                        {trickOfDay.subject}
                      </span>
                    )}
                    {todList.length > 1 && (
                      <span className="ml-auto text-[9px] text-white/30">{clampedIdx + 1}/{todList.length}</span>
                    )}
                  </div>

                  {/* Row 2: title */}
                  <p className="mb-1.5 text-[13px] font-bold leading-snug text-white line-clamp-1">
                    {trickOfDay.title}
                  </p>

                  {/* Row 3: content preview */}
                  <p className={cn("text-[11px] leading-relaxed line-clamp-2", palette.contentColor)}>
                    {trickOfDay.content}
                  </p>

                  {/* Row 3b: admin note (shown below content if present) */}
                  {todEntry?.note && (
                    <p className="mt-1 text-[9px] italic text-white/40 line-clamp-1">{todEntry.note}</p>
                  )}

                  {/* Row 4: actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(trickOfDay.id); }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-colors",
                        saved.has(trickOfDay.id)
                          ? "bg-white/20 text-white"
                          : "bg-white/8 text-white/50 hover:text-white/80"
                      )}
                    >
                      {saved.has(trickOfDay.id)
                        ? <BookmarkCheck className="h-3 w-3" />
                        : <Bookmark className="h-3 w-3" />}
                      {saved.has(trickOfDay.id) ? "Saved" : "Save"}
                    </button>

                    <button
                      onClick={() => openTrick(trickOfDay, trickList)}
                      className="ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-bold text-[#1a1410] transition-transform active:scale-95"
                      style={{ background: "linear-gradient(135deg, #F2D58A, #D4A24C)" }}
                    >
                      Read More <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* dot indicators for multiple tricks */}
                {todList.length > 1 && (
                  <div className="flex justify-center gap-1.5 pb-3">
                    {todList.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTodIdx(i)}
                        className="rounded-full transition-all duration-200"
                        style={{
                          height: "4px",
                          width: i === clampedIdx ? "16px" : "4px",
                          background: i === clampedIdx ? palette.shimmer : "rgba(255,255,255,0.2)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      )}

      {/* ── 9. Upcoming exam news ── */}
      <section data-tour="exam-news" className="mt-6">
        <div className="mb-3 flex items-center gap-2 px-5">
          <Megaphone className="h-4 w-4 text-gold" />
          <h2 className="text-lg font-bold text-foreground">{t.upcomingExamNews}</h2>
        </div>
        <div className="overflow-hidden px-5 pb-2">
          <div className="flex w-max gap-3 animate-marquee">
            {[...examNews, ...examNews].map((n, i) => (
              <article
                key={`${n.id}-${i}`}
                className={`w-72 shrink-0 rounded-2xl border border-border bg-linear-to-br ${n.accent} p-4`}
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
    </div>
  );
}
