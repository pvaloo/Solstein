/* global React, Edge, NodeCard, AddNodeModal */

const { useState, useRef, useEffect, useCallback, useMemo } = React;

function Canvas({
  nodes, edges, nodeMap,
  selectedId, selectedKind, onSelect, onClearSelection,
  activeView, activeOverlays, overlays, replayState, tweaks, registerFit,
  livePositions, liveOpacity, migrationActive,
  lanes,
  editLayout, setEditLayout, onMoveNode,
  nodeTypesById, nodeTypes, categories,
}) {
  const wrapRef = useRef(null);
  const viewportRef = useRef(null);
  const [transform, setTransform] = useState({ x: 80, y: 60, k: 0.85 });
  const [isPanning, setIsPanning] = useState(false);
  const panStateRef = useRef(null);
  const animFrameRef = useRef(null);
  const transformRef = useRef(transform);
  useEffect(() => { transformRef.current = transform; }, [transform]);

  // Cancel any in-progress tween (called on user pan/zoom)
  const cancelTween = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // Tween the transform via rAF
  const animateToTransform = useCallback((target, duration = 700) => {
    cancelTween();
    const start = transformRef.current;
    const t0 = performance.now();
    // cubic ease-out
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const elapsed = now - t0;
      const tt = Math.min(1, elapsed / duration);
      const e = ease(tt);
      setTransform({
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
        k: start.k + (target.k - start.k) * e,
      });
      if (tt < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, [cancelTween]);

  // ── Layout-edit drag state ─────────────────────────────────────────
  // dragState = null when idle; while dragging:
  //   { nodeId, startClientX, startClientY, initialPos, pointerOffset,
  //     currentPos, snap: {lane, slot}, blocked, moved, options }
  const [dragState, setDragState] = useState(null);
  const dragStateRef = useRef(null);
  const [addNodeAt, setAddNodeAt] = useState(null); // {lane, slot, laneName} | null
  useEffect(() => { dragStateRef.current = dragState; }, [dragState]);

  // Layout config for the current view (needed for slot snapping)
  const viewConfig = activeView && window.FLOWLENS_LAYOUTS
    ? window.FLOWLENS_LAYOUTS[activeView.id]
    : null;
  const canDragLayout = !!(editLayout && viewConfig && viewConfig.strategy === 'layered' && !migrationActive);

  // Max lane number for the current view (clamp drag snap to it)
  const maxLane = useMemo(() => {
    if (!lanes || !lanes.length) return 8;
    return Math.max(...lanes.map(g => g.to));
  }, [lanes]);

  // Occupancy snapshot computed once at drag start (held in dragState for stability).
  const onNodeDragStart = useCallback((nodeId, e) => {
    if (!canDragLayout) return;
    const options = viewConfig.options;
    const pos = (livePositionsRef.current && livePositionsRef.current[nodeId]) || nodeMap[nodeId].pos;
    const k = transformRef.current.k;
    // Compute pointer offset within the node, in stage coordinates
    const stageRect = wrapRef.current.getBoundingClientRect();
    const stageX = (e.clientX - stageRect.left - transformRef.current.x) / k;
    const stageY = (e.clientY - stageRect.top - transformRef.current.y) / k;
    const pointerOffset = { x: stageX - pos.x, y: stageY - pos.y };

    const positions = livePositionsRef.current || {};
    const occupancy = window.LayoutOverrides.buildOccupancy(positions, options);

    setDragState({
      nodeId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialPos: pos,
      pointerOffset,
      currentPos: pos,
      snap: window.LayoutOverrides.posToSlot(options, pos.x, pos.y, maxLane),
      blocked: false,
      moved: false,
      options,
      occupancy,
    });
  }, [canDragLayout, viewConfig, nodeMap, maxLane]);

  // Document-level pointer handling while dragging
  useEffect(() => {
    if (!dragState) return;
    const DRAG_THRESHOLD = 3;

    function onMove(e) {
      const cur = dragStateRef.current;
      if (!cur) return;
      const k = transformRef.current.k;
      const stageRect = wrapRef.current.getBoundingClientRect();
      const stageX = (e.clientX - stageRect.left - transformRef.current.x) / k;
      const stageY = (e.clientY - stageRect.top - transformRef.current.y) / k;
      const newPos = {
        x: stageX - cur.pointerOffset.x,
        y: stageY - cur.pointerOffset.y,
      };
      const moved = cur.moved
        || Math.abs(e.clientX - cur.startClientX) > DRAG_THRESHOLD
        || Math.abs(e.clientY - cur.startClientY) > DRAG_THRESHOLD;
      const snap = window.LayoutOverrides.posToSlot(cur.options, newPos.x, newPos.y, maxLane);
      const occByLane = cur.occupancy[snap.lane] || {};
      const occupantId = occByLane[snap.slot];
      const blocked = !!(occupantId && occupantId !== cur.nodeId);
      setDragState({ ...cur, currentPos: newPos, snap, blocked, moved });
    }
    function onUp() {
      const cur = dragStateRef.current;
      if (!cur) return;
      if (!cur.moved) {
        // Treat as a regular click — select the node
        onSelect(cur.nodeId, 'node');
      } else if (!cur.blocked) {
        const snappedPos = window.LayoutOverrides.slotToPos(cur.options, cur.snap.lane, cur.snap.slot);
        // Commit only if the slot actually changed
        if (snappedPos.x !== cur.initialPos.x || snappedPos.y !== cur.initialPos.y) {
          onMoveNode && onMoveNode(cur.nodeId, snappedPos);
        }
      }
      // blocked → revert (do nothing; node falls back to its stored position)
      setDragState(null);
    }
    function onKey(e) {
      if (e.key === 'Escape') setDragState(null);
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      document.removeEventListener('keydown', onKey);
    };
  }, [dragState, maxLane, onSelect, onMoveNode]);

  // Pan/zoom handling --------------------------------------------------
  const onWheel = useCallback((e) => {
    e.preventDefault();
    cancelTween();
    const rect = wrapRef.current.getBoundingClientRect();
    const ox = e.clientX - rect.left;
    const oy = e.clientY - rect.top;
    setTransform((t) => {
      if (e.ctrlKey || e.metaKey || e.deltaMode === 1 || Math.abs(e.deltaY) > 25) {
        // Zoom
        const direction = e.deltaY < 0 ? 1 : -1;
        const factor = Math.exp(direction * 0.12);
        const k = Math.max(0.2, Math.min(1.05, t.k * factor));
        // Keep point under cursor fixed
        const x = ox - ((ox - t.x) * k) / t.k;
        const y = oy - ((oy - t.y) * k) / t.k;
        return { x, y, k };
      } else {
        // Pan
        return { ...t, x: t.x - e.deltaX, y: t.y - e.deltaY };
      }
    });
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const onPointerDown = (e) => {
    if (e.target.closest('.node') || e.target.closest('.edge-hit')) return;
    if (e.target.closest('.empty-slot')) return; // let empty-slot button receive click
    cancelTween();
    panStateRef.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    setIsPanning(true);
    onClearSelection();
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!panStateRef.current) return;
    const dx = e.clientX - panStateRef.current.x;
    const dy = e.clientY - panStateRef.current.y;
    setTransform((t) => ({ ...t, x: panStateRef.current.tx + dx, y: panStateRef.current.ty + dy }));
  };
  const onPointerUp = (e) => {
    panStateRef.current = null;
    setIsPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const zoomBy = (factor) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const ox = rect.width / 2;
    const oy = rect.height / 2;
    setTransform((t) => {
      const k = Math.max(0.2, Math.min(1.05, t.k * factor));
      const x = ox - ((ox - t.x) * k) / t.k;
      const y = oy - ((oy - t.y) * k) / t.k;
      return { x, y, k };
    });
  };
  const resetView = () => setTransform({ x: 80, y: 60, k: 0.85 });
  // Genesis state: true for first ~5s on mount
  const [isGenesis, setIsGenesis] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setIsGenesis(false), 5000);
    return () => window.clearTimeout(id);
  }, []);

  // Motes for living-noise backdrop — removed (per user request)

  // Scanner sweeps for overlay activations (newest one triggers a sweep)
  const [sweeps, setSweeps] = useState([]); // [{id, color, ts}]
  const prevOverlaysRef = useRef(new Set());
  const prevOverlayFitRef = useRef(new Set());
  useEffect(() => {
    const colorByOverlay = {
      pii: 'var(--pii)', manual_process: 'var(--manual)',
      high_risk: 'var(--risk)', system_of_record: 'var(--sor)',
      unknowns: 'oklch(0.78 0.04 250)',
    };
    const prev = prevOverlaysRef.current;
    const added = [...activeOverlays].filter(id => !prev.has(id));
    if (added.length > 0) {
      const ts = Date.now();
      const newSweeps = added.map((id, i) => ({
        id: `${id}-${ts}-${i}`,
        color: colorByOverlay[id] || 'var(--accent)',
      }));
      setSweeps(s => [...s, ...newSweeps]);
      window.setTimeout(() => {
        setSweeps(s => s.filter(sw => !newSweeps.find(n => n.id === sw.id)));
      }, 1300);
    }
    prevOverlaysRef.current = new Set(activeOverlays);
  }, [activeOverlays]);

  // Live ref so timed callbacks see the latest positions (closures otherwise capture stale ones)
  const livePositionsRef = useRef(livePositions);
  useEffect(() => { livePositionsRef.current = livePositions; }, [livePositions]);

  // ── Overlay match set (used for pan/zoom-to-matches) ───────────────
  const lensById = useMemo(() => window.LensMatch.lensById(overlays), [overlays]);
  const overlayMatchedIds = useMemo(() => {
    if (activeOverlays.size === 0) return [];
    const activeLenses = [...activeOverlays].map(lensById).filter(Boolean);
    const ids = [];
    for (const n of nodes) {
      if (activeLenses.some(l => window.LensMatch.nodeMatchesLens(n, l))) ids.push(n.id);
    }
    return ids;
  }, [nodes, activeOverlays, lensById]);

  // Pan/zoom to overlay matches when a new overlay is activated.
  // Suppression: inspector open, migration in flight, no matches, or matches span
  // most of the graph (would be a no-op zoom).
  useEffect(() => {
    const prev = prevOverlayFitRef.current;
    const added = [...activeOverlays].filter(id => !prev.has(id));
    prevOverlayFitRef.current = new Set(activeOverlays);
    if (added.length === 0) return;
    if (selectedId) return;            // inspector open, don't yank camera
    if (migrationActive) return;       // mid view-switch
    if (overlayMatchedIds.length === 0) return;

    const positions = livePositionsRef.current || {};
    // Skip if matches span >70% of the visible bbox (a fit would be a no-op).
    const totalIds = Object.keys(positions);
    if (totalIds.length === 0) return;
    function bbox(ids) {
      let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
      for (const id of ids) {
        const p = positions[id]; if (!p) continue;
        mnx = Math.min(mnx, p.x); mny = Math.min(mny, p.y);
        mxx = Math.max(mxx, p.x); mxy = Math.max(mxy, p.y);
      }
      return { w: Math.max(1, mxx - mnx), h: Math.max(1, mxy - mny) };
    }
    const matchBox = bbox(overlayMatchedIds);
    const allBox = bbox(totalIds);
    const areaFrac = (matchBox.w * matchBox.h) / (allBox.w * allBox.h);
    if (areaFrac > 0.7) return;

    // Tween after the sweep animation has started so the visual cue plays.
    const id = window.setTimeout(() => {
      animateToFit(overlayMatchedIds, positions, {
        inspectorOpen: false,
        padding: 100,
        kMin: 0.3,
        kMax: 0.95,
      });
    }, 200);
    return () => window.clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOverlays]);

  // Reusable: compute pan+zoom to fit a set of node IDs in the available area.
  // Positions are passed explicitly to avoid stale closures.
  const animateToFit = useCallback((nodeIds, positions, opts = {}) => {
    if (!wrapRef.current) return;
    const ids = Array.isArray(nodeIds) ? nodeIds : [...nodeIds];
    if (ids.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    ids.forEach(id => {
      const pos = (positions && positions[id]) || nodeMap[id]?.pos;
      if (!pos) return;
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + window.NODE_W);
      maxY = Math.max(maxY, pos.y + window.NODE_H);
    });
    if (minX === Infinity) return;

    const bboxW = maxX - minX;
    const bboxH = maxY - minY;
    const rect = wrapRef.current.getBoundingClientRect();
    const inspectorReserved = opts.inspectorOpen ? (420 + 16 + 24) : 0;
    const PADDING = opts.padding ?? 80;
    const availW = Math.max(200, rect.width - inspectorReserved - PADDING * 2);
    const availH = Math.max(200, rect.height - PADDING * 2);
    const kMin = opts.kMin || 0.25;
    const kMax = opts.kMax || 1.5;
    const k = Math.max(kMin, Math.min(kMax, Math.min(availW / bboxW, availH / bboxH)));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const targetX = (PADDING + availW / 2) - cx * k;
    const targetY = (PADDING + availH / 2) - cy * k;
    animateToTransform({ x: targetX, y: targetY, k }, opts.duration || 720);
  }, [nodeMap, animateToTransform]);

  // Inset relayout: pan+zoom to selected node + 1-hop neighbours
  const runInsetRelayout = useCallback(() => {
    if (selectedKind !== 'node' || !selectedId) return;
    if (!nodeMap[selectedId]) return;
    const positions = livePositionsRef.current || {};
    const ids = new Set([selectedId]);
    edges.forEach(e => {
      if (e.from === selectedId) ids.add(e.to);
      if (e.to === selectedId)   ids.add(e.from);
    });
    const visibleIds = [...ids].filter(id => positions[id] !== undefined);
    if (visibleIds.length === 0) return;
    animateToFit(visibleIds, positions, { inspectorOpen: true, padding: 80, kMin: 0.35, kMax: 1.0 });
  }, [selectedKind, selectedId, edges, nodeMap, animateToFit]);

  // Fit all visible nodes (post-migration, no selection)
  const fitVisible = useCallback((opts) => {
    const positions = livePositionsRef.current || {};
    const visibleIds = Object.keys(positions);
    if (visibleIds.length === 0) return;
    animateToFit(visibleIds, positions, { ...opts, padding: 56, kMin: 0.25, kMax: 1.6 });
  }, [animateToFit]);

  // Run inset relayout when selection changes (to a node)
  useEffect(() => {
    if (selectedKind !== 'node' || !selectedId) return;
    runInsetRelayout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selectedKind]);

  // After migration completes: re-fit the camera.
  // Wait 320ms after migrationActive false so livePositions has cleaned to target-only.
  const wasMigrating = useRef(false);
  useEffect(() => {
    if (wasMigrating.current && !migrationActive) {
      const id = window.setTimeout(() => {
        if (selectedKind === 'node' && selectedId) {
          runInsetRelayout();
        } else {
          fitVisible({ inspectorOpen: !!selectedId });
        }
      }, 360);
      return () => window.clearTimeout(id);
    }
    wasMigrating.current = migrationActive;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [migrationActive]);

  const fitView = useCallback(() => {
    const rect = wrapRef.current.getBoundingClientRect();
    const padding = 80;
    // bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.pos.x);
      minY = Math.min(minY, n.pos.y);
      maxX = Math.max(maxX, n.pos.x + window.NODE_W);
      maxY = Math.max(maxY, n.pos.y + window.NODE_H);
    });
    const w = maxX - minX, h = maxY - minY;
    const kx = (rect.width - padding * 2) / w;
    const ky = (rect.height - padding * 2) / h;
    const k = Math.max(0.2, Math.min(1.5, Math.min(kx, ky)));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const x = rect.width / 2 - cx * k;
    const y = rect.height / 2 - cy * k;
    setTransform({ x, y, k });
  }, [nodes]);

  // Register fit handler with parent and run once on mount
  useEffect(() => {
    if (registerFit) registerFit(fitView);
    const id = window.setTimeout(() => fitView(), 60);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build effective nodes with live positions merged in (so Edge geometry follows them)
  const effectiveNodes = useMemo(() => {
    if (!livePositions) return nodes;
    return nodes.map(n => {
      const lp = livePositions[n.id];
      return lp ? { ...n, pos: lp } : n;
    });
  }, [nodes, livePositions]);
  const effectiveNodeMap = useMemo(
    () => Object.fromEntries(effectiveNodes.map(n => [n.id, n])),
    [effectiveNodes]
  );

  // ----- Derived display states for nodes/edges -----
  const { nodeStates, edgeStates } = useMemo(() => {
    // Compute view filtering — fade nodes/edges outside the active view
    const includedNodeTypes = activeView ? new Set(activeView.includeNodeTypes) : null;
    const includedEdgeTypes = activeView ? new Set(activeView.includeEdgeTypes) : null;

    // Determine which nodes are "in view"
    const inViewNode = (n) => !includedNodeTypes || includedNodeTypes.has(n.type);
    const inViewEdge = (e) => {
      if (!includedEdgeTypes) return true;
      return includedEdgeTypes.has(e.type)
        && inViewNode(nodeMap[e.from])
        && inViewNode(nodeMap[e.to]);
    };

    // 1-hop related set when something is selected
    const related = new Set();
    let selectedNode = null, selectedEdge = null;
    if (selectedKind === 'node') {
      selectedNode = nodeMap[selectedId];
      edges.forEach((e) => {
        if (e.from === selectedId) related.add(e.to);
        if (e.to === selectedId)   related.add(e.from);
      });
    } else if (selectedKind === 'edge') {
      selectedEdge = edges.find(e => e.id === selectedId);
      if (selectedEdge) {
        related.add(selectedEdge.from);
        related.add(selectedEdge.to);
      }
    }
    const relatedEdgeIds = new Set();
    if (selectedKind === 'node') {
      edges.forEach((e) => {
        if (e.from === selectedId || e.to === selectedId) relatedEdgeIds.add(e.id);
      });
    }

    // Overlay matching
    const overlayColors = {
      pii: 'var(--pii)', manual_process: 'var(--manual)',
      high_risk: 'var(--risk)', system_of_record: 'var(--sor)',
      unknowns: 'var(--unknown)',
    };
    function overlayMatchNode(n) {
      const matches = [];
      for (const id of activeOverlays) {
        const lens = lensById(id);
        if (lens && window.LensMatch.nodeMatchesLens(n, lens)) matches.push(id);
      }
      return matches;
    }
    function overlayMatchEdge(e) {
      const matches = [];
      for (const id of activeOverlays) {
        const lens = lensById(id);
        if (lens && window.LensMatch.edgeMatchesLens(e, lens, nodeMap)) matches.push(id);
      }
      return matches;
    }

    const hasOverlay = activeOverlays.size > 0;
    // Stage span for genesis delay normalisation
    let maxX = 1;
    for (const n of nodes) maxX = Math.max(maxX, n.pos.x);

    const nodeStates = {};
    for (const n of nodes) {
      const matches = overlayMatchNode(n);
      const inView = inViewNode(n);
      const isReplay = replayState.activeNodes.has(n.id);
      const isSelected = selectedKind === 'node' && selectedId === n.id;
      const isRelated = related.has(n.id);
      // outOfView — will slide off in category direction (not blur)
      const outOfView = !inView;
      // dimmed when: something selected and not selected/related, OR overlay active and not matching
      let dimmed = false;
      if (selectedId && !isSelected && !isRelated) dimmed = true;
      if (hasOverlay && matches.length === 0 && !isSelected && !isRelated) dimmed = true;

      nodeStates[n.id] = {
        selected: isSelected,
        related: isRelated,
        dimmed,
        outOfView,
        replayActive: isReplay,
        highlightOverlay: matches.length > 0 ? overlayColors[matches[0]] : null,
        overlayUnknown: matches.includes('unknowns'),
        hasQuestions: (n.metadata?.openQuestions || []).length > 0 && !hasOverlay,
        genesisDelay: Math.round((n.pos.x / maxX) * 2800) + Math.round(Math.random() * 200),
      };
    }
    const edgeStates = {};
    for (const e of edges) {
      const matches = overlayMatchEdge(e);
      const inView = inViewEdge(e);
      const isReplay = replayState.activeEdges.has(e.id);
      const isSelected = selectedKind === 'edge' && selectedId === e.id;
      const isRelated = relatedEdgeIds.has(e.id);
      const outOfView = !inView;
      let dimmed = false;
      if (selectedId && !isSelected && !isRelated) dimmed = true;
      if (hasOverlay && matches.length === 0 && !isSelected && !isRelated) dimmed = true;
      const srcX = nodeMap[e.from].pos.x;

      edgeStates[e.id] = {
        selected: isSelected,
        related: isRelated,
        dimmed,
        outOfView,
        replayActive: isReplay,
        replayDuration: replayState.activeEdges.get?.(e.id),
        highlightOverlay: matches.length > 0 ? overlayColors[matches[0]] : null,
        motionMode: tweaks.edgeMotion,
        edgeType: e.type,
        genesisDelay: Math.round((srcX / maxX) * 2800) + 150,
      };
    }
    return { nodeStates, edgeStates };
  }, [nodes, edges, nodeMap, selectedId, selectedKind, activeView, activeOverlays, lensById, replayState, tweaks.edgeMotion]);

  // Stage bounds (used for SVG canvas size)
  const stageBounds = useMemo(() => {
    let maxX = 0, maxY = 0;
    nodes.forEach(n => {
      maxX = Math.max(maxX, n.pos.x + window.NODE_W + 100);
      maxY = Math.max(maxY, n.pos.y + window.NODE_H + 100);
    });
    return { w: maxX, h: maxY };
  }, [nodes]);

  return React.createElement('div', { className: 'canvas-wrap', ref: wrapRef },
    React.createElement('div', { className: 'canvas-backdrop' }),
    tweaks.background === 'dot' && React.createElement('div', { className: 'canvas-grid' }),
    React.createElement('div', { className: 'canvas-noise' }),
    // Scanner sweeps for overlay activation
    sweeps.map(sw => React.createElement('div', {
      key: sw.id,
      className: 'scanner-sweep',
      style: { '--scan-color': sw.color },
    },
      React.createElement('div', { className: 'scan-line' })
    )),
    React.createElement('div', {
      ref: viewportRef,
      className: 'viewport' + (isPanning ? ' is-panning' : ''),
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
      React.createElement('div', {
        className: 'stage'
          + (isGenesis ? ' is-genesis' : '')
          + (canDragLayout ? ' layout-edit' : '')
          + (dragState && dragState.moved ? ' is-dragging-node' : ''),
        style: {
          width: stageBounds.w,
          height: stageBounds.h,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
        },
      },
        // Lane groups + internal lane dividers (below everything)
        lanes && lanes.length > 0 && React.createElement('div', { className: 'lane-layer' },
          lanes.map((g, i) => React.createElement('div', {
            key: g.id,
            className: 'lane-group' + (i % 2 === 0 ? ' is-even' : ' is-odd'),
            style: { top: g.y - 24, height: g.height },
          },
            React.createElement('div', { className: 'lane-group-label' },
              React.createElement('div', { className: 'lgl-meta' },
                g.from === g.to ? `Lane ${g.from}` : `Lanes ${g.from}–${g.to}`
              ),
              React.createElement('div', { className: 'lgl-name' }, g.name),
            ),
            // Internal lane dividers (dashed) inside multi-lane groups
            g.internalLanes && g.internalLanes.map(il => React.createElement('div', {
              key: `il-${il.laneNum}`,
              className: 'lane-internal-divider',
              style: { top: il.y - g.y + 24 },
            }))
          ))
        ),
        // SVG edge layer (BELOW nodes) — normal/dimmed edges
        React.createElement('svg', {
          className: 'edge-layer',
          width: stageBounds.w,
          height: stageBounds.h,
          style: { width: stageBounds.w, height: stageBounds.h },
        },
          edges.map(e => {
            const es = edgeStates[e.id];
            const emphasised = es.selected || es.related || es.highlightOverlay || es.replayActive;
            if (emphasised) return null;
            const sourceN = effectiveNodeMap[e.from];
            const targetN = effectiveNodeMap[e.to];
            const sourceVisible = livePositions[e.from] !== undefined;
            const targetVisible = livePositions[e.to] !== undefined;
            const edgeHidden = !sourceVisible || !targetVisible;
            return React.createElement(Edge, {
              key: e.id, edge: e,
              sourceNode: sourceN, targetNode: targetN,
              state: es,
              onSelect: (id) => onSelect(id, 'edge'),
              migrationActive, edgeHidden,
            });
          })
        ),
        // Node layer (HTML over SVG)
        nodes.map(n => {
          const livePos = livePositions[n.id];
          const explicitOpacity = liveOpacity[n.id];
          const opacity = explicitOpacity !== undefined
            ? explicitOpacity
            : (livePos === undefined ? 0 : 1);
          const isDragging = !!(dragState && dragState.nodeId === n.id && dragState.moved);
          const transientPos = isDragging ? dragState.currentPos : null;
          const pos = transientPos || livePos || n.pos;
          return React.createElement(NodeCard, {
            key: n.id,
            node: n,
            livePos: pos,
            opacity,
            state: nodeStates[n.id],
            onSelect: (id) => onSelect(id, 'node'),
            editLayout: canDragLayout,
            isDragging,
            onDragStart: onNodeDragStart,
            nodeTypesById,
          });
        }),
        // Empty-slot layer (edit mode only, not while dragging)
        canDragLayout && !dragState && (() => {
          const opts = viewConfig.options;
          const occupancy = window.LayoutOverrides.buildOccupancy(livePositions, opts);
          // Compute global max slot across ALL lanes so every lane shows the same grid width.
          let globalMaxSlot = 0;
          (lanes || []).forEach(g => {
            for (let ln = g.from; ln <= g.to; ln++) {
              const occByLane = occupancy[ln] || {};
              Object.keys(occByLane).forEach(s => {
                const n = parseInt(s, 10);
                if (n > globalMaxSlot) globalMaxSlot = n;
              });
            }
          });
          const lastSlot = Math.min(20, Math.max(globalMaxSlot + 1, 3)); // +1 trailing, cap at 20
          const cells = [];
          (lanes || []).forEach(g => {
            for (let ln = g.from; ln <= g.to; ln++) {
              const occByLane = occupancy[ln] || {};
              for (let s = 1; s <= lastSlot; s++) {
                if (occByLane[s]) continue;
                const pos = window.LayoutOverrides.slotToPos(opts, ln, s);
                cells.push({ lane: ln, slot: s, pos, laneName: g.name });
              }
            }
          });
          return React.createElement('div', { className: 'empty-slot-layer' },
            cells.map(c => React.createElement('button', {
              key: 'es-' + c.lane + '-' + c.slot,
              className: 'empty-slot',
              style: { left: c.pos.x, top: c.pos.y, width: window.NODE_W, height: window.NODE_H },
              title: `Add node to ${c.laneName} · Slot ${c.slot}`,
              onClick: (e) => {
                e.stopPropagation();
                setAddNodeAt({ lane: c.lane, slot: c.slot, laneName: c.laneName });
              },
            },
              React.createElement('div', { className: 'empty-slot-inner' },
                React.createElement('div', { className: 'empty-slot-plus' }, '+'),
              ),
            )),
          );
        })(),
        // Drop-target indicator (only while dragging in edit-layout mode)
        dragState && dragState.moved && (() => {
          const snapPos = window.LayoutOverrides.slotToPos(
            dragState.options, dragState.snap.lane, dragState.snap.slot
          );
          return React.createElement('div', {
            className: 'drop-target' + (dragState.blocked ? ' is-blocked' : ''),
            style: {
              left: snapPos.x,
              top: snapPos.y,
              width: window.NODE_W,
              height: window.NODE_H,
            },
          },
            React.createElement('div', { className: 'drop-target-label' },
              dragState.blocked
                ? 'Slot occupied — drop to revert'
                : `Lane ${dragState.snap.lane} · Slot ${dragState.snap.slot}`
            )
          );
        })(),
        // SVG edge layer (ABOVE nodes) — emphasised edges only
        React.createElement('svg', {
          className: 'edge-layer edge-layer-above',
          width: stageBounds.w,
          height: stageBounds.h,
          style: { width: stageBounds.w, height: stageBounds.h },
        },
          edges.map(e => {
            const es = edgeStates[e.id];
            const emphasised = es.selected || es.related || es.highlightOverlay || es.replayActive;
            if (!emphasised) return null;
            const sourceN = effectiveNodeMap[e.from];
            const targetN = effectiveNodeMap[e.to];
            const sourceVisible = livePositions[e.from] !== undefined;
            const targetVisible = livePositions[e.to] !== undefined;
            const edgeHidden = !sourceVisible || !targetVisible;
            return React.createElement(Edge, {
              key: e.id, edge: e,
              sourceNode: sourceN, targetNode: targetN,
              state: es,
              onSelect: (id) => onSelect(id, 'edge'),
              migrationActive, edgeHidden,
            });
          })
        )
      )
    ),
    // Corner UI
    React.createElement('div', { className: 'canvas-corner tl' },
      React.createElement('div', { className: 'view-pill' },
        React.createElement('span', { className: 'what' }, 'View'),
        React.createElement('span', null, activeView ? activeView.label : 'Combined')
      ),
      activeOverlays.size > 0 && React.createElement('div', { className: 'overlay-summary' },
        Array.from(activeOverlays).map(id => React.createElement('span', {
          key: id, className: 'overlay-chip', 'data-id': id,
        },
          React.createElement('span', { className: 'blob' }),
          OVERLAY_LABELS[id] || id
        ))
      )
    ),
    React.createElement('div', { className: 'canvas-corner tr' },
      React.createElement('button', {
        className: 'canvas-edit-btn' + (editLayout ? ' is-on' : ''),
        title: !activeView ? 'Pick a view to edit its layout' : (editLayout ? 'Exit edit mode' : 'Edit canvas'),
        onClick: () => setEditLayout && setEditLayout(v => !v),
        disabled: !activeView,
      },
        React.createElement('svg', { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('path', { d: 'M11.5 2.5l2 2L5 13l-3 1 1-3 8.5-8.5z' }),
          React.createElement('path', { d: 'M10 4l2 2' }),
        ),
        editLayout ? 'Editing' : 'Edit'
      ),
    ),
    React.createElement('div', { className: 'canvas-corner br' },
      React.createElement('div', { className: 'zoom-cluster' },
        React.createElement('button', { onClick: () => zoomBy(0.85), title: 'Zoom out' }, '−'),
        React.createElement('span', { className: 'level' }, Math.round(transform.k * 100) + '%'),
        React.createElement('button', { onClick: () => zoomBy(1.18), title: 'Zoom in' }, '+'),
        React.createElement('button', { onClick: fitView, title: 'Fit graph', style: { fontSize: 11 } }, '⤢'),
      ),
    ),
    // Add-node modal (rendered at canvas root so it can overlay everything)
    React.createElement(AddNodeModal, {
      open: !!addNodeAt,
      lane: addNodeAt ? addNodeAt.lane : null,
      slot: addNodeAt ? addNodeAt.slot : null,
      laneName: addNodeAt ? addNodeAt.laneName : null,
      viewLabel: activeView ? activeView.label : null,
      nodes: nodes,
      edges: edges,
      livePositions: livePositions,
      viewConfig: viewConfig,
      nodeTypes: nodeTypes,
      categories: categories,
      onClose: () => setAddNodeAt(null),
    }),
  );
}

const OVERLAY_LABELS = {
  pii: 'PII & sensitive data',
  manual_process: 'Manual processes',
  unknowns: 'Unknowns & low confidence',
  high_risk: 'High risk',
  system_of_record: 'System of record',
};

window.Canvas = Canvas;
window.OVERLAY_LABELS = OVERLAY_LABELS;
