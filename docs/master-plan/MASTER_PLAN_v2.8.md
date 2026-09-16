# RC DATA VAULT — MASTER PLAN v2.8

**Version:** v2.8  
**Date:** 2026-09-16  
**Status:** ACTIVE — canonical Forge completion plan  
**Replaces:** v2.7.1 as the working planning document while preserving prior plans as history.  
**Evidence baseline:** Recovery Ledger v1–v14, the June v2.7.1 post-sweep consolidation, repo-root state/decision/terminology files, and verified current repo/production/database evidence.

---

## 0. Read-first doctrine

This is the canonical completion map derived from the archive sweep and subsequent locked decisions. Recovery artifacts are provenance; this plan is execution authority.

1. Old chat, handoff, deploy-ID, state-block, and relayed claims are zero-trust until independently verified.
2. Live code, DB/schema, deployment, cron, and raw-at-SHA evidence beat stale prose when they conflict.
3. Unknown evidence stays unknown; do not infer specs, MSRP, compatibility, completion, or approval.
4. Monetization never overrides trust, catalog correctness, provenance, compatibility, rights, or preservation-safe recommendations.
5. State belongs in canonical files/DB, not assistant memory.
6. Forge must complete against verified current evidence, not merely against this document’s wording.

---

## 1. Historical baseline to re-verify

The June archive sweep closed around: 1,047 variants / 806 families / 83 manufacturers; 2,499 frozen `price_observations`; about 820 pending review-queue items; 10 rows in `alert_ready_deals_view`; about 63 rows in `v_top_deals_balanced`; eBay completed-listing ingestion paused; search telemetry present but thin.

These are historical checkpoints, not September truth. Forge must establish a fresh baseline before implementation.

Historical blockers requiring current verification include: cron-secret exposure, eBay Developer Support/completed-listing freshness, GR Yaris split, DMARC/mail posture, stale ingestion-status view, legacy RC Bluebook Vercel alias, and any expired sandbox credentials.

The locked first demand anchor is the **public deal feed**. Alerts and valuation surfaces remain downstream. The Trust Layer must operate as a system-wide authority layer across pages, APIs, alerts, sitemaps, structured data, pSEO, and future content.

---

## 2. Product identity and moat

RC Data Vault is the authority layer for the RC market: a mobile-first RC vehicle, parts, pricing, valuation, compatibility, and collector-intelligence platform.

Its moat is the compound of canonical catalog identity, trustworthy valuation inputs, defensible provenance, exact-fit compatibility, market/deal intelligence, public methodology/trust UI, useful return-visit tools, and content/distribution downstream of verified data.

The genesis thesis was “KBB for RC,” but the surviving doctrine is stricter: **do not fake precision; do not bulk-fill unknowns; `NULL` is correct when evidence is absent; APIs beat fragile scraping where available; and public claims must flow from verified source layers.**

Retired/forbidden framing: do not rename the platform RC Bluebook/RCValues; do not treat AI prose as source truth; do not use sold comps as retail offers; do not allow parts/accessories/bodies/rollers/ambiguous listings to contaminate complete-vehicle valuation/deal surfaces; do not activate Facebook Marketplace ingestion until legal/TOS and local/geographic prerequisites are adjudicated.

---

## 3. Canonical 19-pillar map

| # | Pillar | Scope |
|---:|---|---|
| 1 | Catalog Canonicalization & Identity | Vehicles, variants, trims, aliases, SKU/MPN, taxonomies, catalog guardrails. |
| 2 | Marketplace Ingestion & Matching | eBay sold/active, matcher hardening, staging, normalization, provenance, contamination prevention. |
| 3 | Valuation, Pricing & Trust | FMV, segmented pricing, condition lanes, freshness, methodology, trust cards. |
| 4 | Deal Feed & Alerts | Public demand anchor, deal views, alert gating/delivery, contamination gates. |
| 5 | Parts, Compatibility & Purchase Links | OEM/aftermarket parts, exact fitment, specs, ESC/motor/servo/combo recommendations, purchase routing. |
| 6 | Resources & Documentation | Manuals, exploded views, parts lists, product pages, resource cards/RPCs. |
| 7 | Tools & Calculators | Gear ratio, speed, runtime, ESC, gas mix, setup logs, identify/evaluate tools, telemetry. |
| 8 | Search & Navigation | Homepage search, alias-aware fuzzy search, internal linking, related variants. |
| 9 | pSEO, Publishing & Indexability | Trait/comparison pages, route manifests, noindex/sitemap policy, structured data. |
| 10 | Variant / Family / Manufacturer Authority Pages | Variant contracts, family intelligence, manufacturer authority, hub UX, payloads. |
| 11 | Market / Demand / Ecosystem Intelligence | Liquidity, demand, price trends, parts activity, family/ecosystem intelligence. |
| 12 | User Accounts, Alerts & My Garage | Watchlists, ownership registry, collections, alerts. |
| 13 | Seller / Lead / Listing Tools | Sell-your-RC, dealer listings, listing generator, appraisal/lead modules. |
| 14 | API / Data Licensing / Partnerships | B2B feeds, dealer data, submitted comps, API opportunities. |
| 15 | Content & Video Engine | Programmatic YouTube/short-form, deterministic rendering, rights/provenance-safe templates. |
| 16 | Image / Identification Layer | Governed image ingestion, box art, identify-by-photo, vehicle identifier. |
| 17 | Vintage / Collector Intelligence | Vintage MSRP policy, rarity, vintage index, preservation-safe recommendations. |
| 18 | Agents, QA & Governance | Catalog QA, retail/spec/scale/contamination agents, queue automation, audit laws. |
| 19 | Operations, Security & Infrastructure | Staging/direct-prod posture, cron, telemetry, Vercel, secrets, DMARC, Disk IO, sandbox/team rules. |

Every pillar must end in exactly one evidence-backed state: `COMPLETE`, `COMPLETE_WITH_HELD_FUTURE_SCOPE`, `DEFERRED_BY_OWNER`, or `KILLED_BY_OWNER`. `UNKNOWN`, stale, contradictory, and merely designed states do not count as completion.

The historical “official 16 sections,” External Intelligence Hooks, and whether Ecosystem Intelligence deserves a separate pillar remain adjudication items. The 19-pillar map is canonical unless Jason explicitly changes it.

---

## 4. Consolidated system register

### Surviving/shipped in the June evidence base

Trust Layer/methodology; valuation freshness and segmented-pricing lineage; balanced deal/alert-ready views; `/deals/[brand]`; alert-delivery worker/cron; AggregateOffer structured-data path; active eBay active-listing/deal-alert path; parts/specs/purchase router and recommendation layers; resources/documentation RPC/cards; image ingestion; homepage search/local alerts; family/parts-activity intelligence; link verification/surfaceability guards; Disk-IO protections; catalog QA and verification-agent foundations; security headers/public-repo doctrine.

### Historically broken/stale/incomplete

eBay completed-listing ingestion; production matcher contradiction caps/dampener; literal cron secret; GR Yaris split; deprecated filtering question; stale pipeline-status view; payload/freshness split; sitemap predicate provenance; weak tool telemetry; deal-feed accessory contamination.

### Built but dormant/orphaned

pSEO subsystem/queues; legacy payload/delivery/routing generations; unverified/unpublished verified-content population; vintage/collector/scoring surfaces; unwired AI matcher; demand/ecosystem structures without data; Facebook Marketplace prebuild; incomplete local/currency engine; dormant multi-vertical abstraction.

### Designed but not proven built in the recovered record

staging/dev DB; `v_variant_valuations_current`; full `v_public_*` layer; knowledge graph; crowdsourced/dealer comps; My Garage ownership registry; full seller/listing flywheel; parts price index; full B2B API product; RC AI Mechanic; full globalization/local engine; mature accounts/freemium gating.

Forge must reclassify all of these from current evidence before building or retiring them.

---

## 5. Completion roadmap

### Phase 0 — Re-anchor truth and safety

Verify `main` HEAD, production deployment, Supabase state, scheduled jobs, secrets posture, external blockers, and canonical docs. Preserve `MASTER_PLAN_v2.3.md` as history. Reconcile `CURRENT_STATE.md`, `DECISIONS_LOG.md`, `TERMINOLOGY.md`, and Forge/Jarvis project pointers. Re-check cron-secret exposure, eBay support state, DMARC, redirects, Vercel aliases, stale status surfaces, and expired credentials. Record a fresh September baseline.

### Phase 1 — Demand anchor

Verify `/deals` root/brand parity and freshness semantics; anchor-aware copy; outage/freshness disclosure; contamination exclusion for fan/bracket/mount/bumper/body/roller and similar non-vehicle classes; alert delivery/failure handling; deal click/search instrumentation.

### Phase 2 — Trust Layer V2

Confirm public valuation/deal/alert routes consume approved trust-gated sources; resolve payload/freshness splits; keep valuation confidence, spec correctness, freshness, and listing recency distinct; add correction/challenge and methodology surfaces where missing; adjudicate `v_variant_valuations_current`.

### Phase 3 — Ingestion/catalog hardening

Do not reactivate completed-listing ingestion until eBay condition is verified resolved. Impact-test matcher contradiction caps/dampener before promotion. Resolve/defer GR Yaris. Resume/park MSRP backlog. Clear false positives with evidence. Patch catalog QA filtering if still open. Explicitly retire/repair obsolete generations. Preserve APIs-first doctrine and license/security/TOS gates for any new ingestion provider.

### Phase 4 — Parts/compatibility/affiliate

Prioritize Amazon → eBay → manufacturer-direct links. Maintain link verification. Add thumbnails. Finish required Traxxas pitch-only verification before monetization. Preserve vintage-safe recommendations. Auto-affiliate linking requires strong fitment/link confidence. Preferred affiliate sources are not verification sources.

### Phase 5 — Tools/daily-use

Inventory current tools at HEAD; repair any broken calculators/selectors; standardize URLs/navigation; add tool telemetry; connect outputs to trusted catalog/exact-fit parts/purchase routes; decide account vs local-only persistence for saved setups.

### Phase 6 — pSEO/authority publishing

Audit dormant generators/queues; retire stale builders; establish one DB-driven indexability/noindex/sitemap policy aligned with Trust Layer V2; reconcile GSC incidents/current truth; validate structured data; do not scale mass pages until quality-gated authority templates are healthy.

### Phase 7 — Accounts/My Garage/seller tools

Decide auth timing. Build My Garage only if it creates measurable retention/data-quality value. Build watchlists/digests after alerts are reliable. Re-adjudicate seller/dealer/lead-gen flows under the demand-anchor doctrine. Listing generation must use provenance-safe catalog/valuation inputs.

### Phase 8 — Content/video engine

Automated content remains downstream of trusted structured data and outside the Assertion Core. Preserve HyperFrames as a deterministic-rendering candidate. Add `harry0703/MoneyPrinterTurbo` as a high-value future workflow/provider candidate for brief → script → media/assets → TTS → subtitles/music → assembly/rendering and batch/API/CLI mechanics.

No provider owns RCDV truth. Required architecture:

`RCDV verified data/claims + rights-gated content brief -> script/assets -> video-generation provider -> rendered draft -> QA/brand/claim verification -> approval/publishing`

Provider choice must pass licensing, security, rights, benchmark, and reliability gates. Begin with deal-feed breakdowns/model explainers from verified inputs. JW RC LLC remains the personal/content brand; RCDataVault remains the platform/authority brand.

### Phase 9 — API/data partnerships

Sequence affiliate → leads → API. Submitted comps require verification/confidence metadata. Define public/partner/private boundaries. Partnerships may reduce scraping fragility but never weaken provenance.

### Phase 10 — Agent automation/promotion loop

Use current Forge governance rather than stale June agent/tool counts. Preserve sandbox → validation → promotion discipline and owner gates. Record outputs in canonical docs/audit surfaces. Add machine-checkable promotion gates before consequential automation. Jarvis owns durable status visibility; Tony owns decomposition, sequencing, acceptance criteria, and exception escalation.

### Phase 11 — Final acceptance

Produce a 19-pillar completion matrix; open/deferred/killed register separating owner decisions from defects; fresh repo/production/Supabase/Vercel/cron/security snapshot; no stale canonical pointers; no unresolved contradiction labeled complete; rollback notes for consequential changes; explicit future-scope register.

---

## 6. Owner adjudication queue

Re-verify before asking Jason: live cron/secret exposure; eBay blocker; GR Yaris; legacy RC Bluebook alias; redirects/DMARC; stale status surfaces; dead delivery/routing/payload generations.

Preserved product rulings: Facebook Marketplace prerequisites; local/currency engine; Apify; dormant spec/catalog-integrity agents; Ecosystem Intelligence placement; External Intelligence Hooks; 16-section vs 19-pillar taxonomy; `v_variant_valuations_current`; staging/dev DB; paid access/ads/dealer/lead-gen; box art; `rc_bluebook_mcp`; X-Maxx era identity; SEO test status; HPI Savage 21; historical queue false positives.

Forge must not invent owner decisions. Surface only decisions that remain blocking after current-state verification.

---

## 7. Non-platform admin register

Keep visible but outside application completion: trademark filing status; legacy domain ownership/forwarding/renewal; pre-LLC owner-contribution ledger; Indiana recurring compliance; business banking if unresolved; public-repo doctrine. Historical grant deadlines are not current; re-research before action.

---

## 8. Operating laws / anti-regression

1. Zero-trust old claims; verify independently.
2. Live schema first.
3. Structured facts before generated prose.
4. `NULL` is correct when evidence is absent.
5. APIs before scraping.
6. Exact-fit parts only.
7. Vintage preservation default.
8. Sold comps inform valuation, not retail offers.
9. Keep trust surfaces semantically distinct.
10. Content stays downstream of canonicalization/trust.
11. Normal repo changes use governed Git workflows.
12. Handoffs are inputs, not state truth.
13. State belongs in files/DB.
14. **ADOPT → ADAPT → BUILD** for commodity mechanics.
15. RCDV retains authority over identity, claims, trust semantics, provenance, rights, compatibility, approvals, and publication policy.

---

## 9. Recovery evidence map

The full provenance remains in Recovery Ledger v1–v14 and the v2.7.1 June consolidation. Those preserve RL-001 through RL-239 plus NP records, including the genesis thesis, 19-pillar recovery, Trust Layer lineage, 2026-05-26 deal-feed demand-anchor decision, valuation/freshness lineage, parts/resources/images/tools/family/alerts, security/cron/Disk-IO/Vercel doctrine, vintage/catalog QA/retail verification/contamination/queue history.

When a disputed feature or doctrine arises, consult the recovery artifacts for provenance and then verify current live state.

---

## 10. Forge operating assignment

Forge uses this document as the **planning/completion target, not proof of implementation**.

- **Jarvis:** plan reconciliation, durable status visibility, exception/status reporting.
- **Tony:** decomposition, sequencing, team assignment, acceptance criteria, evidence standards, exception escalation.
- **Workers:** bounded implementation after independent repo/production/Supabase/Vercel/cron/external-blocker verification.

For every unfinished capability: **ADOPT** a suitable maintained component when gates pass; **ADAPT** sound mechanics when RCDV-specific truth/UX/provenance/governance must remain ours; **BUILD** custom only when no suitable system survives the gates or the capability is differentiating authority-layer IP.

Required closure package: canonical master plan; reconciled state/decision/terminology/handoff pointers; 19-pillar evidence matrix; open/deferred/killed register; current production/repo/Supabase/Vercel/cron/security snapshot; unresolved external dependencies; acceptance/rollback evidence; explicit intentional future scope.

---

## 11. Non-negotiable completion rule

**Forge must complete RC Data Vault against verified current evidence, not against the age or wording of this document.** Live code/data/evidence determines what is already done, what drifted, and what still requires work. Never reopen settled architecture without evidence of failure, and never mark an item complete solely because an older chat, handoff, or plan said it was complete.
