// Auto-translation via Google Translate (unofficial endpoint) with localStorage cache.
// Cache key: kt_at_v1_{langCode}_{text} — persists across sessions.

const CACHE_VER = 'kt_at_v1';

export const MEDIUM_TO_LANG: Record<string, string> = {
  hindi: 'hi',
};

async function translateOne(text: string, tl: string): Promise<string> {
  if (!text?.trim()) return text;
  const cacheKey = `${CACHE_VER}_${tl}_${text}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
    );
    if (!res.ok) return text;
    const data: [[string][]] = await res.json();
    const out = data[0].map(([t]) => t ?? '').join('');
    if (out) localStorage.setItem(cacheKey, out);
    return out || text;
  } catch {
    return text;
  }
}

export async function autoTranslateBatch(
  texts: string[],
  medium: string
): Promise<Record<string, string>> {
  const tl = MEDIUM_TO_LANG[medium];
  if (!tl) return {};
  const unique = [...new Set(texts.filter((t) => t?.trim()))];
  const pairs = await Promise.all(
    unique.map(async (text) => [text, await translateOne(text, tl)] as const)
  );
  return Object.fromEntries(pairs);
}

// Sync cache-only lookup — returns null if not cached yet
export function getCachedTranslation(text: string, medium: string): string | null {
  const tl = MEDIUM_TO_LANG[medium];
  if (!tl) return null;
  return localStorage.getItem(`${CACHE_VER}_${tl}_${text}`);
}
