import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BestOfCard from "@/components/best/BestOfCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Best Large Scale RC Trucks | RC Data Vault",
  description: "Top large scale RC trucks (1/5, 1/6, 1/7, 1/8) ranked by real sold market data. Compare values, specs, and market confidence.",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Page() {
  const { data } = await (supabase.rpc as any)("get_best_of_variants", {
    p_category: null,
    p_price_max: null,
    p_price_min: 400,
    p_min_obs: 3,
    p_limit: 15,
  });

  const allVariants = data?.variants ?? [];
  const variants = allVariants
    .filter((v: any) => {
      const s = v.scale?.toLowerCase() ?? "";
      return s.includes("1/5") || s.includes("1/6") || s.includes("1/7") || s.includes("1/8");
    })
    .slice(0, 10);

  const imageMap: Record<string, string> = {};
  if (variants.length > 0) {
    const payloads = await Promise.all(
      variants.map((v: any) => (supabase.rpc as any)("get_variant_page_payload_v2", { p_variant_slug: v.variant_slug }))
    );
    for (let i = 0; i < variants.length; i++) {
      const url = payloads[i]?.data?.identity?.primary_image_url;
      if (url) imageMap[variants[i].variant_slug] = url;
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <span>Best RC Cars</span>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Large Scale Trucks</span>
        </nav>
        <h1 className="mb-2 text-3xl font-semibold text-white">Best Large Scale RC Trucks</h1>
        <p className="mb-8 text-slate-400">{variants.length} large scale models ranked by real market data</p>

        {variants.length > 0 ? (
          <div className="space-y-4">
            {variants.map((v: any, i: number) => (
              <BestOfCard key={v.variant_slug} variant={v} rank={i + 1} signupSource="best_of_large_scale" imageUrl={imageMap[v.variant_slug]} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No qualifying models found.</p>
        )}

        <p className="mt-10 text-xs text-slate-600 text-center">
          Rankings based on real sold listing data from eBay. Updated as new market data is collected.
        </p>
      </div>
    </main>
  );
}
