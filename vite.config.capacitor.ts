import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Separate Vite config for Capacitor (Android/iOS) APK/IPA builds.
// Produces a plain SPA in dist-capacitor/ — no SSR, no Nitro server.
export default defineConfig({
  root: "./capacitor-build",
  envDir: path.resolve(__dirname),  // load .env from project root, not capacitor-build/
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../dist-capacitor",
    emptyOutDir: true,
  },
});
