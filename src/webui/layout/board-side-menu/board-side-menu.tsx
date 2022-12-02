import styles from './board-side-menu.module.css';
import IconHide from './icon-hide-sidebar.svg';
import IconShow from './icon-show-sidebar.svg';

import { Disclosure, DisclosureContent, useDisclosureState } from 'ariakit/disclosure';

import { BoardListNav } from '../board-list-nav';
import { BoardExit } from '../board-exit';
import { Icon, ThemedLogo } from 'webui/shared';
import { ThemeSwitch } from 'webui/theme';

type BoardSideMenuProps = { defaultIsOpen: boolean; onToggle: (isOpen: boolean) => void };

export const BoardSideMenu = ({ defaultIsOpen, onToggle }: BoardSideMenuProps) => {
  const state = useDisclosureState({
    defaultOpen: defaultIsOpen,
    setOpen: onToggle,
  });

  return (
    <>
      <Disclosure
        state={state}
        className={`${styles.trigger} ${state.open ? styles.ishide : styles.isshow}`}
      >
        {state.open ? (
          <>
            <Icon imgSrc={IconHide.src} imgAccessibleName="" className={styles.icon} />
            <span>Hide Sidebar</span>
          </>
        ) : (
          <Icon imgSrc={IconShow.src} imgAccessibleName="Show Sidebar" className={styles.icon} />
        )}
      </Disclosure>
      <DisclosureContent state={state} className={styles.content}>
        <div className={styles.logo}>
          <ThemedLogo />
        </div>
        <BoardListNav />
        <ThemeSwitch />
        <BoardExit />
      </DisclosureContent>
    </>
  );
};
