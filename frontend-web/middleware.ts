import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes yang tidak perlu authentication
const publicRoutes = ['/login', '/register', '/not-found'];

// Protected routes yang memerlukan authentication
const protectedPaths = [
  '/dashboard', 
  '/books', 
  '/users', 
  '/members', 
  '/borrowings',
  '/returns',
  '/loans', 
  '/fines', 
  '/reports', 
  '/settings', 
  '/profile',
  '/authors',
  '/categories',
  '/publishers',
  '/activity-logs',
  '/borrow-book'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get cookies
  const authTokenCookie = request.cookies.get('AuthToken');
  const userRoleCookie = request.cookies.get('UserRole');
  
  const isAuthenticated = !!authTokenCookie;
  const userRole = userRoleCookie?.value || 'member';
  
  console.log('[Middleware]', {
    pathname,
    isAuthenticated,
    userRole,
    hasAuthToken: !!authTokenCookie,
    hasRoleCookie: !!userRoleCookie,
  });

  // Redirect authenticated users from login/register to dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect root to login or dashboard based on authentication
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if accessing protected routes
  const isProtectedRoute = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtectedRoute) {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If authenticated, rewrite to role-specific folder
    // Rewrite /dashboard to /{role}/dashboard internally
    const rewritePath = `/${userRole}${pathname}`;
    console.log('[Middleware] Rewriting:', pathname, '->', rewritePath);
    return NextResponse.rewrite(new URL(rewritePath, request.url));
  }

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
     * - super-admin, admin, librarian, member (internal role folders)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|super-admin|admin|librarian|member).*)',
  ],
};
