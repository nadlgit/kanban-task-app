import {
  addEntity,
  changeTaskColumn,
  deleteEntity,
  findEntity,
  getInitialBoards,
  moveEntity,
  newEmptyBoard,
  newEmptyColumn,
  newEmptyTask,
  setPeriodicCallback,
} from './helpers';
import type { BoardEntity, UniqueId } from 'core/entities';
import type { BoardRepository } from 'core/ports';

export class FakeBoardRepository implements BoardRepository {
  #boards: BoardEntity[] = getInitialBoards();
  #onBoardListChangeCallback: () => void = () => {
    console.log('onBoardListChangeCallback', { boards: this.#boards });
  };
  #onBoardChangeCallback: Map<UniqueId, () => void> = new Map();

  async getBoardList(userId: string) {
    const boardList = this.#boards.map(({ id, name }) => ({ id, name }));
    console.log('getBoardList', { userId }, boardList);
    return boardList;
  }

  async getBoard(userId: string, boardId: string) {
    const board = findEntity(this.#boards, boardId);
    console.log('getBoard', { userId, boardId }, board);
    return board;
  }

  listenToBoardListChange(userId: string, callback: () => void) {
    this.#onBoardListChangeCallback = () => {
      console.log('onBoardListChangeCallback+cb', { userId, boards: this.#boards });
      callback();
    };
    return setPeriodicCallback(this.#onBoardListChangeCallback);
  }

  listenToBoardChange(userId: string, boardId: string, callback: () => void) {
    const boardCallback = () => {
      console.log('onBoardChangeCallback+cb', {
        userId,
        boardId,
        board: this.#boards.find((b) => b.id === boardId),
      });
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
    console.log('addBoard', { userId, board, index }, this.#boards);
    return newBoard.id;
  }

  async updateBoard(
    userId: UniqueId,
    board: {
      id: string;
      name?: string;
      columnsAdded?: { name: string; index?: number }[];
      columnsDeleted?: { id: UniqueId }[];
      columnsUpdated?: { id: UniqueId; name?: string; index?: number }[];
    },
    index?: number
  ) {
    const boardUpdate = findEntity(this.#boards, board.id);
    if (board.name) {
      boardUpdate.name = board.name;
    }
    if (board.columnsAdded) {
      board.columnsAdded.forEach((newColumn) => {
        addEntity(boardUpdate.columns, { ...newEmptyColumn(), ...newColumn }, newColumn.index);
      });
    }
    if (board.columnsDeleted) {
      board.columnsDeleted.forEach(({ id }) => {
        deleteEntity(boardUpdate.columns, id);
      });
    }
    if (board.columnsUpdated) {
      board.columnsUpdated.forEach((column) => {
        const columnUpdate = findEntity(boardUpdate.columns, column.id);
        if (column.name) {
          columnUpdate.name = column.name;
        }
        if (column.index !== undefined) {
          moveEntity(boardUpdate.columns, columnUpdate.id, column.index);
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
    console.log('updateBoard', { userId, board, index }, this.#boards);
  }

  async deleteBoard(userId: string, boardId: string) {
    deleteEntity(this.#boards, boardId);

    this.#onBoardListChangeCallback();
    console.log('deleteBoard', { userId, boardId }, this.#boards);
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
    console.log('addTask', { userId, boardId, columnId, task, index }, column);
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
    console.log('updateTask', { userId, boardId, columnId, task, index, oldColumnId }, board);
  }

  async deleteTask(userId: string, boardId: string, columnId: string, taskId: string) {
    const board = findEntity(this.#boards, boardId);
    const column = findEntity(board.columns, columnId);
    deleteEntity(column.tasks, taskId);

    const listenerCallback = this.#onBoardChangeCallback.get(board.id);
    listenerCallback && listenerCallback();
    console.log('deleteTask', { userId, boardId, columnId, taskId }, column);
  }
}
