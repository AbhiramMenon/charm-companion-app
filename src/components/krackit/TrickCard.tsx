import { Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import type { Trick } from "@/lib/krackit-data";
import { cn } from "@/lib/utils";

export function TrickCard({
  trick,
  saved,
  onToggleSave,
  onOpen,
}: {
  trick: Trick;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const diffColor =
    trick.difficulty === "Easy"
      ? "text-emerald-400 bg-emerald-400/10"
      : trick.difficulty === "Medium"
        ? "text-amber-300 bg-amber-300/10"
        : "text-rose-400 bg-rose-400/10";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-4 transition-all hover:border-gold/40">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onOpen} className="flex-1 text-left">
          <div className="mb-2 flex items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", diffColor)}>
              {trick.difficulty}
            </span>
            <span className="text-[11px] text-muted-foreground">{trick.subject} · {trick.topic}</span>
          </div>
          <h3 className="text-base font-semibold leading-snug text-foreground">{trick.title}</h3>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-background/60 px-3 py-2.5 ring-1 ring-gold/20">
            <Sparkles className="h-4 w-4 shrink-0 text-gold" />
            <p className="gold-text text-sm font-bold tracking-wide">{trick.content}</p>
          </div>
        </button>
        <button
          onClick={onToggleSave}
          aria-label="Save"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border transition-colors",
            saved ? "border-gold/40 bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
    </article>
  );
}
