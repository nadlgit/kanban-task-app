import styles from './board-mobile-menu.module.css';
import IconDown from './icon-chevron-down.svg';
import IconUp from './icon-chevron-up.svg';

import { Dialog, DialogDisclosure, useDialogState } from 'ariakit/dialog';

import { BoardMenuDetails } from '../board-menu-details';

export const BoardMobileMenu = () => {
  const state = useDialogState();
  return (
    <>
      <DialogDisclosure state={state} className={styles.button}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={state.open ? IconUp.src : IconDown.src} alt="Toggle menu" />
      </DialogDisclosure>
      <Dialog
        state={state}
        className={styles.menu}
        backdropProps={{ className: styles.menuwrapper }}
      >
        <BoardMenuDetails />
      </Dialog>
    </>
  );
};
