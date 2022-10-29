import { getUserId } from './helpers';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

export async function getBoardList() {
  const userId = getUserId();
  if (!userId) {
    return [];
  }
  const repository = Dependencies.getBoardRepository();
  return await repository.getBoardList(userId);
}

export async function getBoard(boardId: UniqueId) {
  const userId = getUserId();
  if (!userId) {
    return null;
  }
  const repository = Dependencies.getBoardRepository();
  return await repository.getBoard(userId, boardId);
}
