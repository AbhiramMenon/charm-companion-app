// Extensible per-field translation map: { hindi: "भूगोल", tamil: "புவியியல்", ... }
export type TranslationMap = Record<string, string>;

/**
 * Returns the translated value for `medium`, falling back to `defaultValue` when:
 * - medium is undefined or 'english' (default content language)
 * - no translation exists for the requested language
 */
export function getTranslated(
  defaultValue: string,
  translations: TranslationMap | undefined | null,
  medium: string | undefined
): string {
  if (!medium || medium === "english" || !translations) return defaultValue;
  return translations[medium] || defaultValue;
}
