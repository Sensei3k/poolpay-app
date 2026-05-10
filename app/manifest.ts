import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PoolPay",
    short_name: "PoolPay",
    description: "Ajo savings group management dashboard",
    start_url: "/",
    display: "standalone",
    // sRGB hex of the rendered `--background` token in app/globals.css —
    // measured via canvas from the live `lab()` computed style. PWA splash
    // colours must match the page background to prevent a thin seam on
    // OLED at the splash → app handoff. If those tokens change, re-measure
    // and update both this file and `viewport.themeColor` in app/layout.tsx
    // (PR #53 fixed the page chrome; this fixes the install/splash chrome).
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
