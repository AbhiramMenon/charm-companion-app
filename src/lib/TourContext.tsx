import { createContext, useCallback, useContext, useState } from "react";

export type TourStep = {
  selector: string;
  title: string;
  desc: string;
  tooltipPos?: "top" | "bottom";
};

type TourDef = { id: string; steps: TourStep[] };

// ── Tour definitions ──────────────────────────────────────────────────────────

const TOURS: Record<string, TourDef> = {
  home: {
    id: "home",
    steps: [
      {
        selector: '[data-tour="streak-card"]',
        title: "Your Daily Streak 🔥",
        desc: "Log in every day to build your streak. The longer your streak, the sharper your memory retention!",
        tooltipPos: "bottom",
      },
      {
        selector: '[data-tour="countdown-card"]',
        title: "Exam Countdown ⏰",
        desc: "Live countdown to your nearest exam. Subscribe to an exam pack to track it here.",
        tooltipPos: "bottom",
      },
      {
        selector: '[data-tour="progress-bar"]',
        title: "Your Learning Progress 📈",
        desc: "See how many tricks you've viewed and mastered. Tap 'Mark as Mastered' on tricks to grow this bar.",
        tooltipPos: "bottom",
      },
      {
        selector: '[data-tour="exam-grid"]',
        title: "Pick Your Exam 📚",
        desc: "Choose from UPSC, SSC, NEET, JEE, CAT, Banking and more. Each has subjects, chapters, and hundreds of memory tricks.",
        tooltipPos: "bottom",
      },
      {
        selector: '[data-tour="trick-of-day"]',
        title: "Trick of the Day ✨",
        desc: "A fresh memory trick curated every day. Open it, learn it, rate it — builds your daily habit!",
        tooltipPos: "top",
      },
      {
        selector: '[data-tour="exam-news"]',
        title: "Exam Updates 📰",
        desc: "Stay updated on exam dates, admit cards, results, and important announcements from exam authorities.",
        tooltipPos: "top",
      },
    ],
  },
  trickDetail: {
    id: "trickDetail",
    steps: [
      {
        selector: '[data-tour="tts-btn"]',
        title: "Listen Aloud 🔊",
        desc: "Tap to hear the trick read in your selected language using text-to-speech. Perfect for commutes!",
        tooltipPos: "bottom",
      },
      {
        selector: '[data-tour="share-btn"]',
        title: "Share with Friends 📤",
        desc: "Send this trick to your study group via any app, or copy the link to share directly.",
        tooltipPos: "bottom",
      },
      {
        selector: '[data-tour="bookmark-btn"]',
        title: "Save for Later 🔖",
        desc: "Bookmark this trick to find it instantly in your Saved section — great for revision day!",
        tooltipPos: "bottom",
      },
      {
        selector: '[data-tour="trick-content"]',
        title: "The Memory Trick ⚡",
        desc: "This is your mnemonic — a powerful shortcut to encode complex information into long-term memory.",
        tooltipPos: "bottom",
      },
      {
        selector: '[data-tour="rating-section"]',
        title: "Rate This Trick ⭐",
        desc: "Rate the quality and usefulness. Your rating updates the average in real-time and helps improve content for everyone.",
        tooltipPos: "top",
      },
      {
        selector: '[data-tour="mastered-btn"]',
        title: "Mark as Mastered ✓",
        desc: "Tap when you've fully memorized this trick. Tracks your learning progress and grows your profile stats.",
        tooltipPos: "top",
      },
    ],
  },
};

// ── Context ───────────────────────────────────────────────────────────────────

type TourContextType = {
  activeTour: TourDef | null;
  step: number;
  totalSteps: number;
  currentStep: TourStep | null;
  startTour: (id: string) => void;
  replayTour: (id: string) => void;
  next: () => void;
  prev: () => void;
  end: () => void;
  isTourDone: (id: string) => boolean;
};

const TourContext = createContext<TourContextType>({
  activeTour: null, step: 0, totalSteps: 0, currentStep: null,
  startTour: () => {}, replayTour: () => {}, next: () => {}, prev: () => {}, end: () => {},
  isTourDone: () => true,
});

const LS_PREFIX = "krackit_tour_";

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<TourDef | null>(null);
  const [step, setStep] = useState(0);

  const isTourDone = useCallback((id: string) =>
    localStorage.getItem(LS_PREFIX + id) === "1", []);

  const _launch = useCallback((id: string) => {
    const tour = TOURS[id];
    if (!tour) return;
    setStep(0);
    setActiveTour(tour);
  }, []);

  const startTour = useCallback((id: string) => {
    if (isTourDone(id)) return;
    _launch(id);
  }, [isTourDone, _launch]);

  const replayTour = useCallback((id: string) => {
    localStorage.removeItem(LS_PREFIX + id);
    _launch(id);
  }, [_launch]);

  const end = useCallback(() => {
    if (activeTour) localStorage.setItem(LS_PREFIX + activeTour.id, "1");
    setActiveTour(null);
  }, [activeTour]);

  const next = useCallback(() => {
    if (!activeTour) return;
    if (step >= activeTour.steps.length - 1) { end(); return; }
    setStep((s) => s + 1);
  }, [activeTour, step, end]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const currentStep = activeTour ? (activeTour.steps[step] ?? null) : null;
  const totalSteps = activeTour?.steps.length ?? 0;

  return (
    <TourContext.Provider value={{
      activeTour, step, totalSteps, currentStep,
      startTour, replayTour, next, prev, end, isTourDone,
    }}>
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);
