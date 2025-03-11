import * as React from 'react';
import { Sun, Moon } from 'react-feather';
import { Theme, getTheme, setTheme } from '../../utils/utils';
import Link from '../reusable/Link';
import { pushThemeChange } from '../../utils/analytics';

const ThemeToggle = () => {
  const [theme, setStateTheme] = React.useState(getTheme());

  React.useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const onThemeToggle = () => {
    const newTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setStateTheme(newTheme);
    pushThemeChange(newTheme === Theme.DARK ? 'dark' : 'light');
  };

  const icon = theme === Theme.DARK ? <Moon /> : <Sun />;

  return <Link.IconLink onClick={onThemeToggle}>{icon}</Link.IconLink>;
};

export default ThemeToggle;
