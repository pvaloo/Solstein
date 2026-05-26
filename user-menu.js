/* ============================================================
   Solstein — User Menu
   Renders the avatar/name chip in the topbar as a dropdown
   (Profile / Sign out). Each page declares the markup; this
   script wires up click, escape, and outside-click to close.

   Required DOM:
     <div class="user-menu" id="userMenu">
       <button class="user-chip" id="userMenuTrigger" type="button"
               aria-haspopup="menu" aria-expanded="false">…</button>
       <div class="user-menu-pop" role="menu" aria-labelledby="userMenuTrigger">…</div>
     </div>
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var root = document.getElementById('userMenu');
    if (!root) return;
    var trigger = document.getElementById('userMenuTrigger');
    if (!trigger) return;

    function open() {
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      root.classList.contains('is-open') ? close() : open();
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target) && root.classList.contains('is-open')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        close();
        trigger.focus();
      }
    });
    // Close after any menu item click
    root.querySelectorAll('.um-item').forEach(function (b) {
      b.addEventListener('click', function () { close(); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
