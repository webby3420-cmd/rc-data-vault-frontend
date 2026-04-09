import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BestOfCard from "@/components/best/BestOfCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Best RC Monster Trucks Under $1,000 | RC Data Vault",
  description: "Top-rated RC monster trucks under $1,000 ranked by real sold market data. Compare fair values, price ranges, and market confidence.",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Page() {
  const { data } = await (supabase.rpc as any)("get_best_of_variants", {
    p_category: "monster truck",
    p_price_max: 1000,
    p_price_min: null,
    p_min_obs: 3,
    p_limit: 10,
  });

  const variants = data?.variants ?? [];

  const slugs = variants.map((v: any) => v.variant_slug).filter(Boolean);
  const { data: payloads } = slugs.length > 0
    ? await supabase.from("mv_variant_payload").select("variant_slug, primary_image_url").in("variant_slug", slugs)
    : { data: [] };
  const imageMap: Record<string, string> = {};
  for (const p of payloads ?? []) {
    if (p.primary_image_url) imageMap[p.variant_slug] = p.primary_image_url;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <span>Best RC Cars</span>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Monster Trucks Under $1,000</span>
        </nav>
        <h1 className="mb-2 text-3xl font-semibold text-white">Best RC Monster Trucks Under $1,000</h1>
        <p className="mb-8 text-slate-400">{variants.length} models ranked by real market data</p>

        {variants.length > 0 ? (
          <div className="space-y-4">
            {variants.map((v: any, i: number) => (
              <BestOfCard key={v.variant_slug} variant={v} rank={i + 1} signupSource="best_of_trucks_under_1000" imageUrl={imageMap[v.variant_slug]} />
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
