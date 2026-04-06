import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Variant = {
  variant_slug: string;
  variant_name: string;
  fair_value: number | null;
  low: number | null;
  high: number | null;
  confidence: string | null;
  obs_count: number | null;
};

type PageData = {
  manufacturer_slug: string;
  manufacturer_name: string;
  family_slug: string;
  family_name: string;
  variants: Variant[];
};

export async function generateMetadata({ params }: { params: Promise<{ manufacturer: string; family: string }> }): Promise<Metadata> {
  const { manufacturer, family } = await params;
  const { data } = await supabase.rpc("get_family_page", { p_manufacturer_slug: manufacturer, p_family_slug: family });
  if (!data) return { title: "RC Data Vault" };
  return {
    title: `${data.manufacturer_name} ${data.family_name} Value & Price Guide | RC Data Vault`,
    description: `Used market values for the ${data.manufacturer_name} ${data.family_name} based on real sold listings.`,
  };
}

function formatValue(v: number | null) {
  if (!v) return null;
  return `$${Math.round(v).toLocaleString()}`;
}

export default async function FamilyPage({ params }: { params: Promise<{ manufacturer: string; family: string }> }) {
  const { manufacturer, family } = await params;

  const { data, error } = await supabase.rpc("get_family_page", { p_manufacturer_slug: manufacturer, p_family_slug: family });

  if (error) console.error("[family page] RPC error:", JSON.stringify(error));

  const page = data as PageData | null;

  if (!page || !page.variants?.length) {
    console.error("[family page] notFound — manufacturer:", manufacturer, "family:", family, "data:", JSON.stringify(data));
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <a className="hover:text-white" href={`/rc/${page.manufacturer_slug}`}>{page.manufacturer_name}</a>
          <span className="mx-2">/</span>
          <span>{page.family_name}</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">{page.manufacturer_name} {page.family_name} Value &amp; Price Guide</h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">Browse used {page.manufacturer_name} {page.family_name} values by variant. All values are based on real sold listings from eBay.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {page.variants.map((v) => (
            <a key={v.variant_slug} href={`/rc/${page.manufacturer_slug}/${page.family_slug}/${v.variant_slug}`} className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
              <div className="text-lg font-medium text-white">{v.variant_name}</div>
              <div className="mt-2 flex items-center gap-3">
                {v.fair_value ? (<span className="text-xl font-semibold text-amber-400">{formatValue(v.fair_value)}</span>) : (<span className="text-sm text-slate-500">No valuation yet</span>)}
                {v.low && v.high && (<span className="text-sm text-slate-400">{formatValue(v.low)} – {formatValue(v.high)}</span>)}
              </div>
              {v.obs_count && v.obs_count > 0 ? (<div className="mt-1 text-xs text-slate-500">{v.obs_count} sold listings</div>) : null}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
