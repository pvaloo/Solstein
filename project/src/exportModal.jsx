/* global React, renderCanvasPng, renderCanvasPdf */
const { useEffect, useRef, useState } = React;

// Compact icon helpers (16x16 stroke-based, currentColor)
const _stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
function _svg(children, size = 18) {
  return React.createElement('svg', { width: size, height: size, viewBox: '0 0 16 16' }, children);
}

const EXPORT_ICONS = {
  png: () => _svg([
    React.createElement('rect', { key: 'a', x: 2, y: 3, width: 12, height: 10, rx: 1.2, ..._stroke }),
    React.createElement('path', { key: 'b', d: 'M2 11l3.5-3.5L8 10l2.5-2.5L14 11', ..._stroke }),
    React.createElement('circle', { key: 'c', cx: 11, cy: 6, r: 1, fill: 'currentColor' }),
  ]),
  pdf: () => _svg([
    React.createElement('path', { key: 'a', d: 'M4 2h6l3 3v9H4z', ..._stroke }),
    React.createElement('path', { key: 'b', d: 'M10 2v3h3', ..._stroke }),
    React.createElement('path', { key: 'c', d: 'M6 8.5h1.2a.9.9 0 0 1 0 1.8H6V12M9 12V8.5h1a1.4 1.4 0 0 1 1.4 1.4v.7A1.4 1.4 0 0 1 10 12z', ..._stroke, strokeWidth: 1.2 }),
  ]),
};

const SCOPE_OPTS = [
  { id: 'view', label: 'Current view',  desc: 'WYSIWYG — pan, zoom, and lenses preserved.' },
  { id: 'full', label: 'Full graph',    desc: 'Auto-fit to all visible nodes with a 48px margin.' },
];
const DPR_OPTS = [
  { id: 1, label: '1×' },
  { id: 2, label: '2×' },
  { id: 3, label: '3×' },
  { id: 4, label: '4×' },
];
const BG_OPTS = [
  { id: 'ground', label: 'Canvas ground' },
  { id: 'white',  label: 'White' },
  { id: 'transparent', label: 'Transparent', pngOnly: true },
];

function ExportModal({ open, onClose, data, activeViewId, activeOverlays }) {
  const dialogRef = useRef(null);

  // Options state — persists across re-opens for the lifetime of the page.
  const [scope, setScope] = useState('view');
  const [dpr, setDpr] = useState(2);
  const [bg, setBg] = useState('ground');
  const [titleBlock, setTitleBlock] = useState(true);

  // Busy state — disables both primary buttons while a render is in flight.
  const [busy, setBusy] = useState(null); // null | 'png' | 'pdf'
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null); // { kind, filename, sizeKb }

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape' && !busy) onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, busy]);

  // Clear status whenever the modal is re-opened.
  useEffect(() => {
    if (open) {
      setError(null);
      setLastResult(null);
    }
  }, [open]);

  // Auto-correct transparent + PDF (transparent has no meaning in PDF rasters).
  const effectiveBg = bg;

  function buildMeta() {
    return {
      projectName: (data && data.project && data.project.name) || 'Untitled project',
      viewLabel:   activeViewId ? _viewLabel(data, activeViewId) : 'Combined',
      version:     (data && data.project && data.project.version) || '',
      exportedAt:  new Date(),
      titleBlock,
    };
  }

  function buildOpts(forPdf) {
    let resolvedBg = effectiveBg;
    if (forPdf && resolvedBg === 'transparent') resolvedBg = 'white';
    return { scope, dpr, background: resolvedBg, padding: 48 };
  }

  async function handlePng() {
    if (busy) return;
    setBusy('png'); setError(null);
    try {
      const out = await renderCanvasPng(buildOpts(false), buildMeta());
      setLastResult({ kind: 'PNG', filename: out.filename, sizeKb: Math.round(out.blob.size / 1024) });
    } catch (err) {
      console.error('PNG export failed', err);
      setError('PNG export failed. ' + (err && err.message ? err.message : ''));
    } finally {
      setBusy(null);
    }
  }

  async function handlePdf() {
    if (busy) return;
    setBusy('pdf'); setError(null);
    try {
      const out = await renderCanvasPdf(buildOpts(true), buildMeta());
      setLastResult({ kind: 'PDF', filename: out.filename, sizeKb: Math.round(out.blob.size / 1024) });
    } catch (err) {
      console.error('PDF export failed', err);
      setError('PDF export failed. ' + (err && err.message ? err.message : ''));
    } finally {
      setBusy(null);
    }
  }

  const SoonChips = ['SVG', 'Markdown', 'Figma'];

  return React.createElement('div', {
    className: 'export-overlay' + (open ? ' is-open' : ''),
    onClick: (e) => { if (e.target === e.currentTarget && !busy) onClose(); },
    'aria-hidden': !open,
  },
    React.createElement('div', {
      className: 'export-modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'export-title',
      ref: dialogRef,
    },
      // ── Head ──────────────────────────────────────────────────────
      React.createElement('div', { className: 'export-head' },
        React.createElement('div', { className: 'export-kicker' }, 'Export'),
        React.createElement('h2', { id: 'export-title', className: 'export-title' }, 'Take this canvas with you'),
        React.createElement('p', { className: 'export-sub' },
          'A snapshot of the current canvas — overlays, lens, and view preserved.'
        ),
        React.createElement('button', {
          className: 'export-close',
          onClick: onClose,
          disabled: !!busy,
          'aria-label': 'Close export panel',
          title: 'Close (Esc)',
        },
          React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' },
            React.createElement('path', { d: 'M4 4l8 8M12 4l-8 8' }),
          )
        ),
      ),

      // ── Primary pair: PNG + PDF ──────────────────────────────────
      React.createElement('div', { className: 'export-primary-pair' },
        _PrimaryCard({
          id: 'png',
          icon: EXPORT_ICONS.png(),
          title: 'PNG Image',
          desc: 'Crisp raster at your chosen scale. Drop into Slack, Notion, Figma, decks.',
          isPrimary: true,
          onClick: handlePng,
          busy: busy === 'png',
          disabled: !!busy && busy !== 'png',
        }),
        _PrimaryCard({
          id: 'pdf',
          icon: EXPORT_ICONS.pdf(),
          title: 'PDF',
          desc: 'Single page. Title block + the same image. Print-ready.',
          isPrimary: false,
          onClick: handlePdf,
          busy: busy === 'pdf',
          disabled: !!busy && busy !== 'pdf',
        }),
      ),

      // ── Options ──────────────────────────────────────────────────
      React.createElement('div', { className: 'export-options' },
        _OptRow({
          label: 'Scope',
          value: scope, onChange: setScope,
          options: SCOPE_OPTS.map(o => ({ id: o.id, label: o.label })),
          help: (SCOPE_OPTS.find(s => s.id === scope) || {}).desc,
        }),
        _OptRow({
          label: 'Resolution',
          value: dpr, onChange: (v) => setDpr(Number(v)),
          options: DPR_OPTS,
        }),
        _OptRow({
          label: 'Background',
          value: bg, onChange: setBg,
          options: BG_OPTS.map(o => ({ id: o.id, label: o.label })),
          help: bg === 'transparent' ? 'PDF will fall back to white (no transparency).' : null,
        }),
        _ToggleRow({
          label: 'Title block (PDF)',
          value: titleBlock,
          onChange: setTitleBlock,
          help: 'Adds project name, view, and date to the top of the PDF page.',
        }),
      ),

      // ── Status / error / last result ─────────────────────────────
      (busy || error || lastResult) && React.createElement('div', { className: 'export-status' + (error ? ' is-error' : (lastResult ? ' is-ok' : ' is-busy')) },
        busy && React.createElement('span', { className: 'es-msg' },
          React.createElement('span', { className: 'es-spinner' }),
          'Rendering ' + (busy === 'png' ? 'PNG' : 'PDF') + '…'
        ),
        !busy && error && React.createElement('span', { className: 'es-msg' }, '✕ ', error),
        !busy && !error && lastResult && React.createElement('span', { className: 'es-msg' },
          '✓ ', lastResult.kind, ' downloaded',
          React.createElement('span', { className: 'es-meta' },
            ' · ', lastResult.filename, ' · ', lastResult.sizeKb, ' KB'
          )
        ),
      ),

      // ── Coming soon chip row ─────────────────────────────────────
      React.createElement('div', { className: 'export-soon' },
        React.createElement('span', { className: 'export-soon-lbl' }, 'Coming soon'),
        React.createElement('span', { className: 'export-soon-row' },
          SoonChips.map(name =>
            React.createElement('span', { key: name, className: 'export-soon-chip', title: name + ' — coming soon' }, name)
          )
        ),
      ),

      // ── Footer ───────────────────────────────────────────────────
      React.createElement('div', { className: 'export-foot' },
        React.createElement('span', { className: 'export-foot-meta' },
          React.createElement('strong', null, data.nodes.length), ' nodes · ',
          React.createElement('strong', null, data.edges.length), ' edges · ',
          React.createElement('strong', null, data.evidence.length), ' evidence'
        ),
        React.createElement('span', { className: 'export-kbd' }, 'Esc to close'),
      ),
    ),
  );
}

// ────────────────────────────────────────────────────────────────────
// Subcomponents
// ────────────────────────────────────────────────────────────────────
function _PrimaryCard({ id, icon, title, desc, isPrimary, onClick, busy, disabled }) {
  return React.createElement('button', {
    className: 'export-pcard'
      + (isPrimary ? ' is-primary' : ' is-secondary')
      + (busy ? ' is-busy' : '')
      + (disabled ? ' is-disabled' : ''),
    onClick,
    disabled: !!busy || !!disabled,
    'data-action': id,
  },
    React.createElement('div', { className: 'epc-icon' }, icon),
    React.createElement('div', { className: 'epc-title' }, title),
    React.createElement('div', { className: 'epc-desc' }, desc),
    React.createElement('div', { className: 'epc-cta' },
      React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
        React.createElement('path', { d: 'M8 2v9M4.5 7.5L8 11l3.5-3.5M3 13.5h10' }),
      ),
      busy ? 'Rendering…' : 'Download',
    ),
  );
}

function _OptRow({ label, value, onChange, options, help }) {
  return React.createElement('div', { className: 'eopt-row' },
    React.createElement('span', { className: 'eopt-lbl' }, label),
    React.createElement('span', { className: 'eopt-seg' },
      options.map(o => React.createElement('button', {
        key: o.id,
        type: 'button',
        className: 'eopt-pill' + (String(value) === String(o.id) ? ' is-on' : ''),
        onClick: () => onChange(o.id),
      }, o.label)),
    ),
    help && React.createElement('span', { className: 'eopt-help' }, help),
  );
}

function _ToggleRow({ label, value, onChange, help }) {
  return React.createElement('div', { className: 'eopt-row' },
    React.createElement('span', { className: 'eopt-lbl' }, label),
    React.createElement('button', {
      type: 'button',
      className: 'eopt-toggle' + (value ? ' is-on' : ''),
      onClick: () => onChange(!value),
      role: 'switch',
      'aria-checked': value,
    },
      React.createElement('span', { className: 'eot-knob' }),
      React.createElement('span', { className: 'eot-text' }, value ? 'On' : 'Off'),
    ),
    help && React.createElement('span', { className: 'eopt-help' }, help),
  );
}

function _viewLabel(data, viewId) {
  if (!data || !data.views) return '';
  const v = data.views.find(x => x.id === viewId);
  return v ? v.label : '';
}

window.ExportModal = ExportModal;
