import type { OnDragEndResponder } from 'react-beautiful-dnd';

import { DroppableTypes, fromDroppableColumnId } from './droppable-utils';
import { editBoard, editTask, getBoard } from 'core/usecases';

export const handleDragEnd: OnDragEndResponder = async ({
  draggableId,
  source,
  destination,
  type,
}) => {
  if (!destination) {
    return;
  }
  if (destination.droppableId === source.droppableId && destination.index === source.index) {
    return;
  }

  switch (type) {
    case DroppableTypes.TASKS:
      await moveTask(draggableId, source.droppableId, destination.droppableId, destination.index);
      break;
    case DroppableTypes.COLUMNS:
      await moveColumn(draggableId, source.droppableId, destination.index);
      break;
    case DroppableTypes.BOARD_NAMES:
      await moveBoard(draggableId, destination.index);
      break;
  }
};

async function moveTask(
  draggableId: string,
  srcDroppableId: string,
  dstDroppableId: string,
  dstIndex: number
) {
  const { boardId, columnId: srcColumnId } = fromDroppableColumnId(srcDroppableId);
  const { columnId: dstColumnId } = fromDroppableColumnId(dstDroppableId);
  await editTask(boardId, srcColumnId, {
    id: draggableId,
    newColumnId: srcColumnId === dstColumnId ? undefined : dstColumnId,
    newIndex: dstIndex,
  });
}

async function moveColumn(draggableId: string, srcDroppableId: string, dstIndex: number) {
  const board = await getBoard(srcDroppableId);
  if (!board) {
    return;
  }
  const column = { isAdded: false, id: draggableId };
  const columnsKept = board.columns
    .map(({ id }) => ({ isAdded: false, id }))
    .filter(({ id }) => id !== column.id);
  columnsKept.splice(dstIndex, 0, column);
  await editBoard({ id: board.id, columnsKept } as Parameters<typeof editBoard>[0]);
}

async function moveBoard(draggableId: string, dstIndex: number) {
  await editBoard({ id: draggableId, newIndex: dstIndex } as Parameters<typeof editBoard>[0]);
}
