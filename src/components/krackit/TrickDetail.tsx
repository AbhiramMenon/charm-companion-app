import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2,
  ChevronLeft, ChevronRight, Copy, Share2, Sparkles, Volume2, VolumeX,
} from "lucide-react";
import type { Trick } from "@/lib/krackit-data";
import type { Lang } from "@/lib/translations";
import { cn } from "@/lib/utils";

const LANG_CODE: Record<Lang, string> = {
  English: "en-IN", Hindi: "hi-IN", Tamil: "ta-IN", Telugu: "te-IN",
  Bengali: "bn-IN", Marathi: "mr-IN", Gujarati: "gu-IN", Kannada: "kn-IN",
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

async function shareTrick(trick: Trick) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/t/${trick.id}`;
  const text = `Check out this trick on KrackIT — "${trick.title}". Open in the app: ${url}`;
  if (navigator.share) {
    try { await navigator.share({ title: trick.title, text, url }); return "shared"; }
    catch { return "cancelled"; }
  }
  try { await navigator.clipboard.writeText(url); return "copied"; }
  catch { return "error"; }
}

export function TrickDetail({
  trick,
  trickList,
  saved,
  mastered,
  rating,
  avgRating,
  savedCount,
  language = "English",
  medium,
  onToggleSave,
  onToggleMastered,
  onRate,
  onNavigate,
  onBack,
}: {
  trick: Trick;
  trickList: Trick[];
  saved: boolean;
  mastered: boolean;
  rating: number;
  avgRating?: { avg: number; count: number };
  savedCount?: number;
  language?: Lang;
  medium?: string;
  onToggleSave: () => void;
  onToggleMastered: () => void;
  onRate: (stars: number) => void;
  onNavigate: (t: Trick) => void;
  onBack: () => void;
}) {
  const currentIndex = trickList.findIndex((t) => t.id === trick.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < trickList.length - 1;

  const touchStart = useRef<number | null>(null);
  const touchDelta = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [shareLabel, setShareLabel] = useState<"" | "Copied!" | "Shared!">("");
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Star hover state for pre-rating
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => { return () => { window.speechSynthesis?.cancel(); }; }, []);
  useEffect(() => { window.speechSynthesis?.cancel(); setTtsPlaying(false); }, [trick.id]);

  const handleTts = () => {
    if (!("speechSynthesis" in window)) return;
    if (ttsPlaying) { window.speechSynthesis.cancel(); setTtsPlaying(false); return; }
    const text = `${trick.title}. ${trick.content}. ${trick.explanation}`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANG_CODE[language] ?? "en-IN";
    utter.rate = 0.9;
    utter.onend = () => setTtsPlaying(false);
    utter.onerror = () => setTtsPlaying(false);
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    setTtsPlaying(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
    setSwiping(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.touches[0].clientX - touchStart.current;
    touchDelta.current = delta;
    setSwipeOffset(delta * 0.25);
  };
  const handleTouchEnd = () => {
    const delta = touchDelta.current;
    setSwipeOffset(0);
    setSwiping(false);
    touchStart.current = null;
    if (delta < -60 && hasNext) onNavigate(trickList[currentIndex + 1]);
    else if (delta > 60 && hasPrev) onNavigate(trickList[currentIndex - 1]);
  };

  const handleShare = async () => {
    const result = await shareTrick(trick);
    if (result === "copied") { setShareLabel("Copied!"); setTimeout(() => setShareLabel(""), 2000); }
    else if (result === "shared") { setShareLabel("Shared!"); setTimeout(() => setShareLabel(""), 2000); }
  };

  const diffColor =
    trick.difficulty === "Easy"   ? "text-emerald-400 bg-emerald-400/10" :
    trick.difficulty === "Medium" ? "text-amber-300 bg-amber-300/10"     :
                                    "text-rose-400 bg-rose-400/10";

  // Avg rating pill — shown always when data available
  const AvgRatingPill = avgRating ? (
    <div className="flex items-center gap-1.5 rounded-xl bg-gold/10 px-3 py-1.5">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4A24C" stroke="#D4A24C" strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      <span className="text-sm font-bold text-gold">{avgRating.avg.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">avg · {avgRating.count.toLocaleString()} ratings</span>
    </div>
  ) : null;

  return (
    <div
      className="flex h-full flex-1 flex-col"
      style={{ transform: `translateX(${swipeOffset}px)`, transition: swiping ? "none" : "transform 0.2s ease" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>

        {trickList.length > 1 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <button onClick={() => hasPrev && onNavigate(trickList[currentIndex - 1])} disabled={!hasPrev}
              data-tour="swipe-prev"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="w-14 text-center">{currentIndex + 1} / {trickList.length}</span>
            <button onClick={() => hasNext && onNavigate(trickList[currentIndex + 1])} disabled={!hasNext}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          {"speechSynthesis" in window && (
            <button
              data-tour="tts-btn"
              onClick={handleTts}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                ttsPlaying ? "bg-gold/15 text-gold animate-pulse" : "bg-surface text-foreground"
              )}
              title={ttsPlaying ? "Stop reading" : "Read aloud"}
            >
              {ttsPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}
          <button
            data-tour="share-btn"
            onClick={handleShare}
            className={cn(
              "flex h-10 items-center justify-center rounded-full bg-surface text-foreground transition-all",
              shareLabel ? "w-auto gap-1.5 px-3 text-xs font-semibold text-gold" : "w-10"
            )}
          >
            {shareLabel ? <><Copy className="h-3.5 w-3.5" />{shareLabel}</> : <Share2 className="h-4 w-4" />}
          </button>
          <button
            data-tour="bookmark-btn"
            onClick={onToggleSave}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              saved ? "bg-gold/15 text-gold" : "bg-surface text-foreground"
            )}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", diffColor)}>
            {trick.difficulty}
          </span>
          <span className="text-xs text-muted-foreground">{trick.subject}</span>
          {mastered && (
            <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">
              <CheckCircle2 className="h-3 w-3" /> Mastered
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold leading-tight text-foreground">{trick.title}</h1>

        {/* The Trick */}
        <div data-tour="trick-content" className="mt-5 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-transparent p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/80">The Trick</p>
          </div>
          <p className="gold-text text-xl font-bold tracking-tight">{trick.content}</p>
        </div>

        {/* Explanation */}
        <section className="mt-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">How it works</h2>
          <p className="text-sm leading-relaxed text-foreground/90">{trick.explanation}</p>
        </section>

        {/* Quick Tip */}
        <div className="mt-5 rounded-2xl bg-surface p-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gold">Quick Tip</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Say this mnemonic aloud 3 times right now. Revisit in 1 day → 3 days → 1 week for long-term retention.
          </p>
        </div>

        {/* Stats — real data */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-border bg-surface p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Difficulty</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{trick.difficulty}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Saved by</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {savedCount !== undefined ? `${formatCount(savedCount)} users` : "—"}
            </p>
          </div>
        </div>

        {/* Star rating section */}
        <div data-tour="rating-section" className="mt-3 rounded-2xl border border-border bg-surface p-4">
          {rating === 0 ? (
            <>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                Rate this trick
              </p>
              {/* Avg shown even before rating */}
              {AvgRatingPill && <div className="flex justify-center mb-3">{AvgRatingPill}</div>}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    className="transition-transform active:scale-90 hover:scale-110"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24"
                      fill={(hoverStar || 0) >= star ? "#D4A24C" : "none"}
                      stroke={(hoverStar || 0) >= star ? "#D4A24C" : "currentColor"}
                      strokeWidth="1.5"
                      className={(hoverStar || 0) >= star ? "text-gold" : "text-muted-foreground/40"}
                    >
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                YOUR RATING
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="26" height="26" viewBox="0 0 24 24"
                    fill={rating >= star ? "#D4A24C" : "none"}
                    stroke={rating >= star ? "#D4A24C" : "currentColor"}
                    strokeWidth="1.5"
                    className={rating >= star ? "text-gold" : "text-muted-foreground/30"}
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
              </div>
              {AvgRatingPill && <div className="mt-3 flex justify-center">{AvgRatingPill}</div>}
            </>
          )}
        </div>

        {/* Mark as Mastered */}
        <button
          data-tour="mastered-btn"
          onClick={onToggleMastered}
          className={cn(
            "mt-6 w-full rounded-2xl py-4 text-base font-bold shadow-lg transition-transform active:scale-[0.98]",
            mastered
              ? "border border-gold/30 bg-gold/10 text-gold"
              : "gold-gradient text-[#1a1410] shadow-gold/20"
          )}
        >
          {mastered ? "✓ Mastered!" : "Mark as Mastered"}
        </button>

        {trickList.length > 1 && (
          <p data-tour="swipe-hint" className="mt-4 text-center text-xs text-muted-foreground">
            ← Swipe left / right to browse →
          </p>
        )}
      </div>
    </div>
  );
}
