import type { ComponentProps } from 'react';

import { EditBoardForm } from './edit-board-form';
import type { BoardEntity } from 'core/entities';
import { editBoard } from 'core/usecases';
import { Modal, ModalHeading } from 'webui/shared';

type EditBoardProps = { isOpen: boolean; close: () => void; board: BoardEntity };

export const EditBoard = ({ isOpen, close, board }: EditBoardProps) => {
  const onSubmit: ComponentProps<typeof EditBoardForm>['onSubmit'] = async (
    boardName,
    boardColumns
  ) => {
    const boardUpdate: Parameters<typeof editBoard>[0] = {
      id: board.id,
      name: boardName === board.name ? undefined : boardName,
    };
    const listBefore = board.columns;
    const listAfter = boardColumns;
    const deletedIds = listBefore
      .filter(({ id: idBefore }) => !listAfter.find(({ id: idAfter }) => idBefore === idAfter))
      .map(({ id }) => id);
    const addedIds = listAfter
      .filter(({ id: afterId }) => !listBefore.find(({ id: idBefore }) => idBefore === afterId))
      .map(({ id }) => id);
    const updatedIds = listAfter
      .filter(({ id: idAfter, name: nameAfter }) =>
        listBefore.find(
          ({ id: idBefore, name: nameBefore }) => idBefore === idAfter && nameBefore !== nameAfter
        )
      )
      .map(({ id }) => id);
    if (deletedIds.length > 0) {
      boardUpdate.columnsDeleted = listBefore
        .filter(({ id }) => deletedIds.includes(id))
        .map(({ id }) => ({ id }));
    }
    if (addedIds.length > 0 || updatedIds.length > 0) {
      boardUpdate.columnsKept = listAfter.map(({ id, name }) =>
        addedIds.includes(id)
          ? { isAdded: true, name }
          : { isAdded: false, id, name: updatedIds.includes(id) ? name : undefined }
      );
    }

    if (boardUpdate.name || boardUpdate.columnsDeleted || boardUpdate.columnsKept) {
      await editBoard(boardUpdate);
    }
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeading>Edit Board</ModalHeading>
      <EditBoardForm board={board} onSubmit={onSubmit} />
    </Modal>
  );
};
