import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function usePagination<T>(items: T[], pageSize = 15) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  return { page: safePage, setPage, pageItems, total: items.length, totalPages };
}

export function Pagination({
  page, totalPages, onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btn = "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors";

  return (
    <div className="flex items-center justify-between px-1 pt-3 border-t border-[var(--border)] mt-2">
      <p className="text-xs text-[var(--muted-foreground)]">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={`${btn} ${page <= 1 ? "opacity-30 cursor-not-allowed text-[var(--muted-foreground)]" : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-[var(--muted-foreground)]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`${btn} ${p === page ? "gold-gradient text-[#1a1410] font-bold" : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"}`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className={`${btn} ${page >= totalPages ? "opacity-30 cursor-not-allowed text-[var(--muted-foreground)]" : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"}`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
