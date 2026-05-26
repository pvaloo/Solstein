# 01 · Architecture

## Repo layout

```
/                               ← every product HTML page lives at root
├── canvas.html                 ← the main product surface
├── home.html                   ← workspace / project list
├── new-project.html            ← create project flow
├── project.html                ← project settings + members
├── import-wizard.html          ← bring JSON graphs into a project
├── profile.html                ← user account
├── sign-in.html, accept-invite.html, forgot-password.html,
│   reset-password.html, verify-email.html, signed-out.html
├── operator-sign-in.html, operator-dashboard.html,
│   operator-users.html, operator-invitations.html
├── 404.html, 500.html, terms.html, privacy.html
├── src/                        ← canvas implementation (the substantive React app)
├── data/                       ← sample graph JSON
├── docs/                       ← this folder
├── solstein-tokens.css         ← design tokens (THE visual contract)
├── solstein-app.css            ← shared product layout (topbar, panels, dropdowns)
├── solstein-auth.css           ← auth-page layout
├── solstein-operator.css       ← operator portal layout
├── solstein-toast.css/.js      ← toast primitive
├── solstein-dropdown.js        ← vanilla dropdown listbox
├── user-menu.js                ← top-right account menu
└── operator-chrome.js          ← operator portal nav + topbar
```

## /src — Canvas implementation

The canvas is a React app loaded inline via Babel-standalone. **For production, port to a real build** (Vite / Next / etc.). The module boundaries are sound — each file roughly maps to one React component or one concern.

| File | Purpose |
|---|---|
| `graph-data.js` | Defines `window.FLOWLENS_DATA` from a sample JSON payload — the seed graph |
| `layoutConfigs.js` | Per-view layout strategy config (strategy name, options, lane labels) |
| `layoutEngine.js` | Computes node positions per view; exposes `precomputeAllLayouts`, `precomputeAllLanes`, `computeLayout` |
| `layoutOverrides.js` | Persistent per-view manual position overrides (localStorage) |
| `categories.js` | Node-category list (Operational / Information / Technical / Governance) + custom user-added |
| `nodeTypes.js` | Node type definitions (id, label, category, color) |
| `edgeTypes.js` | Edge type definitions (id, label, color) |
| `lensMatch.js` | **Data-driven lens evaluator.** Matches a node/edge against a lens's `match` JSON + `alsoMatch*` fields |
| `canvasRender.js` | SVG/Canvas rendering helpers |
| `SolDropdown.jsx` | React wrapper around the vanilla `.sol-dropdown` listbox |
| `icons.jsx` | Inline SVG icon set |
| `node.jsx` | `<NodeCard>` — a single node on the canvas |
| `edge.jsx` | `<Edge>` — a single edge (path + arrow + label) |
| `canvas.jsx` | `<Canvas>` — pan/zoom container, draws all nodes + edges + lane backdrop |
| `editControls.jsx` | `<EditableLabel>`, `<EditableDescription>` — click-to-edit primitives |
| `inspector.jsx` | Right-side inspector panel (view / edit modes) |
| `replay.jsx` | View-to-view migration animations |
| `controlPanels.jsx` | Top-right view picker + lens toggles |
| `settingsPage.jsx` | Settings modal — categories, node/edge types, views, lenses |
| `exportModal.jsx` | PNG / PDF export |
| `addNodeModal.jsx` | "Add node" wizard |
| `app.jsx` | Root component — orchestrates everything |

## Load order (canvas.html)

The order matters because `app.jsx` and `canvas.jsx` consume globals defined by the plain-JS modules. **Don't reorder without understanding the dependency graph.**

```html
<!-- Plain JS — define window globals -->
<script src="src/graph-data.js"></script>       <!-- window.FLOWLENS_DATA -->
<script src="src/layoutConfigs.js"></script>    <!-- window.FLOWLENS_LAYOUTS -->
<script src="src/layoutEngine.js"></script>     <!-- window.computeLayout, etc. -->
<script src="src/layoutOverrides.js"></script>  <!-- window.LayoutOverrides -->
<script src="src/categories.js"></script>       <!-- window.Categories -->
<script src="src/nodeTypes.js"></script>        <!-- window.NodeTypes -->
<script src="src/edgeTypes.js"></script>        <!-- window.EdgeTypes -->
<script src="src/lensMatch.js"></script>        <!-- window.LensMatch -->
<script src="src/canvasRender.js"></script>     <!-- rendering helpers -->

<!-- React + Babel-standalone (pinned versions) -->
<script src="https://unpkg.com/react@18.3.1/..."></script>
<script src="https://unpkg.com/react-dom@18.3.1/..."></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/..."></script>

<!-- JSX components — leaf components first, app shell last -->
<script type="text/babel" src="src/SolDropdown.jsx"></script>
<script type="text/babel" src="src/icons.jsx"></script>
<script type="text/babel" src="src/node.jsx"></script>
<script type="text/babel" src="src/edge.jsx"></script>
<script type="text/babel" src="src/canvas.jsx"></script>
<script type="text/babel" src="src/editControls.jsx"></script>
<script type="text/babel" src="src/inspector.jsx"></script>
<script type="text/babel" src="src/replay.jsx"></script>
<script type="text/babel" src="src/controlPanels.jsx"></script>
<script type="text/babel" src="src/settingsPage.jsx"></script>
<script type="text/babel" src="src/exportModal.jsx"></script>
<script type="text/babel" src="src/addNodeModal.jsx"></script>
<script type="text/babel" src="src/app.jsx"></script>
```

## Component tree

```
<App>                                  app.jsx
  ├── <ControlPanels>                  controlPanels.jsx — view picker, lens toggles
  ├── <Canvas>                         canvas.jsx
  │     ├── <NodeCard> × n             node.jsx
  │     └── <Edge> × n                 edge.jsx
  ├── <Inspector>                      inspector.jsx
  ├── <SettingsPage> (modal)           settingsPage.jsx
  ├── <ExportModal>                    exportModal.jsx
  ├── <AddNodeModal>                   addNodeModal.jsx
  └── <ReplayLayer>                    replay.jsx
```

## What the prototype dodges that production needs

- **No build step.** Babel runs in-browser. Production needs Vite / esbuild / similar with proper bundling, source maps, and minification.
- **No router.** Each page is a separate HTML file with hardcoded `<a href>` links. Production likely wants a SPA shell with client routing — or stay multi-page and treat each HTML as a server template.
- **No backend.** All persistence is `localStorage`. See `09-state-and-persistence.md` for the full inventory.
- **No auth.** Auth pages are visual mockups only. The `done` button on sign-in just navigates to `home.html`.
- **No real data import.** The import wizard parses uploaded JSON client-side and stuffs results into `localStorage`. Production needs server-side ingestion and storage.
- **Sample data is hardcoded.** `src/graph-data.js` is a 2,600-line literal. Production reads the active project's graph from the API.

## Module conventions

- **Plain JS (`.js`) modules** wrap their exports in an IIFE that attaches to `window`. They define module-level globals (`window.LensMatch`, `window.Categories`, etc.). Easy to port to real ES modules — just convert the IIFE to `export`.
- **JSX (`.jsx`) modules** rely on Babel-standalone. Each one expects React globals + any window-globals from `.js` modules loaded earlier. They attach their own components to `window` so other JSX modules can reach them — when porting, convert to named imports.
- **No state library.** Every component manages local state with `useState` / `useReducer`. App-level state (the graph, views, lenses, selected node) is owned by `<App>` in `app.jsx` and passed down as props.

## Styling

- `solstein-tokens.css` is the **only** place hex values, font names, or motion durations should be defined. Everything else uses `var(--sol-*)`.
- `src/styles.css` holds canvas-specific styles (overlays, panels, modals, inspector, settings).
- `src/solstein-skin.css` re-themes the canvas to match the broader product chrome.
