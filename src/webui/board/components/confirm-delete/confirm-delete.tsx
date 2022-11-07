import styles from './confirm-delete.module.css';

import { Button, Modal, ModalHeading } from 'webui/shared';

type ConfirmDeleteProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: (shouldDelete: boolean) => void;
};

export const ConfirmDelete = ({ isOpen, title, message, onClose }: ConfirmDeleteProps) => {
  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)}>
      <ModalHeading variant="destructive">{title}</ModalHeading>
      <p className={styles.msg}>{message}</p>
      <div className={styles.buttonswrapper}>
        <Button
          variant="destructive"
          fullWidth={false}
          className={styles.button}
          onClick={() => onClose(true)}
        >
          Delete
        </Button>
        <Button
          variant="secondary"
          fullWidth={false}
          className={styles.button}
          onClick={() => onClose(false)}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
