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
    const { data, error } = await supabase.rpc('search_rc', {
      search_text: q,
    })

    if (error || !data?.length) {
      return NextResponse.json({ results: [] })
    }

    const results = data
      .filter((r: any) => r.canonical_path)
      .slice(0, 8)
      .map((r: any) => ({
        variant_id: r.variant_id,
        full_name: r.full_name ?? r.display_name ?? '',
        manufacturer_name: r.manufacturer_name ?? r.brand ?? '',
        canonical_path: r.canonical_path,
        price_mid: r.price_mid ? parseFloat(r.price_mid) : null,
      }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
