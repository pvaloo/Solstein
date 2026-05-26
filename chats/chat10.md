# Project Lifecycle Management

_Started 2026-05-23 17:42 UTC_

---

## User

- Plan for Project Lifecycle from product roadmap. Minimal viable functionaliy ehre. 


Can create, can't archive or delete
New Project → Project Page is one-way. Need rename, archive (soft-hide from Home), delete (with confirmation), and duplicate. Lives in a Project Settings drawer or page reached from the topbar "Settings" button on Project Page.

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: write_file]_

Now I have enough context. Existing Settings modal already has §05 Lifecycle (Archive + Delete rows) — so this plan needs to define the minimal viable behavior for all four actions (rename, archive, delete, duplicate), the confirmation pattern, and the Home-side archived state. I'll match the Canvas Export Plan style.

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Drafted **Project Lifecycle Plan.html** — a minimal-viable plan covering the four actions from the roadmap. Highlights:

- **One entry point** — everything lives in the existing Settings modal on Project Page; no new drawer, no card-level kebab.
- **Three states, two transitions** — Active / Archived / Deleted. No Trash UI (deferred to Tier 3).
- **Action specs** — rename (inline), duplicate (one-click + toast w/ Open), archive (one-click + Undo toast), delete (type-name confirm).
- **Mocks inline** — delete confirmation modal, Home tab strip (Active / Archived), archived card variant, all four toast payloads.
- **Permissions matrix** — owner-gated except Duplicate (editors can fork into their own copy).
- **Scope table** — what we add vs. what we're explicitly cutting and why.
- **§ 09 Decisions still needed** — four open questions to close before build (soft-delete? naming collision? non-owner archived access? share-link behavior).

Linked into the review strip from the Roadmap page.

## User

1. ok
2. copy of. Also editors can duplicate, only owners.
3. archived only for owners visible
4. break

Go. Summarize on completion and update the plan doc

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Updates applied across the doc:

- **§ 01.2 Duplicate** — naming now `Copy of {original}` with `(2)`, `(3)` on collision. Owner-only; the "editors can fork" carve-out is gone.
- **§ 01.3 Archive** — new *Side effects* row: archived projects are owner-only, editors/viewers lose access immediately, public share links break (return link-expired). Unarchive re-activates the same tokens.
- **§ 04 Toasts** — Duplicate toast updated to the new naming.
- **§ 05 Permissions** — Duplicate row: Editor column flipped to `—`. Added a paragraph noting the Archived tab only renders for owners.
- **§ 09 Decisions resolved** — converted from open questions to closed decisions; each one names the call and the reasoning so we don't relitigate during build.

## User

Build. After build summarize the build status and update the doc

## Assistant

_[tool: update_todos]_

_[tool: read_file]_

_[tool: grep]_

_[tool: write_file]_

Building the toast primitive first — shared across pages.

_[tool: write_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now add styles for the archived banner and lifecycle disabled state, and a `.is-stacked` modal variant:

_[tool: str_replace_edit]_

Now add the archived banner inside `.page` and add the Duplicate row in §05, plus a lifecycle gate copy line for non-owners:

_[tool: str_replace_edit]_

Now insert the Duplicate row + non-owner gate copy in §05:

_[tool: str_replace_edit]_

Now wire the lifecycle JS and add the Delete confirmation modal. Replace the existing settings-modal script:

_[tool: str_replace_edit]_

Now add the Delete confirmation modal markup. Place it right after the settings modal close `</div>`:

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now update the Tweaks panel to expose Lifecycle (active/archived) and Role (owner/editor/viewer):

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now to Home — add the tab strip, archived projects, and role/lifecycle tweaks.Now insert the lifecycle tabs and an archived grid into Home's body:

_[tool: str_replace_edit]_

Now wire the Home tabs and unarchive buttons, and add the role tweak:

_[tool: str_replace_edit]_

Now add tab-switch + unarchive JS, just before the `<script src="review-strip.js">`:

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: str_replace_edit]_

Now update the Lifecycle Plan with a build-status section:Also flip the §06 scope table statuses to "Done" where appropriate:

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Mark the §Plan build sequence items as shipped:

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

**Build complete.** Mock-fidelity implementation of all four lifecycle actions, wired to a shared toast primitive.

**New files**
- `solstein-toast.css` + `solstein-toast.js` — global toast primitive (`window.solToast({ msg, action, onAction, duration })`). Hover-pauses, supports inline action, risk variant.

**Project Page.html**
- §05 Lifecycle gains a **Duplicate** row above Archive (owner-only).
- **Delete confirmation modal** stacks at `z-index: 250`. Type-name input gates the destructive button; matched state tints the border risk-red.
- **Archived banner** appears above the project header when `body[data-lifecycle="archived"]` — with Unarchive button; archive disables topbar Settings + Add Member.
- Lifecycle buttons disabled for non-owners with a gate line: *"Only owners can rename, duplicate, archive, or delete this project."*
- Tweaks panel exposes `Lifecycle` (active/archived) and `Role` (owner/editor/viewer) so every state combo is reachable.

**Home.html**
- **Active / Archived tab strip** with live counts above the project grid. Archived tab + entire tab row hide for non-owners.
- Two archived sample projects ("Q3 Capacity Review", "Legacy Quote Engine Mapping") rendered with dashed border, **ARCHIVED** corner tag, and a hover-revealed **Unarchive** button on each card.
- Tweaks panel adds `Role` for testing the owner-only gating.

**Plan doc updated**
- Build-status callout at the top (shipped) + known-gaps callout (rename toast still pending wire-up; mock-only navigation on delete/archive/duplicate).
- §06 scope table flipped to `Done` on all seven shipped items.
- §Plan build sequence struck-through on the seven completed items; reads `7 / 8 shipped`.

**Open the page** → click Settings → §05 has the four rows; Delete… opens the confirm. Or flip Lifecycle in Tweaks to see the archived state instantly.

## User

Verifier agent check completed

## Assistant

Verifier confirmed everything works as expected. Build is complete and ready for review.

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: str_replace_edit]_

Fixed. The Graphs tab count now flips to **0** when the Graphs data tweak is set to `empty`, and Members count flips to **1** when Members is set to `owner-only`.

## User

on aiuth planning , verify what we have versus any gaps. Plan only

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

**Auth gap audit complete.** Added a new **§ 00b Gap Analysis** section to the plan, and walked back the intro from *"v1 is built"* to *"v1 mostly built"* with a jump-link to the audit.

**Findings — what's actually shipped vs. promised:**

**Blockers (real gaps in scope):**
- **Profile · Active Sessions section** — CSS exists (`.session-row`, `.sessions`, `.sessions-foot`), HTML doesn't. Sidebar nav skips it entirely. Breaks the "Revoke session" CTA in the new-sign-in email.
- **Profile · Change Email…** — button renders but doesn't trigger anything. The spec's hard-gate re-verify flow has no entry point.

**In-spec polish missing:**
- Network-failure toast pattern (now free — toast primitive shipped with Project Lifecycle).
- "Submitting" loading state not exposed as a Tweak variant on any form.
- "Malformed token" state listed in spec but not in tweaks for Accept Invite / Reset.

**Deferred (correctly):** SSO, MFA, Passkeys, Magic link, Re-auth for sensitive actions, Multi-workspace.

**Plan-only:** Admin Invite UI — the missing piece *upstream* of `/accept-invite`. Belongs in its own doc before any build.

**Free upgrade:** Toast primitive (built for Project Lifecycle) replaces the "new component to design" line in § 02 — auth can adopt it as-is.

Recommended next-pass callout in the doc proposes ~1 day to close the two blockers, adopt the toast, and add the submitting variant. Admin Invite gets its own plan.

## User

> admin issuance is not even sketched. Belongs in its own planning doc before any build.


we built this in operator, right?

## Assistant

_[tool: list_files]_

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

You're right — I missed it. `Operator Invitations.html` already has the full admin issuance UI: Issue Invitation modal, Pending/Accepted/Revoked/Expired filter tabs, Copy link / Resend / Revoke / Send new per-row actions, even an audit list with "accepted in 14h" / "revoked 3 days ago" timestamps. Fixing the gap analysis:

_[tool: str_replace_edit]_

Yes — built and shipped as **Operator Invitations.html**. My miss. Fixed the gap analysis: that row now reads *"Already shipped"* and cross-references the Operator file. Removed the "Spin up Admin Invite plan" task from the recommended next pass since it's already done.

Net update to the audit: two real blockers remain (Profile · Active Sessions and Change-Email handoff), plus the polish items (network toast, submitting state, malformed token).

## User

ok do those, confirm it works and then delete the auth plan doc

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

Now add the Sessions section, Change Email modal, update sidebar nav, and wire it all up:

_[tool: str_replace_edit]_

Now wire toasts, sessions revoke, change-email submit, and update tweaks:

_[tool: str_replace_edit]_

Now polish items — submitting state on Sign In + network failure toast, and malformed token state on Accept Invite and Reset Password. Let me check the existing Sign In structure:

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now Accept Invite + Reset Password — add `malformed` token state. Check what's there:

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: get_webview_logs]_

_[tool: fork_verifier_agent]_

Build complete. Waiting for verifier — will delete the plan doc once it confirms clean.

## User

Verifier agent check completed

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: grep]_

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: delete_file]_

_[tool: done]_

_[tool: fork_verifier_agent]_

All four gaps closed and the plan doc is gone.

**Shipped:**
- **Profile · Active Sessions** — new section with 4 device rows, current-device tag, per-row Revoke (fade + toast), Sign-out-everywhere footer. Tweak exposes multi/single states.
- **Profile · Change Email modal** — wired the existing button. Callout warns about sign-out + 24h verify window; submit fires toast with *Verify Email* action that navigates to the verify page. Tweak added.
- **Sign In · Submitting + Network-error states** — animated dots on the primary button while submitting; network-error banner above the form + toast with Retry. Both exposed in tweaks. Duplicate-close syntax error fixed after verifier flagged it.
- **Accept Invite + Reset Password · Malformed** — new state showing *"This link doesn't look right"* with a path back to request a new one. Added to tweaks on both.

**Cross-cutting:**
- Toast primitive adopted across Profile (revoke, sign-out-everywhere, password update, change-email submit) and Sign In (network error).
- `Auth Plan.html` deleted; 17 review-strips, `review-strip.js`, `Auth.html` body copy, and `Product Roadmap.html` gap reference all cleaned up.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: done]_

Wired Edit Name as an inline edit (kept the row visually static — no modal for a single field). Clicking **Edit Name** swaps the name into an input with Save/Cancel; Enter commits, Esc cancels. Empty names rejected with a toast. On save: the name in the row, the avatar initials, and the topbar user chip all update, plus a confirmation toast.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

Done. Removed:
- "Updated 2h ago" from Identity header
- "Verified" tag next to email
- "Last changed 47 days ago" from Password header
- "Breach-checked" from password requirements
- "All other sessions will be signed out." note next to Update Password
- Entire **Active Sessions** section, its sidebar nav item, the sessions tweak, and the dead JS

Profile is now Identity → Password → Danger Zone, lean.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Done — toast now reads just **"Password updated."**

## User

Apply comment

## User

Apply comment

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: str_replace_edit]_

Removed the **Contact your administrator** link. The aux block now just reads *"New to Solstein? Access is invite-only."*

## User

I don't like the content in terms. Keep all the headers (16 of them) but just add dummy content, placeholder.

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: run_script]_

Replaced all 16 section bodies with lorem ipsum + a "Placeholder summary — copy for this section to be drafted with legal." callout. Headers preserved verbatim.

## User

Same for Privacy policy, create placeholder

## Assistant

_[tool: grep]_

_[tool: run_script]_

All 14 Privacy sections replaced with the same lorem ipsum + placeholder callout pattern. Headers preserved.

## User

Both archived projects are clickable and when I do it takes me to car insurance, what is the expected behaviour for archved projects? 

If they canot be opened they should not link.

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Per the plan, archived projects *do* open — just in read-only mode with the banner. Currently the link drops into the default (active) state, which is the bug. Fix: pass the state through the URL and have Project Page boot accordingly.

_[tool: str_replace_edit]_

Fixed. Two things:

1. **Archived cards now link to `Project Page.html#archived`** — so they open into the read-only state with the archived banner, instead of looking identical to an active project.
2. **Unarchive button cleans the hash** — `history.replaceState` clears `#archived` so a refresh doesn't revert the project to read-only after the user unarchives.

Behavior per the plan: archived projects *are* openable, just in read-only mode (so the owner can review what was parked and unarchive from inside if needed). The card linking now matches that.

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

Done. Settings button now hidden entirely when the project is archived — the only way to act on the project is the **Unarchive** button in the banner, which makes sense (you shouldn't be tweaking branding/exports on a read-only project).

## User

I dont understand the read only stuff. ELI5 what we built.

My understanding is twofold. These are for: 1) members with viewer access only to a live project 2) archived projects that can still be seen by the owner

## Assistant

Good question — and you've got the right mental model. Here's the honest ELI5 of what we actually built:

## The two read-only scenarios

**Scenario 1 — Viewer role on a live project**
A teammate has been added with "viewer" access. The project is healthy and active, but they're not allowed to change anything.

**Scenario 2 — Owner viewing their own archived project**
The project is parked. The owner can still poke around to remember what was in it, but nothing should be editable until they unarchive.

Both should look essentially the same — same "you can look but you can't touch" feeling — just with different reasons (one is *permission*, the other is *project state*).

## What we actually built

| Surface | Viewer role | Archived (owner) |
|---|---|---|
| Lifecycle controls in Settings (archive/delete/duplicate/rename) | ✅ Disabled with explanatory line | ✅ Settings button hidden entirely |
| "Archived" banner across the top | n/a | ✅ Shown |
| Home — Archived tab visible | ✅ Hidden | n/a |
| Add Member button | ❌ Still works | ✅ Disabled |
| "Add Graph" button | ❌ Still works | ❌ Still works |
| Editing graph / canvas content | ❌ Not gated | ❌ Not gated |
| Editing project name / domain / branding | ❌ Not gated (other than lifecycle) | ❌ Not gated (settings hidden, but if you got in you could) |

## The honest gap

What we built is **the visible scaffolding** of read-only — the banner exists, the lifecycle controls are gated, the Archived tab is owner-only. But the actual "can't edit anything" enforcement is shallow. A viewer can still click *Add Graph*; an archived project's graphs are still clickable through to the canvas, which is fully editable.

## To make it real, you'd want

A single `body[data-readonly]` attribute that's set when either:
- The current user's role is viewer, OR
- The project is archived

…and CSS/JS rules that key off that one attribute to:
- Hide every "Add…" / "New…" / "Edit…" button
- Disable canvas editing
- Replace primary action buttons (Save changes, Update, Delete) with a small "Read-only" tag
- Show a permanent banner explaining *why* (different copy for viewer vs archived)

Want me to wire that up so both scenarios genuinely behave the same?

## User

yes, make my expectations of the two scenarios real. Also show me this is the case. When I view a live project as a viewer, the canvas and options etc change.

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

Building a single unified read-only mode now. Plan:

1. **Project Page**: one `body[data-readonly]` driven by either `role=viewer` OR `lifecycle=archived`. Banner with different copy. Hide all action buttons, swap canvas link to read-only.
2. **Canvas**: read URL hash → boot read-only. Hide edit toggle/settings, disable inline editing, top banner. Tweaks toggle for testing.Now update the banner markup with dynamic copy, the role compute logic, and hide more on Project Page:

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now the Canvas. Need a read-only banner + CSS that hides edit controls + Tweaks toggle. Append to `src/solstein-skin.css`:

_[tool: grep]_

_[tool: run_script]_

_[tool: grep]_

_[tool: grep]_

_[tool: run_script]_

Now wire the Canvas to read `#readonly=` hash on load, inject the banner, and add a small dev toggle:

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Sent the verifier to check both pages. Quick recap of what's now wired:

**Single source of truth**: `body[data-readonly="viewer"]` or `body[data-readonly="archived"]` — computed from role + lifecycle on Project Page, from URL hash + dev toggle on Canvas.

**Banner copy adapts:**
- *Viewer* — accent stripe + "You have viewer access. Editing is disabled."
- *Archived* — manual-orange stripe + "This project is read-only…" with Unarchive button (owner only)

**Project Page hides**: Settings, Add Member, member row icon-btns, members-add CTA. Graph card link auto-appends `#readonly=viewer` or `#readonly=archived` so opening the canvas stays in read-only mode.

**Canvas hides**: Settings button in topbar, canvas-edit-btn affordances, inspector mode-toggle, add-field/add-row buttons. Inline editable cells (`.edt`) become static text. A dev toggle in the bottom-left lets you flip between Owner / Viewer / Archived without leaving the page — handy for the walkthrough.

Will fix anything the verifier flags.

## User

Verifier agent check completed

## Assistant

Verifier confirmed both pages work end-to-end. Read-only mode now genuinely behaves consistently across:

- **Viewer on live project** — banner, hidden controls, canvas non-editable
- **Owner viewing archived project** — same scaffolding with archived-specific copy + Unarchive

You can test the chain by opening Project Page → Tweaks → flip Role to *viewer* → click the graph card → land on Canvas read-only. Or use the bottom-left **View as** toggle on Canvas to switch between Owner / Viewer / Archived in place.

## User

Okay so I see we still have spearte html for read only project and canvas. ISnt this controlled by the tweaks and just have the usueal project and canvas page?

Explain why or why not. no edits yet

## Assistant

Good architectural question — you're right to challenge it. Let me audit what actually exists:

**What we have today:**
- `Project Page.html` — single file. Tweaks panel sets role (owner/editor/viewer) and lifecycle (active/archived) → computes `data-readonly` on `<body>` → banner + hidden controls. **No separate file.** ✅
- `Canvas.html` — single file. URL hash (`#readonly=viewer|archived`) + bottom-left dev toggle → computes `data-readonly` → banner + hidden controls. **No separate file.** ✅
- `Canvas Viewer.html` — *this is the file you're seeing*. It's a leftover from an earlier pass, before we built the unified read-only mode. It almost certainly duplicates Canvas.html with a few read-only tweaks hard-coded in.

So the answer is:

**For Project Page and Canvas, we already do this correctly** — single file, state-driven. No separate "viewer" version needed.

**The `Canvas Viewer.html` file is dead code** — it predates the unified mode and should be deleted. The flow now is:

```
Home → click archived card → Project Page#archived
   ↓ (user is in read-only Project Page)
   click graph card → Canvas.html#readonly=archived
```

Same path for viewer role. One Canvas file, one Project Page file, behavior swung by attribute + URL.

The only reason to keep a separate file would be if the viewer/archived experience were *radically* different — like a stripped-down marketing-style "presentation mode" with no chrome at all. That's not what we built; ours is the same UI minus mutation affordances, which is exactly what `data-readonly` handles.

**Recommendation:** delete `Canvas Viewer.html` and any review-strip links pointing to it. Want me to?

## User

before you do does the same apply to the read only project page we have?

## Assistant

_[tool: list_files]_

_[tool: grep]_

Yes — same situation. There are actually **three** legacy files:

- `Project Viewer.html`
- `Canvas Viewer.html`
- `solstein-viewer.css` (the shared CSS those two used)

All three predate the unified read-only mode. Let me confirm they're dead before recommending deletion:

Confirmed — same story. There are three legacy files that form a self-contained loop, accessed only via the review-strip's "Viewer" submenu:

- **`Project Viewer.html`** — the old "what a viewer sees of a project" page
- **`Canvas Viewer.html`** — what it links to for read-only graph view
- **`solstein-viewer.css`** — shared overrides loaded only by `Canvas Viewer.html`
- **`review-strip.js`** has a `Viewer` submenu pointing to both files

Nothing else references them. They're cleanly removable.

**Why they're dead now:**
The unified `data-readonly` mode replaces them entirely. The same user — viewer or owner-on-archived — now lands on `Project Page.html` and `Canvas.html` with state attributes set. Same files, fewer code paths, fewer copies of "Add Member" or "Edit" buttons to keep in sync.

**Why they were useful before:**
Before `data-readonly` existed, this was the only way to mock a viewer's experience without rewiring the main pages. They're scaffolding that's served its purpose.

**Recommendation:** delete all three files + the `Viewer` submenu entry in `review-strip.js`. The 3-file pair → 0 files; main pages handle everything via Tweaks (Project Page) or hash + dev toggle (Canvas).

Ready to delete?

## User

Go ahead

## Assistant

_[tool: delete_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Done. Removed `Project Viewer.html`, `Canvas Viewer.html`, `solstein-viewer.css`, and dropped the `Viewer` submenu from `review-strip.js`. Read-only behavior now lives entirely in the main pages.

## User

Before we continue, I want you to do a thorough review of the permissions for Owner, Editor and Viewer and how these are reflected across the vairous pages. Summarize your findings, identify any gaps that exist wrt expected functionality and report back with recommendations. No edits.

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

# Permissions audit — Owner / Editor / Viewer

Findings from a source-walk of every page and modal that touches role state.

---

## What we actually gate today

| Surface | Owner | Editor | Viewer |
|---|---|---|---|
| **Home — Archived tab visibility** | ✅ Shown | ✅ Hidden | ✅ Hidden |
| **Home — Active projects** | ✅ Visible | ✅ Visible | ✅ Visible |
| **Home — New Project button** | ✅ | ✅ Not gated | ✅ Not gated |
| **Project Page — Settings button** | ✅ Shown | ⚠️ Shown (no gate) | ✅ Hidden (via readonly) |
| **Project Page — Add Member button** | ✅ Shown | ✅ Hidden | ✅ Hidden |
| **Members table — manage-member icon** | ✅ Works | ⚠️ Works (no gate) | ✅ Hidden (via readonly) |
| **Settings — § 01 Identity (name, domain)** | ✅ Editable | ❌ Editable | ❌ Hidden via Settings closure, but raw markup is unguarded |
| **Settings — § 02 Defaults (lens, reading)** | ✅ Editable | ❌ Editable | ❌ Same |
| **Settings — § 03 Access defaults** | ✅ Editable | ❌ Editable | ❌ Same |
| **Settings — § 04 Export & branding** | ✅ Editable | ❌ Editable | ❌ Same |
| **Settings — § 05 Lifecycle** | ✅ Active | ✅ Disabled + gate line | ✅ Disabled + gate line |
| **Settings — "Save changes" button** | ✅ Active | ❌ Active | ❌ Active |
| **Canvas — read/explore** | ✅ | ✅ | ✅ |
| **Canvas — inspector inline editing** | ✅ | ✅ | ✅ Gated |
| **Canvas — edit-mode toggle, Settings, add-field** | ✅ | ✅ | ✅ Gated |
| **Profile** | n/a (personal) | n/a | n/a |

✅ = matches expectation · ⚠️ = visible but should be gated · ❌ = gap

---

## Real gaps, ranked

### Blockers (UX is wrong as-is)

1. **Editor can open Settings and edit Identity / Defaults / Access / Branding.** Only § 05 Lifecycle is role-gated. An editor today could rename the project, change the client domain, swap the default lens, or replace the export branding — none of which they should touch. The Settings button is also visible to editors.

2. **Editor can manage members.** The `.icon-btn` on each member row opens the popover that changes roles, removes members, and (when wired) transfers ownership. There's no role check — only the "Add member" button is gated. So an editor today could demote the owner to viewer.

3. **`Save changes` button at the bottom of Settings is always enabled.** Even if §01–04 were rendered read-only, the affordance to commit changes would still suggest writes are possible.

### Inconsistencies in the data model

4. **"Commenter" role appears in Settings § 03 default-for-external-invites dropdown** but doesn't exist anywhere else in the app — not in the members table, not in the invite modal, not in the role tweak. Either remove it or commit to it as a fourth role.

5. **Self-detection on member rows is hard-coded to "James Mitchell" with `data-self="true"`.** When you tweak the current role to Viewer, James's row still shows the **Owner** pill and the "you're the only owner" copy. The viewing-role tweak doesn't mutate the row's role attribute. Result: viewing as a viewer still surfaces "you can't demote yourself" against an Owner pill.

6. **No "Leave project" path for non-owners viewing their own row.** The leave action only enables when `isSelf=true && currentRole !== owner-with-last-owner-constraint`. In practice the demo never reaches that branch because the only self-row is the Owner.

### Coverage gaps (features in plan, not built)

7. **Share-link management surface doesn't exist.** Lifecycle plan promises share links break on archive and re-activate on unarchive. There's no UI to create, view, or revoke a share link — Settings §03 only sets default invitation roles.

8. **Transfer ownership button is unwired.** Click does nothing. Plan also doesn't specify the flow (modal? inline picker? type-name confirm?).

9. **"Add Graph" doesn't exist on Project Page.** Only one graph is mocked, with no add affordance. So we can't test how editors create graphs vs viewers being denied. Same for graph rename / delete.

10. **Canvas has no role differentiation between Owner and Editor.** Both get the full edit surface. That's probably correct per spec, but worth confirming — should Editors be able to e.g. change the canvas default view, or only modify nodes/edges?

### Defense-in-depth notes

11. **All gating is CSS / data-attribute only.** No server-side equivalent assumed. A motivated viewer who opens devtools can `document.body.dataset.currentRole = 'owner'` and unlock everything. Fine for a mock; flag for engineering acceptance criteria.

12. **The viewing-role tweak is per-page, not session-wide.** Tweak Role to Viewer on Project Page → click graph → Canvas correctly inherits via URL hash. But navigate back to Home → Home's role is whatever its own tweak says. There's no shared session role. Mock-fine; worth flagging.

---

## Recommendations

**Single concept to introduce:** an `editor`-aware version of the same `data-readonly`-style attribute. Currently we only set `data-readonly` for viewer-or-archived. We need a complementary `data-restricted` (or similar) that captures "editor — can edit content, can't change configuration." Two attributes, one rule per concern.

**Concrete next moves (in priority order):**

1. **Gate Settings sections by role.**
   - Owner: all sections editable
   - Editor: § 01–04 render as read-only forms (inputs disabled, no Save button); § 05 hidden entirely
   - Viewer: Settings button not present (already correct)
   
   This is the single biggest gap and the easiest to fix — same pattern as the existing lifecycle gate, extended to the other sections.

2. **Gate the member-row popover.** Hide `.icon-btn` for editors and viewers; add a gate line at the top of the members panel: *"Only owners can change roles or remove members."*

3. **Resolve the Commenter ambiguity.** Either add Commenter to the role tweak / members table / invite modal, or remove it from § 03. Recommend remove — Viewer + comment-toggle elsewhere is simpler than a fourth role.

4. **Make the self-row track the current viewing role.** When the Tweak flips Role to Viewer, James's row should show `role.viewer` and the leave/demote logic should apply to him as a Viewer. This is mock infrastructure but it'll make the demo coherent.

5. **Add an explicit "Add Graph" affordance** so we have something to gate. Owner + Editor → button visible; Viewer → hidden via readonly. Two lines of work.

6. **Plan (don't build yet):** the Share Link surface and the Transfer Ownership flow. Both come up in the Lifecycle plan but neither has a UI commitment.

7. **Plan (don't build yet):** session-wide role override for mock review. A single tweak in the page header that propagates through localStorage so Home → Project → Canvas all show the same role without per-page wrangling.

---

**Bottom line:** Owner and Viewer experiences are mostly coherent. Editor is the role that's effectively undefined today — it acts like an Owner with one section disabled. Fixing the Settings gating (#1) closes 80% of the gap; the popover gating (#2) closes the rest of the practical risk; the others are polish.

## User

Home — New Project button should not be available to editor and viewer right? They're a viewer, I dont wnat them to become owners of other projects. Only people I invite can be creting projects?

Go ahead and implement all recommendations

## Assistant

_[tool: update_todos]_

Good catch — let me also fold in **Home: New Project hidden for Editor/Viewer**. That's actually the right model: Viewer/Editor on a project doesn't make you a workspace member capable of starting new projects.

Implementing the full set now in priority order.Starting with Home — hide New Project for non-owners + add a small contextual note:

_[tool: str_replace_edit]_

Now Project Page — biggest change. Editor gets a read-only Settings (sections 01–04), §05 hidden, Save hidden, plus a top gate banner in the modal:

_[tool: str_replace_edit]_

Now add the banner element to the modal + gate the member-row popover + members panel gate line:

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now: remove **Commenter** from §03, add a **New graph** card, and wire self-row sync:

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now: add the **New graph** card to the graphs panel + wire the self-row to track the Tweak role. Let me find the graphs-grid end:

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now wire the **self-row sync** — when the Tweak role changes, update the James row's role pill so the demo stays consistent. Find applyReadOnly:

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

All recommendations implemented. Summary:

**Home** — New Project hidden for Editor/Viewer; explanatory note appears below the page title: *"Only workspace owners can create new projects."*

**Project Page · Settings (Editor)** — Modal opens with a top banner "**§ Editor · Project settings are read-only**". Sections §01–04 visually dimmed + non-interactive. §05 Lifecycle hidden entirely. Save button gone — only Cancel.

**Project Page · Members** — Gate line at top of panel for non-owners: *"Only the project owner can add, remove, or change member roles."* Add Member button + per-row icon-btn menus hidden. Open-menu function has a defense-in-depth role check.

**§03 dropdown** — Commenter option removed. Single role left (Viewer); we have Owner/Editor/Viewer as the canonical set.

**Self-row sync** — James's row now mirrors whatever role you've set in Tweaks. Flip to Editor → his pill becomes Editor; flip to Viewer → Viewer.

**Add Graph** — the existing Import-graph card is now hidden in read-only mode (viewer/archived), visible to Owner + Editor.

**Net effect:** Editor is now a real role — can read everything, can collaborate on the canvas, can't reconfigure the project or manage who's in it. Viewer is read-only across the board. Owner is unchanged.

Verifier running.

## User

Apply comment

## Assistant

_[tool: grep]_

The **Preview** panel is a live mini-replica of what your project's card will look like on the Workspace grid once you create it. As you type into the form on the left, it updates in real-time:

- **Project name** — typed name, or "Untitled project" placeholder
- **Domain · Client** — your inputs separated by a dot, matching the meta line on Home cards

It's there to give immediate visual feedback so you can see how the project will appear alongside everything else in your workspace before committing. Same styling as the cards on Home, just rendered small.

Effectively a "name your project, see the result" affordance — saves you from creating, going to Home, realizing the name reads badly, and going back to rename.

## User

Just delete

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

Preview panel and all its supporting CSS + JS gone. The aside on the right now only shows the **What happens next** explainer.

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: str_replace_edit]_

Removed.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Add Member now sits naturally next to the filter buttons instead of being pushed to the far right.

## User

I only want people invited by me as opartor to be able to open projects. There may be a loophole currently. If an owner of a project invites a viewer into their project, then promotes them to owner of that project (co owenr) does that person then have rights to open new projects?

## Assistant

Yes — that's a real loophole. Here's the gap:

## The model today (conflated)

There's only **one** role axis: `owner / editor / viewer`. It's used for two different things:

1. **What you can do inside a specific project** (the legitimate use)
2. **Whether you can create new projects from Home** (the loophole — Home reads the same role tweak)

So if a Project Owner promotes an external Viewer to Co-Owner of their project, that user now reads as `role="owner"` system-wide. Open Home → `body[data-current-role="owner"]` → New Project button appears. They can spin up unlimited projects.

## The correct model (two orthogonal axes)

These are two different things and need to be modeled as such:

| Axis | Granted by | Scope | Controls |
|---|---|---|---|
| **Workspace membership** | Solstein Operator (via Operator Invitations) | Workspace-wide | Can sign in at all · Can create new projects · Billable seat |
| **Project role** (owner/editor/viewer) | A project owner | Per-project | What you can do inside one project |

A person can be:
- **Workspace member** (your employee) → can create projects. When they create one, they're the Project Owner of it by default.
- **External collaborator** (a client) → invited to specific projects only. Can be Owner/Editor/Viewer of any single project, but cannot create new ones, ever — promotion to Project Owner doesn't grant workspace membership.

The Operator console **already** distinguishes these (Pending invitations have an `is-full` vs `is-limited` pill — "Full" = workspace member, "Collab" = external). So the data model is there; it's the customer-facing UI that conflates them.

## What "closing the loophole" looks like in the mock

1. **Home's New Project gate switches from project-role to workspace-membership.** New tweak attribute: `body[data-workspace-role="member|external"]`. External never sees New Project, full stop, regardless of project-level role.

2. **Project Page Tweaks split into two controls** (or one combined "I am viewing as…" picker):
   - *Workspace status* — Member / External
   - *Role in this project* — Owner / Editor / Viewer
   The two combine: a Member-Editor is your colleague helping out; an External-Owner is your client running their own project (the case you're worried about — should be allowed for THAT project, but Home stays gated).

3. **Member-promotion menu carries a note** when promoting an External user to Owner: *"This makes them owner of this project. They still won't be able to create new projects in your workspace."* Reassurance that the promotion is project-scoped.

4. **The Add Member modal** stays as-is — inviting someone there always invites them as an External collaborator. Internal team is created by Solstein, not by project owners.

## Recommendation

Yes, this needs fixing. The plumbing already exists (the `data-external="true"` attr on member rows in the table). It's about formalizing it as a separate concept, gating Home on it, and adding the reassurance copy on role promotion.

Want me to implement this? It's about a half-day's mock work — one new attribute, two CSS updates, one new line of copy on the member-action popover, and adjusting the tweak panels on Home + Project Page.

## User

Fix it

## Assistant

_[tool: update_todos]_

_[tool: str_replace_edit]_

Now Project Page — add the reassurance note in the member-action popover when promoting an External user to Owner:

_[tool: str_replace_edit]_

_[tool: update_todos]_

_[tool: done]_

Loophole closed. The model now has **two orthogonal axes**:

**Workspace status** (set by you as the operator, via the Operator console)
- *Member* — your team. Can create new projects. Sees Archived tab. Default state.
- *External* — clients you've added to specific projects. Cannot create projects, ever, even if promoted to Project Owner on one of your projects.

**Project role** (set by a project's owner inside that project)
- Owner / Editor / Viewer — controls what you can do inside *that* specific project only.

**How the loophole is now closed:**

A Project Owner promoting an External viewer to Co-Owner:
- ✅ Gives them full control of *that project* (rename, archive, delete, member management — within the project)
- ✅ The member-action popover now shows a reassurance hint: *"Promoting Tom Reeve gives them full control of this project. They still can't create new projects in your workspace — that's set by Solstein."*
- ❌ Does **not** grant workspace membership. They open Home → `body[data-workspace-role="external"]` → New Project hidden, archived tab hidden, explanatory note shown.

**To verify:** Home → Tweaks → flip *Workspace* to "external". New Project card vanishes, archived tab gone, gate banner appears explaining the model. Then go to Project Page → member popover on Tom (external viewer) → click Owner → see the reassurance hint.

## User

What does this mean for the Operator view on memberS?

## Assistant

_[tool: grep]_

_[tool: read_file]_

The Operator console already has the right model — but the terminology and copy need to be aligned with the customer-facing names we just settled. Here's what I found:

## What's already aligned

The Operator Users page **already** uses two account classes:

- **Full** — can create projects, invite collaborators. Billable seat.
- **Collab** — can only edit projects they've been invited to. Not a billable seat.

These map 1:1 to what we just built on the customer side:

| Customer-facing (Home / Project Page) | Operator-facing (Operator Users / Invitations) |
|---|---|
| Member | Full |
| External | Collab |

The Operator console is **the only place** where someone moves between Full and Collab — there's a *Promote to Full* / *Demote to Collab* button in the user detail panel. Project Owners on the customer side can't touch this. That's exactly the right gating.

## What needs to change

### 1. Unify the language

We have two names for the same concept. Reads as inconsistent across the product.

- Operator says: "Full · Collab"
- Customer says: "Member · External"

Pick one set. I'd recommend **Member / External** project-wide because:
- "Full" is opaque to a new admin reading the Operator page
- "Member / External" reads naturally and matches how operators *describe* customers ("my member" vs "my client's contact")
- "Collab" is the most jargony — Solstein-specific

Affected: Operator Users page (filter pills, table column, detail panel, promote/demote buttons), Operator Invitations page (Full/Collab pills on each invite row), Operator Dashboard.

### 2. Sharper copy on the Account Class section

Current copy reads: *"Full users can create their own projects and invite collaborators. Collab users can only edit projects they've been invited to."*

This is technically right but misses the **billing** implication and the **promotion loophole** reassurance. Suggest:

> Members are part of your workspace — they can create projects, invite people, and count as billable seats. External users are clients invited to specific projects only. Promoting an External user to Project Owner inside a project does **not** make them a Member — only you can do that, from here.

### 3. Add a confirmation when promoting Collab → Full

This action adds a billable seat. Should not be a one-click promote. Stacked modal: *"Promote Tom Reeve to Member?"* + bullet list of consequences:
- Adds 1 billable seat to your subscription
- They can create projects, invite people, see archived workspace projects  
- This is reversible — demote later returns them to External

### 4. Make the relationship to Project roles explicit

In the user detail panel, the **Projects** table should show *role per project* (Owner / Editor / Viewer) for that user. Today it just lists project names. Adding the role column makes it instantly visible: *"Tom is External in our workspace, but he's the Owner of `Acme Q3 Strategy`."* No surprises.

### 5. Audit-log implication (Tier 3, plan only)

If a Project Owner promotes a Collab to Project Owner, an entry should appear in your audit log. Same for demote, remove, transfer. Operator should see at-a-glance who promoted whom and when. Not a v1 surface; flag for the audit log workstream.

## Bottom line

**Operator console already does the right thing structurally** — the workspace class control lives only there, and only you (the operator) can change it. The fix is presentational, not architectural:

1. Rename Full → Member, Collab → External across the Operator pages (~30 minutes of mock work)
2. Sharpen the explainer copy
3. Wrap "Promote to Full" in a billing-aware confirmation
4. Add Project Role column to the user-detail Projects table
5. Plan an audit-log entry for cross-promotion events (Tier 3)

Want me to do #1–4? Audit log entries belong in the Activity / Audit Log workstream from the Tier 3 roadmap.

## User

Go ahead with 1-4. Can you also write a seperate doc explaining roles?

## Assistant

_[tool: update_todos]_

_[tool: read_file]_

_[tool: grep]_

_[tool: run_script]_

Going to batch this. Doing the bulk renames + data restructure via script, then surgical edits for the modal + projects table.Now: (a) add Project Role column to user-detail Projects table + restructure data, (b) build the billing-aware promote confirmation modal:

_[tool: run_script]_

Now add the role-pill CSS, the billing-aware Promote confirmation modal, and wire it up:

_[tool: grep]_

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

The modal markup needs to come before the script blocks that reference it. Move it up:

_[tool: grep]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: done]_

Clean. Now write the **Roles & Permissions** doc:

_[tool: write_file]_

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

All done. Summary:

**Operator Users.html**
- Filter pills, table column, detail panel, and class buttons all relabeled: **Full → Member**, **Collab → External**
- Sharpened Account Class explainer copy spelling out the billing dimension and explicitly closing the promote-loophole
- **Billing-aware Promote/Demote confirmation modal**: stacked dialog with the consequences laid out as bullets (adds billable seat, allows project creation, reversible). Demote modal blocks the action if the user owns projects, with a risk-coloured warning
- **Project Role column** added to the user-detail Projects table — every project row now shows Owner/Editor/Viewer pill. Three External users (Alex, Diego, Marcus) given representative project rows so the column actually demonstrates variety
- Project cell on the main table accurately counts owned vs collab based on per-project role

**Operator Invitations.html**
- All Full/Collab pills relabeled
- Account Class On Acceptance card copy rewritten to make the billing/workspace dimension explicit

**New file — Roles & Permissions.html**
- Two-axis grid showing how Workspace Status × Project Role combine
- "Who grants what" table making it explicit that only Solstein moves people between Member/External
- Complete Project Role capability matrix (project page, members, graphs/canvas)
- Workspace status capability matrix
- Three personas (James/Sarah/Tom) showing the model in practice
- Read-only mode explanation (the two paths that produce identical UI)
- Terminology history (Full→Member, Collab→External, Commenter removed)
- FAQ with seven of the most common confusions answered

Verifier running. Will fix anything it flags.

## User

where do i find these pages from the nav bar

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

Good question — Planning has only Brand System + Roadmap. Adding the rest of the planning docs:Done. The **Planning** dropdown in the top nav strip now includes all five planning docs:

- Brand System
- Product Roadmap
- **Roles & Permissions** ← new
- **Project Lifecycle** ← was orphaned
- **Canvas Export** ← was orphaned

Hover over *Planning* in the review strip on any page to jump to them.

## User

Project Lifecycle ← was orphaned
Canvas Export ← was orphaned

are thos relevant? 

Also whats next to develop or clean up. Do a review

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: list_files]_

_[tool: read_file]_

Let me check both docs and survey the project state.

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

Here's the review.

---

## On the two plan docs

**Both are still useful, but as *historical records*, not forward-looking plans.**

| Doc | What it is now | Recommendation |
|---|---|---|
| **Project Lifecycle Plan** | Spec + decision log + build status. 7/8 items shipped, 1 "Pending" (rename toast wiring) | **Keep.** Useful for engineers implementing the real backend — every decision (soft-delete? "Copy of" prefix? share-link behavior?) is recorded with reasoning. Reads as a "how we got here" doc. |
| **Canvas Export Plan** | Spec + diff from old export → PNG/PDF | **Keep.** Same value — clean decision log explaining why JSON was removed and why current-view-by-default. |

They sit alongside **Roles & Permissions** as reference material. Naming convention is consistent (`X Plan.html`); the three of them now form your "spec library" that engineers can hand off from.

I'd recommend **renaming `Roles & Permissions.html` to `Roles & Permissions Plan.html`** for filename consistency. Or rename the other two to drop "Plan" — same direction, either way.

---

## Stale terminology — needs cleanup now

Found two leftover references to the old naming:

1. **`Operator.html`** — index card copy still says *"Choose Full vs Collab class on send."*
2. **`Product Roadmap.html`** — review-strip lists `Admin Plan.html` (deleted file) and `Offline.html` (not present), and the Recent Changes callout mentions "Viewer (read-only)" surface as Built — but we deleted that and built unified read-only into Project + Canvas. Snapshot table also still says "Viewer · Built" and lists `Project Viewer + Canvas Viewer chrome` — neither exists anymore.

These are blocker-tier inconsistencies for any new reader.

---

## Real next-work items, ranked

### Tier 0 — Loose ends from current pass (small, do today)

1. **Fix Operator.html copy** (Full/Collab → Member/External)
2. **Fix Product Roadmap inconsistencies** — broken nav links, stale Viewer references, snapshot table out of date
3. **Wire Rename toast** — the only "Pending" item in Project Lifecycle Plan. Settings § 01 saves on Cancel/Close, toast emit not yet hooked
4. **Wire Transfer Ownership** — § 05 Lifecycle button exists, click does nothing. Need a small modal: member picker + "type the project name to confirm"

### Tier 1 — Next product surface (per roadmap priorities)

5. **Share-link UI** — Lifecycle Plan promises share links break on archive and re-activate on unarchive, but there's no UI to *create*, *list*, or *revoke* a share link. Goes in Settings § 03 Access. Roadmap calls this out as "Missing."
6. **Comments / annotations on canvas** — listed as Missing on roadmap; promised by the dropped Commenter role consolidating into Viewer
7. **Activity / Audit Log** — every roadmap pass mentions this. Particularly relevant after we just split workspace status from project role — operators will want a "Jamie promoted Tom to Member, +1 seat" event log

### Tier 2 — Surfaces that exist but read as "Partial"

8. **Loading & inline-error empty states** — last unshipped category from Empty States Round 2
9. **Multi-page PDF + SVG export** — Canvas Export Plan flagged but unshipped
10. **Search** — across projects/graphs. No surface yet
11. **Notifications** — beyond transactional auth emails. No surface
12. **Onboarding** — first-run after Accept Invite. No surface
13. **Command palette** — listed on roadmap, fits brand, would be a satisfying ship

### Tier 3 — Defer

14. Trash / Recently Deleted (already in lifecycle plan as deferred)
15. Help / docs surface
16. Real session management UI on Profile (we removed it deliberately; revisit if customers ask)

---

## My recommendation: do this next

**A 1-day cleanup pass** to close out everything from the recent work:

1. Rename `Roles & Permissions.html` → `Roles & Permissions Plan.html` (or drop "Plan" from the other two)
2. Fix `Operator.html` Full/Collab copy
3. Fix `Product Roadmap.html` — replace its hand-rolled review strip with `review-strip.js`, scrub Viewer references, update the snapshot table to reflect the unified read-only mode
4. Wire the **Rename toast** (5 min)
5. Wire **Transfer Ownership** modal (~½ day)

Then **Tier 1 next-feature pick**: I'd push for **Share-link UI** because it's the single biggest gap left in the project lifecycle story (links are promised to break, but there's no UI to manage them in the first place).

Want me to do the cleanup pass?

## User

DO all of Tier 0

## Assistant

_[tool: update_todos]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Doing all four in parallel.Now items 3 & 4: Rename toast + Transfer Ownership modal. Let me find the right hooks in Project Page:

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now wire both in JS — find the lifecycle-actions IIFE and inject:

_[tool: str_replace_edit]_

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

All four Tier 0 items done.

**1. Operator.html** — Invitations card copy fixed: *"Choose Member vs External class on send."*

**2. Product Roadmap** — replaced hand-rolled review strip with `review-strip.js` (Planning dropdown now lists all 5 docs); intro rewritten to reflect Flo branding + the new two-axis model; Recent Changes callout updated with three new shipped items (Roles & Permissions, Project Lifecycle, unified Read-only mode); snapshot table revised: Viewer/Read-only mode row now describes the unified mode, new rows for Roles & Permissions and Project Lifecycle, Sharing row updated to note the missing share-link UI.

**3. Rename toast** — Save Changes button now compares values against a snapshot taken when the modal opens. If the name changed, the project header updates live, the document title updates, and a toast fires: *"Renamed to {new name}."* If other fields changed but not the name: *"Settings saved."* If nothing changed: nothing fires.

**4. Transfer Ownership** — Transfer… button opens a stacked modal with a dropdown of eligible members (excludes self, excludes pending invites). On confirm: settings closes, self-row pill flips Owner → Editor, target member's pill flips to Owner, the viewing role tweak auto-flips to Editor (so the user sees what their new state looks like), and a toast fires explaining the new state.

Verifier running. Will fix anything it flags.

## User

Can you go across all pages and forms and modals and look for minor inconsitentices of minor UX improvements. List them ALL out here. Say easy or hard to address. Then suggest a plan/order to tackle them in what it would fix

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

Doing a systematic audit across pages, forms, modals. Going to check the structure first.

# UX & Consistency Audit

Going to organize by category, with effort tag (E = easy, M = medium, H = hard) and impact note.

## 1. Brand naming — Solstein vs Flo leakage

Project renamed to Flo, but legacy "Solstein" copy persists in user-facing places.

| # | Issue | Where | Effort |
|---|---|---|---|
| 1.1 | `<title>` tags say "Solstein — X" on at least 8 pages | Sign In, Reset, Forgot, Verify, Accept Invite, Operator pages, Auth.html | **E** |
| 1.2 | Review strip label `<span class="label">Solstein — UI Mocks</span>` still appears in 30+ HTML files | Almost every page | **E** |
| 1.3 | Signed Out copy: *"Your Solstein session has been closed"* | `Signed Out.html` | **E** |
| 1.4 | Sign In banner copy `"Couldn't reach Solstein"` (and matching toast) | `Sign In.html` | **E** |
| 1.5 | Settings modal § 04 copy: *"Place the client logo alongside the Solstein mark"* | `Project Page.html` | **E** |
| 1.6 | Verify Email page title styling: *"Solstein has verified…"* — check copy | Verify Email | **E** |
| 1.7 | Footer copyright *"© 2026 Solstein Labs Ltd."* on Terms/Privacy | Confirm intent — consultancy vs product | **E** |

## 2. Modal patterns — 3 inconsistent designs

| # | Issue | Effort |
|---|---|---|
| 2.1 | Three different modal-footer markups: `.sol-modal-footer` (Project Page), `.modal-actions` (Profile), `.op-modal-foot` (Operator) — all do the same thing | **M** |
| 2.2 | Three close-button patterns: `data-close-modal` attr (Project Page), inline `onclick="document.documentElement.setAttribute..."` (Profile), inline `onclick="closeFn()"` (Operator) | **M** |
| 2.3 | Two destructive button classes: `.btn-danger` (Profile) vs `.btn.is-destructive` (Project Page). Pick one | **E** |
| 2.4 | Profile's modal Cancel uses bare `.btn`; Operator's uses `.row-action`; Project Page uses `.btn`. Three styles | **E** |
| 2.5 | Project Page Delete-confirm uses `is-stacked` z-index pattern; Profile modals don't use anything similar (they don't need to, but worth unifying primitive) | **M** |

## 3. Button label conventions

| # | Issue | Effort |
|---|---|---|
| 3.1 | Arrows on some primary buttons ("Send Invite →", "Sign In →", "Send 2 Invitations →") but not most. Pick a rule | **E** |
| 3.2 | Ellipsis convention is *almost* applied (opens-a-modal = ellipsis): "Change Email…", "Transfer…", "Delete…", "Archive…". But "Send invite" doesn't (opens modal), "Add member" doesn't (opens modal). Inconsistent | **E** |
| 3.3 | "Sign Back In" (Signed Out) vs "Sign In" (everywhere else) — minor | **E** |
| 3.4 | Settings modal's Cancel becomes semantically "Close" for non-owners but the label stays "Cancel". Rename to "Close" for those | **E** |
| 3.5 | Button heights drift: Operator uses inline `style="height: 36px"`; default is 30/40px depending on size. Bake into `.btn-md` modifier | **M** |

## 4. Toast primitive not loaded uniformly

| # | Issue | Effort |
|---|---|---|
| 4.1 | `solstein-toast.{css,js}` loads on Home, Project Page, Profile, Sign In. **Missing on:** Forgot Password, Reset Password, Accept Invite, Verify Email, Operator pages, Canvas, New Project, Auth.html. Any future network-error or success toast won't fire | **E** |
| 4.2 | Sign In is the only auth page wired to fire a network-error toast. Either remove the wire-up there or add to all auth pages for consistency | **E** |

## 5. Page-level copy & filter UX

| # | Issue | Effort |
|---|---|---|
| 5.1 | Operator Users filter pills: "All · 42" / "Active · 38" use `·` separator; class filter uses "All classes" instead of "All · 42". Mix of formats | **E** |
| 5.2 | Date formats inconsistent: "2h ago", "May 20", "May 20, 2026", "Mar 12", "21d ago". Relative + absolute mixed within a single table | **M** |
| 5.3 | Sign In sub-link removed ("Contact your administrator") leaves the aux block with only one line. Centers awkwardly | **E** |

## 6. Tweaks panel inconsistency

| # | Issue | Effort |
|---|---|---|
| 6.1 | Theme toggle (dark/light) exists only on Home. Project Page, Canvas, Profile etc. can't be tested in light mode | **M** |
| 6.2 | Each page has its own tweak schema. No shared "current viewing role" across pages — flip Role on Home → land on Project Page → role is back to owner. Localstorage-shared session role would fix the demo | **H** |
| 6.3 | Tweaks panel `lt-meta` "member view" copy only on Home. Project Page Tweaks doesn't indicate viewing role in any sticky way | **E** |

## 7. State-sync gaps I noticed

| # | Issue | Effort |
|---|---|---|
| 7.1 | Settings § 01 "Project lead" dropdown is hardcoded to "James Mitchell" — if you transfer ownership, this should update | **E** |
| 7.2 | Rename-toast "Settings saved" only detects changes to set-name/domain/client/desc. Toggles in §02/03/04 aren't tracked → save-no-op shows nothing | **M** |
| 7.3 | Profile inline name edit doesn't commit on blur — Tab-away discards the change | **E** |
| 7.4 | Member-row popover doesn't close on Escape (only Settings modal does) | **E** |
| 7.5 | When transferring ownership, the page's role auto-flips to Editor — but the readonly banner logic also runs, and Project Page is editor (no readonly). Should verify viewer→editor banner doesn't flash | **E** |

## 8. Polish / craft

| # | Issue | Effort |
|---|---|---|
| 8.1 | Operator Users · Class filter values: "Member" / "External" but the table column header still says "Class" — could be more descriptive ("Account class") | **E** |
| 8.2 | Profile's Identity row: avatar shows "JM" hard-coded; auto-derived from name in JS but only fires on name change, not page load | **E** |
| 8.3 | Modal entrance animations — most modals use display:flex toggle, no fade-in. Project Page has a `is-stacked` z-index dance but no transition | **M** |
| 8.4 | Sign In submit button "Sign In" has no loading state when submitting tweak is selected — the dots animation only triggers if the user actually clicks. Should test | **E** |
| 8.5 | Empty-states filter "Clear filters" link appears only in Operator Users. Other filterable surfaces (members tab, archived tab) don't reuse the pattern when filtered to empty | **M** |

## 9. Information architecture

| # | Issue | Effort |
|---|---|---|
| 9.1 | Operator.html (index) card for Users says *"Promote, suspend, send password reset, delete."* but the promote action is now a 4-step modal flow — copy could mention the workspace status separation | **E** |
| 9.2 | Project Page · Settings § 03 "Default role for new members" defaults to Viewer; "Default role for external invites" is also Viewer. Same dropdown, two fields — could be one field if no actual differentiation | **E** |
| 9.3 | The §05 Lifecycle "Transfer ownership" row description says "They take over billing, access policy, and lifecycle decisions" — but billing is Workspace-level, not Project-level. Slightly misleading | **E** |

---

# Recommended plan

Three coherent passes, in this order:

### Pass A — "Naming & visible polish" (½ day)
*Fixes the things a stakeholder demoing the product would notice immediately.*

- **All of §1** (Brand naming: titles, review-strip label, body copy) — single find/replace pass + light copy review
- **3.1, 3.2, 3.3, 3.4** (Button label rules: arrow policy, ellipsis policy, Cancel→Close for non-owners)
- **5.1, 5.3** (Filter label cleanup, Sign In aux block)
- **8.2** (avatar auto-derive on load)
- **9.1, 9.3** (Misleading copy)

### Pass B — "Modal & button primitives" (½ day)
*Consolidates the three different modal patterns into one. Quiet, structural — payoff is in every future modal being free.*

- **2.1, 2.2, 2.3, 2.4** — converge Profile/Operator modals onto Project Page's `.sol-modal-footer` pattern. Use `.btn.is-destructive`, retire `.btn-danger`. Use `data-close-modal` everywhere.
- **3.5** (Standardize button heights)
- **4.1, 4.2** (Toast primitive loaded on all pages)
- **7.4** (Esc closes member popover)

### Pass C — "State sync & demo coherence" (¾ day)
*Fixes the things that break the demo when you tweak state in one place and see stale data in another.*

- **7.1** (Transfer-ownership updates Project lead dropdown)
- **7.2** (Save-toast tracks toggles and dropdowns too)
- **7.3** (Profile inline edit commits on blur)
- **6.3** (Project Page Tweaks shows current viewing role indicator)
- **8.4** (Verify Sign In submitting state)
- **6.1** (Theme toggle on more pages — optional, half day if you want full coverage)

### Defer
- **2.5** (Modal entrance animations) — touches a primitive, do later
- **5.2** (Date format unification) — touches dozens of files, do as part of a real Activity Log pass
- **6.2** (Session-shared viewing role) — would be a meaningful refactor
- **8.3, 8.5** (Animation, generalized clear-filters) — polish, low ROI alone

**My recommendation:** do Pass A and Pass B today (1 day total). Pass C in a follow-up. Want me to start?

## User

Do A and B. Then decide of you can also do C in the same pass. If nothing is wrong, just continue. Summarixe after you're done what has changed and where ta shows us so I can audit.

## Assistant

_[tool: run_script]_

Going to batch this aggressively. Pass A first — naming & visible polish.

_[tool: run_script]_

Now Pass A items 1.3–9.3 — body copy, button labels, etc:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now button arrows + ellipsis policy. Rule: **no arrows on btn-primary**; **ellipsis on buttons that open a modal**.

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Pass A done. Now **Pass B — Modal & button primitives + Toast everywhere**.

_[tool: run_script]_

Now: converge `.btn-danger` → `.btn.is-destructive`, member-popover Esc handler, and unify Profile / Operator modal footers visually.

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now: member-popover Esc handler + standardize button heights + verify the modal close patterns work.

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

Duplicate handler — let me remove the older redundant one:

_[tool: str_replace_edit]_

Now let me verify everything by opening the file. Then evaluate Pass C scope.

_[tool: done]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Continuing with Pass C — clear runway, low risk items.

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: run_script]_

Now 6.3 — Tweaks panel role indicator on Project Page:

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

# Audit summary

Got through **A**, **B**, and most of **C**. Skipped 6.1 (theme toggle across all pages — too broad for low ROI) and 8.4 (verifier checks Sign In submitting state).

## What changed — by file

### Brand naming swept (Pass A.1)
Touched **27 HTML files** via single script pass:
- `<title>` tags: `Solstein — X` → `Flo — X`
- Review strip label: `Solstein — UI Mocks` → `Flo — UI Mocks`

### Body copy (Pass A.2)
- **`Signed Out.html`** — "Your Solstein session…" → "Your Flo session…"; button "Sign Back In" → "Sign In"
- **`Sign In.html`** — Banner copy "Couldn't reach Solstein" → "Couldn't reach Flo"; status URL `status.flo.app`; aux line "New to Solstein?" → "New to Flo?"; toast copy aligned
- **`Project Page.html`** — § 04 Branding "Solstein mark" → "Flo mark"; Lifecycle § 05 Transfer copy fixed (was misleading about billing)
- **`Profile.html`** — Delete account warning "Solstein account" → "Flo account"
- **`Operator.html`** — Users index card copy updated to reference Member/External and Flo

### Button labels & UX (Pass A.3–9.3)
- Removed `→` arrows from primary buttons across Operator pages (Send Invite, Sign In, Send Invitations)
- Added `…` to buttons opening modals: `Add member` → `Add member…`, `Send Invite` → `Send Invite…`
- **Project Page** Cancel → Close auto-relabel for non-owners (JS in `applyReadOnly`)
- **Operator Users** filter "All classes" → "All"; table column "Class" → "Account class"

### Modal & button primitives (Pass B)
- **Toast primitive** (`solstein-toast.{css,js}`) added to **15 files** that didn't have it: Forgot/Reset/Accept Invite/Verify Email/Signed Out/Operator pages/Auth/New Project/Emails/404/500. Any future toast call works everywhere now.
- **`.btn-danger` → `.btn.is-destructive`** unified — Profile retired its own destructive button class; CSS rules + the one button reference both updated. One destructive primitive across the project.
- **Member popover Esc handler** — duplicate listener cleaned up

### Avatar + Profile (Pass A.8.2 + C.7.3)
- Profile avatar + topbar chip now **derive initials from the name on load**, not just on edit
- Inline name edit now **commits on blur** (Tab-away) instead of silently discarding

### Project Page state-sync (Pass C.7.1, 7.2, 6.3)
- **Transfer Ownership** now updates the Settings § 01 "Project lead" dropdown to the new owner
- **Save changes** tracks **all** inputs, textareas, checkboxes, and dropdowns in Settings — not just the four identity fields. Toggle a checkbox in § 02, hit Save → "Settings saved" toast fires
- **Tweaks panel** on Project Page now shows a **"Viewing as · {role}"** indicator block with a sentence explaining what that role can/can't do. Helpful when you flip the tweak and want to confirm what changes

---

## Where to audit

Open these and verify visually:

| What | Where |
|---|---|
| Brand consistency | Browser tab titles on **any page**; review-strip label at the top |
| Signed-out copy | **Signed Out.html** |
| Sign In network banner + toast | **Sign In.html** → Tweaks → State: network-error |
| Cancel ↔ Close gating | **Project Page.html** → Tweaks → Role: editor → click Settings; bottom button reads "Close" |
| Add member ellipsis | **Project Page.html** members tab top-right button |
| Toast primitive available | **Operator Invitations.html** etc — open devtools, run `window.solToast({msg:'test'})` |
| Destructive button | **Profile.html** Danger Zone → matches the Delete… style on Project Page |
| Profile avatar | **Profile.html** — top-left chip + avatar initials should match name on load |
| Profile inline edit blur | **Profile.html** → Edit Name → type → Tab → commits |
| Transfer ownership sync | **Project Page.html** → Settings → § 05 → Transfer… → pick member → confirm. Re-open Settings → § 01 Project lead now shows the new owner |
| Settings save-anywhere toast | **Project Page.html** → Settings → toggle anything in § 02/03/04 → Save → toast fires |
| Tweaks viewing-as hint | **Project Page.html** → open Tweaks → flip Role → hint copy at the bottom updates |

Verifier running. Let me know what you find.

