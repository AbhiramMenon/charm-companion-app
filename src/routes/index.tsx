import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { MapsInTopicScreen } from "@/components/krackit/MapsInTopicScreen";
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
import { OnboardingTour, useOnboarding } from "@/components/krackit/OnboardingTour";
import { TourProvider, useTour } from "@/lib/TourContext";
import { TourOverlay } from "@/components/krackit/TourOverlay";
import { MockTestScreen } from "@/components/krackit/MockTestScreen";
import { ReferScreen } from "@/components/krackit/ReferScreen";
import { CustomTrickFormScreen } from "@/components/krackit/CustomTrickFormScreen";
import { userTrickApi, mockTestApi, type UserTrick } from "@/lib/mobileApi";
import { type Chapter, type Exam, type ShortNote, type Subject, type Topic, type Trick } from "@/lib/krackit-data";
import { type Lang, useTranslations } from "@/lib/translations";
import { mobileAuth, bookmarkApi, progressApi, ratingApi, profileApi, subscriptionApi, examMediumApi, type UserProfile as DbProfile, type Subscription } from "@/lib/mobileApi";
import { MediumPickerModal } from "@/components/krackit/MediumPickerModal";
import { ExamPreferencesScreen } from "@/components/krackit/ExamPreferencesScreen";
import { isSignupInProgress } from "@/lib/authFlag";
import { useData } from "@/lib/DataContext";
import { KrackItLogo } from "@/components/krackit/KrackItLogo";

export type SettingsPage = "account" | "notifications" | "appearance" | "language" | "help" | "subscription" | "examPlanSelection" | "billing" | "refer" | "about" | "examPreferences" | `mocktest:${string}`;

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  bio: string;
  tier: "Free" | "Exam Pack" | "Gold Learner" | "Pro";
  profilePic?: string;
  streak: number;
  lastActiveAt: string;
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

function OfflineScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-0 px-8 pb-10 pt-10 text-center bg-background">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full blur-3xl opacity-20 bg-gold" style={{ transform: "scale(0.6) translateY(20px)" }} />
        <svg width="176" height="176" viewBox="0 0 176 176" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
          {/* Glow rings */}
          <circle cx="88" cy="88" r="76" fill="#D4A24C" fillOpacity="0.06" />
          <circle cx="88" cy="88" r="58" fill="#D4A24C" fillOpacity="0.04" />
          {/* WiFi center dot */}
          <circle cx="88" cy="124" r="6" fill="#D4A24C" fillOpacity="0.45" />
          {/* WiFi arc small — dashed */}
          <path d="M71 108 Q88 91 105 108" stroke="#D4A24C" strokeOpacity="0.4" strokeWidth="5.5" strokeLinecap="round" fill="none" strokeDasharray="7 5" />
          {/* WiFi arc medium */}
          <path d="M55 93 Q88 70 121 93" stroke="#D4A24C" strokeOpacity="0.25" strokeWidth="5.5" strokeLinecap="round" fill="none" strokeDasharray="7 5" />
          {/* WiFi arc large */}
          <path d="M39 78 Q88 49 137 78" stroke="#D4A24C" strokeOpacity="0.12" strokeWidth="5.5" strokeLinecap="round" fill="none" strokeDasharray="7 5" />
          {/* X badge */}
          <circle cx="88" cy="52" r="20" fill="#0f0f1a" />
          <circle cx="88" cy="52" r="19.5" fill="#EF4444" fillOpacity="0.14" />
          <circle cx="88" cy="52" r="19.5" stroke="#EF4444" strokeOpacity="0.35" strokeWidth="1" />
          <path d="M79 43 L97 61 M97 43 L79 61" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2">No Internet Connection</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-xs">
        KrackIT needs internet access to load your study content. Please connect to Wi-Fi or mobile data and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="w-full max-w-xs rounded-2xl gold-gradient py-3.5 text-sm font-bold text-[#1a1410] shadow-lg shadow-gold/20 active:scale-[0.98] transition-transform"
      >
        Try Again
      </button>

      <div className="mt-10 flex items-center gap-2 text-[11px] text-muted-foreground">
        <KrackItLogo size={14} />
        <span>KrackIT — One trick ahead</span>
      </div>
    </div>
  );
}

// Fires page-specific tours at the right time (must be inside TourProvider)
function TourController({ tab, openedTrick, isLoggedIn }: { tab: Tab; openedTrick: Trick | null; isLoggedIn: boolean }) {
  const { startTour, isTourDone } = useTour();
  const homeFiredRef = useRef(false);
  const trickFiredRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || tab !== "home" || openedTrick || homeFiredRef.current) return;
    if (isTourDone("home")) return;
    homeFiredRef.current = true;
    const t = setTimeout(() => startTour("home"), 800);
    return () => clearTimeout(t);
  }, [tab, isLoggedIn, openedTrick, startTour, isTourDone]);

  useEffect(() => {
    if (!openedTrick || trickFiredRef.current) return;
    if (isTourDone("trickDetail")) return;
    trickFiredRef.current = true;
    const t = setTimeout(() => startTour("trickDetail"), 600);
    return () => clearTimeout(t);
  }, [openedTrick, startTour, isTourDone]);

  return null;
}

function KrackItApp() {
  const [booting, setBooting] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [signupPending, setSignupPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const needsTour = useOnboarding();
  const [userTricks, setUserTricks] = useState<UserTrick[]>([]);
  const [showCustomTrickForm, setShowCustomTrickForm] = useState(false);
  const [mockQuestionCounts, setMockQuestionCounts] = useState<Record<string, number>>({});

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
  const [trickSavedCounts, setTrickSavedCounts] = useState<Record<string, number>>({});

  // Exam medium preferences
  const [examMediumPrefs, setExamMediumPrefs] = useState<Record<string, 'hindi' | 'english'>>({});
  const [mediumPickerExam, setMediumPickerExam] = useState<Exam | null>(null);
  const currentMedium = exam ? (examMediumPrefs[exam.id] ?? exam.medium ?? 'english') : 'english';

  // Billing state
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);        // plan billing
  const [examBillingInfo, setExamBillingInfo] = useState<BillingInfo | null>(null); // exam pack billing (used in billing flow)
  const [activeExamSubs, setActiveExamSubs] = useState<Subscription[]>([]);         // per-exam subscriptions with individual expiry
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
    streak: 0,
    lastActiveAt: "",
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

  // Screenshot / screen-record deterrence (web only — disabled in native app
  // because Android fires visibilitychange when the keyboard opens, causing the
  // app to blur itself and lose input focus on every keystroke)
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
  const [showRecordingWarning, setShowRecordingWarning] = useState(false);
  useEffect(() => {
    const root = document.getElementById("root") ?? document.body;
    root.style.userSelect = "none";
    (root.style as CSSStyleDeclaration & { webkitUserSelect: string }).webkitUserSelect = "none";
    const style = document.createElement("style");
    style.textContent = "@media print { body { display: none !important; } } * { -webkit-tap-highlight-color: transparent; }";
    document.head.appendChild(style);

    if (isNative) {
      return () => { document.head.removeChild(style); };
    }

    const onVisibility = () => {
      if (document.hidden) {
        root.style.filter = "blur(20px)";
        setShowRecordingWarning(true);
      } else {
        root.style.filter = "";
        setTimeout(() => setShowRecordingWarning(false), 800);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.head.removeChild(style);
    };
  }, [isNative]);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  // Auth listener — syncs session → user state
  useEffect(() => {
    const { data: { subscription } } = mobileAuth.onAuthChange(async (event, session) => {
      if (isSignupInProgress()) return;
      if (session?.user) {
        const uid = session.user.id;
        setUserId(uid);
        setIsLoggedIn(true);
        // Load user-specific data in parallel
        try {
          const [dbProfile, bookmarks, progress, ratings, activeSubs, myTricks, mqCounts, mediumPrefs] = await Promise.all([
            profileApi.get(uid).catch(() => null),
            bookmarkApi.getIds(uid).catch(() => new Set<string>()),
            progressApi.getAll(uid).catch(() => ({ viewed: new Set<string>(), mastered: new Set<string>() })),
            ratingApi.getUserRatings(uid).catch(() => ({} as Record<string, number>)),
            subscriptionApi.getActive(uid).catch(() => [] as Subscription[]),
            userTrickApi.getAll(uid).catch(() => [] as UserTrick[]),
            mockTestApi.getCountsPerExam().catch(() => ({} as Record<string, number>)),
            examMediumApi.getAll(uid).catch(() => ({} as Record<string, 'hindi' | 'english'>)),
          ]);
          setUserTricks(myTricks);
          setMockQuestionCounts(mqCounts);
          if (dbProfile) {
            // Streak: increment on first login of each new day, reset after gap > 1 day
            const todayStr = new Date().toDateString();
            const lastStr = dbProfile.last_active_at ? new Date(dbProfile.last_active_at).toDateString() : null;
            const isNewDay = lastStr !== todayStr;
            let loginStreak = dbProfile.streak ?? 0;
            if (isNewDay) {
              const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
              loginStreak = lastStr === yesterday.toDateString() ? (dbProfile.streak ?? 0) + 1 : 1;
              profileApi.updateStreak(uid, loginStreak).catch(() => {});
            }
            // If DB name is blank/default, prefer the OAuth provider name (e.g. Google full name)
            const oauthName = (session.user.user_metadata?.full_name || session.user.user_metadata?.name) as string | undefined;
            const displayName = (!dbProfile.name || dbProfile.name === 'Aspirant') && oauthName ? oauthName : dbProfile.name;
            if (displayName !== dbProfile.name && oauthName) {
              profileApi.update(uid, { name: displayName }).catch(() => {});
            }
            setProfile((p) => ({
              ...p,
              name: displayName,
              tier: dbProfile.tier as UserProfile['tier'],
              streak: loginStreak,
              lastActiveAt: isNewDay ? new Date().toISOString() : (dbProfile.last_active_at ?? ''),
            }));
          } else {
            // No user_profiles row yet — use the name stored in Supabase auth metadata (set at signup)
            const metaName = (session.user.user_metadata?.name || session.user.user_metadata?.full_name) as string | undefined;
            if (metaName) setProfile((p) => ({ ...p, name: metaName }));
          }
          setSaved(bookmarks);
          setMastered(progress.mastered);
          setOpenedTricks(progress.viewed);
          setTrickRatings(ratings);
          setExamMediumPrefs(mediumPrefs);
          // Capture referral code from URL — saves referred_by only if null in DB
          const refCode = new URLSearchParams(window.location.search).get('ref');
          if (refCode) profileApi.setReferredBy(uid, refCode).catch(() => {});
          profileApi.touchActive(uid).catch(() => {});

          // Restore subscription state from DB
          const planSub = activeSubs.find((s) => s.plan_type === 'gold_learner' || s.plan_type === 'pro');
          if (planSub) {
            setBillingInfo({
              type: 'plan',
              plan: planSub.plan_type === 'gold_learner' ? 'Gold Learner' : 'Pro',
              amount: planSub.amount_paise,
              activatedAt: planSub.created_at,
              expiresAt: planSub.expires_at,
              transactionId: planSub.transaction_id ?? planSub.id,
            });
            setProfile((p) => ({ ...p, tier: planSub.plan_type === 'gold_learner' ? 'Gold Learner' : 'Pro' }));
          }
          const examPackSubs = activeSubs.filter((s) => s.plan_type === 'exam_pack' && s.exam_id);
          setActiveExamSubs(examPackSubs);
          if (examPackSubs.length > 0) {
            const latest = examPackSubs.reduce((a, b) =>
              new Date(b.expires_at) > new Date(a.expires_at) ? b : a
            );
            setExamBillingInfo({
              type: 'exam',
              examIds: examPackSubs.map((s) => s.exam_id!),
              amount: examPackSubs.reduce((sum, s) => sum + s.amount_paise, 0),
              activatedAt: latest.created_at,
              expiresAt: latest.expires_at,
              transactionId: latest.transaction_id ?? latest.id,
            });
          }
        } catch { /* non-fatal */ }
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setIsLoggedIn(false);
        setSaved(new Set());
        setMastered(new Set());
        setOpenedTricks(new Set());
        setTrickRatings({});
        setExamMediumPrefs({});
        setBillingInfo(null);
        setExamBillingInfo(null);
        setActiveExamSubs([]);
        setProfile({ name: 'Aspirant', email: 'aspirant@krackit.app', phone: '', bio: '', tier: 'Free', streak: 0, lastActiveAt: '' });
        changeTab('home');
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { exams: dbExams, offline: isOffline, loaded: dataLoaded, setExamMedium } = useData();

  // Derived: which exam ids this user has unlocked via exam pack (for locking/unlocking content)
  const subscribedExamIds = useMemo(() => {
    if (profile.tier === "Gold Learner" || profile.tier === "Pro") return new Set(dbExams.map((e) => e.id));
    const ids = new Set<string>();
    activeExamSubs.forEach((s) => { if (s.exam_id) ids.add(s.exam_id); });
    if (examBillingInfo?.examIds) examBillingInfo.examIds.forEach((id) => ids.add(id));
    return ids;
  }, [profile.tier, activeExamSubs, examBillingInfo, dbExams]);

  // Derived: only explicitly subscribed exam packs for the countdown (not tier-unlocked)
  const countdownExamIds = useMemo(() =>
    new Set([
      ...activeExamSubs.map((s) => s.exam_id!).filter(Boolean),
      ...(examBillingInfo?.examIds ?? []),
    ]),
    [activeExamSubs, examBillingInfo]
  );

  const [highlightExamId, setHighlightExamId] = useState<string | undefined>(undefined);

  // Derived: is the currently open exam's content locked?
  const isCurrentExamLocked = profile.tier !== "Gold Learner" && profile.tier !== "Pro" && !!exam && !subscribedExamIds.has(exam.id);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      const wasBookmarked = next.has(id);
      if (wasBookmarked) next.delete(id); else next.add(id);
      if (userId) {
        bookmarkApi.toggle(userId, id, wasBookmarked).catch(() => {});
      }
      // Optimistic saved-count update
      setTrickSavedCounts((prev) => ({
        ...prev,
        [id]: Math.max(0, (prev[id] ?? 0) + (wasBookmarked ? -1 : 1)),
      }));
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
    if (userId) {
      ratingApi.rate(userId, trickId, stars)
        .then(() => ratingApi.getAggregated([trickId]))
        .then((agg) => {
          const r = agg[trickId];
          if (r) setTrickAvgRatings((prev) => ({ ...prev, [trickId]: { avg: r.avg_rating, count: r.total_ratings } }));
        })
        .catch(() => {});
    }
  };

  const openTrick = (trick: Trick, list: Trick[]) => {
    setOpenedTricks((prev) => new Set([...prev, trick.id]));
    if (userId) progressApi.markViewed(userId, trick.id).catch(() => {});
    // Fetch real aggregate rating from DB
    ratingApi.getAggregated([trick.id]).then((agg) => {
      const r = agg[trick.id];
      if (r) setTrickAvgRatings((prev) => ({ ...prev, [trick.id]: { avg: r.avg_rating, count: r.total_ratings } }));
    }).catch(() => {});
    // Fetch saved count from DB
    bookmarkApi.getCount(trick.id).then((c) =>
      setTrickSavedCounts((prev) => ({ ...prev, [trick.id]: c }))
    ).catch(() => {});

    // Paid users never see ads
    if (profile.tier !== "Free" || activeExamSubs.length > 0) {
      setOpenedTrick(trick);
      setTrickList(list);
      return;
    }

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
    if (isLoggedIn && !(e.id in examMediumPrefs)) {
      setMediumPickerExam(e);
    } else {
      // Trigger auto-translation for stored preference
      const pref = examMediumPrefs[e.id] ?? e.medium ?? 'english';
      setExamMedium(pref, e.id);
    }
  };

  const handleModeChange = (mode: ExamMode) => {
    setExamMode(mode);
    setSubject(null);
    setChapter(null);
    setTopic(null);
  };

  const handleAuth = (name: string, email: string) => {
    setSignupPending(false);
    // Only set name if explicitly provided; onAuthStateChange loads the real name from DB/metadata
    setProfile((p) => ({ ...p, ...(name ? { name } : {}), email }));
    setIsLoggedIn(true);
    if (needsTour) setShowTour(true);
  };


  const handleLogout = async () => {
    try { await mobileAuth.signOut(); } catch { /* onAuthStateChange cleans up */ }
  };

  const handleMediumSelect = (medium: 'hindi' | 'english') => {
    if (!mediumPickerExam) return;
    const examId = mediumPickerExam.id;
    setExamMediumPrefs((prev) => ({ ...prev, [examId]: medium }));
    setExamMedium(medium, examId);
    if (userId) examMediumApi.set(userId, examId, medium).catch(() => {});
    setMediumPickerExam(null);
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
              onSuccess={async (info) => {
                setExamBillingInfo((prev) =>
                  prev?.examIds && info.type === "exam"
                    ? { ...info, examIds: [...new Set([...prev.examIds, ...(info.examIds ?? [])])] }
                    : info
                );
                // Update tier badge immediately — no refresh needed
                if (info.type === "exam") {
                  setProfile((p) => ({ ...p, tier: "Exam Pack" }));
                } else if (info.type === "plan" && info.plan) {
                  setProfile((p) => ({ ...p, tier: info.plan! }));
                }
                // Refresh per-exam subs so each card gets its own expiry
                if (userId) {
                  const fresh = await subscriptionApi.getActive(userId).catch(() => [] as Subscription[]);
                  setActiveExamSubs(fresh.filter((s) => s.plan_type === 'exam_pack' && s.exam_id));
                }
                setBillingExamIds(null);
                setSettingsPage(null);
              }}
              onBack={() => setSettingsPage("examPlanSelection")}
            />
          );
        }
        return null;
      case "refer":
        return <ReferScreen userId={userId} userName={profile.name} onBack={back} />;
      case "about":
        return <AboutScreen onBack={back} />;
      case "examPreferences":
        return (
          <ExamPreferencesScreen
            exams={dbExams}
            examMediumPrefs={examMediumPrefs}
            onChangeMedium={(examId, medium) => {
              setExamMediumPrefs((prev) => ({ ...prev, [examId]: medium }));
              if (userId) examMediumApi.set(userId, examId, medium).catch(() => {});
            }}
            onBack={back}
          />
        );
      default:
        if (settingsPage?.startsWith("mocktest:")) {
          const examId = settingsPage.slice("mocktest:".length);
          const examName = dbExams.find((e) => e.id === examId)?.name ?? examId;
          return (
              <MockTestScreen
                examId={examId}
                examName={examName}
                isSubscribed={subscribedExamIds.has(examId)}
                onBack={back}
                onSubscribe={() => setSettingsPage("subscription")}
              />
            );
        }
        return null;
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
        if (examMode === "maps") {
          return (
            <MapsInTopicScreen
              topic={topic}
              chapter={chapter!}
              onBack={() => setTopic(null)}
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
            medium={currentMedium}
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
            medium={currentMedium}
            onBack={() => setChapter(null)}
            onSelect={setTopic}
            onSelectWithMode={(t, m) => { setExamMode(m); setTopic(t); }}
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
            mode={examMode}
            medium={currentMedium}
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
            medium={currentMedium}
            onModeChange={handleModeChange}
            onBack={() => setExam(null)}
            onSelect={setSubject}
            onOpenSubscription={openSub}
            mockQuestionCount={mockQuestionCounts[exam.id] ?? 0}
            onMockTest={() => setSettingsPage(`mocktest:${exam.id}`)}
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
          streak={profile.streak}
          countdownExamIds={countdownExamIds}
          highlightExamId={highlightExamId}
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
    if (tab === "bookmarks") {
      if (showCustomTrickForm)
        return (
          <CustomTrickFormScreen
            onSave={async (draft) => {
              if (!userId) return;
              const created = await userTrickApi.create({
                user_id: userId,
                exam_id: draft.examId,
                subject_name: draft.subjectName,
                chapter_name: draft.chapterName,
                topic_name: draft.topicName,
                title: draft.title,
                content: draft.content,
              });
              setUserTricks((prev) => [created, ...prev]);
              setShowCustomTrickForm(false);
            }}
            onBack={() => setShowCustomTrickForm(false)}
          />
        );
      return (
        <BookmarksScreen
          saved={saved}
          savedNotes={savedNotes}
          mastered={mastered}
          openedTricks={openedTricks}
          toggleSave={toggleSave}
          toggleSaveNote={toggleSaveNote}
          openTrick={openTrick}
          userTricks={userTricks}
          onAddCustomTrick={() => setShowCustomTrickForm(true)}
          onDeleteCustomTrick={async (id) => {
            await userTrickApi.remove(id).catch(() => {});
            setUserTricks((prev) => prev.filter((t) => t.id !== id));
          }}
        />
      );
    }
    return (
      <ProfileScreen
        profile={profile}
        billingInfo={billingInfo}
        examBillingInfo={examBillingInfo}
        activeExamSubs={activeExamSubs}
        userId={userId}
        masteredCount={mastered.size}
        tricksLearnedCount={openedTricks.size}
        onNavigate={setSettingsPage}
        onLogout={handleLogout}
        onOpenExam={(examId) => {
          const e = dbExams.find((x) => x.id === examId);
          if (e) openExam(e, "tricks");
          setSettingsPage(null);
          setTab("home");
        }}
        onMockTest={(examId) => setSettingsPage(`mocktest:${examId}`)}
        t={t}
      />
    );
  };

  // Subscription expiry check (5-day warning) — use soonest-expiring exam sub
  const expiryDate = activeExamSubs.length > 0
    ? activeExamSubs.reduce((soonest, s) =>
        new Date(s.expires_at) < new Date(soonest) ? s.expires_at : soonest,
        activeExamSubs[0].expires_at
      )
    : (examBillingInfo?.expiresAt ?? billingInfo?.expiresAt ?? null);
  const daysUntilExpiry = expiryDate
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86_400_000)
    : null;
  const showExpiryBanner = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 5;

  return (
    <TourProvider>
      <TourController tab={tab} openedTrick={openedTrick} isLoggedIn={isLoggedIn} />
    <PhoneFrame>
      {showRecordingWarning && (
        <div className="absolute inset-0 z-999 flex flex-col items-center justify-center gap-4 bg-background/95 backdrop-blur-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-400/15 ring-1 ring-rose-400/30">
            <span className="text-3xl">🛡️</span>
          </div>
          <p className="text-base font-bold text-foreground">Content Protected</p>
          <p className="max-w-55 text-center text-sm text-muted-foreground leading-relaxed">
            Screenshots and screen recording of KrackIT content are not permitted.
          </p>
        </div>
      )}
      {mediumPickerExam && (
        <MediumPickerModal
          exam={mediumPickerExam}
          current={examMediumPrefs[mediumPickerExam.id]}
          onSelect={handleMediumSelect}
          onClose={() => setMediumPickerExam(null)}
        />
      )}
      {showTour && <OnboardingTour onDone={() => setShowTour(false)} />}
      {booting ? (
        <Splash />
      ) : (!isLoggedIn || signupPending) ? (
        <AuthScreen onAuth={handleAuth} onSignupStart={() => setSignupPending(true)} />
      ) : (isOffline && dataLoaded && dbExams.length === 0) ? (
        <OfflineScreen />
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
          savedCount={trickSavedCounts[openedTrick.id]}
          language={language}
          medium={currentMedium}
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
      <TourOverlay />
    </PhoneFrame>
    </TourProvider>
  );
}
