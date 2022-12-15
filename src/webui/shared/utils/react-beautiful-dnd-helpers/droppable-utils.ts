import type { UniqueId } from 'core/entities';

export enum DroppableTypes {
  TASKS = 'TASKS',
  COLUMNS = 'COLUMNS',
  BOARD_NAMES = 'BOARD_NAMES',
}

type DroppableColumnIdInfo = { boardId: UniqueId; columnId: UniqueId };

export function toDroppableColumnId({ boardId, columnId }: DroppableColumnIdInfo) {
  return `${columnId}(${boardId})`;
}

export function fromDroppableColumnId(id: string): DroppableColumnIdInfo {
  const parts = id.match(/(?<columnId>[^(]+)\((?<boardId>[^)]+)\)/)?.groups;
  return {
    boardId: parts?.boardId ?? '',
    columnId: parts?.columnId ?? id,
  };
}
