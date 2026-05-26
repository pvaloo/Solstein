/* global window */
// Layout overrides — user-positioned nodes within a view.
// Stored per view in localStorage as { [nodeId]: { x, y } }. Applied on top
// of the precomputed layout positions.

(function () {
  const STORAGE_PREFIX = 'flowlens.layoutOverrides.';

  function loadOverrides(viewId) {
    if (!viewId) return {};
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + viewId);
      return raw ? (JSON.parse(raw) || {}) : {};
    } catch (e) { return {}; }
  }
  function saveOverrides(viewId, overrides) {
    if (!viewId) return;
    try {
      if (!overrides || Object.keys(overrides).length === 0) {
        localStorage.removeItem(STORAGE_PREFIX + viewId);
      } else {
        localStorage.setItem(STORAGE_PREFIX + viewId, JSON.stringify(overrides));
      }
    } catch (e) { /* no-op */ }
  }
  function loadAllOverrides(viewIds) {
    const out = {};
    (viewIds || []).forEach(id => {
      const ov = loadOverrides(id);
      if (Object.keys(ov).length) out[id] = ov;
    });
    return out;
  }

  // Layout-config-aware helpers
  function slotToPos(options, lane, slot) {
    return {
      x: options.startX + (slot - 1) * options.columnGap,
      y: options.startY + (lane - 1) * options.laneGap,
    };
  }
  function posToSlot(options, x, y, maxLane) {
    const lane = Math.max(1, Math.min(maxLane || 99, Math.round((y - options.startY) / options.laneGap) + 1));
    const slot = Math.max(1, Math.round((x - options.startX) / options.columnGap) + 1);
    return { lane, slot };
  }

  // Apply overrides to a positions map for one view.
  function applyOverrides(positions, overrides) {
    if (!overrides || Object.keys(overrides).length === 0) return positions;
    const out = { ...positions };
    Object.entries(overrides).forEach(([id, p]) => {
      // Only override nodes that already have a position in this view
      // (i.e. are included by the view's node-type filter).
      if (out[id] !== undefined) out[id] = { x: p.x, y: p.y };
    });
    return out;
  }

  // Build {laneNum: {slotNum: nodeId}} occupancy from positions in a view.
  function buildOccupancy(positions, options) {
    const occ = {};
    Object.entries(positions).forEach(([id, p]) => {
      const { lane, slot } = posToSlot(options, p.x, p.y);
      if (!occ[lane]) occ[lane] = {};
      // First writer wins (shouldn't collide for well-formed layouts)
      if (!occ[lane][slot]) occ[lane][slot] = id;
    });
    return occ;
  }

  window.LayoutOverrides = {
    STORAGE_PREFIX,
    loadOverrides, saveOverrides, loadAllOverrides,
    slotToPos, posToSlot, applyOverrides, buildOccupancy,
  };
})();
