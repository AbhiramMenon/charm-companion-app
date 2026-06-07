import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../../App";
import { uid, type Topic } from "../../lib/data";
import { topicsApi } from "../../lib/adminApi";
import { Modal, Field, Input, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const empty = (chapterId = ""): Omit<Topic, "id"> => ({ name: "", chapterId, tricksCount: 0, icon: "" });

export function TopicsManager() {
  const { store, refresh } = useStore();
  const [modal, setModal]      = useState<"add" | Topic | null>(null);
  const [delTarget, setDel]    = useState<Topic | null>(null);
  const [form, setForm]        = useState(empty());

  // Filter-panel cascade
  const [filterExam, setFE]    = useState("");
  const [filterSubject, setFS] = useState("");
  const [filterChapter, setFC] = useState("");

  // Modal-form cascade
  const [mExam, setMExam]       = useState("");
  const [mSubject, setMSubject] = useState("");
  const [mChapter, setMChapter] = useState("");

  // Filter options
  const filterSubjectOpts = store.subjects.filter((s) => !filterExam    || s.examId    === filterExam);
  const filterChapterOpts = store.chapters.filter((c) => !filterSubject || c.subjectId === filterSubject);

  const allFiltered = store.topics.filter((t) => {
    if (filterChapter && t.chapterId !== filterChapter) return false;
    if (filterSubject && !filterChapterOpts.some((c) => c.id === t.chapterId)) return false;
    if (filterExam    && !filterSubjectOpts.some((s) => filterChapterOpts.some((c) => c.subjectId === s.id && c.id === t.chapterId))) return false;
    return true;
  });
  const { page, setPage, pageItems: filtered, totalPages } = usePagination(allFiltered, 15);

  // Modal options
  const mSubjectOpts = store.subjects.filter((s) => !mExam    || s.examId    === mExam);
  const mChapterOpts = store.chapters.filter((c) => !mSubject || c.subjectId === mSubject);

  // Filter cascades
  const changeFilterExam    = (v: string) => { setFE(v); setFS(""); setFC(""); };
  const changeFilterSubject = (v: string) => { setFS(v); setFC(""); };

  const openAdd = () => {
    const chapter = filterChapter ? store.chapters.find((c) => c.id === filterChapter) : null;
    const subject = chapter ? store.subjects.find((s) => s.id === chapter.subjectId) : null;
    const exam    = subject ? store.exams.find((e) => e.id === subject.examId) : null;
    setMExam(exam?.id ?? filterExam ?? "");
    setMSubject(subject?.id ?? filterSubject ?? "");
    setMChapter(chapter?.id ?? filterChapter ?? "");
    setForm(empty(chapter?.id ?? filterChapter ?? ""));
    setModal("add");
  };

  const openEdit = (t: Topic) => {
    const chapter = store.chapters.find((c) => c.id === t.chapterId);
    const subject = chapter ? store.subjects.find((s) => s.id === chapter.subjectId) : null;
    const exam    = subject ? store.exams.find((e) => e.id === subject.examId) : null;
    setMExam(exam?.id ?? "");
    setMSubject(subject?.id ?? "");
    setMChapter(chapter?.id ?? "");
    setForm({ name: t.name, chapterId: t.chapterId, tricksCount: t.tricksCount, icon: t.icon ?? "" });
    setModal(t);
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onMExamChange = (v: string) => {
    setMExam(v); setMSubject(""); setMChapter("");
    setForm((f) => ({ ...f, chapterId: "" }));
  };
  const onMSubjectChange = (v: string) => {
    setMSubject(v); setMChapter("");
    setForm((f) => ({ ...f, chapterId: "" }));
  };
  const onMChapterChange = (v: string) => {
    setMChapter(v);
    setForm((f) => ({ ...f, chapterId: v }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chapterId) { alert("Please select a chapter."); return; }
    try {
      if (modal === "add") {
        await topicsApi.create({ id: uid(), name: form.name, chapter_id: form.chapterId, icon: form.icon || null, sort_order: store.topics.length });
      } else if (modal) {
        await topicsApi.update((modal as Topic).id, { name: form.name, icon: form.icon || null });
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (t: Topic) => {
    try { await topicsApi.delete(t.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDel(null);
  };

  const tricksCount = (topicId: string) => store.tricks.filter((tr) => tr.topic === topicId).length;
  const notesCount  = (topicId: string) => store.notes.filter((n)  => n.topicId === topicId).length;

  const selClass = "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none";

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Topics</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{allFiltered.length} shown</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={filterExam} onChange={(e) => changeFilterExam(e.target.value)} className={selClass}>
            <option value="">All Exams</option>
            {store.exams.map((e) => <option key={e.id} value={e.id}>{e.short}</option>)}
          </select>
          <select value={filterSubject} onChange={(e) => changeFilterSubject(e.target.value)} className={selClass} disabled={!filterSubjectOpts.length}>
            <option value="">All Subjects</option>
            {filterSubjectOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterChapter} onChange={(e) => setFC(e.target.value)} className={selClass} disabled={!filterSubject}>
            <option value="">All Chapters</option>
            {filterChapterOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
            <Plus className="h-4 w-4" /> Add Topic
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Topic</th>
              <th className="px-5 py-3 text-left">Exam / Chapter</th>
              <th className="px-5 py-3 text-right">Tricks</th>
              <th className="px-5 py-3 text-right">Notes</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map((t) => {
              const ch   = store.chapters.find((c) => c.id === t.chapterId);
              const sub  = ch ? store.subjects.find((s) => s.id === ch.subjectId) : null;
              const exam = sub ? store.exams.find((e) => e.id === sub.examId) : null;
              return (
                <tr key={t.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {t.icon && <span className="text-base">{t.icon}</span>}
                      <span className="font-semibold text-[var(--foreground)]">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted-foreground)]">
                    {exam && <span className="mr-1.5 rounded-full bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--gold)]">{exam.short}</span>}
                    {sub && <span className="mr-1 text-[11px]">{sub.name} ›</span>}
                    {ch?.name ?? t.chapterId}
                  </td>
                  <td className="px-5 py-3 text-right text-[var(--gold)] font-semibold">{tricksCount(t.id)}</td>
                  <td className="px-5 py-3 text-right text-sky-400">{notesCount(t.id)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(t)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDel(t)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {allFiltered.length === 0 && <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">No topics found.</p>}
        <div className="px-5 pb-3"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Topic" : "Edit Topic"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Topic Name">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Indus Valley Civilization" required />
            </Field>
            <Field label="Icon (emoji, optional)">
              <Input value={form.icon ?? ""} onChange={(e) => set("icon", e.target.value)} placeholder="🌊" maxLength={4} />
            </Field>

            {/* Exam → Subject → Chapter cascade */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Link to Chapter (Exam → Subject → Chapter)</p>
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
              <Field label="Chapter *">
                <Select value={mChapter} onChange={(e) => onMChapterChange(e.target.value)} disabled={!mSubject} required>
                  <option value="">— select chapter —</option>
                  {mChapterOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
            </div>

            <SaveBtn />
          </form>
        </Modal>
      )}

      {delTarget && <DeleteConfirm name={delTarget.name} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDel(null)} />}
    </div>
  );
}
