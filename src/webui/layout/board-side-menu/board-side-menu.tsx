import styles from './board-side-menu.module.css';
import IconShow from './icon-show-sidebar.svg';

import { Disclosure, DisclosureContent, useDisclosureState } from 'ariakit/disclosure';

import { IconHide } from './icon-hide-sidebar';
import { BoardListNav } from '../board-list-nav';
import { Logout } from 'webui/auth';
import { ThemedLogo } from 'webui/shared';
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
            <IconHide />
            <span>Hide Sidebar</span>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={IconShow.src} alt="Show sidebar" />
        )}
      </Disclosure>
      <DisclosureContent state={state} className={styles.content}>
        <div className={styles.logo}>
          <ThemedLogo />
        </div>
        <BoardListNav />
        <ThemeSwitch />
        <Logout />
      </DisclosureContent>
    </>
  );
};
