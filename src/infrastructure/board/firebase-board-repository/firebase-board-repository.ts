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
import type { NextId, TaskDocSchema } from './firestore-helpers';
import type { BoardEntity, UniqueId } from 'core/entities';
import type { BoardRepository } from 'core/ports';

export const BOARD_UNDEFINED_ERROR = Object.freeze(new Error('Unable to find requested board'));

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

    const boardList = await this.getBoardList(userId);
    const boardIndexAfter = getComputedIndexAfter(boardList, index);

    const prevIdAfter = getPrevId(boardList, boardIndexAfter);
    const nextIdAfter = getNextId(boardList, boardIndexAfter);

    const { boardDoc } = boardToFirestoreDoc(
      {
        userId,
        name,
        columns: columns.map(({ name }) => ({ id: newColumnId(boardRef.id), name, tasks: [] })),
        nextBoardId: nextIdAfter ?? null,
      },
      true
    );
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

    let columns: BoardEntity['columns'] | undefined = undefined;
    const updatedTasks: { id: UniqueId; newStatus: { id: UniqueId; name: string } }[] = [];
    if (columnsDeleted || columnsKept) {
      const boardBefore = await this.getBoard(userId, board.id);
      columns = [];

      if (columnsKept) {
        for (const elt of columnsKept) {
          const column = boardBefore.columns.find(({ id }) => id === elt.id) ?? {
            id: newColumnId(board.id),
            name: elt?.name ?? '-noname-',
            tasks: [],
          };
          if (!elt.isAdded && elt.name && elt.name !== column.name) {
            column.name = elt.name;
            updatedTasks.push(
              ...column.tasks.map(({ id }) => ({
                id,
                newStatus: { id: column.id, name: column.name },
              }))
            );
          }
          columns.push(column);
        }
      } else {
        columns.push(
          ...boardBefore.columns.filter(
            ({ id }) => !columnsDeleted?.map(({ id }) => id).includes(id)
          )
        );
      }
    }

    const boardList = await this.getBoardList(userId);
    const boardIndexBefore = getIndex(boardList, board.id);
    const boardIndexAfter = getComputedIndexAfter(boardList, index);

    let prevIdBefore: NextId | undefined = undefined;
    let nextIdBefore: NextId | undefined = undefined;
    let prevIdAfter: NextId | undefined = undefined;
    let nextIdAfter: NextId | undefined = undefined;
    if (index !== undefined) {
      prevIdBefore = getPrevId(boardList, boardIndexBefore);
      nextIdBefore = getNextId(boardList, boardIndexBefore);
      prevIdAfter = getPrevId(boardList, boardIndexAfter);
      nextIdAfter = getNextId(boardList, boardIndexAfter);
    }

    const { boardDoc, hasNoField } = boardToFirestoreDoc({
      name,
      columns,
      nextBoardId: nextIdAfter,
    });
    const batch = startBatch();
    !hasNoField && batch.update(boardRef, boardDoc);
    for (const task of updatedTasks) {
      batch.update(getTaskRef(board.id, task.id), { status: task.newStatus });
    }
    prevIdAfter && batch.update(getBoardRef(prevIdAfter), { nextId: boardRef.id });
    prevIdBefore && batch.update(getBoardRef(prevIdBefore), { nextId: nextIdBefore });
    await batch.commit();
  }

  async deleteBoard(userId: UniqueId, boardId: UniqueId) {
    const boardList = await this.getBoardList(userId);
    const boardIndex = getIndex(boardList, boardId);
    const board = await this.getBoard(userId, boardId);

    const prevIdBefore = getPrevId(boardList, boardIndex);
    const nextIdBefore = getNextId(boardList, boardIndex);
    const tasksIds = board.columns.flatMap(({ tasks }) => tasks.map(({ id }) => id));

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

    const board = await this.getBoard(userId, boardId);
    const columnIndexAfter = getIndex(board.columns, columnId);
    const taskIndexAfter = getComputedIndexAfter(board.columns[columnIndexAfter].tasks, index);

    const statusAfter = { id: columnId, name: board.columns[columnIndexAfter].name };
    const prevIdAfter = getPrevId(board.columns[columnIndexAfter].tasks, taskIndexAfter);
    const nextIdAfter = getNextId(board.columns[columnIndexAfter].tasks, taskIndexAfter);

    const { taskDoc } = taskToFirestoreDoc(
      {
        title,
        description,
        subtasks,
        column: statusAfter ?? { id: columnId, name: '-noname-' },
        nextTaskId: nextIdAfter ?? null,
      },
      true
    );
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

    const board = await this.getBoard(userId, boardId);
    const columnIndexBefore = getIndex(board.columns, oldColumnId ?? columnId);
    const taskIndexBefore = getIndex(board.columns[columnIndexBefore].tasks, task.id);
    const columnIndexAfter = getIndex(board.columns, columnId);
    const taskIndexAfter = getComputedIndexAfter(board.columns[columnIndexAfter].tasks, index);

    let statusAfter: TaskDocSchema['status'] | undefined = undefined;
    if (oldColumnId !== undefined) {
      statusAfter = { id: columnId, name: board.columns[columnIndexAfter].name };
    }

    let prevIdBefore: NextId | undefined = undefined;
    let nextIdBefore: NextId | undefined = undefined;
    let prevIdAfter: NextId | undefined = undefined;
    let nextIdAfter: NextId | undefined = undefined;
    if (oldColumnId !== undefined || index !== undefined) {
      prevIdBefore = getPrevId(board.columns[columnIndexBefore].tasks, taskIndexBefore);
      nextIdBefore = getNextId(board.columns[columnIndexBefore].tasks, taskIndexBefore);
      prevIdAfter = getPrevId(board.columns[columnIndexAfter].tasks, taskIndexAfter);
      nextIdAfter = getNextId(board.columns[columnIndexAfter].tasks, taskIndexAfter);
    }

    const { taskDoc, hasNoField } = taskToFirestoreDoc({
      title,
      description,
      subtasks,
      column: statusAfter,
      nextTaskId: nextIdAfter,
    });
    const batch = startBatch();
    !hasNoField && batch.update(taskRef, taskDoc);
    prevIdBefore && batch.update(getTaskRef(boardId, prevIdBefore), { nextId: nextIdBefore });
    prevIdAfter && batch.update(getTaskRef(boardId, prevIdAfter), { nextId: taskRef.id });
    await batch.commit();
  }

  async deleteTask(userId: UniqueId, boardId: UniqueId, columnId: UniqueId, taskId: UniqueId) {
    const board = await this.getBoard(userId, boardId);
    const columnIndex = getIndex(board.columns, columnId);
    const taskIndex = getIndex(board.columns[columnIndex].tasks, taskId);

    const prevIdBefore = getPrevId(board.columns[columnIndex].tasks, taskIndex);
    const nextIdBefore = getNextId(board.columns[columnIndex].tasks, taskIndex);

    const batch = startBatch();
    batch.delete(getTaskRef(boardId, taskId));
    prevIdBefore && batch.update(getTaskRef(boardId, prevIdBefore), { nextId: nextIdBefore });
    await batch.commit();
  }
}

function getIndex(list: { id: UniqueId }[], itemId: UniqueId) {
  return list.findIndex(({ id }) => id === itemId);
}

function getComputedIndexAfter(list: { id: UniqueId }[], indexAfter?: number) {
  return indexAfter !== undefined && indexAfter >= 0 && indexAfter < list.length
    ? indexAfter
    : list.length - 1;
}

function getPrevId(list: { id: UniqueId }[], index: number) {
  return index > 0 ? list[index - 1].id : null;
}

function getNextId(list: { id: UniqueId }[], index: number) {
  return index < list.length - 1 ? list[index + 1].id : null;
}
