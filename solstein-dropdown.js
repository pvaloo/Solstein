/* ============================================================
   Solstein — custom listbox dropdown
   Replaces native <select> across Solstein surfaces. Plain JS,
   no framework dependency. Auto-initialises on DOMContentLoaded
   and exposes window.SolDropdown.init(root) for dynamically-
   added widgets.

   Contract:
   - Root:   <div class="sol-dropdown" data-value="...">
   - Trigger: <button class="sol-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false">
              + .sol-dropdown-value + .sol-dropdown-chev
   - List:    <ul class="sol-dropdown-list" role="listbox" hidden>
              <li role="option" data-value="..." aria-selected="true|false">
   - Fires:   'sol-dropdown:change' { detail: { value } } on the root.
   ============================================================ */
(function () {
  function init(scope) {
    (scope || document).querySelectorAll('.sol-dropdown').forEach(function (root) {
      if (root.dataset.solInit === '1') return;
      root.dataset.solInit = '1';
      wire(root);
    });
  }

  function wire(root) {
    var trigger = root.querySelector('.sol-dropdown-trigger');
    var list    = root.querySelector('.sol-dropdown-list');
    var valueEl = root.querySelector('.sol-dropdown-value');
    if (!trigger || !list) return;

    var activeIndex = -1;

    function items() {
      return Array.prototype.slice.call(
        list.querySelectorAll('[role="option"]:not([aria-disabled="true"])')
      );
    }

    function setValue(v, silent) {
      root.dataset.value = v;
      var all = list.querySelectorAll('[role="option"]');
      var match = null;
      Array.prototype.forEach.call(all, function (o) {
        var on = (o.dataset.value === v);
        o.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) match = o;
      });
      if (valueEl) valueEl.textContent = match ? (match.dataset.label || match.textContent.trim()) : '';
      if (!silent) {
        root.dispatchEvent(new CustomEvent('sol-dropdown:change', {
          bubbles: true, detail: { value: v }
        }));
      }
    }

    function open() {
      if (root.classList.contains('is-open')) return;
      // close any other open dropdown
      document.querySelectorAll('.sol-dropdown.is-open').forEach(function (d) {
        if (d !== root) {
          d.classList.remove('is-open');
          var t = d.querySelector('.sol-dropdown-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      flipIfNeeded();
      var sel = list.querySelector('[aria-selected="true"]');
      var all = items();
      var i = sel ? all.indexOf(sel) : -1;
      setActive(i >= 0 ? i : 0);
    }
    function close() {
      if (!root.classList.contains('is-open')) return;
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      setActive(-1);
    }
    function toggle() { root.classList.contains('is-open') ? close() : open(); }

    function setActive(i) {
      var all = items();
      all.forEach(function (li) { li.classList.remove('is-active'); });
      if (i < 0 || all.length === 0) { activeIndex = -1; return; }
      activeIndex = Math.max(0, Math.min(i, all.length - 1));
      var el = all[activeIndex];
      if (el) {
        el.classList.add('is-active');
        if (typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'nearest' });
        }
      }
    }

    function flipIfNeeded() {
      var r = trigger.getBoundingClientRect();
      var spaceBelow = window.innerHeight - r.bottom;
      var spaceAbove = r.top;
      list.classList.toggle('is-above', spaceBelow < 240 && spaceAbove > spaceBelow);
    }

    trigger.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });

    trigger.addEventListener('keydown', function (e) {
      var isOpen = root.classList.contains('is-open');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) open();
        else setActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) open();
        else setActive(activeIndex - 1);
      } else if (e.key === 'Home') {
        if (isOpen) { e.preventDefault(); setActive(0); }
      } else if (e.key === 'End') {
        if (isOpen) { e.preventDefault(); setActive(items().length - 1); }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen) { open(); return; }
        var el = items()[activeIndex];
        if (el) { setValue(el.dataset.value); close(); }
      } else if (e.key === 'Escape') {
        if (isOpen) { e.preventDefault(); close(); }
      } else if (e.key === 'Tab') {
        close();
      }
    });

    list.addEventListener('click', function (e) {
      var opt = e.target.closest('[role="option"]');
      if (!opt || opt.getAttribute('aria-disabled') === 'true') return;
      setValue(opt.dataset.value);
      close();
      trigger.focus();
    });

    list.addEventListener('mousemove', function (e) {
      var opt = e.target.closest('[role="option"]');
      if (!opt) return;
      var all = items();
      var i = all.indexOf(opt);
      if (i >= 0 && i !== activeIndex) setActive(i);
    });

    document.addEventListener('click', function (e) {
      if (!root.contains(e.target) && root.classList.contains('is-open')) close();
    });
    window.addEventListener('resize', close);
    window.addEventListener('scroll', function () { if (root.classList.contains('is-open')) close(); }, true);

    // Seed value from data-value or the aria-selected option
    var seeded = root.dataset.value;
    if (!seeded) {
      var sel = list.querySelector('[aria-selected="true"]');
      seeded = sel ? sel.dataset.value : null;
    }
    if (seeded) setValue(seeded, true);
  }

  // Auto-init on DOM ready
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', function () { init(); });

  window.SolDropdown = window.SolDropdown || {};
  window.SolDropdown.init = init;
})();
