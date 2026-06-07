import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { useStore } from "../../App";
import { uid, type Trick, type Difficulty } from "../../lib/data";
import { tricksApi } from "../../lib/adminApi";
import { Modal, Field, Input, Textarea, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const DIFF_COLOR: Record<Difficulty, string> = {
  Easy:   "bg-emerald-400/15 text-emerald-400",
  Medium: "bg-amber-400/15 text-amber-400",
  Hard:   "bg-rose-400/15 text-rose-400",
};

const empty = (): Omit<Trick, "id"> => ({ title: "", content: "", explanation: "", difficulty: "Easy", subject: "", topic: "" });

export function TricksManager() {
  const { store, refresh } = useStore();
  const [modal, setModal]     = useState<"add" | Trick | null>(null);
  const [delTarget, setDel]   = useState<Trick | null>(null);
  const [form, setForm]       = useState(empty());
  const [search, setSearch]   = useState("");

  // Filter-panel cascade
  const [filterExam, setFExam]       = useState("");
  const [filterSubject, setFSubject] = useState("");
  const [filterChapter, setFChapter] = useState("");
  const [filterTopic, setFTopic]     = useState("");

  // Modal-form cascade (Exam → Subject → Chapter → Topic selection)
  const [mExam, setMExam]       = useState("");
  const [mSubject, setMSubject] = useState("");
  const [mChapter, setMChapter] = useState("");

  // Cascade options for filter panel
  const subjectOpts  = store.subjects.filter((s) => !filterExam    || s.examId    === filterExam);
  const chapterOpts  = store.chapters.filter((c) => !filterSubject || c.subjectId === filterSubject);
  const topicOpts    = store.topics.filter((t)   => !filterChapter || t.chapterId === filterChapter);

  // Cascade options for modal form
  const mSubjectOpts = store.subjects.filter((s) => !mExam    || s.examId    === mExam);
  const mChapterOpts = store.chapters.filter((c) => !mSubject || c.subjectId === mSubject);
  const mTopicOpts   = store.topics.filter((t)   => !mChapter || t.chapterId === mChapter);

  const allFiltered = store.tricks.filter((t) => {
    const q = search.toLowerCase();
    if (q && !t.title.toLowerCase().includes(q) && !t.content.toLowerCase().includes(q)) return false;
    if (filterTopic   && t.topic !== filterTopic) return false;
    if (filterChapter && !topicOpts.some((tp) => tp.id === t.topic)) return false;
    if (filterSubject && !chapterOpts.some((ch) => topicOpts.some((tp) => tp.id === t.topic && tp.chapterId === ch.id))) return false;
    if (filterExam    && !subjectOpts.some((s) => {
      const chaps = store.chapters.filter((c) => c.subjectId === s.id);
      const tops  = store.topics.filter((tp) => chaps.some((ch) => ch.id === tp.chapterId));
      return tops.some((tp) => tp.id === t.topic);
    })) return false;
    return true;
  });
  const { page, setPage, pageItems: filtered, totalPages } = usePagination(allFiltered, 10);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setMExam(""); setMSubject(""); setMChapter("");
    setForm(empty());
    setModal("add");
  };

  const openEdit = (t: Trick) => {
    const topic   = store.topics.find((tp) => tp.id === t.topic);
    const chapter = topic ? store.chapters.find((c) => c.id === topic.chapterId) : undefined;
    const subject = chapter ? store.subjects.find((s) => s.id === chapter.subjectId) : undefined;
    const exam    = subject ? store.exams.find((e) => e.id === subject.examId) : undefined;
    setMExam(exam?.id ?? "");
    setMSubject(subject?.id ?? "");
    setMChapter(chapter?.id ?? "");
    setForm({ title: t.title, content: t.content, explanation: t.explanation, difficulty: t.difficulty, subject: t.subject, topic: t.topic });
    setModal(t);
  };

  // Filter-panel cascade resets
  const changeExam    = (v: string) => { setFExam(v);    setFSubject(""); setFChapter(""); setFTopic(""); };
  const changeSubject = (v: string) => { setFSubject(v); setFChapter(""); setFTopic(""); };
  const changeChapter = (v: string) => { setFChapter(v); setFTopic(""); };

  // Modal-form cascade handlers
  const onMExamChange = (v: string) => {
    setMExam(v); setMSubject(""); setMChapter("");
    setForm((f) => ({ ...f, subject: "", topic: "" }));
  };
  const onMSubjectChange = (v: string) => {
    setMSubject(v); setMChapter("");
    const sub = store.subjects.find((s) => s.id === v);
    setForm((f) => ({ ...f, subject: sub?.name ?? f.subject, topic: "" }));
  };
  const onMChapterChange = (v: string) => {
    setMChapter(v);
    setForm((f) => ({ ...f, topic: "" }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic) { alert("Please select a topic."); return; }
    try {
      if (modal === "add") {
        await tricksApi.create({ id: uid(), title: form.title, content: form.content, explanation: form.explanation, difficulty: form.difficulty, subject_tag: form.subject || null, topic_id: form.topic, sort_order: store.tricks.length });
      } else if (modal) {
        await tricksApi.update((modal as Trick).id, { title: form.title, content: form.content, explanation: form.explanation, difficulty: form.difficulty, subject_tag: form.subject || null, topic_id: form.topic });
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (t: Trick) => {
    try { await tricksApi.delete(t.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDel(null);
  };

  const getRating = (trickId: string) => store.ratings.find((r) => r.trickId === trickId);

  const selClass = "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]";

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Tricks</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{allFiltered.length} shown of {store.tricks.length}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
          <Plus className="h-4 w-4" /> Add Trick
        </button>
      </div>

      {/* Search + cascade filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tricks…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--gold)]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterExam} onChange={(e) => changeExam(e.target.value)} className={selClass}>
            <option value="">All Exams</option>
            {store.exams.map((e) => <option key={e.id} value={e.id}>{e.short} – {e.name}</option>)}
          </select>
          <select value={filterSubject} onChange={(e) => changeSubject(e.target.value)} className={selClass} disabled={!subjectOpts.length}>
            <option value="">All Subjects</option>
            {subjectOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterChapter} onChange={(e) => changeChapter(e.target.value)} className={selClass} disabled={!filterSubject}>
            <option value="">All Chapters</option>
            {chapterOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterTopic} onChange={(e) => setFTopic(e.target.value)} className={selClass} disabled={!filterChapter}>
            <option value="">All Topics</option>
            {topicOpts.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((trick) => {
          const topic   = store.topics.find((t) => t.id === trick.topic);
          const chapter = store.chapters.find((c) => c.id === topic?.chapterId);
          const subject = store.subjects.find((s) => s.id === chapter?.subjectId);
          const exam    = store.exams.find((e) => e.id === subject?.examId);
          const rating  = getRating(trick.id);
          return (
            <div key={trick.id} className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:bg-[var(--surface-2)] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${DIFF_COLOR[trick.difficulty]}`}>{trick.difficulty}</span>
                  {exam    && <span className="text-[10px] font-semibold text-[var(--gold)] bg-[var(--gold)]/10 rounded-full px-2 py-0.5">{exam.short}</span>}
                  {subject && <span className="text-[10px] text-[var(--muted-foreground)]">{subject.name}</span>}
                  {chapter && <span className="text-[10px] text-[var(--muted-foreground)]">› {chapter.name}</span>}
                  {topic   && <span className="text-[10px] text-[var(--muted-foreground)]">› {topic.name}</span>}
                </div>
                <p className="font-semibold text-[var(--foreground)] text-sm leading-snug">{trick.title}</p>
                <p className="mt-1 text-xs font-bold text-[var(--gold)] truncate">{trick.content}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)] line-clamp-1">{trick.explanation}</p>
                {rating && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">{rating.avgRating.toFixed(1)}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">({rating.totalRatings.toLocaleString()} ratings)</span>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => openEdit(trick)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setDel(trick)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
        {allFiltered.length === 0 && <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">No tricks found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {modal && (
        <Modal title={modal === "add" ? "Add Trick" : "Edit Trick"} onClose={() => setModal(null)} wide>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Title">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Remember Mughal Emperors in Order" required />
            </Field>
            <Field label="The Trick / Mnemonic">
              <Input value={form.content} onChange={(e) => set("content", e.target.value)} placeholder="BHAJI SABJI FAM" required />
            </Field>
            <Field label="Explanation">
              <Textarea value={form.explanation} onChange={(e) => set("explanation", e.target.value)} rows={4} placeholder="Detailed explanation of the mnemonic…" required />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Difficulty">
                <Select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value as Difficulty)}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
              <Field label="Subject Tag (display)">
                <Input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Auto-filled from subject" />
              </Field>
            </div>

            {/* Hierarchical topic selection */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Link to Topic (Exam → Subject → Chapter → Topic)</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Exam">
                  <Select value={mExam} onChange={(e) => onMExamChange(e.target.value)}>
                    <option value="">— select exam —</option>
                    {store.exams.map((e) => <option key={e.id} value={e.id}>{e.short} – {e.name}</option>)}
                  </Select>
                </Field>
                <Field label="Subject">
                  <Select value={mSubject} onChange={(e) => onMSubjectChange(e.target.value)} disabled={!mSubjectOpts.length}>
                    <option value="">— select subject —</option>
                    {mSubjectOpts.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                  </Select>
                </Field>
                <Field label="Chapter">
                  <Select value={mChapter} onChange={(e) => onMChapterChange(e.target.value)} disabled={!mSubject}>
                    <option value="">— select chapter —</option>
                    {mChapterOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </Field>
                <Field label="Topic *">
                  <Select value={form.topic} onChange={(e) => set("topic", e.target.value)} disabled={!mChapter} required>
                    <option value="">— select topic —</option>
                    {mTopicOpts.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </Field>
              </div>
            </div>

            <SaveBtn />
          </form>
        </Modal>
      )}

      {delTarget && <DeleteConfirm name={delTarget.title} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDel(null)} />}
    </div>
  );
}
