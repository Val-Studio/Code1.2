import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Public routes
  const isPublicRoute = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/about',
    '/pricing',
    '/help',
    '/privacy',
    '/terms',
  ].includes(nextUrl.pathname);

  // Public psychologist pages
  const isPsychologistPublicPage = nextUrl.pathname.startsWith('/psychologists');

  // API routes that don't need auth
  const isPublicApi =
    nextUrl.pathname.startsWith('/api/auth') ||
    nextUrl.pathname.startsWith('/api/psychologists') && req.method === 'GET';

  // Static files
  const isStaticFile =
    nextUrl.pathname.startsWith('/_next') ||
    nextUrl.pathname.startsWith('/favicon') ||
    nextUrl.pathname.includes('.');

  if (isStaticFile || isPublicApi) {
    return NextResponse.next();
  }

  if (isPublicRoute || isPsychologistPublicPage) {
    return NextResponse.next();
  }

  // Protected routes
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access
  const isPsychologistRoute = nextUrl.pathname.startsWith('/dashboard/psychologist');
  const isClientRoute = nextUrl.pathname.startsWith('/dashboard/client');
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');

  if (isPsychologistRoute && role !== 'PSYCHOLOGIST' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  if (isClientRoute && role !== 'CLIENT' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  if (isAdminRoute && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
