import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../../App";
import { uid, type ShortNote } from "../../lib/data";
import { notesApi } from "../../lib/adminApi";
import { Modal, Field, Input, Textarea, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const empty = (topicId = ""): Omit<ShortNote, "id"> => ({ topicId, title: "", content: "", isCustom: false });

export function NotesManager() {
  const { store, refresh } = useStore();
  const [modal, setModal]    = useState<"add" | ShortNote | null>(null);
  const [delTarget, setDel]  = useState<ShortNote | null>(null);
  const [form, setForm]      = useState(empty());

  // Filter-panel cascade
  const [fExam, setFExam]       = useState("");
  const [fSubject, setFSubject] = useState("");
  const [fChapter, setFChapter] = useState("");
  const [fTopic, setFTopic]     = useState("");

  // Modal-form cascade
  const [mExam, setMExam]       = useState("");
  const [mSubject, setMSubject] = useState("");
  const [mChapter, setMChapter] = useState("");

  // Filter options
  const fSubjectOpts = store.subjects.filter((s) => !fExam    || s.examId    === fExam);
  const fChapterOpts = store.chapters.filter((c) => !fSubject || c.subjectId === fSubject);
  const fTopicOpts   = store.topics.filter((t)   => !fChapter || t.chapterId === fChapter);

  const allFiltered = store.notes.filter((n) => {
    if (fTopic   && n.topicId !== fTopic) return false;
    if (fChapter && !fTopicOpts.some((t) => t.id === n.topicId)) return false;
    if (fSubject && !fChapterOpts.some((c) => fTopicOpts.some((t) => t.id === n.topicId && t.chapterId === c.id))) return false;
    if (fExam    && !fSubjectOpts.some((s) => {
      const chaps = store.chapters.filter((c) => c.subjectId === s.id);
      const tops  = store.topics.filter((t) => chaps.some((c) => c.id === t.chapterId));
      return tops.some((t) => t.id === n.topicId);
    })) return false;
    return true;
  });
  const { page, setPage, pageItems: filtered, totalPages } = usePagination(allFiltered, 15);

  // Modal options
  const mSubjectOpts = store.subjects.filter((s) => !mExam    || s.examId    === mExam);
  const mChapterOpts = store.chapters.filter((c) => !mSubject || c.subjectId === mSubject);
  const mTopicOpts   = store.topics.filter((t)   => !mChapter || t.chapterId === mChapter);

  // Filter cascades
  const changeFilterExam    = (v: string) => { setFExam(v);    setFSubject(""); setFChapter(""); setFTopic(""); };
  const changeFilterSubject = (v: string) => { setFSubject(v); setFChapter(""); setFTopic(""); };
  const changeFilterChapter = (v: string) => { setFChapter(v); setFTopic(""); };

  const openAdd = () => {
    const topic   = fTopic   ? store.topics.find((t) => t.id === fTopic)     : null;
    const chapter = topic ? store.chapters.find((c) => c.id === topic.chapterId) : (fChapter ? store.chapters.find((c) => c.id === fChapter) : null);
    const subject = chapter ? store.subjects.find((s) => s.id === chapter.subjectId) : null;
    const exam    = subject ? store.exams.find((e) => e.id === subject.examId) : null;
    setMExam(exam?.id ?? "");
    setMSubject(subject?.id ?? "");
    setMChapter(chapter?.id ?? "");
    setForm(empty(topic?.id ?? ""));
    setModal("add");
  };

  const openEdit = (n: ShortNote) => {
    const topic   = store.topics.find((t) => t.id === n.topicId);
    const chapter = topic ? store.chapters.find((c) => c.id === topic.chapterId) : null;
    const subject = chapter ? store.subjects.find((s) => s.id === chapter.subjectId) : null;
    const exam    = subject ? store.exams.find((e) => e.id === subject.examId) : null;
    setMExam(exam?.id ?? "");
    setMSubject(subject?.id ?? "");
    setMChapter(chapter?.id ?? "");
    setForm({ topicId: n.topicId, title: n.title, content: n.content, isCustom: n.isCustom });
    setModal(n);
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onMExamChange = (v: string) => {
    setMExam(v); setMSubject(""); setMChapter("");
    setForm((f) => ({ ...f, topicId: "" }));
  };
  const onMSubjectChange = (v: string) => {
    setMSubject(v); setMChapter("");
    setForm((f) => ({ ...f, topicId: "" }));
  };
  const onMChapterChange = (v: string) => {
    setMChapter(v);
    setForm((f) => ({ ...f, topicId: "" }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topicId) { alert("Please select a topic."); return; }
    try {
      if (modal === "add") {
        await notesApi.create({ id: uid(), topic_id: form.topicId, title: form.title, content: form.content, is_custom: false, sort_order: store.notes.length });
      } else if (modal) {
        await notesApi.update((modal as ShortNote).id, { topic_id: form.topicId, title: form.title, content: form.content });
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (n: ShortNote) => {
    try { await notesApi.delete(n.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDel(null);
  };

  const selClass = "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none";

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Short Notes</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{allFiltered.length} shown of {store.notes.length}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={fExam} onChange={(e) => changeFilterExam(e.target.value)} className={selClass}>
            <option value="">All Exams</option>
            {store.exams.map((e) => <option key={e.id} value={e.id}>{e.short}</option>)}
          </select>
          <select value={fSubject} onChange={(e) => changeFilterSubject(e.target.value)} className={selClass} disabled={!fSubjectOpts.length}>
            <option value="">All Subjects</option>
            {fSubjectOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={fChapter} onChange={(e) => changeFilterChapter(e.target.value)} className={selClass} disabled={!fSubject}>
            <option value="">All Chapters</option>
            {fChapterOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={fTopic} onChange={(e) => setFTopic(e.target.value)} className={selClass} disabled={!fChapter}>
            <option value="">All Topics</option>
            {fTopicOpts.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
            <Plus className="h-4 w-4" /> Add Note
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((note) => {
          const topic   = store.topics.find((t) => t.id === note.topicId);
          const chapter = topic ? store.chapters.find((c) => c.id === topic.chapterId) : null;
          const subject = chapter ? store.subjects.find((s) => s.id === chapter.subjectId) : null;
          const exam    = subject ? store.exams.find((e) => e.id === subject.examId) : null;
          return (
            <div key={note.id} className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:bg-[var(--surface-2)] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  {exam    && <span className="rounded-full bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--gold)]">{exam.short}</span>}
                  {subject && <span className="text-[10px] text-[var(--muted-foreground)]">{subject.name}</span>}
                  {chapter && <span className="text-[10px] text-[var(--muted-foreground)]">› {chapter.name}</span>}
                  {topic   && <span className="text-[10px] font-semibold text-[var(--gold)]">› {topic.name}</span>}
                </div>
                <p className="font-semibold text-[var(--foreground)] text-sm">{note.title}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)] line-clamp-2">{note.content}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => openEdit(note)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setDel(note)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
        {allFiltered.length === 0 && <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">No notes found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {modal && (
        <Modal title={modal === "add" ? "Add Short Note" : "Edit Short Note"} onClose={() => setModal(null)} wide>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Note Title">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Key Points" required />
            </Field>
            <Field label="Content">
              <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={5} placeholder="Write the note content here…" required />
            </Field>

            {/* Exam → Subject → Chapter → Topic cascade */}
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
                  <Select value={form.topicId} onChange={(e) => set("topicId", e.target.value)} disabled={!mChapter} required>
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
