# TERMINOLOGY — RC Data Vault

**Project repo:** rc-data-vault-frontend
**Purpose:** Normalize vocabulary across humans (Jason) and AI models (Claude, ChatGPT, Claude Code, Perplexity, others). RCDV's vocabulary is unusually load-bearing — the Trust Layer, canonicalization, and contamination concepts are how the business moat is defined. Vocabulary drift here causes real architectural drift.
**Update frequency:** LOW. Add terms when ambiguity surfaces. The v2.5.x vocabulary is locked.
**Last updated:** 2026-05-27

---

## Project Identity

| Term | Meaning |
|---|---|
| **RC Data Vault** / **RCDV** | The platform. Aggregates and analyzes RC vehicle marketplace data. Public-facing. |
| **JW RC LLC** | The legal entity. Indiana single-member LLC, formed 2026-03-26. Jason is sole member. |
| **rc-data-vault-frontend** | The GitHub repo name. Public. |
| **The data graph** | The proprietary asset — continuously-updating, canonicalized, contamination-protected valuation + listing data. The actual moat. The platform surfaces (search, alerts, content) are downstream renderings of the data graph. |

## Core Architectural Vocabulary (v2.5.x, LOAD-BEARING)

These are not abstract concepts. They define how the system is built. Misusing or losing track of these terms causes real architectural drift.

### Trust Layer

The system of confidence/freshness/provenance indicators that flow from underlying data state through every user-facing surface. Trust Layer rules are enforced **structurally** at the data access layer, **not editorially**. If a query returns data that violates Trust Layer rules, that's a structural bug, not a content-review issue.

Trust Layer rules apply to:
- Marketplace UI (search, listing display, FMV overlays)
- Alerts / deal feed / valuation utility
- Programmatic content layer (when activated, see §2.7)
- Any future API surface

### Canonicalization

The process by which raw scraped listings are normalized into matched records (model, trim, year, condition) suitable for valuation and display. The transformation from "messy raw data" to "trustable canonical data."

Raw listings DO NOT feed downstream consumers. Only canonicalized records do. This is structural, enforced at the data access layer.

### `listing_normalization_agent`

The agent (or pipeline, depending on implementation phase) responsible for canonicalization. Single source of truth for raw-to-canonical transformation. Outputs are gated by:
- canonicalization_confidence threshold
- contamination flag absence
- catalog_issue flag absence

### Contamination protections

Rules that prevent category-crossing corruption of valuation data. Examples:
- Parts kit listed as a "complete" vehicle → contamination flagged → does not feed FMV
- Replica listed as an "original" → contamination flagged → does not feed FMV
- Listing miscategorized to a wrong model variant → catalog_issue flagged

These are not optional. Without contamination protections, valuation data becomes meaningless within months.

### `catalog_issue`

Boolean flag on listings table. True when a record has structural problems (ambiguous model identification, suspicious price, contamination-suspect, etc.). Records flagged with `catalog_issue` MUST NOT feed:
- Valuation views
- Content templates (programmatic content layer)
- Trust-bound user-facing claims
- Alerts / deal feed

### `canonicalization_confidence`

Numeric column on listings table. The model's confidence that this listing has been correctly matched to a canonical vehicle record. Below threshold → no valuation overlay, no content generation, surface in human-review queue.

### `contamination_flags`

Column on listings table. Records the specific contamination concerns identified for a listing (e.g., `parts_kit_suspect`, `replica_suspect`, `model_ambiguous`). Used to gate downstream consumers.

### Demand-anchor thesis

The framing that RCDV exists to make RC marketplace data more useful — alerts, deal feed, valuation utility, trend surfaces — rather than to be a marketplace platform itself. The data graph is the moat; the platform surfaces are downstream renderings.

This thesis affects every product decision. "Should we build a marketplace where users list their own RC vehicles?" → answer is no, that's not what RCDV is.

### Operating-rules thread discipline

The constraint that no more than 3 active threads exist at any time. Applies to all major architectural workstreams (canonicalization, eBay integration, demand-anchor resolution, programmatic content layer activation, etc.).

When the count is at 3 and a new important thread arrives, an existing thread must be resolved or paused before the new one starts.

### Sold-comp FMV

Canonical fair-market-value derived from sold-comparable listings. The ONLY source of truth for valuation. Asking prices from active listings are NOT FMV and must not be displayed as such, even if visually shown.

Sold-comp FMV freshness degrades over time → confidence indicators in UI/content downgrade accordingly.

### `canonical_valuations`

Table of sold-comp-based FMV by model, with confidence/freshness metadata: `fmv`, `sample_size`, `last_sold_at`, `freshness_score`, `confidence_score`.

## Programmatic Content Layer (§2.7)

| Term | Meaning |
|---|---|
| **Programmatic content layer** | Future capability. Data-graph-driven content (animated stats, comparisons, market visualizations) for social platforms. Approved direction, deferred implementation. |
| **HyperFrames** | Pre-selected rendering engine for the programmatic content layer. github.com/heygen-com/hyperframes. Deterministic, HTML+GSAP-native, local FFmpeg rendering. |
| **Trigger conditions** | The set of preconditions that must all be true before programmatic content layer activates. Includes: canonicalization shipped, marketplace UI functional, demand-anchor decision resolved, eBay escalation resolved, active-thread capacity available. |
| **Pre-trigger preparation** | Allowed pre-activation work: reading HyperFrames docs, bookmarking refs. Does NOT consume an active-thread slot. |
| **Content-Ready Event Stream** | Future concept. Events emitted from canonical data state changes (new_top_deal_detected, rare_model_observed, market_price_spike, etc.) that drive content generation. Inngest-orchestrated. |

## Data Sources

| Term | Meaning |
|---|---|
| **eBay Developer API** | The canonical eBay source. NOT scraping. Adopted because eBay's API is well-supported and scraping eBay violates TOS. |
| **eBay escalation** | An open issue from operating rules. Status unresolved. Must be resolved before programmatic content layer activation. |
| **Scrapy spiders** | For non-eBay sources (RC Universe classifieds, specialty seller sites). Python-based, fits the existing stack. |
| **scrapy-playwright** | For JavaScript-rendered sites. Same Scrapy framework, with Playwright integration for headless rendering. |
| **dlt** | data load tool. Normalization layer between Scrapy output and Supabase tables. |
| **changedetection.io** | Self-hosted change detection. New listings, price changes. |
| **Facebook Marketplace** | SKIPPED. TOS hostile, fragile. Not in scope. |

## Evaluation Candidates (added 2026-05-26, pending decision)

These tools are being evaluated for the canonicalization extraction layer. Each has an MCP server available for head-to-head testing. Decision happens before `listing_normalization_agent` ships.

| Term | Status |
|---|---|
| **Crawl4AI** | Evaluation candidate. Apache 2.0. LLM-friendly clean Markdown output. |
| **ScrapeGraphAI** | Evaluation candidate. MIT. LLM-based extraction with Pydantic schemas. |
| **Firecrawl** | Evaluation candidate, HOSTED-ONLY (AGPL self-host conflicts with commercial repo policy). |
| **Browser Use** | NOT for RCDV. For other projects' portal automation. |

## Stack-Specific

| Term | Meaning |
|---|---|
| **pg_partman** | Postgres partitioning extension for price time-series. TimescaleDB is unavailable on shared Supabase; pg_partman is the alternative. |
| **The `vehicles` table** | Canonical RC vehicle catalog (model, scale, type, drivetrain, manufacturer). Stable reference data. |
| **The `listings` table** | Marketplace listings, scraped or API-pulled. Has the canonicalization_confidence, catalog_issue, contamination_flags columns. |
| **The `photos` table** | Storage refs to listing images. ml_classified_vehicle_id column reserved for Phase 3 (computer vision). |
| **Phase 3** | Computer vision (YOLO, supervision). Deferred. Not now. |

## Project Boundary Vocabulary

| Term | Meaning |
|---|---|
| **No Canopy coupling** | RCDV is a separate business and a separate codebase. No shared Supabase. No shared infrastructure beyond Cloudflare account-level R2 (separate buckets). |
| **No PII collection** | RCDV doesn't store user PII. Marketplace data tool, not a customer-data product. If accounts are added later, auth must be planned carefully — but defaulting to no PII protects against scope creep into a customer-data product. |
| **Public repo** | Intentional. Discoverability is the strategic goal. Accept that scrapers and patterns are visible. |
| **MIT or Apache 2.0 for own code** | License decision. Do NOT vendor AGPL code into this repo. |

## License and Provenance Terms

| Term | Meaning |
|---|---|
| **AGPL contagion** | Why AGPL code is not vendored. Forces downstream code to also be AGPL. Used hosted versions instead (Documenso pattern, applies to Firecrawl/Maxun). |
| **Hosted-only adoption** | Pattern for using AGPL tools commercially without contagion. Use the hosted SaaS unmodified, never self-host the modified core, never vendor the source. |

---

## Change Log

- **2026-05-27 v1:** Initial creation. Seeded with v2.5.x architectural vocabulary (Trust Layer, canonicalization, contamination, catalog_issue, demand-anchor, operating-rules thread discipline), §2.7 programmatic content layer terms, data source vocabulary, evaluation candidates from 2026-05-26 verification, and project boundary terms (no Canopy coupling, MIT/Apache for own code, hosted-only AGPL pattern).
