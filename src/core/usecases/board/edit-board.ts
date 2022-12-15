import { getUserId } from './helpers';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

type BoardUpdate = {
  id: UniqueId;
  name?: string;
  columnsDeleted?: { id: UniqueId }[];
  columnsKept?:
    | (
        | { isAdded: true; id?: undefined; name: string }
        | { isAdded: false; id: UniqueId; name?: string }
      )[];
  newIndex?: number;
};

export async function editBoard(boardUpdate: BoardUpdate) {
  const userId = getUserId();
  if (!userId) {
    return { ok: false };
  }

  const repository = Dependencies.getBoardRepository();

  try {
    await repository.updateBoard(userId, boardUpdate, boardUpdate.newIndex);
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  return { ok: true };
}
