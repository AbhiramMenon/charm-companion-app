import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/krackit/PhoneFrame";
import { Splash } from "@/components/krackit/Splash";
import { BottomNav, type Tab } from "@/components/krackit/BottomNav";
import { HomeScreen } from "@/components/krackit/HomeScreen";
import { SearchScreen } from "@/components/krackit/SearchScreen";
import { BookmarksScreen } from "@/components/krackit/BookmarksScreen";
import { ProfileScreen } from "@/components/krackit/ProfileScreen";
import { TrickDetail } from "@/components/krackit/TrickDetail";
import type { Trick } from "@/lib/krackit-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrackIT — One trick ahead" },
      { name: "description", content: "Tricks, mnemonics and memory techniques for competitive exams." },
      { property: "og:title", content: "KrackIT — One trick ahead" },
      { property: "og:description", content: "Tricks, mnemonics and memory techniques for competitive exams." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: KrackItApp,
});

function KrackItApp() {
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [saved, setSaved] = useState<Set<string>>(new Set(["t2"]));
  const [openedTrick, setOpenedTrick] = useState<Trick | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <PhoneFrame>
      {booting ? (
        <Splash />
      ) : openedTrick ? (
        <TrickDetail
          trick={openedTrick}
          saved={saved.has(openedTrick.id)}
          onToggleSave={() => toggleSave(openedTrick.id)}
          onBack={() => setOpenedTrick(null)}
        />
      ) : (
        <>
          {tab === "home" && <HomeScreen saved={saved} toggleSave={toggleSave} openTrick={setOpenedTrick} />}
          {tab === "search" && <SearchScreen saved={saved} toggleSave={toggleSave} openTrick={setOpenedTrick} />}
          {tab === "bookmarks" && <BookmarksScreen saved={saved} toggleSave={toggleSave} openTrick={setOpenedTrick} />}
          {tab === "profile" && <ProfileScreen />}
          <BottomNav active={tab} onChange={setTab} />
        </>
      )}
    </PhoneFrame>
  );
}
