import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if this is a protected route
  const protectedPaths = ['/dashboard']
  const pathname = request.nextUrl.pathname
  
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // For client-side routes, let the component handle auth
    // API routes will handle their own authentication
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}