// Fallback dates used when admin has not set exam_date on the exam record
const FALLBACK_DATE_MAP: Record<string, { label: string; date: string }> = {
  upsc: { label: "UPSC CSE Mains 2026",  date: "2026-09-15" },
  ssc:  { label: "SSC CGL Tier 1",       date: "2026-07-09" },
  neet: { label: "NEET UG 2027",         date: "2027-05-03" },
  jee:  { label: "JEE Main Jan 2027",    date: "2027-01-22" },
  cat:  { label: "CAT 2026",             date: "2026-11-30" },
  bank: { label: "IBPS PO 2026",         date: "2026-08-17" },
  ibps: { label: "IBPS PO 2026",         date: "2026-08-17" },
  rrb:  { label: "RRB NTPC 2026",        date: "2026-09-20" },
  gate: { label: "GATE 2027",            date: "2027-02-01" },
  clat: { label: "CLAT 2026",            date: "2026-12-01" },
};

// Always returns a result — days is null when date has passed or is unknown
export function getExamCountdown(exam: { short: string; examDate?: string }): { label: string; days: number | null } {
  // Use admin-set date first, fall back to static map
  const dateStr = exam.examDate ?? (() => {
    const key = exam.short.toLowerCase().split(/[\s_-]/)[0];
    return FALLBACK_DATE_MAP[key]?.date ?? null;
  })();

  const label = (() => {
    const key = exam.short.toLowerCase().split(/[\s_-]/)[0];
    return FALLBACK_DATE_MAP[key]?.label ?? exam.short;
  })();

  if (!dateStr) return { label, days: null };
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return { label, days: days < 0 ? null : days };
}
