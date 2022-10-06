import styles from './layout.module.css';

import type { PropsWithChildren } from 'react';

import { ChallengeAttribution } from './challenge-attribution';
import { ThemedLogo } from 'webui/shared';
import { ThemeSwitch } from 'webui/theme';

type BaseLayoutProps = PropsWithChildren;

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <ThemedLogo />
      </header>
      <main className={styles.main}>
        {children}
        <ThemeSwitch />
      </main>
      <footer className={styles.footer}>
        <ChallengeAttribution />
      </footer>
    </div>
  );
};
