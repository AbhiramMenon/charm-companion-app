import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../../App";
import { uid, type Subject } from "../../lib/data";
import { subjectsApi } from "../../lib/adminApi";
import { Modal, Field, Input, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";
import { useSort, Th } from "../Sort";

const empty = (examId = ""): Omit<Subject, "id"> => ({ name: "", icon: "📚", chapters: 0, examId, color: "from-amber-500/25 to-amber-900/5" });

const COLORS = [
  { label: "Amber",  value: "from-amber-500/25 to-amber-900/5"   },
  { label: "Rose",   value: "from-rose-500/25 to-rose-900/5"     },
  { label: "Sky",    value: "from-sky-500/25 to-sky-900/5"       },
  { label: "Emerald",value: "from-emerald-500/25 to-emerald-900/5"},
  { label: "Violet", value: "from-violet-500/25 to-violet-900/5" },
  { label: "Cyan",   value: "from-cyan-500/25 to-cyan-900/5"     },
];

export function SubjectsManager() {
  const { store, refresh } = useStore();
  const [modal, setModal] = useState<"add" | Subject | null>(null);
  const [delTarget, setDelTarget] = useState<Subject | null>(null);
  const [form, setForm] = useState(empty());
  const [filterExam, setFilterExam] = useState("");

  const allFiltered = filterExam ? store.subjects.filter((s) => s.examId === filterExam) : store.subjects;
  const { sortField, sortDir, toggle, sorted } = useSort(allFiltered as unknown as Record<string, unknown>[], "name");
  const { page, setPage, pageItems: filtered, totalPages } = usePagination(sorted as unknown as typeof allFiltered, 15);

  const openAdd = () => { setForm(empty(filterExam)); setModal("add"); };
  const openEdit = (s: Subject) => {
    setForm({ name: s.name, icon: s.icon, chapters: s.chapters, examId: s.examId, color: s.color });
    setModal(s);
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modal === "add") {
        await subjectsApi.create({ id: uid(), name: form.name, icon: form.icon, exam_id: form.examId, color: form.color, sort_order: store.subjects.length });
      } else if (modal) {
        await subjectsApi.update((modal as Subject).id, { name: form.name, icon: form.icon, color: form.color });
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (sub: Subject) => {
    try { await subjectsApi.delete(sub.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDelTarget(null);
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Subjects</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{allFiltered.length} shown</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none"
          >
            <option value="">All Exams</option>
            {store.exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
            <Plus className="h-4 w-4" /> Add Subject
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
              <Th field="name"     label="Subject"  sortField={sortField} sortDir={sortDir} onToggle={toggle} />
              <Th field="examId"   label="Exam"     sortField={sortField} sortDir={sortDir} onToggle={toggle} />
              <Th field="chapters" label="Chapters" sortField={sortField} sortDir={sortDir} onToggle={toggle} align="right" />
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map((sub) => {
              const exam = store.exams.find((e) => e.id === sub.examId);
              return (
                <tr key={sub.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sub.icon}</span>
                      <span className="font-semibold text-[var(--foreground)]">{sub.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted-foreground)]">{exam?.short ?? sub.examId}</td>
                  <td className="px-5 py-3 text-right text-[var(--foreground)]">{sub.chapters}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(sub)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDelTarget(sub)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {allFiltered.length === 0 && <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">No subjects found.</p>}
        <div className="px-5 pb-3"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Subject" : "Edit Subject"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Subject Name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="History" required /></Field>
            <Field label="Icon (emoji)"><Input value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="📜" maxLength={4} /></Field>
            <Field label="Exam">
              <Select value={form.examId} onChange={(e) => set("examId", e.target.value)} required>
                <option value="">— select exam —</option>
                {store.exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </Select>
            </Field>
            <Field label="Color Theme">
              <div className="grid grid-cols-3 gap-2 mt-1">
                {COLORS.map((c) => (
                  <button key={c.value} type="button" onClick={() => set("color", c.value)}
                    className={`rounded-lg border p-2 text-xs font-semibold bg-linear-to-br ${c.value} ${form.color === c.value ? "border-[var(--gold)] ring-1 ring-[var(--gold)]" : "border-[var(--border)]"}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>
            <SaveBtn />
          </form>
        </Modal>
      )}

      {delTarget && <DeleteConfirm name={delTarget.name} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDelTarget(null)} />}
    </div>
  );
}
