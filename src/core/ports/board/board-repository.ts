import type { BoardEntity, BoardList, ColumnEntity, TaskEntity, UniqueId } from 'core/entities';

type BoardInfo = Omit<BoardEntity, 'id' | 'columns'>;
type ColumnInfo = Omit<ColumnEntity, 'id' | 'tasks'>;
type TaskInfo = Omit<TaskEntity, 'id'>;

export type BoardRepository = {
  getBoardList: (userId: UniqueId) => Promise<BoardList>;
  getBoard: (userId: UniqueId, boardId: UniqueId) => Promise<BoardEntity>;

  listenToBoardListChange: (userId: UniqueId, callback: () => void) => () => void;
  listenToBoardChange: (userId: UniqueId, boardId: UniqueId, callback: () => void) => () => void;

  addBoard: (
    userId: UniqueId,
    board: BoardInfo & { columns: ColumnInfo[] },
    index?: number
  ) => Promise<UniqueId>;
  addColumn: (
    userId: UniqueId,
    boardId: UniqueId,
    column: ColumnInfo,
    index?: number
  ) => Promise<void>;
  addTask: (
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    task: TaskInfo,
    index?: number
  ) => Promise<void>;

  updateBoard: (
    userId: UniqueId,
    board: { id: UniqueId } & BoardInfo,
    index?: number
  ) => Promise<void>;
  updateColumn: (
    userId: UniqueId,
    boardId: UniqueId,
    column: { id: UniqueId } & ColumnInfo,
    index?: number
  ) => Promise<void>;
  updateTask: (
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    task: { id: UniqueId } & TaskInfo,
    index?: number,
    oldColumnId?: UniqueId
  ) => Promise<void>;

  deleteBoard: (userId: UniqueId, boardId: UniqueId) => Promise<void>;
  deleteColumn: (userId: UniqueId, boardId: UniqueId, columnId: UniqueId) => Promise<void>;
  deleteTask: (
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    taskId: UniqueId
  ) => Promise<void>;
};
