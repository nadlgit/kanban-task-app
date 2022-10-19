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
    console.log('onBoardListChangeCallback');
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
      console.log('onBoardListChangeCallback+cb', { userId });
      callback();
    };
    return setPeriodicCallback(this.#onBoardListChangeCallback);
  }

  listenToBoardChange(userId: string, boardId: string, callback: () => void) {
    const boardCallback = () => {
      console.log('onBoardChangeCallback+cb', { userId, boardId });
      callback();
    };
    this.#onBoardChangeCallback.set(boardId, boardCallback);
    return () => {
      setPeriodicCallback(boardCallback);
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
    console.log('addBoard', { userId, board, index }, this.#boards);
  }

  async addColumn(userId: string, boardId: string, column: { name: string }, index?: number) {
    const newColumn = { ...newEmptyColumn(), ...column };
    const board = findEntity(this.#boards, boardId);
    addEntity(board.columns, newColumn, index);
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
    console.log('addTask', { userId, boardId, columnId, task, index }, column);
  }

  async updateBoard(userId: string, boardParam: { id: string } & { name: string }, index?: number) {
    const board = findEntity(this.#boards, boardParam.id);
    board.name = boardParam.name;
    if (index !== undefined) {
      moveEntity(this.#boards, board.id, index);
    }
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
    console.log('updateTask', { userId, boardId, columnId, taskParam, index, oldColumnId }, board);
  }

  async deleteBoard(userId: string, boardId: string) {
    deleteEntity(this.#boards, boardId);
    console.log('deleteBoard', { userId, boardId }, this.#boards);
  }

  async deleteColumn(userId: string, boardId: string, columnId: string) {
    const board = findEntity(this.#boards, boardId);
    deleteEntity(board.columns, columnId);
    console.log('deleteColumn', { userId, boardId, columnId }, board);
  }

  async deleteTask(userId: string, boardId: string, columnId: string, taskId: string) {
    const board = findEntity(this.#boards, boardId);
    const column = findEntity(board.columns, columnId);
    deleteEntity(column.tasks, taskId);
    console.log('deleteTask', { userId, boardId, columnId, taskId }, column);
  }
}
