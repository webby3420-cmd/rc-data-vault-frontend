import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BestOfCard from "@/components/best/BestOfCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fastest RC Cars by Market Data | RC Data Vault",
  description: "Fastest RC cars ranked by top speed and backed by real sold market data. Compare values, speed, and market confidence.",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Page() {
  const { data } = await (supabase.rpc as any)("get_best_of_variants", {
    p_category: null,
    p_price_max: null,
    p_price_min: null,
    p_min_obs: 3,
    p_limit: 30,
  });

  const allVariants = data?.variants ?? [];
  const variants = allVariants
    .filter((v: any) => v.top_speed_mph != null)
    .sort((a: any, b: any) => (b.top_speed_mph ?? 0) - (a.top_speed_mph ?? 0))
    .slice(0, 8);

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
          <span className="text-slate-300">Fastest</span>
        </nav>
        <h1 className="mb-2 text-3xl font-semibold text-white">Fastest RC Cars by Market Data</h1>
        <p className="mb-8 text-slate-400">{variants.length} models ranked by top speed with real market data</p>

        {variants.length > 0 ? (
          <div className="space-y-4">
            {variants.map((v: any, i: number) => (
              <BestOfCard key={v.variant_slug} variant={v} rank={i + 1} signupSource="best_of_speed" imageUrl={imageMap[v.variant_slug]} />
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
