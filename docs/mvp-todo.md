# Solstein MVP Todo

This is the living inventory for turning the Claude/static prototype into a working MVP. Update it whenever a page, route, backend resource, or core behavior changes status.

## Current Baseline

- Static prototype screens live as root `*.html` files and have been copied to `original_files/` as the read-only design reference.
- The canvas is the most complete interactive feature and lives in `src/`, loaded by `canvas.html` through Babel and browser globals.
- A Vite + React app now exists with React Router, Supabase client dependency, npm scripts, auth guards, and Vercel SPA rewrites.
- The route inventory is present in the React app. Core workspace/project/import/canvas/auth pages have React implementations; lower-priority legal, profile, verification, invitation, and operator routes currently render the preserved prototype markup inside React.

## MVP Definition

The MVP should let a user sign in, see projects, create/open a project, import or load a graph, explore it on the canvas, switch views, toggle lenses, inspect nodes/edges, and manage the minimum account/project/operator flows needed to make the product feel coherent.

## Implementation Phases

| Status | Phase | Goal |
|---|---|---|
| Done | 1. Local app shell | Add Vite + React app, npm scripts, routing, and local dev/build path. |
| Done | 2. Route inventory port + auth scaffold | All documented routes exist in React Router with public/user/operator guards; some are prototype-backed wrappers pending deeper wiring. |
| In progress | 3. Canvas port | Canvas is loaded by Vite chunks inside the app, but still relies on legacy browser globals/localStorage internally. |
| Done | 4. Static-first data | Bundled sample graph can be loaded/imported; local canvas UI state still works through existing localStorage helpers. |
| In progress | 5. Supabase foundation | Add auth, schema, client, local env docs, and minimal seed data. |
| In progress | 6. Real MVP flows | Workspace/project/import/graph read paths are wired; project lifecycle, invitations, profile, graph save/versioning, and operator data remain. |
| In progress | 7. Vercel readiness | Vercel rewrite exists and `npm run build` passes; env/deploy documentation and deployed verification remain. |

## Page Inventory

| Status | Prototype file | Production route | Auth gate | MVP purpose | Notes |
|---|---|---|---|---|---|
| In progress | `home.html` | `/` | Authenticated user | Workspace dashboard with project list and archived tab. | React route queries workspace projects with graph counts and can create projects; unarchive is still a stub. |
| Done | `new-project.html` | `/new-project` | Authenticated user | Create project flow. | React route uses Supabase project creation RPC. |
| In progress | `project.html` | `/project/:projectId` | Authenticated + project access | Project hub: graphs, members, settings. | React route loads project, graphs, and members; settings/lifecycle modals pending. |
| In progress | `import-wizard.html` | `/project/:projectId/import` | Authenticated + project access | Graph ingestion wizard. | React import route can create sample/uploaded JSON graphs; full six-step wizard UX pending. |
| In progress | `canvas.html` | `/project/:projectId/graph/:graphId` | Authenticated + project access | Main graph viewer and editor surface. | Route renders the interactive canvas with Supabase graph data. Save/version actions still pending. |
| In progress | `profile.html` | `/profile` | Authenticated user | Account settings. | Route exists via prototype-backed React wrapper; Supabase profile editing pending. |
| Done | `sign-in.html` | `/sign-in` | Public auth page | User sign-in. | React page supports sign-in/sign-up and redirects signed-in users to `/`. |
| Done | `forgot-password.html` | `/forgot` | Public auth page | Password reset request. | React page calls Supabase reset email flow. |
| In progress | `reset-password.html` | `/reset/:token` | Public auth page | Set new password. | React page updates Supabase password; token/hash route behavior still needs end-to-end verification. |
| In progress | `verify-email.html` | `/verify/:token` | Public auth page | Email verification. | Route exists via prototype-backed React wrapper; Supabase verification handling pending. |
| In progress | `accept-invite.html` | `/invite/:token` | Public auth page | Invitation acceptance. | Route exists via prototype-backed React wrapper; invitation backend pending. |
| Done | `signed-out.html` | `/signed-out` | Public | Sign-out confirmation. | Route exists via prototype-backed React wrapper. |
| Done | `operator-sign-in.html` | `/operator/sign-in` | Public operator auth page | Operator auth. | React page reuses auth UI with operator copy; operator guard checks metadata. |
| In progress | `operator-dashboard.html` | `/operator/` | Authenticated operator | Operator metrics overview. | Route exists behind operator guard via prototype-backed React wrapper; live metrics pending. |
| In progress | `operator-users.html` | `/operator/users` | Authenticated operator | User administration. | Route exists behind operator guard via prototype-backed React wrapper; backend actions pending. |
| In progress | `operator-invitations.html` | `/operator/invitations` | Authenticated operator | Invitation administration. | Route exists behind operator guard via prototype-backed React wrapper; backend actions pending. |
| Done | `terms.html` | `/terms` | Public | Public legal page. | Route exists via prototype-backed React wrapper. |
| Done | `privacy.html` | `/privacy` | Public | Public legal page. | Route exists via prototype-backed React wrapper. |
| Done | `404.html` | catch-all | Public | Unknown route page. | Router fallback is implemented. |
| In progress | `500.html` | `/500` | Public | Server/app error page. | Route exists; app error boundary wiring pending. |

## Functional Todo

| Status | Area | MVP functionality | Suggested first slice |
|---|---|---|---|
| Done | Build | `npm install`, `npm run dev`, `npm run build` work locally. | Scaffold Vite React and preserve static assets. |
| Done | Routing | Production routes from `docs/02-routes-and-navigation.md` exist. | React Router route map covers workspace, project, canvas, auth, legal, error, and operator routes. |
| In progress | Auth | Email/password sign-in, sign-up, sign-out, reset password, invite acceptance. | Sign-in/sign-up/reset exist; invite acceptance still needs backend table and token handling. |
| In progress | Workspace | List active/archived projects scoped to the signed-in user's workspace. | `/` now uses the active workspace and project table, including per-project graph counts. |
| In progress | Projects | Create, rename, archive, restore, delete, transfer owner. | Create exists through `create_workspace_project`; rename/archive/restore/delete still pending. |
| In progress | Members | Workspace/project member roles. | Project member read UI, owner invite modal, pending invites, and revoke action exist; accepted-member management still pending. |
| In progress | Invitations | Create, accept, expire, revoke invitations. | Project team-member invite migration/RPCs and `/invite/:token` acceptance route exist; email delivery still pending. |
| In progress | Graphs | Store, version, and open project graphs. | Normalized node/edge tables, immutable revision snapshots, create RPC, read RPC, and canvas open route exist; save/new revision is pending. |
| In progress | Import | Upload/validate JSON and create graph. | Minimal sample/upload JSON import exists; full wizard flow pending. |
| In progress | Canvas | Pan/zoom, view switcher, lenses, inspector, replay, export. | Original canvas modules are now loaded as Vite chunks and rendered directly from the graph route. Persistence of edits still needs Supabase wiring. |
| Todo | Canvas editing | Add node, edit metadata, layout overrides, settings. | Keep localStorage initially. |
| Todo | Persistence | Replace prototype localStorage keys with Supabase resources where needed. | Follow `docs/09-state-and-persistence.md`. |
| Todo | Operator | Operator dashboard, users, invitations. | Static route port before privileged backend. |
| Todo | Errors | 404, 500, empty/loading/error states. | Port documented empty states. |
| In progress | Deployment | Vercel build, env vars, production routes. | `vercel.json` SPA rewrite exists and local build passes; env/deploy docs and deployed smoke test remain. |

## Backend Todo

| Status | Resource | Notes |
|---|---|---|
| In progress | Supabase project setup | Auth env is present; workspace/project/graph migrations and RPCs exist. Confirm remote/local migration state before deploying. |
| In progress | Users/profiles | User id, email, name, avatar, suspended/operator flags as needed. Table and bootstrap RPC exist. |
| In progress | Workspaces | Every direct signup gets one default owner workspace. Client bootstrap now calls the RPC after session load. |
| In progress | Workspace members | Workspace role/status. Required for tenant boundary and RLS. Table and RLS exist. |
| In progress | Projects | Name, description, owner, archive/delete lifecycle. Always scoped by `workspace_id`. Create RPC and dashboard wiring exist; lifecycle actions pending. |
| In progress | Project members | Owner, Editor, Viewer roles. Create RPC adds project owner membership; member UI pending. |
| In progress | Invitations | Project invitation table, token-hash storage, list/create/revoke/accept RPCs, expiry status, and React acceptance route exist. Email provider integration pending. |
| In progress | Graphs | Hybrid storage is applied: `graphs` holds the current document identity/payload, `graph_nodes` and `graph_edges` hold editable current state, and `graph_revisions` stores immutable snapshots. `create_project_graph` writes all three layers; `get_graph_document` reads the full document; canvas opens that document. Save/version RPC still pending. |
| Todo | Layout overrides | Per-user, per-view persistence later. |
| Todo | Audit log | Required for lifecycle and admin actions, can be minimal in MVP. |

## Immediate Next Step

Continue the remaining production wiring while preserving visual parity:

1. Add graph edit/save actions that persist current canvas edits and create new `graph_revisions`.
2. Add archive/restore lifecycle actions for projects.
3. Add email delivery for project team-member invitations.
4. Replace prototype-backed profile/operator routes with Supabase-backed React implementations as needed for MVP.
5. Document required Vercel/Supabase env vars and run a deployed smoke test.
6. Browser-smoke-test `/project/:projectId/import` and `/project/:projectId/graph/:graphId` with a signed-in user.
