import { useState } from "react";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";

export type CustomTrickDraft = {
  examId: string;
  subjectName: string;
  chapterName: string;
  topicName: string;
  title: string;
  content: string;
};

export function CustomTrickFormScreen({
  onSave,
  onBack,
}: {
  onSave: (draft: CustomTrickDraft) => Promise<void>;
  onBack: () => void;
}) {
  const { exams, subjects, chapters, topics } = useData();

  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredSubjects = subjects.filter((s) => s.examId === examId);
  const filteredChapters = chapters.filter((c) => c.subjectId === subjectId);
  const filteredTopics   = topics.filter((t) => t.chapterId === chapterId);

  const clearErr = (k: string) => setErrors((e) => { const n = { ...e }; delete n[k]; return n; });

  const handleExamChange = (id: string) => {
    setExamId(id); setSubjectId(""); setChapterId(""); setTopicId("");
    clearErr("examId");
  };
  const handleSubjectChange = (id: string) => {
    setSubjectId(id); setChapterId(""); setTopicId("");
    clearErr("subjectId");
  };
  const handleChapterChange = (id: string) => {
    setChapterId(id); setTopicId("");
    clearErr("chapterId");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!examId)    e.examId    = "Select an exam.";
    if (!subjectId) e.subjectId = "Select a subject.";
    if (!chapterId) e.chapterId = "Select a chapter.";
    if (!title.trim())   e.title   = "Title is required.";
    if (!content.trim()) e.content = "Trick content is required.";
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const exam    = exams.find((e) => e.id === examId);
      const subject = subjects.find((s) => s.id === subjectId);
      const chapter = chapters.find((c) => c.id === chapterId);
      const topic   = topics.find((t) => t.id === topicId);
      await onSave({
        examId,
        subjectName: subject?.name ?? "",
        chapterName: chapter?.name ?? "",
        topicName:   topic?.name ?? "",
        title:   title.trim(),
        content: content.trim(),
      });
    } catch (err: any) {
      setErrors({ _: err.message });
    } finally {
      setSaving(false);
    }
  };

  const selectCls = (k: string) => cn(
    "w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-foreground focus:outline-none transition-colors appearance-none",
    errors[k] ? "border-destructive/60" : "border-border focus:border-gold"
  );
  const inputCls = (k: string) => cn(
    "w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors",
    errors[k] ? "border-destructive/60" : "border-border focus:border-gold"
  );

  return (
    <div className="flex flex-1 flex-col overflow-y-auto pb-10">
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">My Tricks</p>
          <h1 className="text-xl font-bold text-foreground">Add Custom Trick</h1>
        </div>
      </header>

      <div className="px-5 space-y-4">
        <p className="text-xs text-muted-foreground">
          Add your own memory trick. Only you can see it — it'll appear in your Saved section.
        </p>

        {/* Exam */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Exam</label>
          <select value={examId} onChange={(e) => handleExamChange(e.target.value)} className={selectCls("examId")}>
            <option value="">Select exam…</option>
            {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
          {errors.examId && <p className="mt-1 text-[11px] text-destructive">{errors.examId}</p>}
        </div>

        {/* Subject */}
        {examId && (
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Subject</label>
            <select value={subjectId} onChange={(e) => handleSubjectChange(e.target.value)} className={selectCls("subjectId")}>
              <option value="">Select subject…</option>
              {filteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.subjectId && <p className="mt-1 text-[11px] text-destructive">{errors.subjectId}</p>}
          </div>
        )}

        {/* Chapter */}
        {subjectId && (
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Chapter</label>
            <select value={chapterId} onChange={(e) => handleChapterChange(e.target.value)} className={selectCls("chapterId")}>
              <option value="">Select chapter…</option>
              {filteredChapters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.chapterId && <p className="mt-1 text-[11px] text-destructive">{errors.chapterId}</p>}
          </div>
        )}

        {/* Topic (optional) */}
        {chapterId && filteredTopics.length > 0 && (
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Topic <span className="text-muted-foreground/50 font-normal normal-case">(optional)</span>
            </label>
            <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className={selectCls("topicId")}>
              <option value="">Select topic…</option>
              {filteredTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Trick Title</label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); clearErr("title"); }}
            placeholder="Give your trick a short name…"
            className={inputCls("title")}
          />
          {errors.title && <p className="mt-1 text-[11px] text-destructive">{errors.title}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="inline h-3 w-3 text-gold mr-1" />
            The Trick
          </label>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); clearErr("content"); }}
            rows={4}
            placeholder="Write your mnemonic, shortcut, or memory trick here…"
            className={`${inputCls("content")} resize-none`}
          />
          {errors.content && <p className="mt-1 text-[11px] text-destructive">{errors.content}</p>}
        </div>

        {errors._ && <p className="text-sm text-destructive">{errors._}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl gold-gradient py-4 text-base font-bold text-[#1a1410] shadow-lg active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "Saving…" : <><Check className="inline h-4 w-4 mr-1.5" />Save My Trick</>}
        </button>
      </div>
    </div>
  );
}
