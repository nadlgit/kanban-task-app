import type { BoardColumn } from './column';
import type { TaskEntity } from './task';

export type BoardEntity = {
  id: string;
  name: string;
  columns: Set<BoardColumn>;
  tasks: TaskEntity[];
};
