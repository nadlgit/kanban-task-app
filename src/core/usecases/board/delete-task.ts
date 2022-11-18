import { getUserId } from './helpers';
import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

export async function deleteTask(boardId: UniqueId, columnId: UniqueId, taskId: UniqueId) {
  const userId = getUserId();
  if (!userId) {
    return { ok: false };
  }

  const repository = Dependencies.getBoardRepository();

  try {
    await repository.deleteTask(userId, boardId, columnId, taskId);
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  notifySuccess();
  return { ok: true };
}
