import { NextRequest, NextResponse } from "next/server";
 
const locales = ['en','he'];
 
export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
 
  if (pathnameHasLocale) return
 
  // Redirect if there is no locale
  const defaultLocale = 'he';
  const savedLocale = request.cookies.get("NEXT_LOCALE")?.value || defaultLocale;
  request.nextUrl.pathname = `/${savedLocale}${pathname}`
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return NextResponse.redirect(request.nextUrl)
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
}