# FlowLens Product Principles

## Schema First, Visuals Second

FlowLens should be designed around a structured graph model before it is designed around a canvas. The most important product decision is that nodes and edges represent meaningful operational and technical concepts, not arbitrary visual shapes.

This principle protects the product from becoming a prettier version of a diagramming tool. A diagramming tool focuses on where a shape appears and what it looks like. FlowLens focuses on what the object is, what it represents, how it relates to other objects, what evidence supports it, what risks are attached to it, and how it participates in operational and technical flows.

The visual layer should always be generated from the underlying schema. If a node is highlighted in a PII overlay, that should be because the node has metadata indicating that it contains or handles PII, not because someone manually coloured it purple. If an edge pulses in a manual-process overlay, that should be because its type or metadata identifies it as manual transfer, manual rekeying, or human review.

## One Graph, Multiple Lenses

FlowLens should maintain one underlying graph and allow users to view it through different lenses. A service designer may want to see the journey. A data architect may want to see lineage. A CTO may want to see systems and dependencies. A governance lead may want to see PII, controls, retention, and evidence. These should not be separate diagrams that drift apart over time. They should be different views over the same graph.

This principle is fundamental to the value proposition. A single process can be seen as a customer journey, a sequence of operational steps, a set of system interactions, a data lineage path, and a risk surface. FlowLens should make those perspectives interchangeable without requiring the organisation to maintain multiple disconnected artifacts.

## Operational Context, Technical Depth

The operational layer provides narrative context, but the product’s distinctive value comes from linking that context to technical and data architecture.

FlowLens is not primarily business process modelling. It should not become a general-purpose BPM system. The operational layer matters because it explains why the technical architecture exists and how users experience it. The data and technical layers matter because they reveal what actually supports the operational flow.

The product should therefore bias toward exposing systems, APIs, databases, spreadsheets, warehouses, pipelines, transformations, integration platforms, SaaS tools, controls, and data stores. The goal is to answer not only “what happens?” but “what technically makes this happen, where does the data go, who owns it, and what are the risks?”

## Cinematic but Not Gimmicky

The product should feel visually impressive. It should use motion, glow, depth, transitions, and animation to create a sense that the organisation’s flows are alive. However, visual polish must serve comprehension.

Animations should communicate meaning. A moving packet along an edge should imply data movement, process progression, API interaction, or replay sequence. A pulsing red edge should mean risk, not decoration. A fading node should show that it is out of scope for the current view or overlay. Motion should guide attention and reveal structure, not distract from analysis.

## The Inspector Panel Is a First-Class Surface

The main graph canvas cannot and should not carry all detail. If the canvas attempts to show every field, label, risk, owner, data object, technology, evidence reference, and open question, it will become unreadable. The right-hand inspector panel is therefore essential to the product architecture.

The graph is for orientation, pattern recognition, and storytelling. The inspector is for depth, evidence, and trust. A user should be able to click any node or edge and immediately understand what it is, why it matters, how confident the team is, what data it handles, what technology it uses, who owns it, what risks exist, what evidence supports it, and what questions remain open.

This second panel turns FlowLens from a beautiful graph into a serious consulting and architecture tool.

## Unknowns Are Valuable

FlowLens should treat uncertainty as a first-class concept. In many discovery engagements, the most important output is not only what is known, but what is not yet known.

Unknown systems, unclear ownership, undocumented integrations, suspected manual workarounds, and low-confidence assumptions should all be visible in the graph. These should not be hidden because they are messy. They are precisely the kinds of things that make enterprise transformation difficult.

This principle makes FlowLens especially useful in early discovery. The graph can represent the current state of knowledge without pretending that everything is validated.

## Human-Curated Intelligence

AI may become an important supporting capability, but FlowLens should not depend on AI as its core value. The first versions should assume that a knowledgeable consultant or architect curates the graph. Natural language capture and AI extraction can later accelerate this process, but they should create draft suggestions, not unquestioned truth.

The value of FlowLens comes from combining structured representation with human judgement. The consultant interprets, validates, resolves ambiguity, and decides what matters.

## Generic Core, Domain-Specific Extensions

The core schema should remain domain-neutral. It should not know about insurance policies, credit card limits, broadband renewals, or test drive bookings as native concepts. Instead, it should know about generic concepts such as party, account, request, agreement, case, appointment, entitlement, asset, assessment, communication, and decision record.

Domain-specific terminology should be layered on through domain packs or aliases. This allows FlowLens to apply across industries while still feeling natural in a specific engagement.
