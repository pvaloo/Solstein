# 04 · Canvas Data Model

The graph schema is the single most important contract in the product. Every other system — layout engine, lens evaluator, import wizard, inspector — reads from this shape.

Reference implementation: `src/graph-data.js` and `data/car-insurance-comparison.json`.

## Top-level shape

```json
{
  "project": {
    "id": "car_insurance_comparison",
    "name": "Car Insurance Comparison Market",
    "domain": "Insurance / Comparison",
    "version": "0.1",
    "createdAt": "2026-05-19",
    "description": "End-to-end operational and technical map..."
  },
  "nodes":      [ /* Node */ ],
  "edges":      [ /* Edge */ ],
  "nodeTypes":  [ /* NodeType (optional — auto-derived if absent) */ ],
  "edgeTypes":  [ /* EdgeType (optional — auto-derived if absent) */ ],
  "categories": [ /* Category (optional — defaults seeded) */ ],
  "views":      [ /* View */ ],
  "overlays":   [ /* Lens */ ]
}
```

## Node

```json
{
  "id": "enter_details",                  // unique within graph; stable
  "type": "process",                      // matches a nodeType.id
  "label": "Enter Details",               // human-readable
  "description": "Customer provides...",
  "category": "operational",              // matches a category.id
  "typeLabel": "Process",                 // display label for the type (optional)
  "pos": { "x": 300, "y": 140 },          // canonical position (combined view)
  "metadata": {
    "containsPii": false,
    "automationLevel": "self_service",
    "confidence": "high",
    "evidencedBy": ["e004"],
    "openQuestions": [],
    ...
  }
}
```

### Metadata convention

`metadata` is a flat dict of `string → value`. Values may be:
- `boolean` — e.g. `containsPii: true`
- `string` — e.g. `automationLevel: "manual"`
- `string[]` — e.g. `evidencedBy: ["e004", "e007"]`, `openQuestions: ["Who owns SLA?"]`

The lens evaluator and the Settings UI **auto-discover** which fields exist in the data and what values they take. New metadata fields are introduced via the import wizard (Step 3 — Discover), not free-typed in the lens editor. See `lensMatch.js` for the discovery / evaluation logic.

### Known metadata fields in the sample data

Some are clearly meaningful across most graphs; some are domain-specific. Production should treat the field set as **per-graph** (discovered, not hardcoded).

**Common across nodes:**
- `containsPii: boolean`
- `confidence: "low" | "medium" | "high"`
- `riskLevel: "low" | "medium" | "high"`
- `automationLevel: "manual" | "self_service" | "automated"`
- `systemOfRecord: boolean`
- `dataClassification: "public" | "internal" | "personal" | "personal_sensitive"`
- `businessOwner: string`
- `technicalOwner: string`
- `evidencedBy: string[]` — references to evidence document IDs
- `openQuestions: string[]`

**Common across edges:** same as nodes plus `latency`, `protocol`, `format`, `security`, `schedule`, `condition`, `dataObjectsMoved`.

## Edge

```json
{
  "id": "e042",
  "from": "enter_details",
  "to":   "reg_lookup",
  "type": "user_action",
  "label": "submits",                     // optional
  "description": "...",
  "metadata": { ... }
}
```

`from` and `to` are node IDs. Self-loops are allowed but unusual.

## NodeType

```json
{
  "id": "process",
  "label": "Process",
  "category": "operational",              // links to a category.id
  "color": "oklch(0.76 0.14 75)"          // optional override; falls back to category color
}
```

Default labels for common type IDs live in `src/nodeTypes.js` (`actor`, `process`, `decision`, `state`, `event`, `data_object`, `document`, `input`, `output`, `application`, `external_saas`, `database`, `spreadsheet`, `organisation`, `role`). Unknown types title-case their ID.

## EdgeType

```json
{
  "id": "data_flow",
  "label": "Data Flow",
  "color": "oklch(0.76 0.14 200)"
}
```

## Category

Node categories are the **top-level grouping** under which node types sit. Four built-in categories (cannot be deleted, can be renamed/recolored):

| ID | Label | Default hue |
|---|---|---|
| `operational` | Operational | warm yellow `oklch(0.76 0.14 75)` |
| `information` | Information | cyan `oklch(0.76 0.14 200)` |
| `technical` | Technical | blue/purple `oklch(0.76 0.14 260)` |
| `governance` | Governance | red/pink `oklch(0.76 0.14 25)` |

Users can add custom categories via Settings.

## View

A view is a **filter** — it scopes which node types and edge types are visible, plus how the canvas lays them out.

```json
{
  "id": "journey_view",
  "label": "Journey View",
  "description": "Operational story of the customer quote journey...",
  "includeNodeTypes": ["actor", "process", "decision", "state", "data_object"],
  "includeEdgeTypes": ["user_action", "data_flow", "decision_branch"]
}
```

Layout strategy for the view is in `src/layoutConfigs.js`, keyed by view ID — see `05-canvas-behaviour.md` for layout semantics.

Two views are **built-in** and cannot be deleted:
- `journey_view` — Journey View
- `technical_view` — Technical Architecture

(Locked in `src/settingsPage.jsx` via `isBuiltIn = view.id === 'journey_view' || view.id === 'technical_view'`.)

## Lens (a.k.a. Overlay)

A lens highlights nodes and edges that match a condition. **Data-driven** — the evaluator is `src/lensMatch.js`.

```json
{
  "id": "pii",
  "label": "PII / Sensitive Data",
  "description": "Highlights nodes and edges that...",
  "color": "oklch(0.74 0.14 305)",
  "match": {
    "metadata.containsPii": true
  },
  "alsoMatchNodeTypes": ["data_object"],
  "alsoMatchEdgeTypes": [],
  "alsoMatchMetadata": {},
  "matchEdgesViaEndpoints": true
}
```

### Match semantics

`match` is an object of `dotted-path → value`:
- **All keys are AND'd** — every key must pass for the node/edge to match
- **Array values are OR** — `"metadata.confidence": ["low", "medium"]` means "any of"
- **Special values**: `true`, `false`, `"non_empty"`, `"empty"`
  - `true` → field is truthy AND non-empty
  - `false` → field is falsy OR empty
  - `"non_empty"` → array length > 0 or non-empty string
  - `"empty"` → array empty or absent

### Also-match fields

- `alsoMatchNodeTypes: string[]` — OR'd with `match`; a node of any listed type is included even if its metadata doesn't match
- `alsoMatchEdgeTypes: string[]` — same for edges
- `alsoMatchMetadata: { [field]: value }` — OR within these keys (any key matches → node/edge matches)
- `matchEdgesViaEndpoints: boolean` — when `true` (default), an edge inherits a lens if **both** of its endpoints match. This is how PII chains highlight when only the nodes carry the `containsPii` flag.

### Built-in lenses

Five built-in lenses in the sample data: `pii`, `manual_process`, `unknowns`, `high_risk`, `system_of_record`. All five are **editable** — users can change their `match`, add/remove conditions, change `alsoMatch*` types, even delete them. They're not locked the way built-in views are.

## How the data flows at runtime

```
data/graph.json
  → graph-data.js (window.FLOWLENS_DATA)
  → app.jsx loads it into state
  → app.jsx passes nodes/edges/types/categories/views/overlays as props down the tree
  → canvas.jsx consumes nodes + edges + activeView + activeOverlays
  → layoutEngine.computeLayout(graph, view) returns { positions: { [nodeId]: {x,y} }, lanes: [...] }
  → lensMatch.nodeMatchesLens(node, lens) and edgeMatchesLens(edge, lens, nodeMap)
    decide which nodes/edges get the .is-highlight class
```

## Production schema concerns

- **IDs should be ULIDs/UUIDs** in production, not human-readable strings. The prototype uses slug IDs because the data is hand-authored.
- **Versioning** — the prototype's `project.version: "0.1"` is unused. Production needs real revision tracking for graphs (who edited what, when, rollback).
- **Migration** — when node/edge type IDs are renamed in Settings, the prototype updates the in-memory data but doesn't migrate stored graphs on disk (because there's no disk). Production needs a migration story.
- **Metadata schema evolution** — when a new metadata field is introduced via import, older nodes don't have it. Lens conditions referencing missing fields are treated as non-matches. That's correct, but watch for surprise on the user side.
