import { getServerSupabase } from "../../../../lib/supabase-server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return Response.json({ error: "Missing path" }, { status: 400 });
  }

  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .schema("routing")
    .from("v_published_routes")
    .select("*")
    .eq("public_path", path)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data || null);
}
