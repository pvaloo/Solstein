/* global React */
const { useEffect, useState, useMemo, useRef } = React;

// ── Well-known metadata field schema ─────────────────────────────────
const META_FIELDS = [
  { key: 'businessOwner',   label: 'Business owner',    kind: 'text',  placeholder: 'e.g. Customer Operations' },
  { key: 'technicalOwner',  label: 'Technical owner',   kind: 'text',  placeholder: 'e.g. Platform Eng' },
  { key: 'technology',      label: 'Technology',        kind: 'text',  placeholder: 'e.g. Node.js / Postgres' },
  { key: 'hosting',         label: 'Hosting',           kind: 'text',  placeholder: 'AWS eu-west-1' },
  { key: 'automationLevel', label: 'Automation level',  kind: 'enum',  options: ['automated', 'partial', 'manual'] },
  { key: 'confidence',      label: 'Confidence',        kind: 'enum',  options: ['high', 'medium', 'low'] },
  { key: 'riskLevel',       label: 'Risk level',        kind: 'enum',  options: ['low', 'medium', 'high'] },
  { key: 'containsPii',     label: 'Contains PII',      kind: 'bool' },
  { key: 'systemOfRecord',  label: 'System of record',  kind: 'bool' },
];

function snakeId(s) {
  return (s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
}

// ── Main component ────────────────────────────────────────────────────
function AddNodeModal({
  open, lane, slot, laneName, viewLabel,
  nodes, edges, livePositions, viewConfig,
  nodeTypes, categories,
  onClose,
}) {
  const [step, setStep] = useState(1);
  const [node, setNode] = useState({
    type: '', label: '', category: '', description: '',
    id: '', idTouched: false, advancedOpen: false,
    meta: {},      // {key: value}
    customMeta: [], // [{key, value}]
  });
  const [conns, setConns] = useState([
    { connectedId: '', direction: 'out', edgeType: '', label: '' },
  ]);
  const [toast, setToast] = useState(null);

  // Reset state when modal opens fresh
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setNode({ type: '', label: '', category: '', description: '', id: '', idTouched: false, advancedOpen: false, meta: {}, customMeta: [] });
    setConns([{ connectedId: '', direction: 'out', edgeType: '', label: '' }]);
    setToast(null);
  }, [open]);

  // Auto-derive id from label unless user manually edited it
  useEffect(() => {
    if (!node.idTouched) {
      const auto = snakeId(node.label);
      if (auto !== node.id) setNode(n => ({ ...n, id: auto }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.label]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // ── Discovery ───────────────────────────────────────────────────────
  const allNodeTypes = useMemo(() => {
    const usage = new Map();
    (nodes || []).forEach(n => usage.set(n.type, (usage.get(n.type) || 0) + 1));

    // Filter rule: drop entries that are blank, or have the placeholder
    // labels that the Settings "+ Add type" button auto-assigns and the
    // user never renamed — but keep them if at least one node uses them.
    const isPlaceholderLabel = (lbl) => {
      const v = (lbl || '').trim().toLowerCase();
      return v === '' || v === 'new type' || v === 'new';
    };
    const keep = (t) => {
      if (!t || !t.label) return false;
      if (isPlaceholderLabel(t.label) && (usage.get(t.id) || 0) === 0) return false;
      return true;
    };

    if (Array.isArray(nodeTypes)) {
      return nodeTypes.filter(keep);
    }
    if (window.NodeTypes && window.FLOWLENS_DATA) {
      try {
        const list = window.NodeTypes.loadNodeTypes(window.FLOWLENS_DATA);
        return list.filter(keep);
      } catch (e) {}
    }
    return [];
  }, [open, nodeTypes, nodes]);
  const allCategories = useMemo(() => {
    if (Array.isArray(categories)) {
      return categories.filter(c => c && c.label && c.label.trim());
    }
    if (window.Categories) {
      try {
        const list = window.Categories.loadCategories();
        return list.filter(c => c && c.label && c.label.trim());
      } catch (e) {}
    }
    return [];
  }, [open, categories]);
  const allEdgeTypes = useMemo(() => {
    const set = new Set(['creates', 'reads', 'writes_to', 'implemented_by', 'manual_rekey', 'triggers', 'depends_on']);
    (edges || []).forEach(e => { if (e.type) set.add(e.type); });
    return Array.from(set).sort();
  }, [edges]);

  // ── Target pixel position for proximity sort ─────────────────────────
  const targetPos = useMemo(() => {
    if (!viewConfig || !viewConfig.options || lane == null || slot == null) return null;
    return window.LayoutOverrides.slotToPos(viewConfig.options, lane, slot);
  }, [viewConfig, lane, slot]);

  // Candidates sorted by proximity to the new node's slot
  const sortedCandidates = useMemo(() => {
    if (!nodes || !targetPos) return [];
    const positions = livePositions || {};
    return [...nodes]
      .map(n => {
        const p = positions[n.id] || n.pos;
        const dx = (p?.x || 0) - targetPos.x;
        const dy = (p?.y || 0) - targetPos.y;
        return { n, dist: Math.sqrt(dx * dx + dy * dy), pos: p };
      })
      .sort((a, b) => a.dist - b.dist)
      .map(c => c.n);
  }, [nodes, livePositions, targetPos]);

  // ── Validation ──────────────────────────────────────────────────────
  const step1Valid = !!(node.type && node.label.trim() && node.category && node.id);
  const step2Valid = conns.length > 0 && conns.every(c => c.connectedId && c.direction && c.edgeType);

  function handleSubmit() {
    const payload = {
      node: {
        id: node.id,
        type: node.type,
        label: node.label.trim(),
        category: node.category,
        description: node.description.trim(),
        position: { lane, slot },
        metadata: {
          ...node.meta,
          ...Object.fromEntries(node.customMeta.filter(m => m.key).map(m => [m.key, m.value])),
        },
      },
      edges: conns.map(c => ({
        from: c.direction === 'out' ? node.id : c.connectedId,
        to:   c.direction === 'out' ? c.connectedId : node.id,
        type: c.edgeType,
        label: c.label.trim() || undefined,
      })),
    };
    // eslint-disable-next-line no-console
    console.log('[AddNode] payload', payload);
    setToast('Node "' + payload.node.label + '" would be created with ' + payload.edges.length + ' connection' + (payload.edges.length === 1 ? '' : 's') + ' (form is wired; persistence pending).');
    window.setTimeout(() => { setToast(null); onClose(); }, 1800);
  }

  // ── Render ──────────────────────────────────────────────────────────
  return React.createElement('div', {
    className: 'add-node-overlay' + (open ? ' is-open' : ''),
    onClick: (e) => { if (e.target === e.currentTarget) onClose(); },
    'aria-hidden': !open,
  },
    React.createElement('div', {
      className: 'add-node-modal anm-wizard',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'add-node-title',
    },
      // Header
      React.createElement('div', { className: 'anm-head' },
        React.createElement('div', { className: 'anm-eyebrow' }, 'Add node'),
        React.createElement('div', { className: 'anm-title', id: 'add-node-title' },
          step === 1 ? 'Define the node' : 'Define its connections',
        ),
        React.createElement('div', { className: 'anm-meta' },
          React.createElement('span', null, viewLabel || 'View'),
          React.createElement('span', { className: 'anm-dot' }),
          React.createElement('span', null, laneName || ('Lane ' + (lane || '?'))),
          React.createElement('span', { className: 'anm-dot' }),
          React.createElement('span', null, 'Slot ' + (slot || '?')),
        ),
        React.createElement('button', {
          className: 'anm-close', onClick: onClose,
          title: 'Close (Esc)', 'aria-label': 'Close',
        }, '✕'),
      ),

      // Stepper
      React.createElement('div', { className: 'anm-stepper' },
        React.createElement(StepDot, { n: 1, current: step, label: 'Node',        done: step > 1, onClick: () => setStep(1) }),
        React.createElement('div', { className: 'anm-rail' + (step > 1 ? ' is-done' : '') }),
        React.createElement(StepDot, { n: 2, current: step, label: 'Connections', done: false,    onClick: () => { if (step1Valid) setStep(2); } }),
      ),

      // Body
      React.createElement('div', { className: 'anm-body' },
        step === 1
          ? React.createElement(NodeStep, { node, setNode, allNodeTypes, allCategories })
          : React.createElement(ConnectionsStep, {
              conns, setConns, candidates: sortedCandidates, edgeTypes: allEdgeTypes,
              newNode: node, getNodeType: (id) => allNodeTypes.find(t => t.id === id),
              getCategory: (id) => allCategories.find(c => c.id === id),
            }),
      ),

      // Footer
      React.createElement('div', { className: 'anm-foot' },
        step === 2 && React.createElement('button', {
          className: 'anm-btn', onClick: () => setStep(1),
        }, '← Back'),
        React.createElement('div', { className: 'anm-foot-spacer' }),
        React.createElement('button', { className: 'anm-btn', onClick: onClose }, 'Cancel'),
        step === 1
          ? React.createElement('button', {
              className: 'anm-btn anm-btn-primary', disabled: !step1Valid,
              onClick: () => setStep(2),
              title: step1Valid ? '' : 'Type, label, and category are required',
            }, 'Next: connections')
          : React.createElement('button', {
              className: 'anm-btn anm-btn-primary', disabled: !step2Valid,
              onClick: handleSubmit,
              title: step2Valid ? '' : 'Every connection needs a node and type',
            }, 'Create node'),
      ),

      toast && React.createElement('div', { className: 'anm-toast' }, toast),
    ),
  );
}

// ── Stepper dot ──────────────────────────────────────────────────────
function StepDot({ n, current, label, done, onClick }) {
  const state = current === n ? 'current' : done ? 'done' : 'pending';
  return React.createElement('button', {
    className: 'anm-step anm-step-' + state,
    onClick, type: 'button',
  },
    React.createElement('span', { className: 'anm-step-mark' }, done ? '✓' : String(n)),
    React.createElement('span', { className: 'anm-step-label' }, label),
  );
}

// ── Step 1: Node ─────────────────────────────────────────────────────
function NodeStep({ node, setNode, allNodeTypes, allCategories }) {
  return React.createElement('div', { className: 'anm-form' },
    // Type
    React.createElement(FieldRow, { label: 'Type', required: true },
      React.createElement(TypePicker, {
        value: node.type, onChange: (t) => setNode(n => ({ ...n, type: t })),
        options: allNodeTypes,
      }),
    ),
    // Label
    React.createElement(FieldRow, { label: 'Label', required: true, hint: 'The name displayed on the node card.' },
      React.createElement('input', {
        className: 'anm-input', value: node.label,
        placeholder: 'e.g. Customer Profile',
        onChange: (e) => setNode(n => ({ ...n, label: e.target.value })),
      }),
    ),
    // Category
    React.createElement(FieldRow, { label: 'Category', required: true },
      React.createElement(CategoryPicker, {
        value: node.category, onChange: (c) => setNode(n => ({ ...n, category: c })),
        options: allCategories,
      }),
    ),
    // Description
    React.createElement(FieldRow, { label: 'Description', hint: 'Optional. Shown in the inspector.' },
      React.createElement('textarea', {
        className: 'anm-input anm-textarea', value: node.description,
        placeholder: 'What is this node for?',
        rows: 2,
        onChange: (e) => setNode(n => ({ ...n, description: e.target.value })),
      }),
    ),
    // Metadata
    React.createElement('div', { className: 'anm-section' },
      React.createElement('div', { className: 'anm-section-head' },
        React.createElement('span', null, 'Metadata'),
        React.createElement('span', { className: 'anm-section-sub' }, 'optional'),
      ),
      React.createElement('div', { className: 'anm-meta-grid' },
        META_FIELDS.map(f => React.createElement(MetaField, {
          key: f.key, def: f,
          value: node.meta[f.key],
          onChange: (v) => setNode(n => ({ ...n, meta: { ...n.meta, [f.key]: v } })),
          onClear: () => setNode(n => {
            const m = { ...n.meta }; delete m[f.key]; return { ...n, meta: m };
          }),
        })),
      ),
      // Custom metadata
      node.customMeta.length > 0 && React.createElement('div', { className: 'anm-custom-meta' },
        node.customMeta.map((m, i) => React.createElement('div', { key: i, className: 'anm-custom-row' },
          React.createElement('input', {
            className: 'anm-input anm-input-sm', placeholder: 'key',
            value: m.key,
            onChange: (e) => setNode(n => ({ ...n, customMeta: n.customMeta.map((x, j) => j === i ? { ...x, key: e.target.value } : x) })),
          }),
          React.createElement('input', {
            className: 'anm-input anm-input-sm', placeholder: 'value',
            value: m.value,
            onChange: (e) => setNode(n => ({ ...n, customMeta: n.customMeta.map((x, j) => j === i ? { ...x, value: e.target.value } : x) })),
          }),
          React.createElement('button', {
            className: 'anm-icon-btn', title: 'Remove',
            onClick: () => setNode(n => ({ ...n, customMeta: n.customMeta.filter((_, j) => j !== i) })),
          }, '✕'),
        )),
      ),
      React.createElement('button', {
        className: 'anm-add-btn',
        onClick: () => setNode(n => ({ ...n, customMeta: [...n.customMeta, { key: '', value: '' }] })),
      }, '+ Custom field'),
    ),

    // Advanced
    React.createElement('div', { className: 'anm-section' },
      React.createElement('button', {
        className: 'anm-disclosure',
        onClick: () => setNode(n => ({ ...n, advancedOpen: !n.advancedOpen })),
      },
        React.createElement('span', { className: 'anm-chev' }, node.advancedOpen ? '▾' : '▸'),
        'Advanced',
      ),
      node.advancedOpen && React.createElement('div', { className: 'anm-form anm-form-indent' },
        React.createElement(FieldRow, { label: 'ID', hint: 'Auto-generated from label. Must be unique.' },
          React.createElement('input', {
            className: 'anm-input', value: node.id,
            onChange: (e) => setNode(n => ({ ...n, id: snakeId(e.target.value), idTouched: true })),
          }),
        ),
      ),
    ),
  );
}

// ── Step 2: Connections ──────────────────────────────────────────────
function ConnectionsStep({ conns, setConns, candidates, edgeTypes, newNode, getNodeType, getCategory }) {
  const cat = getCategory(newNode.category);
  const type = getNodeType(newNode.type);
  return React.createElement('div', { className: 'anm-form' },
    // Recap card
    React.createElement('div', { className: 'anm-recap', style: cat ? { '--cat': cat.color } : undefined },
      React.createElement('div', { className: 'anm-recap-pip' }),
      React.createElement('div', { className: 'anm-recap-body' },
        React.createElement('div', { className: 'anm-recap-label' }, newNode.label || '(unnamed)'),
        React.createElement('div', { className: 'anm-recap-meta' },
          (type?.label || newNode.type || 'No type'),
          ' · ',
          (cat?.label || newNode.category || 'No category'),
        ),
      ),
      React.createElement('div', { className: 'anm-recap-tag' }, 'new node'),
    ),

    React.createElement('div', { className: 'anm-section-head' },
      React.createElement('span', null, 'Connections'),
      React.createElement('span', { className: 'anm-section-sub' },
        conns.length + ' edge' + (conns.length === 1 ? '' : 's') + ' · at least 1 required',
      ),
    ),

    React.createElement('div', { className: 'anm-conn-list' },
      conns.map((c, i) => React.createElement(ConnectionRow, {
        key: i, c, candidates, edgeTypes, newLabel: newNode.label,
        canRemove: conns.length > 1,
        onChange: (next) => setConns(arr => arr.map((x, j) => j === i ? next : x)),
        onRemove: () => setConns(arr => arr.filter((_, j) => j !== i)),
      })),
    ),

    React.createElement('button', {
      className: 'anm-add-btn',
      onClick: () => setConns(arr => [...arr, { connectedId: '', direction: 'out', edgeType: '', label: '' }]),
    }, '+ Add connection'),
  );
}

function ConnectionRow({ c, candidates, edgeTypes, newLabel, canRemove, onChange, onRemove }) {
  const newName = newLabel || 'new node';
  const short = (s) => (s.length > 18 ? s.slice(0, 16) + '…' : s);
  return React.createElement('div', { className: 'anm-conn-row' },
    // Remove (absolutely positioned in top-right corner)
    React.createElement('button', {
      className: 'anm-icon-btn anm-conn-rm', title: 'Remove connection',
      'aria-label': 'Remove connection',
      disabled: !canRemove, onClick: onRemove,
    }, '✕'),

    // Row 1: Connected node (full width)
    React.createElement('div', { className: 'anm-conn-field' },
      React.createElement('label', { className: 'anm-mini-label' }, 'Connected node'),
      React.createElement(NodePicker, {
        value: c.connectedId,
        candidates,
        onChange: (id) => onChange({ ...c, connectedId: id }),
      }),
    ),

    // Row 2: Direction + Type (side by side)
    React.createElement('div', { className: 'anm-conn-grid-2' },
      React.createElement('div', { className: 'anm-conn-field' },
        React.createElement('label', { className: 'anm-mini-label' }, 'Direction'),
        React.createElement('div', { className: 'anm-direction' },
          React.createElement('button', {
            className: 'anm-dir-opt' + (c.direction === 'out' ? ' is-on' : ''),
            type: 'button',
            onClick: () => onChange({ ...c, direction: 'out' }),
            title: newName + ' → other',
          }, short(newName) + '  →'),
          React.createElement('button', {
            className: 'anm-dir-opt' + (c.direction === 'in' ? ' is-on' : ''),
            type: 'button',
            onClick: () => onChange({ ...c, direction: 'in' }),
            title: 'other → ' + newName,
          }, '←  ' + short(newName)),
        ),
      ),
      React.createElement('div', { className: 'anm-conn-field' },
        React.createElement('label', { className: 'anm-mini-label' }, 'Type'),
        React.createElement(EdgeTypePicker, {
          value: c.edgeType,
          onChange: (v) => onChange({ ...c, edgeType: v }),
          edgeTypes,
        }),
      ),
    ),

    // Row 3: Label (full width, optional)
    React.createElement('div', { className: 'anm-conn-field' },
      React.createElement('label', { className: 'anm-mini-label' }, 'Label (optional)'),
      React.createElement('input', {
        className: 'anm-input', value: c.label,
        placeholder: 'short description',
        onChange: (e) => onChange({ ...c, label: e.target.value }),
      }),
    ),
  );
}

// ── Pickers ──────────────────────────────────────────────────────────
// Edge-type picker — same visual language as TypePicker / NodePicker so it
// matches the rest of the Add-Node modal instead of falling back to the
// unstyled SolDropdown (whose CSS lives in solstein-app.css and isn't
// loaded on the canvas).
function EdgeTypePicker({ value, onChange, edgeTypes }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e)   { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const display = value ? value.replace(/_/g, ' ') : '';
  return React.createElement('div', { className: 'anm-picker', ref },
    React.createElement('button', {
      type: 'button',
      className: 'anm-picker-trigger' + (open ? ' is-open' : ''),
      onClick: () => setOpen(v => !v),
    },
      React.createElement('span', { className: 'anm-picker-val' },
        display
          ? display
          : React.createElement('span', { className: 'anm-picker-ph' }, 'Select…'),
      ),
      React.createElement('span', { className: 'anm-picker-chev' }, open ? '▾' : '▸'),
    ),
    open && React.createElement('div', { className: 'anm-picker-pop' },
      React.createElement('div', { className: 'anm-picker-list' },
        edgeTypes.length === 0
          ? React.createElement('div', { className: 'anm-picker-empty' }, 'No edge types')
          : edgeTypes.map(t => React.createElement('button', {
              key: t,
              type: 'button',
              className: 'anm-picker-item' + (t === value ? ' is-current' : ''),
              onClick: () => { onChange(t); setOpen(false); },
            },
              React.createElement('span', { className: 'anm-picker-item-label' }, t.replace(/_/g, ' ')),
              React.createElement('span', { className: 'anm-picker-item-id' }, t),
            )),
      ),
    ),
  );
}

function TypePicker({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);
  const sel = options.find(o => o.id === value);
  const filtered = q
    ? options.filter(o => (o.label + ' ' + o.id).toLowerCase().includes(q.toLowerCase()))
    : options;
  return React.createElement('div', { className: 'anm-picker', ref },
    React.createElement('button', {
      className: 'anm-picker-trigger' + (open ? ' is-open' : ''),
      onClick: () => setOpen(v => !v),
    },
      React.createElement('span', { className: 'anm-picker-val' },
        sel ? sel.label : React.createElement('span', { className: 'anm-picker-ph' }, 'Choose a node type…'),
      ),
      React.createElement('span', { className: 'anm-picker-chev' }, open ? '▾' : '▸'),
    ),
    open && React.createElement('div', { className: 'anm-picker-pop' },
      React.createElement('input', {
        className: 'anm-picker-search', placeholder: 'Search types…',
        autoFocus: true, value: q,
        onChange: (e) => setQ(e.target.value),
      }),
      React.createElement('div', { className: 'anm-picker-list' },
        filtered.length === 0
          ? React.createElement('div', { className: 'anm-picker-empty' }, 'No matches')
          : filtered.map(o => React.createElement('button', {
              key: o.id, className: 'anm-picker-item' + (o.id === value ? ' is-current' : ''),
              onClick: () => { onChange(o.id); setOpen(false); setQ(''); },
            },
              React.createElement('span', { className: 'anm-picker-item-label' }, o.label),
              React.createElement('span', { className: 'anm-picker-item-id' }, o.id),
            )),
      ),
    ),
  );
}

function CategoryPicker({ value, onChange, options }) {
  return React.createElement('div', { className: 'anm-cat-grid' },
    options.map(c => React.createElement('button', {
      key: c.id,
      className: 'anm-cat-opt' + (c.id === value ? ' is-on' : ''),
      style: { '--cat': c.color },
      onClick: () => onChange(c.id),
    },
      React.createElement('span', { className: 'anm-cat-pip' }),
      React.createElement('span', { className: 'anm-cat-label' }, c.label),
    )),
  );
}

function NodePicker({ value, candidates, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);
  const sel = candidates.find(n => n.id === value);
  const filtered = q
    ? candidates.filter(n => (n.label + ' ' + n.id).toLowerCase().includes(q.toLowerCase()))
    : candidates;
  return React.createElement('div', { className: 'anm-picker', ref },
    React.createElement('button', {
      className: 'anm-picker-trigger' + (open ? ' is-open' : ''),
      onClick: () => setOpen(v => !v),
    },
      React.createElement('span', { className: 'anm-picker-val' },
        sel ? sel.label : React.createElement('span', { className: 'anm-picker-ph' }, 'Pick a node…'),
      ),
      React.createElement('span', { className: 'anm-picker-chev' }, open ? '▾' : '▸'),
    ),
    open && React.createElement('div', { className: 'anm-picker-pop anm-picker-pop-tall' },
      React.createElement('input', {
        className: 'anm-picker-search', placeholder: 'Search nodes…',
        autoFocus: true, value: q,
        onChange: (e) => setQ(e.target.value),
      }),
      React.createElement('div', { className: 'anm-picker-hint' }, q ? 'Filtered' : 'Sorted by proximity'),
      React.createElement('div', { className: 'anm-picker-list' },
        filtered.length === 0
          ? React.createElement('div', { className: 'anm-picker-empty' }, 'No matches')
          : filtered.slice(0, 80).map(n => React.createElement('button', {
              key: n.id, className: 'anm-picker-item' + (n.id === value ? ' is-current' : ''),
              onClick: () => { onChange(n.id); setOpen(false); setQ(''); },
            },
              React.createElement('span', { className: 'anm-picker-item-label' }, n.label),
              React.createElement('span', { className: 'anm-picker-item-id' }, n.type),
            )),
      ),
    ),
  );
}

// ── Metadata field ───────────────────────────────────────────────────
function MetaField({ def, value, onChange, onClear }) {
  const set = value !== undefined && value !== '' && value !== null;
  return React.createElement('div', { className: 'anm-meta-field' + (set ? ' is-set' : '') },
    React.createElement('div', { className: 'anm-meta-head' },
      React.createElement('span', { className: 'anm-meta-label' }, def.label),
      set && React.createElement('button', { className: 'anm-meta-clear', onClick: onClear, title: 'Clear' }, '✕'),
    ),
    def.kind === 'text' && React.createElement('input', {
      className: 'anm-input anm-input-sm', value: value || '',
      placeholder: def.placeholder || '',
      onChange: (e) => onChange(e.target.value),
    }),
    def.kind === 'enum' && React.createElement('div', { className: 'anm-seg' },
      def.options.map(o => React.createElement('button', {
        key: o, className: 'anm-seg-opt' + (value === o ? ' is-on' : ''),
        onClick: () => onChange(value === o ? undefined : o),
      }, o)),
    ),
    def.kind === 'bool' && React.createElement('div', { className: 'anm-seg' },
      React.createElement('button', {
        className: 'anm-seg-opt' + (value === true ? ' is-on' : ''),
        onClick: () => onChange(value === true ? undefined : true),
      }, 'Yes'),
      React.createElement('button', {
        className: 'anm-seg-opt' + (value === false ? ' is-on' : ''),
        onClick: () => onChange(value === false ? undefined : false),
      }, 'No'),
    ),
  );
}

// ── Field row wrapper ────────────────────────────────────────────────
function FieldRow({ label, required, hint, children }) {
  return React.createElement('div', { className: 'anm-field' },
    React.createElement('label', { className: 'anm-field-label' },
      label,
      required && React.createElement('span', { className: 'anm-req' }, '*'),
    ),
    children,
    hint && React.createElement('div', { className: 'anm-field-hint' }, hint),
  );
}

window.AddNodeModal = AddNodeModal;
