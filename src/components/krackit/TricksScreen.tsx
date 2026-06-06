import { ArrowLeft } from "lucide-react";
import { tricks, type Chapter, type Trick } from "@/lib/krackit-data";
import { TrickCard } from "./TrickCard";

export function TricksScreen({
  chapter,
  saved,
  toggleSave,
  openTrick,
  onBack,
}: {
  chapter: Chapter;
  saved: Set<string>;
  toggleSave: (id: string) => void;
  openTrick: (t: Trick) => void;
  onBack: () => void;
}) {
  const list = tricks.filter((t) => t.topic === chapter.id);
  // Fall back to a few sample tricks so the screen never looks empty
  const fallback = list.length ? list : tricks.slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Chapter</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{chapter.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{fallback.length} tricks · {Math.round(chapter.progress * 100)}% mastered</p>
        </div>
      </header>

      <section className="mt-5 space-y-3 px-5">
        {fallback.map((t) => (
          <TrickCard
            key={t.id}
            trick={t}
            saved={saved.has(t.id)}
            onToggleSave={() => toggleSave(t.id)}
            onOpen={() => openTrick(t)}
          />
        ))}
      </section>
    </div>
  );
}
