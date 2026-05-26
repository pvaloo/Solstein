/* global window */
// Categories — runtime list of node categories with labels and colors.
// Seeded from DEFAULT_CATEGORIES on first load. User-added categories are
// stored in localStorage and merged on top.

(function () {
  const STORAGE_KEY = 'flowlens.categories';

  // Built-in categories — their ids match what the seed graph data uses.
  // Built-ins can be renamed and re-colored, but not deleted.
  const DEFAULT_CATEGORIES = [
    { id: 'operational', label: 'Operational', color: 'oklch(0.76 0.14 75)',  builtin: true },
    { id: 'information', label: 'Information', color: 'oklch(0.76 0.14 200)', builtin: true },
    { id: 'technical',   label: 'Technical',   color: 'oklch(0.76 0.14 260)', builtin: true },
    { id: 'governance',  label: 'Governance',  color: 'oklch(0.76 0.14 25)',  builtin: true },
  ];

  function loadCategories() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_CATEGORIES.map(c => ({ ...c }));
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return DEFAULT_CATEGORIES.map(c => ({ ...c }));
      }
      // Build final list: built-ins first (in their canonical order, using
      // any stored overrides), then any custom categories.
      const storedById = Object.fromEntries(parsed.map(c => [c.id, c]));
      const out = DEFAULT_CATEGORIES.map(def => {
        const stored = storedById[def.id];
        return stored
          ? { ...def, label: stored.label || def.label, color: stored.color || def.color, builtin: true }
          : { ...def };
      });
      parsed.forEach(c => {
        if (!DEFAULT_CATEGORIES.find(d => d.id === c.id)) {
          out.push({ ...c, builtin: false });
        }
      });
      return out;
    } catch (e) {
      return DEFAULT_CATEGORIES.map(c => ({ ...c }));
    }
  }

  function saveCategories(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) { /* no-op */ }
  }

  function genCategoryId() {
    return 'cat_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  }

  window.Categories = {
    DEFAULT_CATEGORIES,
    loadCategories,
    saveCategories,
    genCategoryId,
  };
})();
