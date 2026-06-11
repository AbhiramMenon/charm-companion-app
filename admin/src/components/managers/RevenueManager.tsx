import { useState } from "react";
import { useStore } from "../../App";
import type { AdminSubscription } from "../../lib/data";

const MONTHS: Record<string, number> = { monthly: 1, sixmonths: 6, yearly: 12 };
const CYCLE_LABEL: Record<string, string> = { monthly: "Monthly", sixmonths: "6 Months", yearly: "Yearly" };
const STATUS_LABEL: Record<string, string> = { active: "Active", cancelled: "Cancelled", expired: "Expired" };

function rupee(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function RevenueManager() {
  const { store } = useStore();
  const [tab, setTab] = useState<"overview" | "users">("overview");
  const [userSort, setUserSort] = useState<{ field: string; dir: "asc" | "desc" }>({ field: "startedAt", dir: "desc" });
  const toggleUserSort = (field: string) =>
    setUserSort((s) => ({ field, dir: s.field === field && s.dir === "asc" ? "desc" : "asc" }));

  const activeSubs: AdminSubscription[] = store.subscriptions.filter(
    (s) => s.status === "active" && s.planType === "exam_pack"
  );

  const totalRevenue = activeSubs.reduce((s, sub) => s + sub.amountPaise / 100, 0);
  const uniqueUsers = new Set(activeSubs.map((s) => s.userId)).size;
  const mrr = activeSubs.reduce((s, sub) => {
    const months = MONTHS[sub.billingCycle] ?? 1;
    return s + sub.amountPaise / 100 / months;
  }, 0);

  const byPlan = (["monthly", "sixmonths", "yearly"] as const).map((cycle) => {
    const subs = activeSubs.filter((s) => s.billingCycle === cycle);
    return { cycle, label: CYCLE_LABEL[cycle], users: subs.length, revenue: subs.reduce((s, sub) => s + sub.amountPaise / 100, 0) };
  });

  const examRevMap: Record<string, number> = {};
  activeSubs.forEach((sub) => {
    if (!sub.examId) return;
    examRevMap[sub.examId] = (examRevMap[sub.examId] ?? 0) + sub.amountPaise / 100;
  });
  const byExam = Object.entries(examRevMap)
    .map(([id, rev]) => ({ id, name: store.exams.find((e) => e.id === id)?.name ?? id, rev }))
    .sort((a, b) => b.rev - a.rev);

  const monthlyRevMap: Record<string, number> = {};
  activeSubs.forEach((sub) => {
    const month = sub.createdAt.slice(0, 7);
    monthlyRevMap[month] = (monthlyRevMap[month] ?? 0) + sub.amountPaise / 100;
  });
  const trendEntries = Object.entries(monthlyRevMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const trendLabels = trendEntries.map(([m]) => new Date(m + "-01").toLocaleString("en-IN", { month: "short" }));
  const trendValues = trendEntries.map(([, v]) => v);
  const maxTrend = Math.max(...trendValues, 1);

  // Paying users tab — all exam_pack active subs with full detail
  const payingRows = store.subscriptions
    .filter((s) => s.planType === "exam_pack" && s.status === "active")
    .map((sub) => {
      const user = store.users.find((u) => u.id === sub.userId);
      return {
        id: sub.id,
        userName: user?.name ?? sub.userId.slice(0, 8),
        userPhone: user?.phone ?? "—",
        examName: sub.examId ? (store.exams.find((e) => e.id === sub.examId)?.name ?? sub.examId) : "—",
        plan: CYCLE_LABEL[sub.billingCycle] ?? sub.billingCycle,
        amount: sub.amountPaise / 100,
        startedAt: sub.createdAt.slice(0, 10),
        expiresAt: sub.expiresAt.slice(0, 10),
        status: sub.status,
      };
    })
    .sort((a, b) => {
      const f = userSort.field as keyof typeof a;
      const va = String(a[f] ?? ""), vb = String(b[f] ?? "");
      const n = va.localeCompare(vb);
      return userSort.dir === "asc" ? n : -n;
    });

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Revenue</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{uniqueUsers} paying subscribers · {activeSubs.length} active subscriptions</p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 gap-1 w-fit">
        {(["overview", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? "gold-gradient text-[#1a1410]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t === "overview" ? "Overview" : "Paying Users"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Revenue",   value: rupee(totalRevenue),               sub: "all time",          color: "text-[var(--gold)]"    },
              { label: "MRR",             value: rupee(mrr),                        sub: "monthly recurring", color: "text-emerald-400"      },
              { label: "Paying Users",    value: String(uniqueUsers),               sub: "active subs",       color: "text-[var(--foreground)]" },
              { label: "Avg Rev/Sub",     value: rupee(activeSubs.length ? totalRevenue / activeSubs.length : 0), sub: "per subscription", color: "text-sky-400" },
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
                      <p className="text-xs text-[var(--muted-foreground)]">{users} subscriptions</p>
                    </div>
                    <p className="text-sm font-bold text-[var(--gold)]">{rupee(revenue)}</p>
                  </div>
                ))}
                {byPlan.every((p) => p.users === 0) && (
                  <p className="text-sm text-[var(--muted-foreground)]">No subscriptions yet.</p>
                )}
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

          {/* Monthly trend chart */}
          {trendEntries.length > 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="font-semibold text-[var(--foreground)] mb-5">Monthly Revenue Trend</h2>
              <div className="flex items-end gap-3 h-36">
                {trendValues.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-[var(--muted-foreground)]">{rupee(val)}</span>
                    <div className="w-full rounded-t-lg bg-[var(--gold)]/20 relative overflow-hidden" style={{ height: `${Math.max(4, (val / maxTrend) * 120)}px` }}>
                      <div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-[var(--gold)]" style={{ height: "100%" }} />
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)]">{trendLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "users" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">Paying Users</h2>
            <span className="text-xs text-[var(--muted-foreground)]">{payingRows.length} active subscriptions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                  {([
                    { field: "userName", label: "User",   align: "left"  },
                    { field: "userPhone",label: "Phone",  align: "left"  },
                    { field: "examName", label: "Exam",   align: "left"  },
                    { field: "plan",     label: "Plan",   align: "left"  },
                    { field: "startedAt",label: "Start",  align: "left"  },
                    { field: "expiresAt",label: "Expiry", align: "left"  },
                    { field: "status",   label: "Status", align: "left"  },
                    { field: "amount",   label: "Paid",   align: "right" },
                  ] as const).map(({ field, label, align }) => (
                    <th
                      key={field}
                      className={`px-4 py-3 text-${align} cursor-pointer select-none hover:text-[var(--foreground)] transition-colors`}
                      onClick={() => toggleUserSort(field)}
                    >
                      {label}
                      {userSort.field === field && (
                        <span className="ml-1">{userSort.dir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {payingRows.map((row) => {
                  const daysLeft = Math.ceil((new Date(row.expiresAt).getTime() - Date.now()) / 86400000);
                  const expiringSoon = daysLeft <= 5 && daysLeft >= 0;
                  return (
                    <tr key={row.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{row.userName}</td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">{row.userPhone}</td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">{row.examName}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[var(--gold)]/10 text-[var(--gold)] text-[10px] font-bold px-2 py-0.5">
                          {row.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">{row.startedAt}</td>
                      <td className={`px-4 py-3 text-xs font-medium ${expiringSoon ? "text-amber-400" : "text-[var(--muted-foreground)]"}`}>
                        {row.expiresAt}
                        {expiringSoon && <span className="ml-1 text-[9px]">⚠ {daysLeft}d</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full text-[10px] font-bold px-2 py-0.5 ${
                          row.status === "active" ? "bg-emerald-400/10 text-emerald-400" :
                          row.status === "cancelled" ? "bg-rose-400/10 text-rose-400" :
                          "bg-[var(--muted-foreground)]/10 text-[var(--muted-foreground)]"
                        }`}>
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[var(--gold)]">{rupee(row.amount)}</td>
                    </tr>
                  );
                })}
                {payingRows.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">No paying users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
