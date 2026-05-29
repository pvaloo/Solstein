/* global window */
// Node types — runtime list, each entry decides which icon (and what label)
// is used for nodes of that type. Defaults are seeded from whatever node
// types appear in the graph data; user can rename, swap icon, add new types,
// or delete unused custom types.

(function () {
  const STORAGE_PREFIX = 'flowlens.nodeTypes.';

  // Pretty default labels for known types — used when no label exists in
  // the data. Falls back to title-cased id otherwise.
  const DEFAULT_LABELS = {
    actor: 'Actor', organisation: 'Organisation', role: 'Role',
    process: 'Process', decision: 'Decision', state: 'State', event: 'Event',
    data_object: 'Data', document: 'Document', input: 'Input', output: 'Output',
    metric: 'Metric',
    application: 'Application', api: 'API', database: 'Database',
    spreadsheet: 'Spreadsheet', data_warehouse: 'Warehouse', data_lake: 'Data lake',
    pipeline: 'Pipeline', transformation: 'Transformation', event_stream: 'Event stream',
    bi_tool: 'BI tool', ml_model: 'ML model', cloud_service: 'Cloud service',
    identity_service: 'Identity service', integration_platform: 'Integration',
    external_saas: 'External SaaS',
    control: 'Control', risk: 'Risk', unknown: 'Unknown',
  };

  function titleCase(s) {
    return s.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  }

  function defaultLabel(id) {
    return DEFAULT_LABELS[id] || titleCase(id);
  }

  function projectStorageId(projectOrData) {
    const source = projectOrData || window.FLOWLENS_DATA || {};
    return source.project?.id || source.graph?.id || source.id || 'default';
  }

  function storageKey(projectOrData) {
    return STORAGE_PREFIX + projectStorageId(projectOrData);
  }

  // Seed: discover node types from the graph data; default each type's
  // iconKey to its own id (so it picks up the matching NODE_ICONS entry).
  function seedFromData(data) {
    const seen = new Map();
    (data.nodes || []).forEach(n => {
      if (!seen.has(n.type)) {
        seen.set(n.type, {
          id: n.type,
          label: n.typeLabel || defaultLabel(n.type),
          iconKey: n.type,
          builtin: true,
        });
      }
    });
    return Array.from(seen.values());
  }

  function loadNodeTypes(data) {
    const source = data || window.FLOWLENS_DATA || {};
    const seed = seedFromData(source);
    let stored = [];
    try {
      const raw = localStorage.getItem(storageKey(source));
      if (raw) stored = JSON.parse(raw) || [];
      if (!Array.isArray(stored)) stored = [];
    } catch (e) { stored = []; }

    const storedById = Object.fromEntries(stored.map(t => [t.id, t]));
    const out = seed.map(s => {
      const st = storedById[s.id];
      return st
        ? { ...s, label: st.label || s.label, iconKey: st.iconKey || s.iconKey, builtin: true }
        : s;
    });
    stored.forEach(t => {
      if (!seed.find(s => s.id === t.id)) {
        out.push({ ...t, builtin: false });
      }
    });
    return out;
  }

  function saveNodeTypes(list, projectOrData) {
    try { localStorage.setItem(storageKey(projectOrData), JSON.stringify(list)); }
    catch (e) { /* no-op */ }
  }

  function genTypeId() {
    return 'type_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  }

  // List of icon keys exposed in NODE_ICONS that users can pick from.
  function iconLibraryKeys() {
    if (!window.NODE_ICONS) return [];
    return Object.keys(window.NODE_ICONS);
  }

  window.NodeTypes = {
    loadNodeTypes, saveNodeTypes, genTypeId, iconLibraryKeys, defaultLabel,
  };
})();
