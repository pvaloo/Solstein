# FlowLens View Modes

## Purpose

FlowLens view modes allow users to explore the same graph from different perspectives. This is one of the most important product concepts.

The graph should not fragment into multiple disconnected diagrams. Instead, the same underlying operational and technical model should be viewed through different lenses. Each lens emphasises certain node types, edge types, and semantic relationships.

## Journey View

Journey View focuses on the operational story. It shows the people, roles, processes, decisions, states, and outputs that define how work happens from a user or operational perspective.

This view is useful for service designers, product managers, and non-technical stakeholders. It answers questions such as: who does what, what are the main steps, where do decisions happen, what states does the journey move through, and what outputs are produced?

Journey View should be visually cleaner than the technical views. It should not expose every downstream database or pipeline by default. Its role is to establish context.

## Technical Architecture View

Technical Architecture View reveals the systems and integrations that implement the operational flow.

This view should show applications, APIs, databases, cloud services, integration platforms, identity services, external SaaS tools, and system dependencies. It answers questions such as: what systems support this process, how do they connect, what APIs are involved, where is the data written, what systems are manual, and where are fragile integrations?

This is one of the most important views for the intended positioning of FlowLens because the product is strongly oriented around data and technical architecture visibility.

## Data Lineage View

Data Lineage View focuses on the movement and transformation of data. It should show data objects, databases, warehouses, lakes, pipelines, transformations, BI tools, dashboards, and reporting outputs.

This view answers questions such as: where does a data object originate, where is it stored, how is it transformed, what downstream reports depend on it, what is the system of record, and where are manual data movements?

Data Lineage View should be able to expose both formal data architecture and informal architecture such as spreadsheets, CSV exports, and manually maintained trackers.

## Governance View

Governance View focuses on ownership, controls, compliance, and evidence. It should show controls, sensitive data, access models, retention requirements, evidence references, data owners, and technical owners.

This view answers questions such as: who owns this system, who owns this data, what controls apply, where is PII handled, what evidence supports this mapping, and which parts are validated or assumed?

Governance View is especially useful in regulated or security-sensitive environments.

## Risk View

Risk View reveals fragility, uncertainty, and operational exposure. It should highlight high-risk nodes, manual processes, spreadsheets, unknowns, low-confidence edges, unsupported dependencies, and missing ownership.

This view is valuable in consulting because it turns a descriptive map into an analytical artifact. It helps teams identify where to investigate, where to simplify, where to standardise, and where implementation risk is concentrated.

## Combined View

Combined View should allow users to see operational and technical layers together. This is where FlowLens is most distinctive.

For example, a process node might sit near the application that implements it, which connects to an API, which writes to a database, which flows into a warehouse, which feeds a dashboard. This view can be more complex, but it provides the full picture.

Combined View should be used carefully. It may require progressive disclosure, clustering, or expand/collapse behaviours to avoid overwhelming the user.
