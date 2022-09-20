import type { BoardColumn } from './column';

export type TaskEntity = {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  status: BoardColumn;
};

type Subtask = {
  title: string;
  isDone: boolean;
};
