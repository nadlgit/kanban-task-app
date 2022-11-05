import { getUserId } from './helpers';
import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

export async function deleteBoard(boardId: UniqueId) {
  const userId = getUserId();
  if (!userId) {
    return { ok: false };
  }

  const repository = Dependencies.getBoardRepository();

  try {
    await repository.deleteBoard(userId, boardId);
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  notifySuccess();
  return { ok: true };
}
