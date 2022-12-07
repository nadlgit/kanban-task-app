import {
  addEntity,
  changeTaskColumn,
  deleteEntity,
  findEntity,
  moveEntity,
  newEmptyBoard,
  newEmptyColumn,
  newEmptyTask,
  setPeriodicCallback,
} from './helpers';
import { getInitialBoards } from './initial-boards';
import type { BoardEntity, UniqueId } from 'core/entities';
import type { BoardRepository } from 'core/ports';
import { doNothing } from 'webui/shared';

export class DemoBoardRepository implements BoardRepository {
  #boards: BoardEntity[] = getInitialBoards();
  #onBoardListChangeCallback: () => void = doNothing;
  #onBoardChangeCallback: Map<UniqueId, () => void> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBoardList(userId: string) {
    const boardList = this.#boards.map(({ id, name }) => ({ id, name }));
    return boardList;
  }

  async getBoard(userId: string, boardId: string) {
    const board = findEntity(this.#boards, boardId);
    return board;
  }

  listenToBoardListChange(userId: string, callback: () => void) {
    this.#onBoardListChangeCallback = () => {
      callback();
    };
    return setPeriodicCallback(this.#onBoardListChangeCallback);
  }

  listenToBoardChange(userId: string, boardId: string, callback: () => void) {
    const boardCallback = () => {
      callback();
    };
    this.#onBoardChangeCallback.set(boardId, boardCallback);
    const clearPeriodicCallback = setPeriodicCallback(boardCallback);
    return () => {
      clearPeriodicCallback();
      this.#onBoardChangeCallback.delete(boardId);
    };
  }

  async addBoard(
    userId: string,
    board: { name: string; columns: { name: string }[] },
    index?: number
  ) {
    const newBoard = {
      ...newEmptyBoard(),
      ...board,
      columns: board.columns.map((column) => ({ ...newEmptyColumn(), ...column })),
    };
    addEntity(this.#boards, newBoard, index);

    this.#onBoardListChangeCallback();
    return newBoard.id;
  }

  async updateBoard(
    userId: UniqueId,
    board: {
      id: string;
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
    const boardUpdate = findEntity(this.#boards, board.id);
    if (board.name) {
      boardUpdate.name = board.name;
    }
    if (board.columnsDeleted) {
      board.columnsDeleted.forEach(({ id }) => {
        deleteEntity(boardUpdate.columns, id);
      });
    }
    if (board.columnsKept) {
      board.columnsKept.forEach((column, idx) => {
        if (column.isAdded) {
          addEntity(boardUpdate.columns, { ...newEmptyColumn(), name: column.name }, idx);
        } else {
          const columnUpdate = findEntity(boardUpdate.columns, column.id);
          if (column.name) {
            columnUpdate.name = column.name;
          }
          moveEntity(boardUpdate.columns, columnUpdate.id, idx);
        }
      });
    }
    if (index !== undefined) {
      moveEntity(this.#boards, boardUpdate.id, index);
    }

    const listenerCallback = this.#onBoardChangeCallback.get(boardUpdate.id);
    listenerCallback && listenerCallback();
    if (board.name) {
      this.#onBoardListChangeCallback();
    }
  }

  async deleteBoard(userId: string, boardId: string) {
    deleteEntity(this.#boards, boardId);

    this.#onBoardListChangeCallback();
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
    const newTask = { ...newEmptyTask(), ...task };
    const board = findEntity(this.#boards, boardId);
    const column = findEntity(board.columns, columnId);
    addEntity(column.tasks, newTask, index);

    const listenerCallback = this.#onBoardChangeCallback.get(boardId);
    listenerCallback && listenerCallback();
    return newTask.id;
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
    const board = findEntity(this.#boards, boardId);
    const column = findEntity(board.columns, oldColumnId ?? columnId);
    const taskUpdate = findEntity(column.tasks, task.id);
    if (task.title) {
      taskUpdate.title = task.title;
    }
    if (task.description) {
      taskUpdate.description = task.description;
    }
    if (task.subtasks) {
      taskUpdate.subtasks = [...task.subtasks];
    }
    if (index !== undefined && oldColumnId === undefined) {
      moveEntity(column.tasks, taskUpdate.id, index);
    }
    if (oldColumnId) {
      const newColumn = findEntity(board.columns, columnId);
      changeTaskColumn(column.tasks, newColumn.tasks, taskUpdate.id, index);
    }

    const listenerCallback = this.#onBoardChangeCallback.get(board.id);
    listenerCallback && listenerCallback();
  }

  async deleteTask(userId: string, boardId: string, columnId: string, taskId: string) {
    const board = findEntity(this.#boards, boardId);
    const column = findEntity(board.columns, columnId);
    deleteEntity(column.tasks, taskId);

    const listenerCallback = this.#onBoardChangeCallback.get(board.id);
    listenerCallback && listenerCallback();
  }
}
