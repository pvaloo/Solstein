/* global React, NodeIcon, EditControls */

const { EditableText, BoolToggle, Segmented, EnumPopover, AddFieldMenu, QuestionListEditor } = window.EditControls;

const CAT_VAR = {
  operational: 'var(--cat-op)',
  information: 'var(--cat-info)',
  technical:   'var(--cat-tech)',
  governance:  'var(--cat-gov)',
};

const h = React.createElement;

// ── Field schemas ─────────────────────────────────────────────────────
// Each field defines: key, label, control kind, optional options, optional defaultValue.
const NODE_FIELDS = [
  // Ownership & Stack
  { key: 'businessOwner',  label: 'Business Owner',  kind: 'text',      section: 'ownership' },
  { key: 'technicalOwner', label: 'Technical Owner', kind: 'text',      section: 'ownership' },
  { key: 'hosting',        label: 'Hosting',         kind: 'text',      section: 'ownership' },
  { key: 'technology',     label: 'Technology',      kind: 'text',      section: 'ownership' },
  { key: 'vendor',         label: 'Vendor',          kind: 'text',      section: 'ownership' },

  // Properties
  { key: 'dataClassification', label: 'Classification', kind: 'enum',
    options: ['public', 'internal', 'internal_sensitive', 'commercial', 'commercial_internal',
              'personal', 'personal_sensitive', 'non_personal'],
    section: 'properties' },
  { key: 'containsPii',    label: 'Contains PII',   kind: 'bool',      section: 'properties', defaultValue: false },
  { key: 'systemOfRecord', label: 'System of Record', kind: 'bool',    section: 'properties', defaultValue: false },
  { key: 'riskLevel',      label: 'Risk Level',     kind: 'risk',      section: 'properties', defaultValue: 'medium' },
  { key: 'automationLevel', label: 'Automation',    kind: 'enum',
    options: ['manual', 'self_service', 'automated'], section: 'properties' },
  { key: 'maturity',       label: 'Maturity',       kind: 'enum',
    options: ['prototype', 'validated', 'mature'], section: 'properties' },
  { key: 'monitoring',     label: 'Monitoring',     kind: 'enum',
    options: ['unmonitored', 'assumed_unverified', 'monitored'], section: 'properties' },
  { key: 'confidence',     label: 'Confidence',     kind: 'confidence', section: 'properties', defaultValue: 'medium' },
];

const EDGE_FIELDS = [
  { key: 'protocol',   label: 'Protocol', kind: 'enum',
    options: ['REST', 'SOAP', 'REST or SOAP', 'gRPC', 'GraphQL', 'message_queue', 'file_transfer', 'manual'],
    section: 'mechanism' },
  { key: 'format',     label: 'Format',   kind: 'enum',
    options: ['JSON', 'XML', 'XML/JSON', 'CSV', 'binary', 'text'], section: 'mechanism' },
  { key: 'latency',    label: 'Latency',  kind: 'enum',
    options: ['real_time', 'near_real_time', 'batch', 'scheduled', 'timeout'], section: 'mechanism' },
  { key: 'schedule',   label: 'Schedule', kind: 'text', section: 'mechanism' },
  { key: 'security',   label: 'Security', kind: 'text', section: 'mechanism' },
  { key: 'condition',  label: 'Condition', kind: 'text', section: 'mechanism' },
  { key: 'confidence', label: 'Confidence', kind: 'confidence', section: 'mechanism', defaultValue: 'medium' },
  { key: 'containsPii', label: 'Contains PII', kind: 'bool', section: 'mechanism', defaultValue: false },
];

function fieldsBySection(defs, sectionId) {
  return defs.filter(f => f.section === sectionId);
}

// ── Renderers ─────────────────────────────────────────────────────────
function pretty(v) {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  if (typeof v === 'string') return v.replace(/_/g, ' ');
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

function ConfidenceMeter({ value }) {
  const v = value || 'unknown';
  return h('span', { className: `confidence ${v}` },
    h('span', { className: 'bars' }, h('span'), h('span'), h('span')),
    v
  );
}
function RiskStripDisplay({ level }) {
  return h('span', { className: 'risk-strip-wrap' },
    h('span', { className: 'risk-strip', 'data-level': level },
      h('span'), h('span'), h('span')
    ),
    pretty(level)
  );
}
function Pill({ kind, text }) {
  return h('span', { className: `tag ${kind}` }, text);
}

// ── Read-only renderers ───────────────────────────────────────────────
function ReadOnlyKV({ rows }) {
  const filtered = rows.filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false);
  if (filtered.length === 0) return null;
  return h('dl', { className: 'kv' },
    filtered.flatMap(([k, v]) => [
      h('dt', { key: 'dt-' + k }, k),
      h('dd', { key: 'dd-' + k }, v),
    ])
  );
}

function prettyValue(v) {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  if (typeof v === 'string') return v.replace(/_/g, ' ');
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

function NodeViewBody({ node, allEdges, nodeMap, evidenceMap, visibleIds, onSelect }) {
  const m = node.metadata || {};
  const inboundEdges = allEdges.filter(e => e.to === node.id);
  const outboundEdges = allEdges.filter(e => e.from === node.id);
  const evidenceIds = m.evidencedBy || [];
  const evidence = evidenceIds.map(id => evidenceMap[id]).filter(Boolean);

  const ownershipRows = [
    ['Business Owner',  m.businessOwner],
    ['Technical Owner', m.technicalOwner],
    ['Hosting',         m.hosting],
    ['Technology',      m.technology],
    ['Vendor',          m.vendor],
  ];
  const propertyRows = [
    ['Classification',   m.dataClassification && prettyValue(m.dataClassification)],
    ['Contains PII',     typeof m.containsPii === 'boolean' ? prettyValue(m.containsPii) : null],
    ['System of Record', m.systemOfRecord !== undefined ? (m.systemOfRecord === true ? 'Yes' : prettyValue(m.systemOfRecord)) : null],
    ['Risk Level',       m.riskLevel ? h(RiskStripDisplay, { level: m.riskLevel }) : null],
    ['Automation',       m.automationLevel && prettyValue(m.automationLevel)],
    ['Maturity',         m.maturity && prettyValue(m.maturity)],
    ['Monitoring',       m.monitoring && prettyValue(m.monitoring)],
    ['Confidence',       m.confidence ? h(ConfidenceMeter, { value: m.confidence }) : null],
  ];

  const hasOwnership = ownershipRows.some(([, v]) => v);
  const hasProperties = propertyRows.some(([, v]) => v);

  return h('div', { className: 'inspector-body scrollbox' },
    node.description ? h(Section, { title: 'Summary' },
      h('p', null, node.description)
    ) : null,

    hasOwnership ? h(Section, { title: 'Ownership & Stack' },
      h(ReadOnlyKV, { rows: ownershipRows })
    ) : null,

    hasProperties ? h(Section, { title: 'Properties' },
      h(ReadOnlyKV, { rows: propertyRows })
    ) : null,

    (m.openQuestions && m.openQuestions.length > 0) ? h(Section, {
      title: 'Open Questions', count: m.openQuestions.length,
    },
      h('ul', { className: 'questions-list' },
        m.openQuestions.map((q, i) => h('li', { key: i, className: 'q-item' }, q))
      )
    ) : null,

    (inboundEdges.length + outboundEdges.length > 0) ? h(Section, {
      title: 'Connections', count: inboundEdges.length + outboundEdges.length,
    },
      h('ul', { className: 'related-list' },
        outboundEdges.map(e => {
          const t = nodeMap[e.to];
          const visible = visibleIds.has(t.id);
          return h('li', {
            key: e.id, className: 'rel-item' + (visible ? '' : ' is-out-of-view'),
            style: { '--rel-cat': CAT_VAR[t.category] },
            title: visible ? '' : 'Not in current view',
            onClick: visible ? () => onSelect(t.id, 'node') : undefined,
          },
            h('span', { className: 'ic' }, h(NodeIcon, { type: t.type, size: 14 })),
            h('span', { className: 'lbl' }, '→ ', t.label),
            h('span', { className: 'role' }, visible ? e.type.replace(/_/g, ' ') : 'not in view')
          );
        }),
        inboundEdges.map(e => {
          const s = nodeMap[e.from];
          const visible = visibleIds.has(s.id);
          return h('li', {
            key: e.id, className: 'rel-item' + (visible ? '' : ' is-out-of-view'),
            style: { '--rel-cat': CAT_VAR[s.category] },
            title: visible ? '' : 'Not in current view',
            onClick: visible ? () => onSelect(s.id, 'node') : undefined,
          },
            h('span', { className: 'ic' }, h(NodeIcon, { type: s.type, size: 14 })),
            h('span', { className: 'lbl' }, '← ', s.label),
            h('span', { className: 'role' }, visible ? e.type.replace(/_/g, ' ') : 'not in view')
          );
        }),
      )
    ) : null,

    evidence.length > 0 ? h(Section, { title: 'Evidence', count: evidence.length },
      h('ul', { className: 'evidence-list' },
        evidence.map(ev => h('li', { key: ev.id, className: 'ev-item' },
          h('div', { className: 'ev-head' }, ev.type, ' · ', ev.date),
          h('div', { className: 'ev-title' }, ev.label),
          ev.excerpt ? h('div', { className: 'ev-excerpt' }, '"', ev.excerpt, '"') : null
        ))
      )
    ) : null,

    h('div', { className: 'section', style: { borderBottom: 'none' } },
      h('div', {
        style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', letterSpacing: '0.04em' },
      }, node.id)
    ),
  );
}

function EdgeViewBody({ edge, nodeMap, evidenceMap, visibleIds, onSelect }) {
  const m = edge.metadata || {};
  const source = nodeMap[edge.from];
  const target = nodeMap[edge.to];
  const sourceVisible = visibleIds.has(source.id);
  const targetVisible = visibleIds.has(target.id);
  const evidence = (m.evidencedBy || []).map(id => evidenceMap[id]).filter(Boolean);

  const mechRows = [
    ['Protocol',     m.protocol && prettyValue(m.protocol)],
    ['Format',       m.format && prettyValue(m.format)],
    ['Latency',      m.latency && prettyValue(m.latency)],
    ['Schedule',     m.schedule && prettyValue(m.schedule)],
    ['Security',     m.security && prettyValue(m.security)],
    ['Condition',    m.condition],
    ['Confidence',   m.confidence ? h(ConfidenceMeter, { value: m.confidence }) : null],
    ['Contains PII', typeof m.containsPii === 'boolean' ? prettyValue(m.containsPii) : null],
  ];
  const hasMech = mechRows.some(([, v]) => v);

  return h('div', { className: 'inspector-body scrollbox' },
    edge.label ? h(Section, { title: 'Summary' },
      h('p', null, edge.label)
    ) : null,

    h(Section, { title: 'Endpoints' },
      h('ul', { className: 'related-list' },
        h('li', {
          className: 'rel-item' + (sourceVisible ? '' : ' is-out-of-view'),
          style: { '--rel-cat': CAT_VAR[source.category] },
          onClick: sourceVisible ? () => onSelect(source.id, 'node') : undefined,
        },
          h('span', { className: 'ic' }, h(NodeIcon, { type: source.type, size: 14 })),
          h('span', { className: 'lbl' }, source.label),
          h('span', { className: 'role' }, sourceVisible ? 'source' : 'source · not in view')
        ),
        h('li', {
          className: 'rel-item' + (targetVisible ? '' : ' is-out-of-view'),
          style: { '--rel-cat': CAT_VAR[target.category] },
          onClick: targetVisible ? () => onSelect(target.id, 'node') : undefined,
        },
          h('span', { className: 'ic' }, h(NodeIcon, { type: target.type, size: 14 })),
          h('span', { className: 'lbl' }, target.label),
          h('span', { className: 'role' }, targetVisible ? 'target' : 'target · not in view')
        ),
      )
    ),

    hasMech ? h(Section, { title: 'Mechanism' },
      h(ReadOnlyKV, { rows: mechRows })
    ) : null,

    (m.dataObjectsMoved && m.dataObjectsMoved.length > 0) ? h(Section, {
      title: 'Data Objects Moved', count: m.dataObjectsMoved.length,
    },
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4 } },
        m.dataObjectsMoved.map((d, i) => {
          const refNode = nodeMap[d];
          if (refNode) {
            return h('span', {
              key: i, className: 'tag', style: { cursor: 'pointer' },
              onClick: () => onSelect(refNode.id, 'node'),
            }, refNode.label);
          }
          return h('span', { key: i, className: 'tag' }, d);
        })
      )
    ) : null,

    (m.openQuestions && m.openQuestions.length > 0) ? h(Section, {
      title: 'Open Questions', count: m.openQuestions.length,
    },
      h('ul', { className: 'questions-list' },
        m.openQuestions.map((q, i) => h('li', { key: i, className: 'q-item' }, q))
      )
    ) : null,

    evidence.length > 0 ? h(Section, { title: 'Evidence', count: evidence.length },
      h('ul', { className: 'evidence-list' },
        evidence.map(ev => h('li', { key: ev.id, className: 'ev-item' },
          h('div', { className: 'ev-head' }, ev.type, ' · ', ev.date),
          h('div', { className: 'ev-title' }, ev.label),
          ev.excerpt ? h('div', { className: 'ev-excerpt' }, '"', ev.excerpt, '"') : null
        ))
      )
    ) : null,

    h('div', { className: 'section', style: { borderBottom: 'none' } },
      h('div', {
        style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', letterSpacing: '0.04em' },
      }, edge.id)
    ),
  );
}

function Section({ title, count, children, footer }) {
  return h('div', { className: 'section' },
    h('h3', { className: 'section-title' },
      title,
      typeof count === 'number' ? h('span', { className: 'count' }, count) : null
    ),
    children,
    footer,
  );
}

// ── Field control router ──────────────────────────────────────────────
// Renders the right control for a field def + value, wired to a setter.
function FieldControl({ def, value, setValue, autoOpen }) {
  switch (def.kind) {
    case 'text':
      return h(EditableText, {
        value,
        onCommit: setValue,
        placeholder: 'Click to add',
        autoEdit: autoOpen,
      });
    case 'bool':
      return h(BoolToggle, { value, onCommit: setValue });
    case 'risk':
      return h(Segmented, {
        kind: 'risk',
        value,
        options: [
          { value: 'low',    label: 'Low' },
          { value: 'medium', label: 'Med' },
          { value: 'high',   label: 'High' },
        ],
        onCommit: setValue,
      });
    case 'confidence':
      return h(Segmented, {
        kind: 'confidence',
        value,
        options: [
          { value: 'low',    label: 'Low' },
          { value: 'medium', label: 'Med' },
          { value: 'high',   label: 'High' },
        ],
        onCommit: setValue,
      });
    case 'enum':
      return h(EnumPopover, {
        value,
        options: def.options,
        onCommit: setValue,
        autoOpen,
      });
    default:
      return h('span', null, String(value));
  }
}

// Display-only renderer used when a field is set; falls back to plain text
// for "rich" displays (risk strip, confidence meter). Currently we always
// render the editable control, so this is only used for the small visual
// flourishes embedded inside the control area.
function FieldRow({ def, value, setValue, autoOpen }) {
  return h(React.Fragment, null,
    h('dt', null, def.label),
    h('dd', null, h(FieldControl, { def, value, setValue, autoOpen })),
  );
}

// ── Section block helper ──────────────────────────────────────────────
function MetaSection({ title, fieldDefs, metadata, setMeta, justAdded }) {
  const isSet = (f) => metadata[f.key] !== undefined && metadata[f.key] !== null && metadata[f.key] !== '';
  // Include the just-added field even if its value didn't survive the setMeta
  // filter (e.g. text fields default to '' and get stripped by setMeta).
  const setFields = fieldDefs.filter(f => isSet(f) || justAdded === f.key);
  const unsetFields = fieldDefs.filter(f => !isSet(f) && justAdded !== f.key);

  return h(Section, {
    title,
    footer: h(AddFieldMenu, {
      unsetFields: unsetFields.map(f => ({ key: f.key, label: f.label })),
      onAdd: (key) => {
        const def = fieldDefs.find(f => f.key === key);
        const initial = def.defaultValue !== undefined ? def.defaultValue : '';
        setMeta(key, initial, { justAdded: true });
      },
    }),
  },
    setFields.length === 0
      ? h('div', { className: 'section-empty' }, 'No fields set')
      : h('dl', { className: 'kv' },
          setFields.flatMap(f => [
            h('dt', { key: 'dt-' + f.key }, f.label),
            h('dd', { key: 'dd-' + f.key },
              h(FieldControl, {
                def: f,
                value: metadata[f.key],
                setValue: (v) => setMeta(f.key, v),
                autoOpen: justAdded === f.key,
              })
            ),
          ])
        )
  );
}

// ── Node body (edit mode) ─────────────────────────────────────────────
function NodeInspectorBody({ node, allEdges, nodeMap, evidenceMap, visibleIds, onSelect, onEdit }) {
  const [justAdded, setJustAdded] = React.useState(null);

  // Always operate on a metadata object.
  if (!node.metadata) node.metadata = {};
  const m = node.metadata;

  function setMeta(key, value, opts) {
    if (value === null || value === undefined || value === '') {
      delete m[key];
    } else {
      m[key] = value;
    }
    if (opts && opts.justAdded) setJustAdded(key);
    else if (justAdded === key) setJustAdded(null);
    onEdit();
  }
  function setField(key, value) {
    if (value === null || value === undefined || value === '') {
      delete node[key];
    } else {
      node[key] = value;
    }
    onEdit();
  }
  function setQuestions(next) {
    if (!next || next.length === 0) delete m.openQuestions;
    else m.openQuestions = next;
    onEdit();
  }

  return h('div', { className: 'inspector-body scrollbox' },
    // Summary (description) — always editable
    h(Section, { title: 'Summary' },
      h(EditableText, {
        value: node.description,
        onCommit: v => setField('description', v),
        placeholder: 'Add a summary…',
        multiline: true,
      })
    ),

    h(MetaSection, {
      title: 'Ownership & Stack',
      fieldDefs: fieldsBySection(NODE_FIELDS, 'ownership'),
      metadata: m,
      setMeta,
      justAdded,
      clearJustAdded: () => setJustAdded(null),
    }),

    h(MetaSection, {
      title: 'Properties',
      fieldDefs: fieldsBySection(NODE_FIELDS, 'properties'),
      metadata: m,
      setMeta,
      justAdded,
      clearJustAdded: () => setJustAdded(null),
    }),

    h(Section, {
      title: 'Open Questions',
      count: (m.openQuestions || []).length || undefined,
    },
      h(QuestionListEditor, { items: m.openQuestions, onChange: setQuestions })
    ),
  );
}

// ── Edge body ─────────────────────────────────────────────────────────
function EdgeInspectorBody({ edge, nodeMap, evidenceMap, visibleIds, onSelect, onEdit }) {
  const [justAdded, setJustAdded] = React.useState(null);
  if (!edge.metadata) edge.metadata = {};
  const m = edge.metadata;

  function setMeta(key, value, opts) {
    if (value === null || value === undefined || value === '') delete m[key];
    else m[key] = value;
    if (opts && opts.justAdded) setJustAdded(key);
    else if (justAdded === key) setJustAdded(null);
    onEdit();
  }
  function setField(key, value) {
    if (value === null || value === undefined || value === '') delete edge[key];
    else edge[key] = value;
    onEdit();
  }
  function setQuestions(next) {
    if (!next || next.length === 0) delete m.openQuestions;
    else m.openQuestions = next;
    onEdit();
  }

  return h('div', { className: 'inspector-body scrollbox' },
    h(Section, { title: 'Summary' },
      h(EditableText, {
        value: edge.label,
        onCommit: v => setField('label', v),
        placeholder: 'Add a label…',
        multiline: true,
      })
    ),

    h(MetaSection, {
      title: 'Mechanism',
      fieldDefs: fieldsBySection(EDGE_FIELDS, 'mechanism'),
      metadata: m,
      setMeta,
      justAdded,
      clearJustAdded: () => setJustAdded(null),
    }),

    h(Section, {
      title: 'Open Questions',
      count: (m.openQuestions || []).length || undefined,
    },
      h(QuestionListEditor, { items: m.openQuestions, onChange: setQuestions })
    ),
  );
}

function CloseBtn({ onClose }) {
  return h('button', { className: 'icon-btn', onClick: onClose, title: 'Close' },
    h('svg', { width: 12, height: 12, viewBox: '0 0 16 16' },
      h('path', { d: 'M3 3l10 10M13 3L3 13', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', fill: 'none' })
    )
  );
}

function Inspector({ selectedId, selectedKind, nodes, edges, nodeMap, evidenceMap, project, visibleIds, onSelect, onClose, onEdit, categories, categoriesById, nodeTypes, nodeTypesById }) {
  const [last, setLast] = React.useState(null);
  // Mode always resets to 'view' on every new selection — the user wants
  // a fresh inspector to open read-only regardless of the last state.
  const [mode, setMode] = React.useState('view');
  React.useEffect(() => {
    if (selectedId) setMode('view');
  }, [selectedId, selectedKind]);
  React.useEffect(() => {
    if (selectedId && selectedKind) {
      let s = null;
      if (selectedKind === 'node') s = nodeMap[selectedId];
      else if (selectedKind === 'edge') s = edges.find(e => e.id === selectedId);
      if (s) setLast({ kind: selectedKind, item: s });
    }
  }, [selectedId, selectedKind, nodeMap, edges]);

  const isOpen = !!(selectedId && selectedKind);
  const render = last;
  if (!render) return null;

  const isNode = render.kind === 'node';
  const item = render.item;
  const typeDef = isNode && nodeTypesById && nodeTypesById[item.type];
  const typeLabel = (typeDef && typeDef.label) || (isNode ? item.typeLabel : '');
  const iconKey = (typeDef && typeDef.iconKey) || (isNode ? item.type : null);
  const dynCatColor = isNode && categoriesById && categoriesById[item.category]
    ? categoriesById[item.category].color
    : null;
  const catVar = isNode
    ? (dynCatColor || CAT_VAR[item.category] || 'var(--cat-tech)')
    : 'var(--accent)';
  const catLabel = isNode && categoriesById && categoriesById[item.category]
    ? categoriesById[item.category].label
    : (isNode ? item.category : '');

  function setHeaderField(key, value) {
    if (value === null || value === undefined || value === '') delete item[key];
    else item[key] = value;
    onEdit && onEdit();
  }

  return h('aside', {
      className: 'inspector' + (isOpen ? ' is-open' : ''),
      style: { '--inspector-tint': catVar },
    },
    h('div', { className: 'inspector-head', style: { '--cat': catVar } },
      h('div', { className: 'breadcrumb' },
        h('span', { className: 'cat-blob' }),
        isNode
          ? (mode === 'edit' && categories
              ? h(EnumPopover, {
                  value: item.category,
                  options: categories.map(c => c.id),
                  formatLabel: (id) => (categoriesById && categoriesById[id])
                    ? categoriesById[id].label
                    : id,
                  optionColor: (id) => (categoriesById && categoriesById[id])
                    ? categoriesById[id].color
                    : undefined,
                  onCommit: (v) => setHeaderField('category', v || item.category),
                  allowClear: false,
                })
              : (catLabel + ' · ' + typeLabel))
          : 'Edge · ' + item.type.replace(/_/g, ' '),
        h('div', { className: 'actions' },
          h('div', { className: 'mode-toggle', role: 'tablist', 'aria-label': 'Inspector mode' },
            h('button', {
              className: 'mode-opt' + (mode === 'view' ? ' is-on' : ''),
              onClick: () => setMode('view'),
              role: 'tab',
              'aria-selected': mode === 'view',
              title: 'View read-only details',
            }, 'View'),
            h('button', {
              className: 'mode-opt' + (mode === 'edit' ? ' is-on' : ''),
              onClick: () => setMode('edit'),
              role: 'tab',
              'aria-selected': mode === 'edit',
              title: 'Edit details',
            }, 'Edit'),
          ),
          h(CloseBtn, { onClose })
        )
      ),
      h('div', { className: 'title-row' },
        h('div', { className: 'title-icon' },
          isNode
            ? h(NodeIcon, { type: item.type, iconKey, size: 18 })
            : h('svg', { width: 18, height: 18, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' },
                h('path', { d: 'M2 8h10M9 5l3 3-3 3' })
              )
        ),
        h('div', { style: { minWidth: 0, flex: 1 } },
          h('div', { className: 'title' },
            mode === 'edit'
              ? h(EditableText, {
                  value: isNode ? item.label : (item.label || ''),
                  onCommit: v => setHeaderField('label', v || (isNode ? 'Untitled' : '')),
                  placeholder: isNode ? 'Untitled' : (item.type.replace(/_/g, ' ')),
                  asTitle: true,
                  allowEmpty: !isNode,
                })
              : (isNode ? item.label : (item.label || item.type.replace(/_/g, ' ')))
          ),
          h('div', { className: 'subtitle' }, isNode ? typeLabel : item.type.replace(/_/g, ' '))
        )
      ),
      isNode ? (() => {
        const m = item.metadata || {};
        const pills = [];
        if (m.containsPii) pills.push({ kind: 'pii', text: 'PII' });
        if (m.systemOfRecord) pills.push({ kind: 'sor', text: 'System of record' });
        if (m.riskLevel === 'high') pills.push({ kind: 'risk', text: 'High risk' });
        if (m.automationLevel === 'manual') pills.push({ kind: 'manual', text: 'Manual' });
        if (item.type === 'spreadsheet') pills.push({ kind: 'manual', text: 'Spreadsheet' });
        if (pills.length === 0) return null;
        return h('div', { className: 'pillrow' },
          pills.map(p => h(Pill, { key: p.kind + p.text, kind: p.kind, text: p.text }))
        );
      })() : null,
    ),
    isNode
      ? (mode === 'edit'
          ? h(NodeInspectorBody, { node: item, allEdges: edges, nodeMap, evidenceMap, visibleIds, onSelect, onEdit })
          : h(NodeViewBody,      { node: item, allEdges: edges, nodeMap, evidenceMap, visibleIds, onSelect }))
      : (mode === 'edit'
          ? h(EdgeInspectorBody, { edge: item, nodeMap, evidenceMap, visibleIds, onSelect, onEdit })
          : h(EdgeViewBody,      { edge: item, nodeMap, evidenceMap, visibleIds, onSelect })),
  );
}

window.Inspector = Inspector;
