import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

const BASE_URL = "https://rcdatavault.com";

export async function GET() {
  try {
    const { data, error } = await supabase.rpc("get_sitemap_variant_pages");

    if (error) {
      console.error("[sitemap] RPC error:", error);
      return NextResponse.json({ error: "sitemap failed" }, { status: 500 });
    }

    const urls = (data || []).map((row: any) => `
      <url>
        <loc>${BASE_URL}/rc/${row.manufacturer_slug}/${row.model_family_slug}/${row.variant_slug}</loc>
        <lastmod>${row.last_modified || new Date().toISOString()}</lastmod>
      </url>
    `).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${BASE_URL}</loc>
        </url>
        <url>
          <loc>${BASE_URL}/rc</loc>
        </url>
        ${urls}
      </urlset>
    `;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (err) {
    console.error("[sitemap] fatal error:", err);
    return NextResponse.json({ error: "sitemap failed" }, { status: 500 });
  }
}
