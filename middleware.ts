import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== '/admin/agent-review') {
    return NextResponse.next();
  }

  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.next();
  }

  if (token !== process.env.ADMIN_REVIEW_TOKEN) {
    return NextResponse.next();
  }

  const cleanUrl = req.nextUrl.clone();
  cleanUrl.searchParams.delete('token');

  const res = NextResponse.redirect(cleanUrl);

  res.cookies.set('rcdv_admin_review', token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
  });

  return res;
}

export const config = {
  matcher: '/admin/agent-review',
};
