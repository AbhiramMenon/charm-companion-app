import { useState } from "react";
import { BookmarkCheck, ChevronDown, ChevronRight, StickyNote, BookOpen } from "lucide-react";
import { type ShortNote, type Trick } from "@/lib/krackit-data";
import { useData } from "@/lib/DataContext";
import { TrickCard } from "./TrickCard";
import { cn } from "@/lib/utils";

export function BookmarksScreen({
  saved,
  savedNotes,
  mastered,
  openedTricks,
  toggleSave,
  toggleSaveNote,
  openTrick,
}: {
  saved: Set<string>;
  savedNotes: Set<string>;
  mastered: Set<string>;
  openedTricks: Set<string>;
  toggleSave: (id: string) => void;
  toggleSaveNote: (noteId: string) => void;
  openTrick: (t: Trick, list: Trick[]) => void;
}) {
  const { tricks, topics, chapters, subjects, shortNotes } = useData();
  const [activeTab, setActiveTab] = useState<"tricks" | "notes">("tricks");

  // ── Tricks grouping ──────────────────────────────────────────
  const savedTricks = tricks.filter((t) => saved.has(t.id));
  const groups = new Map<
    string,
    { subjectName: string; icon: string; chapters: Map<string, { chapterName: string; items: Trick[] }> }
  >();
  for (const t of savedTricks) {
    const topicRecord = topics.find((tp) => tp.id === t.topic);
    const chapter = topicRecord ? chapters.find((c) => c.id === topicRecord.chapterId) : undefined;
    const subject = chapter ? subjects.find((s) => s.id === chapter.subjectId) : undefined;
    const subjectKey = subject?.id ?? `_${t.subject}`;
    const subjectName = subject?.name ?? t.subject;
    const icon = subject?.icon ?? "📘";
    const chapterKey = chapter?.id ?? `_${t.topic}`;
    const chapterName = chapter?.name ?? t.topic;
    if (!groups.has(subjectKey)) groups.set(subjectKey, { subjectName, icon, chapters: new Map() });
    const g = groups.get(subjectKey)!;
    if (!g.chapters.has(chapterKey)) g.chapters.set(chapterKey, { chapterName, items: [] });
    g.chapters.get(chapterKey)!.items.push(t);
  }

  // ── Notes grouping ───────────────────────────────────────────
  const savedNotesList: ShortNote[] = shortNotes.filter((n) => savedNotes.has(n.id));
  const noteGroups = new Map<string, { topicName: string; chapterName: string; items: ShortNote[] }>();
  for (const n of savedNotesList) {
    const topic = topics.find((t) => t.id === n.topicId);
    const chapter = topic ? chapters.find((c) => c.id === topic.chapterId) : undefined;
    const key = topic?.id ?? n.topicId;
    const topicName = topic?.name ?? n.topicId;
    const chapterName = chapter?.name ?? "";
    if (!noteGroups.has(key)) noteGroups.set(key, { topicName, chapterName, items: [] });
    noteGroups.get(key)!.items.push(n);
  }

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const toggleSubject = (key: string) => setExpandedSubjects((p) => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const toggleChapter = (key: string) => setExpandedChapters((p) => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const toggleTopic   = (key: string) => setExpandedTopics((p)   => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-3 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Saved</h1>
        <p className="text-sm text-muted-foreground">
          {savedTricks.length} tricks · {savedNotesList.length} notes
        </p>
      </header>

      {/* Tab switcher */}
      <div className="mx-5 mb-4 flex gap-1 rounded-2xl border border-border bg-surface p-1">
        <button
          onClick={() => setActiveTab("tricks")}
          className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all",
            activeTab === "tricks" ? "bg-gold/15 text-gold" : "text-muted-foreground")}
        >
          <BookmarkCheck className="h-3.5 w-3.5" /> Tricks ({savedTricks.length})
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all",
            activeTab === "notes" ? "bg-gold/15 text-gold" : "text-muted-foreground")}
        >
          <StickyNote className="h-3.5 w-3.5" /> Notes ({savedNotesList.length})
        </button>
      </div>

      {/* ── Tricks tab ── */}
      {activeTab === "tricks" && (
        <div className="space-y-4 px-5 pt-2">
          {savedTricks.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
                <BookmarkCheck className="h-6 w-6 text-gold" />
              </div>
              <p className="font-semibold text-foreground">Nothing saved yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Tap the bookmark on any trick to save it here.</p>
            </div>
          ) : Array.from(groups.entries()).map(([subjectKey, g]) => {
            const subjectOpen = expandedSubjects.has(subjectKey);
            return (
              <section key={subjectKey} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <button onClick={() => toggleSubject(subjectKey)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-lg ring-1 ring-white/5">{g.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-foreground truncate">{g.subjectName}</h2>
                    <p className="text-[11px] text-muted-foreground">{Array.from(g.chapters.values()).reduce((n, c) => n + c.items.length, 0)} saved</p>
                  </div>
                  {subjectOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>
                {subjectOpen && (
                  <div className="border-t border-border px-3 pb-3 pt-2">
                    {Array.from(g.chapters.entries()).map(([chapterKey, ch]) => {
                      const compositeKey = `${subjectKey}:${chapterKey}`;
                      const chapterOpen = expandedChapters.has(compositeKey);
                      return (
                        <div key={chapterKey} className="mt-1">
                          <button onClick={() => toggleChapter(compositeKey)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5">
                            {chapterOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gold" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gold" />}
                            <span className="text-xs font-semibold uppercase tracking-widest text-gold">{ch.chapterName}</span>
                            <span className="ml-auto rounded-full bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold-soft">{ch.items.length}</span>
                          </button>
                          {chapterOpen && (
                            <div className="mt-1.5 space-y-2 pl-6">
                              {ch.items.map((t) => (
                                <TrickCard
                                  key={t.id}
                                  trick={t}
                                  saved
                                  mastered={mastered.has(t.id)}
                                  opened={openedTricks.has(t.id)}
                                  onToggleSave={() => toggleSave(t.id)}
                                  onOpen={() => openTrick(t, ch.items)}
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
          })}
        </div>
      )}

      {/* ── Notes tab ── */}
      {activeTab === "notes" && (
        <div className="space-y-4 px-5 pt-2">
          {savedNotesList.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
                <BookOpen className="h-6 w-6 text-gold" />
              </div>
              <p className="font-semibold text-foreground">No notes saved</p>
              <p className="mt-1 text-xs text-muted-foreground">Tap the bookmark on any short note to save it here.</p>
            </div>
          ) : Array.from(noteGroups.entries()).map(([topicKey, g]) => {
            const isOpen = expandedTopics.has(topicKey);
            return (
              <section key={topicKey} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <button onClick={() => toggleTopic(topicKey)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background ring-1 ring-white/5">
                    <BookOpen className="h-4 w-4 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-foreground truncate">{g.topicName}</h2>
                    {g.chapterName && <p className="text-[11px] text-muted-foreground truncate">{g.chapterName}</p>}
                  </div>
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold mr-1">{g.items.length}</span>
                  {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 pb-3 pt-2 space-y-2">
                    {g.items.map((note) => (
                      <div key={note.id} className="rounded-xl border border-border bg-background p-3">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{note.title}</p>
                            <p className="text-sm leading-relaxed text-foreground/90">{note.content}</p>
                          </div>
                          <button
                            onClick={() => toggleSaveNote(note.id)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-gold/10 transition-colors"
                          >
                            <BookmarkCheck className="h-4 w-4 text-gold" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
