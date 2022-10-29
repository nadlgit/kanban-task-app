import { BoardContent, useActiveBoard } from 'webui/board';
import { Loading } from 'webui/misc';

export const ActiveBoard = () => {
  const { loading, board } = useActiveBoard();
  if (loading) {
    return <Loading />;
  }
  return <BoardContent board={board} />;
};
