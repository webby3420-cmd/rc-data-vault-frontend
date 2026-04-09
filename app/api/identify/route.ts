import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { embedding } = body;

    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json(
        { error: "Missing or invalid embedding array" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await (supabase.rpc as any)(
      "identify_rc_vehicle",
      { p_embedding: embedding }
    );

    if (error) {
      console.error("[identify] RPC error:", JSON.stringify(error));
      return NextResponse.json(
        { error: "Identification failed" },
        { status: 500 }
      );
    }

    const matches = Array.isArray(data) ? data.slice(0, 5) : [];

    return NextResponse.json({
      success: true,
      matches: matches.map((m: any) => ({
        variant_id: m.variant_id,
        variant_slug: m.variant_slug,
        variant_name: m.variant_name,
        manufacturer_name: m.manufacturer_name,
        canonical_url: m.canonical_url,
        image_url: m.image_url ?? m.primary_image_url ?? null,
        confidence: m.confidence ?? m.similarity ?? null,
        fair_value: m.fair_value ?? null,
      })),
    });
  } catch (err) {
    console.error("[identify] Error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
