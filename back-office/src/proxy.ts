import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_TOKEN_KEY } from './constants'

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_KEY)?.value

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (isAuthRoute) {
    return NextResponse.next()
  }

  if (!token && !isAuthRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
