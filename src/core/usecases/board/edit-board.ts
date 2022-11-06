import { getUserId } from './helpers';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

type BoardUpdate = {
  id: UniqueId;
  nameUpdate?: string;
  columnsUpdate: { id: UniqueId; nameUpdate: string }[];
  columnsAdd: { name: string }[];
  columnsDelete: { id: UniqueId }[];
};

export async function editBoard(board: BoardUpdate) {
  console.log('editBoard usecase', board);

  const userId = getUserId();
  if (!userId) {
    return { ok: false };
  }

  const repository = Dependencies.getBoardRepository();

  try {
    //  await repository.TBD(userId,);
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  return { ok: true };
}
