import * as React from 'react';
import { Sun, Moon } from 'react-feather';
import { Theme } from '../../utils/utils';
import Link from '../reusable/Link';
import { pushThemeChange } from '../../utils/analytics';
import { useAppContext } from '../AppContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useAppContext();

  const onThemeToggle = () => {
    const newTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(newTheme);
    pushThemeChange(newTheme === Theme.DARK ? 'dark' : 'light');
  };

  const icon = theme === Theme.DARK ? <Moon /> : <Sun />;

  return <Link.IconLink onClick={onThemeToggle}>{icon}</Link.IconLink>;
};

export default ThemeToggle;
