import { useState } from "react";
import { ArrowLeft, Map, X, ZoomIn } from "lucide-react";
import { type Chapter, type Topic } from "@/lib/krackit-data";
import { useData } from "@/lib/DataContext";
import { cn } from "@/lib/utils";

export function MapsInTopicScreen({
  topic,
  chapter,
  onBack,
}: {
  topic: Topic;
  chapter: Chapter;
  onBack: () => void;
}) {
  const { maps, translate } = useData();
  const topicMaps = maps.filter((m) => m.topicId === topic.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-6">
        <header className="px-5 pb-2 pt-6">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">
              {translate(chapter.name)}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground">{translate(topic.name)}</h1>
            <p className="text-sm text-muted-foreground">
              {topicMaps.length} {topicMaps.length === 1 ? "map" : "maps"}
            </p>
          </div>
        </header>

        <section className="mt-4 px-5">
          {topicMaps.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                <Map className="h-5 w-5 text-gold" />
              </div>
              <p className="text-sm font-semibold text-foreground">No maps yet</p>
              <p className="text-xs text-muted-foreground">
                Maps for this topic will appear here once added by the admin.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topicMaps.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setLightbox(m.imageUrl)}
                  className="group w-full overflow-hidden rounded-2xl border border-border bg-surface text-left transition-transform active:scale-[0.98]"
                >
                  <div className="relative">
                    <img
                      src={m.imageUrl}
                      alt={m.title}
                      className="w-full object-contain"
                      style={{ maxHeight: "280px" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80">
                        <ZoomIn className="h-5 w-5 text-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{m.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Map"
            className="max-h-full max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
