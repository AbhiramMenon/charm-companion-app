import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PhoneFrame } from "@/components/krackit/PhoneFrame";
import { Splash } from "@/components/krackit/Splash";
import { BottomNav, type Tab } from "@/components/krackit/BottomNav";
import { HomeScreen } from "@/components/krackit/HomeScreen";
import { SearchScreen } from "@/components/krackit/SearchScreen";
import { BookmarksScreen } from "@/components/krackit/BookmarksScreen";
import { ProfileScreen } from "@/components/krackit/ProfileScreen";
import { TrickDetail } from "@/components/krackit/TrickDetail";
import { SubjectsScreen, type ExamMode } from "@/components/krackit/SubjectsScreen";
import { ChaptersScreen } from "@/components/krackit/ChaptersScreen";
import { TopicsScreen } from "@/components/krackit/TopicsScreen";
import { TricksInTopicScreen } from "@/components/krackit/TricksInTopicScreen";
import { ShortNotesInTopicScreen } from "@/components/krackit/ShortNotesInTopicScreen";
import { AllExamsScreen } from "@/components/krackit/AllExamsScreen";
import { AuthScreen } from "@/components/krackit/AuthScreen";
import { AccountSettingsScreen } from "@/components/krackit/AccountSettingsScreen";
import { NotificationsScreen } from "@/components/krackit/NotificationsScreen";
import { AppearanceScreen, type AccentColor, type FontSize, type ThemeMode } from "@/components/krackit/AppearanceScreen";
import { LanguageScreen } from "@/components/krackit/LanguageScreen";
import { HelpSupportScreen } from "@/components/krackit/HelpSupportScreen";
import { SubscriptionScreen } from "@/components/krackit/SubscriptionScreen";
import { ExamPlanSelectionScreen } from "@/components/krackit/ExamPlanSelectionScreen";
import { BillingScreen, type BillingInfo } from "@/components/krackit/BillingScreen";
import { AboutScreen } from "@/components/krackit/AboutScreen";
import { NotificationsFeedScreen } from "@/components/krackit/NotificationsFeedScreen";
import { AdScreen } from "@/components/krackit/AdScreen";
import { type Chapter, type Exam, type ShortNote, type Subject, type Topic, type Trick } from "@/lib/krackit-data";
import { type Lang, useTranslations } from "@/lib/translations";
import { mobileAuth, bookmarkApi, progressApi, ratingApi, profileApi, type UserProfile as DbProfile } from "@/lib/mobileApi";
import { useData } from "@/lib/DataContext";

export type SettingsPage = "account" | "notifications" | "appearance" | "language" | "help" | "subscription" | "examPlanSelection" | "billing" | "about";

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  bio: string;
  tier: "Free" | "Gold Learner" | "Pro";
  profilePic?: string;
};

export type NotificationPrefs = {
  dailyReminder: boolean;
  examAlerts: boolean;
  streakReminder: boolean;
  weeklyReport: boolean;
  newTricks: boolean;
};

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Navigation
  const [tab, setTab] = useState<Tab>("home");
  const [exam, setExam] = useState<Exam | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [openedTrick, setOpenedTrick] = useState<Trick | null>(null);
  const [trickList, setTrickList] = useState<Trick[]>([]);
  const [showAllExams, setShowAllExams] = useState(false);
  const [settingsPage, setSettingsPage] = useState<SettingsPage | null>(null);
  const [showNotificationsFeed, setShowNotificationsFeed] = useState(false);

  // Exam drill-down mode
  const [examMode, setExamMode] = useState<ExamMode>("tricks");

  // User data
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [savedNotes, setSavedNotes] = useState<Set<string>>(new Set());
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [openedTricks, setOpenedTricks] = useState<Set<string>>(new Set());
  const [customShortNotes, setCustomShortNotes] = useState<ShortNote[]>([]);
  const [trickRatings, setTrickRatings] = useState<Record<string, number>>({});
  const [trickAvgRatings, setTrickAvgRatings] = useState<Record<string, { avg: number; count: number }>>({});

  // Billing state
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);        // plan billing
  const [examBillingInfo, setExamBillingInfo] = useState<BillingInfo | null>(null); // exam pack billing
  const [billingExamIds, setBillingExamIds] = useState<string[] | null>(null);

  // Ad system
  const [trickViewsSinceAd, setTrickViewsSinceAd] = useState(0);
  const [adsWatched, setAdsWatched] = useState(0);
  const [adFreeUntil, setAdFreeUntil] = useState<number | null>(null);
  const [pendingAdTrick, setPendingAdTrick] = useState<{ trick: Trick; list: Trick[] } | null>(null);
  const [billingDuration, setBillingDuration] = useState<"monthly" | "sixmonths" | "yearly">("monthly");

  const [profile, setProfile] = useState<UserProfile>({
    name: "Aspirant",
    email: "aspirant@krackit.app",
    phone: "",
    bio: "",
    tier: "Free",
  });
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    dailyReminder: true,
    examAlerts: true,
    streakReminder: true,
    weeklyReport: false,
    newTricks: true,
  });

  // Appearance
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [accentColor, setAccentColor] = useState<AccentColor>("gold");
  const [fontSize, setFontSize] = useState<FontSize>("default");

  // Language
  const [language, setLanguage] = useState<Lang>("English");
  const t = useTranslations(language);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  // Auth listener — syncs session → user state
  useEffect(() => {
    const { data: { subscription } } = mobileAuth.onAuthChange(async (event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        setUserId(uid);
        setIsLoggedIn(true);
        // Load user-specific data in parallel
        try {
          const [dbProfile, bookmarks, progress, ratings] = await Promise.all([
            profileApi.get(uid).catch(() => null),
            bookmarkApi.getIds(uid).catch(() => new Set<string>()),
            progressApi.getAll(uid).catch(() => ({ viewed: new Set<string>(), mastered: new Set<string>() })),
            ratingApi.getUserRatings(uid).catch(() => ({} as Record<string, number>)),
          ]);
          if (dbProfile) {
            setProfile((p) => ({
              ...p,
              name: dbProfile.name,
              tier: dbProfile.tier === 'Exam Pack' ? 'Gold Learner' : dbProfile.tier as UserProfile['tier'],
            }));
          }
          setSaved(bookmarks);
          setMastered(progress.mastered);
          setOpenedTricks(progress.viewed);
          setTrickRatings(ratings);
          profileApi.touchActive(uid).catch(() => {});
        } catch { /* non-fatal */ }
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setIsLoggedIn(false);
        setSaved(new Set());
        setMastered(new Set());
        setOpenedTricks(new Set());
        setTrickRatings({});
        setProfile({ name: 'Aspirant', email: 'aspirant@krackit.app', phone: '', bio: '', tier: 'Free' });
        changeTab('home');
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { exams: dbExams } = useData();

  // Derived: which exam ids this user has unlocked via exam pack
  const subscribedExamIds = useMemo(() => {
    if (profile.tier !== "Free") return new Set(dbExams.map((e) => e.id));
    const ids = new Set<string>();
    if (examBillingInfo?.examIds) examBillingInfo.examIds.forEach((id) => ids.add(id));
    return ids;
  }, [profile.tier, examBillingInfo, dbExams]);

  // Derived: is the currently open exam's content locked?
  const isCurrentExamLocked = profile.tier === "Free" && !!exam && !subscribedExamIds.has(exam.id);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      const isBookmarked = next.has(id);
      if (isBookmarked) next.delete(id); else next.add(id);
      if (userId) bookmarkApi.toggle(userId, id, isBookmarked).catch(() => {});
      return next;
    });
  };

  const toggleSaveNote = (noteId: string) => {
    setSavedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) next.delete(noteId); else next.add(noteId);
      return next;
    });
  };

  const toggleMastered = (id: string) => {
    setMastered((prev) => {
      const next = new Set(prev);
      const nowMastered = !next.has(id);
      if (nowMastered) next.add(id); else next.delete(id);
      if (userId) progressApi.toggleMastered(userId, id, nowMastered).catch(() => {});
      return next;
    });
  };

  const rateTrick = (trickId: string, stars: number) => {
    if (trickRatings[trickId]) return;
    setTrickRatings((prev) => ({ ...prev, [trickId]: stars }));
    setTrickAvgRatings((prev) => {
      const seed = trickId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const baseCount = 60 + (seed % 140);
      const baseAvg = 3.4 + (seed % 16) / 10;
      const existing = prev[trickId] ?? { avg: baseAvg, count: baseCount };
      const newCount = existing.count + 1;
      const newAvg = (existing.avg * existing.count + stars) / newCount;
      return { ...prev, [trickId]: { avg: Math.round(newAvg * 10) / 10, count: newCount } };
    });
    if (userId) ratingApi.rate(userId, trickId, stars).catch(() => {});
  };

  const openTrick = (trick: Trick, list: Trick[]) => {
    setOpenedTricks((prev) => new Set([...prev, trick.id]));
    if (userId) progressApi.markViewed(userId, trick.id).catch(() => {});

    // Ad-free window active → open directly
    if (adFreeUntil && Date.now() < adFreeUntil) {
      setOpenedTrick(trick);
      setTrickList(list);
      return;
    }

    // Every 3rd trick triggers an ad
    const nextCount = trickViewsSinceAd + 1;
    if (nextCount >= 3) {
      setTrickViewsSinceAd(0);
      setPendingAdTrick({ trick, list });
    } else {
      setTrickViewsSinceAd(nextCount);
      setOpenedTrick(trick);
      setTrickList(list);
    }
  };

  const handleAdComplete = () => {
    const nextWatched = adsWatched + 1;
    setAdsWatched(nextWatched);
    if (nextWatched >= 3) {
      setAdFreeUntil(Date.now() + 15 * 60 * 1000);
      setAdsWatched(0);
    }
    if (pendingAdTrick) {
      setOpenedTrick(pendingAdTrick.trick);
      setTrickList(pendingAdTrick.list);
      setPendingAdTrick(null);
    }
  };

  const handleAdSkip = () => {
    if (pendingAdTrick) {
      setOpenedTrick(pendingAdTrick.trick);
      setTrickList(pendingAdTrick.list);
      setPendingAdTrick(null);
    }
  };

  const addShortNote = (note: Omit<ShortNote, "id">) => {
    const id = `csn_${Date.now()}`;
    setCustomShortNotes((prev) => [...prev, { ...note, id }]);
  };

  const deleteShortNote = (id: string) => {
    setCustomShortNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const changeTab = (newTab: Tab) => {
    setExam(null);
    setSubject(null);
    setChapter(null);
    setTopic(null);
    setOpenedTrick(null);
    setShowAllExams(false);
    setShowNotificationsFeed(false);
    setSettingsPage(null);
    setTab(newTab);
  };

  const openExam = (e: Exam, mode: ExamMode = "tricks") => {
    setExamMode(mode);
    setSubject(null);
    setChapter(null);
    setTopic(null);
    setExam(e);
  };

  const handleModeChange = (mode: ExamMode) => {
    setExamMode(mode);
    setSubject(null);
    setChapter(null);
    setTopic(null);
  };

  const handleAuth = (name: string, email: string) => {
    // onAuthStateChange will handle the actual state update; this is a fallback for social/quick logins
    setProfile((p) => ({ ...p, name, email }));
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try { await mobileAuth.signOut(); } catch { /* onAuthStateChange cleans up */ }
  };

  const renderSettings = () => {
    const back = () => setSettingsPage(null);
    switch (settingsPage) {
      case "account":
        return <AccountSettingsScreen profile={profile} userId={userId} onSave={setProfile} onBack={back} />;
      case "notifications":
        return <NotificationsScreen prefs={notifications} onChange={setNotifications} onBack={back} />;
      case "appearance":
        return (
          <AppearanceScreen
            theme={themeMode}
            accent={accentColor}
            fontSize={fontSize}
            onThemeChange={setThemeMode}
            onAccentChange={setAccentColor}
            onFontSizeChange={setFontSize}
            onBack={back}
          />
        );
      case "language":
        return <LanguageScreen current={language} onChange={(l) => setLanguage(l as Lang)} onBack={back} />;
      case "help":
        return <HelpSupportScreen onBack={back} userId={userId} userName={profile.name} userEmail={profile.email} />;
      case "subscription":
        return (
          <SubscriptionScreen
            tier={profile.tier}
            subscribedExamIds={subscribedExamIds}
            onSelectExamPack={(ids) => { setBillingExamIds(ids); setSettingsPage("examPlanSelection"); }}
            onBack={back}
          />
        );
      case "examPlanSelection":
        if (!billingExamIds) return null;
        return (
          <ExamPlanSelectionScreen
            examIds={billingExamIds}
            onSelectDuration={(duration) => { setBillingDuration(duration); setSettingsPage("billing"); }}
            onBack={() => setSettingsPage("subscription")}
          />
        );
      case "billing":
        if (billingExamIds) {
          return (
            <BillingScreen
              billingType={{ type: "exam", examIds: billingExamIds }}
              userEmail={profile.email}
              userName={profile.name}
              userId={userId}
              initialDuration={billingDuration}
              onSuccess={(info) => {
                setExamBillingInfo(info);
                setBillingExamIds(null);
                setSettingsPage(null);
              }}
              onBack={() => setSettingsPage("examPlanSelection")}
            />
          );
        }
        return null;
      case "about":
        return <AboutScreen onBack={back} />;
    }
  };

  const renderTab = () => {
    if (settingsPage) return renderSettings();

    if (tab === "home") {
      if (showNotificationsFeed)
        return <NotificationsFeedScreen onBack={() => setShowNotificationsFeed(false)} />;

      if (showAllExams)
        return (
          <AllExamsScreen
            onBack={() => setShowAllExams(false)}
            onSelect={(e) => { setShowAllExams(false); openExam(e, examMode); }}
          />
        );

      const openSub = () => setSettingsPage("subscription");

      if (topic) {
        if (examMode === "shortnotes") {
          return (
            <ShortNotesInTopicScreen
              topic={topic}
              chapter={chapter!}
              customNotes={customShortNotes}
              savedNotes={savedNotes}
              isLocked={isCurrentExamLocked}
              onAddNote={addShortNote}
              onDeleteNote={deleteShortNote}
              onToggleSaveNote={toggleSaveNote}
              onBack={() => setTopic(null)}
              onOpenSubscription={openSub}
            />
          );
        }
        return (
          <TricksInTopicScreen
            topic={topic}
            chapter={chapter!}
            saved={saved}
            mastered={mastered}
            openedTricks={openedTricks}
            isLocked={isCurrentExamLocked}
            toggleSave={toggleSave}
            openTrick={openTrick}
            onBack={() => setTopic(null)}
            onOpenSubscription={openSub}
          />
        );
      }

      if (chapter)
        return (
          <TopicsScreen
            chapter={chapter}
            mastered={mastered}
            openedTricks={openedTricks}
            isLocked={isCurrentExamLocked}
            mode={examMode}
            onBack={() => setChapter(null)}
            onSelect={setTopic}
            onOpenSubscription={openSub}
          />
        );

      if (subject)
        return (
          <ChaptersScreen
            subject={subject}
            mastered={mastered}
            openedTricks={openedTricks}
            isLocked={isCurrentExamLocked}
            onBack={() => setSubject(null)}
            onSelect={setChapter}
            onOpenSubscription={openSub}
          />
        );

      if (exam)
        return (
          <SubjectsScreen
            exam={exam}
            mastered={mastered}
            openedTricks={openedTricks}
            mode={examMode}
            isLocked={isCurrentExamLocked}
            onModeChange={handleModeChange}
            onBack={() => setExam(null)}
            onSelect={setSubject}
            onOpenSubscription={openSub}
          />
        );

      return (
        <HomeScreen
          saved={saved}
          mastered={mastered}
          openedTricks={openedTricks}
          toggleSave={toggleSave}
          openTrick={openTrick}
          openExam={(e) => openExam(e, "tricks")}
          onSeeAllExams={() => setShowAllExams(true)}
          onOpenNotifications={() => setShowNotificationsFeed(true)}
          t={t}
          userName={profile.name}
        />
      );
    }

    if (tab === "search")
      return (
        <SearchScreen
          saved={saved}
          mastered={mastered}
          openedTricks={openedTricks}
          toggleSave={toggleSave}
          openTrick={openTrick}
        />
      );
    if (tab === "bookmarks")
      return (
        <BookmarksScreen
          saved={saved}
          savedNotes={savedNotes}
          mastered={mastered}
          openedTricks={openedTricks}
          toggleSave={toggleSave}
          toggleSaveNote={toggleSaveNote}
          openTrick={openTrick}
        />
      );
    return (
      <ProfileScreen
        profile={profile}
        billingInfo={billingInfo}
        examBillingInfo={examBillingInfo}
        onNavigate={setSettingsPage}
        onLogout={handleLogout}
        t={t}
      />
    );
  };

  // Subscription expiry check (5-day warning)
  const expiryDate = examBillingInfo?.expiresAt ?? billingInfo?.expiresAt ?? null;
  const daysUntilExpiry = expiryDate
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86_400_000)
    : null;
  const showExpiryBanner = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 5;

  return (
    <PhoneFrame>
      {booting ? (
        <Splash />
      ) : !isLoggedIn ? (
        <AuthScreen onAuth={handleAuth} />
      ) : pendingAdTrick ? (
        <AdScreen
          adNumber={Math.min(adsWatched + 1, 3)}
          onComplete={handleAdComplete}
          onSkip={handleAdSkip}
        />
      ) : openedTrick ? (
        <TrickDetail
          trick={openedTrick}
          trickList={trickList}
          saved={saved.has(openedTrick.id)}
          mastered={mastered.has(openedTrick.id)}
          rating={trickRatings[openedTrick.id] ?? 0}
          avgRating={trickAvgRatings[openedTrick.id]}
          onToggleSave={() => toggleSave(openedTrick.id)}
          onToggleMastered={() => toggleMastered(openedTrick.id)}
          onRate={(stars) => rateTrick(openedTrick.id, stars)}
          onNavigate={(trick) => {
            setOpenedTricks((prev) => new Set([...prev, trick.id]));
            setOpenedTrick(trick);
          }}
          onBack={() => setOpenedTrick(null)}
        />
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            {renderTab()}
          </div>
          {/* Subscription expiry banner — 5 days before */}
          {showExpiryBanner && (
            <button
              onClick={() => setSettingsPage("subscription")}
              className="flex items-center justify-between gap-2 border-t border-amber-400/30 bg-amber-400/10 px-4 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-amber-400 text-sm shrink-0">⚠</span>
                <p className="text-xs text-amber-400 font-semibold truncate">
                  Subscription expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} — Renew now
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 shrink-0">Renew →</span>
            </button>
          )}
          {adFreeUntil && Date.now() < adFreeUntil && (
            <div className="flex items-center justify-center gap-1.5 border-t border-emerald-400/20 bg-emerald-400/8 px-4 py-1.5">
              <span className="text-[10px] text-emerald-400 font-semibold">
                ✓ Ad-free for {Math.ceil((adFreeUntil - Date.now()) / 60000)} more min
              </span>
            </div>
          )}
          <BottomNav active={tab} onChange={changeTab} t={t} />
        </div>
      )}
    </PhoneFrame>
  );
}
