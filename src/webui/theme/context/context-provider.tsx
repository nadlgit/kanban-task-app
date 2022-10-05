import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { ThemeContext } from './context';
import type { Theme } from './context';

type ThemeContextProviderProps = PropsWithChildren;

export const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const themeCssClass = `theme-${theme}`;
    document.body.classList.add(themeCssClass);
    return () => document.body.classList.remove(themeCssClass);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
