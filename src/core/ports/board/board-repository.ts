import type { BoardEntity, BoardList, UniqueId } from 'core/entities';

export type BoardRepository = {
  getBoardList: (userId: UniqueId) => Promise<BoardList>;
  getBoard: (userId: UniqueId, boardId: UniqueId) => Promise<BoardEntity>;

  listenToBoardListChange: (userId: UniqueId, callback: () => void) => () => void;
  listenToBoardChange: (userId: UniqueId, boardId: UniqueId, callback: () => void) => () => void;

  addBoard: (
    userId: UniqueId,
    board: { name: string; columns: { name: string }[] },
    index?: number
  ) => Promise<UniqueId>;
  updateBoard: (
    userId: UniqueId,
    board: {
      id: string;
      name?: string;
      columnsAdded?: { name: string; index?: number }[];
      columnsDeleted?: { id: UniqueId }[];
      columnsUpdated?: { id: UniqueId; name?: string; index?: number }[];
    },
    index?: number
  ) => Promise<void>;
  deleteBoard: (userId: UniqueId, boardId: UniqueId) => Promise<void>;

  addTask: (
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    task: {
      title: string;
      description: string;
      subtasks: { title: string; isCompleted: boolean }[];
    },
    index?: number
  ) => Promise<UniqueId>;
  updateTask: (
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    task: {
      id: UniqueId;
      title?: string;
      description?: string;
      subtasks?: { title: string; isCompleted: boolean }[];
    },
    index?: number,
    oldColumnId?: UniqueId
  ) => Promise<void>;
  deleteTask: (
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    taskId: UniqueId
  ) => Promise<void>;
};
