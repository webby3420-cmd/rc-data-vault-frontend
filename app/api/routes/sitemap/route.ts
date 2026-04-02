import { getServerSupabase } from "../../../../lib/supabase-server";

export async function GET() {
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .schema("routing")
    .from("v_sitemap_manifest")
    .select("*")
    .order("public_path", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data || []);
}
