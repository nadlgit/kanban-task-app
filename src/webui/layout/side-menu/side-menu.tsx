import styles from './side-menu.module.css';
import IconHide from './icon-hide-sidebar.svg';
import IconShow from './icon-show-sidebar.svg';

import { Disclosure, DisclosureContent, useDisclosureState } from 'ariakit/disclosure';
import { useEffect } from 'react';

import { Logout } from 'webui/auth';
import { BoardListNav } from 'webui/board';
import { ThemedLogo } from 'webui/shared';
import { ThemeSwitch } from 'webui/theme';

type SideMenuProps = { onToggle: (isOpen: boolean) => void };

export const SideMenu = ({ onToggle }: SideMenuProps) => {
  const state = useDisclosureState();

  useEffect(() => {
    if (state?.open !== undefined) {
      onToggle(state.open);
    }
  }, [state?.open, onToggle]);

  return (
    <>
      <Disclosure state={state}>
        {state.open ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IconHide.src} alt="Hide sidebar" />
            <span>Hide Sidebar</span>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={IconShow.src} alt="Show sidebar" />
        )}
      </Disclosure>
      <DisclosureContent state={state}>
        <ThemedLogo />
        <BoardListNav />
        <ThemeSwitch />
        <Logout />
      </DisclosureContent>
    </>
  );
};
