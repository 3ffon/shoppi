import React from "react";
import MuiThemeProvider from "./MuiThemeProvider";
import { getDictionary } from "./translation";
import { DictionaryProvider } from "./DictionaryProvider";
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
    <html lang={lang} dir={rtl ? "rtl" : "ltr"}>
      <MuiThemeProvider rtl={rtl}>
        <body className={style.body}>
          <DictionaryProvider dictionary={dict} locale={lang}>
            <Menu>
              {children}
            </Menu>
          </DictionaryProvider>
        </body>
      </MuiThemeProvider>
    </html>
  );
}
