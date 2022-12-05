import { useCallback, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { ThemeContext } from './context';
import type { Theme } from './context';
import { useMediaQuery } from 'webui/shared';

type ThemeContextProviderProps = PropsWithChildren;

export const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [theme, setThemeState] = useState<Theme>(prefersDark ? 'dark' : 'light');
  const THEME_STORAGE_KEY = 'theme';

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
    localStorage.setItem(THEME_STORAGE_KEY, value);
  }, []);

  useEffect(() => {
    const storedValue = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedValue) {
      setThemeState(storedValue as Theme);
    }
  }, []);

  useEffect(() => {
    const themeCssClass = `theme-${theme}`;
    document.body.classList.add(themeCssClass);
    return () => document.body.classList.remove(themeCssClass);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
