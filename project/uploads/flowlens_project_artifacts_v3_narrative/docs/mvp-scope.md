# FlowLens MVP Scope

## Objective

The MVP should prove one specific thing: a hand-authored structured graph can become a visually impressive, technically meaningful, and consulting-grade interactive operational map.

The MVP is not a full product. It is a focused viewer. It should be polished enough to use in conversation with internal stakeholders and potentially in a client discovery setting, but it should avoid the complexity of becoming a platform too early.

## What the MVP Must Do

The MVP must load a JSON graph and render it as an interactive visual experience. The graph should include operational nodes, technical nodes, information nodes, and governance nodes. It should allow the user to switch between different views, activate overlays, inspect detailed metadata, and run a replay sequence.

The application should make the user feel that the graph represents a living system rather than a static diagram. Animated edges, smooth transitions, and polished visual states are central to the MVP.

## The Viewer Is the Product Surface

The viewer should be treated as the first real expression of the product. It should not feel like a placeholder UI around a schema. The graph canvas, side controls, inspector panel, and replay behaviour together define how FlowLens will be perceived.

The right-hand inspector is particularly important. It is the surface that turns a beautiful graph into a serious tool. Without it, the product risks being dismissed as visual theatre. With it, a stakeholder can click into a system, API, database, process, or data object and understand the underlying details.

## Included Features

The MVP should include a React-based graph canvas with custom node rendering, animated edges, view switching, overlay toggles, a detailed inspector panel, and a replay controller. It should load static JSON files and require no backend.

The supported views should include at least journey view, technical view, data lineage view, and risk view. The supported overlays should include PII, manual process, unknowns, high risk, and system-of-record.

The MVP should include at least one strong example graph that demonstrates the full concept. A generic booking or request fulfilment flow is likely the best first example because it can represent many real-world processes without being tied to one industry.

## Excluded Features

The MVP should explicitly exclude user authentication, persistence, multi-user collaboration, drag-and-drop editing, database-backed projects, AI extraction, natural language capture, enterprise integrations, permissions, and production-grade hosting.

These exclusions are important. If the MVP tries to become an editor, collaboration system, and AI platform at once, it will not be polished enough where it matters most. The MVP should win through clarity, visual quality, and schema-driven insight.

## Success Criteria

The MVP succeeds if a user can open the application, view a graph, switch views, activate overlays, inspect a node or edge, and run a replay scenario without explanation.

More importantly, it succeeds if the experience makes the user understand something meaningful about the operational and technical flow. The benchmark is not whether it can draw a graph. The benchmark is whether it can reveal hidden complexity better than a static Miro board, Lucidchart, PowerPoint diagram, or spreadsheet.
