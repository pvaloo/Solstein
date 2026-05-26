# FlowLens Component Specification

## Overview

The FlowLens frontend should be built as a set of focused components that separate graph rendering, semantic filtering, replay, and inspection. The application should remain schema-driven throughout. Components should receive graph data and state rather than contain client-specific logic.

## GraphCanvas

`GraphCanvas` is the core rendering surface. It is responsible for displaying the graph, supporting pan and zoom, rendering nodes and edges, coordinating selection, and applying the active view and overlay states.

This component should not directly contain all business logic. Instead, it should receive derived graph state from selectors or helper functions. For example, if the PII overlay is active, the graph elements should already be marked with semantic display states such as highlighted, dimmed, or pulsing before they are rendered.

The canvas should provide the spatial and cinematic experience of FlowLens. It should feel fluid and responsive.

## NodeCard

`NodeCard` renders a single graph node. It should understand node category and node type, but it should not hardcode client-specific labels or behaviours.

Node cards should display concise information only. The usual content should be label, type, icon, and selected badges. The component should handle hover, focus, selected, dimmed, highlighted, and risk states.

The node card should be visually polished because nodes define the basic look of the product.

## AnimatedEdge

`AnimatedEdge` renders relationships between nodes. It should support different edge states, such as normal, selected, dimmed, highlighted, replay-active, manual, risky, or PII-related.

Animated edges are central to the product’s sense of life. During replay, they should clearly show flow direction and progression. During overlays, they should communicate semantic meaning without overwhelming the graph.

## OverlayPanel

`OverlayPanel` provides controls for activating semantic overlays. It should allow users to toggle overlays such as PII, manual processes, unknowns, high risk, regional variation, and system-of-record.

The panel itself should be simple. The complexity belongs in the overlay engine, not in the UI component. The panel should communicate what each overlay means and allow quick switching.

## ViewSwitcher

`ViewSwitcher` allows users to change the graph lens. It should support views such as journey, technical architecture, data lineage, governance, risk, and combined view.

Switching views should feel like changing perspective on the same system, not opening an unrelated diagram. The component should coordinate with graph state so transitions are smooth and comprehensible.

## InspectorPanel

`InspectorPanel` is one of the most important components in the product.

When a user selects a node or edge, the inspector should render a structured, information-rich view of that object. It should include summary, type, ownership, metadata, data handled, technical details, risks, evidence, open questions, and related graph elements where relevant.

This panel should not be treated as optional. Without it, FlowLens risks becoming a beautiful but shallow graph. With it, the product becomes a serious operational and data architecture exploration tool.

The inspector should be designed to handle different object types gracefully. A database node, an API edge, a manual spreadsheet, a process, and a risk node will all have different relevant metadata. The inspector should adapt based on available fields.

## ReplayController

`ReplayController` manages scenario playback. It should allow the user to start, pause, reset, and step through a scenario. It should coordinate with graph state so that active nodes and edges animate in sequence.

Replay is both a demo mechanism and a comprehension feature. It should help the user understand how a flow unfolds over time.

## GraphLoader

`GraphLoader` loads JSON graph files and passes them into application state. It should be responsible for parsing and basic validation. In early versions, this may simply import local JSON files. Later, it may support file upload, project selection, or remote loading.

## SchemaValidator

`SchemaValidator` checks whether the graph data is usable. It should detect missing IDs, duplicate IDs, broken edge references, unknown node types, unknown edge types, and missing required fields.

This component is important because early graph data will be manually authored. Good validation will save time and prevent confusing rendering errors.

## LayoutManager

`LayoutManager` determines how the graph is positioned. In the MVP, curated positions may be sufficient for demo graphs. Later, automatic layout using ELK, Dagre, or other graph layout libraries may be added.

Graph layout is critical to perceived quality. A poorly laid-out graph will make the product feel broken even if the schema is strong.
