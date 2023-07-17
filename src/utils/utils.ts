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
  let theme = undefined;

  // get from storage (client)
  if (typeof window !== 'undefined') {
    theme = localStorage.getItem('theme');
  }

  if (!theme) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? Theme.DARK
      : Theme.LIGHT;
  }

  return Theme.LIGHT;
};

export const setTheme = (theme: Theme) => {
  const themeName = theme === Theme.DARK ? THEME_DARK : THEME_LIGHT;

  // save to storage (client)
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', themeName);
  }

  if (themeName === 'theme-dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
