import { BookmarkCheck } from "lucide-react";
import { chapters, subjects, tricks, type Trick } from "@/lib/krackit-data";
import { TrickCard } from "./TrickCard";

export function BookmarksScreen({
  saved,
  toggleSave,
  openTrick,
}: {
  saved: Set<string>;
  toggleSave: (id: string) => void;
  openTrick: (t: Trick) => void;
}) {
  const savedTricks = tricks.filter((t) => saved.has(t.id));

  // Group: subject -> chapter -> tricks
  // Trick.topic === chapter.id; chapter.subjectId === subject.id.
  // Fall back to a synthetic subject derived from trick.subject when we can't match.
  const groups = new Map<
    string,
    { subjectName: string; icon: string; chapters: Map<string, { chapterName: string; items: Trick[] }> }
  >();

  for (const t of savedTricks) {
    const chapter = chapters.find((c) => c.id === t.topic);
    const subject = chapter ? subjects.find((s) => s.id === chapter.subjectId) : undefined;

    const subjectKey = subject?.id ?? `_${t.subject}`;
    const subjectName = subject?.name ?? t.subject;
    const icon = subject?.icon ?? "📘";
    const chapterKey = chapter?.id ?? `_${t.topic}`;
    const chapterName = chapter?.name ?? t.topic;

    if (!groups.has(subjectKey)) {
      groups.set(subjectKey, { subjectName, icon, chapters: new Map() });
    }
    const g = groups.get(subjectKey)!;
    if (!g.chapters.has(chapterKey)) {
      g.chapters.set(chapterKey, { chapterName, items: [] });
    }
    g.chapters.get(chapterKey)!.items.push(t);
  }

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-3 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Saved</h1>
        <p className="text-sm text-muted-foreground">
          {savedTricks.length} tricks across {groups.size} subject{groups.size === 1 ? "" : "s"}
        </p>
      </header>

      <div className="space-y-6 px-5 pt-2">
        {savedTricks.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
              <BookmarkCheck className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Nothing saved yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tap the bookmark on any trick to save it here.
              </p>
            </div>
          </div>
        ) : (
          Array.from(groups.entries()).map(([subjectKey, g]) => (
            <section key={subjectKey} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-xl ring-1 ring-white/5">
                  {g.icon}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{g.subjectName}</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {Array.from(g.chapters.values()).reduce((n, c) => n + c.items.length, 0)} saved
                  </p>
                </div>
              </div>

              {Array.from(g.chapters.entries()).map(([chapterKey, ch]) => (
                <div key={chapterKey} className="space-y-2">
                  <div className="flex items-center gap-2 pl-1">
                    <span className="h-px flex-1 bg-border" />
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">
                      {ch.chapterName}
                    </p>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  {ch.items.map((t) => (
                    <TrickCard
                      key={t.id}
                      trick={t}
                      saved
                      onToggleSave={() => toggleSave(t.id)}
                      onOpen={() => openTrick(t)}
                    />
                  ))}
                </div>
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
