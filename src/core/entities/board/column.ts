import type { TaskEntity } from './task';
import type { UniqueId } from 'core/entities';

export type ColumnEntity = {
  id: UniqueId;
  name: string;
  tasks: TaskEntity[];
};
