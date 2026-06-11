import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import { KrackItLogo, KrackItWordmark } from "./KrackItLogo";
import { cn } from "@/lib/utils";
import {
  isValidEmail,
  passwordStrength,
  sanitize,
} from "@/lib/security";
import { mobileAuth } from "@/lib/mobileApi";
import { setSignupInProgress } from "@/lib/authFlag";

function Field({
  label, type, value, onChange, placeholder, error, right,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  error?: string; right?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={type === "password" ? "current-password" : undefined}
          maxLength={120}
          className={cn(
            "w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-colors",
            error
              ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
              : "border-border focus:border-gold/50 focus:ring-gold/30",
            right && "pr-11"
          )}
        />
        {right && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) { setError("Enter a valid email address."); return; }
    setError("");
    setLoading(true);
    try {
      await mobileAuth.resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Check your inbox</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            We've sent a password reset link to<br />
            <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Didn't receive it? Check your spam folder or try again.</p>
        <button onClick={onBack} className="mt-2 w-full rounded-2xl border border-border py-3 text-sm font-semibold text-foreground">
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </button>
      <div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 border border-gold/30 mb-4">
          <Mail className="h-7 w-7 text-gold" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Forgot password?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={error}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl gold-gradient py-3.5 text-sm font-bold text-[#1a1410] shadow-lg shadow-gold/20 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}

export function AuthScreen({ onAuth, onSignupStart }: { onAuth: (name: string, email: string) => void; onSignupStart?: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [signUpDone, setSignUpDone] = useState(false);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const pwStr = passwordStrength(password);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (mode === "signup" && sanitize(name).length < 2)
      errs.name = "Full name must be at least 2 characters.";
    if (!isValidEmail(email))
      errs.email = "Enter a valid email address.";
    if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (mode === "signup" && pwStr.score < 2)
      errs.password = "Please choose a stronger password.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      if (mode === "signup") {
        onSignupStart?.();
        setSignupInProgress(true);
        try {
          await mobileAuth.signUp(sanitize(email).toLowerCase(), password, sanitize(name));
          await mobileAuth.signOut().catch(() => {});
        } finally {
          setSignupInProgress(false);
        }
        setSignUpDone(true);
        setMode("signin");
        setName("");
        setPassword("");
        setErrors({});
      } else {
        await mobileAuth.signIn(sanitize(email).toLowerCase(), password);
        // Pass empty name — onAuthStateChange loads the real name from user_profiles or auth metadata
        onAuth("", sanitize(email).toLowerCase());
      }
    } catch (err: any) {
      setGlobalError(err.message ?? "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background px-6 pb-10 pt-10">
      {showForgotPw ? (
        <>
          <ForgotPasswordView onBack={() => setShowForgotPw(false)} />
        </>
      ) : (<>
      {/* Logo + branding */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl blur-xl opacity-40"
            style={{ background: "radial-gradient(circle, #D4A24C 0%, transparent 70%)" }} />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/30 bg-linear-to-br from-gold/20 to-transparent">
            <KrackItLogo size={52} glowStar />
          </div>
        </div>
        <div className="text-center">
          <KrackItWordmark className="text-3xl" />
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            One trick ahead
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="mb-5 flex rounded-2xl bg-surface p-1 gap-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setErrors({}); setGlobalError(""); setSignUpDone(false); }}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all",
              mode === m
                ? "gold-gradient text-[#1a1410] shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {mode === "signup" && (
          <Field
            label="Full Name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Aarav Singh"
            error={errors.name}
          />
        )}
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={errors.email}
        />
        <Field
          label="Password"
          type={showPass ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder={mode === "signup" ? "Min 6 chars, use numbers & symbols" : "Your password"}
          error={errors.password}
          right={
            <button type="button" onClick={() => setShowPass(!showPass)} className="text-muted-foreground">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {/* Password strength bar (signup only) */}
        {mode === "signup" && password.length > 0 && (
          <div>
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i < pwStr.score ? pwStr.color : "bg-border"
                  )}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">{pwStr.label}</p>
          </div>
        )}

        {signUpDone && mode === "signin" && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-400/10 px-4 py-2.5 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Account created! Sign in to continue.
          </div>
        )}

        {globalError && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
            {globalError}
          </p>
        )}

        {mode === "signin" && (
          <div className="text-right">
            <button type="button" onClick={() => setShowForgotPw(true)} className="text-xs font-medium text-gold hover:underline">
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-2xl gold-gradient py-3.5 text-sm font-bold text-[#1a1410] shadow-lg shadow-gold/20 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : mode === "signin"
              ? "Sign In to KrackIt"
              : "Create My Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] text-muted-foreground">or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Social sign-in */}
      <button
        onClick={() => mobileAuth.signInWithGoogle().catch((e) => setGlobalError(e.message))}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/30 active:scale-[0.98]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      </>)}
    </div>
  );
}
