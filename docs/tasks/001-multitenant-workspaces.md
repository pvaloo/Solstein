# Task 001 - Multi-Tenant Workspace Foundation

## Goal

Every Solstein signup must belong to a tenant workspace. For direct MVP signups, create one default workspace and make the signing-up user its owner. All future project, graph, member, invitation, and canvas data must hang from this workspace boundary.

## Scope

- Add Supabase tables for profiles, workspaces, workspace memberships, projects, project memberships, and graphs.
- Enable RLS so users can only access data through workspace membership.
- Add a signup bootstrap flow that creates a profile, workspace, and owner membership.
- Keep the UI simple: one default workspace per user for now, no workspace switcher yet.

## Data Model

```text
auth.users
  -> profiles.user_id
  -> workspace_members.user_id
  -> workspaces.id
  -> projects.workspace_id
  -> graphs.project_id
  -> graph_revisions.graph_id
  -> graph_nodes.graph_id
  -> graph_edges.graph_id
```

## RLS Rules

- A user can read a workspace only if they have an active `workspace_members` row for it.
- A user can read projects/graphs only through active workspace membership.
- Workspace owners can manage workspace members and projects.
- Project owners/editors can update project graphs.
- Project graph nodes/edges are editable current state; graph revisions are append-only snapshots for version history.
- Operators are separate and should not bypass regular RLS until operator flows are explicitly built.

## Signup Bootstrap

Preferred MVP approach:

1. React sign-up calls a `bootstrap_user_workspace` RPC after the user has a valid session.
2. The RPC inserts `profiles`, `workspaces`, and a `workspace_members` owner row.
3. The RPC is idempotent: if the profile/workspace already exists, it returns the existing default owner workspace.

Fallback:

- A database trigger on `auth.users` can create the default profile/workspace. Use this if client-side bootstrap proves unreliable with email confirmation.

## Acceptance Criteria

- New direct signups get exactly one default workspace and owner membership.
- Existing signed-in users without a workspace can be bootstrapped safely.
- The workspace dashboard queries projects through the current workspace, not directly by user.
- RLS prevents a user from reading another user's workspace/projects/graphs.
- `npm run lint` and `npm run build` pass after UI integration.

## Files To Create/Edit

- `supabase/migrations/001_multitenant_workspaces.sql`
- `src/lib/workspaceBootstrap.js`
- `src/auth/AuthProvider.jsx` or a small post-login bootstrap hook
- `src/pages/SignInPage.jsx`
- `src/pages/WorkspacePage.jsx` once `home.html` is ported
- `docs/mvp-todo.md`

## Things Not To Build Yet

- Workspace switcher
- Billing/seat enforcement
- Invite acceptance flow
- Operator impersonation/admin bypass
- Graph editor UI for creating later revisions from node/edge edits
