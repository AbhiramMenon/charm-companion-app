import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, Map, Link, Upload, Loader2 } from "lucide-react";
import { useStore } from "../../App";
import { type TopicMap } from "../../lib/data";
import { mapsApi, storageApi } from "../../lib/adminApi";
import { Modal, Field, Input, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const empty = (topicId = ""): Omit<TopicMap, "id"> => ({
  topicId, title: "", imageUrl: "", sortOrder: 0,
});

type ImageMode = "url" | "upload";

export function MapsManager() {
  const { store, refresh } = useStore();
  const [modal, setModal]       = useState<"add" | TopicMap | null>(null);
  const [delTarget, setDel]     = useState<TopicMap | null>(null);
  const [form, setForm]         = useState(empty());
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [imageMode, setImageMode] = useState<ImageMode>("url");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter panel cascade
  const [fExam, setFExam]       = useState("");
  const [fSubject, setFSubject] = useState("");
  const [fChapter, setFChapter] = useState("");
  const [fTopic, setFTopic]     = useState("");

  // Modal cascade
  const [mExam, setMExam]       = useState("");
  const [mSubject, setMSubject] = useState("");
  const [mChapter, setMChapter] = useState("");

  // Filter options
  const fSubjectOpts = store.subjects.filter((s) => !fExam    || s.examId    === fExam);
  const fChapterOpts = store.chapters.filter((c) => !fSubject || c.subjectId === fSubject);
  const fTopicOpts   = store.topics.filter((t)   => !fChapter || t.chapterId === fChapter);

  const maps = store.maps ?? [];

  const allFiltered = maps.filter((m) => {
    if (fTopic   && m.topicId !== fTopic) return false;
    if (fChapter && !fTopicOpts.some((t) => t.id === m.topicId)) return false;
    if (fSubject && !fChapterOpts.some((c) => fTopicOpts.some((t) => t.id === m.topicId && t.chapterId === c.id))) return false;
    if (fExam    && !fSubjectOpts.some((s) => {
      const chaps = store.chapters.filter((c) => c.subjectId === s.id);
      const tops  = store.topics.filter((t) => chaps.some((c) => c.id === t.chapterId));
      return tops.some((t) => t.id === m.topicId);
    })) return false;
    return true;
  });
  const { page, setPage, pageItems: filtered, totalPages } = usePagination(allFiltered, 15);

  // Modal options
  const mSubjectOpts = store.subjects.filter((s) => !mExam    || s.examId    === mExam);
  const mChapterOpts = store.chapters.filter((c) => !mSubject || c.subjectId === mSubject);
  const mTopicOpts   = store.topics.filter((t)   => !mChapter || t.chapterId === mChapter);

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
    setForm(empty(fTopic));
    setImageMode("url");
    setUploadError("");
    setError("");
    setModal("add");
  };

  const openEdit = (m: TopicMap) => {
    const topic   = store.topics.find((t) => t.id === m.topicId);
    const chapter = topic ? store.chapters.find((c) => c.id === topic.chapterId) : null;
    const subject = chapter ? store.subjects.find((s) => s.id === chapter.subjectId) : null;
    setMExam(subject ? (store.exams.find((e) => e.id === subject.examId)?.id ?? "") : "");
    setMSubject(subject?.id ?? "");
    setMChapter(chapter?.id ?? "");
    setForm({ topicId: m.topicId, title: m.title, imageUrl: m.imageUrl, sortOrder: m.sortOrder });
    setImageMode("url");
    setUploadError("");
    setError("");
    setModal(m);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const url = await storageApi.uploadMapImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err: any) {
      setUploadError(err.message ?? "Upload failed. Make sure the map-images bucket exists in Supabase Storage.");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topicId) { setError("Please select a topic."); return; }
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.imageUrl.trim()) { setError("Image is required — add a URL or upload a file."); return; }
    setSaving(true);
    setError("");
    try {
      if (modal === "add") {
        await mapsApi.create({ topic_id: form.topicId, title: form.title.trim(), image_url: form.imageUrl.trim(), sort_order: form.sortOrder });
      } else if (modal && typeof modal === "object") {
        await mapsApi.update(modal.id, { topic_id: form.topicId, title: form.title.trim(), image_url: form.imageUrl.trim(), sort_order: form.sortOrder });
      }
      await refresh();
      setModal(null);
    } catch (e: any) {
      setError(e.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = () => {
    if (!delTarget) return;
    setSaving(true);
    mapsApi.remove(delTarget.id).then(() => refresh()).then(() => setDel(null)).catch((e: any) => setError(e.message ?? "Delete failed.")).finally(() => setSaving(false));
  };

  const topicName = (id: string) => store.topics.find((t) => t.id === id)?.name ?? id;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--foreground)]">Topic Maps</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[#1a1410] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Map
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <select value={fExam} onChange={(e) => changeFilterExam(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]">
          <option value="">All Exams</option>
          {store.exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={fSubject} onChange={(e) => changeFilterSubject(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]">
          <option value="">All Subjects</option>
          {fSubjectOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={fChapter} onChange={(e) => changeFilterChapter(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]">
          <option value="">All Chapters</option>
          {fChapterOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={fTopic} onChange={(e) => setFTopic(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]">
          <option value="">All Topics</option>
          {fTopicOpts.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
              <th className="px-4 py-3 font-semibold">Preview</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Topic</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[var(--muted-foreground)]">
                  <Map className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  No maps yet. Add your first map image.
                </td>
              </tr>
            )}
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]">
                <td className="px-4 py-3">
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    className="h-12 w-20 rounded-lg object-cover border border-[var(--border)]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </td>
                <td className="px-4 py-3 font-medium text-[var(--foreground)]">{m.title}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">{topicName(m.topicId)}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">{m.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(m)} className="rounded-lg p-1.5 hover:bg-[var(--border)] text-[var(--muted-foreground)]"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDel(m)} className="rounded-lg p-1.5 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Add / Edit Modal */}
      {modal !== null && (
        <Modal title={modal === "add" ? "Add Map" : "Edit Map"} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Exam">
              <Select value={mExam} onChange={(e) => { setMExam(e.target.value); setMSubject(""); setMChapter(""); setForm((f) => ({ ...f, topicId: "" })); }}>
                <option value="">Select exam</option>
                {store.exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
            <Field label="Subject">
              <Select value={mSubject} onChange={(e) => { setMSubject(e.target.value); setMChapter(""); setForm((f) => ({ ...f, topicId: "" })); }}>
                <option value="">Select subject</option>
                {mSubjectOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Chapter">
              <Select value={mChapter} onChange={(e) => { setMChapter(e.target.value); setForm((f) => ({ ...f, topicId: "" })); }}>
                <option value="">Select chapter</option>
                {mChapterOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Topic">
              <Select value={form.topicId} onChange={(e) => setForm((f) => ({ ...f, topicId: e.target.value }))}>
                <option value="">Select topic</option>
                {mTopicOpts.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </Field>
            <Field label="Title">
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Rivers of India" />
            </Field>

            {/* Image — URL or Upload toggle */}
            <Field label="Image">
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
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
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
            </Field>

            {/* Image preview (shown for both modes when URL is set) */}
            {form.imageUrl && !uploading && (
              <img
                src={form.imageUrl}
                alt="preview"
                className="w-full rounded-xl border border-[var(--border)] object-contain max-h-48"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            <Field label="Sort Order">
              <Input type="number" value={String(form.sortOrder)} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} placeholder="0" />
            </Field>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <SaveBtn loading={saving} />
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {delTarget && (
        <DeleteConfirm
          name={delTarget.title}
          onConfirm={doDelete}
          onCancel={() => setDel(null)}
        />
      )}
    </div>
  );
}
