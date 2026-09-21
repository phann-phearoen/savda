# Savda / សាវតា

A discovery platform for Cambodian-made products, creators, and the stories behind them. Shopping is secondary — discovery comes first. See [docs/platform-concept.md](docs/platform-concept.md) and [docs/lp-concept.md](docs/lp-concept.md) for the full concept.

This repo is a monorepo for the whole Savda platform: the landing page, Savda Shop, and the backend.

## Structure

```
apps/
  landing/          vanilla HTML/CSS/JS landing page — served at "/"
  shop/              Next.js (React) e-commerce app — served at "/shop/*" (not yet built)
  backend/           API/services — framework TBD (not yet built)
packages/
  tokens/            shared design tokens (colors, spacing, breakpoints, fonts)
assets/              shared brand assets: logos, favicons, self-hosted fonts
docs/                decision docs (see below)
```

## Getting started

Requires Node.js and pnpm (`corepack enable pnpm` if pnpm isn't installed).

```sh
pnpm install
pnpm --filter landing dev      # start the landing page dev server
pnpm --filter landing build    # build the landing page (generates en/km locale pages)
```

## Landing page

- Vanilla JS, built with Vite in multi-page mode — no framework runtime shipped.
- Bilingual: `/en/` and `/km/`, generated at build time from `apps/landing/content/{en,km}.json` via `apps/landing/scripts/build-locales.mjs`. The root `/` detects browser language and redirects, persisting the choice in a `savda_locale` cookie.
- Fonts (Kantumruy Pro, Manrope) are self-hosted as subsetted variable WOFF2 files under `assets/fonts/` — no Google Fonts CDN requests.
- `/shop/` currently serves a static coming-soon placeholder until the real Shop app is built.

## Decision docs

| Doc | Covers |
|---|---|
| [docs/platform-concept.md](docs/platform-concept.md) | What Savda is and why |
| [docs/lp-concept.md](docs/lp-concept.md) | Landing page narrative/structure |
| [docs/color-palette.md](docs/color-palette.md) | Brand colors |
| [docs/typography.md](docs/typography.md) | Fonts, weights, self-hosting |
| [docs/layout-spacing.md](docs/layout-spacing.md) | Spacing scale, breakpoints, containers |
| [docs/i18n.md](docs/i18n.md) | Bilingual routing/content strategy |
| [docs/tech-stack.md](docs/tech-stack.md) | Monorepo architecture, hosting |

## Status

Landing page: built with placeholder copy/imagery and placeholder social links, pending real content. Shop and backend: not yet started.
