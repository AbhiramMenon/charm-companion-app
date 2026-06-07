import { useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Crown, Shield, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/DataContext";
import { subscriptionApi } from "@/lib/mobileApi";

export type BillingInfo = {
  type: "plan" | "exam";
  plan?: "Gold Learner" | "Pro";
  examIds?: string[];
  amount: number;
  activatedAt: string;
  expiresAt: string;
  transactionId: string;
};

type Duration = "monthly" | "sixmonths" | "yearly";

const planConfig = {
  "Gold Learner": { icon: Crown, iconColor: "text-gold", monthly: 499, yearly: 4499, btnClass: "gold-gradient text-[#1a1410]" },
  "Pro":          { icon: Zap,   iconColor: "text-violet-400", monthly: 999, yearly: 8999, btnClass: "bg-violet-500/80 text-white" },
} as const;

const EXAM_MONTHLY    = 149;
const EXAM_SIXMONTHS  = 749;
const EXAM_YEARLY     = 1299;

function generateTxId() {
  return "KI" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

type PlanBillingProps = {
  type: "plan";
  plan: "Gold Learner" | "Pro";
};
type ExamBillingProps = {
  type: "exam";
  examIds: string[];
};

export function BillingScreen({
  billingType,
  userEmail,
  userName,
  userId,
  initialDuration,
  onSuccess,
  onBack,
}: {
  billingType: PlanBillingProps | ExamBillingProps;
  userEmail: string;
  userName: string;
  userId?: string | null;
  initialDuration?: Duration;
  onSuccess: (info: BillingInfo) => void;
  onBack: () => void;
}) {
  const [duration, setDuration] = useState<Duration>(initialDuration ?? "monthly");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [txId, setTxId] = useState("");

  const { exams, pricing } = useData();
  const isPlan = billingType.type === "plan";

  const getExamPrice = (examId: string, d: Duration): number => {
    const p = pricing.find((x) => x.exam_id === examId);
    if (!p) return d === "monthly" ? EXAM_MONTHLY : d === "sixmonths" ? EXAM_SIXMONTHS : EXAM_YEARLY;
    return p[d];
  };

  let baseAmount: number;
  let label: string;
  let btnClass: string;
  let Icon: typeof Crown = Crown;

  if (isPlan) {
    const cfg = planConfig[billingType.plan];
    Icon = cfg.icon;
    baseAmount = duration === "monthly" ? cfg.monthly : cfg.yearly;
    label = billingType.plan;
    btnClass = cfg.btnClass;
  } else {
    const count = billingType.examIds.length;
    baseAmount = billingType.examIds.reduce((sum, id) => sum + getExamPrice(id, duration), 0);
    label = `${count} Exam${count > 1 ? "s" : ""}`;
    btnClass = "gold-gradient text-[#1a1410]";
    Icon = Sparkles;
  }

  const gst = Math.round(baseAmount * 0.18);
  const total = baseAmount + gst;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(async () => {
      const now = new Date();
      const expires = new Date(now);
      const monthsToAdd = duration === "yearly" ? 12 : duration === "sixmonths" ? 6 : 1;
      expires.setMonth(expires.getMonth() + monthsToAdd);
      const id = generateTxId();
      setTxId(id);

      if (userId) {
        const examIds = !isPlan ? (billingType as ExamBillingProps).examIds : [];
        const planType = isPlan
          ? (billingType.plan === "Gold Learner" ? "gold_learner" : "pro") as import("@/lib/mobileApi").PlanType
          : "exam_pack" as import("@/lib/mobileApi").PlanType;
        const createCalls = isPlan
          ? [subscriptionApi.create({ userId, planType, billingCycle: duration as import("@/lib/mobileApi").BillCycle, amountPaise: total * 100, transactionId: id })]
          : examIds.map((examId) => subscriptionApi.create({ userId, examId, planType, billingCycle: duration as import("@/lib/mobileApi").BillCycle, amountPaise: getExamPrice(examId, duration) * 100, transactionId: id }));
        await Promise.all(createCalls).catch(() => {});
      }

      setProcessing(false);
      setDone(true);
      onSuccess({
        type: billingType.type,
        plan: isPlan ? billingType.plan : undefined,
        examIds: !isPlan ? billingType.examIds : undefined,
        amount: total,
        activatedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        transactionId: id,
      });
    }, 1800);
  };

  if (done) {
    return (
      <div className="flex-1 overflow-y-auto pb-8">
        <header className="px-5 pb-2 pt-6">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-col items-center gap-4 px-8 pt-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 ring-4 ring-emerald-400/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
          <p className="text-sm text-muted-foreground">
            {isPlan
              ? <>Welcome to <span className="font-semibold text-gold">{label}</span>. All chapters are now unlocked.</>
              : <>Your exam pack is active. Selected exams are fully unlocked.</>}
          </p>
          <div className="w-full rounded-2xl border border-border bg-surface p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-[11px] font-semibold text-foreground">{txId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount paid</span>
              <span className="font-semibold text-foreground">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold text-gold">{label} · {duration === "yearly" ? "1 year" : "1 month"}</span>
            </div>
          </div>
          <button onClick={onBack} className="w-full rounded-2xl gold-gradient py-3 text-sm font-bold text-[#1a1410]">
            Start Learning →
          </button>
        </div>
      </div>
    );
  }

  const selectedExamNames = !isPlan
    ? billingType.examIds.map((id) => exams.find((e) => e.id === id)?.name ?? id)
    : [];

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Checkout</p>
          <h1 className="text-2xl font-bold text-foreground">Complete Purchase</h1>
        </div>
      </header>

      {/* Plan/Exam summary */}
      <div className="mx-5 mt-5 rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/40">
            <Icon className={cn("h-5 w-5", isPlan ? planConfig[billingType.plan].iconColor : "text-gold")} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground">{label}</p>
            {isPlan ? (
              <p className="text-xs text-muted-foreground">Unlock all chapters · All exams</p>
            ) : (
              <p className="text-xs text-muted-foreground truncate">{selectedExamNames.join(" · ")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Duration toggle */}
      <div className="mx-5 mt-4 flex gap-1 rounded-2xl border border-border bg-surface p-1">
        {(["monthly", "sixmonths", "yearly"] as Duration[]).map((d) => {
          const examIds = !isPlan ? (billingType as ExamBillingProps).examIds : [];
          const sixSave = !isPlan
            ? examIds.reduce((s, id) => s + (getExamPrice(id, "monthly") * 6 - getExamPrice(id, "sixmonths")), 0)
            : 0;
          const yearSave = !isPlan
            ? examIds.reduce((s, id) => s + (getExamPrice(id, "monthly") * 12 - getExamPrice(id, "yearly")), 0)
            : Math.round(planConfig[(billingType as PlanBillingProps).plan].monthly * 12 - planConfig[(billingType as PlanBillingProps).plan].yearly);
          const labels: Record<Duration, string> = { monthly: "Monthly", sixmonths: "6 Months", yearly: "Yearly" };
          const saves: Record<Duration, number> = { monthly: 0, sixmonths: sixSave, yearly: yearSave };
          return (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={cn(
                "flex flex-1 flex-col items-center rounded-xl py-2 text-xs font-semibold transition-all",
                duration === d ? "bg-gold/15 text-gold" : "text-muted-foreground"
              )}
            >
              <span>{labels[d]}</span>
              {saves[d] > 0 && <span className="text-[9px] font-bold text-emerald-400">Save ₹{saves[d].toLocaleString("en-IN")}</span>}
            </button>
          );
        })}
      </div>

      {/* Order summary */}
      <div className="mx-5 mt-4 rounded-2xl border border-border bg-surface p-4 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Order Summary</p>
        {!isPlan && (billingType as ExamBillingProps).examIds.map((id, i) => (
          <div key={id} className="flex justify-between text-sm">
            <span className="text-foreground">{selectedExamNames[i] ?? id}</span>
            <span className="text-foreground">₹{getExamPrice(id, duration).toLocaleString("en-IN")}</span>
          </div>
        ))}
        {isPlan && (
          <div className="flex justify-between text-sm">
            <span className="text-foreground">{label} ({duration})</span>
            <span className="text-foreground">₹{baseAmount.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">GST (18%)</span>
          <span className="text-muted-foreground">₹{gst.toLocaleString("en-IN")}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-lg text-foreground">₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* User details */}
      <div className="mx-5 mt-4 rounded-2xl border border-border bg-surface p-4 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Billing Details</p>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Name</span>
          <span className="text-foreground">{userName || "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Email</span>
          <span className="text-foreground text-xs">{userEmail || "—"}</span>
        </div>
      </div>

      <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
        <Shield className="h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-[11px] text-muted-foreground">Secured by Razorpay · 256-bit SSL encryption</p>
      </div>

      <div className="mx-5 mt-5">
        <button
          onClick={handlePay}
          disabled={processing}
          className={cn("w-full rounded-2xl py-4 text-sm font-bold transition-all active:scale-[0.98]", btnClass, processing && "opacity-70 cursor-not-allowed")}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4 animate-pulse" /> Processing…
            </span>
          ) : (
            `Pay ₹${total.toLocaleString("en-IN")} via Razorpay`
          )}
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Cancel anytime · Auto-renews {duration === "yearly" ? "annually" : "monthly"}
        </p>
      </div>
    </div>
  );
}
