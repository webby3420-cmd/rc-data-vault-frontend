import { getServerSupabase } from "../../../../../lib/supabase-server";

export async function GET() {
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .schema("delivery")
    .from("v_pending_cache_invalidations")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as Array<{
    entity_type: string;
    entity_id: string;
    created_at?: string | null;
  }>;

  if (rows.length === 0) return Response.json([]);

  const { data: routes, error: routeError } = await supabase
    .schema("routing")
    .from("v_published_routes")
    .select("entity_type,entity_id,public_path");

  if (routeError) {
    return Response.json({ error: routeError.message }, { status: 500 });
  }

  const routeMap = new Map<string, string>();
  for (const route of routes || []) {
    routeMap.set(`${route.entity_type}:${route.entity_id}`, route.public_path);
  }

  const enriched = rows.map((row) => ({
    ...row,
    public_path: routeMap.get(`${row.entity_type}:${row.entity_id}`) || null,
  }));

  return Response.json(enriched);
}
