# 05 · Canvas Behaviour

This is what the canvas actually *does*. Read after `04-canvas-data-model.md` so the data shape is in your head.

## The big picture

The canvas is a single fixed-size SVG/HTML hybrid that pans and zooms. At any moment it shows:

- **One active view** (controls which node types / edge types are visible + how they lay out)
- **Zero or more active lenses** (highlight matching nodes + edges; non-matches are dimmed)
- **Optional layout-edit mode** (drag handles on every node)
- **Optional replay** (animated migration when switching views)

Top-right control panel toggles the view (mutually exclusive) and any number of lenses (toggle on/off independently).

## View switching

When the user switches views:

1. Layout engine recomputes node positions for the new view (or reads from `layoutOverrides` if the user has manually arranged this view).
2. Replay animation kicks in: nodes that exist in both views fade-move-fade between positions; nodes leaving the new view fade out; nodes entering fade in.
3. Lane backdrop swaps to the new view's lanes (if any).
4. Lens highlight set is recomputed (since the visible node/edge set changed).

Replay timing is configured in `app.jsx` as `MIGRATION = { fadeOutMs, moveMs, fadeInMs }`.

## Layout engine

`src/layoutEngine.js` exposes:

- `computeLayout(graph, view)` → `{ positions, lanes }`
- `precomputeAllLayouts(graph, views)` → `{ [viewId]: layout, __combined: layout }`
- `computeLanesForView(graph, view)` → `Lane[]`
- `precomputeAllLanes(graph, views)` → `{ [viewId]: Lane[] }`

### Strategies (in `src/layoutConfigs.js`)

Each view's layout config picks a **strategy** and passes options. The prototype implements:

- **`layered`** — nodes have an explicit `lane` number (1, 2, 3…); the engine groups by lane and stacks them. Lanes get optional shared labels for groups spanning multiple lanes. This is what Journey View and Technical Architecture use.
- **Combined view (no active view)** — uses each node's canonical `pos` from the data directly. No layout computation.

Both strategies merge in `LayoutOverrides.get(viewId)[nodeId]` if the user has manually dragged a node — those overrides survive across page reloads (localStorage per view).

### Adding a new strategy

Define it in `layoutEngine.js` as `function computeXxx(graph, view, config) { ... return { positions, lanes } }`, then dispatch from `computeLayout` based on `config.strategy`. The output contract is fixed: a `positions` map + an array of `Lane` rectangles.

## Lens / overlay highlighting

The evaluator is `window.LensMatch.nodeMatchesLens` and `edgeMatchesLens`. Read `04-canvas-data-model.md` for the match semantics.

For each visible node/edge, the canvas asks: "for every active lens, do you match?" If any active lens matches, the node/edge gets the `is-highlight` class and the lens's accent colour is applied. If no lens matches and there ARE active lenses, the node gets `is-dimmed`.

Multiple lenses overlap additively — if a node matches both `pii` and `high_risk` and both are active, both colours are applied (last-write-wins on the highlight border, but the inspector shows all matches).

Edges inherit a lens in three ways:
1. The edge's own metadata matches the lens's `match`
2. The edge's `type` is in `alsoMatchEdgeTypes`
3. Both endpoints match the lens (when `matchEdgesViaEndpoints: true`, default)

## Inspector

Opens when a node or edge is selected (clicked, or selected via keyboard). Right-side panel; pushes the canvas left.

Two modes (toggle in the inspector header):
- **View** — read-only details: label, type, description, metadata, evidence links, lens matches, connected nodes
- **Edit** — same fields but inline-editable; "Save" commits to the in-memory graph

When the project is read-only (Viewer or archived), the Edit toggle is hidden.

## Edit-layout mode

Toggle in the canvas controls. When on:
- Every node gets a drag handle
- Snapping to a grid (configurable)
- Drag a node → its position is written to `LayoutOverrides[activeViewId][nodeId]` and persisted to localStorage
- Reset button clears overrides for the active view (back to engine-computed positions)

Edit-layout state itself is also persisted (`flowlens.editLayout: '1' | '0'`) so the user lands back in the same mode after refresh.

## Settings page

Modal overlay opened via the gear icon. Six tabs:

| Tab | What it edits |
|---|---|
| **Categories** | Built-in 4 + custom. Rename, recolor, add, delete (custom only) |
| **Node types** | Add / remove / rename / recolor / change category |
| **Edge types** | Add / remove / rename / recolor |
| **Views** | Add / remove / rename / change which types are included. Journey and Technical are locked (Built-in badge instead of delete button) |
| **Lenses** | Add / remove / rename / **edit match conditions** + also-match types. All built-in lenses editable |
| **About** | Project metadata (name, domain, description) |

The lens condition editor is data-driven — field dropdown is restricted to metadata fields actually present in the data (auto-discovered). Boolean fields get a true/false toggle; low-cardinality enums get chip multi-select; array fields get "has any / has none" segments; everything else gets a text input.

## Add-node wizard

Modal opened via the "+ Add" affordance (visible only in edit mode for now). 3-step:
1. **Pick type** — choose node type (with category context)
2. **Details** — label, description, position
3. **Metadata** — for each known metadata field, pick a value

The wizard body scrolls internally if content overflows the viewport — head/stepper/footer stay pinned.

## Export

Top-right "Export" button → modal. Two formats:
- **PNG** — current view, current zoom; can opt for full-graph snapshot regardless of viewport
- **PDF** — same options

JSON export was removed during cleanup — production should not reintroduce it without a clear use case (the graph is in the API anyway).

## Keyboard interactions

| Key | Action |
|---|---|
| `←` / `→` | (Replay context) prev / next step when stepping through a flow |
| `Esc` | Close inspector / close modal / clear selection |
| `Cmd/Ctrl + 0` | Reset zoom to fit |
| `+` / `-` | Zoom in / out |
| `Space + drag` | Pan |

(Not all of these are wired in the prototype — confirm before relying on them.)

