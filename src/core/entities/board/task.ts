import type { BoardColumn } from './column';
import type { UniqueId } from 'core/entities';

export type TaskEntity = {
  id: UniqueId;
  title: string;
  description: string;
  subtasks: Subtask[];
  status: BoardColumn;
};

type Subtask = {
  title: string;
  isDone: boolean;
};
