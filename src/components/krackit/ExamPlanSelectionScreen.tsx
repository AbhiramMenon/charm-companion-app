import { useState } from "react";
import { ArrowLeft, Check, Sparkles, CalendarDays, Calendar, CalendarRange } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";

type Duration = "monthly" | "sixmonths" | "yearly";

export function ExamPlanSelectionScreen({
  examIds,
  onSelectDuration,
  onBack,
}: {
  examIds: string[];
  onSelectDuration: (duration: Duration) => void;
  onBack: () => void;
}) {
  const { exams, pricing } = useData();
  const [selected, setSelected] = useState<Duration | null>(null);
  const selectedExams = examIds.map((id) => exams.find((e) => e.id === id)).filter(Boolean);
  const count = examIds.length;

  const getOriginalPrice = (examId: string, d: Duration): number => {
    const p = pricing.find((x) => x.exam_id === examId);
    if (!p) return d === "monthly" ? 149 : d === "sixmonths" ? 749 : 1299;
    return p[d];
  };

  const applyDiscount = (base: number, examId: string): number => {
    const p = pricing.find((x) => x.exam_id === examId);
    const pct = (p as any)?.discount_percent ?? 0;
    return pct > 0 ? Math.round(base * (1 - pct / 100)) : base;
  };

  const getPrice = (examId: string, d: Duration): number =>
    applyDiscount(getOriginalPrice(examId, d), examId);

  // Active discount badge for the first exam that has one
  const activeDiscount = examIds.reduce((max, id) => {
    const p = pricing.find((x) => x.exam_id === id);
    return Math.max(max, (p as any)?.discount_percent ?? 0);
  }, 0);

  const monthlyOrig     = examIds.reduce((s, id) => s + getOriginalPrice(id, "monthly"),   0);
  const sixmonthsOrig   = examIds.reduce((s, id) => s + getOriginalPrice(id, "sixmonths"), 0);
  const yearlyOrig      = examIds.reduce((s, id) => s + getOriginalPrice(id, "yearly"),    0);
  const monthlyTotal    = examIds.reduce((s, id) => s + getPrice(id, "monthly"),   0);
  const sixmonthsTotal  = examIds.reduce((s, id) => s + getPrice(id, "sixmonths"), 0);
  const yearlyTotal     = examIds.reduce((s, id) => s + getPrice(id, "yearly"),    0);
  const sixmonthsSaving = monthlyOrig * 6 - sixmonthsTotal;
  const yearlySaving    = monthlyOrig * 12 - yearlyTotal;

  const plans = [
    {
      id: "monthly" as Duration,
      label: "Monthly",
      icon: CalendarDays,
      price: monthlyTotal,
      origPrice: monthlyOrig !== monthlyTotal ? monthlyOrig : null,
      period: "/ month",
      note: count > 1 ? `₹${Math.round(monthlyTotal / count)}/exam avg · billed monthly` : "billed monthly",
      badge: null as string | null,
    },
    {
      id: "sixmonths" as Duration,
      label: "6 Months",
      icon: CalendarRange,
      price: sixmonthsTotal,
      origPrice: sixmonthsOrig !== sixmonthsTotal ? sixmonthsOrig : null,
      period: "/ 6 months",
      note: `Save ₹${sixmonthsSaving.toLocaleString("en-IN")} vs monthly`,
      badge: "Popular",
    },
    {
      id: "yearly" as Duration,
      label: "Yearly",
      icon: Calendar,
      price: yearlyTotal,
      origPrice: yearlyOrig !== yearlyTotal ? yearlyOrig : null,
      period: "/ year",
      note: `Save ₹${yearlySaving.toLocaleString("en-IN")} vs monthly`,
      badge: "Best Value",
    },
  ];

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
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Subscription</p>
          <h1 className="text-2xl font-bold text-foreground">Choose Your Plan</h1>
        </div>
      </header>

      {/* Selected exams summary */}
      <div className="mx-5 mt-5 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/10 via-surface to-surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-gold" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
            {count} Exam{count > 1 ? "s" : ""} Selected
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedExams.map((exam) =>
            exam ? (
              <div key={exam.id} className="flex items-center gap-1.5 rounded-xl border border-gold/20 bg-gold/10 px-2.5 py-1">
                <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold", `bg-gradient-to-br ${exam.accent}`)}>
                  {exam.short.slice(0, 2)}
                </div>
                <span className="text-xs font-semibold text-foreground">{exam.short}</span>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Discount banner */}
      {activeDiscount > 0 && (
        <div className="mx-5 mt-4 flex items-center gap-2 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-2.5">
          <span className="text-lg">🎉</span>
          <p className="text-xs font-semibold text-emerald-400">
            {activeDiscount}% limited-time discount applied!
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div className="mt-4 space-y-3 px-5">
        <p className="text-sm font-semibold text-muted-foreground mb-2">Select billing period</p>
        {plans.map((plan) => {
          const PlanIcon = plan.icon;
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={cn(
                "relative flex w-full items-center gap-4 rounded-3xl border p-5 text-left transition-all",
                isSelected
                  ? "border-gold/50 bg-gold/10 ring-1 ring-gold/30"
                  : "border-border bg-surface"
              )}
            >
              {plan.badge && (
                <span className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  plan.badge === "Best Value" ? "bg-emerald-400 text-[#0a1a0a]" : "bg-gold text-[#1a1410]"
                )}>
                  {plan.badge}
                </span>
              )}
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                isSelected ? "bg-gold/20" : "bg-background"
              )}>
                <PlanIcon className={cn("h-6 w-6", isSelected ? "text-gold" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground">{plan.label}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-foreground">₹{plan.price.toLocaleString("en-IN")}</span>
                  {plan.origPrice && (
                    <span className="text-sm line-through text-muted-foreground">₹{plan.origPrice.toLocaleString("en-IN")}</span>
                  )}
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
                <p className={cn(
                  "mt-0.5 text-[11px] font-semibold",
                  plan.badge ? "text-emerald-400" : "text-muted-foreground"
                )}>
                  {plan.note}
                </p>
              </div>
              <div className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                isSelected ? "border-gold bg-gold" : "border-border"
              )}>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#1a1410]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* GST note */}
      <p className="mt-4 px-5 text-center text-[11px] text-muted-foreground">
        Prices shown are exclusive of 18% GST · Secure payment via Razorpay
      </p>

      <div className="mt-6 px-5">
        <button
          onClick={() => selected && onSelectDuration(selected)}
          disabled={!selected}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-bold shadow-lg transition-transform active:scale-[0.98]",
            selected
              ? "gold-gradient text-[#1a1410] shadow-gold/20"
              : "border border-border bg-surface text-muted-foreground opacity-50 cursor-not-allowed"
          )}
        >
          {selected ? `Continue with ${selected === "monthly" ? "Monthly" : selected === "sixmonths" ? "6-Month" : "Yearly"} Plan →` : "Select a Plan to Continue"}
        </button>
      </div>
    </div>
  );
}
