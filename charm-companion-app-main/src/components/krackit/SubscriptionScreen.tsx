import { useState } from "react";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/routes/index";
import { useData } from "@/lib/DataContext";

export function SubscriptionScreen({
  tier,
  subscribedExamIds,
  onSelectExamPack,
  onBack,
}: {
  tier: UserProfile["tier"];
  subscribedExamIds: Set<string>;
  onSelectExamPack: (ids: string[]) => void;
  onBack: () => void;
}) {
  const { exams } = useData();
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());

  const toggleExam = (id: string) => {
    setSelectedExams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allUnlocked = tier !== "Free";

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Settings</p>
          <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
        </div>
      </header>

      {/* Current status */}
      <div className="mx-5 mt-5 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/20 via-surface to-surface p-4 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-gold mb-2" />
        <p className="font-display text-base font-bold text-foreground">Pay only for what you study</p>
        <p className="mt-1 text-xs text-muted-foreground">Select the exams you need and unlock all their chapters.</p>
        {allUnlocked && (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">All exams unlocked · {tier}</p>
        )}
      </div>

      {/* Exam selection */}
      <div className="mt-6 px-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-gold" />
          <h2 className="text-base font-bold text-foreground">Select Exams</h2>
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">₹149/exam/mo</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Unlock all chapters for specific exams only. Pick one or more.
        </p>

        <div className="space-y-2">
          {exams.map((exam) => {
            const alreadySub = subscribedExamIds.has(exam.id);
            const selected = selectedExams.has(exam.id);
            return (
              <button
                key={exam.id}
                onClick={() => !alreadySub && !allUnlocked && toggleExam(exam.id)}
                disabled={alreadySub || allUnlocked}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                  selected ? "border-gold/40 bg-gold/10" : "border-border bg-surface",
                  (alreadySub || allUnlocked) && "opacity-60 cursor-default"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm",
                  `bg-gradient-to-br ${exam.accent}`
                )}>
                  {exam.short}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{exam.name}</p>
                  <p className="text-[11px] text-muted-foreground">{exam.subjects} subjects · {exam.tricks} tricks</p>
                </div>
                {alreadySub || allUnlocked ? (
                  <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Active</span>
                ) : (
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    selected ? "border-gold bg-gold" : "border-border bg-transparent"
                  )}>
                    {selected && <Check className="h-3 w-3 text-[#1a1410]" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedExams.size > 0 && (
          <button
            onClick={() => onSelectExamPack(Array.from(selectedExams))}
            className="mt-4 w-full rounded-2xl gold-gradient py-3.5 text-sm font-bold text-[#1a1410] shadow-lg shadow-gold/20"
          >
            Continue with {selectedExams.size} Exam{selectedExams.size > 1 ? "s" : ""} →
          </button>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground px-5">Cancel anytime · Secure payment via Razorpay</p>
    </div>
  );
}
