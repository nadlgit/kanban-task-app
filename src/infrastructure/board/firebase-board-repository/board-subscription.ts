import {
  firestoreDocsToBoardColumnTasks,
  firestoreDocToBoardBase,
  firestorePartsToBoard,
} from './converters';
import type { BoardBase, BoardColumnTasks } from './converters';
import {
  getBoardDoc,
  getBoardTaskDocs,
  onBoardDocSnapshot,
  onBoardTaskDocsSnapshot,
} from './firestore-helpers';
import type { UniqueId } from 'core/entities';

export class BoardSubscription {
  #boardId: UniqueId;
  #boardBase: BoardBase | undefined;
  #boardColumnTasks: BoardColumnTasks | undefined;
  #callbacks: (() => void)[] = [];
  #unsubscribeBase: (() => void) | undefined;
  #unsubscribeTasks: (() => void) | undefined;

  constructor(boardId: UniqueId) {
    this.#boardId = boardId;
    this.#subscribeBase();
    this.#subscribeTasks();
  }

  #subscribeBase() {
    this.#unsubscribeBase && this.#unsubscribeBase();
    this.#unsubscribeBase = onBoardDocSnapshot(
      this.#boardId,
      (boardDoc) => {
        if (boardDoc.exists()) {
          this.#boardBase = firestoreDocToBoardBase(boardDoc);
          this.#executeCallbacks();
        }
      },
      () => {
        this.#unsubscribeBase && this.#unsubscribeBase();
        this.#unsubscribeBase = undefined;
        this.#boardBase = undefined;
      }
    );
  }

  #subscribeTasks() {
    this.#unsubscribeTasks && this.#unsubscribeTasks();
    this.#unsubscribeTasks = onBoardTaskDocsSnapshot(
      this.#boardId,
      (taskDocs) => {
        this.#boardColumnTasks = firestoreDocsToBoardColumnTasks(taskDocs);
        this.#executeCallbacks();
      },
      () => {
        this.#unsubscribeTasks && this.#unsubscribeTasks();
        this.#unsubscribeTasks = undefined;
        this.#boardColumnTasks = undefined;
      }
    );
  }

  #executeCallbacks() {
    for (const cbfn of this.#callbacks) {
      cbfn();
    }
  }

  async #checkAndInitData() {
    if (this.#boardBase === undefined || this.#boardColumnTasks === undefined) {
      const [boardDoc, tasksDocs] = await Promise.all([
        getBoardDoc(this.#boardId),
        getBoardTaskDocs(this.#boardId),
      ]);
      if (boardDoc.exists()) {
        this.#boardBase = firestoreDocToBoardBase(boardDoc);
        this.#boardColumnTasks = firestoreDocsToBoardColumnTasks(tasksDocs);
      }
    }
  }

  #checkAndSubscribe() {
    if (this.#unsubscribeBase === undefined) {
      this.#subscribeBase();
    }
    if (this.#unsubscribeTasks === undefined) {
      this.#subscribeTasks();
    }
  }

  async getValue() {
    this.#checkAndSubscribe();
    await this.#checkAndInitData();
    return this.#boardBase !== undefined && this.#boardColumnTasks !== undefined
      ? firestorePartsToBoard(this.#boardBase, this.#boardColumnTasks)
      : undefined;
  }

  addCallBack(callback: () => void) {
    this.#checkAndSubscribe();
    this.#callbacks.push(callback);
    return () => {
      this.#callbacks = this.#callbacks.filter((cbfn) => cbfn != callback);
    };
  }
}
