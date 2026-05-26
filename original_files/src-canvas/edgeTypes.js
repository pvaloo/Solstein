/* global window */
// Edge types — runtime list of edge relationship types with labels.
// Seeded from whatever edge types appear in the graph data; user can
// rename, add new types, or delete unused custom types.

(function () {
  const STORAGE_KEY = 'flowlens.edgeTypes';

  // Default labels for known edge type ids.
  const DEFAULT_LABELS = {
    creates: 'Creates',
    reads: 'Reads',
    writes_to: 'Writes to',
    implemented_by: 'Implemented by',
    manual_rekey: 'Manual re-key',
    triggers: 'Triggers',
    depends_on: 'Depends on',
    performs: 'Performs',
    sends: 'Sends',
    changes_state: 'Changes state',
    api_call: 'API call',
    db_write: 'DB write',
    db_read: 'DB read',
    elt_job: 'ELT job',
    batch_export: 'Batch export',
    report_query: 'Report query',
  };

  function titleCase(s) {
    return s.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  }
  function defaultLabel(id) {
    return DEFAULT_LABELS[id] || titleCase(id);
  }

  // Seed from the graph data — every edge type referenced becomes built-in.
  function seedFromData(data) {
    const seen = new Map();
    (data.edges || []).forEach(e => {
      if (!seen.has(e.type)) {
        seen.set(e.type, {
          id: e.type,
          label: e.typeLabel || defaultLabel(e.type),
          builtin: true,
        });
      }
    });
    return Array.from(seen.values());
  }

  function loadEdgeTypes(data) {
    const seed = seedFromData(data);
    let stored = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) || [];
      if (!Array.isArray(stored)) stored = [];
    } catch (e) { stored = []; }

    const storedById = Object.fromEntries(stored.map(t => [t.id, t]));
    const out = seed.map(s => {
      const st = storedById[s.id];
      return st
        ? { ...s, label: st.label || s.label, builtin: true }
        : s;
    });
    stored.forEach(t => {
      if (!seed.find(s => s.id === t.id)) {
        out.push({ ...t, builtin: false });
      }
    });
    return out;
  }

  function saveEdgeTypes(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { /* no-op */ }
  }

  function genEdgeTypeId() {
    return 'edge_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  }

  window.EdgeTypes = {
    loadEdgeTypes, saveEdgeTypes, genEdgeTypeId, defaultLabel,
  };
})();
