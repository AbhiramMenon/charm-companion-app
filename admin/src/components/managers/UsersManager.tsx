import { useState } from "react";
import { Users, CreditCard, AlertTriangle, Search } from "lucide-react";
import { useStore } from "../../App";
import type { AppUser } from "../../lib/data";
import { Pagination, usePagination } from "../Pagination";
import { useSort, Th } from "../Sort";

const TIER_COLOR: Record<string, string> = {
  Free:       "bg-zinc-400/15 text-zinc-400",
  "Exam Pack":"bg-amber-400/15 text-amber-400",
};
const CYCLE_LABEL: Record<string, string> = {
  monthly: "Monthly", sixmonths: "6 Months", yearly: "Yearly",
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

function UserRow({ user, exams }: { user: AppUser; exams: { id: string; short: string }[] }) {
  const examNames = user.subscribedExams.map((id) => exams.find((e) => e.id === id)?.short ?? id).join(", ");
  const expiring  = user.subscriptionExpiry ? daysUntil(user.subscriptionExpiry) : null;

  return (
    <tr className="hover:bg-[var(--surface-2)] transition-colors text-sm">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/20 text-xs font-bold text-[var(--gold)]">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)] leading-none">{user.name}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TIER_COLOR[user.tier] ?? ""}`}>{user.tier}</span>
      </td>
      <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">{examNames || "—"}</td>
      <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">
        {user.subscriptionExpiry ? (
          <span className={expiring! < 0 ? "text-rose-400" : expiring! <= 14 ? "text-amber-400" : ""}>
            {user.subscriptionExpiry} {expiring !== null && `(${expiring > 0 ? `${expiring}d` : "expired"})`}
          </span>
        ) : "—"}
      </td>
      <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">{user.billingCycle ? CYCLE_LABEL[user.billingCycle] : "—"}</td>
      <td className="px-4 py-3 text-right text-[var(--foreground)]">{user.tricksLearned}</td>
      <td className="px-4 py-3 text-right">
        <span className="text-amber-400 font-semibold">{user.streak}</span>
        <span className="text-[10px] text-[var(--muted-foreground)] ml-0.5">🔥</span>
      </td>
      <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs whitespace-nowrap">{user.lastActiveAt}</td>
    </tr>
  );
}

type Tab = "all" | "subscribed" | "expiring";

export function UsersManager() {
  const { store } = useStore();
  const [tab, setTab]       = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const today = new Date();
  const in30  = new Date(today.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);

  const byTab: Record<Tab, AppUser[]> = {
    all:        store.users,
    subscribed: store.users.filter((u) => u.tier !== "Free"),
    expiring:   store.users.filter((u) => u.subscriptionExpiry && u.subscriptionExpiry <= in30),
  };

  const filteredUsers = byTab[tab].filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });
  const { sortField, sortDir, toggle, sorted } = useSort(filteredUsers as unknown as Record<string, unknown>[], "name");
  const { page, setPage, pageItems: displayed, totalPages } = usePagination(sorted as unknown as AppUser[], 15);

  const subscribedCount = store.users.filter((u) => u.tier !== "Free").length;
  const expiringCount   = byTab.expiring.length;
  const freeCount       = store.users.filter((u) => u.tier === "Free").length;

  const TABS: { id: Tab; label: string; count: number; icon: typeof Users }[] = [
    { id: "all",        label: "All Users",     count: store.users.length, icon: Users },
    { id: "subscribed", label: "Subscribed",    count: subscribedCount,    icon: CreditCard },
    { id: "expiring",   label: "Expiring Soon", count: expiringCount,      icon: AlertTriangle },
  ];

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Users</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{store.users.length} total · {subscribedCount} subscribed · {freeCount} free</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users",  value: store.users.length, color: "text-[var(--foreground)]" },
          { label: "Subscribed",   value: subscribedCount,    color: "text-amber-400" },
          { label: "Free Tier",    value: freeCount,          color: "text-zinc-400" },
          { label: "Expiring ≤30d",value: expiringCount,      color: "text-rose-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1 w-fit">
        {TABS.map(({ id, label, count, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === id ? "bg-[var(--gold)]/15 text-[var(--gold)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}>
            <Icon className="h-3.5 w-3.5" /> {label}
            <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px]">{count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--gold)]" />
      </div>

      {tab === "expiring" && expiringCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-400/10 border border-amber-400/20 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-400">{expiringCount} user{expiringCount > 1 ? "s" : ""} have subscriptions expiring within 30 days. Consider sending a renewal reminder.</p>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                <Th field="name"         label="User"        sortField={sortField} sortDir={sortDir} onToggle={toggle} />
                <Th field="tier"         label="Tier"        sortField={sortField} sortDir={sortDir} onToggle={toggle} />
                <th className="px-4 py-3 text-left text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Exams</th>
                <Th field="subscriptionExpiry" label="Expiry"  sortField={sortField} sortDir={sortDir} onToggle={toggle} />
                <th className="px-4 py-3 text-left text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Billing</th>
                <Th field="tricksLearned" label="Tricks"     sortField={sortField} sortDir={sortDir} onToggle={toggle} align="right" />
                <Th field="streak"        label="Streak"     sortField={sortField} sortDir={sortDir} onToggle={toggle} align="right" />
                <Th field="lastActiveAt"  label="Last Active" sortField={sortField} sortDir={sortDir} onToggle={toggle} />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {displayed.map((u) => <UserRow key={u.id} user={u} exams={store.exams} />)}
            </tbody>
          </table>
        </div>
        {displayed.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">No users found.</p>
        )}
        <div className="px-4 pb-3"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </div>
    </div>
  );
}
