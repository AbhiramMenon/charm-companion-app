const ADMIN_USERS: Record<string, string> = {
  "admin@krackit.com": "KrackIT@2026",
  "content@krackit.com": "Content@2026",
};

const SESSION_KEY    = "krackit_admin_session";
const RATE_KEY       = "krackit_admin_rate";
const SESSION_TTL    = 8 * 60 * 60 * 1000;  // 8 hours
const MAX_ATTEMPTS   = 5;
const LOCKOUT_MS     = 15 * 60 * 1000;       // 15 minutes

type RateRecord = { attempts: number; lockedUntil: number | null };

function getRateRecord(): RateRecord {
  try {
    const raw = sessionStorage.getItem(RATE_KEY);
    if (raw) return JSON.parse(raw) as RateRecord;
  } catch { /* ignore */ }
  return { attempts: 0, lockedUntil: null };
}

function setRateRecord(r: RateRecord): void {
  sessionStorage.setItem(RATE_KEY, JSON.stringify(r));
}

export function isLockedOut(): { locked: boolean; resetInMs: number } {
  const r = getRateRecord();
  if (r.lockedUntil && Date.now() < r.lockedUntil) {
    return { locked: true, resetInMs: r.lockedUntil - Date.now() };
  }
  if (r.lockedUntil && Date.now() >= r.lockedUntil) {
    setRateRecord({ attempts: 0, lockedUntil: null });
  }
  return { locked: false, resetInMs: 0 };
}

export function login(email: string, password: string): { ok: boolean; error?: string } {
  const lockCheck = isLockedOut();
  if (lockCheck.locked) {
    const mins = Math.ceil(lockCheck.resetInMs / 60000);
    return { ok: false, error: `Too many attempts. Try again in ${mins} min.` };
  }

  const normalised = email.toLowerCase().trim();
  const expected   = ADMIN_USERS[normalised];

  if (!expected || expected !== password) {
    const r = getRateRecord();
    const attempts = r.attempts + 1;
    const lockedUntil = attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
    setRateRecord({ attempts, lockedUntil });
    const remaining = MAX_ATTEMPTS - attempts;
    if (lockedUntil) return { ok: false, error: `Account locked for 15 minutes after too many failed attempts.` };
    return { ok: false, error: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` };
  }

  setRateRecord({ attempts: 0, lockedUntil: null });
  const payload = JSON.stringify({ email: normalised, loginAt: Date.now() });
  sessionStorage.setItem(SESSION_KEY, btoa(payload));
  return { ok: true };
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return false;
  try {
    const payload = JSON.parse(atob(raw)) as { email: string; loginAt: number };
    if (Date.now() - payload.loginAt > SESSION_TTL) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return false;
  }
}

export function currentUser(): string | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const payload = JSON.parse(atob(raw)) as { email: string; loginAt: number };
    return payload.email;
  } catch { return null; }
}
