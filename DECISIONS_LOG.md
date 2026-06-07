# DECISIONS LOG — RC Data Vault

**Project repo:** rc-data-vault-frontend
**Purpose:** Strategic memory. Prevent re-litigation of solved problems or proposing previously rejected paths. RCDV has unusually high architectural commitment density — this log is the source of truth for "why is it this way?"
**Update frequency:** MEDIUM. Append only when real architectural or strategic decision is made.
**Format:** newest entries at top.
**Last updated:** 2026-05-27

---

## 2026-05-27 — Superpowers framework evaluated, deferred adoption

**Decision:** Add obra/superpowers to TOOLCHEST as Evaluation Candidate. Do not install yet. Re-evaluate after first feature ships using in-house agent setup (codebase-researcher + implementation-validator + CLAUDE.md).

**Why:** Superpowers is a high-credibility, MIT-licensed agentic skills framework with significant conceptual overlap with the in-house setup built 2026-05-26. Adopting it before validating the in-house setup means debugging three overlapping behavioral systems on first feature. The legitimate evaluation path is: ship one feature → identify specific gaps → adopt Superpowers skills selectively if they fill those gaps.

**Alternatives rejected:**
- Adopt immediately: rejected. Pre-shipping infrastructure theater.
- Skip entirely: rejected. Builder credibility (Jesse Vincent, 30 years track record) and adoption metrics (122k stars, official Anthropic marketplace) make this worth capturing for later.
- Adopt selectively now (pick 2-3 skills): rejected. Adds complexity to first feature without prior validation.

**Tradeoffs:** Operating without potentially-useful methodology for the duration of the first feature. Acceptable cost; the in-house setup encodes most of the same principles via different mechanism.

**Impact:** TOOLCHEST.md v8 documents this entry. Pre-trigger reading allowed (3 blog posts by Jesse Vincent). When trigger conditions are met (specific gap surfaces, OR multi-tool workflow becomes regular), revisit.

**Reversal cost:** Low. Installing the plugin is straightforward when triggered.

---

## 2026-05-26 — Three new evaluation candidates flagged for canonicalization extraction layer

**Decision:** Crawl4AI, ScrapeGraphAI, and Firecrawl are flagged as evaluation candidates for the LLM-extraction component of `listing_normalization_agent`. Head-to-head testing happens before the canonicalization pipeline ships. Decision criteria: license compatibility, MCP server quality, output structure fit with Pydantic-schema-style extraction, cost at expected listing volume.

**Why:** The canonicalization pipeline's extraction step is where regex-vs-LLM tradeoffs play out. These three tools represent mature options across the spectrum (Crawl4AI = LLM-friendly clean Markdown, ScrapeGraphAI = Pydantic schema-driven, Firecrawl = production SaaS).

**Alternatives rejected:**
- Building extraction from scratch: rejected. The wheel is well-invented.
- Adopting one without head-to-head test: rejected. Each has different output shapes; the wrong choice causes downstream rework.
- LangChain/LangGraph: rejected (overhead vs value, already excluded in TOOLCHEST).

**Tradeoffs:** Evaluation takes time before pipeline ships. Mitigated by adding MCP servers to claude.ai for low-friction validation rather than full local install.

**Impact:** TOOLCHEST.md v8 documents these. `listing_normalization_agent` design depends on the outcome.

**Reversal cost:** Low until adoption. Medium-Low after one is chosen, since each has a distinct API shape.

**Note on Firecrawl:** AGPL-3.0 license. Adoption is hosted-only (Documenso pattern). Self-hosting the AGPL core would contaminate the commercial repo policy.

---

## 2026-05-26 — Browser Use is NOT for RCDV scraping (other projects only)

**Decision:** Browser Use (browser-use/browser-use) is appropriate for portal-navigation use cases in Canopy or Hutcherson Homes (MLS portals, supplier portals, etc.) but NOT for RCDV listing scraping. Scrapy + scrapy-playwright remain the right tools for structured marketplace data extraction.

**Why:** Browser Use is optimized for "AI agent navigates a UI to complete a task." That's a different problem than "high-volume structured data extraction from a marketplace." The latter needs Scrapy's throughput, structured selectors, and dlt normalization. Forcing Browser Use into RCDV's role would be 2x slower and significantly more expensive per listing.

**Alternatives rejected:** Replacing Scrapy with Browser Use for RCDV. Rejected — wrong tool category.

**Tradeoffs:** None. The decision aligns each tool with its strength.

**Impact:** No change to RCDV stack. Browser Use stays Future-Conditional for other projects.

**Reversal cost:** N/A. Tool selection is decision-as-needed.

---

## 2026-05-26 — HyperFrames merged into HANDOFF-RC-DATA-VAULT.md as §2.7 (single document, addendum file superseded)

**Decision:** The HyperFrames addendum is folded into the master handoff document as §2.7 (Audience Acquisition + Programmatic Content Layer). The standalone HANDOFF-RC-DATA-VAULT-ADDENDUM-2026-05.md is superseded.

**Why:** Reduces document fragmentation. The programmatic content layer is part of the strategic frame, not a separate plan. One authoritative source.

**Alternatives rejected:** Keep both files in parallel. Rejected — version-drift risk between two documents describing the same thing.

**Tradeoffs:** The merged file is longer. Mitigated by clear sectioning.

**Impact:** _handoffs repo cleanup. v2 of HANDOFF-RC-DATA-VAULT.md.

**Reversal cost:** Low. Markdown can always be split again if needed.

---

## 2026-05-26 — Trust Layer rules are enforced structurally, not editorially

**Decision:** The Trust Layer (confidence/freshness/provenance indicators flowing from data state to user-facing surfaces) is enforced at the data access layer, NOT through editorial review. If a query returns Trust-Layer-violating data, that's a structural bug, not a content-review issue.

**Why:** Editorial review doesn't scale. Solo founder can't review every listing surface. Structural enforcement at the query/view layer means violations become impossible by construction.

**Alternatives rejected:**
- Editorial review pass before publishing content: rejected (doesn't scale).
- Confidence indicators as UI-only labels: rejected (the underlying data still passes through to consumers, leading to silent FMV-from-asking-price errors).

**Tradeoffs:** More upfront engineering work to define gated views and access patterns. Worth it.

**Impact:** Schema design (`canonicalization_confidence`, `catalog_issue`, `contamination_flags` on listings table). Every downstream consumer queries these. Content templates have hard gates.

**Reversal cost:** High. Trust Layer is woven into the data model. Reversing means rebuilding from scratch.

---

## 2026-05-26 — Raw listings NEVER feed downstream consumers; only listing_normalization_agent output

**Decision:** Raw scraped listings do not feed valuation views, content templates, search UI, alerts, or any user-facing surface. They flow through `listing_normalization_agent` (or equivalent canonicalization pipeline) first.

**Why:** Raw listings contain category-crossed data (parts kits, replicas, ambiguous models, suspicious prices). Letting them through directly causes parts-as-vehicles FMV errors and replica-as-original valuation contamination. Once trust is lost, the moat is gone.

**Alternatives rejected:**
- Editorial gate at content-publishing time: rejected (doesn't scale, doesn't catch search/alert leaks).
- Confidence labels on raw listings: rejected (data still flows through; "low confidence" labels become wallpaper).

**Tradeoffs:** Adds latency between scrape and surface. Acceptable.

**Impact:** Architecture is structurally bifurcated: raw `listings` table vs canonical views. `listing_normalization_agent` is the gate.

**Reversal cost:** Very High. This is the core architectural commitment.

---

## 2026-05-26 — Demand-anchor thesis: RCDV is data-utility, not a marketplace

**Decision:** RCDV exists to make RC marketplace data more useful (alerts, deal feed, valuation, trend surfaces). Not to be a marketplace platform itself. Users do not list their own vehicles on RCDV; that's eBay's role.

**Why:** Building a marketplace requires solving payments, escrow, fraud, dispute resolution, and user trust. That's a different (harder) business. RCDV's moat is the data graph, not user-generated listings.

**Alternatives rejected:**
- Marketplace pivot: rejected. Would require infrastructure RCDV has no edge in.
- Hybrid (data + marketplace): rejected. Forces complexity without clear win.

**Tradeoffs:** RCDV cannot capture marketplace transaction fees. Capture is through SaaS tiers, API access, content engagement.

**Impact:** Product roadmap. Affects every "should we build X?" decision.

**Reversal cost:** Very High. Pivoting to a marketplace would be a different business.

---

## 2026-05-26 — HyperFrames approved as future content rendering engine, implementation deferred

**Decision:** HyperFrames (github.com/heygen-com/hyperframes) is the pre-selected rendering engine for the programmatic content layer. Implementation is deferred until trigger conditions are met (canonicalization shipped, marketplace UI functional, demand-anchor decision resolved, eBay escalation resolved, active-thread capacity available).

**Why:** Deterministic (same template + same data = identical output), HTML+GSAP-native (familiar stack), local FFmpeg rendering (no SaaS cost or vendor lock), Claude Code skills pre-installed.

**Alternatives rejected:**
- Sora / Veo / Runway APIs: per-generation cost prohibitive, non-deterministic, no compositional control over data overlays.
- Remotion: solid framework but HyperFrames designed specifically for AI agent workflows.
- Manual production (Canva, CapCut): doesn't scale, doesn't bind to data graph.

**Tradeoffs:** Pre-selection means committing to one tool before having activated the workstream. Risk: if HyperFrames stagnates between now and activation, we'd reconsider. Pre-trigger reading (~30 min) is allowed to maintain familiarity.

**Impact:** When the programmatic content layer activates, no tool-selection bake-off needed.

**Reversal cost:** Medium. Templates would need to be rewritten in another tool, but the architectural commitments (data binding, provenance gates, content type catalog) carry over.

---

## 2026-05-26 — No coupling between RCDV and Canopy

**Decision:** RCDV and Canopy are separate businesses, separate codebases, separate Supabase projects, separate Vercel projects. Shared infrastructure ONLY at the Cloudflare account level (with separate buckets/configs per project).

**Why:** Different revenue models, different users, different operating constraints. Coupling them creates accidental complexity that benefits neither.

**Alternatives rejected:**
- Shared Supabase project: rejected. PHI/business-data separation matters even between non-PHI projects (Sycamore's vendor data shouldn't share auth context with RCDV's listing data).
- Shared component library: rejected as premature. Three components in common doesn't justify the maintenance overhead.

**Tradeoffs:** Some duplication of bootstrapping work per project (auth setup, base UI components, etc.). Acceptable cost.

**Impact:** Architecture across the entire portfolio.

**Reversal cost:** Medium. Separating coupled systems is harder than keeping them separate.

---

## 2026-05-26 — Scraping strategy: eBay API > Scrapy spiders > skip Facebook Marketplace

**Decision:** eBay listings via official Developer API (NOT scraping). Other sources via Scrapy + scrapy-playwright. Facebook Marketplace explicitly skipped.

**Why:** eBay API is well-documented and TOS-compliant. Scraping eBay would violate TOS and risk account termination. Other sources lack APIs but are scrapable. Facebook Marketplace is hostile to scraping and fragile.

**Alternatives rejected:**
- Scrape eBay aggressively: rejected (TOS, fragility).
- Skip eBay: rejected (eBay is the largest source of sold-comp data).
- Scrape Facebook Marketplace: rejected (TOS hostile, account risk, fragile).

**Tradeoffs:** Need to maintain eBay API credentials and rate-limit compliance. Facebook listings are absent from the data graph.

**Impact:** Data ingestion architecture. Source priority order.

**Reversal cost:** Low. Source strategy can be adjusted as situations change.

---

## 2026-05-26 — License strategy: MIT or Apache 2.0 for own code; no AGPL vendoring

**Decision:** RCDV's own code is licensed MIT or Apache 2.0. AGPL-licensed code is NOT vendored into the repo. AGPL tools are used only via unmodified hosted versions (Documenso pattern, applies to Firecrawl and Maxun if they're used at all).

**Why:** AGPL contagion would force RCDV's entire codebase to be AGPL. Since this is a public repo intended for community discovery, MIT/Apache 2.0 keep adoption frictionless.

**Alternatives rejected:**
- AGPL the whole site: rejected. Conflicts with possible future commercial offerings around the data graph.
- BSD-3-Clause / others: acceptable alternatives but MIT/Apache are more common and better understood.

**Tradeoffs:** Cannot vendor AGPL tools. Must use them via hosted versions only.

**Impact:** TOOLCHEST.md, license decision per dependency.

**Reversal cost:** Low at present (no AGPL code in the repo). Would increase rapidly if AGPL code were vendored and then needed to be removed.

---

## 2026-05-26 — Operating-rules thread discipline: max 3 active threads

**Decision:** No more than 3 active architectural workstreams at any time. When at 3 and a new important thread arrives, an existing thread must be resolved or paused first.

**Why:** Solo founder with multiple projects. Without thread discipline, every interesting direction expands and nothing ships. Three is the experimentally-validated max where context switching is manageable.

**Alternatives rejected:**
- Unbounded parallelism: rejected. Causes nothing to ship.
- One-thread-at-a-time strict serialization: rejected. Some threads have natural blocking points where parallel work is fine.

**Tradeoffs:** Some attractive directions get parked. Acceptable cost.

**Impact:** All project planning. Sets a hard cap on simultaneous workstreams.

**Reversal cost:** Low. Policy can be relaxed if circumstances justify.

---

## Earlier Decisions (pre-dating structured logging)

- **Public repo:** RCDV is intentionally public for discoverability. Scrapers and patterns are visible; that's accepted.
- **No PII collection by default:** RCDV is a marketplace data tool, not a customer-data product. User accounts (if added later) require explicit auth planning.
- **Stack: Next.js + TypeScript + Tailwind + shadcn/ui + Supabase + Scrapy/dlt:** established as the project's default. Reasoning per project handoff.

---

## Change Log

- **2026-05-27 v1:** Initial creation. Seeded with v2.5.x decisions: Trust Layer structural enforcement, canonicalization gate, demand-anchor thesis, HyperFrames pre-selection with deferred implementation, no Canopy coupling, license strategy, scraping strategy, thread discipline, and the three new tool evaluation candidates from 2026-05-26.

---

## 2026-06-06 — Renovate dependency bot: kept on RCDV, quiet config

**Decision:** Keep Mend Renovate enabled on `rc-data-vault-frontend`, configured low-noise.
**Config:** Monthly schedule; non-major updates grouped into one PR; Dependency Dashboard ON
(approval-queue workflow); `automerge: false`; vulnerability/security alerts surfaced any time
(not held for the monthly window; `osvVulnerabilityAlerts` enabled). No production-impacting
behavior beyond normal PR review/merge.
**Context:** Renovate (Mend GitHub App) was found installed on the `webby3420-cmd` account with
"Only select repositories" scope (`rc-data-vault-frontend`, `canopy-app`, `_handoffs`), installed
2026-06-01. The adoption was intentional (dependency security + drift control) but predated
documentation — never logged at the time. Surfaced via a Vercel "deployment error" email that led
to the open onboarding PR (#3).
**Activation:** Conservative `renovate.json` committed via PR #3 and merged.
**Future lever:** If PR-preview noise grows, suppress Renovate's Vercel previews via a Vercel
ignored-build-step (skip build when only renovate.json/dep changes) — not enabled now.
**Scope note:** `canopy-app` and `_handoffs` remain on Renovate — to be decided separately.

---

## 2026-06-07 — Product structured data: active-listing offers only

Product structured data will use active matched listings only. Sold comps remain valuation
data and must never populate Product offers. Emit Offer for exactly one clean approved active
listing, AggregateOffer for two or more, and omit offers entirely when no clean approved active
listing exists. Matching visible page content is required.

Source: read-only view `public.v_variant_active_offer` (active + USD + actionable + parts-excluded
+ vehicle-eligible + approved-matched). Coverage at ship: 70 of 1,047 variants (~7%); gated and
self-expanding as matches are approved. Follow-on track (NOT part of this fix): active-listing
match approval is the true coverage driver for Product rich-result eligibility.
