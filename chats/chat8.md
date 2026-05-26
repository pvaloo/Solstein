# Empty State Planning

_Started 2026-05-23 04:24 UTC_

---

## User

from roadmap, plan for empty states

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: write_file]_

I have enough context. The roadmap calls for 4 empty states (Home/Workspace, Project Page, Canvas, Sessions) using a "glyph + line + CTA" pattern. I'll write a planning doc in the same shape as `Auth Plan.html` — declaring the pattern, speccing each surface, and noting Tier-2 surfaces that'll inherit the same primitive later.

Stating the system up front:
- **Primitive**: `EmptyBlock` = mini-glyph (40px crystal facet) → 1px amber hairline (80px) → § eyebrow → single-line lede → one short helper sentence → primary CTA, optional secondary link. Centered, generous vertical padding, hairline-bordered surface.
- **Voice**: instrument-like, declarative; never apologetic. Each lede teaches the next action.
- **Variants** per surface: *initial* (never had data), *filtered* (search/sort yields nothing — Tier 3), *error* (load failed — already covered by 500).

_[tool: done]_

_[tool: fork_verifier_agent]_

Planning doc for the four Tier-1 empty states (Workspace · Project Page · Canvas · Sessions). Mirrors the shape of `Auth Plan.html`:

- **§00 Scope** — table of the four Tier-1 surfaces plus the Tier-2/3 surfaces that'll inherit the same primitive.
- **§01 The Pattern** — the `EmptyBlock` primitive (glyph · 80px amber rule · § eyebrow · verb-led lede · one-sentence helper · single primary CTA · optional secondary link), with a live anatomy preview and a numbered key.
- **§02 Surfaces** — per-surface spec card for each of the four, with a rendered preview using its own glyph (crystal / branch / node / device). Sessions deliberately breaks pattern (inline annotation, no CTA) because "only one device" is reassurance, not a problem.
- **§03 Variants** — initial vs. filtered vs. error vs. loading; Tier-1 ships *initial* only.
- **§04 Copy & Tone** — do/don't, voice rules tied to the brand system.
- **§05 Implementation** — one CSS block, one SVG sprite, four insertion points; ~½ day matches the roadmap estimate.
- **§Q Decisions** — 5 open questions (templates row? Canvas glyph choice? animation budget?).

Flagged one finding from reading Project Page: it already has `.empty-cta` CSS using non-Solstein tokens (`--accent`, `--surface`) — should be replaced with the shared primitive.

## User

1-no
2-we do not need ampty canvas users have to follow the jsonimport wizard
3no empty canvas
4 i dont want a sessions
5 no too much

## Assistant

_[tool: str_replace_edit]_

Tightening scope: just Workspace and Project Page (→ Import Wizard). Removing Canvas, Sessions, the tour link, and the templates row.

_[tool: str_replace_edit]_

Now strip the Canvas and Sessions surface cards and simplify the Project Page card to import-only.

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

Now I'll do the two edits separately — first update the Project Page card, then remove the Canvas and Sessions cards.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update §05 Implementation and the Decisions section to reflect the trimmed scope.

_[tool: str_replace_edit]_

_[tool: done]_

Trimmed:

- **Two surfaces only** — Workspace and Project Page. Canvas and Sessions explicitly noted as out of scope in §00.
- **Project Page** now single-CTA → **Open Wizard**. No blank-graph path.
- **Workspace** stays single-CTA (no tour link, no templates row).
- **§01 Motion** flipped to static — animation reserved for the topbar mark.
- **§05 Implementation** now says ~3h effort, 2 SVG glyphs, 2 surfaces.
- **§Q** rewritten as **Resolved** — 5 decisions captured as a table.

## User

ok build. when done update plan

## Assistant

_[tool: update_todos]_

_[tool: grep]_

_[tool: run_script]_

Now add the EmptyBlock CSS at the end of `solstein-app.css`:

_[tool: run_script]_

_[tool: str_replace_edit]_

Now wire up Home with a data-state tweak:

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: run_script]_

_[tool: read_file]_

_[tool: str_replace_edit]_

I'll add the full Tweaks apparatus to Project Page so it matches Home's pattern, plus the empty state markup:

_[tool: show_html]_

Let me verify both pages render correctly:

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: str_replace_edit]_

The button is wrapping. Let me fix the CSS:

_[tool: update_todos]_

Now update the plan to reflect Built:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: update_todos]_

_[tool: delete_file]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Built and wired.

- **`solstein-app.css`** — added `.empty-block` + `.empty-hero` primitive at end of file.
- **`Home.html`** — empty state markup + `data` tweak (full/empty) in the Tweaks panel.
- **`Project Page.html`** — empty state markup + `data` tweak. Picked up React/Babel + tweaks-panel.jsx to match Home's pattern.
- **`Empty States Plan.html`** — new § 00 Build Status block at the top (all rows green), § 05 Implementation rewritten in past tense, § Q already captured the trim.

Toggle the Tweaks panel → Data → empty on either page to review.

## User

remove the empty states plan

## Assistant

_[tool: grep]_

_[tool: delete_file]_

_[tool: str_replace_edit]_

Removed. The empty-state implementation itself (CSS + the two wired pages) stays.

## User

operator tool plan. Needed? if not delete

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: delete_file]_

Same pattern as the empty states plan — operator console is fully built (5 surfaces shipped). Deleting and cleaning references.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Deleted `Operator Tool Plan.html` and cleaned both references (the link on `Operator.html`, the entry in `review-strip.js` Planning dropdown). Operator console itself is untouched.

## User

what do you mea with: Empty / loading / error states	System-wide, not per-page.	Missing

## Assistant

That's a row in the Roadmap snapshot table (§00). What I meant:

- **Empty states** — every shipped page assumes data is present (Home has 1 mock project, Project Page has 1 graph, etc). There's no designed treatment for "container exists but holds nothing." → Now partially addressed: the EmptyBlock primitive exists in `solstein-app.css` and Workspace + Project Page are wired up.

- **Loading states** — no skeleton / shimmer / spinner pattern. When data is in flight (project list fetching, graph thumbnail rendering, member list resolving), there's nothing on screen. A real app needs a per-surface placeholder pattern.

- **Error states** — distinct from the 404 / 500 / Offline full-page errors that are built. These are *inline* errors: a graph thumbnail failed to render, a member row failed to load, the comments sidebar 500s while the rest of the page is fine. No banner / inline-error / retry pattern exists.

**"System-wide, not per-page"** = the gap isn't "one page is missing its empty state," it's that the *pattern itself* doesn't exist as a reusable primitive. Once defined once, every surface inherits it (the way we just did with EmptyBlock).

Roadmap status now: **empty** → partial (2 of N surfaces done, primitive exists); **loading** + **error** → still missing. Want me to plan those next?

## User

I see, do the empty states yes. Plan first

## Assistant

_[tool: grep]_

Let me survey what's actually on the project to scope the plan properly.

_[tool: grep]_

_[tool: grep]_

_[tool: write_file]_

Surveyed. Three more surfaces in current product would benefit:

- **Project Members** — Project Page → Members tab, when the project still has only the owner. Common on every fresh project.
- **Operator Invitations** — when no invites are pending. Common on a fresh tenant.
- **Filter-empty variant** — Operator Users and Operator Audit already show inline "No X match the current filter" inside `<td colspan>`. Reuse the EmptyBlock primitive (smaller, no big glyph) as a proper *filtered* state — different from *initial*.

Writing the plan now.

_[tool: done]_

Plan written. Scope:

**Initial empties (3 new):**
- **Project Members** — when only the owner is on a project. Replaces the members card, CTA opens existing invite drawer.
- **Operator Invitations** — when no invites are pending. Healthy empty (status-as-lede allowed: "No pending invitations").

**Filter-empty variant (new primitive `.empty-inline`):**
- Smaller (24px glyph in text-3 not amber), no eyebrow, "Clear filters" amber **link** not button.
- Applied to **Operator Users** and **Operator Audit** (replacing their current `<td colspan>` strings).
- Dynamic helper sentence echoes active filters.

**Explicitly skipped/deferred:** Canvas blank, Sessions, Workspace filtered (no filter UI yet), Comments/Notifications/Search (Tier 2 features).

3 decisions to confirm: (1) replace vs annotate Members, (2) granular vs simple filter helper, (3) Audit "Widen to 24h" secondary link. My recommendations lean replace / rich / include.

## User

ok just go

## Assistant

_[tool: update_todos]_

_[tool: run_script]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: show_html]_

Let me verify all four pages render:

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: view_image]_

_[tool: eval_js]_

_[tool: update_todos]_

Live layout shows correct 16px gap between buttons — the screenshot tool's html-to-image rendering just doesn't handle flex `gap` on `inline-flex` perfectly. Real browsers render it fine.Now update the plan to mark Built:

_[tool: str_replace_edit]_

_[tool: delete_file]_

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Built all four:

- **Project Page → Members** — owner-only state replaces the members card with the "Invite your team" EmptyBlock; CTA fires the existing invite modal. Toggle via Tweaks → Members.
- **Operator Invitations** — table swaps to "All Clear / No pending invitations" when filtered rows == 0; dynamic eyebrow/lede for pending vs. other tabs.
- **Operator Users · filter-empty** — replaced the `<td colspan>` with the new `.empty-inline` block. Helper echoes active filters; "Clear filters" link resets state.
- **Operator Audit · filter-empty** — same primitive, plus a muted "Widen to last 7 days" secondary link that steps h1 → h24 → d7 → d30.

New CSS: `.empty-inline` in `solstein-app.css` (smaller glyph, neutral, amber link CTA, optional `is-muted` variant for secondary link).

Plan updated with Build Status table and Decisions-Resolved section.

## User

Verifier agent check completed

## Assistant

All four empty states verified clean. Done.

