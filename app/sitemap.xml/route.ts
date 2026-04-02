function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rcdatavault.com";

  const res = await fetch(`${baseUrl}/api/routes/sitemap`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return new Response("Failed to generate sitemap", { status: 500 });
  }

  const rows = await res.json();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows
  .filter((row: any) => row.include_in_sitemap)
  .map((row: any) => {
    const loc = `${baseUrl}${row.public_path}`;
    const lastmod = row.last_modified
      ? `<lastmod>${escapeXml(row.last_modified)}</lastmod>`
      : "";
    return `<url><loc>${escapeXml(loc)}</loc>${lastmod}</url>`;
  })
  .join("")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
