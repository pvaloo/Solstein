# FlowLens Viewer Specification

## Purpose

The FlowLens viewer is the first and most important product surface. It is the application through which users experience the operational graph. The viewer must make structured graph data feel alive, understandable, and valuable.

The viewer should not feel like a technical demo. It should feel like a polished operational intelligence interface that a consultant could confidently show to colleagues or stakeholders.

## Layout

The viewer should use a three-zone layout: a left control area, a central graph canvas, and a right inspector panel.

The central canvas is the visual and emotional centre of the product. It should display the graph with depth, motion, and hierarchy. It should support zooming, panning, selection, animated flows, and overlay-driven focus states.

The left control area should contain view switching, overlay toggles, and replay controls. It should be compact and functional, not visually dominant.

The right inspector panel is the detail surface. It should slide in or be persistently available depending on the design, but it must feel like a premium part of the interface. It should not be an afterthought. When the user selects a node or edge, the inspector should make the graph’s underlying intelligence visible.

## Graph Canvas

The graph canvas should present nodes and relationships in a way that feels modern and cinematic. Nodes should be visually distinct by category, but not cartoonish. Edges should communicate directionality and flow. Animated edge pulses should make data movement and process progression visible.

The canvas should not show too much text. Labels should be concise. Metadata badges should be limited to high-value indicators such as PII, risk, unknown, manual, or system-of-record. Deeper detail belongs in the inspector.

## Inspector Panel

The inspector panel should answer the question:

> “What do we know about this thing?”

It should display information in structured sections. For example, a selected application might show summary, ownership, technical details, data handled, integrations, governance, risks, evidence, and open questions. A selected API edge might show source, target, protocol, data format, latency, security, monitoring, failure modes, confidence, and evidence.

The inspector panel should support information density. Unlike the canvas, it can contain more detail because the user has intentionally selected something. It should feel like a technical dossier, not a tooltip.

This panel is essential because it preserves the product’s seriousness. The canvas creates the wow factor. The inspector creates credibility.

## View Switching

The viewer should allow users to switch between views without feeling as though they are loading entirely different diagrams. The transition should be smooth. Nodes and edges that are less relevant to the selected view should fade or recede rather than disappear abruptly where possible.

## Overlay Toggles

Overlays should highlight semantic properties such as PII, manual work, unknowns, high risk, regional variation, and system-of-record. The overlay experience should be smooth and legible. Activating an overlay should immediately reveal something meaningful about the graph.

## Replay Mode

Replay mode should guide the user through a defined scenario. It should activate nodes and edges in sequence, animate movement, and optionally update the inspector or highlight narrative steps.

Replay should be one of the most impressive parts of the product. It transforms the graph from a map into a story.

## Non-Goals

The viewer is not a graph editor in the MVP. It should not include drag-and-drop creation, persistent saving, multi-user collaboration, or natural language ingestion. It should focus on rendering and exploring existing graph data beautifully.
