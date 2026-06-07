import { useStore } from "../../App";

const PRICE: Record<string, number> = { monthly: 149, sixmonths: 749, yearly: 1299 };
const MONTHS: Record<string, number> = { monthly: 1, sixmonths: 6, yearly: 12 };

function rupee(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function RevenueManager() {
  const { store } = useStore();

  const subscribers = store.users.filter((u) => u.tier !== "Free" && u.billingCycle && u.subscribedExams.length > 0);

  // Per-user revenue
  const userRevenue = subscribers.map((u) => {
    const price = PRICE[u.billingCycle!] ?? 0;
    const exams = u.subscribedExams.length;
    const total = price * exams;
    return { ...u, total, price, exams };
  });

  const totalRevenue = userRevenue.reduce((s, u) => s + u.total, 0);

  // MRR: annualise each subscription → monthly equivalent
  const mrr = userRevenue.reduce((s, u) => {
    const months = MONTHS[u.billingCycle!] ?? 1;
    return s + (u.total / months);
  }, 0);

  // Revenue by plan
  const byPlan = (["monthly", "sixmonths", "yearly"] as const).map((cycle) => {
    const users = userRevenue.filter((u) => u.billingCycle === cycle);
    return {
      cycle,
      label: cycle === "sixmonths" ? "6 Months" : cycle === "monthly" ? "Monthly" : "Yearly",
      users: users.length,
      revenue: users.reduce((s, u) => s + u.total, 0),
    };
  });

  // Revenue by exam
  const examRevMap: Record<string, number> = {};
  userRevenue.forEach((u) => {
    u.subscribedExams.forEach((eid) => {
      examRevMap[eid] = (examRevMap[eid] ?? 0) + PRICE[u.billingCycle!];
    });
  });
  const byExam = Object.entries(examRevMap)
    .map(([id, rev]) => ({ id, name: store.exams.find((e) => e.id === id)?.name ?? id, rev }))
    .sort((a, b) => b.rev - a.rev);

  // Mock monthly trend (last 6 months)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const trend  = [28400, 34700, 41200, 38900, 52100, totalRevenue > 0 ? Math.round(totalRevenue * 0.9) : 61500];
  const maxTrend = Math.max(...trend);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Revenue</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{subscribers.length} paying subscribers</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue",   value: rupee(totalRevenue), sub: "all time",     color: "text-[var(--gold)]" },
          { label: "MRR",             value: rupee(Math.round(mrr)), sub: "monthly recurring", color: "text-emerald-400" },
          { label: "Paying Users",    value: subscribers.length, sub: "active subs",  color: "text-[var(--foreground)]" },
          { label: "Avg Rev/User",    value: rupee(subscribers.length ? Math.round(totalRevenue / subscribers.length) : 0), sub: "per subscription", color: "text-sky-400" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Revenue by plan */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">By Billing Cycle</h2>
          <div className="space-y-3">
            {byPlan.map(({ cycle, label, users, revenue }) => (
              <div key={cycle} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{users} subscribers</p>
                </div>
                <p className="text-sm font-bold text-[var(--gold)]">{rupee(revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by exam */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">By Exam</h2>
          <div className="space-y-3">
            {byExam.length === 0 && <p className="text-sm text-[var(--muted-foreground)]">No data</p>}
            {byExam.map(({ id, name, rev }) => (
              <div key={id} className="flex items-center justify-between">
                <p className="text-sm text-[var(--foreground)]">{name}</p>
                <p className="text-sm font-bold text-emerald-400">{rupee(rev)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly trend chart (bar) */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="font-semibold text-[var(--foreground)] mb-5">Monthly Revenue Trend (2026)</h2>
        <div className="flex items-end gap-3 h-36">
          {trend.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[var(--muted-foreground)]">{rupee(val / 1000).replace("₹", "")}k</span>
              <div className="w-full rounded-t-lg bg-[var(--gold)]/20 relative overflow-hidden" style={{ height: `${(val / maxTrend) * 100}px` }}>
                <div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-[var(--gold)]" style={{ height: "100%" }} />
              </div>
              <span className="text-[10px] text-[var(--muted-foreground)]">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-user table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">Subscription Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Exams</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Expiry</th>
                <th className="px-4 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[...userRevenue].sort((a, b) => b.total - a.total).map((u) => (
                <tr key={u.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--foreground)]">{u.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">
                    {u.subscribedExams.map((id) => store.exams.find((e) => e.id === id)?.short ?? id).join(", ")}
                    <span className="ml-1 text-[10px]">({u.exams} exam{u.exams > 1 ? "s" : ""})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[var(--gold)]/10 text-[var(--gold)] text-[10px] font-bold px-2 py-0.5">
                      {u.billingCycle === "sixmonths" ? "6 Months" : u.billingCycle}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">{u.subscriptionExpiry ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--gold)]">{rupee(u.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
