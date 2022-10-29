import { useCallback, useEffect, useReducer, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { activeBoardIdReducer } from './active-id-reducer';
import { BoardContext } from './context';
import type { BoardList, UniqueId } from 'core/entities';
import { getBoardList, onBoardListChange } from 'core/usecases';

type BoardContextProviderProps = PropsWithChildren;

export const BoardContextProvider = ({ children }: BoardContextProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [boardList, setBoardList] = useState<BoardList>([]);
  const [activeBoardId, dispatchActiveBoardId] = useReducer(activeBoardIdReducer, null);
  const setActiveBoardId = useCallback((id: UniqueId | null) => {
    dispatchActiveBoardId({ type: 'SET', payload: id });
  }, []);

  useEffect(() => {
    const updateBoardList = async () => {
      setLoading(true);
      const list = await getBoardList();
      setBoardList(list);
      dispatchActiveBoardId({ type: 'RESET', payload: list });
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
