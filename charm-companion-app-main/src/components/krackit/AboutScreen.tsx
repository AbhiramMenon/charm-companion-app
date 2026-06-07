import { useEffect, useState } from "react";
import { ArrowLeft, Globe, Heart, Mail, Star, Users, Zap } from "lucide-react";
import { KrackItLogo, KrackItWordmark } from "./KrackItLogo";
import { contentApi, type AppSettings } from "@/lib/mobileApi";

const COLORS = [
  "from-amber-400/20 to-transparent",
  "from-sky-400/20 to-transparent",
  "from-violet-400/20 to-transparent",
  "from-emerald-400/20 to-transparent",
];

const DEFAULT: AppSettings = {
  app_name: "KrackIT",
  tagline: "One trick ahead",
  version: "1.0.0",
  description: "KrackIT is India's smartest mnemonic-based learning platform for competitive exam aspirants. We turn complex facts into unforgettable tricks so you can study smarter, not harder.",
  support_email: "hello@krackit.app",
  website_url: "www.krackit.app",
  team_members: [
    { name: "Aarav Mehta",  role: "Co-founder & CEO" },
    { name: "Priya Nair",   role: "Co-founder & CPO" },
    { name: "Rohan Sharma", role: "Co-founder & CTO" },
  ],
  social_links: [],
};

export function AboutScreen({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT);

  useEffect(() => {
    contentApi.getAppSettings().then((s) => {
      if (s) setSettings(s);
    }).catch(() => {});
  }, []);

  const appName      = settings.app_name     || DEFAULT.app_name;
  const tagline      = settings.tagline      || DEFAULT.tagline;
  const version      = settings.version      || DEFAULT.version;
  const description  = settings.description  || DEFAULT.description;
  const supportEmail = settings.support_email || DEFAULT.support_email;
  const websiteUrl   = settings.website_url   || DEFAULT.website_url;
  const teamMembers  = (settings.team_members?.filter((m) => m.name) ?? []).length > 0
    ? settings.team_members.filter((m) => m.name)
    : DEFAULT.team_members;
  const socialLinks  = settings.social_links?.filter((l) => l.platform && l.url) ?? [];

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Settings</p>
          <h1 className="text-2xl font-bold text-foreground">About {appName}</h1>
        </div>
      </header>

      <div className="mt-5 space-y-5 px-5">
        {/* Brand hero */}
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/15 via-surface to-surface p-6 text-center">
          <KrackItLogo size={64} />
          <div>
            <KrackItWordmark className="text-2xl" />
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{tagline}</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{description}</p>
        </div>

        {/* Mission */}
        <div className="rounded-3xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-gold" />
            <p className="text-sm font-bold text-foreground">Our Mission</p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Over 3 crore Indians attempt competitive exams every year. Most fail — not because they
            aren't smart, but because they don't have the right tools. {appName} bridges that gap with
            science-backed memory techniques: mnemonics, spaced repetition, and visual anchors — all in one app.
          </p>
        </div>

        {/* Team */}
        {teamMembers.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-rose-400" /> The Team
            </p>
            <div className="space-y-3">
              {teamMembers.map((m, i) => (
                <div key={`${m.name}-${i}`} className={`rounded-2xl border border-border bg-gradient-to-br ${COLORS[i % COLORS.length]} bg-surface p-4`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background ring-1 ring-white/10">
                      <Users className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{m.name}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">{m.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="rounded-3xl border border-border bg-surface divide-y divide-border overflow-hidden">
          {[
            { icon: Globe, label: "Website", value: websiteUrl },
            { icon: Mail,  label: "Support", value: supportEmail },
            { icon: Star,  label: "Rate us", value: "App Store / Play Store" },
            ...socialLinks.map((l) => ({ icon: Globe, label: l.platform, value: l.url })),
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-3.5">
              <Icon className="h-4 w-4 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="text-sm text-foreground truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Version {version} · Made with love in India
        </p>
      </div>
    </div>
  );
}
