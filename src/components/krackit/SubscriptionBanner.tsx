import { Crown, X } from "lucide-react";
import { useState } from "react";

export function SubscriptionBanner({ onUpgrade }: { onUpgrade: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-gold/20 bg-background/95 backdrop-blur-md px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/15">
          <Crown className="h-4 w-4 text-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-foreground">Free plan · 1 chapter per subject</p>
          <p className="text-[10px] text-muted-foreground">Upgrade to unlock all chapters</p>
        </div>
        <button
          onClick={onUpgrade}
          className="shrink-0 rounded-xl gold-gradient px-3 py-1.5 text-[11px] font-bold text-[#1a1410]"
        >
          Upgrade →
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-muted-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
