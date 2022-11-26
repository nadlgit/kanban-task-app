import { onBoardDocSnapshot, onBoardTaskDocsSnapshot } from './firestore-helpers';
import { convertToBoard } from './helpers';
import type { BoardEntity, UniqueId } from 'core/entities';

export class BoardSubscription {
  #data: { isInitialized: false; value?: undefined } | { isInitialized: true; value: BoardEntity } =
    { isInitialized: false };
  #callbacks: (() => void)[] = [];

  constructor(boardId: UniqueId) {
    onBoardDocSnapshot(boardId, (boardDoc) => {
      this.#setData(convertToBoard({ board: this.#data.value, boardDoc }));
      for (const cbfn of this.#callbacks) {
        cbfn();
      }
    });
    onBoardTaskDocsSnapshot(boardId, (tasksDocs) => {
      if (this.#data.isInitialized) {
        this.#setData(convertToBoard({ board: this.#data.value }, tasksDocs));
        for (const cbfn of this.#callbacks) {
          cbfn();
        }
      }
    });
  }

  #setData(board: BoardEntity) {
    this.#data = { isInitialized: true, value: board };
  }

  init(board: BoardEntity) {
    if (!this.#data.isInitialized) {
      this.#setData(board);
    }
  }

  getData() {
    console.log('%c BoardSubscription', 'background-color:pink;', new Date(), this.#data);
    return this.#data;
  }

  addCallBack(callback: () => void) {
    this.#callbacks.push(callback);
    return () => this.#removeCallback(callback);
  }

  #removeCallback(callback: () => void) {
    this.#callbacks = this.#callbacks.filter((cbfn) => cbfn != callback);
  }
}
