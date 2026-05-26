/* ─── Solstein Toast · runtime ──────────────────────────────────── */
(function () {
  function ensureStack() {
    var stack = document.querySelector('.sol-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'sol-toast-stack';
      stack.setAttribute('aria-live', 'polite');
      stack.setAttribute('role', 'status');
      document.body.appendChild(stack);
    }
    return stack;
  }

  function buildIcon(kind) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', 'M4 4l8 8M12 4l-8 8');
    svg.appendChild(p);
    return svg;
  }

  function solToast(opts) {
    opts = opts || {};
    var stack = ensureStack();

    var toast = document.createElement('div');
    toast.className = 'sol-toast' + (opts.kind === 'risk' ? ' is-risk' : '');

    var msg = document.createElement('div');
    msg.className = 'st-msg';
    if (opts.msg instanceof Node) msg.appendChild(opts.msg);
    else msg.innerHTML = String(opts.msg || '');
    toast.appendChild(msg);

    var actionBtn = null;
    if (opts.action) {
      actionBtn = document.createElement('button');
      actionBtn.className = 'st-action';
      actionBtn.type = 'button';
      actionBtn.textContent = opts.action;
      actionBtn.addEventListener('click', function () {
        if (typeof opts.onAction === 'function') opts.onAction(dismiss);
        else dismiss();
      });
      toast.appendChild(actionBtn);
    }

    var closeBtn = document.createElement('button');
    closeBtn.className = 'st-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.appendChild(buildIcon('x'));
    closeBtn.addEventListener('click', function () { dismiss(); });
    toast.appendChild(closeBtn);

    stack.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('is-in'); });

    var duration = opts.duration == null ? 10000 : opts.duration;
    var timer = null;
    var remaining = duration;
    var startedAt = Date.now();

    function startTimer() {
      if (duration === 0 || duration == null) return;
      startedAt = Date.now();
      timer = setTimeout(dismiss, remaining);
    }
    function pauseTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        remaining -= (Date.now() - startedAt);
      }
    }
    function dismiss() {
      if (timer) clearTimeout(timer);
      toast.classList.remove('is-in');
      toast.classList.add('is-out');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 220);
    }

    toast.addEventListener('mouseenter', pauseTimer);
    toast.addEventListener('mouseleave', startTimer);
    startTimer();

    return dismiss;
  }

  window.solToast = solToast;
})();
