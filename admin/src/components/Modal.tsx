import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  title, children, onClose, wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${wide ? "max-w-2xl" : "max-w-lg"} rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label, error, children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-[var(--destructive)]">{error}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:border-[var(--gold)] focus:outline-none";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-none ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputCls} ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function SaveBtn({ loading, label = "Save" }: { loading?: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading} className="w-full rounded-xl gold-gradient py-3 text-sm font-bold text-[#1a1410] disabled:opacity-60">
      {loading ? "Saving…" : label}
    </button>
  );
}

export function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel}>
      <p className="text-sm text-[var(--foreground)]/80 mb-6">
        Delete <strong className="text-[var(--foreground)]">"{name}"</strong>? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)]">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 rounded-xl bg-[var(--destructive)] py-2.5 text-sm font-bold text-white">
          Delete
        </button>
      </div>
    </Modal>
  );
}
