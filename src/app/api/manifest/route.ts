import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get the locale from cookies
  const cookieStore = await cookies(request);
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'he') as 'en' | 'he';
  
  // Define app names for each language
  const appNames: Record<string, string> = {
    en: "Shoppi",
    he: "קניות-לי"
  };
  
  // Create the manifest with the appropriate name based on locale
  const manifest = {
    name: appNames[locale],
    short_name: appNames[locale],
    description: locale === 'he' ? "אפליקציית הקניות שלך" : "Your shopping companion app",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#317EFB",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };

  // Return the manifest as JSON with appropriate content type
  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-store'
    }
  });
}
