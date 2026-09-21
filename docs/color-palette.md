# Color Palette

Derived from `assets/logo.svg` and `assets/og-image.png` (deep forest green mark on cream negative space).

## Tokens

| Token | Hex | Role |
|---|---|---|
| `color-brand` | `#293A2E` | Primary brand green — logo color, header/footer bg, primary buttons |
| `color-brand-dark` | `#1E2B22` | Darker green — hero/dark section backgrounds, hover state for brand buttons |
| `color-bg` | `#F5F2EC` | Default light-mode page background |
| `color-text` | `#1B2420` | Body text on light backgrounds |
| `color-text-inverse` | `#EFEBE4` | Text on dark/green backgrounds (matches logo negative space) |
| `color-accent` | `#C9A15A` | Primary accent — CTAs, links, highlights |
| `color-accent-secondary` | `#B5654A` | Secondary accent — tags, badges, optional secondary CTA |
| `color-border` | `#A9B7A9` | Dividers, borders, disabled/muted states |

## Usage guidelines

- **Brand green (`#293A2E`)** is the anchor color — use for the primary UI surfaces (nav, footer) and primary CTA fills.
- **Cream (`#F5F2EC`)** is the default page background; avoid pure white to keep the warm, editorial tone.
- **Accent gold (`#C9A15A`)** is reserved for calls to action and interactive highlights — use sparingly so it stays effective.
- **Terracotta (`#B5654A`)** is optional, for secondary emphasis (tags/labels) only — do not use alongside gold in the same component.
- Avoid introducing saturated blues/purples ("tech" palette) — it conflicts with the earthy, cultural brand identity.
- Maintain WCAG AA contrast: `color-text` on `color-bg`, and `color-text-inverse` on `color-brand`/`color-brand-dark`, both pass comfortably; verify any new pairing before shipping.

## Status

Locked for landing page design phase — do not change without revisiting brand assets.
