import { ArrowLeft, Bookmark, BookmarkCheck, Share2, Sparkles } from "lucide-react";
import type { Trick } from "@/lib/krackit-data";
import { cn } from "@/lib/utils";

export function TrickDetail({
  trick,
  saved,
  onToggleSave,
  onBack,
}: {
  trick: Trick;
  saved: boolean;
  onToggleSave: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleSave}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              saved ? "bg-gold/15 text-gold" : "bg-surface text-foreground"
            )}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{trick.subject}</span> · <span>{trick.topic}</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight text-foreground">{trick.title}</h1>

        <div className="mt-6 rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/15 to-transparent p-6 text-center">
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-gold" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/80">The Trick</p>
          <p className="gold-text mt-3 text-2xl font-bold tracking-tight">{trick.content}</p>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">How it works</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{trick.explanation}</p>
        </section>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { label: "Difficulty", value: trick.difficulty },
            { label: "Saved by", value: "12.4k" },
            { label: "Rating", value: "4.9★" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        <button className="mt-8 w-full rounded-2xl gold-gradient py-4 text-base font-bold text-[#1a1410] shadow-lg shadow-gold/20 transition-transform active:scale-[0.98]">
          Mark as Mastered
        </button>
      </div>
    </div>
  );
}
