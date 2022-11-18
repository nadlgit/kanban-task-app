import { getUserId } from './helpers';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

type Task = {
  title: string;
  description: string;
  subtasks: { title: string; isCompleted: boolean }[];
};
type AddTaskResult = { ok: true; taskId: UniqueId } | { ok: false };

export async function addTask(
  boardId: UniqueId,
  columnId: UniqueId,
  task: Task
): Promise<AddTaskResult> {
  const userId = getUserId();
  if (!userId) {
    return { ok: false };
  }

  const repository = Dependencies.getBoardRepository();
  let taskId;

  try {
    taskId = await repository.addTask(userId, boardId, columnId, task);
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  return { ok: true, taskId };
}
