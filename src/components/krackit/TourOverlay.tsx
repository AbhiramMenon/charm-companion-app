import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTour } from "@/lib/TourContext";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 10; // padding around highlighted element

export function TourOverlay() {
  const { currentStep, step, totalSteps, next, prev, end, activeTour } = useTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const [show, setShow] = useState(false);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentStep) { setRect(null); setShow(false); return; }

    setShow(false);
    if (retryRef.current) clearTimeout(retryRef.current);

    const locate = () => {
      const el = document.querySelector(currentStep.selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        // slight delay so layout settles
        setTimeout(() => setShow(true), 80);
        return true;
      }
      return false;
    };

    if (!locate()) {
      retryRef.current = setTimeout(() => locate(), 300);
    }

    return () => { if (retryRef.current) clearTimeout(retryRef.current); };
  }, [currentStep, step]);

  if (!currentStep || !activeTour) return null;

  const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  // Spotlight positioned at highlighted element (viewport coords)
  const spotTop = rect ? rect.top - PAD : 0;
  const spotLeft = rect ? rect.left - PAD : 0;
  const spotW = rect ? rect.width + PAD * 2 : 0;
  const spotH = rect ? rect.height + PAD * 2 : 0;

  // Tooltip positioning: put panel below element unless tooltipPos=top
  const belowElement = currentStep.tooltipPos !== "top";
  const tooltipTopVal = rect ? (belowElement ? rect.top + rect.height + PAD + 14 : undefined) : undefined;
  const tooltipBottomVal = rect && !belowElement ? window.innerHeight - (rect.top - PAD - 14) : undefined;
  const tooltipLeft = rect
    ? Math.max(12, Math.min(rect.left - 4, window.innerWidth - 308))
    : 12;
  const tooltipWidth = Math.min(300, window.innerWidth - 24);

  return (
    <>
      {/* CSS for glow animation */}
      <style>{`
        @keyframes krackit-glow {
          0%   { box-shadow: 0 0 0 9999px rgba(0,0,0,0.83), 0 0 0 2px #D4A24C, 0 0 8px  4px rgba(212,162,76,0.35); }
          50%  { box-shadow: 0 0 0 9999px rgba(0,0,0,0.83), 0 0 0 2.5px #D4A24C, 0 0 20px 8px rgba(212,162,76,0.65); }
          100% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.83), 0 0 0 2px #D4A24C, 0 0 8px  4px rgba(212,162,76,0.35); }
        }
      `}</style>

      {/* Full-screen dark backdrop (pointer-events block clicks through) */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9990, background: "transparent", pointerEvents: "none" }}
      />

      {/* Spotlight window — transparent div with box-shadow dims everything else */}
      {rect && (
        <div
          style={{
            position: "fixed",
            top: spotTop,
            left: spotLeft,
            width: spotW,
            height: spotH,
            borderRadius: 16,
            zIndex: 9995,
            pointerEvents: "none",
            animation: "krackit-glow 2s ease-in-out infinite",
            transition: "top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease",
          }}
        />
      )}

      {/* Tooltip card */}
      {rect && (
        <div
          style={{
            position: "fixed",
            top: tooltipTopVal,
            bottom: tooltipBottomVal,
            left: tooltipLeft,
            width: tooltipWidth,
            zIndex: 9999,
            opacity: show ? 1 : 0,
            transform: show ? "scale(1) translateY(0)" : `scale(0.94) translateY(${belowElement ? 6 : -6}px)`,
            transition: "opacity 0.22s ease, transform 0.22s ease",
            pointerEvents: "auto",
          }}
        >
          {/* Arrow pointing to element */}
          {belowElement && rect && (
            <div style={{
              position: "absolute",
              top: -8,
              left: Math.max(16, Math.min(rect.left - tooltipLeft + rect.width / 2 - 8, tooltipWidth - 32)),
              width: 0, height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "8px solid rgba(255,255,255,0.07)",
            }} />
          )}
          {!belowElement && rect && (
            <div style={{
              position: "absolute",
              bottom: -8,
              left: Math.max(16, Math.min(rect.left - tooltipLeft + rect.width / 2 - 8, tooltipWidth - 32)),
              width: 0, height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid rgba(255,255,255,0.07)",
            }} />
          )}

          <div
            style={{
              background: "rgba(18,14,10,0.97)",
              border: "1px solid rgba(212,162,76,0.25)",
              borderRadius: 20,
              padding: "16px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,162,76,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Progress bar + close */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, borderRadius: 99, background: "linear-gradient(90deg,#b07830,#D4A24C)", transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, whiteSpace: "nowrap" }}>{step + 1}/{totalSteps}</span>
              <button
                onClick={end}
                style={{ padding: "2px 8px", borderRadius: 99, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}
              >
                Skip
              </button>
            </div>

            {/* Title + desc */}
            <p style={{ fontSize: 14, fontWeight: 700, color: "#f5f0e8", marginBottom: 6, lineHeight: 1.3 }}>
              {currentStep.title}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 14 }}>
              {currentStep.desc}
            </p>

            {/* Nav buttons */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {!isFirst && (
                <button
                  onClick={prev}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "8px 14px",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "transparent",
                    color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <ArrowLeft size={12} /> Back
                </button>
              )}
              <button
                onClick={next}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#c49040,#D4A24C,#b07830)",
                  color: "#1a1410", fontSize: 12, fontWeight: 800, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(212,162,76,0.35)",
                }}
              >
                {isLast ? "Got it! 🎉" : <>Next <ArrowRight size={12} /></>}
              </button>
            </div>

            {/* Step dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 12 }}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  style={{
                    height: 5,
                    width: i === step ? 18 : 5,
                    borderRadius: 99,
                    background: i === step ? "#D4A24C" : "rgba(255,255,255,0.15)",
                    transition: "width 0.25s ease, background 0.25s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
