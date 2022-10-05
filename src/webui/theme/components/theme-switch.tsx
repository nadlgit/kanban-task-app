import { useTheme } from '../context';

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
    </button>
  );
};
