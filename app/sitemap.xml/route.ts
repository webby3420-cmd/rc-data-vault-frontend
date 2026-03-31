import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

const BASE_URL = "https://rcdatavault.com";

type SitemapRow = {
  manufacturer_slug: string;
  model_family_slug: string;
  variant_slug: string;
  last_modified: string | null;
};

export async function GET() {
  const staticUrls = [
    `<url><loc>${BASE_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${BASE_URL}/rc</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
  ];

  try {
    const { data, error } = await supabase.rpc("get_sitemap_variant_pages");

    if (error || !data || data.length === 0) {
      console.error("[sitemap] RPC issue:", error ?? "no data");
      return buildXmlResponse(staticUrls);
    }

    const variantUrls = (data as SitemapRow[]).map(
      (row) =>
        `<url>` +
        `<loc>${BASE_URL}/rc/${row.manufacturer_slug}/${row.model_family_slug}/${row.variant_slug}</loc>` +
        `<lastmod>${row.last_modified ?? new Date().toISOString().split("T")[0]}</lastmod>` +
        `<changefreq>weekly</changefreq>` +
        `<priority>0.8</priority>` +
        `</url>`
    );

    return buildXmlResponse([...staticUrls, ...variantUrls]);
  } catch (err) {
    console.error("[sitemap] generation failed:", err);
    return buildXmlResponse(staticUrls);
  }
}

function buildXmlResponse(urls: string[]) {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join("\n") +
    `\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

export const dynamic = "force-dynamic";
