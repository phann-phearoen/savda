# Layout & Spacing Scale

## Spacing scale

Base unit: **8px**, with a 4px half-step for fine adjustments.

| Token | Value |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-24` | 96px |
| `space-32` | 128px |

Use `space-1`/`space-3` only for fine-tuning (icon gaps, inline spacing); prefer the 8px-based steps for layout/section spacing.

## Breakpoints

| Token | Min width | Target |
|---|---|---|
| `bp-sm` | 640px | Large phones (landscape) |
| `bp-md` | 768px | Tablets |
| `bp-lg` | 1024px | Small laptops |
| `bp-xl` | 1280px | Desktops |
| `bp-2xl` | 1536px | Wide/large monitors |

Mobile-first: base styles target the smallest viewport, breakpoints add/override upward via `min-width` media queries.

## Containers

| Token | Max width | Notes |
|---|---|---|
| `container-content` | 1200px | Standard section content (text, feed grid) |
| `container-wide` | 1440px | Full-bleed editorial/image sections that still need a soft cap |
| Gutter | `space-4` (16px) mobile → `space-8` (32px) at `bp-lg`+ | Horizontal page padding |

## Status

Locked for landing page build phase.
