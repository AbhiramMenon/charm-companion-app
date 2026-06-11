import { KrackItLogo, KrackItWordmark } from "./KrackItLogo";

export function Splash() {
  return (
    <div
      className="flex h-full flex-1 flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#0e0e14" }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 380,
          height: 380,
          background: "radial-gradient(circle, rgba(212,162,76,0.10) 0%, rgba(212,162,76,0.03) 55%, transparent 75%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -58%)",
          borderRadius: "50%",
        }}
      />

      {/* Logo */}
      <div className="splash-logo">
        <div className="splash-star">
          <KrackItLogo size={110} glowStar />
        </div>
      </div>

      {/* Wordmark */}
      <div className="mt-7 text-center splash-title">
        <KrackItWordmark className="text-[2.8rem] leading-none" />
        <p className="mt-3 text-[15px] font-normal tracking-wide text-white/50">
          One trick ahead
        </p>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-16 flex flex-col items-center gap-3">
        <div className="w-40 overflow-hidden rounded-full bg-white/10" style={{ height: 4 }}>
          <div
            className="h-full rounded-full splash-bar"
            style={{
              width: "45%",
              background: "linear-gradient(90deg, #F8E5A0 0%, #D4A24C 60%, #9A6A20 100%)",
            }}
          />
        </div>
        <p className="text-[12px] font-medium text-white/35 tracking-widest uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
}
