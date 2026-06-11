import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageSquare, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { issueApi } from "@/lib/mobileApi";
import { useTour } from "@/lib/TourContext";

const faqs = [
  { q: "How does KrackIT help me prepare?", a: "KrackIT gives you memory tricks (mnemonics) for competitive exams. Instead of rote learning, you remember formulas, facts and sequences using creative shortcuts that stick." },
  { q: "What exams does KrackIT cover?", a: "We cover UPSC CSE, SSC CGL, NEET UG, JEE Main, CAT, and Banking (IBPS). More exams are added regularly." },
  { q: "How is progress tracked?", a: "Tricks you open are marked as 'Viewed'. When you click 'Mark as Mastered', the trick is added to your mastered count and your chapter/subject progress updates automatically." },
  { q: "What is a streak?", a: "Your streak counts consecutive days you learn at least one trick. Missing a day resets the streak. Streaks motivate daily habit formation." },
  { q: "What does the Gold Learner plan include?", a: "Gold Learner gives you unlimited access to all tricks, offline mode, progress sync across devices, and priority support." },
  { q: "How do I reset my password?", a: "On the Sign In screen, tap 'Forgot password?' and we'll send a reset link to your registered email." },
];

export function HelpSupportScreen({
  onBack,
  userId,
  userName,
  userEmail,
}: {
  onBack: () => void;
  userId?: string | null;
  userName?: string;
  userEmail?: string;
}) {
  const { replayTour } = useTour();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!msg.trim()) return;
    if (!userId) { setError("Please sign in to send a message."); return; }
    setSending(true);
    setError("");
    try {
      await issueApi.submit({
        userId,
        userName:  userName  ?? "Unknown",
        userEmail: userEmail ?? "",
        subject:   subject.trim() || "General Inquiry",
        message:   msg.trim(),
      });
      setSent(true);
      setSubject("");
      setMsg("");
      setTimeout(() => setSent(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send. Please try again.";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Settings</p>
          <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        </div>
      </header>

      <div className="mt-5 space-y-5 px-5">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4">
            <Mail className="h-6 w-6 text-gold" />
            <p className="text-xs font-semibold text-foreground">Email Us</p>
            <p className="text-[11px] text-muted-foreground">support@krackit.app</p>
          </button>
          <button className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4">
            <MessageSquare className="h-6 w-6 text-gold" />
            <p className="text-xs font-semibold text-foreground">Live Chat</p>
            <p className="text-[11px] text-muted-foreground">9 AM – 6 PM IST</p>
          </button>
        </div>

        {/* App Tour replay */}
        <button
          onClick={() => { replayTour("home"); onBack(); }}
          className="flex w-full items-center gap-4 rounded-2xl border border-gold/25 bg-gold/8 px-5 py-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 ring-1 ring-gold/25">
            <Compass className="h-5 w-5 text-gold" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">App Tour</p>
            <p className="text-[11px] text-muted-foreground">Replay the guided walkthrough</p>
          </div>
          <span className="text-xs font-bold text-gold">Start →</span>
        </button>

        {/* FAQs */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequently Asked</p>
          <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
            {faqs.map((faq, i) => (
              <li key={i}>
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left"
                >
                  <p className="flex-1 text-sm font-semibold text-foreground">{faq.q}</p>
                  {expanded === i
                    ? <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    : <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>
                {expanded === i && (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact form */}
        <div className="rounded-3xl border border-border bg-surface p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Send a Message</p>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Can't log in, Wrong trick)"
            maxLength={100}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none"
          />
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Describe your issue or question…"
            rows={4}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none resize-none"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          {sent ? (
            <p className="rounded-xl bg-emerald-400/10 px-4 py-2.5 text-xs text-emerald-400">Message sent! We'll reply within 24 hours.</p>
          ) : (
            <button
              onClick={send}
              disabled={sending || !msg.trim()}
              className={cn("w-full rounded-2xl gold-gradient py-3 text-sm font-bold text-[#1a1410] shadow-gold/20 transition-transform active:scale-[0.98]", (sending || !msg.trim()) && "opacity-50 cursor-not-allowed")}
            >
              {sending ? "Sending…" : "Send Message"}
            </button>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">Version 1.0.0 · KrackIT</p>
      </div>
    </div>
  );
}
