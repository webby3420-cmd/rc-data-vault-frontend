export const dynamic = 'force-dynamic';

import { createSupabaseServerClient } from '@/lib/supabase/server'

export const revalidate = 3600

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: pages } = await supabase.rpc('get_sitemap_all_pages')

  const priorityMap: Record<string, string> = {
    hub: '1.0', parts_hub: '0.9', manufacturer: '0.8',
    family: '0.7', variant: '0.9', parts_category: '0.6',
    comparison: '0.6', best_of: '0.7',
  }
  const changefreqMap: Record<string, string> = {
    hub: 'daily', parts_hub: 'weekly', manufacturer: 'weekly',
    family: 'weekly', variant: 'daily', parts_category: 'weekly',
    comparison: 'weekly', best_of: 'weekly',
  }

  const base = 'https://rcdatavault.com'

  let urls = `
  <url><loc>${base}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/rc</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/market</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`

  if (pages) {
    for (const p of pages as any[]) {
      const path = p.url ?? p.canonical_path
      if (!path) continue
      const lastmod = p.last_updated
        ? `\n    <lastmod>${new Date(p.last_updated).toISOString().split('T')[0]}</lastmod>`
        : ''
      urls += `
  <url>
    <loc>${base}${path}</loc>${lastmod}
    <changefreq>${changefreqMap[p.page_type] ?? 'weekly'}</changefreq>
    <priority>${priorityMap[p.page_type] ?? '0.5'}</priority>
  </url>`
    }
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`,
    { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } }
  )
}
