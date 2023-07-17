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

export const getTheme = (): Theme => {
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
  localStorage.setItem('theme', themeName);
  if (themeName === 'theme-dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
