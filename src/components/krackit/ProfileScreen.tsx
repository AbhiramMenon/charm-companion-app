import { Award, Bell, ChevronRight, Globe, HelpCircle, LogOut, Moon, Settings } from "lucide-react";

const stats = [
  { label: "Tricks learned", value: "284" },
  { label: "Day streak", value: "12" },
  { label: "Mastered", value: "96" },
];

const rows = [
  { icon: Settings, label: "Account settings" },
  { icon: Bell, label: "Notifications" },
  { icon: Moon, label: "Appearance" },
  { icon: Globe, label: "Language" },
  { icon: HelpCircle, label: "Help & support" },
  { icon: LogOut, label: "Log out", danger: true },
];

export function ProfileScreen() {
  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="px-5 pb-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </header>

      <section className="mx-5 rounded-3xl border border-border bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gold-gradient text-2xl font-bold text-[#1a1410]">
              A
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-background">
              <Award className="h-3 w-3 text-gold" />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Aspirant</p>
            <p className="text-xs text-muted-foreground">aspirant@krackit.app</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gold">Gold Learner</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-background/50 p-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="gold-text text-xl font-bold">{s.value}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <ul className="mx-5 mt-5 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
        {rows.map(({ icon: Icon, label, danger }) => (
          <li key={label}>
            <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${danger ? "bg-destructive/15 text-destructive" : "bg-background text-foreground"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className={`flex-1 text-sm font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{label}</span>
              {!danger && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-xs text-muted-foreground">KrackIT v1.0 · One trick ahead</p>
    </div>
  );
}
