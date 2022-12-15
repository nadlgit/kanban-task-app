import { getUserId } from './helpers';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

type TaskUpdate = {
  id: UniqueId;
  title?: string;
  description?: string;
  subtasks?: { title: string; isCompleted: boolean }[];
  newColumnId?: UniqueId;
  newIndex?: number;
};

export async function editTask(boardId: UniqueId, columnId: UniqueId, taskUpdate: TaskUpdate) {
  const userId = getUserId();
  if (!userId) {
    return { ok: false };
  }

  const repository = Dependencies.getBoardRepository();

  try {
    const newColumnId = taskUpdate?.newColumnId ?? columnId;
    const oldColumnId = taskUpdate?.newColumnId && columnId;
    const index = taskUpdate?.newIndex;
    await repository.updateTask(userId, boardId, newColumnId, taskUpdate, index, oldColumnId);
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  return { ok: true };
}
