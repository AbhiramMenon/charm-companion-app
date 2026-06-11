import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useStore } from "../../App";
import { mockQuestionsApi } from "../../lib/adminApi";
import type { MockQuestion } from "../../lib/data";

type Difficulty = "Easy" | "Medium" | "Hard";
type Option = "A" | "B" | "C" | "D";

type QForm = {
  examId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: Option;
  explanation: string;
  difficulty: Difficulty;
};

function emptyForm(examId = ""): QForm {
  return { examId, question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", explanation: "", difficulty: "Medium" };
}

function validateForm(f: QForm): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.examId)     e.examId   = "Select an exam.";
  if (!f.question.trim())   e.question = "Question is required.";
  if (!f.optionA.trim())    e.optionA  = "Option A is required.";
  if (!f.optionB.trim())    e.optionB  = "Option B is required.";
  if (!f.optionC.trim())    e.optionC  = "Option C is required.";
  if (!f.optionD.trim())    e.optionD  = "Option D is required.";
  return e;
}

const DIFF_COLOR: Record<Difficulty, string> = {
  Easy:   "bg-emerald-400/10 text-emerald-400",
  Medium: "bg-amber-400/10 text-amber-400",
  Hard:   "bg-rose-400/10 text-rose-400",
};

const OPT_LABELS: Option[] = ["A", "B", "C", "D"];

function QuestionForm({
  initial,
  examId,
  onSave,
  onCancel,
}: {
  initial: QForm;
  examId: string;
  onSave: (f: QForm) => Promise<void>;
  onCancel: () => void;
}) {
  const { store } = useStore();
  const [form, setForm] = useState<QForm>({ ...initial, examId: examId || initial.examId });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof QForm>(k: K, v: QForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try { await onSave(form); } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const inputCls = (key: string) =>
    `w-full rounded-xl border bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none transition-colors ${
      errors[key] ? "border-[var(--destructive)]/60" : "border-[var(--border)] focus:border-[var(--gold)]"
    }`;

  return (
    <div className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--surface)] p-5 space-y-4">
      {/* Exam selector (only shown when no fixed examId) */}
      {!examId && (
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Exam</label>
          <select
            value={form.examId}
            onChange={(e) => set("examId", e.target.value)}
            className={inputCls("examId")}
          >
            <option value="">Select exam…</option>
            {store.exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
          {errors.examId && <p className="mt-0.5 text-[11px] text-[var(--destructive)]">{errors.examId}</p>}
        </div>
      )}

      {/* Question */}
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Question</label>
        <textarea
          value={form.question}
          onChange={(e) => set("question", e.target.value)}
          rows={3}
          className={`${inputCls("question")} resize-none`}
          placeholder="Enter the question…"
        />
        {errors.question && <p className="mt-0.5 text-[11px] text-[var(--destructive)]">{errors.question}</p>}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {OPT_LABELS.map((opt) => {
          const key = `option${opt}` as keyof QForm;
          return (
            <div key={opt}>
              <label className={`mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${
                form.correctOption === opt ? "text-emerald-400" : "text-[var(--muted-foreground)]"
              }`}>
                <input
                  type="radio"
                  name="correct"
                  value={opt}
                  checked={form.correctOption === opt}
                  onChange={() => set("correctOption", opt)}
                  className="accent-emerald-400"
                />
                Option {opt} {form.correctOption === opt && "✓ Correct"}
              </label>
              <input
                value={form[key] as string}
                onChange={(e) => set(key, e.target.value)}
                placeholder={`Option ${opt}…`}
                className={inputCls(key as string)}
              />
              {errors[key as string] && <p className="mt-0.5 text-[11px] text-[var(--destructive)]">{errors[key as string]}</p>}
            </div>
          );
        })}
      </div>

      {/* Difficulty + explanation */}
      <div className="flex gap-3 items-end">
        <div className="w-32">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Difficulty</label>
          <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value as Difficulty)} className={inputCls("difficulty")}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Explanation (optional)</label>
          <input value={form.explanation} onChange={(e) => set("explanation", e.target.value)} placeholder="Why is this the correct answer?" className={inputCls("explanation")} />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)]">
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl gold-gradient px-5 py-2 text-sm font-bold text-[#1a1410] disabled:opacity-60"
        >
          {saving ? <><Save className="h-3.5 w-3.5 animate-spin" /> Saving…</> : <><Check className="h-3.5 w-3.5" /> Save Question</>}
        </button>
      </div>
    </div>
  );
}

export function MockTestManager() {
  const { store, refresh } = useStore();
  const [selectedExamId, setSelectedExamId] = useState("");
  const [expandedExams, setExpandedExams] = useState<Record<string, boolean>>({});
  const [addingForExam, setAddingForExam] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const toggleExam = (examId: string) =>
    setExpandedExams((p) => ({ ...p, [examId]: !p[examId] }));

  const questionsByExam = (examId: string): MockQuestion[] =>
    store.mockQuestions.filter((q) => q.examId === examId);

  const handleCreate = async (form: QForm) => {
    await mockQuestionsApi.create({
      exam_id: form.examId, question: form.question,
      option_a: form.optionA, option_b: form.optionB, option_c: form.optionC, option_d: form.optionD,
      correct_option: form.correctOption, explanation: form.explanation || null,
      difficulty: form.difficulty, sort_order: 0,
    });
    await refresh();
    setAddingForExam(null);
  };

  const handleUpdate = async (id: string, form: QForm) => {
    await mockQuestionsApi.update(id, {
      question: form.question, option_a: form.optionA, option_b: form.optionB,
      option_c: form.optionC, option_d: form.optionD, correct_option: form.correctOption,
      explanation: form.explanation || null, difficulty: form.difficulty,
    });
    await refresh();
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await mockQuestionsApi.remove(id); await refresh(); }
    catch (err: any) { alert(err.message); }
    finally { setDeleting(null); }
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Mock Tests</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Add multiple-choice questions per exam. Subscribed users can take timed tests in the mobile app.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Questions", value: store.mockQuestions.length },
          { label: "Exams Covered",   value: new Set(store.mockQuestions.map(q => q.examId)).size },
          { label: "Avg per Exam",    value: store.exams.length > 0
              ? Math.round(store.mockQuestions.length / Math.max(new Set(store.mockQuestions.map(q => q.examId)).size, 1))
              : 0 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-2xl font-black text-[var(--gold)]">{value}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Per-exam accordions */}
      <div className="space-y-3">
        {store.exams.map((exam) => {
          const qs = questionsByExam(exam.id);
          const expanded = expandedExams[exam.id];
          return (
            <div key={exam.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <button
                onClick={() => toggleExam(exam.id)}
                className="flex w-full items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${exam.accent} text-[10px] font-bold text-foreground`}>
                    {exam.short.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-[var(--foreground)]">{exam.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{qs.length} question{qs.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[var(--gold)]/10 px-2.5 py-0.5 text-[10px] font-bold text-[var(--gold)]">
                    {qs.length} Qs
                  </span>
                  {expanded ? <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" /> : <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />}
                </div>
              </button>

              {expanded && (
                <div className="border-t border-[var(--border)] px-5 py-4 space-y-3">
                  {qs.map((q) =>
                    editingId === q.id ? (
                      <QuestionForm
                        key={q.id}
                        examId={exam.id}
                        initial={{
                          examId: q.examId, question: q.question,
                          optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
                          correctOption: q.correctOption, explanation: q.explanation ?? "",
                          difficulty: q.difficulty,
                        }}
                        onSave={(form) => handleUpdate(q.id, form)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div key={q.id} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-sm font-medium text-[var(--foreground)] flex-1">{q.question}</p>
                          <div className="flex gap-1.5 shrink-0">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${DIFF_COLOR[q.difficulty]}`}>{q.difficulty}</span>
                            <button onClick={() => setEditingId(q.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(q.id)}
                              disabled={deleting === q.id}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {OPT_LABELS.map((opt) => {
                            const val = opt === "A" ? q.optionA : opt === "B" ? q.optionB : opt === "C" ? q.optionC : q.optionD;
                            const correct = q.correctOption === opt;
                            return (
                              <div key={opt} className={`rounded-lg px-3 py-1.5 text-xs ${correct ? "bg-emerald-400/10 text-emerald-400 font-semibold" : "bg-[var(--surface-2)] text-[var(--muted-foreground)]"}`}>
                                <span className="font-bold mr-1">{opt}.</span>{val}
                                {correct && " ✓"}
                              </div>
                            );
                          })}
                        </div>
                        {q.explanation && (
                          <p className="mt-2 text-[11px] text-[var(--muted-foreground)] italic">💡 {q.explanation}</p>
                        )}
                      </div>
                    )
                  )}

                  {addingForExam === exam.id ? (
                    <QuestionForm
                      examId={exam.id}
                      initial={emptyForm(exam.id)}
                      onSave={handleCreate}
                      onCancel={() => setAddingForExam(null)}
                    />
                  ) : (
                    <button
                      onClick={() => { setAddingForExam(exam.id); setEditingId(null); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-3 text-sm text-[var(--muted-foreground)] hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add Question
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
