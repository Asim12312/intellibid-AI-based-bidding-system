import { NextResponse } from 'next/server';

// Temporary mock middleware for routing based on roles
// In a real app, this would verify JWT tokens and roles via an auth utility
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Example logic:
  // If user tries to access /dashboard but has seller role -> redirect to seller dashboard
  // For now, let's just pass through everything so we can develop the UI freely
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
