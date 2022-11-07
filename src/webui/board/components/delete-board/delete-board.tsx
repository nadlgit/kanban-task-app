import { ConfirmDelete } from '../confirm-delete';
import type { BoardEntity } from 'core/entities';
import { deleteBoard } from 'core/usecases';

type DeleteBoardProps = { isOpen: boolean; close: () => void; board: BoardEntity };

export const DeleteBoard = ({ isOpen, close, board }: DeleteBoardProps) => {
  const confirmProps = {
    isOpen,
    title: 'Delete this board?',
    message:
      `Are you sure you want to delete the ‘${board.name}’ board?` +
      ' This action will remove all columns and tasks and cannot be reversed.',
    onClose: async (shouldDelete: boolean) => {
      if (shouldDelete) {
        await deleteBoard(board.id);
      }
      close();
    },
  };
  return <ConfirmDelete {...confirmProps} />;
};
