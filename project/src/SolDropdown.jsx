/* global React */
/* Solstein dropdown — React wrapper around the vanilla listbox component.
   Renders the .sol-dropdown markup, then hands control to window.SolDropdown.init.
   Exports SolDropdown to window so other Babel-transpiled scripts can use it. */

const { useEffect, useRef } = React;

function SolDropdown({ value, onChange, options, small, placeholder, className }) {
  const ref = useRef(null);

  // Mount: initialise the vanilla controller, listen for change events.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    function handle(e) { onChange && onChange(e.detail.value); }
    root.addEventListener('sol-dropdown:change', handle);
    if (window.SolDropdown && window.SolDropdown.init) {
      window.SolDropdown.init(root);
    }
    return () => root.removeEventListener('sol-dropdown:change', handle);
    // mount only — React will keep aria-selected and text in sync via re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep data-value in sync with prop changes so the vanilla controller agrees.
  useEffect(() => {
    if (ref.current) ref.current.dataset.value = value || '';
  }, [value]);

  const selected = options.find(o => o.value === value);
  const displayLabel = selected ? selected.label : (placeholder || '');

  return React.createElement('div', {
    ref: ref,
    className: 'sol-dropdown' + (small ? ' sol-dropdown--sm' : '') + (className ? ' ' + className : ''),
    'data-value': value || '',
  },
    React.createElement('button', {
      type: 'button',
      className: 'sol-dropdown-trigger',
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false',
    },
      React.createElement('span', { className: 'sol-dropdown-value' }, displayLabel),
      React.createElement('svg', {
        className: 'sol-dropdown-chev',
        viewBox: '0 0 12 12',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '1.25',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
        React.createElement('polyline', { points: '3,5 6,8 9,5' })
      )
    ),
    React.createElement('ul', { className: 'sol-dropdown-list', role: 'listbox' },
      options.map(o => React.createElement('li', {
        key: o.value,
        role: 'option',
        'data-value': o.value,
        'aria-selected': String(o.value === value),
      }, o.label))
    )
  );
}

window.SolDropdown = window.SolDropdown || {};
window.SolDropdown.React = SolDropdown;
window.SolDropdownReact = SolDropdown;
