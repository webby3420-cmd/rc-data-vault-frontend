import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import RCSearch from "@/components/RCSearch";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const metadata: Metadata = {
  title: "RC Vehicle Values & Price Guide | RC Data Vault",
  description: "Search used RC vehicle values and price guides. Based on real sold listings for Traxxas, ARRMA, Losi, and more.",
};

type Manufacturer = {
  manufacturer_name: string;
  manufacturer_slug: string;
  family_count: number;
  variant_count: number;
};

export default async function RCBrowsePage() {
  const { data } = await supabase.rpc("list_manufacturers");
  const manufacturers: Manufacturer[] = data ?? [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-semibold text-white">RC Vehicle Values</h1>
        <p className="mb-8 text-slate-400">Search or browse used RC vehicle price guides. Based on real sold listings.</p>

        <RCSearch />

        <h2 className="mb-4 text-xl font-medium text-slate-200">Browse by Manufacturer</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {manufacturers.map((m) => (
            <a key={m.manufacturer_slug} href={`/rc/${m.manufacturer_slug}`} className="rounded-xl border border-slate-700 bg-slate-900 p-5 transition-colors hover:border-slate-500">
              <div className="text-lg font-medium text-white">{m.manufacturer_name}</div>
              <div className="mt-1 text-sm text-slate-400">{m.family_count} {m.family_count === 1 ? "model family" : "model families"} &middot; {m.variant_count} variants</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
