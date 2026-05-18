import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PoolPay",
    short_name: "PoolPay",
    description: "Savings group management dashboard",
    start_url: "/",
    display: "standalone",
    // sRGB hex of the rendered light-mode `--background` token in
    // app/globals.css, measured via canvas from the live `lab()` computed
    // style. The Web App Manifest spec does not let these fields vary by
    // `prefers-color-scheme`, so we lock both to the light-mode value;
    // dark-mode users get the matching dark hex via `viewport.themeColor`
    // in app/layout.tsx at runtime, which keeps the in-app chrome seamless
    // even though the install/splash will briefly flash light. If the
    // light `--background` token changes, re-measure and update both this
    // file and the runtime `viewport.themeColor` (PR #53 fixed the page
    // chrome; this fixes the install/splash chrome).
    background_color: "#fafcfe",
    theme_color: "#fafcfe",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
