import { flatten } from 'flat';

import ItTranslations from '../locales/it.json';
import EnTranslations from '../locales/en.json';
import Cookies from 'js-cookie';

export const LANG_ENGLISH = 'en';
export const LANG_ITALIAN = 'it';

export const AVAILABLE_LANGUAGES = [LANG_ITALIAN, LANG_ENGLISH];

export type Language = typeof LANG_ITALIAN | typeof LANG_ENGLISH;
export const DEFAULT_LANGUAGE = LANG_ENGLISH;
const COOKIE_LANGUAGE = 'lang';

export interface Translations {
  it: Record<string, string>;
  en: Record<string, string>;
  [key: string]: Record<string, string>;
}

const TRANSLATIONS: Translations = {
  it: flatten(ItTranslations),
  en: flatten(EnTranslations),
};

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

const getCookieLanguage = (): Language | undefined =>
  Cookies.get(COOKIE_LANGUAGE) as Language;

export const setCookieLanguage = (lang: Language): void => {
  Cookies.set(COOKIE_LANGUAGE, lang, { expires: 365 });
};

export const getNavigatorLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const forcedLanguage = getForcedLanguage();
  if (forcedLanguage) {
    return forcedLanguage;
  }

  const cookieLanguage = getCookieLanguage();
  if (cookieLanguage) {
    return cookieLanguage;
  }

  return getPureNavigatorLanguage();
};

const languageSupported = (lang: string): boolean =>
  [LANG_ITALIAN, LANG_ENGLISH].includes(lang);

export default TRANSLATIONS;
