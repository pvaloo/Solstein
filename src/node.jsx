/* global React, NodeIcon */

const { useRef, useCallback } = React;

// Compute which badges to show on a node card.
function computeBadges(node) {
  const m = node.metadata || {};
  const out = [];
  if (m.containsPii)             out.push({ kind: 'pii',     text: 'PII' });
  if (m.systemOfRecord)          out.push({ kind: 'sor',     text: 'SoR' });
  if (m.riskLevel === 'high')    out.push({ kind: 'risk',    text: 'Risk' });
  if (m.automationLevel === 'manual') out.push({ kind: 'manual',  text: 'Manual' });
  if (node.type === 'spreadsheet')    out.push({ kind: 'manual',  text: 'Manual' });
  return out.slice(0, 2);
}

function NodeCard({ node, livePos, opacity, state, onSelect, editLayout, isDragging, onDragStart, nodeTypesById }) {
  const { category, label, type } = node;
  const typeDef = nodeTypesById && nodeTypesById[type];
  const typeLabel = (typeDef && typeDef.label) || node.typeLabel;
  const iconKey = (typeDef && typeDef.iconKey) || type;
  const pos = livePos || node.pos;
  const badges = computeBadges(node);
  const cardRef = useRef(null);

  // Material-lift cursor tracking — direct DOM mutation, no re-render
  const onMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', x + '%');
    el.style.setProperty('--my', y + '%');
  }, []);
  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '-20%');
  }, []);

  const classes = ['node'];
  if (state.selected) classes.push('is-selected');
  if (state.dimmed) classes.push('is-dimmed');
  if (state.related) classes.push('is-related');
  if (state.outOfView) classes.push('is-out-of-view');
  if (state.replayActive) classes.push('is-replay-active');
  if (state.highlightOverlay) classes.push('is-highlight');
  if (state.hasQuestions) classes.push('has-questions');
  if (state.overlayUnknown) classes.push('overlay-unknowns');
  if (editLayout) classes.push('is-draggable');
  if (isDragging) classes.push('is-dragging');

  const style = {
    left: pos.x,
    top: pos.y,
    opacity: opacity !== undefined ? opacity : 1,
    '--genesis-delay': `${state.genesisDelay || 0}ms`,
  };
  if (state.highlightOverlay) {
    style['--accent-overlay'] = state.highlightOverlay;
  }

  function handleClick(e) {
    e.stopPropagation();
    // In edit-layout mode, the drag handler decides whether a click also
    // selects (i.e. when the pointer hasn't moved enough to register as a
    // drag). Avoid double-handling here.
    if (editLayout) return;
    onSelect(node.id);
  }
  function handlePointerDown(e) {
    if (!editLayout) return;
    if (e.button !== 0) return;
    // Stop bubbling so Canvas's pan handler doesn't kick in.
    e.stopPropagation();
    onDragStart && onDragStart(node.id, e);
  }

  return React.createElement('div', {
    className: classes.join(' '),
    'data-cat': category,
    'data-node-id': node.id,
    style,
    onClick: handleClick,
    onPointerDown: handlePointerDown,
  },
    React.createElement('div', {
      className: 'node-card',
      ref: cardRef,
      onMouseMove: onMove,
      onMouseLeave: onLeave,
    },
      React.createElement('div', { className: 'node-icon' },
        React.createElement(NodeIcon, { type, iconKey })
      ),
      React.createElement('div', { className: 'node-body' },
        React.createElement('div', { className: 'node-label' }, label),
        React.createElement('div', { className: 'node-type' }, typeLabel),
      ),
      badges.length > 0 && React.createElement('div', { className: 'node-badges' },
        badges.map(b => React.createElement('span', { key: b.kind, className: 'badge', 'data-kind': b.kind }, b.text))
      ),
    )
  );
}

window.NodeCard = NodeCard;
window.computeBadges = computeBadges;
