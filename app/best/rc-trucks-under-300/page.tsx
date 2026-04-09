import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BestOfCard from "@/components/best/BestOfCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Best RC Trucks Under $300 | RC Data Vault",
  description: "Top RC trucks under $300 ranked by real sold market data. Compare fair values, price ranges, and market confidence.",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Page() {
  const { data } = await (supabase.rpc as any)("get_best_of_variants", {
    p_category: "monster truck",
    p_price_max: 300,
    p_price_min: null,
    p_min_obs: 3,
    p_limit: 10,
  });

  const variants = data?.variants ?? [];

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
          <span className="text-slate-300">Trucks Under $300</span>
        </nav>
        <h1 className="mb-2 text-3xl font-semibold text-white">Best RC Trucks Under $300</h1>
        <p className="mb-8 text-slate-400">{variants.length} models ranked by real market data</p>

        {variants.length > 0 ? (
          <div className="space-y-4">
            {variants.map((v: any, i: number) => (
              <BestOfCard key={v.variant_slug} variant={v} rank={i + 1} signupSource="best_of_trucks_under_300" imageUrl={imageMap[v.variant_slug]} />
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
