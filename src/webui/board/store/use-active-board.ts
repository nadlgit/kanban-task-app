import { useEffect, useState } from 'react';

import { useBoardList } from './use-board-list';
import type { BoardEntity } from 'core/entities';
import { getBoard, onBoardChange } from 'core/usecases';

export const useActiveBoard = () => {
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState<BoardEntity | null>(null);
  const { loading: loadingBoardList, activeBoardId } = useBoardList();

  useEffect(() => {
    if (activeBoardId && !loadingBoardList) {
      const updateBoard = async () => {
        setLoading(true);
        const updatedBoard = await getBoard(activeBoardId);
        setBoard(updatedBoard ? { ...updatedBoard } : null);
        setLoading(false);
      };
      updateBoard();
      return onBoardChange(activeBoardId, updateBoard);
    }
    setLoading(loadingBoardList);
  }, [activeBoardId, loadingBoardList]);

  return { loading, board };
};
