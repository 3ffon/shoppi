"use client"
import React from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import CssBaseline from "@mui/material/CssBaseline";


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

export default function MuiThemeProvider({
    children,
    rtl
}: {
    children: React.ReactNode,
    rtl: boolean
}) {
    return (
        <CacheProvider value={rtl ? rtlCache : ltrCache}>
            <ThemeProvider theme={rtl ? themeRTL : theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </CacheProvider>
    );
}
