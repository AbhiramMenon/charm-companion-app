import {
  ArrowLeft, ChevronRight, CheckCircle2, BookOpen,
  Waves, Crown, Star, Landmark, Flag, Users, FileText,
  Shield, ListChecks, LayoutList, Building2, CalendarDays,
  Scale, Mountain, Map, Moon, Sparkles, Triangle,
  RefreshCw, BarChart2, Flame, Globe, Dna, Zap, Battery,
  Scroll, BookText, FlaskConical, Atom, Lightbulb,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { FC } from "react";

type IconComp = FC<LucideProps>;

const TOPIC_ICONS: Record<string, IconComp> = {
  // Ancient India
  "anc-indus":     Waves,
  "anc-vedic":     Scroll,
  "anc-maurya":    Crown,
  "anc-gupta":     Star,
  // Medieval India
  "med-delhi":     Landmark,
  "med-mughal":    Crown,
  "med-south":     Landmark,
  // Modern India
  "mod-revolt":    Shield,
  "mod-movements": Flag,
  "mod-leaders":   Users,
  "mod-acts":      FileText,
  // World History
  "wh-wars":       Flame,
  "wh-revolutions":Sparkles,
  "wh-orgs":       Globe,
  // Fundamental Rights / Polity
  "fr-rights":     Shield,
  "fr-duties":     ListChecks,
  "fr-amend":      BookText,
  "dpsp-art":      BookOpen,
  "dpsp-types":    LayoutList,
  "parl-lok":      Building2,
  "parl-rajya":    Building2,
  "parl-sessions": CalendarDays,
  "jud-sc":        Scale,
  "jud-hc":        Scale,
  // Geography
  "phys":          Mountain,
  "ind":           Map,
  "ss-planets":    Globe,
  "ss-moon":       Moon,
  "ss-misc":       Star,
  // Trigonometry / Maths
  "trig":          Triangle,
  "trig-ids":      RefreshCw,
  "trig-graphs":   BarChart2,
  // Biology - Respiration
  "bio-resp":      RefreshCw,
  "bio-glyco":     Zap,
  "bio-atp":       Battery,
  // Generic fallbacks by subject keyword (checked last)
};

function getTopicIcon(topicId: string): IconComp {
  return TOPIC_ICONS[topicId] ?? Lightbulb;
}
import { type Chapter, type Topic } from "@/lib/krackit-data";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";
import { SubscriptionBanner } from "./SubscriptionBanner";
import type { ExamMode } from "./SubjectsScreen";

export function TopicsScreen({
  chapter,
  mastered,
  openedTricks,
  isLocked,
  mode,
  onBack,
  onSelect,
  onOpenSubscription,
}: {
  chapter: Chapter;
  mastered: Set<string>;
  openedTricks: Set<string>;
  isLocked: boolean;
  mode: ExamMode;
  onBack: () => void;
  onSelect: (t: Topic) => void;
  onOpenSubscription: () => void;
}) {
  const { topics, tricks, shortNotes } = useData();
  const list = topics.filter((t) => t.chapterId === chapter.id);

  const totalTricks = list.reduce((s, t) => {
    const topicTricks = tricks.filter((tr) => tr.topic === t.id);
    return s + (topicTricks.length || t.tricksCount);
  }, 0);

  const masteredInChapter = list.reduce((s, t) => {
    const topicTricks = tricks.filter((tr) => tr.topic === t.id);
    return s + topicTricks.filter((tr) => mastered.has(tr.id)).length;
  }, 0);

  const progress = totalTricks > 0 ? masteredInChapter / totalTricks : 0;

  const topicProgress = (t: Topic) => {
    const topicTricks = tricks.filter((tr) => tr.topic === t.id);
    if (!topicTricks.length) return 0;
    return topicTricks.filter((tr) => openedTricks.has(tr.id)).length / topicTricks.length;
  };

  const topicMastered = (t: Topic) => {
    const topicTricks = tricks.filter((tr) => tr.topic === t.id);
    return topicTricks.length > 0 && topicTricks.every((tr) => mastered.has(tr.id));
  };

  const topicNoteCount = (t: Topic) => shortNotes.filter((n) => n.topicId === t.id).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-6">
        <header className="px-5 pb-2 pt-6">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-2xl ring-1 ring-white/5">
              {chapter.icon ?? "📚"}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Chapter</p>
              <h1 className="text-xl font-bold text-foreground">{chapter.name}</h1>
            </div>
          </div>

          {mode === "tricks" && (
            <div className="mt-4 rounded-2xl bg-surface p-3">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-muted-foreground">{masteredInChapter} / {totalTricks} tricks mastered</span>
                <span className="font-semibold text-gold">{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full gold-gradient transition-all" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          )}
        </header>

        <section className="mt-5 px-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Topics · {list.length}
          </h2>
          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
              <p className="text-sm font-semibold text-foreground">No topics yet</p>
              <p className="text-xs text-muted-foreground">No topics have been added to this chapter.</p>
            </div>
          ) : (
          <ul className="space-y-3">
            {list.map((t) => {
              const prog = topicProgress(t);
              const done = topicMastered(t);
              const noteCount = topicNoteCount(t);
              const trickCount = tricks.filter((tr) => tr.topic === t.id).length || t.tricksCount;
              const TopicIcon = getTopicIcon(t.id);

              return (
                <li key={t.id}>
                  <button
                    onClick={() => onSelect(t)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-gold/40",
                      done && mode === "tricks" && "border-gold/20 bg-gold/5"
                    )}
                  >
                    <div className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/5 bg-background",
                      done && mode === "tricks" && "bg-gold/15"
                    )}>
                      {mode === "tricks" && done
                        ? <CheckCircle2 className="h-5 w-5 text-gold" />
                        : mode === "shortnotes"
                          ? <BookOpen className="h-5 w-5 text-gold" />
                          : <TopicIcon className="h-5 w-5 text-gold/80" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                        {done && mode === "tricks" && (
                          <span className="shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">Mastered</span>
                        )}
                      </div>
                      {mode === "shortnotes" ? (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {noteCount > 0 ? `${noteCount} note${noteCount > 1 ? "s" : ""} available` : "No notes yet"}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{trickCount} tricks</p>
                      )}
                      {mode === "tricks" && prog > 0 && !done && (
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-background">
                          <div className="h-full gold-gradient" style={{ width: `${Math.round(prog * 100)}%` }} />
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>
          )}
        </section>
      </div>

      {isLocked && <SubscriptionBanner onUpgrade={onOpenSubscription} />}
    </div>
  );
}
