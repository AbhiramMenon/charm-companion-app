import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { id: "English", label: "English", native: "English", flag: "🇬🇧" },
  { id: "Hindi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { id: "Tamil", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { id: "Telugu", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { id: "Bengali", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { id: "Marathi", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { id: "Gujarati", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { id: "Kannada", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
];

export function LanguageScreen({
  current,
  onChange,
  onBack,
}: {
  current: string;
  onChange: (lang: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Settings</p>
          <h1 className="text-2xl font-bold text-foreground">Language</h1>
        </div>
      </header>

      <div className="mt-5 px-5">
        <p className="mb-3 text-xs text-muted-foreground">
          Choose the language for the app interface. Trick content will still be in the language it was written in.
        </p>
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
          {languages.map((lang) => (
            <li key={lang.id}>
              <button
                onClick={() => onChange(lang.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{lang.label}</p>
                  <p className="text-xs text-muted-foreground">{lang.native}</p>
                </div>
                {current === lang.id && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20">
                    <Check className="h-3.5 w-3.5 text-gold" />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
