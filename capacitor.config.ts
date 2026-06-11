import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.krackit.app",
  appName: "KrackIT",
  webDir: "dist-capacitor",
  android: {
    allowMixedContent: false,
    backgroundColor: "#0a0a0a",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0a0a0a",
      showSpinner: false,
    },
    Keyboard: {
      resize: "none",
      style: "dark",
      resizeOnFullScreen: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0a0a0a",
      overlaysWebView: false,
    },
  },
};

export default config;
