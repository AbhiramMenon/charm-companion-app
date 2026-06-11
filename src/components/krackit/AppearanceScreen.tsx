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

const PREVIEW_PALETTE: Record<AccentColor, { bg: string; shimmer: string; contentColor: string }> = {
  gold:    { bg: "linear-gradient(135deg,#1c1205 0%,#2a1a07 60%,#0f0a04 100%)", shimmer: "#D4A24C", contentColor: "rgba(212,162,76,0.75)" },
  emerald: { bg: "linear-gradient(135deg,#041c0a 0%,#082a12 60%,#020f05 100%)", shimmer: "#34d399", contentColor: "rgba(52,211,153,0.75)" },
  sky:     { bg: "linear-gradient(135deg,#041418 0%,#082028 60%,#020a0f 100%)", shimmer: "#38bdf8", contentColor: "rgba(56,189,248,0.75)" },
  violet:  { bg: "linear-gradient(135deg,#0a0518 0%,#120a28 60%,#06020f 100%)", shimmer: "#a78bfa", contentColor: "rgba(167,139,250,0.75)" },
  rose:    { bg: "linear-gradient(135deg,#1c0507 0%,#2a0a12 60%,#0f0406 100%)", shimmer: "#fb7185", contentColor: "rgba(251,113,133,0.75)" },
};

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

        {/* Live preview — mirrors the actual Trick of the Day card */}
        {(() => {
          const p = PREVIEW_PALETTE[accent];
          return (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</p>
              <div
                style={{
                  background: p.bg,
                  borderRadius: 20,
                  borderTop: `2px solid ${p.shimmer}55`,
                  padding: "16px",
                  boxShadow: `0 0 0 1px ${p.shimmer}18`,
                }}
              >
                <p style={{ color: p.shimmer, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, opacity: 0.9 }}>
                  ✦ Trick of the Day
                </p>
                <p style={{ color: "#F2D58A", fontSize: 16, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>
                  BHAJI SABJI FAM
                </p>
                <p style={{ color: p.contentColor, fontSize: 11, lineHeight: 1.65 }}>
                  Babur → Humayun → Akbar → Jahangir → Shah Jahan → Aurangzeb
                </p>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: `${p.shimmer}18`, color: p.shimmer, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 99, border: `1px solid ${p.shimmer}30` }}>
                    Easy
                  </span>
                  <span style={{ marginLeft: "auto", background: "linear-gradient(135deg,#F2D58A,#D4A24C)", color: "#1a1410", fontSize: 9, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>
                    Learn →
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
