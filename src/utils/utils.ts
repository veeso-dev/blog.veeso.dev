export const readingTime = (text: string): number => {
  const wpm = 225;
  const words = text.trim().split(/\s+/).length;

  return Math.ceil(words / wpm);
};

export enum Theme {
  DARK,
  LIGHT,
}

const THEME_DARK = 'theme-dark';
const THEME_LIGHT = 'theme-light';

export const isThemeDark = (): boolean => getTheme() === Theme.DARK;
export const isThemeLight = (): boolean => getTheme() === Theme.LIGHT;
export const isThemeDefined = (): boolean =>
  localStorage.getItem('theme') !== null;

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return Theme.LIGHT;
  }

  const theme = localStorage.getItem('theme');

  if (!theme) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? Theme.DARK
      : Theme.LIGHT;
  }

  return theme === THEME_DARK ? Theme.DARK : Theme.LIGHT;
};

export const setTheme = (theme: Theme) => {
  const themeName = theme === Theme.DARK ? THEME_DARK : THEME_LIGHT;

  // save to storage (client)
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', themeName);
  }

  if (themeName === THEME_DARK) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
