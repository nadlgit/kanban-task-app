import {
  firestoreDocToBoardBase,
  firestoreDocsToBoardColumnTasks,
  firestoreDocsToBoardList,
  firestorePartsToBoard,
} from './converters';
import type { BoardBase, BoardColumnTasks } from './converters';
import {
  getBoardDoc,
  getBoardTaskDocs,
  getUserBoardDocs,
  onBoardDocSnapshot,
  onBoardTaskDocsSnapshot,
  onUserBoardDocsSnapshot,
} from './firestore-helpers';
import type { BoardList, UniqueId } from 'core/entities';

export async function getBoardListSubscriptionValue(userId: UniqueId) {
  const subscription = getBoardListSubscription(userId);

  if (!subscription.getData().isInitialized) {
    const boardDocs = await getUserBoardDocs(userId);
    subscription.setData(firestoreDocsToBoardList(boardDocs));
  }

  return subscription.getData().value ?? [];
}

export function addBoardListSubscriptionCallback(userId: UniqueId, callback: () => void) {
  return getBoardListSubscription(userId).addCallBack(callback);
}

export async function getBoardSubscriptionValue(userId: UniqueId, boardId: UniqueId) {
  const baseSubscription = getBoardBaseSubscription(userId, boardId);
  const tasksSubscription = getBoardColumnTasksSubscription(userId, boardId);

  if (!baseSubscription.getData().isInitialized || !tasksSubscription.getData().isInitialized) {
    const [boardDoc, tasksDocs] = await Promise.all([
      getBoardDoc(boardId),
      getBoardTaskDocs(boardId),
    ]);
    if (boardDoc) {
      baseSubscription.setData(firestoreDocToBoardBase(boardDoc));
    }
    if (tasksDocs) {
      tasksSubscription.setData(firestoreDocsToBoardColumnTasks(tasksDocs));
    }
  }

  const boardBase = baseSubscription.getData().value;
  const columnTasks = tasksSubscription.getData().value;
  return boardBase && columnTasks ? firestorePartsToBoard(boardBase, columnTasks) : undefined;
}

export function addBoardSubscriptionCallback(
  userId: UniqueId,
  boardId: UniqueId,
  callback: () => void
) {
  const unsubscribeBase = getBoardBaseSubscription(userId, boardId).addCallBack(callback);
  const unsubscribeTasks = getBoardColumnTasksSubscription(userId, boardId).addCallBack(callback);
  return () => {
    unsubscribeTasks();
    unsubscribeBase();
  };
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
const boardBaseSubscription: Record<UniqueId, Record<UniqueId, Subscription<BoardBase>>> = {};
const boardColumnTasksSubscription: Record<
  UniqueId,
  Record<UniqueId, Subscription<BoardColumnTasks>>
> = {};

function getBoardListSubscription(userId: UniqueId) {
  if (!boardListSubscription[userId]) {
    const subscription = new Subscription<BoardList>();
    boardListSubscription[userId] = subscription;
    onUserBoardDocsSnapshot(userId, (boardDocs) => {
      subscription.setData(firestoreDocsToBoardList(boardDocs));
      subscription.executeCallbacks();
    });
  }
  return boardListSubscription[userId];
}

function getBoardBaseSubscription(userId: UniqueId, boardId: UniqueId) {
  if (!boardBaseSubscription[userId]) {
    boardBaseSubscription[userId] = {};
  }
  if (!boardBaseSubscription[userId][boardId]) {
    const subscription = new Subscription<BoardBase>();
    boardBaseSubscription[userId][boardId] = subscription;
    onBoardDocSnapshot(boardId, (boardDoc) => {
      subscription.setData(firestoreDocToBoardBase(boardDoc));
      subscription.executeCallbacks();
    });
  }
  return boardBaseSubscription[userId][boardId];
}

function getBoardColumnTasksSubscription(userId: UniqueId, boardId: UniqueId) {
  if (!boardColumnTasksSubscription[userId]) {
    boardColumnTasksSubscription[userId] = {};
  }
  if (!boardColumnTasksSubscription[userId][boardId]) {
    const subscription = new Subscription<BoardColumnTasks>();
    boardColumnTasksSubscription[userId][boardId] = subscription;
    onBoardTaskDocsSnapshot(boardId, (taskDocs) => {
      subscription.setData(firestoreDocsToBoardColumnTasks(taskDocs));
      subscription.executeCallbacks();
    });
  }
  return boardColumnTasksSubscription[userId][boardId];
}
