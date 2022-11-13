import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { BoardContext } from './context';
import { resetActiveBoardId } from './reset-active-board-id';
import type { BoardList, UniqueId } from 'core/entities';
import { getBoardList, onBoardListChange } from 'core/usecases';

type BoardContextProviderProps = PropsWithChildren;

export const BoardContextProvider = ({ children }: BoardContextProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [boardList, setBoardList] = useState<BoardList>([]);
  const [activeBoardId, setActiveBoardIdState] = useState<UniqueId | null>(null);
  const [nextActiveBoardId, setNextActiveBoardIdState] = useState<UniqueId | null>(activeBoardId);

  useEffect(() => {
    const updateBoardList = async () => {
      setLoading(true);
      const list = await getBoardList();
      setBoardList(list);
      setActiveBoardIdState((activeId) => resetActiveBoardId(list, activeId));
      setLoading(false);
    };
    updateBoardList();
    return onBoardListChange(updateBoardList);
  }, []);

  useEffect(() => {
    if (boardList.find((board) => board.id === nextActiveBoardId)) {
      setActiveBoardIdState((activeId) =>
        activeId === nextActiveBoardId ? activeId : nextActiveBoardId
      );
    }
  }, [boardList, nextActiveBoardId]);

  return (
    <BoardContext.Provider
      value={{ loading, boardList, activeBoardId, setActiveBoardId: setNextActiveBoardIdState }}
    >
      {children}
    </BoardContext.Provider>
  );
};
