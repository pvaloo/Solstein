# FlowLens Vision

## Product Vision

FlowLens is a cinematic operational and data architecture intelligence layer for understanding how information, systems, workflows, decisions, and technical infrastructure interact inside an organisation.

The starting point for the product is a practical consulting problem. In many transformation, product, service design, and architecture engagements, the first challenge is not designing the future state. The first challenge is understanding the current state. That current state is usually fragmented across people, teams, tools, diagrams, spreadsheets, half-remembered processes, system documentation, legacy workarounds, and undocumented operational habits. The result is that organisations often believe they understand how a service works, but once the details are examined, the real flow of data and operational responsibility is much less clear.

FlowLens exists to make that reality visible. It takes the idea of a service blueprint and extends it downward into the technical and data layers. A user journey or process map becomes the top layer of a deeper operational graph. Beneath it are the applications, APIs, databases, spreadsheets, data warehouses, pipelines, transformations, controls, and ownership structures that actually make the service work.

## What FlowLens Is

FlowLens is not simply a diagramming tool. Traditional diagramming tools allow users to draw boxes and arrows, but those boxes and arrows are usually not semantically rich. They are shapes on a canvas. FlowLens treats every node and relationship as structured data. A database node is not just a rectangle labelled “database”; it can carry ownership, hosting, technology, system-of-record status, data classification, PII flags, confidence, maturity, and evidence. An edge between systems is not merely a line; it can represent an API call, a batch export, a manual rekeying step, a dbt transformation, a webhook, or a file transfer.

This distinction is central. FlowLens is built around an operational graph rather than a visual drawing. The visual experience is a way to explore and communicate the graph, but the graph itself is the source of truth.

## The Core Experience

The desired user reaction is simple:

> “I can finally see how this actually works.”

The experience should feel visually impressive at first glance and analytically useful on inspection. The main canvas should provide a cinematic, living view of the organisation’s flow of information. Nodes should feel alive, edges should animate, overlays should reveal hidden complexity, and replay mode should make the system feel like an operating process rather than a static diagram.

At the same time, FlowLens must not become a superficial visual demo. The second layer of the experience is depth. The right-hand inspector panel is therefore a core product surface, not a minor sidebar. When a user clicks on a node or edge, the product should reveal the information that makes the graph useful: ownership, evidence, data objects, PII status, integration details, technology, confidence, risks, unknowns, system-of-record status, and open questions. The canvas creates understanding; the inspector creates trust and analytical value.

## Why This Matters

In consulting and enterprise transformation work, the most valuable insights often come from connecting what happens operationally to what exists technically. For example, a customer may experience a clean digital journey, but behind it the organisation may rely on manual spreadsheet reconciliation, batch file uploads, unclear ownership, or duplicated data stores. FlowLens is designed to expose these gaps without forcing the team into a traditional enterprise architecture exercise.

This is particularly valuable for consultants who need to bridge non-technical stakeholders, service designers, product teams, data teams, and engineers. FlowLens gives everyone a shared visual object while still preserving enough technical detail for architecture and data discussions.

## Near-Term Goal

The first version of FlowLens should prove that a hand-authored JSON representation of an operational and technical flow can become an impressive interactive viewer. This viewer should support layered views, overlays, animated flows, replay scenarios, and detailed inspection. It should be good enough to use in a real consulting engagement as a distinctive discovery and communication tool.

The initial goal is not to productise FlowLens as a public SaaS application. The initial goal is to build reusable consulting IP: a method, a schema, a visual language, and a tool that can be brought into engagements to improve discovery and communication.

## Long-Term Direction

Over time, FlowLens could evolve into a more complete platform. Future versions may support structured editing, natural language capture, AI-assisted extraction from notes or diagrams, graph querying, collaborative workshops, persistent projects, and read-only client exports. However, these future possibilities should not distract from the immediate objective: build a polished, schema-driven viewer that proves the concept.
