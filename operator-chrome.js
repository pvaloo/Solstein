/* ============================================================
   Solstein — Operator Chrome
   Renders the topbar + sidebar shared across every Operator
   Console page. The page declares its identity via
   <body data-op-page="users">; this script injects the chrome
   into the .op-shell wrapper.
   ============================================================ */
(function () {
  'use strict';

  var NAV = [
    { section: 'Overview',  items: [
      { id: 'dashboard',     label: 'Dashboard',    href: 'operator-dashboard.html',    gly: '◆' }
    ]},
    { section: 'Manage',    items: [
      { id: 'users',         label: 'Users',        href: 'operator-users.html',        gly: '○', count: '42' },
      { id: 'invitations',   label: 'Invitations',  href: 'operator-invitations.html',  gly: '✉', count: '7' }
    ]}
  ];

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (kids) kids.forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function mount() {
    var shell = document.querySelector('.op-shell');
    if (!shell) return;
    var page = document.body.getAttribute('data-op-page') || '';

    // ----- Topbar -----
    var topbar = el('div', { class: 'op-topbar' });

    var brand = el('div', { class: 'brand' });
    brand.innerHTML =
      '<svg viewBox="0 0 52 52" aria-hidden="true">' +
        '<polygon points="26,4 40,12 44,26 40,40 26,48 12,40 8,26 12,12" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.9"></polygon>' +
        '<polygon points="26,10 36,16 39,26 36,36 26,42 16,36 13,26 16,16" fill="none" stroke="currentColor" stroke-width="0.75" opacity="0.4"></polygon>' +
        '<circle cx="26" cy="26" r="2.5" fill="currentColor"></circle>' +
      '</svg>' +
      '<span>SOLSTEIN</span>';
    topbar.appendChild(brand);

    topbar.appendChild(el('div', { class: 'op-badge', text: 'Operator' }));
    topbar.appendChild(el('span', { class: 'url', text: 'operator.solstein.app' }));
    topbar.appendChild(el('div', { class: 'spacer' }));

    var user = el('div', { class: 'user' });
    user.innerHTML =
      '<div class="avatar">JM</div>' +
      '<span>James Mitchell</span>' +
      '<span style="color: var(--sol-text-3); font-family: var(--font-display); font-size: 10px; letter-spacing: 0.2em; margin-left: 4px;">OP</span>';
    topbar.appendChild(user);

    // ----- Sidebar -----
    var side = el('aside', { class: 'op-side' });
    NAV.forEach(function (group) {
      side.appendChild(el('div', { class: 'section', text: '§ ' + group.section }));
      group.items.forEach(function (item) {
        var a = el('a', { href: item.href });
        if (item.id === page) a.className = 'is-here';
        a.appendChild(el('span', { class: 'gly', text: item.gly }));
        a.appendChild(document.createTextNode(item.label));
        if (item.count) a.appendChild(el('span', { class: 'count', text: item.count }));
        side.appendChild(a);
      });
    });

    // ----- Insert at start of shell -----
    shell.insertBefore(side,   shell.firstChild);
    shell.insertBefore(topbar, shell.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }
})();
