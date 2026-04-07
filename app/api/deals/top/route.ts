import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { searchParams } = new URL(req.url);
  const brand = searchParams.get("brand");
  const minScore = parseInt(searchParams.get("min_score") ?? "55");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 50);

  let query = supabase
    .from("top_deals_live")
    .select("*")
    .gte("deal_score", minScore)
    .order("deal_score", { ascending: false })
    .limit(limit);

  if (brand) {
    query = query.ilike("manufacturer_name", brand);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, count: data?.length ?? 0, deals: data ?? [] }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  });
}
