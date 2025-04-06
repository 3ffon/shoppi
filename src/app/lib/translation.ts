export const getDictionary = async (locale: 'en' | 'he') => {
  switch (locale) {
    case 'he':
      return (await import('./translations/he.json')).default;
    case 'en':
    default:
      return (await import('./translations/en.json')).default;
  }
};