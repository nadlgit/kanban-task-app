import styles from './layout.module.css';

import { useState } from 'react';

import { ActiveBoard } from './active-board';
import { BoardMobileMenu } from './board-mobile-menu';
import { BoardSideMenu } from './board-side-menu';
import { BoardTopMenu } from './board-top-menu';
import { ChallengeAttribution } from './challenge-attribution';
import { useBoardList } from 'webui/board';
import { Loading } from 'webui/misc';
import { MobileLogo, ThemedLogo, useIsMobile } from 'webui/shared';

export const BoardLayout = () => {
  const { loading, boardList, activeBoardId } = useBoardList();
  const boardName = boardList.find((item) => item.id === activeBoardId)?.name ?? '[No board]';
  const isMobile = useIsMobile();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(true);

  if (loading) {
    return <Loading />;
  }

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
          <h1 className={styles.title}>{boardName}</h1>
          {isMobile && <BoardMobileMenu />}
        </div>
        <BoardTopMenu />
      </header>

      <aside className={styles.sidebar}>
        {!isMobile && <BoardSideMenu defaultIsOpen={isSideMenuOpen} onToggle={setIsSideMenuOpen} />}
      </aside>

      <main className={styles.main}>
        <ActiveBoard />
      </main>

      <footer className={styles.footer}>
        <ChallengeAttribution />
      </footer>
    </div>
  );
};
