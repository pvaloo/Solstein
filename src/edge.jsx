/* global React */

// Node card dimensions for edge anchor calculation
const NODE_W = 188;
const NODE_H = 56;

// Compute orthogonal path with rounded corners between two nodes
function computeEdgePath(sourcePos, targetPos) {
  // node centres
  const sCx = sourcePos.x + NODE_W / 2;
  const sCy = sourcePos.y + NODE_H / 2;
  const tCx = targetPos.x + NODE_W / 2;
  const tCy = targetPos.y + NODE_H / 2;
  const dx = tCx - sCx;
  const dy = tCy - sCy;

  // Choose which side each node uses (mirrors prior bezier logic)
  let sx, sy, tx, ty, sxv, syv, txv, tyv;
  const horiz = Math.abs(dx) > Math.abs(dy) * 0.8;
  if (horiz) {
    if (dx >= 0) {
      sx = sourcePos.x + NODE_W; sy = sCy; sxv = 1; syv = 0;
      tx = targetPos.x;          ty = tCy; txv = -1; tyv = 0;
    } else {
      sx = sourcePos.x; sy = sCy; sxv = -1; syv = 0;
      tx = targetPos.x + NODE_W; ty = tCy; txv = 1; tyv = 0;
    }
  } else {
    if (dy >= 0) {
      sx = sCx; sy = sourcePos.y + NODE_H; sxv = 0; syv = 1;
      tx = tCx; ty = targetPos.y;          txv = 0; tyv = -1;
    } else {
      sx = sCx; sy = sourcePos.y; sxv = 0; syv = -1;
      tx = tCx; ty = targetPos.y + NODE_H; tyv = 1; txv = 0;
    }
  }

  // Corner radius (clamped per-bend so short segments don't overshoot)
  const R = 9;
  const clamp = (val, limit) => Math.max(0, Math.min(val, Math.max(0, limit)));

  let path, mx, my;

  const sameRow = Math.abs(sy - ty) < 0.5;
  const sameCol = Math.abs(sx - tx) < 0.5;

  if (sameRow && sxv !== 0 && txv !== 0) {
    // Aligned horizontally — straight line
    path = `M ${sx} ${sy} L ${tx} ${ty}`;
    mx = (sx + tx) / 2; my = sy;
  } else if (sameCol && syv !== 0 && tyv !== 0) {
    // Aligned vertically — straight line
    path = `M ${sx} ${sy} L ${tx} ${ty}`;
    mx = sx; my = (sy + ty) / 2;
  } else if (sxv !== 0 && txv !== 0) {
    // Both horizontal — 2-bend through midX corridor
    const midX = (sx + tx) / 2;
    const hDir1 = sxv > 0 ? 1 : -1;
    const hDir2 = tx > midX ? 1 : -1;
    const vDir = ty > sy ? 1 : -1;
    const r1 = clamp(R, Math.abs(midX - sx));
    const r2 = clamp(R, Math.abs(ty - sy) / 2);
    const r3 = clamp(R, Math.abs(tx - midX));
    path =
      `M ${sx} ${sy} ` +
      `L ${midX - r1 * hDir1} ${sy} ` +
      `Q ${midX} ${sy} ${midX} ${sy + r2 * vDir} ` +
      `L ${midX} ${ty - r2 * vDir} ` +
      `Q ${midX} ${ty} ${midX + r3 * hDir2} ${ty} ` +
      `L ${tx} ${ty}`;
    mx = midX; my = (sy + ty) / 2;
  } else if (syv !== 0 && tyv !== 0) {
    // Both vertical — 2-bend through midY corridor
    const midY = (sy + ty) / 2;
    const vDir1 = syv > 0 ? 1 : -1;
    const vDir2 = ty > midY ? 1 : -1;
    const hDir = tx > sx ? 1 : -1;
    const r1 = clamp(R, Math.abs(midY - sy));
    const r2 = clamp(R, Math.abs(tx - sx) / 2);
    const r3 = clamp(R, Math.abs(ty - midY));
    path =
      `M ${sx} ${sy} ` +
      `L ${sx} ${midY - r1 * vDir1} ` +
      `Q ${sx} ${midY} ${sx + r2 * hDir} ${midY} ` +
      `L ${tx - r2 * hDir} ${midY} ` +
      `Q ${tx} ${midY} ${tx} ${midY + r3 * vDir2} ` +
      `L ${tx} ${ty}`;
    mx = (sx + tx) / 2; my = midY;
  } else if (sxv !== 0 && tyv !== 0) {
    // Source horizontal, target vertical — single bend at (tx, sy)
    const hDir = sxv > 0 ? 1 : -1;
    const vDir = ty > sy ? 1 : -1;
    const r1 = clamp(R, Math.abs(tx - sx));
    const r2 = clamp(R, Math.abs(ty - sy));
    path =
      `M ${sx} ${sy} ` +
      `L ${tx - r1 * hDir} ${sy} ` +
      `Q ${tx} ${sy} ${tx} ${sy + r2 * vDir} ` +
      `L ${tx} ${ty}`;
    mx = tx; my = (sy + ty) / 2;
  } else {
    // Source vertical, target horizontal — single bend at (sx, ty)
    const vDir = syv > 0 ? 1 : -1;
    const hDir = tx > sx ? 1 : -1;
    const r1 = clamp(R, Math.abs(ty - sy));
    const r2 = clamp(R, Math.abs(tx - sx));
    path =
      `M ${sx} ${sy} ` +
      `L ${sx} ${ty - r1 * vDir} ` +
      `Q ${sx} ${ty} ${sx + r2 * hDir} ${ty} ` +
      `L ${tx} ${ty}`;
    mx = (sx + tx) / 2; my = ty;
  }

  // Arrow tangent — entry direction (unchanged)
  const arrowAngle = Math.atan2(-tyv, -txv) * 180 / Math.PI;
  const length = Math.hypot(dx, dy);

  return { path, sx, sy, tx, ty, arrowAngle, mx, my, length };
}

// Uniform particle behaviour — same count, duration, and class for every edge type.
function particleProfile(_edgeType) {
  return { count: 1, dur: 2400, cls: '' };
}

function Edge({ edge, sourceNode, targetNode, state, onSelect, migrationActive, edgeHidden }) {
  const geom = React.useMemo(
    () => computeEdgePath(sourceNode.pos, targetNode.pos),
    [sourceNode.pos.x, sourceNode.pos.y, targetNode.pos.x, targetNode.pos.y]
  );

  // (line styles flattened to solid for now — was: dash by edge type)
  const dashClass = '';

  const classes = ['edge-group'];
  if (state.selected) classes.push('is-selected');
  if (state.related) classes.push('is-related');
  if (state.dimmed) classes.push('is-dimmed');
  if (state.outOfView) classes.push('is-out-of-view');
  if (state.replayActive) classes.push('is-replay-active');
  if (state.highlightOverlay) classes.push('is-highlight');
  if (migrationActive) classes.push('is-migrating');
  if (edgeHidden) classes.push('is-hidden');

  const groupStyle = { '--genesis-delay': `${state.genesisDelay || 0}ms` };
  if (state.highlightOverlay) {
    groupStyle['--edge-overlay'] = state.highlightOverlay;
  }

  // Particle count + duration — uniform across all emphasised edges
  const baseProfile = particleProfile(edge.type);
  let particleCount = 0;
  let particleDur = 1600;
  if (state.motionMode !== 'off' && !state.outOfView && !state.dimmed) {
    if (state.selected || state.related || state.highlightOverlay || state.replayActive) {
      particleCount = 2;
      particleDur = 1600;
    } else if (state.motionMode === 'all') {
      particleCount = baseProfile.count;
      particleDur = baseProfile.dur;
    }
  }

  // Chip — optional presentation metadata, absent from imported/persisted graph edges.
  const chip = edge.visual?.chip;
  const showChip = !!chip && (state.selected || state.highlightOverlay);

  return React.createElement('g', { className: classes.join(' '), style: groupStyle },
    React.createElement('path', {
      className: `edge-path ${dashClass}`,
      d: geom.path,
    }),
    React.createElement('g', {
      transform: `translate(${geom.tx}, ${geom.ty}) rotate(${geom.arrowAngle})`,
    },
      React.createElement('path', {
        className: 'edge-arrow',
        d: 'M 0 0 L -7 -3 L -5 0 L -7 3 Z',
      })
    ),
    // Signal particles
    particleCount > 0 && Array.from({ length: particleCount }, (_, i) => {
      const beginOffset = -(particleDur / particleCount) * i;
      return React.createElement('circle', {
        key: `p-${i}-${particleDur}`,
        className: 'signal-particle ' + baseProfile.cls,
        r: 2.8,
      },
        React.createElement('animateMotion', {
          dur: `${particleDur}ms`,
          repeatCount: 'indefinite',
          begin: `${beginOffset}ms`,
          path: geom.path,
        })
      );
    }),
    // Replay packet
    state.replayActive && React.createElement('circle', {
      className: 'replay-packet',
      r: 5,
    },
      React.createElement('animateMotion', {
        dur: `${state.replayDuration || 800}ms`,
        repeatCount: '1',
        path: geom.path,
        fill: 'freeze',
      })
    ),
    // Type chip
    showChip && React.createElement('g', {
      transform: `translate(${geom.mx}, ${geom.my})`,
      style: { pointerEvents: 'none' },
    },
      React.createElement('rect', {
        className: 'edge-type-chip-bg',
        x: -((chip.length * 4.2) + 8) / 2,
        y: -8,
        rx: 3,
        width: (chip.length * 4.2) + 8,
        height: 14,
      }),
      React.createElement('text', {
        className: 'edge-type-chip-text',
        x: 0, y: 1,
        textAnchor: 'middle',
        dominantBaseline: 'middle',
      }, chip)
    ),
    // Invisible hit area for click
    React.createElement('path', {
      className: 'edge-hit',
      d: geom.path,
      onClick: (e) => { e.stopPropagation(); onSelect(edge.id); },
    }),
  );
}

window.Edge = Edge;
window.computeEdgePath = computeEdgePath;
window.NODE_W = NODE_W;
window.NODE_H = NODE_H;
