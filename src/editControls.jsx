/* global React */
// Inline editor primitives used by the inspector.
// All controls follow the same pattern: read current value, render display,
// click to enter edit, blur/Enter commits, Esc reverts.
// Commits call onCommit(newValue). Pass null to clear/remove.

const { useState, useRef, useEffect, useLayoutEffect } = React;
const ec = React.createElement;

// ── EditableText ──────────────────────────────────────────────────────
// Inline single-line or multi-line text field. Empty value renders as
// placeholder; clicking enters edit mode.
function EditableText({
  value, onCommit, placeholder, multiline, mono, asTitle, autoEdit, allowEmpty = true,
}) {
  const [editing, setEditing] = useState(!!autoEdit);
  const [draft, setDraft] = useState(value == null ? '' : String(value));
  const inputRef = useRef(null);

  useEffect(() => { setDraft(value == null ? '' : String(value)); }, [value]);

  useLayoutEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      try { inputRef.current.select(); } catch (e) { /* textarea select can fail in some browsers */ }
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    const next = draft;
    const trimmed = multiline ? next.replace(/\s+$/, '') : next.trim();
    const current = value == null ? '' : String(value);
    if (trimmed === current) return;
    if (trimmed === '' && !allowEmpty) {
      setDraft(current);
      return;
    }
    onCommit(trimmed === '' ? null : trimmed);
  }
  function cancel() {
    setDraft(value == null ? '' : String(value));
    setEditing(false);
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    else if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit(); }
    else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
  }

  const baseCls = 'edt' + (asTitle ? ' edt-title' : '') + (mono ? ' edt-mono' : '') + (multiline ? ' edt-multi' : '');

  if (editing) {
    if (multiline) {
      return ec('textarea', {
        ref: inputRef,
        className: baseCls + ' edt-edit',
        value: draft,
        onChange: e => setDraft(e.target.value),
        onBlur: commit,
        onKeyDown: onKey,
        rows: Math.max(2, Math.min(10, draft.split('\n').length + 1)),
      });
    }
    return ec('input', {
      ref: inputRef,
      type: 'text',
      className: baseCls + ' edt-edit',
      value: draft,
      onChange: e => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: onKey,
    });
  }

  const isEmpty = value == null || value === '';
  return ec('span', {
    className: baseCls + (isEmpty ? ' edt-empty' : ''),
    tabIndex: 0,
    role: 'button',
    onClick: () => setEditing(true),
    onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditing(true); } },
    title: 'Click to edit',
  }, isEmpty ? (placeholder || 'Click to add') : String(value));
}

// ── BoolToggle ────────────────────────────────────────────────────────
// Yes / No pair you click to toggle.
function BoolToggle({ value, onCommit }) {
  const v = value === true ? 'yes' : value === false ? 'no' : 'unset';
  return ec('div', { className: 'bool-toggle ' + v },
    ec('button', {
      className: 'bool-opt' + (v === 'yes' ? ' is-on' : ''),
      onClick: () => onCommit(true),
    }, 'Yes'),
    ec('button', {
      className: 'bool-opt' + (v === 'no' ? ' is-on' : ''),
      onClick: () => onCommit(false),
    }, 'No'),
  );
}

// ── Segmented ─────────────────────────────────────────────────────────
// Inline 2–4 way picker. options: [{ value, label }]
function Segmented({ value, options, onCommit, kind }) {
  return ec('div', { className: 'segmented' + (kind ? ' seg-' + kind : '') },
    options.map(opt =>
      ec('button', {
        key: String(opt.value),
        className: 'seg' + (value === opt.value ? ' is-on' : ''),
        onClick: () => onCommit(opt.value),
        title: opt.title || opt.label,
      }, opt.label)
    )
  );
}

// ── EnumPopover ───────────────────────────────────────────────────────
// Clickable display value; opens a small menu of options.
// `optionColor(option)` can return a color string per option — the menu item
// will use it for hover/current background instead of the inspector tint.
function EnumPopover({ value, options, onCommit, formatLabel, allowClear = true, autoOpen, placeholder, optionColor }) {
  const [open, setOpen] = useState(!!autoOpen);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const fmt = formatLabel || (v => String(v).replace(/_/g, ' '));
  const display = value ? fmt(value) : (placeholder || 'Click to set');
  const isEmpty = !value;

  return ec('div', { className: 'enum-pop', ref },
    ec('button', {
      className: 'edt enum-trigger' + (isEmpty ? ' edt-empty' : ''),
      onClick: () => setOpen(o => !o),
    },
      ec('span', { className: 'enum-val' }, display),
      ec('span', { className: 'enum-caret', 'aria-hidden': true }, '▾'),
    ),
    open ? ec('div', { className: 'enum-menu' },
      options.map(opt => {
        const c = optionColor && optionColor(opt);
        return ec('button', {
          key: String(opt),
          className: 'enum-item' + (value === opt ? ' is-current' : ''),
          style: c ? { '--opt-color': c } : undefined,
          onClick: () => { onCommit(opt); setOpen(false); },
        }, fmt(opt));
      }),
      allowClear && value ? ec('button', {
        className: 'enum-item enum-clear',
        onClick: () => { onCommit(null); setOpen(false); },
      }, 'Clear') : null,
    ) : null,
  );
}

// ── AddFieldMenu ──────────────────────────────────────────────────────
// "+ Add field" pill that opens a list of unset fields.
function AddFieldMenu({ unsetFields, onAdd, label = '+ Add field' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!unsetFields || unsetFields.length === 0) return null;
  return ec('div', { className: 'add-field', ref },
    ec('button', {
      className: 'add-field-btn',
      onClick: () => setOpen(o => !o),
    }, label),
    open ? ec('div', { className: 'enum-menu add-field-menu' },
      unsetFields.map(f => ec('button', {
        key: f.key,
        className: 'enum-item',
        onClick: () => { onAdd(f.key); setOpen(false); },
      },
        ec('span', null, f.label),
        f.hint ? ec('span', { className: 'add-field-hint' }, f.hint) : null,
      ))
    ) : null,
  );
}

// ── QuestionListEditor ────────────────────────────────────────────────
// Editable list of strings (used for openQuestions).
function QuestionListEditor({ items, onChange }) {
  const [newKey, setNewKey] = useState(0); // bump to auto-edit the just-added row
  const list = items || [];

  function update(i, v) {
    const next = list.slice();
    if (v == null || v === '') {
      next.splice(i, 1);
    } else {
      next[i] = v;
    }
    onChange(next.length ? next : null);
  }
  function remove(i) {
    const next = list.slice();
    next.splice(i, 1);
    onChange(next.length ? next : null);
  }
  function add() {
    onChange([...list, '']);
    setNewKey(k => k + 1);
  }

  return ec('div', { className: 'q-editor' },
    ec('ul', { className: 'questions-list' },
      list.map((q, i) => ec('li', {
        key: i + '-' + (q ? 'f' : 'e') + '-' + newKey,
        className: 'q-item q-item-edit',
      },
        ec(EditableText, {
          value: q,
          onCommit: v => update(i, v),
          placeholder: 'New question…',
          multiline: true,
          autoEdit: q === '' && i === list.length - 1,
        }),
        ec('button', {
          className: 'q-remove',
          onClick: () => remove(i),
          title: 'Remove',
          'aria-label': 'Remove question',
        }, '×'),
      ))
    ),
    ec('button', { className: 'add-row', onClick: add }, '+ Add question'),
  );
}

window.EditControls = {
  EditableText, BoolToggle, Segmented, EnumPopover, AddFieldMenu, QuestionListEditor,
};
