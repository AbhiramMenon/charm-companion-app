import { useEffect, useRef, useState } from "react";
import { X, Volume2 } from "lucide-react";

type Props = {
  adNumber: number;        // 1, 2, or 3
  onComplete: () => void;  // ad fully watched
  onSkip: () => void;      // skip clicked (after 5s)
};

const AD_DURATION = 30; // seconds
const SKIP_AFTER  = 5;  // seconds before skip appears

const ADS = [
  { brand: "SkillBoost Pro", tag: "SPONSORED", headline: "Master Any Exam in 60 Days", body: "Join 5L+ aspirants using AI-powered practice. Free trial for UPSC, NEET & JEE.", cta: "Try Free", bg: "from-sky-900/80 to-indigo-900/80", accent: "bg-sky-400", ctaClass: "bg-sky-500 hover:bg-sky-400" },
  { brand: "ExamGuru",        tag: "SPONSORED", headline: "1000+ Mock Tests. Real Exam Feel.", body: "Ranked #1 mock test platform. Attempt full syllabus tests with detailed analysis.", cta: "Attempt Now", bg: "from-emerald-900/80 to-teal-900/80", accent: "bg-emerald-400", ctaClass: "bg-emerald-500 hover:bg-emerald-400" },
  { brand: "NotesVault",      tag: "SPONSORED", headline: "Handwritten Notes by Toppers", body: "Download rank-holder notes for 30+ competitive exams. Limited time offer.", cta: "Download Free", bg: "from-violet-900/80 to-purple-900/80", accent: "bg-violet-400", ctaClass: "bg-violet-500 hover:bg-violet-400" },
];

export function AdScreen({ adNumber, onComplete, onSkip }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ad = ADS[(adNumber - 1) % ADS.length];
  const pct = Math.min((elapsed / AD_DURATION) * 100, 100);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((t) => {
        const next = t + 1;
        if (next >= SKIP_AFTER) setCanSkip(true);
        if (next >= AD_DURATION) {
          clearInterval(intervalRef.current!);
          onComplete();
        }
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
          {ad.tag}
        </span>
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          {canSkip ? (
            <button
              onClick={onSkip}
              className="flex items-center gap-1 rounded-lg bg-surface border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:border-gold/40"
            >
              <X className="h-3 w-3" /> Skip Ad
            </button>
          ) : (
            <span className="text-xs text-muted-foreground tabular-nums">Skip in {SKIP_AFTER - elapsed}s</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div className={`h-full ${ad.accent} transition-all duration-1000 ease-linear`} style={{ width: `${pct}%` }} />
      </div>

      {/* Ad content */}
      <div className={`flex-1 bg-gradient-to-br ${ad.bg} flex flex-col items-center justify-center px-8 text-center gap-5 relative overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

        {/* Brand */}
        <div className="relative">
          <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${ad.accent}/20 border border-white/10 mx-auto`}>
            <span className="text-3xl font-black text-white">{ad.brand[0]}</span>
          </div>
          <p className="mt-2 text-xs font-bold text-white/60 uppercase tracking-wider">{ad.brand}</p>
        </div>

        <div>
          <h2 className="text-xl font-black text-white leading-tight">{ad.headline}</h2>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{ad.body}</p>
        </div>

        {/* CTA */}
        <button className={`rounded-2xl ${ad.ctaClass} px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors`}>
          {ad.cta}
        </button>

        <p className="text-[10px] text-white/40">Advertisement · Ad {adNumber} of 3 to unlock 15-min ad-free session</p>
      </div>

      {/* Bottom counter */}
      <div className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 bg-surface">
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i < adNumber ? ad.accent : i === adNumber ? `${ad.accent}/60` : "bg-border"}`} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{AD_DURATION - elapsed}s remaining</span>
      </div>
    </div>
  );
}
