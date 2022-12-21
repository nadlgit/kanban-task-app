import { firestoreDocsToBoardList } from './converters';
import { getUserBoardDocs, onUserBoardDocsSnapshot } from './firestore-helpers';
import type { BoardList, UniqueId } from 'core/entities';

export class BoardListSubscription {
  #userId: UniqueId;
  #boardList: BoardList | undefined;
  #callbacks: (() => void)[] = [];
  #unsubscribe: (() => void) | undefined;

  constructor(userId: UniqueId) {
    this.#userId = userId;
    this.#subscribe();
  }

  #subscribe() {
    this.#unsubscribe && this.#unsubscribe();
    this.#unsubscribe = onUserBoardDocsSnapshot(
      this.#userId,
      (boardDocs) => {
        this.#boardList = firestoreDocsToBoardList(boardDocs);
        this.#executeCallbacks();
      },
      () => {
        this.#unsubscribe && this.#unsubscribe();
        this.#unsubscribe = undefined;
        this.#boardList = undefined;
      }
    );
  }

  #executeCallbacks() {
    for (const cbfn of this.#callbacks) {
      cbfn();
    }
  }

  async #checkAndInitData() {
    if (this.#boardList === undefined) {
      const boardDocs = await getUserBoardDocs(this.#userId);
      this.#boardList = firestoreDocsToBoardList(boardDocs);
    }
  }

  #checkAndSubscribe() {
    if (this.#unsubscribe === undefined) {
      this.#subscribe();
    }
  }

  async getValue() {
    this.#checkAndSubscribe();
    await this.#checkAndInitData();
    return this.#boardList ?? [];
  }

  addCallBack(callback: () => void) {
    this.#checkAndSubscribe();
    this.#callbacks.push(callback);
    return () => {
      this.#callbacks = this.#callbacks.filter((cbfn) => cbfn != callback);
    };
  }
}
