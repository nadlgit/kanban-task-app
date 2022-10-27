import styles from './side-menu.module.css';
import IconShow from './icon-show-sidebar.svg';

import { Disclosure, DisclosureContent, useDisclosureState } from 'ariakit/disclosure';

import { IconHide } from './icon-hide-sidebar';
import { Logout } from 'webui/auth';
import { BoardListNav } from 'webui/board';
import { ThemedLogo } from 'webui/shared';
import { ThemeSwitch } from 'webui/theme';

type SideMenuProps = { defaultIsOpen: boolean; onToggle: (isOpen: boolean) => void };

export const SideMenu = ({ defaultIsOpen, onToggle }: SideMenuProps) => {
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
