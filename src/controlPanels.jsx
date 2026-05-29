/* global React, NodeIcon */

const { useState, useRef, useEffect } = React;
const ch = React.createElement;

// Outside-click hook
function useOutsideClick(ref, handler, enabled) {
  useEffect(() => {
    if (!enabled) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler(e);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [enabled, handler]);
}

// ── Trigger chip ─────────────────────────────────────────────────────
function Chip({ icon, label, summary, accent, open, onToggle }) {
  return ch('button', {
    className: 'ctrl-trigger' + (open ? ' is-open' : ''),
    onClick: onToggle,
    style: accent ? { '--chip-accent': accent } : null,
  },
    icon ? ch('span', { className: 'tc-icon' }, icon) : null,
    ch('span', { className: 'tc-label' }, label),
    summary ? ch('span', { className: 'tc-sum' }, summary) : null,
    ch('span', { className: 'tc-chev' },
      ch('svg', { width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' },
        ch('path', { d: 'M2 4l3 3 3-3' })
      )
    )
  );
}

// ── Panel shell ──────────────────────────────────────────────────────
function Panel({ open, children, width = 280 }) {
  return ch('div', {
    className: 'ctrl-panel' + (open ? ' is-open' : ''),
    style: { width },
  }, children);
}

function PanelHeader({ kicker, title, action }) {
  return ch('div', { className: 'ctrl-panel-head' },
    ch('div', { className: 'ctrl-kicker' }, kicker),
    ch('div', { className: 'ctrl-title' }, title),
    action || null
  );
}

// ── Views panel ──────────────────────────────────────────────────────
const VIEW_DESCRIPTIONS = {
  combined_view:    'All node and edge types, no filter.',
  journey_view:     'Actors, processes, decisions, states, outputs.',
  technical_view:   'Apps, APIs, databases, integrations.',
  data_lineage_view:'Data objects, stores, transformations, BI.',
  risk_view:        'Fragility, manual work, unknowns, exposure.',
};

function ViewsGroup({ views, activeViewId, onViewChange, open, onToggle }) {
  const ref = useRef(null);
  useOutsideClick(ref, () => onToggle(false), open);
  const viewList = [
    { id: 'combined_view', label: 'Combined View' },
    ...views,
  ];
  const active = viewList.find(v => (activeViewId || 'combined_view') === v.id);
  return ch('div', { className: 'ctrl-group', ref },
    ch(Chip, {
      label: 'Views',
      summary: active.label.replace(' View', '').replace('Architecture', 'Arch'),
      open,
      onToggle: () => onToggle(!open),
    }),
    ch(Panel, { open },
      ch(PanelHeader, { kicker: 'Lens', title: 'Views over the graph' }),
      ch('div', { className: 'ctrl-list' },
        viewList.map(v => {
          const isActive = (activeViewId || 'combined_view') === v.id;
          return ch('button', {
            key: v.id,
            className: 'ctrl-item' + (isActive ? ' is-active' : ''),
            onClick: () => { onViewChange(v.id === 'combined_view' ? null : v.id); onToggle(false); },
          },
            ch('span', { className: 'ctrl-item-dot' }),
            ch('span', { className: 'ctrl-item-body' },
              ch('span', { className: 'ctrl-item-title' }, v.label),
              ch('span', { className: 'ctrl-item-sub' }, VIEW_DESCRIPTIONS[v.id] || '')
            )
          );
        })
      )
    )
  );
}

// ── Lenses panel ─────────────────────────────────────────────────────
const OVERLAY_COLORS = {
  pii: 'var(--pii)',
  manual_process: 'var(--manual)',
  unknowns: 'var(--text-3)',
  high_risk: 'var(--risk)',
  system_of_record: 'var(--sor)',
};

function LensesGroup({ overlays, activeOverlays, onToggleOverlay, open, onToggle }) {
  const ref = useRef(null);
  useOutsideClick(ref, () => onToggle(false), open);
  const count = activeOverlays.size;
  return ch('div', { className: 'ctrl-group', ref },
    ch(Chip, {
      label: 'Lenses',
      summary: count === 0 ? 'None' : count === 1 ? '1 active' : `${count} active`,
      open,
      onToggle: () => onToggle(!open),
    }),
    ch(Panel, { open },
      ch(PanelHeader, { kicker: 'Highlight', title: 'Semantic overlays', action: count > 0 ? ch('button', {
        className: 'ctrl-clear',
        onClick: () => activeOverlays.forEach(id => onToggleOverlay(id)),
      }, 'Clear') : null }),
      ch('div', { className: 'ctrl-list' },
        overlays.map(o => {
          const isActive = activeOverlays.has(o.id);
          const color = OVERLAY_COLORS[o.id] || 'var(--accent)';
          return ch('button', {
            key: o.id,
            className: 'ctrl-item' + (isActive ? ' is-active' : ''),
            style: { '--item-accent': color },
            onClick: () => onToggleOverlay(o.id),
          },
            ch('span', { className: 'ctrl-toggle' },
              ch('span', { className: 'ctrl-toggle-fill' })
            ),
            ch('span', { className: 'ctrl-item-body' },
              ch('span', { className: 'ctrl-item-title' }, o.label),
              ch('span', { className: 'ctrl-item-sub' }, o.description || '')
            )
          );
        })
      )
    )
  );
}

// ── Scenarios panel (with replay controls) ───────────────────────────
function ScenariosGroup({ replay, open, onToggle }) {
  const ref = useRef(null);
  useOutsideClick(ref, () => onToggle(false), open);
  const { scenarios, scenarioId, setScenarioId, scenario, steps, stepIdx, playing, play, pause, reset, stepForward, stepBack } = replay;
  const progress = steps.length > 0 ? Math.max(0, (stepIdx + 1) / steps.length) : 0;
  const hasScenario = !!scenario;

  return ch('div', { className: 'ctrl-group', ref },
    ch(Chip, {
      label: 'Scenarios',
      summary: hasScenario ? scenario.label.split('—')[0].trim() : 'None',
      open,
      onToggle: () => onToggle(!open),
    }),
    ch(Panel, { open, width: 340 },
      ch(PanelHeader, {
        kicker: 'Replay',
        title: hasScenario ? scenario.label : 'Scenarios',
        action: hasScenario ? ch('button', {
          className: 'ctrl-clear',
          onClick: () => { reset(); setScenarioId(null); },
        }, 'Clear') : null,
      }),
      hasScenario && scenario.description
        ? ch('div', { className: 'ctrl-panel-desc' }, scenario.description)
        : null,

      // Empty state when no scenario is selected
      !hasScenario ? ch('div', { className: 'ctrl-panel-desc', style: { color: 'var(--text-3)', fontStyle: 'italic' } },
        'Choose a scenario below to replay an operational journey across the graph.'
      ) : null,

      // Transport controls — only when a scenario is active
      hasScenario ? ch('div', { className: 'ctrl-transport' },
        ch('div', { className: 'ctrl-controls' },
          ch('button', { className: 'tbtn', onClick: reset, title: 'Reset' },
            ch('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
              ch('path', { d: 'M3 2h2v12H3z' }),
              ch('path', { d: 'M14 2L6 8l8 6z' }),
            )
          ),
          ch('button', { className: 'tbtn', onClick: stepBack, title: 'Step back' },
            ch('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
              ch('path', { d: 'M5 8L13 3v10z' }),
              ch('path', { d: 'M3 3h1.5v10H3z' }),
            )
          ),
          ch('button', {
            className: 'tbtn play' + (playing ? ' is-playing' : ''),
            onClick: playing ? pause : play,
            title: playing ? 'Pause' : 'Play',
          },
            playing
              ? ch('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
                  ch('rect', { x: 4, y: 3, width: 3, height: 10 }),
                  ch('rect', { x: 9, y: 3, width: 3, height: 10 }),
                )
              : ch('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
                  ch('path', { d: 'M4 3l9 5-9 5z' })
                )
          ),
          ch('button', { className: 'tbtn', onClick: stepForward, title: 'Step forward' },
            ch('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
              ch('path', { d: 'M11 8L3 3v10z' }),
              ch('path', { d: 'M11.5 3H13v10h-1.5z' }),
            )
          ),
        ),
        ch('div', { className: 'ctrl-step' },
          ch('strong', null, Math.max(0, stepIdx + 1)),
          ' / ', steps.length
        ),
      ) : null,
      hasScenario ? ch('div', { className: 'ctrl-progress' },
        ch('div', { className: 'ctrl-progress-bar', style: { width: `${progress * 100}%` } })
      ) : null,

      // Scenario picker
      ch('div', { className: 'ctrl-subhead' }, hasScenario ? 'Other scenarios' : 'Available scenarios'),
      ch('div', { className: 'ctrl-list' },
        scenarios.map(s => {
          const isActive = s.id === scenarioId;
          return ch('button', {
            key: s.id,
            className: 'ctrl-item' + (isActive ? ' is-active' : ''),
            onClick: () => { setScenarioId(s.id); },
          },
            ch('span', { className: 'ctrl-item-dot' }),
            ch('span', { className: 'ctrl-item-body' },
              ch('span', { className: 'ctrl-item-title' }, s.label),
              ch('span', { className: 'ctrl-item-sub' }, `${s.steps.length} steps`)
            )
          );
        })
      ),
    )
  );
}

// ── Main stack ───────────────────────────────────────────────────────
function ControlPanels({ views, overlays, activeViewId, onViewChange, activeOverlays, onToggleOverlay, replay }) {
  const [open, setOpen] = useState(null); // null | 'views' | 'lenses'

  // Esc to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return ch('div', { className: 'control-stack' },
    ch(ViewsGroup, {
      views, activeViewId, onViewChange,
      open: open === 'views',
      onToggle: (v) => setOpen(v ? 'views' : null),
    }),
    ch(LensesGroup, {
      overlays, activeOverlays, onToggleOverlay,
      open: open === 'lenses',
      onToggle: (v) => setOpen(v ? 'lenses' : null),
    }),
  );
}

window.ControlPanels = ControlPanels;
