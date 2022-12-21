import { BoardListSubscription } from './board-list-subscription';
import { BoardSubscription } from './board-subscription';
import type { UniqueId } from 'core/entities';

const boardListSubscription: Record<UniqueId, BoardListSubscription> = {};
const boardSubscription: Record<UniqueId, Record<UniqueId, BoardSubscription>> = {};

export async function getBoardListSubscriptionValue(userId: UniqueId) {
  return getBoardListSubscription(userId).getValue();
}

export function addBoardListSubscriptionCallback(userId: UniqueId, callback: () => void) {
  return getBoardListSubscription(userId).addCallBack(callback);
}

export async function getBoardSubscriptionValue(userId: UniqueId, boardId: UniqueId) {
  return getBoardSubscription(userId, boardId).getValue();
}

export function addBoardSubscriptionCallback(
  userId: UniqueId,
  boardId: UniqueId,
  callback: () => void
) {
  return getBoardSubscription(userId, boardId).addCallBack(callback);
}

function getBoardListSubscription(userId: UniqueId) {
  if (!boardListSubscription[userId]) {
    boardListSubscription[userId] = new BoardListSubscription(userId);
  }
  return boardListSubscription[userId];
}

function getBoardSubscription(userId: UniqueId, boardId: UniqueId) {
  if (!boardSubscription[userId]) {
    boardSubscription[userId] = {};
  }
  if (!boardSubscription[userId][boardId]) {
    boardSubscription[userId][boardId] = new BoardSubscription(boardId);
  }
  return boardSubscription[userId][boardId];
}
