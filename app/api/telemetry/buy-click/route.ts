import { NextRequest, NextResponse } from 'next/server'

const EDGE_FN_URL =
  'https://frphiluaykgrmvyvdzsp.supabase.co/functions/v1/buy-click-telemetry'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    // Forward to Edge Function server-side (no CORS)
    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    })

    return NextResponse.json({ ok: res.ok }, { status: 200 })
  } catch {
    // Never fail the client
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
