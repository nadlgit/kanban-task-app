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
    board: { name: string } & { columns: { name: string }[] },
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

  async addColumn(userId: string, boardId: string, column: { name: string }, index?: number) {
    const newColumn = { ...newEmptyColumn(), ...column };
    const board = findEntity(this.#boards, boardId);
    addEntity(board.columns, newColumn, index);
    const listenerCallback = this.#onBoardChangeCallback.get(boardId);
    listenerCallback && listenerCallback();
    console.log('addColumn', { userId, boardId, column, index }, board);
  }

  async addTask(
    userId: string,
    boardId: string,
    columnId: string,
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
  }

  async updateBoard(userId: string, boardParam: { id: string } & { name: string }, index?: number) {
    const board = findEntity(this.#boards, boardParam.id);
    board.name = boardParam.name;
    if (index !== undefined) {
      moveEntity(this.#boards, board.id, index);
    }
    //this.#onBoardListChangeCallback();
    const listenerCallback = this.#onBoardChangeCallback.get(board.id);
    listenerCallback && listenerCallback();
    console.log('updateBoard', { userId, boardParam, index }, this.#boards);
  }

  async updateColumn(
    userId: string,
    boardId: string,
    columnParam: { id: string } & { name: string },
    index?: number
  ) {
    const board = findEntity(this.#boards, boardId);
    const column = findEntity(board.columns, columnParam.id);
    column.name = columnParam.name;
    if (index !== undefined) {
      moveEntity(board.columns, column.id, index);
    }
    const listenerCallback = this.#onBoardChangeCallback.get(board.id);
    listenerCallback && listenerCallback();
    console.log('updateColumn', { userId, boardId, columnParam, index }, board);
  }

  async updateTask(
    userId: string,
    boardId: string,
    columnId: string,
    taskParam: { id: string } & {
      title: string;
      description: string;
      subtasks: { title: string; isCompleted: boolean }[];
    },
    index?: number,
    oldColumnId?: string
  ) {
    const board = findEntity(this.#boards, boardId);
    const column = findEntity(board.columns, oldColumnId ?? columnId);
    const task = findEntity(column.tasks, taskParam.id);
    task.title = taskParam.title;
    task.description = taskParam.description;
    task.subtasks = [...taskParam.subtasks];
    if (index !== undefined && oldColumnId === undefined) {
      moveEntity(column.tasks, task.id, index);
    }
    if (oldColumnId) {
      const newColumn = findEntity(board.columns, columnId);
      changeTaskColumn(column.tasks, newColumn.tasks, task.id, index);
    }
    const listenerCallback = this.#onBoardChangeCallback.get(board.id);
    listenerCallback && listenerCallback();
    console.log('updateTask', { userId, boardId, columnId, taskParam, index, oldColumnId }, board);
  }

  async deleteBoard(userId: string, boardId: string) {
    deleteEntity(this.#boards, boardId);
    this.#onBoardListChangeCallback();
    console.log('deleteBoard', { userId, boardId }, this.#boards);
  }

  async deleteColumn(userId: string, boardId: string, columnId: string) {
    const board = findEntity(this.#boards, boardId);
    deleteEntity(board.columns, columnId);
    const listenerCallback = this.#onBoardChangeCallback.get(board.id);
    listenerCallback && listenerCallback();
    console.log('deleteColumn', { userId, boardId, columnId }, board);
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
