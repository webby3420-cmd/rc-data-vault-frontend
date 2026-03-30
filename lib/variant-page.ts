import { cache } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VariantPagePayload } from "@/types/variant-page";

export const getVariantPagePayload = cache(
  async (slug: string): Promise<VariantPagePayload> => {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_variant_page_payload", {
      p_variant_slug: slug,
    });

    if (error) {
      throw new Error(`RPC get_variant_page_payload failed: ${error.message}`);
    }

    if (!data) {
      notFound();
    }

    return data as VariantPagePayload;
  }
);
