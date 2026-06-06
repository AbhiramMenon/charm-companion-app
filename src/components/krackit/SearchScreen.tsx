import { Search as SearchIcon, X } from "lucide-react";
import { useMemo, useState } from "react";
import { tricks, type Trick } from "@/lib/krackit-data";
import { TrickCard } from "./TrickCard";

const chips = ["All", "History", "Polity", "Maths", "Geography", "Biology"];

export function SearchScreen({
  saved,
  toggleSave,
  openTrick,
}: {
  saved: Set<string>;
  toggleSave: (id: string) => void;
  openTrick: (t: Trick) => void;
}) {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("All");

  const results = useMemo(() => {
    return tricks.filter((t) => {
      const matchQ = !q || (t.title + t.content + t.subject).toLowerCase().includes(q.toLowerCase());
      const matchC = chip === "All" || t.subject === chip;
      return matchQ && matchC;
    });
  }, [q, chip]);

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-3 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Search</h1>
        <p className="text-sm text-muted-foreground">Find a trick, mnemonic or topic</p>

        <div className="relative mt-4">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'Mughal' or 'Trigonometry'"
            className="h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="-mx-5 mt-4 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setChip(c)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  chip === c
                    ? "border-gold/40 bg-gold/15 text-gold"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-3 px-5 pt-2">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No tricks match your search.</p>
          </div>
        ) : (
          results.map((t) => (
            <TrickCard
              key={t.id}
              trick={t}
              saved={saved.has(t.id)}
              onToggleSave={() => toggleSave(t.id)}
              onOpen={() => openTrick(t)}
            />
          ))
        )}
      </div>
    </div>
  );
}
