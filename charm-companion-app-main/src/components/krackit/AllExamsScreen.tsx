import { ArrowLeft, ChevronRight } from "lucide-react";
import { type Exam } from "@/lib/krackit-data";
import { useData } from "@/lib/DataContext";

export function AllExamsScreen({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (e: Exam) => void;
}) {
  const { exams } = useData();
  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Explore</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">All Exams</h1>
          <p className="text-sm text-muted-foreground">{exams.length} exams available</p>
        </div>
      </header>

      <section className="mt-5 space-y-3 px-5">
        {exams.map((e) => (
          <button
            key={e.id}
            onClick={() => onSelect(e)}
            className={`group flex w-full items-center gap-4 rounded-2xl border border-border bg-gradient-to-br ${e.accent} p-4 text-left transition-transform active:scale-[0.98]`}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background/40 font-display text-lg font-bold text-foreground ring-1 ring-white/10">
              {e.short}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-foreground">{e.name}</p>
              <p className="text-xs text-muted-foreground">{e.description}</p>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full bg-background/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {e.subjects} subjects
                </span>
                <span className="rounded-full bg-background/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {e.tricks} tricks
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </section>
    </div>
  );
}
