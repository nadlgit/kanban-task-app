import { ConfirmDelete } from '../confirm-delete';
import type { BoardEntity, UniqueId } from 'core/entities';

type DeleteTaskProps = {
  isOpen: boolean;
  close: () => void;
  board: BoardEntity;
  columnId: UniqueId;
  taskId: UniqueId;
};

export const DeleteTask = ({ isOpen, close, board, columnId, taskId }: DeleteTaskProps) => {
  const task = board.columns
    .find(({ id }) => id === columnId)
    ?.tasks.find(({ id }) => id === taskId);
  const confirmProps = {
    isOpen,
    title: 'Delete this task?',
    message:
      `Are you sure you want to delete the ‘${task?.title}’ task and its subtasks?` +
      ' This action cannot be reversed.',
    onClose: async (shouldDelete: boolean) => {
      if (shouldDelete) {
        // todo
      }
      close();
    },
  };
  return <ConfirmDelete {...confirmProps} />;
};
