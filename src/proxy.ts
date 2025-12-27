import { NextRequest, NextResponse } from "next/server";
 
// PWA and static assets
const publicAssets = [
  '/manifest.json',
  '/sw.js',
  '/workbox-',
  '/icons/',
  '/favicon.ico'
];
 
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip for PWA and static assets
  if (publicAssets.some(asset => pathname.startsWith(asset))) {
    return;
  }
  
  // Check if locale cookie exists
  const hasLocaleCookie = request.cookies.has("NEXT_LOCALE");
  
  // If no locale cookie, set the default locale
  if (!hasLocaleCookie) {
    const response = NextResponse.next();
    const defaultLocale = 'he';
    
    // Try to detect preferred language from Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language');
    let detectedLocale = defaultLocale;
    
    if (acceptLanguage) {
      // Simple language detection from header
      if (acceptLanguage.includes('en') && !acceptLanguage.includes('he')) {
        detectedLocale = 'en';
      } else if (acceptLanguage.includes('he')) {
        detectedLocale = 'he';
      }
    }
    
    // Set the locale cookie
    response.cookies.set("NEXT_LOCALE", detectedLocale, { 
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/'
    });
    
    return response;
  }
  
  return NextResponse.next();
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next).*)',
  ],
}