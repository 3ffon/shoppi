"use client"
import React from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';


const themeRTL = createTheme({
  direction: 'rtl',
  colorSchemes: {
    dark: true,
  }
});

const theme = createTheme({
  colorSchemes: {
    dark: true,
  }
});

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
  key: 'mui',
});

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: Promise<{ lang: string }>
}) {
  const { lang } = React.use(params);
  const rtl = lang == "he";

  return (
    <html lang={lang} dir={rtl ? "rtl" : "ltr"}>
      <CacheProvider value={rtl ? rtlCache : ltrCache}>
        <ThemeProvider theme={rtl ? themeRTL : theme}>
          <body>
            <CssBaseline />
            {children}
          </body>
        </ThemeProvider>
      </CacheProvider>
    </html>
  );
}
