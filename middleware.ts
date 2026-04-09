import type { NextRequest } from 'next/server'
import { kunAuthMiddleware } from '~/middleware/auth'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)']
}

export const middleware = async (request: NextRequest) => {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  return kunAuthMiddleware(request, requestHeaders)
}
