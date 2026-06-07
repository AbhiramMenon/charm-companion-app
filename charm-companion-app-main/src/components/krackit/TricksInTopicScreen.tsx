import { useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye } from "lucide-react";
import { type Chapter, type Topic, type Trick } from "@/lib/krackit-data";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";
import { Sparkles, Bookmark, BookmarkCheck } from "lucide-react";
import { SubscriptionBanner } from "./SubscriptionBanner";

function CompactTrickCard({
  trick,
  saved,
  mastered,
  opened,
  onToggleSave,
  onOpen,
}: {
  trick: Trick;
  saved: boolean;
  mastered: boolean;
  opened: boolean;
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

export function TricksInTopicScreen({
  topic,
  chapter,
  saved,
  mastered,
  openedTricks,
  isLocked,
  toggleSave,
  openTrick,
  onBack,
  onOpenSubscription,
}: {
  topic: Topic;
  chapter: Chapter;
  saved: Set<string>;
  mastered: Set<string>;
  openedTricks: Set<string>;
  isLocked: boolean;
  toggleSave: (id: string) => void;
  openTrick: (t: Trick, list: Trick[]) => void;
  onBack: () => void;
  onOpenSubscription: () => void;
}) {
  const { tricks } = useData();
  const list = tricks.filter((t) => t.topic === topic.id);
  const fallback = list.length ? list : tricks.slice(0, 3);

  const masteredCount = fallback.filter((t) => mastered.has(t.id)).length;
  const progress = fallback.length > 0 ? masteredCount / fallback.length : 0;

  // Swipe left/right on the whole page to navigate between tricks
  const touchStartX = useRef<number | null>(null);
  const [currentSwipeIdx, setCurrentSwipeIdx] = useState<number | null>(null);

  const handlePageTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handlePageTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 60) return;
    // Open the first trick on first swipe, then navigate
    const idx = currentSwipeIdx ?? 0;
    if (delta < 0 && idx < fallback.length - 1) {
      const next = idx + 1;
      setCurrentSwipeIdx(next);
      openTrick(fallback[next], fallback);
    } else if (delta > 0 && idx > 0) {
      const prev = idx - 1;
      setCurrentSwipeIdx(prev);
      openTrick(fallback[prev], fallback);
    } else if (delta < 0 && idx === 0) {
      setCurrentSwipeIdx(0);
      openTrick(fallback[0], fallback);
    }
  };

  const isFree = isLocked;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
    <div
      className="flex-1 overflow-y-auto pb-6"
      onTouchStart={handlePageTouchStart}
      onTouchEnd={handlePageTouchEnd}
    >
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Topic</p>
          <h1 className="mt-1 text-xl font-bold text-foreground">{topic.name}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{chapter.name}</p>
        </div>

        {/* Progress */}
        <div className="mt-3 rounded-2xl bg-surface p-3">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">{masteredCount}/{fallback.length} mastered</span>
            <span className="font-semibold text-gold">{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full gold-gradient transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </header>

      <section className="mt-4 space-y-2.5 px-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {fallback.length} tricks
        </p>
        {fallback.map((t, idx) => (
          <CompactTrickCard
            key={t.id}
            trick={t}
            saved={saved.has(t.id)}
            mastered={mastered.has(t.id)}
            opened={openedTricks.has(t.id)}
            onToggleSave={() => toggleSave(t.id)}
            onOpen={() => { setCurrentSwipeIdx(idx); openTrick(t, fallback); }}
          />
        ))}
        {fallback.length > 1 && (
          <p className="pt-2 text-center text-[11px] text-muted-foreground">
            ← Swipe anywhere to browse tricks →
          </p>
        )}
      </section>
    </div>
    {isFree && <SubscriptionBanner onUpgrade={onOpenSubscription} />}
    </div>
  );
}
