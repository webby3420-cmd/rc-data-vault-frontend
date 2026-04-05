import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const supabase = createSupabaseServerClient()

  try {
    // Search directly on public_payload_variant — one query, no join needed
    // Covers both name search and includes pricing in a single round trip
    const { data: rows, error } = await supabase
      .from('public_payload_variant')
      .select('variant_id, full_display_name, manufacturer_name, model_family_name, variant_name, canonical_path, price_mid')
      .ilike('full_display_name', `%${q}%`)
      .not('canonical_path', 'is', null)
      .order('observation_count', { ascending: false })
      .limit(8)

    if (!error && rows?.length) {
      return NextResponse.json({
        results: rows.map((r: any) => ({
          variant_id: r.variant_id,
          // Use variant_name + model_family_name for clean display, fall back to full_display_name
          full_name: r.variant_name
            ? `${r.manufacturer_name} ${r.model_family_name} ${r.variant_name}`.trim()
            : (r.full_display_name ?? ''),
          manufacturer_name: r.manufacturer_name ?? '',
          canonical_path: r.canonical_path ?? '',
          price_mid: r.price_mid ? parseFloat(r.price_mid) : null,
        })),
      })
    }

    return NextResponse.json({ results: [] })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
