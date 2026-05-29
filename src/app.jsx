/* global React */
import React from 'react';

const { useState, useEffect, useMemo, useRef } = React;

// Hard-coded design constants
const SETTINGS = {
  background: 'flat',
  edgeMotion: 'smart',
  accent: '#E8C97A',
};

const MIGRATION = {
  fadeOutMs: 250,
  moveMs:    500,
  fadeInMs:  250,
};
const TOTAL_MIG_MS = MIGRATION.fadeOutMs + MIGRATION.moveMs + MIGRATION.fadeInMs;

// ── Overlay match predicates (data-driven; mirrored in canvas.jsx) ────
function overlayHasMatches(overlay, nodes, edges, nodeMap, view) {
  const include = view ? new Set(view.includeNodeTypes) : null;
  const visibleNodes = nodes.filter(n => !include || include.has(n.type));
  if (visibleNodes.some(n => window.LensMatch.nodeMatchesLens(n, overlay))) return true;
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));
  return visibleEdges.some(e => window.LensMatch.edgeMatchesLens(e, overlay, nodeMap));
}

function App({ data: graphData, projectPath = '/', onProjectNavigate }) {
  const data = graphData || window.FLOWLENS_DATA;
  window.FLOWLENS_DATA = data;
  const CanvasComponent = window.Canvas;
  const ControlPanelsComponent = window.ControlPanels;
  const SettingsPageComponent = window.SettingsPage;
  const ExportModalComponent = window.ExportModal;
  const InspectorComponent = window.Inspector;

  const nodeMap = useMemo(() => Object.fromEntries(data.nodes.map(n => [n.id, n])), [data.nodes]);
  const evidenceMap = useMemo(() => Object.fromEntries(data.evidence.map(e => [e.id, e])), [data.evidence]);

  // ── Selection ──────────────────────────────────────────────────────
  const [sel, setSel] = useState({ id: null, kind: null });
  const onSelect = (id, kind) => setSel({ id, kind });
  const onClearSelection = () => setSel({ id: null, kind: null });

  // ── Active view ────────────────────────────────────────────────────
  const [activeViewId, setActiveViewId] = useState(null);

  // Views — editable from Settings; seeded from data.views.
  const VIEWS_STORAGE = 'flowlens.views.' + (data.project?.id || 'default');
  const [views, setViews] = useState(() => {
    try {
      const raw = localStorage.getItem(VIEWS_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return (data.views || []).map(v => ({ ...v, builtin: true }));
  });
  useEffect(() => {
    try { localStorage.setItem(VIEWS_STORAGE, JSON.stringify(views)); } catch (e) {}
  }, [views]);
  function updateView(id, patch) {
    setViews(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
  }
  function addView() {
    const id = 'view_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
    setViews(prev => [...prev, {
      id,
      label: 'New view',
      description: '',
      includeNodeTypes: [],
      includeEdgeTypes: [],
      builtin: false,
    }]);
  }
  function removeView(id) {
    setViews(prev => prev.filter(v => v.id !== id));
    if (activeViewId === id) setActiveViewId(null);
  }
  const activeView = activeViewId ? views.find(v => v.id === activeViewId) : null;

  // ── Layout-edit mode + per-view position overrides ────────────────
  const [editLayout, setEditLayout] = useState(() => {
    try { return localStorage.getItem('flowlens.editLayout') === '1'; }
    catch (e) { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('flowlens.editLayout', editLayout ? '1' : '0'); }
    catch (e) { /* no-op */ }
  }, [editLayout]);
  useEffect(() => {
    if (!activeViewId && editLayout) setEditLayout(false);
  }, [activeViewId, editLayout]);

  const [layoutOverrides, setLayoutOverrides] = useState(() =>
    window.LayoutOverrides.loadAllOverrides((views || []).map(v => v.id))
  );
  function onMoveNode(nodeId, snappedPos) {
    if (!activeViewId) return;
    setLayoutOverrides(prev => {
      const forView = { ...(prev[activeViewId] || {}) };
      forView[nodeId] = { x: snappedPos.x, y: snappedPos.y };
      const next = { ...prev, [activeViewId]: forView };
      window.LayoutOverrides.saveOverrides(activeViewId, forView);
      return next;
    });
  }
  function resetLayoutOverrides(viewId) {
    setLayoutOverrides(prev => {
      const next = { ...prev };
      delete next[viewId];
      window.LayoutOverrides.saveOverrides(viewId, {});
      return next;
    });
  }

  // Bumped whenever the inspector mutates a node or edge in place; forces
  // a re-render of components that read from the shared graph data.
  const [editVersion, setEditVersion] = useState(0);
  const editVersionRef = useRef(editVersion);
  useEffect(() => { editVersionRef.current = editVersion; }, [editVersion]);
  const onEdit = () => setEditVersion(v => v + 1);
  const allLayouts = useMemo(() => {
    const base = window.precomputeAllLayouts(data, views);
    Object.keys(layoutOverrides).forEach(viewId => {
      if (base[viewId]) {
        base[viewId] = window.LayoutOverrides.applyOverrides(base[viewId], layoutOverrides[viewId]);
      }
    });
    return base;
  }, [data, views, layoutOverrides]);
  const allLanes   = useMemo(() => window.precomputeAllLanes  (data, views), [data, views]);

  // ── Categories (runtime-editable list with labels + colors) ────────
  const [categories, setCategories] = useState(() => window.Categories.loadCategories(data));
  useEffect(() => { window.Categories.saveCategories(categories, data); }, [categories, data]);
  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map(c => [c.id, c])),
    [categories]
  );
  // Count of nodes per category (for the settings page)
  const categoryUsage = useMemo(() => {
    const out = {};
    data.nodes.forEach(n => { out[n.category] = (out[n.category] || 0) + 1; });
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.nodes, editVersionRef.current]);

  // Inject a <style> with `--cat` rules per category id. This is the single
  // source of truth for node category color — overrides the static rules in
  // styles.css for built-ins and adds rules for custom categories.
  useEffect(() => {
    let el = document.getElementById('dynamic-categories');
    if (!el) {
      el = document.createElement('style');
      el.id = 'dynamic-categories';
      document.head.appendChild(el);
    }
    const rules = categories.map(c =>
      `.node[data-cat="${c.id}"] { --cat: ${c.color}; }`
    ).join('\n');
    el.textContent = rules;
  }, [categories]);

  function updateCategory(id, patch) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }
  function addCategory() {
    const id = window.Categories.genCategoryId();
    // Pick a swatch from the palette that's not yet used
    const PALETTE = [25, 75, 130, 175, 200, 260, 300, 340].map(h => `oklch(0.76 0.14 ${h})`);
    const used = new Set(categories.map(c => c.color));
    const free = PALETTE.find(p => !used.has(p)) || PALETTE[0];
    setCategories(prev => [...prev, { id, label: 'New category', color: free, builtin: false }]);
  }
  function removeCategory(id) {
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  // ── Node Types (runtime-editable list with label + icon) ──────────
  const [nodeTypes, setNodeTypes] = useState(() => window.NodeTypes.loadNodeTypes(data));
  useEffect(() => { window.NodeTypes.saveNodeTypes(nodeTypes, data); }, [nodeTypes, data]);
  const nodeTypesById = useMemo(
    () => Object.fromEntries(nodeTypes.map(t => [t.id, t])),
    [nodeTypes]
  );
  const nodeTypeUsage = useMemo(() => {
    const out = {};
    data.nodes.forEach(n => { out[n.type] = (out[n.type] || 0) + 1; });
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.nodes, editVersionRef.current]);

  function updateNodeType(id, patch) {
    setNodeTypes(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }
  function addNodeType() {
    const id = window.NodeTypes.genTypeId();
    setNodeTypes(prev => [...prev, { id, label: 'New type', iconKey: 'process', builtin: false }]);
  }
  function removeNodeType(id) {
    setNodeTypes(prev => prev.filter(t => t.id !== id));
  }

  // ── Edge Types (runtime-editable list with labels) ────────────────
  const [edgeTypes, setEdgeTypes] = useState(() => window.EdgeTypes.loadEdgeTypes(data));
  useEffect(() => { window.EdgeTypes.saveEdgeTypes(edgeTypes, data); }, [edgeTypes, data]);
  const edgeTypeUsage = useMemo(() => {
    const out = {};
    data.edges.forEach(e => { if (e.type) out[e.type] = (out[e.type] || 0) + 1; });
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.edges, editVersionRef.current]);
  function updateEdgeType(id, patch) {
    setEdgeTypes(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }
  function addEdgeType() {
    const id = window.EdgeTypes.genEdgeTypeId();
    setEdgeTypes(prev => [...prev, { id, label: 'New edge type', builtin: false }]);
  }
  function removeEdgeType(id) {
    setEdgeTypes(prev => prev.filter(t => t.id !== id));
  }

  // ── Metadata field discovery (used by Lens editor in Settings) ───────
  // Walks every node + edge metadata payload and collects available fields
  // and the unique values seen for each. Lens conditions can only reference
  // fields that exist in the data — no free-form path entry.
  const metaFields = useMemo(() => {
    const node = new Map();   // field -> { values: Set, samples: Set, kinds: Set }
    const edge = new Map();
    function walk(meta, store) {
      if (!meta || typeof meta !== 'object') return;
      for (const [k, v] of Object.entries(meta)) {
        if (v === null || v === undefined) continue;
        if (!store.has(k)) store.set(k, { values: new Set(), kinds: new Set() });
        const slot = store.get(k);
        if (Array.isArray(v)) {
          slot.kinds.add('array');
          v.forEach(x => slot.values.add(typeof x === 'object' ? JSON.stringify(x) : x));
        } else if (typeof v === 'object') {
          // Skip nested objects for now (no current data uses them in lenses)
        } else {
          slot.kinds.add(typeof v);
          slot.values.add(v);
        }
      }
    }
    (data.nodes || []).forEach(n => walk(n.metadata || {}, node));
    (data.edges || []).forEach(e => walk(e.metadata || {}, edge));
    function toList(store) {
      return [...store.entries()]
        .map(([field, { values, kinds }]) => {
          const vals = [...values];
          let kind = 'string';
          if (kinds.has('boolean') && kinds.size === 1) kind = 'boolean';
          else if (kinds.has('array')) kind = 'multi';
          else if (kinds.has('number') && kinds.size === 1) kind = 'number';
          // low-cardinality string fields → enum
          else if (vals.length > 0 && vals.length <= 12) kind = 'enum';
          return { field, path: 'metadata.' + field, kind, values: vals.sort() };
        })
        .sort((a, b) => a.field.localeCompare(b.field));
    }
    return { node: toList(node), edge: toList(edge) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.nodes, data.edges, editVersionRef.current]);

  // ── Overlays / Lenses (runtime-editable) ──────────────────────────────
  const OVERLAYS_STORAGE = 'flowlens.overlays.' + (data.project?.id || 'default');
  const [overlays, setOverlays] = useState(() => {
    try {
      const raw = localStorage.getItem(OVERLAYS_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return (data.overlays || []).map(o => ({ ...o, builtin: true }));
  });
  useEffect(() => {
    try { localStorage.setItem(OVERLAYS_STORAGE, JSON.stringify(overlays)); } catch (e) {}
  }, [overlays]);
  function updateOverlay(id, patch) {
    setOverlays(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
  }
  function addOverlay() {
    const id = 'lens_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
    setOverlays(prev => [...prev, {
      id,
      label: 'New lens',
      description: '',
      match: {},
      alsoMatchNodeTypes: [],
      alsoMatchEdgeTypes: [],
      builtin: false,
    }]);
  }
  function removeOverlay(id) {
    setOverlays(prev => prev.filter(o => o.id !== id));
  }

  // Filter overlays to those with at least one match in the current view
  const visibleOverlays = useMemo(
    () => overlays.filter(o => overlayHasMatches(o, data.nodes, data.edges, nodeMap, activeView)),
    [overlays, data.nodes, data.edges, nodeMap, activeView]
  );

  const [activeOverlays, setActiveOverlays] = useState(new Set());
  const toggleOverlay = (id) => setActiveOverlays(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // Auto-deactivate overlays that are no longer visible (e.g., user toggled SoR in Combined,
  // then switched to a view where SoR has no matches)
  useEffect(() => {
    const visibleIds = new Set(visibleOverlays.map(o => o.id));
    setActiveOverlays(prev => {
      const next = new Set([...prev].filter(id => visibleIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [visibleOverlays]);

  const replay = window.useReplay(data.scenarios);

  // ── Migration state ────────────────────────────────────────────────
  // displayedViewId lags behind activeViewId during the migration.
  const [displayedViewId, setDisplayedViewId] = useState(activeViewId);
  // Live positions Map<nodeId, {x,y}> — what's currently rendered.
  const [livePositions, setLivePositions] = useState(allLayouts.__combined);
  // Live opacity Map<nodeId, number>.
  const [liveOpacity, setLiveOpacity] = useState({});
  // True during phases that should fade edges out.
  const [migrationActive, setMigrationActive] = useState(false);
  // Track current migration so we can cancel
  const migrationTimersRef = useRef([]);

  function cancelMigration() {
    migrationTimersRef.current.forEach(t => window.clearTimeout(t));
    migrationTimersRef.current = [];
  }

  // When the active view's overrides change, push the updated layout into
  // livePositions so the canvas reflects it without waiting for a migration.
  useEffect(() => {
    if (!activeViewId) return;
    const target = allLayouts[activeViewId];
    if (target) setLivePositions(target);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutOverrides]);

  // Run migration when activeViewId changes
  useEffect(() => {
    const fromId = displayedViewId == null ? '__combined' : displayedViewId;
    const toId   = activeViewId == null   ? '__combined' : activeViewId;
    if (fromId === toId) return;

    cancelMigration();

    const fromPositions = allLayouts[fromId] || {};
    const toPositions   = allLayouts[toId]   || {};
    const fromIds = new Set(Object.keys(fromPositions));
    const toIds   = new Set(Object.keys(toPositions));
    const leaving  = [...fromIds].filter(id => !toIds.has(id));
    const entering = [...toIds].filter(id => !fromIds.has(id));

    // Phase 1: fade out leaving nodes + dim all edges
    const opPhase1 = {};
    leaving.forEach(id => { opPhase1[id] = 0; });
    entering.forEach(id => { opPhase1[id] = 0; }); // entering starts invisible
    setLiveOpacity(opPhase1);
    setMigrationActive(true);

    // Phase 2: at fadeOutMs, set positions to NEW layout for staying & entering nodes
    const t1 = window.setTimeout(() => {
      // Combine: leaving nodes keep old position (invisible), entering & staying get new
      const merged = { ...fromPositions };
      toIds.forEach(id => { merged[id] = toPositions[id]; });
      setLivePositions(merged);
    }, MIGRATION.fadeOutMs);

    // Phase 3: at fadeOutMs + moveMs, fade in entering nodes and edges
    const t2 = window.setTimeout(() => {
      setLiveOpacity(prev => {
        const next = { ...prev };
        entering.forEach(id => { next[id] = 1; });
        return next;
      });
      setMigrationActive(false);
    }, MIGRATION.fadeOutMs + MIGRATION.moveMs);

    // Cleanup at end of migration
    const t3 = window.setTimeout(() => {
      setDisplayedViewId(activeViewId);
      // Final positions = target layout only (leaving nodes drop out)
      setLivePositions(toPositions);
      setLiveOpacity({});
    }, TOTAL_MIG_MS);

    migrationTimersRef.current = [t1, t2, t3];
    return cancelMigration;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeViewId]);

  // Apply accent
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', SETTINGS.accent);
  }, []);

  // Replay focus
  useEffect(() => {
    if (replay.playing && replay.stepIdx >= 0) {
      const step = replay.steps[replay.stepIdx];
      if (step?.nodeId) setSel({ id: step.nodeId, kind: 'node' });
      else if (step?.edgeId) setSel({ id: step.edgeId, kind: 'edge' });
    }
  }, [replay.stepIdx, replay.playing]);

  const canvasFitRef = useRef(null);

  // Export modal
  const [exportOpen, setExportOpen] = useState(false);

  // Settings page
  const [settingsOpen, setSettingsOpen] = useState(false);
  function navigateToProject(event) {
    if (!onProjectNavigate) return;
    event.preventDefault();
    onProjectNavigate();
  }

  return React.createElement('div', { className: 'app' + (sel.id ? ' has-inspector' : '') + (migrationActive ? ' is-migrating' : '') },
    React.createElement('div', { className: 'topbar' },
      React.createElement('div', { className: 'brand' },
        React.createElement('div', {
          className: 'brand-mark',
          'aria-hidden': 'true',
          dangerouslySetInnerHTML: { __html:
            '<svg width="22" height="22" viewBox="0 0 52 52">'
            + '<polygon points="26,4 40,12 44,26 40,40 26,48 12,40 8,26 12,12" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.9"></polygon>'
            + '<polygon class="refraction" points="26,10 36,16 39,26 36,36 26,42 16,36 13,26 16,16" fill="none" stroke="currentColor" stroke-width="0.75" opacity="0.4"></polygon>'
            + '<circle cx="26" cy="26" r="2.5" fill="currentColor" opacity="0.9"></circle>'
            + '<circle class="glow" cx="26" cy="26" r="5" fill="currentColor" opacity="0.25" style="filter: blur(3px);"></circle>'
            + '<line x1="26" y1="10" x2="26" y2="42" stroke="currentColor" stroke-width="0.5" opacity="0.25"></line>'
            + '<line x1="10" y1="26" x2="42" y2="26" stroke="currentColor" stroke-width="0.5" opacity="0.25"></line>'
            + '</svg>'
          }
        }),
        'SOLSTEIN'
      ),
      React.createElement('div', { className: 'topbar-divider' }),
      React.createElement('a', {
        className: 'tb-back',
        href: projectPath,
        onClick: navigateToProject,
        title: 'Back to project',
        'aria-label': 'Back to project',
      },
        React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('path', { d: 'M10 3L5 8l5 5' }),
        ),
      ),
      React.createElement('div', { className: 'topbar-meta' },
        React.createElement('a', { className: 'name', href: projectPath, onClick: navigateToProject, title: 'Back to project' }, data.project.name),
      ),
      React.createElement('div', { className: 'topbar-divider' }),
      React.createElement('div', { className: 'tb-stat' },
        'v', data.project.version, ' · ',
        React.createElement('strong', null, data.project.createdAt)
      ),
      React.createElement('div', { className: 'topbar-spacer' }),
      React.createElement('div', { className: 'topbar-actions' },
        React.createElement('button', {
          className: 'tb-btn' + (settingsOpen ? ' is-active' : ''),
          title: 'Settings',
          onClick: () => setSettingsOpen(true),
          'aria-haspopup': 'dialog',
          'aria-expanded': settingsOpen,
        },
          React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
            React.createElement('path', { d: 'M8 1.6l1.5 1.6 2.2-.4.5 2.1 2 1L13.4 8l.8 2.1-2 1-.5 2.1-2.2-.4L8 14.4l-1.5-1.6-2.2.4-.5-2.1-2-1L2.6 8l-.8-2.1 2-1 .5-2.1 2.2.4z' }),
            React.createElement('circle', { cx: 8, cy: 8, r: 2.2 }),
          ),
          'Settings'
        ),
        React.createElement('button', {
          className: 'tb-btn' + (exportOpen ? ' is-active' : ''),
          title: 'Export',
          onClick: () => setExportOpen(true),
          'aria-haspopup': 'dialog',
          'aria-expanded': exportOpen,
        },
          React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
            React.createElement('path', { d: 'M8 2v8M4.5 6.5L8 10l3.5-3.5M2.5 13h11' }),
          ),
          'Export'
        ),
      )
    ),

    React.createElement(CanvasComponent, {
      nodes: data.nodes,
      edges: data.edges,
      nodeMap,
      selectedId: sel.id,
      selectedKind: sel.kind,
      onSelect,
      onClearSelection,
      activeView,
      activeOverlays,
      overlays,
      replayState: replay.state,
      tweaks: SETTINGS,
      registerFit: (fn) => { canvasFitRef.current = fn; },
      livePositions,
      liveOpacity,
      migrationActive,
      lanes: allLanes[activeViewId || '__combined'] || [],
      editLayout,
      setEditLayout,
      onMoveNode,
      nodeTypesById,
      nodeTypes,
      categories,
    }),

    React.createElement(ControlPanelsComponent, {
      views: views,
      overlays: visibleOverlays,
      activeViewId,
      onViewChange: setActiveViewId,
      activeOverlays,
      onToggleOverlay: toggleOverlay,
      replay,
    }),

    React.createElement(SettingsPageComponent, {
      open: settingsOpen,
      onClose: () => setSettingsOpen(false),
      categories,
      categoryUsage,
      onUpdateCategory: updateCategory,
      onAddCategory: addCategory,
      onRemoveCategory: removeCategory,
      nodeTypes,
      nodeTypeUsage,
      onUpdateNodeType: updateNodeType,
      onAddNodeType: addNodeType,
      onRemoveNodeType: removeNodeType,
      edgeTypes,
      edgeTypeUsage,
      onUpdateEdgeType: updateEdgeType,
      onAddEdgeType: addEdgeType,
      onRemoveEdgeType: removeEdgeType,
      views,
      onUpdateView: updateView,
      onAddView: addView,
      onRemoveView: removeView,
      overlays,
      onUpdateOverlay: updateOverlay,
      onAddOverlay: addOverlay,
      onRemoveOverlay: removeOverlay,
      lensMetaFields: metaFields,
    }),

    React.createElement(ExportModalComponent, {
      open: exportOpen,
      onClose: () => setExportOpen(false),
      data,
      activeViewId,
      activeOverlays,
    }),

    React.createElement(InspectorComponent, {
      selectedId: sel.id,
      selectedKind: sel.kind,
      nodes: data.nodes,
      edges: data.edges,
      nodeMap,
      evidenceMap,
      project: data.project,
      visibleIds: new Set(Object.keys(livePositions || {})),
      onSelect,
      onClose: onClearSelection,
      onEdit,
      categories,
      categoriesById,
      nodeTypes,
      nodeTypesById,
    }),
  );
}

window.FlowLensApp = App;

export default App;
