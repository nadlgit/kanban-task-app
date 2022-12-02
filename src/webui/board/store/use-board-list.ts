import { useContext } from 'react';

import { BoardContext } from './context';

export const useBoardList = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoardList() must be used with <BoardContextProvider>');
  }
  const { loading, boardList, activeBoardId, setActiveBoardId } = context;
  return { loading, boardList, activeBoardId, setActiveBoardId };
};
