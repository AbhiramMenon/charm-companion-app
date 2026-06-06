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
import { SubjectsScreen } from "@/components/krackit/SubjectsScreen";
import { ChaptersScreen } from "@/components/krackit/ChaptersScreen";
import { TricksScreen } from "@/components/krackit/TricksScreen";
import type { Chapter, Exam, Subject, Trick } from "@/lib/krackit-data";

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
  const [exam, setExam] = useState<Exam | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);

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

  // Reset drill-down when switching tabs
  const changeTab = (t: Tab) => {
    setExam(null);
    setSubject(null);
    setChapter(null);
    setOpenedTrick(null);
    setTab(t);
  };

  const renderTab = () => {
    if (tab === "home") {
      if (chapter) {
        return (
          <TricksScreen
            chapter={chapter}
            saved={saved}
            toggleSave={toggleSave}
            openTrick={setOpenedTrick}
            onBack={() => setChapter(null)}
          />
        );
      }
      if (subject) {
        return <ChaptersScreen subject={subject} onBack={() => setSubject(null)} onSelect={setChapter} />;
      }
      if (exam) {
        return <SubjectsScreen exam={exam} onBack={() => setExam(null)} onSelect={setSubject} />;
      }
      return (
        <HomeScreen saved={saved} toggleSave={toggleSave} openTrick={setOpenedTrick} openExam={setExam} />
      );
    }
    if (tab === "search") return <SearchScreen saved={saved} toggleSave={toggleSave} openTrick={setOpenedTrick} />;
    if (tab === "bookmarks") return <BookmarksScreen saved={saved} toggleSave={toggleSave} openTrick={setOpenedTrick} />;
    return <ProfileScreen />;
  };

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
          {renderTab()}
          <BottomNav active={tab} onChange={changeTab} />
        </>
      )}
    </PhoneFrame>
  );
}
