import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Exam } from "@/lib/krackit-data";
import { MediumPickerModal } from "./MediumPickerModal";

type Medium = 'hindi' | 'english';

export function ExamPreferencesScreen({
  exams,
  examMediumPrefs,
  onChangeMedium,
  onBack,
}: {
  exams: Exam[];
  examMediumPrefs: Record<string, Medium>;
  onChangeMedium: (examId: string, medium: Medium) => void;
  onBack: () => void;
}) {
  const [pickerExam, setPickerExam] = useState<Exam | null>(null);

  // Only show exams the user has a preference for
  const prefExams = exams.filter((e) => e.id in examMediumPrefs);

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Profile</p>
          <h1 className="text-2xl font-bold text-foreground">Exam Preferences</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the study medium for each exam you've opened.
          </p>
        </div>
      </header>

      <div className="mt-5 px-5 space-y-3">
        {prefExams.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface p-8 text-center">
            <span className="text-3xl">📚</span>
            <p className="text-sm font-semibold text-foreground">No preferences yet</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
              Open an exam from the Home tab to set your study medium.
            </p>
          </div>
        ) : (
          prefExams.map((exam) => {
            const medium = examMediumPrefs[exam.id];
            return (
              <div
                key={exam.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${exam.accent} font-display text-sm font-bold text-foreground ring-1 ring-white/10`}>
                  {exam.short}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{exam.name}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                      medium === 'hindi'
                        ? 'bg-orange-400/15 text-orange-400 ring-orange-400/25'
                        : 'bg-sky-400/15 text-sky-400 ring-sky-400/25'
                    }`}>
                      {medium === 'hindi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setPickerExam(exam)}
                  className="shrink-0 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold active:scale-95"
                >
                  Change
                </button>
              </div>
            );
          })
        )}

        <p className="text-center text-[11px] text-muted-foreground pt-2">
          Changing medium refreshes your content to match the selected language.
        </p>
      </div>

      {pickerExam && (
        <MediumPickerModal
          exam={pickerExam}
          current={examMediumPrefs[pickerExam.id]}
          onSelect={(m) => {
            onChangeMedium(pickerExam.id, m);
            setPickerExam(null);
          }}
          onClose={() => setPickerExam(null)}
        />
      )}
    </div>
  );
}
