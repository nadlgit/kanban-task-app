import { boardToFirestoreDoc, taskToFirestoreDoc } from './converters';
import {
  addBoardListSubscriptionCallback,
  addBoardSubscriptionCallback,
  getBoardListSubscriptionValue,
  getBoardSubscriptionValue,
  initBoardListSubscription,
  initBoardSubscription,
  isBoardListSubscriptionInitialized,
  isBoardSubscriptionInitialized,
} from './data-subscription';
import {
  getBoardDoc,
  getBoardRef,
  getBoardTaskDocs,
  getTaskRef,
  getUserBoardDocs,
  newBoardRef,
  newColumnId,
  newTaskRef,
  startBatch,
} from './firestore-helpers';
import type { TaskDocSchema } from './firestore-helpers';
import {
  getBoardColumns,
  getBoardInfo,
  getBoardTaskIds,
  getColumnTaskIds,
  getTaskInfo,
} from './helpers';
import type { BoardEntity, UniqueId } from 'core/entities';
import type { BoardRepository } from 'core/ports';

export const BOARD_UNDEFINED_ERROR = Object.freeze(new Error('Unable to find requested board'));
export const ADD_BOARD_MISSING_DATA_ERROR = Object.freeze(
  new Error('Missing data, unable to add board')
);
export const ADD_TASK_MISSING_DATA_ERROR = Object.freeze(
  new Error('Missing data, unable to add task')
);

export class FirebaseBoardRepository implements BoardRepository {
  async getBoardList(userId: UniqueId) {
    if (!isBoardListSubscriptionInitialized(userId)) {
      const boardDocs = await getUserBoardDocs(userId);
      initBoardListSubscription(userId, boardDocs);
    }
    return getBoardListSubscriptionValue(userId);
  }

  async getBoard(userId: UniqueId, boardId: UniqueId) {
    if (!isBoardSubscriptionInitialized(userId, boardId)) {
      const [boardDoc, tasksDocs] = await Promise.all([
        getBoardDoc(boardId),
        getBoardTaskDocs(boardId),
      ]);
      initBoardSubscription(userId, boardId, boardDoc, tasksDocs);
    }

    const board = getBoardSubscriptionValue(userId, boardId);
    if (!board) {
      throw BOARD_UNDEFINED_ERROR;
    }
    return board;
  }

  listenToBoardListChange(userId: UniqueId, callback: () => void) {
    return addBoardListSubscriptionCallback(userId, callback);
  }

  listenToBoardChange(userId: UniqueId, boardId: UniqueId, callback: () => void) {
    return addBoardSubscriptionCallback(userId, boardId, callback);
  }

  async addBoard(
    userId: UniqueId,
    board: { name: string; columns: { name: string }[] },
    index?: number
  ) {
    const boardRef = newBoardRef();
    const { name, columns } = board;
    const { prevIdAfter, nextIdAfter } = getBoardInfo(
      {
        prevIdAfter: true,
        nextIdAfter: true,
        prevIdBefore: false,
        nextIdBefore: false,
      },
      {
        boardId: boardRef.id,
        boardList: getBoardListSubscriptionValue(userId),
        indexAfter: index,
      }
    );

    const { boardDoc, hasAllFields } = boardToFirestoreDoc({
      userId,
      name,
      columns: columns.map(({ name }) => ({ id: newColumnId(boardRef.id), name, tasks: [] })),
      nextBoardId: nextIdAfter ?? null,
    });
    if (!hasAllFields) {
      throw ADD_BOARD_MISSING_DATA_ERROR;
    }
    const batch = startBatch();
    batch.set(boardRef, boardDoc);
    prevIdAfter && batch.update(getBoardRef(prevIdAfter), { nextId: boardRef.id });
    await batch.commit();

    return boardRef.id;
  }

  async updateBoard(
    userId: UniqueId,
    board: {
      id: UniqueId;
      name?: string;
      columnsDeleted?: { id: UniqueId }[];
      columnsKept?:
        | (
            | { isAdded: true; id?: undefined; name: string }
            | { isAdded: false; id: UniqueId; name?: string }
          )[];
    },
    index?: number
  ) {
    const boardRef = getBoardRef(board.id);
    const { name, columnsDeleted, columnsKept } = board;
    const hasColumnUpdate = columnsDeleted !== undefined || columnsKept !== undefined;
    const hasPositionUpdate = index !== undefined;
    const { prevIdAfter, nextIdAfter, prevIdBefore, nextIdBefore } = getBoardInfo(
      {
        prevIdAfter: hasPositionUpdate,
        nextIdAfter: hasPositionUpdate,
        prevIdBefore: hasPositionUpdate,
        nextIdBefore: hasPositionUpdate,
      },
      {
        boardId: board.id,
        boardList: getBoardListSubscriptionValue(userId),
        indexAfter: index,
      }
    );
    let columns: BoardEntity['columns'] | undefined = undefined;
    const updatedTasks: { id: UniqueId; taskDoc: Pick<TaskDocSchema, 'status'> }[] = [];
    if (hasColumnUpdate) {
      const boardColumnsBefore = await getBoardColumns(
        board.id,
        getBoardSubscriptionValue(userId, board.id)
      );
      const boardColumns: typeof boardColumnsBefore = [];
      if (columnsKept) {
        for (const elt of columnsKept) {
          const column = {
            id: elt?.id ?? newColumnId(board.id),
            name:
              elt?.name ?? boardColumnsBefore.find(({ id }) => id === elt?.id)?.name ?? '-noname-',
          };
          boardColumns.push(column);
          if (!elt.isAdded && elt?.name) {
            const tasksIds = await getColumnTaskIds(board.id, column.id);
            updatedTasks.push(...tasksIds.map((id) => ({ id, taskDoc: { status: column } })));
          }
        }
      } else {
        boardColumns.push(
          ...boardColumnsBefore.filter(
            ({ id }) => !columnsDeleted?.map(({ id }) => id)?.includes(id)
          )
        );
      }

      columns = boardColumns.map(({ id, name }) => ({ id, name, tasks: [] }));
    }

    const { boardDoc, hasNoField } = boardToFirestoreDoc({
      name,
      columns,
      nextBoardId: nextIdAfter,
    });
    const batch = startBatch();
    !hasNoField && batch.update(boardRef, boardDoc);
    for (const task of updatedTasks) {
      batch.update(getTaskRef(board.id, task.id), task.taskDoc);
    }
    prevIdAfter && batch.update(getBoardRef(prevIdAfter), { nextId: boardRef.id });
    prevIdBefore && batch.update(getBoardRef(prevIdBefore), { nextId: nextIdBefore });
    await batch.commit();
  }

  async deleteBoard(userId: UniqueId, boardId: UniqueId) {
    const { prevIdBefore, nextIdBefore } = getBoardInfo(
      {
        prevIdAfter: false,
        nextIdAfter: false,
        prevIdBefore: true,
        nextIdBefore: true,
      },
      {
        boardId: boardId,
        boardList: getBoardListSubscriptionValue(userId),
      }
    );
    const tasksIds = await getBoardTaskIds(boardId, getBoardSubscriptionValue(userId, boardId));

    const batch = startBatch();
    for (const taskId of tasksIds) {
      batch.delete(getTaskRef(boardId, taskId));
    }
    batch.delete(getBoardRef(boardId));
    prevIdBefore && batch.update(getBoardRef(prevIdBefore), { nextId: nextIdBefore });
    await batch.commit();
  }

  async addTask(
    userId: UniqueId,
    boardId: UniqueId,
    columnId: UniqueId,
    task: {
      title: string;
      description: string;
      subtasks: { title: string; isCompleted: boolean }[];
    },
    index?: number
  ) {
    const taskRef = newTaskRef(boardId);
    const { title, description, subtasks } = task;
    const { statusAfter, prevIdAfter, nextIdAfter } = await getTaskInfo(
      {
        statusAfter: true,
        prevIdAfter: true,
        nextIdAfter: true,
        prevIdBefore: false,
        nextIdBefore: false,
      },
      {
        taskId: taskRef.id,
        boardId,
        columnIdBefore: columnId,
        columnIdAfter: columnId,
        board: getBoardSubscriptionValue(userId, boardId),
        indexAfter: index,
      }
    );

    const { taskDoc, hasAllFields } = taskToFirestoreDoc({
      title,
      description,
      subtasks,
      column: statusAfter ?? { id: columnId, name: '-noname-' },
      nextTaskId: nextIdAfter ?? null,
    });
    if (!hasAllFields) {
      throw ADD_TASK_MISSING_DATA_ERROR;
    }
    const batch = startBatch();
    batch.set(taskRef, taskDoc);
    prevIdAfter && batch.update(getTaskRef(boardId, prevIdAfter), { nextId: taskRef.id });
    await batch.commit();

    return taskRef.id;
  }

  async updateTask(
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
  ) {
    const taskRef = getTaskRef(boardId, task.id);
    const { title, description, subtasks } = task;
    const hasStatusUpdate = oldColumnId !== undefined;
    const hasPositionUpdate = index !== undefined;
    const { statusAfter, prevIdAfter, nextIdAfter } = await getTaskInfo(
      {
        statusAfter: hasStatusUpdate,
        prevIdAfter: hasStatusUpdate || hasPositionUpdate,
        nextIdAfter: hasStatusUpdate || hasPositionUpdate,
        prevIdBefore: hasStatusUpdate || hasPositionUpdate,
        nextIdBefore: hasStatusUpdate || hasPositionUpdate,
      },
      {
        taskId: task.id,
        boardId,
        columnIdBefore: oldColumnId ?? columnId,
        columnIdAfter: columnId,
        board: getBoardSubscriptionValue(userId, boardId),
        indexAfter: index,
      }
    );

    const { taskDoc, hasNoField } = taskToFirestoreDoc({
      title,
      description,
      subtasks,
      column: statusAfter,
      nextTaskId: nextIdAfter,
    });
    const batch = startBatch();
    !hasNoField && batch.update(taskRef, taskDoc);
    prevIdAfter && batch.update(getTaskRef(boardId, prevIdAfter), { nextId: taskRef.id });
    await batch.commit();
  }

  async deleteTask(userId: UniqueId, boardId: UniqueId, columnId: UniqueId, taskId: UniqueId) {
    const { prevIdBefore, nextIdBefore } = await getTaskInfo(
      {
        statusAfter: false,
        prevIdAfter: false,
        nextIdAfter: false,
        prevIdBefore: true,
        nextIdBefore: true,
      },
      {
        taskId,
        boardId,
        columnIdBefore: columnId,
        columnIdAfter: columnId,
        board: getBoardSubscriptionValue(userId, boardId),
      }
    );

    const batch = startBatch();
    batch.delete(getTaskRef(boardId, taskId));
    prevIdBefore && batch.update(getTaskRef(boardId, prevIdBefore), { nextId: nextIdBefore });
    await batch.commit();
  }
}
