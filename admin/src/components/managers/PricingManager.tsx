import { useState } from "react";
import { Check, IndianRupee, Save } from "lucide-react";
import { useStore } from "../../App";
import { pricingApi } from "../../lib/adminApi";
import type { ExamPricing } from "../../lib/data";

function validatePricing(p: ExamPricing): Record<string, string> {
  const e: Record<string, string> = {};
  if (isNaN(p.monthly) || p.monthly < 0)        e.monthly = "Enter a valid monthly price (≥ 0).";
  if (isNaN(p.sixmonths) || p.sixmonths < 0)     e.sixmonths = "Enter a valid 6-month price (≥ 0).";
  if (isNaN(p.yearly) || p.yearly < 0)           e.yearly = "Enter a valid yearly price (≥ 0).";
  if (p.monthly > 0 && p.sixmonths > 0 && p.sixmonths >= p.monthly * 6)
    e.sixmonths = "6-month price should be less than 6× monthly.";
  if (p.yearly > 0 && p.monthly > 0 && p.yearly >= p.monthly * 12)
    e.yearly = "Yearly price should be less than 12× monthly.";
  return e;
}

function PricingRow({ examId, examName, examShort }: { examId: string; examName: string; examShort: string }) {
  const { store, refresh } = useStore();
  const existing = store.pricing.find((p) => p.examId === examId) ?? { examId, monthly: 0, sixmonths: 0, yearly: 0 };
  const [form, setForm] = useState<ExamPricing>(structuredClone(existing));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const setVal = (key: keyof Omit<ExamPricing, "examId">, raw: string) => {
    const n = parseFloat(raw) || 0;
    setForm((f) => ({ ...f, [key]: n }));
    if (errors[key]) setErrors((e) => { const r = { ...e }; delete r[key]; return r; });
    setSaved(false);
  };

  const handleSave = async () => {
    const errs = validatePricing(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await pricingApi.upsert(examId, form.monthly, form.sixmonths, form.yearly);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) { alert(err.message); }
  };

  const inputCls = (key: string) =>
    `w-full rounded-xl border bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none transition-colors ${
      errors[key] ? "border-[var(--destructive)]/60 focus:border-[var(--destructive)]" : "border-[var(--border)] focus:border-[var(--gold)]"
    }`;

  const PLANS = [
    { key: "monthly",   label: "Monthly",  hint: "per month" },
    { key: "sixmonths", label: "6 Months", hint: "per 6 months" },
    { key: "yearly",    label: "Yearly",   hint: "per year" },
  ] as const;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-[var(--foreground)]">{examName}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{examShort}</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            saved ? "bg-emerald-500/20 text-emerald-400" : "gold-gradient text-[#1a1410]"
          }`}
        >
          {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : <><Save className="h-3.5 w-3.5" /> Save</>}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PLANS.map(({ key, label, hint }) => (
          <div key={key}>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              {label}
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input
                type="number"
                min={0}
                step={1}
                value={form[key] || ""}
                onChange={(e) => setVal(key, e.target.value)}
                placeholder="0"
                className={`${inputCls(key)} pl-8`}
              />
            </div>
            <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">{hint}</p>
            {errors[key] && <p className="mt-0.5 text-[11px] text-[var(--destructive)]">{errors[key]}</p>}
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {PLANS.map(({ key, label }) => (
          <div key={key} className="rounded-xl bg-[var(--surface-2)] px-3 py-2 text-center">
            <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
            <p className="text-lg font-black text-[var(--gold)]">₹{(form[key] || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricingManager() {
  const { store } = useStore();

  const avgMonthly = store.pricing.length
    ? Math.round(store.pricing.reduce((s, p) => s + p.monthly, 0) / store.pricing.length)
    : 0;

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Subscription Pricing</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Set monthly, 6-month, and yearly prices per exam. Changes reflect in the mobile app.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Exams with Pricing", value: store.pricing.length },
          { label: "Avg Monthly Price",  value: `₹${avgMonthly}` },
          { label: "Total Exam Plans",   value: store.exams.length * 3 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-2xl font-black text-[var(--gold)]">{value}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {store.exams.map((exam) => (
          <PricingRow key={exam.id} examId={exam.id} examName={exam.name} examShort={exam.short} />
        ))}
      </div>
    </div>
  );
}
