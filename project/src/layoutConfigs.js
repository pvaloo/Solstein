/* global window */
// FlowLens layout configurations.
//
// Schema (per view):
//   strategy: 'layered'
//   options: { startX, startY, columnGap, laneGap }
//   nodeLanes: { [nodeId]: laneNumber }  // 1-indexed
//   laneGroups: [ { name, from, to } ]   // from/to are inclusive 1-indexed lane numbers
//
// Future: edited via a project-level settings UI backed by an API.

window.FLOWLENS_LAYOUTS = {

  // ───────────────────────────────────────────────────────────────────
  // Journey View — 8 lanes, 7 groups. "Insurer responses" spans lanes
  // 4–5 (success vs decline/timeout). Customer-facing lanes on top,
  // orchestration in the middle, async at the bottom.
  // ───────────────────────────────────────────────────────────────────
  journey_view: {
    strategy: 'layered',
    options: { startX: 320, startY: 80, columnGap: 220, laneGap: 130 },
    laneGroups: [
      { name: 'People',                  from: 1, to: 1 },
      { name: 'Customer-facing',         from: 2, to: 2 },
      { name: 'Customer data',           from: 3, to: 3 },
      { name: 'Insurer responses',       from: 4, to: 5 },
      { name: 'Backend orchestration',   from: 6, to: 6 },
      { name: 'Internal state & data',   from: 7, to: 7 },
      { name: 'Async / post-journey',    from: 8, to: 8 },
    ],
    nodeLanes: {
      // Lane 1 — People
      customer:                       1,
      finance_team_member:            1,

      // Lane 2 — Customer-facing interactions
      enter_details:                  2,
      reg_lookup:                     2,
      resolve_discrepancy:            2,
      display_results:                2,
      results_presented:              2,
      reengagement_email:             2,

      // Lane 3 — Customer-visible data
      customer_profile:               3,
      vehicle_data:                   3,
      cover_preferences:              3,
      ranked_quote_list:              3,

      // Lanes 4–5 — Insurer responses (group spans both)
      quote_response_quotefast:       4,   // success row
      decline_response_secureguard:   5,   // failure row
      timeout_event_budgetcover:      5,

      // Lane 6 — Backend orchestration
      enrichment_orchestration:       6,
      claims_history_check:           6,
      licence_validation:             6,
      address_verification:           6,
      fraud_scoring:                  6,
      claims_discrepancy_check:       6,
      quote_distribution:             6,
      response_normalisation:         6,
      ranking:                        6,
      response_evaluation:            6,
      event_logging:                  6,

      // Lane 7 — Internal state & data
      pending_verification:           7,
      verified:                       7,
      quotes_collected:               7,
      claims_history:                 7,
      licence_record:                 7,
      fraud_score:                    7,
      enriched_quote_request:         7,
      standardised_quote_request:     7,
      commission_data_export:         7,

      // Lane 8 — Async / post-journey
      abandoned_journey_detection:    8,
      commission_reconciliation:      8,
      conversion_metrics:             8,
    },
    // Optional slot overrides — pin specific nodes to specific columns.
    // Unpinned nodes auto-fill the remaining slots in their lane.
    nodeSlots: {
      finance_team_member:       6,
      commission_reconciliation: 8,
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // Technical View — 8 lanes, 6 groups. "External providers" spans
  // lanes 3–4 (enrichment APIs vs insurer APIs). "Data infrastructure"
  // spans lanes 6–7 (pipeline vs warehouse/BI).
  // ───────────────────────────────────────────────────────────────────
  technical_view: {
    strategy: 'layered',
    options: { startX: 320, startY: 80, columnGap: 220, laneGap: 130 },
    laneGroups: [
      { name: 'Client',              from: 1, to: 1 },
      { name: 'Services',            from: 2, to: 2 },
      { name: 'External providers',  from: 3, to: 4 },
      { name: 'Operational stores',  from: 5, to: 5 },
      { name: 'Data infrastructure', from: 6, to: 7 },
      { name: 'Manual surfaces',     from: 8, to: 8 },
    ],
    nodeLanes: {
      // Lane 1 — Client
      comparison_frontend:            1,

      // Lane 2 — Services
      comparison_backend:             2,
      quote_engine:                   2,
      crm_marketing_platform:         2,

      // Lane 3 — External enrichment
      vehicle_data_provider:          3,
      cue:                            3,
      mylicence_dvla:                 3,
      address_verification_service:   3,
      fraud_scoring_service:          3,

      // Lane 4 — External insurers
      insurer_a_quotefast:            4,
      insurer_b_secureguard:          4,
      insurer_c_budgetcover:          4,

      // Lane 5 — Operational stores
      session_database:               5,
      quotes_database:                5,

      // Lane 6 — Data pipeline
      data_pipeline:                  6,

      // Lane 7 — Warehouse + BI
      data_warehouse:                 7,
      analytics_dashboard:            7,

      // Lane 8 — Manual surfaces
      commission_spreadsheet:         8,
    },
  },
};
