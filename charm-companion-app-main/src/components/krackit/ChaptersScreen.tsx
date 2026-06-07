import { ArrowLeft, ChevronRight, Lock } from "lucide-react";
import { type Chapter, type Subject } from "@/lib/krackit-data";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";
import { SubscriptionBanner } from "./SubscriptionBanner";

type DataArrays = { topics: ReturnType<typeof useData>["topics"]; tricks: ReturnType<typeof useData>["tricks"] };

function chapterProgress(chapterId: string, mastered: Set<string>, openedTricks: Set<string>, { topics, tricks }: DataArrays) {
  const chapterTopics = topics.filter((t) => t.chapterId === chapterId);
  let total = 0; let done = 0;
  for (const topic of chapterTopics) {
    const topicTricks = tricks.filter((tr) => tr.topic === topic.id);
    total += topicTricks.length;
    done += topicTricks.filter((tr) => mastered.has(tr.id)).length;
  }
  return total === 0 ? 0 : done / total;
}

function openedFraction(chapterId: string, openedTricks: Set<string>, { topics, tricks }: DataArrays) {
  const chapterTopics = topics.filter((t) => t.chapterId === chapterId);
  let total = 0; let opened = 0;
  for (const topic of chapterTopics) {
    const topicTricks = tricks.filter((tr) => tr.topic === topic.id);
    total += topicTricks.length;
    opened += topicTricks.filter((tr) => openedTricks.has(tr.id)).length;
  }
  return total === 0 ? 0 : opened / total;
}

export function ChaptersScreen({
  subject,
  mastered,
  openedTricks,
  isLocked,
  onBack,
  onSelect,
  onOpenSubscription,
}: {
  subject: Subject;
  mastered: Set<string>;
  openedTricks: Set<string>;
  isLocked: boolean;
  onBack: () => void;
  onSelect: (c: Chapter) => void;
  onOpenSubscription: () => void;
}) {
  const { chapters, topics, tricks } = useData();
  const da = { topics, tricks };
  const list = chapters.filter((c) => c.subjectId === subject.id);

  const isFree = isLocked;
  const showBanner = isFree;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
            Chapters · {list.length}
          </h2>
          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
              <p className="text-sm font-semibold text-foreground">No chapters yet</p>
              <p className="text-xs text-muted-foreground">No chapters have been added to this subject.</p>
            </div>
          ) : (
          <ul className="space-y-3">
            {list.map((c, idx) => {
              const locked = isFree && idx > 0;
              const masteredPct = chapterProgress(c.id, mastered, openedTricks, da);
              const openedPct = openedFraction(c.id, openedTricks, da);
              const displayPct = masteredPct > 0 ? masteredPct : openedPct;
              const isComplete = masteredPct === 1 && masteredPct > 0;

              return (
                <li key={c.id}>
                  <button
                    onClick={() => locked ? onOpenSubscription() : onSelect(c)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-gold/40",
                      isComplete && !locked && "border-gold/25 bg-gold/5",
                      locked && "opacity-70"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ring-1 ring-white/5 bg-background",
                      isComplete && !locked && "bg-gold/15"
                    )}>
                      {c.icon ?? "📖"}
                    </div>

                    {/* Content — blurred when locked */}
                    <div className={cn("min-w-0 flex-1", locked && "select-none")}>
                      <div className={cn("flex items-center gap-2", locked && "blur-[2px]")}>
                        <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                        {isComplete && !locked && (
                          <span className="shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">
                            Complete
                          </span>
                        )}
                      </div>
                      <p className={cn("mt-0.5 text-[11px] text-muted-foreground", locked && "blur-[2px]")}>{c.tricksCount} tricks</p>
                      {!locked && (
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-background">
                          <div className="h-full gold-gradient transition-all" style={{ width: `${Math.round(displayPct * 100)}%` }} />
                        </div>
                      )}
                    </div>

                    {locked ? (
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          )}
        </section>
      </div>

      {showBanner && <SubscriptionBanner onUpgrade={onOpenSubscription} />}
    </div>
  );
}
