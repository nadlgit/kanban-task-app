import { notifyError } from '../notification';
import { getUserId } from './helpers';
import { Dependencies } from 'core/dependencies';
import type { UniqueId } from 'core/entities';

type Board = { name: string; columns: { name: string }[] };
type AddBoardResult = { ok: true; boardId: UniqueId } | { ok: false };

export async function addBoard(board: Board): Promise<AddBoardResult> {
  const userId = getUserId();
  if (!userId) {
    return { ok: false };
  }

  const repository = Dependencies.getBoardRepository();
  let boardId;

  try {
    boardId = await repository.addBoard(userId, board);
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  return { ok: true, boardId };
}
