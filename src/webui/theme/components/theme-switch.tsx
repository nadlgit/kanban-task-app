import styles from './theme-switch.module.css';
import IconDark from './icon-dark-theme.svg';
import IconLight from './icon-light-theme.svg';

import type { ChangeEventHandler } from 'react';

import { useTheme } from '../context';

type Theme = ReturnType<typeof useTheme>['theme'];

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const handleThemeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTheme(e.target.value as Theme);
  };
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={styles.container}>
      <Choice
        value="light"
        iconUrl={IconLight.src}
        alt="Light theme"
        currentTheme={theme}
        onChange={handleThemeChange}
      />
      <span className={styles.switch} onClick={toggleTheme} data-theme={theme} />
      <Choice
        value="dark"
        iconUrl={IconDark.src}
        alt="Dark theme"
        currentTheme={theme}
        onChange={handleThemeChange}
      />
    </div>
  );
};

type ChoiceProps = {
  value: Theme;
  iconUrl: string;
  alt: string;
  currentTheme: Theme;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const Choice = ({ value, iconUrl, alt, currentTheme, onChange }: ChoiceProps) => {
  const htmlId = `theme-${value}`;
  return (
    <>
      <input
        id={htmlId}
        type="radio"
        name="app-theme"
        className={styles.input}
        value={value}
        checked={currentTheme === value}
        onChange={onChange}
      />
      <label htmlFor={htmlId} className={styles.label}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconUrl} alt={alt} />
      </label>
    </>
  );
};
