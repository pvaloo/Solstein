# 02 · Routes and Navigation

## URL mapping

The prototype is filesystem-flat — every screen is its own HTML file at the project root. Below is the intended production routing, mapping each HTML file to the URL it should live at.

### Marketing / public

| File | Production route | Notes |
|---|---|---|
| `terms.html` | `/terms` | Public |
| `privacy.html` | `/privacy` | Public |
| `404.html` | catch-all 404 | Renders for any unknown route |
| `500.html` | server error | Renders for unhandled errors |

### Auth (public, redirect to `/` once signed in)

| File | Production route | Notes |
|---|---|---|
| `sign-in.html` | `/sign-in` | Email + password; "Forgot password?" links to `/forgot` |
| `accept-invite.html` | `/invite/:token` | Lands here from invitation email |
| `forgot-password.html` | `/forgot` | Request reset link |
| `reset-password.html` | `/reset/:token` | Set new password (15-min token from email) |
| `verify-email.html` | `/verify/:token` | Confirm new email address (24-hr token) |
| `signed-out.html` | `/signed-out` | Confirmation after explicit sign-out |

### Workspace (authenticated)

| File | Production route | Notes |
|---|---|---|
| `home.html` | `/` | Workspace dashboard — project list, active + archived tabs |
| `new-project.html` | `/new-project` | Create project wizard |
| `project.html` | `/p/:projectId` | Project hub: graphs, members, settings |
| `import-wizard.html` | `/p/:projectId/import` | 6-step graph ingestion |
| `canvas.html` | `/p/:projectId/g/:graphId` | The main product surface |
| `profile.html` | `/profile` | User account settings |

### Operator portal (separate subdomain)

Operator is a separate product persona with its own sign-in. In production, expose at `operator.solstein.app` (or similar). Operator users do not appear in regular workspace flows.

| File | Production route | Notes |
|---|---|---|
| `operator-sign-in.html` | `operator.solstein.app/sign-in` | |
| `operator-dashboard.html` | `operator.solstein.app/` | Summary stats |
| `operator-users.html` | `operator.solstein.app/users` | User list, filters, suspend/unsuspend |
| `operator-invitations.html` | `operator.solstein.app/invitations` | Outstanding invitations list |

## Auth gating

| Surface | Auth requirement |
|---|---|
| Marketing pages (`terms`, `privacy`, `404`, `500`) | Public |
| Auth pages | Public (redirect signed-in users to `/`) |
| Workspace pages | Authenticated user |
| `/p/:projectId/*` | Authenticated **AND** has access to the project (see `03-roles-and-permissions.md`) |
| Operator subdomain | Authenticated **as operator** — separate role, separate session |

## Navigation chrome

Three distinct chrome variants:

1. **Auth chrome** (`solstein-auth.css`) — bare wordmark + footer. Used on all `/sign-in`, `/forgot`, `/reset`, `/verify`, error, and legal pages.
2. **Workspace chrome** (`solstein-app.css`) — top bar with workspace switcher (future), `+ New project`, user menu. Used on `/`, `/new-project`, `/p/*`, `/profile`.
3. **Operator chrome** (`solstein-operator.css` + `operator-chrome.js`) — operator-specific top bar with section nav. Used on every `operator-*.html` page.

The canvas (`canvas.html`) uses a stripped-down version of workspace chrome — no top bar, just an in-canvas control strip — because the canvas takes the full viewport.

## Cross-page navigation patterns

- **Breadcrumb back from canvas** → project page (`/p/:projectId`)
- **Project deletion** → toast on workspace; the project disappears from active list
- **Invitation accept** → either lands signed-in user on workspace, or routes through sign-up first if they don't have an account
- **Operator user view → impersonate flag** is not in the prototype but is likely needed in production for support

## Old reviewer artefacts (removed in handover)

The prototype had a black "review strip" at the top of every page linking between screens. **This has been deleted.** No `review-strip.css`, `review-strip.js`, or `<div class="review-strip">` should exist in the production build.
