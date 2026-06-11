import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Bell, Send, Clock, Megaphone, Eye, X, Tag, ArrowUpDown, CalendarDays } from "lucide-react";
import { useStore } from "../../App";
import { type AdminNotification, type NotiType, type NotiTarget } from "../../lib/data";
import { notificationsApi } from "../../lib/adminApi";
import { supabase } from "../../lib/supabase";
import { DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

// ── Constants ────────────────────────────────────────────────────

const TARGET_OPTS: { value: NotiTarget; label: string }[] = [
  { value: "all",        label: "All Users"             },
  { value: "free",       label: "Free Users Only"       },
  { value: "subscribed", label: "Subscribed Users Only" },
];

const ALERT_TYPES: { value: NotiType; label: string; icon: string; color: string }[] = [
  { value: "streak",      label: "Streak",      icon: "🔥", color: "bg-amber-400/15 text-amber-400 border-amber-400/30"   },
  { value: "goal",        label: "Goal",        icon: "🎯", color: "bg-gold/15 text-[var(--gold)] border-[var(--gold)]/30" },
  { value: "achievement", label: "Achievement", icon: "🏆", color: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30" },
  { value: "reminder",    label: "Reminder",    icon: "⏰", color: "bg-sky-400/15 text-sky-400 border-sky-400/30"          },
  { value: "tip",         label: "Tip",         icon: "💡", color: "bg-violet-400/15 text-violet-400 border-violet-400/30" },
];

const EXAM_NEWS_TAGS: { value: string; color: string }[] = [
  { value: "Notification", color: "bg-amber-400/15 text-amber-400 border-amber-400/30" },
  { value: "Admit Card",   color: "bg-sky-400/15 text-sky-400 border-sky-400/30"      },
  { value: "Result",       color: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30" },
  { value: "Exam Date",    color: "bg-rose-400/15 text-rose-400 border-rose-400/30"   },
];

const EXAM_NEWS_ACCENTS: { label: string; value: string; dot: string }[] = [
  { label: "Amber",   value: "from-amber-500/20 to-amber-900/5",   dot: "bg-amber-500"   },
  { label: "Teal",    value: "from-teal-500/20 to-teal-900/5",     dot: "bg-teal-500"    },
  { label: "Sky",     value: "from-sky-500/20 to-sky-900/5",       dot: "bg-sky-500"     },
  { label: "Rose",    value: "from-rose-500/20 to-rose-900/5",     dot: "bg-rose-500"    },
  { label: "Violet",  value: "from-violet-500/20 to-violet-900/5", dot: "bg-violet-500"  },
  { label: "Emerald", value: "from-emerald-500/20 to-emerald-900/5", dot: "bg-emerald-500" },
];

const STATUS_STYLE = {
  scheduled: { label: "Scheduled", color: "bg-sky-400/15 text-sky-400",         icon: Clock  },
  sent:      { label: "Sent",      color: "bg-emerald-400/15 text-emerald-400", icon: Send   },
} as const;

const TYPE_ICON: Record<NotiType, string> = {
  streak: "🔥", goal: "🎯", achievement: "🏆", reminder: "⏰", tip: "💡", exam_news: "📰",
};

const TYPE_COLOR: Record<NotiType, string> = {
  streak:      "bg-amber-400/15 text-amber-400",
  goal:        "bg-[var(--gold)]/15 text-[var(--gold)]",
  achievement: "bg-emerald-400/15 text-emerald-400",
  reminder:    "bg-sky-400/15 text-sky-400",
  tip:         "bg-violet-400/15 text-violet-400",
  exam_news:   "bg-rose-400/15 text-rose-400",
};

// ── Helpers ──────────────────────────────────────────────────────

function parseExamBody(body: string): { text: string; tag: string; accent: string } {
  try {
    const p = JSON.parse(body);
    if (typeof p === "object" && p.text) return { text: p.text, tag: p.tag ?? "Notification", accent: p.accent ?? EXAM_NEWS_ACCENTS[0].value };
  } catch {}
  return { text: body, tag: "Notification", accent: EXAM_NEWS_ACCENTS[0].value };
}

function getDisplayBody(n: AdminNotification): string {
  if (n.type === "exam_news") return parseExamBody(n.body).text;
  return n.body;
}

// ── Timezone helpers ─────────────────────────────────────────────

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function localInputToISO(localStr: string): string {
  return new Date(localStr).toISOString(); // JS parses datetime-local as local time → UTC
}

// ── Empty form ───────────────────────────────────────────────────

type FormState = Omit<AdminNotification, "id"> & {
  category: "alert" | "exam_news";
  examTag: string;
  examAccent: string;
};

const empty = (): FormState => ({
  title: "", body: "", type: "tip", target: "all",
  scheduledAt: toLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
  status: "scheduled",
  category: "alert",
  examTag: "Notification",
  examAccent: EXAM_NEWS_ACCENTS[0].value,
});

// ── Preview modal ────────────────────────────────────────────────

type PreviewPayload = {
  title: string; body: string; type: NotiType;
  isFuture: boolean; scheduledAt: string;
  onConfirm: () => Promise<void>;
};

function PreviewModal({ p, onClose }: { p: PreviewPayload; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => { setLoading(true); try { await p.onConfirm(); } finally { setLoading(false); onClose(); } };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-5">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <p className="text-sm font-bold text-[var(--foreground)]">User preview</p>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          {/* Phone notification mockup */}
          <div className="rounded-2xl border border-white/8 p-4"
            style={{ background: "linear-gradient(145deg,#1c1c2e,#16162a)" }}>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="h-5 w-5 rounded-md gold-gradient flex items-center justify-center text-[10px] font-bold text-[#1a1410]">K</div>
              <span className="text-[11px] font-semibold text-white/50">KrackIt</span>
              <span className="ml-auto text-[10px] text-white/30">{p.isFuture ? new Date(p.scheduledAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "now"}</span>
            </div>
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${TYPE_COLOR[p.type]}`}>
                {TYPE_ICON[p.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-snug">{p.title || "Notification title"}</p>
                <p className="text-xs text-white/55 mt-1 leading-relaxed">{p.body || "Message body here…"}</p>
              </div>
            </div>
          </div>
          {p.isFuture ? (
            <div className="flex items-center gap-2 rounded-xl bg-sky-400/10 border border-sky-400/20 px-3 py-2.5">
              <Clock className="h-4 w-4 text-sky-400 shrink-0" />
              <p className="text-xs text-sky-400">Scheduled for <strong>{new Date(p.scheduledAt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}</strong> — will auto-send when time hits.</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-3 py-2.5">
              <Send className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-400">Sent <strong>immediately</strong> to all target users.</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Cancel</button>
          <button onClick={handle} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl gold-gradient py-2.5 text-sm font-bold text-[#1a1410] disabled:opacity-60">
            {loading ? "Saving…" : p.isFuture
              ? <><Clock className="h-3.5 w-3.5" /> Confirm Schedule</>
              : <><Send className="h-3.5 w-3.5" /> Send Now</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Type selector ────────────────────────────────────────────────

function TypeSelector({ category, type, onChange }: {
  category: "alert" | "exam_news";
  type: NotiType;
  onChange: (t: NotiType, cat: "alert" | "exam_news") => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1 gap-1">
        <button type="button" onClick={() => onChange(type === "exam_news" ? "tip" : type, "alert")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
            category === "alert" ? "gold-gradient text-[#1a1410]" : "text-[var(--muted-foreground)]"}`}>
          <Bell className="h-3.5 w-3.5" /> Alert
        </button>
        <button type="button" onClick={() => onChange("exam_news", "exam_news")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
            category === "exam_news" ? "gold-gradient text-[#1a1410]" : "text-[var(--muted-foreground)]"}`}>
          <Megaphone className="h-3.5 w-3.5" /> Exam News
        </button>
      </div>
      {category === "alert" && (
        <div className="grid grid-cols-5 gap-2">
          {ALERT_TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => onChange(t.value, "alert")}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all text-center ${
                type === t.value ? t.color : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]"}`}>
              <span className="text-lg">{t.icon}</span>
              <span className="text-[9px] font-semibold leading-none">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

export function NotificationsManager() {
  const { store, refresh, update } = useStore();
  const [modal, setModal]     = useState<"add" | AdminNotification | null>(null);
  const [delTarget, setDel]   = useState<AdminNotification | null>(null);
  const [form, setForm]       = useState<FormState>(empty());
  const [filterStatus, setFS] = useState<"all" | "scheduled" | "sent">("all");
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [sortKey, setSortKey] = useState<"scheduledAt" | "title" | "type" | "status">("scheduledAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterDate, setFilterDate] = useState("");
  const [rpcMissing, setRpcMissing] = useState(false);

  const cycleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // effective date per notification: sent items sort by sentAt, others by scheduledAt
  const effectiveDate = (n: AdminNotification) =>
    n.status === "sent" ? (n.sentAt ?? n.scheduledAt) : n.scheduledAt;

  const baseSorted = [...store.notifications].sort((a, b) => {
    let va: string | number;
    let vb: string | number;
    if (sortKey === "scheduledAt") {
      va = effectiveDate(a);
      vb = effectiveDate(b);
    } else {
      va = (a[sortKey as keyof AdminNotification] ?? "") as string | number;
      vb = (b[sortKey as keyof AdminNotification] ?? "") as string | number;
    }
    const cmp = typeof va === "number" && typeof vb === "number"
      ? va - vb
      : String(va).localeCompare(String(vb), "en", { sensitivity: "base" });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const dateFiltered = filterDate
    ? baseSorted.filter((n) => effectiveDate(n).startsWith(filterDate))
    : baseSorted;

  const allFiltered = filterStatus === "all"
    ? dateFiltered
    : dateFiltered.filter((n) => n.status === filterStatus);
  const { page, setPage, pageItems: filtered, totalPages } = usePagination(allFiltered, 10);

  const processDue = async () => {
    const now = new Date().toISOString();

    // Step 1: find all past-due scheduled items (admin SELECT always works here)
    const { data: dueItems } = await supabase
      .from("push_notifications")
      .select("id")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (!dueItems || dueItems.length === 0) return;

    const dueIds = dueItems.map(({ id }) => id);

    // Step 2: update status in DB — try SECURITY DEFINER RPC first, fall back to per-row UPDATE
    const { error: rpcErr } = await supabase.rpc("process_due_notifications");
    if (rpcErr) {
      setRpcMissing(true);
      await Promise.all(
        dueIds.map((id) =>
          supabase.from("push_notifications")
            .update({ status: "sent", sent_at: now })
            .eq("id", id)
        )
      );
    } else {
      setRpcMissing(false);
    }

    // Step 3: update the in-memory store directly.
    // This bypasses any RLS SELECT restriction on "sent" rows, so the admin
    // UI always reflects the transition immediately without a re-fetch.
    update((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        dueIds.includes(n.id) ? { ...n, status: "sent" as const, sentAt: now } : n
      ),
    }));
  };

  useEffect(() => {
    processDue();
    const timer = setInterval(processDue, 60_000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setF = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => { setForm(empty()); setModal("add"); };

  const openEdit = (n: AdminNotification) => {
    const { text, tag, accent } = parseExamBody(n.body);
    setForm({
      title: n.title,
      body: n.type === "exam_news" ? text : n.body,
      type: n.type,
      target: n.target,
      targetExamId: n.targetExamId,
      scheduledAt: toLocalInput(new Date(n.scheduledAt)),
      status: "scheduled",
      category: n.type === "exam_news" ? "exam_news" : "alert",
      examTag: tag,
      examAccent: accent,
    });
    setModal(n);
  };

  const buildBody = () =>
    form.category === "exam_news"
      ? JSON.stringify({ text: form.body, tag: form.examTag, accent: form.examAccent })
      : form.body;

  const doSave = async (status: "scheduled" | "sent", sentAt?: string) => {
    const payload = {
      title: form.title, body: buildBody(), type: form.type,
      target: form.target, target_exam_id: form.targetExamId || null,
      scheduled_at: localInputToISO(form.scheduledAt), status,
      ...(sentAt ? { sent_at: sentAt } : {}),
    };
    if (modal === "add") await notificationsApi.create(payload);
    else if (modal) await notificationsApi.update((modal as AdminNotification).id, payload);
    await refresh();
    setModal(null);
  };

  const showPreview = (isFuture: boolean, onConfirm: () => Promise<void>) => {
    if (!form.title || !form.body) { alert("Title and body are required."); return; }
    setPreview({ title: form.title, body: form.body, type: form.type, isFuture, scheduledAt: form.scheduledAt, onConfirm });
  };

  const handleSendNow = (e: React.MouseEvent) => {
    e.preventDefault();
    showPreview(false, () => doSave("sent", new Date().toISOString()));
  };

  const handleSchedule = (e: React.MouseEvent) => {
    e.preventDefault();
    const isFuture = new Date(form.scheduledAt) > new Date();
    showPreview(isFuture, () => doSave(isFuture ? "scheduled" : "sent", isFuture ? undefined : new Date().toISOString()));
  };

  const handleDelete = async (n: AdminNotification) => {
    try { await notificationsApi.delete(n.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDel(null);
  };

  const quickSendNow = (n: AdminNotification) =>
    setPreview({
      title: n.title, body: getDisplayBody(n), type: n.type, isFuture: false, scheduledAt: n.scheduledAt,
      onConfirm: async () => {
        await notificationsApi.update(n.id, { status: "sent", sent_at: new Date().toISOString() });
        await refresh();
      },
    });

  const counts = {
    scheduled: store.notifications.filter((n) => n.status === "scheduled").length,
    sent:      store.notifications.filter((n) => n.status === "sent").length,
  };

  const inp = "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--gold)] transition-colors";
  const sel = "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--gold)]";

  return (
    <div className="max-w-4xl space-y-5">
      {preview && <PreviewModal p={preview} onClose={() => setPreview(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Notifications</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {store.notifications.length} total · {counts.sent} sent · {counts.scheduled} scheduled
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
          <Plus className="h-4 w-4" /> New Notification
        </button>
      </div>

      {rpcMissing && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/8 px-4 py-3 space-y-2">
          <p className="text-sm font-semibold text-amber-400">⚠ Auto-send is not active — run this once in your Supabase SQL Editor:</p>
          <pre className="rounded-lg bg-black/30 p-3 text-[11px] text-amber-200 overflow-x-auto whitespace-pre-wrap">{`CREATE OR REPLACE FUNCTION process_due_notifications()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE updated_count int;
BEGIN
  UPDATE push_notifications
  SET status = 'sent', sent_at = now(), updated_at = now()
  WHERE status = 'scheduled' AND scheduled_at <= now();
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;`}</pre>
          <p className="text-xs text-amber-400/70">After running it, reload this page and scheduled alerts will auto-send.</p>
        </div>
      )}

      {/* Sort + Date filter + Tabs row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1 w-fit">
          {([["scheduledAt","Date"],["title","Title"],["type","Type"],["status","Status"]] as [typeof sortKey, string][]).map(([key, label]) => (
            <button key={key} onClick={() => cycleSort(key)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                sortKey === key ? "bg-[var(--gold)]/15 text-[var(--gold)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {label}
              {sortKey === key && <ArrowUpDown className="h-3 w-3" />}
            </button>
          ))}
        </div>

        {/* Date picker filter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
            className="bg-transparent text-[11px] text-[var(--foreground)] focus:outline-none [color-scheme:dark]"
          />
          {filterDate && (
            <button onClick={() => { setFilterDate(""); setPage(1); }}
              className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1 w-fit">
        {([["all","All"],[" scheduled","Scheduled"],["sent","Sent"]] as [string,string][]).map(([id,label]) => {
          const key = id.trim() as "all"|"scheduled"|"sent";
          return (
            <button key={key} onClick={() => setFS(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterStatus === key ? "bg-[var(--gold)]/15 text-[var(--gold)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
              {label}
              <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px]">
                {key === "all" ? store.notifications.length : counts[key as "scheduled"|"sent"]}
              </span>
            </button>
          );
        })}
      </div>
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.map((n) => {
          const { label, color, icon: StatusIcon } = STATUS_STYLE[n.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.scheduled;
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
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">{getDisplayBody(n)}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      {n.status === "sent"
                        ? `Sent: ${fmtDate(n.sentAt ?? n.scheduledAt)}`
                        : `Scheduled for: ${fmtDate(n.scheduledAt)}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => setPreview({ title:n.title,body:getDisplayBody(n),type:n.type,isFuture:new Date(n.scheduledAt) > new Date(),scheduledAt:n.scheduledAt,onConfirm:async()=>{} })}
                    className="text-[var(--muted-foreground)] hover:text-[var(--gold)]" title="Preview"><Eye className="h-4 w-4" /></button>
                  <button onClick={() => openEdit(n)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDel(n)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {n.status === "scheduled" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                  <button onClick={() => quickSendNow(n)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-400/20">
                    <Send className="h-3 w-3" /> Send Now
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {allFiltered.length === 0 && <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">No notifications found.</p>}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Create / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
              <p className="text-base font-bold text-[var(--foreground)]">{modal === "add" ? "New Notification" : "Edit Notification"}</p>
              <button onClick={() => setModal(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><X className="h-5 w-5" /></button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Type selector */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Notification Type</p>
                <TypeSelector
                  category={form.category}
                  type={form.type}
                  onChange={(t, cat) => setForm((f) => ({ ...f, type: t, category: cat }))}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Title</label>
                <input className={inp} value={form.title} onChange={(e) => setF("title", e.target.value)}
                  placeholder={form.category === "exam_news" ? "SSC CGL Exam Date Announced" : "Maintain your streak!"} required />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Message</label>
                <textarea className={`${inp} resize-none`} value={form.body} onChange={(e) => setF("body", e.target.value)}
                  rows={3} placeholder={form.category === "exam_news" ? "SSC CGL Tier 1 exam is scheduled for July 9, 2026." : "Don't break your study streak — just 3 tricks needed!"} required />
              </div>

              {/* Exam news extras: tag + color */}
              {form.category === "exam_news" && (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5">
                      <Tag className="h-3 w-3" /> News Tag
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {EXAM_NEWS_TAGS.map((t) => (
                        <button key={t.value} type="button" onClick={() => setF("examTag", t.value)}
                          className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                            form.examTag === t.value ? t.color : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]"}`}>
                          {t.value}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Color Theme</p>
                    <div className="flex gap-2 flex-wrap">
                      {EXAM_NEWS_ACCENTS.map((a) => (
                        <button key={a.value} type="button" onClick={() => setF("examAccent", a.value)}
                          title={a.label}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                            form.examAccent === a.value
                              ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                              : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]"}`}>
                          <span className={`h-3 w-3 rounded-full ${a.dot}`} />
                          {a.label}
                        </button>
                      ))}
                    </div>
                    {/* Preview swatch */}
                    <div className={`mt-2 rounded-xl bg-gradient-to-br ${form.examAccent} border border-[var(--border)] px-3 py-2`}>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Preview: {form.title || "News title"}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Target Audience</label>
                  <select className={sel} value={form.target} onChange={(e) => setF("target", e.target.value as NotiTarget)}>
                    {TARGET_OPTS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {form.target === "subscribed" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Exam (optional)</label>
                    <select className={sel} value={form.targetExamId ?? ""} onChange={(e) => setF("targetExamId", e.target.value || undefined)}>
                      <option value="">All subscribed</option>
                      {store.exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Schedule time */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">Schedule Date / Time</label>
                <input type="datetime-local" className={inp} value={form.scheduledAt}
                  onChange={(e) => setF("scheduledAt", e.target.value)} required />
                <p className="mt-1.5 text-[11px] text-[var(--muted-foreground)]">
                  {new Date(form.scheduledAt) > new Date()
                    ? "⏰ Future time — will auto-send when time hits"
                    : "⚡ Past/now time — clicking 'Schedule' will send immediately"}
                </p>
              </div>
            </div>

            {/* Two action buttons */}
            <div className="flex gap-3 px-6 pb-6">
              <button type="button" onClick={handleSendNow}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-400/15 text-emerald-400 py-3 text-sm font-bold hover:bg-emerald-400/25 transition-colors border border-emerald-400/20">
                <Send className="h-4 w-4" /> Send Now
              </button>
              <button type="button" onClick={handleSchedule}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl gold-gradient py-3 text-sm font-bold text-[#1a1410]">
                <Clock className="h-4 w-4" />
                {new Date(form.scheduledAt) > new Date() ? "Preview & Schedule" : "Preview & Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {delTarget && <DeleteConfirm name={delTarget.title} onConfirm={() => handleDelete(delTarget)} onCancel={() => setDel(null)} />}
    </div>
  );
}
