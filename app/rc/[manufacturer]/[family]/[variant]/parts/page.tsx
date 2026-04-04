import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type PageProps = { params: Promise<{ manufacturer: string; family: string; variant: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { variant: variantSlug } = await params;
  const { data } = await supabase.rpc("get_variant_page_payload", { p_variant_slug: variantSlug });
  if (!data) return { title: "Parts | RC Data Vault" };
  return {
    title: `${data.identity.variant_full_name} Parts & Upgrades`,
    description: `OEM replacement parts and aftermarket upgrades for the ${data.identity.variant_full_name}.`,
  };
}

function fmtExact(n: number | null | undefined) { if (n == null) return null; return "$" + Number(n).toFixed(2); }

const RETAILER_LABELS: Record<string, string> = { traxxas_direct: "Traxxas", amain: "AMain Hobbies", amazon: "Amazon", tower: "Tower Hobbies" };

function BuyButton({ link }: { link: any }) {
  const label = RETAILER_LABELS[link.retailer_slug] ?? link.retailer_name;
  const price = fmtExact(link.price_usd);
  return (<a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200"><span>{label}</span>{price && <span className="text-amber-400 font-medium">{price}</span>}</a>);
}

export default async function VariantPartsPage({ params }: PageProps) {
  const { manufacturer, family, variant: variantSlug } = await params;
  const { data: payload } = await supabase.rpc("get_variant_page_payload", { p_variant_slug: variantSlug });
  if (!payload) return null;

  const variantId = payload.identity.variant_id;
  const { data: partsData } = await supabase.rpc("get_parts_for_vehicle", { p_variant_id: variantId });
  const parts: any[] = partsData ?? [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl text-white">{payload.identity.variant_full_name} Parts</h1>
        <div className="mt-6 grid gap-3">
          {parts.map((part: any) => (
            <div key={part.part_id} className="border p-4">
              <div className="text-white">{part.part_name}</div>
              {part.purchase_links?.map((l:any)=> <BuyButton key={l.url} link={l}/>)}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
