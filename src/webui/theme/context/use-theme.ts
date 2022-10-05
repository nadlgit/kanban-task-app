import { useContext } from 'react';

import { ThemeContext } from './context';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme() must be used with <ThemeContextProvider>');
  }
  return context;
};
