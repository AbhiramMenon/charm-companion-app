import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, Gift, Share2, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { profileApi } from "@/lib/mobileApi";

const PERKS = [
  "Access to 1000+ memory tricks",
  "Daily Trick of the Day",
  "Exam countdowns & news alerts",
  "Mock tests for competitive exams",
  "SSC, UPSC, Banking, Railways & more",
];

export function ReferScreen({
  userId,
  userName,
  onBack,
}: {
  userId?: string | null;
  userName: string;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  const referralCode = userId
    ? userId.replace(/-/g, "").slice(0, 8).toUpperCase()
    : "KRACKIT";
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : "https://krackit.app"}?ref=${referralCode}`;

  useEffect(() => {
    if (!userId) return;
    profileApi.getReferralCount(referralCode).then(setReferralCount).catch(() => {});
  }, [userId, referralCode]);

  const shareMessage = `Hey! Have you heard about KrackIT? 🎯

I've been using it to prepare for competitive exams and it's been amazing!

Use my invite code ${referralCode} when you sign up to get FREE access to:
✅ 1000+ Memory Tricks
✅ Daily Trick of the Day
✅ Mock Tests (SSC, UPSC, Banking, Railways & more)
✅ Exam Countdown & Latest Notifications
✅ Short Notes & Revision Tools

KrackIT has a 4.8+ rating from lakhs of aspirants.

Download and use code ${referralCode}:
${referralLink}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on KrackIT — Crack your competitive exam!",
          text: shareMessage,
          url: referralLink,
        });
        return;
      } catch {}
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Settings</p>
          <h1 className="text-2xl font-bold text-foreground">Refer & Earn</h1>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-5 mt-5 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/15 via-surface to-surface p-5 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gold/10 ring-2 ring-gold/20 mb-4">
          <Gift className="h-8 w-8 text-gold" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Share KrackIT with friends</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Help your friends crack their exams. Every student you invite gets free access to all the tools they need.
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] text-gold font-semibold">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            4.8 rating · Trusted by lakhs of aspirants
          </div>
          {referralCount > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <Users className="h-3.5 w-3.5" />
              {referralCount} friend{referralCount === 1 ? "" : "s"} joined via your code
            </div>
          )}
        </div>
      </div>

      {/* Referral Code */}
      <div className="mx-5 mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your Invite Code</p>
        <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-surface px-4 py-3">
          <span className="flex-1 font-mono text-xl font-black tracking-widest text-foreground">
            {referralCode}
          </span>
          <button
            onClick={handleCopyCode}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
              copied ? "bg-emerald-400/15 text-emerald-400" : "bg-gold/10 text-gold hover:bg-gold/20"
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* What friends get */}
      <div className="mx-5 mt-5 rounded-3xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-gold" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">What your friends get</p>
        </div>
        <ul className="space-y-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                <Check className="h-2.5 w-2.5 text-emerald-400" />
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* Share message preview */}
      <div className="mx-5 mt-5 rounded-3xl border border-border bg-surface p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Message Preview</p>
        <pre className="whitespace-pre-wrap text-[11px] text-muted-foreground leading-relaxed font-sans">
          {shareMessage}
        </pre>
      </div>

      {/* Share CTA */}
      <div className="mx-5 mt-5">
        <button
          onClick={handleShare}
          className={cn(
            "flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-bold transition-all active:scale-95",
            copied ? "bg-emerald-400/15 text-emerald-400" : "gold-gradient text-[#1a1410] shadow-lg shadow-gold/20"
          )}
        >
          <Share2 className="h-5 w-5" />
          {copied ? "Message Copied to Clipboard!" : "Share Invite Link"}
        </button>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Opens your device's share sheet — WhatsApp, Telegram, SMS and more
        </p>
      </div>
    </div>
  );
}
