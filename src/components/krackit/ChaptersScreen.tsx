import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { chapters, type Chapter, type Subject } from "@/lib/krackit-data";

export function ChaptersScreen({
  subject,
  onBack,
  onSelect,
}: {
  subject: Subject;
  onBack: () => void;
  onSelect: (c: Chapter) => void;
}) {
  const list = chapters.filter((c) => c.subjectId === subject.id);
  const fallback = list.length
    ? list
    : Array.from({ length: 4 }).map((_, i) => ({
        id: `${subject.id}-${i}`,
        name: `${subject.name} · Chapter ${i + 1}`,
        subjectId: subject.id,
        tricksCount: 12 + i * 3,
        progress: [0.6, 0.2, 0, 0.85][i] ?? 0,
      }));

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-2xl ring-1 ring-white/5">
            {subject.icon}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Subject</p>
            <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
          </div>
        </div>
      </header>

      <section className="mt-6 px-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Chapters · {fallback.length}
        </h2>
        <ul className="space-y-3">
          {fallback.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-gold/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background ring-1 ring-white/5">
                  <BookOpen className="h-5 w-5 text-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{c.tricksCount} tricks</p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-background">
                    <div className="h-full gold-gradient" style={{ width: `${Math.round(c.progress * 100)}%` }} />
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
