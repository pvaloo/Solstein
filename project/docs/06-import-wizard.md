# 06 · Import Wizard

Six-step flow at `import-wizard.html`. Brings a JSON graph into the workspace and configures views + lenses before it lands in the canvas. Implemented as a vanilla-JS state machine — no React, lighter touch.

## Step labels

```
1. Upload   2. Validate   3. Discover   4. Views   5. Overlays   6. Import
```

The stepper at the top is clickable to step **backwards**, never forwards (gating logic enforces this).

## State shape (`state` in import-wizard.html)

```js
{
  step: 0..5,
  fileName: string|null,
  fileSize: number|null,
  rawJson: string|null,                  // raw text
  parsed: object|null,                   // JSON.parse result
  validation: { errors: [...], warnings: [...] } | null,
  graphName: string,                     // user-edited project/graph name
  metaFields: { node: [...], edge: [...] }, // discovered metadata fields (Step 3)
  views: [ { id, label, locked, nodes: Set<string>, ... } ],
  activeView: viewId,
  overlays: [ { id, label, color, conditions: [...] } ],
  activeOverlay: overlayId,
  imported: boolean,                     // becomes true after Step 6 commit
}
```

## Step 1 — Upload

- Drop zone for `.json` (drag-drop or click-to-pick)
- Editable "Graph name" field (defaults to file basename)
- File size + line count displayed once a file is picked
- Auto-runs validation; "Next" disabled until errors === 0

## Step 2 — Validate

Issue buckets (`buckets` in code):

| Bucket | What it catches |
|---|---|
| `topLevelShape` | Missing `nodes` or `edges` arrays |
| `nodeNoId` | Nodes without `id` |
| `nodeDuplicateId` | Multiple nodes sharing the same `id` |
| `nodeNoType` | Nodes missing `type` |
| `nodeNoMetadata` | Nodes missing `metadata` object (warning, not error — empty metadata is allowed) |
| `edgeNoEndpoints` | Edges with missing `from` or `to` |
| `edgeDanglingFrom` / `edgeDanglingTo` | Edges referencing nonexistent node IDs |
| `edgeNoType` | Edges missing `type` |

Errors block progression. Warnings are shown but don't gate.

## Step 3 — Discover

Walks every node and edge `metadata` object and tabulates:
- Which fields appear
- Which values each field takes (with cardinality)
- Whether the field is per-node, per-edge, or shared

Displayed as a read-only summary. This is the inventory the user will pick from in Step 5.

**This is the only place new metadata fields enter the system.** They cannot be added free-form in the lens editor — that's deliberate (see `decisions.md`).

A banner at the bottom: *"You'll use these metadata fields to define overlay conditions in Step 5."*

## Step 4 — Views

The user defines or accepts views. Comes pre-seeded with:
- A view per node category found in the data
- Plus any views explicitly declared in the imported JSON

For each view, a multi-select of node types determines what's included. Edge types are derived (any edge whose endpoints are both visible). The active view tab is clickable; "Add view" creates a new one with an empty selection.

**Gating:** every view must have at least one node selected before "Next" enables. The "Add view" UI is inline (no modal).

## Step 5 — Overlays

The lens condition editor. Pre-seeded with the 5 standard lenses (PII, Manual Process, Unknowns, High Risk, System of Record). For each:
- Tab + delete (×)
- Condition rows: `[metadata field ▾]  [operator ▾]  [value]  ×`
- "+ Add condition" appends a row
- "+ Add overlay" adds a new lens

Field dropdown options come from `state.metaFields` (discovered in Step 3). Operator options are the lens-evaluator equivalents (`equals`, `not equals`, `non empty`, `empty`, etc).

Conditions within an overlay are **OR'd** in the wizard's editor — a deliberate choice for accessibility (most users think "any of these → highlight"). The runtime lens evaluator treats keys as AND but allows arrays as OR; the wizard's "OR-by-default" semantic maps to the runtime by collapsing multiple matches with the same field into an array.

## Step 6 — Import

Summary card with:
- Counts: nodes, edges, node types, edge types
- Views defined
- Overlays defined
- A "Commit" button

On commit:
- Graph data lands in localStorage under the new project ID
- User is redirected to `/p/:projectId/g/:graphId` (the canvas)
- Stepper hides (footer hidden after `state.imported === true`)

## What production needs to change

- **Backend ingestion** — Step 6 should POST the parsed graph + views + overlays to the API and stream a redirect to the canvas
- **File size limits** — the prototype reads the entire file into memory. Production needs a sensible cap (probably ~10 MB) with a streaming parser for larger files
- **Async validation** — the prototype validates synchronously on file pick. For larger graphs this should be a worker
- **Error recovery** — if Step 6 commit fails, current UX is "you've lost your wizard state". Production should retry / save the wizard state server-side
- **Re-import** — replacing a graph in an existing project isn't designed. Probably needs explicit "Replace graph" flow with a diff preview
