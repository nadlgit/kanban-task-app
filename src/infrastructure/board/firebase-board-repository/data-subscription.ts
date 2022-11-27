import {
  onBoardDocSnapshot,
  onBoardTaskDocsSnapshot,
  onUserBoardDocsSnapshot,
} from './firestore-helpers';
import type { FirestoreDoc, FirestoreDocs } from './firestore-helpers';
import { convertToBoard, convertToBoardList } from './helpers';
import type { BoardEntity, BoardList, UniqueId } from 'core/entities';

export function getBoardListSubscriptionValue(userId: UniqueId) {
  return getBoardListSubscription(userId).getData().value ?? [];
}

export function isBoardListSubscriptionInitialized(userId: UniqueId) {
  return getBoardListSubscription(userId).getData().isInitialized;
}

export function initBoardListSubscription(userId: UniqueId, boardDocs: FirestoreDocs) {
  const subscription = getBoardListSubscription(userId);
  if (!subscription.getData().isInitialized) {
    subscription.setData(convertToBoardList(boardDocs));
  }
}

export function addBoardListSubscriptionCallback(userId: UniqueId, callback: () => void) {
  return getBoardListSubscription(userId).addCallBack(callback);
}

export function getBoardSubscriptionValue(userId: UniqueId, boardId: UniqueId) {
  return getBoardSubscription(userId, boardId).getData().value;
}

export function isBoardSubscriptionInitialized(userId: UniqueId, boardId: UniqueId) {
  return getBoardSubscription(userId, boardId).getData().isInitialized;
}

export function initBoardSubscription(
  userId: UniqueId,
  boardId: UniqueId,
  boardDoc: FirestoreDoc,
  tasksDocs: FirestoreDocs
) {
  const subscription = getBoardSubscription(userId, boardId);
  if (!subscription.getData().isInitialized) {
    subscription.setData(convertToBoard({ boardDoc }, tasksDocs));
  }
}

export function addBoardSubscriptionCallback(
  userId: UniqueId,
  boardId: UniqueId,
  callback: () => void
) {
  return getBoardSubscription(userId, boardId).addCallBack(callback);
}

class Subscription<T> {
  #data: { isInitialized: false; value?: undefined } | { isInitialized: true; value: T } = {
    isInitialized: false,
  };
  #callbacks: (() => void)[] = [];

  getData() {
    return this.#data;
  }

  setData(value: T) {
    this.#data = { isInitialized: true, value };
  }

  addCallBack(callback: () => void) {
    this.#callbacks.push(callback);
    return () => {
      this.#callbacks = this.#callbacks.filter((cbfn) => cbfn != callback);
    };
  }

  executeCallbacks() {
    for (const cbfn of this.#callbacks) {
      cbfn();
    }
  }
}

const boardListSubscription: Record<UniqueId, Subscription<BoardList>> = {};
const boardSubscription: Record<UniqueId, Record<UniqueId, Subscription<BoardEntity>>> = {};

function getBoardListSubscription(userId: UniqueId) {
  if (!boardListSubscription[userId]) {
    const subscription = new Subscription<BoardList>();
    boardListSubscription[userId] = subscription;
    onUserBoardDocsSnapshot(userId, (boardDocs) => {
      subscription.setData(convertToBoardList(boardDocs));
      subscription.executeCallbacks();
    });
  }
  return boardListSubscription[userId];
}

function getBoardSubscription(userId: UniqueId, boardId: UniqueId) {
  if (!boardSubscription[userId]) {
    boardSubscription[userId] = {};
  }
  if (!boardSubscription[userId][boardId]) {
    const subscription = new Subscription<BoardEntity>();
    boardSubscription[userId][boardId] = subscription;
    onBoardDocSnapshot(boardId, (boardDoc) => {
      subscription.setData(convertToBoard({ board: subscription.getData().value, boardDoc }));
      subscription.executeCallbacks();
    });
    onBoardTaskDocsSnapshot(boardId, (tasksDocs) => {
      const board = subscription.getData().value;
      if (board) {
        subscription.setData(convertToBoard({ board }, tasksDocs));
        subscription.executeCallbacks();
      }
    });
  }
  return boardSubscription[userId][boardId];
}