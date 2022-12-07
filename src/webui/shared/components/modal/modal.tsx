import styles from './modal.module.css';
import IconCross from './icon-cross.svg';

import { Dialog, DialogDismiss, useDialogState } from 'ariakit/dialog';
import type { PropsWithChildren } from 'react';

import { Icon } from '../icon';

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  withDismiss?: boolean;
}>;

export const Modal = ({ isOpen, onClose, children, withDismiss = false }: ModalProps) => {
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
      {withDismiss && (
        <DialogDismiss className={styles.close}>
          <Icon imgSrc={IconCross.src} imgAccessibleName="Close" className={styles.icon} />
        </DialogDismiss>
      )}
      {isOpen && children}
    </Dialog>
  );
};
