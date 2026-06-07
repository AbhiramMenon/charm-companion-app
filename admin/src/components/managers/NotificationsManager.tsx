import { useState } from "react";
import { Plus, Pencil, Trash2, Bell, Send, Clock, FileText } from "lucide-react";
import { useStore } from "../../App";
import { uid, type AdminNotification, type NotiType, type NotiTarget } from "../../lib/data";
import { notificationsApi } from "../../lib/adminApi";
import { Modal, Field, Input, Textarea, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const TYPE_OPTS: NotiType[] = ["streak", "goal", "achievement", "reminder", "tip", "exam_news"];
const TARGET_OPTS: { value: NotiTarget; label: string }[] = [
  { value: "all",        label: "All Users" },
  { value: "free",       label: "Free Users Only" },
  { value: "subscribed", label: "Subscribed Users Only" },
];
const STATUS_STYLE: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  draft:     { label: "Draft",     color: "bg-zinc-400/15 text-zinc-400",    icon: FileText },
  scheduled: { label: "Scheduled", color: "bg-sky-400/15 text-sky-400",      icon: Clock    },
  sent:      { label: "Sent",      color: "bg-emerald-400/15 text-emerald-400", icon: Send  },
};
const TYPE_ICON: Record<NotiType, string> = {
  streak: "🔥", goal: "🎯", achievement: "🏆", reminder: "⏰", tip: "💡", exam_news: "📰",
};

const empty = (): Omit<AdminNotification, "id"> => ({
  title: "", body: "", type: "tip", target: "all",
  scheduledAt: new Date().toISOString().slice(0, 16),
  status: "draft",
});

export function NotificationsManager() {
  const { store, refresh } = useStore();
  const [modal, setModal]   = useState<"add" | AdminNotification | null>(null);
  const [delTarget, setDel] = useState<AdminNotification | null>(null);
  const [form, setForm]     = useState(empty());
  const [filterStatus, setFS] = useState<string>("all");

  const allFiltered = filterStatus === "all"
    ? store.notifications
    : store.notifications.filter((n) => n.status === filterStatus);
  const { page, setPage, pageItems: filtered, totalPages } = usePagination(allFiltered, 10);

  const openAdd  = () => { setForm(empty()); setModal("add"); };
  const openEdit = (n: AdminNotification) => {
    setForm({ title: n.title, body: n.body, type: n.type, target: n.target,
      targetExamId: n.targetExamId, scheduledAt: n.scheduledAt, status: n.status });
    setModal(n);
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modal === "add") {
        await notificationsApi.create({ title: form.title, body: form.body, type: form.type, target: form.target, target_exam_id: form.targetExamId || null, scheduled_at: form.scheduledAt, status: form.status });
      } else if (modal) {
        await notificationsApi.update((modal as AdminNotification).id, { title: form.title, body: form.body, type: form.type, target: form.target, target_exam_id: form.targetExamId || null, scheduled_at: form.scheduledAt, status: form.status });
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (n: AdminNotification) => {
    try { await notificationsApi.delete(n.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDel(null);
  };

  const markSent = async (n: AdminNotification) => {
    try {
      await notificationsApi.update(n.id, { status: "sent", sent_at: new Date().toISOString() });
      await refresh();
    } catch (err: any) { alert(err.message); }
  };

  const counts = {
    draft:     store.notifications.filter((n) => n.status === "draft").length,
    scheduled: store.notifications.filter((n) => n.status === "scheduled").length,
    sent:      store.notifications.filter((n) => n.status === "sent").length,
  };

  const selClass = "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none";

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Notifications</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{store.notifications.length} total · {counts.sent} sent · {counts.scheduled} scheduled</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
          <Plus className="h-4 w-4" /> New Notification
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1 w-fit flex-wrap">
        {[["all", "All"], ["draft", "Draft"], ["scheduled", "Scheduled"], ["sent", "Sent"]].map(([id, label]) => (
          <button key={id} onClick={() => setFS(id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filterStatus === id ? "bg-[var(--gold)]/15 text-[var(--gold)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}>
            {label}
            <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px]">
              {id === "all" ? store.notifications.length : counts[id as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((n) => {
          const { label, color, icon: StatusIcon } = STATUS_STYLE[n.status] ?? STATUS_STYLE.draft;
          const targetLabel = TARGET_OPTS.find((t) => t.value === n.target)?.label ?? n.target;
          const examName    = n.targetExamId ? store.exams.find((e) => e.id === n.targetExamId)?.name : undefined;
          return (
            <div key={n.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0 mt-0.5">{TYPE_ICON[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${color}`}>
                        <StatusIcon className="h-3 w-3" /> {label}
                      </span>
                      <span className="rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)] text-[10px] px-2 py-0.5">{n.type}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">{targetLabel}{examName ? ` · ${examName}` : ""}</span>
                    </div>
                    <p className="font-semibold text-[var(--foreground)] text-sm">{n.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      {n.status === "sent" ? "Sent" : "Scheduled"}: {n.scheduledAt.replace("T", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => openEdit(n)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDel(n)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {n.status !== "sent" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                  {n.status === "draft" && (
                    <button onClick={async () => { try { await notificationsApi.update(n.id, { status: "scheduled" }); await refresh(); } catch (err: any) { alert(err.message); } }}
                      className="rounded-lg bg-sky-400/10 text-sky-400 px-3 py-1 text-xs font-semibold hover:bg-sky-400/20">
                      Schedule
                    </button>
                  )}
                  <button onClick={() => markSent(n)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 px-3 py-1 text-xs font-semibold hover:bg-emerald-400/20">
                    <Send className="h-3 w-3" /> Mark as Sent
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {allFiltered.length === 0 && <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">No notifications found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {modal && (
        <Modal title={modal === "add" ? "New Notification" : "Edit Notification"} onClose={() => setModal(null)} wide>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Maintain your streak!" required /></Field>
            <Field label="Body">
              <Textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={3} placeholder="Don't break your study streak…" required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <Select value={form.type} onChange={(e) => set("type", e.target.value as NotiType)}>
                  {TYPE_OPTS.map((t) => <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>)}
                </Select>
              </Field>
              <Field label="Target Audience">
                <Select value={form.target} onChange={(e) => set("target", e.target.value as NotiTarget)}>
                  {TARGET_OPTS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </Field>
            </div>
            {form.target === "subscribed" && (
              <Field label="Target Exam (optional)">
                <Select value={form.targetExamId ?? ""} onChange={(e) => set("targetExamId", e.target.value || undefined)}>
                  <option value="">All subscribed users</option>
                  {store.exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </Select>
              </Field>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Schedule Date/Time"><Input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} required /></Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => set("status", e.target.value as AdminNotification["status"])}>
                  {["draft", "scheduled", "sent"].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </Select>
              </Field>
            </div>
            <SaveBtn />
          </form>
        </Modal>
      )}

      {delTarget && <DeleteConfirm name={delTarget.title} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDel(null)} />}
    </div>
  );
}
