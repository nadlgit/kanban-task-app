import { useContext } from 'react';

import { BoardContext } from './context';

export const useIsDemo = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useIsDemo() must be used with <BoardContextProvider>');
  }
  return context.isDemo;
};
