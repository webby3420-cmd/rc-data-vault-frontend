import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { searchParams } = new URL(req.url);
  const variantId = searchParams.get("variant_id");
  const familyId = searchParams.get("family_id");
  const manufacturerId = searchParams.get("manufacturer_id");

  let data, error;

  if (variantId) {
    ({ data, error } = await supabase.rpc("get_variant_resources", { p_variant_id: variantId }));
  } else if (familyId) {
    ({ data, error } = await supabase.rpc("get_family_resources", { p_family_id: familyId }));
  } else if (manufacturerId) {
    ({ data, error } = await supabase.rpc("get_manufacturer_resources", { p_manufacturer_id: manufacturerId }));
  } else {
    return new Response(JSON.stringify({ error: "Provide variant_id, family_id, or manufacturer_id" }), { status: 400 });
  }

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ resources: data ?? [] }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
  });
}
