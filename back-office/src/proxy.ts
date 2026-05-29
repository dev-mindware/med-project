import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_TOKEN_KEY } from './constants'

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_KEY)?.value

  // Check if it's an auth route
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (!token && !isAuthRoute) {
    // Redirect to login if trying to access protected route without token
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (token && isAuthRoute) {
    // Redirect to dashboard if trying to access auth routes while logged in
    // Exception for logout which is usually an action, but just in case
    if (!request.nextUrl.pathname.includes('/logout')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
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
