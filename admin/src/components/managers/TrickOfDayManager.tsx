import { useState } from "react";
import { Plus, Pencil, Trash2, CalendarDays, Star, Lightbulb, ChevronUp, ChevronDown } from "lucide-react";
import { useStore } from "../../App";
import { type TrickOfDay } from "../../lib/data";
import { trickOfDayApi } from "../../lib/adminApi";
import { Modal, Field, Input, Textarea, Select, SaveBtn, DeleteConfirm } from "../Modal";
import { Pagination, usePagination } from "../Pagination";

const MAX_PER_DAY = 3;
const today = () => new Date().toISOString().slice(0, 10);

const ACCENT_OPTIONS = [
  { value: "gold",    label: "Gold",    bg: "#2a1a07", shimmer: "#D4A24C" },
  { value: "rose",    label: "Rose",    bg: "#2a0a12", shimmer: "#fb7185" },
  { value: "emerald", label: "Emerald", bg: "#082a12", shimmer: "#34d399" },
  { value: "sky",     label: "Sky",     bg: "#082028", shimmer: "#38bdf8" },
  { value: "violet",  label: "Violet",  bg: "#120a28", shimmer: "#a78bfa" },
  { value: "cyan",    label: "Cyan",    bg: "#082428", shimmer: "#22d3ee" },
];

const empty = (date: string = today()): Omit<TrickOfDay, "id"> => ({ trickId: "", date, note: "", accent: "gold" } as any);

export function TrickOfDayManager() {
  const { store, refresh } = useStore();
  const [modal, setModal]   = useState<"add" | TrickOfDay | null>(null);
  const [delTarget, setDel] = useState<TrickOfDay | null>(null);
  const [form, setForm]     = useState(empty());
  const [dateDir, setDateDir] = useState<"desc" | "asc">("desc");

  const openAdd  = (date?: string) => { setForm(empty(date)); setModal("add"); };
  const openEdit = (t: TrickOfDay) => { setForm({ trickId: t.trickId, date: t.date, note: t.note ?? "", accent: t.accent ?? "gold" } as any); setModal(t); };
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Count tricks per date
  const countForDate = (date: string) => store.trickOfDay.filter((t) => t.date === date).length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.trickId) { alert("Please select a trick."); return; }
    try {
      const accent = (form as any).accent || "gold";
      if (modal === "add") {
        const existing = countForDate(form.date);
        if (existing >= MAX_PER_DAY) { alert(`Maximum ${MAX_PER_DAY} tricks per day already scheduled.`); return; }
        await trickOfDayApi.create(form.trickId, form.date, form.note || undefined, accent);
      } else if (modal) {
        await trickOfDayApi.update((modal as TrickOfDay).id, form.trickId, form.note || undefined, accent);
      }
      await refresh();
    } catch (err: any) { alert(err.message); return; }
    setModal(null);
  };

  const handleDelete = async (t: TrickOfDay) => {
    try { await trickOfDayApi.delete(t.id); await refresh(); }
    catch (err: any) { alert(err.message); }
    setDel(null);
  };

  // Group entries by date
  const sorted = [...store.trickOfDay].sort((a, b) =>
    dateDir === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
  );
  const dateGroups = Array.from(
    sorted.reduce((map, entry) => {
      if (!map.has(entry.date)) map.set(entry.date, []);
      map.get(entry.date)!.push(entry);
      return map;
    }, new Map<string, TrickOfDay[]>()).entries()
  ).map(([date, entries]) => ({ date, entries }));

  const { page, setPage, pageItems, totalPages } = usePagination(dateGroups, 7);

  const todayEntries = store.trickOfDay.filter((t) => t.date === today());
  const todayTricks  = todayEntries.map((e) => store.tricks.find((tr) => tr.id === e.trickId)).filter(Boolean);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Trick of the Day</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {store.trickOfDay.length} entries · up to {MAX_PER_DAY} tricks per day shown in the mobile app
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDateDir((d) => d === "desc" ? "asc" : "desc")}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Date {dateDir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
          <button onClick={() => openAdd()} className="flex items-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-bold text-[#1a1410]">
            <Plus className="h-4 w-4" /> Add Trick
          </button>
        </div>
      </div>

      {/* Today's featured tricks */}
      {todayTricks.length > 0 ? (
        <div className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--gold)]/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[var(--gold)]" />
              <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
                Today's Tricks · {today()} ({todayTricks.length}/{MAX_PER_DAY} slots filled)
              </span>
            </div>
            {todayTricks.length < MAX_PER_DAY && (
              <button onClick={() => openAdd(today())} className="text-xs text-[var(--gold)] hover:underline">
                + Add slot
              </button>
            )}
          </div>
          <div className="space-y-2">
            {todayEntries.map((entry, idx) => {
              const trick = store.tricks.find((t) => t.id === entry.trickId);
              const rating = trick ? store.ratings.find((r) => r.trickId === trick.id) : null;
              return (
                <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-[var(--gold)]/20 bg-[var(--surface)] p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/20 text-[10px] font-black text-[var(--gold)]">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--foreground)]">{trick?.title ?? "—"}</p>
                    <p className="text-xs font-bold text-[var(--gold)]">{trick?.content ?? ""}</p>
                    {entry.note && <p className="text-[11px] text-sky-400 italic mt-0.5">{entry.note}</p>}
                  </div>
                  {rating && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-amber-400">{rating.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(entry)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDel(entry)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <CalendarDays className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2" />
          <p className="text-sm text-[var(--muted-foreground)]">No tricks scheduled for today ({today()})</p>
          <button onClick={() => openAdd(today())} className="mt-3 text-sm text-[var(--gold)] hover:underline">Schedule now →</button>
        </div>
      )}

      {/* Schedule table — grouped by date */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Slots</th>
              <th className="px-5 py-3 text-left">Tricks</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {pageItems.map(({ date, entries }) => {
              const isToday = date === today();
              const isPast  = date < today();
              return (
                <tr key={date} className={`transition-colors ${isToday ? "bg-[var(--gold)]/5" : "hover:bg-[var(--surface-2)]"}`}>
                  <td className="px-5 py-3 whitespace-nowrap align-top">
                    <div className="flex items-center gap-2">
                      {isToday && <span className="rounded-full bg-[var(--gold)] text-[#1a1410] text-[9px] font-black px-1.5 py-0.5">TODAY</span>}
                      <span className={`text-sm font-medium ${isPast && !isToday ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>{date}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 align-top">
                    <span className={`text-xs font-bold ${entries.length >= MAX_PER_DAY ? "text-[var(--gold)]" : "text-[var(--muted-foreground)]"}`}>
                      {entries.length}/{MAX_PER_DAY}
                    </span>
                  </td>
                  <td className="px-5 py-3 align-top">
                    <div className="space-y-1">
                      {entries.map((entry, idx) => {
                        const trick = store.tricks.find((t) => t.id === entry.trickId);
                        return (
                          <div key={entry.id} className="flex items-center gap-2 text-xs">
                            <span className="text-[var(--muted-foreground)]">{idx + 1}.</span>
                            <span className="font-medium text-[var(--foreground)] truncate max-w-[200px]">{trick?.title ?? <span className="text-rose-400">Missing</span>}</span>
                            <span className="text-[var(--gold)] font-bold ml-1">{trick?.content ?? ""}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3 align-top">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {entries.length < MAX_PER_DAY && (
                        <button onClick={() => openAdd(date)} className="text-[11px] text-[var(--gold)] hover:underline whitespace-nowrap">+ Add</button>
                      )}
                      {entries.map((entry) => (
                        <span key={entry.id} className="flex items-center gap-1">
                          <button onClick={() => openEdit(entry)} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDel(entry)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><Trash2 className="h-3.5 w-3.5" /></button>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {dateGroups.length === 0 && <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">No tricks scheduled yet.</p>}
        <div className="px-5 pb-3"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add Trick of the Day" : "Edit Scheduled Trick"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
              {modal === "add" && (
                <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                  {countForDate(form.date)}/{MAX_PER_DAY} slots used for this date
                </p>
              )}
            </Field>
            <Field label="Trick">
              <Select value={form.trickId} onChange={(e) => set("trickId", e.target.value)} required>
                <option value="">— select trick —</option>
                {store.tricks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </Select>
            </Field>
            {form.trickId && (() => {
              const preview = store.tricks.find((t) => t.id === form.trickId);
              return preview ? (
                <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-3">
                  <p className="text-xs font-bold text-[var(--gold)]">{preview.content}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">{preview.explanation}</p>
                </div>
              ) : null;
            })()}
            <Field label="Card Background Color">
              <div className="flex flex-wrap gap-2 mt-1">
                {ACCENT_OPTIONS.map((opt) => {
                  const current = (form as any).accent ?? "gold";
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("accent" as any, opt.value as any)}
                      className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        background: opt.bg,
                        borderColor: current === opt.value ? opt.shimmer : "rgba(255,255,255,0.15)",
                        color: opt.shimmer,
                        outline: current === opt.value ? `2px solid ${opt.shimmer}` : "none",
                        outlineOffset: "2px",
                      }}
                    >
                      <span className="h-3 w-3 rounded-full" style={{ background: opt.shimmer }} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Admin Note (optional)">
              <Textarea value={form.note ?? ""} onChange={(e) => set("note", e.target.value)} rows={2} placeholder="Great for UPSC History prep" />
            </Field>
            <SaveBtn />
          </form>
        </Modal>
      )}

      {delTarget && (
        <DeleteConfirm
          name={`${delTarget.date} – ${store.tricks.find((t) => t.id === delTarget.trickId)?.title ?? delTarget.trickId}`}
          onConfirm={() => handleDelete(delTarget)}
          onCancel={() => setDel(null)}
        />
      )}
    </div>
  );
}
