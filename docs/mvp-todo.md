# Solstein MVP Todo

This is the living inventory for turning the Claude/static prototype into a working MVP. Update it whenever a page, route, backend resource, or core behavior changes status.

## Current Baseline

- Static prototype screens live as root `*.html` files and have been copied to `original_files/` as the read-only design reference.
- The canvas is the most complete interactive feature and lives in `src/`, loaded by `canvas.html` through Babel and browser globals.
- A Vite + React scaffold now exists with React Router, Supabase client dependency, npm scripts, and a route shell.
- The current route shell is not yet a full page port; it is the foundation for porting each design from `original_files/html/`.

## MVP Definition

The MVP should let a user sign in, see projects, create/open a project, import or load a graph, explore it on the canvas, switch views, toggle lenses, inspect nodes/edges, and manage the minimum account/project/operator flows needed to make the product feel coherent.

## Implementation Phases

| Status | Phase | Goal |
|---|---|---|
| Done | 1. Local app shell | Add Vite + React app, npm scripts, routing, and local dev/build path. |
| In progress | 2. Route inventory port + auth scaffold | Convert each root HTML screen into a React route while preserving visual design; wire basic Supabase auth guards. |
| Todo | 3. Canvas port | Convert `src/` globals/Babel modules into ES modules inside the app build. |
| Todo | 4. Static-first data | Load bundled sample graphs and keep local UI state working. |
| In progress | 5. Supabase foundation | Add auth, schema, client, local env docs, and minimal seed data. |
| Todo | 6. Real MVP flows | Wire projects, invitations, imports, graphs, profile, and operator pages to Supabase. |
| Todo | 7. Vercel readiness | Build cleanly, document env vars, and verify deploy behavior. |

## Page Inventory

| Status | Prototype file | Production route | Auth gate | MVP purpose | Notes |
|---|---|---|---|---|---|
| In progress | `home.html` | `/` | Authenticated user | Workspace dashboard with project list and archived tab. | React route now queries workspace projects with graph counts and can create projects; archive restore still pending. |
| In progress | `new-project.html` | `/new-project` | Authenticated user | Create project flow. | React route now uses Supabase project creation RPC; signed-in create smoke test still needed. |
| In progress | `project.html` | `/project/:projectId` | Authenticated + project access | Project hub: graphs, members, settings. | React route loads project, graphs, and members; settings/lifecycle modals pending. |
| In progress | `import-wizard.html` | `/project/:projectId/import` | Authenticated + project access | Graph ingestion wizard. | Minimal React import route can create sample/pasted JSON graphs; full six-step wizard pending. |
| In progress | `canvas.html` | `/project/:projectId/graph/:graphId` | Authenticated + project access | Main graph viewer and editor surface. | Route now renders the original interactive canvas modules inside the React app with Supabase graph data. Save/version actions still pending. |
| Todo | `profile.html` | `/profile` | Authenticated user | Account settings. | Supabase auth profile later. |
| Todo | `sign-in.html` | `/sign-in` | Public auth page | User sign-in. | Redirect signed-in users to `/`. |
| Todo | `forgot-password.html` | `/forgot` | Public auth page | Password reset request. | Redirect signed-in users to `/`. |
| Todo | `reset-password.html` | `/reset/:token` | Public auth page | Set new password. | Token handling needed. |
| Todo | `verify-email.html` | `/verify/:token` | Public auth page | Email verification. | Supabase flow may alter exact route. |
| Todo | `accept-invite.html` | `/invite/:token` | Public auth page | Invitation acceptance. | May continue into sign-up/sign-in before landing in app. |
| Todo | `signed-out.html` | `/signed-out` | Public | Sign-out confirmation. | Simple public route. |
| Todo | `operator-sign-in.html` | `operator/sign-in` or operator subdomain `/sign-in` | Public operator auth page | Operator auth. | Decide subdomain routing for Vercel. |
| Todo | `operator-dashboard.html` | operator subdomain `/` | Authenticated operator | Operator metrics overview. | Can use mocked metrics first. |
| Todo | `operator-users.html` | operator subdomain `/users` | Authenticated operator | User administration. | Needs operator role enforcement. |
| Todo | `operator-invitations.html` | operator subdomain `/invitations` | Authenticated operator | Invitation administration. | Needs backend. |
| Todo | `terms.html` | `/terms` | Public | Public legal page. | Placeholder legal copy. |
| Todo | `privacy.html` | `/privacy` | Public | Public legal page. | Placeholder legal copy. |
| Todo | `404.html` | catch-all | Public | Unknown route page. | Implement router fallback. |
| Todo | `500.html` | error boundary route | Public | Server/app error page. | Use with error boundary. |

## Functional Todo

| Status | Area | MVP functionality | Suggested first slice |
|---|---|---|---|
| Done | Build | `npm install`, `npm run dev`, `npm run build` work locally. | Scaffold Vite React and preserve static assets. |
| In progress | Routing | Production routes from `docs/02-routes-and-navigation.md` exist. | Add React Router route map with placeholder wrappers. |
| In progress | Auth | Email/password sign-in, sign-up, sign-out, reset password, invite acceptance. | Sign-in/sign-up/reset scaffolding exists; invite acceptance still needs backend table. |
| In progress | Workspace | List active/archived projects scoped to the signed-in user's workspace. | `/` now uses the active workspace and project table, including per-project graph counts. |
| In progress | Projects | Create, rename, archive, restore, delete, transfer owner. | Create exists through `create_workspace_project`; rename/archive/restore/delete still pending. |
| Todo | Members | Workspace/project member roles. | Read-only UI first; enforce after schema. |
| Todo | Invitations | Create, accept, expire, revoke invitations. | Backend-only once auth exists. |
| In progress | Graphs | Store, version, and open project graphs. | Normalized node/edge tables plus immutable revision snapshots now exist; canvas open route is next. |
| In progress | Import | Upload/validate JSON and create graph. | Minimal sample/paste JSON import exists; full wizard flow pending. |
| In progress | Canvas | Pan/zoom, view switcher, lenses, inspector, replay, export. | Original canvas modules are now loaded as Vite chunks and rendered directly from the graph route. Persistence of edits still needs Supabase wiring. |
| Todo | Canvas editing | Add node, edit metadata, layout overrides, settings. | Keep localStorage initially. |
| Todo | Persistence | Replace prototype localStorage keys with Supabase resources where needed. | Follow `docs/09-state-and-persistence.md`. |
| Todo | Operator | Operator dashboard, users, invitations. | Static route port before privileged backend. |
| Todo | Errors | 404, 500, empty/loading/error states. | Port documented empty states. |
| Todo | Deployment | Vercel build, env vars, production routes. | Add README deploy section after build works. |

## Backend Todo

| Status | Resource | Notes |
|---|---|---|
| In progress | Supabase project setup | Auth env is present; `001_multitenant_workspaces` is applied to Supabase. |
| In progress | Users/profiles | User id, email, name, avatar, suspended/operator flags as needed. Table and bootstrap RPC exist. |
| In progress | Workspaces | Every direct signup gets one default owner workspace. Client bootstrap now calls the RPC after session load. |
| In progress | Workspace members | Workspace role/status. Required for tenant boundary and RLS. Table and RLS exist. |
| In progress | Projects | Name, description, owner, archive/delete lifecycle. Always scoped by `workspace_id`. Create RPC and dashboard wiring exist; lifecycle actions pending. |
| In progress | Project members | Owner, Editor, Viewer roles. Create RPC adds project owner membership; member UI pending. |
| Todo | Invitations | Token, invitee, role, expiry, status. |
| In progress | Graphs | Hybrid storage is applied: `graphs` holds the current document identity/payload, `graph_nodes` and `graph_edges` hold editable current state, and `graph_revisions` stores immutable snapshots. `create_project_graph` writes all three layers; `get_graph_document` reads the full document. Canvas not wired yet. |
| Todo | Layout overrides | Per-user, per-view persistence later. |
| Todo | Audit log | Required for lifecycle and admin actions, can be minimal in MVP. |

## Immediate Next Step

Continue auth and page porting while preserving visual parity:

1. Sign in and smoke-test `/project/:projectId/import` by importing the sample graph into the normalized/versioned graph storage.
2. Browser-smoke-test `/project/:projectId/graph/:graphId` and fix any runtime issues from the legacy canvas modules.
3. Add graph edit/save actions that create new `graph_revisions`.
4. Add archive/restore lifecycle actions for projects.
5. Keep `/original_files/html/canvas.html` and `/original_files/html/project.html` open as parity references.
6. Run `npm run lint`, `npm run build`, and browser verification.
