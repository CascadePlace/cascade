import type { NextConfig } from "next";

// When building for GitHub Pages (GITHUB_PAGES=true in the Actions workflow),
// emit a fully static export served from https://<user>.github.io/cascade/.
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/cascade" : "";

const nextConfig: NextConfig = {
  // Hide the Next.js dev-tools indicator (the floating "N" button). It renders
  // inside the in-app preview and looks like part of the user's own app.
  devIndicators: false,
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath,
        // GitHub Pages has no image-optimization server.
        images: { unoptimized: true },
      }
    : {}),
  env: {
    // next/image & plain asset URLs don't get basePath applied automatically —
    // components prefix static asset paths with this (see lib/base-path.ts).
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    // Pin the workspace root to where `next` runs (the app dir). Without this,
    // Turbopack walks up looking for a lockfile and can pick a stray parent one
    // (e.g. ~/pnpm-lock.yaml), then watches the entire home tree — which makes
    // the local dev preview slow, flaky, or hang on first request.
    root: process.cwd(),
  },
};

export default nextConfig;
