import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  const allowed = ['images.amainhobbies.com', 'traxxas.com', 'horizonhobby.com', 'arrma-rc.com']
  if (!allowed.some(d => hostname.endsWith(d))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const res = await fetch(url, {
    headers: {
      'Referer': 'https://www.amainhobbies.com/',
      'User-Agent': 'Mozilla/5.0',
    },
  })

  if (!res.ok) return new NextResponse('Not found', { status: 404 })

  const blob = await res.blob()
  return new NextResponse(blob, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
