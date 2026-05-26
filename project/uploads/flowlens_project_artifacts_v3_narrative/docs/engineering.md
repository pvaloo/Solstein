# FlowLens Engineering Decisions

## Engineering Goal

The first engineering goal is to create a polished, frontend-only, schema-driven graph viewer. The implementation should prioritise visual quality, interaction quality, and architectural clarity over platform completeness.

The product should be easy to run locally, easy to modify, and easy to feed with different JSON graph files. It should not require backend infrastructure in the first version.

## Technology Stack

The recommended frontend stack is React, TypeScript, and Vite. React provides the component model, TypeScript provides schema and data safety, and Vite provides a fast development loop.

React Flow should be used for graph rendering. It is well suited for node-edge interfaces, custom nodes, custom edges, pan and zoom, and interactive graph canvases. It gives the project a strong starting point without requiring a custom graph rendering engine.

Framer Motion should be used for animation where appropriate. It can support smooth panel transitions, node focus states, overlay transitions, and replay effects. React Flow handles the graph structure, while Framer Motion can help make the surrounding experience feel polished and cinematic.

Tailwind CSS is recommended for styling. It allows rapid iteration and makes it easier to maintain a consistent visual language across panels, buttons, badges, cards, and layout components.

Zustand is recommended for state management. The state needs are meaningful but not heavy enough to justify a larger framework. Zustand can manage active graph, selected element, active view, active overlays, replay state, and UI state.

## JSON-First Implementation

The application should load graph data from JSON. All rendered nodes, edges, overlays, views, and scenarios should derive from this data.

This is important for two reasons. First, it reinforces the product principle that the graph is the source of truth. Second, it makes the prototype easy to adapt to different examples. A developer should be able to swap `generic-booking-flow.json` for another graph file and render a different operational map without changing application logic.

## Type Safety

The project should define TypeScript types for FlowLens nodes, edges, metadata, views, overlays, scenarios, and evidence. These types should map closely to the schema specification.

Strong typing will help prevent inconsistencies between JSON data and rendering behaviour. It will also make future development easier when editing, validation, AI ingestion, or querying are added.

## Validation

The app should include basic schema validation early. At a minimum, it should detect duplicate node IDs, missing node references in edges, unknown node types, unknown edge types, and missing required fields.

Manual JSON authoring will be part of the early workflow, so validation will save time and reduce confusion.

## Rendering Strategy

The graph renderer should not contain client-specific logic. For example, it should not highlight a node because its label is “Underwriting” or “Booking Portal.” It should highlight based on type and metadata.

This discipline is what keeps FlowLens generic.

## Inspector Rendering

The inspector should be built as a flexible metadata renderer with type-specific enhancements. The first version can render known sections such as summary, ownership, technical details, data, governance, risk, evidence, and open questions. It should gracefully handle missing fields.

The inspector should be designed with enough flexibility to support very different node and edge types. A spreadsheet, API, database, process, and manual transfer all need different detail emphasis.

## Deployment

The initial deployment can be local-only. If a shareable demo is needed, static hosting through Vercel, Netlify, or Cloudflare Pages should be sufficient as long as no sensitive client data is included.

Client-specific graphs should be handled carefully. Until security and IP boundaries are clear, the safest model is local use or static read-only exports without sensitive real data.

## Deferred Engineering Work

The following should be deferred: authentication, backend persistence, multi-user collaboration, graph database, AI capture, natural language extraction, enterprise security, permissions, and full editing UI.

These are legitimate future capabilities, but they should not compromise the first polished viewer.
