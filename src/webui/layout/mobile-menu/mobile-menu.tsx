import styles from './mobile-menu.module.css';
import IconDown from './icon-chevron-down.svg';
import IconUp from './icon-chevron-up.svg';

import { Popover, PopoverDisclosure, usePopoverState } from 'ariakit/popover';

import { Logout } from 'webui/auth';
import { BoardListNav } from 'webui/board';
import { ThemeSwitch } from 'webui/theme';

export const MobileMenu = () => {
  const state = usePopoverState();
  return (
    <>
      <PopoverDisclosure state={state}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={state.open ? IconUp.src : IconDown.src} alt="Toggle menu" />
      </PopoverDisclosure>
      <Popover state={state}>
        <BoardListNav />
        <ThemeSwitch />
        <Logout />
      </Popover>
    </>
  );
};
