# 08 · Empty States

Every list-like surface needs a designed empty state. The principle: an empty state is not an error — it's a **first impression** and a **CTA**. Lead with what to do next, never apologise for the absence of data.

Pattern across the product:

1. A centred glyph (often the crystal mark or a domain-relevant primitive — line, circle, polygon)
2. A short heading in Display type
3. One sentence of supporting copy
4. A primary CTA (when an action is possible)

Every state below is reachable in the prototype via the Tweaks panel (`data-state` attribute on `.page`) — flip between full / empty / error views to compare.

## Catalogue

### Workspace empty (`home.html`)

**When:** the signed-in user belongs to a workspace with zero projects.

**Glyph:** crystal mark, large, centred.
**Heading:** "Start your first project"
**Copy:** "A project is a workspace for one client engagement or system map. Create one to import your first graph."
**CTA:** Primary button "New project →" linking to `/new-project`.

### Workspace · Archived tab empty (`home.html`)

**When:** Archived tab opened, no archived projects.

**Heading:** "Nothing archived"
**Copy:** "Archived projects appear here. Restore one to bring it back to your active list."
**No CTA** — the user has to actively archive something first; nothing to do from this view.

### Project · Graphs empty (`project.html`)

**When:** project exists but no graphs have been imported.

**Heading:** "No graphs yet"
**Copy:** "Import a JSON graph to begin mapping. The wizard walks through validation, views, and overlays."
**CTA:** Primary button "Import a graph →" linking to `/project/:projectId/import`.

### Project · Members (just owner)

**When:** project has only the owner.

**Heading:** "Just you so far"
**Copy:** "Invite teammates as Editors, or external clients as Viewers. They'll see the project once they accept."
**CTA:** "Invite people" button opening the invite modal.

### Operator · Users empty / filtered-empty (`operator-users.html`)

Two distinct states:

**Empty (no users at all)** — very rare, only seen on a fresh deploy:
- Heading: "No users yet"
- Copy: "Users appear here once they accept an invitation or sign up."

**Filtered empty (search/filter returns nothing):**
- Heading: "No users match your filter"
- Copy: "Try a different search term, or clear filters."
- CTA: "Clear filters" link

### Operator · Invitations empty / filtered-empty (`operator-invitations.html`)

**Empty:**
- Heading: "No outstanding invitations"
- Copy: "Pending invitations show here until accepted or expired."

**Filtered empty:**
- Same pattern as Operator · Users.

### Canvas — no graph loaded

**When:** the canvas opens but no graph data is available (rare; usually means a bad URL or a deleted graph).

Show a 404-style empty state with: "Graph not found" + "Back to project" link.

### Canvas — view filters everything out

**When:** an active view has `includeNodeTypes` that match no nodes in the graph (e.g. user created a new view but hasn't selected any types yet).

In-canvas empty state, centred:
- Heading: "This view is empty"
- Copy: "No nodes match this view's filters. Edit the view in Settings to include more types."
- CTA: "Open view settings" — opens settings modal scrolled to the active view's row.

### Canvas — all lenses dim everything

**When:** active lenses match no nodes/edges.

Don't redirect — just show all nodes dimmed (the canvas is still useful). Inspector or lens-toggle area can show a small "0 matches" indicator.

### Inspector — node has no metadata

**When:** opened on a node whose `metadata` object is empty.

Inspector shows: "No metadata yet" + a small "Add field" affordance (only visible in edit mode).

## Error / failure states

Treat differently from empty states. Use the warning treatment from the design system (1px amber outline, amber dot prefix) and never hide the underlying surface — the user should be able to retry.

| Surface | Error case | Treatment |
|---|---|---|
| Import wizard step 1 | Invalid JSON | Inline banner inside drop zone: "Couldn't parse JSON" + 1-line excerpt of parse error |
| Import wizard step 2 | Validation errors | Issue list in step body; "Next" disabled until cleared |
| Toast | API call failure | Red toast variant, "Try again" action |
| Canvas | Graph load failure | Full-screen retry surface, "Back to project" + "Retry" |

## What needs design that the prototype doesn't show

- **Loading states** — the prototype renders synchronously from a JSON literal. Production needs skeleton states for: workspace list (1-2s), project page (~500ms), canvas (~1-3s for large graphs).
- **Optimistic state** — toggling a lens or switching a view should be instant. Inspector saves should be optimistic with rollback on failure.
- **Partial failure** — if a graph loads but one of its referenced node types is missing, what happens? Currently nothing graceful. Design fallback.
- **Offline** — out of scope for v1?
