import styles from './delete-board.module.css';

import type { BoardEntity } from 'core/entities';
import { deleteBoard } from 'core/usecases';
import { Button, ModalHeading } from 'webui/shared';

type DeleteBoardProps = { board: BoardEntity; close: () => void };

export const DeleteBoard = ({ board, close }: DeleteBoardProps) => {
  const handleCancel = () => {
    close();
  };

  const handleDelete = async () => {
    await deleteBoard(board.id);
    close();
  };

  return (
    <>
      <ModalHeading variant="destructive">Delete this board?</ModalHeading>
      <p className={styles.msg}>
        {`Are you sure you want to delete the ‘${board.name}’ board?` +
          ' This action will remove all columns and tasks and cannot be reversed.'}
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
