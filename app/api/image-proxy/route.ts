import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  let hostname: string
  try { hostname = new URL(url).hostname } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  const allowed = ['images.amainhobbies.com', 'traxxas.com', 'horizonhobby.com']
  if (!allowed.some(d => hostname.endsWith(d))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Referer': 'https://www.amainhobbies.com/',
        'Origin': 'https://www.amainhobbies.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    })

    console.log(`[image-proxy] ${url} → ${res.status}`)

    if (!res.ok) {
      return new NextResponse(`Upstream ${res.status}`, { status: 502 })
    }

    const blob = await res.blob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error(`[image-proxy] fetch error:`, err)
    return new NextResponse('Fetch failed', { status: 502 })
  }
}
