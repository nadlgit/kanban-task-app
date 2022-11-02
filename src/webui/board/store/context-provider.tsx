import { useCallback, useEffect, useReducer, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { boardListReducer } from './board-list-reducer';
import { BoardContext } from './context';
import type { UniqueId } from 'core/entities';
import { getBoardList, onBoardListChange } from 'core/usecases';

type BoardContextProviderProps = PropsWithChildren;

export const BoardContextProvider = ({ children }: BoardContextProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [{ boardList, activeBoardId }, dispatchBoardList] = useReducer(boardListReducer, {
    boardList: [],
    activeBoardId: null,
  });
  const setActiveBoardId = useCallback((id: UniqueId | null) => {
    dispatchBoardList({ type: 'SET_ACTIVE_ID', id });
  }, []);

  useEffect(() => {
    const updateBoardList = async () => {
      setLoading(true);
      dispatchBoardList({ type: 'SET_LIST', list: await getBoardList() });
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
