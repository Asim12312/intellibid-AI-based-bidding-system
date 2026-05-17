import { NextResponse } from 'next/server';

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const BUYER_ROUTES = ['/dashboard', '/discover', '/auctions', '/ai-picks', '/alerts', '/chatbot', '/profile'];

export function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isBuyerRoute = BUYER_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isSellerRoute = pathname.startsWith('/seller');
  const isAdminRoute = pathname.startsWith('/admin');
  const isProtected = isBuyerRoute || isSellerRoute || isAdminRoute;

  if (!isProtected) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = parseJwtPayload(token)?.role;

  if (isAdminRoute) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (isSellerRoute && role !== 'seller' && role !== 'hybrid' && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isBuyerRoute && role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/discover',
    '/discover/:path*',
    '/auctions',
    '/auctions/:path*',
    '/ai-picks',
    '/ai-picks/:path*',
    '/alerts',
    '/alerts/:path*',
    '/chatbot',
    '/chatbot/:path*',
    '/profile',
    '/profile/:path*',
    '/seller',
    '/seller/:path*',
    '/admin',
    '/admin/:path*',
  ],
};
