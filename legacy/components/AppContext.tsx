import * as React from 'react';

import {
  applyTheme,
  getTheme,
  isThemeDefined,
  setTheme,
  Theme,
} from '../utils/utils';

interface Context {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppContext = React.createContext<Context>({
  theme: Theme.LIGHT,
  setTheme: () => {},
});

const AppContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [theme, setThemeState] = React.useState(Theme.LIGHT);

  const onSetTheme = (theme: Theme) => {
    setThemeState(theme);
    setTheme(theme);
  };

  React.useEffect(() => {
    const theme = getTheme();
    setThemeState(theme);
    if (!isThemeDefined()) {
      setTheme(theme);
    } else {
      applyTheme(theme);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme: onSetTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;

export const useAppContext = () => React.useContext(AppContext);
