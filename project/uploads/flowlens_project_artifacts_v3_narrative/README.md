# FlowLens

FlowLens is a schema-driven operational and data architecture intelligence prototype. Its purpose is to help a consultant, architect, or transformation team turn fragmented knowledge about how an organisation works into an interactive, inspectable, and visually compelling graph.

The project is intentionally positioned between several familiar categories without being reducible to any one of them. It is partly a service blueprinting tool, partly a data architecture map, partly a system dependency viewer, partly a lineage explorer, and partly a consulting artifact generator. The connective idea is that modern organisations are difficult to understand because work, data, decisions, people, systems, documents, APIs, spreadsheets, and controls are all entangled. FlowLens provides a way to represent that entanglement as a structured graph and then explore it through layered visual views.

The initial version is deliberately not a full SaaS platform. It is a polished, frontend-only, JSON-driven viewer that can load a hand-authored graph and turn it into a cinematic operational map. This constraint is important. The first objective is not to build collaboration, authentication, persistence, AI extraction, or a full graph editor. The first objective is to prove that a structured model of operational and technical reality can become a powerful visual and consulting artifact.

## Repository Structure

```text
flowlens_project/
├── README.md
└── docs/
    ├── architecture.md
    ├── component-spec.md
    ├── engineering.md
    ├── mvp-scope.md
    ├── overlay-spec.md
    ├── principles.md
    ├── schema-spec.md
    ├── taxonomy.md
    ├── view-modes.md
    ├── viewer-spec.md
    ├── vision.md
    └── visual-language.md
```

## Current State

This repository currently contains the product and implementation definition documents. These are designed to brief a developer clearly before implementation begins. The next step is to create example JSON graphs and use them to drive the first React Flow prototype.
