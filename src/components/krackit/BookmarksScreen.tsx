import { BookmarkCheck } from "lucide-react";
import { tricks, type Trick } from "@/lib/krackit-data";
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
  const list = tricks.filter((t) => saved.has(t.id));

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-3 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Saved</h1>
        <p className="text-sm text-muted-foreground">{list.length} tricks in your collection</p>
      </header>

      <div className="space-y-3 px-5 pt-2">
        {list.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
              <BookmarkCheck className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Nothing saved yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Tap the bookmark on any trick to save it here.</p>
            </div>
          </div>
        ) : (
          list.map((t) => (
            <TrickCard
              key={t.id}
              trick={t}
              saved
              onToggleSave={() => toggleSave(t.id)}
              onOpen={() => openTrick(t)}
            />
          ))
        )}
      </div>
    </div>
  );
}
