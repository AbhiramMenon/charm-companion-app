import { cn } from "@/lib/utils";

export function KrackItLogo({
  size = 80,
  glowStar = false,
  className,
}: {
  size?: number;
  glowStar?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <defs>
        <linearGradient id="kGold" x1="8" y1="18" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDEEA0" />
          <stop offset="45%" stopColor="#D4A24C" />
          <stop offset="100%" stopColor="#8B5A10" />
        </linearGradient>
        <linearGradient id="kGoldStar" x1="66" y1="2" x2="86" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEA" />
          <stop offset="55%" stopColor="#F5D98A" />
          <stop offset="100%" stopColor="#C8902A" />
        </linearGradient>
        <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* K vertical stroke — bold, tall */}
      <rect x="8" y="18" width="16" height="68" rx="3" fill="url(#kGold)" />

      {/*
        Upper arm — THIN (8 px at stem, ≈ half the lower arm)
        Spine y=46→54 at x=24, tip y=26→32 at x≈63→69
      */}
      <path d="M24,46 L63,26 L70,32 L24,54 Z" fill="url(#kGold)" />

      {/*
        3-px notch gap: y=54 → y=57

        Lower arm — THICK (16 px at stem, 2× upper)
        Spine y=57→73 at x=24, tip flattens to y=86
      */}
      <path d="M24,57 L24,73 L76,86 L65,86 Z" fill="url(#kGold)" />

      {/*
        4-pointed sparkle star — floats ABOVE the K (bottom point y=14, stem starts y=18)
        Center ≈ (76, 7); 4-px clear gap between star and K top
      */}
      <g
        className={glowStar ? "splash-star" : undefined}
        filter={glowStar ? "url(#starGlow)" : undefined}
      >
        <path
          d="M76,1 L78.5,6 L84,8 L78.5,10 L76,15 L73.5,10 L68,8 L73.5,6 Z"
          fill="url(#kGoldStar)"
        />
      </g>
    </svg>
  );
}

export function KrackItWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight",
        "bg-gradient-to-r from-[#FDEEA0] via-[#D4A24C] to-[#8B5A10] bg-clip-text text-transparent",
        className
      )}
    >
      KrackIt
    </span>
  );
}
