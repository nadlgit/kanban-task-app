import { initialBoards } from './initial-boards';
import type { BoardEntity, ColumnEntity, TaskEntity, UniqueId } from 'core/entities';
import { generateId } from 'infrastructure/utils';

const nextBoardId = () => generateId('board');
const nextColumnId = () => generateId('column');
const nextTaskId = () => generateId('task');

export function setPeriodicCallback(callback: () => void) {
  const POLL_FREQUENCY_MILLISECONDS = 60 * 1000;
  const intervalId = setInterval(callback, POLL_FREQUENCY_MILLISECONDS);
  return () => clearTimeout(intervalId);
}

export function getInitialBoards(): BoardEntity[] {
  return initialBoards.map((board) => ({
    ...board,
    id: nextBoardId(),
    columns: board.columns.map((column) => ({
      ...column,
      id: nextColumnId(),
      tasks: column.tasks.map((task) => ({ ...task, id: nextTaskId() })),
    })),
  }));
}

export function newEmptyBoard(): BoardEntity {
  return {
    id: nextBoardId(),
    name: 'New board',
    columns: [],
  };
}

export function newEmptyColumn(): ColumnEntity {
  return {
    id: nextColumnId(),
    name: 'New column',
    tasks: [],
  };
}

export function newEmptyTask(): TaskEntity {
  return { id: nextTaskId(), title: 'New task', description: '', subtasks: [] };
}

export function findEntity<T extends BoardEntity | ColumnEntity | TaskEntity>(
  entities: T[],
  entityId: UniqueId
) {
  const entity = entities.find(({ id }) => id === entityId);
  if (entity === undefined) {
    throw new Error('Entity not found');
  }
  return entity;
}

export function addEntity<T extends BoardEntity | ColumnEntity | TaskEntity>(
  entities: T[],
  newEntity: T,
  index?: number
) {
  index !== undefined && index >= 0 && index < entities.length
    ? entities.splice(index, 0, newEntity)
    : entities.push(newEntity);
}

export function deleteEntity<T extends BoardEntity | ColumnEntity | TaskEntity>(
  entities: T[],
  entityId: UniqueId
) {
  const index = entities.findIndex(({ id }) => id === entityId);
  if (index >= 0) {
    entities.splice(index, 1);
  }
}

export function moveEntity<T extends BoardEntity | ColumnEntity | TaskEntity>(
  entities: T[],
  entityId: UniqueId,
  index: number
) {
  const entity = findEntity(entities, entityId);
  deleteEntity(entities, entityId);
  addEntity(entities, entity, index);
}

export function changeTaskColumn(
  oldColumnTasks: TaskEntity[],
  newColumnTasks: TaskEntity[],
  taskId: UniqueId,
  index?: number
) {
  const task = findEntity(oldColumnTasks, taskId);
  deleteEntity(oldColumnTasks, taskId);
  addEntity(newColumnTasks, task, index);
}
