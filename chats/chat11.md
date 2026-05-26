# Quality Assurance Plan

_Started 2026-05-24 15:32 UTC_

---

## User

So what's next. NO new features, just making sure that what we hve works as we need ahead of handover to dev. Plan only

## Assistant

_[tool: list_files]_

# Pre-handover QA plan

The product surface area is locked — 30+ HTML pages across app, operator, and auth, plus the Solstein design system. Goal of this pass: prove that what exists is internally consistent, fully specified, and ready for a developer to implement without guessing.

## 1. Design system audit (Solstein System.html as source of truth)
- Verify every token used in the app maps to a named variable in `solstein-tokens.css`. Find one-off hex codes, ad-hoc px values, and ad-hoc radii.
- Confirm component coverage: every recurring UI element in the app (buttons, inputs, cards, badges, tabs, toasts, dropdowns, modals, empty states) is documented with all states (default, hover, focus, active, disabled, loading, error).
- Density / spacing scale — confirm one scale is used, not two.
- Type scale — confirm every text style in screens resolves to a documented role.

## 2. Cross-screen consistency sweep
- Walk every screen in one sitting and flag drift: button heights, input heights, card padding, table row heights, header pattern, sidebar pattern, page-title pattern, breadcrumb pattern.
- Confirm the same component is used the same way everywhere (e.g. dropdowns from `solstein-dropdown.js` not re-implemented inline).
- Confirm app chrome (Home, Project Page, Canvas, Profile, etc.) and operator chrome (Operator Dashboard, Users, Invitations) each have a single canonical shell.

## 3. State coverage per screen
For each screen, confirm:
- Empty state (covered by `Empty States Round 2.html` — verify each one is actually wired into the screen it belongs to)
- Loading / skeleton state
- Error state
- Permission-denied / role-gated state (cross-ref `Roles & Permissions.html`)
- Long-content overflow (long names, long lists, truncation rules)
- Mobile / narrow viewport behavior — decide responsive scope and document it, even if "desktop only at launch"

## 4. Flow completeness
- Auth flow end-to-end: Sign In → Verify Email → Home; Forgot Password → Reset Password → Sign In; Accept Invite → Home; Signed Out → Sign In. Confirm every link target exists and every error path has a screen.
- Project lifecycle: New Project → Project Page → Canvas → (archive/delete?). Cross-ref `Project Lifecycle Plan.html` and confirm every state in that plan has a screen or is explicitly out of scope.
- Operator flow: Operator Sign In → Operator Dashboard → Users / Invitations. Confirm parity with `Roles & Permissions.html`.
- Import Wizard: every step + every error + cancel/back behavior.

## 5. Copy & microcopy pass
- Button labels, empty-state copy, error messages, toast text, email subject lines (in `Emails.html`) — one voice, one tense, one capitalization rule.
- Legal pages (`Privacy.html`, `Terms.html`) — confirm they're real content vs. placeholder, or flagged as "legal to provide before launch."
- Every "Lorem"-style placeholder hunted down.

## 6. Interactive correctness (no new behavior, just verify existing)
- All `<a href>` and button click handlers point at the right page or open the right modal.
- Toasts (`solstein-toast.js`) fire on the right actions consistently.
- Dropdown menus close on outside click, keyboard nav works.
- Forms have visible focus rings, tab order makes sense, error placement is consistent.
- Canvas page (your most complex screen) — re-walk every interaction shown and confirm it matches `Canvas Export Plan.html`.

## 7. Accessibility quick pass
- Color contrast on text and on interactive states meets AA.
- Every input has a label. Every icon-only button has an accessible name.
- Focus is visible everywhere, never `outline: none` without a replacement.

## 8. Developer handover artifacts
- A short README listing: which file is the source of truth for tokens, components, copy; which screens are "final" vs. "needs review"; known open questions.
- A route map: filename → intended URL → who can access (role gating).
- An asset inventory: any images, icons, fonts referenced — confirm they're in the project, licensed, and at the right resolutions.
- Confirm `Product Roadmap.html` reflects what's actually shipping vs. later.

## Suggested order
1. Design system audit (1) — everything else references it
2. Cross-screen consistency (2) + state coverage (3) — biggest source of dev questions
3. Flow completeness (4) — catches missing screens
4. Copy (5), interactions (6), a11y (7) — polish
5. Handover docs (8) — last, once everything else is settled

Want me to start with the design system audit, or jump to the cross-screen consistency sweep? Either produces a written punch list as the output — no design changes yet.

## User

Yes to all except the handover doc, well do this later

## Assistant

_[tool: update_todos]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: done]_

**Punch list delivered** → `Pre-Handover Punch List.html`

**36 items across 10 sections.** Top of the stack:

- **5 Critical** — pick "Flo" or "Solstein" once and for all (01.01); strip the dead-link static review-strip from every page (02.01); make Canvas reference token CSS vars instead of hardcoded hexes (03.01); fix the Sign-In password field that ships with twelve literal bullet characters as its value (08.01); plus the Canvas dev toggle (08.02).
- **14 Warn** — mostly "pick one" calls: user-chip behaviour across pages, Operator Dashboard placeholder, deletion redirect, loading/error states, responsive scope, Privacy/Terms legal status.
- **11 Info + 6 Nit** — clean-up that can wait until the dev start.

Each item has a tag, a location pointer, and a recommended action.

Want me to walk you through any section, or start fixing the Criticals now?

## User

Adress all findings, decide on the best path forward where a deicison i needed. If you're not suire of the decision yourself, skip and ask me

## Assistant

_[tool: update_todos]_

_[tool: grep]_

_[tool: list_files]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

Let me get the lay of the land for what needs precision changes, then execute the bulk.

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

Now I'll execute the work in batches. Brand rename + review-strip stripping + curly apostrophes via one bulk script, then targeted file edits for the rest.

_[tool: grep]_

_[tool: run_script]_

Now I have the picture. Executing in waves:

**Wave 1**: Bulk script — strip static review-strip + auth-strip from all HTML, rename brand text (user-visible only), fix curly apostrophes.

_[tool: run_script]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

Now handle `Roles & Permissions.html` separately (script sandbox forbids `&`), then do the targeted CSS + page edits.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: delete_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: run_script]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now I'll update the punch list itself to flip resolved items to "done" so it serves as a status doc going forward.

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: grep]_

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: questions_v2]_

I've executed everything I could decide myself — 18 items resolved, including all 5 Criticals, the user-chip dropdown consistency, the Canvas token redefinition, the Operator pills, the button height alignment, and the Sign-In password bug. The punch list is updated with status pills so you can scan it.

What's left needs your call. Asking only the questions that genuinely need a decision:

## User

Questions answered:
- legal_entity: Eevrything is Solstein. Solstein everywhere and only
- mobile_scope: Responsive for Home + Project + Auth; Canvas + Wizard desktop-only
- loading_states: Server-render — no loading state visible
- error_states: Toast (transient, doesn't block UI)
- light_theme: Remove — dark only for v1
- operator_dashboard: Ship a minimal landing — counter strip + recent invites preview (already styled)
- project_delete_dest: Home, with a toast 'Project deleted'
- wizard_cancel: Discard silently — wizard restarts from step 1
- transfer_ownership_accept: Immediate — recipient is owner the moment current owner clicks Transfer
- legal_status: Lorem-style placeholder — replace before launch

## Assistant

_[tool: set_project_title]_

_[tool: run_script]_

_[tool: str_replace_edit]_

Big flip — reverting all the "Flo" branding. Let me execute the revert, then do the rest of the answered items.

_[tool: set_project_title]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: done]_

_[tool: fork_verifier_agent]_

All findings closed.

**Pass 3 outcome — 31 of 45 done, 14 deliberately deferred, 0 awaiting.**

The big move: full revert to **Solstein** everywhere user-visible, including the brand-system page, operator chrome, copy in Privacy/Terms/Roles, footers, emails. Internal asset names (`solstein-*.css`, `--sol-*` tokens, CSS class names) stay as they were.

**Built / fixed from your answers:**
- Operator Dashboard — counters strip + recent invitations + recent activity using existing operator styles
- Project delete → redirect to Home with a flash toast on arrival (sessionStorage handoff)
- Light theme — removed entirely (CSS, boot script, tweak control)
- Privacy + Terms — placeholder copy banner added
- Responsive — added `@media (max-width: 768/540/720)` rules to `solstein-app.css`, `solstein-auth.css`, and Project Page's members card so Home + Project + Auth degrade cleanly on mobile; Canvas + Wizard left desktop-only as requested
- Wizard cancel + Transfer ownership → already match the answers; no code change needed
- Loading / error patterns → no work needed (SSR + existing solToast)
- Member-row aria-labels on Project Page

**Deferred (14)** — informational notes, deployment-time decisions (filename casing), or final-handover steps (strip Tweaks panels, strip review chrome). All visible as "Deferred" pills in the punch list.

**Open:**
- `Flo` is still the project title in the org picker (system kept the original name on rename attempt). User-facing chrome is all Solstein.
- Solstein System.html body content reverted but worth a once-over from you — it's the one doc where the brand IS the subject.

Ready when you want to write the handover doc.

## User

Recheck all Flo is gone from project everywhere. 

Go over each defered or note only and which ones to address. Bias towards address. Only leave if very good reason.

## User

Several edits needed on the Add Node modal from the canvas:

On the add node model in edit mode on canvas, it does not align well at the top, it overlays with.


On the add node model in edit mode on canvas, the scroll bars are not styled.

On the add node model in edit mode on canvas, the dropdown has two New type in there an one called new. I don't see those active on the settings menu. 

On the add node model in edit mode on canvas, once onto connectios,this looks really messed up not working at all.

## User

Several edits needed on the Add Node modal from the canvas:

On the add node model in edit mode on canvas, it does not align well at the top, it overlays with.


On the add node model in edit mode on canvas, the scroll bars are not styled.

On the add node model in edit mode on canvas, the dropdown has two New type in there an one called new. I don't see those active on the settings menu. 

On the add node model in edit mode on canvas, once onto connectios,this looks really messed up not working at all.

## Assistant

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: show_html]_

_[tool: read_file]_

_[tool: grep]_

Let me actually view this modal in action to see the issues.

_[tool: show_html]_

_[tool: sleep]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: snip]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: grep]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: save_screenshot]_

_[tool: multi_screenshot]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: read_file]_

_[tool: str_replace_edit]_

I have enough from code reading. Let me fix all four issues:

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: grep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: get_webview_logs]_

_[tool: done]_

Code changes complete. Let me confirm the page loads cleanly and hand off.

_[tool: fork_verifier_agent]_

Four fixes shipped on the Add Node modal:

1. **Top alignment** — overlay now anchors content to the top with `padding-top: 64px` so the modal sits cleanly below the topbar. Overlay scrolls if modal exceeds viewport (no internal body scroll, which was the second problem behind issue 4).

2. **Scrollbars styled** — `.add-node-overlay` and `.anm-picker-list` now use thin tracks with semi-transparent thumbs that brighten on hover. Matches the rest of the canvas surface.

3. **"New type" / "new" duplicates** — two-part fix:
   - Modal now pulls `nodeTypes` and `categories` from the React state (props from app → canvas → modal) instead of calling `window.NodeTypes.loadNodeTypes()` directly. Single source of truth with the Settings page.
   - A filter drops entries with placeholder labels (`new type`, `new`, blank) when they have zero node-usage. Those are leftovers from clicking "+ Add type" in Settings without renaming. They'll still appear in Settings (where you can properly delete them) but they no longer clutter the picker.

4. **Connections step messed up** — restructured each connection into a vertically-stacked card:
   - Row 1: Connected node (full width)
   - Row 2: Direction toggle + Type dropdown (side by side)
   - Row 3: Label (full width, optional)
   - Remove button absolutely positioned in the corner
   
   Removed `overflow-y: auto` from `.anm-body` (a key fix — dropdown popups were getting clipped by the modal body's scroll container). Bumped modal width to 720px to give the columns room.

Verifier forked to confirm rendering. No console errors.

## User

Settings when on the canvas: 

- Build out the edge types page from the menu. Similar to node type|

- Rmeove the Project Details and Display defaults from the menu

- Build for the Structure on Views. This should import whatever we defined at the wizard. Then allow for views to be edited or added or removed. 

- Same for lenses. 

- On scenarios add a placeholder text it will come.

## Assistant

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

## User

Apply comment

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

The dropdown's CSS lives in `solstein-app.css`, which the canvas doesn't load — so it's rendering raw `<ul>` items below the trigger. Replacing it with an inline picker that matches the rest of the modal:

_[tool: snip]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

The connection-row "Type" field was rendering as a raw `<ul>` list because the `.sol-dropdown` CSS lives in `solstein-app.css` — which the canvas doesn't load. (Tokens come from `solstein-tokens.css`, but the dropdown layout/visibility rules are bundled with the app shell stylesheet that only home/project/etc. pull in.)

Swapped it for a small `EdgeTypePicker` that uses the modal's existing `.anm-picker-*` styles — same look as the Connected-node and (step 1) Type pickers, with a proper popover instead of an inline list.

