import { useEffect, useState } from "react";
import { ArrowLeft, Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeMode = "dark" | "light" | "system";
export type AccentColor = "gold" | "emerald" | "sky" | "violet" | "rose";
export type FontSize = "small" | "default" | "large";

const themes: { id: ThemeMode; label: string; icon: typeof Moon; desc: string }[] = [
  { id: "dark",   label: "Dark",   icon: Moon,    desc: "Easy on the eyes at night" },
  { id: "light",  label: "Light",  icon: Sun,     desc: "Bright and clean" },
  { id: "system", label: "System", icon: Monitor, desc: "Follow device setting" },
];

const accents: { id: AccentColor; label: string; cls: string }[] = [
  { id: "gold",    label: "Gold",    cls: "bg-amber-400" },
  { id: "emerald", label: "Emerald", cls: "bg-emerald-400" },
  { id: "sky",     label: "Sky",     cls: "bg-sky-400" },
  { id: "violet",  label: "Violet",  cls: "bg-violet-400" },
  { id: "rose",    label: "Rose",    cls: "bg-rose-400" },
];

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");
  root.classList.toggle("dark", isDark);
}

function applyAccent(accent: AccentColor) {
  document.documentElement.setAttribute("data-accent", accent === "gold" ? "" : accent);
}

function applyFontSize(size: FontSize) {
  document.documentElement.setAttribute("data-fontsize", size === "default" ? "" : size);
}

export function AppearanceScreen({
  theme,
  accent,
  fontSize,
  onThemeChange,
  onAccentChange,
  onFontSizeChange,
  onBack,
}: {
  theme: ThemeMode;
  accent: AccentColor;
  fontSize: FontSize;
  onThemeChange: (t: ThemeMode) => void;
  onAccentChange: (a: AccentColor) => void;
  onFontSizeChange: (f: FontSize) => void;
  onBack: () => void;
}) {
  // Apply on every render so re-mounting re-applies stored values
  useEffect(() => { applyTheme(theme); },    [theme]);
  useEffect(() => { applyAccent(accent); },  [accent]);
  useEffect(() => { applyFontSize(fontSize); }, [fontSize]);

  const handleTheme = (t: ThemeMode) => { onThemeChange(t); applyTheme(t); };
  const handleAccent = (a: AccentColor) => { onAccentChange(a); applyAccent(a); };
  const handleFont = (f: FontSize) => { onFontSizeChange(f); applyFontSize(f); };

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Settings</p>
          <h1 className="text-2xl font-bold text-foreground">Appearance</h1>
        </div>
      </header>

      <div className="mt-5 space-y-6 px-5">
        {/* Theme */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => handleTheme(id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
                  theme === id
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border bg-surface text-muted-foreground hover:border-gold/20"
                )}
              >
                <Icon className="h-5 w-5" />
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] text-center opacity-70 leading-tight">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accent Color</p>
          <div className="flex flex-wrap gap-2">
            {accents.map((a) => (
              <button
                key={a.id}
                onClick={() => handleAccent(a.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  accent === a.id
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border bg-surface text-foreground hover:border-gold/20"
                )}
              >
                <span className={cn("h-3.5 w-3.5 rounded-full", a.cls)} />
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text Size</p>
          <div className="flex gap-2">
            {(["small", "default", "large"] as FontSize[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFont(f)}
                className={cn(
                  "flex-1 rounded-xl border py-3 text-sm font-semibold transition-all capitalize",
                  fontSize === f
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border bg-surface text-muted-foreground"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</p>
          <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-transparent p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gold mb-1">The Trick</p>
            <p className="gold-text text-xl font-bold">BHAJI SABJI FAM</p>
            <p className="mt-2 text-xs text-muted-foreground">Babur → Humayun → Akbar → Jahangir → Shah Jahan → Aurangzeb</p>
          </div>
        </div>
      </div>
    </div>
  );
}
