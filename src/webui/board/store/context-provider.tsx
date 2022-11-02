import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { BoardContext } from './context';
import type { BoardList, UniqueId } from 'core/entities';
import { getBoardList, onBoardListChange } from 'core/usecases';

type BoardContextProviderProps = PropsWithChildren;

export const BoardContextProvider = ({ children }: BoardContextProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [boardList, setBoardList] = useState<BoardList>([]);
  const [activeBoardId, setActiveBoardId] = useState<UniqueId | null>(null);

  useEffect(() => {
    const updateBoardList = async () => {
      setLoading(true);
      const list = await getBoardList();
      setBoardList(list);
      setActiveBoardId((activeId) => {
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
  }, []);

  return (
    <BoardContext.Provider value={{ loading, boardList, activeBoardId, setActiveBoardId }}>
      {children}
    </BoardContext.Provider>
  );
};
