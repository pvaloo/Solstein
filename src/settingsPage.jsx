/* global React */
const { useEffect, useState, useRef } = React;

// Curated swatch palette — consistent L/C, varying hue.
// Includes all four built-in default hues so swatches match defaults.
const HUES = [25, 75, 130, 175, 200, 260, 300, 340];
const SWATCHES = HUES.map(h => `oklch(0.76 0.14 ${h})`);

function ColorPicker({ value, onChange, usedByOthers }) {
  const inputRef = useRef(null);
  const [hexValue, setHexValue] = useState('#000000');
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
      setHexValue(hex);
    } catch (e) { /* leave previous */ }
  }, [value]);

  return React.createElement('div', { className: 'cp-row' },
    SWATCHES.map((c) => {
      const conflictLabel = usedByOthers && usedByOthers[c];
      return React.createElement('button', {
        key: c,
        className: 'cp-swatch'
          + (value === c ? ' is-on' : '')
          + (conflictLabel ? ' is-taken' : ''),
        style: { background: c, boxShadow: `0 0 10px -3px ${c}` },
        onClick: () => onChange(c),
        title: conflictLabel ? `Used by ${conflictLabel}` : c,
        'aria-label': `Set color to ${c}` + (conflictLabel ? ` (used by ${conflictLabel})` : ''),
      });
    }),
    React.createElement('div', { className: 'cp-divider' }),
    React.createElement('label', { className: 'cp-custom', title: 'Pick a custom color' },
      React.createElement('input', {
        ref: inputRef,
        type: 'color',
        className: 'cp-native',
        value: hexValue,
        onChange: (e) => onChange(e.target.value),
      }),
      React.createElement('span', { className: 'cp-custom-face' },
        React.createElement('span', { className: 'cp-custom-grad', style: { background: value } }),
        React.createElement('span', { className: 'cp-custom-label' }, 'Custom'),
      ),
    ),
  );
}

// ── Inline-editable label ─────────────────────────────────────────────
function EditableLabel({ value, onCommit, autoEdit, className }) {
  const [editing, setEditing] = useState(!!autoEdit);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    const trimmed = (draft || '').trim();
    if (trimmed && trimmed !== value) onCommit(trimmed);
    else setDraft(value);
  }
  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return React.createElement('input', {
      ref: inputRef,
      className: 'cp-name-input' + (className ? ' ' + className : ''),
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e) => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        if (e.key === 'Escape') { e.preventDefault(); cancel(); }
      },
    });
  }

  return React.createElement('button', {
    className: 'cp-name cp-name-edit' + (className ? ' ' + className : ''),
    onClick: () => setEditing(true),
    title: 'Click to rename',
  }, value);
}

// ── Inline-editable description (multiline) ──────────────────────────
function EditableDescription({ value, onCommit, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const ref = useRef(null);
  useEffect(() => { setDraft(value || ''); }, [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);
  function commit() {
    setEditing(false);
    const next = (draft || '').trim();
    if (next !== (value || '')) onCommit(next);
  }
  if (editing) {
    return React.createElement('textarea', {
      ref,
      className: 'vw-desc-input',
      value: draft,
      placeholder: placeholder || '',
      rows: 2,
      onChange: (e) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e) => {
        if (e.key === 'Escape') { e.preventDefault(); setDraft(value || ''); setEditing(false); }
      },
    });
  }
  return React.createElement('button', {
    className: 'vw-desc-edit' + (!value ? ' is-empty' : ''),
    onClick: () => setEditing(true),
    title: 'Click to edit description',
  }, value || (placeholder || 'Add a description…'));
}

// ── Type-pill multi-select (used by Views + Lenses) ──────────────────
function TypePillList({ allTypes, selected, onChange, label, usage }) {
  const selectedSet = new Set(selected || []);
  // Hide placeholder/unnamed types (default "New type" / "new" / empty) that
  // aren't currently selected and aren't in use — they clutter pill lists and
  // shouldn't be matchable until the user actually names them. Settings → Node
  // Types is where they get renamed or removed.
  const isPlaceholderLabel = (lbl) => {
    const v = (lbl || '').trim().toLowerCase();
    return v === '' || v === 'new' || v === 'new type';
  };
  const visibleTypes = allTypes.filter((t) => {
    if (selectedSet.has(t.id)) return true;
    if ((usage && usage[t.id]) > 0) return true;
    return !isPlaceholderLabel(t.label);
  });
  // Sort: selected first, then by usage desc, then alpha
  const sorted = [...visibleTypes].sort((a, b) => {
    const aSel = selectedSet.has(a.id) ? 0 : 1;
    const bSel = selectedSet.has(b.id) ? 0 : 1;
    if (aSel !== bSel) return aSel - bSel;
    const aU = (usage && usage[a.id]) || 0;
    const bU = (usage && usage[b.id]) || 0;
    if (aU !== bU) return bU - aU;
    return (a.label || '').localeCompare(b.label || '');
  });
  function toggle(id) {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange(Array.from(next));
  }
  function selectAll() { onChange(visibleTypes.map(t => t.id)); }
  function clear() { onChange([]); }
  return React.createElement('div', { className: 'tpl' },
    React.createElement('div', { className: 'tpl-head' },
      React.createElement('span', { className: 'tpl-label' }, label),
      React.createElement('span', { className: 'tpl-count' },
        selectedSet.size + ' / ' + visibleTypes.length + ' included'
      ),
      React.createElement('div', { className: 'tpl-actions' },
        React.createElement('button', { className: 'tpl-mini', onClick: selectAll, type: 'button' }, 'All'),
        React.createElement('button', { className: 'tpl-mini', onClick: clear,     type: 'button' }, 'None'),
      ),
    ),
    React.createElement('div', { className: 'tpl-pills' },
      sorted.map(t => {
        const on = selectedSet.has(t.id);
        const u = (usage && usage[t.id]) || 0;
        return React.createElement('button', {
          key: t.id,
          type: 'button',
          className: 'tpl-pill' + (on ? ' is-on' : ''),
          onClick: () => toggle(t.id),
          title: u ? (u + ' instance' + (u === 1 ? '' : 's')) : 'No instances',
        },
          React.createElement('span', { className: 'tpl-pip' }),
          React.createElement('span', { className: 'tpl-pill-label' }, t.label || t.id),
          u > 0 && React.createElement('span', { className: 'tpl-pill-ct' }, u),
        );
      }),
      sorted.length === 0 && React.createElement('div', { className: 'tpl-empty' },
        'No types defined yet.',
      ),
    ),
  );
}

// ── Category row ─────────────────────────────────────────────────────
function CategoryRow({ cat, allCats, usage, onUpdate, onRemove, autoEditName }) {
  const conflicts = allCats
    .filter(o => o.id !== cat.id && o.color === cat.color)
    .map(o => o.label);
  const usedByOthers = {};
  allCats.forEach(o => {
    if (o.id !== cat.id) {
      const existing = usedByOthers[o.color];
      usedByOthers[o.color] = existing ? existing + ', ' + o.label : o.label;
    }
  });

  const count = usage[cat.id] || 0;
  const canDelete = count === 0;

  return React.createElement('div', { className: 'cp-cat-row' + (conflicts.length ? ' has-conflict' : '') },
    React.createElement('div', {
      className: 'cp-current-swatch',
      style: { background: cat.color, boxShadow: `0 0 14px -4px ${cat.color}` },
    }),
    React.createElement('div', { className: 'cp-meta' },
      React.createElement('div', { className: 'cp-name-row' },
        React.createElement(EditableLabel, {
          value: cat.label,
          onCommit: (v) => onUpdate(cat.id, { label: v }),
          autoEdit: autoEditName,
        }),
        React.createElement('span', { className: 'cp-usage' },
          count === 0 ? 'Not used' : `${count} node${count === 1 ? '' : 's'}`
        ),
      ),
      conflicts.length ? React.createElement('div', { className: 'cp-conflict' },
        'Shares color with ', conflicts.join(' & ')
      ) : null,
    ),
    React.createElement(ColorPicker, {
      value: cat.color,
      onChange: (v) => onUpdate(cat.id, { color: v }),
      usedByOthers,
    }),
    canDelete ? React.createElement('button', {
      className: 'cp-delete',
      onClick: () => onRemove(cat.id),
      title: 'Delete category',
      'aria-label': 'Delete category',
    },
      React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' },
        React.createElement('path', { d: 'M3 5h10M6.5 5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V5M4.5 5l.7 8a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.7-8' }),
      )
    ) : React.createElement('div', { className: 'cp-delete-spacer' }),
  );
}

// ── Node type row ────────────────────────────────────────────────────
function NodeTypeRow({ nt, usage, onUpdate, onRemove, autoEditName }) {
  const count = usage[nt.id] || 0;
  const canDelete = count === 0;
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  useEffect(() => {
    if (!pickerOpen) return;
    function onDoc(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setPickerOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  const NI = window.NodeIcon;
  const iconKeys = window.NodeTypes ? window.NodeTypes.iconLibraryKeys() : [];

  return React.createElement('div', { className: 'nt-row' },
    React.createElement('div', { className: 'nt-icon-cell', ref: pickerRef },
      React.createElement('button', {
        className: 'nt-icon-btn',
        onClick: () => setPickerOpen(o => !o),
        title: 'Click to swap icon',
        'aria-label': 'Change icon',
      }, NI ? React.createElement(NI, { iconKey: nt.iconKey, size: 18 }) : null),
      pickerOpen ? React.createElement('div', { className: 'nt-icon-picker' },
        iconKeys.map(key => React.createElement('button', {
          key,
          className: 'nt-icon-opt' + (key === nt.iconKey ? ' is-on' : ''),
          onClick: () => { onUpdate(nt.id, { iconKey: key }); setPickerOpen(false); },
          title: key.replace(/_/g, ' '),
          'aria-label': `Use ${key} icon`,
        }, NI ? React.createElement(NI, { iconKey: key, size: 16 }) : null))
      ) : null,
    ),
    React.createElement('div', { className: 'cp-meta' },
      React.createElement('div', { className: 'cp-name-row' },
        React.createElement(EditableLabel, {
          value: nt.label,
          onCommit: (v) => onUpdate(nt.id, { label: v }),
          autoEdit: autoEditName,
        }),
        React.createElement('span', { className: 'cp-usage' },
          count === 0 ? 'Not used' : `${count} node${count === 1 ? '' : 's'}`
        ),
      ),
      React.createElement('div', { className: 'nt-id' }, nt.id),
    ),
    canDelete ? React.createElement('button', {
      className: 'cp-delete',
      onClick: () => onRemove(nt.id),
      title: 'Delete node type',
      'aria-label': 'Delete node type',
    },
      React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' },
        React.createElement('path', { d: 'M3 5h10M6.5 5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V5M4.5 5l.7 8a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.7-8' }),
      )
    ) : React.createElement('div', { className: 'cp-delete-spacer' }),
  );
}

// ── Edge type row ────────────────────────────────────────────────────
function EdgeTypeRow({ et, usage, onUpdate, onRemove, autoEditName }) {
  const count = usage[et.id] || 0;
  const canDelete = count === 0;
  return React.createElement('div', { className: 'nt-row et-row' },
    React.createElement('div', { className: 'et-glyph' },
      React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
        React.createElement('path', { d: 'M4 12h14' }),
        React.createElement('path', { d: 'M14 7l5 5-5 5' }),
      ),
    ),
    React.createElement('div', { className: 'cp-meta' },
      React.createElement('div', { className: 'cp-name-row' },
        React.createElement(EditableLabel, {
          value: et.label,
          onCommit: (v) => onUpdate(et.id, { label: v }),
          autoEdit: autoEditName,
        }),
        React.createElement('span', { className: 'cp-usage' },
          count === 0 ? 'Not used' : `${count} edge${count === 1 ? '' : 's'}`
        ),
      ),
      React.createElement('div', { className: 'nt-id' }, et.id),
    ),
    canDelete ? React.createElement('button', {
      className: 'cp-delete',
      onClick: () => onRemove(et.id),
      title: 'Delete edge type',
      'aria-label': 'Delete edge type',
    },
      React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' },
        React.createElement('path', { d: 'M3 5h10M6.5 5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V5M4.5 5l.7 8a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.7-8' }),
      )
    ) : React.createElement('div', { className: 'cp-delete-spacer' }),
  );
}

// ── View row ─────────────────────────────────────────────────────────
function ViewRow({ view, nodeTypes, edgeTypes, nodeTypeUsage, edgeTypeUsage, onUpdate, onRemove, autoEditName }) {
  const isBuiltIn = view.id === 'journey_view' || view.id === 'technical_view';
  return React.createElement('div', { className: 'vw-row' },
    React.createElement('div', { className: 'vw-head' },
      React.createElement(EditableLabel, {
        value: view.label,
        onCommit: (v) => onUpdate(view.id, { label: v }),
        autoEdit: autoEditName,
        className: 'vw-name',
      }),
      React.createElement('span', { className: 'vw-id' }, view.id),
      isBuiltIn
        ? React.createElement('span', {
            className: 'vw-locked',
            title: 'Built-in view — cannot be deleted',
          },
            React.createElement('svg', { width: 11, height: 11, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
              React.createElement('rect', { x: 3, y: 7, width: 10, height: 7, rx: 1.2 }),
              React.createElement('path', { d: 'M5.5 7V5a2.5 2.5 0 0 1 5 0v2' }),
            ),
            'Built-in',
          )
        : React.createElement('button', {
            className: 'cp-delete vw-delete',
            onClick: () => onRemove(view.id),
            title: 'Delete view',
            'aria-label': 'Delete view',
          },
            React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' },
              React.createElement('path', { d: 'M3 5h10M6.5 5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V5M4.5 5l.7 8a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.7-8' }),
            )
          ),
    ),
    React.createElement(EditableDescription, {
      value: view.description,
      onCommit: (v) => onUpdate(view.id, { description: v }),
      placeholder: 'What is this view for?',
    }),
    React.createElement(TypePillList, {
      label: 'Node types',
      allTypes: nodeTypes,
      usage: nodeTypeUsage,
      selected: view.includeNodeTypes || [],
      onChange: (next) => onUpdate(view.id, { includeNodeTypes: next }),
    }),
    React.createElement(TypePillList, {
      label: 'Edge types',
      allTypes: edgeTypes,
      usage: edgeTypeUsage,
      selected: view.includeEdgeTypes || [],
      onChange: (next) => onUpdate(view.id, { includeEdgeTypes: next }),
    }),
  );
}

// ── Lens match editor ─────────────────────────────────────────────────
// Edits a `lens.match` object — a dict of `metadata.<field>` → value. AND
// across keys; an array value means "any of". Field dropdown is restricted
// to metadata fields that actually appear on nodes or edges (discovered).
function LensMatchEditor({ match, metaFields, onChange }) {
  // Merge node + edge field lists. A field that appears on both gets a
  // 'both' scope and the union of seen values.
  const mergedFields = useMemo(() => {
    const out = new Map();
    function add(f, scope) {
      const existing = out.get(f.path);
      if (!existing) {
        out.set(f.path, { ...f, scope, values: [...f.values] });
      } else {
        existing.scope = existing.scope === scope ? scope : 'both';
        // Union values
        const vs = new Set([...existing.values, ...f.values]);
        existing.values = [...vs].sort();
        // Upgrade kind: if both have same kind keep it; else fallback to enum/string
        if (existing.kind !== f.kind) {
          if (existing.kind === 'boolean' && f.kind === 'boolean') existing.kind = 'boolean';
          else if (existing.values.length <= 12) existing.kind = 'enum';
          else existing.kind = 'string';
        }
      }
    }
    (metaFields?.node || []).forEach(f => add(f, 'node'));
    (metaFields?.edge || []).forEach(f => add(f, 'edge'));
    return [...out.values()].sort((a, b) => a.field.localeCompare(b.field));
  }, [metaFields]);

  const fieldByPath = useMemo(() => {
    const m = {};
    mergedFields.forEach(f => { m[f.path] = f; });
    return m;
  }, [mergedFields]);

  const entries = Object.entries(match || {});
  const usedPaths = new Set(entries.map(([k]) => k));

  function updateMatch(next) {
    onChange(next);
  }

  function renamePath(oldPath, newPath) {
    if (oldPath === newPath) return;
    const next = {};
    for (const [k, v] of entries) {
      if (k === oldPath) next[newPath] = inferInitialValue(fieldByPath[newPath]);
      else next[k] = v;
    }
    updateMatch(next);
  }

  function setValue(path, value) {
    updateMatch({ ...match, [path]: value });
  }

  function removeRow(path) {
    const next = { ...match };
    delete next[path];
    updateMatch(next);
  }

  function addRow() {
    const firstUnused = mergedFields.find(f => !usedPaths.has(f.path));
    const target = firstUnused || mergedFields[0];
    if (!target) return;
    updateMatch({ ...match, [target.path]: inferInitialValue(target) });
  }

  function inferInitialValue(f) {
    if (!f) return true;
    if (f.kind === 'boolean') return true;
    if (f.kind === 'multi') return 'non_empty';
    if (f.kind === 'enum' && f.values.length > 0) return f.values[0];
    return '';
  }

  // Field options for dropdown — show scope as suffix
  function fieldOptions(currentPath) {
    return mergedFields
      .filter(f => f.path === currentPath || !usedPaths.has(f.path))
      .map(f => ({
        value: f.path,
        label: f.field + (f.scope === 'both' ? '' : '  · ' + f.scope),
      }));
  }

  const SolDropdownReact = window.SolDropdownReact;

  return React.createElement('div', { className: 'ln-match ln-match-edit' },
    React.createElement('div', { className: 'ln-match-head' },
      React.createElement('span', { className: 'ln-match-label' }, 'Match conditions'),
      React.createElement('span', { className: 'ln-match-sub' },
        entries.length > 1 ? 'All must match — multi-value fields match any.' : 'Multi-value fields match any.',
      ),
    ),
    entries.length === 0
      ? React.createElement('div', { className: 'ln-match-empty' },
          'No conditions — this lens matches only via Also-match types below.',
        )
      : React.createElement('div', { className: 'ln-match-rows' },
          entries.map(([path, value]) => {
            const field = fieldByPath[path];
            return React.createElement('div', { key: path, className: 'ln-cond-row' },
              React.createElement('div', { className: 'ln-cond-field' },
                SolDropdownReact
                  ? React.createElement(SolDropdownReact, {
                      small: true,
                      value: path,
                      options: fieldOptions(path),
                      onChange: (v) => renamePath(path, v),
                    })
                  : React.createElement('span', { className: 'ln-cond-fallback' }, path),
                field && field.scope !== 'both'
                  ? React.createElement('span', { className: 'ln-cond-scope' }, field.scope)
                  : null,
                !field
                  ? React.createElement('span', { className: 'ln-cond-unknown', title: 'This field is not present on any node or edge' }, 'unknown')
                  : null,
              ),
              React.createElement('span', { className: 'ln-cond-op' }, 'is'),
              React.createElement('div', { className: 'ln-cond-val' },
                React.createElement(LensValueControl, {
                  field: field,
                  value: value,
                  onChange: (v) => setValue(path, v),
                }),
              ),
              React.createElement('button', {
                className: 'ln-cond-remove',
                onClick: () => removeRow(path),
                title: 'Remove condition',
                'aria-label': 'Remove condition',
              },
                React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' },
                  React.createElement('path', { d: 'M3 3l6 6M9 3l-6 6' }),
                ),
              ),
            );
          }),
        ),
    React.createElement('button', {
      className: 'ln-cond-add',
      type: 'button',
      onClick: addRow,
      disabled: mergedFields.length === 0 || usedPaths.size >= mergedFields.length,
    },
      React.createElement('span', { className: 'ln-cond-add-plus' }, '+'),
      'Add condition',
    ),
  );
}

// Value control — adapts to the field's kind.
function LensValueControl({ field, value, onChange }) {
  // Unknown field → free text
  if (!field) {
    return React.createElement('input', {
      className: 'ln-cond-input',
      type: 'text',
      value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
      onChange: (e) => onChange(e.target.value),
    });
  }

  if (field.kind === 'boolean') {
    const v = value === true || value === 'true';
    return React.createElement('div', { className: 'ln-cond-segments' },
      React.createElement('button', {
        type: 'button',
        className: 'ln-cond-seg' + (v ? ' is-on' : ''),
        onClick: () => onChange(true),
      }, 'true'),
      React.createElement('button', {
        type: 'button',
        className: 'ln-cond-seg' + (!v ? ' is-on' : ''),
        onClick: () => onChange(false),
      }, 'false'),
    );
  }

  if (field.kind === 'multi') {
    const v = value === 'non_empty' ? 'non_empty' : (value === 'empty' ? 'empty' : 'non_empty');
    return React.createElement('div', { className: 'ln-cond-segments' },
      React.createElement('button', {
        type: 'button',
        className: 'ln-cond-seg' + (v === 'non_empty' ? ' is-on' : ''),
        onClick: () => onChange('non_empty'),
      }, 'has any'),
      React.createElement('button', {
        type: 'button',
        className: 'ln-cond-seg' + (v === 'empty' ? ' is-on' : ''),
        onClick: () => onChange('empty'),
      }, 'has none'),
    );
  }

  if (field.kind === 'enum') {
    const selected = new Set(Array.isArray(value) ? value : (value != null && value !== '' ? [value] : []));
    // Include any currently-selected values that aren't in the discovered
    // value set (data may have changed, or the lens references a stale value).
    const chipValues = [...field.values];
    for (const v of selected) {
      if (!chipValues.some(x => x === v || String(x) === String(v))) chipValues.push(v);
    }
    function toggle(v) {
      const next = new Set(selected);
      // Strip any string-equivalent of the same value to avoid duplicates
      [...next].forEach(x => { if (x !== v && String(x) === String(v)) next.delete(x); });
      if (next.has(v)) next.delete(v); else next.add(v);
      const arr = [...next];
      if (arr.length === 0) onChange(''); // user cleared; will not match — but valid
      else if (arr.length === 1) onChange(arr[0]);
      else onChange(arr);
    }
    return React.createElement('div', { className: 'ln-cond-chips' },
      chipValues.map((v, i) => React.createElement('button', {
        key: String(v) + ':' + i,
        type: 'button',
        className: 'ln-cond-chip' + (selected.has(v) ? ' is-on' : ''),
        onClick: () => toggle(v),
      }, String(v))),
    );
  }

  // Plain text
  return React.createElement('input', {
    className: 'ln-cond-input',
    type: 'text',
    value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
    onChange: (e) => onChange(e.target.value),
  });
}

// ── Lens row ─────────────────────────────────────────────────────────
function LensRow({ lens, nodeTypes, edgeTypes, nodeTypeUsage, edgeTypeUsage, metaFields, onUpdate, onRemove, autoEditName }) {
  return React.createElement('div', { className: 'vw-row ln-row' },
    React.createElement('div', { className: 'vw-head' },
      React.createElement(EditableLabel, {
        value: lens.label,
        onCommit: (v) => onUpdate(lens.id, { label: v }),
        autoEdit: autoEditName,
        className: 'vw-name',
      }),
      React.createElement('span', { className: 'vw-id' }, lens.id),
      React.createElement('button', {
        className: 'cp-delete vw-delete',
        onClick: () => onRemove(lens.id),
        title: 'Delete lens',
        'aria-label': 'Delete lens',
      },
        React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' },
          React.createElement('path', { d: 'M3 5h10M6.5 5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V5M4.5 5l.7 8a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.7-8' }),
        )
      ),
    ),
    React.createElement(EditableDescription, {
      value: lens.description,
      onCommit: (v) => onUpdate(lens.id, { description: v }),
      placeholder: 'What does this lens highlight?',
    }),
    React.createElement(LensMatchEditor, {
      match: lens.match || {},
      metaFields: metaFields,
      onChange: (next) => onUpdate(lens.id, { match: next }),
    }),
    React.createElement(TypePillList, {
      label: 'Also match · Node types',
      allTypes: nodeTypes,
      usage: nodeTypeUsage,
      selected: lens.alsoMatchNodeTypes || [],
      onChange: (next) => onUpdate(lens.id, { alsoMatchNodeTypes: next }),
    }),
    React.createElement(TypePillList, {
      label: 'Also match · Edge types',
      allTypes: edgeTypes,
      usage: edgeTypeUsage,
      selected: lens.alsoMatchEdgeTypes || [],
      onChange: (next) => onUpdate(lens.id, { alsoMatchEdgeTypes: next }),
    }),
  );
}

// ── Settings Page ────────────────────────────────────────────────────
function SettingsPage(props) {
  const {
    open, onClose,
    categories, categoryUsage, onUpdateCategory, onAddCategory, onRemoveCategory,
    nodeTypes, nodeTypeUsage, onUpdateNodeType, onAddNodeType, onRemoveNodeType,
    edgeTypes, edgeTypeUsage, onUpdateEdgeType, onAddEdgeType, onRemoveEdgeType,
    views, onUpdateView, onAddView, onRemoveView,
    overlays, onUpdateOverlay, onAddOverlay, onRemoveOverlay,
    lensMetaFields,
  } = props;
  const [autoEditId, setAutoEditId] = useState(null);
  const [activeNav, setActiveNav] = useState('categories');

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleAddCategory() { onAddCategory(); setAutoEditId('__pending'); }

  // Detect when a brand-new entity appears and mark it for auto-edit.
  const lastCountRef = useRef({
    cats: categories.length,
    types: (nodeTypes || []).length,
    etypes: (edgeTypes || []).length,
    views: (views || []).length,
    lenses: (overlays || []).length,
  });
  useEffect(() => {
    const prev = lastCountRef.current;
    if (categories.length > prev.cats && autoEditId === '__pending') {
      setAutoEditId(categories[categories.length - 1].id);
    } else if ((nodeTypes || []).length > prev.types && autoEditId === '__pending-type') {
      setAutoEditId(nodeTypes[nodeTypes.length - 1].id);
    } else if ((edgeTypes || []).length > prev.etypes && autoEditId === '__pending-etype') {
      setAutoEditId(edgeTypes[edgeTypes.length - 1].id);
    } else if ((views || []).length > prev.views && autoEditId === '__pending-view') {
      setAutoEditId(views[views.length - 1].id);
    } else if ((overlays || []).length > prev.lenses && autoEditId === '__pending-lens') {
      setAutoEditId(overlays[overlays.length - 1].id);
    }
    lastCountRef.current = {
      cats: categories.length,
      types: (nodeTypes || []).length,
      etypes: (edgeTypes || []).length,
      views: (views || []).length,
      lenses: (overlays || []).length,
    };
  }, [categories, nodeTypes, edgeTypes, views, overlays, autoEditId]);
  useEffect(() => {
    if (autoEditId && !autoEditId.startsWith('__pending')) {
      const t = setTimeout(() => setAutoEditId(null), 100);
      return () => clearTimeout(t);
    }
  }, [autoEditId]);

  return React.createElement('div', {
    className: 'settings-page' + (open ? ' is-open' : ''),
    'aria-hidden': !open,
  },
    React.createElement('header', { className: 'settings-header' },
      React.createElement('div', { className: 'settings-header-left' },
        React.createElement('div', { className: 'settings-kicker' }, 'Graph Settings'),
        React.createElement('h1', { className: 'settings-title' }, 'Configure this canvas'),
      ),
      React.createElement('button', {
        className: 'settings-close',
        onClick: onClose,
        title: 'Close (Esc)',
        'aria-label': 'Close settings',
      },
        React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' },
          React.createElement('path', { d: 'M4 4l8 8M12 4l-8 8' }),
        ),
        React.createElement('span', null, 'Close'),
      ),
    ),

    React.createElement('div', { className: 'settings-body' },
      React.createElement('nav', { className: 'settings-nav' },
        React.createElement('div', { className: 'settings-nav-group' },
          React.createElement('div', { className: 'settings-nav-kicker' }, 'Appearance'),
          React.createElement('button', {
            className: 'settings-nav-item' + (activeNav === 'categories' ? ' is-active' : ''),
            onClick: () => setActiveNav('categories'),
          }, 'Categories'),
          React.createElement('button', {
            className: 'settings-nav-item' + (activeNav === 'node-types' ? ' is-active' : ''),
            onClick: () => setActiveNav('node-types'),
          }, 'Node types'),
          React.createElement('button', {
            className: 'settings-nav-item' + (activeNav === 'edge-types' ? ' is-active' : ''),
            onClick: () => setActiveNav('edge-types'),
          }, 'Edge types'),
        ),
        React.createElement('div', { className: 'settings-nav-group' },
          React.createElement('div', { className: 'settings-nav-kicker' }, 'Structure'),
          React.createElement('button', {
            className: 'settings-nav-item' + (activeNav === 'views' ? ' is-active' : ''),
            onClick: () => setActiveNav('views'),
          }, 'Views'),
          React.createElement('button', {
            className: 'settings-nav-item' + (activeNav === 'lenses' ? ' is-active' : ''),
            onClick: () => setActiveNav('lenses'),
          }, 'Lenses'),
        ),
      ),

      React.createElement('main', { className: 'settings-main' },

        // ─── Categories ──────────────────────────────────────────────
        activeNav === 'categories' ? React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'settings-section-head' },
            React.createElement('h2', null, 'Categories'),
            React.createElement('p', null,
              'Discovered from the JSON, plus any you add. Click a name to rename. ',
              'Built-in categories cannot be deleted. ',
              'Custom categories must be empty (zero nodes) before they can be deleted.'),
          ),
          React.createElement('div', { className: 'settings-card' },
            React.createElement('div', { className: 'cp-grid' },
              categories.map((cat) =>
                React.createElement(CategoryRow, {
                  key: cat.id,
                  cat,
                  allCats: categories,
                  usage: categoryUsage,
                  onUpdate: onUpdateCategory,
                  onRemove: onRemoveCategory,
                  autoEditName: autoEditId === cat.id,
                })
              )
            ),
            React.createElement('div', { className: 'cp-add-row' },
              React.createElement('button', {
                className: 'cp-add-btn',
                onClick: handleAddCategory,
              }, '+ Add category'),
            ),
          ),
        ) : null,

        // ─── Node types ──────────────────────────────────────────────
        activeNav === 'node-types' ? React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'settings-section-head' },
            React.createElement('h2', null, 'Node types'),
            React.createElement('p', null,
              'Each node is one of these types. Click a name to rename; click the icon to swap it. ',
              'Custom types can be deleted when no nodes reference them.'),
          ),
          React.createElement('div', { className: 'settings-card' },
            React.createElement('div', { className: 'nt-grid' },
              (nodeTypes || []).map((t) =>
                React.createElement(NodeTypeRow, {
                  key: t.id,
                  nt: t,
                  usage: nodeTypeUsage,
                  onUpdate: onUpdateNodeType,
                  onRemove: onRemoveNodeType,
                  autoEditName: autoEditId === t.id,
                })
              )
            ),
            React.createElement('div', { className: 'cp-add-row' },
              React.createElement('button', {
                className: 'cp-add-btn',
                onClick: () => { onAddNodeType(); setAutoEditId('__pending-type'); },
              }, '+ Add node type'),
            ),
          ),
        ) : null,

        // ─── Edge types ──────────────────────────────────────────────
        activeNav === 'edge-types' ? React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'settings-section-head' },
            React.createElement('h2', null, 'Edge types'),
            React.createElement('p', null,
              'Each edge declares one of these relationship types. Click a name to rename. ',
              'Custom edge types can be deleted when no edges reference them.'),
          ),
          React.createElement('div', { className: 'settings-card' },
            React.createElement('div', { className: 'nt-grid' },
              (edgeTypes || []).map((et) =>
                React.createElement(EdgeTypeRow, {
                  key: et.id,
                  et,
                  usage: edgeTypeUsage,
                  onUpdate: onUpdateEdgeType,
                  onRemove: onRemoveEdgeType,
                  autoEditName: autoEditId === et.id,
                })
              )
            ),
            React.createElement('div', { className: 'cp-add-row' },
              React.createElement('button', {
                className: 'cp-add-btn',
                onClick: () => { onAddEdgeType(); setAutoEditId('__pending-etype'); },
              }, '+ Add edge type'),
            ),
          ),
        ) : null,

        // ─── Views ───────────────────────────────────────────────────
        activeNav === 'views' ? React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'settings-section-head' },
            React.createElement('h2', null, 'Views'),
            React.createElement('p', null,
              'Each view is a curated slice of the graph — defined by which node and edge types it includes. ',
              'Imported from the Wizard; edit here, add new ones, or delete those you don\u2019t need.'),
          ),
          React.createElement('div', { className: 'vw-list' },
            (views || []).map(v =>
              React.createElement(ViewRow, {
                key: v.id,
                view: v,
                nodeTypes: nodeTypes || [],
                edgeTypes: edgeTypes || [],
                nodeTypeUsage,
                edgeTypeUsage,
                onUpdate: onUpdateView,
                onRemove: onRemoveView,
                autoEditName: autoEditId === v.id,
              })
            ),
          ),
          React.createElement('div', { className: 'cp-add-row' },
            React.createElement('button', {
              className: 'cp-add-btn',
              onClick: () => { onAddView(); setAutoEditId('__pending-view'); },
            }, '+ Add view'),
          ),
        ) : null,

        // ─── Lenses ──────────────────────────────────────────────────
        activeNav === 'lenses' ? React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'settings-section-head' },
            React.createElement('h2', null, 'Lenses'),
            React.createElement('p', null,
              'Lenses are overlays — they highlight nodes and edges that match a condition. ',
              'Click any field below to edit conditions, also-match types, or rename. New lenses start empty.'),
          ),
          React.createElement('div', { className: 'vw-list' },
            (overlays || []).map(o =>
              React.createElement(LensRow, {
                key: o.id,
                lens: o,
                nodeTypes,
                edgeTypes,
                nodeTypeUsage,
                edgeTypeUsage,
	                metaFields: lensMetaFields,
	                onUpdate: onUpdateOverlay,
	                onRemove: onRemoveOverlay,
	                autoEditName: autoEditId === o.id,
	              })
            ),
          ),
          React.createElement('div', { className: 'cp-add-row' },
            React.createElement('button', {
              className: 'cp-add-btn',
              onClick: () => { onAddOverlay(); setAutoEditId('__pending-lens'); },
            }, '+ Add lens'),
          ),
        ) : null,

      ),
    ),
  );
}

window.SettingsPage = SettingsPage;
