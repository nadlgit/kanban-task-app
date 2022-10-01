import type { BoardEntity, ColumnEntity, TaskEntity, UniqueId } from 'core/entities';

type BoardList = Pick<BoardEntity, 'id' | 'name'>[];
type Position = { index: number };
type BoardInfo = Omit<BoardEntity, 'id' | 'columns'>;
type ColumnInfo = Omit<ColumnEntity, 'id' | 'tasks'> & Position;
type TaskInfo = Omit<TaskEntity, 'id'> & Position;

export type BoardRepository = {
  getBoardList: (userId: UniqueId) => Promise<BoardList>;
  getBoard: (userId: UniqueId, boardId: UniqueId) => Promise<BoardEntity>;

  addBoard: (
    userId: UniqueId,
    board: BoardInfo & { columns: ColumnInfo[] }
  ) => Promise<BoardEntity>;
  addColumn: (userId: UniqueId, boardId: UniqueId, column: ColumnInfo) => Promise<ColumnEntity>;
  addTask: (
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    task: TaskInfo
  ) => Promise<TaskEntity>;

  updateBoard: (userId: UniqueId, boardId: UniqueId, board: BoardInfo) => Promise<void>;
  updateColumn: (
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    column: ColumnInfo
  ) => Promise<void>;
  updateTask: (
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    taskId: UniqueId,
    task: TaskInfo,
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
