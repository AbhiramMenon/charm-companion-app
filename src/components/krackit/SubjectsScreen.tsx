import { ArrowLeft, ChevronRight } from "lucide-react";
import { subjects, type Exam, type Subject } from "@/lib/krackit-data";

export function SubjectsScreen({
  exam,
  onBack,
  onSelect,
}: {
  exam: Exam;
  onBack: () => void;
  onSelect: (s: Subject) => void;
}) {
  const list = subjects.filter((s) => s.examId === exam.id);
  const fallback = list.length ? list : subjects.slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">{exam.short}</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{exam.name}</h1>
          <p className="text-sm text-muted-foreground">{exam.description}</p>
        </div>
        <div className="mt-4 flex gap-3 text-xs">
          <span className="rounded-full bg-surface px-3 py-1 text-muted-foreground">{fallback.length} subjects</span>
          <span className="rounded-full bg-surface px-3 py-1 text-muted-foreground">{exam.tricks} tricks</span>
        </div>
      </header>

      <section className="mt-5 px-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Subjects</h2>
        <div className="grid grid-cols-2 gap-3">
          {fallback.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`flex flex-col gap-3 rounded-2xl border border-border bg-gradient-to-br ${s.color} p-4 text-left transition-transform active:scale-95`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/50 text-2xl ring-1 ring-white/5">
                {s.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  {s.chapters} chapters <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
