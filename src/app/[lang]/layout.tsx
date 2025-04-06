import React from "react";
import MuiThemeProvider from "./MuiThemeProvider";
import { getDictionary } from "@/app/lib/translation";
import { DictionaryProvider } from "@/app/providers/DictionaryProvider";
import { DBProvider } from "@/app/providers/DBProvider";
import { NotificationProvider } from "@/app/providers/NotificationProvider";
import style from "./layout.module.css";
import Menu from "../components/Menu/Menu";
export function generateViewport({ }) {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: false,
  }
}



export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: Promise<{ lang: 'en' | 'he' }>
}) {
  const lang = (await params).lang;
  const rtl = lang == "he";
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} dir={rtl ? "rtl" : "ltr"} className={style.global}>
      <MuiThemeProvider rtl={rtl}>
        <body className={style.global}>
          <DictionaryProvider dictionary={dict} locale={lang}>
            <NotificationProvider>
              <DBProvider>
                <Menu>
                  {children}
                </Menu>
              </DBProvider>
            </NotificationProvider>
          </DictionaryProvider>
        </body>
      </MuiThemeProvider>
    </html>
  );
}
