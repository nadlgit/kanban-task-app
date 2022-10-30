import styles from './delete-board.module.css';

import type { BoardEntity } from 'core/entities';

type DeleteBoardProps = { board: BoardEntity | null; onClose?: () => void };

export const DeleteBoard = ({ board, onClose }: DeleteBoardProps) => {
  return <p>Delete Board</p>;
};
