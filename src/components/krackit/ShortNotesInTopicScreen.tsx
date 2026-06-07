import { useState } from "react";
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, Plus, StickyNote, Trash2, X } from "lucide-react";
import { type Chapter, type ShortNote, type Topic } from "@/lib/krackit-data";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";
import { SubscriptionBanner } from "./SubscriptionBanner";

export function ShortNotesInTopicScreen({
  topic,
  chapter,
  customNotes,
  savedNotes,
  isLocked,
  onAddNote,
  onDeleteNote,
  onToggleSaveNote,
  onBack,
  onOpenSubscription,
}: {
  topic: Topic;
  chapter: Chapter;
  customNotes: ShortNote[];
  savedNotes: Set<string>;
  isLocked: boolean;
  onAddNote: (note: Omit<ShortNote, "id">) => void;
  onDeleteNote: (id: string) => void;
  onToggleSaveNote: (noteId: string) => void;
  onBack: () => void;
  onOpenSubscription: () => void;
}) {
  const { shortNotes } = useData();
  const topicDefaultNotes = shortNotes.filter((n) => n.topicId === topic.id);
  const topicCustomNotes = customNotes.filter((n) => n.topicId === topic.id);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAdd = () => {
    if (!newContent.trim()) return;
    onAddNote({
      topicId: topic.id,
      title: newTitle.trim() || "My Note",
      content: newContent.trim(),
      isCustom: true,
    });
    setNewTitle("");
    setNewContent("");
    setAdding(false);
  };

  const totalCount = topicDefaultNotes.length + topicCustomNotes.length;
  const isFree = isLocked;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Short Notes</p>
          <h1 className="mt-1 text-xl font-bold text-foreground">{topic.name}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{chapter.name}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {totalCount} note{totalCount !== 1 ? "s" : ""}
            {topicCustomNotes.length > 0 && ` · ${topicCustomNotes.length} custom`}
          </span>
          <button
            onClick={() => setAdding((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              adding
                ? "bg-surface text-muted-foreground"
                : "bg-gold/15 text-gold"
            )}
          >
            {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {adding ? "Cancel" : "Add note"}
          </button>
        </div>
      </header>

      {/* Add note form */}
      {adding && (
        <div className="mx-5 mt-3 rounded-2xl border border-gold/30 bg-surface p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">New Note</p>
          <input
            placeholder="Title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={80}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none"
          />
          <textarea
            placeholder="Write your note here…"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none"
          />
          <p className="text-right text-[10px] text-muted-foreground/50">{newContent.length}/500</p>
          <button
            onClick={handleAdd}
            disabled={!newContent.trim()}
            className="w-full rounded-xl gold-gradient py-2.5 text-sm font-bold text-[#1a1410] disabled:opacity-40"
          >
            Save Note
          </button>
        </div>
      )}

      <section className="mt-4 space-y-3 px-5">
        {/* Custom notes first */}
        {topicCustomNotes.length > 0 && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gold flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5" /> My Notes
            </p>
            {topicCustomNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-gold/25 bg-gold/5 p-4"
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gold">{note.title}</p>
                    <p className="text-sm leading-relaxed text-foreground/90">{note.content}</p>
                  </div>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {topicDefaultNotes.length > 0 && (
              <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Key Notes
              </p>
            )}
          </>
        )}

        {/* Pre-loaded notes */}
        {topicDefaultNotes.map((note) => {
          const isNoteSaved = savedNotes.has(note.id);
          return (
            <div key={note.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{note.title}</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{note.content}</p>
                </div>
                <button
                  onClick={() => onToggleSaveNote(note.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gold/10"
                >
                  {isNoteSaved
                    ? <BookmarkCheck className="h-4 w-4 text-gold" />
                    : <Bookmark className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
          );
        })}

        {totalCount === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
              <BookOpen className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No notes yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Tap "Add note" to create your first note for this topic.</p>
            </div>
          </div>
        )}
      </section>
    </div>
    {isFree && <SubscriptionBanner onUpgrade={onOpenSubscription} />}
    </div>
  );
}
