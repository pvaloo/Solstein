# FlowLens Schema Specification

## Purpose

The FlowLens schema defines the machine-readable structure that drives the entire product experience. It is the contract between the hand-authored or generated graph data and the visual application.

The schema should be expressive enough to represent operational flows, technical architecture, data lineage, overlays, views, evidence, and replay scenarios. It should also remain simple enough that a consultant or developer can author example graphs manually in JSON during the early stages of the product.

## Root Object

A FlowLens graph is represented as a single JSON object with several top-level sections.

```json
{
  "project": {},
  "domainPack": {},
  "nodes": [],
  "edges": [],
  "views": [],
  "overlays": [],
  "scenarios": [],
  "evidence": []
}
```

Each section has a distinct responsibility. The `project` section identifies the graph. The `domainPack` section optionally maps generic concepts to industry-specific language. The `nodes` and `edges` sections define the graph itself. The `views` section defines different perspectives over the graph. The `overlays` section defines semantic highlighting rules. The `scenarios` section defines replayable journeys. The `evidence` section defines source material used to support graph claims.

## Project Metadata

The project object provides context for the graph.

```json
{
  "project": {
    "id": "generic_booking_flow",
    "name": "Generic Booking Flow",
    "domain": "Generic Operations",
    "version": "0.1",
    "createdAt": "2026-05-19"
  }
}
```

The project object should not contain detailed graph information. It exists to describe the map as a whole.

## Node Structure

Every node should include an ID, type, label, optional description, and metadata object.

```json
{
  "id": "booking_portal",
  "type": "application",
  "label": "Booking Portal",
  "description": "Customer-facing application used to request and confirm appointments.",
  "metadata": {
    "businessOwner": "Digital",
    "technicalOwner": "Platform Engineering",
    "hosting": "AWS",
    "technology": "React / Node",
    "confidence": "medium",
    "maturity": "partially_validated",
    "containsPii": true,
    "riskLevel": "medium"
  }
}
```

The `id` should be stable and unique. The `type` should use the taxonomy. The `label` should be human-readable and suitable for display on the canvas. The `description` should explain what the node represents. The `metadata` object provides the semantic richness that powers overlays, filtering, inspection, and future querying.

## Edge Structure

Every edge should include an ID, source node, target node, type, label, and metadata object.

```json
{
  "id": "portal_calls_availability_api",
  "from": "booking_portal",
  "to": "availability_api",
  "type": "api_call",
  "label": "Checks availability",
  "metadata": {
    "protocol": "REST",
    "format": "JSON",
    "latency": "real_time",
    "security": "OAuth2",
    "confidence": "high"
  }
}
```

Edges are where much of the architecture value lives. They reveal the mechanisms by which information moves, systems interact, processes are implemented, and risks emerge.

## Metadata Model

Metadata should remain flexible but consistent. Common metadata fields include ownership, confidence, maturity, lifecycle stage, automation level, criticality, risk level, data classification, PII status, regions, evidence references, system-of-record status, hosting, technology, protocol, format, monitoring, and open questions.

The metadata model must support the right-hand inspector panel. The inspector panel should be able to render rich information from any selected node or edge. This means metadata should be designed not only for filtering but also for human interpretation.

For example, a technical edge might include protocol, schedule, data format, monitoring, error handling, and security. A process node might include business owner, automation level, open questions, evidence, and related systems. A data object might include classification, fields, system of record, retention, and downstream consumers.

## Views

Views define graph lenses. A view determines which node and edge types are emphasised or included.

```json
{
  "id": "technical_view",
  "label": "Technical Architecture",
  "includeNodeTypes": ["application", "api", "database", "pipeline", "spreadsheet"],
  "includeEdgeTypes": ["implemented_by", "api_call", "db_read", "db_write", "manual_rekey"]
}
```

Views should not create separate graphs. They should filter or emphasise the same underlying graph.

## Overlays

Overlays define semantic highlighting rules.

```json
{
  "id": "pii",
  "label": "PII",
  "match": {
    "metadata.containsPii": true
  }
}
```

The initial implementation can handle overlays in application logic rather than through a fully generic rules engine. However, the schema should anticipate configurable overlays in the future.

## Scenarios

Scenarios define replayable sequences.

```json
{
  "id": "happy_path_booking",
  "label": "Happy Path Booking",
  "steps": [
    {
      "edgeId": "customer_starts_booking",
      "action": "animate_flow",
      "durationMs": 900
    },
    {
      "nodeId": "availability_decision",
      "action": "pulse_node",
      "durationMs": 700
    }
  ]
}
```

Replay mode is important because it turns a static map into a story. It allows users to watch an operational journey unfold while also seeing the technical and data architecture underneath.

## Evidence

Evidence objects allow the graph to reference source material.

```json
{
  "id": "workshop_001",
  "type": "workshop",
  "label": "Operations discovery workshop",
  "date": "2026-05-19",
  "excerpt": "Manual exceptions are tracked in a spreadsheet and reviewed weekly."
}
```

Evidence is important because FlowLens will often be used in uncertain discovery environments. The product should help users distinguish validated facts from assumptions.
