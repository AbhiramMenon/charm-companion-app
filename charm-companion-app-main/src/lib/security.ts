// Input sanitization — strip HTML/script tags, trim whitespace
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/[<>"'`]/g, "")           // strip dangerous chars
    .trim();
}

// Email validation
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// Password strength: returns 0-4
export function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)   score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too weak",  color: "bg-rose-500" },
    { label: "Weak",      color: "bg-orange-400" },
    { label: "Fair",      color: "bg-amber-400" },
    { label: "Strong",    color: "bg-emerald-400" },
    { label: "Very strong", color: "bg-emerald-500" },
  ];
  return { score, ...map[score] };
}

// Rate limiter: max 5 attempts per 15 min per key
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string): { blocked: boolean; remaining: number; resetIn: number } {
  try {
    const raw = localStorage.getItem(`rl_${key}`);
    const data: { count: number; since: number } = raw ? JSON.parse(raw) : { count: 0, since: Date.now() };
    const now = Date.now();
    if (now - data.since > WINDOW_MS) {
      localStorage.setItem(`rl_${key}`, JSON.stringify({ count: 0, since: now }));
      return { blocked: false, remaining: MAX_ATTEMPTS, resetIn: 0 };
    }
    const blocked = data.count >= MAX_ATTEMPTS;
    const resetIn = Math.ceil((data.since + WINDOW_MS - now) / 60000);
    return { blocked, remaining: Math.max(0, MAX_ATTEMPTS - data.count), resetIn };
  } catch {
    return { blocked: false, remaining: MAX_ATTEMPTS, resetIn: 0 };
  }
}

export function recordAttempt(key: string): void {
  try {
    const raw = localStorage.getItem(`rl_${key}`);
    const now = Date.now();
    const data: { count: number; since: number } = raw ? JSON.parse(raw) : { count: 0, since: now };
    if (now - data.since > WINDOW_MS) {
      localStorage.setItem(`rl_${key}`, JSON.stringify({ count: 1, since: now }));
    } else {
      localStorage.setItem(`rl_${key}`, JSON.stringify({ ...data, count: data.count + 1 }));
    }
  } catch { /* localStorage unavailable */ }
}

// Validate profile fields
export function validateProfile(name: string, email: string, phone: string) {
  const errors: Record<string, string> = {};
  if (sanitize(name).length < 2) errors.name = "Name must be at least 2 characters.";
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (phone && !/^\+?[0-9\s\-()]{7,15}$/.test(phone)) errors.phone = "Enter a valid phone number.";
  return errors;
}
