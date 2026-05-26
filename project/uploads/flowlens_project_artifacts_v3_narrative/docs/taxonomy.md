# FlowLens Taxonomy

## Purpose of the Taxonomy

The taxonomy defines the conceptual vocabulary of FlowLens. It determines what kinds of things can exist in the graph and what kinds of relationships can connect them.

The goal is not to create an exhaustive ontology of every possible enterprise object. The goal is to define a practical, generic set of node and edge types that can represent operational flows, technical systems, data movement, governance controls, and uncertainty across many different client contexts.

The taxonomy should remain broad enough to support different industries, but constrained enough that the graph remains understandable and consistent.

## Node Categories

FlowLens nodes are grouped into four broad categories: operational, information, technical, and governance. This categorisation helps the product support different views over the same graph.

### Operational Nodes

Operational nodes describe the human, organisational, and process context in which data and systems operate.

An `actor` represents a person or participant in a flow. This could be a customer, employee, broker, underwriter, advisor, support agent, or operations user. An `organisation` represents a company, department, business unit, vendor, regulator, or partner. A `role` represents a responsibility rather than a named person or team, such as approver, reviewer, administrator, data owner, or service agent.

A `process` represents a business or operational activity, such as booking an appointment, renewing a subscription, approving a request, onboarding a customer, or generating a report. A `decision` represents a point where logic, judgement, policy, or rules determine the next step. A `state` represents the status of an object or journey, such as booking confirmed, application pending, account active, entitlement granted, or case escalated. An `event` represents something that happens and may trigger downstream activity.

These nodes provide the story layer of FlowLens. They explain why the technical architecture matters.

### Information Nodes

Information nodes describe the business data and artifacts that move through the organisation.

A `data_object` represents a logical information object such as customer profile, account, request, case, agreement, entitlement, appointment, transaction, communication, consent, or assessment. A `document` represents a semi-structured or unstructured business artifact such as a contract, PDF, spreadsheet export, uploaded evidence, questionnaire, statement, or generated report.

An `input` is a capture point where information enters the flow. This may be a form, upload, API submission, email, or manually entered record. An `output` is an artifact or result produced by the flow, such as a confirmation, quote, policy, report, dashboard, notification, or approval record. A `metric` represents a measured value or KPI associated with the flow, such as conversion rate, processing time, SLA performance, renewal rate, or data quality score.

These nodes help separate the information being handled from the systems that store or process it.

### Technical Nodes

Technical nodes represent the actual architecture that supports the operational flow.

An `application` is a software system or product surface such as a customer portal, CRM, policy system, booking tool, ecommerce platform, servicing platform, or internal admin console. An `api` represents a technical endpoint, such as a REST API, GraphQL API, internal service, or vendor API. A `database` represents an operational data store, such as Postgres, Oracle, SQL Server, DynamoDB, or another system-specific store.

A `spreadsheet` is intentionally treated as a first-class technical node. In real organisations, spreadsheets frequently function as operational systems, exception trackers, reconciliation tools, or shadow databases. Making them visible is important because they often represent fragility.

A `data_warehouse`, `data_lake`, `pipeline`, `transformation`, `event_stream`, `bi_tool`, `ml_model`, `cloud_service`, `identity_service`, `integration_platform`, and `external_saas` represent common technical and data architecture components. These nodes allow FlowLens to map not just front-office workflows but also downstream analytics, reporting, automation, data movement, and integration patterns.

### Governance Nodes

Governance nodes represent controls, risks, and uncertainty.

A `control` represents a governance, security, compliance, or quality mechanism. This might include access control, approval process, audit log, retention policy, encryption standard, data quality check, or regulatory review.

A `risk` represents a known issue, fragility, exposure, or concern. This might include manual rekeying, lack of monitoring, no clear owner, duplicate data entry, spreadsheet dependency, batch latency, or unknown access controls.

An `unknown` represents a discovery gap. This is useful when the team knows that something exists or may exist, but does not yet understand it well enough to model it confidently.

## Edge Categories

Edges describe relationships and flows between nodes. The edge type should communicate the nature of the relationship, not just visual direction.

### Operational Edges

Operational edges describe who does what and how operational steps progress. `performs` links an actor or role to a process. `triggers` indicates that one event or process initiates another. `approves` and `rejects` represent decision outcomes. `escalates_to` represents exception handling or referral. `changes_state` indicates that an object or journey changes status.

### Information Edges

Information edges describe the movement or use of information. `creates`, `reads`, `writes`, `sends`, `receives`, `transforms`, `validates`, and `stores` describe how information is produced, consumed, moved, checked, transformed, and persisted.

### Technical Edges

Technical edges describe system-level and data-level mechanisms. `implemented_by` links an operational process to the application or system that supports it. `api_call`, `webhook`, `db_read`, `db_write`, `batch_import`, `batch_export`, `elt_job`, `etl_job`, `stream_publish`, `stream_consume`, `file_transfer`, `manual_rekey`, `report_query`, `model_inference`, `authenticates_with`, and `orchestrates` describe concrete implementation relationships.

These are central to FlowLens because they allow the product to answer architectural questions. A process is not only “done”; it is implemented by something, supported by integrations, dependent on data, and linked to downstream reporting or operational systems.

### Governance Edges

Governance edges describe accountability, control, dependency, and variation. `owns` links teams or roles to systems, data objects, processes, or controls. `governs` links controls to the things they constrain. `depends_on` represents technical or operational dependency. `syncs_with` represents ongoing synchronisation between systems. `varies_by` represents regional, market, product, or client variation. `evidenced_by` links graph elements to their source of evidence.

## Taxonomy Discipline

The taxonomy should evolve cautiously. Adding too many node and edge types too early will make the system harder to use. The default approach should be to start with the current taxonomy, test it against real examples, and only introduce new types when existing concepts cannot represent the situation clearly.
