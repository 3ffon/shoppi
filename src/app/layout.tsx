import React from "react";
import { cookies } from 'next/headers';
import MuiThemeProvider from "./MuiThemeProvider";
import { getDictionary } from "@/app/lib/translation";
import { LanguageProvider } from "@/app/providers/LanguageProvider";
import { DBProvider } from "@/app/providers/DBProvider";
import { NotificationProvider } from "@/app/providers/NotificationProvider";
import style from "./layout.module.css";
import Menu from "./components/Menu/Menu";
import ThemeColorManager from "./components/ThemeColorManager";

export function generateViewport({ }) {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: false,
  }
}

export function generateMetadata() {
  return {
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Shoppi", 
    },
    icons: {
      icon: "/icons/icon-192x192.png",
      apple: "/icons/icon-192x192.png",
    },
    
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  // Get the locale from cookies
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'he') as 'en' | 'he';
  const rtl = locale === "he";
  const dictionary = await getDictionary(locale);
  
  // Default theme color for server-side rendering
  const defaultThemeColor = '#378FE7';

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"} className={style.global}>
      <head>
        <link rel="manifest" href={locale === 'he' ? '/manifest_he.json' : '/manifest.json'} />
        <title>{locale === 'he' ? 'קניות-לי' : 'Shoppi'}</title>
        <meta name="msapplication-TileColor" content={defaultThemeColor} />
        <meta name="theme-color" content={defaultThemeColor} />
        <meta property="og:image" content={locale === 'he' ? '/icons/shoppi_he.png' : '/icons/shoppi.png'} />
        <meta property="og:title" content={locale === 'he' ? 'קניות-לי' : 'Shoppi'} />
        <meta property="og:description" content={locale === 'he' ? 'הקניות של עמית וענבר' : 'The power couple\'s shopping list'} />
        <meta property="og:url" content="https://shoppi.3fon.io" />
      </head>
      <MuiThemeProvider rtl={rtl}>
        <body className={style.global}>
          <ThemeColorManager />
          <LanguageProvider initialLocale={locale} initialDictionary={dictionary}>
            <NotificationProvider>
              <DBProvider>
                  <Menu>
                    {children}
                  </Menu>
              </DBProvider>
            </NotificationProvider>
          </LanguageProvider>
        </body>
      </MuiThemeProvider>
    </html>
  );
}
