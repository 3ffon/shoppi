"use server";
const dictionaries = {
  en: () => import('./translations/en.json').then((module) => module.default),
  he: () => import('./translations/he.json').then((module) => module.default),
}
 
export const getDictionary = async (locale: 'en' | 'he') => {
  console.log('selected locale', locale);
  return dictionaries[locale]()
}