import { Fragment, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import sampleGraph from "../../data/car-insurance-comparison.json";
import { createProjectGraph } from "../lib/projects.js";

const STEP_LABELS = ["Upload", "Validate", "Discover", "Views", "Overlays", "Import"];

const OPS = [
  { value: "equals", label: "equals" },
  { value: "in", label: "in" },
  { value: "is_not_empty", label: "is not empty" },
  { value: "empty", label: "empty" },
];

const REQUIRED_OVERLAYS = [
  {
    id: "pii",
    label: "PII / Sensitive Data",
    description: "Highlights personal and regulated data passing through the graph.",
    token: "pii",
    required: true,
    conditions: [
      { field: "metadata.containsPii", op: "equals", value: "true" },
    ],
  },
  {
    id: "manual_process",
    label: "Manual Processes",
    description: "Highlights manual steps, spreadsheets, and workarounds.",
    token: "manual",
    required: true,
    conditions: [
      { field: "metadata.automationLevel", op: "equals", value: "manual" },
      { field: "type", op: "equals", value: "spreadsheet" },
      { field: "edge_type", op: "equals", value: "manual_rekey" },
    ],
  },
  {
    id: "unknowns",
    label: "Unknowns & Low Confidence",
    description: "Highlights assumed or unresolved parts of the map.",
    token: "unknown",
    required: true,
    conditions: [
      { field: "metadata.confidence", op: "in", value: "low, medium" },
      { field: "metadata.openQuestions", op: "is_not_empty", value: "" },
    ],
  },
  {
    id: "high_risk",
    label: "High Risk",
    description: "Highlights elements with elevated operational or delivery risk.",
    token: "risk",
    required: true,
    conditions: [
      { field: "metadata.riskLevel", op: "equals", value: "high" },
    ],
  },
  {
    id: "system_of_record",
    label: "System of Record",
    description: "Highlights authoritative sources for key business data.",
    token: "sor",
    required: true,
    conditions: [
      { field: "metadata.systemOfRecord", op: "equals", value: "true" },
    ],
  },
];

const DEFAULT_VIEWS = [
  {
    id: "journey_view",
    label: "Journey View",
    description: "Operational story of the customer journey.",
    locked: true,
    typeHints: ["actor", "process", "decision", "state", "event", "data_object", "output", "metric"],
  },
  {
    id: "technical_view",
    label: "Technical Architecture",
    description: "Systems, integrations, and infrastructure.",
    locked: true,
    typeHints: ["application", "api", "external_saas", "database", "data_warehouse", "pipeline", "bi_tool", "spreadsheet"],
  },
];

const CATEGORY_LABELS = {
  operational: "Operational",
  information: "Information",
  technical: "Technical",
  governance: "Governance",
  other: "Other",
};

function titleCase(value) {
  return String(value || "untitled")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value, fallback = "item") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || fallback;
}

function conditionId() {
  return `condition_${Math.random().toString(36).slice(2, 9)}`;
}

function withConditionIds(conditions) {
  return conditions.map((condition) => ({
    id: condition.id ?? conditionId(),
    field: condition.field ?? "",
    op: condition.op ?? "equals",
    value: condition.value ?? "",
  }));
}

function graphNameFromPayload(payload, fallbackName = "") {
  const fallback = fallbackName
    ? fallbackName.replace(/\.json$/i, "").replace(/[-_]+/g, " ")
    : "Imported graph";

  return payload?.project?.name || payload?.name || fallback;
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function summarizeValue(value) {
  if (Array.isArray(value)) return value.length > 0 ? "(non-empty)" : "(empty)";
  if (typeof value === "boolean") return String(value);
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "object") return "(object)";
  return String(value);
}

function makeRef(kind, item) {
  return {
    kind,
    id: item?.id ?? "",
    label: item?.label ?? "",
    from: item?.from ?? "",
    to: item?.to ?? "",
  };
}

function runValidation(payload) {
  const errors = [];
  const warnings = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      errors: [{ kind: "top-level", summary: "Graph JSON must be an object.", refs: [] }],
      warnings,
      stats: { nodes: 0, edges: 0, nodeTypes: 0, edgeTypes: 0 },
    };
  }

  if (!Array.isArray(payload.nodes)) {
    errors.push({ kind: "top-level", summary: "Missing top-level `nodes` array.", refs: [] });
  }

  if (!Array.isArray(payload.edges)) {
    errors.push({ kind: "top-level", summary: "Missing top-level `edges` array.", refs: [] });
  }

  if (errors.length > 0) {
    return {
      errors,
      warnings,
      stats: {
        nodes: Array.isArray(payload.nodes) ? payload.nodes.length : 0,
        edges: Array.isArray(payload.edges) ? payload.edges.length : 0,
        nodeTypes: 0,
        edgeTypes: 0,
      },
    };
  }

  if (payload.nodes.length === 0) {
    errors.push({ kind: "top-level", summary: "Nodes array is empty.", refs: [] });
  }

  const buckets = {
    nodeMissingId: { type: "err", label: "node missing id", refs: [] },
    nodeMissingType: { type: "err", label: "node missing type", refs: [] },
    duplicateNodeId: { type: "err", label: "duplicate node id", refs: [] },
    nodeMissingLabel: { type: "warn", label: "node missing label", refs: [] },
    nodeNoMetadata: { type: "warn", label: "node has no metadata", refs: [] },
    orphan: { type: "warn", label: "orphan node", refs: [] },
    edgeMissingEndpoints: { type: "err", label: "edge missing from / to", refs: [] },
    edgeBadFrom: { type: "err", label: "edge from-node not found", refs: [] },
    edgeBadTo: { type: "err", label: "edge to-node not found", refs: [] },
    edgeMissingId: { type: "warn", label: "edge missing id", refs: [] },
    edgeMissingType: { type: "warn", label: "edge missing type", refs: [] },
    edgeSelfRef: { type: "warn", label: "self-referencing edge", refs: [] },
  };

  const seenNodeIds = new Map();
  payload.nodes.forEach((node) => {
    if (!node?.id) buckets.nodeMissingId.refs.push(makeRef("node", node));
    if (!node?.type) buckets.nodeMissingType.refs.push(makeRef("node", node));
    if (!node?.label) buckets.nodeMissingLabel.refs.push(makeRef("node", node));
    if (node?.id && seenNodeIds.has(node.id)) buckets.duplicateNodeId.refs.push(makeRef("node", node));
    if (node?.id && !seenNodeIds.has(node.id)) seenNodeIds.set(node.id, node);
    if (node?.id && (!node.metadata || Object.keys(node.metadata).length === 0)) {
      buckets.nodeNoMetadata.refs.push(makeRef("node", node));
    }
  });

  payload.edges.forEach((edge) => {
    if (!edge?.id) buckets.edgeMissingId.refs.push(makeRef("edge", edge));
    if (!edge?.from || !edge?.to) buckets.edgeMissingEndpoints.refs.push(makeRef("edge", edge));
    if (!edge?.type) buckets.edgeMissingType.refs.push(makeRef("edge", edge));
    if (edge?.from && !seenNodeIds.has(edge.from)) buckets.edgeBadFrom.refs.push(makeRef("edge", edge));
    if (edge?.to && !seenNodeIds.has(edge.to)) buckets.edgeBadTo.refs.push(makeRef("edge", edge));
    if (edge?.from && edge.from === edge.to) buckets.edgeSelfRef.refs.push(makeRef("edge", edge));
  });

  const referencedNodeIds = new Set();
  payload.edges.forEach((edge) => {
    if (edge?.from) referencedNodeIds.add(edge.from);
    if (edge?.to) referencedNodeIds.add(edge.to);
  });
  payload.nodes.forEach((node) => {
    if (node?.id && !referencedNodeIds.has(node.id)) {
      buckets.orphan.refs.push(makeRef("node", node));
    }
  });

  Object.values(buckets).forEach((bucket) => {
    if (bucket.refs.length === 0) return;
    const summary = `${bucket.refs.length} ${bucket.label}${bucket.refs.length === 1 ? "" : "s"}`;
    const group = { summary, refs: bucket.refs };
    if (bucket.type === "err") errors.push(group);
    else warnings.push(group);
  });

  return {
    errors,
    warnings,
    stats: {
      nodes: payload.nodes.length,
      edges: payload.edges.length,
      nodeTypes: new Set(payload.nodes.map((node) => node?.type).filter(Boolean)).size,
      edgeTypes: new Set(payload.edges.map((edge) => edge?.type).filter(Boolean)).size,
    },
  };
}

function runDiscovery(payload) {
  if (!payload || !Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) {
    return { categories: {}, edgeTypes: {}, metaFields: [] };
  }

  const categories = {};
  payload.nodes.forEach((node) => {
    const category = node.category || "other";
    const type = node.type || "unknown";
    categories[category] ??= {};
    categories[category][type] ??= [];
    categories[category][type].push(node);
  });

  const edgeTypes = {};
  payload.edges.forEach((edge) => {
    const type = edge.type || "unknown";
    edgeTypes[type] = (edgeTypes[type] ?? 0) + 1;
  });

  const fields = {};
  function scanMetadata(metadata, kind) {
    if (!metadata || typeof metadata !== "object") return;
    Object.entries(metadata).forEach(([field, value]) => {
      fields[field] ??= { values: new Set(), found: 0, kinds: new Set() };
      const entry = fields[field];
      entry.found += 1;
      entry.kinds.add(kind);
      const summary = summarizeValue(value);
      if (summary) entry.values.add(summary);
    });
  }

  payload.nodes.forEach((node) => scanMetadata(node.metadata, "node"));
  payload.edges.forEach((edge) => scanMetadata(edge.metadata, "edge"));

  const metaFields = Object.entries(fields)
    .map(([field, entry]) => ({
      field,
      values: Array.from(entry.values).slice(0, 8),
      found: entry.found,
      foundIn: Array.from(entry.kinds).sort().join(" + "),
      truncated: entry.values.size > 8,
    }))
    .sort((a, b) => b.found - a.found || a.field.localeCompare(b.field));

  return { categories, edgeTypes, metaFields };
}

function nodeIdsForTypes(payload, typeHints) {
  const hintSet = new Set(typeHints);
  return payload.nodes
    .filter((node) => hintSet.has(node.type))
    .map((node) => node.id)
    .filter(Boolean);
}

function edgeTypesForNodeIds(payload, nodeIds) {
  const nodeIdSet = new Set(nodeIds);
  return Array.from(new Set(
    payload.edges
      .filter((edge) => nodeIdSet.has(edge.from) && nodeIdSet.has(edge.to))
      .map((edge) => edge.type)
      .filter(Boolean),
  ));
}

function seedViews(payload) {
  const declaredViews = Array.isArray(payload?.views) ? payload.views : [];

  if (declaredViews.length > 0) {
    return declaredViews.map((view, index) => {
      const includeNodeTypes = Array.isArray(view.includeNodeTypes) ? view.includeNodeTypes : [];
      const nodeIds = includeNodeTypes.length > 0
        ? nodeIdsForTypes(payload, includeNodeTypes)
        : payload.nodes.map((node) => node.id).filter(Boolean);

      return {
        id: view.id || slugify(view.label, `view_${index + 1}`),
        label: view.label || `View ${index + 1}`,
        description: view.description || "",
        locked: index < 2,
        nodes: nodeIds,
      };
    });
  }

  const fallbackAllNodes = payload.nodes.map((node) => node.id).filter(Boolean);
  return DEFAULT_VIEWS.map((view) => {
    const hintedNodes = nodeIdsForTypes(payload, view.typeHints);
    return {
      id: view.id,
      label: view.label,
      description: view.description,
      locked: view.locked,
      nodes: hintedNodes.length > 0 ? hintedNodes : fallbackAllNodes,
    };
  });
}

function conditionFromMatch(path, value) {
  if (value === "non_empty") return { field: path, op: "is_not_empty", value: "" };
  if (value === "empty") return { field: path, op: "empty", value: "" };
  if (Array.isArray(value)) return { field: path, op: "in", value: value.join(", ") };
  return { field: path, op: "equals", value: String(value) };
}

function seedOverlays(payload) {
  const declaredOverlays = Array.isArray(payload?.overlays) ? payload.overlays : [];

  if (declaredOverlays.length > 0) {
    return declaredOverlays.map((overlay, index) => {
      const conditions = [];
      Object.entries(overlay.match || {}).forEach(([field, value]) => {
        conditions.push(conditionFromMatch(field, value));
      });
      Object.entries(overlay.alsoMatchMetadata || {}).forEach(([field, value]) => {
        conditions.push(conditionFromMatch(`metadata.${field}`, value));
      });
      if (Array.isArray(overlay.alsoMatchNodeTypes) && overlay.alsoMatchNodeTypes.length > 0) {
        conditions.push({ field: "type", op: "in", value: overlay.alsoMatchNodeTypes.join(", ") });
      }
      if (Array.isArray(overlay.alsoMatchEdgeTypes) && overlay.alsoMatchEdgeTypes.length > 0) {
        conditions.push({ field: "edge_type", op: "in", value: overlay.alsoMatchEdgeTypes.join(", ") });
      }

      const required = REQUIRED_OVERLAYS.some((item) => item.id === overlay.id);
      const template = REQUIRED_OVERLAYS.find((item) => item.id === overlay.id);

      return {
        id: overlay.id || slugify(overlay.label, `overlay_${index + 1}`),
        label: overlay.label || `Overlay ${index + 1}`,
        description: overlay.description || "",
        required,
        token: template?.token ?? "accent",
        conditions: withConditionIds(conditions),
      };
    });
  }

  return REQUIRED_OVERLAYS.map((overlay) => ({
    ...overlay,
    conditions: withConditionIds(overlay.conditions),
  }));
}

function parseConditionValue(condition) {
  if (condition.op === "is_not_empty") return "non_empty";
  if (condition.op === "empty") return "empty";

  const parseOne = (value) => {
    const trimmed = String(value).trim();
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed);
    return trimmed;
  };

  if (condition.op === "in") {
    return String(condition.value)
      .split(",")
      .map(parseOne)
      .filter((value) => value !== "");
  }

  return parseOne(condition.value);
}

function appendOrCombine(target, key, value) {
  if (target[key] === undefined) {
    target[key] = value;
    return;
  }

  if (Array.isArray(target[key])) {
    target[key] = target[key].concat(value);
    return;
  }

  target[key] = Array.isArray(value) ? [target[key], ...value] : [target[key], value];
}

function buildOverlayPayload(overlay) {
  const alsoMatchMetadata = {};
  const alsoMatchNodeTypes = [];
  const alsoMatchEdgeTypes = [];

  overlay.conditions.forEach((condition) => {
    if (!condition.field) return;
    const value = parseConditionValue(condition);

    if (condition.field === "type") {
      const values = Array.isArray(value) ? value : [value];
      alsoMatchNodeTypes.push(...values.map(String).filter(Boolean));
      return;
    }

    if (condition.field === "edge_type") {
      const values = Array.isArray(value) ? value : [value];
      alsoMatchEdgeTypes.push(...values.map(String).filter(Boolean));
      return;
    }

    if (condition.field.startsWith("metadata.")) {
      appendOrCombine(alsoMatchMetadata, condition.field.replace(/^metadata\./, ""), value);
    }
  });

  const payload = {
    id: overlay.id,
    label: overlay.label,
    description: overlay.description,
  };

  if (Object.keys(alsoMatchMetadata).length > 0) payload.alsoMatchMetadata = alsoMatchMetadata;
  if (alsoMatchNodeTypes.length > 0) payload.alsoMatchNodeTypes = Array.from(new Set(alsoMatchNodeTypes));
  if (alsoMatchEdgeTypes.length > 0) payload.alsoMatchEdgeTypes = Array.from(new Set(alsoMatchEdgeTypes));

  return payload;
}

function buildImportPayload(payload, graphName, views, overlays) {
  return {
    ...payload,
    project: {
      ...(payload.project || {}),
      name: graphName.trim() || graphNameFromPayload(payload),
    },
    views: views.map((view) => {
      const selected = new Set(view.nodes);
      const includeNodeTypes = Array.from(new Set(
        payload.nodes
          .filter((node) => selected.has(node.id))
          .map((node) => node.type)
          .filter(Boolean),
      ));

      return {
        id: view.id,
        label: view.label,
        description: view.description,
        includeNodeTypes,
        includeEdgeTypes: edgeTypesForNodeIds(payload, view.nodes),
      };
    }),
    overlays: overlays.map(buildOverlayPayload),
  };
}

function IssueList({ title, groups, kind }) {
  if (groups.length === 0) return null;

  return (
    <div className={`import-issue-block is-${kind}`}>
      <div className="import-issue-title">{title}</div>
      {groups.map((group) => (
        <details className="import-issue" key={group.summary}>
          <summary>
            <span>{group.summary}</span>
            {group.refs.length > 0 ? <span>{group.refs.length} affected</span> : null}
          </summary>
          {group.refs.length > 0 ? (
            <div className="import-ref-list">
              {group.refs.slice(0, 10).map((ref, index) => (
                <div className="import-ref" key={`${ref.kind}-${ref.id}-${index}`}>
                  <span>{ref.kind}</span>
                  <strong>{ref.id || "(no id)"}</strong>
                  {ref.kind === "edge" ? <em>{`${ref.from || "?"} -> ${ref.to || "?"}`}</em> : null}
                  {ref.label ? <em>{ref.label}</em> : null}
                </div>
              ))}
              {group.refs.length > 10 ? <div className="import-ref-more">+ {group.refs.length - 10} more</div> : null}
            </div>
          ) : null}
        </details>
      ))}
    </div>
  );
}

function StatGrid({ stats }) {
  return (
    <div className="import-stat-grid">
      <div><strong>{stats.nodes}</strong><span>Nodes</span></div>
      <div><strong>{stats.edges}</strong><span>Edges</span></div>
      <div><strong>{stats.nodeTypes}</strong><span>Node types</span></div>
      <div><strong>{stats.edgeTypes}</strong><span>Edge types</span></div>
    </div>
  );
}

export function ImportGraphPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [graphPayload, setGraphPayload] = useState(null);
  const [graphName, setGraphName] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileSize, setFileSize] = useState(null);
  const [validation, setValidation] = useState(null);
  const [discovery, setDiscovery] = useState(runDiscovery(null));
  const [views, setViews] = useState([]);
  const [activeViewId, setActiveViewId] = useState("");
  const [overlays, setOverlays] = useState([]);
  const [activeOverlayId, setActiveOverlayId] = useState("");
  const [newViewName, setNewViewName] = useState("");
  const [newOverlayName, setNewOverlayName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  const activeView = views.find((view) => view.id === activeViewId) ?? views[0];
  const activeOverlay = overlays.find((overlay) => overlay.id === activeOverlayId) ?? overlays[0];
  const stats = validation?.stats ?? { nodes: 0, edges: 0, nodeTypes: 0, edgeTypes: 0 };
  const totalConditions = overlays.reduce((sum, overlay) => sum + overlay.conditions.length, 0);
  const selectedViewNodes = views.reduce((sum, view) => sum + view.nodes.length, 0);

  const fieldOptions = useMemo(() => [
    { value: "", label: "Select field" },
    { value: "type", label: "type" },
    { value: "edge_type", label: "edge_type" },
    ...discovery.metaFields.map((field) => ({
      value: `metadata.${field.field}`,
      label: `metadata.${field.field}`,
    })),
  ], [discovery.metaFields]);

  const unassignedNodes = useMemo(() => {
    if (!graphPayload?.nodes) return [];
    const assigned = new Set();
    views.forEach((view) => view.nodes.forEach((nodeId) => assigned.add(nodeId)));
    return graphPayload.nodes.filter((node) => node.id && !assigned.has(node.id));
  }, [graphPayload, views]);

  const canNext = (() => {
    if (step === 0) {
      return Boolean(graphPayload && validation && validation.errors.length === 0 && graphName.trim());
    }
    if (step === 1) return Boolean(validation && validation.errors.length === 0);
    if (step === 3) return views.length > 0 && views.every((view) => view.nodes.length > 0);
    return true;
  })();

  function applyPayload(payload, fileName, size = null) {
    const nextValidation = runValidation(payload);
    const nextDiscovery = runDiscovery(payload);
    const hasGraphArrays = payload && Array.isArray(payload.nodes) && Array.isArray(payload.edges);
    const nextViews = hasGraphArrays ? seedViews(payload) : [];
    const nextOverlays = seedOverlays(payload);

    setGraphPayload(payload);
    setGraphName(graphNameFromPayload(payload, fileName));
    setSelectedFileName(fileName);
    setFileSize(size);
    setValidation(nextValidation);
    setDiscovery(nextDiscovery);
    setViews(nextViews);
    setActiveViewId(nextViews[0]?.id ?? "");
    setOverlays(nextOverlays);
    setActiveOverlayId(nextOverlays[0]?.id ?? "");
    setError(null);
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setSelectedFileName(file.name);
    setFileSize(file.size);
    setError(null);

    if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
      setGraphPayload(null);
      setValidation(null);
      setError(new Error("Please upload a JSON file."));
      return;
    }

    try {
      const text = await file.text();
      applyPayload(JSON.parse(text), file.name, file.size);
    } catch (fileError) {
      setGraphPayload(null);
      setValidation(null);
      setDiscovery(runDiscovery(null));
      setViews([]);
      setOverlays([]);
      setError(new Error(`That file is not valid JSON: ${fileError.message}`));
    }
  }

  function resetUpload() {
    setGraphPayload(null);
    setGraphName("");
    setSelectedFileName("");
    setFileSize(null);
    setValidation(null);
    setDiscovery(runDiscovery(null));
    setViews([]);
    setActiveViewId("");
    setOverlays([]);
    setActiveOverlayId("");
    setError(null);
    setStep(0);
  }

  function goNext() {
    if (!canNext || step >= STEP_LABELS.length - 1) return;
    setStep((currentStep) => currentStep + 1);
  }

  function addView() {
    const label = newViewName.trim();
    if (!label) return;
    const id = slugify(label, "view");
    setViews((currentViews) => {
      const uniqueId = currentViews.some((view) => view.id === id) ? `${id}_${currentViews.length + 1}` : id;
      setActiveViewId(uniqueId);
      return [...currentViews, {
        id: uniqueId,
        label,
        description: "",
        locked: false,
        nodes: [],
      }];
    });
    setNewViewName("");
  }

  function toggleViewNode(viewId, nodeId) {
    setViews((currentViews) => currentViews.map((view) => {
      if (view.id !== viewId) return view;
      const selected = new Set(view.nodes);
      if (selected.has(nodeId)) selected.delete(nodeId);
      else selected.add(nodeId);
      return { ...view, nodes: Array.from(selected) };
    }));
  }

  function toggleViewType(viewId, nodes) {
    setViews((currentViews) => currentViews.map((view) => {
      if (view.id !== viewId) return view;
      const selected = new Set(view.nodes);
      const allSelected = nodes.every((node) => selected.has(node.id));
      nodes.forEach((node) => {
        if (!node.id) return;
        if (allSelected) selected.delete(node.id);
        else selected.add(node.id);
      });
      return { ...view, nodes: Array.from(selected) };
    }));
  }

  function removeView(viewId) {
    setViews((currentViews) => {
      const nextViews = currentViews.filter((view) => view.id !== viewId);
      if (activeViewId === viewId) setActiveViewId(nextViews[0]?.id ?? "");
      return nextViews;
    });
  }

  function addOverlay() {
    const label = newOverlayName.trim();
    if (!label) return;
    const id = slugify(label, "overlay");
    setOverlays((currentOverlays) => {
      const uniqueId = currentOverlays.some((overlay) => overlay.id === id) ? `${id}_${currentOverlays.length + 1}` : id;
      setActiveOverlayId(uniqueId);
      return [...currentOverlays, {
        id: uniqueId,
        label,
        description: "",
        required: false,
        token: "accent",
        conditions: [],
      }];
    });
    setNewOverlayName("");
  }

  function removeOverlay(overlayId) {
    setOverlays((currentOverlays) => {
      const nextOverlays = currentOverlays.filter((overlay) => overlay.id !== overlayId);
      if (activeOverlayId === overlayId) setActiveOverlayId(nextOverlays[0]?.id ?? "");
      return nextOverlays;
    });
  }

  function updateCondition(overlayId, conditionIdValue, patch) {
    setOverlays((currentOverlays) => currentOverlays.map((overlay) => {
      if (overlay.id !== overlayId) return overlay;
      return {
        ...overlay,
        conditions: overlay.conditions.map((condition) => (
          condition.id === conditionIdValue ? { ...condition, ...patch } : condition
        )),
      };
    }));
  }

  function addCondition(overlayId) {
    setOverlays((currentOverlays) => currentOverlays.map((overlay) => (
      overlay.id === overlayId
        ? {
            ...overlay,
            conditions: [
              ...overlay.conditions,
              { id: conditionId(), field: "", op: "equals", value: "" },
            ],
          }
        : overlay
    )));
  }

  function removeCondition(overlayId, conditionIdValue) {
    setOverlays((currentOverlays) => currentOverlays.map((overlay) => (
      overlay.id === overlayId
        ? { ...overlay, conditions: overlay.conditions.filter((condition) => condition.id !== conditionIdValue) }
        : overlay
    )));
  }

  async function commitGraph() {
    if (!graphPayload) return;

    const validationResult = runValidation(graphPayload);
    if (validationResult.errors.length > 0) {
      setValidation(validationResult);
      setError(new Error("Resolve import validation errors before committing the graph."));
      setStep(1);
      return;
    }

    setIsImporting(true);
    setError(null);

    const configuredPayload = buildImportPayload(graphPayload, graphName, views, overlays);
    const { graph, error: createError } = await createProjectGraph(
      projectId,
      graphName.trim() || graphNameFromPayload(graphPayload),
      configuredPayload,
    );

    setIsImporting(false);

    if (createError) {
      setError(createError);
      return;
    }

    navigate(`/project/${projectId}/graph/${graph.id}`);
  }

  return (
    <main className="page import-page">
      <Link className="back-link" to={`/project/${projectId}`}>
        ← Project
      </Link>
      <div className="kicker">§ Import graph</div>
      <h1 className="page-title">Import graph</h1>
      <p className="page-sub">Upload JSON, validate it, then configure how the team will read it.</p>

      <div className="wiz-stepper" aria-label="Import progress">
        {STEP_LABELS.map((label, index) => (
          <Fragment key={label}>
            <button
              className={`wiz-step${index === step ? " is-current" : ""}${index < step ? " is-done is-clickable" : ""}`}
              type="button"
              disabled={index >= step}
              onClick={() => {
                if (index < step) setStep(index);
              }}
            >
              <span className="mark">{index < step ? "✓" : index + 1}</span>
              <span className="label">{label}</span>
            </button>
            {index < STEP_LABELS.length - 1 ? (
              <span className={`wiz-rail${index < step ? " is-done" : ""}`} aria-hidden="true" />
            ) : null}
          </Fragment>
        ))}
      </div>

      {error ? (
        <div className="banner is-error workspace-banner import-alert">
          <div className="banner-mark" />
          <div className="banner-body">
            <span className="ban-title">Import blocked</span>
            {error.message}
          </div>
        </div>
      ) : null}

      <section className={`wiz-body${step === 3 || step === 4 ? " wide" : ""}`}>
        {step === 0 ? (
          <>
            <h2>Upload graph data</h2>
            <p className="sub">JSON with top-level <code>nodes</code> and <code>edges</code> arrays.</p>

            <label className="import-field">
              <span>Graph name <em>*</em></span>
              <input
                className="input"
                value={graphName}
                onChange={(event) => setGraphName(event.target.value)}
                placeholder="e.g. Quote Journey"
              />
            </label>

            <div className={`dropzone${graphPayload ? " is-ok" : ""}${error ? " is-err" : ""}`}>
              <div className="ic">JSON</div>
              <div className="ttl">{selectedFileName || "Drop your JSON file here"}</div>
              <div className="alt">
                {graphPayload
                  ? [formatBytes(fileSize), `${stats.nodes} nodes`, `${stats.edges} edges`].filter(Boolean).join(" · ")
                  : "Choose a local .json file"}
              </div>
              <label className="reset upload-control">
                {graphPayload ? "Replace file" : "Choose file"}
                <input type="file" accept="application/json,.json" onChange={handleFileUpload} />
              </label>
              <div className="dropzone-separator">or</div>
              <button
                className="reset"
                type="button"
                onClick={() => applyPayload(sampleGraph, "Bundled sample graph")}
                disabled={isImporting}
              >
                Load bundled sample
              </button>
              {graphPayload ? (
                <button className="reset" type="button" onClick={resetUpload}>
                  Clear
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <h2>Validation report</h2>
            <p className="sub">Structural integrity check.</p>
            {validation?.errors.length === 0 ? (
              <div className="import-status is-ok">
                <strong>No structural errors</strong>
                <span>{validation.warnings.length} warning groups</span>
              </div>
            ) : null}
            <IssueList title="Errors" groups={validation?.errors ?? []} kind="error" />
            <IssueList title="Warnings" groups={validation?.warnings ?? []} kind="warning" />
            <StatGrid stats={stats} />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2>Schema discovery</h2>
            <p className="sub">Detected categories, edge types, and metadata fields.</p>

            <div className="discover-grid">
              {Object.entries(discovery.categories).map(([category, types]) => (
                <div className="discover-section" key={category}>
                  <div className="discover-title">
                    <span className={`category-dot is-${category}`} />
                    {CATEGORY_LABELS[category] ?? titleCase(category)}
                  </div>
                  <div className="import-pills">
                    {Object.entries(types).map(([type, nodes]) => (
                      <span className="import-pill" key={type}>
                        {titleCase(type)} <em>{nodes.length}</em>
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              <div className="discover-section">
                <div className="discover-title">Edge types</div>
                <div className="import-pills">
                  {Object.entries(discovery.edgeTypes).map(([type, count]) => (
                    <span className="import-pill" key={type}>
                      {titleCase(type)} <em>{count}</em>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="meta-table">
              <div className="mt-head">
                <span>Field</span>
                <span>Distinct values</span>
                <span>Found in</span>
              </div>
              {discovery.metaFields.map((field) => (
                <div className="mt-row" key={field.field}>
                  <strong>{field.field}</strong>
                  <span>
                    {field.values.length > 0
                      ? field.values.map((value) => <em key={value}>{value}</em>)
                      : <em>empty</em>}
                    {field.truncated ? <em>...</em> : null}
                  </span>
                  <span>{field.found} {field.foundIn}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h2>Configure views</h2>
            <p className="sub">Every view needs at least one node before import.</p>

            {views.some((view) => view.nodes.length === 0) || unassignedNodes.length > 0 ? (
              <div className="view-warnings">
                {views.some((view) => view.nodes.length === 0) ? (
                  <div className="import-status is-error">
                    <strong>{views.filter((view) => view.nodes.length === 0).length} empty view(s)</strong>
                    <span>Select nodes before continuing.</span>
                  </div>
                ) : null}
                {unassignedNodes.length > 0 ? (
                  <div className="import-status is-warning">
                    <strong>{unassignedNodes.length} unassigned node(s)</strong>
                    <span>They import but do not appear in a configured view.</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="entity-tabs">
              {views.map((view) => (
                <div className={`entity-tab-wrap${activeView?.id === view.id ? " is-on" : ""}`} key={view.id}>
                  <button
                    className={`entity-tab${activeView?.id === view.id ? " is-on" : ""}${view.nodes.length === 0 ? " is-empty" : ""}`}
                    type="button"
                    onClick={() => setActiveViewId(view.id)}
                  >
                    {view.locked ? <span className="lock">REQ</span> : null}
                    {view.label}
                    <span className="badge">({view.nodes.length})</span>
                  </button>
                  {!view.locked ? (
                    <button className="entity-remove" type="button" onClick={() => removeView(view.id)}>
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
              <div className="add-entity-form">
                <input
                  value={newViewName}
                  onChange={(event) => setNewViewName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addView();
                  }}
                  placeholder="View name"
                />
                <button type="button" onClick={addView}>Add</button>
              </div>
            </div>

            {activeView ? (
              <div className="view-panel">
                {Object.entries(discovery.categories).map(([category, types]) => (
                  <div className="cat-block" key={category}>
                    <div className="cat-title">
                      <span className={`category-dot is-${category}`} />
                      {CATEGORY_LABELS[category] ?? titleCase(category)}
                    </div>
                    {Object.entries(types).map(([type, nodes]) => {
                      const allSelected = nodes.every((node) => activeView.nodes.includes(node.id));
                      const someSelected = nodes.some((node) => activeView.nodes.includes(node.id));
                      return (
                        <div className="type-block" key={type}>
                          <button
                            className={`type-row${allSelected ? " is-on" : ""}${someSelected && !allSelected ? " is-mixed" : ""}`}
                            type="button"
                            onClick={() => toggleViewType(activeView.id, nodes)}
                          >
                            <span className="check" />
                            <strong>{titleCase(type)}</strong>
                            <em>{nodes.length}</em>
                          </button>
                          <div className="node-list">
                            {nodes.map((node) => {
                              const selected = activeView.nodes.includes(node.id);
                              return (
                                <button
                                  className={`node-row${selected ? " is-on" : ""}`}
                                  type="button"
                                  key={node.id}
                                  onClick={() => toggleViewNode(activeView.id, node.id)}
                                >
                                  <span className="check" />
                                  <strong>{node.label || node.id}</strong>
                                  <em>{node.id}</em>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h2>Configure overlays</h2>
            <p className="sub">Conditions are evaluated as matches for semantic highlighting.</p>

            <div className="entity-tabs">
              {overlays.map((overlay) => (
                <div className={`entity-tab-wrap${activeOverlay?.id === overlay.id ? " is-on" : ""}`} key={overlay.id}>
                  <button
                    className={`entity-tab${activeOverlay?.id === overlay.id ? " is-on" : ""}`}
                    type="button"
                    onClick={() => setActiveOverlayId(overlay.id)}
                  >
                    <span className={`overlay-dot is-${overlay.token}`} />
                    {overlay.label}
                    <span className="badge">({overlay.conditions.length})</span>
                  </button>
                  {!overlay.required ? (
                    <button className="entity-remove" type="button" onClick={() => removeOverlay(overlay.id)}>
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
              <div className="add-entity-form">
                <input
                  value={newOverlayName}
                  onChange={(event) => setNewOverlayName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addOverlay();
                  }}
                  placeholder="Overlay name"
                />
                <button type="button" onClick={addOverlay}>Add</button>
              </div>
            </div>

            {activeOverlay ? (
              <div className="overlay-panel">
                <div className="overlay-head">
                  <span className={`overlay-dot is-${activeOverlay.token}`} />
                  <strong>{activeOverlay.label}</strong>
                  {activeOverlay.required ? <em>Required</em> : null}
                </div>

                {activeOverlay.conditions.length === 0 ? (
                  <div className="empty-hint">No conditions defined.</div>
                ) : null}

                {activeOverlay.conditions.map((condition) => (
                  <div className="cond-row" key={condition.id}>
                    <select
                      value={condition.field}
                      onChange={(event) => updateCondition(activeOverlay.id, condition.id, { field: event.target.value })}
                    >
                      {fieldOptions.map((option) => (
                        <option value={option.value} key={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <select
                      value={condition.op}
                      onChange={(event) => updateCondition(activeOverlay.id, condition.id, { op: event.target.value })}
                    >
                      {OPS.map((option) => (
                        <option value={option.value} key={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {condition.op === "is_not_empty" || condition.op === "empty" ? (
                      <div className="cond-placeholder">no value</div>
                    ) : (
                      <input
                        value={condition.value}
                        onChange={(event) => updateCondition(activeOverlay.id, condition.id, { value: event.target.value })}
                        placeholder={condition.op === "in" ? "value1, value2" : "value"}
                      />
                    )}
                    <button type="button" className="cond-remove" onClick={() => removeCondition(activeOverlay.id, condition.id)}>
                      ×
                    </button>
                  </div>
                ))}

                <button className="add-cond-btn" type="button" onClick={() => addCondition(activeOverlay.id)}>
                  + Add condition
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {step === 5 ? (
          <>
            <h2>Ready to import</h2>
            <p className="sub">Review and confirm.</p>

            <div className="summary-card">
              <div className="summary-title">{graphName.trim() || "Untitled graph"}</div>
              <div className="summary-stats">
                <div><span>Nodes</span><strong>{stats.nodes}</strong></div>
                <div><span>Edges</span><strong>{stats.edges}</strong></div>
                <div><span>Views</span><strong>{views.length}</strong></div>
                <div><span>Overlays</span><strong>{overlays.length}</strong></div>
                <div><span>View nodes</span><strong>{selectedViewNodes}</strong></div>
                <div><span>Conditions</span><strong>{totalConditions}</strong></div>
                <div><span>Warnings</span><strong>{validation?.warnings.length ?? 0}</strong></div>
                <div><span>Version</span><strong>v1</strong></div>
              </div>
              <div className="summary-group">
                <span>Views</span>
                <div className="summary-chips">
                  {views.map((view) => (
                    <em key={view.id}>{view.label} ({view.nodes.length})</em>
                  ))}
                </div>
              </div>
              <div className="summary-group">
                <span>Overlays</span>
                <div className="summary-chips">
                  {overlays.map((overlay) => (
                    <em key={overlay.id}>{overlay.label} ({overlay.conditions.length})</em>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}

        <div className="wiz-foot">
          {step === 0 ? (
            <Link className="btn btn-ghost" to={`/project/${projectId}`}>
              Cancel
            </Link>
          ) : (
            <button className="btn btn-ghost" type="button" onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}>
              Back
            </button>
          )}
          <span className="counter">
            {stats.nodes} nodes · {stats.edges} edges
          </span>
          {step < STEP_LABELS.length - 1 ? (
            <button className="btn btn-primary" type="button" disabled={!canNext} onClick={goNext}>
              {step === 4 ? "Review" : "Next"}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              type="button"
              disabled={isImporting || !graphPayload || !canNext}
              onClick={commitGraph}
            >
              {isImporting ? "Importing" : "Import graph"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
