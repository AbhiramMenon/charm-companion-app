import { ArrowRight, Sparkles } from "lucide-react";
import { useTour } from "@/lib/TourContext";

const LS_KEY = "krackit_onboarded";

export function useOnboarding() {
  const done = typeof localStorage !== "undefined" && localStorage.getItem(LS_KEY) === "1";
  return !done;
}

export function markOnboardingDone() {
  localStorage.setItem(LS_KEY, "1");
}

export function OnboardingTour({ onDone }: { onDone: () => void }) {
  const { replayTour } = useTour();

  const handleStart = () => {
    markOnboardingDone();
    onDone();
    replayTour("home");
  };

  const handleSkip = () => {
    markOnboardingDone();
    onDone();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center pb-8 px-4" style={{ borderRadius: "inherit", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)" }}>
      <div className="w-full rounded-3xl border border-border/60 bg-background/97 px-6 pt-6 pb-5 shadow-2xl shadow-black/60 backdrop-blur-xl">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15">
            <Sparkles className="h-6 w-6 text-gold" />
          </div>
          <button
            onClick={handleSkip}
            className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">Welcome to KrackIT 🎉</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Your shortcut to cracking competitive exams. Let us quickly show you around — takes less than a minute.
        </p>

        <button
          onClick={handleStart}
          className="flex w-full items-center justify-center gap-2 rounded-2xl gold-gradient py-3 text-sm font-bold text-[#1a1410] transition-transform active:scale-[0.97]"
        >
          Start Tour <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
