import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { BoardContext } from './context';
import type { BoardList, UniqueId } from 'core/entities';
import { getBoardList, onBoardListChange, setIsDemo } from 'core/usecases';

type BoardContextProviderProps = PropsWithChildren<{ isDemo: boolean }>;

export const BoardContextProvider = ({ isDemo, children }: BoardContextProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [boardList, setBoardList] = useState<BoardList>([]);
  const [activeBoardId, setActiveBoardIdState] = useState<UniqueId | null>(null);
  const [nextActiveBoardId, setNextActiveBoardIdState] = useState<UniqueId | null>(activeBoardId);

  useEffect(() => {
    setIsDemo(isDemo);
    const updateBoardList = async () => {
      setLoading(true);
      const list = await getBoardList();
      setBoardList(list);
      setActiveBoardIdState((activeId) => {
        if (list.find((board) => board.id === activeId)) {
          return activeId;
        } else {
          return list.length > 0 ? list[0].id : null;
        }
      });
      setLoading(false);
    };
    updateBoardList();
    return onBoardListChange(updateBoardList);
  }, [isDemo]);

  useEffect(() => {
    if (boardList.find((board) => board.id === nextActiveBoardId)) {
      setActiveBoardIdState((activeId) =>
        activeId === nextActiveBoardId ? activeId : nextActiveBoardId
      );
    }
  }, [boardList, nextActiveBoardId]);

  return (
    <BoardContext.Provider
      value={{
        loading,
        boardList,
        activeBoardId,
        setActiveBoardId: setNextActiveBoardIdState,
        isDemo,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
