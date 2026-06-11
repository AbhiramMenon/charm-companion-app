import { useMemo } from "react";
import { useStore } from "../../App";

// ─── Mini chart primitives ────────────────────────────────────────────────────

function BarChart({
  data, color = "bg-amber-400", maxH = 120,
}: {
  data: { label: string; value: number }[];
  color?: string;
  maxH?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-full" style={{ height: maxH }}>
      {data.map((d) => {
        const h = Math.max((d.value / max) * maxH, 2);
        return (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-[9px] text-[var(--muted-foreground)] font-bold leading-none">{d.value}</span>
            <div className={`w-full rounded-t-md ${color} transition-all`} style={{ height: h }} title={`${d.label}: ${d.value}`} />
            <span className="text-[9px] text-[var(--muted-foreground)] truncate max-w-full leading-none px-0.5">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function HorizBar({
  data, color = "amber-400",
}: {
  data: { label: string; value: number; pct?: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const pct = d.pct ?? (d.value / max) * 100;
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-xs text-[var(--muted-foreground)] w-32 shrink-0 truncate">{d.label}</span>
            <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
              <div className={`h-full rounded-full bg-${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-bold text-[var(--foreground)] w-10 text-right">{d.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  const r = 36, cx = 44, cy = 44, circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6">
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={10} />
        {segments.map((seg) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const el = (
            <circle
              key={seg.label}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ + circ / 4}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += pct;
          return el;
        })}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" className="fill-[var(--foreground)]" fontSize={11} fontWeight={700}>{total}</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-[var(--muted-foreground)]">{seg.label}</span>
            <span className="text-xs font-bold text-[var(--foreground)] ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, children, span = 1 }: { title: string; children: React.ReactNode; span?: number }) {
  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4"
      style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{title}</p>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AnalyticsManager() {
  const { store } = useStore();

  // ── Content stats ──────────────────────────────────────────────────────────
  const tricksByDifficulty = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    store.tricks.forEach((t) => { counts[t.difficulty] = (counts[t.difficulty] ?? 0) + 1; });
    return [
      { label: "Easy",   value: counts.Easy,   color: "#4ade80" },
      { label: "Medium", value: counts.Medium, color: "#facc15" },
      { label: "Hard",   value: counts.Hard,   color: "#f87171" },
    ];
  }, [store.tricks]);

  const tricksByExam = useMemo(() => {
    return store.exams.map((ex) => {
      const examSubjectIds = store.subjects.filter((s) => s.examId === ex.id).map((s) => s.id);
      const examChapterIds = store.chapters.filter((c) => examSubjectIds.includes(c.subjectId)).map((c) => c.id);
      const examTopicIds   = store.topics.filter((t) => examChapterIds.includes(t.chapterId)).map((t) => t.id);
      const count = store.tricks.filter((t) => examTopicIds.includes(t.topic)).length;
      return { label: ex.short, value: count };
    });
  }, [store]);

  const contentCounts = useMemo(() => [
    { label: "Exams",    value: store.exams.length },
    { label: "Subjects", value: store.subjects.length },
    { label: "Chapters", value: store.chapters.length },
    { label: "Topics",   value: store.topics.length },
    { label: "Tricks",   value: store.tricks.length },
    { label: "Notes",    value: store.notes.length },
    { label: "News",     value: store.news.length },
  ], [store]);

  // ── User stats ─────────────────────────────────────────────────────────────
  const usersByTier = useMemo(() => {
    const free = store.users.filter((u) => u.tier === "Free").length;
    const paid = store.users.filter((u) => u.tier === "Exam Pack").length;
    return [
      { label: "Free",      value: free, color: "#94a3b8" },
      { label: "Exam Pack", value: paid, color: "#D4A24C" },
    ];
  }, [store.users]);

  const usersByExam = useMemo(() => {
    return store.exams.map((ex) => {
      const uniqueUsers = new Set(
        store.subscriptions
          .filter((s) => s.examId === ex.id && s.status === "active" && s.planType === "exam_pack")
          .map((s) => s.userId)
      ).size;
      return { label: ex.short, value: uniqueUsers };
    });
  }, [store]);

  const activeUsers = useMemo(() => {
    const now = new Date();
    const buckets = [
      { label: "Today",    count: 0 },
      { label: "7 days",   count: 0 },
      { label: "30 days",  count: 0 },
      { label: "90 days",  count: 0 },
      { label: "Inactive", count: 0 },
    ];
    store.users.forEach((u) => {
      const days = (now.getTime() - new Date(u.lastActiveAt).getTime()) / 86400000;
      if (days < 1)       buckets[0].count++;
      else if (days <= 7) buckets[1].count++;
      else if (days <= 30) buckets[2].count++;
      else if (days <= 90) buckets[3].count++;
      else                buckets[4].count++;
    });
    return buckets.map((b) => ({ label: b.label, value: b.count }));
  }, [store.users]);

  const streakDist = useMemo(() => {
    const buckets = [
      { label: "0",     count: 0 },
      { label: "1–7",   count: 0 },
      { label: "8–30",  count: 0 },
      { label: "31+",   count: 0 },
    ];
    store.users.forEach((u) => {
      if (u.streak === 0)       buckets[0].count++;
      else if (u.streak <= 7)   buckets[1].count++;
      else if (u.streak <= 30)  buckets[2].count++;
      else                      buckets[3].count++;
    });
    return buckets.map((b) => ({ label: b.label, value: b.count }));
  }, [store.users]);

  // ── Revenue stats (from actual subscriptions table) ────────────────────────
  const revenueByPlan = useMemo(() => {
    const activeSubs = store.subscriptions.filter((s) => s.status === "active" && s.planType === "exam_pack");
    const counts = { monthly: 0, sixmonths: 0, yearly: 0 };
    const totals = { monthly: 0, sixmonths: 0, yearly: 0 };
    let total = 0;
    activeSubs.forEach((s) => {
      const cycle = s.billingCycle as keyof typeof counts;
      counts[cycle] = (counts[cycle] ?? 0) + 1;
      const amt = s.amountPaise / 100;
      totals[cycle] = (totals[cycle] ?? 0) + amt;
      total += amt;
    });
    return {
      plans: [
        { label: "Monthly",  value: counts.monthly,   color: "#60a5fa" },
        { label: "6 Months", value: counts.sixmonths, color: "#a78bfa" },
        { label: "Yearly",   value: counts.yearly,    color: "#D4A24C" },
      ],
      total,
    };
  }, [store.subscriptions]);

  const revenueByExam = useMemo(() => {
    return store.exams.map((ex) => {
      const rev = store.subscriptions
        .filter((s) => s.examId === ex.id && s.status === "active" && s.planType === "exam_pack")
        .reduce((s, sub) => s + sub.amountPaise / 100, 0);
      return { label: ex.short, value: Math.round(rev) };
    });
  }, [store]);

  // ── Issues stats ───────────────────────────────────────────────────────────
  const issuesByStatus = useMemo(() => [
    { label: "Open",        value: store.issues.filter((i) => i.status === "open").length,        color: "#f87171" },
    { label: "In Progress", value: store.issues.filter((i) => i.status === "in_progress").length, color: "#facc15" },
    { label: "Resolved",    value: store.issues.filter((i) => i.status === "resolved").length,    color: "#4ade80" },
  ], [store.issues]);

  const issuesByPriority = useMemo(() => [
    { label: "High",   value: store.issues.filter((i) => i.priority === "high").length },
    { label: "Medium", value: store.issues.filter((i) => i.priority === "medium").length },
    { label: "Low",    value: store.issues.filter((i) => i.priority === "low").length },
  ], [store.issues]);

  // ── Ratings stats ──────────────────────────────────────────────────────────
  const ratingsData = useMemo(() => {
    const buckets = [{ label: "1★", v: 0 }, { label: "2★", v: 0 }, { label: "3★", v: 0 }, { label: "4★", v: 0 }, { label: "5★", v: 0 }];
    store.ratings.forEach((r) => { r.dist.forEach((c, i) => { buckets[i].v += c; }); });
    return buckets.map((b, i) => ({ label: b.label, value: b.v, color: i >= 3 ? "#D4A24C" : i === 2 ? "#facc15" : "#94a3b8" }));
  }, [store.ratings]);

  // ── Notifications stats ────────────────────────────────────────────────────
  const notiByType = useMemo(() => {
    const types = ["streak", "goal", "achievement", "reminder", "tip", "exam_news"] as const;
    return types.map((t) => ({
      label: t.replace("_", " "),
      value: store.notifications.filter((n) => n.type === t).length,
    }));
  }, [store.notifications]);

  const notiByStatus = useMemo(() => [
    { label: "Sent",      value: store.notifications.filter((n) => n.status === "sent").length,      color: "#4ade80" },
    { label: "Scheduled", value: store.notifications.filter((n) => n.status === "scheduled").length, color: "#facc15" },
    { label: "Draft",     value: store.notifications.filter((n) => n.status === "draft").length,     color: "#94a3b8" },
  ], [store.notifications]);

  const paidUserCount = useMemo(() =>
    new Set(store.subscriptions.filter((s) => s.status === "active" && s.planType === "exam_pack").map((s) => s.userId)).size,
  [store.subscriptions]);

  const kpis = [
    { label: "Total Users",    value: store.users.length },
    { label: "Paid Users",     value: paidUserCount },
    { label: "Total Tricks",   value: store.tricks.length },
    { label: "Total Ratings",  value: store.ratings.reduce((s, r) => s + r.totalRatings, 0).toLocaleString() },
    { label: "Open Issues",    value: store.issues.filter((i) => i.status === "open").length },
    { label: "Total Revenue",  value: `₹${Math.round(revenueByPlan.total).toLocaleString("en-IN")}` },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Analytics</h1>
        <p className="text-sm text-[var(--muted-foreground)]">All data from your current store snapshot</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-xl font-black text-[var(--gold)]">{value}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Content library */}
        <Card title="Content Library">
          <BarChart data={contentCounts} color="bg-amber-400" maxH={100} />
        </Card>

        {/* Tricks by difficulty */}
        <Card title="Tricks by Difficulty">
          <DonutChart segments={tricksByDifficulty} />
        </Card>

        {/* Tricks by exam */}
        <Card title="Tricks by Exam">
          <BarChart data={tricksByExam} color="bg-sky-400" maxH={100} />
        </Card>

        {/* Users by tier */}
        <Card title="Users by Tier">
          <DonutChart segments={usersByTier} />
        </Card>

        {/* Subscribers by exam */}
        <Card title="Subscribers by Exam">
          <BarChart data={usersByExam} color="bg-violet-400" maxH={100} />
        </Card>

        {/* User activity */}
        <Card title="User Activity (Last Active)">
          <BarChart data={activeUsers} color="bg-emerald-400" maxH={100} />
        </Card>

        {/* Streak distribution */}
        <Card title="Streak Distribution">
          <BarChart data={streakDist} color="bg-orange-400" maxH={100} />
        </Card>

        {/* Revenue by plan */}
        <Card title="Subscriptions by Plan">
          <DonutChart segments={revenueByPlan.plans} />
        </Card>

        {/* Revenue by exam */}
        <Card title="Revenue by Exam (₹)">
          <HorizBar data={revenueByExam} color="amber-400" />
        </Card>

        {/* Issues by status */}
        <Card title="Issues by Status">
          <DonutChart segments={issuesByStatus} />
        </Card>

        {/* Issues by priority */}
        <Card title="Issues by Priority">
          <BarChart data={issuesByPriority} color="bg-rose-400" maxH={100} />
        </Card>

        {/* Ratings distribution */}
        <Card title="Ratings Distribution">
          <BarChart
            data={ratingsData.map((d) => ({ label: d.label, value: d.value }))}
            color="bg-amber-400"
            maxH={100}
          />
        </Card>

        {/* Notifications by type */}
        <Card title="Notifications by Type">
          <HorizBar data={notiByType} color="sky-400" />
        </Card>

        {/* Notifications by status */}
        <Card title="Notifications by Status">
          <DonutChart segments={notiByStatus} />
        </Card>

        {/* Avg rating per trick */}
        <Card title="Avg Rating per Trick">
          <BarChart
            data={store.ratings.map((r) => {
              const t = store.tricks.find((tk) => tk.id === r.trickId);
              return { label: t?.title.slice(0, 12) ?? r.trickId, value: r.avgRating };
            })}
            color="bg-amber-400"
            maxH={100}
          />
        </Card>

      </div>
    </div>
  );
}
