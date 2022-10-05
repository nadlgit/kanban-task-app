import styles from './layout.module.css';

import type { PropsWithChildren } from 'react';

import { ChallengeAttribution } from './challenge-attribution';
import { ThemeSwitch } from 'webui/theme';

type BaseLayoutProps = PropsWithChildren;

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className={styles.app}>
      <main>
        {children}
        <ThemeSwitch />
      </main>
      <footer>
        <ChallengeAttribution />
      </footer>
    </div>
  );
};
