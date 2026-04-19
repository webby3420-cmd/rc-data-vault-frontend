import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VariantPagePayload } from "@/types/variant-page";

const RPC_TIMEOUT_MS = 15000;

/**
 * Cached server-side fetch of get_variant_page_payload.
 *
 * cache() dedupes within one SSR render tree: Tier 2 and Tier 3 share
 * the same in-flight promise, so the DB is hit at most once per request.
 *
 * Returns null on RPC error or timeout instead of throwing — the variant
 * page renders progressive fallbacks for missing data and a thrown error
 * here would crash the whole tier.
 */
export const getVariantPagePayload = cache(
  async (slug: string): Promise<VariantPagePayload | null> => {
    const supabase = createSupabaseServerClient();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

    try {
      const { data, error } = await supabase
        .rpc("get_variant_page_payload", { p_variant_slug: slug })
        .abortSignal(controller.signal);

      if (error) {
        console.error("[variant page] RPC error", {
          slug,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return null;
      }
      return (data ?? null) as VariantPagePayload | null;
    } catch (err) {
      const aborted = controller.signal.aborted;
      console.error("[variant page] RPC failure", {
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
