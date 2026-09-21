# Typography

## Fonts

| Role | Font | Source |
|---|---|---|
| Khmer text | Kantumruy Pro | Google Fonts (SIL OFL) |
| English/Latin text | Manrope | Google Fonts (SIL OFL) |

Both fonts are self-hosted (no Google Fonts CDN) to avoid third-party requests and enable aggressive subsetting.

## Delivery

- Format: **WOFF2 only** (no TTF/WOFF/EOT fallback needed).
- Type: **Variable fonts** — one file per family covers the full weight range.
- Subsetting:
  - Kantumruy Pro → Khmer + Latin subset.
  - Manrope → Latin + Latin Extended subset only.
- `font-display: swap` on all `@font-face` declarations.
- License: keep each family's `OFL.txt` alongside the font files in the repo.
- File location: `assets/fonts/kantumruy-pro/` and `assets/fonts/manrope/`.

## Weights

| Use case | Manrope (EN) | Kantumruy Pro (KM) |
|---|---|---|
| Display / Hero heading | 800 (ExtraBold) | 700 (Bold) |
| Section headings (h2/h3) | 700 (Bold) | 600 (SemiBold) |
| Subheadings / lead text | 600 (SemiBold) | 500 (Medium) |
| Body text | 400 (Regular) | 400 (Regular) |
| Muted/secondary text, captions | 400–500 | 400 |
| Buttons / CTA labels | 600–700 | 500–600 |
| Nav links | 500 | 400–500 |

Rationale: Khmer script reads better at a relatively lower weight than Latin for the same visual boldness, so Kantumruy Pro Bold (700) pairs with Manrope ExtraBold (800) at the hero level.

## Style

- **No italics.** Manrope ships no italic style at all. Kantumruy Pro has one italic cut, but only at weight 400 (not part of the variable `wght` axis) — not worth the extra file for a landing page. Use weight, accent color, or letter-spacing/uppercase for emphasis instead.

## Fallback stacks

- Khmer: `"Kantumruy Pro", "Khmer OS", sans-serif`
- Latin: `"Manrope", system-ui, sans-serif`

## Preloading

Preload only the weights used in the initial viewport/LCP element:
- Manrope 800 (hero) + Manrope 400 (body), or
- Kantumruy Pro 700 + 400 if Khmer is the primary language on load.

All other weights load on demand via normal `@font-face`.

## Open questions

None — resolved. Variable weight axis ranges and italic availability confirmed below.

## Files

Downloaded from the Google Fonts GitHub repo (`google/fonts`, `ofl/` — SIL OFL), subsetted with `fonttools`/`pyftsubset` to WOFF2:

| File | Weight axis | Size |
|---|---|---|
| `assets/fonts/manrope/manrope-variable.woff2` | 200–800 | ~28 KB |
| `assets/fonts/kantumruy-pro/kantumruy-pro-variable.woff2` | 100–700 | ~66 KB |

Each folder also contains the family's `OFL.txt` license. Subsets: Manrope = Latin + Latin Extended + general punctuation (U+0000-00FF, U+0100-017F, U+2000-206F). Kantumruy Pro = same Latin ranges + Khmer block (U+1780-17FF) + zero-width joiners (U+200C-200D) + dotted circle (U+25CC) for correct Khmer shaping.

## Status

Locked for landing page design phase — do not change without revisiting this spec.
