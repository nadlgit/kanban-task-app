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
        setBoard(await getBoard(activeBoardId));
        setLoading(false);
      };
      updateBoard();
      return onBoardChange(activeBoardId, updateBoard);
    }
  }, [activeBoardId, loadingBoardList]);

  return { loading, board };
};
