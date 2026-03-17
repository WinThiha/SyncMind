import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the session cookie from the request
  // Sanctum uses 'laravel_session' and 'XSRF-TOKEN'
  // However, middleware can't easily verify the session validity without a backend call.
  // For basic protection, we can check if the cookie exists.
  const hasSession = request.cookies.get('laravel_session');
  
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');

  if (isProtectedPage && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
