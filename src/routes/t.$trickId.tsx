import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Smartphone } from "lucide-react";
import { KrackItLogo, KrackItWordmark } from "@/components/krackit/KrackItLogo";
import { PhoneFrame } from "@/components/krackit/PhoneFrame";

export const Route = createFileRoute("/t/$trickId")({
  component: TrickSharePage,
});

function TrickSharePage() {
  const { trickId } = Route.useParams();

  return (
    <PhoneFrame>
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-background px-6 text-center">
        <KrackItLogo size={84} glowStar />
        <div className="mt-4">
          <KrackItWordmark className="text-3xl" />
        </div>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
          One trick ahead
        </p>

        <div className="mt-8 rounded-2xl border border-gold/25 bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-gold font-semibold">Shared Trick</p>
          <p className="mt-1 text-sm text-foreground">
            Someone shared a KrackIT trick with you.
          </p>
          <p className="mt-3 text-[11px] text-muted-foreground break-all">
            Trick ID: <span className="text-foreground/80">{trickId}</span>
          </p>
        </div>

        <p className="mt-6 max-w-xs text-sm text-muted-foreground">
          To view this trick, download the KrackIT app on your phone.
        </p>

        <a
          href="#"
          className="mt-5 flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl gold-gradient py-3.5 text-sm font-bold text-[#1a1410] shadow-lg shadow-gold/20"
        >
          <Download className="h-4 w-4" />
          Download the App
        </a>

        <Link
          to="/"
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
        >
          <Smartphone className="h-3.5 w-3.5" />
          Continue in browser
        </Link>
      </div>
    </PhoneFrame>
  );
}
