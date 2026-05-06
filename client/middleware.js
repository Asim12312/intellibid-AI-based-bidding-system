import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('token');
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  const protectedRoutes = ['/buyer', '/seller', '/admin'];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/buyer/:path*', '/seller/:path*', '/admin/:path*'],
};
