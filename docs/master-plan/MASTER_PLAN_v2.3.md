# RC DATA VAULT — MASTER PLAN v2.3 (CANONICAL)

LAST UPDATED: 2026-04-29  
STATUS: FINAL LOCK — POST-CLAUDE RECONCILIATION  
PURPOSE: Single source of truth for system state, execution sequencing, backlog, and agent architecture

---

# [0] ROLE + EXECUTION MODEL

- ChatGPT + Jason → Architecture, planning, sequencing, QA
- Claude → ALL backend execution (SQL, Supabase, ingestion, agents)
- Claude Code → Frontend implementation

WORKFLOW:
- Dry-run → Verify → Apply → Verify

RULES:
- Do NOT rebuild systems
- Protect valuation integrity
- `v_variant_valuations_clean` is sacred

---

# [1] CURRENT SYSTEM STATE

## [1.1] CORE PLATFORM
- Valuation engine → stable
- eBay ingestion → autonomous
- Alerts → live + gated + delivery verified
- Delivery gating → enforced
- Affiliate routing → live
- Search telemetry → live

---

## [1.2] DATA HEALTH
- Listing normalization → near-complete
- Unknown listings → eliminated
- Classifier v3 → BEFORE INSERT trigger active
- `is_parts_excluded` → persisted + performant

---

## [1.3] CATALOG
- ~1,000+ variants / ~800+ families (verify via live SQL when needed)
- Tamiya chassis architecture extensively complete
  (vintage 1976–1997 on-road + most modern series)
  — remaining 58xxx + Kyosho/Associated vintage still pending

Key enrichments:
- Porsche RSR
- Civic EG6
- Fiat 131
- Unimog split
- Toyota WRT + WRT-GR

---

## [1.4] PARTS SYSTEM
- Parts catalog live
- OEM / aftermarket / universal split
- All valued platforms covered
- Tires auto-populate via `requires_scale`
- Compatibility linking active
- Purchase links active (verification pass still needed)
- Tools integration via `get_parts_by_spec` RPC

---

## [1.5] TOOLS (LIVE — FULLY INTEGRATED)
- Gear Ratio Calculator
- Speed Estimator
- Gear Change Comparator
- Battery Runtime Calculator
- ESC Selector

All tools:
- Connected to parts system via `RecommendedParts`
- Use spec keys: kv, amps, cells, teeth

---

## [1.6] RESOURCES SYSTEM
- 1,470+ resources across families
- Multi-manufacturer coverage
- ARRMA cross-reference PDF:
  - Linked across families
  - NOT parsed into structured data

---

## [1.7] AGENTS (LIVE INFRASTRUCTURE)
- listing_normalization_agent (shadow mode)
- catalog_qa_agent (shadow mode, governed)
- agent_review_queue
- /admin/agent-review UI

CRITICAL:
- agent_config governance patch applied
- All agents are queue-only (no catalog mutation)

---

# [2] ACTIVE PHASE

## [2.1] WAVE 5B

COMPLETED:
- 5B-S
- 5B-T1 (Toyota catalog enrichment)
- 5B-T2 (queue cleanup)

CURRENT:
➡️ **5B-T3 — GR Yaris Redistribution (51 listings)**

Execution Plan:
- Create new variant:
  - GR Yaris M-05 (#58684)
- Retarget:
  - ~28 → WRT-GR (#58716)
  - ~8 → new M-05 variant
- Reject:
  - ~6 parts/body contamination listings
- Hold:
  - ~9 ambiguous listings

NEXT:
- Wave 5C (queue arrivals cleanup)

---

# [3] AGENT SYSTEM (13 TOTAL)

NOTE:
This roster supersedes the earlier 10-agent spec (Apr 24).
- purchase_link_auditor + deal_scoring functions are folded into:
  - system_audit_agent
  - valuation_contamination_agent

---

## [3.1] LIVE
1. listing_normalization_agent
2. catalog_qa_agent

---

## [3.2] PLANNED

INGESTION:
3. ingestion_quality_agent

CATALOG:
4. variant_enrichment_agent

MATCHING:
5. listing_cleanup_agent
6. alias_management_agent

VALUATION:
7. valuation_contamination_agent
8. condition_scoring_agent

PARTS:
9. parts_compatibility_agent
10. upgrade_recommendation_agent

CONTENT:
11. seo_content_agent
12. resources_agent

SYSTEM:
13. system_audit_agent

---

# [4] EXECUTION BACKLOG

## [4.1] TIER 1 — CRITICAL

### ARRMA PARTS INGESTION
- PDF linked
- NOT structured
- Requires:
  - parsing
  - compatibility mapping
  - taxonomy alignment

---

### TOYOTA GR YARIS SPLIT
- In progress (Wave 5B-T3)
- See Section [2.1] for execution

---

## [4.2] TIER 2 — SYSTEM INTEGRITY

### CLASSIFIER HARDENING (SPECIFIC)
- Bearing kit / ceramic sealed → parts flag
- 1/24 static plastic model → reject
- Bundle detection (“&”, “lot of”)
- Catalog-number contradiction detection
- Trim suffix detection (TLR, EXB, V5, V6)
- Scale mismatch detection

---

### REVIEW QUEUE AUTOMATION
- Auto-reject obvious parts/accessories
- Description-aware filtering
- Photo-aware filtering

---

## [4.3] TIER 3 — USER VALUE

### TOOLS EXPANSION
- Pinion/spur recommendation logic
- Tire size calculator
- Battery cross-reference logic

### RESOURCES REFINEMENT
- Variant-level mapping
- URL verification pass

### VISUAL UX LAYER
- Icons
- Visual hierarchy improvements
- Charts where appropriate

### SMALL UI ITEMS
- FamilySummaryStrip (previously skipped)

---

## [4.4] TIER 4 — ADVANCED

- Valuation contamination agent
- Vintage safety layer
- Perplexity integration

### GEOCODING SYSTEM
- ZIP → lat/lng
- Required for:
  - local alerts
  - Facebook Marketplace activation

---

# [5] FACEBOOK MARKETPLACE

ALREADY BUILT:
- Source model support
- Accessibility classification
- Alert exclusion
- Link verification

BLOCKED BY:
- No ingestion path
- No geocoding
- Alerts not location-aware

---

# [6] DO NOT TOUCH

- Valuation engine
- eBay ingestion
- Alerts system
- Affiliate routing
- Variant taxonomy
- Agent governance system
- Tools core logic

---

# [7] PRIORITY STACK

NOW:
1. Wave 5B-T3
2. Wave 5C

NEXT:
3. ARRMA parts ingestion
4. Classifier hardening
5. Queue automation

LATER:
6. Tools expansion
7. Resources refinement
8. UX improvements

FUTURE:
9. Advanced agents
10. Facebook activation
11. Perplexity

---

# [8] OPERATING RULE

IF IT IS NOT IN THIS DOCUMENT → IT DOES NOT EXIST

All work must:
- be added here
- be categorized
- be sequenced

---

# [9] NEXT ACTION

➡️ Generate Wave 5B-T3 Claude handoff block

---
