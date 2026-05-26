/* global window */
// FlowLens layout engine
// Given a graph + a layout config, compute (x,y) positions per node.
//
// One strategy: 'layered' — numbered lanes with named groups. Each node
// has an explicit lane number; lanes are grouped under shared labels.

(function () {
  // ── Helpers ────────────────────────────────────────────────────────
  function filterIncluded(nodes, edges, view) {
    const includeNodeTypes = new Set(view.includeNodeTypes || []);
    const includeEdgeTypes = new Set(view.includeEdgeTypes || []);
    const includedNodes = nodes.filter(n => includeNodeTypes.size === 0 || includeNodeTypes.has(n.type));
    const allowedIds = new Set(includedNodes.map(n => n.id));
    const includedEdges = edges.filter(e =>
      allowedIds.has(e.from) && allowedIds.has(e.to) &&
      (includeEdgeTypes.size === 0 || includeEdgeTypes.has(e.type))
    );
    return { includedNodes, includedEdges, allowedIds };
  }

  // ── Strategy: layered (numbered lanes + optional slot overrides) ─────
  function computeLayered(graph, view, config) {
    const { includedNodes } = filterIncluded(graph.nodes, graph.edges, view);
    const o = config.options;
    const nodeLanes = config.nodeLanes || {};
    const nodeSlots = config.nodeSlots || {};

    // Group nodes by lane number (1-indexed)
    const byLane = {};
    includedNodes.forEach(n => {
      const laneNum = nodeLanes[n.id];
      if (!laneNum) return;
      if (!byLane[laneNum]) byLane[laneNum] = [];
      byLane[laneNum].push(n);
    });

    // Stable order within each lane: by original x then id
    Object.values(byLane).forEach(arr => {
      arr.sort((a, b) => {
        const dx = (a.pos?.x || 0) - (b.pos?.x || 0);
        if (dx !== 0) return dx;
        return a.id.localeCompare(b.id);
      });
    });

    // Assign slot per node:
    //   - pinned slots are placed at their declared column
    //   - unpinned nodes fill remaining slots starting at 1, skipping pinned ones
    const positions = {};
    Object.entries(byLane).forEach(([laneNum, arr]) => {
      const laneIdx = parseInt(laneNum, 10) - 1;
      const y = o.startY + laneIdx * o.laneGap;

      // Identify pinned vs unpinned in this lane
      const pinnedBySlot = new Map(); // slot -> node
      const unpinned = [];
      arr.forEach(n => {
        const slot = nodeSlots[n.id];
        if (slot && !pinnedBySlot.has(slot)) {
          pinnedBySlot.set(slot, n);
        } else {
          unpinned.push(n);
        }
      });

      // Fill unpinned nodes into the lowest available slots
      let cursor = 1;
      unpinned.forEach(n => {
        while (pinnedBySlot.has(cursor)) cursor++;
        positions[n.id] = { x: o.startX + (cursor - 1) * o.columnGap, y };
        cursor++;
      });

      // Place pinned nodes
      pinnedBySlot.forEach((n, slot) => {
        positions[n.id] = { x: o.startX + (slot - 1) * o.columnGap, y };
      });
    });

    return positions;
  }

  // ── Public API ─────────────────────────────────────────────────────
  function computeLayout(graph, view) {
    if (!view) {
      // Combined view = original positions from data
      const positions = {};
      graph.nodes.forEach(n => { positions[n.id] = { ...n.pos }; });
      return positions;
    }

    const config = window.FLOWLENS_LAYOUTS && window.FLOWLENS_LAYOUTS[view.id];
    if (!config) {
      // No config — fall back to data positions
      const positions = {};
      graph.nodes.forEach(n => {
        if (!view.includeNodeTypes || view.includeNodeTypes.includes(n.type)) {
          positions[n.id] = { ...n.pos };
        }
      });
      return positions;
    }

    switch (config.strategy) {
      case 'layered': return computeLayered(graph, view, config);
      default:
        console.warn('Unknown layout strategy:', config.strategy);
        return {};
    }
  }

  function precomputeAllLayouts(graph, views) {
    const out = { __combined: computeLayout(graph, null) };
    views.forEach(v => {
      out[v.id] = computeLayout(graph, v);
    });
    return out;
  }

  // ── Lane groups (for layered strategies) ───────────────────────────
  // Returns the list of LANE GROUPS that actually have content, with their
  // y-position and total height (spanning the lane range they cover).
  // Each group also exposes the internal lane divider positions for groups
  // that span more than one lane.
  function computeLanesForView(graph, view) {
    if (!view) return [];
    const config = window.FLOWLENS_LAYOUTS && window.FLOWLENS_LAYOUTS[view.id];
    if (!config || config.strategy !== 'layered') return [];

    const { includedNodes } = filterIncluded(graph.nodes, graph.edges, view);
    const o = config.options;
    const nodeLanes = config.nodeLanes || {};
    const laneGroups = config.laneGroups || [];

    const groups = [];
    laneGroups.forEach(g => {
      const nodesInGroup = includedNodes.filter(n => {
        const ln = nodeLanes[n.id];
        return ln >= g.from && ln <= g.to;
      });
      if (nodesInGroup.length === 0) return; // skip empty groups

      const fromIdx = g.from - 1;
      const span = g.to - g.from + 1;
      const y = o.startY + fromIdx * o.laneGap;
      const height = span * o.laneGap;

      // Internal lane separators (only for groups spanning >1 lane)
      const internalLanes = [];
      for (let l = g.from + 1; l <= g.to; l++) {
        internalLanes.push({
          laneNum: l,
          y: o.startY + (l - 1) * o.laneGap,
        });
      }

      groups.push({
        id: `group-${g.from}-${g.to}`,
        name: g.name,
        from: g.from,
        to: g.to,
        y,
        height,
        count: nodesInGroup.length,
        internalLanes,
      });
    });
    return groups;
  }

  function precomputeAllLanes(graph, views) {
    const out = { __combined: [] };
    views.forEach(v => {
      out[v.id] = computeLanesForView(graph, v);
    });
    return out;
  }

  window.computeLayout = computeLayout;
  window.precomputeAllLayouts = precomputeAllLayouts;
  window.computeLanesForView = computeLanesForView;
  window.precomputeAllLanes = precomputeAllLanes;
})();
