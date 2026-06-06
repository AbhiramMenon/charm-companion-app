import { Bell, Flame, Sparkles } from "lucide-react";
import logo from "@/assets/krackit-logo.png";
import { exams, tricks, type Exam, type Trick } from "@/lib/krackit-data";
import { TrickCard } from "./TrickCard";

export function HomeScreen({
  saved,
  toggleSave,
  openTrick,
  openExam,
}: {
  saved: Set<string>;
  toggleSave: (id: string) => void;
  openTrick: (t: Trick) => void;
  openExam: (e: Exam) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto pb-6">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" width={36} height={36} className="drop-shadow-[0_4px_12px_rgba(212,162,76,0.4)]" />
          <div>
            <p className="text-xs text-muted-foreground">Good morning,</p>
            <p className="text-sm font-semibold text-foreground">Aspirant 👋</p>
          </div>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold" />
        </button>
      </header>

      {/* Streak card */}
      <section className="mx-5 mt-4 overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/20 via-surface to-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Today's streak</p>
            <p className="mt-1 text-3xl font-bold text-foreground">12 days 🔥</p>
            <p className="mt-1 text-xs text-muted-foreground">Learn 3 tricks to keep it alive</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background/40 ring-1 ring-gold/30">
            <Flame className="h-8 w-8 text-gold" />
          </div>
        </div>
        <div className="mt-4 flex gap-1.5">
          {[1, 1, 1, 1, 1, 0.4, 0.4].map((v, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-background/50">
              <div className="h-full rounded-full gold-gradient" style={{ width: `${v * 100}%` }} />
            </div>
          ))}
        </div>
      </section>

      {/* Continue learning */}
      <section className="mt-7 px-5">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold text-foreground">Pick your exam</h2>
          <button className="text-xs font-medium text-gold">See all</button>
        </div>
        <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3">
            {exams.map((e) => (
              <button
                key={e.id}
                onClick={() => openExam(e)}
                className={`flex w-40 shrink-0 flex-col gap-3 rounded-2xl border border-border bg-gradient-to-br ${e.accent} p-4 text-left transition-transform active:scale-95`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/40 font-display text-sm font-bold text-foreground ring-1 ring-white/10">
                  {e.short}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{e.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{e.subjects} subjects · {e.tricks} tricks</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trick of the day */}
      <section className="mt-7 px-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <h2 className="text-lg font-bold text-foreground">Trick of the day</h2>
        </div>
        <div className="space-y-3">
          {tricks.slice(0, 3).map((t) => (
            <TrickCard
              key={t.id}
              trick={t}
              saved={saved.has(t.id)}
              onToggleSave={() => toggleSave(t.id)}
              onOpen={() => openTrick(t)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
