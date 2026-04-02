import { getServerSupabase } from "../../../../../lib/supabase-server";

const TABLE_MAP: Record<string, { schema: string; table: string; idColumn: string }> = {
  variant: {
    schema: "public",
    table: "mv_public_payload_variant_json",
    idColumn: "variant_id",
  },
  model_family: {
    schema: "public",
    table: "mv_public_payload_model_family_json",
    idColumn: "model_family_id",
  },
  manufacturer: {
    schema: "public",
    table: "mv_public_payload_manufacturer_json",
    idColumn: "manufacturer_id",
  },
};

function extractPayloadRow(row: Record<string, unknown>): unknown {
  if ("payload_json" in row) return row.payload_json;
  if ("payload" in row) return row.payload;
  return row;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ entityType: string; entityId: string }> }
) {
  const { entityType, entityId } = await ctx.params;
  const map = TABLE_MAP[entityType];

  if (!map) {
    return Response.json({ error: "Unsupported entity type" }, { status: 400 });
  }

  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .schema(map.schema)
    .from(map.table)
    .select("*")
    .eq(map.idColumn, entityId)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return Response.json(null, { status: 200 });
  }

  return Response.json(extractPayloadRow(data as Record<string, unknown>));
}
