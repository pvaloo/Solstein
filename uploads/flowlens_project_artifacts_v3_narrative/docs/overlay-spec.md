# FlowLens Overlay Specification

## Purpose

Overlays are semantic lenses that reveal hidden properties of the graph without changing the underlying model. They are one of the main ways FlowLens turns structured graph data into insight.

A view determines what perspective the user is looking through. An overlay determines what meaning is highlighted within that perspective.

## Overlay Behaviour

An overlay should not simply turn elements on and off. It should guide attention. Relevant nodes and edges should become more visually prominent through glow, thickness, pulse, colour, or focus. Less relevant elements should recede through opacity, blur, or reduced contrast.

The aim is for the user to activate an overlay and immediately see something they did not see before.

## PII Overlay

The PII overlay highlights nodes and edges that contain, process, transmit, or store personally identifiable information or sensitive data.

This overlay should use a strong but refined visual treatment, likely purple or violet. Databases, data stores, applications, documents, inputs, outputs, and edges involving PII should become prominent. Unrelated elements should fade.

The PII overlay is especially valuable because it connects operational flows to data governance and security concerns. It should help users answer: where does sensitive data enter, where is it stored, where does it move, and what systems touch it?

## Manual Process Overlay

The manual process overlay highlights human workarounds, manual transfers, spreadsheets, email handoffs, copy-paste flows, manual approvals, and manual rekeying.

This overlay should likely use amber or orange. Manual edges may pulse or appear less stable than automated flows. Spreadsheets should become especially visible because they often represent hidden operational systems.

This overlay is important because manual processes are often where operational risk and transformation opportunity live.

## Unknowns Overlay

The unknowns overlay highlights low-confidence nodes, assumed relationships, undocumented systems, unclear ownership, and open questions.

Unknowns should not look like errors. They should look like explicit discovery gaps. A dashed outline, grey styling, reduced opacity, or question indicator can communicate uncertainty.

This overlay is valuable because it makes the discovery process visible. It allows the team to say: these are the areas that need validation before design or implementation can proceed confidently.

## High Risk Overlay

The high-risk overlay highlights elements marked with elevated risk. This may include brittle integrations, unmonitored pipelines, manual spreadsheet dependencies, lack of ownership, unsupported legacy systems, poor data quality, or sensitive data without clear controls.

This overlay should use red carefully. It should be strong enough to draw attention but not so aggressive that every risk state feels catastrophic.

The high-risk overlay turns FlowLens into a prioritisation tool.

## Regional Variation Overlay

The regional variation overlay highlights differences across markets, regions, business units, or client contexts.

This overlay should help users see where a process or architecture is standardised and where it diverges. Region-specific nodes and edges should become visible, and duplicated systems or alternate paths should be easy to identify.

This is especially useful for rollout, standardisation, and transformation engagements.

## System of Record Overlay

The system-of-record overlay highlights authoritative sources for key data objects.

This overlay is critical for data architecture conversations. It should help users answer: where is the truth for customer, account, request, appointment, agreement, entitlement, transaction, or assessment data?

Systems of record should be visually distinct, perhaps with a strong blue highlight or badge. Related data lineage paths should also be emphasised.

## Overlay Combinations

Multiple overlays may be active simultaneously. For example, a user may activate both PII and manual process overlays to find manual handling of sensitive data. This is where FlowLens can become especially powerful.

The implementation should define clear precedence rules so that overlay combinations remain readable. High risk may override other colours, or combined states may show multiple badges while preserving one dominant highlight colour.

## Inspector Integration

Overlays should affect the inspector panel as well as the canvas. If a user selects a node while the PII overlay is active, the inspector should foreground data classification, PII fields, access controls, and downstream movement. If the manual overlay is active, the inspector should foreground automation level, manual steps, failure modes, and risks.

This connection between overlay state and detail panel will make the product feel coherent and intelligent.
