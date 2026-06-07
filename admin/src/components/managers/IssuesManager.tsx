import { useState } from "react";
import { Plus, Pencil, Trash2, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useStore } from "../../App";
import { uid, type SupportIssue, type IssueStatus, type IssuePriority } from "../../lib/data";
import { issuesApi } from "../../lib/adminApi";
import { Modal, Field, Input, Textarea, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const STATUS_OPTS: IssueStatus[]   = ["open", "in_progress", "resolved"];
const PRIORITY_OPTS: IssuePriority[] = ["low", "medium", "high"];

const STATUS_STYLE: Record<IssueStatus, { label: string; color: string; icon: typeof AlertCircle }> = {
  open:        { label: "Open",        color: "bg-rose-400/15 text-rose-400",    icon: AlertCircle },
  in_progress: { label: "In Progress", color: "bg-amber-400/15 text-amber-400",  icon: Clock },
  resolved:    { label: "Resolved",    color: "bg-emerald-400/15 text-emerald-400", icon: CheckCircle },
};
const PRIORITY_COLOR: Record<IssuePriority, string> = {
  low:    "bg-zinc-400/15 text-zinc-400",
  medium: "bg-sky-400/15 text-sky-400",
  high:   "bg-rose-400/15 text-rose-400",
};

const empty = (): Omit<SupportIssue, "id"> => ({
  userId: "", userName: "", userEmail: "", subject: "",
  message: "", status: "open", priority: "medium",
  createdAt: new Date().toISOString().slice(0, 10),
});

type FilterStatus = IssueStatus | "all";

export function IssuesManager() {
  const { store, refresh } = useStore();
  const [modal, setModal]   = useState<"add" | SupportIssue | null>(null);
  const [delTarget, setDel] = useState<SupportIssue | null>(null);
  const [form, setForm]     = useState(empty());
  const [filterStatus, setFS] = useState<FilterStatus>("all");
  const [filterPriority, setFP] = useState<IssuePriority | "all">("all");

  const allFiltered = store.issues.filter((i) => {
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (filterPriority !== "all" && i.priority !== filterPriority) return false;
    return true;
  });
  const { page, setPage, pageItems: filtered, totalPages } = usePagination(allFiltered, 10);

  const openAdd  = () => { setForm(empty()); setModal("add"); };
  const openEdit = (i: SupportIssue) => {
    setForm({ userId: i.userId, userName: i.userName, userEmail: i.userEmail, subject: i.subject,
      message: i.message, status: i.status, priority: i.priority, createdAt: i.createdAt, resolvedAt: i.resolvedAt });
    setModal(i);
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedAt = form.status === "resolved" ? (form.resolvedAt ?? new Date().toISOString()) : null;
    try {
      if (modal === "add") {
        await issuesApi.create({ user_id: form.userId || null, user_name: form.userName, user_email: form.userEmail, subject: form.subject, message: form.message, status: form.status, priority: form.priority, admin_note: null, resolved_at: null });
      } else if (modal) {
        await issuesApi.update((modal as SupportIssue).id, { user_name: form.userName, user_email: form.userEmail, subject: form.subject, message: form.message, status: form.status, priority: form.priority, resolved_at: resolvedAt });
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (i: SupportIssue) => {
    try { await issuesApi.delete(i.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDel(null);
  };

  const quickStatus = async (issue: SupportIssue, status: IssueStatus) => {
    try {
      await issuesApi.update(issue.id, { status, resolved_at: status === "resolved" ? new Date().toISOString() : null });
      await refresh();
    } catch (err: any) { alert(err.message); }
  };

  const counts = {
    open:        store.issues.filter((i) => i.status === "open").length,
    in_progress: store.issues.filter((i) => i.status === "in_progress").length,
    resolved:    store.issues.filter((i) => i.status === "resolved").length,
  };

  const selClass = "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none";

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">User Issues</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{store.issues.length} total · {counts.open} open · {counts.in_progress} in progress</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
          <Plus className="h-4 w-4" /> Add Issue
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        {(["open", "in_progress", "resolved"] as IssueStatus[]).map((s) => {
          const { label, color, icon: Icon } = STATUS_STYLE[s];
          return (
            <button key={s} onClick={() => setFS(filterStatus === s ? "all" : s)}
              className={`rounded-2xl border p-4 text-left transition-colors ${filterStatus === s ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-[var(--border)] bg-[var(--surface)]"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${color.split(" ")[1]}`} />
                <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{counts[s]}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={filterPriority} onChange={(e) => setFP(e.target.value as IssuePriority | "all")} className={selClass}>
          <option value="all">All Priorities</option>
          {PRIORITY_OPTS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((issue) => {
          const { label, color, icon: Icon } = STATUS_STYLE[issue.status];
          return (
            <div key={issue.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${color}`}>
                      <Icon className="h-3 w-3" /> {label}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_COLOR[issue.priority]}`}>
                      {issue.priority}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">{issue.createdAt}</span>
                    {issue.resolvedAt && <span className="text-xs text-emerald-400">Resolved: {issue.resolvedAt}</span>}
                  </div>
                  <p className="font-semibold text-[var(--foreground)] text-sm">{issue.subject}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {issue.userName} · {issue.userEmail}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2 line-clamp-2">{issue.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => openEdit(issue)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDel(issue)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {/* Quick status actions */}
              {issue.status !== "resolved" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                  {issue.status === "open" && (
                    <button onClick={() => quickStatus(issue, "in_progress")}
                      className="rounded-lg bg-amber-400/10 text-amber-400 px-3 py-1 text-xs font-semibold hover:bg-amber-400/20 transition-colors">
                      Mark In Progress
                    </button>
                  )}
                  <button onClick={() => quickStatus(issue, "resolved")}
                    className="rounded-lg bg-emerald-400/10 text-emerald-400 px-3 py-1 text-xs font-semibold hover:bg-emerald-400/20 transition-colors">
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {allFiltered.length === 0 && <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">No issues found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {modal && (
        <Modal title={modal === "add" ? "Add Issue" : "Edit Issue"} onClose={() => setModal(null)} wide>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="User Name"><Input value={form.userName} onChange={(e) => set("userName", e.target.value)} placeholder="Sneha Patel" required /></Field>
              <Field label="User Email"><Input value={form.userEmail} onChange={(e) => set("userEmail", e.target.value)} placeholder="user@example.com" type="email" required /></Field>
            </div>
            <Field label="Subject"><Input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="App crashes on trick detail" required /></Field>
            <Field label="Message">
              <Textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={4} placeholder="Describe the issue…" required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <Select value={form.status} onChange={(e) => set("status", e.target.value as IssueStatus)}>
                  {STATUS_OPTS.map((s) => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={form.priority} onChange={(e) => set("priority", e.target.value as IssuePriority)}>
                  {PRIORITY_OPTS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Created At"><Input type="date" value={form.createdAt} onChange={(e) => set("createdAt", e.target.value)} /></Field>
            <SaveBtn />
          </form>
        </Modal>
      )}

      {delTarget && <DeleteConfirm name={delTarget.subject} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDel(null)} />}
    </div>
  );
}
