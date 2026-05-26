// ─────────────────────────────────────────────────────────────────────
// Lens evaluation — data-driven predicate that reads a lens's `match`,
// `alsoMatchNodeTypes`, `alsoMatchEdgeTypes`, and `alsoMatchMetadata`
// fields. Mirrors the schema used in graph-data.js / seed JSON.
//
// Semantics for `lens.match` (an object):
//   - All keys are AND'd together (every key must pass)
//   - Keys are dotted paths into the node/edge object, e.g.
//     "metadata.containsPii", "metadata.openQuestions"
//   - Values:
//       true               → field is truthy
//       false              → field is falsy
//       "non_empty"        → field is non-empty (array length > 0 or non-empty string)
//       "empty"            → field is empty / absent
//       Array              → field is one-of (OR among array members)
//       primitive          → field === value
//
// Anything in `alsoMatchNodeTypes` / `alsoMatchEdgeTypes` / `alsoMatchMetadata`
// is OR'd with the `match` block (a hit on any of them flags the row).
// ─────────────────────────────────────────────────────────────────────

(function () {
  function getPath(obj, path) {
    if (!obj) return undefined;
    const parts = path.split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  function isEmpty(v) {
    if (v == null) return true;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'string') return v.trim() === '';
    return false;
  }

  function valueMatches(actual, expected) {
    if (expected === true)  return !!actual && !isEmpty(actual);
    if (expected === false) return !actual || isEmpty(actual);
    if (expected === 'non_empty') return !isEmpty(actual);
    if (expected === 'empty')     return isEmpty(actual);
    if (Array.isArray(expected)) {
      if (Array.isArray(actual)) return expected.some(v => actual.includes(v));
      return expected.includes(actual);
    }
    if (Array.isArray(actual)) return actual.includes(expected);
    return actual === expected;
  }

  function matchPasses(obj, match) {
    if (!match) return false;
    const keys = Object.keys(match);
    if (keys.length === 0) return false;
    return keys.every(k => valueMatches(getPath(obj, k), match[k]));
  }

  function alsoMetaPasses(obj, alsoMatchMetadata) {
    if (!alsoMatchMetadata) return false;
    const keys = Object.keys(alsoMatchMetadata);
    if (keys.length === 0) return false;
    // OR across keys (any one is enough)
    return keys.some(k => valueMatches(getPath(obj, 'metadata.' + k), alsoMatchMetadata[k]));
  }

  function nodeMatchesLens(node, lens) {
    if (!lens) return false;
    if (matchPasses(node, lens.match)) return true;
    if ((lens.alsoMatchNodeTypes || []).includes(node.type)) return true;
    if (alsoMetaPasses(node, lens.alsoMatchMetadata)) return true;
    return false;
  }

  function edgeMatchesLens(edge, lens, nodeMap) {
    if (!lens) return false;
    if (matchPasses(edge, lens.match)) return true;
    if ((lens.alsoMatchEdgeTypes || []).includes(edge.type)) return true;
    if (alsoMetaPasses(edge, lens.alsoMatchMetadata)) return true;
    // Propagate via endpoints: an edge inherits a lens if BOTH of its
    // endpoints match (so PII chains highlight without per-edge metadata).
    if (lens.matchEdgesViaEndpoints !== false && nodeMap) {
      const from = nodeMap[edge.from], to = nodeMap[edge.to];
      if (from && to && nodeMatchesLens(from, lens) && nodeMatchesLens(to, lens)) return true;
    }
    return false;
  }

  // Build a lookup of overlay-id → overlay object from a list, with the
  // shape expected by the canvas. Returned function gets one or undefined.
  function lensById(overlays) {
    const map = {};
    for (const o of overlays || []) map[o.id] = o;
    return id => map[id];
  }

  window.LensMatch = {
    getPath,
    isEmpty,
    valueMatches,
    matchPasses,
    nodeMatchesLens,
    edgeMatchesLens,
    lensById,
  };
})();
