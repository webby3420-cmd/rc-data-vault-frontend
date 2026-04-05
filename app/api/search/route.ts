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
    const { data: rpcData, error: rpcError } = await supabase.rpc('search_rc', {
      p_query: q,
      p_limit: 8,
    })

    if (!rpcError && rpcData?.length) {
      const variantIds = rpcData.map((r: any) => r.variant_id).filter(Boolean)

      const { data: payloadRows } = await supabase
        .from('public_payload_variant')
        .select('variant_id, full_name, manufacturer_name, canonical_path, price_mid')
        .in('variant_id', variantIds)

      const payloadMap = new Map(
        (payloadRows ?? []).map((row: any) => [row.variant_id, row])
      )

      const results = rpcData
        .map((r: any) => {
          const row = payloadMap.get(r.variant_id)
          return {
            variant_id: r.variant_id,
            full_name: row?.full_name ?? r.full_name ?? r.name ?? '',
            manufacturer_name: row?.manufacturer_name ?? r.manufacturer_name ?? '',
            canonical_path: row?.canonical_path ?? '',
            price_mid: row?.price_mid ? parseFloat(row.price_mid) : null,
          }
        })
        .filter((r: any) => r.canonical_path)

      return NextResponse.json({ results })
    }

    // Fallback: direct ilike if RPC returns nothing
    const { data: fallbackRows } = await supabase
      .from('public_payload_variant')
      .select('variant_id, full_name, manufacturer_name, canonical_path, price_mid')
      .ilike('full_name', `%${q}%`)
      .limit(8)

    return NextResponse.json({
      results: (fallbackRows ?? []).map((r: any) => ({
        ...r,
        price_mid: r.price_mid ? parseFloat(r.price_mid) : null,
      })),
    })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
