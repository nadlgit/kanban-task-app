import { createContext } from 'react';

export type Theme = 'light' | 'dark';
type ThemeContextValue = { theme: Theme; setTheme: (value: Theme) => void };

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
