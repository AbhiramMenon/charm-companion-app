import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter, createHashHistory } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,   // keyboard open/close fires focus events — prevents freeze
      refetchOnReconnect: false,
    },
  },
});

const history = createHashHistory();

const router = createRouter({
  routeTree,
  context: { queryClient },
  history,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

async function initNative() {
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
  if (!isNative) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0a0a0a" });
  } catch (_) { /* not available on all devices */ }

  try {
    const { App } = await import("@capacitor/app");

    // Handle Android hardware back button
    App.addListener("backButton", ({ canGoBack }) => {
      if (window.history.length > 1 && canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    // Refresh Supabase session when app comes back to foreground
    App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        try {
          const { supabase } = await import("./lib/supabase");
          await supabase.auth.getSession();
        } catch (_) { /* silent */ }
      }
    });
  } catch (_) { /* not available */ }
}

initNative();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} context={{ queryClient }} />
  </StrictMode>,
);
