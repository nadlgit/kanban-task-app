import type { BoardColumn } from './column';
import type { TaskEntity } from './task';
import type { UniqueId } from 'core/entities';

export type BoardEntity = {
  id: UniqueId;
  name: string;
  columns: Set<BoardColumn>;
  tasks: TaskEntity[];
};
