# 09 · State and Persistence

The prototype has no backend. Everything that should live on a server lives in `localStorage`. This document inventories every key the prototype writes, what it represents, and where it should land in production.

## localStorage keys

| Key | Defined in | Shape | Production destination |
|---|---|---|---|
| `flowlens.views.<projectId>` | `src/app.jsx` | `View[]` (custom views the user added in Settings) | Backend — per-project resource |
| `flowlens.overlays.<projectId>` | `src/app.jsx` | `Lens[]` (custom lenses + edits to built-ins) | Backend — per-project resource |
| `flowlens.editLayout` | `src/app.jsx` | `"0"` or `"1"` | Client-only — UI preference, can stay in localStorage |
| `flowlens.layoutOverrides.<viewId>` | `src/layoutOverrides.js` | `{ [nodeId]: { x, y } }` | Backend — per-view, per-user (every user can have their own layout) |
| `flowlens.nodeTypes.<projectId>` | `src/nodeTypes.js` | `NodeType[]` | Backend — per-project resource |
| `flowlens.edgeTypes.<projectId>` | `src/edgeTypes.js` | `EdgeType[]` | Backend — per-project resource |
| `flowlens.categories.<projectId>` | `src/categories.js` | `Category[]` | Backend — per-project resource |
| `flashToast` (sessionStorage) | `home.html`, etc. | `{ message, kind, actionLabel? }` | Client-only — survives a single page navigation |

## URL state

The canvas keeps some state in the URL hash / query so refreshes survive:
- Active view ID
- Selected node/edge ID
- Pan/zoom position (debounced)

In production, these belong in the URL too — bookmarkable, shareable.

## Server-owned state (what production must persist)

Anything below is currently mocked in the prototype but **must** be a server resource:

- **Users**: id, email, name, avatar, workspace memberships, operator flag, suspended flag
- **Workspaces**: id, name, internal domain, billing, seat count
- **Workspace members**: workspace × user × status (Member / External)
- **Projects**: id, workspace id, name, description, domain, version, created/updated, owner, archived flag, deleted flag (soft-delete), external policy (comments / exports)
- **Project members**: project × user × role (Owner / Editor / Viewer)
- **Invitations**: token, workspace or project, inviter, invitee email, role, status (pending/accepted/expired), expiry
- **Graphs**: id, project id, version, JSON payload (or normalised tables — see below)
- **Layout overrides**: per (user × view) — yes, this is a *per-user* preference, not project-wide
- **Audit log**: every lifecycle action, role change, member add/remove

## Graph storage shape

Options for production:

**Option A — Document store**: store the full graph JSON as a blob keyed by graph id. Simplest, matches the prototype's mental model.

**Option B — Normalised relational**: split into `nodes`, `edges`, `node_types`, `edge_types`, `views`, `overlays` tables. Better for partial updates and querying, but more upfront work and a migration path when the schema evolves.

The prototype suggests A — every operation either reads the whole graph (canvas open) or commits a whole edited copy. Choose B only if you need cross-graph analytics or live multi-user editing.

## Authentication

The prototype has none. Production needs:

- Email + password (with rate limit + lockout)
- Email verification (24-hour token; see `email-copy.md`)
- Password reset (15-minute token)
- Session management (cookies vs JWT — engineering call; cookies probably cleaner here given multi-page chrome)
- Separate **operator** auth realm — different sign-in page, different session cookie, mutually exclusive. A single browser session is either a regular user OR an operator, never both at once.
- Sign-in notification email (see `email-copy.md`)
- Sign-out clears the session and lands on `signed-out.html`

## Authorisation

Server-side enforcement of the two-axis role matrix (`03-roles-and-permissions.md`). Don't trust the client.

- Every `/project/:projectId/*` endpoint checks (workspace status × project role) against the action being performed
- Read-only mode for Viewers and archived projects is enforced server-side too — write endpoints reject; don't just hide the UI
- Operator endpoints (`operator.solstein.app/api/*`) check the operator flag and are entirely separate from the user API

## Optimistic updates

The prototype is fully synchronous, so optimism is easy. Production should still apply optimism on:
- Toggle a lens
- Switch a view
- Drag a node (layout override)
- Edit inspector fields
- Add / remove views / lenses in Settings

And confirm with the server in the background, rolling back on failure with a toast.

## Caching

- Graphs are large-ish (the sample is ~64 KB). Cache aggressively client-side.
- Type definitions, categories, views, lenses all evolve slowly — etag/lastmod caching is fine.
- User profile + workspace membership — refetch on relevant events, otherwise cache for the session.

## Things that can stay in localStorage

Some keys are legitimately client-only and should stay:
- `flowlens.editLayout` — UI mode preference
- Tweak panel state (until removed entirely)
- Toast flash messages (sessionStorage)
- Recent project history (if you add that feature)
- Last-seen view per project (a remembered nicety)

Everything else needs to round-trip to the server.
