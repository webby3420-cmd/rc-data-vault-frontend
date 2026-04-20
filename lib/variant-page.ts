import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VariantPagePayload } from "@/types/variant-page";

const RPC_TIMEOUT_MS = 15000;

/**
 * Cached server-side fetch of the variant page payload.
 *
 * cache() dedupes within one SSR render tree: Tier 2 and Tier 3 share
 * the same in-flight promise per request.
 *
 * Primary read: mv_variant_payload_cache (precomputed, ~2ms PK lookup,
 *   refreshed every 15 minutes by cron).
 * Fallback: live get_variant_page_payload RPC with AbortController
 *   timeout (for cache miss, new slug, or cache table error).
 *
 * Returns null on RPC error or timeout instead of throwing — the variant
 * page renders progressive fallbacks for missing data and a thrown error
 * here would crash the whole tier.
 */
export const getVariantPagePayload = cache(
  async (slug: string): Promise<VariantPagePayload | null> => {
    const supabase = createSupabaseServerClient();

    // ── Fast path: precomputed cache table (~2ms) ─────────────────────
    const { data: cached, error: cacheError } = await supabase
      .from("mv_variant_payload_cache")
      .select("payload_json, refreshed_at")
      .eq("variant_slug", slug)
      .single();

    if (!cacheError && cached?.payload_json) {
      return cached.payload_json as VariantPagePayload;
    }

    // ── Fallback: live RPC (cache miss, new slug, or table error) ─────
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

    try {
      const { data, error } = await supabase
        .rpc("get_variant_page_payload", { p_variant_slug: slug })
        .abortSignal(controller.signal);

      if (error || !data) {
        console.error("[variant page] RPC error", {
          slug,
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
        });
        return null;
      }

      return data as VariantPagePayload;
    } catch (err) {
      const aborted = controller.signal.aborted;
      console.error("[variant page] RPC error", {
        slug,
        aborted,
        message: err instanceof Error ? err.message : String(err),
      });
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
);
