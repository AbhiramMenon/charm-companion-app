import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { adminAuth } from "../lib/adminApi";

function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }

export function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!validateEmail(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      await adminAuth.signIn(email, password);
      onLogin();
    } catch (err: any) {
      setError(err.message ?? "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gold-gradient mb-4">
            <ShieldCheck className="h-7 w-7 text-[#1a1410]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">KrackIT Admin</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Restricted access — authorised users only</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="admin@krackit.com"
                autoComplete="username"
                maxLength={120}
                className={`w-full rounded-xl border bg-[var(--background)] pl-9 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none transition-colors ${fieldErrors.email ? "border-[var(--destructive)]/60 focus:border-[var(--destructive)]" : "border-[var(--border)] focus:border-[var(--gold)]"}`}
              />
            </div>
            {fieldErrors.email && <p className="mt-1 text-[11px] text-[var(--destructive)]">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined })); }}
                placeholder="••••••••"
                autoComplete="current-password"
                maxLength={120}
                className={`w-full rounded-xl border bg-[var(--background)] pl-9 pr-10 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none transition-colors ${fieldErrors.password ? "border-[var(--destructive)]/60 focus:border-[var(--destructive)]" : "border-[var(--border)] focus:border-[var(--gold)]"}`}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1 text-[11px] text-[var(--destructive)]">{fieldErrors.password}</p>}
          </div>

          {error && <p className="text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gold-gradient py-3 text-sm font-bold text-[#1a1410] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
          Not authorised? Contact the KrackIT team.
        </p>
      </div>
    </div>
  );
}
