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
      columnsAdded: [],
      columnsDeleted: [],
      columnsUpdated: [],
    };
    const listBefore = board.columns;
    const listAfter = boardColumns;
    boardUpdate.columnsAdded = listAfter
      .filter(({ id: afterId }) => !listBefore.find(({ id: idBefore }) => idBefore === afterId))
      .map(({ name }) => ({ name }));
    boardUpdate.columnsDeleted = listBefore
      .filter(({ id: idBefore }) => !listAfter.find(({ id: idAfter }) => idBefore === idAfter))
      .map(({ id }) => ({ id }));
    boardUpdate.columnsUpdated = listAfter.filter(({ id: idAfter, name: nameAfter }) =>
      listBefore.find(
        ({ id: idBefore, name: nameBefore }) => idBefore === idAfter && nameBefore !== nameAfter
      )
    );

    if (
      boardUpdate.name ||
      boardUpdate.columnsAdded.length > 0 ||
      boardUpdate.columnsDeleted.length > 0 ||
      boardUpdate.columnsUpdated.length > 0
    ) {
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
