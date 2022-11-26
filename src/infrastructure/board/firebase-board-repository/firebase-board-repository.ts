import { BoardSubscription } from './board-subscription';
import { BoardListSubscription } from './boardlist-subscription';
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
import type { BoardDocSchema, TaskDocSchema } from './firestore-helpers';
import {
  convertToBoard,
  convertToBoardList,
  getBoardColumns,
  getBoardInfo,
  getBoardTaskIds,
  getColumnTaskIds,
  getTaskInfo,
} from './helpers';
import type { BoardEntity, UniqueId } from 'core/entities';
import type { BoardRepository } from 'core/ports';

export class FirebaseBoardRepository implements BoardRepository {
  #boardListSubscription: Record<UniqueId, BoardListSubscription> = {};
  #boardSubscription: Record<UniqueId, Record<UniqueId, BoardSubscription>> = {};

  async getBoardList(userId: UniqueId) {
    console.log(
      '%c getBoardList',
      'background-color:cyan;',
      new Date(),
      this.#boardListSubscription,
      this.#boardSubscription
    );
    if (!this.#boardListSubscription[userId]) {
      this.#boardListSubscription[userId] = new BoardListSubscription(userId);
    }
    if (!this.#boardListSubscription[userId].getData().isInitialized) {
      const boardDocs = await getUserBoardDocs(userId);
      const boardList = convertToBoardList(boardDocs);
      this.#boardListSubscription[userId].init(boardList);
    }
    return this.#boardListSubscription[userId].getData().value;
  }

  async getBoard(userId: UniqueId, boardId: UniqueId) {
    console.log(
      '%c getBoard',
      'background-color:cyan;',
      new Date(),
      this.#boardListSubscription,
      this.#boardSubscription
    );
    if (!this.#boardSubscription[userId]) {
      this.#boardSubscription[userId] = {};
    }
    if (!this.#boardSubscription[userId][boardId]) {
      this.#boardSubscription[userId][boardId] = new BoardSubscription(boardId);
    }
    if (!this.#boardSubscription[userId][boardId].getData().isInitialized) {
      const [boardDoc, tasksDocs] = await Promise.all([
        getBoardDoc(boardId),
        getBoardTaskDocs(boardId),
      ]);
      const board = convertToBoard({ boardDoc }, tasksDocs);
      this.#boardSubscription[userId][boardId].init(board);
    }

    const { isInitialized, value: board } = this.#boardSubscription[userId][boardId].getData();
    if (!isInitialized) {
      throw new Error('TBD: board is undefined !');
    }
    return board;
  }

  listenToBoardListChange(userId: UniqueId, callback: () => void) {
    if (!this.#boardListSubscription[userId]) {
      this.#boardListSubscription[userId] = new BoardListSubscription(userId);
    }
    return this.#boardListSubscription[userId].addCallBack(callback);
  }

  listenToBoardChange(userId: UniqueId, boardId: UniqueId, callback: () => void) {
    if (!this.#boardSubscription[userId]) {
      this.#boardSubscription[userId] = {};
    }
    if (!this.#boardSubscription[userId][boardId]) {
      this.#boardSubscription[userId][boardId] = new BoardSubscription(boardId);
    }
    return this.#boardSubscription[userId][boardId].addCallBack(callback);
  }

  async addBoard(
    userId: UniqueId,
    board: { name: string; columns: { name: string }[] },
    index?: number
  ) {
    console.log(
      '%c addBoard',
      'background-color:cyan;',
      new Date(),
      this.#boardListSubscription,
      this.#boardSubscription
    );
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
        boardList: this.#boardListSubscription[userId].getData().value,
        indexAfter: index,
      }
    );
    const boardColumns = columns.map(({ name }) => ({ id: newColumnId(boardRef.id), name }));
    const boardDocColumns: BoardDocSchema['columns'] = Object.fromEntries(
      boardColumns.map(({ id, name }, idx) => [
        id,
        { name, nextId: idx < boardColumns.length - 1 ? boardColumns[idx + 1].id : null },
      ])
    );

    const boardDoc: BoardDocSchema = {
      owner: userId,
      name,
      columns: boardDocColumns,
      nextId: nextIdAfter ?? null,
    };
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
    console.log(
      '%c updateBoard',
      'background-color:cyan;',
      new Date(),
      this.#boardListSubscription,
      this.#boardSubscription
    );
    const boardBefore =
      this.#boardSubscription[userId] && this.#boardSubscription[userId][board.id]
        ? this.#boardSubscription[userId][board.id].getData().value
        : undefined;
    const boardRef = getBoardRef(board.id);
    const { name, columnsDeleted, columnsKept } = board;
    const hasFieldUpdate = name !== undefined;
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
        boardList: this.#boardListSubscription[userId].getData().value,
        indexAfter: index,
      }
    );
    let boardDocColumns: BoardDocSchema['columns'] | undefined = undefined;
    const updatedTasks: { id: UniqueId; taskDoc: Pick<TaskDocSchema, 'status'> }[] = [];
    if (hasColumnUpdate) {
      const boardColumnsBefore = await getBoardColumns(board.id, boardBefore);
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
      boardDocColumns = Object.fromEntries(
        boardColumns.map(({ id, name }, idx) => [
          id,
          { name, nextId: idx < boardColumns.length - 1 ? boardColumns[idx + 1].id : null },
        ])
      );
    }

    if (hasFieldUpdate || hasColumnUpdate || hasPositionUpdate) {
      const boardDoc: Partial<BoardDocSchema> = {};
      if (name) boardDoc.name = name;
      if (boardDocColumns) boardDoc.columns = boardDocColumns;
      if (nextIdAfter !== undefined) boardDoc.nextId = nextIdAfter;
      const batch = startBatch();
      batch.update(boardRef, boardDoc);
      for (const task of updatedTasks) {
        batch.update(getTaskRef(board.id, task.id), task.taskDoc);
      }
      prevIdAfter && batch.update(getBoardRef(prevIdAfter), { nextId: boardRef.id });
      prevIdBefore && batch.update(getBoardRef(prevIdBefore), { nextId: nextIdBefore });
      await batch.commit();
    }
  }

  async deleteBoard(userId: UniqueId, boardId: UniqueId) {
    console.log(
      '%c deleteBoard',
      'background-color:cyan;',
      new Date(),
      this.#boardListSubscription,
      this.#boardSubscription
    );
    const boardBefore =
      this.#boardSubscription[userId] && this.#boardSubscription[userId][boardId]
        ? this.#boardSubscription[userId][boardId].getData().value
        : undefined;
    const tasksIds = await getBoardTaskIds(boardId, boardBefore);

    const batch = startBatch();
    for (const taskId of tasksIds) {
      batch.delete(getTaskRef(boardId, taskId));
    }
    batch.delete(getBoardRef(boardId));
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
    console.log(
      '%c addTask',
      'background-color:cyan;',
      new Date(),
      this.#boardListSubscription,
      this.#boardSubscription
    );
    const boardBefore =
      this.#boardSubscription[userId] && this.#boardSubscription[userId][boardId]
        ? this.#boardSubscription[userId][boardId].getData().value
        : undefined;
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
        board: boardBefore,
        indexAfter: index,
      }
    );

    const taskDoc: TaskDocSchema = {
      title,
      description,
      subtasks,
      status: statusAfter ?? { id: columnId, name: '-noname-' },
      nextId: nextIdAfter ?? null,
    };
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
    console.log(
      '%c updateTask',
      'background-color:cyan;',
      new Date(),
      this.#boardListSubscription,
      this.#boardSubscription
    );
    const boardBefore =
      this.#boardSubscription[userId] && this.#boardSubscription[userId][boardId]
        ? this.#boardSubscription[userId][boardId].getData().value
        : undefined;
    const taskRef = getTaskRef(boardId, task.id);
    const { title, description, subtasks } = task;
    const hasFieldUpdate =
      title !== undefined || description !== undefined || subtasks !== undefined;
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
        board: boardBefore,
        indexAfter: index,
      }
    );

    if (hasFieldUpdate || hasStatusUpdate || hasPositionUpdate) {
      const taskDoc: Partial<TaskDocSchema> = {};
      if (title) taskDoc.title = title;
      if (description) taskDoc.description = description;
      if (subtasks) taskDoc.subtasks = subtasks;
      if (statusAfter !== undefined) taskDoc.status = statusAfter;
      if (nextIdAfter !== undefined) taskDoc.nextId = nextIdAfter;
      const batch = startBatch();
      batch.update(taskRef, taskDoc);
      prevIdAfter && batch.update(getTaskRef(boardId, prevIdAfter), { nextId: taskRef.id });
      await batch.commit();
    }
  }

  async deleteTask(userId: UniqueId, boardId: UniqueId, columnId: UniqueId, taskId: UniqueId) {
    console.log(
      '%c deleteTask',
      'background-color:cyan;',
      new Date(),
      this.#boardListSubscription,
      this.#boardSubscription
    );
    const boardBefore =
      this.#boardSubscription[userId] && this.#boardSubscription[userId][boardId]
        ? this.#boardSubscription[userId][boardId].getData().value
        : undefined;
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
        board: boardBefore,
      }
    );

    const batch = startBatch();
    batch.delete(getTaskRef(boardId, taskId));
    prevIdBefore && batch.update(getTaskRef(boardId, prevIdBefore), { nextId: nextIdBefore });
    await batch.commit();
  }
}
