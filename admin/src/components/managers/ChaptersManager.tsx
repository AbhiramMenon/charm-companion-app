import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../../App";
import { uid, type Chapter } from "../../lib/data";
import { chaptersApi } from "../../lib/adminApi";
import { Modal, Field, Input, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const empty = (subjectId = ""): Omit<Chapter, "id"> => ({ name: "", subjectId, tricksCount: 0, progress: 0, icon: "📖" });

export function ChaptersManager() {
  const { store, refresh } = useStore();
  const [modal, setModal]     = useState<"add" | Chapter | null>(null);
  const [delTarget, setDel]   = useState<Chapter | null>(null);
  const [form, setForm]       = useState(empty());

  // Filter-panel cascade
  const [filterExam, setFE]    = useState("");
  const [filterSubject, setFS] = useState("");

  // Modal-form cascade
  const [mExam, setMExam]       = useState("");
  const [mSubject, setMSubject] = useState("");

  // Filter options
  const filterSubjectOpts = store.subjects.filter((s) => !filterExam || s.examId === filterExam);
  const allFiltered = store.chapters.filter((c) => {
    if (filterSubject && c.subjectId !== filterSubject) return false;
    if (filterExam && !filterSubjectOpts.some((s) => s.id === c.subjectId)) return false;
    return true;
  });
  const { page, setPage, pageItems: filtered, totalPages } = usePagination(allFiltered, 15);

  // Modal options
  const mSubjectOpts = store.subjects.filter((s) => !mExam || s.examId === mExam);

  const changeFilterExam = (v: string) => { setFE(v); setFS(""); };

  const openAdd = () => {
    // Pre-seed modal exam/subject from active filters if set
    const subject = filterSubject ? store.subjects.find((s) => s.id === filterSubject) : null;
    const exam    = subject ? store.exams.find((e) => e.id === subject.examId) : null;
    setMExam(exam?.id ?? filterExam ?? "");
    setMSubject(filterSubject ?? "");
    setForm(empty(filterSubject ?? ""));
    setModal("add");
  };

  const openEdit = (c: Chapter) => {
    const subject = store.subjects.find((s) => s.id === c.subjectId);
    const exam    = subject ? store.exams.find((e) => e.id === subject.examId) : null;
    setMExam(exam?.id ?? "");
    setMSubject(subject?.id ?? "");
    setForm({ name: c.name, subjectId: c.subjectId, tricksCount: c.tricksCount, progress: c.progress, icon: c.icon });
    setModal(c);
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onMExamChange = (v: string) => {
    setMExam(v); setMSubject("");
    setForm((f) => ({ ...f, subjectId: "" }));
  };
  const onMSubjectChange = (v: string) => {
    setMSubject(v);
    setForm((f) => ({ ...f, subjectId: v }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId) { alert("Please select a subject."); return; }
    try {
      if (modal === "add") {
        await chaptersApi.create({ id: uid(), name: form.name, subject_id: form.subjectId, icon: form.icon ?? null, sort_order: store.chapters.length });
      } else if (modal) {
        await chaptersApi.update((modal as Chapter).id, { name: form.name, icon: form.icon ?? null });
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (ch: Chapter) => {
    try { await chaptersApi.delete(ch.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDel(null);
  };

  const topicCount  = (chId: string) => store.topics.filter((t) => t.chapterId === chId).length;
  const tricksCount = (chId: string) => {
    const topicIds = store.topics.filter((t) => t.chapterId === chId).map((t) => t.id);
    return store.tricks.filter((tr) => topicIds.includes(tr.topic)).length;
  };
  const notesCount  = (chId: string) => {
    const topicIds = store.topics.filter((t) => t.chapterId === chId).map((t) => t.id);
    return store.notes.filter((n) => topicIds.includes(n.topicId)).length;
  };

  const selClass = "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none";

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Chapters</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{allFiltered.length} shown</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={filterExam} onChange={(e) => changeFilterExam(e.target.value)} className={selClass}>
            <option value="">All Exams</option>
            {store.exams.map((e) => <option key={e.id} value={e.id}>{e.short}</option>)}
          </select>
          <select value={filterSubject} onChange={(e) => setFS(e.target.value)} className={selClass} disabled={!filterSubjectOpts.length}>
            <option value="">All Subjects</option>
            {filterSubjectOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
            <Plus className="h-4 w-4" /> Add Chapter
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Chapter</th>
              <th className="px-5 py-3 text-left">Exam / Subject</th>
              <th className="px-5 py-3 text-right">Topics</th>
              <th className="px-5 py-3 text-right">Tricks</th>
              <th className="px-5 py-3 text-right">Notes</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map((ch) => {
              const sub  = store.subjects.find((s) => s.id === ch.subjectId);
              const exam = sub ? store.exams.find((e) => e.id === sub.examId) : null;
              return (
                <tr key={ch.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ch.icon ?? "📖"}</span>
                      <span className="font-semibold text-[var(--foreground)]">{ch.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted-foreground)]">
                    {exam && <span className="mr-1.5 rounded-full bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--gold)]">{exam.short}</span>}
                    {sub ? <><span className="mr-1">{sub.icon}</span>{sub.name}</> : ch.subjectId}
                  </td>
                  <td className="px-5 py-3 text-right text-[var(--foreground)]">{topicCount(ch.id)}</td>
                  <td className="px-5 py-3 text-right text-[var(--gold)] font-semibold">{tricksCount(ch.id)}</td>
                  <td className="px-5 py-3 text-right text-sky-400">{notesCount(ch.id)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(ch)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDel(ch)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {allFiltered.length === 0 && <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">No chapters found.</p>}
        <div className="px-5 pb-3"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Chapter" : "Edit Chapter"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Chapter Name">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ancient India" required />
            </Field>
            <Field label="Icon (emoji)">
              <Input value={form.icon ?? ""} onChange={(e) => set("icon", e.target.value)} placeholder="🏺" maxLength={4} />
            </Field>

            {/* Exam → Subject cascade */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Link to Subject (Exam → Subject)</p>
              <Field label="Exam">
                <Select value={mExam} onChange={(e) => onMExamChange(e.target.value)}>
                  <option value="">— select exam —</option>
                  {store.exams.map((e) => <option key={e.id} value={e.id}>{e.short} – {e.name}</option>)}
                </Select>
              </Field>
              <Field label="Subject *">
                <Select value={mSubject} onChange={(e) => onMSubjectChange(e.target.value)} disabled={!mSubjectOpts.length} required>
                  <option value="">— select subject —</option>
                  {mSubjectOpts.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
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
