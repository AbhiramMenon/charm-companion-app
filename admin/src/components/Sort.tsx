import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export type SortDir = "asc" | "desc";

export function useSort<T extends Record<string, unknown>>(
  items: T[],
  defaultField?: string,
  defaultDir: SortDir = "asc"
) {
  const [sortField, setSortField] = useState<string | null>(defaultField ?? null);
  const [sortDir,   setSortDir]   = useState<SortDir>(defaultDir);

  const toggle = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortField) return items;
    return [...items].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      let cmp = 0;
      if (typeof va === "number" && typeof vb === "number") {
        cmp = va - vb;
      } else {
        cmp = String(va ?? "").localeCompare(String(vb ?? ""), "en", { sensitivity: "base" });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortField, sortDir]);

  return { sortField, sortDir, toggle, sorted };
}

export function Th({
  field, label, sortField, sortDir, onToggle, align = "left",
}: {
  field: string;
  label: string;
  sortField: string | null;
  sortDir: SortDir;
  onToggle: (f: string) => void;
  align?: "left" | "right" | "center";
}) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onToggle(field)}
      className={`px-5 py-3 text-xs uppercase tracking-wider cursor-pointer select-none group hover:text-[var(--foreground)] transition-colors ${
        active ? "text-[var(--gold)]" : "text-[var(--muted-foreground)]"
      } ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}`}
    >
      <span className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
        {label}
        <span className="transition-opacity">
          {active
            ? (sortDir === "asc"
                ? <ChevronUp   className="h-3 w-3 text-[var(--gold)]" />
                : <ChevronDown className="h-3 w-3 text-[var(--gold)]" />)
            : <ChevronsUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40" />}
        </span>
      </span>
    </th>
  );
}
