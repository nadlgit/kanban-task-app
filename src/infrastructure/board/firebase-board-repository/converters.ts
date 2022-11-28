import type {
  BoardDocSchema,
  FirestoreDoc,
  FirestoreDocs,
  NextId,
  TaskDocSchema,
} from './firestore-helpers';
import type { BoardEntity, BoardList, TaskEntity, UniqueId } from 'core/entities';

export function firestoreDocsToBoardList(boardDocs: FirestoreDocs) {
  const boardList: BoardList = [];

  boardDocs.forEach((doc) => {
    const { name, nextId } = doc.data() as BoardDocSchema;
    const index = Math.max(
      boardList.findIndex(({ id }) => id === nextId),
      boardList.length
    );
    boardList.splice(index, 0, { id: doc.id, name });
  });

  return boardList;
}

export function firestoreDocsToBoard(
  boardInfo:
    | { boardBefore?: undefined; boardDoc: FirestoreDoc }
    | { boardBefore: BoardEntity; boardDoc?: undefined }
    | { boardBefore: BoardEntity; boardDoc: FirestoreDoc },
  taskDocs?: FirestoreDocs
) {
  let board: BoardEntity | undefined;
  if (boardInfo?.boardDoc && boardInfo.boardDoc.exists()) {
    const { name, columns } = boardInfo.boardDoc.data() as BoardDocSchema;
    board = {
      id: boardInfo.boardDoc.id,
      name,
      columns: firestoreColumnsToColumns(columns, boardInfo?.boardBefore?.columns),
    };
  } else {
    board = boardInfo.boardBefore;
  }

  if (board && taskDocs && !taskDocs.empty) {
    const columnTasks = firestoreTaskDocsToColumnTasks(taskDocs);
    Object.entries(columnTasks).forEach(([key, tasks]) => {
      const column = board?.columns.find(({ id }) => id === key);
      if (column) {
        column.tasks = tasks;
      }
    });
  }

  return board;
}

export function boardToFirestoreDoc(
  board: Partial<Omit<BoardEntity, 'id'>> & { userId?: UniqueId; nextBoardId?: NextId }
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
    boardDoc.columns = columnsToFirestoreColumns(columns);
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
  return { boardDoc, hasAllFields, hasNoField };
}

export function taskToFirestoreDoc(
  task: Partial<Omit<TaskEntity, 'id'>> & {
    column?: { id: UniqueId; name: string };
    nextTaskId?: NextId;
  }
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
  return { taskDoc, hasAllFields, hasNoField };
}

function columnsToFirestoreColumns(columns: BoardEntity['columns']) {
  return Object.fromEntries(
    columns.map(({ id, name }, idx) => [
      id,
      { name, nextId: idx < columns.length - 1 ? columns[idx + 1].id : null },
    ])
  );
}

function firestoreColumnsToColumns(
  firestoreColumns: BoardDocSchema['columns'],
  boardColumnsBefore?: BoardEntity['columns']
) {
  const boardColumns: BoardEntity['columns'] = [];

  Object.entries(firestoreColumns).forEach(([key, { name, nextId }]) => {
    const index = Math.max(
      boardColumns.findIndex(({ id }) => id === nextId),
      boardColumns.length
    );
    boardColumns.splice(index, 0, { id: key, name, tasks: [] });
  });

  if (boardColumnsBefore) {
    for (const column of boardColumns) {
      const columnBefore = boardColumnsBefore.find(({ id }) => id === column.id);
      if (columnBefore) {
        column.tasks = columnBefore.tasks;
      }
    }
  }

  return boardColumns;
}

function firestoreTaskDocsToColumnTasks(taskDocs: FirestoreDocs) {
  const columnTasks: Record<string, TaskEntity[]> = {};

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
    const index = Math.max(
      column.findIndex(({ id }) => id === nextId),
      column.length
    );
    column.splice(index, 0, { id: doc.id, title, description, subtasks });
  });

  return columnTasks;
}
