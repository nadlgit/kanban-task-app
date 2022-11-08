import type { BoardList, UniqueId } from 'core/entities';

export function resetActiveBoardId(list: BoardList, activeId: UniqueId | null) {
  if (list.find((board) => board.id === activeId)) {
    return activeId;
  } else {
    return list.length > 0 ? list[0].id : null;
  }
}
