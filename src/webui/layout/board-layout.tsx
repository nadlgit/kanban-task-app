import styles from './layout.module.css';

import { useState } from 'react';
import type { PropsWithChildren } from 'react';

import { ChallengeAttribution } from './challenge-attribution';
import { MobileMenu } from './mobile-menu';
import { SideMenu } from './side-menu';
import { BoardActions } from 'webui/board';
import { MobileLogo, ThemedLogo, useIsMobile } from 'webui/shared';

type BoardLayoutProps = PropsWithChildren<{
  boardName?: string;
}>;

export const BoardLayout = ({ boardName, children }: BoardLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        {isMobile ? <MobileLogo /> : !isSideMenuOpen && <ThemedLogo />}
        <div>
          <h1 className={styles.title}>{boardName ?? '[No board]'}</h1>
          {isMobile && <MobileMenu />}
        </div>
        <BoardActions isMobile={isMobile} />
      </header>

      <aside className={styles.sidebar}>
        {!isMobile && <SideMenu onToggle={setIsSideMenuOpen} />}
      </aside>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <ChallengeAttribution />
      </footer>
    </div>
  );
};
