# 07 · Lifecycle Flows

Project-level actions: rename, duplicate, archive / unarchive, delete, transfer ownership. All wired to feed the toast primitive (`solstein-toast.js`).

## Project states

A project is in exactly one of:

| State | UI treatment | Where it appears |
|---|---|---|
| **Active** | Full read/write per role | Workspace → Active tab |
| **Archived** | Read-only for all roles (even Owner). UI carries `is-readonly` class. | Workspace → Archived tab |
| **Deleted** | Gone. Hard-delete after grace period (TBD by ops). | Nowhere |

The Archived state was added so users can park projects without losing them. Restoring is one click (Owner only).

## Actions

### Rename

- Trigger: project page menu, or inline-edit on the project card title
- UI: inline editable label OR a small modal with text input
- Validation: non-empty, ≤ ~120 chars, must be unique within the workspace (case-insensitive)
- Toast on success: *"Renamed to '{newName}'"*
- Permissions: **Owner only**

### Duplicate

- Trigger: project menu → Duplicate
- Effect: deep-copies the project (graph data, views, lenses, layout overrides) with a new ID and `"{originalName} (copy)"` as the name. Members are NOT copied — the duplicate is owned solely by the user who duplicated it.
- Toast: *"Duplicated to '{newName}'"* with an "Open" action
- Permissions: **Owner only**

### Archive

- Trigger: project menu → Archive
- Effect: project moves to the Archived tab; switches to read-only for everyone
- Confirmation: lightweight — single button click
- Toast: *"Archived '{projectName}'"* with an "Undo" action (which immediately unarchives)
- Permissions: **Owner only**

### Unarchive

- Trigger: archived card → "Restore" affordance, or archived tab project menu
- Effect: back to Active state; permissions restored per role
- Toast: *"Restored '{projectName}'"*
- Permissions: **Owner only**

### Delete

- Trigger: project menu → Delete (visually distinct, "destructive" style)
- Confirmation: **type-name modal** — user must type the exact project name to enable the delete button. This is the safety net for an irreversible action.
- Effect: hard-delete after grace period. Audit trail retained.
- Toast: *"Deleted '{projectName}'"* — fires on the next page (workspace) after redirect
- Permissions: **Owner only**

### Transfer ownership

- Trigger: members panel → an editor row → "Transfer ownership"
- Effect: target user becomes Owner; current user is demoted to Editor (NOT removed). They can still work on the project; they just lose owner-only capabilities.
- Confirmation: modal with target user shown; explicit "Transfer" button
- Toast: *"Transferred ownership to {name}"*
- Permissions: **Owner only**

#### External + Owner edge case

If you transfer to an External user, the modal explicitly tells you: *"{name} is External. They'll own this project but still can't create new projects in your workspace."* Confirmation copy needs to remove ambiguity here.

## Toast pattern

`solstein-toast.js` exposes `Toast.show(message, { actionLabel, onAction, kind })`. Used for all lifecycle confirmations.

**Flash toasts across page navigation:** when a destructive action (Delete) redirects to a different page, stash the toast message in `sessionStorage` under `flashToast` and pick it up on the destination page's load. Pattern is already in `home.html` (`<!-- Flash-toast pickup -->` block).

## Confirmation discipline

Use confirmation modals **only** for irreversible actions:
- Delete project → yes (type-name)
- Transfer ownership → yes (low-friction; "Are you sure?")
- Archive → no (Undo toast covers it)
- Rename → no (just submit)

Don't add modals just because an action feels important. Modals are friction; they should match the cost of getting it wrong.

## Open questions

- **Soft-delete grace period**: prototype doesn't define one. Suggest 30 days, with a "Trash" filter on the workspace where Owners can restore in that window. Confirm with ops/legal.
- **Cascade on user delete**: if a workspace member is removed entirely, what happens to projects they uniquely own? Force ownership transfer first? Auto-transfer to workspace admin?
- **Cross-workspace move**: not in the prototype. If a user belongs to multiple workspaces, can they move a project between them? Probably not in v1.
