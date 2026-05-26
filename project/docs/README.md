# Solstein — Handover Documentation

> **Prototype:** the files in this repo are the source of truth for design intent. The HTML pages are interactive mockups; `/src/*.jsx` is the working canvas implementation. This `/docs` folder is the engineering handover narrative — read these before building the production version.

## What Solstein is

Solstein is a cinematic operational and data architecture intelligence tool. It takes a structured graph of how an organisation actually works — systems, data, workflows, decisions, ownership, risk — and turns it into a living, explorable visual map.

The product centres on a single canvas with:
- **Views** that filter which node and edge types are visible (e.g. "Journey View" vs "Technical Architecture")
- **Lenses** (a.k.a. overlays) that highlight nodes and edges matching metadata conditions (e.g. "PII", "High Risk", "Manual Process")
- A **layout engine** that computes node positions per view, with optional manual overrides
- An **import wizard** that brings JSON graphs into the workspace and configures views + lenses
- An **operator portal** (separate subdomain) for user/invitation administration

## How to view the prototype

Open `canvas.html` to see the main product surface. Every other HTML file at the project root is one screen of the surrounding product (workspace, project, auth, operator portal, legal, error pages).

All pages link `solstein-tokens.css` — the design tokens are the visual contract.

## Reading order

1. **[01-architecture.md](01-architecture.md)** — file map, component tree, load order
2. **[02-routes-and-navigation.md](02-routes-and-navigation.md)** — page → URL mapping, auth gating
3. **[03-roles-and-permissions.md](03-roles-and-permissions.md)** — two-axis role model (workspace × project)
4. **[04-canvas-data-model.md](04-canvas-data-model.md)** — schema (the heart of the product)
5. **[05-canvas-behaviour.md](05-canvas-behaviour.md)** — interactions, layout engine, edit mode, replay, lenses
6. **[06-import-wizard.md](06-import-wizard.md)** — step-by-step flow + validation rules
7. **[07-lifecycle-flows.md](07-lifecycle-flows.md)** — rename / duplicate / archive / delete / restore / transfer
8. **[08-empty-states.md](08-empty-states.md)** — catalogue of empty / loading / error states
9. **[09-state-and-persistence.md](09-state-and-persistence.md)** — what lives in localStorage, what needs a backend
10. **[brand-system.md](brand-system.md)** — visual + verbal system (tokens, type, motion, voice, a11y)
11. **[email-copy.md](email-copy.md)** — transactional email content
12. **[decisions.md](decisions.md)** — design decisions log + open questions
