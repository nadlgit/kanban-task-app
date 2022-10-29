import styles from './layout.module.css';

import { useState } from 'react';
import type { PropsWithChildren } from 'react';

import { BoardMobileMenu } from './board-mobile-menu';
import { BoardSideMenu } from './board-side-menu';
import { ChallengeAttribution } from './challenge-attribution';
import { BoardActions } from 'webui/board';
import { MobileLogo, ThemedLogo, useIsMobile } from 'webui/shared';

type BoardLayoutProps = PropsWithChildren<{
  boardName?: string;
}>;

export const BoardLayout = ({ boardName, children }: BoardLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(true);
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        {isMobile ? (
          <span className={styles.logo}>
            <MobileLogo />
          </span>
        ) : (
          !isSideMenuOpen && (
            <span className={styles.logowithborder}>
              <ThemedLogo />
            </span>
          )
        )}
        <div className={styles.headercenter}>
          <h1 className={styles.title}>{boardName ?? '[No board]'}</h1>
          {isMobile && <BoardMobileMenu />}
        </div>
        <BoardActions isMobile={isMobile} />
      </header>

      <aside className={styles.sidebar}>
        {!isMobile && <BoardSideMenu defaultIsOpen={isSideMenuOpen} onToggle={setIsSideMenuOpen} />}
      </aside>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <ChallengeAttribution />
      </footer>
    </div>
  );
};
