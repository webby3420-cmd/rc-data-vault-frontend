import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STATIC_PREFIXES = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const res = await fetch(
      `${baseUrl}/api/routes/redirect?path=${encodeURIComponent(pathname)}`,
      { cache: "no-store" }
    );

    if (!res.ok) return NextResponse.next();

    const redirect = await res.json();

    if (redirect?.target_path && redirect?.status_code) {
      return NextResponse.redirect(
        new URL(redirect.target_path, req.url),
        redirect.status_code
      );
    }
  } catch {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
