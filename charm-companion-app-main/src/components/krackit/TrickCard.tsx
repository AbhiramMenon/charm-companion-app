import { Bookmark, BookmarkCheck, CheckCircle2, Eye, Sparkles } from "lucide-react";
import type { Trick } from "@/lib/krackit-data";
import { cn } from "@/lib/utils";

export function TrickCard({
  trick,
  saved,
  mastered = false,
  opened = false,
  onToggleSave,
  onOpen,
}: {
  trick: Trick;
  saved: boolean;
  mastered?: boolean;
  opened?: boolean;
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
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-surface p-3 transition-all hover:border-gold/40",
        mastered && "border-gold/30 bg-gold/5"
      )}
    >
      <div className="flex items-center gap-2">
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
            <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider", diffColor)}>
              {trick.difficulty}
            </span>
            {mastered && (
              <span className="flex items-center gap-0.5 rounded-full bg-gold/20 px-1.5 py-0.5 text-[9px] font-semibold text-gold">
                <CheckCircle2 className="h-2.5 w-2.5" /> Mastered
              </span>
            )}
            {!mastered && opened && (
              <span className="flex items-center gap-0.5 rounded-full bg-sky-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-sky-400">
                <Eye className="h-2.5 w-2.5" /> Opened
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold leading-snug text-foreground">{trick.title}</h3>
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-background/60 px-2.5 py-1.5 ring-1 ring-gold/20">
            <Sparkles className="h-3 w-3 shrink-0 text-gold" />
            <p className="gold-text text-xs font-bold tracking-wide truncate">{trick.content}</p>
          </div>
        </button>
        <button
          onClick={onToggleSave}
          aria-label="Save"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-colors",
            saved ? "border-gold/40 bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
        </button>
      </div>
    </article>
  );
}
