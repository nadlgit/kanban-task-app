import { getUserId } from './helpers';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';
import { doNothing } from 'webui/shared';

export function onBoardListChange(callback: () => void) {
  const userId = getUserId();
  if (!userId) {
    return doNothing;
  }
  const repository = Dependencies.getBoardRepository();
  return repository.listenToBoardListChange(userId, callback);
}

export function onBoardChange(boardId: UniqueId, callback: () => void) {
  const userId = getUserId();
  if (!userId) {
    return doNothing;
  }
  const repository = Dependencies.getBoardRepository();
  return repository.listenToBoardChange(userId, boardId, callback);
}
