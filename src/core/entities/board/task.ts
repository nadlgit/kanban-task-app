import type { UniqueId } from 'core/entities';

export type TaskEntity = {
  id: UniqueId;
  title: string;
  description: string;
  subtasks: Subtask[];
};

type Subtask = {
  title: string;
  isCompleted: boolean;
};
