export const LANG_ENGLISH = 'en';
export const LANG_ITALIAN = 'it';

export type Language = typeof LANG_ITALIAN | typeof LANG_ENGLISH;
const DEFAULT_LANGUAGE = LANG_ENGLISH;

export const getPureNavigatorLanguage = (): Language => {
  let lang = navigator.language;
  // Complete lang
  if (languageSupported(lang)) {
    return lang as Language;
  }
  // Reduced lang
  lang = lang.split(/[-_]/)[0] || DEFAULT_LANGUAGE;
  if (!languageSupported(lang)) {
    return DEFAULT_LANGUAGE;
  }
  return lang as Language;
};

const getForcedLanguage = (): Language | undefined => {
  const pathname = window.location.pathname;
  const locations = pathname.split('/');
  locations.splice(0, 1);

  if (locations.length < 1) {
    return undefined;
  }

  const lang = locations[0];

  if (languageSupported(lang)) {
    return lang as Language;
  }

  return undefined;
};

export const getNavigatorLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const forcedLanguage = getForcedLanguage();

  if (forcedLanguage) {
    return forcedLanguage;
  }

  return getPureNavigatorLanguage();
};

const languageSupported = (lang: string): boolean =>
  [LANG_ITALIAN, LANG_ENGLISH].includes(lang);
