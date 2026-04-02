import { getServerSupabase } from "../../../../../lib/supabase-server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.entity_type || !body?.entity_id) {
    return Response.json(
      { error: "Missing entity_type or entity_id" },
      { status: 400 }
    );
  }

  const supabase = getServerSupabase();

  const { error } = await supabase.rpc("mark_cache_processed", {
    p_entity_type: body.entity_type,
    p_entity_id: body.entity_id,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
