import { getUserId } from './helpers';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

type BoardUpdate = {
  id: UniqueId;
  name?: string;
  columnsAdded: { name: string }[];
  columnsDeleted: { id: UniqueId }[];
  columnsUpdated: { id: UniqueId; name: string }[];
};

export async function editBoard(boardUpdate: BoardUpdate) {
  const userId = getUserId();
  if (!userId) {
    return { ok: false };
  }

  const repository = Dependencies.getBoardRepository();

  try {
    await repository.updateBoard(userId, boardUpdate);
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  return { ok: true };
}
