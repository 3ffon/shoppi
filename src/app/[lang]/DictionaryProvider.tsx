'use client';

import React, { createContext, useContext } from 'react';

const DictionaryContext = createContext<{
  dictionary: Record<string, string>;
  locale: string;
}>({ dictionary: {}, locale: 'he' });

export const DictionaryProvider = ({
  children,
  dictionary,
  locale,
}: {
  children: React.ReactNode;
  dictionary: Record<string, string>;
  locale: string;
}) => {
  return (
    <DictionaryContext.Provider value={{ dictionary, locale }}>
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => useContext(DictionaryContext);