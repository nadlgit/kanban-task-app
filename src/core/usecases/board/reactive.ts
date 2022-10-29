import { getUserId } from './helpers';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

export function onBoardListChange(callback: () => void) {
  const userId = getUserId();
  if (!userId) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }
  const repository = Dependencies.getBoardRepository();
  return repository.listenToBoardListChange(userId, callback);
}

export function onBoardChange(boardId: UniqueId, callback: () => void) {
  const userId = getUserId();
  if (!userId) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }
  const repository = Dependencies.getBoardRepository();
  return repository.listenToBoardChange(userId, boardId, callback);
}
