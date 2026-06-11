// Reusable translation input panel for admin forms.
// Currently supports Hindi; add more LANGS entries to extend.

const LANGS: { key: string; label: string; flag: string; placeholder: string }[] = [
  { key: "hindi", label: "Hindi", flag: "🇮🇳", placeholder: "हिंदी में लिखें…" },
];

type Props = {
  /** Field definitions: key = field name, label = display label, multiline = textarea */
  fields: { key: string; label: string; multiline?: boolean }[];
  /** Current translations state: { fieldKey: { langKey: value } } */
  values: Record<string, Record<string, string>>;
  onChange: (fieldKey: string, langKey: string, value: string) => void;
};

export function TranslationFields({ fields, values, onChange }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[var(--gold)]">🌐 Translations</span>
        <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--muted-foreground)] font-medium">
          Hindi · extensible for more languages
        </span>
      </div>

      {LANGS.map((lang) => (
        <div key={lang.key} className="space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
            <span>{lang.flag}</span> {lang.label}
          </p>
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-[11px] text-[var(--muted-foreground)]">{field.label}</label>
              {field.multiline ? (
                <textarea
                  value={values[field.key]?.[lang.key] ?? ""}
                  onChange={(e) => onChange(field.key, lang.key, e.target.value)}
                  placeholder={lang.placeholder}
                  rows={3}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:outline-none focus:border-[var(--gold)] resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={values[field.key]?.[lang.key] ?? ""}
                  onChange={(e) => onChange(field.key, lang.key, e.target.value)}
                  placeholder={lang.placeholder}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:outline-none focus:border-[var(--gold)]"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Helper: build a TranslationMap-shaped object from form state */
export function buildTranslationPayload(
  fieldKey: string,
  values: Record<string, Record<string, string>>
): Record<string, string> {
  return values[fieldKey] ?? {};
}
