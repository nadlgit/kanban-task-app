import { onUserBoardDocsSnapshot } from './firestore-helpers';
import { convertToBoardList } from './helpers';
import type { BoardList, UniqueId } from 'core/entities';

export class BoardListSubscription {
  #data: { isInitialized: boolean; value: BoardList } = {
    isInitialized: false,
    value: [],
  };
  #callbacks: (() => void)[] = [];

  constructor(userId: UniqueId) {
    onUserBoardDocsSnapshot(userId, (boardDocs) => {
      this.#setData(convertToBoardList(boardDocs));
      for (const cbfn of this.#callbacks) {
        cbfn();
      }
    });
  }

  #setData(boardList: BoardList) {
    this.#data = { isInitialized: true, value: boardList };
  }

  init(boardList: BoardList) {
    if (!this.#data.isInitialized) {
      this.#setData(boardList);
    }
  }

  getData() {
    console.log('%c BoardListSubscription', 'background-color:pink;', new Date(), this.#data);
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
