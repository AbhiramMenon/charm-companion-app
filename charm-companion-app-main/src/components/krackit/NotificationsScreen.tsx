import { ArrowLeft } from "lucide-react";
import type { NotificationPrefs } from "@/routes/index";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-gold" : "bg-border"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export function NotificationsScreen({
  prefs,
  onChange,
  onBack,
}: {
  prefs: NotificationPrefs;
  onChange: (p: NotificationPrefs) => void;
  onBack: () => void;
}) {
  const set = (key: keyof NotificationPrefs, val: boolean) =>
    onChange({ ...prefs, [key]: val });

  const items: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
    { key: "dailyReminder", label: "Daily reminder", desc: "Remind me to study every day" },
    { key: "streakReminder", label: "Streak reminder", desc: "Alert before my streak breaks" },
    { key: "examAlerts", label: "Exam alerts", desc: "Important exam dates & results" },
    { key: "newTricks", label: "New tricks", desc: "When new tricks are added to my subjects" },
    { key: "weeklyReport", label: "Weekly report", desc: "Summary of my weekly progress" },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Settings</p>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        </div>
      </header>

      <div className="mt-5 px-5">
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
          {items.map(({ key, label, desc }) => (
            <li key={key} className="flex items-center gap-3 px-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
              </div>
              <Toggle checked={prefs[key]} onChange={() => set(key, !prefs[key])} />
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quiet Hours</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] text-muted-foreground mb-1">From</label>
              <input type="time" defaultValue="22:00" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold/50 focus:outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] text-muted-foreground mb-1">To</label>
              <input type="time" defaultValue="07:00" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold/50 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
