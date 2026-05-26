import React, { useEffect, useMemo, useState } from "react";
import "../styles.css";
import "../solstein-skin.css";

function titleCase(value) {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryForType(type) {
  if (["actor", "process", "decision", "state", "output"].includes(type)) {
    return "operational";
  }

  if (["application", "api", "database", "external_saas"].includes(type)) {
    return "technical";
  }

  if (["data_object", "data_store", "event"].includes(type)) {
    return "information";
  }

  return "governance";
}

function fallbackPosition(index) {
  return {
    x: 80 + (index % 8) * 240,
    y: 90 + Math.floor(index / 8) * 140,
  };
}

function hasUsablePosition(value) {
  return Boolean(
    value
      && typeof value === "object"
      && Number.isFinite(Number(value.x))
      && Number.isFinite(Number(value.y)),
  );
}

function normalizeNode(node, index) {
  const raw = node.raw && typeof node.raw === "object" ? node.raw : {};
  const id = node.node_key ?? raw.id ?? raw.key ?? node.id ?? node.key;
  const type = node.type ?? raw.type ?? "unknown";
  const rawPosition = raw.pos ?? raw.position;
  const normalizedPosition = node.position ?? node.pos;
  const pos = hasUsablePosition(normalizedPosition)
    ? normalizedPosition
    : hasUsablePosition(rawPosition)
      ? rawPosition
      : fallbackPosition(index);

  return {
    ...raw,
    ...node,
    id,
    type,
    label: node.label ?? raw.label ?? raw.name ?? id,
    description: node.description ?? raw.description ?? "",
    category: node.category ?? raw.category ?? categoryForType(type),
    typeLabel: node.typeLabel ?? raw.typeLabel ?? titleCase(type),
    metadata: node.metadata ?? raw.metadata ?? {},
    pos: {
      x: Number(pos.x),
      y: Number(pos.y),
    },
  };
}

function normalizeEdge(edge, index) {
  const raw = edge.raw && typeof edge.raw === "object" ? edge.raw : {};
  const id = edge.edge_key ?? raw.id ?? edge.id ?? `edge-${index + 1}`;
  const from =
    edge.source_key ?? raw.from ?? raw.source ?? raw.sourceId ?? edge.from ?? edge.source ?? edge.sourceId;
  const to =
    edge.target_key ?? raw.to ?? raw.target ?? raw.targetId ?? edge.to ?? edge.target ?? edge.targetId;

  return {
    ...raw,
    ...edge,
    id,
    from,
    to,
    label: edge.label ?? raw.label ?? raw.name ?? "",
    description: edge.description ?? raw.description ?? "",
    metadata: edge.metadata ?? raw.metadata ?? {},
  };
}

function normalizeCanvasData(graph) {
  const payload = graph.payload && typeof graph.payload === "object" ? graph.payload : {};
  const sourceNodes = Array.isArray(graph.nodes) && graph.nodes.length > 0
    ? graph.nodes
    : Array.isArray(payload.nodes)
      ? payload.nodes
      : [];
  const sourceEdges = Array.isArray(graph.edges) && graph.edges.length > 0
    ? graph.edges
    : Array.isArray(payload.edges)
      ? payload.edges
      : [];
  const nodes = sourceNodes.map(normalizeNode).filter((node) => node.id);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = sourceEdges
    .map(normalizeEdge)
    .filter((edge) => edge.id && nodeIds.has(edge.from) && nodeIds.has(edge.to));

  return {
    ...payload,
    project: {
      id: graph.id,
      name: graph.name ?? payload.project?.name ?? "Untitled graph",
      domain: payload.project?.domain ?? "Workspace graph",
      version: String(graph.version ?? payload.project?.version ?? "1"),
      createdAt: payload.project?.createdAt ?? "",
      description: payload.project?.description ?? "",
      ...payload.project,
    },
    nodes,
    edges,
    views: Array.isArray(payload.views) ? payload.views : [],
    overlays: Array.isArray(payload.overlays) ? payload.overlays : [],
    scenarios: Array.isArray(payload.scenarios) ? payload.scenarios : [],
    evidence: Array.isArray(payload.evidence) ? payload.evidence : [],
  };
}

let canvasAppPromise;

async function loadCanvasApp() {
  if (!canvasAppPromise) {
    window.React = React;
    canvasAppPromise = (async () => {
      await import("../layoutConfigs.js");
      await import("../layoutEngine.js");
      await import("../layoutOverrides.js");
      await import("../categories.js");
      await import("../nodeTypes.js");
      await import("../edgeTypes.js");
      await import("../lensMatch.js");
      await import("../canvasRender.js");
      await import("../SolDropdown.jsx");
      await import("../icons.jsx");
      await import("../node.jsx");
      await import("../edge.jsx");
      await import("../canvas.jsx");
      await import("../editControls.jsx");
      await import("../inspector.jsx");
      await import("../replay.jsx");
      await import("../controlPanels.jsx");
      await import("../settingsPage.jsx");
      await import("../exportModal.jsx");
      await import("../addNodeModal.jsx");
      const module = await import("../app.jsx");
      return module.default;
    })();
  }

  return canvasAppPromise;
}

export function FlowLensCanvas({ graph, projectId }) {
  const [CanvasApp, setCanvasApp] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const canvasData = useMemo(() => normalizeCanvasData(graph), [graph]);

  useEffect(() => {
    let isMounted = true;
    window.FLOWLENS_DATA = canvasData;

    loadCanvasApp()
      .then((component) => {
        if (isMounted) setCanvasApp(() => component);
      })
      .catch((error) => {
        if (isMounted) setLoadError(error);
      });

    return () => {
      isMounted = false;
    };
  }, [canvasData]);

  if (loadError) {
    return (
      <main className="page graph-document-page">
        <div className="banner is-error workspace-banner">
          <div className="banner-mark" />
          <div className="banner-body">
            <span className="ban-title">Canvas unavailable</span>
            {loadError.message}
          </div>
        </div>
      </main>
    );
  }

  if (!CanvasApp) {
    return <div className="legacy-canvas-loading">Loading canvas</div>;
  }

  return <CanvasApp data={canvasData} projectPath={`/project/${projectId}`} />;
}
