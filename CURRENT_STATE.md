# CURRENT STATE — RC Data Vault

**Project repo:** rc-data-vault-frontend
**Purpose:** Operational re-entry document. Where exactly did work stop? What's the next concrete action?
**Update frequency:** HIGH. Update at end of every working session.
**Last updated:** 2026-06-12 (evening)

---

## If Returning Cold

Read in this order:

1. This file (CURRENT_STATE.md) — what's happening right now
2. DECISIONS_LOG.md, last ~10 entries — why things are the way they are
3. TERMINOLOGY.md — v2.5.x architectural vocabulary (load-bearing)
4. `~/dev/projects/_handoffs/HANDOFF-RC-DATA-VAULT.md` — full project context (canonical, includes §2.7 programmatic content layer)
5. `CLAUDE.md` (at repo root) — behavioral guidance for Claude Code, includes Trust Layer rules
6. Latest git commits: `git log --oneline -20`
7. Open PRs / branches if any
8. Master plan v2.5.3 (if locatable — see Open Questions)

This sequence gives both humans and AI models deterministic project rehydration.

---

## Status Headline

**As of 2026-05-27 morning:** Infrastructure setup complete (handoffs, CLAUDE.md, agents, terminology + decisions + current_state files, v2.5.x vocabulary locked, HyperFrames addendum merged). **No features shipped yet.** Three significant open decisions block the canonicalization pipeline (see Active Blockers).

---

## Active Work

**In progress:** None. Last session was infrastructure consolidation, not feature work.

**Active branch:** main (no work-in-progress branches)

**Active threads:** 0 of 3 capacity used (operating-rules thread discipline).

---

## Active Blockers

These need decisions before the canonicalization pipeline can ship:

1. **Demand-anchor decision unresolved.** Per operating rules, this is a prerequisite for the programmatic content layer (§2.7). Status: open. Resolution path: needs explicit framing session.
2. **eBay escalation unresolved.** Per operating rules. Status: open. Resolution path: clarify what the escalation is (API access tier? rate limits? account standing?) and address.
3. **Canonicalization tool selection pending.** Three evaluation candidates (Crawl4AI, ScrapeGraphAI, Firecrawl) need head-to-head testing. Decision blocks `listing_normalization_agent` design.

---

## Recently Completed

(Updated 2026-05-27)

- ✅ CLAUDE.md placed at repo root with Karpathy's four principles + RCDV-specific Trust Layer rules
- ✅ HANDOFF-RC-DATA-VAULT.md v2 published with HyperFrames addendum merged as §2.7
- ✅ Architectural vocabulary section added (Trust Layer, canonicalization, listing_normalization_agent, contamination protections, catalog_issue, demand-anchor, operating-rules thread discipline)
- ✅ Data model sketch updated to include `canonicalization_confidence`, `catalog_issue`, `contamination_flags` columns
- ✅ Scraping tool evaluation (9 repos verified, 3 flagged as evaluation candidates)
- ✅ codebase-researcher and implementation-validator agents installed at user level
- ✅ Memory architecture files (this file + DECISIONS_LOG + TERMINOLOGY) created

---

## Next Concrete Actions (in priority order)

1. **Invoke codebase-researcher agent** on rc-data-vault-frontend to map the current state of the repo. Most likely finding: it's still scaffolding-stage with no data ingestion yet. The research report becomes the ground-truth baseline for the next move.

2. **Resolve the eBay escalation** (one of three blockers). Determine: (a) what API tier/access do we have or need? (b) any rate-limit issues observed? (c) is registration complete? (d) is there a TOS/account standing concern? Output: a short note in DECISIONS_LOG.md resolving this.

3. **Resolve the demand-anchor decision** (second blocker). Specifically: which surface ships first — alerts, deal feed, valuation tool, or something else? The answer determines what canonical data structures the pipeline must produce first.

4. **Run head-to-head MCP evaluation** of ScrapeGraphAI + Crawl4AI (the two MIT/Apache licensed candidates). Add their MCP servers to the RCDataVault Claude Project. Test extraction on 3-5 real RC listings. Pick a winner. Document in DECISIONS_LOG.md.

5. **Design `listing_normalization_agent`** based on selected extraction tool. Output: a design doc that specifies inputs, outputs, confidence scoring, contamination flags, and `catalog_issue` triggers.

6. **First slice of canonicalization pipeline.** Smallest viable vertical: ingest one source → normalize → canonical view → trust-layer-gated UI rendering for ONE model category (e.g., 1/10 scale electric buggies).

7. **Invoke implementation-validator agent** on the shipped slice. Audit against Trust Layer rules, contamination protections, license compliance.

---

## Known Issues

- The pre-commit hook from SETUP-AGENT-TEAM.md is NOT yet installed in this repo. Public repo = higher consequence if a secret gets committed (it's permanently in git history visible to anyone). Install during the first real-feature session.
- eBay Developer API status not confirmed in this session. Verify before architecting the eBay ingestion path.
- Master plan v2.5.3 is referenced throughout handoff documents but its physical location is unknown (see Open Questions).
- No working scraper exists yet for ANY source. Greenfield ingestion.
- `vehicles` canonical catalog is empty. First ingestion will need to populate it as part of the canonicalization step, OR we seed it from an authoritative source first.

---

## Open Questions

- **Where is master plan v2.5.3?** Referenced repeatedly in handoffs. Possibly in a Claude Project, possibly in older session exports. Locating it is medium priority.
- **eBay Developer API status?** Registered? Approved? Rate-limited? Active blocker.
- **`vehicles` catalog seeding:** scrape from a single authoritative source (manufacturer specs?), populate manually, or build incrementally as listings come in?
- **First model category for canonicalization slice:** which RC category has the cleanest data and best market activity to use as the v1 proof? (Common candidates: 1/10 electric buggies, 1/8 nitro buggies, vintage Tamiya, etc.)

---

## Operating Rules Status

Per the 3-active-threads-max rule:

- **Thread slot 1:** EMPTY
- **Thread slot 2:** EMPTY
- **Thread slot 3:** EMPTY

When work starts, threads should be:
- "Resolve eBay escalation"
- "Resolve demand-anchor decision"
- "Evaluate canonicalization extraction tools"

That's 3. At capacity. Programmatic content layer (§2.7) cannot activate until at least one of these closes AND its own trigger conditions are met.

---

## Session Log Pointer

For session-by-session history, see `~/dev/projects/_handoffs/SESSION-HANDOFF-YYYY-MM-DD.md` files. The most recent is the 2026-05-26 session-handoff.

---

## Update Discipline

When closing a session:

1. Update **Status Headline** (one sentence describing where you are)
2. Update **Active Work** and **Active Blockers** (what's actually in flight, what's actually stuck)
3. Update **Active threads** count (operating-rules discipline)
4. Update **Recently Completed** (only meaningful completions)
5. Update **Next Concrete Actions** if priorities shifted
6. Add to **Known Issues** if new ones surfaced
7. Add to **Open Questions** if new ones surfaced
8. DO NOT update TERMINOLOGY or DECISIONS_LOG unless a real vocabulary or decision change actually happened

Time per update: 3-5 minutes max.

---

## Change Log

- **2026-05-27 v1:** Initial creation. Reflects state after 2026-05-26 infrastructure setup session. Three architectural blockers identified (eBay escalation, demand-anchor decision, canonicalization tool selection). Operating-rules thread budget at 0/3.

---

## 2026-06-07 — Product structured-data (active offers) SHIPPED + production-verified
- PR #6 merged (squash): ef83ef3190b23d40a4b71ff1275573ef1e9819a8
- Production deploy: dpl_72QvFXc4NjqmGyPcfpudqgd5rzT1 (READY, target production)
- Tamiya Nismo R34 positive: PASS (AggregateOffer offerCount 7, $155.80–$448.22; visible callout matches)
- X-Maxx 8S negative control: PASS (no offers, no callout)
- Trust boundary preserved: active matched listings only; sold comps untouched
- Source view: v_variant_active_offer; coverage at ship 70/1,047 variants (~7%), gated + self-expanding
- Duplicate Vercel project rc-data-vault-frontend: RESOLVED — deleted 2026-06-10, T05 closed
- Pending (Jason): Google Rich Results Test + GSC Validate Fix (WNC-10030322)
- Next: eBay escalation, then deal-feed PR

---

## Maintenance / Backlog

- RESOLVED 2026-06-10 (T05): duplicate Vercel project deleted by operator; PR checks clean.

---

## 2026-06-12 — Consolidated state: T02/T03 shipped, brand pages fixed, T05 closed, T03-HF1 resolved

**Shipped to production (rcdatavault.com):**
- PR #9 (T02), merged 2026-06-10 (3a4c993): all deal surfaces read v_top_deals_balanced; deal_score scale 0-100.
- PR #10 (T03), merged 2026-06-10 (1f6a807): alert trust hardening; alert_ready_deals_view contamination gate (76 -> 10 rows, zero contamination).
- PR #11 (T02-HF1), merged (0d9a899): /deals/[brand] 404 fix — Next.js 16 async params await + decodeURIComponent brand fallback. Latent pre-T02 bug surfaced by post-deploy verification. Verified live: /deals/arrma 200, 3 cards, decoded brand in H1.
- alert-delivery-worker v10 deployed 2026-06-10 (verify_jwt true, sha256 3e78bdce...): reads v_top_deals_balanced; zero top_deals_live consumers remain anywhere.

**T05 CLOSED:** duplicate Vercel project deleted 2026-06-10; canonical rcdatavault-frontend only.

**T03-HF1 incident (2026-06-12) — alert delivery had NEVER fired via cron:**
- Root cause: cron job 25 built its Authorization header from current_setting('app.service_role_key'), a GUC never set on this database -> NULL header -> verify_jwt 401 -> worker body never executed. Broken since the cron's creation in April; predates and is independent of worker v10.
- Blast: alert_jobs backlog accumulated 2026-04-09 through 06-12 (65 pending, attempt_count 0, processed_at NULL throughout). cron.job_run_details reported "succeeded" the entire time — that status only proves net.http_post enqueued.
- Fix: legacy service_role JWT stored in Supabase Vault as secret name service_role_key (operator-placed via dashboard); job 25 repointed to read Vault at call time with 60s timeout. 63 stale jobs (>48h) expired to status skipped, failure_reason expired_stale_backlog_T03HF1_20260612. Test-fire: HTTP 200, processed 2 / sent 0 / skipped 2 / failed 0. Queue clean: 0 pending, 0 failed.
- Watch: first autonomous run 2026-06-13 08:00 UTC. Verify via net._http_response status+body AND alert_jobs.processed_at movement — never cron.job_run_details alone.

**Known issues / queue:**
- Unidentified */15 cron returning processed 0 / failed 20 / total 20 — identify next session (candidates: ebay-active-listings, generate-embeddings).
- cron job 35 (generate-embeddings-hourly) carries a plaintext secret API key inside cron.job.command — rotate the key, then migrate to the Vault pattern.
- eBay Finding API escalation email still NOT SENT (errorId 10001 / RateLimiter; sold-comp ingestion blocked since mid-April) — top external blocker. Cron job 62 remains paused.
- GSC Validate Fix (operator action) still pending.
- COMPLETION-ROADMAP.md and APPROVALS-NEEDED.md exist only as UNTRACKED local files in this working tree — they are invisible to the repo and went stale enough to act as a false trust anchor during T03-HF1. Decision pending: track them here or move to _handoffs.

**Next:** eBay escalation -> GSC three-liner -> AUDIT-6 -> v2.7.0 acceptance.
