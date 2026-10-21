# Cascade — Dan Swart Portfolio

Portfolio site for Dan Swart, built with Next.js 16, React 19, Tailwind CSS 4, and shadcn/ui.

## Live site

Deployed automatically to GitHub Pages via GitHub Actions:
**https://cascadeplace.github.io/cascade/**

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds a
static export (`GITHUB_PAGES=true npm run build`) and publishes the `out/`
directory to GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

The site is served at the root (`/`) locally; the `/cascade` base path is only
applied in the GitHub Pages build (see `next.config.ts` and `lib/base-path.ts`).
