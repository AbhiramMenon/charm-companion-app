import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { useStore } from "../../App";
import { Pagination, usePagination } from "../Pagination";

function StarBar({ count, total }: { count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-[var(--muted-foreground)] w-7 text-right">{count}</span>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3 w-3 ${i <= Math.round(n) ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} />
      ))}
    </div>
  );
}

type SortKey = "avgRating" | "totalRatings" | "title";

export function RatingsManager() {
  const { store } = useStore();

  const [search,    setSearch]    = useState("");
  const [examId,    setExamId]    = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId,   setTopicId]   = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sortKey,   setSortKey]   = useState<SortKey>("avgRating");

  // Cascade options
  const subjectOpts = useMemo(() =>
    examId ? store.subjects.filter((s) => s.examId === examId) : store.subjects,
  [examId, store.subjects]);

  const chapterOpts = useMemo(() =>
    subjectId ? store.chapters.filter((c) => c.subjectId === subjectId)
    : subjectOpts.length ? store.chapters.filter((c) => subjectOpts.some((s) => s.id === c.subjectId))
    : store.chapters,
  [subjectId, subjectOpts, store.chapters]);

  const topicOpts = useMemo(() =>
    chapterId ? store.topics.filter((t) => t.chapterId === chapterId)
    : chapterOpts.length ? store.topics.filter((t) => chapterOpts.some((c) => c.id === t.chapterId))
    : store.topics,
  [chapterId, chapterOpts, store.topics]);

  const changeExam = (v: string) => { setExamId(v); setSubjectId(""); setChapterId(""); setTopicId(""); };
  const changeSub  = (v: string) => { setSubjectId(v); setChapterId(""); setTopicId(""); };
  const changeCh   = (v: string) => { setChapterId(v); setTopicId(""); };

  const filtered = useMemo(() => {
    return store.ratings
      .map((r) => ({ ...r, trick: store.tricks.find((t) => t.id === r.trickId) }))
      .filter((r) => {
        if (!r.trick) return false;
        if (difficulty && r.trick.difficulty !== difficulty) return false;
        if (topicId && r.trick.topic !== topicId) return false;

        if (!topicId) {
          if (chapterId) {
            const tids = store.topics.filter((t) => t.chapterId === chapterId).map((t) => t.id);
            if (!tids.includes(r.trick.topic)) return false;
          } else if (subjectId) {
            const cids = store.chapters.filter((c) => c.subjectId === subjectId).map((c) => c.id);
            const tids = store.topics.filter((t) => cids.includes(t.chapterId)).map((t) => t.id);
            if (!tids.includes(r.trick.topic)) return false;
          } else if (examId) {
            const sids = store.subjects.filter((s) => s.examId === examId).map((s) => s.id);
            const cids = store.chapters.filter((c) => sids.includes(c.subjectId)).map((c) => c.id);
            const tids = store.topics.filter((t) => cids.includes(t.chapterId)).map((t) => t.id);
            if (!tids.includes(r.trick.topic)) return false;
          }
        }

        if (search && !r.trick.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortKey === "avgRating")    return b.avgRating - a.avgRating;
        if (sortKey === "totalRatings") return b.totalRatings - a.totalRatings;
        return a.trick!.title.localeCompare(b.trick!.title);
      });
  }, [store, search, examId, subjectId, chapterId, topicId, difficulty, sortKey]);

  const { page, setPage, pageItems, totalPages } = usePagination(filtered, 8);

  const totalRatings = store.ratings.reduce((s, r) => s + r.totalRatings, 0);
  const overallAvg   = store.ratings.length
    ? store.ratings.reduce((s, r) => s + r.avgRating * r.totalRatings, 0) / totalRatings
    : 0;

  const selCls = "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)] transition-colors";

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Trick Ratings</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{store.ratings.length} rated tricks · {totalRatings.toLocaleString()} total ratings · {overallAvg.toFixed(2)} avg</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Ratings",  value: totalRatings.toLocaleString(), color: "text-[var(--foreground)]" },
          { label: "Overall Avg",    value: overallAvg.toFixed(2),         color: "text-amber-400"           },
          { label: "Rated Tricks",   value: store.ratings.length,          color: "text-[var(--foreground)]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tricks…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--gold)]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <select value={examId}    onChange={(e) => changeExam(e.target.value)} className={selCls}>
            <option value="">All Exams</option>
            {store.exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.short}</option>)}
          </select>
          <select value={subjectId} onChange={(e) => changeSub(e.target.value)}  className={selCls} disabled={!examId && subjectOpts.length === store.subjects.length}>
            <option value="">All Subjects</option>
            {subjectOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={chapterId} onChange={(e) => changeCh(e.target.value)}   className={selCls}>
            <option value="">All Chapters</option>
            {chapterOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={topicId}   onChange={(e) => setTopicId(e.target.value)} className={selCls}>
            <option value="">All Topics</option>
            {topicOpts.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={selCls}>
            <option value="">All Difficulty</option>
            {["Easy", "Medium", "Hard"].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={selCls}>
            <option value="avgRating">Sort: Avg Rating</option>
            <option value="totalRatings">Sort: Total Ratings</option>
            <option value="title">Sort: Title A–Z</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {pageItems.map((r, idx) => (
          <div key={r.trickId} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-bold text-[var(--muted-foreground)]">
                  #{(page - 1) * 8 + idx + 1}
                </span>
                <div>
                  <p className="font-semibold text-[var(--foreground)] text-sm leading-snug">{r.trick!.title}</p>
                  <p className="text-xs text-[var(--gold)] mt-0.5 font-bold">{r.trick!.content}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">{r.trick!.difficulty}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">{r.trick!.subject}</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-2xl font-bold text-amber-400">{r.avgRating.toFixed(1)}</span>
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">{r.totalRatings.toLocaleString()} ratings</p>
                <Stars n={r.avgRating} />
              </div>
            </div>

            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--muted-foreground)] w-3">{star}</span>
                  <Star className="h-3 w-3 fill-amber-400/60 text-amber-400/60 shrink-0" />
                  <StarBar count={r.dist[star - 1]} total={r.totalRatings} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {pageItems.length === 0 && (
          <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">No rating data matches your filters.</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
