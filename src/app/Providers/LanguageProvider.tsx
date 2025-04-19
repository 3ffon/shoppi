'use client';

import React, { createContext, useContext, useState } from 'react';
import { getDictionary } from '@/app/lib/translation';
import { setCookie } from 'cookies-next';

type Locale = 'en' | 'he';

type LanguageContextType = {
  locale: Locale;
  dictionary: Record<string, string>;
  setLocale: (locale: Locale) => Promise<void>;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'he',
  dictionary: {},
  setLocale: async () => {},
  isRTL: true,
});

export const LanguageProvider = ({
  children,
  initialLocale = 'he',
  initialDictionary,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialDictionary: Record<string, string>;
}) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [dictionary, setDictionary] = useState<Record<string, string>>(initialDictionary);
  const isRTL = locale === 'he';

  const setLocale = async (newLocale: Locale) => {
    const newDictionary = await getDictionary(newLocale);
    setDictionary(newDictionary);
    setLocaleState(newLocale);
    
    // Save to cookie for persistence
    setCookie('NEXT_LOCALE', newLocale, { maxAge: 60 * 60 * 24 * 365 }); // 1 year
    
    // Update HTML attributes
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <LanguageContext.Provider value={{ locale, dictionary, setLocale, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
