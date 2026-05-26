# FlowLens Visual Language

## Desired Feel

FlowLens should feel cinematic, alive, and technically credible. The product should immediately stand apart from conventional architecture diagrams, static service blueprints, and whiteboard-style tools.

The visual direction should draw more from observability dashboards, intelligence platforms, graph exploration tools, and high-end technical products than from traditional diagramming software. It should feel like the organisation’s operational and data architecture has been turned into a living system map.

## The Balance Between Wow and Utility

The first impression should be visually impressive. The user should see depth, motion, glow, and layered structure. However, the product cannot rely on visual drama alone. Every visual decision should help the user understand structure, movement, risk, ownership, or technical dependency.

The product should be beautiful enough to create attention, but useful enough to sustain it.

## Canvas Visual Style

The canvas should use a dark, high-contrast environment that allows nodes, edges, overlays, and animated flows to stand out. A subtle grid or spatial background may help communicate structure, but it should not dominate.

Nodes should feel like objects in a system, not flat boxes. Soft shadows, rounded corners, subtle gradients, and focus glows can help create depth. However, styling should remain restrained enough that dense graphs do not become visually noisy.

Edges should feel dynamic. Animated pulses or packets should move along edges during replay or when flow animation is active. Directionality should be clear. Manual flows, API calls, database writes, and lineage transformations may have different edge treatments, but the system should avoid becoming visually chaotic.

## Node Styling

Node styling should communicate category at a glance. Operational nodes can feel slightly softer and more human-centred. Technical nodes can feel more structured and precise. Governance and risk nodes should use stronger semantic signals.

The node should usually show only the most essential information: label, type indicator, and perhaps one or two badges. Examples of useful badges include PII, high risk, unknown, manual, system-of-record, or low confidence.

The node should not attempt to show the full metadata record. Doing so would destroy the clarity of the canvas.

## The Inspector as a Visual Counterweight

The right-hand inspector panel is the necessary counterweight to the restrained canvas. The canvas should be elegant and readable; the inspector should be dense and informative.

The visual design of the inspector should feel like a premium technical detail panel. It should contain sections, badges, metadata rows, evidence references, open questions, and perhaps lineage snippets. It should make the selected node or edge feel rich and inspectable.

A good mental model is that the graph is the map, and the inspector is the intelligence dossier.

## Motion Language

Motion should be smooth, deliberate, and meaningful. Flow animations should show movement of data, decisions, or operational sequence. Selection transitions should guide attention. Overlay transitions should reveal semantic structure by fading, glowing, or dimming relevant elements.

The motion should feel slick and modern, but not excessive. If everything moves all the time, nothing feels important. Motion should be strongest during replay, overlay activation, and focus transitions.

## Overlay Visuals

Overlays should change the user’s understanding of the graph. A PII overlay should make sensitive information paths obvious. A manual-process overlay should reveal fragility. A risk overlay should expose hotspots. An unknowns overlay should make discovery gaps visible.

The visual treatment of overlays should combine highlighting and de-emphasis. Relevant elements should glow, pulse, thicken, or brighten. Irrelevant elements should fade into the background. This contrast is what creates insight.

## Colour Semantics

Colour should be used semantically and consistently.

Purple can represent PII or sensitive data. Amber can represent manual work or operational friction. Red can represent high risk. Blue can represent systems and integrations. Green can represent validated, healthy, or completed states. Grey can represent unknown, deprecated, or low-confidence areas.

These colours should be used carefully. Overuse will reduce their meaning.

## Information Density

FlowLens should support two levels of density.

At the graph level, information density should be controlled. The graph should show structure, relationship, flow, and semantic badges. At the inspector level, information density can be much higher. This separation is essential.

The product should not try to solve complexity by putting more labels on the canvas. It should solve complexity through views, overlays, progressive disclosure, and inspection.
