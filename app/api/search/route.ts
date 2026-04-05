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
    // Primary: use search_rc RPC for fuzzy/alias matching
    const { data: rpcData, error: rpcError } = await supabase.rpc('search_rc', {
      search_text: q,
    })

    if (!rpcError && rpcData?.length) {
      const variantIds = rpcData.map((r: any) => r.variant_id).filter(Boolean)

      const { data: payloadRows } = await supabase
        .from('public_payload_variant')
        .select('variant_id, full_display_name, manufacturer_name, canonical_path, price_mid')
        .in('variant_id', variantIds)

      if (payloadRows?.length) {
        const payloadMap = new Map(
          payloadRows.map((row: any) => [row.variant_id, row])
        )

        const results = rpcData
          .map((r: any) => {
            const row = payloadMap.get(r.variant_id)
            return {
              variant_id: r.variant_id,
              full_name: row?.full_display_name ?? r.display_name ?? '',
              manufacturer_name: row?.manufacturer_name ?? r.brand ?? '',
              canonical_path: row?.canonical_path ?? '',
              price_mid: row?.price_mid ? parseFloat(row.price_mid) : null,
            }
          })
          .filter((r: any) => r.canonical_path)
          .slice(0, 8)

        if (results.length) return NextResponse.json({ results })
      }
    }

    // Fallback: direct search on public_payload_variant
    const { data: fallbackRows } = await supabase
      .from('public_payload_variant')
      .select('variant_id, full_display_name, manufacturer_name, canonical_path, price_mid')
      .ilike('full_display_name', `%${q}%`)
      .limit(8)

    return NextResponse.json({
      results: (fallbackRows ?? []).map((r: any) => ({
        variant_id: r.variant_id,
        full_name: r.full_display_name ?? '',
        manufacturer_name: r.manufacturer_name ?? '',
        canonical_path: r.canonical_path ?? '',
        price_mid: r.price_mid ? parseFloat(r.price_mid) : null,
      })),
    })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
