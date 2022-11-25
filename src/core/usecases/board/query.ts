import { getUserId } from './helpers';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

export async function getBoardList() {
  const userId = getUserId();
  if (!userId) {
    return [];
  }

  try {
    const repository = Dependencies.getBoardRepository();
    return await repository.getBoardList(userId);
  } catch (err) {
    notifyError((err as Error).message);
    return [];
  }
}

export async function getBoard(boardId: UniqueId) {
  const userId = getUserId();
  if (!userId) {
    return null;
  }

  try {
    const repository = Dependencies.getBoardRepository();
    return await repository.getBoard(userId, boardId);
  } catch (err) {
    notifyError((err as Error).message);
    return null;
  }
}
