import styles from './edit-board.module.css';

import type { BoardEntity } from 'core/entities';

type EditBoardProps = { board: BoardEntity | null; onClose?: () => void };

export const EditBoard = ({ board, onClose }: EditBoardProps) => {
  return <p>Edit Board</p>;
};
