import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export const metadata: Metadata = { title: "RC Parts Catalog | RC Data Vault", description: "Browse OEM replacement parts and aftermarket upgrades for RC vehicles. Traxxas, ARRMA, Losi and more.", alternates: { canonical: "https://rcdatavault.com/parts" } };
const CATEGORY_ICONS: Record<string, string> = { differentials: "⚙️", motors: "⚡", shocks: "🔧", tires: "🔴", driveshafts: "🔩", escs: "💡", "suspension-arms": "🔗", wheels: "⭕", "gear-sets": "⚙️", "links-rods": "📏", servos: "🎮", "body-exterior": "🚗", chassis: "🏗️" };
export default async function PartsPage() {
  const { data } = await supabase.rpc("get_parts_catalog_summary");
  const categories: any[] = data?.categories ?? [];
  const manufacturers: any[] = data?.manufacturers ?? [];
  const totalParts: number = data?.total_parts ?? 0;
  const totalLinks: number = data?.total_purchase_links ?? 0;
  const summary = `Browse ${totalParts.toLocaleString()} verified RC parts with direct purchase links from Traxxas, ARRMA, Losi, GPM, Vitavon, Proline, and more. Fitment verified against manufacturer specs.`;
  const footer = `${totalParts.toLocaleString()} parts · ${totalLinks.toLocaleString()} purchase links · Fitment verified against manufacturer specifications`;
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">RC Parts Catalog<span className="mt-2 block text-2xl font-normal text-slate-300">OEM Replacements &amp; Aftermarket Upgrades</span></h1>
          <p className="mt-4 text-slate-400 max-w-2xl">{summary}</p>
        </header>
        <div className="grid gap-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Browse by Category</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat: any) => (<a key={cat.slug} href={`/parts/${cat.slug}`} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-amber-600 hover:bg-slate-800"><div className="flex items-start justify-between"><div><div className="text-2xl mb-2">{CATEGORY_ICONS[cat.slug] ?? "🔧"}</div><h3 className="font-semibold text-white">{cat.name}</h3><p className="text-sm text-slate-400 mt-1">{cat.part_count} parts</p></div><div className="text-right text-xs text-slate-500"><div>{cat.oem_count} OEM</div>{cat.aftermarket_count > 0 && <div className="text-amber-500">{cat.aftermarket_count} upgrades</div>}</div></div></a>))}
            </div>
          </section>
          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Browse by Brand</h2>
            <div className="flex flex-wrap gap-3">
              {manufacturers.map((m: any) => (<a key={m.slug} href={`/parts?brand=${m.slug}`} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-600 hover:text-amber-400"><span className="font-medium">{m.name}</span><span className="ml-2 text-slate-500">{m.part_count}</span></a>))}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Find Parts for Your Vehicle</h2>
            <p className="text-slate-400 text-sm mb-4">Navigate to your vehicle page to see all compatible parts with fitment verified against your specific model specs.</p>
            <a href="/rc" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">Browse Vehicles →</a>
          </section>
          <div className="text-sm text-slate-500">{footer}</div>
        </div>
      </div>
    </main>
  );
}
