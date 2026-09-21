# Tech Stack

## Scope

This repo is a monorepo for the entire Savda platform:
- **Landing page** — served at `/`
- **Savda Shop** — e-commerce web app, served at `/shop/*`
- **Backend** — API/services, framework TBD

## Repo structure

```
savda/
├── apps/
│   ├── landing/            # vanilla HTML/CSS/JS — served at "/"
│   ├── shop/                # Next.js (React) — served at "/shop/*"
│   └── backend/             # placeholder — framework TBD
├── packages/
│   ├── tokens/               # shared design tokens: colors, typography, spacing
│   │                          # source of truth = docs/color-palette.md, docs/typography.md
│   └── config/                # shared eslint/prettier/tsconfig (added when needed)
├── assets/                  # shared brand assets (fonts, logos, favicons)
├── docs/                    # decision docs
├── pnpm-workspace.yaml
└── package.json
```

## Decisions

| Concern | Decision | Why |
|---|---|---|
| Workspace tool | pnpm workspaces | Efficient dedupe across `apps/*` + `packages/*`; add Turborepo later once backend build times matter |
| Landing | Vite, multi-page app mode, no framework | Pure static HTML/CSS/JS output (vanilla requirement) while sharing the same dev toolchain family as Shop, without shipping a React runtime |
| Shop framework | **Next.js (React)** | SEO/SSR needed for indexable, shareable product pages — confirmed requirement |
| Shared design tokens | `packages/tokens` — CSS custom properties (consumed by landing) + JS/TS object (consumed by Shop) | Single source of truth instead of duplicating palette/type values by hand |
| Shared brand assets | `assets/` stays at repo root; both apps reference it at build time (copy step for landing, import/alias for Shop) rather than duplicating | Avoids drift between apps' fonts/logos |
| Backend contract | Shop talks to backend only through a thin `packages/api-client` (typed fetch wrapper) | Keeps Shop decoupled from backend framework choice, made later |
| Routing (landing vs shop) | Nginx reverse proxy on a single Ubuntu VPS (any rental server provider): `location /` serves the landing static build directly; `location /shop/` proxies to the Next.js Node process (Next configured with `basePath: '/shop'`); `location /api/` reserved for the backend once decided | Both apps live under one domain with no visible hand-off; Next.js SSR requires a running Node process, so it's proxied rather than served as static files |
| Shop process management | Next.js runs as a persistent Node process (pm2 or systemd) behind Nginx, not serverless | Matches VPS/Nginx hosting model (no platform-managed functions) |
| Language strategy | Full i18n with locale-prefixed routes (`/en/`, `/km/`), default locale auto-detected from browser/device language on first visit, persisted via cookie after that | SEO needs each language indexable separately; see `docs/i18n.md` |
| Language | Plain JS for landing; TypeScript for Shop + backend | Landing has no complex state/logic to justify TS; Shop's cart/checkout logic benefits from types |

## Status

Locked for platform build phase — Shop confirmed as Next.js due to SEO requirement, hosting confirmed as Nginx on a single Ubuntu VPS (any rental server provider, not tied to a specific cloud vendor). Backend framework remains open, decided separately.
