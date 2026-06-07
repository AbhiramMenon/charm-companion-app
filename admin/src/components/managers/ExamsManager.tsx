import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../../App";
import { uid, type Exam } from "../../lib/data";
import { examsApi } from "../../lib/adminApi";
import { Modal, Field, Input, Textarea, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const ACCENTS = [
  { label: "Amber",  value: "from-amber-400/30 to-amber-700/10"   },
  { label: "Rose",   value: "from-rose-400/30 to-rose-700/10"     },
  { label: "Emerald",value: "from-emerald-400/30 to-emerald-700/10"},
  { label: "Sky",    value: "from-sky-400/30 to-sky-700/10"       },
  { label: "Violet", value: "from-violet-400/30 to-violet-700/10" },
  { label: "Cyan",   value: "from-cyan-400/30 to-cyan-700/10"     },
];

const empty = (): Omit<Exam, "id"> => ({ name: "", short: "", description: "", subjects: 0, tricks: 0, accent: ACCENTS[0].value });

export function ExamsManager() {
  const { store, refresh } = useStore();
  const [modal, setModal] = useState<"add" | Exam | null>(null);
  const [delTarget, setDelTarget] = useState<Exam | null>(null);
  const [form, setForm] = useState(empty());
  const { page, setPage, pageItems, totalPages } = usePagination(store.exams, 15);

  const openAdd = () => { setForm(empty()); setModal("add"); };
  const openEdit = (e: Exam) => { setForm({ name: e.name, short: e.short, description: e.description, subjects: e.subjects, tricks: e.tricks, accent: e.accent }); setModal(e); };

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modal === "add") {
        await examsApi.create({ id: uid(), name: form.name, short: form.short, description: form.description, accent: form.accent, is_active: true, sort_order: store.exams.length });
      } else if (modal) {
        await examsApi.update((modal as Exam).id, { name: form.name, short: form.short, description: form.description, accent: form.accent });
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (exam: Exam) => {
    try { await examsApi.delete(exam.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDelTarget(null);
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Exams</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{store.exams.length} total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
          <Plus className="h-4 w-4" /> Add Exam
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Short</th>
              <th className="px-5 py-3 text-left">Description</th>
              <th className="px-5 py-3 text-right">Subjects</th>
              <th className="px-5 py-3 text-right">Tricks</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {pageItems.map((exam) => (
              <tr key={exam.id} className="hover:bg-[var(--surface-2)] transition-colors">
                <td className="px-5 py-3 font-semibold text-[var(--foreground)]">{exam.name}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-lg bg-linear-to-br ${exam.accent} px-2 py-0.5 text-xs font-bold text-[var(--foreground)]`}>{exam.short}</span>
                </td>
                <td className="px-5 py-3 text-[var(--muted-foreground)] max-w-xs truncate">{exam.description}</td>
                <td className="px-5 py-3 text-right text-[var(--foreground)]">{exam.subjects}</td>
                <td className="px-5 py-3 text-right text-[var(--foreground)]">{exam.tricks}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(exam)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDelTarget(exam)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {store.exams.length === 0 && <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">No exams yet. Add one above.</p>}
        <div className="px-5 pb-3"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Exam" : "Edit Exam"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Exam Name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="UPSC CSE" required /></Field>
            <Field label="Short Code"><Input value={form.short} onChange={(e) => set("short", e.target.value)} placeholder="UPSC" required maxLength={6} /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Civil Services Examination" /></Field>
            <Field label="Accent Color">
              <div className="grid grid-cols-3 gap-2 mt-1">
                {ACCENTS.map((a) => (
                  <button key={a.value} type="button" onClick={() => set("accent", a.value)}
                    className={`rounded-lg border p-2 text-xs font-semibold transition-all bg-linear-to-br ${a.value} ${form.accent === a.value ? "border-[var(--gold)] ring-1 ring-[var(--gold)]" : "border-[var(--border)]"}`}>
                    {a.label}
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
