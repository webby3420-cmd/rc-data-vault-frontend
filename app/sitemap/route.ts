import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE_URL = "https://rcdatavault.com";

export async function GET() {
  const { data, error } = await supabase.rpc("get_sitemap_all_pages");

  const pages = error || !data ? [] : data as { url: string; priority: number; changefreq: string }[];

  const urls = [
    `<url><loc>${BASE_URL}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>`,
    ...pages.map((p) =>
      `<url><loc>${BASE_URL}${p.url}</loc><priority>${p.priority}</priority><changefreq>${p.changefreq}</changefreq></url>`
    ),
  ].join("\n  ");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
