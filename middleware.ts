import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token and user from cookies or headers (if stored in localStorage, we can't access it in middleware)
  // For now, we'll handle auth redirects client-side
  // This middleware can be extended to use httpOnly cookies for better security

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/services'];
  const isPublicPath = publicPaths.some(path =>
    pathname === path || (path === '/services' && pathname.startsWith('/services/'))
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For protected routes, we'll handle auth checks client-side in layouts
  // because Next.js middleware can't access localStorage
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
