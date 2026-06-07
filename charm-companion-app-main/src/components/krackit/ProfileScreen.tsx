import { Award, Bell, CalendarClock, ChevronRight, Crown, Globe, HelpCircle, Info, LogOut, Moon, Pencil, Settings, Sparkles } from "lucide-react";
import type { BillingInfo } from "@/components/krackit/BillingScreen";
import type { SettingsPage, UserProfile } from "@/routes/index";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";
import type { T } from "@/lib/translations";

export function ProfileScreen({
  profile,
  billingInfo,
  examBillingInfo,
  onNavigate,
  onLogout,
  t,
}: {
  profile: UserProfile;
  billingInfo: BillingInfo | null;
  examBillingInfo: BillingInfo | null;
  onNavigate: (page: SettingsPage) => void;
  onLogout: () => void;
  t: T;
}) {
  const { exams } = useData();
  const initials = profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const stats = [
    { label: "Tricks learned", value: "284" },
    { label: "Day streak", value: "12" },
    { label: "Mastered", value: "96" },
  ];

  const rows: { icon: typeof Settings; label: string; page: SettingsPage }[] = [
    { icon: Settings,   label: t.accountSettings, page: "account" },
    { icon: Bell,       label: t.notifications,   page: "notifications" },
    { icon: Moon,       label: t.appearance,       page: "appearance" },
    { icon: Globe,      label: t.language,         page: "language" },
    { icon: HelpCircle, label: t.helpSupport,      page: "help" },
    { icon: Crown,      label: t.subscription,     page: "subscription" },
    { icon: Info,       label: t.about,            page: "about" },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <header className="flex items-center justify-between px-5 pb-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <button
          onClick={() => onNavigate("account")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted-foreground transition-colors hover:text-gold"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </header>

      <section className="mx-5 rounded-3xl border border-border bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile.profilePic ? (
              <img
                src={profile.profilePic}
                alt={profile.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-gold/30"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full gold-gradient text-2xl font-bold text-[#1a1410]">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-background">
              <Award className="h-3 w-3 text-gold" />
            </div>
          </div>

          <div>
            <p className="text-lg font-bold text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
            {profile.phone && <p className="text-xs text-muted-foreground">{profile.phone}</p>}
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gold">{profile.tier}</p>
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

      {/* Billing info card */}
      {billingInfo && (
        <section className="mx-5 mt-5 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/10 via-surface to-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="h-4 w-4 text-gold" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">Active Subscription</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-bold text-gold">{billingInfo.plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-emerald-400">Active</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires</span>
              <span className="text-foreground text-xs">{new Date(billingInfo.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Days left</span>
              <span className="font-semibold text-foreground">
                {Math.max(0, Math.ceil((new Date(billingInfo.expiresAt).getTime() - Date.now()) / 86400000))} days
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-[10px] text-foreground">{billingInfo.transactionId}</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate("subscription")}
            className="mt-3 w-full rounded-xl border border-gold/30 py-2 text-xs font-semibold text-gold"
          >
            Manage Subscription
          </button>
        </section>
      )}

      {/* Exam pack subscription card */}
      {examBillingInfo?.examIds && examBillingInfo.examIds.length > 0 && (
        <section className="mx-5 mt-5 rounded-3xl border border-gold/20 bg-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-gold" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">Exam Pack</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subscribed Exams</span>
              <span className="font-bold text-foreground">{examBillingInfo.examIds.length}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {examBillingInfo.examIds.map((id) => {
                const exam = exams.find((e) => e.id === id);
                return exam ? (
                  <span key={id} className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
                    {exam.short}
                  </span>
                ) : null;
              })}
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-emerald-400">Active</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires</span>
              <span className="text-foreground text-xs">{new Date(examBillingInfo.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-[10px] text-foreground">{examBillingInfo.transactionId}</span>
            </div>
          </div>
          <button onClick={() => onNavigate("subscription")} className="mt-3 w-full rounded-xl border border-gold/30 py-2 text-xs font-semibold text-gold">
            Manage Exam Pack
          </button>
        </section>
      )}

      <ul className="mx-5 mt-5 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
        {rows.map(({ icon: Icon, label, page }) => (
          <li key={page}>
            <button
              onClick={() => onNavigate(page)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl bg-background text-foreground",
                page === "subscription" && "bg-gold/15 text-gold"
              )}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-destructive">{t.logOut}</span>
          </button>
        </li>
      </ul>

      <p className="mt-6 text-center text-xs text-muted-foreground">KrackIT v1.0 · One trick ahead</p>
    </div>
  );
}
