# FlowLens Architecture

## Architectural Overview

FlowLens should be architected as a schema-driven frontend application. The first implementation should be local-first and JSON-first. The graph data should be loaded from static JSON files, transformed into application state, and rendered through a visual graph engine.

The architecture can be understood as four layers: capture, graph schema, visualisation, and interaction intelligence.

```text
Capture / Authoring
        ↓
Graph Schema
        ↓
Rendering + Layout
        ↓
Views, Overlays, Inspector, Replay
```

The capture layer may initially be manual. A consultant writes or curates JSON based on workshop notes and discovery outputs. Later, capture may include structured forms, natural language extraction, AI-assisted graph generation, or diagram import. However, the MVP should not require those capabilities.

## Graph Schema Layer

The graph schema is the foundation. It defines the objects and relationships that the application can render and reason about. Every node and edge should be typed. Metadata should be rich enough to power overlays, inspection, and future querying.

The schema should be deliberately independent from the rendering layer. React Flow is a rendering technology, not the product model. The FlowLens graph should be representable without React Flow. This separation makes the product more robust and gives future flexibility if the visual library changes.

## Rendering Layer

The rendering layer turns FlowLens nodes and edges into visual components. It should handle node styling, edge styling, layout, pan and zoom, selection, hover states, and animation.

The rendering layer should preserve the distinction between what is shown on the canvas and what is shown in the inspector. The canvas should render enough information to orient the user and communicate structure. It should not try to display every metadata field.

## View Layer

Views are semantic lenses over the graph. A journey view may emphasise actors, processes, decisions, and states. A technical view may emphasise applications, APIs, databases, and integrations. A data lineage view may emphasise data objects, data stores, transformations, and reporting. These should all be derived from the same underlying graph.

This architecture is important because it prevents the product from creating disconnected diagrams. A single system can appear in multiple views, but its metadata and relationships remain consistent.

## Overlay Engine

The overlay engine computes highlighting based on metadata. For example, the PII overlay should identify nodes and edges where `containsPii` is true. The manual process overlay should identify manual steps, manual transfers, spreadsheets, and manual rekeying. The risk overlay should identify high-risk nodes, fragile dependencies, and low-confidence assumptions.

In the first implementation, overlay logic can be coded directly in the frontend. Over time, overlay definitions may become configurable through JSON.

## Inspector Layer

The inspector layer is one of the most important architectural components. It is responsible for rendering the detailed semantic content of the selected graph element.

A selected node or edge should hydrate the inspector with structured sections. For a technical node, these might include hosting, vendor, technology, owner, data classification, access model, system-of-record status, monitoring, known issues, evidence, and open questions. For an operational process, the inspector might show owner, automation level, associated systems, data objects, risks, regions, and evidence. For an edge, it might show mechanism, protocol, format, schedule, latency, security, error handling, and data objects moved.

The inspector is the bridge between visual exploration and serious architecture understanding.

## Replay Engine

The replay engine executes scenario definitions from JSON. A scenario is a sequence of node and edge activation steps. During replay, the canvas should guide the user through the operational flow while showing technical interactions underneath.

Replay mode should feel like watching a system operate. It is both a storytelling device and a comprehension tool.

## Future Architecture

Future versions may add a persistence layer, graph database, query engine, AI-assisted capture service, collaboration features, and hosted read-only exports. These should be treated as later architectural extensions, not MVP requirements.
