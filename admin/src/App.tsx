import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { adminAuth, loadAdminData, syncAllCounts } from "./lib/adminApi";
import { mapDbToStore, emptyStore, type Store } from "./lib/data";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Dashboard }             from "./components/Dashboard";
import { ExamsManager }          from "./components/managers/ExamsManager";
import { SubjectsManager }       from "./components/managers/SubjectsManager";
import { ChaptersManager }       from "./components/managers/ChaptersManager";
import { TopicsManager }         from "./components/managers/TopicsManager";
import { TricksManager }         from "./components/managers/TricksManager";
import { NotesManager }          from "./components/managers/NotesManager";
import { NewsManager }           from "./components/managers/NewsManager";
import { UsersManager }          from "./components/managers/UsersManager";
import { RatingsManager }        from "./components/managers/RatingsManager";
import { RevenueManager }        from "./components/managers/RevenueManager";
import { IssuesManager }         from "./components/managers/IssuesManager";
import { NotificationsManager }  from "./components/managers/NotificationsManager";
import { TrickOfDayManager }     from "./components/managers/TrickOfDayManager";
import { AnalyticsManager }      from "./components/managers/AnalyticsManager";
import { AboutManager }          from "./components/managers/AboutManager";
import { PricingManager }        from "./components/managers/PricingManager";
import { ErrorBoundary }         from "./components/ErrorBoundary";

export type Page =
  | "dashboard" | "exams" | "subjects" | "chapters" | "topics"
  | "tricks" | "notes" | "news"
  | "users" | "ratings" | "revenue" | "issues"
  | "notifications" | "trickofday"
  | "analytics" | "pricing" | "about";

// ─── Store context ─────────────────────────────────────────────────────────────

type StoreCtx = {
  store: Store;
  update: (fn: (s: Store) => Store) => void;
  refresh: () => Promise<void>;
};
const StoreContext = createContext<StoreCtx | null>(null);

export function useStore(): StoreCtx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

// ─── App ───────────────────────────────────────────────────────────────────────

export function App() {
  const [authed, setAuthed]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState<Page>("dashboard");
  const [store, setStore]     = useState<Store>(emptyStore);

  const refresh = useCallback(async () => {
    try {
      const data = await loadAdminData();
      setStore(mapDbToStore(data));
      syncAllCounts(data).catch(console.error);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  }, []);

  const update = useCallback((fn: (s: Store) => Store) => {
    setStore((prev) => fn(prev));
  }, []);

  useEffect(() => {
    adminAuth.getSession().then(async (session) => {
      if (session) {
        setAuthed(true);
        await refresh();
      }
      setLoading(false);
    });

    const { data: { subscription } } = adminAuth.onAuthChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setAuthed(true);
        await refresh();
      } else if (event === "SIGNED_OUT") {
        setAuthed(false);
        setStore(emptyStore());
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--muted-foreground)] text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const content: Record<Page, React.ReactNode> = {
    dashboard:     <Dashboard store={store} onNavigate={setPage} />,
    exams:         <ExamsManager />,
    subjects:      <SubjectsManager />,
    chapters:      <ChaptersManager />,
    topics:        <TopicsManager />,
    tricks:        <TricksManager />,
    notes:         <NotesManager />,
    news:          <NewsManager />,
    users:         <UsersManager />,
    ratings:       <RatingsManager />,
    revenue:       <RevenueManager />,
    issues:        <IssuesManager />,
    notifications: <NotificationsManager />,
    trickofday:    <TrickOfDayManager />,
    analytics:     <AnalyticsManager />,
    pricing:       <PricingManager />,
    about:         <AboutManager />,
  };

  return (
    <StoreContext.Provider value={{ store, update, refresh }}>
      <ErrorBoundary>
        <Layout
          page={page}
          onNavigate={setPage}
          onLogout={async () => { await adminAuth.signOut(); }}
          onStoreImport={(s) => setStore(s)}
        >
          {content[page]}
        </Layout>
      </ErrorBoundary>
    </StoreContext.Provider>
  );
}
