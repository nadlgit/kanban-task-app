import styles from './modal.module.css';

import { Dialog, useDialogState } from 'ariakit/dialog';
import type { PropsWithChildren } from 'react';

type ModalProps = PropsWithChildren<{ isOpen: boolean; onClose: () => void }>;

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const state = useDialogState({
    open: isOpen,
    setOpen: (open) => {
      if (!open) {
        onClose();
      }
    },
  });
  return (
    <Dialog state={state} className={styles.modal} backdropProps={{ className: styles.backdrop }}>
      {children}
    </Dialog>
  );
};
