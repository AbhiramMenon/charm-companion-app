import { ArrowLeft, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { type Exam, type Subject } from "@/lib/krackit-data";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";
import { SubscriptionBanner } from "./SubscriptionBanner";

function subjectProgress(subjectId: string, mastered: Set<string>, chapters: ReturnType<typeof useData>["chapters"], topics: ReturnType<typeof useData>["topics"], tricks: ReturnType<typeof useData>["tricks"]) {
  const subjectChapters = chapters.filter((c) => c.subjectId === subjectId);
  let total = 0;
  let done = 0;
  for (const chapter of subjectChapters) {
    const chapterTopics = topics.filter((t) => t.chapterId === chapter.id);
    for (const topic of chapterTopics) {
      const topicTricks = tricks.filter((tr) => tr.topic === topic.id);
      total += topicTricks.length;
      done += topicTricks.filter((tr) => mastered.has(tr.id)).length;
    }
  }
  return total > 0 ? done / total : 0;
}

export type ExamMode = "tricks" | "shortnotes";

export function SubjectsScreen({
  exam,
  mastered,
  openedTricks,
  mode,
  isLocked,
  onModeChange,
  onBack,
  onSelect,
  onOpenSubscription,
}: {
  exam: Exam;
  mastered: Set<string>;
  openedTricks: Set<string>;
  mode: ExamMode;
  isLocked: boolean;
  onModeChange: (m: ExamMode) => void;
  onBack: () => void;
  onSelect: (s: Subject) => void;
  onOpenSubscription: () => void;
}) {
  const { subjects, chapters, topics, tricks } = useData();
  const list = subjects.filter((s) => s.examId === exam.id);
  const isFree = isLocked;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-2 pt-6">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">{exam.short}</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{exam.name}</h1>
          <p className="text-sm text-muted-foreground">{exam.description}</p>
        </div>
        <div className="mt-4 flex gap-3 text-xs">
          <span className="rounded-full bg-surface px-3 py-1 text-muted-foreground">{list.length} subjects</span>
          <span className="rounded-full bg-surface px-3 py-1 text-muted-foreground">{exam.tricks} tricks</span>
        </div>

        {/* Mode tab switcher */}
        <div className="mt-4 flex gap-1 rounded-2xl border border-border bg-surface p-1">
          <button
            onClick={() => onModeChange("tricks")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all",
              mode === "tricks"
                ? "bg-gold/15 text-gold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Tricks
          </button>
          <button
            onClick={() => onModeChange("shortnotes")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all",
              mode === "shortnotes"
                ? "bg-gold/15 text-gold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Short Notes
          </button>
        </div>
      </header>

      <section className="mt-5 px-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {mode === "shortnotes" ? "Browse Notes by Subject" : "Subjects"}
        </h2>
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
              <BookOpen className="h-5 w-5 text-gold" />
            </div>
            <p className="text-sm font-semibold text-foreground">No subjects yet</p>
            <p className="text-xs text-muted-foreground">No subjects have been added to this exam by the admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {list.map((s) => {
              const prog = subjectProgress(s.id, mastered, chapters, topics, tricks);
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className={`flex flex-col gap-3 rounded-2xl border border-border bg-gradient-to-br ${s.color} p-4 text-left transition-transform active:scale-95`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/50 text-2xl ring-1 ring-white/5">
                    {s.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{s.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      {s.chapters} chapters <ChevronRight className="h-3 w-3" />
                    </p>
                    {mode === "tricks" && prog > 0 && (
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-background/50">
                        <div
                          className="h-full gold-gradient transition-all"
                          style={{ width: `${Math.round(prog * 100)}%` }}
                        />
                      </div>
                    )}
                    {mode === "shortnotes" && (
                      <p className="mt-1.5 text-[10px] font-semibold text-gold">Notes available →</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
    {isFree && <SubscriptionBanner onUpgrade={onOpenSubscription} />}
    </div>
  );
}
