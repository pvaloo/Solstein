# Inspector Panel Editing

_Started 2026-05-21 19:43 UTC_

---

## User

forget about the back end for the inspector panel but I'd like there to be an option to make edits to the data displayed in the inspector panel do not make any edits present a plan of what you would like that to look like

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: grep]_

_[tool: read_file]_

# Inspector edit mode — plan

Here's how I'd approach making the inspector panel editable. No changes made yet — just the proposal.

## 1. Edit affordance model

Two interaction modes to consider, in order of preference:

**A. Inline editing (recommended).** Every value is hover-revealable as editable. Click a value → it transforms in place into the appropriate control. Click outside, press Enter, or Tab to commit. Press Esc to revert. No global "edit mode" toggle, no Save button — feels like Notion / Linear / Figma's property panel.

**B. Explicit edit mode.** A small pencil button in the header puts the whole panel into edit mode; all fields become controls at once with a Save / Cancel bar at the bottom.

I'd go with **A**, with one caveat: list fields (Open Questions, Connections, Data Objects, Evidence) get explicit "+ Add" affordances and per-row delete buttons that only appear on row hover.

## 2. Control types per field

The inspector already knows the shape of each field. Map them to controls:

| Field kind | Examples | Control |
|---|---|---|
| Short free text | `label`, `businessOwner`, `vendor`, `condition` | inline single-line text input, autosizes |
| Long free text | `description`, edge `label` | inline textarea, autogrows |
| Enum (closed set) | `dataClassification`, `riskLevel`, `automationLevel`, `maturity`, `monitoring`, `confidence`, `protocol`, `format`, `latency`, `schedule`, `security` | tiny segmented control if ≤4 options, otherwise a lightweight popover menu — never a native `<select>` |
| Boolean | `containsPii`, `systemOfRecord` | two-state pill toggle (Yes / No) — clicking the existing pill cycles it |
| Node type / category | `type`, `category` (header) | popover icon-grid picker |
| Edge type | edge `type` | popover menu (data flow, trigger, dependency, etc.) |
| ID references | `dataObjectsMoved`, `evidencedBy` | chip list + "+ Add" opens a typeahead over the graph's nodes / evidence |
| String list | `openQuestions` | each row is editable text; "+ Add question" appends; row hover shows ✕ |
| Endpoints | edge `from` / `to` | **not editable here.** Reassigning an endpoint is really a graph edit — leave this to canvas drag-rewire, but show a subtle "Rewire on canvas" hint |
| Read-only | `id` | stays read-only, with a copy-on-click affordance |

## 3. Empty fields — "add a property"

Right now, fields with no value are hidden entirely. In edit mode I'd add a small **+ Add field** menu at the bottom of each section (Ownership & Stack, Properties, Mechanism) listing the fields that aren't currently set. Clicking adds the row with focus in the control. This avoids cluttering the panel with empty rows while still making every field reachable.

## 4. Visual treatment

- Editable values get a 1px dotted underline on hover plus a subtle background tint matching `--inspector-tint`.
- Active editor: solid 1px border in the category color, no shadow, no rounded box — keep the panel's flat, dense feel.
- Pills (PII, System of record, High risk, Manual) in the header become directly clickable to toggle the underlying boolean / enum. Hover shows the cycle behavior.
- The risk strip becomes a 3-segment clickable control (low / med / high).
- The confidence meter becomes a 3-step clickable control (low / medium / high).
- A small "edited" dot appears next to a field that's been changed but not yet "committed" to the persistence layer you'll wire up later. Since the back end is out of scope, I'd buffer changes in component state and treat them as final on blur — no save bar.

## 5. List interactions

- **Open Questions:** rows are text inputs; Enter on a row creates a new one below; backspace on an empty row removes it.
- **Connections:** read-only listing (these are derived from edges). Editing happens by adding/removing edges on the canvas.
- **Data Objects Moved:** chips with ✕ on hover; "+ Add data object" opens a typeahead filtered to `data` / `dataset` nodes in the graph.
- **Evidence:** chip list with the same pattern; "+ Link evidence" opens a typeahead over `evidenceMap`.

## 6. Header edits

- Title → click to edit `label`.
- Subtitle (typeLabel) → derived from `type`; clicking opens the type picker.
- Breadcrumb category → click to open category picker (operational / information / technical / governance) — this also re-tints the whole panel live.

## 7. Validation & constraints (lightweight, client-side only)

- `label` cannot be empty (revert on blur).
- Enum fields can only ever hold a value from the known set (controls enforce this).
- Boolean toggles always have a value.
- Anything more (uniqueness of labels, referential checks on `dataObjectsMoved`) is back-end work — out of scope per your note.

## 8. What I'd build first vs. defer

**First pass:**
- Inline text editing for `label`, `description`, ownership rows, `condition`.
- Pill toggles for booleans.
- Segmented controls for the small enums (risk, confidence, automation, maturity).
- Add/remove/edit for Open Questions.

**Second pass:**
- Popover pickers for larger enums (protocol, format, schedule, security, classification).
- Typeahead pickers for Data Objects Moved and Evidence references.
- Header type/category pickers.

**Deferred:**
- Endpoint rewiring (belongs on canvas).
- Any persistence beyond in-memory state.

---

Let me know which parts you'd like to adjust — especially (a) inline vs. explicit edit mode, (b) whether headers should be editable in this pass, and (c) whether the "+ Add field" menu for empty properties is worth the added UI weight. Then I'll build it.

## User

1 - yes go with A
2 - ok
3 - yes we need to ave a way to add a field of metadata
4 - ok
5 - ok

all good go ahead

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: update_todos]_

Plan confirmed. Going to build it now. Approach:

- New `src/editControls.jsx` with reusable inline editors (text, segmented, enum popover, bool toggle, list editor, add-field menu)
- Refactor `src/inspector.jsx` so every value cell is editable inline; description always available; "+ Add field" menu surfaces unset properties
- Edits mutate the in-memory `node.metadata` / `edge.metadata` and bump a version counter in `App` so the canvas re-renders too
- Styling that fits the existing dense, flat look — hover dotted underline, active editor uses category tint

Let me create the new files and wire them up.

_[tool: run_script]_

_[tool: write_file]_

Now writing the edit controls:Now the inspector rewrite:

_[tool: write_file]_

_[tool: grep]_

Now appending CSS for the editable affordances:

_[tool: run_script]_

_[tool: run_script]_

Now wire `onEdit` through `App.jsx` and load `editControls.jsx`:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: fork_verifier_agent]_

Built the inline edit layer for the inspector — no back-end changes, all edits mutate the in-memory graph and re-render.

**What's editable now**
- **Title & description** — click to edit inline, Enter commits, Esc reverts
- **All ownership/properties/mechanism fields** — text fields, popover enums, Yes/No toggles, 3-step segmented controls for Risk and Confidence
- **Open Questions** — add/remove/edit; hover to reveal ✕
- **+ Add field** menu at the bottom of each metadata section lists unset properties; clicking adds it and immediately puts the control into edit mode

**What's intentionally not editable**
- Endpoints (rewire on the canvas — there's a small note saying so)
- Connections list (derived from edges)
- Evidence references and Data Objects Moved (deferred to a second pass — these need a typeahead over the graph)
- Header pills (read-only indicators; toggle via the Properties row instead)

Verifier is running.

## User

Verifier agent check completed

## User

Verifier agent check completed

## User

Verifier agent check completed

## Assistant

Verified clean. Inline editing in the inspector is fully working — title, description, all metadata fields (text, enums, bool toggles, Risk/Confidence segmented), Open Questions add/edit/remove, and "+ Add field" menus for surfacing unset properties across both nodes and edges.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Removed — both the connections note and the matching one in the edge Endpoints section (same pattern, same noise). Refresh to see the cleaner panel.

## User

where do the topiotns from the add field here come from?

## Assistant

They come from a hard-coded schema in `src/inspector.jsx` — the `NODE_FIELDS` array near the top of that file (and `EDGE_FIELDS` for edges).

Each entry defines: the metadata key, label, control kind (text / bool / enum / risk / confidence), and which section it belongs to. The "+ Add field" menu in Properties is just `NODE_FIELDS.filter(f => f.section === 'properties')` minus whatever's already set on this node.

For the Properties section the full set is:
- Classification, Contains PII, System of Record, Risk Level, Automation, Maturity, Monitoring, Confidence

Your screenshot shows 4 already set (Classification, Contains PII, Risk Level, Confidence), so the menu correctly offers the remaining 4: System of Record, Automation, Maturity, Monitoring.

The enum *values* for each field (e.g. Classification's `personal_sensitive`, `internal`, `commercial`…) are also hard-coded in that same array, in the `options:` list per field.

If you want to:
- **Add a brand-new metadata field** (e.g. "Cost Center"), add an entry to `NODE_FIELDS` or `EDGE_FIELDS`.
- **Change the options for an existing enum** (e.g. add `mature` to Maturity, or a new Classification value), edit the `options:` array on that entry.

Want me to make the schema data-driven (e.g. derive it from `graph-data.js` so editing the data file automatically updates the picker), or are hard-coded defs fine?

## User

Apply comment

## Assistant

_[tool: read_file]_

_[tool: grep]_

I'll replace the placeholder with real swatch-based color pickers wired to the live CSS variables.

_[tool: write_file]_

Now CSS for the picker UI:

_[tool: run_script]_

_[tool: done]_

Replaced the placeholder with a real picker per category row:

- **8-swatch oklch palette** (consistent L/C, varying hue) — clicking applies the color live to the canvas via the underlying CSS variables
- **Custom button** opens the OS color picker for free choice
- **Reset arrow** next to a category when it's been changed; **Reset all** appears at the bottom when any override exists
- **Persists** in `localStorage`, so changes survive reload

Current swatch on the left of each row reflects the live color.

## User

Apply comment

## Assistant

Quick plan — small but worth a sec:

**Plan**
- Small **View / Edit** segmented toggle in the header, top-right of the breadcrumb (left of the close button). Persists in `localStorage` so it survives reload and applies across selections.
- **View mode** (default): the original read-only render — filtered KV rows that hide unset values, no inline editors, no "+ Add field" buttons, no Yes/No toggles. Includes Connections, Endpoints, Evidence, ID footer.
- **Edit mode**: current behavior — but hides sections you can't actually edit here (Connections, Endpoints, Evidence, ID footer). Just the editable surface, nothing else.
- The toggle is global, not per-item.
- Title in the header stays read-only in View, editable in Edit (matches the rule).

**Implementation cost**
Moderate. I need to restore the old read-only NodeInspectorBody/EdgeInspectorBody renderers (~60 lines I deleted) alongside the new editable ones, then route between them via a `mode` prop. No data model changes.

Want me to go ahead? Open questions:
1. Default mode — **View** or **Edit**? (I'd default View.)
2. Should the toggle be **per-item** (each node remembers) or **global** (one setting for the whole panel)? I'd go global.

## User

go. default is view. global

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

Now strip non-editable sections from edit bodies and add the View/Edit toggle:

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now add the mode toggle and route:

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now CSS for the mode toggle:

_[tool: run_script]_

_[tool: done]_

_[tool: fork_verifier_agent]_

View/Edit toggle added — defaults to View, persists globally in `localStorage`, and swaps between the original read-only layout (everything including Connections, Evidence, ID footer) and the editable layout (just the editable surface; non-editable sections hidden). Title also goes read-only in View mode. Verifier is checking.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Good catches. Three fixes:

1. **Defaults now live in the palette** — normalized both to the same recipe `oklch(0.76 0.14 H)`. The 8 palette hues are `25, 75, 130, 175, 200, 260, 300, 340` — picked for roughly even spacing around the color wheel while *including* all four default hues exactly, so when the default is active that swatch lights up.

2. **Custom picker seeds with current color** — the native input now opens at whatever color the category currently is (oklch values are converted to hex via a hidden DOM probe so the input accepts them).

3. **Palette reasoning** — single L/C (0.76 / 0.14) keeps every swatch perceptually similar in brightness and saturation on the dark theme, varying only hue. That avoids any one swatch screaming louder than the others.

_[tool: done]_

Fixed:

1. **Defaults now match palette swatches** — both use the same recipe `oklch(0.76 0.14 H)`, so each default category's swatch lights up in the picker. Hues: `25 (governance), 75 (operational), 130, 175, 200 (information), 260 (technical), 300, 340`.
2. **Custom picker pre-seeds with current color** — opens the native color picker at whatever the category is currently set to (oklch values get converted to hex via a DOM probe).
3. **Custom button shows current color** instead of a generic rainbow, so it doubles as a current-color indicator if the active color isn't one of the swatches.

On the palette choice: 8 hues at fixed L=0.76 / C=0.14, chosen to (a) include all four default hues exactly so swatches match, (b) cover the wheel reasonably evenly, (c) avoid muddy regions on dark backgrounds. If you want a different set (warmer, cooler, more options, fewer), say the word and I'll re-pick.

## User

Apply comment

## User

Apply comment

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Fair. The label was meant to say "you haven't changed this category's color since you opened the file" — but "DEFAULT / CUSTOM" is ambiguous (you could read it as "this is the default palette swatch" vs "an arbitrary color"). Let me make it explicit.Now it says **"Original color — unchanged"** for untouched categories and **"Edited — click ↺ to revert"** when you've changed one. The ↺ matches the actual reset button so the connection is obvious.

## User

Or just nothgn, its not actually a default right?

## Assistant

_[tool: str_replace_edit]_

Right — there's no actual "default" in the project's data model, it's just whatever was originally written. Removing it.Gone. Just the category name now; the reset arrow speaks for itself when a color's been changed.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

The probe was using `display: none`, which can confuse computed-style resolution for `oklch()` in some browsers. Switching to a canvas conversion (rock-solid across browsers and oklch values):

_[tool: eval_js_user_view]_

Canvas conversion confirmed working — `oklch(0.76 0.14 75)` → `#e4a339`. The native picker now opens at the current category color.

## User

If we consider the layered views to esentially be x and y coords (columns and rows), can we drag nodes in a place? Not complete free but into these slots? Plan

## Assistant

Quick plan — this is a meaty feature, want to nail the shape before building.

## The model

Each lane-based view defines a grid: **lanes are rows**, and the layout engine already lays nodes out in **columns** (loosely aligned x-positions). A "slot" = `(lane, column)`. Free-form views (Combined) have no lanes, so dragging there snaps to a coarser pixel grid (e.g. 20px) instead.

## Interaction

- **Click-and-hold** a node, drag it to a new slot.
- Live: a faint highlight on the target slot (lane band + column outline) follows the cursor.
- Other nodes don't shift on drop — slots are sparse, multiple nodes can stack in one slot only if the user really pushes them together (or we forbid it and snap to nearest free slot).
- **Release outside a slot** snaps to nearest valid slot. Esc cancels.
- During drag: edges re-route in real time (they already follow positions, so this is free).
- Disabled during the view-migration animation and during replay playback.

## Persistence

- Each view has its own `allLayouts[viewId][nodeId] = {x,y}`. Dragging mutates that map for the **current view only**.
- Persisted in `localStorage` under `flowlens.layoutOverrides.<viewId>`, merged over the precomputed layout on load.
- A small "Reset layout" affordance in the view's control panel reverts overrides.

## Open questions

1. **Slot collision** — allow stacking, prevent it (snap to nearest free), or swap with the displaced node? I'd default to **snap to nearest free**.
2. **Cross-lane drag** — a node moved into a different lane: should it stay there persistently in that view? Or refuse since "lane" is conceptually meaningful (e.g. "Customer-facing" lane)? I'd allow it — it's the user's canvas.
3. **Combined view** — drag enabled there too? (Combined uses `node.pos` from the data file; overrides would only live in localStorage, not the JSON.) I'd say **yes, with coarse snap**, no lanes.
4. **Edit mode gating** — only allow drag when inspector is in "Edit" mode? Or always? I'd default to **always**, since this is more "rearranging" than "editing data."
5. **Visual affordance for draggable** — cursor: grab on hover? A small handle that appears on hover? Or just make the whole node draggable when not clicking the title? I'd go with **cursor: grab on the node body, click still selects** (long-press or threshold-based drag to disambiguate).

## What changes in code

- `src/canvas.jsx`: add mouse-down → drag → drop handlers on nodes; compute snap targets from `activeLanes` + column extraction; render slot indicator during drag.
- `src/app.jsx`: hold layout-override state, merge with `allLayouts`, persist to localStorage.
- A new small util `src/layoutOverrides.js` for the storage/merge logic.
- No data model changes.

Want me to go? And which way on the 5 open questions?

## User

1. no stacking. just do not move, back to original. 
2. yes it should be possible to drag into new lane. 
3. no, not yet
4. no have an edit toggle. This is editing data, I want settings with position to update. We are yet to buidl these settings. 
5. fine

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: write_file]_

Building. Starting with the storage util and the small node changes, then canvas drag, then app wiring.Now update `node.jsx` to accept drag props:

_[tool: str_replace_edit]_

Now the canvas drag logic. Adding drag state, slot indicator, and pointer handlers:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now wire the drag into the node rendering and add a slot indicator:

_[tool: str_replace_edit]_

Add edit-mode body class so we can style lanes during drag, then update App for state + topbar:Now App.jsx — toggle, overrides state, and topbar button:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now load `layoutOverrides.js` and add CSS:

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: run_script]_

_[tool: done]_

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

The `useMemo` and `useEffect` are referencing `layoutOverrides` and `activeViewId` before they're declared (temporal dead zone). Reordering:

_[tool: done]_

_[tool: fork_verifier_agent]_

Built. New "Edit layout" toggle in the topbar enables grab-and-drop on nodes in lane views. Nodes snap to (lane, slot) positions; occupied slots block the drop (revert to original); changes persist per view in `localStorage` with a "Reset positions" button to revert. Combined view doesn't support drag, as you specified. Verifier is running.

## User

I just selected a node and it opened inspector in edit mode. No matter that I closed the inspector while in edit mode before hand. ANY open of a node (showing inspector) should show the View mode

## Assistant

_[tool: str_replace_edit]_

Done — every new selection forces the inspector back to View mode. The Edit toggle still works within that session, but next click resets.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Removed the Reset button. Position changes are now permanent for that view — they persist across reloads via localStorage, and there's no in-UI undo path. (When you eventually wire a backend, this is where you'd sync the overrides into the actual layout config.)

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

Removed both the "Reset all to defaults" footer and the per-row ↺ reset arrow — they were the same concept and you'd flagged that "defaults don't exist." Color changes now stick.

## User

Apply comment

## Assistant

_[tool: grep]_

The button is already gone from the source — you're likely looking at a cached render. Refresh the page and the ↺ should be gone (just the 8 swatches + custom now). Let me know if it's still there after a hard reload.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Now style for the warning state and "taken" swatch indicator:

_[tool: run_script]_

Done — gentle, non-blocking:

- If a category's color matches another's, the row shows a small amber **⚠ Shares color with X** caption under the name
- Its current-swatch circle picks up an amber ring
- In every other category's picker, swatches already taken by another category get a tiny amber dot in the corner (with tooltip naming which category)
- Picking the duplicate is still allowed — just made visible

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Dots gone. Row warning stays.

## User

Apply comment

## Assistant

Quick plan — meaty but well-bounded.

## Data model
Categories move from hard-coded constants to a runtime list, stored in `localStorage`:
```
[
  { id: 'operational', label: 'Operational', color: 'oklch(0.76 0.14 75)', builtin: true },
  { id: 'cat_3kf9',    label: 'Vendor',      color: 'oklch(0.76 0.14 130)', builtin: false },
  ...
]
```
- Seeded from the 4 existing built-ins on first load (their `id`s match what the data file uses, so existing nodes keep their category).
- Custom categories get a random `id` so renames don't break anything.

## Settings UI
- **"+ Add category"** button at the bottom of the list → adds a row in edit mode: label input + color picker pre-set to the next unused palette swatch.
- Each row label becomes editable (click to rename).
- Custom rows get a trash icon. **Built-in rows can be renamed but not deleted** (their ids are referenced by the seed data; deleting would orphan nodes).
- A small "Used by N nodes" count next to each row label. If you try to delete a category in use, the trash is disabled with a tooltip explaining why.

## Inspector
- In **Edit mode**, the header breadcrumb category becomes a clickable enum picker listing every category.
- Picking a new one writes `node.category = newId` and the node re-tints instantly.
- New categories are automatically available because the picker reads the runtime list, not a hard-coded set.

## Canvas rendering
Right now node color comes from static CSS rules:
```css
.node[data-cat="operational"] { --cat: var(--cat-op); }
```
This breaks for arbitrary new categories. **Fix:** drop those rules and set `--cat` as an inline style on each node, derived from the categories list. Works for any id.

Same for the inspector tint, the related-list rel-cat, lane group labels — all need to source color from the categories list, not the four fixed `--cat-*` vars.

## Effort
Bigger than the color picker but bounded. The trickiest part is the rendering refactor (moving from static CSS rules → inline `--cat` style). Maybe 30 min of careful surgery.

## Open questions
1. **Built-in deletion** — confirm: rename yes, delete no? (My recommendation.)
2. **Icon / visual style per category** — color only for v1, or do you want shape/icon customization too? I'd say color only.
3. **Lanes** — new categories will work in Combined view immediately. In lane-based views, nodes of new categories appear at whatever position the data assigns them, but the lane definitions are static. Is that OK for now? (Lane-config editing would be a separate feature.)
4. **Persistence model** — same as colors: `localStorage`, "permanent for that session." Reasonable?

If you say go and confirm Q1/Q2/Q3, I'll build it. Otherwise tell me which way to bend.

## User

1 - agree
2 - how do we do icons again at the moment? is that at the Category level?
3 - not sure I understand, new categories can only be assigned to existing nodes, they already have a place
4 - I wan this more permanent but thats for developer

## Assistant

_[tool: read_file]_

Answer to **Q2**: icons are at the **node-type** level, not the category level. Each node has a `type` field (`actor`, `process`, `decision`, `data_object`, `document`, etc.) — that determines the icon. Categories only contribute color tint. So when you add a category, you don't need to define an icon for it — whatever type the node is keeps its icon, just re-tinted with the new color.

That means **color only** for v1 is the natural fit. Customizing icons would be a node-type-level feature (a separate "Node types" settings tab the nav already hints at), not a category feature.

**Q3** answered too — you're right, my concern was a non-issue.

Going to build now: categories list in state + add/edit/delete in Settings + category picker in Inspector header (Edit mode) + refactor node rendering to use inline `--cat` style.

## User

I cant find  a way to edit in setting categories

## Assistant

_[tool: grep]_

_[tool: write_file]_

Right, I haven't built it yet — let me do that now.

_[tool: str_replace_edit]_

Now wire categories through App:

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now pass categories down to SettingsPage and Inspector:Now rewrite SettingsPage to use the categories list:

_[tool: write_file]_

_[tool: str_replace_edit]_

Now Inspector — make tint dynamic and add a category picker in Edit mode:Now CSS for the new categories UI (add row, delete button, usage counter, builtin badge, name input):

_[tool: run_script]_

_[tool: grep]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Built. Categories are now editable from Settings — rename inline, recolor with the picker, add custom ones with "+ Add category", delete custom ones (when empty). Built-ins can be renamed/recolored but not deleted. Added categories show up automatically in the Inspector's Edit-mode category picker, and selecting one recolors the node live on the canvas. All persists via localStorage. Verifier is running.

## User

Apply comment

## Assistant

I want to make sure I get this right — a few things to clarify before building:

1. **Rename "Categories"** to what? Some candidates:
   - "Visuals"
   - "Appearance" 
   - "Look & feel"
   - "Style"

2. **Node Type icons** — currently icons are hard-coded SVG glyphs per type (`actor`, `process`, `decision`, `data_object`, etc.). To make these "assignable" I'd need a curated icon library to pick from. Should I:
   - **(a)** Build a small set of ~30 icons we curate, and let the user pick one per node type?
   - **(b)** Add a free-form icon input (SVG paste or URL)?
   - **(c)** Just allow renaming/recoloring of node types, no icon swap?

3. **Edit mode toggle** — when you say "appears when Edit mode is toggled," do you mean:
   - **(a)** A new Edit toggle on the **Settings page** itself (matches the Inspector's pattern), gating add/delete/rename actions?
   - **(b)** The existing **Inspector** Edit toggle should also unlock Settings actions?
   - **(c)** Something else?

4. **"Add a node"** — do you mean add a new **node type** (a new option like "actor" / "process"), or add an actual **node instance** to the graph from settings?

Once you answer I'll go.

## User

1. Appearance
2. a
3. No I was mistaken. NO toggle. 
4. Node type

## User

Apply comment

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Add the spacer CSS so rows without a delete button still align:

_[tool: run_script]_

Done. "Built-in" badges are gone. Trash icon now appears only when a category or node type has 0 nodes — for everything else, no trash, no greyed-out state. The original 4 categories can be deleted too (when empty) since they're just seed data, not truly built in.

## User

Apply comment

## Assistant

_[tool: run_script]_

The breadcrumb category picker no longer truncates — full label always visible.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Pass `optionColor` from Inspector and update CSS:

_[tool: str_replace_edit]_

_[tool: run_script]_

Each option in the category dropdown now has its own colored dot and hovers/highlights using its own color — Information turns cyan on hover, Governance coral, etc.

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Done. Settings scrollbar is now thin and matches the rest of the app's styling — sits flush against the right edge with a subtle thumb that brightens on hover.

## User

<pasted_text name="Pasted text (66 lines)">
# Prompt: Add Project Management & Graph Import Wizard to FlowLens

## Context

FlowLens is an existing React/TypeScript application that renders interactive operational and data architecture graphs. The current implementation is a viewer — it loads a JSON file containing nodes, edges, views, overlays, scenarios, and evidence, and renders it using React Flow with custom node/edge components, view switching, overlays, an inspector panel, and replay.

I want to add a project management layer and a graph import wizard on top of the existing viewer. The viewer itself should remain largely unchanged — it becomes what the user lands in after importing a graph.

I'm attaching two reference documents:
- **flowlens-wizard-design.md** — the full design specification covering the home screen, project creation, project page, and the 6-step graph import wizard
- **flowlens-app-mockup.jsx** — an interactive React mockup showing the UI flow and interaction patterns

## What I need from you

**Plan first. Do not start building immediately.**

Before writing any code, I need you to:

1. **Read the existing codebase thoroughly** — understand the current component structure, state management (Zustand stores), routing (if any), how JSON is currently loaded and transformed, how views/overlays/scenarios are currently handled, and what TypeScript types exist.

2. **Read both attached documents thoroughly** — understand the full scope of what's being added.

3. **Produce a written implementation plan** that covers:
   - What new routes/pages need to be created (home, new project, project page, wizard)
   - What new components are needed and where they sit in the existing component hierarchy
   - What changes are needed to existing components (if any) to accommodate the new layer
   - What new state management is needed (new Zustand stores? modifications to existing ones?)
   - How the transition works: the wizard produces view and overlay configurations that currently live in the JSON — how do these get injected into the existing viewer state?
   - What the data flow looks like: upload JSON → validate → discover schema → user configures views/overlays → import → viewer loads with those configurations
   - How routing works between the new screens and the existing viewer
   - What can be reused from the existing codebase vs what's net new
   - A sequenced build order (what to build first, second, third)

4. **Ask me clarifying questions** before finalising the plan. The existing codebase has a lot of context that isn't in the design documents. Things you should specifically ask about:
   - How JSON is currently loaded and where in the state it lands
   - How views, overlays, and scenarios are currently stored and applied
   - Whether there's existing routing or if this is currently a single-page app
   - How the Zustand store is structured
   - Whether there's existing validation logic
   - Any conventions or patterns in the codebase I'd want you to follow
   - Anything else where the design doc makes assumptions that might conflict with the existing implementation

## Key design decisions (already made)

These are not up for discussion — they're settled:

- **The uploaded JSON contains only `nodes` and `edges`.** Any other top-level keys are flagged with a warning and ignored.
- **Views are configured at the node level** — the user checks individual nodes into each view, organised by category and type. No type-level-only filtering.
- **Journey and Technical Architecture views are always required** and cannot be deleted. They start empty — the user selects nodes.
- **All five standard overlays are required** (PII, Manual Processes, Unknowns, High Risk, System of Record). They start with no conditions. The user defines conditions using metadata fields discovered from the uploaded JSON.
- **Custom views and overlays can be added and deleted.**
- **Scenarios and evidence are not configured in the wizard.** They come later.
- **The wizard is 6 steps:** Upload → Validate → Discover → Views → Overlays → Import.
- **No backend persistence yet.** This is still local-first. State can live in memory/Zustand. Persistence is a future concern.

## What I do NOT want

- Do not refactor the existing viewer unless necessary to integrate the new layer
- Do not change how the viewer renders nodes, edges, overlays, or replay — that's working
- Do not add a backend, authentication, or database — this is still frontend-only
- Do not start coding until the plan is reviewed and approved
- Do not make assumptions about the existing codebase — ask me

## Tone

Be direct. Ask sharp questions. If something in the design doc conflicts with how the existing code works, flag it immediately rather than silently working around it.
</pasted_text>

<pasted_text name="Pasted text (601 lines)">
import { useState, useMemo } from "react";

const ALL_NODES = [
  { id: "customer", type: "actor", label: "Customer", cat: "operational" },
  { id: "enter_details", type: "process", label: "Enter Details", cat: "operational" },
  { id: "reg_lookup", type: "process", label: "Reg Lookup", cat: "operational" },
  { id: "enrichment_orchestration", type: "process", label: "Enrichment Orchestration", cat: "operational" },
  { id: "claims_history_check", type: "process", label: "Claims History Check", cat: "operational" },
  { id: "licence_validation", type: "process", label: "Licence Validation", cat: "operational" },
  { id: "address_verification", type: "process", label: "Address Verification", cat: "operational" },
  { id: "fraud_scoring", type: "process", label: "Fraud Scoring", cat: "operational" },
  { id: "claims_discrepancy_check", type: "decision", label: "Claims Discrepancy Check", cat: "operational" },
  { id: "resolve_discrepancy", type: "process", label: "Resolve Discrepancy", cat: "operational" },
  { id: "quote_distribution", type: "process", label: "Quote Distribution", cat: "operational" },
  { id: "response_normalisation", type: "process", label: "Response Normalisation", cat: "operational" },
  { id: "ranking", type: "process", label: "Ranking", cat: "operational" },
  { id: "display_results", type: "process", label: "Display Results", cat: "operational" },
  { id: "event_logging", type: "process", label: "Event Logging", cat: "operational" },
  { id: "abandoned_journey_detection", type: "process", label: "Abandoned Journey Detection", cat: "operational" },
  { id: "commission_reconciliation", type: "process", label: "Commission Reconciliation", cat: "operational" },
  { id: "response_evaluation", type: "decision", label: "Response Evaluation", cat: "operational" },
  { id: "finance_team_member", type: "actor", label: "Finance Team Member", cat: "operational" },
  { id: "pending_verification", type: "state", label: "Pending Verification", cat: "operational" },
  { id: "verified", type: "state", label: "Verified", cat: "operational" },
  { id: "quotes_collected", type: "state", label: "Quotes Collected", cat: "operational" },
  { id: "results_presented", type: "state", label: "Results Presented", cat: "operational" },
  { id: "timeout_event_budgetcover", type: "event", label: "Timeout — BudgetCover", cat: "operational" },
  { id: "customer_profile", type: "data_object", label: "Customer Profile", cat: "information" },
  { id: "vehicle_data", type: "data_object", label: "Vehicle Data", cat: "information" },
  { id: "cover_preferences", type: "data_object", label: "Cover Preferences", cat: "information" },
  { id: "claims_history", type: "data_object", label: "Claims History", cat: "information" },
  { id: "licence_record", type: "data_object", label: "Licence Record", cat: "information" },
  { id: "fraud_score", type: "data_object", label: "Fraud Score", cat: "information" },
  { id: "enriched_quote_request", type: "data_object", label: "Enriched Quote Request", cat: "information" },
  { id: "standardised_quote_request", type: "data_object", label: "Standardised Quote Request", cat: "information" },
  { id: "quote_response_quotefast", type: "data_object", label: "Quote — QuoteFast", cat: "information" },
  { id: "decline_response_secureguard", type: "data_object", label: "Decline — SecureGuard", cat: "information" },
  { id: "ranked_quote_list", type: "data_object", label: "Ranked Quote List", cat: "information" },
  { id: "commission_data_export", type: "data_object", label: "Commission Data Export", cat: "information" },
  { id: "reengagement_email", type: "output", label: "Re-engagement Email", cat: "information" },
  { id: "conversion_metrics", type: "metric", label: "Conversion Metrics", cat: "information" },
  { id: "comparison_frontend", type: "application", label: "Comparison Frontend", cat: "technical" },
  { id: "comparison_backend", type: "application", label: "Comparison Backend", cat: "technical" },
  { id: "quote_engine", type: "application", label: "Quote Engine", cat: "technical" },
  { id: "crm_marketing_platform", type: "application", label: "CRM / Marketing Platform", cat: "technical" },
  { id: "session_database", type: "database", label: "Session Database", cat: "technical" },
  { id: "quotes_database", type: "database", label: "Quotes Database", cat: "technical" },
  { id: "vehicle_data_provider", type: "external_saas", label: "Vehicle Data Provider", cat: "technical" },
  { id: "cue", type: "external_saas", label: "CUE", cat: "technical" },
  { id: "mylicence_dvla", type: "external_saas", label: "MyLicence / DVLA", cat: "technical" },
  { id: "address_verification_service", type: "external_saas", label: "Address Verification Service", cat: "technical" },
  { id: "fraud_scoring_service", type: "external_saas", label: "Fraud Scoring Service", cat: "technical" },
  { id: "insurer_a_quotefast", type: "external_saas", label: "Insurer A — QuoteFast", cat: "technical" },
  { id: "insurer_b_secureguard", type: "external_saas", label: "Insurer B — SecureGuard", cat: "technical" },
  { id: "insurer_c_budgetcover", type: "external_saas", label: "Insurer C — BudgetCover", cat: "technical" },
  { id: "data_pipeline", type: "pipeline", label: "Data Pipeline", cat: "technical" },
  { id: "data_warehouse", type: "data_warehouse", label: "Data Warehouse", cat: "technical" },
  { id: "analytics_dashboard", type: "bi_tool", label: "Analytics Dashboard", cat: "technical" },
  { id: "commission_spreadsheet", type: "spreadsheet", label: "Commission Spreadsheet", cat: "technical" },
];

const METADATA_FIELDS = [
  { field: "containsPii", values: ["true", "false"], found: 22 },
  { field: "confidence", values: ["high", "medium", "low"], found: 56 },
  { field: "riskLevel", values: ["high", "medium", "low"], found: 12 },
  { field: "automationLevel", values: ["automated", "self_service", "manual"], found: 13 },
  { field: "systemOfRecord", values: ["true"], found: 3 },
  { field: "openQuestions", values: ["(non-empty)"], found: 8 },
];

const PROJECTS = [
  { id: 1, name: "Car Insurance Comparison", domain: "Insurance", client: "Acme Insurance Group", graphs: 2, updated: "2 hours ago" },
  { id: 2, name: "Mortgage Origination", domain: "Banking", client: "NorthBank", graphs: 1, updated: "3 days ago" },
  { id: 3, name: "Broadband Provisioning", domain: "Telecoms", client: "ConnectFibre", graphs: 3, updated: "1 week ago" },
];

const CAT_ORDER = ["operational", "information", "technical"];
const CAT_LABELS = { operational: "Operational", information: "Information", technical: "Technical", governance: "Governance" };
const CAT_COLORS = {
  operational: { bg: "#EDE9FE", text: "#5B21B6", dbg: "#2E2254", dtx: "#C4B5FD" },
  information: { bg: "#D1FAE5", text: "#065F46", dbg: "#1A3A2A", dtx: "#6EE7B7" },
  technical: { bg: "#DBEAFE", text: "#1E40AF", dbg: "#1E2D4A", dtx: "#93C5FD" },
};

const OVERLAY_SHELLS = [
  { id: "pii", label: "PII / Sensitive Data", color: "#9b7dd4", required: true },
  { id: "manual", label: "Manual Processes", color: "#e0943a", required: true },
  { id: "unknowns", label: "Unknowns & Low Confidence", color: "#8a8a8a", required: true },
  { id: "high_risk", label: "High Risk", color: "#d4574e", required: true },
  { id: "sor", label: "System of Record", color: "#4a8fd4", required: true },
];

const STEPS = ["Upload", "Validate", "Discover", "Views", "Overlays", "Import"];

function Checkbox({ checked, onChange, color, indeterminate }) {
  return (
    <button onClick={onChange} style={{ width: 17, height: 17, borderRadius: 3, border: `1.5px solid ${checked || indeterminate ? (color || '#6d28d9') : 'rgba(128,128,128,0.3)'}`, background: checked ? (color || '#6d28d9') : indeterminate ? (color || '#6d28d9') : 'transparent', cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, lineHeight: 1, flexShrink: 0, transition: "all 0.12s", opacity: indeterminate && !checked ? 0.5 : 1 }}>
      {checked ? "✓" : indeterminate ? "–" : ""}
    </button>
  );
}

function Chip({ children, dk, color, small }) {
  const bg = dk ? color?.dbg || 'rgba(255,255,255,0.05)' : color?.bg || 'rgba(0,0,0,0.04)';
  const tx = dk ? color?.dtx || 'rgba(255,255,255,0.7)' : color?.text || 'rgba(0,0,0,0.6)';
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: small ? "2px 7px" : "4px 10px", borderRadius: 5, fontSize: small ? 11 : 12, background: bg, color: tx, fontFamily: "var(--font-mono)", border: '1px solid transparent' }}>{children}</span>;
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);
  const dk = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (screen === "home") return <HomeScreen dk={dk} onSelect={p => { setSelectedProject(p); setScreen("project"); }} onNew={() => setScreen("new-project")} />;
  if (screen === "new-project") return <NewProject dk={dk} onBack={() => setScreen("home")} onCreate={p => { setSelectedProject(p); setScreen("project"); }} />;
  if (screen === "project") return <ProjectPage dk={dk} project={selectedProject} onBack={() => setScreen("home")} onImport={() => setScreen("wizard")} />;
  if (screen === "wizard") return <Wizard dk={dk} onBack={() => setScreen("project")} onComplete={() => setScreen("project")} />;
}

function HomeScreen({ dk, onSelect, onNew }) {
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: "var(--color-text-primary)" }}>
      <div style={{ padding: "12px 0 28px", borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}><span style={{ opacity: 0.35, fontWeight: 400 }}>◈</span> FlowLens</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>james.mitchell@consultancy.com</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {PROJECTS.map(p => (
          <button key={p.id} onClick={() => onSelect(p)} style={{ padding: "28px 24px", borderRadius: 14, textAlign: "left", cursor: "pointer", border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: dk ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', fontFamily: "inherit", transition: "all 0.15s" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: "var(--color-text-primary)" }}>{p.name}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>{p.client}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>
              <span>{p.domain}</span><span style={{ opacity: 0.3 }}>·</span><span>{p.graphs} graph{p.graphs !== 1 ? 's' : ''}</span><span style={{ opacity: 0.3 }}>·</span><span>{p.updated}</span>
            </div>
          </button>
        ))}
        <button onClick={onNew} style={{ padding: "28px 24px", borderRadius: 14, textAlign: "center", cursor: "pointer", border: `2px dashed ${dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
          <div style={{ fontSize: 28, opacity: 0.3, marginBottom: 8, color: "var(--color-text-primary)" }}>+</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>New Project</div>
        </button>
      </div>
    </div>
  );
}

function NewProject({ dk, onBack, onCreate }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [client, setClient] = useState("");
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: "var(--color-text-primary)" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer", padding: "8px 0", marginBottom: 24, fontFamily: "inherit" }}>← Back to projects</button>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>New Project</h1>
      <div style={{ maxWidth: 480 }}>
        {[{ l: "Project name", v: name, s: setName, r: true, p: "e.g. Car Insurance Comparison" }, { l: "Domain", v: domain, s: setDomain, p: "e.g. Insurance, Banking" }, { l: "Client", v: client, s: setClient, p: "e.g. Acme Insurance Group" }].map(f => (
          <div key={f.l} style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>{f.l} {f.r && <span style={{ color: "#d4574e" }}>*</span>}</label>
            <input value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.p} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, background: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', fontSize: 14, color: "var(--color-text-primary)", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
        ))}
        <button onClick={() => name.trim() && onCreate({ id: 99, name, domain, client, graphs: 0, updated: "Just now" })} disabled={!name.trim()} style={{ padding: "11px 28px", borderRadius: 8, border: "none", background: name.trim() ? (dk ? '#6d28d9' : '#5b21b6') : (dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'), color: name.trim() ? "#fff" : "var(--color-text-secondary)", fontSize: 14, fontWeight: 600, cursor: name.trim() ? "pointer" : "default", fontFamily: "inherit" }}>Create Project</button>
      </div>
    </div>
  );
}

function ProjectPage({ dk, project, onBack, onImport }) {
  const [tab, setTab] = useState("graphs");
  const graphs = project.graphs > 0 ? [{ name: "Quote Journey", version: "v3", nodes: 56, edges: 71, updated: "2 hours ago" }, ...(project.graphs > 1 ? [{ name: "Claims Process", version: "v1", nodes: 34, edges: 42, updated: "5 days ago" }] : [])] : [];
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: "var(--color-text-primary)" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer", padding: "8px 0", marginBottom: 16, fontFamily: "inherit" }}>← All projects</button>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{project.name || "Untitled Project"}</h1>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>{[project.domain, project.client].filter(Boolean).join(" · ") || "No domain or client set"}</div>
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, marginBottom: 28 }}>
        {["graphs", "members"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)", background: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--color-text-primary)" : "2px solid transparent", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>
      {tab === "graphs" && (graphs.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
          <button onClick={onImport} style={{ padding: "48px 72px", borderRadius: 16, border: `2px dashed ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, background: "transparent", cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3, color: "var(--color-text-primary)" }}>↑</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text-primary)" }}>Import Graph</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>Upload a JSON file with nodes and edges</div>
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {graphs.map((g, i) => (
            <div key={i} style={{ padding: "24px 20px", borderRadius: 12, border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: dk ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', cursor: "pointer" }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{g.name}</div>
              <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--color-text-secondary)" }}><span>{g.version}</span><span style={{ opacity: 0.3 }}>·</span><span>{g.nodes}n {g.edges}e</span><span style={{ opacity: 0.3 }}>·</span><span>{g.updated}</span></div>
            </div>
          ))}
          <button onClick={onImport} style={{ padding: "24px 20px", borderRadius: 12, border: `2px dashed ${dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
            <div style={{ fontSize: 22, opacity: 0.3, marginBottom: 4, color: "var(--color-text-primary)" }}>+</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Import Graph</div>
          </button>
        </div>
      ))}
      {tab === "members" && (
        <div style={{ maxWidth: 480 }}>
          {[{ name: "James Mitchell", email: "james.mitchell@consultancy.com", role: "Owner" }, { name: "Sarah Chen", email: "sarah.chen@consultancy.com", role: "Editor" }].map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }}>
              <div><div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div><div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{m.email}</div></div>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", background: dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', padding: "3px 10px", borderRadius: 4 }}>{m.role}</span>
            </div>
          ))}
          <button style={{ marginTop: 16, padding: "8px 16px", borderRadius: 6, border: `1px solid ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, background: "transparent", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Add member</button>
        </div>
      )}
    </div>
  );
}

function Wizard({ dk, onBack, onComplete }) {
  const [step, setStep] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [graphName, setGraphName] = useState("Car Insurance Quote Journey");
  const [imported, setImported] = useState(false);

  // Views — Journey and Technical are locked, both start EMPTY
  const [views, setViews] = useState([
    { id: "journey", label: "Journey", locked: true, nodes: new Set() },
    { id: "technical", label: "Technical Architecture", locked: true, nodes: new Set() },
  ]);
  const [activeViewTab, setActiveViewTab] = useState("journey");
  const [showAddView, setShowAddView] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  // Overlays — all required, all start with NO conditions
  const [overlays, setOverlays] = useState(OVERLAY_SHELLS.map(o => ({ ...o, conditions: [] })));
  const [activeOverlayTab, setActiveOverlayTab] = useState("pii");
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [newOverlayName, setNewOverlayName] = useState("");

  const activeView = views.find(v => v.id === activeViewTab);
  const activeOverlay = overlays.find(o => o.id === activeOverlayTab);

  const nodesByCategory = useMemo(() => {
    const g = {};
    ALL_NODES.forEach(n => {
      if (!g[n.cat]) g[n.cat] = {};
      if (!g[n.cat][n.type]) g[n.cat][n.type] = [];
      g[n.cat][n.type].push(n);
    });
    return g;
  }, []);

  const toggleNode = (viewId, nodeId) => {
    setViews(prev => prev.map(v => {
      if (v.id !== viewId) return v;
      const s = new Set(v.nodes);
      s.has(nodeId) ? s.delete(nodeId) : s.add(nodeId);
      return { ...v, nodes: s };
    }));
  };

  const toggleType = (viewId, type, select) => {
    setViews(prev => prev.map(v => {
      if (v.id !== viewId) return v;
      const s = new Set(v.nodes);
      ALL_NODES.filter(n => n.type === type).forEach(n => select ? s.add(n.id) : s.delete(n.id));
      return { ...v, nodes: s };
    }));
  };

  const addView = () => {
    if (!newViewName.trim()) return;
    const id = newViewName.trim().toLowerCase().replace(/\s+/g, '_');
    setViews(p => [...p, { id, label: newViewName.trim(), locked: false, nodes: new Set() }]);
    setActiveViewTab(id);
    setNewViewName("");
    setShowAddView(false);
  };

  const updateCond = (oId, ci, field, val) => {
    setOverlays(p => p.map(o => o.id !== oId ? o : { ...o, conditions: o.conditions.map((c, i) => i === ci ? { ...c, [field]: val } : c) }));
  };

  const addCond = (oId) => {
    setOverlays(p => p.map(o => o.id !== oId ? o : { ...o, conditions: [...o.conditions, { field: "", op: "equals", value: "" }] }));
  };

  const removeCond = (oId, ci) => {
    setOverlays(p => p.map(o => o.id !== oId ? o : { ...o, conditions: o.conditions.filter((_, i) => i !== ci) }));
  };

  const addOverlay = () => {
    if (!newOverlayName.trim()) return;
    const id = newOverlayName.trim().toLowerCase().replace(/\s+/g, '_');
    setOverlays(p => [...p, { id, label: newOverlayName.trim(), color: "#7c8da0", required: false, conditions: [] }]);
    setActiveOverlayTab(id);
    setNewOverlayName("");
    setShowAddOverlay(false);
  };

  const totalViewNodes = views.reduce((a, v) => a + v.nodes.size, 0);
  const totalOverlayConds = overlays.reduce((a, o) => a + o.conditions.length, 0);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: "var(--color-text-primary)" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer", padding: "8px 0", marginBottom: 12, fontFamily: "inherit" }}>← Back to project</button>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => i < step && setStep(i)} disabled={i > step}
            style={{ flex: 1, padding: "10px 0 12px", textAlign: "center", fontSize: 12, fontWeight: i === step ? 600 : 400, color: i === step ? "var(--color-text-primary)" : i < step ? "var(--color-text-secondary)" : (dk ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'), background: "transparent", border: "none", borderBottom: i === step ? "2px solid var(--color-text-primary)" : "2px solid transparent", cursor: i < step ? "pointer" : "default", fontFamily: "inherit" }}>
            <span style={{ opacity: 0.4, marginRight: 4, fontSize: 10 }}>{i + 1}</span>{s}
          </button>
        ))}
      </div>

      {/* UPLOAD */}
      {step === 0 && (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Upload graph data</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 20 }}>JSON with top-level <code style={{ fontSize: 12, background: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', padding: "1px 5px", borderRadius: 3 }}>nodes</code> and <code style={{ fontSize: 12, background: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', padding: "1px 5px", borderRadius: 3 }}>edges</code> only. Other keys will be flagged.</p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Graph name</label>
            <input value={graphName} onChange={e => setGraphName(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: `1px solid ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, background: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', fontSize: 14, color: "var(--color-text-primary)", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div onClick={() => setUploaded(true)} style={{ border: `2px dashed ${uploaded ? (dk ? '#4ade80' : '#16a34a') : (dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')}`, borderRadius: 12, padding: "44px 24px", textAlign: "center", cursor: "pointer", background: uploaded ? (dk ? 'rgba(74,222,128,0.05)' : 'rgba(22,163,74,0.03)') : 'transparent' }}>
            {uploaded ? (<>
              <div style={{ fontSize: 26, marginBottom: 8 }}>✓</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>car-insurance-comparison.json</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>54 KB · valid JSON</div>
              <div style={{ marginTop: 10, padding: "6px 12px", borderRadius: 6, background: dk ? 'rgba(234,179,8,0.1)' : 'rgba(234,179,8,0.08)', display: "inline-block", fontSize: 12, color: dk ? '#fbbf24' : '#b45309' }}>⚠ Extra keys found: views, overlays, scenarios, evidence — ignored</div>
            </>) : (<>
              <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.3 }}>↑</div>
              <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.5 }}>Drop JSON file or click to browse</div>
            </>)}
          </div>
        </div>
      )}

      {/* VALIDATE */}
      {step === 1 && (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Validation report</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 20 }}>Structural integrity check</p>
          <div style={{ background: dk ? 'rgba(74,222,128,0.06)' : 'rgba(22,163,74,0.03)', border: `1px solid ${dk ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.12)'}`, borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: dk ? '#4ade80' : '#16a34a' }}>✓</span><span style={{ fontSize: 13, fontWeight: 500, color: dk ? '#4ade80' : '#16a34a' }}>No structural errors</span>
          </div>
          <div style={{ background: dk ? 'rgba(234,179,8,0.05)' : 'rgba(234,179,8,0.03)', border: `1px solid ${dk ? 'rgba(234,179,8,0.15)' : 'rgba(234,179,8,0.1)'}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: dk ? '#fbbf24' : '#b45309', marginBottom: 6 }}>3 warnings</div>
            {['Node "event_logging" has no outgoing edges', '14 nodes have no riskLevel metadata', '23 edges have sparse metadata'].map((w, i) => (
              <div key={i} style={{ fontSize: 12, color: "var(--color-text-secondary)", padding: "2px 0 2px 16px" }}>– {w}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[["Nodes", "56"], ["Edges", "71"], ["Node types", "15"], ["Edge types", "15"]].map(([k, v]) => (
              <div key={k} style={{ background: dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISCOVER */}
      {step === 2 && (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Schema discovery</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 20 }}>Types and metadata found in your graph</p>
          {CAT_ORDER.filter(c => ALL_NODES.some(n => n.cat === c)).map(cat => {
            const types = {};
            ALL_NODES.filter(n => n.cat === cat).forEach(n => { types[n.type] = (types[n.type] || 0) + 1; });
            return (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--color-text-secondary)", marginBottom: 6 }}>{CAT_LABELS[cat]}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {Object.entries(types).map(([t, c]) => <Chip key={t} dk={dk} color={CAT_COLORS[cat]}>{t} <span style={{ opacity: 0.5 }}>{c}</span></Chip>)}
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Metadata fields detected</div>
            <div style={{ background: dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 8, padding: "8px 12px" }}>
              {METADATA_FIELDS.map(m => (
                <div key={m.field} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}`, fontSize: 12 }}>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{m.field}</span>
                  <span style={{ color: "var(--color-text-secondary)" }}>{m.values.join(", ")} <span style={{ opacity: 0.4 }}>· {m.found}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", background: dk ? 'rgba(99,130,255,0.08)' : 'rgba(99,130,255,0.06)', borderRadius: 6, fontSize: 12, color: "var(--color-text-secondary)" }}>
            ℹ You'll use these metadata fields to define overlay conditions in Step 5.
          </div>
        </div>
      )}

      {/* VIEWS */}
      {step === 3 && (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Configure views</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>Journey and Technical Architecture are required. Select which nodes appear in each view.</p>

          <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            {views.map(v => (
              <div key={v.id} style={{ display: "flex" }}>
                <button onClick={() => setActiveViewTab(v.id)}
                  style={{ padding: "6px 14px", borderRadius: v.locked ? 6 : "6px 0 0 6px", fontSize: 12, fontWeight: activeViewTab === v.id ? 600 : 400, background: activeViewTab === v.id ? (dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : 'transparent', border: `1px solid ${activeViewTab === v.id ? (dk ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)') : (dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`, color: "var(--color-text-primary)", cursor: "pointer", fontFamily: "inherit" }}>
                  {v.locked && <span style={{ opacity: 0.4, marginRight: 4 }}>🔒</span>}{v.label} <span style={{ opacity: v.nodes.size > 0 ? 0.6 : 0.25, marginLeft: 4, fontSize: 11 }}>({v.nodes.size})</span>
                </button>
                {!v.locked && (
                  <button onClick={() => { setViews(p => p.filter(x => x.id !== v.id)); setActiveViewTab("journey"); }}
                    style={{ padding: "6px 8px", borderRadius: "0 6px 6px 0", fontSize: 11, background: activeViewTab === v.id ? (dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : 'transparent', border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, borderLeft: "none", color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                )}
              </div>
            ))}
            {!showAddView ? (
              <button onClick={() => setShowAddView(true)} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12, background: "transparent", border: `1px dashed ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>+ Add view</button>
            ) : (
              <div style={{ display: "flex", gap: 4 }}>
                <input value={newViewName} onChange={e => setNewViewName(e.target.value)} placeholder="View name" autoFocus onKeyDown={e => e.key === 'Enter' && addView()} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${dk ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: "transparent", fontSize: 12, color: "var(--color-text-primary)", fontFamily: "inherit", width: 140 }} />
                <button onClick={addView} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, background: dk ? '#6d28d9' : '#5b21b6', color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Add</button>
                <button onClick={() => setShowAddView(false)} style={{ padding: "5px 8px", borderRadius: 6, fontSize: 12, background: "transparent", border: `1px solid ${dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
              </div>
            )}
          </div>

          {activeView && (
            <div style={{ background: dk ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)', borderRadius: 10, padding: "16px 18px" }}>
              {activeView.nodes.size === 0 && (
                <div style={{ padding: "8px 12px", background: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 6, fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 14 }}>
                  No nodes selected yet. Check the nodes you want in this view.
                </div>
              )}
              {CAT_ORDER.filter(cat => nodesByCategory[cat]).map(cat => {
                const types = nodesByCategory[cat];
                return (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: dk ? CAT_COLORS[cat].dtx : CAT_COLORS[cat].text }}></span>
                      {CAT_LABELS[cat]}
                    </div>
                    {Object.entries(types).map(([type, nodesOfType]) => {
                      const allOn = nodesOfType.every(n => activeView.nodes.has(n.id));
                      const someOn = nodesOfType.some(n => activeView.nodes.has(n.id));
                      return (
                        <div key={type} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, cursor: "pointer" }} onClick={() => toggleType(activeView.id, type, !allOn)}>
                            <Checkbox checked={allOn} indeterminate={someOn && !allOn} onChange={() => {}} />
                            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>{type}</span>
                            <span style={{ fontSize: 11, opacity: 0.4 }}>({nodesOfType.length})</span>
                          </div>
                          <div style={{ paddingLeft: 28, display: "flex", flexDirection: "column", gap: 1 }}>
                            {nodesOfType.map(n => (
                              <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0", cursor: "pointer" }} onClick={() => toggleNode(activeView.id, n.id)}>
                                <Checkbox checked={activeView.nodes.has(n.id)} onChange={() => {}} />
                                <span style={{ fontSize: 13 }}>{n.label}</span>
                                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", opacity: 0.25 }}>{n.id}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* OVERLAYS */}
      {step === 4 && (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Configure overlays</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>Define matching conditions for each overlay. Use the metadata fields from Step 3.</p>

          <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            {overlays.map(o => (
              <div key={o.id} style={{ display: "flex" }}>
                <button onClick={() => setActiveOverlayTab(o.id)}
                  style={{ padding: "6px 14px", borderRadius: o.required ? 6 : "6px 0 0 6px", fontSize: 12, fontWeight: activeOverlayTab === o.id ? 600 : 400, background: activeOverlayTab === o.id ? (dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : 'transparent', border: `1px solid ${activeOverlayTab === o.id ? (dk ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)') : (dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`, color: "var(--color-text-primary)", cursor: "pointer", fontFamily: "inherit" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: o.color, display: "inline-block", marginRight: 6 }}></span>
                  {o.label} <span style={{ opacity: o.conditions.length > 0 ? 0.6 : 0.25, marginLeft: 4, fontSize: 11 }}>({o.conditions.length})</span>
                </button>
                {!o.required && (
                  <button onClick={() => { setOverlays(p => p.filter(x => x.id !== o.id)); setActiveOverlayTab("pii"); }}
                    style={{ padding: "6px 8px", borderRadius: "0 6px 6px 0", fontSize: 11, background: "transparent", border: `1px solid ${dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, borderLeft: "none", color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                )}
              </div>
            ))}
            {!showAddOverlay ? (
              <button onClick={() => setShowAddOverlay(true)} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12, background: "transparent", border: `1px dashed ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>+ Add overlay</button>
            ) : (
              <div style={{ display: "flex", gap: 4 }}>
                <input value={newOverlayName} onChange={e => setNewOverlayName(e.target.value)} placeholder="Overlay name" autoFocus onKeyDown={e => e.key === 'Enter' && addOverlay()} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${dk ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, background: "transparent", fontSize: 12, color: "var(--color-text-primary)", fontFamily: "inherit", width: 140 }} />
                <button onClick={addOverlay} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, background: dk ? '#6d28d9' : '#5b21b6', color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Add</button>
                <button onClick={() => setShowAddOverlay(false)} style={{ padding: "5px 8px", borderRadius: 6, fontSize: 12, background: "transparent", border: `1px solid ${dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
              </div>
            )}
          </div>

          {activeOverlay && (
            <div style={{ background: dk ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)', borderRadius: 10, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: activeOverlay.color }}></span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{activeOverlay.label}</span>
                {activeOverlay.required && <span style={{ fontSize: 11, color: "var(--color-text-secondary)", background: dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', padding: "2px 8px", borderRadius: 4 }}>Required</span>}
              </div>

              {activeOverlay.conditions.length === 0 && (
                <div style={{ padding: "8px 12px", background: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 6, fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 12 }}>
                  No conditions defined. Add conditions to specify what this overlay highlights.
                </div>
              )}

              {activeOverlay.conditions.length > 0 && (
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 10 }}>Highlights when <strong>any</strong> condition is true:</div>
              )}

              {activeOverlay.conditions.map((cond, ci) => (
                <div key={ci} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <select value={cond.field} onChange={e => updateCond(activeOverlay.id, ci, 'field', e.target.value)}
                    style={{ flex: 2, padding: "7px 10px", borderRadius: 6, border: `1px solid ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, background: dk ? 'rgba(255,255,255,0.04)' : '#fff', color: "var(--color-text-primary)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                    <option value="">Select field...</option>
                    <option value="type">type (node type)</option>
                    <option value="edge_type">edge_type</option>
                    {METADATA_FIELDS.map(m => <option key={m.field} value={`metadata.${m.field}`}>metadata.{m.field}</option>)}
                  </select>
                  <select value={cond.op} onChange={e => updateCond(activeOverlay.id, ci, 'op', e.target.value)}
                    style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: `1px solid ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, background: dk ? 'rgba(255,255,255,0.04)' : '#fff', color: "var(--color-text-primary)", fontSize: 12 }}>
                    <option value="equals">equals</option>
                    <option value="in">in</option>
                    <option value="is_not_empty">is not empty</option>
                  </select>
                  {cond.op !== 'is_not_empty' && (
                    <input value={cond.value} onChange={e => updateCond(activeOverlay.id, ci, 'value', e.target.value)} placeholder="value"
                      style={{ flex: 2, padding: "7px 10px", borderRadius: 6, border: `1px solid ${dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`, background: dk ? 'rgba(255,255,255,0.04)' : '#fff', color: "var(--color-text-primary)", fontSize: 12, fontFamily: "var(--font-mono)" }} />
                  )}
                  <button onClick={() => removeCond(activeOverlay.id, ci)} style={{ padding: "4px 8px", borderRadius: 4, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              ))}
              <button onClick={() => addCond(activeOverlay.id)}
                style={{ marginTop: 4, padding: "5px 12px", borderRadius: 6, fontSize: 12, background: "transparent", border: `1px dashed ${dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>+ Add condition</button>
            </div>
          )}
        </div>
      )}

      {/* IMPORT */}
      {step === 5 && !imported && (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Ready to import</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 20 }}>Review and confirm</p>
          <div style={{ background: dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{graphName}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 28px" }}>
              {[["Nodes", "56"], ["Edges", "71"], ["Views", `${views.length}`], ["Overlays", `${overlays.length}`], ["Warnings", "3"], ["Version", "v1"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "2px 0" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>{k}</span>
                  <span style={{ fontWeight: 500, fontFamily: "var(--font-mono)", fontSize: 12 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Views:</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {views.map(v => <Chip key={v.id} dk={dk} small>{v.locked && "🔒 "}{v.label} ({v.nodes.size})</Chip>)}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Overlays:</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {overlays.map(o => <Chip key={o.id} dk={dk} small><span style={{ width: 6, height: 6, borderRadius: "50%", background: o.color, display: "inline-block", marginRight: 4 }}></span>{o.label} ({o.conditions.length})</Chip>)}
            </div>
          </div>
          <button onClick={() => setImported(true)} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: dk ? '#6d28d9' : '#5b21b6', color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Import graph</button>
        </div>
      )}

      {step === 5 && imported && (
        <div style={{ textAlign: "center", padding: "60px 0", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Graph imported</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>56 nodes · 71 edges · {views.length} views · {overlays.length} overlays</div>
          <button onClick={onComplete} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: dk ? '#6d28d9' : '#5b21b6', color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Open in viewer →</button>
        </div>
      )}

      {!(step === 5 && imported) && (
        <div style={{ maxWidth: 720, margin: "28px auto 0", display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{ padding: "8px 18px", borderRadius: 6, border: `1px solid ${dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: "transparent", color: "var(--color-text-secondary)", fontSize: 13, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.3 : 1, fontFamily: "inherit" }}>Back</button>
          {step < 5 && (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !uploaded} style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: (step === 0 && !uploaded) ? (dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : (dk ? '#6d28d9' : '#5b21b6'), color: (step === 0 && !uploaded) ? "var(--color-text-secondary)" : "#fff", fontSize: 13, fontWeight: 500, cursor: (step === 0 && !uploaded) ? "default" : "pointer", fontFamily: "inherit" }}>Next</button>
          )}
        </div>
      )}
    </div>
  );
}
</pasted_text>

<pasted_text name="Pasted text (325 lines)">
# FlowLens Wizard Design — Home, Project Creation & Graph Import

## Three surfaces

**Home screen** — the logged-in landing page. Shows the user's projects as large cards in a grid.
**Project page** — inside a project. Shows graphs and members.
**Graph import wizard** — a 6-step process for uploading and configuring a graph.

---

## Home Screen

The home screen is what a user sees after logging in. It should feel spacious and uncluttered.

If the user has projects, show them as large card-style tiles in a 3-column grid. Each card shows the project name, client name, domain, graph count, and last updated timestamp. Clicking a card opens the project page.

The final grid position is always a dashed "+ New Project" card.

If the user has no projects, the entire screen shows a single large centred "New Project" button with a brief prompt — no empty tables, no placeholder text, just the action.

---

## Flow 1: Create Project

Triggered from the home screen via the "+ New Project" card. Opens a dedicated page (not a modal — it needs room).

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Project name | Text | Yes | e.g. "Car Insurance Comparison" |
| Domain | Text | No | e.g. "Insurance", "Banking", "Telecoms" — contextual, not used for logic |
| Client | Text | No | e.g. "Acme Insurance Group" |

Click "Create" → lands on the empty project page.

---

## Project Page

The project page has two tabs: **Graphs** and **Members**. No settings tab at this stage.

### Graphs tab

If the project has no graphs, the tab shows a large centred dashed "Import Graph" button — same pattern as the empty home screen. Prominent, impossible to miss.

If the project has graphs, they appear as card tiles in a grid (same visual language as the home screen). Each card shows graph name, version, node and edge count, and last updated. The final grid position is a dashed "+ Import Graph" card.

### Members tab

Shows a list of current members with name, email, and role (Owner, Editor, Viewer). The project creator is automatically the Owner. An "+ Add member" button allows inviting collaborators.

---

## Flow 2: Graph Import Wizard

Triggered from the project page via "Import Graph". This is a 6-step wizard.

### Step flow

```
Upload → Validate → Discover → Views → Overlays → Import
```

Each step has a horizontal progress bar at the top. Completed steps are clickable (go back). Future steps are greyed out. Back/Next navigation at the bottom of every step.

### Critical principle: the JSON contains only nodes and edges

The uploaded JSON has two top-level keys: `nodes` and `edges`. Nothing else. If extra keys are present (views, overlays, scenarios, evidence, project), they are flagged with a warning and completely ignored. This means:

- Views cannot be pre-populated from the JSON. The user builds them.
- Overlay conditions cannot be pre-populated from the JSON. The user defines them.
- Scenarios are not created in the wizard at all.
- Evidence is managed separately after import.

The wizard's job is to help the user understand what's in the graph (Steps 2–3) and then define how to look at it (Steps 4–5).

---

### Step 1: Upload

**Header:** Upload graph data
**Subtext:** JSON file with top-level `nodes` and `edges` arrays only. Other keys will be flagged.

The screen shows:
- A "Graph name" text field (auto-populated from filename if a file is dropped)
- A drop zone (drag and drop or click to browse)
- A "paste JSON" toggle that reveals a code editor area

**Accepted format:** The JSON must have `nodes` (array) and `edges` (array) as top-level keys. If any other top-level keys are present (e.g. `views`, `overlays`, `scenarios`, `evidence`, `project`), the upload succeeds but shows an amber warning: "Extra keys found: views, overlays, scenarios, evidence — these will be ignored. Only nodes and edges are imported."

**What happens on upload:**
- File is parsed as JSON
- Structure check: valid JSON? Has `nodes` and `edges` arrays?
- Extra key detection and warning
- If valid structure → user clicks Next to proceed
- If invalid JSON or missing arrays → inline error, stay on this step

**Blocking errors (shown inline, prevents proceeding):**
- "This isn't valid JSON — check for syntax errors"
- "Missing `nodes` array"
- "Missing `edges` array"
- "Nodes array is empty"

---

### Step 2: Validate

**Header:** Validation report
**Subtext:** Checking structural integrity

Runs automatically on arrival. Results shown in three tiers:

**Errors (red, blocking)** — must be fixed before proceeding. Next button disabled.
- Duplicate node IDs
- Broken edge references (from/to pointing at non-existent nodes)
- Missing required fields (id, type, label on nodes; id, from, to, type on edges)
- Self-referencing edges

**Warnings (amber, non-blocking)** — shown but don't prevent proceeding.
- Unknown node types not in the standard taxonomy
- Unknown edge types not in the standard taxonomy
- Orphan nodes with no incoming or outgoing edges
- Missing metadata (e.g. nodes without confidence)
- Missing descriptions

**Info (grey, summary stats)**
- Node count, edge count, node types, edge types — shown as four stat cards

---

### Step 3: Discover

**Header:** Schema discovery
**Subtext:** Types and metadata found in your graph

Shows what the platform extracted from the nodes and edges:

**Node types** — grouped by category (Operational, Information, Technical, Governance). Each type shown as a colour-coded pill with count.

**Edge types** — shown as pills with counts.

**Metadata fields detected** — field name, distinct values found, count of items where it appears. This is important because the user will need this information in Step 5 when defining overlay conditions.

This step is purely informational. Next is always enabled.

---

### Step 4: Views

**Header:** Configure views
**Subtext:** Journey and Technical Architecture are required. Add others as needed. Toggle nodes per view.

This is where views are defined from scratch. The platform knows the nodes from the upload. The user decides which nodes belong in which view.

**Required views:** Journey and Technical Architecture are always present as tabs. They cannot be removed (shown with a lock icon). They start with no nodes selected. The user must check the nodes they want in each view.

**Additional views:** A "+ Add view" button allows creating named custom views (e.g. Data Lineage, Risk, Governance). Custom views can be deleted. They also start with no nodes selected.

**View tabs:** Each view is a tab showing the view name and current count of selected nodes (e.g. "Journey (0)"). Clicking a tab shows the node assignment panel for that view.

**Node assignment panel:** Shows every node in the graph, organised as a nested list grouped by category and type:

```
Category (e.g. Operational)
  └── Type (e.g. process) — with select-all checkbox
       ├── ☐ Enter Details              enter_details
       ├── ☐ Reg Lookup                 reg_lookup
       ├── ☐ Enrichment Orchestration   enrichment_orchestration
       └── ...
  └── Type (e.g. decision)
       ├── ☐ Claims Discrepancy Check   claims_discrepancy_check
       └── ...
Category (e.g. Technical)
  └── Type (e.g. application)
       ├── ☐ Comparison Frontend        comparison_frontend
       └── ...
```

Each node has a checkbox. The type header has a select-all/deselect-all checkbox for quick bulk assignment. This gives full control at the node level while keeping things manageable through the category/type grouping.

**Why node-level and not type-level:** Type-level filtering is what the original JSON did, and it caused the data warehouse problem — cross-cutting nodes that connect operational processes to technical systems couldn't appear in multiple views without including their entire type. Node-level assignment means the user can put `data_warehouse` in the Journey view alongside processes, or include specific process nodes in the Technical view. Complete flexibility.

---

### Step 5: Overlays

**Header:** Configure overlays
**Subtext:** Standard overlays are required. Define their conditions. Add new ones as needed.

**Required overlays:** The five standard overlays are always present as tabs. They cannot be removed (marked with a "Required" badge):
- PII / Sensitive Data (purple dot)
- Manual Processes (amber dot)
- Unknowns & Low Confidence (grey dot)
- High Risk (red dot)
- System of Record (blue dot)

All required overlays start with no conditions defined. The user must define the matching logic for each one.

**Custom overlays:** A "+ Add overlay" button allows creating new named overlays with a colour picker. Custom overlays can be deleted. They also start with no conditions.

**Overlay tabs:** Each overlay is a tab with a colour dot. Clicking a tab shows the condition editor for that overlay.

**Condition editor:** Each overlay has zero or more conditions. Conditions use "match any" logic (OR). Each condition is a row with three fields:

| Field dropdown | Operator dropdown | Value field |
|---|---|---|
| (select field) | (select operator) | (enter value) |

The **field dropdown** is populated from the discovered schema — every metadata field found in Step 3 (e.g. metadata.containsPii, metadata.riskLevel, metadata.confidence, metadata.automationLevel, metadata.systemOfRecord, metadata.openQuestions), plus `type` (node type) and `edge_type`.

The **operator dropdown** offers: equals, in (comma-separated values), is not empty.

The **value field** is free text, or hidden when operator is "is not empty".

Each condition row has a delete button. A "+ Add condition" button adds a new empty row.

**Example:** The user configuring the PII overlay might add:
- metadata.containsPii equals true

The user configuring Manual Processes might add:
- metadata.automationLevel equals manual
- type equals spreadsheet
- edge_type equals manual_rekey

The user configuring Unknowns might add:
- metadata.confidence in medium, low
- metadata.openQuestions is not empty

These are the user's decisions, not defaults. The platform provides the field dropdown from discovery; the user chooses what to match on.

---

### Step 6: Import

**Header:** Ready to import
**Subtext:** Review and confirm

Summary card showing:
- Graph name
- Node count, edge count
- Views configured (listed with node counts)
- Overlays configured (listed with condition counts)
- Warnings acknowledged (count)
- Version: v1

A single "Import graph" button. On click:
1. Graph entity created within the project
2. Version 1 created with the uploaded nodes and edges
3. Discovered schema stored
4. Views created from Step 4 configuration
5. Overlays created from Step 5 configuration
6. Redirect to the FlowLens viewer with the graph loaded

The user lands in the full viewer — canvas, views, overlays, inspector — ready to explore.

---

## Scenarios

Scenarios are not configured in the wizard. They require the visual graph to build effectively — the user needs to see the nodes and edges to click through a sequence. Scenario creation belongs in the graph settings UI after import, or in a dedicated scenario builder within the viewer.

---

## Evidence

Evidence linking is not configured in the wizard. Evidence items are managed at the project level (in the evidence library) and linked to nodes/edges in the graph settings UI after import.

---

## Wizard UX notes

**Progress indicator:** Horizontal step bar, 6 steps. Current step highlighted. Completed steps clickable.

**Persistence:** Progress is lost if the wizard is closed. Acceptable because the wizard is fast (2–3 minutes for a consultant).

**Tone:** Power-user tool. Concise, informative copy. No congratulatory messages.

**Speed:** Steps 2 and 3 are instant (client-side parsing). Steps 4 and 5 take the most time — the user is actively building view and overlay configuration. Step 6 is a confirmation click. Total wizard time: 3–5 minutes depending on graph complexity.

---

## Adding subsequent graphs

When a project already has graphs and the user clicks "Import Graph" again, the same wizard runs with the same empty starting state. Views and overlays must be configured for each graph independently.

---

## State diagram

```
Home Screen (project grid)
  → "+ New Project" → [Create Project Page] → Empty Project Page
  → [Click project card] → Project Page
                                ↓
                          "Import Graph"
                                ↓
                        ┌─── Upload ───┐
                        │  drop / paste │
                        └───────┬───────┘
                                ↓ (valid JSON, extra keys flagged & ignored)
                        ┌── Validate ──┐
                        │ errors/warns  │
                        └───────┬───────┘
                                ↓ (no blocking errors)
                        ┌── Discover ──┐
                        │ types, meta   │
                        └───────┬───────┘
                                ↓
                        ┌─── Views ────┐
                        │ node-level    │
                        │ all empty     │
                        └───────┬───────┘
                                ↓
                        ┌── Overlays ──┐
                        │ conditions    │
                        │ all empty     │
                        └───────┬───────┘
                                ↓
                        ┌── Import ────┐
                        │   confirm     │
                        └───────┬───────┘
                                ↓
                          FlowLens Viewer
```
</pasted_text>

## Assistant

Read the prompt and the two design docs. Before I plan, here's a reality-check on assumptions in the prompt — flagging fast so we don't go in the wrong direction.

## Assumptions in the prompt that don't match this codebase

The prompt mentions a TypeScript/Zustand/React-Flow stack with routing. **This project is none of those.** Concretely:

- **No TypeScript.** Everything is `.jsx` / `.js`, transpiled in-browser by Babel standalone. No build step, no type system.
- **No Zustand (or any state library).** State lives in `App.jsx` as `useState` + `useMemo`, with a few `localStorage`-backed runtime modules I've recently added (`Categories`, `NodeTypes`, `LayoutOverrides`).
- **No router.** It's literally one HTML page (`FlowLens Canvas.html`) that loads one global graph from `src/graph-data.js`, which sets `window.FLOWLENS_DATA = { project, nodes, edges, views, overlays, scenarios, evidence }`.
- **No React Flow.** Custom canvas built with HTML + SVG, with hand-rolled pan/zoom, lane layout engine (`layoutEngine.js`, layered strategy), and our own node/edge components.
- **The viewer assumes one graph.** Nothing in App, Canvas, Inspector or layout code knows about "the current graph" — they read `window.FLOWLENS_DATA` directly or read from `data` prop passed once.

So before any plan: **is this the right project, or did you mean to drop these docs into a different FlowLens repo?**

## If this *is* the right project, here's the gap

The wizard layer assumes a multi-project / multi-graph app with a per-graph data store. Today we have a single hard-coded graph file. To do this properly we need to:

1. **Wrap the viewer in a shell** with screen-state (`home` → `project` → `wizard` → `viewer`) — no need for react-router, a single `screen` state value in a new top-level component handles it.
2. **Replace `window.FLOWLENS_DATA` with a per-graph data source** that the shell selects and passes into the viewer.
3. **Add a projects/graphs persistence layer** in `localStorage` (same pattern as Categories/NodeTypes/LayoutOverrides).
4. **Build the wizard** — 6 steps as specced. The viewer renders unchanged once a graph is "imported" (which here means: parsed, stored, selected).

The wizard producing views/overlays from scratch is interesting because **the existing viewer already has runtime-editable categories and node types** I just built. The wizard would seed those from the import. We should decide if discovered metadata fields, view definitions, and overlay conditions also become runtime-editable post-import (probably yes for consistency).

## What I need from you before I write code

1. **Confirm this is the right project**, given the stack mismatches above.
2. **Single-graph viewer or multi-graph?** Today, the viewer reads one global. To support multiple graphs we need to plumb the active graph through props end-to-end. That's a touch-many-files job (small per file, big in count). Confirm we're doing it.
3. **Replace the hard-coded `graph-data.js`?** Options:
   - (a) Keep it as a default/sample graph, list it in the home screen as a project on first load.
   - (b) Drop it on first user import — fresh empty home screen.
4. **Persistence model.** I assume same pattern as Categories: `localStorage` keys per concept (`flowlens.projects`, `flowlens.graphs.<id>`, etc.), JSON-serialized. Confirm.
5. **Layout engine fit.** The viewer's layered layout depends on `nodeLanes` and `nodeSlots` in `window.FLOWLENS_LAYOUTS[viewId]`. The wizard never touches lane/slot config — only "which nodes are in this view." On import, what happens to layout? Options:
   - (a) Auto-generate a basic lane assignment per view from discovered categories.
   - (b) Skip lane layout — fall back to free positioning, user drags into place using the Edit Layout mode I just built.
   - (c) Defer and lay nodes out in a basic grid for new imports.
6. **Existing Categories / NodeTypes integration.** The wizard's Step 3 (Discover) shows discovered types as colored pills. Should the wizard:
   - (a) Auto-seed the editable Categories and Node Types lists from the imported JSON, **or**
   - (b) Stay completely separate (the wizard's "discover" is informational only; categories/types config stays in Settings)?
7. **Where does the user end up after import?** Direct to the viewer. Confirm the existing viewer (with topbar, settings, inspector, lenses, replay) is what loads — i.e., we don't strip any of that.
8. **Is the existing graph-data.js (the car insurance scenario) something to preserve as a demo project**, or should it go entirely?
9. **Sample JSONs to test the wizard with.** Do you have one or two graph JSONs (just `{nodes, edges}`) we can hardcode as test fixtures, or do you want me to derive one from the current `graph-data.js`?
10. **Members tab on the project page** — the mockup shows mock data. This is a frontend-only project. Do you want a static placeholder, or a localStorage-backed list the user can edit?

## My provisional sequenced build order (subject to your answers)

1. **Shell + screen routing.** New top-level component with `screen` state; wire up Home → New Project → Project Page → existing viewer.
2. **Projects/Graphs storage.** localStorage CRUD module; seed with current `graph-data.js` as one demo project.
3. **Project + home pages.** Static-ish; minimal styling.
4. **Wizard scaffold.** 6-step stepper, navigation, no logic yet.
5. **Steps 1–3** (Upload, Validate, Discover). Pure parsing + reporting.
6. **Step 4** (Views). Node-level checkboxes, view tabs, Journey/Technical locked.
7. **Step 5** (Overlays). Condition rows.
8. **Step 6** (Import). Write to storage, navigate to viewer.
9. **Glue:** make the existing viewer read the active graph from store instead of `window.FLOWLENS_DATA`.
10. **Polish:** styling, transitions, persistence edge cases.

Answer the 10 questions and I'll lock the plan and start. If anything in the design docs is non-negotiable but conflicts with how the viewer currently works, this is the time to flag.

## User

Okay hang on. I just want to crete UI for all this, I am ot looking to build a fully functional application. Can we create these pieces as UIT components to hand to my developer?

Yes ultimtel this will be multugraph. Currently we just have demo data. 

No edits yet, discuss

## Assistant

Got it — UI mockups for handoff, not functional. That's a much simpler scope. Let me discuss approach before building.

## Proposal

**Format:** Use the `design_canvas` starter — lay all 4 screens (Home, New Project, Project Page, Import Wizard) side-by-side in one HTML file. Each screen is an artboard the developer can click to open fullscreen. Wizard becomes 6 sub-artboards (one per step), arranged in a row in their own section. This gives the dev:
- An at-a-glance overview of the whole flow
- Click-through to any single screen at fullscreen
- A single file to reference

**Visual language:** Match the existing FlowLens app — same Geist + JetBrains Mono, same dark oklch palette, same component vocabulary (cards, chips, segmented controls, the breadcrumb pattern in the inspector). The mockup you shared uses a purple/light style that doesn't match what we've built. Matching FlowLens means the dev sees these screens as part of the same product.

**Fidelity of interactions:** Static visuals, but with **enough local interactivity to convey intent** — clicking a step tab in the wizard jumps to that step's mock; clicking a view tab in Step 4 swaps the node-assignment panel; checkbox toggling visually flips; etc. **No real data flow, no validation, no persistence.** Sample data hardcoded into the mock.

**Sample data:** Use the existing demo graph (Car Insurance Comparison) — the user already has the file, so the discovered types, metadata fields, etc. all map to something real.

**Pixel size:** 1280-wide artboards for the full-screen views; the wizard steps narrower (~700w) since they're centered content.

## Things I want to confirm with you

1. **Single design file vs. one HTML per screen?** Single canvas is easier to review and hand off as "the design"; separate files are easier to link to from a ticket. I'd go single canvas with focus-mode per screen — but tell me if you want separate files.

2. **Variations?** Do you want me to explore 2–3 visual directions for any of these screens (e.g. Home as card-grid vs. list vs. workspace-style), or one direction per screen, take it from the mockup?

3. **Do I match the FlowLens viewer's dark aesthetic exactly, or is this a chance to nudge the visual language?** The mockup is much lighter / more conventional dashboard-y. I'd default to matching FlowLens (consistency) — but if you want these screens to feel "before you enter the dense viewer," there's a case for slightly lighter chrome to make the transition feel like surfacing for air.

4. **Wizard step rendering — one tall artboard per step, or one artboard with internal tab state?** Tall-per-step is clearer for handoff (devs see each state explicitly). Tab-state is more compact. I'd go tall-per-step.

5. **The members tab and "+ Add member" — design that, or skip?** The mockup includes it as static rows. I'd include it since it's a small addition.

6. **Anything you want to drop or change from the mockup before I start?** Some things I'd nudge:
   - The "Validate" step's stat tiles feel underweight — would design them like the Discover step's chip grouping for consistency.
   - "Schema discovery" step's metadata table — would treat as a more structured table, not just two-column rows.
   - The "🔒" lock emoji on required views/overlays — would use a styled badge instead (FlowLens avoids emoji).

Answer 1–6 and I'll go.

## User

Sample data: no for the wizard, actaully work with whatever is uploaded. NO need to reall prsist beyond wizard.

Seperate files but link them. Give me 2-3

yes match existing

one with internal state

include

yes change as needed, the mockup is very basic and only there to show functionality, not design

## Assistant

All clear. Locking the plan:

- **4 files at project root** (peer to the viewer): `Home.html`, `New Project.html`, `Project Page.html`, `Import Wizard.html`
- **2–3 variations per screen** (where variations add value):
  - Home: 3 — card grid, workspace (hero + recents sidebar), dense list
  - New Project: 2 — focused page form, two-column with help
  - Project Page: 3 — tabbed (mockup-style), sidebar nav, mixed (graphs primary + members panel)
  - Wizard: 1 design with internal step state (per your direction)
- **Variation switcher** sits as a faint top strip inside each file (reviewer-only, not part of the design itself)
- **In-flow links** wire screens together naturally (project card → Project Page; "+ Import Graph" → Wizard; Wizard "Import" → existing viewer)
- **Wizard parses real uploaded JSON** via FileReader, runs actual validation + discovery on it. No persistence past the session.
- **Aesthetic locked to FlowLens viewer:** Geist + JetBrains Mono, dark oklch palette, same component vocabulary (cards, mono kicker labels, segmented controls, breadcrumb tints). Shared tokens inlined in each file for portable handoff.
- **Departures from your mockup I'll make** (you said "change as needed"):
  - Stepper as a thin progress rail, not full-width tabs that compete with content
  - Validation step uses chip/stat groupings consistent with Discover step
  - Lock indicator on required views/overlays is a styled mono badge, not an emoji
  - Members tab gets proper avatar circles and role chips

Going to build now. Will share Home.html first so you can sanity-check the aesthetic and variation framing before I produce the other three. Starting.

## User

start

## Assistant

_[tool: write_file]_

_[tool: show_to_user]_

Home.html is up — 3 variants (Card grid, Workspace, Dense list), top reviewer strip switches between them. Take a look and tell me if the aesthetic is right before I produce the other three. Particularly want a gut check on:

- Density / spacing
- The brand mark style up top (matches the viewer)
- Whether Variant 2's hero feels right or too heavy
- Whether the dense list (V3) feels too utilitarian

If you're happy with the direction I'll proceed with New Project, Project Page, and the Wizard.

## User

love. v1 best. keep only 1 build everything else now

## User

continue

## User

continue

## Assistant

_[tool: write_file]_

Now the Import Wizard — single file, 6 steps with internal state, real file upload + parsing:

_[tool: done]_

_[tool: fork_verifier_agent]_

All four UI mock screens delivered:

- **Home.html** — projects grid (the V1 you liked)
- **New Project.html** — focused form with live preview tile and "what happens next" sidebar
- **Project Page.html** — graphs grid with SVG mini-thumbnails, members table, empty-state hero tucked in an expander
- **Import Wizard.html** — 6 steps with real file parsing (drop a JSON → it actually validates structure, discovers types and metadata, populates the views/overlays editors)

All four link to each other via natural in-flow paths and share `wizard-tokens.css`. Reviewer strip at the very top of each file lets you jump between them and stays separate from the actual designs (your dev can strip it).

Verifier is running. Let me know what you want to refine.

## User

Verifier agent check completed

## Assistant

Clean — verifier passed.

