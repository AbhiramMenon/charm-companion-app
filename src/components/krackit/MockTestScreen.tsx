import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, Lock, XCircle } from "lucide-react";
import { mockTestApi, type MockQuestion } from "@/lib/mobileApi";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";

type Phase = "loading" | "ready" | "active" | "finished";
type Option = "A" | "B" | "C" | "D";

const OPTION_KEYS: Option[] = ["A", "B", "C", "D"];

function getOptionText(q: MockQuestion, opt: Option): string {
  if (opt === "A") return q.option_a;
  if (opt === "B") return q.option_b;
  if (opt === "C") return q.option_c;
  return q.option_d;
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MockTestScreen({
  examId,
  examName,
  isSubscribed = false,
  onBack,
  onSubscribe,
}: {
  examId: string;
  examName: string;
  isSubscribed?: boolean;
  onBack: () => void;
  onSubscribe?: () => void;
}) {
  const { translate } = useData();
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Option>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExpl, setShowExpl] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPhase("loading");
    setLoadError(null);
    mockTestApi.getQuestions(examId)
      .then((qs) => {
        setQuestions(qs); // one free mock test per exam for all users
        setPhase("ready");
      })
      .catch((err: Error) => {
        console.error("MockTest load error:", err);
        setLoadError(err.message);
        setPhase("ready");
      });
  }, [examId, isSubscribed]);

  const startTest = () => {
    const secs = questions.length * 90; // 90s per question
    setTimeLeft(secs);
    setCurrent(0);
    setAnswers({});
    setShowExpl(false);
    setPhase("active");
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); setPhase("finished"); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const finishTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("finished");
  };

  const selectAnswer = (opt: Option) => {
    if (answers[current] !== undefined) return;
    setAnswers((a) => ({ ...a, [current]: opt }));
    setShowExpl(true);
  };

  const goNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setShowExpl(false);
    } else {
      finishTest();
    }
  };

  const score = questions.filter((q, i) => answers[i] === q.correct_option).length;

  // ── Loading ──
  if (phase === "loading") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-10">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading questions…</p>
      </div>
    );
  }

  // ── Ready / no questions ──
  if (phase === "ready") {
    return (
      <div className="flex flex-1 flex-col overflow-y-auto pb-10">
        <header className="flex items-center gap-3 px-5 pb-4 pt-6">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Mock Test</p>
            <h1 className="text-xl font-bold text-foreground">{examName}</h1>
          </div>
        </header>

        {questions.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
              <Clock className="h-8 w-8 text-gold" />
            </div>
            <p className="text-base font-bold text-foreground">No Questions Yet</p>
            {loadError ? (
              <p className="text-xs text-rose-400 break-all">Error: {loadError}</p>
            ) : (
              <p className="text-sm text-muted-foreground">The admin hasn't added mock test questions for {examName} yet. Check back soon!</p>
            )}
            <button onClick={onBack} className="mt-4 rounded-2xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground">
              Go Back
            </button>
          </div>
        ) : (
          <div className="px-5 space-y-4">
            {/* Preview banner for non-subscribers */}
            {!isSubscribed && (
              <div className="flex items-start gap-3 rounded-2xl border border-gold/25 bg-gold/8 p-4">
                <Lock className="h-5 w-5 shrink-0 text-gold mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gold">Preview Mode</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You're seeing 1 sample question. Subscribe to unlock the full test.
                  </p>
                  <button
                    onClick={onSubscribe}
                    className="mt-2 rounded-lg gold-gradient px-4 py-1.5 text-xs font-bold text-[#1a1410]"
                  >
                    Subscribe Now →
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/10 via-surface to-surface p-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Questions", value: isSubscribed ? questions.length : `1 / ?` },
                  { label: "Time",      value: isSubscribed ? fmt(questions.length * 90) : "1:30" },
                  { label: "Marks",     value: isSubscribed ? `${questions.length}` : "Preview" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl bg-background/60 p-3 text-center">
                    <p className="text-lg font-bold text-gold">{value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground mb-5">
                <li>• 1 mark for each correct answer, no negative marking</li>
                <li>• 90 seconds per question — timer runs for the full duration</li>
                <li>• You can view explanations after answering each question</li>
              </ul>
              <button onClick={startTest} className="w-full rounded-2xl gold-gradient py-4 text-base font-bold text-[#1a1410] shadow-lg">
                {isSubscribed ? "Start Test →" : "Try Sample Question →"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Active ──
  if (phase === "active") {
    const q = questions[current];
    const picked = answers[current];
    const correct = q.correct_option;

    return (
      <div className="flex flex-1 flex-col overflow-y-auto pb-8">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pb-3 pt-5">
          <button onClick={finishTest} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className={cn("text-sm font-bold tabular-nums", timeLeft <= 30 ? "text-rose-400" : "text-foreground")}>
              {fmt(timeLeft)}
            </span>
          </div>
          <div className="text-sm font-semibold text-muted-foreground">
            {current + 1} / {questions.length}
          </div>
        </header>

        {/* Progress bar */}
        <div className="mx-5 h-1.5 rounded-full bg-surface overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 px-5 space-y-4">
          {/* Answered dots */}
          <div className="flex flex-wrap gap-1">
            {questions.map((_, i) => (
              <div key={i} className={cn(
                "h-2 w-2 rounded-full",
                i === current ? "bg-gold" :
                answers[i] === questions[i].correct_option ? "bg-emerald-400" :
                answers[i] !== undefined ? "bg-rose-400" :
                "bg-border"
              )} />
            ))}
          </div>

          {/* Question */}
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gold mb-2">Q{current + 1}</p>
            <p className="text-sm font-medium text-foreground leading-relaxed">{translate(q.question)}</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {OPTION_KEYS.map((opt) => {
              const text = getOptionText(q, opt);
              const isPicked = picked === opt;
              const isCorrect = opt === correct;
              const revealed = picked !== undefined;
              return (
                <button
                  key={opt}
                  onClick={() => selectAnswer(opt)}
                  disabled={revealed}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                    !revealed
                      ? "border-border bg-surface hover:border-gold/40 active:scale-[0.98]"
                      : isCorrect
                        ? "border-emerald-400/40 bg-emerald-400/10"
                        : isPicked
                          ? "border-rose-400/40 bg-rose-400/10"
                          : "border-border bg-surface opacity-60"
                  )}
                >
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    !revealed ? "bg-background text-muted-foreground" :
                    isCorrect ? "bg-emerald-400 text-[#0a1a0a]" :
                    isPicked  ? "bg-rose-400 text-white" :
                    "bg-background text-muted-foreground"
                  )}>
                    {opt}
                  </div>
                  <span className={cn(
                    "flex-1 text-sm",
                    !revealed ? "text-foreground" :
                    isCorrect ? "text-emerald-400 font-semibold" :
                    isPicked  ? "text-rose-400" :
                    "text-muted-foreground"
                  )}>
                    {translate(text)}
                  </span>
                  {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                  {revealed && isPicked && !isCorrect && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExpl && q.explanation && (
            <div className="rounded-2xl bg-surface border border-border p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gold mb-1">Explanation</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{translate(q.explanation)}</p>
            </div>
          )}

          {/* Next / Subscribe button */}
          {picked !== undefined && (
            !isSubscribed ? (
              <div className="mt-2 space-y-2">
                <div className="rounded-2xl border border-gold/25 bg-gold/8 p-4 text-center">
                  <Lock className="h-6 w-6 text-gold mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground">That's the preview!</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">Subscribe to access all questions and take the full timed test.</p>
                  <button
                    onClick={onSubscribe}
                    className="w-full rounded-xl gold-gradient py-3 text-sm font-bold text-[#1a1410]"
                  >
                    Subscribe to Unlock Full Test →
                  </button>
                </div>
                <button onClick={onBack} className="w-full rounded-2xl border border-border py-3 text-sm font-semibold text-muted-foreground">
                  Back
                </button>
              </div>
            ) : (
              <button
                onClick={goNext}
                className="w-full rounded-2xl gold-gradient py-4 text-base font-bold text-[#1a1410] mt-2 active:scale-[0.98]"
              >
                {current < questions.length - 1 ? "Next Question →" : "Finish Test"}
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  // ── Finished ──
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const grade = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Job!" : pct >= 40 ? "Keep Practicing" : "Needs Work";
  const gradeColor = pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-gold" : pct >= 40 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto pb-10">
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Test Complete</p>
          <h1 className="text-xl font-bold text-foreground">{examName}</h1>
        </div>
      </header>

      {/* Non-subscriber: hide results behind lock */}
      {!isSubscribed ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gold/10">
            <Lock className="h-10 w-10 text-gold" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">Results Locked</p>
            <p className="text-sm text-muted-foreground mt-2">
              Subscribe to see your score, review answers, and track your progress over time.
            </p>
          </div>
          {onSubscribe && (
            <button
              onClick={onSubscribe}
              className="w-full max-w-xs rounded-2xl gold-gradient py-4 text-base font-bold text-[#1a1410] shadow-lg"
            >
              Subscribe to Unlock →
            </button>
          )}
          <button onClick={onBack} className="w-full max-w-xs rounded-2xl border border-border py-3.5 text-sm font-semibold text-muted-foreground">
            Back
          </button>
        </div>
      ) : (
        <div className="px-5 space-y-4">
          {/* Score card */}
          <div className="rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/10 via-surface to-surface p-6 text-center">
            <p className={cn("text-5xl font-black mb-1", gradeColor)}>{pct}%</p>
            <p className={cn("text-lg font-bold mb-4", gradeColor)}>{grade}</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Correct",   value: score,                      color: "text-emerald-400" },
                { label: "Wrong",     value: questions.length - score,   color: "text-rose-400"    },
                { label: "Total",     value: questions.length,           color: "text-foreground"  },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl bg-background/60 p-3">
                  <p className={cn("text-2xl font-bold", color)}>{value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Review */}
          <p className="text-sm font-semibold text-muted-foreground">Review Answers</p>
          {questions.map((q, i) => {
            const picked = answers[i];
            const correct = q.correct_option;
            const isRight = picked === correct;
            return (
              <div key={q.id} className={cn(
                "rounded-2xl border p-4 space-y-2",
                isRight ? "border-emerald-400/20 bg-emerald-400/5" : "border-rose-400/20 bg-rose-400/5"
              )}>
                <div className="flex items-start gap-2">
                  {isRight
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    : <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  }
                  <p className="text-sm text-foreground leading-snug">{translate(q.question)}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {picked && picked !== correct && (
                    <span className="rounded-full bg-rose-400/10 px-2 py-0.5 text-[10px] text-rose-400 font-semibold">
                      Your: {picked}. {translate(getOptionText(q, picked))}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
                    ✓ {correct}. {translate(getOptionText(q, correct))}
                  </span>
                </div>
                {q.explanation && (
                  <p className="text-[11px] text-muted-foreground italic">💡 {translate(q.explanation)}</p>
                )}
              </div>
            );
          })}

          <button onClick={startTest} className="w-full rounded-2xl border border-gold/30 py-3.5 text-sm font-bold text-gold mt-2">
            Try Again
          </button>
          <button onClick={onBack} className="w-full rounded-2xl border border-border py-3.5 text-sm font-semibold text-muted-foreground">
            Back to Profile
          </button>
        </div>
      )}
    </div>
  );
}
