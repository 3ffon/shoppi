import React from "react";
import { cookies } from 'next/headers';
import MuiThemeProvider from "./MuiThemeProvider";
import { getDictionary } from "@/app/lib/translation";
import { LanguageProvider } from "@/app/providers/LanguageProvider";
import { DBProvider } from "@/app/providers/DBProvider";
import { NotificationProvider } from "@/app/providers/NotificationProvider";
import style from "./layout.module.css";
import Menu from "./components/Menu/Menu";

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
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Shoppi", 
    },
    icons: {
      icon: "/icons/icon-192x192.png",
      apple: "/icons/icon-192x192.png",
    }
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

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"} className={style.global}>
      <MuiThemeProvider rtl={rtl}>
        <body className={style.global}>
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
