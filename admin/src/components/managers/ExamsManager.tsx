import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, Link, Upload, Loader2 } from "lucide-react";
import { useStore } from "../../App";
import { uid, type Exam } from "../../lib/data";
import { examsApi, storageApi } from "../../lib/adminApi";
import { Modal, Field, Input, Textarea, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";
import { useSort, Th } from "../Sort";

const ACCENTS = [
  { label: "Amber",   value: "from-amber-400/30 to-amber-700/10"    },
  { label: "Rose",    value: "from-rose-400/30 to-rose-700/10"      },
  { label: "Emerald", value: "from-emerald-400/30 to-emerald-700/10" },
  { label: "Sky",     value: "from-sky-400/30 to-sky-700/10"        },
  { label: "Violet",  value: "from-violet-400/30 to-violet-700/10"  },
  { label: "Cyan",    value: "from-cyan-400/30 to-cyan-700/10"      },
];

const MEDIUM_LABEL: Record<string, string> = { hindi: "Hindi", english: "English" };
const MEDIUM_STYLE: Record<string, string> = {
  hindi:   "bg-orange-400/15 text-orange-400 ring-orange-400/25",
  english: "bg-sky-400/15 text-sky-400 ring-sky-400/25",
};

type ImageMode = "url" | "upload";

const empty = (): Omit<Exam, "id"> => ({
  name: "", short: "", description: "", subjects: 0, tricks: 0,
  accent: ACCENTS[0].value, examDate: undefined, medium: "english", imageUrl: undefined,
});

export function ExamsManager() {
  const { store, refresh } = useStore();
  const [modal, setModal] = useState<"add" | Exam | null>(null);
  const [delTarget, setDelTarget] = useState<Exam | null>(null);
  const [form, setForm] = useState(empty());
  const [imageMode, setImageMode] = useState<ImageMode>("url");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sortField, sortDir, toggle, sorted } = useSort(store.exams as unknown as Record<string, unknown>[], "name");
  const { page, setPage, pageItems, totalPages } = usePagination(sorted as unknown as Exam[], 15);

  const openAdd = () => {
    setForm(empty());
    setImageMode("url");
    setUploadError("");
    setModal("add");
  };

  const openEdit = (e: Exam) => {
    setForm({
      name: e.name, short: e.short, description: e.description,
      subjects: e.subjects, tricks: e.tricks, accent: e.accent,
      examDate: e.examDate, medium: e.medium ?? "english", imageUrl: e.imageUrl,
    });
    setImageMode("url");
    setUploadError("");
    setModal(e);
  };

  const set = (k: keyof typeof form, v: string | number | undefined) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const url = await storageApi.uploadExamImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err: any) {
      setUploadError(err.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const examDate = form.examDate || null;
    const image_url = form.imageUrl?.trim() || null;
    try {
      if (modal === "add") {
        await examsApi.create({
          id: uid(), name: form.name, short: form.short,
          description: form.description, accent: form.accent,
          is_active: true, sort_order: store.exams.length,
          exam_date: examDate, medium: form.medium, image_url,
        });
      } else if (modal) {
        await examsApi.update((modal as Exam).id, {
          name: form.name, short: form.short, description: form.description,
          accent: form.accent, exam_date: examDate, medium: form.medium, image_url,
        });
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
              <th className="px-4 py-3 text-left font-semibold">Cover</th>
              <Th field="name"     label="Name"     sortField={sortField} sortDir={sortDir} onToggle={toggle} />
              <Th field="short"    label="Short"    sortField={sortField} sortDir={sortDir} onToggle={toggle} />
              <Th field="medium"   label="Medium"   sortField={sortField} sortDir={sortDir} onToggle={toggle} />
              <th className="px-5 py-3 text-left">Description</th>
              <Th field="subjects" label="Subjects" sortField={sortField} sortDir={sortDir} onToggle={toggle} align="right" />
              <Th field="tricks"   label="Tricks"   sortField={sortField} sortDir={sortDir} onToggle={toggle} align="right" />
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {pageItems.map((exam) => (
              <tr key={exam.id} className="hover:bg-[var(--surface-2)] transition-colors">
                <td className="px-4 py-3">
                  {exam.imageUrl ? (
                    <img
                      src={exam.imageUrl}
                      alt=""
                      className="h-10 w-16 rounded-lg object-cover border border-[var(--border)]"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className={`h-10 w-16 rounded-lg bg-gradient-to-br ${exam.accent} border border-[var(--border)]`} />
                  )}
                </td>
                <td className="px-5 py-3 font-semibold text-[var(--foreground)]">{exam.name}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-lg bg-linear-to-br ${exam.accent} px-2 py-0.5 text-xs font-bold text-[var(--foreground)]`}>{exam.short}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${MEDIUM_STYLE[exam.medium] ?? MEDIUM_STYLE.english}`}>
                    {MEDIUM_LABEL[exam.medium] ?? "English"}
                  </span>
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
            <Field label="Exam Name">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="UPSC CSE" required />
            </Field>
            <Field label="Short Code">
              <Input value={form.short} onChange={(e) => set("short", e.target.value)} placeholder="UPSC" required maxLength={6} />
            </Field>
            <Field label="Exam Medium">
              <Select value={form.medium} onChange={(e) => set("medium", e.target.value)} required>
                <option value="english">English Medium</option>
                <option value="hindi">Hindi Medium</option>
              </Select>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                Sets the primary content language for this exam. All content created under this exam will be in this medium.
              </p>
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Civil Services Examination" />
            </Field>
            <Field label="Exam Date (for countdown)">
              <input
                type="date"
                value={form.examDate ?? ""}
                onChange={(e) => set("examDate", e.target.value || undefined)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)] [color-scheme:dark]"
              />
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Sets the countdown date shown to mobile users. Leave blank to use default.</p>
            </Field>
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

            {/* Card cover image */}
            <Field label="Card Cover Image">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => { setImageMode("url"); setUploadError(""); }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    imageMode === "url"
                      ? "bg-gold border-gold text-[#1a1410]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link className="h-3 w-3" /> Image URL
                </button>
                <button
                  type="button"
                  onClick={() => { setImageMode("upload"); setUploadError(""); }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    imageMode === "upload"
                      ? "bg-gold border-gold text-[#1a1410]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="h-3 w-3" /> Upload File
                </button>
              </div>

              {imageMode === "url" ? (
                <Input
                  value={form.imageUrl ?? ""}
                  onChange={(e) => set("imageUrl", e.target.value || undefined)}
                  placeholder="https://... (optional)"
                />
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface px-4 py-6 text-sm text-muted-foreground hover:border-gold/50 hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload className="h-4 w-4" /> Click to choose an image file</>
                    )}
                  </button>
                  {uploadError && <p className="mt-1.5 text-xs text-destructive">{uploadError}</p>}
                  {form.imageUrl && !uploading && (
                    <p className="mt-1.5 text-xs text-muted-foreground truncate">✓ Uploaded: {form.imageUrl.split('/').pop()}</p>
                  )}
                </div>
              )}

              <p className="text-[11px] text-[var(--muted-foreground)] mt-1.5">
                Optional. Shown as the card background on the home screen. The accent gradient is overlaid on top for readability.
              </p>

              {/* Preview */}
              {form.imageUrl && !uploading && (
                <div className={`mt-2 relative w-40 overflow-hidden rounded-2xl border border-[var(--border)] h-24`}>
                  <img src={form.imageUrl} alt="preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${form.accent}`} />
                  <div className="absolute inset-0 flex items-end p-3">
                    <span className="text-xs font-bold text-white drop-shadow">{form.short || "SHORT"}</span>
                  </div>
                </div>
              )}
            </Field>

            <SaveBtn />
          </form>
        </Modal>
      )}

      {delTarget && <DeleteConfirm name={delTarget.name} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDelTarget(null)} />}
    </div>
  );
}
