import type { UniqueId } from 'core/entities';

let nextBoardIndex = 1;
let nextColumnIndex = 1;
let nextTaskIndex = 1;

export function nextBoardId(): UniqueId {
  const value = `board-${nextBoardIndex.toString().padStart(3, '0')}`;
  nextBoardIndex++;
  return value;
}

export function nextColumnId(): UniqueId {
  const value = `column-${nextColumnIndex.toString().padStart(3, '0')}`;
  nextColumnIndex++;
  return value;
}

export function nextTaskId(): UniqueId {
  const value = `task-${nextTaskIndex.toString().padStart(3, '0')}`;
  nextTaskIndex++;
  return value;
}
