import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../../App";
import { uid, type ExamNews, type NewsTag } from "../../lib/data";
import { newsApi } from "../../lib/adminApi";
import { Modal, Field, Input, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const TAGS: NewsTag[] = ["Notification", "Admit Card", "Result", "Exam Date"];
const TAG_COLOR: Record<NewsTag, string> = {
  Notification: "bg-amber-400/15 text-amber-400",
  "Admit Card": "bg-sky-400/15 text-sky-400",
  Result:       "bg-emerald-400/15 text-emerald-400",
  "Exam Date":  "bg-violet-400/15 text-violet-400",
};

const empty = (): Omit<ExamNews, "id"> => ({ exam: "", title: "", date: "", tag: "Notification", accent: "from-amber-500/30 to-amber-900/10" });

const ACCENTS = [
  { label: "Amber",  value: "from-amber-500/30 to-amber-900/10"   },
  { label: "Emerald",value: "from-emerald-500/30 to-emerald-900/10"},
  { label: "Rose",   value: "from-rose-500/30 to-rose-900/10"     },
  { label: "Sky",    value: "from-sky-500/30 to-sky-900/10"       },
  { label: "Cyan",   value: "from-cyan-500/30 to-cyan-900/10"     },
  { label: "Violet", value: "from-violet-500/30 to-violet-900/10" },
];

export function NewsManager() {
  const { store, refresh } = useStore();
  const [modal, setModal] = useState<"add" | ExamNews | null>(null);
  const [delTarget, setDelTarget] = useState<ExamNews | null>(null);
  const [form, setForm] = useState(empty());
  const { page, setPage, pageItems, totalPages } = usePagination(store.news, 15);

  const openAdd = () => { setForm(empty()); setModal("add"); };
  const openEdit = (n: ExamNews) => { setForm({ exam: n.exam, title: n.title, date: n.date, tag: n.tag, accent: n.accent }); setModal(n); };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modal === "add") {
        await newsApi.create({ id: uid(), exam_id: form.exam, title: form.title, date_label: form.date || null, tag: form.tag, accent: form.accent || null, is_active: true });
      } else if (modal) {
        await newsApi.update((modal as ExamNews).id, { exam_id: form.exam, title: form.title, date_label: form.date || null, tag: form.tag, accent: form.accent || null });
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (n: ExamNews) => {
    try { await newsApi.delete(n.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDelTarget(null);
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Exam News</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{store.news.length} items</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
          <Plus className="h-4 w-4" /> Add News
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Exam</th>
              <th className="px-5 py-3 text-left">Title</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Tag</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {pageItems.map((item) => (
              <tr key={item.id} className="hover:bg-[var(--surface-2)] transition-colors">
                <td className="px-5 py-3 font-bold text-[var(--gold)]">{item.exam}</td>
                <td className="px-5 py-3 text-[var(--foreground)] max-w-xs truncate">{item.title}</td>
                <td className="px-5 py-3 text-[var(--muted-foreground)] whitespace-nowrap">{item.date}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TAG_COLOR[item.tag]}`}>{item.tag}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(item)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDelTarget(item)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {store.news.length === 0 && <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">No news items yet.</p>}
        <div className="px-5 pb-3"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add News Item" : "Edit News Item"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Exam Short Name"><Input value={form.exam} onChange={(e) => set("exam", e.target.value)} placeholder="UPSC" required maxLength={10} /></Field>
            <Field label="Headline"><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Prelims 2026 notification released" required /></Field>
            <Field label="Date"><Input value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="Feb 14" required /></Field>
            <Field label="Tag">
              <Select value={form.tag} onChange={(e) => set("tag", e.target.value as NewsTag)}>
                {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Accent">
              <div className="grid grid-cols-3 gap-2 mt-1">
                {ACCENTS.map((a) => (
                  <button key={a.value} type="button" onClick={() => set("accent", a.value)}
                    className={`rounded-lg border p-2 text-xs font-semibold bg-linear-to-br ${a.value} ${form.accent === a.value ? "border-[var(--gold)] ring-1 ring-[var(--gold)]" : "border-[var(--border)]"}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </Field>
            <SaveBtn />
          </form>
        </Modal>
      )}

      {delTarget && <DeleteConfirm name={delTarget.title} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDelTarget(null)} />}
    </div>
  );
}
