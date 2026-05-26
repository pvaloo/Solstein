# 03 · Roles and Permissions

Solstein uses a **two-axis role model**. A user's effective capabilities are the intersection of their workspace status and their per-project role.

## The two axes

### Axis 1 — Workspace status

| Status | Description |
|---|---|
| **Member** | Belongs to the workspace. Can be added as Owner / Editor / Viewer on any project. Can create new projects (subject to workspace seat limits). Has a seat. |
| **External** | Invited as a collaborator on specific projects only. No workspace seat. Cannot create projects. Visible to internal members tagged "External". |

### Axis 2 — Project role

| Role | Description |
|---|---|
| **Owner** | Full control: rename / archive / delete the project, manage members, transfer ownership, edit graph data, edit views and lenses, export. |
| **Editor** | Edit graph data, edit views and lenses, export. Cannot manage members or destroy the project. |
| **Viewer** | Read-only. Can pan / zoom / inspect / toggle lenses. Cannot edit. |

Every project always has **at least one Owner**. You cannot demote yourself if you're the only owner; the UI offers "Transfer ownership" instead.

## Capability matrix

| Action | Owner | Editor | Viewer |
|---|---|---|---|
| Read graph | ✓ | ✓ | ✓ |
| Toggle lenses, switch views | ✓ | ✓ | ✓ |
| Inspect nodes / edges | ✓ | ✓ | ✓ |
| Edit node/edge metadata | ✓ | ✓ | — |
| Edit views and lenses (Settings) | ✓ | ✓ | — |
| Edit layout (drag nodes) | ✓ | ✓ | — |
| Import new graph (wizard) | ✓ | ✓ | — |
| Add / remove members | ✓ | — | — |
| Change member roles | ✓ | — | — |
| Transfer ownership | ✓ | — | — |
| Rename project | ✓ | — | — |
| Duplicate project | ✓ | — | — |
| Archive / unarchive project | ✓ | — | — |
| Delete project | ✓ | — | — |

## External collaborator semantics

Internal-Member × Editor is the typical "team member" combination. External × Viewer is the typical "client reviewer" combination.

**Edge cases:**

- **External × Owner** is *allowed* but explicitly flagged in the UI: promoting an external user to Owner does NOT grant workspace membership. They still can't create new projects, but they can transfer the project to another user. (See `project.html` line ~1550 for the inline reassurance copy.)
- **External viewers** have two project-level toggles that an owner controls:
  - **External viewers can comment** — allow client-side viewers to leave notes against nodes and edges (on by default)
  - **External viewers can export** — allow external viewers to download PNG/PDF (off by default)
- **Inviting external users**: when the invite modal detects email addresses outside the workspace's internal domain (e.g. `acme-insurance.com` invited into a `consultancy.com` workspace), it shows an inline banner: "*N addresses look external. They inherit this project's external viewer policy.*" The banner links to project settings.

## Read-only mode unification

Two different conditions produce the same read-only UI scaffolding:

1. **Viewer role** — by permission
2. **Archived project** — even Owners and Editors see read-only when a project is archived (until they unarchive it)

Implementation: the same `is-readonly` body class drives both. All edit affordances (drag handles, "+ Add" buttons, edit-layout toggle, etc.) check this class.

## Operator role (separate axis entirely)

The operator portal is for Solstein staff who administer the broader system — they can suspend users, see all invitations, etc. **Operator is not on the workspace × project matrix.** It's a separate authentication realm at `operator.solstein.app`.

An individual person may have both a regular user account and an operator account; they use different sign-in pages and different sessions.

## Implementation cues from the prototype

In `project.html`, member rows carry data attributes the production UI should preserve in API responses:

```html
<div class="row"
     data-role="owner|editor|viewer"
     data-self="true|false"
     data-external="true|false"
     ...>
```

The role menu (`.member-menu`) is built off these attributes and applies the demotion-protection logic in JS.

## Open questions for engineering

- **Seat limits**: the prototype doesn't enforce workspace seat caps on Member adds. Production likely needs billing-tied limits with a clear "you've hit your cap" state.
- **Workspace admin role**: there's currently no role *above* project owner. If you need workspace-wide admin (manage billing, manage all projects regardless of project role), it's a third axis to design.
- **Operator impersonation**: not in the prototype. If support needs "view as user", design it explicitly with audit trail.
- **Audit log**: changes (role changes, deletions, transfers) should leave a paper trail. Not in prototype.
