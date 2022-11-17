import styles from './modal.module.css';

import { Dialog, useDialogState } from 'ariakit/dialog';
import type { PropsWithChildren } from 'react';

type ModalProps = PropsWithChildren<{ isOpen: boolean; onClose: () => void; hide?: boolean }>;

export const Modal = ({ isOpen, onClose, hide, children }: ModalProps) => {
  const state = useDialogState({
    open: isOpen,
    setOpen: (open) => {
      if (!open) {
        onClose();
      }
    },
  });
  return (
    <Dialog
      state={state}
      className={styles.modal}
      style={hide ? { visibility: 'hidden' } : undefined}
      backdropProps={{ className: styles.backdrop }}
    >
      {isOpen && children}
    </Dialog>
  );
};
