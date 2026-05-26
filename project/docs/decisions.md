# Decisions Log + Open Questions

A running record of design decisions made during the prototype phase. Each entry: **what was chosen, why, what was rejected**. Bring questions to the design lead before reversing any of these.

---

## Shipped decisions

### Lens conditions are evaluated by a data-driven matcher

**Chose:** A generic JSON-driven evaluator (`src/lensMatch.js`) that reads each lens's `match` block plus `alsoMatch*` fields.
**Rejected:** Hardcoded per-lens predicates inside the canvas (the original implementation).
**Why:** Editing a built-in lens in Settings should actually change what highlights. Hardcoding meant changes were cosmetic and silently ignored.

### Lens match conditions are restricted to discovered metadata fields

**Chose:** The Settings → Lens editor dropdown only offers fields actually present on nodes/edges in the imported graph.
**Rejected:** Free-form text input for `metadata.<anything>`.
**Why:** The user's design directive — *"this is not where we introduce new metadata"*. New fields enter via Step 3 of the import wizard. Lens edits should never silently no-op because of a typo'd path.

### Built-in lenses are editable; built-in views are not

**Chose:** Built-in views (Journey, Technical Architecture) show a "Built-in" lock badge and can't be deleted. Built-in lenses (PII, Manual Process, etc.) are freely editable, including their match conditions.
**Why:** Views encode product-level taxonomy decisions; lenses encode user-level intent and should be customisable per project.

### Read-only mode is unified across Viewer role and Archived projects

**Chose:** A single `is-readonly` class drives both, hiding all edit affordances.
**Rejected:** Separate "you're a viewer" and "project archived" UI variants.
**Why:** Identical underlying capability. Two cosmetic paths to the same state would diverge and become inconsistent over time.

### JSON export was removed

**Chose:** PNG and PDF export only.
**Rejected:** JSON export of the current graph.
**Why:** The graph is already in the API (in production). Exporting JSON encourages out-of-band edits that would silently desync from the source of truth. PNG/PDF are deliverable artefacts; JSON is internal data.

### Type-name confirmation for destructive actions

**Chose:** Delete project requires typing the project name to enable the button.
**Rejected:** "Are you sure?" modal with a Yes button.
**Why:** Destructive actions need real cognitive load, not click-through fatigue. The user demonstrates intent by reproducing the name.

### Sign-in notifications fire on every successful authentication

**Chose:** Email on every sign-in, every device, no debouncing.
**Rejected:** Suppress when same device, recent sign-in.
**Why:** Security signal. If someone else signs in, the user finds out immediately. False positives on the user's own re-sign-ins are an acceptable cost.

### External users can be promoted to Owner

**Chose:** Allowed, with explicit inline copy in the role menu: *"They'll own this project but still can't create new projects in your workspace."*
**Rejected:** Blocking the promotion outright.
**Why:** Edge case but legitimate (e.g. handing a project over to the client at end of engagement). The clarification copy prevents misunderstanding without imposing a rigid rule.

### Empty types (unnamed "New type") are hidden from pill lists

**Chose:** Placeholder types like "New type" / "new" don't appear in the lens / view pill lists until renamed.
**Rejected:** Show them with the placeholder label.
**Why:** They clutter pill lists and aren't matchable in any meaningful way. Settings → Node Types is the right place to rename or delete them.

### Two product personas split via subdomain (Operator)

**Chose:** Operator portal lives at `operator.solstein.app/*` with its own auth realm.
**Rejected:** A single chrome that role-checks Operator into the regular app.
**Why:** Two different audiences (consultants vs Solstein staff) with two different mental models. Conflating them in one shell forced uncomfortable copy and navigation choices. A subdomain is a hard wall.

### Slim, evidence-led voice across all surfaces

**Chose:** Plain, declarative copy. "Take a reading", "Cut through the fog", "Three handoffs, no system of record." No exclamation marks, no hype.
**Rejected:** SaaS-default copy with action-oriented imperatives and superlatives.
**Why:** The product reveals difficult truths about how organisations work. The voice has to match — credible, calm, never salesy. (See `brand-system.md` § 08.)

### Modal body scrolls internally; head/stepper/footer stay pinned

**Chose:** Add-node modal (and similar) cap at viewport height; the body scrolls.
**Rejected:** Modal grows to fit content, body of the page scrolls behind.
**Why:** Predictable interaction. The user never loses access to the step controls or close button.

---

## Open questions for engineering

### Persistence

- Per-user layout overrides — keep client-side, or sync? (Recommend: sync, so layouts follow the user across devices.)
- Workspace seat limits — billing model not yet defined. Production must enforce server-side.
- Soft-delete grace period — recommend 30 days with a "Trash" filter for Owners. Confirm with ops/legal.

### Auth

- Session model — cookies vs JWT. Recommend cookies given the multi-page architecture.
- Workspace admin role — currently no role above project Owner. If billing/IT admin is needed, design it explicitly.
- Operator impersonation — should support be able to "view as user" for debugging? Audit-trail requirement if yes.

### Canvas

- **Live multi-user editing** — out of scope for v1?
- **Large graphs** — sample data is ~300 nodes. Performance budget needed if production targets 10k+ nodes. Probably requires viewport culling.
- **Cross-graph queries** — "show me every PII node across all our projects" — not designed yet.
- **Layout strategies** — only "layered" is implemented. Force-directed and hierarchical are likely future additions.
- **Migration on type/category rename** — when a node type ID is renamed in Settings, the prototype updates the in-memory data only. Production needs a real migration story.

### Empty / loading states

- Skeleton states for canvas (large graphs may take 1-3s to load) — not designed yet.
- Partial-failure: graph loads but references a missing node type — fallback not designed.

### Integrations

- Import wizard is JSON-only. Future inputs (Notion exports, Mermaid, draw.io, CSV) need both schema mappers and UX.
- Webhooks / API for external systems to push updates — not designed.

### Accessibility

- Brand system commits to AA contrast and `prefers-reduced-motion`. Specific focus order / SR labelling per surface still needs an audit before ship.

### Operator portal

- Impersonation flow (see Auth above).
- Bulk operations (suspend N users, revoke N invitations) — not designed.
- Audit log surfacing — likely needed but not in the prototype.
