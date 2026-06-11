import type { Exam } from "@/lib/krackit-data";

type Medium = 'hindi' | 'english';

export function MediumPickerModal({
  exam,
  current,
  onSelect,
  onClose,
}: {
  exam: Exam;
  current?: Medium;
  onSelect: (medium: Medium) => void;
  onClose: () => void;
}) {
  const defaultMedium: Medium = current ?? exam.medium ?? 'english';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9800] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-1/2 z-[9801] w-full max-w-sm -translate-x-1/2 rounded-t-3xl border border-border bg-background pb-8 pt-5"
        style={{ boxShadow: "0 -20px 60px rgba(0,0,0,0.6)" }}
      >
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />

        {/* Header */}
        <div className="px-6 mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-1">
            {exam.name}
          </p>
          <h2 className="text-xl font-bold text-foreground">Choose Your Medium</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Select the language you want to study in. You can change this later from Profile → Exam Preferences.
          </p>
        </div>

        {/* Options */}
        <div className="px-6 space-y-3 mb-6">
          {(["english", "hindi"] as Medium[]).map((m) => {
            const isSelected = (current ?? defaultMedium) === m;
            return (
              <button
                key={m}
                onClick={() => onSelect(m)}
                className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${
                  isSelected
                    ? "border-gold/50 bg-gold/10 ring-1 ring-gold/30"
                    : "border-border bg-surface"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                  m === 'english' ? "bg-sky-400/15" : "bg-orange-400/15"
                }`}>
                  {m === 'english' ? '🇬🇧' : '🇮🇳'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {m === 'english' ? 'English Medium' : 'Hindi Medium'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {m === 'english'
                      ? 'Tricks, notes and tests in English'
                      : 'Tricks, notes and tests in Hindi'}
                  </p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 transition-all ${
                  isSelected
                    ? "border-gold bg-gold"
                    : "border-border bg-transparent"
                }`}>
                  {isSelected && (
                    <svg className="w-full h-full p-0.5" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="#1a1410" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Note */}
        <p className="px-6 text-center text-[11px] text-muted-foreground">
          This exam's primary content is in{" "}
          <span className="font-semibold text-foreground">
            {exam.medium === 'hindi' ? 'Hindi' : 'English'}
          </span>
          . The translation feature remains available independently.
        </p>
      </div>
    </>
  );
}
