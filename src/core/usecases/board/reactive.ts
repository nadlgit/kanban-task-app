import { getUserId } from './helpers';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';
import { doNothing } from 'core/utils';

export function onBoardListChange(callback: () => void) {
  const userId = getUserId();
  if (!userId) {
    return doNothing;
  }

  try {
    const repository = Dependencies.getBoardRepository();
    return repository.listenToBoardListChange(userId, callback);
  } catch (err) {
    notifyError((err as Error).message);
    return doNothing;
  }
}

export function onBoardChange(boardId: UniqueId, callback: () => void) {
  const userId = getUserId();
  if (!userId) {
    return doNothing;
  }

  try {
    const repository = Dependencies.getBoardRepository();
    return repository.listenToBoardChange(userId, boardId, callback);
  } catch (err) {
    notifyError((err as Error).message);
    return doNothing;
  }
}
