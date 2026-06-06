import { Home, Search, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "home" | "search" | "bookmarks" | "profile";

const items: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "bookmarks", label: "Saved", icon: Bookmark },
  { id: "profile", label: "Profile", icon: User },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-xl">
      <ul className="grid grid-cols-4 px-2 pb-3 pt-2">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                onClick={() => onChange(id)}
                className={cn(
                  "group flex w-full flex-col items-center gap-1 rounded-xl py-2 text-xs transition-colors",
                  isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-full transition-all", isActive && "bg-gold/15")}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className={cn("font-medium", isActive && "text-gold")}>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
