import * as React from 'react'
import { TextField } from "@mui/material"
import { getDictionary } from './translation'

import style from "./page.module.css";
import LocaleSwitcher from './setLocale';
import Items from '../components/ProductList/items';


export function generateViewport({ }) {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: 'no',
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: 'en' | 'he' }>
}
) {
  const lang = (await (params)).lang
  const dict = await getDictionary(lang);
  
  return (
    <div className={style.page}>
      <Items dict={dict}/>
      <LocaleSwitcher />
    </div>
  );
}
