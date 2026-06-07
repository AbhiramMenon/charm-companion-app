import { KrackItLogo, KrackItWordmark } from "./KrackItLogo";

export function Splash() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Soft radial glow behind logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 320,
          height: 320,
          background: "radial-gradient(circle, rgba(212,162,76,0.12) 0%, rgba(212,162,76,0.04) 50%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          borderRadius: "50%",
        }}
      />

      {/* Logo — scale + fade in */}
      <div className="splash-logo">
        {/* Star glow applies only here during splash */}
        <div className="splash-star">
          <KrackItLogo size={88} glowStar />
        </div>
      </div>

      {/* App name */}
      <div className="mt-6 text-center">
        <div className="splash-title">
          <KrackItWordmark className="text-[2.6rem] leading-none" />
        </div>
        <p className="splash-tagline mt-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
          One trick ahead
        </p>
      </div>

      {/* Loading indicator */}
      <div className="mt-14 w-32 overflow-hidden rounded-full bg-surface/80" style={{ height: 3 }}>
        <div
          className="h-full rounded-full splash-bar"
          style={{
            width: "40%",
            background: "linear-gradient(90deg, #F8E5A0 0%, #D4A24C 60%, #9A6A20 100%)",
          }}
        />
      </div>
    </div>
  );
}
