import type {
  BoardDocSchema,
  FirestoreDoc,
  FirestoreDocs,
  NextId,
  TaskDocSchema,
} from './firestore-helpers';
import type { BoardEntity, BoardList, ColumnEntity, TaskEntity, UniqueId } from 'core/entities';

export const BOARD_TO_DOC_MISSING_DATA_ERROR = Object.freeze(
  new Error('Missing data, unable to convert board')
);
export const TASK_TO_DOC_MISSING_DATA_ERROR = Object.freeze(
  new Error('Missing data, unable to convert task')
);

export type BoardBase = Omit<BoardEntity, 'columns'> & { columns: Omit<ColumnEntity, 'tasks'>[] };

export type BoardColumnTasks = Record<UniqueId, TaskEntity[]>;

export function firestoreDocsToBoardList(boardDocs: FirestoreDocs) {
  const boardList: BoardList = [];
  boardDocs.forEach((doc) => {
    const { name, nextId } = doc.data() as BoardDocSchema;
    const index = getIndexFromNextId(boardList, nextId);
    boardList.splice(index, 0, { id: doc.id, name });
  });
  return boardList;
}

export function firestoreDocToBoardBase(boardDoc: FirestoreDoc) {
  const { name, columns } = boardDoc.data() as BoardDocSchema;
  const boardBase: BoardBase = { id: boardDoc.id, name, columns: [] };
  Object.entries(columns).forEach(([key, { name, nextId }]) => {
    const index = getIndexFromNextId(boardBase.columns, nextId);
    boardBase.columns.splice(index, 0, { id: key, name });
  });
  return boardBase;
}

export function firestoreDocsToBoardColumnTasks(taskDocs: FirestoreDocs) {
  const columnTasks: BoardColumnTasks = {};
  taskDocs.forEach((doc) => {
    const {
      title,
      description,
      subtasks,
      status: { id: columnId },
      nextId,
    } = doc.data() as TaskDocSchema;
    if (!columnTasks[columnId]) {
      columnTasks[columnId] = [];
    }
    const column = columnTasks[columnId];
    const index = getIndexFromNextId(column, nextId);
    column.splice(index, 0, { id: doc.id, title, description, subtasks });
  });
  return columnTasks;
}

export function firestorePartsToBoard(boardBase: BoardBase, columnTasks: BoardColumnTasks) {
  const board: BoardEntity = {
    ...boardBase,
    columns: boardBase.columns.map(({ id, name }) => ({ id, name, tasks: [] })),
  };
  Object.entries(columnTasks).forEach(([key, tasks]) => {
    const column = board.columns.find(({ id }) => id === key);
    if (column) {
      column.tasks = tasks.map((task) => ({
        ...task,
        subtasks: task.subtasks.map((st) => ({ ...st })),
      }));
    }
  });
  return board;
}

export function boardToFirestoreDoc(
  board: Partial<Omit<BoardEntity, 'id'>> & { userId?: UniqueId; nextBoardId?: NextId },
  allFieldsRequired = false
) {
  const { name, columns, userId, nextBoardId } = board;
  const boardDoc: Partial<BoardDocSchema> = {};
  if (userId !== undefined) {
    boardDoc.owner = userId;
  }
  if (name !== undefined) {
    boardDoc.name = name;
  }
  if (columns !== undefined) {
    boardDoc.columns = Object.fromEntries(
      columns.map(({ id, name }, idx) => [
        id,
        { name, nextId: idx < columns.length - 1 ? columns[idx + 1].id : null },
      ])
    );
  }
  if (nextBoardId !== undefined) {
    boardDoc.nextId = nextBoardId;
  }

  const hasAllFields =
    boardDoc.owner !== undefined &&
    boardDoc.name !== undefined &&
    boardDoc.columns !== undefined &&
    boardDoc.nextId !== undefined;
  const hasNoField =
    boardDoc.owner === undefined &&
    boardDoc.name === undefined &&
    boardDoc.columns === undefined &&
    boardDoc.nextId === undefined;

  if (allFieldsRequired && !hasAllFields) {
    throw BOARD_TO_DOC_MISSING_DATA_ERROR;
  }
  return { boardDoc, hasNoField };
}

export function taskToFirestoreDoc(
  task: Partial<Omit<TaskEntity, 'id'>> & {
    column?: { id: UniqueId; name: string };
    nextTaskId?: NextId;
  },
  allFieldsRequired = false
) {
  const { title, description, subtasks, column, nextTaskId } = task;
  const taskDoc: Partial<TaskDocSchema> = {};
  if (title !== undefined) {
    taskDoc.title = title;
  }
  if (description !== undefined) {
    taskDoc.description = description;
  }
  if (subtasks !== undefined) {
    taskDoc.subtasks = subtasks;
  }
  if (column !== undefined) {
    taskDoc.status = column;
  }
  if (nextTaskId !== undefined) {
    taskDoc.nextId = nextTaskId;
  }

  const hasAllFields =
    taskDoc.title !== undefined &&
    taskDoc.description !== undefined &&
    taskDoc.subtasks !== undefined &&
    taskDoc.status !== undefined &&
    taskDoc.nextId !== undefined;
  const hasNoField =
    taskDoc.title === undefined &&
    taskDoc.description === undefined &&
    taskDoc.subtasks === undefined &&
    taskDoc.status === undefined &&
    taskDoc.nextId === undefined;

  if (allFieldsRequired && !hasAllFields) {
    throw TASK_TO_DOC_MISSING_DATA_ERROR;
  }
  return { taskDoc: taskDoc as TaskDocSchema, hasNoField };
}

function getIndexFromNextId(list: { id: UniqueId }[], nextId: NextId) {
  const nextIdIndex = list.findIndex(({ id }) => id === nextId);
  return nextIdIndex >= 0 ? nextIdIndex : list.length;
}
