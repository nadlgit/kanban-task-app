import styles from './delete-column-confirm.module.css';

import { Button, ModalHeading } from 'webui/shared';

export type DeleteColumnConfirmProps = {
  close: () => void;
  columnName: string;
  onDelete: () => void;
};

export const DeleteColumnConfirm = ({ close, columnName, onDelete }: DeleteColumnConfirmProps) => {
  const handleCancel = () => {
    close();
  };

  const handleDelete = () => {
    onDelete();
    close();
  };

  return (
    <>
      <ModalHeading variant="destructive">Delete this column?</ModalHeading>
      <p className={styles.msg}>
        {`Are you sure you want to delete the ‘${columnName}’ column?` +
          ' This action will remove all of its tasks and cannot be undone.'}
      </p>
      <div className={styles.buttonswrapper}>
        <Button
          variant="destructive"
          fullWidth={false}
          className={styles.button}
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button
          variant="secondary"
          fullWidth={false}
          className={styles.button}
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </>
  );
};
