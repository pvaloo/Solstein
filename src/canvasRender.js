/* ============================================================
   Solstein — Canvas Renderer
   Pure async functions that snapshot the canvas DOM to a PNG
   Blob, or wrap that PNG into a single-page PDF.

   The canvas is HTML-over-SVG (node cards = <div>, edges =
   <svg>), so we use html-to-image (loaded globally as
   `htmlToImage`) rather than a naive SVG serialise.

   Exposes:
     await renderCanvasPng(opts) → { blob, width, height }
     await renderCanvasPdf(opts, meta) → { blob }

   opts = {
     scope: 'view' | 'full' | 'selection',
     dpr: 1 | 2 | 3 | 4,
     background: 'ground' | 'white' | 'transparent',
     padding: number   // px, full-graph scope only
   }
   meta = {
     projectName, viewLabel, version, exportedAt (Date)
   }
   ============================================================ */
(function (global) {
  'use strict';

  const SELECTOR_WRAP  = '.canvas-wrap';
  const SELECTOR_STAGE = '.canvas-wrap .stage';
  const MAX_EDGE_PX    = 8192;

  // ---------- Helpers --------------------------------------------------
  function _query(sel) {
    const el = document.querySelector(sel);
    if (!el) throw new Error('canvasRender: element not found: ' + sel);
    return el;
  }

  function _resolveBackground(mode) {
    // Returns a CSS color string, or null for transparent.
    if (mode === 'transparent') return null;
    if (mode === 'white') return '#ffffff';
    // 'ground' — match the canvas ground tone the user sees.
    const wrap = document.querySelector(SELECTOR_WRAP);
    if (wrap) {
      const bg = getComputedStyle(wrap).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    }
    // Fall back to the design-system ground variable.
    const probe = document.createElement('div');
    probe.style.cssText = 'background: var(--sol-ground, var(--ground, #f4ede2));';
    document.body.appendChild(probe);
    const bg = getComputedStyle(probe).backgroundColor || '#f4ede2';
    document.body.removeChild(probe);
    return bg;
  }

  function _capDpr(naturalWidth, naturalHeight, dpr) {
    const long = Math.max(naturalWidth, naturalHeight);
    if (long * dpr <= MAX_EDGE_PX) return dpr;
    return Math.max(1, MAX_EDGE_PX / long);
  }

  function _filename(meta, ext) {
    const slug = (s) => String(s || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const d = meta && meta.exportedAt instanceof Date ? meta.exportedAt : new Date();
    const ts = d.getFullYear()
      + String(d.getMonth() + 1).padStart(2, '0')
      + String(d.getDate()).padStart(2, '0')
      + '-'
      + String(d.getHours()).padStart(2, '0')
      + String(d.getMinutes()).padStart(2, '0');
    const parts = [slug(meta && meta.projectName) || 'solstein', slug(meta && meta.viewLabel), ts].filter(Boolean);
    return parts.join('-') + '.' + ext;
  }

  function _triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  // Convert a data URL → Blob without going through fetch (more reliable
  // in sandboxed iframes).
  function _dataUrlToBlob(dataUrl) {
    const [meta, b64] = dataUrl.split(',');
    const mime = (meta.match(/data:([^;]+)/) || [])[1] || 'application/octet-stream';
    const bin = atob(b64);
    const len = bin.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  // ---------- Core: capture --------------------------------------------
  // Returns { blob, width, height } for a PNG.
  async function _capture(opts) {
    if (!global.htmlToImage) {
      throw new Error('html-to-image library is not loaded.');
    }
    await (document.fonts && document.fonts.ready);

    const scope = (opts && opts.scope) || 'view';
    const dpr = Math.max(1, Math.min(4, (opts && opts.dpr) || 2));
    const padding = (opts && typeof opts.padding === 'number') ? opts.padding : 48;
    const backgroundColor = _resolveBackground((opts && opts.background) || 'ground');

    let target, naturalWidth, naturalHeight;
    let restore = () => {};

    if (scope === 'full') {
      // Reset stage transform so html-to-image captures the full graph at
      // identity scale; capture the stage element directly (it already
      // sizes to fit content via stageBounds in canvas.jsx).
      const stage = _query(SELECTOR_STAGE);
      const prevTransform = stage.style.transform;
      const prevTransition = stage.style.transition;
      stage.style.transition = 'none';
      stage.style.transform = 'translate(0,0) scale(1)';
      // Force reflow so html-to-image sees the new layout.
      // eslint-disable-next-line no-unused-expressions
      stage.offsetHeight;
      restore = () => {
        stage.style.transform = prevTransform;
        // Re-enable transitions on the next frame to avoid a snap-back animation.
        requestAnimationFrame(() => { stage.style.transition = prevTransition; });
      };
      const rect = stage.getBoundingClientRect();
      target = stage;
      naturalWidth  = Math.max(rect.width,  parseFloat(stage.style.width)  || 0);
      naturalHeight = Math.max(rect.height, parseFloat(stage.style.height) || 0);
      // Add visual padding via the html-to-image `width/height` + style.
    } else {
      // 'view' (default) — WYSIWYG: whatever the user sees in the canvas frame.
      target = _query(SELECTOR_WRAP);
      const rect = target.getBoundingClientRect();
      naturalWidth = rect.width;
      naturalHeight = rect.height;
    }

    const effectiveDpr = _capDpr(naturalWidth, naturalHeight, dpr);

    const captureOpts = {
      pixelRatio: effectiveDpr,
      cacheBust: true,
      // Skip chrome corners + the edit pill — they're decorative.
      filter: (node) => {
        if (!(node instanceof Element)) return true;
        if (node.classList && (
          node.classList.contains('canvas-corner') ||
          node.classList.contains('canvas-edit-btn')
        )) return false;
        return true;
      },
      style: {},
    };
    if (backgroundColor) captureOpts.backgroundColor = backgroundColor;

    if (scope === 'full') {
      captureOpts.width  = naturalWidth + padding * 2;
      captureOpts.height = naturalHeight + padding * 2;
      captureOpts.style.padding = padding + 'px';
      captureOpts.style.boxSizing = 'content-box';
    }

    let dataUrl;
    try {
      dataUrl = await global.htmlToImage.toPng(target, captureOpts);
    } finally {
      restore();
    }
    const blob = _dataUrlToBlob(dataUrl);

    const outW = Math.round((captureOpts.width  || naturalWidth)  * effectiveDpr);
    const outH = Math.round((captureOpts.height || naturalHeight) * effectiveDpr);
    return { blob, dataUrl, width: outW, height: outH };
  }

  // ---------- Public: PNG ----------------------------------------------
  async function renderCanvasPng(opts, meta) {
    const out = await _capture(opts);
    const name = _filename(meta, 'png');
    _triggerDownload(out.blob, name);
    return { blob: out.blob, width: out.width, height: out.height, filename: name };
  }

  // ---------- Public: PDF ----------------------------------------------
  async function renderCanvasPdf(opts, meta) {
    const out = await _capture(opts);
    const { jsPDF } = global.jspdf || {};
    if (!jsPDF) throw new Error('jspdf library is not loaded.');

    // Auto-orient: landscape if wider than tall, else portrait. A4.
    const orient = out.width >= out.height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: orient });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 36;
    const titleH = (meta && meta.titleBlock === false) ? 0 : 64;

    // Title block --------------------------------------------------------
    if (titleH > 0) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(14);
      pdf.setTextColor(20, 20, 20);
      const project = (meta && meta.projectName) || 'Untitled project';
      const view = (meta && meta.viewLabel) ? '  ·  ' + meta.viewLabel : '';
      pdf.text(project + view, margin, margin + 16);

      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      const parts = [];
      if (meta && meta.version) parts.push('v' + meta.version);
      const d = (meta && meta.exportedAt) || new Date();
      parts.push('Exported ' + d.toISOString().slice(0, 16).replace('T', ' '));
      parts.push('solstein.app');
      pdf.text(parts.join('  ·  '), margin, margin + 32);

      // Hairline
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, margin + titleH - 8, pageW - margin, margin + titleH - 8);
    }

    // Image --------------------------------------------------------------
    const imgX = margin;
    const imgY = margin + titleH;
    const availW = pageW - margin * 2;
    const availH = pageH - margin - imgY;
    const aspect = out.width / out.height;
    let drawW = availW;
    let drawH = availW / aspect;
    if (drawH > availH) {
      drawH = availH;
      drawW = availH * aspect;
    }
    const offsetX = imgX + (availW - drawW) / 2;
    const offsetY = imgY + (availH - drawH) / 2;

    pdf.addImage(out.dataUrl, 'PNG', offsetX, offsetY, drawW, drawH, undefined, 'FAST');

    const name = _filename(meta, 'pdf');
    const blob = pdf.output('blob');
    _triggerDownload(blob, name);
    return { blob, filename: name };
  }

  global.renderCanvasPng = renderCanvasPng;
  global.renderCanvasPdf = renderCanvasPdf;
})(window);
