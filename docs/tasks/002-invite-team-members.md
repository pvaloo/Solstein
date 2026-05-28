# Task 002 - Invite Team Members

## Goal

Project owners can invite teammates to a Solstein project by email, assign each invitee a project role, and have accepted invites create the correct workspace and project membership records.

For the MVP, "team member" means an internal workspace member invited to a project as Owner, Editor, or Viewer. External collaborators should use the same invitation foundation, but the first UI path should optimize for internal teammates.

## Current Status

In progress. The Supabase invitation table/RPCs, project members invite modal, pending invite list, revoke action, manual local invite links, and `/invite/:token` acceptance route exist. Production email delivery and accepted-member role/removal controls are still pending.

## Scope

- Add a Supabase invitation resource for pending, accepted, expired, and revoked invites.
- Let project Owners create invitations from the `/project/:projectId` members panel.
- Support one or more invitee emails with a selected project role.
- Accept invitations from `/invite/:token`, routing unauthenticated users through sign-up or sign-in first.
- Insert or activate `workspace_members` and `project_members` rows when an invite is accepted.
- Show pending invitations in the members panel so Owners can revoke or resend them.

## Data Model

```text
projects.workspace_id
  -> invitations.workspace_id
  -> invitations.project_id
  -> invitations.inviter_user_id
  -> invitations.invitee_email
  -> invitations.workspace_role ("member" first, "external" later)
  -> invitations.project_role ("owner" | "editor" | "viewer")
  -> invitations.status ("pending" | "accepted" | "expired" | "revoked")
  -> invitations.token_hash
  -> invitations.expires_at

accepted invitation
  -> workspace_members (workspace_id, user_id, role, status = active)
  -> project_members (project_id, user_id, role)
```

## Backend Rules

- Only active project Owners can create, revoke, resend, or change pending invitations for that project.
- Tokens are stored hashed; the raw token is only sent in the invite link.
- Pending invitations expire after 7 days, matching `docs/email-copy.md`.
- Accepting an invite must verify that the signed-in user's email matches the invitee email case-insensitively.
- Accepting an Owner invite must not leave the project with zero Owners if another owner is later demoted or removed.
- Duplicate pending invitations for the same project and email should update the existing pending invite rather than creating multiple active rows.
- All invite create/accept/revoke actions should eventually write audit log entries, but audit can be a follow-up if the table does not exist yet.

## UI Requirements

- Add an "Invite people" action to the project members tab.
- Modal fields: email list, role selector, optional message placeholder, send/cancel buttons.
- Default role should be Editor for internal teammates.
- Display pending invitations below active members with status, role, expiry, and revoke/resend actions.
- Preserve the prototype distinction between internal members and external collaborators. If an entered email appears outside the workspace domain once workspace domains exist, show the external-warning copy from `docs/03-roles-and-permissions.md`.
- Reuse the empty-state copy in `docs/08-empty-states.md` when a project has no members beyond the current user.

## Acceptance Criteria

- A project Owner can send an invitation from `/project/:projectId`.
- Editors and Viewers cannot see or call member-management actions successfully.
- The recipient can open `/invite/:token`, authenticate if needed, and accept the invite.
- After acceptance, the recipient can open the invited project and has the assigned role.
- Pending invites can be listed and revoked by a project Owner.
- Expired, revoked, and already-accepted tokens cannot be accepted again.
- RLS prevents users from reading or mutating invitations outside projects they can manage.
- `npm run lint` and `npm run build` pass after UI integration.

## Files To Create/Edit

- `supabase/migrations/*_project_invitations.sql`
- `src/lib/invitations.js`
- `src/pages/ProjectPage.jsx`
- `src/pages/PrototypeRoutePage.jsx` or a real `src/pages/AcceptInvitePage.jsx`
- `src/react-app.css`
- `docs/mvp-todo.md`

## Things Not To Build Yet

- Billing or workspace seat enforcement.
- Operator invitation administration beyond keeping `operator-invitations.html` as a prototype route.
- External collaborator policy toggles.
- Email provider integration if local development can log or display the invite link first.
- Workspace switcher or workspace-wide member directory.

## Migration / Env / DB Implications

- New Supabase migration for invitations table, RLS policies, and invite create/accept/revoke RPCs.
- Invite email sending will eventually need provider env vars; for the first local slice, return the accept URL from the create RPC/client call for manual testing.
- Do not store Supabase production credentials or email provider secrets in the repo.

## Test Plan

- Apply migrations to local Supabase.
- Run a local invite acceptance smoke test with two test users.
- Verify project members update after acceptance.
- Verify revoked and expired tokens fail.
- Run `npm run lint` and `npm run build`.
