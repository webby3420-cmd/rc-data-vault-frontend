import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Family = { family_slug: string; family_name: string; variant_count: number };
type PageData = { manufacturer_slug: string; manufacturer_name: string; families: Family[] };

export async function generateMetadata({ params }: { params: Promise<{ manufacturer: string }> }): Promise<Metadata> {
  const { manufacturer } = await params;
  const { data } = await supabase.rpc("get_manufacturer_page", { p_manufacturer_slug: manufacturer });
  if (!data) return { title: "RC Data Vault" };
  return {
    title: `${data.manufacturer_name} RC Values & Price Guide | RC Data Vault`,
    description: `Used market values for ${data.manufacturer_name} RC vehicles based on real sold listings.`,
  };
}

export default async function ManufacturerPage({ params }: { params: Promise<{ manufacturer: string }> }) {
  const { manufacturer } = await params;
  const { data } = await supabase.rpc("get_manufacturer_page", { p_manufacturer_slug: manufacturer });
  const page = data as PageData | null;
  if (!page || !page.families?.length) notFound();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <a className="hover:text-white" href="/rc">RC Vehicle Values</a>
          <span className="mx-2">/</span>
          <span>{page.manufacturer_name}</span>
        </nav>
        <h1 className="mb-4 text-3xl font-semibold text-white">{page.manufacturer_name} RC Values &amp; Price Guide</h1>
        <p className="mb-10 max-w-2xl text-slate-400 leading-7">Browse used {page.manufacturer_name} RC values by model family. All values are based on real sold listings from eBay.</p>
        <h2 className="mb-4 text-xl font-medium text-slate-200">Browse by Model Family</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {page.families.map((f) => (
            <a key={f.family_slug} href={`/rc/${page.manufacturer_slug}/${f.family_slug}`} className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
              <div className="text-lg font-medium text-white">{f.family_name}</div>
              <div className="mt-1 text-sm text-slate-400">{f.variant_count} {f.variant_count === 1 ? "variant" : "variants"} &middot; real sold listings</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
