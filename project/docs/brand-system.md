# Solstein — Brand System

> Originally lived at `plan-brand-system.html`. Captured here as the engineering-handover reference. The runtime contract is `solstein-tokens.css` — every variable below maps 1:1.

**Version:** v1 (internal)
**Status:** Source of truth for visual + verbal system

---

## § 01 — The Instrument

Solstein is a cinematic operational and data architecture intelligence tool. The name comes from the Viking sunstone — a calcite crystal used to find direction when cloud cover hid the sun. Light passed through a clear instrument reveals what was already there. Nothing decorative, nothing invented.

| | |
|---|---|
| **Personality** | Clear. Precise. Cinematic. Credible. Calm. The instrument in the room everyone trusts — confident without being loud, technical without being cold. |
| **Promise** | Show how an organisation actually works. Reveal hidden complexity that conventional diagrams cannot. Help an intelligent professional take a true reading of a system. |
| **Family** | Belongs to Nile's world of navigation and wayfinding. The bridge is conceptual, not visual — shared restraint, shared vocabulary, shared evidence-led posture. |

---

## § 02 — The Mark

An octagonal Iceland-spar crystal drawn in fine line work. Inner refraction outline, central point representing the located sun, faint cross axis. Paired with the **SOLSTEIN** wordmark in Barlow Condensed Medium, uppercase, 0.18em tracking.

### Colour variants

- **On Surface** (`#16191F`) — primary in-product context
- **On Crystal Black** (`#0A0C0F`) — deepest ground
- **On Paper** (`#F4F2EE`) — documents and exports only

### Sizing

Mark scales from **72 px down to 20 px**. Minimum lockup width is **120 px** — below that, use the mark alone.

### Clear space

Clear space on all sides equals the height of the crystal mark. Nothing — text, edge, neighbouring element — encroaches into this margin.

### Do / Don't

| ✓ Do | ✗ Don't |
|---|---|
| Mark in Sunstone Amber on dark grounds, Ink on Paper. Keep strokes thin. Lockup at ≥120 px, mark alone below. | Fill the crystal solid, gradient-fill, thicken strokes, re-set wordmark in a different face, add a tagline inside the lockup, or place lockup on busy imagery. |

---

## § 03 — Colour

Dark foundation, single warm accent. The discipline is the point. **Sunstone Amber** works as line, glow, and small mark only — never as a large fill.

### Core foundation

| Token | Hex | Role |
|---|---|---|
| `--sol-bg` Deep Navigation | `#0F1115` | Primary background. Default ground for every Solstein surface. |
| `--sol-ground` Crystal Black | `#0A0C0F` | Deepest ground. Canvas and inset panels. |
| `--sol-surface` Surface | `#16191F` | Raised panels, cards, inspector backgrounds. |
| `--sol-accent` Sunstone Amber | `#E8C97A` | The single brand accent. Line, glow, small mark only. |

### Neutrals on dark

| Token | Value | Contrast | Role |
|---|---|---|---|
| `--sol-text` Bone | `#F0EDE8` | 16.4 : 1 | Read-critical text. Headings, body, labels. |
| `--sol-text-2` Mist | `F0EDE8 @ 55%` | 9.0 : 1 | Supporting copy. Lede paragraphs, descriptions. |
| `--sol-text-3` Faint | `F0EDE8 @ 30%` | 4.9 : 1 | Captions, meta. AA at 11 px+. |
| `--sol-hairline` | `rgba(255,255,255,0.07)` | — | 1 px dividers. |

### Light pair · documents & exports only

| Token | Hex | Role |
|---|---|---|
| `--sol-paper` | `#F4F2EE` | Light background — documents, exports, print. |
| `--sol-ink` | `#1A1C1F` | Text and marks on Paper. Pair only with Paper. |

### Semantic canvas palette

Six muted colours carry meaning inside the canvas. Each is paired with a **non-colour differentiator** (line treatment or glyph) so the canvas stays legible without colour and to users with colour-vision differences.

| Meaning | Hex | Pattern |
|---|---|---|
| PII / Sensitive | `#9B8FC4` Violet | Dotted outline |
| Manual / Friction | `#D8A24A` Amber | Dashed outline |
| Risk | `#C66B5E` Muted Red | Double outline |
| Systems / Integration | `#6B8CB0` Steel Blue | Solid outline |
| Validated / Healthy | `#7FA67F` Sage | Check glyph |
| Unknown / Low confidence | `#6E7178` Grey | Query glyph |

---

## § 04 — Typography

**Two voices, both Barlow.** No third typeface. System fonts and SaaS defaults are never used.

- **Barlow Condensed** → display, structural, uppercase (wordmark, headings, labels, button text)
- **Barlow** → everything read at length (paragraphs, descriptions, captions)

| Role | Family / Weight | Size · Tracking · Notes |
|---|---|---|
| Display | Barlow Condensed · 500 | 56 px · 0.12em · uppercase |
| H1 | Barlow Condensed · 500 | 36 px · 0.12em · uppercase |
| H2 | Barlow Condensed · 500 | 24 px · 0.06em · uppercase |
| Eyebrow | Barlow Condensed · 500 | 11 px · 0.25em · uppercase · Amber 55% |
| Body · Regular | Barlow · 400 | 16 px · line-height 1.7 |
| Body · Light | Barlow · 300 | 16 px · line-height 1.7 — lede & long-form context |
| Caption | Barlow · 300 | 11 px |

---

## § 05 — Form & Space

**Hairlines. Square corners. Air.**

- **Radius:** 2 px. Not rounded. Not pill-shaped.
- **Borders:** single hairline rule, `rgba(255,255,255,0.07)`.
- **Nesting:** boxes are not nested inside boxes.
- **Negative space:** mandatory. The brand reads as calm because it is not crowded.

### Spacing scale

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`

### Buttons

- Primary action carries an **amber dot + amber hairline border**.
- Default: hairline-strong border, no fill.
- Ghost: hairline border, secondary text colour.
- **No filled amber buttons.**

---

## § 06 — Motion

**Calm, deliberate, meaningful.**

- Functional transitions: **0.3 s** with a single ease curve.
- Fast transitions: **150 ms**.
- The crystal mark carries a single ambient idle — the inner refraction polygon rotates over **120 s**; the central glow breathes over **8 s**. Reads as lighting, not motion.
- On page load: **one orchestrated staggered reveal**, not many scattered micro-animations.
- Everything stops under `prefers-reduced-motion`.

---

## § 07 — Iconography

**Fine line, matching the mark.**

- 1.25 px stroke at 32 px size.
- Round line caps and joins.
- No filled icons. No duotone. No rounded cartoon style. No emoji.
- Build from primitives — line, circle, arc, polygon.

Standard glyphs: Horizon · Bearing · Signal · Reading · Node · Link.

---

## § 08 — Voice

**Plain, evidence-led, warm.** Short, declarative sentences. The reader is an intelligent professional. The product reveals difficult truths about how organisations work, so the voice is honest and precise — never hyped, never salesy.

### Examples

**✓ Do**
> "See how the business actually works. Solstein reads your operational architecture and shows it back to you, accurate to the system, not to the org chart."

> "Eighteen nodes are unevidenced. Take a reading on these before you trust the map."

> "That route through claims is manual. Three handoffs, no system of record. It's where time goes."

**✗ Don't**
> "Unlock powerful operational insights with our next-gen AI-native intelligence platform! Transform your business today."

> "⚠️ Warning! 18 critical issues detected — act now to avoid catastrophic data loss!!!"

> "Leverage cutting-edge intelligence to streamline your claims journey and accelerate digital transformation."

### Navigation vocabulary

`Bearing · Reading · Signal · Horizon · True reading · See through the fog · Steer · The path · Cut through`

Use where they fit naturally. Don't force them. **Never lean on Viking imagery** — no longships, runes, axes, helmets.

---

## § 09 — Accessibility

A brand principle, not polish. Inherited directly from Nile.

- Every surface meets **WCAG AA contrast**.
- **Meaning is never carried by colour alone** — shape, label, icon, or pattern must back it up.
- Interactive elements have visible focus states: **1 px Sunstone outline, 2 px offset**, applied globally via `*:focus-visible` in tokens.
- Motion respects `prefers-reduced-motion`.

### Contrast on Deep Navigation

| Foreground | Ratio | Pass |
|---|---|---|
| Bone (`#F0EDE8`) — primary text | 16.4 : 1 | AAA |
| Mist (`F0EDE8 @ 55%`) — secondary text | 9.0 : 1 | AAA |
| Faint (`F0EDE8 @ 30%`) — captions @ 11 px+ | 4.9 : 1 | AA |
| Sunstone Amber (`#E8C97A`) — small text | 12.4 : 1 | AAA |

---

## § 10 — Quick Reference (engineering)

Every page links `solstein-tokens.css`. Variables below are the contract. Page-specific styles compose with `var(--sol-*)` — **never hardcoded values**.

```css
/* Foundations */
--sol-bg:         #0F1115;   /* primary background       */
--sol-ground:     #0A0C0F;   /* deepest panels, canvas   */
--sol-surface:    #16191F;   /* raised panels, cards     */

/* Accent */
--sol-accent:     #E8C97A;   /* line / glow / small mark */

/* Text */
--sol-text:       #F0EDE8;
--sol-text-2:     rgba(240,237,232,0.55);
--sol-text-3:     rgba(240,237,232,0.30);
--sol-hairline:   rgba(255,255,255,0.07);

/* Light pair — documents & exports */
--sol-paper:      #F4F2EE;
--sol-ink:        #1A1C1F;

/* Type */
--font-display:   'Barlow Condensed', sans-serif;
--font-body:      'Barlow', sans-serif;

/* Form & motion */
--radius:         2px;
--transition:     0.3s ease;
```

---

*The Nile relationship described in this document is inferred from public material and remains subject to confirmation against Nile's official guidelines. Solstein's neutral foundations, typography, and lockup conventions may flex once those are available — its dark, instrument-like character is held intact.*
