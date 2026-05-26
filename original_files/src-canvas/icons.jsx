/* global React */
// Icons for each node type. 16x16 stroke-based glyphs.
// Color is currentColor so they inherit from the category color.

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const FILL_ACCENT = { fill: 'currentColor', opacity: 0.15 };

function svg(children, size = 16) {
  return React.createElement('svg', { width: size, height: size, viewBox: '0 0 16 16' }, children);
}

const NODE_ICONS = {
  // ---- operational ----
  actor: () => svg([
    React.createElement('circle', { key: 'h', cx: 8, cy: 5, r: 2.4, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5', ...STROKE }),
  ]),
  organisation: () => svg([
    React.createElement('rect', { key: 'a', x: 2, y: 4, width: 5, height: 10, ...STROKE }),
    React.createElement('rect', { key: 'b', x: 9, y: 7, width: 5, height: 7, ...STROKE }),
    React.createElement('path', { key: 'c', d: 'M4 7h1M4 10h1M11 10h1', ...STROKE }),
  ]),
  role: () => svg([
    React.createElement('path', { key: 'a', d: 'M8 2l5 3v4c0 3-2.5 4.5-5 5-2.5-.5-5-2-5-5V5z', ...STROKE }),
  ]),
  process: () => svg([
    React.createElement('rect', { key: 'a', x: 2.5, y: 4.5, width: 11, height: 7, rx: 1.2, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M5.5 8h5M10.5 6.5L12 8l-1.5 1.5', ...STROKE }),
  ]),
  decision: () => svg([
    React.createElement('path', { key: 'a', d: 'M8 2l6 6-6 6-6-6z', ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M5.5 8h5', ...STROKE }),
  ]),
  state: () => svg([
    React.createElement('circle', { key: 'a', cx: 8, cy: 8, r: 5.5, ...STROKE }),
    React.createElement('circle', { key: 'b', cx: 8, cy: 8, r: 2, ...STROKE, fill: 'currentColor', opacity: 0.5 }),
  ]),
  event: () => svg([
    React.createElement('path', { key: 'a', d: 'M9 2L4 9h4l-1 5 5-7h-4z', ...STROKE }),
  ]),
  // ---- information ----
  data_object: () => svg([
    React.createElement('ellipse', { key: 'a', cx: 8, cy: 4.5, rx: 5, ry: 2, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M3 4.5v7c0 1.1 2.2 2 5 2s5-.9 5-2v-7', ...STROKE }),
    React.createElement('path', { key: 'c', d: 'M3 8c0 1.1 2.2 2 5 2s5-.9 5-2', ...STROKE }),
  ]),
  document: () => svg([
    React.createElement('path', { key: 'a', d: 'M4 2h6l3 3v9H4z', ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M10 2v3h3M6 8h4M6 11h4', ...STROKE }),
  ]),
  input: () => svg([
    React.createElement('path', { key: 'a', d: 'M2 8h9M8 5l3 3-3 3', ...STROKE }),
    React.createElement('rect', { key: 'b', x: 11, y: 3, width: 3, height: 10, ...STROKE }),
  ]),
  output: () => svg([
    React.createElement('rect', { key: 'b', x: 2, y: 3, width: 3, height: 10, ...STROKE }),
    React.createElement('path', { key: 'a', d: 'M5 8h9M11 5l3 3-3 3', ...STROKE }),
  ]),
  metric: () => svg([
    React.createElement('path', { key: 'a', d: 'M2 13h12', ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M3 11l3-4 3 2 4-6', ...STROKE }),
    React.createElement('circle', { key: 'c', cx: 13, cy: 3, r: 1.2, fill: 'currentColor' }),
  ]),
  // ---- technical ----
  application: () => svg([
    React.createElement('rect', { key: 'a', x: 2, y: 3, width: 12, height: 10, rx: 1.5, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M2 6h12', ...STROKE }),
    React.createElement('circle', { key: 'c', cx: 4, cy: 4.5, r: 0.4, fill: 'currentColor' }),
    React.createElement('circle', { key: 'd', cx: 5.5, cy: 4.5, r: 0.4, fill: 'currentColor' }),
  ]),
  api: () => svg([
    React.createElement('path', { key: 'a', d: 'M4 6l-2 2 2 2M12 6l2 2-2 2M9.5 4.5l-3 7', ...STROKE }),
  ]),
  database: () => svg([
    React.createElement('ellipse', { key: 'a', cx: 8, cy: 4, rx: 5, ry: 1.8, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M3 4v8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8V4', ...STROKE }),
    React.createElement('path', { key: 'c', d: 'M3 8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8', ...STROKE }),
  ]),
  spreadsheet: () => svg([
    React.createElement('rect', { key: 'a', x: 2, y: 3, width: 12, height: 10, rx: 0.5, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M2 6h12M2 9.5h12M6 3v10M10 3v10', ...STROKE }),
  ]),
  data_warehouse: () => svg([
    React.createElement('ellipse', { key: 'a', cx: 8, cy: 3.5, rx: 5.5, ry: 1.5, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M2.5 3.5v3M13.5 3.5v3M2.5 6.5h11M5 6.5v6M8 6.5v6M11 6.5v6M2.5 12.5h11', ...STROKE }),
  ]),
  data_lake: () => svg([
    React.createElement('path', { key: 'a', d: 'M2 7c2-1 4 1 6-1s5 1 6 0v6c-2 1-4-1-6 1s-5-1-6 0z', ...STROKE }),
  ]),
  pipeline: () => svg([
    React.createElement('path', { key: 'a', d: 'M2 6h4a2 2 0 0 1 2 2v0a2 2 0 0 0 2 2h4', ...STROKE }),
    React.createElement('circle', { key: 'b', cx: 4, cy: 6, r: 1, fill: 'currentColor' }),
    React.createElement('circle', { key: 'c', cx: 12, cy: 10, r: 1, fill: 'currentColor' }),
  ]),
  transformation: () => svg([
    React.createElement('path', { key: 'a', d: 'M3 5h8l-2-2M13 11H5l2 2', ...STROKE }),
  ]),
  event_stream: () => svg([
    React.createElement('path', { key: 'a', d: 'M2 8c1.5 0 1.5-3 3-3s1.5 6 3 6 1.5-6 3-6 1.5 3 3 3', ...STROKE }),
  ]),
  bi_tool: () => svg([
    React.createElement('rect', { key: 'a', x: 2, y: 3, width: 12, height: 10, rx: 1, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M5 11V8M8 11V6M11 11V9', ...STROKE, strokeWidth: 2 }),
  ]),
  ml_model: () => svg([
    React.createElement('circle', { key: 'a', cx: 4, cy: 5, r: 1.5, ...STROKE }),
    React.createElement('circle', { key: 'b', cx: 4, cy: 11, r: 1.5, ...STROKE }),
    React.createElement('circle', { key: 'c', cx: 12, cy: 8, r: 1.5, ...STROKE }),
    React.createElement('path', { key: 'd', d: 'M5.3 5.5l5.4 2M5.3 10.5l5.4-2', ...STROKE }),
  ]),
  cloud_service: () => svg([
    React.createElement('path', { key: 'a', d: 'M4 11.5h8a2.5 2.5 0 0 0 0-5 4 4 0 0 0-7.7-1 3 3 0 0 0-.3 6z', ...STROKE }),
  ]),
  identity_service: () => svg([
    React.createElement('circle', { key: 'a', cx: 8, cy: 6, r: 2.4, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M3 14c.5-2.5 2.6-3.7 5-3.7s4.5 1.2 5 3.7', ...STROKE }),
    React.createElement('path', { key: 'c', d: 'M10.5 3.5l1.5 1.5 2-2', ...STROKE }),
  ]),
  integration_platform: () => svg([
    React.createElement('rect', { key: 'a', x: 2, y: 6, width: 4, height: 4, ...STROKE }),
    React.createElement('rect', { key: 'b', x: 10, y: 6, width: 4, height: 4, ...STROKE }),
    React.createElement('path', { key: 'c', d: 'M6 8h4', ...STROKE }),
  ]),
  external_saas: () => svg([
    React.createElement('circle', { key: 'a', cx: 8, cy: 8, r: 5.5, ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11', ...STROKE }),
  ]),
  // ---- governance ----
  control: () => svg([
    React.createElement('path', { key: 'a', d: 'M8 2l5 2v5c0 2.5-2 4.5-5 5-3-.5-5-2.5-5-5V4z', ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M5.5 8l2 2 3-4', ...STROKE }),
  ]),
  risk: () => svg([
    React.createElement('path', { key: 'a', d: 'M8 2l6 11H2z', ...STROKE }),
    React.createElement('path', { key: 'b', d: 'M8 6v4M8 11.5v.5', ...STROKE }),
  ]),
  unknown: () => svg([
    React.createElement('circle', { key: 'a', cx: 8, cy: 8, r: 5.5, ...STROKE, strokeDasharray: '2 2' }),
    React.createElement('path', { key: 'b', d: 'M6.5 6.5a1.5 1.5 0 1 1 1.5 1.8v.7M8 11v.3', ...STROKE }),
  ]),
};

function NodeIcon({ type, iconKey, size = 16 }) {
  // Prefer explicit iconKey (set by runtime node-type mapping); fall back to
  // type, then to a generic 'process' glyph.
  const key = iconKey || type;
  const Icon = NODE_ICONS[key] || NODE_ICONS[type] || NODE_ICONS.process;
  const el = Icon();
  if (size === 16) return el;
  return React.cloneElement(el, { width: size, height: size });
}

window.NodeIcon = NodeIcon;
window.NODE_ICONS = NODE_ICONS;
