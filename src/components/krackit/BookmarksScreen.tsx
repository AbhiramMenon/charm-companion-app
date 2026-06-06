import { useState } from "react";
import { BookmarkCheck, ChevronDown, ChevronRight } from "lucide-react";
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

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleSubject = (key: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleChapter = (key: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-3 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Saved</h1>
        <p className="text-sm text-muted-foreground">
          {savedTricks.length} tricks across {groups.size} subject{groups.size === 1 ? "" : "s"}
        </p>
      </header>

      <div className="space-y-4 px-5 pt-2">
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
          Array.from(groups.entries()).map(([subjectKey, g]) => {
            const subjectOpen = expandedSubjects.has(subjectKey);
            return (
              <section
                key={subjectKey}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <button
                  onClick={() => toggleSubject(subjectKey)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-lg ring-1 ring-white/5">
                    {g.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-foreground truncate">{g.subjectName}</h2>
                    <p className="text-[11px] text-muted-foreground">
                      {Array.from(g.chapters.values()).reduce((n, c) => n + c.items.length, 0)} saved
                    </p>
                  </div>
                  {subjectOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {subjectOpen && (
                  <div className="border-t border-border px-3 pb-3 pt-2">
                    {Array.from(g.chapters.entries()).map(([chapterKey, ch]) => {
                      const compositeKey = `${subjectKey}:${chapterKey}`;
                      const chapterOpen = expandedChapters.has(compositeKey);
                      return (
                        <div key={chapterKey} className="mt-1">
                          <button
                            onClick={() => toggleChapter(compositeKey)}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                          >
                            {chapterOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gold" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gold" />
                            )}
                            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                              {ch.chapterName}
                            </span>
                            <span className="ml-auto rounded-full bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold-soft">
                              {ch.items.length}
                            </span>
                          </button>

                          {chapterOpen && (
                            <div className="mt-1.5 space-y-2 pl-6">
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
