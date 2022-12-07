import type { ComponentProps } from 'react';

import { AddBoardForm } from './add-board-form';
import type { UniqueId } from 'core/entities';
import { addBoard } from 'core/usecases';
import { Modal, ModalHeading } from 'webui/shared';

type AddBoardProps = { isOpen: boolean; close: () => void; onAdd?: (newBoardId: UniqueId) => void };

export const AddBoard = ({ isOpen, close, onAdd }: AddBoardProps) => {
  const onSubmit: ComponentProps<typeof AddBoardForm>['onSubmit'] = async (
    boardName,
    boardColumns
  ) => {
    const board = {
      name: boardName,
      columns: boardColumns.map(({ name }) => ({ name })),
    };
    const result = await addBoard(board);
    if (result.ok && onAdd) {
      onAdd(result.boardId);
    }
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} withDismiss>
      <ModalHeading>Add New Board</ModalHeading>
      <AddBoardForm onSubmit={onSubmit} />
    </Modal>
  );
};
