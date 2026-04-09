import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PriceAlertSignup from "@/components/PriceAlertSignup";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ComparisonVariant = {
  variant_id: string;
  variant_slug: string;
  variant_name: string;
  manufacturer_name: string;
  manufacturer_slug: string;
  family_name: string;
  family_slug: string;
  canonical_url: string;
  msrp_original: number | null;
  release_year: number | null;
  has_valuation: boolean;
  fair_value: number | null;
  low_value: number | null;
  high_value: number | null;
  confidence: string | null;
  obs_count: number;
  active_listings: number;
  sold_30d: number;
};

type PageProps = {
  params: Promise<{ slugA: string; slugB: string }>;
};

function fmt(n: number | null) {
  if (n == null) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}

const CONFIDENCE_STYLE: Record<string, { cls: string; label: string }> = {
  reliable: { cls: "text-green-400 bg-green-900/30", label: "Reliable" },
  low: { cls: "text-amber-400 bg-amber-900/30", label: "Low" },
  insufficient: { cls: "text-slate-400 bg-slate-800", label: "Insufficient" },
};

function ConfidenceBadge({ confidence }: { confidence: string | null }) {
  const style = CONFIDENCE_STYLE[confidence ?? ""] ?? CONFIDENCE_STYLE.insufficient;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style.cls}`}>
      {style.label}
    </span>
  );
}

export async function generateStaticParams() {
  return [
    { slugA: "traxxas-x-maxx-8s-brushless-rtr", slugB: "arrma-kraton-6s-blx-exb-rtr" },
    { slugA: "traxxas-x-maxx-8s-brushless-rtr", slugB: "arrma-kraton-brushless-1-8-4x4-rtr-6s" },
    { slugA: "traxxas-x-maxx-8s-brushless-rtr", slugB: "arrma-typhon-6s-blx-4x4-rtr" },
    { slugA: "arrma-kraton-6s-blx-exb-rtr", slugB: "arrma-typhon-6s-blx-4x4-rtr" },
    { slugA: "traxxas-slash-4x4-vxl", slugB: "arrma-fury-blx-2wd-rtr" },
    { slugA: "traxxas-sledge", slugB: "arrma-kraton-4s-v2-blx-1-10-rtr" },
    { slugA: "traxxas-sledge", slugB: "traxxas-maxx-widemaxx-rtr" },
    { slugA: "arrma-mojave-brushless-1-7-4x4-rtr-6s", slugB: "arrma-felony-6s-blx-1-7-rtr" },
    { slugA: "traxxas-xrt", slugB: "arrma-kraton-8s-blx-exb-rtr" },
    { slugA: "losi-super-baja-rey-2-0", slugB: "arrma-mojave-brushless-1-7-4x4-rtr-6s" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slugA, slugB } = await params;
  const { data } = await (supabase.rpc as any)("get_variant_comparison", { p_slugs: [slugA, slugB] });
  const variants = data as ComparisonVariant[] | null;

  if (!variants || variants.length < 2) {
    return { title: "Comparison | RC Data Vault" };
  }

  const a = variants.find((v) => v.variant_slug === slugA) ?? variants[0];
  const b = variants.find((v) => v.variant_slug === slugB) ?? variants[1];
  const nameA = `${a.manufacturer_name} ${a.variant_name}`;
  const nameB = `${b.manufacturer_name} ${b.variant_name}`;

  const canA = slugA <= slugB ? slugA : slugB;
  const canB = slugA <= slugB ? slugB : slugA;

  return {
    title: `${nameA} vs ${nameB} — Price Comparison | RC Data Vault`,
    description: `Compare the ${a.variant_name} and ${b.variant_name} side by side. Real market values from sold eBay listings. Fair value, price range, and availability.`,
    alternates: {
      canonical: `https://rcdatavault.com/compare/${canA}/${canB}`,
    },
  };
}

export default async function ComparePage({ params }: PageProps) {
  const { slugA, slugB } = await params;

  if (slugA > slugB) {
    redirect(`/compare/${slugB}/${slugA}`);
  }

  const { data, error } = await (supabase.rpc as any)("get_variant_comparison", {
    p_slugs: [slugA, slugB],
  });

  if (error) console.error("[compare] RPC error:", JSON.stringify(error));

  const variants = data as ComparisonVariant[] | null;
  if (!variants || variants.length < 2) notFound();

  const a = variants.find((v) => v.variant_slug === slugA) ?? variants[0];
  const b = variants.find((v) => v.variant_slug === slugB) ?? variants[1];

  const nameA = `${a.manufacturer_name} ${a.variant_name}`;
  const nameB = `${b.manufacturer_name} ${b.variant_name}`;

  // Determine which has lower fair value (better deal)
  const bothValued = a.has_valuation && b.has_valuation && a.fair_value != null && b.fair_value != null;
  const aIsCheaper = bothValued && a.fair_value! < b.fair_value!;
  const bIsCheaper = bothValued && b.fair_value! < a.fair_value!;

  const rows: { label: string; valA: React.ReactNode; valB: React.ReactNode }[] = [
    {
      label: "Fair Market Value",
      valA: a.has_valuation ? (
        <span className={`text-lg font-semibold ${aIsCheaper ? "text-emerald-400" : "text-white"}`}>{fmt(a.fair_value)}</span>
      ) : (
        <span className="text-slate-500">No data yet</span>
      ),
      valB: b.has_valuation ? (
        <span className={`text-lg font-semibold ${bIsCheaper ? "text-emerald-400" : "text-white"}`}>{fmt(b.fair_value)}</span>
      ) : (
        <span className="text-slate-500">No data yet</span>
      ),
    },
    {
      label: "Value Range",
      valA: a.has_valuation ? <span className="text-slate-300">{fmt(a.low_value)} – {fmt(a.high_value)}</span> : <span className="text-slate-500">—</span>,
      valB: b.has_valuation ? <span className="text-slate-300">{fmt(b.low_value)} – {fmt(b.high_value)}</span> : <span className="text-slate-500">—</span>,
    },
    {
      label: "Confidence",
      valA: <ConfidenceBadge confidence={a.confidence} />,
      valB: <ConfidenceBadge confidence={b.confidence} />,
    },
    {
      label: "Sold Listings (data)",
      valA: <span className="text-slate-300">{a.obs_count} sales</span>,
      valB: <span className="text-slate-300">{b.obs_count} sales</span>,
    },
    {
      label: "Active Listings",
      valA: <span className="text-slate-300">{a.active_listings} listed</span>,
      valB: <span className="text-slate-300">{b.active_listings} listed</span>,
    },
    {
      label: "Original MSRP",
      valA: <span className="text-slate-300">{a.msrp_original ? fmt(a.msrp_original) : "—"}</span>,
      valB: <span className="text-slate-300">{b.msrp_original ? fmt(b.msrp_original) : "—"}</span>,
    },
    {
      label: "Release Year",
      valA: <span className="text-slate-300">{a.release_year ?? "—"}</span>,
      valB: <span className="text-slate-300">{b.release_year ?? "—"}</span>,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-400">
          <span>Compare</span>
          <span className="mx-2">/</span>
          <span className="text-slate-300">{nameA} vs {nameB}</span>
        </nav>

        {/* H1 */}
        <h1 className="mb-2 text-3xl font-semibold text-white">{nameA} vs {nameB}</h1>
        <p className="mb-8 text-slate-400">Side-by-side price and market comparison based on real sold listings</p>

        {/* Comparison table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-4 px-5 text-left text-xs uppercase tracking-wide text-slate-500"></th>
                <th className="py-4 px-5 text-left text-xs uppercase tracking-wide text-slate-400 font-medium">
                  <a href={a.canonical_url} className="hover:text-amber-400 transition-colors">{a.variant_name}</a>
                </th>
                <th className="py-4 px-5 text-left text-xs uppercase tracking-wide text-slate-400 font-medium">
                  <a href={b.canonical_url} className="hover:text-amber-400 transition-colors">{b.variant_name}</a>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="py-3.5 px-5 text-slate-500">{row.label}</td>
                  <td className="py-3.5 px-5">{row.valA}</td>
                  <td className="py-3.5 px-5">{row.valB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tool entry points */}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`/tools?tool=deal&model=${a.variant_slug}`}
            className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Check a price for {a.variant_name} &rarr;
          </a>
          <a
            href={`/tools?tool=deal&model=${b.variant_slug}`}
            className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Check a price for {b.variant_name} &rarr;
          </a>
        </div>

        {/* Variant links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={a.canonical_url}
            className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500"
          >
            <p className="text-sm font-medium text-white">View full market data for {a.variant_name}</p>
            <p className="mt-1 text-xs text-slate-400">{a.manufacturer_name} &middot; {a.family_name}</p>
            <p className="mt-2 text-sm text-amber-400">&rarr;</p>
          </a>
          <a
            href={b.canonical_url}
            className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500"
          >
            <p className="text-sm font-medium text-white">View full market data for {b.variant_name}</p>
            <p className="mt-1 text-xs text-slate-400">{b.manufacturer_name} &middot; {b.family_name}</p>
            <p className="mt-2 text-sm text-amber-400">&rarr;</p>
          </a>
        </div>

        {/* Alert CTAs */}
        <div className="mt-10 space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Track deals for {a.variant_name}</p>
            <PriceAlertSignup
              variantId={a.variant_id}
              variantSlug={a.variant_slug}
              modelName={nameA}
              mfrSlug={a.manufacturer_slug}
              familySlug={a.family_slug}
              signupSource="comparison_page"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Track deals for {b.variant_name}</p>
            <PriceAlertSignup
              variantId={b.variant_id}
              variantSlug={b.variant_slug}
              modelName={nameB}
              mfrSlug={b.manufacturer_slug}
              familySlug={b.family_slug}
              signupSource="comparison_page"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
